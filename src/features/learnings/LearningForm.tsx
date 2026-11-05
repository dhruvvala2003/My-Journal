import { useId } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/common/PageHeader'
import { SelectField } from '@/components/common/SelectField'
import { RatingInput } from '@/components/common/RatingInput'
import { TagInput } from '@/components/common/TagInput'
import { EntryLinkPicker } from '@/components/common/EntryLinkPicker'
import { useUnsavedChanges } from '@/components/common/useUnsavedChanges'
import {
  IMPORTANCE_LABELS,
  LEARNED_FROM_PLACEHOLDER,
  LEARNING_CATEGORIES,
  LEARNING_SOURCES,
} from '@/lib/constants'
import { useGoBack } from '@/lib/useGoBack'
import { usePeople } from '@/features/entries/api'
import { useSaveLearning } from './api'
import { emptyLearning, schema, type LearningFormValues } from './learningSchema'

export function LearningForm({ id, initial }: { id?: string; initial: LearningFormValues }) {
  const navigate = useNavigate()
  const goBack = useGoBack('/learnings')
  const save = useSaveLearning()
  const { data: people = [] } = usePeople()
  const peopleListId = useId()

  const {
    register,
    control,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<LearningFormValues>({ resolver: zodResolver(schema), defaultValues: initial })

  const source = useWatch({ control, name: 'source' })
  const { allowNavigation, dialog } = useUnsavedChanges(isDirty && !isSubmitting)

  const submit = (addAnother: boolean) =>
    handleSubmit(async ({ mistakes, entry_time, ...values }) => {
      try {
        const savedId = await save.mutateAsync({
          id,
          input: { ...values, entry_time: entry_time || null },
          mistakeIds: mistakes.map((m) => m.id),
        })
        toast.success(id ? 'Learning updated' : 'Learning saved')
        if (addAnother) {
          reset(emptyLearning({ entry_date: values.entry_date }))
          setFocus('title')
        } else {
          allowNavigation()
          navigate(`/learnings/${savedId}`, { replace: true })
        }
      } catch (e) {
        toast.error(`Could not save: ${(e as Error).message}`)
      }
    })

  return (
    <form onSubmit={submit(false)} className="space-y-4" noValidate>
      {dialog}
      <Card>
        <CardHeader>
          <CardTitle>What did you learn?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Title" htmlFor="title" required error={errors.title?.message}>
            <Input
              id="title"
              autoFocus={!id}
              placeholder="e.g. Covering indexes avoid key lookups in SQL Server"
              aria-invalid={Boolean(errors.title) || undefined}
              {...register('title')}
            />
          </Field>
          <Field label="Details" htmlFor="description" hint="Explain it in your own words.">
            <Textarea id="description" rows={5} {...register('description')} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date" htmlFor="entry_date" required error={errors.entry_date?.message}>
              <Input id="entry_date" type="date" {...register('entry_date')} />
            </Field>
            <Field label="Time" htmlFor="entry_time">
              <Input id="entry_time" type="time" {...register('entry_time')} />
            </Field>
          </div>
          <Field
            label="Occasion / situation"
            htmlFor="occasion"
            hint="What was happening when you learned this?"
          >
            <Textarea id="occasion" rows={2} {...register('occasion')} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Where did it come from?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" htmlFor="category" required error={errors.category?.message}>
              <Controller
                control={control}
                name="category"
                render={({ field, fieldState }) => (
                  <SelectField
                    id="category"
                    value={field.value}
                    onChange={field.onChange}
                    options={LEARNING_CATEGORIES}
                    placeholder="Choose a category"
                    invalid={fieldState.invalid}
                  />
                )}
              />
            </Field>
            <Field label="Learning source" htmlFor="source" required error={errors.source?.message}>
              <Controller
                control={control}
                name="source"
                render={({ field, fieldState }) => (
                  <SelectField
                    id="source"
                    value={field.value}
                    onChange={field.onChange}
                    options={LEARNING_SOURCES}
                    placeholder="Manager, book, YouTube…"
                    invalid={fieldState.invalid}
                  />
                )}
              />
            </Field>
          </div>
          <Field
            label="Learned from"
            htmlFor="learned_from"
            hint="Person's name, book title, course name… Names you used before are suggested."
          >
            <Input
              id="learned_from"
              list={peopleListId}
              autoComplete="off"
              placeholder={LEARNED_FROM_PLACEHOLDER[source] ?? 'Who or what taught you this?'}
              {...register('learned_from')}
            />
            <datalist id={peopleListId}>
              {people.map((p) => (
                <option key={p.name} value={p.name} />
              ))}
            </datalist>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Make it useful</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field
            label="Practical application"
            htmlFor="practical_application"
            hint="Where can you apply this?"
          >
            <Textarea id="practical_application" rows={3} {...register('practical_application')} />
          </Field>
          <Field label="Importance">
            <Controller
              control={control}
              name="importance"
              render={({ field }) => (
                <RatingInput
                  aria-label="Importance"
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? 3)}
                  labels={IMPORTANCE_LABELS}
                />
              )}
            />
          </Field>
          <Field label="Tags" htmlFor="tags">
            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <TagInput id="tags" value={field.value} onChange={field.onChange} />
              )}
            />
          </Field>
          <Field
            label="Related mistakes"
            hint="Did a mistake teach you this? Link it so you can see the connection later."
          >
            <Controller
              control={control}
              name="mistakes"
              render={({ field }) => (
                <EntryLinkPicker kind="mistakes" value={field.value} onChange={field.onChange} />
              )}
            />
          </Field>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
        <Button type="button" variant="ghost" onClick={goBack}>
          Cancel
        </Button>
        {!id && (
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={submit(true)}>
            Save &amp; add another
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : id ? 'Save changes' : 'Save learning'}
        </Button>
      </div>
    </form>
  )
}
