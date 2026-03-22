import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import apiClient from '../../lib/apiClient'

export function SupplierFilter({ value, onChange }) {
  const [suppliers, setSuppliers] = useState([])

  useEffect(() => {
    apiClient.get('/api/suppliers').then(r => setSuppliers(r.data || [])).catch(() => {})
  }, [])

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-44 text-sm">
        <SelectValue placeholder="All suppliers" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All suppliers</SelectItem>
        {suppliers.map(s => (
          <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
