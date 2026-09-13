import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuthSession } from '../hooks/useAuthSession'

async function postJson(path: string, password: string): Promise<Response> {
  return fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
}

async function requestUnlock(password: string): Promise<string> {
  const response = await postJson('/unlock', password)
  if (response.ok) {
    const data = (await response.json()) as { token: string }
    return data.token
  }

  const body = (await response.json().catch(() => null)) as {
    detail?: string
  } | null
  if (response.status === 401 && body?.detail === 'no password set') {
    const setupResponse = await postJson('/setup', password)
    if (!setupResponse.ok) {
      throw new Error('Could not set up a password. Please try again.')
    }
    return requestUnlock(password)
  }

  throw new Error('Incorrect password.')
}

function Unlock() {
  const { setToken } = useAuthSession()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const token = await requestUnlock(password)
      setToken(token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-[var(--border)] p-6"
      >
        <h1 className="mb-4 text-xl font-medium text-[var(--text-h)]">
          Unlock your notes
        </h1>
        <label htmlFor="password" className="mb-1 block text-sm">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoFocus
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mb-3 w-full rounded border border-[var(--border)] px-3 py-2 text-[var(--text-h)]"
        />
        {error && (
          <p role="alert" className="mb-3 text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting || password.length === 0}
          className="w-full rounded bg-[var(--accent)] px-3 py-2 font-medium text-white disabled:opacity-50"
        >
          Unlock
        </button>
      </form>
    </div>
  )
}

export default Unlock
