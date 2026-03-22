import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { formatDate } from '../../lib/utils'

const presets = [
  { label: 'Today', days: 0 },
  { label: 'Yesterday', days: 1 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'This month', days: -1 },
  { label: 'Last month', days: -2 },
]

function getPresetRange(preset) {
  const today = new Date()
  if (preset.days === 0) {
    const d = today.toISOString().split('T')[0]
    return { from: d, to: d }
  }
  if (preset.days === 1) {
    const d = new Date(today)
    d.setDate(d.getDate() - 1)
    const ds = d.toISOString().split('T')[0]
    return { from: ds, to: ds }
  }
  if (preset.days === -1) {
    const from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
    return { from, to: today.toISOString().split('T')[0] }
  }
  if (preset.days === -2) {
    const from = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0]
    const to = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0]
    return { from, to }
  }
  const from = new Date(today)
  from.setDate(from.getDate() - preset.days)
  return { from: from.toISOString().split('T')[0], to: today.toISOString().split('T')[0] }
}

export function DateRangePicker({ value, onChange }) {
  const [open, setOpen] = useState(false)

  const label = value?.from && value?.to
    ? `${formatDate(value.from)} – ${formatDate(value.to)}`
    : 'Select date range'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <p className="text-sm font-medium">Quick select</p>
          <div className="grid grid-cols-2 gap-2">
            {presets.map(preset => (
              <button
                key={preset.label}
                onClick={() => { onChange(getPresetRange(preset)); setOpen(false) }}
                className="text-xs px-2 py-1.5 rounded border border-border hover:bg-accent text-left transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="border-t border-border pt-3 space-y-2">
            <p className="text-sm font-medium">Custom range</p>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={value?.from || ''}
                onChange={e => onChange({ ...value, from: e.target.value })}
                className="flex-1 h-8 text-xs px-2 rounded border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <span className="text-muted-foreground text-xs">to</span>
              <input
                type="date"
                value={value?.to || ''}
                onChange={e => onChange({ ...value, to: e.target.value })}
                className="flex-1 h-8 text-xs px-2 rounded border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <Button size="sm" className="w-full" onClick={() => setOpen(false)}>Apply</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
