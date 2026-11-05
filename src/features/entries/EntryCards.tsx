import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { LightbulbIcon, TriangleAlertIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { RatingDots } from '@/components/common/RatingInput'
import {
  LEARNING_CATEGORIES,
  LEARNING_SOURCES,
  MISTAKE_CATEGORIES,
  MISTAKE_LOCATIONS,
  labelOf,
} from '@/lib/constants'
import { dayHeading, formatTime } from '@/lib/dates'
import type { Learning, Mistake } from '@/lib/types'
import { StatusBadge, TagList } from './EntryBadges'

const cardClass =
  'block rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none'

export function LearningCard({ learning: l }: { learning: Learning }) {
  const source = labelOf(LEARNING_SOURCES, l.source)
  return (
    <Link to={`/learnings/${l.id}`} className={cardClass}>
      <div className="flex items-start gap-3">
        <LightbulbIcon className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <h3 className="font-medium leading-snug">{l.title}</h3>
            <RatingDots value={l.importance} label="Importance" />
          </div>
          {l.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{l.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Badge variant="outline">{labelOf(LEARNING_CATEGORIES, l.category)}</Badge>
            <span>
              {source}
              {l.learned_from && ` · ${l.learned_from}`}
            </span>
            {l.entry_time && <span>· {formatTime(l.entry_time)}</span>}
          </div>
          <TagList tags={l.tags} />
        </div>
      </div>
    </Link>
  )
}

export function MistakeCard({ mistake: m }: { mistake: Mistake }) {
  return (
    <Link to={`/mistakes/${m.id}`} className={cardClass}>
      <div className="flex items-start gap-3">
        <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-red-500" aria-hidden />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <h3 className="font-medium leading-snug">{m.title}</h3>
            <RatingDots value={m.severity} tone="danger" label="Severity" />
          </div>
          {(m.lesson_learned || m.description) && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {m.lesson_learned ? `Lesson: ${m.lesson_learned}` : m.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <StatusBadge status={m.status} />
            <Badge variant="outline">{labelOf(MISTAKE_CATEGORIES, m.category)}</Badge>
            <span>{labelOf(MISTAKE_LOCATIONS, m.location)}</span>
            {m.entry_time && <span>· {formatTime(m.entry_time)}</span>}
          </div>
          <TagList tags={m.tags} />
        </div>
      </div>
    </Link>
  )
}

/** Groups entries (already sorted newest first) under day headings. */
export function Timeline<T extends { id: string; entry_date: string }>({
  items,
  render,
}: {
  items: T[]
  render: (item: T) => ReactNode
}) {
  const groups: { date: string; items: T[] }[] = []
  for (const item of items) {
    const last = groups[groups.length - 1]
    if (last?.date === item.entry_date) last.items.push(item)
    else groups.push({ date: item.entry_date, items: [item] })
  }
  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <section key={g.date}>
          <h2 className="sticky top-14 z-10 -mx-1 mb-2 bg-background/95 px-1 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase backdrop-blur">
            {dayHeading(g.date)}
            <span className="ml-2 font-normal normal-case">
              {g.items.length} {g.items.length === 1 ? 'entry' : 'entries'}
            </span>
          </h2>
          <div className="space-y-2">{g.items.map((i) => <div key={i.id}>{render(i)}</div>)}</div>
        </section>
      ))}
    </div>
  )
}
