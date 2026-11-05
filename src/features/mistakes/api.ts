import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toPrefixTsQuery } from '@/lib/search'
import type { Mistake, MistakeWithLinks } from '@/lib/types'
import { invalidateJournal, PAGE_SIZE, syncLinks, unwrap } from '@/features/entries/api'

export const MISTAKE_COLUMNS =
  'id, title, description, entry_date, entry_time, location, occasion, why_happened, root_cause, impact, how_handled, lesson_learned, do_differently, category, severity, self_rating, status, tags, pattern_id, created_at, updated_at'

export const MISTAKE_FILTER_KEYS = [
  'q',
  'from',
  'to',
  'category',
  'location',
  'status',
  'tag',
  'severity',
  'repeated',
] as const
export type MistakeFilters = Record<(typeof MISTAKE_FILTER_KEYS)[number], string>

/** Fields you fill in on the form. pattern_id is managed by repeated-mistake detection. */
export type MistakeInput = Omit<Mistake, 'id' | 'created_at' | 'updated_at' | 'pattern_id'>

export function useMistakes(filters: MistakeFilters) {
  return useInfiniteQuery({
    queryKey: ['mistakes', 'list', filters],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      let q = supabase
        .from('mistakes')
        .select(MISTAKE_COLUMNS, { count: 'exact' })
        .order('entry_date', { ascending: false })
        .order('entry_time', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .range(pageParam * PAGE_SIZE, pageParam * PAGE_SIZE + PAGE_SIZE - 1)

      const ts = toPrefixTsQuery(filters.q)
      if (ts) q = q.textSearch('search', ts, { config: 'english' })
      if (filters.from) q = q.gte('entry_date', filters.from)
      if (filters.to) q = q.lte('entry_date', filters.to)
      if (filters.category) q = q.eq('category', filters.category)
      if (filters.location) q = q.eq('location', filters.location)
      if (filters.status === 'open') q = q.in('status', ['unresolved', 'learning'])
      else if (filters.status) q = q.eq('status', filters.status)
      if (filters.tag) q = q.contains('tags', [filters.tag])
      if (filters.severity) q = q.gte('severity', Number(filters.severity))
      if (filters.repeated) q = q.or('status.eq.repeated,pattern_id.not.is.null')

      const { data, error, count } = await q
      if (error) throw new Error(error.message)
      return { rows: data as Mistake[], count: count ?? 0 }
    },
    getNextPageParam: (last, pages) => (last.rows.length < PAGE_SIZE ? undefined : pages.length),
  })
}

export function useMistake(id: string | undefined) {
  return useQuery({
    queryKey: ['mistakes', 'detail', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const row = unwrap(
        await supabase
          .from('mistakes')
          .select(
            `${MISTAKE_COLUMNS}, links:learning_mistake_links(learning:learnings(id, title, entry_date, importance, category))`,
          )
          .eq('id', id!)
          .maybeSingle(),
      ) as (Mistake & { links: { learning: MistakeWithLinks['learnings'][number] | null }[] }) | null
      if (!row) return null
      const { links, ...rest } = row
      return {
        ...rest,
        learnings: links
          .map((l) => l.learning)
          .filter((l): l is NonNullable<typeof l> => l !== null)
          .sort((a, b) => b.entry_date.localeCompare(a.entry_date)),
      } satisfies MistakeWithLinks
    },
  })
}

export function useSaveMistake() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      input,
      learningIds,
    }: {
      id?: string
      input: MistakeInput
      learningIds: string[]
    }) => {
      let savedId = id
      if (id) {
        unwrap(await supabase.from('mistakes').update(input).eq('id', id))
      } else {
        const row = unwrap(
          await supabase.from('mistakes').insert(input).select('id').single(),
        ) as { id: string }
        savedId = row.id
      }
      await syncLinks('mistake', savedId!, learningIds)
      return savedId!
    },
    onSuccess: () => invalidateJournal(qc),
  })
}

export function useDeleteMistake() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      unwrap(await supabase.from('mistakes').delete().eq('id', id))
    },
    onSuccess: () => invalidateJournal(qc),
  })
}
