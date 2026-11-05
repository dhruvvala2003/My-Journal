import {
  LEARNING_CATEGORIES,
  LEARNING_SOURCES,
  MISTAKE_CATEGORIES,
  MISTAKE_LOCATIONS,
  MISTAKE_STATUSES,
  labelOf,
} from '@/lib/constants'
import type { Learning, Mistake } from '@/lib/types'

const byDateDesc = (a: { entry_date: string }, b: { entry_date: string }) =>
  b.entry_date.localeCompare(a.entry_date)

function block(label: string, text: string) {
  return text.trim() ? `**${label}:** ${text.trim()}\n\n` : ''
}

/** Human-readable copy of the journal, for reading anywhere (Obsidian, Notion, GitHub…). */
export function journalToMarkdown(learnings: Learning[], mistakes: Mistake[]): string {
  let md = `# Evolve journal\n\nExported ${new Date().toLocaleString()}\n\n`

  md += `## Learnings (${learnings.length})\n\n`
  for (const l of [...learnings].sort(byDateDesc)) {
    md += `### ${l.entry_date} — ${l.title}\n\n`
    md += `- Category: ${labelOf(LEARNING_CATEGORIES, l.category)}\n`
    md += `- Source: ${labelOf(LEARNING_SOURCES, l.source)}${l.learned_from ? ` (${l.learned_from})` : ''}\n`
    md += `- Importance: ${l.importance}/5\n`
    if (l.tags.length) md += `- Tags: ${l.tags.map((t) => `#${t}`).join(' ')}\n`
    md += '\n'
    if (l.description.trim()) md += `${l.description.trim()}\n\n`
    md += block('Occasion', l.occasion)
    md += block('Practical application', l.practical_application)
  }

  md += `## Mistakes (${mistakes.length})\n\n`
  for (const m of [...mistakes].sort(byDateDesc)) {
    md += `### ${m.entry_date} — ${m.title}\n\n`
    md += `- Where: ${labelOf(MISTAKE_LOCATIONS, m.location)} · Category: ${labelOf(MISTAKE_CATEGORIES, m.category)}\n`
    md += `- Severity: ${m.severity}/5${m.self_rating ? ` · Self-rating: ${m.self_rating}/5` : ''} · Status: ${labelOf(MISTAKE_STATUSES, m.status)}\n`
    if (m.tags.length) md += `- Tags: ${m.tags.map((t) => `#${t}`).join(' ')}\n`
    md += '\n'
    if (m.description.trim()) md += `${m.description.trim()}\n\n`
    md += block('Occasion', m.occasion)
    md += block('Why', m.why_happened)
    md += block('Root cause', m.root_cause)
    md += block('Impact', m.impact)
    md += block('How I handled it', m.how_handled)
    md += block('Lesson', m.lesson_learned)
    md += block('Next time', m.do_differently)
  }
  return md
}

export function downloadFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
