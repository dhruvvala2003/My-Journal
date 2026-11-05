import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LinkIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { searchEntryRefs } from '@/features/entries/api'
import { useDebouncedValue } from '@/features/entries/useUrlFilters'
import { shortDate } from '@/lib/dates'
import type { EntryRef } from '@/lib/types'

interface EntryLinkPickerProps {
  /** Which kind of entry you are linking TO. */
  kind: 'learnings' | 'mistakes'
  value: EntryRef[]
  onChange: (value: EntryRef[]) => void
}

/** Pick existing learnings/mistakes to connect with the entry being edited. */
export function EntryLinkPicker({ kind, value, onChange }: EntryLinkPickerProps) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [selected, setSelected] = useState('')
  const debounced = useDebouncedValue(text, 250)
  const noun = kind === 'learnings' ? 'learning' : 'mistake'

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['search', 'link-picker', kind, debounced],
    queryFn: () => searchEntryRefs(kind, debounced),
    enabled: open,
  })

  const selectedIds = new Set(value.map((v) => v.id))
  const selectable = results.filter((r) => !selectedIds.has(r.id)).map((r) => r.id)
  const active = selectable.includes(selected) ? selected : (selectable[0] ?? '')

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <ul className="space-y-1">
          {value.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-sm"
            >
              <span className="min-w-0 truncate">
                {e.title}
                <span className="ml-2 text-xs text-muted-foreground">{shortDate(e.entry_date)}</span>
              </span>
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v.id !== e.id))}
                className="shrink-0 rounded text-muted-foreground hover:text-foreground"
                aria-label={`Unlink ${e.title}`}
              >
                <XIcon className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            <LinkIcon />
            Link a {noun}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(24rem,calc(100vw-2rem))] p-0" align="start">
          <Command shouldFilter={false} value={active} onValueChange={setSelected}>
            <CommandInput
              placeholder={`Search your ${kind}…`}
              value={text}
              onValueChange={setText}
            />
            <CommandList>
              <CommandEmpty>{isFetching ? 'Searching…' : `No ${kind} found.`}</CommandEmpty>
              {results.length > 0 && (
                <CommandGroup heading={debounced ? 'Matches' : 'Recent'}>
                  {results.map((r) => (
                    <CommandItem
                      key={r.id}
                      value={r.id}
                      disabled={selectedIds.has(r.id)}
                      onSelect={() => {
                        onChange([...value, r])
                        setOpen(false)
                        setText('')
                      }}
                    >
                      <span className="min-w-0 flex-1 truncate">{r.title}</span>
                      <span className="text-xs text-muted-foreground">{shortDate(r.entry_date)}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
