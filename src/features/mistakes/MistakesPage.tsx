import { Link } from 'react-router'
import { PlusIcon, TriangleAlertIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState, PageHeader } from '@/components/common/PageHeader'
import { SelectField } from '@/components/common/SelectField'
import { MISTAKE_CATEGORIES, MISTAKE_LOCATIONS, MISTAKE_STATUSES } from '@/lib/constants'
import { useTags } from '@/features/entries/api'
import { FilterBar, FilterField } from '@/features/entries/FilterBar'
import { MistakeCard, Timeline } from '@/features/entries/EntryCards'
import { useDebouncedValue, useUrlFilters } from '@/features/entries/useUrlFilters'
import { ListSkeleton } from '@/features/learnings/LearningsPage'
import { MISTAKE_FILTER_KEYS, useMistakes } from './api'

const STATUS_FILTER = [
  { value: 'open', label: 'Open (Unresolved + Learning)' },
  ...MISTAKE_STATUSES,
]
const SEVERITY_FILTER = [
  { value: '3', label: '3+ (Moderate)' },
  { value: '4', label: '4+ (Serious)' },
  { value: '5', label: '5 only (Critical)' },
]

export function MistakesPage() {
  const { filters, setFilter, clear, activeCount } = useUrlFilters(MISTAKE_FILTER_KEYS)
  const q = useDebouncedValue(filters.q)
  const query = useMistakes({ ...filters, q })
  const { data: tags = [] } = useTags()

  const rows = query.data?.pages.flatMap((p) => p.rows) ?? []
  const total = query.data?.pages[0]?.count ?? 0
  const filtering = activeCount > 0 || Boolean(filters.q)

  return (
    <>
      <PageHeader
        title="My Mistakes"
        description={
          query.isSuccess
            ? `${total} ${total === 1 ? 'mistake' : 'mistakes'}${filtering ? ' match your filters' : ' recorded'}`
            : 'Every mistake is a lesson — if you write it down.'
        }
        actions={
          <Button asChild>
            <Link to="/mistakes/new">
              <PlusIcon />
              Add mistake
            </Link>
          </Button>
        }
      />

      <Tabs
        value={filters.repeated ? 'repeated' : 'all'}
        onValueChange={(v) => setFilter('repeated', v === 'repeated' ? '1' : '')}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="all">All mistakes</TabsTrigger>
          <TabsTrigger value="repeated">Repeated</TabsTrigger>
        </TabsList>
      </Tabs>
      {filters.repeated && (
        <p className="mb-4 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          Showing mistakes marked <strong>Repeated</strong>. Automatic detection of similar
          mistakes, occurrence timelines and pattern reports arrive in Phase 6.
        </p>
      )}

      <FilterBar
        query={filters.q}
        onQuery={(v) => setFilter('q', v)}
        placeholder="Search titles, causes, lessons, tags…"
        activeCount={activeCount - (filters.repeated ? 1 : 0)}
        onClear={clear}
      >
        <FilterField label="Status">
          <SelectField
            value={filters.status}
            onChange={(v) => setFilter('status', v)}
            options={STATUS_FILTER}
            allLabel="Any status"
          />
        </FilterField>
        <FilterField label="Category">
          <SelectField
            value={filters.category}
            onChange={(v) => setFilter('category', v)}
            options={MISTAKE_CATEGORIES}
            allLabel="All categories"
          />
        </FilterField>
        <FilterField label="Where">
          <SelectField
            value={filters.location}
            onChange={(v) => setFilter('location', v)}
            options={MISTAKE_LOCATIONS}
            allLabel="Anywhere"
          />
        </FilterField>
        <FilterField label="Severity">
          <SelectField
            value={filters.severity}
            onChange={(v) => setFilter('severity', v)}
            options={SEVERITY_FILTER}
            allLabel="Any severity"
          />
        </FilterField>
        <FilterField label="Tag">
          <SelectField
            value={filters.tag}
            onChange={(v) => setFilter('tag', v)}
            options={tags.map((t) => ({ value: t.tag, label: `#${t.tag}` }))}
            allLabel="Any tag"
          />
        </FilterField>
        <FilterField label="From date">
          <Input type="date" value={filters.from} onChange={(e) => setFilter('from', e.target.value)} />
        </FilterField>
        <FilterField label="To date">
          <Input type="date" value={filters.to} onChange={(e) => setFilter('to', e.target.value)} />
        </FilterField>
      </FilterBar>

      {query.isPending ? (
        <ListSkeleton />
      ) : query.isError ? (
        <EmptyState title="Could not load mistakes">{query.error.message}</EmptyState>
      ) : rows.length === 0 ? (
        <EmptyState icon={<TriangleAlertIcon />} title={filtering ? 'No matches' : 'No mistakes recorded'}>
          {filtering ? (
            'Try a different search or clear the filters.'
          ) : (
            <Link to="/mistakes/new" className="underline underline-offset-4">
              Record a mistake
            </Link>
          )}
        </EmptyState>
      ) : (
        <>
          <Timeline items={rows} render={(m) => <MistakeCard mistake={m} />} />
          {query.hasNextPage && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onClick={() => query.fetchNextPage()}
                disabled={query.isFetchingNextPage}
              >
                {query.isFetchingNextPage ? 'Loading…' : 'Load older entries'}
              </Button>
            </div>
          )}
        </>
      )}
    </>
  )
}
