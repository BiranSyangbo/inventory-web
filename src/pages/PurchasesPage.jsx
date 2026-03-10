import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import apiClient from '../lib/apiClient'

// ── Purchases List ──────────────────────────────────────────────────────────
function PurchasesList() {
  const [purchases, setPurchases] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterSupplier, setFilterSupplier] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      apiClient.get('/api/purchases').then(r => r.data),
      apiClient.get('/api/suppliers').then(r => r.data),
    ]).then(([p, s]) => { setPurchases(p); setSuppliers(s) })
      .catch(() => toast.error('Failed to load purchases'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = purchases.filter(p => {
    const matchSupplier = !filterSupplier || p.supplierId === parseInt(filterSupplier)
    const matchDate = (!dateFrom || p.purchaseDate >= dateFrom) && (!dateTo || p.purchaseDate <= dateTo)
    const out = parseFloat(p.outstandingAmount || 0)
    const paid = parseFloat(p.totalPaid || 0)
    const status = out <= 0 ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID'
    const matchStatus = !filterStatus || status === filterStatus
    return matchSupplier && matchDate && matchStatus
  })

  const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'NPR' }).format(Number(v || 0))

  const payStatus = (p) => {
    const out = parseFloat(p.outstandingAmount || 0)
    const paid = parseFloat(p.totalPaid || 0)
    if (out <= 0) return <Badge color="green">PAID</Badge>
    if (paid > 0) return <Badge color="amber">PARTIAL</Badge>
    return <Badge color="red">UNPAID</Badge>
  }

  const clearFilters = () => { setFilterSupplier(''); setFilterStatus(''); setDateFrom(''); setDateTo('') }
  const hasFilters = filterSupplier || filterStatus || dateFrom || dateTo

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Purchases</h2>
          <p className="text-slate-400 mt-1">{filtered.length} of {purchases.length} record{purchases.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => navigate('/purchases/new')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
          + New Purchase
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <select value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
          <option value="">All Suppliers</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
          <option value="">All Status</option>
          <option value="PAID">Paid</option>
          <option value="PARTIAL">Partial</option>
          <option value="UNPAID">Unpaid</option>
        </select>
        <div className="flex items-center gap-2">
          <label className="text-slate-400 text-sm">From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
          <label className="text-slate-400 text-sm">To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="px-3 py-2 text-slate-400 hover:text-white text-sm transition">
            ✕ Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>
      ) : !filtered.length ? (
        <div className="text-center py-16 text-slate-400">No purchases found</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700 text-slate-300 text-left">
                {['#', 'Date', 'Supplier', 'VAT Bill #', 'Invoice Amount', 'Paid', 'Outstanding', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-slate-700 hover:bg-slate-800 transition">
                  <td className="px-5 py-3 text-slate-400">#{p.id}</td>
                  <td className="px-5 py-3 text-slate-300">{p.purchaseDate?.slice(0, 10)}</td>
                  <td className="px-5 py-3 font-medium text-white">{p.supplierName}</td>
                  <td className="px-5 py-3 text-slate-300 font-mono text-xs">{p.vatBillNumber || '—'}</td>
                  <td className="px-5 py-3 text-white">{fmt(p.invoiceAmount)}</td>
                  <td className="px-5 py-3 text-green-400">{fmt(p.totalPaid)}</td>
                  <td className="px-5 py-3 text-red-400">{fmt(p.outstandingAmount)}</td>
                  <td className="px-5 py-3">{payStatus(p)}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => navigate(`/purchases/${p.id}`)} className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded transition">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Create Purchase ─────────────────────────────────────────────────────────
function CreatePurchase() {
  const navigate = useNavigate()
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [header, setHeader] = useState({ supplierId: '', vatBillNumber: '', purchaseDate: new Date().toISOString().slice(0, 10), invoiceAmount: '', vatAmount: '0', discount: '0', remarks: '' })
  const [lines, setLines] = useState([newLine()])

  useEffect(() => {
    Promise.all([
      apiClient.get('/api/suppliers/active').then(r => r.data),
      apiClient.get('/api/products').then(r => r.data),
    ]).then(([s, p]) => { setSuppliers(s); setProducts(p) })
      .catch(() => toast.error('Failed to load form data'))
  }, [])

  function newLine() { return { productId: '', purchasePrice: '', quantity: '1', vatPercent: '0', expiryDate: '', location: '' } }

  const addLine = () => setLines(l => [...l, newLine()])
  const removeLine = (i) => setLines(l => l.filter((_, idx) => idx !== i))
  const updateLine = (i, field, val) => setLines(l => l.map((line, idx) => idx === i ? { ...line, [field]: val } : line))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!header.supplierId) { toast.error('Select a supplier'); return }
    if (lines.some(l => !l.productId || !l.purchasePrice || !l.quantity)) { toast.error('Complete all line items'); return }
    setSubmitting(true)
    try {
      const body = {
        supplierId: parseInt(header.supplierId),
        vatBillNumber: header.vatBillNumber || undefined,
        purchaseDate: header.purchaseDate || undefined,
        invoiceAmount: header.invoiceAmount ? parseFloat(header.invoiceAmount) : undefined,
        vatAmount: parseFloat(header.vatAmount) || 0,
        discount: parseFloat(header.discount) || 0,
        remarks: header.remarks || undefined,
        lines: lines.map(l => ({
          productId: parseInt(l.productId),
          purchasePrice: parseFloat(l.purchasePrice),
          quantity: parseInt(l.quantity),
          vatPercent: parseFloat(l.vatPercent) || 0,
          expiryDate: l.expiryDate || undefined,
          location: l.location || undefined,
        }))
      }
      const created = await apiClient.post('/api/purchases', body).then(r => r.data)
      toast.success('Purchase recorded')
      navigate(`/purchases/${created.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create purchase')
    } finally {
      setSubmitting(false)
    }
  }

  const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'NPR' }).format(Number(v || 0))
  const lineTotal = lines.reduce((s, l) => s + (parseFloat(l.purchasePrice) || 0) * (parseInt(l.quantity) || 0), 0)

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/purchases')} className="text-slate-400 hover:text-white transition">← Back</button>
        <h2 className="text-2xl font-bold text-white">New Purchase</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-base font-semibold text-white mb-4">Purchase Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Supplier *</label>
              <select value={header.supplierId} onChange={e => setHeader(h => ({ ...h, supplierId: e.target.value }))} required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                <option value="">Select supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Purchase Date</label>
              <input type="date" value={header.purchaseDate} onChange={e => setHeader(h => ({ ...h, purchaseDate: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">VAT Bill Number</label>
              <input value={header.vatBillNumber} onChange={e => setHeader(h => ({ ...h, vatBillNumber: e.target.value }))} placeholder="Unique bill number"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Invoice Amount</label>
              <input type="number" step="0.01" value={header.invoiceAmount} onChange={e => setHeader(h => ({ ...h, invoiceAmount: e.target.value }))} placeholder="0.00"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">VAT Amount</label>
              <input type="number" step="0.01" value={header.vatAmount} onChange={e => setHeader(h => ({ ...h, vatAmount: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Discount</label>
              <input type="number" step="0.01" value={header.discount} onChange={e => setHeader(h => ({ ...h, discount: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Remarks</label>
              <input value={header.remarks} onChange={e => setHeader(h => ({ ...h, remarks: e.target.value }))} placeholder="Optional notes"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Line Items</h3>
            <button type="button" onClick={addLine} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition">+ Add Item</button>
          </div>
          <div className="space-y-3">
            {lines.map((line, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-3">
                  {i === 0 && <label className="block text-xs text-slate-400 mb-1">Product *</label>}
                  <select value={line.productId} onChange={e => updateLine(i, 'productId', e.target.value)} required
                    className="w-full px-2 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs">
                    <option value="">Select product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}{p.brand ? ` — ${p.brand}` : ''}{p.volumeMl ? ` ${p.volumeMl}ml` : ''}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-xs text-slate-400 mb-1">Purchase Price *</label>}
                  <input type="number" step="0.01" placeholder="0.00" value={line.purchasePrice} onChange={e => updateLine(i, 'purchasePrice', e.target.value)} required
                    className="w-full px-2 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs placeholder-slate-400" />
                </div>
                <div className="col-span-1">
                  {i === 0 && <label className="block text-xs text-slate-400 mb-1">Qty *</label>}
                  <input type="number" min="1" value={line.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)} required
                    className="w-full px-2 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs" />
                </div>
                <div className="col-span-1">
                  {i === 0 && <label className="block text-xs text-slate-400 mb-1">VAT %</label>}
                  <input type="number" step="0.01" value={line.vatPercent} onChange={e => updateLine(i, 'vatPercent', e.target.value)}
                    className="w-full px-2 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-xs text-slate-400 mb-1">Expiry Date</label>}
                  <input type="date" value={line.expiryDate} onChange={e => updateLine(i, 'expiryDate', e.target.value)}
                    className="w-full px-2 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-xs text-slate-400 mb-1">Location</label>}
                  <input placeholder="Optional" value={line.location} onChange={e => updateLine(i, 'location', e.target.value)}
                    className="w-full px-2 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs placeholder-slate-400" />
                </div>
                <div className="col-span-1 flex items-end justify-end">
                  {lines.length > 1 && (
                    <button type="button" onClick={() => removeLine(i)} className="px-2 py-2 text-red-400 hover:text-red-300 text-sm">✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end">
            <span className="text-slate-300 text-sm">Lines Total: <span className="text-white font-bold">{fmt(lineTotal)}</span></span>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={submitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition">
            {submitting ? 'Saving...' : 'Record Purchase'}
          </button>
          <button type="button" onClick={() => navigate('/purchases')}
            className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Purchase Detail ─────────────────────────────────────────────────────────
function PurchaseDetail() {
  const navigate = useNavigate()
  const id = window.location.pathname.split('/').pop()
  const [purchase, setPurchase] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [payment, setPayment] = useState({ amount: '', paymentMethod: 'CASH', referenceNumber: '', notes: '' })
  const [paying, setPaying] = useState(false)

  const fetchAll = () => {
    setLoading(true)
    Promise.all([
      apiClient.get(`/api/purchases/${id}`).then(r => r.data),
      apiClient.get(`/api/purchases/${id}/payments`).then(r => r.data),
    ]).then(([p, pays]) => { setPurchase(p); setPayments(pays) })
      .catch(() => toast.error('Failed to load purchase'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [id])

  const handlePayment = async (e) => {
    e.preventDefault()
    if (!payment.amount || parseFloat(payment.amount) <= 0) { toast.error('Enter a valid amount'); return }
    setPaying(true)
    try {
      await apiClient.post(`/api/purchases/${id}/payments`, {
        amount: parseFloat(payment.amount),
        paymentMethod: payment.paymentMethod,
        referenceNumber: payment.referenceNumber || undefined,
        notes: payment.notes || undefined,
      })
      toast.success('Payment recorded')
      setShowPayment(false)
      setPayment({ amount: '', paymentMethod: 'CASH', referenceNumber: '', notes: '' })
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment')
    } finally {
      setPaying(false)
    }
  }

  const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'NPR' }).format(Number(v || 0))

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>
  if (!purchase) return <div className="p-8 text-slate-400">Purchase not found</div>

  const outstanding = parseFloat(purchase.outstandingAmount || 0)

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/purchases')} className="text-slate-400 hover:text-white transition">← Back</button>
        <h2 className="text-2xl font-bold text-white">Purchase #{purchase.id}</h2>
        {outstanding > 0 && (
          <button onClick={() => setShowPayment(true)} className="ml-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition">
            + Add Payment
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div><p className="text-slate-400">Supplier</p><p className="text-white font-medium">{purchase.supplierName}</p></div>
        <div><p className="text-slate-400">Date</p><p className="text-white">{purchase.purchaseDate?.slice(0, 10)}</p></div>
        <div><p className="text-slate-400">VAT Bill</p><p className="text-white font-mono">{purchase.vatBillNumber || '—'}</p></div>
        <div><p className="text-slate-400">Invoice Amount</p><p className="text-white font-medium">{fmt(purchase.invoiceAmount)}</p></div>
        <div><p className="text-slate-400">VAT Amount</p><p className="text-white">{fmt(purchase.vatAmount)}</p></div>
        <div><p className="text-slate-400">Discount</p><p className="text-white">{fmt(purchase.discount)}</p></div>
        <div><p className="text-slate-400">Total Paid</p><p className="text-green-400 font-medium">{fmt(purchase.totalPaid)}</p></div>
        <div><p className="text-slate-400">Outstanding</p><p className={outstanding > 0 ? 'text-red-400 font-medium' : 'text-green-400'}>{fmt(outstanding)}</p></div>
      </div>

      {/* Line Items */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 mb-5">
        <h3 className="text-base font-semibold text-white mb-3">Items</h3>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-700 text-slate-300 text-left">
            {['Product', 'Batch', 'Qty', 'Purchase Price', 'VAT %', 'Location', 'Expiry'].map(h => <th key={h} className="pb-2 px-2 font-semibold">{h}</th>)}
          </tr></thead>
          <tbody>
            {purchase.lines?.map(l => (
              <tr key={l.id} className="border-b border-slate-700">
                <td className="py-2 px-2 text-white">{l.productName}</td>
                <td className="py-2 px-2 text-slate-300 font-mono text-xs">{l.batchCode}</td>
                <td className="py-2 px-2 text-white text-center">{l.quantity}</td>
                <td className="py-2 px-2 text-green-400">{fmt(l.purchasePrice)}</td>
                <td className="py-2 px-2 text-slate-300 text-center">{l.vatPercent}%</td>
                <td className="py-2 px-2 text-slate-300">{l.location || '—'}</td>
                <td className="py-2 px-2 text-slate-300">{l.expiryDate?.slice(0, 10) || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {purchase.remarks && <p className="text-slate-400 text-sm mb-5">Remarks: <span className="text-slate-300">{purchase.remarks}</span></p>}

      {/* Payment History */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 mb-5">
        <h3 className="text-base font-semibold text-white mb-3">Payment History</h3>
        {!payments.length ? (
          <p className="text-slate-400 text-sm">No payments recorded yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-700 text-slate-300 text-left">
              {['Date', 'Method', 'Reference', 'Amount', 'Notes'].map(h => <th key={h} className="pb-2 px-2 font-semibold">{h}</th>)}
            </tr></thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-b border-slate-700">
                  <td className="py-2 px-2 text-slate-300">{p.paymentDate?.slice(0, 10)}</td>
                  <td className="py-2 px-2">
                    <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">{p.paymentMethod}</span>
                  </td>
                  <td className="py-2 px-2 text-slate-300 font-mono text-xs">{p.referenceNumber || '—'}</td>
                  <td className="py-2 px-2 text-green-400 font-medium">{fmt(p.amount)}</td>
                  <td className="py-2 px-2 text-slate-400">{p.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Add Payment</h3>
            <p className="text-slate-400 text-sm mb-4">Outstanding: <span className="text-red-400 font-medium">{fmt(outstanding)}</span></p>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Amount *</label>
                <input type="number" step="0.01" max={outstanding} value={payment.amount} onChange={e => setPayment(p => ({ ...p, amount: e.target.value }))} required
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Payment Method *</label>
                <select value={payment.paymentMethod} onChange={e => setPayment(p => ({ ...p, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                  <option value="CASH">Cash</option>
                  <option value="ONLINE">Online</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
              {(payment.paymentMethod === 'ONLINE' || payment.paymentMethod === 'CHEQUE') && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Reference Number</label>
                  <input value={payment.referenceNumber} onChange={e => setPayment(p => ({ ...p, referenceNumber: e.target.value }))} placeholder="Txn ID / Cheque no."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
                <input value={payment.notes} onChange={e => setPayment(p => ({ ...p, notes: e.target.value }))} placeholder="Optional"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={paying} className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition">
                  {paying ? 'Saving...' : 'Record Payment'}
                </button>
                <button type="button" onClick={() => setShowPayment(false)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Badge({ color, children }) {
  const colors = { green: 'bg-green-900 text-green-300', amber: 'bg-amber-900 text-amber-300', red: 'bg-red-900 text-red-300' }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>{children}</span>
}

export default function PurchasesPage() {
  return (
    <Routes>
      <Route index element={<PurchasesList />} />
      <Route path="new" element={<CreatePurchase />} />
      <Route path=":id" element={<PurchaseDetail />} />
    </Routes>
  )
}
