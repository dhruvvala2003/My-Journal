import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { format, startOfMonth, startOfWeek } from 'date-fns'
import {
  CalendarCheckIcon,
  CalendarRangeIcon,
  LightbulbIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { RatingDots } from '@/components/common/RatingInput'
import { supabase } from '@/lib/supabase'
import { todayISO } from '@/lib/dates'
import type { Learning, Mistake } from '@/lib/types'
import { unwrap } from '@/features/entries/api'
import { StatusBadge } from '@/features/entries/EntryBadges'
import { LEARNING_COLUMNS } from '@/features/learnings/api'
import { MISTAKE_COLUMNS } from '@/features/mistakes/api'
import { useSettings } from '@/features/settings/api'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

async function count(table: 'learnings' | 'mistakes', fromDate: string) {
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .gte('entry_date', fromDate)
  if (error) throw new Error(error.message)
  return count ?? 0
}

function useDashboard(weekStartsOn: 0 | 1) {
  const today = todayISO()
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn }), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  return useQuery({
    queryKey: ['dashboard', today, weekStartsOn],
    queryFn: async () => {
      const [todayL, todayM, open, weekL, weekM, monthL, monthM] = await Promise.all([
        supabase.from('learnings').select(LEARNING_COLUMNS).eq('entry_date', today).order('entry_time', { ascending: false, nullsFirst: false }),
        supabase.from('mistakes').select(MISTAKE_COLUMNS).eq('entry_date', today).order('entry_time', { ascending: false, nullsFirst: false }),
        supabase
          .from('mistakes')
          .select(MISTAKE_COLUMNS, { count: 'exact' })
          .in('status', ['unresolved', 'learning'])
          .order('severity', { ascending: false })
          .order('entry_date', { ascending: false })
          .limit(5),
        count('learnings', weekStart),
        count('mistakes', weekStart),
        count('learnings', monthStart),
        count('mistakes', monthStart),
      ])
      return {
        todayLearnings: unwrap(todayL) as Learning[],
        todayMistakes: unwrap(todayM) as Mistake[],
        openMistakes: unwrap(open) as Mistake[],
        openCount: open.count ?? 0,
        weekL,
        weekM,
        monthL,
        monthM,
      }
    },
  })
}

function Stat({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      {value === undefined ? (
        <Skeleton className="mt-1 h-7 w-10" />
      ) : (
        <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      )}
    </div>
  )
}

export function DashboardPage() {
  const { data: settings } = useSettings()
  const { data, isError, error } = useDashboard(settings?.week_starts_on ?? 1)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{greeting()}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/learnings/new">
              <LightbulbIcon />
              Add learning
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/mistakes/new">
              <TriangleAlertIcon />
              Add mistake
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/reviews/weekly">
              <CalendarCheckIcon />
              Weekly review
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/reviews/monthly">
              <CalendarRangeIcon />
              Monthly review
            </Link>
          </Button>
        </div>
      </div>

      {isError && <p className="text-sm text-destructive">{error.message}</p>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Learnings this week" value={data?.weekL} />
        <Stat label="Mistakes this week" value={data?.weekM} />
        <Stat label="Learnings this month" value={data?.monthL} />
        <Stat label="Mistakes this month" value={data?.monthM} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today’s learnings</CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/learnings/new">Add</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {!data ? (
              <Skeleton className="h-16" />
            ) : data.todayLearnings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing yet today. What did you learn?
              </p>
            ) : (
              <ul className="divide-y">
                {data.todayLearnings.map((l) => (
                  <li key={l.id}>
                    <Link to={`/learnings/${l.id}`} className="flex items-center justify-between gap-3 py-2 text-sm hover:underline">
                      <span className="min-w-0 truncate">{l.title}</span>
                      <RatingDots value={l.importance} label="Importance" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today’s mistakes</CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/mistakes/new">Add</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {!data ? (
              <Skeleton className="h-16" />
            ) : data.todayMistakes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No mistakes recorded today.</p>
            ) : (
              <ul className="divide-y">
                {data.todayMistakes.map((m) => (
                  <li key={m.id}>
                    <Link to={`/mistakes/${m.id}`} className="flex items-center justify-between gap-3 py-2 text-sm hover:underline">
                      <span className="min-w-0 truncate">{m.title}</span>
                      <RatingDots value={m.severity} tone="danger" label="Severity" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Pending lessons
              {data && data.openCount > 0 && (
                <span className="ml-2 font-normal text-muted-foreground">{data.openCount} open</span>
              )}
            </CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/mistakes?status=open">View all</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {!data ? (
              <Skeleton className="h-16" />
            ) : data.openMistakes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No unresolved mistakes. Keep it up.
              </p>
            ) : (
              <ul className="divide-y">
                {data.openMistakes.map((m) => (
                  <li key={m.id}>
                    <Link to={`/mistakes/${m.id}`} className="flex items-center justify-between gap-3 py-2 text-sm hover:underline">
                      <span className="min-w-0 truncate">{m.title}</span>
                      <span className="flex shrink-0 items-center gap-2">
                        <StatusBadge status={m.status} />
                        <RatingDots value={m.severity} tone="danger" label="Severity" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Trends, heatmap, top sources, growth score and AI insights are added to this dashboard in
        Phases 4–8.
      </p>
    </div>
  )
}
