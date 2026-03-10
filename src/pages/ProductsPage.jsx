import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import apiClient from '../lib/apiClient'
import ProductList from '../components/ProductList'
import ProductForm from '../components/ProductForm'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    const headers = ['ID', 'Name', 'Category', 'Brand', 'Volume (ml)', 'Unit', 'Barcode', 'Min Stock', 'Selling Price', 'Status']
    const rows = filtered.map(p => [p.id, p.name, p.category || '', p.brand || '', p.volumeMl || '', p.unit || '', p.barcode || '', p.minStock, p.sellingPrice, p.status])
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
            onEdit={p => { setSelectedProduct(p); setShowForm(true) }}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </>
      )}
    </div>
  )
}
