import { useNavigate } from 'react-router'

/** Goes back in history, or to `fallback` if this page was opened directly. */
export function useGoBack(fallback: string) {
  const navigate = useNavigate()
  return () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate(fallback)
  }
}
