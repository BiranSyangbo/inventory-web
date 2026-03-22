import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../../lib/apiClient'
import { DataTable } from '../../components/datatable/DataTable'
import { DataTableToolbar } from '../../components/datatable/DataTableToolbar'
import { DateRangePicker } from '../../components/filters/DateRangePicker'
import { CategoryFilter } from '../../components/filters/CategoryFilter'
import { KPICard } from '../../components/dashboard/KPICard'
import { ProfitBarChart } from '../../components/charts/ProfitBarChart'
import { exportToCSV } from '../../components/datatable/ExportCSVButton'
import { formatNPR, getLast30Days } from '../../lib/utils'
import { Badge } from '../../components/ui/badge'
import { DollarSign, TrendingUp, TrendingDown, Percent } from 'lucide-react'

const columns = [
  { accessorKey: 'productName', header: 'Product' },
  { accessorKey: 'brand', header: 'Brand' },
  { accessorKey: 'category', header: 'Category', cell: ({ getValue }) => <Badge variant="secondary">{getValue()}</Badge> },
  { accessorKey: 'quantitySold', header: 'Qty Sold' },
  { accessorKey: 'revenue', header: 'Revenue', cell: ({ getValue }) => formatNPR(getValue()) },
  { accessorKey: 'totalCost', header: 'Cost', cell: ({ getValue }) => formatNPR(getValue()) },
  { accessorKey: 'profit', header: 'Profit', cell: ({ getValue }) => {
    const v = getValue()
    return <span className={v >= 0 ? 'text-green-400' : 'text-red-400'}>{formatNPR(v)}</span>
  }},
  { accessorKey: 'marginPct', header: 'Margin', cell: ({ getValue }) => `${(getValue() || 0).toFixed(2)}%` },
]

export default function ProfitLossPage() {
  const [dateRange, setDateRange] = useState(getLast30Days())
  const [category, setCategory] = useState('all')
  const [globalFilter, setGlobalFilter] = useState('')

  const { data: raw = [], isLoading, error } = useQuery({
    queryKey: ['profit-loss', dateRange],
    queryFn: () => apiClient.get('/api/reports/profit-loss', { params: { from: dateRange.from, to: dateRange.to } }).then(r => r.data),
  })

  const categories = useMemo(() => [...new Set(raw.map(r => r.category).filter(Boolean))].sort(), [raw])
  const data = useMemo(() => category === 'all' ? raw : raw.filter(r => r.category === category), [raw, category])

  const totals = data.reduce((acc, row) => ({
    revenue: acc.revenue + (row.revenue || 0),
    totalCost: acc.totalCost + (row.totalCost || 0),
    profit: acc.profit + (row.profit || 0),
  }), { revenue: 0, totalCost: 0, profit: 0 })

  const avgMargin = data.length > 0 ? data.reduce((a, r) => a + (r.marginPct || 0), 0) / data.length : 0

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profit & Loss Report</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Revenue, cost and profitability by product</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={formatNPR(totals.revenue)} icon={DollarSign} color="blue" loading={isLoading} />
        <KPICard title="Total Cost" value={formatNPR(totals.totalCost)} icon={TrendingDown} loading={isLoading} />
        <KPICard title="Total Profit" value={formatNPR(totals.profit)} icon={TrendingUp} color="green" loading={isLoading} />
        <KPICard title="Avg Margin" value={`${avgMargin.toFixed(1)}%`} icon={Percent} loading={isLoading} />
      </div>

      <ProfitBarChart data={[...data].sort((a,b) => (b.profit||0)-(a.profit||0)).slice(0,10)} title="Top 10 Products by Profit" xKey="productName" yKey="profit" />

      <div className="space-y-3">
        <DataTableToolbar
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          onExportCSV={() => exportToCSV(data, columns, 'profit-loss.csv')}
        >
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <CategoryFilter categories={categories} value={category} onChange={setCategory} />
        </DataTableToolbar>
        <DataTable
          columns={columns}
          data={data}
          loading={isLoading}
          error={error ? 'Failed to load profit & loss data.' : null}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
        />
      </div>
    </div>
  )
}
