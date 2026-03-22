# Phase 2 — Frontend Reporting Specification

Liquor Shop Inventory & Billing System

---

## Overview

All report pages live under `/reports/` in the React/Next.js frontend.
Each page fetches from `GET /api/reports/<endpoint>` and renders a filterable table with optional summary cards.

Date inputs use ISO-8601 format (`YYYY-MM-DD`) via `?from=&to=` query params.

---

## 1. Dashboard

**Route:** `/dashboard`
**API:** `GET /api/reports/dashboard`

### Layout

Seven KPI cards in a 3-column grid (responsive: 2 on tablet, 1 on mobile):

| Card | Value | Colour |
|------|-------|--------|
| Today's Sales | `todaySales` | Blue |
| Today's Profit | `todayProfit` | Green |
| Today's Invoices | `todayInvoiceCount` | Neutral |
| Low Stock Products | `lowStockCount` | Red if > 0, else Green |
| Expiring Soon (30d) | `expiringCount` | Orange if > 0, else Green |
| Total Stock Value | `totalStockValue` | Neutral |
| Pending Credit (customers) | `pendingCustomerCredit` | Orange if > 0 |
| Pending Payments (suppliers) | `pendingSupplierPayments` | Red if > 0, else Green |

### Quick links below the cards

- "View Low Stock" → `/inventory/low-stock`
- "View Expiring" → `/inventory/expiring`
- "View Customer Credit" → `/reports/supplier-outstanding`
- "New Sale" → `/sales/new`

### Data refresh

Auto-refresh every 5 minutes using a polling hook (or use SWR/React Query `refreshInterval`).

---

## 2. Daily Sales Report

**Route:** `/reports/daily-sales`
**API:** `GET /api/reports/daily-sales?from=&to=`

### Filters

| Filter | Type | Default |
|--------|------|---------|
| Date range | Date picker | Last 30 days |

### Summary cards (above table)

- **Total Sales** — sum of all `totalSales` in result
- **Total Profit** — sum of all `totalProfit`
- **Total Invoices** — sum of all `invoiceCount`
- **Total VAT** — sum of all `totalVat`

### Table columns

| Column | Field | Format |
|--------|-------|--------|
| Date | `date` | `DD MMM YYYY` |
| Invoices | `invoiceCount` | Number |
| Total Sales | `totalSales` | NPR currency |
| Walk-in Sales | `walkInSales` | NPR currency |
| Hotel/Credit Sales | `customerSales` | NPR currency |
| Profit | `totalProfit` | NPR currency (green text) |
| VAT | `totalVat` | NPR currency |

### Chart (optional)

Line chart: X = date, dual Y-axis: Sales (blue) + Profit (green). Useful for spotting trend changes.

### Export

CSV download button.

---

## 3. Profit & Loss Report

**Route:** `/reports/profit-loss`
**API:** `GET /api/reports/profit-loss?from=&to=`

### Filters

| Filter | Type | Default |
|--------|------|---------|
| Date range | Date picker | Last 30 days |
| Category | Dropdown (all categories) | All |

Category filter is client-side — filter the returned array by `category`.

### Summary cards

- **Total Revenue**
- **Total Cost**
- **Total Profit**
- **Average Margin %**

### Table columns

| Column | Field | Format |
|--------|-------|--------|
| Product | `productName` | Text |
| Brand | `brand` | Text |
| Category | `category` | Badge |
| Qty Sold | `quantitySold` | Number |
| Revenue | `revenue` | NPR |
| Cost (WAC) | `totalCost` | NPR |
| Profit | `profit` | NPR (colour: green if > 0, red if negative) |
| Margin % | `marginPct` | `12.12%` |

### Sort

Clickable column headers. Default: Profit descending.

### Chart (optional)

Horizontal bar chart of top 10 products by profit.

---

## 4. Purchase Report

**Route:** `/reports/purchases`
**API:** `GET /api/reports/purchase-report?from=&to=&supplierId=`

### Filters

| Filter | Type | Default |
|--------|------|---------|
| Date range | Date picker | Last 30 days |
| Supplier | Dropdown (from `/api/suppliers`) | All |

### Summary cards

- **Total Purchases** — sum of `invoiceAmount`
- **Total VAT Paid** — sum of `vatAmount`
- **Total Paid** — sum of `totalPaid`
- **Total Outstanding** — sum of `outstanding`

### Table columns

| Column | Field | Format |
|--------|-------|--------|
| Date | `purchaseDate` | `DD MMM YYYY` |
| Supplier | `supplierName` | Text |
| VAT Bill No. | `vatBillNumber` | Text (dash if null) |
| Invoice Amount | `invoiceAmount` | NPR |
| VAT | `vatAmount` | NPR |
| Discount | `discount` | NPR |
| Paid | `totalPaid` | NPR (green) |
| Outstanding | `outstanding` | NPR (red if > 0, else "–") |

### Row action

Click row → navigate to `/purchases/{purchaseId}` (existing purchase detail page).

---

## 5. VAT Report

**Route:** `/reports/vat`
**API:** `GET /api/reports/vat-report?from=&to=`

### Filters

| Filter | Type | Default |
|--------|------|---------|
| Date range | Date picker | Current month |

### Summary cards

| Card | Value |
|------|-------|
| Purchase VAT (Input) | `totalPurchaseVat` |
| Sales VAT (Output) | `totalSalesVat` |
| Net VAT Liability | `netVatLiability` (red if positive) |

### Two tabs: "Sales VAT" and "Purchase VAT"

**Sales VAT tab:**

| Column | Field | Format |
|--------|-------|--------|
| Date | `saleDate` | `DD MMM YYYY` |
| Invoice No. | `invoiceNumber` | Text |
| Sale Amount | `totalAmount` | NPR |
| VAT Amount | `vatAmount` | NPR |

**Purchase VAT tab:**

| Column | Field | Format |
|--------|-------|--------|
| Date | `purchaseDate` | `DD MMM YYYY` |
| Supplier | `supplierName` | Text |
| VAT Bill No. | `vatBillNumber` | Text |
| Invoice Amount | `invoiceAmount` | NPR |
| VAT Amount | `vatAmount` | NPR |

### Export

Print-friendly view for tax filing.

---

## 6. Stock Movement

**Route:** `/reports/stock-movement`
**API:** `GET /api/reports/stock-movement?productId=&from=&to=`

### Filters

| Filter | Type | Default |
|--------|------|---------|
| Product | Searchable dropdown (barcode or name) | **Required** |
| Date range | Date picker | Last 90 days |

Product search hits `/api/products?search=` — same as existing product search.

### Table columns

| Column | Field | Format |
|--------|-------|--------|
| Date | `date` | `DD MMM YYYY` |
| Type | `transactionType` | Badge: PURCHASE (blue) / SALE (orange) |
| Reference | `referenceNumber` | Text |
| IN | `quantityIn` | Green number (0 shown as "–") |
| OUT | `quantityOut` | Red number (0 shown as "–") |
| Balance | `runningBalance` | Bold number |

Sorted by date ascending (oldest first) to make the running balance readable.

---

## 7. Fast Moving Products

**Route:** `/reports/fast-moving`
**API:** `GET /api/reports/fast-moving-products?from=&to=&limit=`

### Filters

| Filter | Type | Default |
|--------|------|---------|
| Date range | Date picker | Last 30 days |
| Top N | Number input (5 / 10 / 20 / 50) | 10 |
| Category | Dropdown | All (client-side filter) |

### Table columns

| Column | Field | Format |
|--------|-------|--------|
| Rank | Row index | 1, 2, 3... |
| Product | `productName` | Text |
| Brand | `brand` | Text |
| Category | `category` | Badge |
| Qty Sold | `quantitySold` | Number |
| Revenue | `totalRevenue` | NPR |
| Profit | `totalProfit` | NPR |
| Last Sold | `lastSoldDate` | `DD MMM YYYY` |

### Chart

Horizontal bar chart showing top 10 by quantity. Useful for at-a-glance comparison.

---

## 8. Dead Stock

**Route:** `/reports/dead-stock`
**API:** `GET /api/reports/dead-stock?days=`

### Filters

| Filter | Type | Default |
|--------|------|---------|
| Inactive for | Dropdown: 7 / 14 / 30 / 60 / 90 days | 30 |
| Category | Dropdown | All (client-side filter) |

### Summary cards

- **Dead Stock Products** — row count
- **Dead Stock Value** — sum of `stockValue`

### Table columns

| Column | Field | Format |
|--------|-------|--------|
| Product | `productName` | Text |
| Brand | `brand` | Text |
| Category | `category` | Badge |
| Current Stock | `currentStock` | Number |
| Stock Value | `stockValue` | NPR (red) |
| Last Sold | `lastSoldDate` | `DD MMM YYYY` or "Never sold" (red) |
| Days Inactive | `daysSinceLastSale` | Number or "—" |

### Highlight

Row with `lastSoldDate = null` gets red background — never sold products are the most urgent.

---

## 9. Supplier Outstanding

**Route:** `/reports/supplier-outstanding`
**API:** `GET /api/reports/supplier-outstanding`

### No filters (shows all outstanding suppliers)

### Summary card

- **Total Outstanding** — sum of `outstanding`

### Table columns

| Column | Field | Format |
|--------|-------|--------|
| Supplier | `supplierName` | Text |
| Phone | `phone` | Text |
| Purchases | `purchaseCount` | Number |
| Total Purchased | `totalPurchased` | NPR |
| Total Paid | `totalPaid` | NPR (green) |
| Outstanding | `outstanding` | NPR (red) |

### Row action

Click supplier name → open payment modal (reuse existing payment modal from `/purchases/{id}/payments`).

---

## 10. Category Sales

**Route:** `/reports/category-sales`
**API:** `GET /api/reports/category-sales?from=&to=`

### Filters

| Filter | Type | Default |
|--------|------|---------|
| Date range | Date picker | Last 30 days |

### Table columns

| Column | Field | Format |
|--------|-------|--------|
| Category | `category` | Text |
| Qty Sold | `quantitySold` | Number |
| Revenue | `revenue` | NPR |
| Profit | `profit` | NPR |
| Revenue Share | `revenuePct` | `40.1%` with progress bar |

### Chart

Pie chart (or donut chart) showing revenue share by category — best visual for this report. Also show a bar chart for profit comparison.

---

## 11. Navigation / Sidebar

Add a **Reports** section to the sidebar with these links:

```
📊 Reports
  ├── Dashboard
  ├── Daily Sales
  ├── Profit & Loss
  ├── Category Sales
  ├── Fast Moving Products
  ├── Dead Stock
  ├── Purchase Report
  ├── VAT Report
  ├── Stock Movement
  └── Supplier Outstanding
```

---

## 12. Shared Frontend Conventions

### Currency formatting

```js
const formatNPR = (amount) =>
  new Intl.NumberFormat('ne-NP', { style: 'currency', currency: 'NPR' }).format(amount);
```

### Date range picker

Use a shared `<DateRangePicker>` component that outputs `{ from: string, to: string }` in ISO-8601 and updates the URL query string.

### Presets

All date range pickers should offer presets:
- Today
- Yesterday
- Last 7 days
- Last 30 days
- This month
- Last month
- Custom range

### Loading / error states

Each report page should show a skeleton loader while fetching and a user-friendly error message if the API fails.

### API base URL

```js
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
```

### Authentication

All requests include `Authorization: Bearer <token>` from the auth context.

---

## 13. API Endpoint Summary

| Report | Method | Endpoint | Key Params |
|--------|--------|----------|------------|
| Dashboard | GET | `/api/reports/dashboard` | — |
| Daily Sales | GET | `/api/reports/daily-sales` | `from`, `to` |
| Profit & Loss | GET | `/api/reports/profit-loss` | `from`, `to` |
| Purchase Report | GET | `/api/reports/purchase-report` | `from`, `to`, `supplierId?` |
| VAT Report | GET | `/api/reports/vat-report` | `from`, `to` |
| Stock Movement | GET | `/api/reports/stock-movement` | `productId` (required), `from`, `to` |
| Fast Moving | GET | `/api/reports/fast-moving-products` | `from`, `to`, `limit` |
| Dead Stock | GET | `/api/reports/dead-stock` | `days` |
| Supplier Outstanding | GET | `/api/reports/supplier-outstanding` | — |
| Category Sales | GET | `/api/reports/category-sales` | `from`, `to` |
