import { Link } from 'react-router'
import { LightbulbIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, PageHeader } from '@/components/common/PageHeader'
import { SelectField } from '@/components/common/SelectField'
import { LEARNING_CATEGORIES, LEARNING_SOURCES } from '@/lib/constants'
import { usePeople, useTags } from '@/features/entries/api'
import { FilterBar, FilterField } from '@/features/entries/FilterBar'
import { LearningCard, Timeline } from '@/features/entries/EntryCards'
import { useDebouncedValue, useUrlFilters } from '@/features/entries/useUrlFilters'
import { LEARNING_FILTER_KEYS, useLearnings } from './api'

const IMPORTANCE_FILTER = [
  { value: '3', label: '3+ (Important)' },
  { value: '4', label: '4+ (Very important)' },
  { value: '5', label: '5 only' },
]

export function LearningsPage() {
  const { filters, setFilter, clear, activeCount } = useUrlFilters(LEARNING_FILTER_KEYS)
  const q = useDebouncedValue(filters.q)
  const query = useLearnings({ ...filters, q })
  const { data: people = [] } = usePeople()
  const { data: tags = [] } = useTags()

  const rows = query.data?.pages.flatMap((p) => p.rows) ?? []
  const total = query.data?.pages[0]?.count ?? 0
  const filtering = activeCount > 0 || Boolean(filters.q)

  return (
    <>
      <PageHeader
        title="My Learnings"
        description={
          query.isSuccess
            ? `${total} ${total === 1 ? 'learning' : 'learnings'}${filtering ? ' match your filters' : ' recorded'}`
            : 'Everything you have learned, newest first.'
        }
        actions={
          <Button asChild>
            <Link to="/learnings/new">
              <PlusIcon />
              Add learning
            </Link>
          </Button>
        }
      />

      <FilterBar
        query={filters.q}
        onQuery={(v) => setFilter('q', v)}
        placeholder="Search titles, details, people, tags…"
        activeCount={activeCount}
        onClear={clear}
      >
        <FilterField label="Category">
          <SelectField
            value={filters.category}
            onChange={(v) => setFilter('category', v)}
            options={LEARNING_CATEGORIES}
            allLabel="All categories"
          />
        </FilterField>
        <FilterField label="Source">
          <SelectField
            value={filters.source}
            onChange={(v) => setFilter('source', v)}
            options={LEARNING_SOURCES}
            allLabel="All sources"
          />
        </FilterField>
        <FilterField label="Person / learned from">
          <SelectField
            value={filters.person}
            onChange={(v) => setFilter('person', v)}
            options={people.map((p) => ({ value: p.name, label: `${p.name} (${p.entries})` }))}
            allLabel="Anyone"
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
        <FilterField label="Importance">
          <SelectField
            value={filters.importance}
            onChange={(v) => setFilter('importance', v)}
            options={IMPORTANCE_FILTER}
            allLabel="Any importance"
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
        <EmptyState title="Could not load learnings">{query.error.message}</EmptyState>
      ) : rows.length === 0 ? (
        <EmptyState icon={<LightbulbIcon />} title={filtering ? 'No matches' : 'No learnings yet'}>
          {filtering ? (
            'Try a different search or clear the filters.'
          ) : (
            <Link to="/learnings/new" className="underline underline-offset-4">
              Record your first learning
            </Link>
          )}
        </EmptyState>
      ) : (
        <>
          <Timeline items={rows} render={(l) => <LearningCard learning={l} />} />
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

export function ListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  )
}
