import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../../lib/apiClient'
import { DataTable } from '../../components/datatable/DataTable'
import { DataTableToolbar } from '../../components/datatable/DataTableToolbar'
import { DateRangePicker } from '../../components/filters/DateRangePicker'
import { ProductSearch } from '../../components/filters/ProductSearch'
import { exportToCSV } from '../../components/datatable/ExportCSVButton'
import { formatDate } from '../../lib/utils'
import { Badge } from '../../components/ui/badge'

const columns = [
  { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => formatDate(getValue()) },
  { accessorKey: 'transactionType', header: 'Type', cell: ({ getValue }) => {
    const v = getValue()
    return <Badge variant={v === 'PURCHASE' ? 'blue' : 'warning'}>{v}</Badge>
  }},
  { accessorKey: 'referenceNumber', header: 'Reference' },
  { accessorKey: 'quantityIn', header: 'IN', cell: ({ getValue }) => {
    const v = getValue()
    return v ? <span className="text-green-400 font-medium">{v}</span> : <span className="text-muted-foreground">—</span>
  }},
  { accessorKey: 'quantityOut', header: 'OUT', cell: ({ getValue }) => {
    const v = getValue()
    return v ? <span className="text-red-400 font-medium">{v}</span> : <span className="text-muted-foreground">—</span>
  }},
  { accessorKey: 'runningBalance', header: 'Balance', cell: ({ getValue }) => <span className="font-bold">{getValue()}</span> },
]

function getLast90Days() {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 90)
  return { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] }
}

export default function StockMovementPage() {
  const [product, setProduct] = useState(null)
  const [dateRange, setDateRange] = useState(getLast90Days())
  const [globalFilter, setGlobalFilter] = useState('')

  const { data = [], isLoading, error } = useQuery({
    queryKey: ['stock-movement', product?.id, dateRange],
    queryFn: () => apiClient.get('/api/reports/stock-movement', { params: { productId: product.id, from: dateRange.from, to: dateRange.to } }).then(r => r.data),
    enabled: !!product,
  })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stock Movement</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Transaction history and running balance for a product</p>
      </div>

      <div className="p-4 rounded-lg border border-border bg-card space-y-3">
        <p className="text-sm font-medium">Select a product to view its stock movement</p>
        <div className="flex items-center gap-3 flex-wrap">
          <ProductSearch onSelect={setProduct} placeholder="Search by name or barcode..." />
          {product && <DateRangePicker value={dateRange} onChange={setDateRange} />}
        </div>
        {product && (
          <p className="text-sm text-muted-foreground">Showing movement for: <span className="font-medium text-foreground">{product.name || product.productName}</span></p>
        )}
      </div>

      {!product ? (
        <div className="rounded-lg border border-border p-12 text-center text-muted-foreground">
          Search and select a product above to view stock movement
        </div>
      ) : (
        <div className="space-y-3">
          <DataTableToolbar
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            onExportCSV={() => exportToCSV(data, columns, 'stock-movement.csv')}
          />
          <DataTable
            columns={columns}
            data={data}
            loading={isLoading}
            error={error ? 'Failed to load stock movement data.' : null}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
          />
        </div>
      )}
    </div>
  )
}
