export default function LowStockAlerts({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4">Low Stock Alerts</h2>
        <div className="text-center py-8">
          <p className="text-green-400 text-lg font-medium">All items are in good stock!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h2 className="text-lg font-semibold text-white mb-4">
        Low Stock Alerts <span className="text-amber-400 text-sm font-normal">({alerts.length})</span>
      </h2>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {alerts.map((item) => {
          const isOut = item.totalQuantity === 0
          return (
            <div
              key={item.productId}
              className={`p-4 rounded-lg border ${
                isOut ? 'bg-red-900 border-red-700' : 'bg-yellow-900 border-yellow-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${isOut ? 'text-red-200' : 'text-yellow-200'}`}>
                    {item.name}{item.brand ? ` — ${item.brand}` : ''}
                  </p>
                  <p className={`text-sm ${isOut ? 'text-red-300' : 'text-yellow-300'}`}>
                    {isOut
                      ? 'Out of stock'
                      : `${item.totalQuantity} left (min: ${item.minStock})`}
                    {item.volumeMl ? ` · ${item.volumeMl} ml` : ''}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isOut ? 'bg-red-700 text-red-100' : 'bg-yellow-700 text-yellow-100'
                }`}>
                  {isOut ? 'Out' : 'Low'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
