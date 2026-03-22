import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../../lib/apiClient'
import { DataTable } from '../../components/datatable/DataTable'
import { DataTableToolbar } from '../../components/datatable/DataTableToolbar'
import { DateRangePicker } from '../../components/filters/DateRangePicker'
import { KPICard } from '../../components/dashboard/KPICard'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs'
import { exportToCSV } from '../../components/datatable/ExportCSVButton'
import { formatNPR, formatDate, getCurrentMonth } from '../../lib/utils'
import { Receipt, TrendingUp, TrendingDown } from 'lucide-react'

const salesCols = [
  { accessorKey: 'saleDate', header: 'Date', cell: ({ getValue }) => formatDate(getValue()) },
  { accessorKey: 'invoiceNumber', header: 'Invoice No.' },
  { accessorKey: 'totalAmount', header: 'Sale Amount', cell: ({ getValue }) => formatNPR(getValue()) },
  { accessorKey: 'vatAmount', header: 'VAT Amount', cell: ({ getValue }) => formatNPR(getValue()) },
]

const purchaseCols = [
  { accessorKey: 'purchaseDate', header: 'Date', cell: ({ getValue }) => formatDate(getValue()) },
  { accessorKey: 'supplierName', header: 'Supplier' },
  { accessorKey: 'vatBillNumber', header: 'VAT Bill No.' },
  { accessorKey: 'invoiceAmount', header: 'Invoice Amount', cell: ({ getValue }) => formatNPR(getValue()) },
  { accessorKey: 'vatAmount', header: 'VAT Amount', cell: ({ getValue }) => formatNPR(getValue()) },
]

export default function VatReportPage() {
  const [dateRange, setDateRange] = useState(getCurrentMonth())
  const [globalFilter, setGlobalFilter] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['vat-report', dateRange],
    queryFn: () => apiClient.get('/api/reports/vat-report', { params: { from: dateRange.from, to: dateRange.to } }).then(r => r.data),
  })

  const summary = data?.summary || {}
  const salesVat = data?.salesVat || []
  const purchaseVat = data?.purchaseVat || []

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">VAT Report</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Input and output VAT summary</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <KPICard title="Purchase VAT (Input)" value={formatNPR(summary.totalPurchaseVat)} icon={TrendingDown} loading={isLoading} />
        <KPICard title="Sales VAT (Output)" value={formatNPR(summary.totalSalesVat)} icon={TrendingUp} loading={isLoading} />
        <KPICard title="Net VAT Liability" value={formatNPR(summary.netVatLiability)} icon={Receipt}
          color={(summary.netVatLiability || 0) > 0 ? 'red' : 'green'} loading={isLoading} />
      </div>

      <div className="flex items-center gap-3">
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Sales VAT</TabsTrigger>
          <TabsTrigger value="purchase">Purchase VAT</TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="space-y-3 mt-4">
          <DataTableToolbar
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            onExportCSV={() => exportToCSV(salesVat, salesCols, 'sales-vat.csv')}
          />
          <DataTable columns={salesCols} data={salesVat} loading={isLoading} error={error ? 'Failed to load VAT data.' : null} globalFilter={globalFilter} onGlobalFilterChange={setGlobalFilter} />
        </TabsContent>
        <TabsContent value="purchase" className="space-y-3 mt-4">
          <DataTableToolbar
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            onExportCSV={() => exportToCSV(purchaseVat, purchaseCols, 'purchase-vat.csv')}
          />
          <DataTable columns={purchaseCols} data={purchaseVat} loading={isLoading} error={error ? 'Failed to load VAT data.' : null} globalFilter={globalFilter} onGlobalFilterChange={setGlobalFilter} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
