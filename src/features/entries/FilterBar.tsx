import { useState, type ReactNode } from 'react'
import { SearchIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/**
 * Search box + collapsible filter area. Filters start open on desktop
 * and collapsed on phones.
 */
export function FilterBar({
  query,
  onQuery,
  placeholder,
  activeCount,
  onClear,
  children,
}: {
  query: string
  onQuery: (q: string) => void
  placeholder: string
  activeCount: number
  onClear: () => void
  children: ReactNode
}) {
  const [open, setOpen] = useState(
    () => activeCount > 0 || window.matchMedia('(min-width: 768px)').matches,
  )

  return (
    <div className="mb-6 space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-8"
            aria-label="Search"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="shrink-0"
        >
          <SlidersHorizontalIcon />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
        {(activeCount > 0 || query) && (
          <Button variant="ghost" onClick={onClear} className="shrink-0">
            <XIcon />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        )}
      </div>
      <div
        className={cn(
          'grid gap-3 rounded-xl border bg-muted/30 p-3 sm:grid-cols-2 lg:grid-cols-4',
          !open && 'hidden',
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
