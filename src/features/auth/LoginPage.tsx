import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router'
import { SproutIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/common/PageHeader'
import { supabase } from '@/lib/supabase'
import { useAuth } from './auth-context'

export function LoginPage() {
  const { session } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/'
  if (session) return <Navigate to={from} replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) setError(error.message)
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <SproutIcon className="size-5" />
          </div>
          <CardTitle className="text-xl">Evolve</CardTitle>
          <CardDescription>Your learning &amp; mistake journal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Password" htmlFor="password">
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

/** Shown when .env.local / Vercel env vars are missing. */
export function SetupRequired() {
  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Connect Supabase</CardTitle>
          <CardDescription>Evolve needs your Supabase project details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            Create a file named <code className="rounded bg-muted px-1">.env.local</code> in the
            project folder (copy <code className="rounded bg-muted px-1">.env.example</code>) and set:
          </p>
          <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
            {`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...`}
          </pre>
          <p className="text-muted-foreground">
            Then restart <code>npm run dev</code>. On Vercel, add the same two values under Project
            → Settings → Environment Variables and redeploy.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
