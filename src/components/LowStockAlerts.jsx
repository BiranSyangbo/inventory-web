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
      <h2 className="text-lg font-semibold text-white mb-4">Low Stock Alerts</h2>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {alerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`p-4 rounded-lg border ${
              alert.status === 'out-of-stock' 
                ? 'bg-red-900 border-red-700' 
                : 'bg-yellow-900 border-yellow-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${
                  alert.status === 'out-of-stock' 
                    ? 'text-red-200' 
                    : 'text-yellow-200'
                }`}>
                  {alert.name}
                </p>
                <p className={`text-sm ${
                  alert.status === 'out-of-stock' 
                    ? 'text-red-300' 
                    : 'text-yellow-300'
                }`}>
                  {alert.status === 'out-of-stock' 
                    ? 'Out of Stock' 
                    : `Only ${alert.quantity} left (Reorder at ${alert.reorderLevel})`}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                alert.status === 'out-of-stock' 
                  ? 'bg-red-700 text-red-100' 
                  : 'bg-yellow-700 text-yellow-100'
              }`}>
                {alert.status === 'out-of-stock' ? 'Out' : 'Low'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
