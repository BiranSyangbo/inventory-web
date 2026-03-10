import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../lib/apiClient'
import InventoryChart from '../components/InventoryChart'
import CategoryChart from '../components/CategoryChart'
import LowStockAlerts from '../components/LowStockAlerts'
import ValueChart from '../components/ValueChart'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [inventory, setInventory] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [expiring, setExpiring] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [invRes, lowRes, expRes] = await Promise.all([
          apiClient.get('/api/inventory'),
          apiClient.get('/api/inventory/low-stock'),
          apiClient.get('/api/inventory/expiring', { params: { days: 30 } }),
        ])
        setInventory(invRes.data)
        setLowStock(lowRes.data)
        setExpiring(expRes.data)
      } catch (err) {
        console.error(err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const totalValue = inventory.reduce((sum, i) => sum + parseFloat(i.totalValue || 0), 0)
  const categoryCount = new Set(inventory.map(i => i.category).filter(Boolean)).size

  const inventoryChartData = [...inventory]
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 10)
    .map(i => ({ name: i.name, quantity: i.totalQuantity }))

  const categoryMap = {}
  inventory.forEach(i => {
    const cat = i.category || 'Other'
    categoryMap[cat] = (categoryMap[cat] || 0) + 1
  })
  const categoryChartData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }))

  const valueMap = {}
  inventory.forEach(i => {
    const cat = i.category || 'Other'
    valueMap[cat] = (valueMap[cat] || 0) + parseFloat(i.totalValue || 0)
  })
  const valueCategoryData = Object.entries(valueMap).map(([name, value]) => ({ name, value }))

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'NPR' }).format(n)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-slate-400 mt-1">Inventory overview</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/purchases/new')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition">
            + New Purchase
          </button>
          <button onClick={() => navigate('/sales/new')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
            + New Sale
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg text-red-200">{error}</div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Products',    value: inventory.length,    color: 'text-blue-400' },
          { label: 'Total Stock Value', value: fmt(totalValue),      color: 'text-green-400' },
          { label: 'Low Stock Items',   value: lowStock.length,      color: 'text-yellow-400' },
          { label: 'Expiring (30d)',    value: expiring.length,      color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 text-sm font-medium mb-2">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
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
    </div>
  )
}
