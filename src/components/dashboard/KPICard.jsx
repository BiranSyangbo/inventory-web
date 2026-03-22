import { Card, CardContent } from '../ui/card'
import { cn } from '../../lib/utils'
import { Skeleton } from '../ui/skeleton'

export function KPICard({ title, value, subtitle, icon: Icon, color = 'default', loading, onClick }) {
  const colorMap = {
    default: 'text-foreground',
    blue: 'text-blue-400',
    green: 'text-green-400',
    red: 'text-red-400',
    orange: 'text-orange-400',
    yellow: 'text-yellow-400',
  }

  return (
    <Card
      className={cn(
        "transition-all",
        onClick && "cursor-pointer hover:border-primary/50"
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <p className={cn("text-2xl font-bold", colorMap[color])}>{value}</p>
            )}
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {Icon && (
            <div className={cn("p-2 rounded-lg bg-muted", colorMap[color])}>
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
