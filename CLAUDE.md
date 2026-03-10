# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Development (run in separate terminals)
npm run dev           # Frontend on http://localhost:5173
npm run dev:backend   # Backend on http://localhost:8080

# Build & preview
npm run build
npm run preview

# Lint
npm run lint
```

## Architecture

Full-stack inventory management app (liquor shop) with a React frontend and Express backend. All data is **in-memory only** — resets on server restart. No database.

### Frontend (`src/`)
- **App.jsx** — Root component: `AuthContext` (JWT in localStorage), routing between `LoginPage`, `DashboardPage`, `ProductsPage`
- **pages/** — Three pages: Login/Register, Dashboard (5 charts + summary), Products (CRUD table)
- **components/** — Chart components (Recharts: Bar, Line, Pie), `ProductForm`, `ProductList`, `LowStockAlerts`
- API calls use axios with `Authorization: Bearer <token>` header; base URL from `VITE_API_URL` env var

### Backend (`backend/`)
- **server.js** — Express app, CORS, mounts routes under `/api`
- **routes/auth.js** — `POST /api/auth/login`, `POST /api/auth/register`
- **routes/stocks.js** — 6 read-only endpoints for dashboard data (all require JWT)
- **routes/products.js** — Full CRUD + search/filter (all require JWT)
- **middleware/auth.js** — JWT verification via `verifyToken`
- **data/stocks.js** — In-memory sample data + utility functions

### Auth Flow
1. Login → bcryptjs password check → JWT (24h) returned
2. Frontend stores token in localStorage via `AuthContext`
3. All protected requests send `Authorization: Bearer <token>`

### Environment (`.env`)
```
VITE_API_URL=http://localhost:8080/api
PORT=8080
JWT_SECRET=your-secret-key-change-in-production
CLIENT_URL=http://localhost:5173
```

### Demo Credentials
- `demo@example.com` / `password123`
- `admin@example.com` / `admin123`
