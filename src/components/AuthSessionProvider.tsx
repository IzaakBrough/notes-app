import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthSessionContext } from '../hooks/useAuthSession'
import type { AuthSessionContextValue } from '../hooks/useAuthSession'

function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null)

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      token,
      setToken: (nextToken: string) => setTokenState(nextToken),
      clearToken: () => setTokenState(null),
    }),
    [token],
  )

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  )
}

export default AuthSessionProvider
