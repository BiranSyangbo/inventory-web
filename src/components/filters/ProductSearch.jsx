import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { Input } from '../ui/input'
import apiClient from '../../lib/apiClient'

export function ProductSearch({ onSelect, placeholder = 'Search product...' }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return }
    const timer = setTimeout(() => {
      apiClient.get('/api/products', { params: { search: query } })
        .then(r => setResults(r.data?.content || r.data || []))
        .catch(() => setResults([]))
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          placeholder={placeholder}
          className="pl-8 w-64"
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full z-50 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {results.map(p => (
            <button
              key={p.id}
              onClick={() => { onSelect(p); setQuery(p.name || p.productName); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <div className="font-medium">{p.name || p.productName}</div>
              {p.barcode && <div className="text-xs text-muted-foreground">{p.barcode}</div>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
