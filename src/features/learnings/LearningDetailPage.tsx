import { Link, useNavigate, useParams } from 'react-router'
import { PencilIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDelete } from '@/components/common/ConfirmDelete'
import { RatingDots } from '@/components/common/RatingInput'
import {
  IMPORTANCE_LABELS,
  LEARNING_CATEGORIES,
  LEARNING_SOURCES,
  labelOf,
} from '@/lib/constants'
import { formatTime, shortDate } from '@/lib/dates'
import { StatusBadge, TagList } from '@/features/entries/EntryBadges'
import {
  BackButton,
  DetailSkeleton,
  LinkedList,
  MetaItem,
  NotFound,
  TextSection,
} from '@/features/entries/DetailParts'
import { useDeleteLearning, useLearning } from './api'

export function LearningDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: l, isPending, isError, error } = useLearning(id)
  const del = useDeleteLearning()

  if (isPending) return <DetailSkeleton />
  if (isError) return <p className="text-destructive">{error.message}</p>
  if (!l) return <NotFound what="learning" back="/learnings" />

  const onDelete = () =>
    del.mutate(l.id, {
      onSuccess: () => {
        toast.success('Learning deleted')
        navigate('/learnings', { replace: true })
      },
      onError: (e) => toast.error(e.message),
    })

  return (
    <article className="space-y-6">
      <div>
        <BackButton fallback="/learnings" label="My Learnings" />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{l.title}</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/learnings/${l.id}/edit`}>
                <PencilIcon />
                Edit
              </Link>
            </Button>
            <ConfirmDelete what="learning" onConfirm={onDelete} pending={del.isPending} />
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant="outline">{labelOf(LEARNING_CATEGORIES, l.category)}</Badge>
          <Badge variant="secondary">{labelOf(LEARNING_SOURCES, l.source)}</Badge>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-4 rounded-xl border p-4 sm:grid-cols-4">
        <MetaItem label="Date">
          {shortDate(l.entry_date)}
          {l.entry_time && <span className="font-normal"> · {formatTime(l.entry_time)}</span>}
        </MetaItem>
        <MetaItem label="Learned from">{l.learned_from || '—'}</MetaItem>
        <MetaItem label="Importance">
          <span className="flex items-center gap-2">
            <RatingDots value={l.importance} label="Importance" />
            <span className="font-normal">{IMPORTANCE_LABELS[l.importance]}</span>
          </span>
        </MetaItem>
        <MetaItem label="Tags">{l.tags.length ? <TagList tags={l.tags} /> : '—'}</MetaItem>
      </dl>

      <div className="space-y-5">
        <TextSection title="Details">{l.description}</TextSection>
        <TextSection title="Occasion / situation">{l.occasion}</TextSection>
        <TextSection title="Practical application">{l.practical_application}</TextSection>
      </div>

      <LinkedList
        title="Related mistakes"
        base="/mistakes"
        empty="Not linked to any mistake."
        items={l.mistakes.map((m) => ({ ...m, extra: <StatusBadge status={m.status} /> }))}
      />

      <p className="text-xs text-muted-foreground">
        Created {new Date(l.created_at).toLocaleString()}
        {l.updated_at !== l.created_at && ` · Updated ${new Date(l.updated_at).toLocaleString()}`}
      </p>
    </article>
  )
}
