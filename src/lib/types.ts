import type { MistakeStatus } from './constants'

/** Minimal info used when showing a linked entry. */
export interface EntryRef {
  id: string
  title: string
  entry_date: string
}

export interface Learning {
  id: string
  title: string
  description: string
  entry_date: string // yyyy-MM-dd
  entry_time: string | null // HH:mm:ss
  occasion: string
  category: string
  source: string
  learned_from: string
  importance: number
  tags: string[]
  practical_application: string
  created_at: string
  updated_at: string
}

export interface Mistake {
  id: string
  title: string
  description: string
  entry_date: string
  entry_time: string | null
  location: string
  occasion: string
  why_happened: string
  root_cause: string
  impact: string
  how_handled: string
  lesson_learned: string
  do_differently: string
  category: string
  severity: number
  self_rating: number | null
  status: MistakeStatus
  tags: string[]
  pattern_id: string | null
  created_at: string
  updated_at: string
}

export interface LearningWithLinks extends Learning {
  mistakes: (EntryRef & { status: MistakeStatus; severity: number })[]
}

export interface MistakeWithLinks extends Mistake {
  learnings: (EntryRef & { importance: number; category: string })[]
}
