import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import App from '../App'

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

function submitPassword(password: string) {
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: password },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Unlock' }))
}

describe('Unlock', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('shows an inline error on a wrong password', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(401, { detail: 'invalid password' }))
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)
    submitPassword('wrong-password')

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toMatch(/incorrect password/i)
    expect(fetchMock).toHaveBeenCalledWith(
      '/unlock',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('unlocks and shows the main app on a correct password', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(200, { token: 'session-token' }))
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)
    submitPassword('correct-horse-battery-staple')

    expect(await screen.findByText('It works')).toBeTruthy()
  })

  it('sets up a password and unlocks when the backend reports none is set', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, { detail: 'no password set' }))
      .mockResolvedValueOnce(jsonResponse(201, { status: 'ok' }))
      .mockResolvedValueOnce(jsonResponse(200, { token: 'session-token' }))
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)
    submitPassword('a-new-password')

    expect(await screen.findByText('It works')).toBeTruthy()
    expect(fetchMock).toHaveBeenNthCalledWith(1, '/unlock', expect.anything())
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/setup', expect.anything())
    expect(fetchMock).toHaveBeenNthCalledWith(3, '/unlock', expect.anything())
  })
})
