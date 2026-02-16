import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../App'
import InventoryChart from '../components/InventoryChart'
import TrendsChart from '../components/TrendsChart'
import CategoryChart from '../components/CategoryChart'
import LowStockAlerts from '../components/LowStockAlerts'
import ValueChart from '../components/ValueChart'

export default function DashboardPage({ onLogout }) {
  const { user, token } = useContext(AuthContext)
  const [inventory, setInventory] = useState([])
  const [trends, setTrends] = useState([])
  const [categories, setCategories] = useState([])
  const [alerts, setAlerts] = useState([])
  const [valueData, setValueData] = useState({ totalValue: 0, categories: [] })
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }

        // Fetch all data in parallel
        const [inventoryRes, trendsRes, categoriesRes, alertsRes, valueRes, summaryRes] = await Promise.all([
          axios.get(`${apiUrl}/stocks/inventory`, { headers }),
          axios.get(`${apiUrl}/stocks/history`, { headers }),
          axios.get(`${apiUrl}/stocks/categories`, { headers }),
          axios.get(`${apiUrl}/stocks/alerts`, { headers }),
          axios.get(`${apiUrl}/stocks/value`, { headers }),
          axios.get(`${apiUrl}/stocks/summary`, { headers })
        ])

        setInventory(inventoryRes.data)
        setTrends(trendsRes.data)
        setCategories(categoriesRes.data)
        setAlerts(alertsRes.data)
        setValueData(valueRes.data)
        setSummary(summaryRes.data)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchData()
    }
  }, [token, apiUrl])

  const handleLogoutClick = () => {
    onLogout()
  }

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
              <div className="text-right">
                <p className="text-sm text-slate-400">Logged in as</p>
                <p className="text-white font-medium">{user?.name || user?.username}</p>
              </div>
              <button
                onClick={handleLogoutClick}
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
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 text-sm font-medium mb-2">Total Items</p>
              <p className="text-3xl font-bold text-blue-400">{summary.totalItems}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 text-sm font-medium mb-2">Total Value</p>
              <p className="text-3xl font-bold text-green-400">${summary.totalValue.toFixed(2)}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 text-sm font-medium mb-2">Low Stock Items</p>
              <p className="text-3xl font-bold text-yellow-400">{summary.lowStockCount}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-400 text-sm font-medium mb-2">Categories</p>
              <p className="text-3xl font-bold text-purple-400">{summary.categoryCount}</p>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="space-y-6">
          {/* Row 1: Inventory and Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InventoryChart data={inventory} />
            <TrendsChart data={trends} />
          </div>

          {/* Row 2: Category and Value */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryChart data={categories} />
            <ValueChart data={valueData.categories} totalValue={valueData.totalValue} />
          </div>

          {/* Row 3: Low Stock Alerts */}
          <div>
            <LowStockAlerts alerts={alerts} />
          </div>
        </div>
      </main>
    </div>
  )
}
