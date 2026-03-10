import { useState, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import apiClient from '../lib/apiClient'

const ENTITIES = [
  {
    key: 'products',
    label: 'Products',
    description: 'Import product master data',
    color: 'blue',
    columns: ['name*', 'brand', 'category', 'volume_ml', 'type', 'mrp', 'alcoholPercentage', 'min_stock', 'selling_price*', 'status'],
    example: 'Royal Stag,Seagram,Whiskey,750,Bottle,RS-750,5,520.00,ACTIVE',
  },
  {
    key: 'customers',
    label: 'Customers',
    description: 'Import customer master data',
    color: 'green',
    columns: ['name*', 'phone', 'address', 'credit_limit'],
    example: 'Singh Wines,9841000001,Kathmandu,50000',
  },
  {
    key: 'purchases',
    label: 'Purchases',
    description: 'Import purchase history with stock',
    color: 'amber',
    columns: ['supplier_name*', 'vat_bill_number', 'purchase_date', 'invoice_amount', 'vat_amount', 'discount', 'remarks', 'product_barcode*', 'quantity*', 'purchase_price*', 'vat_percent', 'expiry_date'],
    example: 'ABC Distributors,BILL-001,2026-01-15,5000.00,500.00,0,,RS-750,10,450.00,13,',
  },
  {
    key: 'sales',
    label: 'Sales',
    description: 'Import sales history with FIFO allocation',
    color: 'purple',
    columns: ['invoice_number', 'sale_date', 'customer_name', 'payment_status', 'discount', 'vat_amount', 'notes', 'product_barcode*', 'quantity*', 'unit_price'],
    example: 'INV-2026-00001,2026-01-20,Singh Wines,CREDIT,0,0,,RS-750,5,520.00',
  },
]

const COLOR_MAP = {
  blue:   { tab: 'bg-blue-600',   ring: 'ring-blue-500',   badge: 'bg-blue-900 text-blue-300',   icon: 'text-blue-400' },
  green:  { tab: 'bg-green-600',  ring: 'ring-green-500',  badge: 'bg-green-900 text-green-300',  icon: 'text-green-400' },
  amber:  { tab: 'bg-amber-600',  ring: 'ring-amber-500',  badge: 'bg-amber-900 text-amber-300',  icon: 'text-amber-400' },
  purple: { tab: 'bg-purple-600', ring: 'ring-purple-500', badge: 'bg-purple-900 text-purple-300', icon: 'text-purple-400' },
}

export default function ImportPage() {
  const [entity, setEntity] = useState('products')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [showColumns, setShowColumns] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)

  const selected = ENTITIES.find(e => e.key === entity)
  const colors = COLOR_MAP[selected.color]

  const resetFile = () => { setFile(null); setResult(null) }

  const handleEntityChange = (key) => {
    setEntity(key)
    resetFile()
    setShowColumns(false)
  }

  const handleFile = (f) => {
    if (!f) return
    const ext = f.name.split('.').pop().toLowerCase()
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      toast.error('Only .csv, .xlsx, or .xls files are accepted')
      return
    }
    setFile(f)
    setResult(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setResult(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await apiClient.post(`/api/import/${entity}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data)
      if (data.failureCount === 0) {
        toast.success(`${data.successCount} ${selected.label.toLowerCase()} imported successfully`)
      } else {
        toast.error(`${data.failureCount} row(s) failed — see error table below`)
      }
    } catch {
      toast.error('Upload failed. Check the file format and try again.')
    } finally {
      setLoading(false)
    }
  }

  const fmtBytes = (bytes) => bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Bulk Import</h2>
        <p className="text-slate-400 mt-1">Upload CSV or Excel files to import data in bulk</p>
      </div>

      {/* Entity tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {ENTITIES.map(ent => {
          const c = COLOR_MAP[ent.color]
          const active = entity === ent.key
          return (
            <button
              key={ent.key}
              onClick={() => handleEntityChange(ent.key)}
              className={`relative flex flex-col items-start gap-1 p-4 rounded-xl border text-left transition-all ${
                active
                  ? `${c.tab} border-transparent text-white shadow-lg`
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600'
              }`}
            >
              <span className="text-sm font-semibold">{ent.label}</span>
              <span className={`text-xs ${active ? 'text-white/70' : 'text-slate-500'}`}>{ent.description}</span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Upload card */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Upload size={15} className={colors.icon} />
              Upload File
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition ${
                  dragOver
                    ? `border-blue-500 bg-blue-950/30`
                    : file
                    ? 'border-green-600 bg-green-950/20'
                    : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/30'
                }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={e => handleFile(e.target.files?.[0])}
                />
                {file ? (
                  <>
                    <CheckCircle size={32} className="text-green-400" />
                    <div className="text-center">
                      <p className="text-white font-medium text-sm">{file.name}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{fmtBytes(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); resetFile() }}
                      className="text-xs text-red-400 hover:text-red-300 underline"
                    >
                      Remove file
                    </button>
                  </>
                ) : (
                  <>
                    <div className={`p-3 rounded-full bg-slate-700`}>
                      <Upload size={20} className="text-slate-300" />
                    </div>
                    <div className="text-center">
                      <p className="text-slate-300 text-sm font-medium">Drop file here or click to browse</p>
                      <p className="text-slate-500 text-xs mt-1">Accepts .csv, .xlsx, .xls</p>
                    </div>
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={!file || loading}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold text-white transition disabled:opacity-40 disabled:cursor-not-allowed ${colors.tab} hover:opacity-90 flex items-center justify-center gap-2`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Upload size={15} />
                    Import {selected.label}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Result panel */}
          {result && <ResultPanel result={result} label={selected.label} />}
        </div>

        {/* Right: Guide card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <FileText size={15} className={colors.icon} />
              Format Guide
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-2">
                  Row 1 must be a <span className="text-slate-200 font-medium">header row</span>. Columns are positional — names are ignored.
                  Fields marked <span className="text-red-400">*</span> are required.
                </p>
              </div>

              {/* Column list toggle */}
              <button
                onClick={() => setShowColumns(v => !v)}
                className="flex items-center justify-between w-full text-xs font-medium text-slate-300 bg-slate-700 rounded-lg px-3 py-2 hover:bg-slate-600 transition"
              >
                <span>Column layout ({selected.columns.length} columns)</span>
                {showColumns ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>

              {showColumns && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selected.columns.map((col, i) => {
                    const required = col.endsWith('*')
                    const name = required ? col.slice(0, -1) : col
                    return (
                      <span key={i} className={`px-2 py-0.5 rounded text-xs font-mono ${
                        required
                          ? `${colors.badge} ring-1 ring-inset ring-current/20`
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {i + 1}. {name}{required && <span className="text-red-400 ml-0.5">*</span>}
                      </span>
                    )
                  })}
                </div>
              )}

              {/* Example row */}
              <div>
                <p className="text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Example row</p>
                <div className="bg-slate-900 rounded-lg p-3 text-xs font-mono text-slate-300 break-all leading-relaxed border border-slate-700">
                  {selected.example}
                </div>
              </div>

              {/* Tips */}
              <div className="space-y-1.5 pt-1">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Tips</p>
                {[
                  'Dates: YYYY-MM-DD (safest format)',
                  'Decimals: use dot separator (e.g. 520.00)',
                  'Leave optional cells blank — not "null"',
                  entity === 'purchases' && 'Rows with same vat_bill_number = one invoice',
                  entity === 'sales' && 'Rows with same invoice_number = one sale',
                  entity === 'purchases' && 'Suppliers must exist before importing',
                  entity === 'sales' && 'Products and customers must exist first',
                ].filter(Boolean).map((tip, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-slate-400">
                    <span className="text-slate-600 mt-0.5">•</span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Info card */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-slate-400 space-y-1.5">
                <p className="text-amber-300 font-medium">Partial success is normal</p>
                <p>Failed rows are skipped — the rest are still processed. Always review the error table after import.</p>
                {(entity === 'purchases' || entity === 'sales') && (
                  <p className="text-slate-300">Stock side-effects are <strong className="text-white">immediate</strong> — purchases update average cost and increase stock; sales run FIFO batch allocation.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ResultPanel({ result, label }) {
  const allOk = result.failureCount === 0
  const hasErrors = result.errors?.length > 0

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-white">{label} Import Result</h3>
        {allOk
          ? <span className="flex items-center gap-1.5 text-xs font-medium text-green-400"><CheckCircle size={13} /> All rows succeeded</span>
          : <span className="flex items-center gap-1.5 text-xs font-medium text-red-400"><XCircle size={13} /> {result.failureCount} row(s) failed</span>
        }
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 divide-x divide-slate-700">
        {[
          { label: 'Total Rows', value: result.totalRows, color: 'text-white' },
          { label: 'Succeeded', value: result.successCount, color: 'text-green-400' },
          { label: 'Failed', value: result.failureCount, color: result.failureCount > 0 ? 'text-red-400' : 'text-slate-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center justify-center py-4">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Error table */}
      {hasErrors && (
        <div className="border-t border-slate-700">
          <div className="px-5 py-3 bg-red-950/30">
            <p className="text-xs font-semibold text-red-400 uppercase tracking-wide">Row Errors</p>
          </div>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-800">
                <tr className="border-b border-slate-700 text-slate-400 text-left text-xs">
                  <th className="px-5 py-2.5 font-semibold w-20">Row</th>
                  <th className="px-5 py-2.5 font-semibold">Error Message</th>
                </tr>
              </thead>
              <tbody>
                {result.errors.map((err, i) => (
                  <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="px-5 py-2.5 font-mono text-slate-400 text-xs">{err.row}</td>
                    <td className="px-5 py-2.5 text-red-300 text-xs">{err.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {allOk && (
        <div className="px-5 py-3 border-t border-slate-700 bg-green-950/20">
          <p className="text-xs text-green-400 flex items-center gap-1.5">
            <CheckCircle size={13} />
            All {result.successCount} rows were imported successfully.
          </p>
        </div>
      )}
    </div>
  )
}
