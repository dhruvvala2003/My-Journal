import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export interface AuthState {
  session: Session | null
  /** True until the stored session has been checked on startup. */
  loading: boolean
}

export const AuthContext = createContext<AuthState>({ session: null, loading: true })

export function useAuth() {
  return useContext(AuthContext)
}
