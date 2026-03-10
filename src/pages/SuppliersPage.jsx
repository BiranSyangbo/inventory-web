import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import apiClient from '../lib/apiClient'

const EMPTY = { name: '', contactPerson: '', phone: '', address: '', vatPanNumber: '', status: 'ACTIVE' }

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchSuppliers() }, [])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get('/api/suppliers').then(r => r.data)
      setSuppliers(data)
    } catch {
      toast.error('Failed to load suppliers')
    } finally {
      setLoading(false)
    }
  }

  const filtered = filterStatus ? suppliers.filter(s => s.status === filterStatus) : suppliers

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true) }
  const openEdit = (s) => {
    setEditing(s)
    setForm({ name: s.name, contactPerson: s.contactPerson || '', phone: s.phone || '', address: s.address || '', vatPanNumber: s.vatPanNumber || '', status: s.status })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setSubmitting(true)
    try {
      const body = { ...form, contactPerson: form.contactPerson || undefined, phone: form.phone || undefined, address: form.address || undefined, vatPanNumber: form.vatPanNumber || undefined }
      if (editing) {
        const updated = await apiClient.put(`/api/suppliers/${editing.id}`, body).then(r => r.data)
        setSuppliers(prev => prev.map(s => s.id === updated.id ? updated : s))
        toast.success(`"${updated.name}" updated`)
      } else {
        const created = await apiClient.post('/api/suppliers', body).then(r => r.data)
        setSuppliers(prev => [...prev, created])
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
    const name = suppliers.find(s => s.id === id)?.name || 'supplier'
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await apiClient.delete(`/api/suppliers/${id}`)
      setSuppliers(prev => prev.filter(s => s.id !== id))
      toast.success(`"${name}" deleted`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Suppliers</h2>
          <p className="text-slate-400 mt-1">{filtered.length} supplier{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
          + Add Supplier
        </button>
      </div>

      {/* Filter */}
      <div className="mb-5">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>
      ) : !filtered.length ? (
        <div className="text-center py-16 text-slate-400">No suppliers found</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700 text-slate-300 text-left">
                {['#', 'Name', 'Contact Person', 'Phone', 'VAT/PAN', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-slate-700 hover:bg-slate-800 transition">
                  <td className="px-5 py-3 text-slate-400">#{s.id}</td>
                  <td className="px-5 py-3 font-medium text-white">{s.name}</td>
                  <td className="px-5 py-3 text-slate-300">{s.contactPerson || '—'}</td>
                  <td className="px-5 py-3 text-slate-300">{s.phone || '—'}</td>
                  <td className="px-5 py-3 text-slate-300">{s.vatPanNumber || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.status === 'ACTIVE' ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-400'
                    }`}>{s.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(s)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition">Edit</button>
                      <button onClick={() => handleDelete(s.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold text-white mb-5">{editing ? 'Edit Supplier' : 'Add Supplier'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Name *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Supplier name" required />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Contact Person" value={form.contactPerson} onChange={v => setForm(f => ({ ...f, contactPerson: v }))} placeholder="Full name" />
                <Field label="Phone" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="+977..." />
              </div>
              <Field label="Address" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} placeholder="Address" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="VAT/PAN Number" value={form.vatPanNumber} onChange={v => setForm(f => ({ ...f, vatPanNumber: v }))} placeholder="Optional" />
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
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
    </div>
  )
}

function Field({ label, value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
      <input
        value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500"
      />
    </div>
  )
}
