import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../../lib/apiClient'
import { DataTable } from '../../components/datatable/DataTable'
import { DataTableToolbar } from '../../components/datatable/DataTableToolbar'
import { DateRangePicker } from '../../components/filters/DateRangePicker'
import { KPICard } from '../../components/dashboard/KPICard'
import { SalesLineChart } from '../../components/charts/SalesLineChart'
import { exportToCSV } from '../../components/datatable/ExportCSVButton'
import { formatNPR, formatDate, getLast30Days } from '../../lib/utils'
import { DollarSign, TrendingUp, FileText, Receipt } from 'lucide-react'

const columns = [
  { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => formatDate(getValue()) },
  { accessorKey: 'invoiceCount', header: 'Invoices' },
  { accessorKey: 'totalSales', header: 'Total Sales', cell: ({ getValue }) => formatNPR(getValue()) },
  { accessorKey: 'walkInSales', header: 'Walk-in', cell: ({ getValue }) => formatNPR(getValue()) },
  { accessorKey: 'customerSales', header: 'Hotel/Credit', cell: ({ getValue }) => formatNPR(getValue()) },
  { accessorKey: 'totalProfit', header: 'Profit', cell: ({ getValue }) => <span className="text-green-400">{formatNPR(getValue())}</span> },
  { accessorKey: 'totalVat', header: 'VAT', cell: ({ getValue }) => formatNPR(getValue()) },
]

export default function DailySalesPage() {
  const [dateRange, setDateRange] = useState(getLast30Days())
  const [globalFilter, setGlobalFilter] = useState('')

  const { data = [], isLoading, error } = useQuery({
    queryKey: ['daily-sales', dateRange],
    queryFn: () => apiClient.get('/api/reports/daily-sales', { params: { from: dateRange.from, to: dateRange.to } }).then(r => r.data),
  })

  const totals = data.reduce((acc, row) => ({
    totalSales: acc.totalSales + (row.totalSales || 0),
    totalProfit: acc.totalProfit + (row.totalProfit || 0),
    invoiceCount: acc.invoiceCount + (row.invoiceCount || 0),
    totalVat: acc.totalVat + (row.totalVat || 0),
  }), { totalSales: 0, totalProfit: 0, invoiceCount: 0, totalVat: 0 })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Daily Sales Report</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Sales performance by day</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Sales" value={formatNPR(totals.totalSales)} icon={DollarSign} color="blue" loading={isLoading} />
        <KPICard title="Total Profit" value={formatNPR(totals.totalProfit)} icon={TrendingUp} color="green" loading={isLoading} />
        <KPICard title="Total Invoices" value={totals.invoiceCount} icon={FileText} loading={isLoading} />
        <KPICard title="Total VAT" value={formatNPR(totals.totalVat)} icon={Receipt} loading={isLoading} />
      </div>

      <SalesLineChart data={data} title="Sales vs Profit Trend" />

      <div className="space-y-3">
        <DataTableToolbar
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          onExportCSV={() => exportToCSV(data, columns, 'daily-sales.csv')}
        >
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </DataTableToolbar>
        <DataTable
          columns={columns}
          data={data}
          loading={isLoading}
          error={error ? 'Failed to load daily sales data.' : null}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
        />
      </div>
    </div>
  )
}
