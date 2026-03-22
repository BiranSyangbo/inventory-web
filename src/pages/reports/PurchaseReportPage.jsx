import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../lib/apiClient'
import { DataTable } from '../../components/datatable/DataTable'
import { DataTableToolbar } from '../../components/datatable/DataTableToolbar'
import { DateRangePicker } from '../../components/filters/DateRangePicker'
import { SupplierFilter } from '../../components/filters/SupplierFilter'
import { KPICard } from '../../components/dashboard/KPICard'
import { exportToCSV } from '../../components/datatable/ExportCSVButton'
import { formatNPR, formatDate, getLast30Days } from '../../lib/utils'
import { DollarSign, Receipt, CreditCard, AlertTriangle } from 'lucide-react'

const columns = [
  { accessorKey: 'purchaseDate', header: 'Date', cell: ({ getValue }) => formatDate(getValue()) },
  { accessorKey: 'supplierName', header: 'Supplier' },
  { accessorKey: 'vatBillNumber', header: 'VAT Bill No.', cell: ({ getValue }) => getValue() || '—' },
  { accessorKey: 'invoiceAmount', header: 'Invoice Amt', cell: ({ getValue }) => formatNPR(getValue()) },
  { accessorKey: 'vatAmount', header: 'VAT', cell: ({ getValue }) => formatNPR(getValue()) },
  { accessorKey: 'discount', header: 'Discount', cell: ({ getValue }) => formatNPR(getValue()) },
  { accessorKey: 'totalPaid', header: 'Paid', cell: ({ getValue }) => <span className="text-green-400">{formatNPR(getValue())}</span> },
  { accessorKey: 'outstanding', header: 'Outstanding', cell: ({ getValue }) => {
    const v = getValue()
    if (!v || v === 0) return <span className="text-muted-foreground">—</span>
    return <span className="text-red-400">{formatNPR(v)}</span>
  }},
]

export default function PurchaseReportPage() {
  const [dateRange, setDateRange] = useState(getLast30Days())
  const [supplierId, setSupplierId] = useState('all')
  const [globalFilter, setGlobalFilter] = useState('')
  const navigate = useNavigate()

  const params = { from: dateRange.from, to: dateRange.to }
  if (supplierId !== 'all') params.supplierId = supplierId

  const { data = [], isLoading, error } = useQuery({
    queryKey: ['purchase-report', dateRange, supplierId],
    queryFn: () => apiClient.get('/api/reports/purchase-report', { params }).then(r => r.data),
  })

  const totals = data.reduce((acc, r) => ({
    invoiceAmount: acc.invoiceAmount + (r.invoiceAmount || 0),
    vatAmount: acc.vatAmount + (r.vatAmount || 0),
    totalPaid: acc.totalPaid + (r.totalPaid || 0),
    outstanding: acc.outstanding + (r.outstanding || 0),
  }), { invoiceAmount: 0, vatAmount: 0, totalPaid: 0, outstanding: 0 })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Purchase Report</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Purchase invoices and payment status</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Purchases" value={formatNPR(totals.invoiceAmount)} icon={DollarSign} color="blue" loading={isLoading} />
        <KPICard title="Total VAT Paid" value={formatNPR(totals.vatAmount)} icon={Receipt} loading={isLoading} />
        <KPICard title="Total Paid" value={formatNPR(totals.totalPaid)} icon={CreditCard} color="green" loading={isLoading} />
        <KPICard title="Outstanding" value={formatNPR(totals.outstanding)} icon={AlertTriangle} color={totals.outstanding > 0 ? 'red' : 'default'} loading={isLoading} />
      </div>

      <div className="space-y-3">
        <DataTableToolbar
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          onExportCSV={() => exportToCSV(data, columns, 'purchases.csv')}
        >
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <SupplierFilter value={supplierId} onChange={setSupplierId} />
        </DataTableToolbar>
        <DataTable
          columns={columns}
          data={data}
          loading={isLoading}
          error={error ? 'Failed to load purchase report.' : null}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
        />
      </div>
    </div>
  )
}
