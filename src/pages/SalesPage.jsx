import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import apiClient from '../lib/apiClient'

// ── Sales List ──────────────────────────────────────────────────────────────
function SalesList() {
  const [sales, setSales] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCustomer, setFilterCustomer] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      apiClient.get('/api/sales').then(r => r.data),
      apiClient.get('/api/customers').then(r => r.data),
    ]).then(([s, c]) => { setSales(s); setCustomers(c) })
      .catch(() => toast.error('Failed to load sales'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = sales.filter(s => {
    const matchStatus = !filterStatus || s.paymentStatus === filterStatus
    const matchCustomer = !filterCustomer || s.customerId === parseInt(filterCustomer)
    const dateStr = s.saleDate?.slice(0, 10)
    const matchDate = (!dateFrom || dateStr >= dateFrom) && (!dateTo || dateStr <= dateTo)
    return matchStatus && matchCustomer && matchDate
  })

  const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'NPR' }).format(Number(v || 0))
  const clearFilters = () => { setFilterStatus(''); setFilterCustomer(''); setDateFrom(''); setDateTo('') }
  const hasFilters = filterStatus || filterCustomer || dateFrom || dateTo

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Sales</h2>
          <p className="text-slate-400 mt-1">{filtered.length} of {sales.length} record{sales.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => navigate('/sales/new')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
          + New Sale
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
          <option value="">All Status</option>
          <option value="PAID">Paid</option>
          <option value="PARTIAL">Partial</option>
          <option value="CREDIT">Credit</option>
        </select>
        <select value={filterCustomer} onChange={e => setFilterCustomer(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
          <option value="">All Customers</option>
          <option value="-1">Walk-in</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
          <button onClick={clearFilters} className="px-3 py-2 text-slate-400 hover:text-white text-sm transition">✕ Clear</button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>
      ) : !filtered.length ? (
        <div className="text-center py-16 text-slate-400">No sales yet</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700 text-slate-300 text-left">
                {['Invoice', 'Date', 'Customer', 'Total', 'Paid', 'Outstanding', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-slate-700 hover:bg-slate-800 transition">
                  <td className="px-5 py-3 font-mono text-blue-400 text-xs">{s.invoiceNumber}</td>
                  <td className="px-5 py-3 text-slate-300">{s.saleDate?.slice(0, 10)}</td>
                  <td className="px-5 py-3 text-white">{s.customerName || <span className="text-slate-500">Walk-in</span>}</td>
                  <td className="px-5 py-3 text-white">{fmt(s.totalAmount)}</td>
                  <td className="px-5 py-3 text-green-400">{fmt(s.totalPaid)}</td>
                  <td className="px-5 py-3 text-red-400">{fmt(s.outstandingAmount)}</td>
                  <td className="px-5 py-3"><StatusBadge status={s.paymentStatus} /></td>
                  <td className="px-5 py-3">
                    <button onClick={() => navigate(`/sales/${s.id}`)} className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded transition">View</button>
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

// ── Create Sale ─────────────────────────────────────────────────────────────
function CreateSale() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [header, setHeader] = useState({ customerId: '', paymentStatus: 'PAID', discount: '0', vatAmount: '0', notes: '' })
  const [items, setItems] = useState([newItem()])
  const [priceTemplate, setPriceTemplate] = useState({})

  useEffect(() => {
    Promise.all([
      apiClient.get('/api/customers').then(r => r.data),
      apiClient.get('/api/products?excludeQuantityZero=true').then(r => r.data),
    ]).then(([c, p]) => { setCustomers(c); setProducts(p) })
      .catch(() => toast.error('Failed to load form data'))
  }, [])

  // Load price template when customer changes
  useEffect(() => {
    if (header.customerId) {
      apiClient.get(`/api/customers/${header.customerId}/price-template`)
        .then(r => {
          const map = {}
          r.data.forEach(t => { map[t.productId] = t.sellingPrice })
          setPriceTemplate(map)
        })
        .catch(() => setPriceTemplate({}))
    } else {
      setPriceTemplate({})
    }
  }, [header.customerId])

  function newItem() { return { productId: '', unitPrice: '', quantity: '1' } }

  const addItem = () => setItems(it => [...it, newItem()])
  const removeItem = (i) => setItems(it => it.filter((_, idx) => idx !== i))
  const updateItem = (i, field, val) => setItems(it => it.map((item, idx) => {
    if (idx !== i) return item
    const updated = { ...item, [field]: val }
    // Auto-fill price when product is selected
    if (field === 'productId' && val) {
      const product = products.find(p => p.id === parseInt(val))
      updated.unitPrice = priceTemplate[parseInt(val)] || product?.sellingPrice || ''
    }
    return updated
  }))

  const selectedCustomer = customers.find(c => c.id === parseInt(header.customerId))
  const canCredit = selectedCustomer && parseFloat(selectedCustomer.creditLimit) > 0
  const paymentOptions = header.customerId && canCredit
    ? ['PAID', 'PARTIAL', 'CREDIT']
    : ['PAID', 'PARTIAL']

  const subtotal = items.reduce((s, i) => s + (parseFloat(i.unitPrice) || 0) * (parseInt(i.quantity) || 0), 0)
  const total = subtotal - (parseFloat(header.discount) || 0) + (parseFloat(header.vatAmount) || 0)
  const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'NPR' }).format(Number(v || 0))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (items.some(i => !i.productId || !i.unitPrice || !i.quantity)) { toast.error('Complete all line items'); return }
    setSubmitting(true)
    try {
      const body = {
        customerId: header.customerId ? parseInt(header.customerId) : undefined,
        paymentStatus: header.paymentStatus,
        discount: parseFloat(header.discount) || 0,
        vatAmount: parseFloat(header.vatAmount) || 0,
        notes: header.notes || undefined,
        items: items.map(i => ({
          productId: parseInt(i.productId),
          quantity: parseInt(i.quantity),
          unitPrice: parseFloat(i.unitPrice),
        }))
      }
      const created = await apiClient.post('/api/sales', body).then(r => r.data)
      toast.success(`Sale ${created.invoiceNumber} recorded`)
      navigate(`/sales/${created.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create sale')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/sales')} className="text-slate-400 hover:text-white transition">← Back</button>
        <h2 className="text-2xl font-bold text-white">New Sale</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-base font-semibold text-white mb-4">Sale Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Customer <span className="text-slate-500">(optional)</span></label>
              <select value={header.customerId} onChange={e => setHeader(h => ({ ...h, customerId: e.target.value, paymentStatus: 'PAID' }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                <option value="">Walk-in customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.phone ? ` (${c.phone})` : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Payment Status</label>
              <select value={header.paymentStatus} onChange={e => setHeader(h => ({ ...h, paymentStatus: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                {paymentOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Discount</label>
              <input type="number" step="0.01" value={header.discount} onChange={e => setHeader(h => ({ ...h, discount: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">VAT Amount</label>
              <input type="number" step="0.01" value={header.vatAmount} onChange={e => setHeader(h => ({ ...h, vatAmount: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
              <input value={header.notes} onChange={e => setHeader(h => ({ ...h, notes: e.target.value }))} placeholder="Optional"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400" />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Items</h3>
            <button type="button" onClick={addItem} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition">+ Add Item</button>
          </div>
          <div className="space-y-3">
            {items.map((item, i) => {
              const product = products.find(p => p.id === parseInt(item.productId))
              const lineTotal = (parseFloat(item.unitPrice) || 0) * (parseInt(item.quantity) || 0)
              return (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    {i === 0 && <label className="block text-xs text-slate-400 mb-1">Product *</label>}
                    <select value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)} required
                      className="w-full px-2 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs">
                      <option value="">Select product</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}{p.brand ? ` — ${p.brand}` : ''}{p.volumeMl ? ` ${p.volumeMl}ml` : ''}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    {i === 0 && <label className="block text-xs text-slate-400 mb-1">Unit Price *</label>}
                    <input type="number" step="0.01" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)} required placeholder={product?.sellingPrice || '0.00'}
                      className="w-full px-2 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs placeholder-slate-400" />
                  </div>
                  <div className="col-span-2">
                    {i === 0 && <label className="block text-xs text-slate-400 mb-1">Qty *</label>}
                    <input type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} required
                      className="w-full px-2 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs" />
                  </div>
                  <div className="col-span-2 flex items-end">
                    <span className="text-green-400 text-xs pb-2">{fmt(lineTotal)}</span>
                  </div>
                  <div className="col-span-1 flex items-end justify-end">
                    {items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="px-2 py-2 text-red-400 hover:text-red-300 text-sm">✕</button>}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700 space-y-1 text-sm text-right">
            <p className="text-slate-400">Subtotal: <span className="text-white">{fmt(subtotal)}</span></p>
            {parseFloat(header.discount) > 0 && <p className="text-slate-400">Discount: <span className="text-red-400">-{fmt(header.discount)}</span></p>}
            {parseFloat(header.vatAmount) > 0 && <p className="text-slate-400">VAT: <span className="text-white">+{fmt(header.vatAmount)}</span></p>}
            <p className="text-base font-bold text-white">Total: {fmt(total)}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={submitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition">
            {submitting ? 'Saving...' : 'Record Sale'}
          </button>
          <button type="button" onClick={() => navigate('/sales')}
            className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Sale Detail / Invoice ───────────────────────────────────────────────────
function SaleDetail() {
  const navigate = useNavigate()
  const id = window.location.pathname.split('/').pop()
  const [sale, setSale] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [payment, setPayment] = useState({ amount: '', paymentMethod: 'CASH', referenceNumber: '', notes: '' })
  const [paying, setPaying] = useState(false)

  const fetchSale = () => {
    setLoading(true)
    Promise.all([
      apiClient.get(`/api/sales/${id}`).then(r => r.data),
      apiClient.get(`/api/sales/${id}/payments`).then(r => r.data),
    ]).then(([s, pays]) => { setSale(s); setPayments(pays) })
      .catch(() => toast.error('Failed to load sale'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSale() }, [id])

  const handlePayment = async (e) => {
    e.preventDefault()
    if (!payment.amount || parseFloat(payment.amount) <= 0) { toast.error('Enter a valid amount'); return }
    setPaying(true)
    try {
      await apiClient.post(`/api/sales/${id}/payments`, {
        amount: parseFloat(payment.amount),
        paymentMethod: payment.paymentMethod,
        referenceNumber: payment.referenceNumber || undefined,
        notes: payment.notes || undefined,
      })
      toast.success('Payment recorded')
      setShowPayment(false)
      setPayment({ amount: '', paymentMethod: 'CASH', referenceNumber: '', notes: '' })
      fetchSale()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment')
    } finally {
      setPaying(false)
    }
  }

  const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'NPR' }).format(Number(v || 0))

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>
  if (!sale) return <div className="p-8 text-slate-400">Sale not found</div>

  const outstanding = parseFloat(sale.outstandingAmount || 0)

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6 print:hidden">
        <button onClick={() => navigate('/sales')} className="text-slate-400 hover:text-white transition">← Back</button>
        <h2 className="text-2xl font-bold text-white">Sale Detail</h2>
        <div className="ml-auto flex gap-2">
          {outstanding > 0 && <button onClick={() => setShowPayment(true)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition">+ Payment</button>}
          <button onClick={() => window.print()} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition">Print Invoice</button>
        </div>
      </div>

      {/* Invoice */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 print:bg-white print:border-gray-200 print:text-gray-800">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-xl font-bold text-white print:text-gray-900">Stock Manager</h1>
            <p className="text-slate-400 print:text-gray-500 text-sm mt-1">Liquor Shop</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-400 print:text-blue-700">{sale.invoiceNumber}</p>
            <p className="text-slate-400 text-sm">{sale.saleDate?.slice(0, 10)}</p>
            <StatusBadge status={sale.paymentStatus} />
          </div>
        </div>

        {sale.customerName && <p className="text-slate-300 text-sm mb-4">Customer: <span className="text-white font-medium">{sale.customerName}</span></p>}

        {/* Line items */}
        <table className="w-full text-sm mb-4">
          <thead><tr className="border-b border-slate-700 text-slate-300 text-left">
            {['Product', 'Batch', 'Qty', 'Unit Price', 'Total', 'Profit'].map(h => <th key={h} className="pb-2 px-1 font-semibold">{h}</th>)}
          </tr></thead>
          <tbody>
            {sale.lines?.map(l => (
              <tr key={l.id} className="border-b border-slate-700">
                <td className="py-2 px-1 text-white">{l.productName}</td>
                <td className="py-2 px-1 text-slate-300 font-mono text-xs">{l.batchCode}</td>
                <td className="py-2 px-1 text-white text-center">{l.quantity}</td>
                <td className="py-2 px-1 text-slate-300">{fmt(l.unitPrice)}</td>
                <td className="py-2 px-1 text-green-400">{fmt(l.lineTotal)}</td>
                <td className="py-2 px-1 text-blue-400">{fmt(l.profit)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-48 space-y-1 text-sm">
            <div className="flex justify-between text-slate-300"><span>Subtotal</span><span>{fmt(sale.totalAmount)}</span></div>
            {parseFloat(sale.discount) > 0 && <div className="flex justify-between text-red-400"><span>Discount</span><span>-{fmt(sale.discount)}</span></div>}
            {parseFloat(sale.vatAmount) > 0 && <div className="flex justify-between text-slate-300"><span>VAT</span><span>+{fmt(sale.vatAmount)}</span></div>}
            <div className="flex justify-between font-bold text-white border-t border-slate-700 pt-1"><span>Grand Total</span><span>{fmt(parseFloat(sale.totalAmount) - parseFloat(sale.discount) + parseFloat(sale.vatAmount))}</span></div>
            <div className="flex justify-between text-green-400"><span>Paid</span><span>{fmt(sale.totalPaid)}</span></div>
            {outstanding > 0 && <div className="flex justify-between text-red-400"><span>Outstanding</span><span>{fmt(outstanding)}</span></div>}
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 mt-5 print:hidden">
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

// ── Helpers ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = { PAID: 'bg-green-900 text-green-300', PARTIAL: 'bg-amber-900 text-amber-300', CREDIT: 'bg-red-900 text-red-300' }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-700 text-slate-300'}`}>{status}</span>
}

export default function SalesPage() {
  return (
    <Routes>
      <Route index element={<SalesList />} />
      <Route path="new" element={<CreateSale />} />
      <Route path=":id" element={<SaleDetail />} />
    </Routes>
  )
}
