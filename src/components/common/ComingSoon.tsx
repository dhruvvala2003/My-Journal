import type { ReactNode } from 'react'
import { ConstructionIcon } from 'lucide-react'
import { PageHeader } from './PageHeader'

export function ComingSoon({
  title,
  phase,
  children,
}: {
  title: string
  phase: number
  children: ReactNode
}) {
  return (
    <>
      <PageHeader title={title} />
      <div className="rounded-xl border border-dashed p-8 text-center">
        <ConstructionIcon className="mx-auto mb-3 size-8 text-muted-foreground" />
        <p className="font-medium">Arrives in Phase {phase}</p>
        <div className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{children}</div>
      </div>
    </>
  )
}
