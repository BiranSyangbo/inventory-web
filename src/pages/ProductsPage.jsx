import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'
import apiClient from '../lib/apiClient'
import ProductList from '../components/ProductList'
import ProductForm from '../components/ProductForm'

export default function ProductsPage({ onLogout, onNavigate }) {
  const { username } = useContext(AuthContext)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterBrand, setFilterBrand] = useState('')
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [successMessage, setSuccessMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.get('/api/products').then(r => r.data)
      setProducts(data)
      const uniqueCategories = [...new Set(data.map(p => p.category).filter(Boolean))]
      const uniqueBrands = [...new Set(data.map(p => p.brand).filter(Boolean))]
      setCategories(uniqueCategories)
      setBrands(uniqueBrands)
    } catch (err) {
      setError('Failed to load products')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p => {
    const name = p.name?.toLowerCase() || ''
    const brand = p.brand?.toLowerCase() || ''
    const barcode = p.barcode?.toLowerCase() || ''
    const term = searchTerm.toLowerCase()
    const matchesSearch = name.includes(term) || brand.includes(term) || barcode.includes(term)
    const matchesCategory = !filterCategory || p.category === filterCategory
    const matchesBrand = !filterBrand || p.brand === filterBrand
    return matchesSearch && matchesCategory && matchesBrand
  })

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setShowForm(true)
  }

  const handleEditProduct = (product) => {
    setSelectedProduct(product)
    setShowForm(true)
  }

  const handleDeleteProduct = async (productId) => {
    const productName = products.find(p => p.id === productId)?.name || 'this product'
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) return

    try {
      setIsLoading(true)
      setError(null)
      await apiClient.delete(`/api/products/${productId}`)
      setProducts(products.filter(p => p.id !== productId))
      setSuccessMessage(`Product "${productName}" deleted successfully`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProduct = async (productData) => {
    try {
      setIsLoading(true)
      setError(null)
      const isUpdate = !!selectedProduct

      if (isUpdate) {
        const updated = await apiClient.put(`/api/products/${selectedProduct.id}`, productData).then(r => r.data)
        setProducts(products.map(p => p.id === selectedProduct.id ? updated : p))
        setSuccessMessage(`Product "${productData.name}" updated successfully`)
      } else {
        const created = await apiClient.post('/api/products', productData).then(r => r.data)
        setProducts([...products, created])
        setSuccessMessage(`Product "${productData.name}" created successfully`)
      }

      setTimeout(() => setSuccessMessage(null), 3000)
      setShowForm(false)
      setSelectedProduct(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      alert('No products to export')
      return
    }

    const headers = ['ID', 'Name', 'Category', 'Brand', 'Volume (ml)', 'Unit', 'Barcode', 'Min Stock', 'Selling Price', 'Status']
    const rows = filteredProducts.map(p => [
      p.id,
      p.name,
      p.category || '',
      p.brand || '',
      p.volumeMl || '',
      p.unit || '',
      p.barcode || '',
      p.minStock,
      p.sellingPrice,
      p.status
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Products Manager</h1>
              <p className="text-slate-400">Manage your inventory products</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition"
              >
                Dashboard
              </button>
              <div className="text-right">
                <p className="text-sm text-slate-400">Logged in as</p>
                <p className="text-white font-medium">{username}</p>
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-800 border-r border-slate-700 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Actions */}
            <div>
              <h3 className="text-slate-300 text-sm font-semibold mb-3 uppercase tracking-wider">Actions</h3>
              <button
                onClick={handleAddProduct}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition mb-2"
              >
                Add Product
              </button>
              <button
                onClick={handleExportCSV}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
              >
                Export CSV
              </button>
            </div>

            {/* Search */}
            <div>
              <h3 className="text-slate-300 text-sm font-semibold mb-3 uppercase tracking-wider">Search</h3>
              <input
                type="text"
                placeholder="Search by name, brand, barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm"
              />
            </div>

            {/* Filters */}
            <div>
              <h3 className="text-slate-300 text-sm font-semibold mb-3 uppercase tracking-wider">Filters</h3>

              <div className="mb-4">
                <label className="text-slate-400 text-sm font-medium block mb-2">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm font-medium block mb-2">Brand</label>
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                >
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stats */}
            <div className="border-t border-slate-700 pt-4">
              <p className="text-slate-400 text-sm">Total Products: <span className="text-white font-bold">{filteredProducts.length}</span></p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg text-red-200 flex items-start justify-between">
                <div>
                  <p className="font-semibold">Error</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-sm underline hover:no-underline ml-4">Dismiss</button>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 bg-green-900 border border-green-700 rounded-lg text-green-200 flex items-start justify-between">
                <div>
                  <p className="font-semibold">Success</p>
                  <p className="text-sm mt-1">{successMessage}</p>
                </div>
                <button onClick={() => setSuccessMessage(null)} className="text-sm underline hover:no-underline ml-4">Dismiss</button>
              </div>
            )}

            {showForm ? (
              <ProductForm
                product={selectedProduct}
                onSave={handleSaveProduct}
                onCancel={() => {
                  setShowForm(false)
                  setSelectedProduct(null)
                }}
                isLoading={isLoading}
              />
            ) : (
              <ProductList
                products={filteredProducts}
                loading={loading}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
