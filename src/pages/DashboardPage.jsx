import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  DollarSign, TrendingUp, FileText, AlertTriangle,
  Clock, Package, CreditCard, Truck, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react'
import apiClient from '../lib/apiClient'
import { KPICard } from '../components/dashboard/KPICard'
import { SalesLineChart } from '../components/charts/SalesLineChart'
import { CategoryDonutChart } from '../components/charts/CategoryDonutChart'
import { ProfitBarChart } from '../components/charts/ProfitBarChart'
import { formatNPR, getLast30Days } from '../lib/utils'

function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.get('/api/reports/dashboard').then(r => r.data),
    refetchInterval: 5 * 60 * 1000,
    retry: 1,
  })
}

function useDailySalesChart() {
  const { from, to } = getLast30Days()
  return useQuery({
    queryKey: ['daily-sales-chart', from, to],
    queryFn: () => apiClient.get('/api/reports/daily-sales', { params: { from, to } }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })
}

function useCategorySales() {
  const { from, to } = getLast30Days()
  return useQuery({
    queryKey: ['category-sales-chart', from, to],
    queryFn: () => apiClient.get('/api/reports/category-sales', { params: { from, to } }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })
}

function useTopProducts() {
  const { from, to } = getLast30Days()
  return useQuery({
    queryKey: ['fast-moving-chart', from, to],
    queryFn: () => apiClient.get('/api/reports/fast-moving-products', { params: { from, to, limit: 10 } }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data: dash, isLoading, error } = useDashboard()
  const { data: salesData } = useDailySalesChart()
  const { data: categoryData } = useCategorySales()
  const { data: topProducts } = useTopProducts()

  const kpis = [
    {
      title: "Today's Sales",
      value: formatNPR(dash?.todaySales),
      icon: DollarSign,
      color: 'blue',
      onClick: () => navigate('/reports/daily-sales'),
    },
    {
      title: "Today's Profit",
      value: formatNPR(dash?.todayProfit),
      icon: TrendingUp,
      color: 'green',
    },
    {
      title: "Today's Invoices",
      value: dash?.todayInvoiceCount ?? '—',
      icon: FileText,
      color: 'default',
    },
    {
      title: 'Low Stock',
      value: dash?.lowStockCount ?? '—',
      icon: AlertTriangle,
      color: (dash?.lowStockCount || 0) > 0 ? 'red' : 'green',
      onClick: () => navigate('/inventory'),
    },
    {
      title: 'Expiring Soon',
      value: dash?.expiringCount ?? '—',
      icon: Clock,
      color: (dash?.expiringCount || 0) > 0 ? 'orange' : 'green',
    },
    {
      title: 'Total Stock Value',
      value: formatNPR(dash?.totalStockValue),
      icon: Package,
      color: 'default',
    },
    {
      title: 'Customer Credit',
      value: formatNPR(dash?.pendingCustomerCredit),
      icon: CreditCard,
      color: (dash?.pendingCustomerCredit || 0) > 0 ? 'orange' : 'default',
    },
    {
      title: 'Supplier Outstanding',
      value: formatNPR(dash?.pendingSupplierPayments),
      icon: Truck,
      color: (dash?.pendingSupplierPayments || 0) > 0 ? 'red' : 'green',
      onClick: () => navigate('/reports/supplier-outstanding'),
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Analytics overview · Auto-refreshes every 5 min</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/purchases/new')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-accent text-sm font-medium transition-colors"
          >
            <ArrowDownCircle className="h-4 w-4" />
            New Purchase
          </button>
          <button
            onClick={() => navigate('/sales/new')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
          >
            <ArrowUpCircle className="h-4 w-4" />
            New Sale
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/20 border border-destructive/50 rounded-lg text-sm text-red-400">
          Failed to load dashboard data. The reporting API may not be available.
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <KPICard key={kpi.title} {...kpi} loading={isLoading} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesLineChart data={salesData || []} title="Daily Sales (Last 30 Days)" />
        <CategoryDonutChart data={categoryData || []} title="Revenue by Category" dataKey="revenue" nameKey="category" />
      </div>

      <ProfitBarChart data={topProducts || []} title="Top Selling Products" xKey="productName" yKey="totalRevenue" />
    </div>
  )
}
