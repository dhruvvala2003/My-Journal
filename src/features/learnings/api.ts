import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toPrefixTsQuery } from '@/lib/search'
import type { Learning, LearningWithLinks } from '@/lib/types'
import { invalidateJournal, PAGE_SIZE, syncLinks, unwrap } from '@/features/entries/api'

export const LEARNING_COLUMNS =
  'id, title, description, entry_date, entry_time, occasion, category, source, learned_from, importance, tags, practical_application, created_at, updated_at'

export const LEARNING_FILTER_KEYS = [
  'q',
  'from',
  'to',
  'category',
  'source',
  'person',
  'tag',
  'importance',
] as const
export type LearningFilters = Record<(typeof LEARNING_FILTER_KEYS)[number], string>

/** Fields you fill in on the form (everything except ids/timestamps). */
export type LearningInput = Omit<Learning, 'id' | 'created_at' | 'updated_at'>

export function useLearnings(filters: LearningFilters) {
  return useInfiniteQuery({
    queryKey: ['learnings', 'list', filters],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      let q = supabase
        .from('learnings')
        .select(LEARNING_COLUMNS, { count: 'exact' })
        .order('entry_date', { ascending: false })
        .order('entry_time', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .range(pageParam * PAGE_SIZE, pageParam * PAGE_SIZE + PAGE_SIZE - 1)

      const ts = toPrefixTsQuery(filters.q)
      if (ts) q = q.textSearch('search', ts, { config: 'english' })
      if (filters.from) q = q.gte('entry_date', filters.from)
      if (filters.to) q = q.lte('entry_date', filters.to)
      if (filters.category) q = q.eq('category', filters.category)
      if (filters.source) q = q.eq('source', filters.source)
      if (filters.person) q = q.eq('learned_from', filters.person)
      if (filters.tag) q = q.contains('tags', [filters.tag])
      if (filters.importance) q = q.gte('importance', Number(filters.importance))

      const { data, error, count } = await q
      if (error) throw new Error(error.message)
      return { rows: data as Learning[], count: count ?? 0 }
    },
    getNextPageParam: (last, pages) => (last.rows.length < PAGE_SIZE ? undefined : pages.length),
  })
}

export function useLearning(id: string | undefined) {
  return useQuery({
    queryKey: ['learnings', 'detail', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const row = unwrap(
        await supabase
          .from('learnings')
          .select(
            `${LEARNING_COLUMNS}, links:learning_mistake_links(mistake:mistakes(id, title, entry_date, status, severity))`,
          )
          .eq('id', id!)
          .maybeSingle(),
      ) as (Learning & { links: { mistake: LearningWithLinks['mistakes'][number] | null }[] }) | null
      if (!row) return null
      const { links, ...rest } = row
      return {
        ...rest,
        mistakes: links
          .map((l) => l.mistake)
          .filter((m): m is NonNullable<typeof m> => m !== null)
          .sort((a, b) => b.entry_date.localeCompare(a.entry_date)),
      } satisfies LearningWithLinks
    },
  })
}

export function useSaveLearning() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      input,
      mistakeIds,
    }: {
      id?: string
      input: LearningInput
      mistakeIds: string[]
    }) => {
      let savedId = id
      if (id) {
        unwrap(await supabase.from('learnings').update(input).eq('id', id))
      } else {
        const row = unwrap(
          await supabase.from('learnings').insert(input).select('id').single(),
        ) as { id: string }
        savedId = row.id
      }
      await syncLinks('learning', savedId!, mistakeIds)
      return savedId!
    },
    onSuccess: () => invalidateJournal(qc),
  })
}

export function useDeleteLearning() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      unwrap(await supabase.from('learnings').delete().eq('id', id))
    },
    onSuccess: () => invalidateJournal(qc),
  })
}
