import { format, isToday, isYesterday, parseISO } from 'date-fns'

/** Today's date in the user's local timezone, as stored in the database (yyyy-MM-dd). */
export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/** Current local time as HH:mm (for <input type="time">). */
export function nowTime(): string {
  return format(new Date(), 'HH:mm')
}

/** "Today", "Yesterday" or "Wed, 5 Nov 2026". */
export function dayHeading(isoDate: string): string {
  const d = parseISO(isoDate)
  if (isToday(d)) return `Today · ${format(d, 'EEE, d MMM')}`
  if (isYesterday(d)) return `Yesterday · ${format(d, 'EEE, d MMM')}`
  return format(d, 'EEE, d MMM yyyy')
}

/** "5 Nov 2026" */
export function shortDate(isoDate: string): string {
  return format(parseISO(isoDate), 'd MMM yyyy')
}

/** "14:30:00" -> "2:30 PM" */
export function formatTime(time: string | null | undefined): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return format(d, 'h:mm a')
}

/** "14:30:00" -> "14:30" for <input type="time">. */
export function toTimeInput(time: string | null | undefined): string {
  return time ? time.slice(0, 5) : ''
}
