import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { LightbulbIcon, PlusIcon, SearchIcon, TriangleAlertIcon } from 'lucide-react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { searchEntryRefs } from '@/features/entries/api'
import { useDebouncedValue } from '@/features/entries/useUrlFilters'
import { shortDate } from '@/lib/dates'

/** Ctrl+K / ⌘K search across all learnings and mistakes. */
export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [selected, setSelected] = useState('')
  const debounced = useDebouncedValue(text.trim(), 250)
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const { data, isFetching } = useQuery({
    queryKey: ['search', 'global', debounced],
    enabled: open && debounced.length > 0,
    queryFn: async () => {
      const [learnings, mistakes] = await Promise.all([
        searchEntryRefs('learnings', debounced, 6),
        searchEntryRefs('mistakes', debounced, 6),
      ])
      return { learnings, mistakes }
    },
  })

  const values = [
    ...(data?.learnings ?? []).map((r) => `l-${r.id}`),
    ...(data?.mistakes ?? []).map((r) => `m-${r.id}`),
  ]
  const active = values.includes(selected) ? selected : (values[0] ?? '')

  const go = (path: string) => {
    setOpen(false)
    setText('')
    navigate(path)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-8 w-full max-w-xs items-center gap-2 rounded-lg border bg-muted/40 px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
      >
        <SearchIcon className="size-4" />
        <span className="flex-1 text-left">Search journal…</span>
        <kbd className="hidden rounded border bg-background px-1.5 text-[10px] sm:inline">Ctrl K</kbd>
      </button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search your journal"
        description="Search learnings and mistakes"
      >
        <Command shouldFilter={false} value={debounced ? active : undefined} onValueChange={setSelected}>
          <CommandInput
            placeholder="Search learnings and mistakes…"
            value={text}
            onValueChange={setText}
          />
          <CommandList>
            {!debounced ? (
              <CommandGroup heading="Quick actions">
                <CommandItem onSelect={() => go('/learnings/new')}>
                  <PlusIcon />
                  Add learning
                </CommandItem>
                <CommandItem onSelect={() => go('/mistakes/new')}>
                  <PlusIcon />
                  Add mistake
                </CommandItem>
              </CommandGroup>
            ) : (
              <>
                <CommandEmpty>{isFetching ? 'Searching…' : 'Nothing found.'}</CommandEmpty>
                {data && data.learnings.length > 0 && (
                  <CommandGroup heading="Learnings">
                    {data.learnings.map((r) => (
                      <CommandItem key={r.id} value={`l-${r.id}`} onSelect={() => go(`/learnings/${r.id}`)}>
                        <LightbulbIcon className="text-amber-500" />
                        <span className="min-w-0 flex-1 truncate">{r.title}</span>
                        <span className="text-xs text-muted-foreground">{shortDate(r.entry_date)}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {data && data.mistakes.length > 0 && (
                  <CommandGroup heading="Mistakes">
                    {data.mistakes.map((r) => (
                      <CommandItem key={r.id} value={`m-${r.id}`} onSelect={() => go(`/mistakes/${r.id}`)}>
                        <TriangleAlertIcon className="text-red-500" />
                        <span className="min-w-0 flex-1 truncate">{r.title}</span>
                        <span className="text-xs text-muted-foreground">{shortDate(r.entry_date)}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
