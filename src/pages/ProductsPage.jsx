import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import apiClient from '../lib/apiClient'
import ProductList from '../components/ProductList'
import ProductForm from '../components/ProductForm'

function ProductDetailModal({ product: p, onClose }) {
  const isLow = p.currentStock != null && p.currentStock <= p.minStock

  const field = (label, value) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">{label}</span>
      <span className="text-sm text-white">{value ?? '—'}</span>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-white">{p.name}</h2>
            {p.brand && <p className="text-sm text-slate-400 mt-0.5">{p.brand}</p>}
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              p.status === 'ACTIVE' ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-400'
            }`}>{p.status}</span>
            <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">&times;</button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Stock row */}
          <div className={`flex items-center justify-between rounded-lg px-4 py-3 ${isLow ? 'bg-amber-900/30 border border-amber-700' : 'bg-slate-700/50'}`}>
            <div className="text-center">
              <p className={`text-2xl font-bold ${isLow ? 'text-amber-400' : 'text-white'}`}>{p.currentStock ?? '—'}</p>
              <p className="text-xs text-slate-400 mt-0.5">Current Stock</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-300">{p.minStock}</p>
              <p className="text-xs text-slate-400 mt-0.5">Min Stock</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{p.sellingPrice}</p>
              <p className="text-xs text-slate-400 mt-0.5">Selling Price</p>
            </div>
            {p.mrp != null && (
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-300">{p.mrp}</p>
                <p className="text-xs text-slate-400 mt-0.5">MRP</p>
              </div>
            )}
          </div>
          {isLow && <p className="text-xs text-amber-400 -mt-2">⚠ Stock is at or below minimum level</p>}

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4">
            {field('Category', p.category)}
            {field('Volume', p.volumeMl ? `${p.volumeMl} ml` : null)}
            {field('Type', p.type)}
            {field('Alcohol %', p.alcoholPercentage ? `${p.alcoholPercentage}%` : null)}
            {field('Unit', p.unit)}
            {field('Barcode', p.barcode)}
            {field('Avg Cost', p.averageCost)}
            {field('Created', p.createdAt ? new Date(p.createdAt).toLocaleDateString() : null)}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [viewProduct, setViewProduct] = useState(null)

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get('/api/products').then(r => r.data)
      setProducts(data)
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]

  const filtered = products.filter(p => {
    const term = searchTerm.toLowerCase()
    const matchSearch = p.name?.toLowerCase().includes(term)
      || p.brand?.toLowerCase().includes(term)
      || p.barcode?.toLowerCase().includes(term)
    const matchCat = !filterCategory || p.category === filterCategory
    const matchStatus = !filterStatus || p.status === filterStatus
    return matchSearch && matchCat && matchStatus
  })

  const handleSave = async (data) => {
    setIsSubmitting(true)
    try {
      if (selectedProduct) {
        const updated = await apiClient.put(`/api/products/${selectedProduct.id}`, data).then(r => r.data)
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p))
        toast.success(`"${updated.name}" updated`)
      } else {
        const created = await apiClient.post('/api/products', data).then(r => r.data)
        setProducts(prev => [...prev, created])
        toast.success(`"${created.name}" created`)
      }
      setShowForm(false)
      setSelectedProduct(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const name = products.find(p => p.id === id)?.name || 'product'
    if (!window.confirm(`Delete "${name}"?`)) return
    try {
      await apiClient.delete(`/api/products/${id}`)
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success(`"${name}" deleted`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    }
  }

  const handleToggleStatus = async (id) => {
    try {
      await apiClient.patch(`/api/products/${id}/toggle-status`)
      await fetchProducts()
      toast.success('Status updated')
    } catch {
      toast.error('Failed to toggle status')
    }
  }

  const handleExportCSV = () => {
    if (!filtered.length) { toast.error('No products to export'); return }
    const headers = ['ID', 'Name', 'Category', 'Brand', 'Volume (ml)', 'Type', 'Alcohol %', 'MRP', 'Unit', 'Barcode', 'Min Stock', 'Selling Price', 'Status']
    const rows = filtered.map(p => [p.id, p.name, p.category || '', p.brand || '', p.volumeMl || '', p.type || '', p.alcoholPercentage || '', p.mrp ?? '', p.unit || '', p.barcode || '', p.minStock, p.sellingPrice, p.status])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    Object.assign(document.createElement('a'), { href: url, download: 'products.csv' }).click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Products</h2>
          <p className="text-slate-400 mt-1">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        {!showForm && (
          <div className="flex gap-3">
            <button onClick={handleExportCSV} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition">
              Export CSV
            </button>
            <button onClick={() => { setSelectedProduct(null); setShowForm(true) }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
              + Add Product
            </button>
          </div>
        )}
      </div>

      {showForm ? (
        <ProductForm
          product={selectedProduct}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setSelectedProduct(null) }}
          isLoading={isSubmitting}
        />
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <input
              type="text"
              placeholder="Search name, brand, barcode..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 text-sm w-64"
            />
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <ProductList
            products={filtered}
            loading={loading}
            onView={p => setViewProduct(p)}
            onEdit={p => { setSelectedProduct(p); setShowForm(true) }}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />

          {viewProduct && (
            <ProductDetailModal product={viewProduct} onClose={() => setViewProduct(null)} />
          )}
        </>
      )}
    </div>
  )
}
