import { createBrowserRouter, Link } from 'react-router'
import { ComingSoon } from '@/components/common/ComingSoon'
import { EmptyState } from '@/components/common/PageHeader'
import { LoginPage } from '@/features/auth/LoginPage'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { LearningFormPage, MistakeFormPage } from '@/features/entries/EntryFormPages'
import { LearningDetailPage } from '@/features/learnings/LearningDetailPage'
import { LearningsPage } from '@/features/learnings/LearningsPage'
import { MistakeDetailPage } from '@/features/mistakes/MistakeDetailPage'
import { MistakesPage } from '@/features/mistakes/MistakesPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { AppLayout } from './AppLayout'
import { RouteError } from './RouteError'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    errorElement: <RouteError />,
    children: [
      {
        element: <AppLayout />,
        errorElement: <RouteError />,
        children: [
          { index: true, element: <DashboardPage /> },

          { path: 'learnings', element: <LearningsPage /> },
          { path: 'learnings/new', element: <LearningFormPage /> },
          { path: 'learnings/:id', element: <LearningDetailPage /> },
          { path: 'learnings/:id/edit', element: <LearningFormPage /> },

          { path: 'mistakes', element: <MistakesPage /> },
          { path: 'mistakes/new', element: <MistakeFormPage /> },
          { path: 'mistakes/:id', element: <MistakeDetailPage /> },
          { path: 'mistakes/:id/edit', element: <MistakeFormPage /> },

          {
            path: 'calendar',
            element: (
              <ComingSoon title="Learning Calendar" phase={4}>
                A monthly calendar and activity heatmap showing the days you recorded learnings
                and mistakes. Click any day to see its entries.
              </ComingSoon>
            ),
          },
          {
            path: 'reviews/weekly',
            element: (
              <ComingSoon title="Weekly Review" phase={5}>
                An automatic summary of your week (totals, top learnings, repeated mistakes) plus
                your own reflection, rating and goals for next week.
              </ComingSoon>
            ),
          },
          {
            path: 'reviews/monthly',
            element: (
              <ComingSoon title="Monthly Review" phase={5}>
                Category and source breakdowns, comparison with last month, best learning,
                biggest mistake, growth rating and goals.
              </ComingSoon>
            ),
          },
          {
            path: 'growth',
            element: (
              <ComingSoon title="Growth Analytics" phase={7}>
                Your weekly and monthly self-ratings in 8 areas, with trends, comparisons and an
                overall growth score.
              </ComingSoon>
            ),
          },
          {
            path: 'insights',
            element: (
              <ComingSoon title="AI Journal Insights" phase={8}>
                AI summaries of your progress and an “Ask My Journal” chat — using only your own
                saved entries.
              </ComingSoon>
            ),
          },
          { path: 'settings', element: <SettingsPage /> },
          {
            path: '*',
            element: (
              <EmptyState title="Page not found">
                <Link to="/" className="underline underline-offset-4">
                  Go to dashboard
                </Link>
              </EmptyState>
            ),
          },
        ],
      },
    ],
  },
])
