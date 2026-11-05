import { z } from 'zod'
import { MISTAKE_STATUSES, type MistakeStatus } from '@/lib/constants'
import { nowTime, todayISO } from '@/lib/dates'

export const schema = z.object({
  title: z.string().trim().min(1, 'Give it a short title').max(200, 'Keep the title under 200 characters'),
  description: z.string(),
  entry_date: z.string().min(1, 'Pick a date'),
  entry_time: z.string(),
  location: z.string().min(1, 'Where did it happen?'),
  occasion: z.string(),
  why_happened: z.string(),
  root_cause: z.string(),
  impact: z.string(),
  how_handled: z.string(),
  lesson_learned: z.string(),
  do_differently: z.string(),
  category: z.string().min(1, 'Choose a category'),
  severity: z.number().int().min(1).max(5),
  self_rating: z.number().int().min(1).max(5).nullable(),
  status: z.enum(MISTAKE_STATUSES.map((s) => s.value) as [MistakeStatus, ...MistakeStatus[]]),
  tags: z.array(z.string()),
  learnings: z.array(z.object({ id: z.string(), title: z.string(), entry_date: z.string() })),
})

export type MistakeFormValues = z.infer<typeof schema>

export function emptyMistake(overrides: Partial<MistakeFormValues> = {}): MistakeFormValues {
  return {
    title: '',
    description: '',
    entry_date: todayISO(),
    entry_time: nowTime(),
    location: '',
    occasion: '',
    why_happened: '',
    root_cause: '',
    impact: '',
    how_handled: '',
    lesson_learned: '',
    do_differently: '',
    category: '',
    severity: 3,
    self_rating: null,
    status: 'unresolved',
    tags: [],
    learnings: [],
    ...overrides,
  }
}
