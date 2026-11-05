import { Link, useRouteError } from 'react-router'
import { EmptyState } from '@/components/common/PageHeader'

export function RouteError() {
  const error = useRouteError() as Error | undefined
  return (
    <div className="p-6">
      <EmptyState title="Something went wrong">
        <p className="mb-2">{error?.message ?? 'Unexpected error'}</p>
        <Link to="/" className="underline underline-offset-4">
          Go to dashboard
        </Link>
      </EmptyState>
    </div>
  )
}
