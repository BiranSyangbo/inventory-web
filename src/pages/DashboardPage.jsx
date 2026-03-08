import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'
import apiClient from '../lib/apiClient'
import InventoryChart from '../components/InventoryChart'
import CategoryChart from '../components/CategoryChart'
import LowStockAlerts from '../components/LowStockAlerts'
import ValueChart from '../components/ValueChart'

export default function DashboardPage({ onLogout, onNavigate }) {
  const { username } = useContext(AuthContext)
  const [inventory, setInventory] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [inventoryRes, lowStockRes] = await Promise.all([
          apiClient.get('/api/inventory'),
          apiClient.get('/api/inventory/low-stock'),
        ])

        setInventory(inventoryRes.data)
        setLowStock(lowStockRes.data)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Derive summary stats from inventory data
  const totalValue = inventory.reduce((sum, item) => sum + parseFloat(item.totalValue || 0), 0)
  const categoryCount = new Set(inventory.map(i => i.category).filter(Boolean)).size

  // Prepare chart data — top 10 products by stock quantity
  const inventoryChartData = [...inventory]
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 10)
    .map(i => ({ name: i.name, quantity: i.totalQuantity }))

  // Category breakdown for pie chart
  const categoryMap = {}
  inventory.forEach(item => {
    const cat = item.category || 'Other'
    categoryMap[cat] = (categoryMap[cat] || 0) + 1
  })
  const categoryChartData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }))

  // Value breakdown by category for value chart
  const valueMap = {}
  inventory.forEach(item => {
    const cat = item.category || 'Other'
    valueMap[cat] = (valueMap[cat] || 0) + parseFloat(item.totalValue || 0)
  })
  const valueCategoryData = Object.entries(valueMap).map(([name, value]) => ({ name, value }))

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Stock Manager</h1>
              <p className="text-slate-400">Inventory Management Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('products')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                Products
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-sm font-medium mb-2">Total Products</p>
            <p className="text-3xl font-bold text-blue-400">{inventory.length}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-sm font-medium mb-2">Total Stock Value</p>
            <p className="text-3xl font-bold text-green-400">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'NPR' }).format(totalValue)}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-sm font-medium mb-2">Low Stock Items</p>
            <p className="text-3xl font-bold text-yellow-400">{lowStock.length}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-sm font-medium mb-2">Categories</p>
            <p className="text-3xl font-bold text-purple-400">{categoryCount}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InventoryChart data={inventoryChartData} />
            <CategoryChart data={categoryChartData} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ValueChart data={valueCategoryData} totalValue={totalValue} />
            <LowStockAlerts alerts={lowStock} />
          </div>
        </div>
      </main>
    </div>
  )
}
