import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../../lib/apiClient'
import { DataTable } from '../../components/datatable/DataTable'
import { DataTableToolbar } from '../../components/datatable/DataTableToolbar'
import { DateRangePicker } from '../../components/filters/DateRangePicker'
import { CategoryDonutChart } from '../../components/charts/CategoryDonutChart'
import { ProfitBarChart } from '../../components/charts/ProfitBarChart'
import { exportToCSV } from '../../components/datatable/ExportCSVButton'
import { formatNPR, getLast30Days } from '../../lib/utils'

const columns = [
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'quantitySold', header: 'Qty Sold' },
  { accessorKey: 'revenue', header: 'Revenue', cell: ({ getValue }) => formatNPR(getValue()) },
  { accessorKey: 'profit', header: 'Profit', cell: ({ getValue }) => <span className="text-green-400">{formatNPR(getValue())}</span> },
  { accessorKey: 'revenuePct', header: 'Revenue Share', cell: ({ getValue }) => {
    const v = getValue() || 0
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(v, 100)}%` }} />
        </div>
        <span className="text-xs w-10 text-right">{v.toFixed(1)}%</span>
      </div>
    )
  }},
]

export default function CategorySalesPage() {
  const [dateRange, setDateRange] = useState(getLast30Days())
  const [globalFilter, setGlobalFilter] = useState('')

  const { data = [], isLoading, error } = useQuery({
    queryKey: ['category-sales', dateRange],
    queryFn: () => apiClient.get('/api/reports/category-sales', { params: { from: dateRange.from, to: dateRange.to } }).then(r => r.data),
  })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Category Sales</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Revenue breakdown by product category</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryDonutChart data={data} title="Revenue Share" dataKey="revenue" nameKey="category" />
        <ProfitBarChart data={[...data].sort((a,b)=>(b.profit||0)-(a.profit||0))} title="Profit by Category" xKey="category" yKey="profit" />
      </div>

      <div className="space-y-3">
        <DataTableToolbar
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          onExportCSV={() => exportToCSV(data, columns, 'category-sales.csv')}
        >
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </DataTableToolbar>
        <DataTable
          columns={columns}
          data={data}
          loading={isLoading}
          error={error ? 'Failed to load category sales.' : null}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
        />
      </div>
    </div>
  )
}
