import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../App'
import ProductList from '../components/ProductList'
import ProductForm from '../components/ProductForm'

export default function ProductsPage({ onLogout, onNavigate }) {
  const { user, token } = useContext(AuthContext)
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

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

  // Fetch products
  useEffect(() => {
    fetchProducts()
  }, [token])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const headers = { Authorization: `Bearer ${token}` }
      const res = await axios.get(`${apiUrl}/products`, { headers })
      setProducts(res.data)
      extractFilterOptions(res.data)
    } catch (err) {
      setError('Failed to load products')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const extractFilterOptions = (productList) => {
    const uniqueCategories = [...new Set(productList.map(p => p.category).filter(Boolean))]
    const uniqueBrands = [...new Set(productList.map(p => p.brand).filter(Boolean))]
    setCategories(uniqueCategories)
    setBrands(uniqueBrands)
  }

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.brand.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) return
    
    try {
      setIsLoading(true)
      setError(null)
      const headers = { Authorization: `Bearer ${token}` }
      const response = await axios.delete(`${apiUrl}/products/${productId}`, { headers })
      
      if (response.data.success) {
        setProducts(products.filter(p => p.id !== productId))
        setSuccessMessage(`Product "${productName}" deleted successfully`)
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError(response.data.message || 'Failed to delete product')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete product'
      setError(`Error: ${errorMessage}`)
      console.error('[v0] Delete error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProduct = async (productData) => {
    try {
      setIsLoading(true)
      setError(null)
      const headers = { Authorization: `Bearer ${token}` }
      const isUpdate = !!selectedProduct
      const operationType = isUpdate ? 'updated' : 'created'
      
      if (isUpdate) {
        // Update
        const res = await axios.put(`${apiUrl}/products/${selectedProduct.id}`, productData, { headers })
        
        if (res.data.success) {
          setProducts(products.map(p => p.id === selectedProduct.id ? res.data.data : p))
          setSuccessMessage(`Product "${productData.name}" ${operationType} successfully`)
          setTimeout(() => setSuccessMessage(null), 3000)
        } else {
          setError(res.data.message || 'Failed to update product')
          return
        }
      } else {
        // Create
        const res = await axios.post(`${apiUrl}/products`, productData, { headers })
        
        if (res.data.success) {
          setProducts([...products, res.data.data])
          setSuccessMessage(`Product "${productData.name}" ${operationType} successfully`)
          setTimeout(() => setSuccessMessage(null), 3000)
        } else {
          setError(res.data.message || 'Failed to create product')
          return
        }
      }
      
      setShowForm(false)
      setSelectedProduct(null)
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save product'
      setError(`Error: ${errorMessage}`)
      console.error('[v0] Save error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      alert('No products to export')
      return
    }

    const headers = ['ID', 'Name', 'Category', 'Brand', 'Volume (ml)', 'Unit', 'Min Stock', 'Current Stock', 'Unit Price']
    const rows = filteredProducts.map(p => [
      p.id,
      p.name,
      p.category,
      p.brand,
      p.volumeMl || '',
      p.unit,
      p.minStock,
      p.currentStock,
      p.unit
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

  const handleImportCSV = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const csv = event.target.result
        const lines = csv.split('\n')
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue
          
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
          const productData = {
            name: values[1],
            category: values[2],
            brand: values[3],
            volumeMl: values[4] ? parseInt(values[4]) : null,
            unit: values[5],
            minStock: parseInt(values[7]) || 0,
            currentStock: parseInt(values[8]) || 0,
            unitPrice: parseFloat(values[9]) || 0
          }

          const axiosHeaders = { Authorization: `Bearer ${token}` }
          await axios.post(`${apiUrl}/products`, productData, { headers: axiosHeaders })
        }

        fetchProducts()
        alert('Products imported successfully')
      } catch (err) {
        setError('Failed to import CSV')
        console.error(err)
      }
    }
    reader.readAsText(file)
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
                <p className="text-white font-medium">{user?.name || user?.username}</p>
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
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition mb-2"
              >
                Export CSV
              </button>
              <label className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition text-center cursor-pointer block">
                Import CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                />
              </label>
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
              <p className="text-slate-400 text-sm">Total Value: <span className="text-green-400 font-bold">${filteredProducts.reduce((sum, p) => sum + (p.currentStock * p.unit), 0).toFixed(2)}</span></p>
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
