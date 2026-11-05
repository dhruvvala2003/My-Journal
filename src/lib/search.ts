/**
 * Turns free text into a Postgres prefix tsquery, e.g. "sql serv" -> "sql:* & serv:*".
 * Every word must match (AND); each word also matches longer words (prefix).
 * Only letters/digits are kept, so user input can never break the query syntax.
 */
export function toPrefixTsQuery(input: string): string | null {
  const words = input
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .slice(0, 8)
  if (words.length === 0) return null
  return words.map((w) => `${w}:*`).join(' & ')
}

/** Normalises a tag: trimmed, lower-case, inner spaces become dashes. */
export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, '-').replace(/^#/, '').slice(0, 40)
}
