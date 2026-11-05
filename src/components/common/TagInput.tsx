import { useId, useState, type KeyboardEvent } from 'react'
import { XIcon } from 'lucide-react'
import { useTags } from '@/features/entries/api'
import { normalizeTag } from '@/lib/search'
import { cn } from '@/lib/utils'

interface TagInputProps {
  id?: string
  value: string[]
  onChange: (tags: string[]) => void
}

/** Type a tag and press Enter or comma. Suggests tags you used before. */
export function TagInput({ id, value, onChange }: TagInputProps) {
  const [text, setText] = useState('')
  const [focused, setFocused] = useState(false)
  const { data: allTags = [] } = useTags()
  const listId = useId()

  const add = (raw: string) => {
    const tag = normalizeTag(raw)
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setText('')
  }
  const remove = (tag: string) => onChange(value.filter((t) => t !== tag))

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (text.trim()) add(text)
    } else if (e.key === 'Backspace' && !text && value.length) {
      remove(value[value.length - 1])
    }
  }

  const needle = normalizeTag(text)
  const suggestions = allTags
    .map((t) => t.tag)
    .filter((t) => !value.includes(t) && (!needle || t.includes(needle)))
    .slice(0, 8)

  return (
    <div className="relative">
      <div
        className={cn(
          'flex min-h-8 flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent px-1.5 py-1 dark:bg-input/30',
          focused && 'border-ring ring-3 ring-ring/50',
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 text-xs"
          >
            #{tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              className="rounded text-muted-foreground hover:text-foreground"
              aria-label={`Remove tag ${tag}`}
            >
              <XIcon className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false)
            if (text.trim()) add(text)
          }}
          placeholder={value.length ? '' : 'Type a tag and press Enter'}
          className="min-w-24 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
          aria-describedby={listId}
          autoComplete="off"
        />
      </div>
      {focused && suggestions.length > 0 && (
        <div
          id={listId}
          className="absolute z-20 mt-1 flex w-full flex-wrap gap-1 rounded-lg border bg-popover p-2 shadow-md"
        >
          <span className="w-full text-xs text-muted-foreground">Your tags</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              // mousedown fires before the input's blur, so the click is not lost
              onMouseDown={(e) => {
                e.preventDefault()
                add(s)
              }}
              className="rounded-md bg-secondary px-1.5 py-0.5 text-xs hover:bg-accent"
            >
              #{s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
