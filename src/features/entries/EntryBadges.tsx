import { Badge } from '@/components/ui/badge'
import { MISTAKE_STATUSES, labelOf, type MistakeStatus } from '@/lib/constants'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<MistakeStatus, string> = {
  unresolved: 'bg-red-500/12 text-red-700 dark:text-red-400',
  learning: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  resolved: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  repeated: 'bg-violet-500/15 text-violet-700 dark:text-violet-400',
}

export function StatusBadge({ status, className }: { status: MistakeStatus; className?: string }) {
  return (
    <Badge variant="secondary" className={cn(STATUS_STYLES[status], className)}>
      {labelOf(MISTAKE_STATUSES, status)}
    </Badge>
  )
}

export function TagList({ tags }: { tags: string[] }) {
  if (!tags.length) return null
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <span key={t} className="text-xs text-muted-foreground">
          #{t}
        </span>
      ))}
    </div>
  )
}
