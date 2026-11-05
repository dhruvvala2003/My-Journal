import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/common/PageHeader'
import { SelectField } from '@/components/common/SelectField'
import { RatingInput } from '@/components/common/RatingInput'
import { TagInput } from '@/components/common/TagInput'
import { EntryLinkPicker } from '@/components/common/EntryLinkPicker'
import { useUnsavedChanges } from '@/components/common/useUnsavedChanges'
import {
  MISTAKE_CATEGORIES,
  MISTAKE_LOCATIONS,
  MISTAKE_STATUSES,
  SELF_RATING_LABELS,
  SEVERITY_LABELS,
} from '@/lib/constants'
import { useGoBack } from '@/lib/useGoBack'
import { useSaveMistake } from './api'
import { schema, type MistakeFormValues } from './mistakeSchema'

export function MistakeForm({ id, initial }: { id?: string; initial: MistakeFormValues }) {
  const navigate = useNavigate()
  const goBack = useGoBack('/mistakes')
  const save = useSaveMistake()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<MistakeFormValues>({ resolver: zodResolver(schema), defaultValues: initial })

  const { allowNavigation, dialog } = useUnsavedChanges(isDirty && !isSubmitting)

  const onSubmit = handleSubmit(async ({ learnings, entry_time, ...values }) => {
    try {
      const savedId = await save.mutateAsync({
        id,
        input: { ...values, entry_time: entry_time || null },
        learningIds: learnings.map((l) => l.id),
      })
      toast.success(id ? 'Mistake updated' : 'Mistake saved')
      allowNavigation()
      navigate(`/mistakes/${savedId}`, { replace: true })
    } catch (e) {
      toast.error(`Could not save: ${(e as Error).message}`)
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {dialog}
      <Card>
        <CardHeader>
          <CardTitle>What happened?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Mistake title" htmlFor="title" required error={errors.title?.message}>
            <Input
              id="title"
              autoFocus={!id}
              placeholder="e.g. Started development before confirming requirements"
              aria-invalid={Boolean(errors.title) || undefined}
              {...register('title')}
            />
          </Field>
          <Field label="Detailed description" htmlFor="description">
            <Textarea id="description" rows={4} {...register('description')} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date" htmlFor="entry_date" required error={errors.entry_date?.message}>
              <Input id="entry_date" type="date" {...register('entry_date')} />
            </Field>
            <Field label="Time" htmlFor="entry_time">
              <Input id="entry_time" type="time" {...register('entry_time')} />
            </Field>
            <Field label="Where?" htmlFor="location" required error={errors.location?.message}>
              <Controller
                control={control}
                name="location"
                render={({ field, fieldState }) => (
                  <SelectField
                    id="location"
                    value={field.value}
                    onChange={field.onChange}
                    options={MISTAKE_LOCATIONS}
                    placeholder="Office, meeting, coding…"
                    invalid={fieldState.invalid}
                  />
                )}
              />
            </Field>
            <Field label="Mistake category" htmlFor="category" required error={errors.category?.message}>
              <Controller
                control={control}
                name="category"
                render={({ field, fieldState }) => (
                  <SelectField
                    id="category"
                    value={field.value}
                    onChange={field.onChange}
                    options={MISTAKE_CATEGORIES}
                    placeholder="Choose a category"
                    invalid={fieldState.invalid}
                  />
                )}
              />
            </Field>
          </div>
          <Field label="Occasion / situation" htmlFor="occasion">
            <Textarea id="occasion" rows={2} {...register('occasion')} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Why did it happen?</CardTitle>
          <CardDescription>Be honest — this is only for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Why did I make this mistake?" htmlFor="why_happened">
            <Textarea id="why_happened" rows={3} {...register('why_happened')} />
          </Field>
          <Field label="Root cause" htmlFor="root_cause" hint="Ask “why?” a few times to get to the real cause.">
            <Textarea id="root_cause" rows={2} {...register('root_cause')} />
          </Field>
          <Field label="Impact" htmlFor="impact">
            <Textarea id="impact" rows={2} {...register('impact')} />
          </Field>
          <Field label="How did I handle it?" htmlFor="how_handled">
            <Textarea id="how_handled" rows={2} {...register('how_handled')} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What will I take from it?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="What did I learn from it?" htmlFor="lesson_learned">
            <Textarea id="lesson_learned" rows={3} {...register('lesson_learned')} />
          </Field>
          <Field label="What should I do differently next time?" htmlFor="do_differently">
            <Textarea id="do_differently" rows={3} {...register('do_differently')} />
          </Field>
          <Field
            label="Related learnings"
            hint="Link learnings that came out of this mistake (you can also add them later)."
          >
            <Controller
              control={control}
              name="learnings"
              render={({ field }) => (
                <EntryLinkPicker kind="learnings" value={field.value} onChange={field.onChange} />
              )}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rate and track</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Severity">
            <Controller
              control={control}
              name="severity"
              render={({ field }) => (
                <RatingInput
                  aria-label="Severity"
                  tone="danger"
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? 3)}
                  labels={SEVERITY_LABELS}
                />
              )}
            />
          </Field>
          <Field label="Self-rating" hint="How well did you handle it? Click again to clear.">
            <Controller
              control={control}
              name="self_rating"
              render={({ field }) => (
                <RatingInput
                  aria-label="Self-rating"
                  clearable
                  value={field.value}
                  onChange={field.onChange}
                  labels={SELF_RATING_LABELS}
                />
              )}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Status" htmlFor="status">
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <SelectField
                    id="status"
                    value={field.value}
                    onChange={field.onChange}
                    options={MISTAKE_STATUSES}
                  />
                )}
              />
            </Field>
          </div>
          <Field label="Tags" htmlFor="tags">
            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <TagInput id="tags" value={field.value} onChange={field.onChange} />
              )}
            />
          </Field>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
        <Button type="button" variant="ghost" onClick={goBack}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : id ? 'Save changes' : 'Save mistake'}
        </Button>
      </div>
    </form>
  )
}
