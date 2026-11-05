import { Link, useNavigate, useParams } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LightbulbIcon, PencilIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDelete } from '@/components/common/ConfirmDelete'
import { RatingDots } from '@/components/common/RatingInput'
import { SelectField } from '@/components/common/SelectField'
import {
  MISTAKE_CATEGORIES,
  MISTAKE_LOCATIONS,
  MISTAKE_STATUSES,
  SELF_RATING_LABELS,
  SEVERITY_LABELS,
  labelOf,
  type MistakeStatus,
} from '@/lib/constants'
import { formatTime, shortDate } from '@/lib/dates'
import { supabase } from '@/lib/supabase'
import { invalidateJournal, unwrap } from '@/features/entries/api'
import { TagList } from '@/features/entries/EntryBadges'
import {
  BackButton,
  DetailSkeleton,
  LinkedList,
  MetaItem,
  NotFound,
  TextSection,
} from '@/features/entries/DetailParts'
import { useDeleteMistake, useMistake } from './api'

export function MistakeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: m, isPending, isError, error } = useMistake(id)
  const del = useDeleteMistake()
  const setStatus = useMutation({
    mutationFn: async (status: MistakeStatus) => {
      unwrap(await supabase.from('mistakes').update({ status }).eq('id', id!))
    },
    onSuccess: () => {
      toast.success('Status updated')
      return invalidateJournal(qc)
    },
    onError: (e) => toast.error(e.message),
  })

  if (isPending) return <DetailSkeleton />
  if (isError) return <p className="text-destructive">{error.message}</p>
  if (!m) return <NotFound what="mistake" back="/mistakes" />

  const onDelete = () =>
    del.mutate(m.id, {
      onSuccess: () => {
        toast.success('Mistake deleted')
        navigate('/mistakes', { replace: true })
      },
      onError: (e) => toast.error(e.message),
    })

  return (
    <article className="space-y-6">
      <div>
        <BackButton fallback="/mistakes" label="My Mistakes" />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{m.title}</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/mistakes/${m.id}/edit`}>
                <PencilIcon />
                Edit
              </Link>
            </Button>
            <ConfirmDelete what="mistake" onConfirm={onDelete} pending={del.isPending} />
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant="outline">{labelOf(MISTAKE_CATEGORIES, m.category)}</Badge>
          <Badge variant="secondary">{labelOf(MISTAKE_LOCATIONS, m.location)}</Badge>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-4 rounded-xl border p-4 sm:grid-cols-4">
        <MetaItem label="Date">
          {shortDate(m.entry_date)}
          {m.entry_time && <span className="font-normal"> · {formatTime(m.entry_time)}</span>}
        </MetaItem>
        <MetaItem label="Severity">
          <span className="flex items-center gap-2">
            <RatingDots value={m.severity} tone="danger" label="Severity" />
            <span className="font-normal">{SEVERITY_LABELS[m.severity]}</span>
          </span>
        </MetaItem>
        <MetaItem label="Self-rating">
          {m.self_rating ? `${m.self_rating}/5 · ${SELF_RATING_LABELS[m.self_rating]}` : '—'}
        </MetaItem>
        <MetaItem label="Status">
          <SelectField
            value={m.status}
            onChange={(v) => setStatus.mutate(v as MistakeStatus)}
            options={MISTAKE_STATUSES}
            className="h-7"
          />
        </MetaItem>
      </dl>

      <div className="space-y-5">
        <TextSection title="What happened">{m.description}</TextSection>
        <TextSection title="Occasion / situation">{m.occasion}</TextSection>
        <TextSection title="Why did I make this mistake?">{m.why_happened}</TextSection>
        <TextSection title="Root cause">{m.root_cause}</TextSection>
        <TextSection title="Impact">{m.impact}</TextSection>
        <TextSection title="How I handled it">{m.how_handled}</TextSection>
      </div>

      {(m.lesson_learned || m.do_differently) && (
        <div className="space-y-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <TextSection title="What I learned">{m.lesson_learned}</TextSection>
          <TextSection title="Next time I will">{m.do_differently}</TextSection>
        </div>
      )}

      {m.tags.length > 0 && <TagList tags={m.tags} />}

      <LinkedList
        title="Learnings from this mistake"
        base="/learnings"
        empty="No learnings linked yet."
        items={m.learnings}
        action={
          <Button variant="outline" size="sm" asChild>
            <Link to={`/learnings/new?mistake=${m.id}`}>
              <LightbulbIcon />
              Add a learning from this
            </Link>
          </Button>
        }
      />

      <p className="text-xs text-muted-foreground">
        Created {new Date(m.created_at).toLocaleString()}
        {m.updated_at !== m.created_at && ` · Updated ${new Date(m.updated_at).toLocaleString()}`}
      </p>
    </article>
  )
}
