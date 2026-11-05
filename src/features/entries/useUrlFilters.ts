import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'

/**
 * Filters live in the URL (?q=sql&category=technical) so they survive a page
 * refresh and the browser Back button returns to the same filtered list.
 */
export function useUrlFilters<K extends string>(keys: readonly K[]) {
  const [params, setParams] = useSearchParams()

  const filters = Object.fromEntries(keys.map((k) => [k, params.get(k) ?? ''])) as Record<
    K,
    string
  >

  const setFilter = (key: K, value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )

  const clear = () => setParams({}, { replace: true })

  const activeCount = keys.filter((k) => k !== 'q' && filters[k]).length

  return { filters, setFilter, clear, activeCount }
}

/** Returns `value` only after it stopped changing for `delay` ms. */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
