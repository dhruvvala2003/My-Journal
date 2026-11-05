import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { isSupabaseConfigured } from '@/lib/supabase'
import { ThemeProvider } from '@/lib/ThemeProvider'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { SetupRequired } from '@/features/auth/LoginPage'
import { router } from '@/app/router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
})

export default function App() {
  return (
    <ThemeProvider>
      {isSupabaseConfigured ? (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <RouterProvider router={router} />
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      ) : (
        <SetupRequired />
      )}
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  )
}
