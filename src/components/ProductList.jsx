export default function ProductList({ products, loading, onEdit, onDelete, onToggleStatus, onView }) {
  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
    </div>
  )

  if (!products.length) return (
    <div className="text-center py-16 text-slate-400">No products found</div>
  )

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-800 border-b border-slate-700 text-slate-300 text-left">
            {['#', 'Name', 'Category', 'Brand', 'Volume', 'Type', 'Alc %', 'MRP', 'Stock', 'Min', 'Selling Price', 'Status', 'Actions'].map(h => (
              <th key={h} className="px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map(p => {
            const isLow = p.currentStock != null && p.currentStock <= p.minStock
            return (
              <tr key={p.id} className={`border-b border-slate-700 hover:bg-slate-800 transition ${isLow ? 'border-l-4 border-l-amber-500' : ''}`}>
                <td className="px-5 py-3 text-slate-400">#{p.id}</td>
                <td className="px-5 py-3 font-medium text-white">{p.name}</td>
                <td className="px-5 py-3 text-slate-300">{p.category || '—'}</td>
                <td className="px-5 py-3 text-slate-300">{p.brand || '—'}</td>
                <td className="px-5 py-3 text-slate-300">{p.volumeMl ? `${p.volumeMl} ml` : '—'}</td>
                <td className="px-5 py-3 text-slate-300">{p.type || '—'}</td>
                <td className="px-5 py-3 text-slate-300">{p.alcoholPercentage ? `${p.alcoholPercentage}%` : '—'}</td>
                <td className="px-5 py-3 text-slate-300">{p.mrp ?? '—'}</td>
                <td className="px-5 py-3 text-center">
                  <span className={isLow ? 'text-amber-400 font-bold' : 'text-white'}>
                    {p.currentStock ?? '—'}
                  </span>
                </td>
                <td className="px-5 py-3 text-center text-slate-300">{p.minStock}</td>
                <td className="px-5 py-3 text-green-400 font-medium">{p.sellingPrice}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.status === 'ACTIVE' ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-400'
                  }`}>{p.status}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => onView(p)} className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded transition">View</button>
                    <button onClick={() => onEdit(p)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition">Edit</button>
                    <button onClick={() => onToggleStatus(p.id)} className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded transition">
                      {p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => onDelete(p.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition">Delete</button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
