import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../../lib/utils'

export function TrendIndicator({ value, suffix = '%' }) {
  if (value === null || value === undefined) return null
  const isPositive = value > 0
  const isNeutral = value === 0

  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 text-xs font-medium",
      isNeutral ? "text-muted-foreground" : isPositive ? "text-green-400" : "text-red-400"
    )}>
      {isNeutral ? <Minus className="h-3 w-3" /> : isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(value)}{suffix}
    </span>
  )
}
