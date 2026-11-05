import { cn } from '@/lib/utils'

interface RatingInputProps {
  value: number | null
  onChange: (value: number | null) => void
  max?: number
  /** labels[n] describes rating n (index 0 unused). */
  labels?: string[]
  /** Allow clicking the selected value again to clear it. */
  clearable?: boolean
  tone?: 'default' | 'danger'
  'aria-label'?: string
}

/** Row of numbered buttons (1..max). Works with keyboard and touch. */
export function RatingInput({
  value,
  onChange,
  max = 5,
  labels,
  clearable,
  tone = 'default',
  'aria-label': ariaLabel,
}: RatingInputProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div role="radiogroup" aria-label={ariaLabel} className="flex gap-1">
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
          const active = value !== null && n <= value
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              title={labels?.[n]}
              onClick={() => onChange(clearable && value === n ? null : n)}
              className={cn(
                'size-8 rounded-md border text-sm font-medium tabular-nums transition-colors',
                'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                active
                  ? tone === 'danger'
                    ? 'border-transparent bg-destructive text-white'
                    : 'border-transparent bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-muted',
              )}
            >
              {n}
            </button>
          )
        })}
      </div>
      {value !== null && labels?.[value] && (
        <span className="text-sm text-muted-foreground">{labels[value]}</span>
      )}
    </div>
  )
}

/** Compact read-only display: ●●●○○ */
export function RatingDots({
  value,
  max = 5,
  tone = 'default',
  label,
}: {
  value: number
  max?: number
  tone?: 'default' | 'danger'
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-0.5" title={`${label}: ${value}/${max}`}>
      <span className="sr-only">{`${label}: ${value} of ${max}`}</span>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            'size-1.5 rounded-full',
            i < value
              ? tone === 'danger'
                ? 'bg-destructive'
                : 'bg-foreground/70'
              : 'bg-foreground/15',
          )}
        />
      ))}
    </span>
  )
}
