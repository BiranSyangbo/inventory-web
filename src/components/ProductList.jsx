export default function ProductList({ products, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading products...</p>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 text-lg">No products found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-800 border-b border-slate-700">
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">ID</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Category</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Brand</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Volume</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Current Stock</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Min Stock</th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Unit Price</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Value</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const totalValue = (product.currentStock * product.unitPrice).toFixed(2)
            const isLowStock = product.currentStock <= product.minStock
            
            return (
              <tr
                key={product.id}
                className={`border-b border-slate-700 hover:bg-slate-800 transition ${
                  isLowStock ? 'bg-red-900 bg-opacity-20' : ''
                }`}
              >
                <td className="px-6 py-4 text-sm text-slate-300">#{product.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-white">{product.name}</td>
                <td className="px-6 py-4 text-sm text-slate-300">{product.category}</td>
                <td className="px-6 py-4 text-sm text-slate-300">{product.brand}</td>
                <td className="px-6 py-4 text-sm text-slate-300">
                  {product.volumeMl ? `${product.volumeMl}ml` : 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-center">
                  <span className={isLowStock ? 'text-red-400 font-bold' : 'text-white'}>
                    {product.currentStock}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-center text-slate-300">{product.minStock}</td>
                <td className="px-6 py-4 text-sm text-right text-green-400 font-medium">
                  ${product.unit}
                </td>
                <td className="px-6 py-4 text-sm text-right text-blue-400 font-medium">${totalValue}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => onEdit(product)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition"
                    >
                      Delete
                    </button>
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
