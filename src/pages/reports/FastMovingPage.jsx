import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../../lib/apiClient'
import { DataTable } from '../../components/datatable/DataTable'
import { DataTableToolbar } from '../../components/datatable/DataTableToolbar'
import { DateRangePicker } from '../../components/filters/DateRangePicker'
import { CategoryFilter } from '../../components/filters/CategoryFilter'
import { ProfitBarChart } from '../../components/charts/ProfitBarChart'
import { exportToCSV } from '../../components/datatable/ExportCSVButton'
import { formatNPR, formatDate, getLast30Days } from '../../lib/utils'
import { Badge } from '../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

const columns = [
  { id: 'rank', header: '#', cell: ({ row }) => row.index + 1 },
  { accessorKey: 'productName', header: 'Product' },
  { accessorKey: 'brand', header: 'Brand' },
  { accessorKey: 'category', header: 'Category', cell: ({ getValue }) => <Badge variant="secondary">{getValue()}</Badge> },
  { accessorKey: 'quantitySold', header: 'Qty Sold' },
  { accessorKey: 'totalRevenue', header: 'Revenue', cell: ({ getValue }) => formatNPR(getValue()) },
  { accessorKey: 'totalProfit', header: 'Profit', cell: ({ getValue }) => <span className="text-green-400">{formatNPR(getValue())}</span> },
  { accessorKey: 'lastSoldDate', header: 'Last Sold', cell: ({ getValue }) => formatDate(getValue()) },
]

export default function FastMovingPage() {
  const [dateRange, setDateRange] = useState(getLast30Days())
  const [limit, setLimit] = useState('10')
  const [category, setCategory] = useState('all')
  const [globalFilter, setGlobalFilter] = useState('')

  const { data: raw = [], isLoading, error } = useQuery({
    queryKey: ['fast-moving', dateRange, limit],
    queryFn: () => apiClient.get('/api/reports/fast-moving-products', { params: { from: dateRange.from, to: dateRange.to, limit } }).then(r => r.data),
  })

  const categories = useMemo(() => [...new Set(raw.map(r => r.category).filter(Boolean))].sort(), [raw])
  const data = useMemo(() => category === 'all' ? raw : raw.filter(r => r.category === category), [raw, category])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fast Moving Products</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Best selling products by quantity</p>
      </div>

      <ProfitBarChart data={data.slice(0, 10)} title="Top Products by Quantity" xKey="productName" yKey="quantitySold" />

      <div className="space-y-3">
        <DataTableToolbar
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          onExportCSV={() => exportToCSV(data, columns, 'fast-moving.csv')}
        >
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <CategoryFilter categories={categories} value={category} onChange={setCategory} />
          <Select value={limit} onValueChange={setLimit}>
            <SelectTrigger className="h-9 w-24 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['5','10','20','50'].map(v => <SelectItem key={v} value={v}>Top {v}</SelectItem>)}
            </SelectContent>
          </Select>
        </DataTableToolbar>
        <DataTable
          columns={columns}
          data={data}
          loading={isLoading}
          error={error ? 'Failed to load fast moving products.' : null}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
        />
      </div>
    </div>
  )
}
