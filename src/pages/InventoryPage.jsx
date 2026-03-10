import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import apiClient from '../lib/apiClient'

export default function InventoryPage() {
  const [inventory, setInventory] = useState([])
  const [expiring, setExpiring] = useState([])
  const [loading, setLoading] = useState(true)
  const [expiringDays, setExpiringDays] = useState(30)
  const [sortField, setSortField] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [tab, setTab] = useState('stock')

  useEffect(() => { fetchAll() }, [])
  useEffect(() => { fetchExpiring() }, [expiringDays])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get('/api/inventory').then(r => r.data)
      setInventory(data)
      await fetchExpiring()
    } catch {
      toast.error('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  const fetchExpiring = async () => {
    try {
      const data = await apiClient.get('/api/inventory/expiring', { params: { days: expiringDays } }).then(r => r.data)
      setExpiring(data)
    } catch {
      toast.error('Failed to load expiring batches')
    }
  }

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const sorted = [...inventory].sort((a, b) => {
    let av = a[sortField], bv = b[sortField]
    if (typeof av === 'string') av = av.toLowerCase()
    if (typeof bv === 'string') bv = bv.toLowerCase()
    if (av == null) return 1
    if (bv == null) return -1
    return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
  })

  const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'NPR' }).format(Number(v))
  const totalValue = inventory.reduce((s, i) => s + parseFloat(i.totalValue || 0), 0)

  const SortTh = ({ field, label }) => (
    <th onClick={() => toggleSort(field)} className="px-5 py-3 font-semibold whitespace-nowrap cursor-pointer select-none hover:text-white">
      {label} {sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </th>
  )

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Inventory</h2>
        <p className="text-slate-400 mt-1">Current stock levels across all products</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Total Products</p>
          <p className="text-2xl font-bold text-blue-400">{inventory.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Total Stock Value</p>
          <p className="text-2xl font-bold text-green-400">{fmt(totalValue)}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Low Stock Items</p>
          <p className="text-2xl font-bold text-amber-400">{inventory.filter(i => i.isLowStock).length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {['stock', 'expiring'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${tab === t ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
            {t === 'stock' ? 'Current Stock' : `Expiring Batches`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" /></div>
      ) : tab === 'stock' ? (
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700 text-slate-300 text-left">
                <SortTh field="name" label="Product" />
                <SortTh field="brand" label="Brand" />
                <SortTh field="category" label="Category" />
                <SortTh field="volumeMl" label="Volume" />
                <SortTh field="totalQuantity" label="Qty" />
                <SortTh field="minStock" label="Min" />
                <SortTh field="averageCost" label="Avg Cost" />
                <SortTh field="sellingPrice" label="Sell Price" />
                <SortTh field="totalValue" label="Total Value" />
              </tr>
            </thead>
            <tbody>
              {sorted.map(i => (
                <tr key={i.productId} className={`border-b border-slate-700 hover:bg-slate-800 transition ${i.isLowStock ? 'border-l-4 border-l-amber-500 bg-amber-950 bg-opacity-30' : ''}`}>
                  <td className="px-5 py-3 font-medium text-white">{i.name}</td>
                  <td className="px-5 py-3 text-slate-300">{i.brand || '—'}</td>
                  <td className="px-5 py-3 text-slate-300">{i.category || '—'}</td>
                  <td className="px-5 py-3 text-slate-300">{i.volumeMl ? `${i.volumeMl} ml` : '—'}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={i.isLowStock ? 'text-amber-400 font-bold' : 'text-white'}>{i.totalQuantity}</span>
                  </td>
                  <td className="px-5 py-3 text-center text-slate-300">{i.minStock}</td>
                  <td className="px-5 py-3 text-slate-300">{fmt(i.averageCost)}</td>
                  <td className="px-5 py-3 text-green-400">{fmt(i.sellingPrice)}</td>
                  <td className="px-5 py-3 text-blue-400 font-medium">{fmt(i.totalValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4">
            <label className="text-slate-300 text-sm">Within next</label>
            <input type="number" min={1} max={365} value={expiringDays}
              onChange={e => setExpiringDays(Number(e.target.value))}
              className="w-20 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
            />
            <label className="text-slate-300 text-sm">days</label>
          </div>
          {!expiring.length ? (
            <div className="text-center py-16 text-slate-400">No expiring batches in this period</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800 border-b border-slate-700 text-slate-300 text-left">
                    {['Product', 'Brand', 'Batch', 'Expiry Date', 'Qty', 'Location', 'Status'].map(h => (
                      <th key={h} className="px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {expiring.map(b => (
                    <tr key={b.id} className={`border-b border-slate-700 transition ${b.status === 'expired' ? 'bg-red-950 bg-opacity-40' : 'bg-amber-950 bg-opacity-20'}`}>
                      <td className="px-5 py-3 font-medium text-white">{b.productName}</td>
                      <td className="px-5 py-3 text-slate-300">{b.productBrand || '—'}</td>
                      <td className="px-5 py-3 text-slate-300 font-mono text-xs">{b.batchCode}</td>
                      <td className="px-5 py-3">
                        <span className={b.status === 'expired' ? 'text-red-400' : 'text-amber-400'}>{b.expiryDate}</span>
                      </td>
                      <td className="px-5 py-3 text-center text-white">{b.currentQuantity}</td>
                      <td className="px-5 py-3 text-slate-300">{b.location || '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          b.status === 'expired' ? 'bg-red-900 text-red-300' : 'bg-amber-900 text-amber-300'
                        }`}>{b.status.replace('_', ' ')}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
