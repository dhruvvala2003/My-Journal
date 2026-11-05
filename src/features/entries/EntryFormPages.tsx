import { useParams, useSearchParams } from 'react-router'
import { PageHeader } from '@/components/common/PageHeader'
import { toTimeInput } from '@/lib/dates'
import { BackButton, DetailSkeleton, NotFound } from './DetailParts'
import { useLearning } from '@/features/learnings/api'
import { LearningForm } from '@/features/learnings/LearningForm'
import { emptyLearning } from '@/features/learnings/learningSchema'
import { useMistake } from '@/features/mistakes/api'
import { MistakeForm } from '@/features/mistakes/MistakeForm'
import { emptyMistake } from '@/features/mistakes/mistakeSchema'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** /learnings/new (optionally ?mistake=<id>&date=yyyy-MM-dd) and /learnings/:id/edit */
export function LearningFormPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const fromMistakeId = params.get('mistake') ?? undefined
  const date = params.get('date') ?? ''

  const existing = useLearning(id)
  const fromMistake = useMistake(id ? undefined : fromMistakeId)

  const loading = (id && existing.isPending) || (fromMistakeId && !id && fromMistake.isPending)
  if (loading) return <DetailSkeleton />
  if (id && !existing.data) return <NotFound what="learning" back="/learnings" />

  const l = existing.data
  const m = fromMistake.data
  const initial = l
    ? emptyLearning({
        title: l.title,
        description: l.description,
        entry_date: l.entry_date,
        entry_time: toTimeInput(l.entry_time),
        occasion: l.occasion,
        category: l.category,
        source: l.source,
        learned_from: l.learned_from,
        importance: l.importance,
        tags: l.tags,
        practical_application: l.practical_application,
        mistakes: l.mistakes.map(({ id, title, entry_date }) => ({ id, title, entry_date })),
      })
    : emptyLearning({
        ...(ISO_DATE.test(date) ? { entry_date: date, entry_time: '' } : {}),
        ...(m
          ? {
              source: 'self_experience',
              title: m.lesson_learned.split('\n')[0].slice(0, 200),
              occasion: `Learned from my mistake: ${m.title}`,
              tags: m.tags,
              mistakes: [{ id: m.id, title: m.title, entry_date: m.entry_date }],
            }
          : {}),
      })

  return (
    <div className="mx-auto max-w-3xl">
      <BackButton fallback="/learnings" label="Back" />
      <PageHeader
        title={id ? 'Edit learning' : 'Add learning'}
        description={m && !id ? `From mistake: ${m.title}` : undefined}
      />
      <LearningForm key={id ?? 'new'} id={id} initial={initial} />
    </div>
  )
}

/** /mistakes/new (optionally ?date=yyyy-MM-dd) and /mistakes/:id/edit */
export function MistakeFormPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const date = params.get('date') ?? ''
  const existing = useMistake(id)

  if (id && existing.isPending) return <DetailSkeleton />
  if (id && !existing.data) return <NotFound what="mistake" back="/mistakes" />

  const m = existing.data
  const initial = m
    ? emptyMistake({
        title: m.title,
        description: m.description,
        entry_date: m.entry_date,
        entry_time: toTimeInput(m.entry_time),
        location: m.location,
        occasion: m.occasion,
        why_happened: m.why_happened,
        root_cause: m.root_cause,
        impact: m.impact,
        how_handled: m.how_handled,
        lesson_learned: m.lesson_learned,
        do_differently: m.do_differently,
        category: m.category,
        severity: m.severity,
        self_rating: m.self_rating,
        status: m.status,
        tags: m.tags,
        learnings: m.learnings.map(({ id, title, entry_date }) => ({ id, title, entry_date })),
      })
    : emptyMistake(ISO_DATE.test(date) ? { entry_date: date, entry_time: '' } : {})

  return (
    <div className="mx-auto max-w-3xl">
      <BackButton fallback="/mistakes" label="Back" />
      <PageHeader title={id ? 'Edit mistake' : 'Add mistake'} />
      <MistakeForm key={id ?? 'new'} id={id} initial={initial} />
    </div>
  )
}
