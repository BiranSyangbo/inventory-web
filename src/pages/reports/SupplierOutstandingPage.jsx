import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../../lib/apiClient'
import { DataTable } from '../../components/datatable/DataTable'
import { DataTableToolbar } from '../../components/datatable/DataTableToolbar'
import { KPICard } from '../../components/dashboard/KPICard'
import { exportToCSV } from '../../components/datatable/ExportCSVButton'
import { formatNPR } from '../../lib/utils'
import { AlertTriangle } from 'lucide-react'

const columns = [
  { accessorKey: 'supplierName', header: 'Supplier' },
  { accessorKey: 'phone', header: 'Phone' },
  { accessorKey: 'purchaseCount', header: 'Purchases' },
  { accessorKey: 'totalPurchased', header: 'Total Purchased', cell: ({ getValue }) => formatNPR(getValue()) },
  { accessorKey: 'totalPaid', header: 'Total Paid', cell: ({ getValue }) => <span className="text-green-400">{formatNPR(getValue())}</span> },
  { accessorKey: 'outstanding', header: 'Outstanding', cell: ({ getValue }) => {
    const v = getValue()
    return v > 0 ? <span className="text-red-400 font-medium">{formatNPR(v)}</span> : <span className="text-muted-foreground">—</span>
  }},
]

export default function SupplierOutstandingPage() {
  const [globalFilter, setGlobalFilter] = useState('')

  const { data = [], isLoading, error } = useQuery({
    queryKey: ['supplier-outstanding'],
    queryFn: () => apiClient.get('/api/reports/supplier-outstanding').then(r => r.data),
  })

  const total = data.reduce((s, r) => s + (r.outstanding || 0), 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Supplier Outstanding</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Unpaid balances across all suppliers</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-sm">
        <KPICard title="Total Outstanding" value={formatNPR(total)} icon={AlertTriangle} color={total > 0 ? 'red' : 'green'} loading={isLoading} />
      </div>

      <div className="space-y-3">
        <DataTableToolbar
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          onExportCSV={() => exportToCSV(data, columns, 'supplier-outstanding.csv')}
        />
        <DataTable
          columns={columns}
          data={data}
          loading={isLoading}
          error={error ? 'Failed to load supplier outstanding data.' : null}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
        />
      </div>
    </div>
  )
}
