import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import apiClient from '../lib/apiClient'

const EMPTY = { name: '', phone: '', address: '', creditLimit: '0' }

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [statementCustomer, setStatementCustomer] = useState(null)
  const [statement, setStatement] = useState(null)
  const [statementLoading, setStatementLoading] = useState(false)
  // Price template
  const [templateCustomer, setTemplateCustomer] = useState(null)
  const [templateEntries, setTemplateEntries] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [templateLoading, setTemplateLoading] = useState(false)
  const [newEntry, setNewEntry] = useState({ productId: '', sellingPrice: '' })
  const [savingEntry, setSavingEntry] = useState(false)

  useEffect(() => {
    fetchCustomers()
    apiClient.get('/api/products').then(r => setAllProducts(r.data)).catch(() => {})
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get('/api/customers').then(r => r.data)
      setCustomers(data)
    } catch {
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  )

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true) }
  const openEdit = (c) => {
    setEditing(c)
    setForm({ name: c.name, phone: c.phone || '', address: c.address || '', creditLimit: c.creditLimit?.toString() || '0' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setSubmitting(true)
    try {
      const body = { name: form.name.trim(), phone: form.phone || undefined, address: form.address || undefined, creditLimit: parseFloat(form.creditLimit) || 0 }
      if (editing) {
        const updated = await apiClient.put(`/api/customers/${editing.id}`, body).then(r => r.data)
        setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c))
        toast.success(`"${updated.name}" updated`)
      } else {
        const created = await apiClient.post('/api/customers', body).then(r => r.data)
        setCustomers(prev => [...prev, created])
        toast.success(`"${created.name}" created`)
      }
      setShowModal(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const name = customers.find(c => c.id === id)?.name || 'customer'
    if (!window.confirm(`Delete "${name}"?`)) return
    try {
      await apiClient.delete(`/api/customers/${id}`)
      setCustomers(prev => prev.filter(c => c.id !== id))
      toast.success(`"${name}" deleted`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    }
  }

  const openTemplate = async (c) => {
    setTemplateCustomer(c)
    setTemplateLoading(true)
    setTemplateEntries([])
    setNewEntry({ productId: '', sellingPrice: '' })
    try {
      const data = await apiClient.get(`/api/customers/${c.id}/price-template`).then(r => r.data)
      setTemplateEntries(data)
    } catch {
      toast.error('Failed to load price template')
    } finally {
      setTemplateLoading(false)
    }
  }

  const handleAddTemplateEntry = async (e) => {
    e.preventDefault()
    if (!newEntry.productId || !newEntry.sellingPrice) { toast.error('Select product and enter price'); return }
    setSavingEntry(true)
    try {
      const saved = await apiClient.post(`/api/customers/${templateCustomer.id}/price-template`, {
        productId: parseInt(newEntry.productId),
        sellingPrice: parseFloat(newEntry.sellingPrice),
      }).then(r => r.data)
      setTemplateEntries(prev => {
        const exists = prev.findIndex(e => e.productId === saved.productId)
        return exists >= 0 ? prev.map((e, i) => i === exists ? saved : e) : [...prev, saved]
      })
      setNewEntry({ productId: '', sellingPrice: '' })
      toast.success('Price saved')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save price')
    } finally {
      setSavingEntry(false)
    }
  }

  const handleDeleteTemplateEntry = async (productId) => {
    try {
      await apiClient.delete(`/api/customers/${templateCustomer.id}/price-template/${productId}`)
      setTemplateEntries(prev => prev.filter(e => e.productId !== productId))
      toast.success('Entry removed')
    } catch {
      toast.error('Failed to remove entry')
    }
  }

  const openStatement = async (c) => {
    setStatementCustomer(c)
    setStatementLoading(true)
    setStatement(null)
    try {
      const data = await apiClient.get(`/api/customers/${c.id}/statement`).then(r => r.data)
      setStatement(data)
    } catch {
      toast.error('Failed to load statement')
    } finally {
      setStatementLoading(false)
    }
  }

  const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'NPR' }).format(Number(v || 0))

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Customers</h2>
          <p className="text-slate-400 mt-1">{filtered.length} customer{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
          + Add Customer
        </button>
      </div>

      <div className="mb-5">
        <input type="text" placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 text-sm w-72" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>
      ) : !filtered.length ? (
        <div className="text-center py-16 text-slate-400">No customers found</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700 text-slate-300 text-left">
                {['#', 'Name', 'Phone', 'Credit Limit', 'Outstanding Balance', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const outstanding = parseFloat(c.outstandingBalance || 0)
                const creditLimit = parseFloat(c.creditLimit || 0)
                return (
                  <tr key={c.id} className="border-b border-slate-700 hover:bg-slate-800 transition">
                    <td className="px-5 py-3 text-slate-400">#{c.id}</td>
                    <td className="px-5 py-3 font-medium text-white">{c.name}</td>
                    <td className="px-5 py-3 text-slate-300">{c.phone || '—'}</td>
                    <td className="px-5 py-3 text-slate-300">
                      {creditLimit === 0
                        ? <span className="px-2 py-0.5 bg-slate-700 text-slate-400 rounded-full text-xs">Walk-in</span>
                        : fmt(c.creditLimit)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        outstanding > 0 ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'
                      }`}>
                        {outstanding > 0 ? fmt(c.outstandingBalance) : 'Paid'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(c)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition">Edit</button>
                        <button onClick={() => openTemplate(c)} className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition">Pricing</button>
                        <button onClick={() => openStatement(c)} className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded transition">Statement</button>
                        <button onClick={() => handleDelete(c.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition">Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-5">{editing ? 'Edit Customer' : 'Add Customer'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Name *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Customer name" required />
              <Field label="Phone" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="+977..." />
              <Field label="Address" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} placeholder="Address" />
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Credit Limit <span className="text-slate-500">(0 = walk-in)</span></label>
                <input type="number" min="0" step="0.01" value={form.creditLimit} onChange={e => setForm(f => ({ ...f, creditLimit: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition">
                  {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Price Template Modal */}
      {templateCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-white">{templateCustomer.name} — Custom Prices</h3>
              <button onClick={() => setTemplateCustomer(null)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition">Close</button>
            </div>
            <p className="text-slate-400 text-sm mb-4">Set custom selling prices for this customer. Leave blank to use standard price.</p>

            {/* Add new entry */}
            <form onSubmit={handleAddTemplateEntry} className="flex gap-3 mb-5 items-end">
              <div className="flex-1">
                <label className="block text-xs text-slate-400 mb-1">Product</label>
                <select value={newEntry.productId} onChange={e => {
                  const prod = allProducts.find(p => p.id === parseInt(e.target.value))
                  setNewEntry(n => ({ ...n, productId: e.target.value, sellingPrice: prod?.sellingPrice || '' }))
                }} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                  <option value="">Select product</option>
                  {allProducts.filter(p => p.status === 'ACTIVE').map(p => (
                    <option key={p.id} value={p.id}>{p.name}{p.brand ? ` — ${p.brand}` : ''}{p.volumeMl ? ` ${p.volumeMl}ml` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="w-36">
                <label className="block text-xs text-slate-400 mb-1">Custom Price *</label>
                <input type="number" step="0.01" value={newEntry.sellingPrice} onChange={e => setNewEntry(n => ({ ...n, sellingPrice: e.target.value }))}
                  placeholder="0.00" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400" />
              </div>
              <button type="submit" disabled={savingEntry}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition whitespace-nowrap">
                {savingEntry ? 'Saving...' : '+ Add / Update'}
              </button>
            </form>

            {/* Existing entries */}
            {templateLoading ? (
              <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" /></div>
            ) : !templateEntries.length ? (
              <p className="text-slate-400 text-sm text-center py-6">No custom prices set. All products use standard price.</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-700 text-slate-300 text-left">
                  {['Product', 'Standard Price', 'Custom Price', ''].map(h => <th key={h} className="pb-2 px-2 font-semibold">{h}</th>)}
                </tr></thead>
                <tbody>
                  {templateEntries.map(e => (
                    <tr key={e.id} className="border-b border-slate-700">
                      <td className="py-2.5 px-2 text-white">
                        {e.productName}{e.productBrand ? ` — ${e.productBrand}` : ''}{e.productVolumeMl ? ` ${e.productVolumeMl}ml` : ''}
                      </td>
                      <td className="py-2.5 px-2 text-slate-400">{fmt(e.standardPrice)}</td>
                      <td className="py-2.5 px-2 text-purple-400 font-medium">{fmt(e.sellingPrice)}</td>
                      <td className="py-2.5 px-2 text-right">
                        <button onClick={() => handleDeleteTemplateEntry(e.productId)}
                          className="px-2 py-1 text-red-400 hover:text-red-300 text-xs transition">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Statement Modal */}
      {statementCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-white">{statementCustomer.name} — Statement</h3>
                {statement && (
                  <p className="text-slate-400 text-sm mt-1">
                    Outstanding: <span className="text-red-400 font-medium">{fmt(statement.outstandingBalance)}</span>
                    {' · '}Credit Limit: <span className="text-slate-300">{parseFloat(statement.creditLimit) === 0 ? 'Walk-in' : fmt(statement.creditLimit)}</span>
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition print:hidden">Print</button>
                <button onClick={() => { setStatementCustomer(null); setStatement(null) }}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition">Close</button>
              </div>
            </div>

            {statementLoading ? (
              <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>
            ) : !statement?.entries?.length ? (
              <p className="text-center py-10 text-slate-400">No transactions found</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-300 text-left">
                    {['Date', 'Type', 'Reference', 'Debit', 'Credit', 'Balance'].map(h => (
                      <th key={h} className="py-3 px-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {statement.entries.map((e, i) => (
                    <tr key={i} className="border-b border-slate-700 hover:bg-slate-700 transition">
                      <td className="py-2.5 px-3 text-slate-300">{e.date?.slice(0, 10)}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${e.type === 'SALE' ? 'bg-blue-900 text-blue-300' : 'bg-green-900 text-green-300'}`}>{e.type}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-mono text-xs">{e.reference}</td>
                      <td className="py-2.5 px-3 text-red-400">{e.debit ? fmt(e.debit) : '—'}</td>
                      <td className="py-2.5 px-3 text-green-400">{e.credit ? fmt(e.credit) : '—'}</td>
                      <td className="py-2.5 px-3 font-medium text-white">{fmt(e.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500" />
    </div>
  )
}
