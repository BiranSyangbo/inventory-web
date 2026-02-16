import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function ValueChart({ data, totalValue }) {
  if (!data || data.length === 0) {
    return <div className="text-slate-400">No data available</div>
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h2 className="text-lg font-semibold text-white mb-2">Inventory Value Analysis</h2>
      <p className="text-2xl font-bold text-green-400 mb-4">
        Total Value: ${totalValue?.toFixed(2) || '0.00'}
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(value) => `$${value.toFixed(2)}`}
          />
          <Legend />
          <Bar dataKey="value" fill="#10b981" name="Value ($)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
