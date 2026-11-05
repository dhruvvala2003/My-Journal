import { useState } from 'react'
import { DownloadIcon, LogOutIcon } from 'lucide-react'
import { useTheme, type Theme } from '@/lib/theme-context'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/common/PageHeader'
import { SelectField } from '@/components/common/SelectField'
import { supabase } from '@/lib/supabase'
import { todayISO } from '@/lib/dates'
import type { Learning, Mistake } from '@/lib/types'
import { useAuth } from '@/features/auth/auth-context'
import { exportAllData, useSaveSettings, useSettings } from './api'
import { downloadFile, journalToMarkdown } from './markdown'

const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Same as device' },
]
const WEEK_STARTS = [
  { value: '1', label: 'Monday' },
  { value: '0', label: 'Sunday' },
]

export function SettingsPage() {
  const { session } = useAuth()
  const { theme, setTheme } = useTheme()
  const { data: settings } = useSettings()
  const saveSettings = useSaveSettings()
  const [exporting, setExporting] = useState<'json' | 'md' | null>(null)

  const doExport = async (kind: 'json' | 'md') => {
    setExporting(kind)
    try {
      const data = await exportAllData()
      const stamp = todayISO()
      if (kind === 'json') {
        downloadFile(`evolve-backup-${stamp}.json`, JSON.stringify(data, null, 2), 'application/json')
      } else {
        downloadFile(
          `evolve-journal-${stamp}.md`,
          journalToMarkdown(data.learnings as unknown as Learning[], data.mistakes as unknown as Mistake[]),
          'text/markdown',
        )
      }
      toast.success(`Exported ${data.learnings.length} learnings and ${data.mistakes.length} mistakes`)
    } catch (e) {
      toast.error(`Export failed: ${(e as Error).message}`)
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <PageHeader title="Settings" />

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="block max-w-xs space-y-1.5">
            <span className="text-sm font-medium">Theme</span>
            <SelectField value={theme} onChange={(v) => setTheme(v as Theme)} options={THEMES} />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Journal</CardTitle>
          <CardDescription>Used by weekly reviews and “this week” counts.</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="block max-w-xs space-y-1.5">
            <span className="text-sm font-medium">Week starts on</span>
            <SelectField
              value={String(settings?.week_starts_on ?? 1)}
              onChange={(v) =>
                saveSettings.mutate(
                  { week_starts_on: Number(v) as 0 | 1 },
                  {
                    onSuccess: () => toast.success('Saved'),
                    onError: (e) => toast.error(e.message),
                  },
                )
              }
              options={WEEK_STARTS}
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup &amp; export</CardTitle>
          <CardDescription>
            Supabase’s free plan has no backups you can download, so export your journal regularly
            (e.g. once a month) and keep the file somewhere safe.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => doExport('json')} disabled={exporting !== null}>
            <DownloadIcon />
            {exporting === 'json' ? 'Exporting…' : 'Full backup (JSON)'}
          </Button>
          <Button variant="outline" onClick={() => doExport('md')} disabled={exporting !== null}>
            <DownloadIcon />
            {exporting === 'md' ? 'Exporting…' : 'Readable journal (Markdown)'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Signed in as {session?.user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => supabase.auth.signOut()}>
            <LogOutIcon />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
