import { createContext, useContext } from 'react'

export interface AuthSessionContextValue {
  token: string | null
  setToken: (token: string) => void
  clearToken: () => void
}

export const AuthSessionContext = createContext<AuthSessionContextValue | null>(
  null,
)

export function useAuthSession(): AuthSessionContextValue {
  const context = useContext(AuthSessionContext)
  if (context === null) {
    throw new Error('useAuthSession must be used within an AuthSessionProvider')
  }
  return context
}
