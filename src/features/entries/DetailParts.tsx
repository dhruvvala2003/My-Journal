import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/PageHeader'
import { shortDate } from '@/lib/dates'
import { useGoBack } from '@/lib/useGoBack'

export function BackButton({ fallback, label }: { fallback: string; label: string }) {
  const goBack = useGoBack(fallback)
  return (
    <Button variant="ghost" size="sm" onClick={goBack} className="-ml-2 mb-3 text-muted-foreground">
      <ArrowLeftIcon />
      {label}
    </Button>
  )
}

/** A labelled block of text; renders nothing when empty. Keeps line breaks. */
export function TextSection({ title, children }: { title: string; children: string }) {
  if (!children.trim()) return null
  return (
    <section>
      <h2 className="mb-1 text-sm font-medium text-muted-foreground">{title}</h2>
      <p className="whitespace-pre-wrap leading-relaxed">{children}</p>
    </section>
  )
}

export function MetaItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{children}</dd>
    </div>
  )
}

export function LinkedList({
  title,
  base,
  items,
  empty,
  action,
}: {
  title: string
  base: '/learnings' | '/mistakes'
  items: { id: string; title: string; entry_date: string; extra?: ReactNode }[]
  empty: string
  action?: ReactNode
}) {
  return (
    <section className="rounded-xl border p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium">{title}</h2>
        {action}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="divide-y">
          {items.map((i) => (
            <li key={i.id}>
              <Link
                to={`${base}/${i.id}`}
                className="flex items-center justify-between gap-3 py-2 text-sm hover:underline"
              >
                <span className="min-w-0 truncate">{i.title}</span>
                <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                  {i.extra}
                  {shortDate(i.entry_date)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

export function NotFound({ what, back }: { what: string; back: string }) {
  return (
    <EmptyState title={`This ${what} does not exist`}>
      It may have been deleted.{' '}
      <Link to={back} className="underline underline-offset-4">
        Go back
      </Link>
    </EmptyState>
  )
}
