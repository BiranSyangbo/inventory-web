# Frontend Integration Guide
## Liquor Shop Inventory — React + Tailwind CSS

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [API Client & Configuration](#2-api-client--configuration)
3. [Authentication](#3-authentication)
4. [Routing & Protected Routes](#4-routing--protected-routes)
5. [Module: Suppliers](#5-module-suppliers)
6. [Module: Products](#6-module-products)
7. [Module: Customers](#7-module-customers)
8. [Module: Purchases](#8-module-purchases)
9. [Module: Sales](#9-module-sales)
10. [Module: Inventory](#10-module-inventory)
11. [Business Logic Rules](#11-business-logic-rules)
12. [UI Patterns & Tailwind Conventions](#12-ui-patterns--tailwind-conventions)
13. [Screen Checklist](#13-screen-checklist)

---

## 1. Project Setup

### Recommended Stack

```bash
# Create project
npx create-react-app inventory-ui --template typescript
# OR with Vite (recommended for speed)
npm create vite@latest inventory-ui -- --template react-ts

cd inventory-ui

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Routing
npm install react-router-dom

# HTTP client
npm install axios

# Forms
npm install react-hook-form

# Date handling
npm install date-fns

# Notifications (toast)
npm install react-hot-toast

# Icons
npm install lucide-react
```

### `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1d4ed8", // blue-700
          hover: "#1e40af",   // blue-800
        },
        danger: "#dc2626",    // red-600
        warning: "#d97706",   // amber-600
        success: "#16a34a",   // green-600
      },
    },
  },
  plugins: [],
};
```

### `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Environment Variable

```bash
# .env
VITE_API_BASE_URL=http://localhost:8080
```

---

## 2. API Client & Configuration

### `src/lib/apiClient.ts`

```ts
import axios from "axios";
import toast from "react-hot-toast";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Request: attach access token ──────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: handle 401 → try refresh → retry ────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return apiClient(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
          { refreshToken }
        );
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        apiClient.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Show toast for common errors
    const message = error.response?.data?.error || error.response?.data?.message || "Something went wrong";
    if (error.response?.status !== 401) toast.error(message);

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 3. Authentication

### Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login → get tokens |
| `POST` | `/api/auth/refresh` | Rotate tokens |
| `POST` | `/api/auth/logout` | Revoke refresh token |
| `GET`  | `/api/auth/me` | Current user info |

### Request / Response Shapes

```ts
// POST /api/auth/login
// Body:
{ username: string; password: string }

// Response (200):
{
  accessToken: string;      // short-lived JWT (e.g. 24h)
  refreshToken: string;     // long-lived (e.g. 7 days), stored in DB
  expiresIn: number;        // seconds
  refreshExpiresIn: number; // seconds
}

// POST /api/auth/register
// Body:
{ username: string; password: string } // password min 6 chars

// POST /api/auth/refresh
// Body:
{ refreshToken: string }
// Response: same shape as login

// POST /api/auth/logout
// Body:
{ refreshToken: string }

// GET /api/auth/me
// Response:
{ username: string; authorities: Array<{ authority: string }> }
```

### `src/context/AuthContext.tsx`

```tsx
import { createContext, useContext, useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";

interface AuthState {
  username: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);

  const isAuthenticated = !!localStorage.getItem("accessToken");

  const login = async (username: string, password: string) => {
    const { data } = await apiClient.post("/api/auth/login", { username, password });
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    setUsername(username);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (refreshToken) await apiClient.post("/api/auth/logout", { refreshToken });
    } finally {
      localStorage.clear();
      setUsername(null);
      window.location.href = "/login";
    }
  };

  // Restore username from /me on mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && !username) {
      apiClient.get("/api/auth/me")
        .then(({ data }) => setUsername(data.username))
        .catch(() => localStorage.clear());
    }
  }, []);

  return (
    <AuthContext.Provider value={{ username, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
```

### Login Page (Tailwind)

```tsx
// src/pages/LoginPage.tsx
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{
    username: string;
    password: string;
  }>();

  const onSubmit = async (data: { username: string; password: string }) => {
    await login(data.username, data.password);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-md rounded-xl p-8 w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold text-gray-800">Inventory Login</h1>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            {...register("username", { required: "Required" })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            {...register("password", { required: "Required" })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
```

---

## 4. Routing & Protected Routes

### `src/App.tsx`

```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import Layout from "@/components/Layout";
import DashboardPage from "@/pages/DashboardPage";
import SuppliersPage from "@/pages/SuppliersPage";
import ProductsPage from "@/pages/ProductsPage";
import CustomersPage from "@/pages/CustomersPage";
import PurchasesPage from "@/pages/PurchasesPage";
import SalesPage from "@/pages/SalesPage";
import InventoryPage from "@/pages/InventoryPage";

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/suppliers/*" element={<SuppliersPage />} />
              <Route path="/products/*" element={<ProductsPage />} />
              <Route path="/customers/*" element={<CustomersPage />} />
              <Route path="/purchases/*" element={<PurchasesPage />} />
              <Route path="/sales/*" element={<SalesPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

### `src/components/ProtectedRoute.tsx`

```tsx
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("accessToken");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
```

---

## 5. Module: Suppliers

### API Service — `src/services/supplierService.ts`

```ts
import apiClient from "@/lib/apiClient";

export interface SupplierRequest {
  name: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  vatPanNumber?: string;
  status?: "ACTIVE" | "INACTIVE"; // default "ACTIVE"
}

export interface SupplierResponse {
  id: number;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  address: string | null;
  vatPanNumber: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string; // ISO datetime
}

export const supplierService = {
  getAll: () => apiClient.get<SupplierResponse[]>("/api/suppliers").then(r => r.data),
  getActive: () => apiClient.get<SupplierResponse[]>("/api/suppliers/active").then(r => r.data),
  getById: (id: number) => apiClient.get<SupplierResponse>(`/api/suppliers/${id}`).then(r => r.data),
  create: (body: SupplierRequest) => apiClient.post<SupplierResponse>("/api/suppliers", body).then(r => r.data),
  update: (id: number, body: SupplierRequest) => apiClient.put<SupplierResponse>(`/api/suppliers/${id}`, body).then(r => r.data),
  delete: (id: number) => apiClient.delete(`/api/suppliers/${id}`),
};
```

### Key UI Notes

- Use `getActive()` for supplier dropdowns in purchase forms (only active suppliers selectable).
- Status column: render a `<span>` with `bg-green-100 text-green-700` for ACTIVE and `bg-gray-100 text-gray-500` for INACTIVE.
- `vatPanNumber` is optional; show a dash if null.
- Deletion is hard — confirm with a modal before calling `delete`.

---

## 6. Module: Products

### API Service — `src/services/productService.ts`

```ts
import apiClient from "@/lib/apiClient";

export interface ProductRequest {
  name: string;                    // required
  brand?: string;
  category?: string;               // Whiskey | Vodka | Beer | Wine | Rum | etc.
  volumeMl?: number;               // 180 | 375 | 750 | 1000
  unit?: string;
  barcode?: string;
  minStock?: number;               // default 0
  sellingPrice: number;            // required, > 0
  status?: "ACTIVE" | "INACTIVE";  // default "ACTIVE"
}

export interface ProductResponse {
  id: number;
  name: string;
  brand: string | null;
  category: string | null;
  volumeMl: number | null;
  unit: string | null;
  barcode: string | null;
  minStock: number;
  sellingPrice: string;   // BigDecimal serialized as string
  averageCost: string;    // weighted average cost
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  currentStock: number | null; // populated by InventoryService
}

export const productService = {
  getAll: () => apiClient.get<ProductResponse[]>("/api/products").then(r => r.data),
  getById: (id: number) => apiClient.get<ProductResponse>(`/api/products/${id}`).then(r => r.data),
  create: (body: ProductRequest) => apiClient.post<ProductResponse>("/api/products", body).then(r => r.data),
  update: (id: number, body: ProductRequest) => apiClient.put<ProductResponse>(`/api/products/${id}`, body).then(r => r.data),
  toggleStatus: (id: number) => apiClient.patch(`/api/products/${id}/toggle-status`),
  delete: (id: number) => apiClient.delete(`/api/products/${id}`), // soft delete
};
```

### Key UI Notes

- Delete is **soft** (sets `deleted=true`). Deleted products disappear from all lists automatically.
- `toggleStatus` returns `204 No Content` — just refetch the list on success.
- Product search/filter by barcode: filter client-side on `barcode` field or implement server-side if list is large.
- **Low stock indicator**: compare `currentStock` vs `minStock`. If `currentStock <= minStock`, highlight row with `bg-amber-50 border-l-4 border-amber-500`.
- `averageCost` is read-only — never editable. It is recalculated automatically on each purchase.
- Category dropdown options: `["Whiskey", "Vodka", "Beer", "Wine", "Rum", "Gin", "Brandy", "Other"]`
- Volume dropdown: `[180, 375, 750, 1000]` (ml)

---

## 7. Module: Customers

### API Service — `src/services/customerService.ts`

```ts
import apiClient from "@/lib/apiClient";

export interface CustomerRequest {
  name: string;           // required
  phone?: string;
  address?: string;
  creditLimit?: number;   // default 0; 0 = walk-in / cash-only
}

export interface CustomerResponse {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  creditLimit: string;
  outstandingBalance: string; // current unpaid amount
  createdAt: string;
}

export interface PriceTemplateRequest {
  productId: number;
  sellingPrice: number;
}

export interface PriceTemplateResponse {
  id: number;
  customerId: number;
  productId: number;
  productName: string;
  productBrand: string | null;
  productVolumeMl: number | null;
  sellingPrice: string;
  standardPrice: string; // product.sellingPrice for comparison
}

export interface StatementEntry {
  date: string;
  type: "SALE" | "PAYMENT";
  reference: string;        // invoice number or payment ID
  paymentMethod: string | null;
  referenceNumber: string | null;
  debit: string | null;     // sale amount (adds to outstanding)
  credit: string | null;    // payment amount (reduces outstanding)
  balance: string;          // running balance after this entry
}

export interface CustomerStatementResponse {
  customerId: number;
  customerName: string;
  creditLimit: string;
  outstandingBalance: string;
  entries: StatementEntry[];
}

export const customerService = {
  getAll: () => apiClient.get<CustomerResponse[]>("/api/customers").then(r => r.data),
  getById: (id: number) => apiClient.get<CustomerResponse>(`/api/customers/${id}`).then(r => r.data),
  create: (body: CustomerRequest) => apiClient.post<CustomerResponse>("/api/customers", body).then(r => r.data),
  update: (id: number, body: CustomerRequest) => apiClient.put<CustomerResponse>(`/api/customers/${id}`, body).then(r => r.data),
  delete: (id: number) => apiClient.delete(`/api/customers/${id}`),

  // Price template
  getTemplate: (customerId: number) =>
    apiClient.get<PriceTemplateResponse[]>(`/api/customers/${customerId}/price-template`).then(r => r.data),
  upsertTemplateEntry: (customerId: number, body: PriceTemplateRequest) =>
    apiClient.post<PriceTemplateResponse>(`/api/customers/${customerId}/price-template`, body).then(r => r.data),
  deleteTemplateEntry: (customerId: number, productId: number) =>
    apiClient.delete(`/api/customers/${customerId}/price-template/${productId}`),

  // Statement & payments
  getStatement: (customerId: number) =>
    apiClient.get<CustomerStatementResponse>(`/api/customers/${customerId}/statement`).then(r => r.data),
  getPayments: (customerId: number) =>
    apiClient.get(`/api/customers/${customerId}/payments`).then(r => r.data),
};
```

### Key UI Notes

- **Customer list**: Show `outstandingBalance` as a badge — red if > 0, green if 0.
- **Credit limit**: `0` means walk-in / no credit. Show "Walk-in" badge instead of a number.
- **Price template editor**: Table with product name, standard price, custom price. Inline edit per row. `upsertTemplateEntry` handles both create and update.
- **Statement page**: Render `entries` as a ledger table: Date | Type | Reference | Debit | Credit | Balance. Print button triggers `window.print()` with a print stylesheet.
- **Outstanding balance** is automatically managed by the backend on every sale/payment — never mutate it directly from the frontend.

---

## 8. Module: Purchases

### API Service — `src/services/purchaseService.ts`

```ts
import apiClient from "@/lib/apiClient";

export interface PurchaseLineInput {
  productId: number;
  batchCode?: string;      // optional; auto-generated if empty
  expiryDate?: string;     // ISO date "YYYY-MM-DD", optional
  purchasePrice: number;   // required
  quantity: number;        // required, min 1
  vatPercent?: number;     // default 0
  location?: string;
}

export interface PurchaseInput {
  supplierId: number;        // required; use supplier dropdown
  vatBillNumber?: string;    // must be unique if provided
  purchaseDate?: string;     // ISO date, defaults to today
  invoiceAmount?: number;
  vatAmount?: number;        // default 0; from distributor bill
  discount?: number;         // default 0
  remarks?: string;
  lines: PurchaseLineInput[]; // min 1 item required
}

export interface PurchaseLineResponse {
  id: number;
  productId: number;
  productName: string;
  batchId: number;
  batchCode: string;
  expiryDate: string | null;
  quantity: number;
  purchasePrice: string;
  vatPercent: string;
  location: string | null;
}

export interface PurchaseResponse {
  id: number;
  supplierId: number;
  supplierName: string;
  vatBillNumber: string | null;
  purchaseDate: string;
  invoiceAmount: string | null;
  vatAmount: string;
  discount: string;
  remarks: string | null;
  createdAt: string;
  lines: PurchaseLineResponse[];
  totalPaid: string;
  outstandingAmount: string;
}

export interface PaymentRequest {
  amount: number;                         // required, > 0
  paymentMethod: "CASH" | "ONLINE" | "CHEQUE"; // required
  referenceNumber?: string;               // cheque no. or transaction ID
  paymentDate?: string;                   // ISO datetime
  notes?: string;
}

export interface PaymentResponse {
  id: number;
  referenceId: number;  // purchaseId
  partyId: number;      // supplierId
  partyName: string;
  paymentDate: string;
  amount: string;
  paymentMethod: string;
  referenceNumber: string | null;
  notes: string | null;
}

export const purchaseService = {
  getAll: () => apiClient.get<PurchaseResponse[]>("/api/purchases").then(r => r.data),
  getById: (id: number) => apiClient.get<PurchaseResponse>(`/api/purchases/${id}`).then(r => r.data),
  create: (body: PurchaseInput) => apiClient.post<PurchaseResponse>("/api/purchases", body).then(r => r.data),
  addPayment: (id: number, body: PaymentRequest) =>
    apiClient.post<PaymentResponse>(`/api/purchases/${id}/payments`, body).then(r => r.data),
  getPayments: (id: number) =>
    apiClient.get<PaymentResponse[]>(`/api/purchases/${id}/payments`).then(r => r.data),
};
```

### Create Purchase Form Logic

```
1. User picks supplier from active-suppliers dropdown.
2. User fills header fields: vatBillNumber, purchaseDate, invoiceAmount, vatAmount, discount, remarks.
3. User adds line items dynamically:
   - Product dropdown (search by name or barcode)
   - quantity, purchasePrice, vatPercent, expiryDate (optional), location (optional)
   - batchCode: leave empty — backend auto-generates
4. On submit → POST /api/purchases
5. On success:
   - Stock increases automatically (backend creates batch + updates averageCost)
   - Show purchase detail with outstandingAmount
   - If outstandingAmount > 0 → offer "Add Payment" button
```

### Key UI Notes

- `vatBillNumber` uniqueness: if the API returns `400`, show "VAT bill number already exists".
- `outstandingAmount` = `invoiceAmount - totalPaid`. Show payment status badge: PAID (green) / PARTIAL (amber) / UNPAID (red).
- **Payment modal** fields: amount, paymentMethod (CASH/ONLINE/CHEQUE select), referenceNumber (shown only when CHEQUE or ONLINE), notes.
- Multiple payments allowed per purchase — show full history in accordion.

---

## 9. Module: Sales

### API Service — `src/services/saleService.ts`

```ts
import apiClient from "@/lib/apiClient";

export interface SaleItemInput {
  productId: number;
  quantity: number;   // min 1
  unitPrice?: number; // optional override; auto-filled from template or product.sellingPrice
}

export interface SaleInput {
  customerId?: number;           // null = walk-in
  saleDate?: string;             // ISO datetime
  discount?: number;             // default 0
  vatAmount?: number;            // default 0; from invoice
  paymentStatus?: "PAID" | "PARTIAL" | "CREDIT"; // default "PAID"
  notes?: string;
  items: SaleItemInput[];        // min 1 required
}

export interface SaleLineResponse {
  id: number;
  productId: number;
  productName: string;
  batchId: number;
  batchCode: string;
  quantity: number;
  unitPrice: string;
  costPriceAtSale: string; // snapshot of averageCost at time of sale
  lineTotal: string;
  profit: string;          // (unitPrice - costPriceAtSale) × quantity
}

export interface SaleResponse {
  id: number;
  customerId: number | null;
  customerName: string | null;
  invoiceNumber: string;      // auto-generated: INV-YYYY-NNNNN
  saleDate: string;
  totalAmount: string;
  discount: string;
  vatAmount: string;
  paymentStatus: "PAID" | "PARTIAL" | "CREDIT";
  notes: string | null;
  createdAt: string;
  lines: SaleLineResponse[];
  totalPaid: string;
  outstandingAmount: string;
}

export const saleService = {
  getAll: () => apiClient.get<SaleResponse[]>("/api/sales").then(r => r.data),
  getById: (id: number) => apiClient.get<SaleResponse>(`/api/sales/${id}`).then(r => r.data),
  create: (body: SaleInput) => apiClient.post<SaleResponse>("/api/sales", body).then(r => r.data),
  addPayment: (id: number, body: PaymentRequest) =>
    apiClient.post<PaymentResponse>(`/api/sales/${id}/payments`, body).then(r => r.data),
  getPayments: (id: number) =>
    apiClient.get<PaymentResponse[]>(`/api/sales/${id}/payments`).then(r => r.data),
};

// PaymentRequest / PaymentResponse same shape as in purchaseService
import type { PaymentRequest, PaymentResponse } from "./purchaseService";
```

### Create Sale Form Logic

```
1. Optional: select customer from dropdown.
   - When customer selected → fetch price template:
     GET /api/customers/{id}/price-template
   - Map template entries as { [productId]: sellingPrice } for auto-fill.

2. Add line items:
   - Product search by name or barcode (filter on client from /api/products list).
   - Quantity input.
   - Unit price: auto-filled from template if customer set, else product.sellingPrice.
     User can override (leave unitPrice field editable).
   - Show running line total = unitPrice × quantity.

3. Payment status:
   - Walk-in (no customer) → can only be PAID or PARTIAL (no credit).
   - Customer with creditLimit = 0 → same restriction.
   - Customer with creditLimit > 0 → allow CREDIT / PARTIAL.

4. On submit → POST /api/sales
5. On 400 with "Insufficient stock" error → highlight the affected product row in red.
6. On success → show invoice view (printable).
```

### Invoice View (Printable)

```tsx
// Trigger print
<button onClick={() => window.print()} className="print:hidden ...">
  Print Invoice
</button>

// In your CSS / tailwind:
// @media print { .print\:hidden { display: none; } }
// The invoice div should have class "print:block"
```

Invoice must show:
- Shop name, invoice number, date
- Customer name (if any)
- Line items: Product | Qty | Unit Price | Line Total
- Subtotal, Discount, VAT, **Grand Total**
- Payment status

### Key UI Notes

- `invoiceNumber` format: `INV-2026-00001` — display prominently on invoice and list.
- `paymentStatus` badge: PAID → green, PARTIAL → amber, CREDIT → red.
- Sales are **immutable** — no edit/delete endpoint exists. Void/cancellation is a future feature.
- `profit` per line is pre-calculated by the backend using `costPriceAtSale` — do not recalculate client-side.

---

## 10. Module: Inventory

### API Service — `src/services/inventoryService.ts`

```ts
import apiClient from "@/lib/apiClient";

export interface CurrentInventoryResponse {
  productId: number;
  name: string;
  brand: string | null;
  category: string | null;
  volumeMl: number | null;
  unit: string | null;
  minStock: number;
  totalQuantity: number;
  averageCost: string;
  sellingPrice: string;
  totalValue: string;   // totalQuantity × averageCost
  isLowStock: boolean;
}

export interface LowStockResponse {
  productId: number;
  name: string;
  brand: string | null;
  category: string | null;
  volumeMl: number | null;
  unit: string | null;
  minStock: number;
  totalQuantity: number;
}

export interface ExpiringBatchResponse {
  id: number;
  productId: number;
  productName: string;
  productBrand: string | null;
  batchCode: string;
  expiryDate: string;   // ISO date
  purchasePrice: string;
  currentQuantity: number;
  location: string | null;
  createdAt: string;
  status: "expired" | "expiring_soon";
}

export const inventoryService = {
  getCurrent: () =>
    apiClient.get<CurrentInventoryResponse[]>("/api/inventory").then(r => r.data),
  getLowStock: () =>
    apiClient.get<LowStockResponse[]>("/api/inventory/low-stock").then(r => r.data),
  getExpiring: (days?: number) =>
    apiClient.get<ExpiringBatchResponse[]>("/api/inventory/expiring", {
      params: days ? { days } : undefined,
    }).then(r => r.data),
};
```

### Key UI Notes

- **Current stock table**: sortable by name, category, totalQuantity. Highlight row amber if `isLowStock`.
- **Expiring batches**: colour-code by `status`:
  - `"expired"` → `bg-red-50 text-red-700`
  - `"expiring_soon"` → `bg-amber-50 text-amber-700`
- Default `days` param for expiring = 30. Let user change with a number input.
- **Dashboard summary cards** can use:
  - `getLowStock().length` → low stock count
  - `getExpiring(30).length` → expiring within 30 days
  - `getCurrent().reduce((sum, p) => sum + parseFloat(p.totalValue), 0)` → total stock value

---

## 11. Business Logic Rules

These rules are enforced by the backend. The frontend must **communicate them clearly** to the user:

### Stock

| Rule | Backend Behaviour | Frontend Action |
|------|-------------------|-----------------|
| Cannot sell more than available stock | `400 Bad Request` with error message | Show error on sale line item row |
| Stock auto-increases on purchase save | Backend creates batch | Refetch inventory after purchase |
| Stock auto-decreases on sale save | FIFO batch allocation by backend | No client-side calculation needed |

### Purchases

| Rule | Backend Behaviour | Frontend Action |
|------|-------------------|-----------------|
| `vatBillNumber` must be unique | `400` if duplicate | Show field-level error |
| `supplierId` required | `400` validation | Supplier dropdown required |
| At least 1 line item | `400` validation | Disable submit if items empty |

### Sales

| Rule | Backend Behaviour | Frontend Action |
|------|-------------------|-----------------|
| Credit limit check | `400` if outstanding + new sale > creditLimit | Show warning before submit |
| Price auto-fill from template | Backend ignores sent price if null — NO, frontend must send it | Fetch template first, pre-fill `unitPrice`, allow override |
| Walk-in = no credit | `400` if `customerId` null and `paymentStatus = CREDIT` | Disable CREDIT option when no customer |
| `invoiceNumber` auto-generated | Backend generates `INV-YYYY-NNNNN` | Do not send `invoiceNumber` in body |

### Customer Balance

| Rule | Notes |
|------|-------|
| `outstandingBalance` increases on `CREDIT` or `PARTIAL` sale | Backend handles automatically |
| `outstandingBalance` decreases on payment via `POST /api/sales/{id}/payments` | Payment linked to sale + customer |
| Direct balance edit is not supported | Show read-only; redirect to statement page |

### Weighted Average Cost

| Rule | Notes |
|------|-------|
| `averageCost` updates every time a purchase is saved | Auto-calculated backend-side |
| `costPriceAtSale` in sale lines is a **permanent snapshot** | Never recalculate or update it |
| Profit = `(unitPrice - costPriceAtSale) × quantity` | Pre-calculated in `SaleLineResponse.profit` |

---

## 12. UI Patterns & Tailwind Conventions

### Reusable Component Patterns

```tsx
// Status Badge
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    ACTIVE:  "bg-green-100 text-green-700",
    INACTIVE:"bg-gray-100 text-gray-500",
    PAID:    "bg-green-100 text-green-700",
    PARTIAL: "bg-amber-100 text-amber-700",
    CREDIT:  "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

// Table wrapper
const Table = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
    <table className="w-full text-sm text-left text-gray-700">{children}</table>
  </div>
);

// Primary Button
const Button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition text-sm font-medium"
    {...props}
  >
    {children}
  </button>
);

// Input field
const Input = ({ label, error, ...props }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : "border-gray-300"}`}
      {...props}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);
```

### Layout Sidebar

```tsx
// Sidebar nav items
const navItems = [
  { label: "Dashboard",  path: "/dashboard",  icon: LayoutDashboard },
  { label: "Inventory",  path: "/inventory",  icon: Package },
  { label: "Products",   path: "/products",   icon: ShoppingBag },
  { label: "Suppliers",  path: "/suppliers",  icon: Truck },
  { label: "Customers",  path: "/customers",  icon: Users },
  { label: "Purchases",  path: "/purchases",  icon: ArrowDownCircle },
  { label: "Sales",      path: "/sales",      icon: ArrowUpCircle },
];
```

### Number Formatting

```ts
// Always parse BigDecimal strings from API before displaying
const fmt = (value: string | number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "NPR" }).format(Number(value));

// Or simpler for quantities:
const qty = (n: number) => n.toLocaleString("en-IN");
```

### Date Formatting

```ts
import { format, parseISO } from "date-fns";

const fmtDate = (iso: string) => format(parseISO(iso), "dd MMM yyyy");
const fmtDateTime = (iso: string) => format(parseISO(iso), "dd MMM yyyy, hh:mm a");
```

---

## 13. Screen Checklist

### Auth
- [ ] `/login` — username + password form

### Dashboard (`/dashboard`)
- [ ] Summary cards: Total Products, Low Stock count (from `/api/inventory/low-stock`), Expiring Soon count (from `/api/inventory/expiring?days=30`), Total Stock Value
- [ ] Quick links: New Sale, New Purchase

### Suppliers (`/suppliers`)
- [ ] List table with status filter (All / Active / Inactive)
- [ ] Add / Edit form (modal or inline)
- [ ] Delete with confirmation dialog

### Products (`/products`)
- [ ] List table — filter by category, status, barcode search
- [ ] Add / Edit form
- [ ] Toggle status button (`PATCH /{id}/toggle-status`)
- [ ] Soft delete with confirmation
- [ ] Low stock badge (orange border if `currentStock <= minStock`)

### Customers (`/customers`)
- [ ] List table with outstanding balance badge
- [ ] Add / Edit form
- [ ] Price template editor (sub-page or drawer)
- [ ] Statement page (printable ledger)
- [ ] Payment history list

### Purchases (`/purchases`)
- [ ] List table — filter by date range, supplier, payment status
- [ ] Create purchase form (header + dynamic line items)
- [ ] Purchase detail page (lines + payment history)
- [ ] Add payment modal

### Sales (`/sales`)
- [ ] List table — filter by date, paymentStatus, customer
- [ ] Create sale form (optional customer + line items with price auto-fill)
- [ ] Sale detail / printable invoice
- [ ] Add payment modal (for PARTIAL / CREDIT sales)

### Inventory (`/inventory`)
- [ ] Current stock table (sortable, low-stock highlighted)
- [ ] Low stock alert list
- [ ] Expiring batches list (days input, colour-coded by status)
