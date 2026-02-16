import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function TrendsChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-slate-400">No data available</div>
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h2 className="text-lg font-semibold text-white mb-4">Stock Movement Trends (30 days)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Legend />
          <Line type="monotone" dataKey="vodka" stroke="#3b82f6" strokeWidth={2} />
          <Line type="monotone" dataKey="whiskey" stroke="#8b5cf6" strokeWidth={2} />
          <Line type="monotone" dataKey="wine" stroke="#ec4899" strokeWidth={2} />
          <Line type="monotone" dataKey="beer" stroke="#f59e0b" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
