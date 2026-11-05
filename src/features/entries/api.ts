import { useQuery, type QueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toPrefixTsQuery } from '@/lib/search'
import type { EntryRef } from '@/lib/types'

export const PAGE_SIZE = 30

/** Throws Supabase errors so TanStack Query / mutations can surface them. */
export function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message)
  return res.data as T
}

/** Refresh everything that shows journal data after a change. */
export function invalidateJournal(qc: QueryClient) {
  return Promise.all(
    ['learnings', 'mistakes', 'tags', 'people', 'dashboard', 'search'].map((k) =>
      qc.invalidateQueries({ queryKey: [k] }),
    ),
  )
}

/** All tags you have used, most used first (for suggestions and filters). */
export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () =>
      unwrap(
        await supabase.from('tag_usage').select('tag, uses').order('uses', { ascending: false }),
      ) as { tag: string; uses: number }[],
    staleTime: 5 * 60_000,
  })
}

/** Everyone/everything you learned from (for autocomplete and filters). */
export function usePeople() {
  return useQuery({
    queryKey: ['people'],
    queryFn: async () =>
      unwrap(
        await supabase
          .from('learning_people')
          .select('name, entries, last_date')
          .order('entries', { ascending: false }),
      ) as { name: string; entries: number; last_date: string }[],
    staleTime: 5 * 60_000,
  })
}

type Side = 'learning' | 'mistake'

/**
 * Makes the links of one entry exactly match `otherIds`
 * (adds the new ones, removes the ones you un-linked).
 */
export async function syncLinks(side: Side, id: string, otherIds: string[]) {
  const col = side === 'learning' ? 'learning_id' : 'mistake_id'
  const otherCol = side === 'learning' ? 'mistake_id' : 'learning_id'

  const existing = unwrap(
    await supabase.from('learning_mistake_links').select(otherCol).eq(col, id),
  ) as Record<string, string>[]
  const existingIds = existing.map((r) => r[otherCol])

  const toRemove = existingIds.filter((x) => !otherIds.includes(x))
  const toAdd = otherIds.filter((x) => !existingIds.includes(x))

  if (toRemove.length) {
    unwrap(
      await supabase
        .from('learning_mistake_links')
        .delete()
        .eq(col, id)
        .in(otherCol, toRemove),
    )
  }
  if (toAdd.length) {
    unwrap(
      await supabase
        .from('learning_mistake_links')
        .insert(toAdd.map((o) => ({ [col]: id, [otherCol]: o }))),
    )
  }
}

/** Search learnings or mistakes by title/text (used by the link picker). */
export async function searchEntryRefs(
  table: 'learnings' | 'mistakes',
  text: string,
  limit = 10,
): Promise<EntryRef[]> {
  let q = supabase
    .from(table)
    .select('id, title, entry_date')
    .order('entry_date', { ascending: false })
    .limit(limit)
  const ts = toPrefixTsQuery(text)
  if (ts) q = q.textSearch('search', ts, { config: 'english' })
  return unwrap(await q) as EntryRef[]
}
