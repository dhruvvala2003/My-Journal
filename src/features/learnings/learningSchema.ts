import { z } from 'zod'
import { nowTime, todayISO } from '@/lib/dates'

export const schema = z.object({
  title: z.string().trim().min(1, 'Give it a short title').max(200, 'Keep the title under 200 characters'),
  description: z.string(),
  entry_date: z.string().min(1, 'Pick a date'),
  entry_time: z.string(),
  occasion: z.string(),
  category: z.string().min(1, 'Choose a category'),
  source: z.string().min(1, 'Choose where you learned it'),
  learned_from: z.string().trim().max(200),
  importance: z.number().int().min(1).max(5),
  tags: z.array(z.string()),
  practical_application: z.string(),
  mistakes: z.array(z.object({ id: z.string(), title: z.string(), entry_date: z.string() })),
})

export type LearningFormValues = z.infer<typeof schema>

export function emptyLearning(overrides: Partial<LearningFormValues> = {}): LearningFormValues {
  return {
    title: '',
    description: '',
    entry_date: todayISO(),
    entry_time: nowTime(),
    occasion: '',
    category: '',
    source: '',
    learned_from: '',
    importance: 3,
    tags: [],
    practical_application: '',
    mistakes: [],
    ...overrides,
  }
}
