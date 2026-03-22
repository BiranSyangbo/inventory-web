import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../../lib/apiClient'
import { DataTable } from '../../components/datatable/DataTable'
import { DataTableToolbar } from '../../components/datatable/DataTableToolbar'
import { CategoryFilter } from '../../components/filters/CategoryFilter'
import { KPICard } from '../../components/dashboard/KPICard'
import { exportToCSV } from '../../components/datatable/ExportCSVButton'
import { formatNPR, formatDate } from '../../lib/utils'
import { Badge } from '../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Archive, DollarSign } from 'lucide-react'

const columns = [
  { accessorKey: 'productName', header: 'Product' },
  { accessorKey: 'brand', header: 'Brand' },
  { accessorKey: 'category', header: 'Category', cell: ({ getValue }) => <Badge variant="secondary">{getValue()}</Badge> },
  { accessorKey: 'currentStock', header: 'Stock' },
  { accessorKey: 'stockValue', header: 'Stock Value', cell: ({ getValue }) => <span className="text-red-400">{formatNPR(getValue())}</span> },
  { accessorKey: 'lastSoldDate', header: 'Last Sold', cell: ({ getValue }) => {
    if (!getValue()) return <span className="text-red-400 text-xs">Never sold</span>
    return formatDate(getValue())
  }},
  { accessorKey: 'daysSinceLastSale', header: 'Days Inactive', cell: ({ getValue }) => getValue() ?? '—' },
]

export default function DeadStockPage() {
  const [days, setDays] = useState('30')
  const [category, setCategory] = useState('all')
  const [globalFilter, setGlobalFilter] = useState('')

  const { data: raw = [], isLoading, error } = useQuery({
    queryKey: ['dead-stock', days],
    queryFn: () => apiClient.get('/api/reports/dead-stock', { params: { days } }).then(r => r.data),
  })

  const categories = useMemo(() => [...new Set(raw.map(r => r.category).filter(Boolean))].sort(), [raw])
  const data = useMemo(() => category === 'all' ? raw : raw.filter(r => r.category === category), [raw, category])

  const totalValue = data.reduce((s, r) => s + (r.stockValue || 0), 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dead Stock</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Products with no recent sales activity</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <KPICard title="Dead Stock Products" value={data.length} icon={Archive} color="red" loading={isLoading} />
        <KPICard title="Dead Stock Value" value={formatNPR(totalValue)} icon={DollarSign} color="red" loading={isLoading} />
      </div>

      <div className="space-y-3">
        <DataTableToolbar
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          onExportCSV={() => exportToCSV(data, columns, 'dead-stock.csv')}
        >
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="h-9 w-40 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[['7','7 days'],['14','14 days'],['30','30 days'],['60','60 days'],['90','90 days']].map(([v,l]) => (
                <SelectItem key={v} value={v}>Inactive {l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CategoryFilter categories={categories} value={category} onChange={setCategory} />
        </DataTableToolbar>
        <DataTable
          columns={columns}
          data={data}
          loading={isLoading}
          error={error ? 'Failed to load dead stock data.' : null}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
        />
      </div>
    </div>
  )
}
