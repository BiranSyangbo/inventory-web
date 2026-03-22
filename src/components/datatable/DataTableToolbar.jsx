import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Search, Download } from 'lucide-react'

export function DataTableToolbar({ globalFilter, onGlobalFilterChange, onExportCSV, children }) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-3 flex-wrap flex-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={globalFilter ?? ''}
            onChange={e => onGlobalFilterChange(e.target.value)}
            className="pl-8 w-60"
          />
        </div>
        {children}
      </div>
      {onExportCSV && (
        <Button variant="outline" size="sm" onClick={onExportCSV}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      )}
    </div>
  )
}
