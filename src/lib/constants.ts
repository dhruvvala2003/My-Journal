/**
 * Fixed option lists. The database stores the `value`; the UI shows the `label`.
 * To add a new option, add it here – no database change is needed
 * (only mistake `status` and growth `dimension` are enforced by the database).
 */
export type Option<V extends string = string> = { readonly value: V; readonly label: string }

export const LEARNING_CATEGORIES = [
  { value: 'technical', label: 'Technical' },
  { value: 'communication', label: 'Communication' },
  { value: 'personal_growth', label: 'Personal Growth' },
  { value: 'management', label: 'Management' },
  { value: 'problem_solving', label: 'Problem Solving' },
  { value: 'professional_skills', label: 'Professional Skills' },
  { value: 'other', label: 'Other' },
] as const satisfies readonly Option[]

export const LEARNING_SOURCES = [
  { value: 'manager', label: 'Manager' },
  { value: 'senior', label: 'Senior' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'book', label: 'Book' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'online_course', label: 'Online Course' },
  { value: 'internet', label: 'Internet' },
  { value: 'self_experience', label: 'Self-experience' },
  { value: 'real_life', label: 'Real-life situation' },
  { value: 'other', label: 'Other' },
] as const satisfies readonly Option[]

/** Hint shown in the "Learned from" field, depending on the chosen source. */
export const LEARNED_FROM_PLACEHOLDER: Record<string, string> = {
  manager: "Manager's name",
  senior: "Senior's name",
  colleague: "Colleague's name",
  book: 'Book title',
  youtube: 'Channel or video name',
  online_course: 'Course name',
  internet: 'Website or article',
  self_experience: 'e.g. Debugging, Own mistake',
  real_life: 'Person or situation',
  other: 'Who or what',
}

export const MISTAKE_LOCATIONS = [
  { value: 'office', label: 'Office' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'coding', label: 'Coding' },
  { value: 'communication', label: 'Communication' },
  { value: 'personal_life', label: 'Personal Life' },
  { value: 'decision_making', label: 'Decision Making' },
  { value: 'other', label: 'Other' },
] as const satisfies readonly Option[]

export const MISTAKE_CATEGORIES = [
  { value: 'requirement_understanding', label: 'Requirement Understanding' },
  { value: 'technical', label: 'Technical' },
  { value: 'communication', label: 'Communication' },
  { value: 'time_management', label: 'Time Management' },
  { value: 'decision_making', label: 'Decision Making' },
  { value: 'attention_to_detail', label: 'Attention to Detail' },
  { value: 'process', label: 'Process' },
  { value: 'behaviour', label: 'Behaviour' },
  { value: 'other', label: 'Other' },
] as const satisfies readonly Option[]

export const MISTAKE_STATUSES = [
  { value: 'unresolved', label: 'Unresolved' },
  { value: 'learning', label: 'Learning' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'repeated', label: 'Repeated' },
] as const satisfies readonly Option[]

export type MistakeStatus = (typeof MISTAKE_STATUSES)[number]['value']

export const GROWTH_DIMENSIONS = [
  { value: 'technical_skills', label: 'Technical Skills' },
  { value: 'communication', label: 'Communication Skills' },
  { value: 'problem_solving', label: 'Problem Solving' },
  { value: 'decision_making', label: 'Decision Making' },
  { value: 'time_management', label: 'Time Management' },
  { value: 'discipline', label: 'Discipline' },
  { value: 'learning_consistency', label: 'Learning Consistency' },
  { value: 'professional_behaviour', label: 'Professional Behaviour' },
] as const satisfies readonly Option[]

export const IMPORTANCE_LABELS = ['', 'Minor', 'Useful', 'Important', 'Very important', 'Life-changing']
export const SEVERITY_LABELS = ['', 'Trivial', 'Minor', 'Moderate', 'Serious', 'Critical']
export const SELF_RATING_LABELS = ['', 'Handled badly', 'Poorly', 'Okay', 'Well', 'Very well']

/** Label for a stored value; falls back to the raw value for options removed later. */
export function labelOf(options: readonly Option[], value: string | null | undefined): string {
  if (!value) return ''
  return options.find((o) => o.value === value)?.label ?? value
}
