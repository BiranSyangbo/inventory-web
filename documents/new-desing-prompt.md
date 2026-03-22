You are working inside a React (Next.js) admin dashboard project for a Liquor Shop Inventory & Billing System.

The project already contains:

* Existing CRUD pages for products, sales, purchases, customers, suppliers
* Phase-2 backend reporting APIs implemented in Spring Boot
* An existing frontend specification file:
  docs/frontend-reporting-spec.md

Your task is to **upgrade the admin panel UI to a modern analytics dashboard** while preserving all existing logic and API endpoints.

IMPORTANT:
Do NOT modify backend APIs. Only improve the frontend architecture and UI.

---

Step 1 — Read Context

Read the following files for requirements and existing system logic:

@documents/frontend-reporting-spec.md
@documents/admin-v2-desing.md


These files describe the reporting endpoints and current page layouts.

---

Step 2 — Upgrade the Admin UI

Refactor the admin interface into a modern analytics dashboard similar to Stripe, Shopify, or Supabase admin panels.

Use the following stack:

* React / Next.js
* Shadcn UI for UI components
* TanStack Table for advanced data tables
* React Query for API data fetching
* Recharts for charts
* Lucide React for icons
* React Day Picker for date range inputs

---

Step 3 — Create Reusable Components

Create shared components under:

src/components/

Required components:

components/
datatable/
DataTable.tsx
DataTableToolbar.tsx
ColumnVisibilityToggle.tsx
TablePagination.tsx
ExportCSVButton.tsx

filters/
DateRangePicker.tsx
CategoryFilter.tsx
SupplierFilter.tsx
ProductSearch.tsx

dashboard/
KPIcard.tsx
TrendIndicator.tsx

charts/
SalesLineChart.tsx
ProfitBarChart.tsx
CategoryDonutChart.tsx

---

Step 4 — Implement Advanced DataTables

All report pages must use a reusable DataTable component with:

* Global search
* Column sorting
* Column visibility toggle
* Pagination
* Sticky headers
* CSV export
* Loading skeleton
* Error state

Tables should be built using TanStack Table.

---

Step 5 — Improve Dashboard Page

Refactor `/dashboard` into a modern analytics overview.

Add KPI cards:

* Today Sales
* Today Profit
* Invoice Count
* Low Stock Products
* Expiring Products
* Total Stock Value
* Customer Credit
* Supplier Outstanding

Add charts:

* Daily sales trend (line chart)
* Category revenue distribution (donut chart)
* Top selling products (bar chart)

Dashboard should refresh every 5 minutes.

---

Step 6 — Upgrade All Report Pages

Refactor these routes to use the new DataTable system:

/reports/daily-sales
/reports/profit-loss
/reports/category-sales
/reports/fast-moving
/reports/dead-stock
/reports/purchases
/reports/vat
/reports/stock-movement
/reports/supplier-outstanding

Each page must include:

* Filter panel
* Data table
* Optional charts
* Summary KPI cards
* CSV export

---

Step 7 — Add Global Search

Add a global search bar in the top navbar.

Search should support:

* Products
* Customers
* Invoices
* Suppliers

Endpoints:

/api/products?search=
/api/customers?search=
/api/sales?invoice=

---

Step 8 — Improve Navigation

Refactor the sidebar menu:

Dashboard

Sales
New Sale
Sales List

Inventory
Products
Batches
Low Stock
Expiring

Reports
Daily Sales
Profit & Loss
Category Sales
Fast Moving
Dead Stock
Purchase Report
VAT Report
Stock Movement
Supplier Outstanding

---

Step 9 — Maintain Existing Logic

Do NOT rewrite:

* API endpoints
* existing business logic
* authentication system

Only improve UI architecture and component reuse.

---

Step 10 — Generate Updated Documentation

After implementing the UI improvements, generate a new documentation file:

docs/admin-ui-v2.md

This file must describe:

* UI architecture
* component structure
* data table system
* dashboard design
* report page layouts
* reusable component library
* frontend folder structure

---

Goal

Deliver a modern, scalable admin dashboard with advanced analytics UI while maintaining compatibility with the existing backend reporting APIs.
