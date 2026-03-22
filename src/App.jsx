import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { QueryProvider } from './components/QueryProvider'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import SuppliersPage from './pages/SuppliersPage'
import CustomersPage from './pages/CustomersPage'
import PurchasesPage from './pages/PurchasesPage'
import SalesPage from './pages/SalesPage'
import InventoryPage from './pages/InventoryPage'
import ImportPage from './pages/ImportPage'
import DailySalesPage from './pages/reports/DailySalesPage'
import ProfitLossPage from './pages/reports/ProfitLossPage'
import CategorySalesPage from './pages/reports/CategorySalesPage'
import FastMovingPage from './pages/reports/FastMovingPage'
import DeadStockPage from './pages/reports/DeadStockPage'
import PurchaseReportPage from './pages/reports/PurchaseReportPage'
import VatReportPage from './pages/reports/VatReportPage'
import StockMovementPage from './pages/reports/StockMovementPage'
import SupplierOutstandingPage from './pages/reports/SupplierOutstandingPage'
import './App.css'

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ style: { background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))' } }} />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/purchases/*" element={<PurchasesPage />} />
                <Route path="/sales/*" element={<SalesPage />} />
                <Route path="/import" element={<ImportPage />} />
                <Route path="/reports/daily-sales" element={<DailySalesPage />} />
                <Route path="/reports/profit-loss" element={<ProfitLossPage />} />
                <Route path="/reports/category-sales" element={<CategorySalesPage />} />
                <Route path="/reports/fast-moving" element={<FastMovingPage />} />
                <Route path="/reports/dead-stock" element={<DeadStockPage />} />
                <Route path="/reports/purchases" element={<PurchaseReportPage />} />
                <Route path="/reports/vat" element={<VatReportPage />} />
                <Route path="/reports/stock-movement" element={<StockMovementPage />} />
                <Route path="/reports/supplier-outstanding" element={<SupplierOutstandingPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryProvider>
  )
}
