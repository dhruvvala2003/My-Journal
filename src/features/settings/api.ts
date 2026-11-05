import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { unwrap } from '@/features/entries/api'
import { LEARNING_COLUMNS } from '@/features/learnings/api'
import { MISTAKE_COLUMNS } from '@/features/mistakes/api'

export interface UserSettings {
  week_starts_on: 0 | 1 // 0 = Sunday, 1 = Monday
  timezone: string
}

const DEFAULTS: UserSettings = {
  week_starts_on: 1,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    staleTime: Infinity,
    queryFn: async (): Promise<UserSettings> => {
      const row = unwrap(
        await supabase.from('user_settings').select('week_starts_on, timezone').maybeSingle(),
      ) as UserSettings | null
      return row ?? DEFAULTS
    },
  })
}

export function useSaveSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch: Partial<UserSettings>) => {
      const current = qc.getQueryData<UserSettings>(['settings']) ?? DEFAULTS
      unwrap(
        await supabase
          .from('user_settings')
          .upsert({ ...current, ...patch }, { onConflict: 'user_id' }),
      )
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  })
}

/** Reads every row of a table, 1000 at a time (the API's per-request limit). */
async function fetchAll(table: string, columns = '*') {
  const rows: Record<string, unknown>[] = []
  for (let from = 0; ; from += 1000) {
    const page = unwrap(
      await supabase.from(table).select(columns).range(from, from + 999),
    ) as unknown as Record<string, unknown>[]
    rows.push(...page)
    if (page.length < 1000) return rows
  }
}

export async function exportAllData() {
  const [
    learnings,
    mistakes,
    learning_mistake_links,
    mistake_patterns,
    mistake_match_dismissals,
    reviews,
    growth_ratings,
    review_goals,
    ai_insights,
    user_settings,
  ] = await Promise.all([
    fetchAll('learnings', LEARNING_COLUMNS),
    fetchAll('mistakes', MISTAKE_COLUMNS),
    fetchAll('learning_mistake_links'),
    fetchAll('mistake_patterns'),
    fetchAll('mistake_match_dismissals'),
    fetchAll('reviews'),
    fetchAll('growth_ratings'),
    fetchAll('review_goals'),
    fetchAll('ai_insights'),
    fetchAll('user_settings'),
  ])
  return {
    exported_at: new Date().toISOString(),
    app: 'evolve',
    schema_version: 1,
    learnings,
    mistakes,
    learning_mistake_links,
    mistake_patterns,
    mistake_match_dismissals,
    reviews,
    growth_ratings,
    review_goals,
    ai_insights,
    user_settings,
  }
}
