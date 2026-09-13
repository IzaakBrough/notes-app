import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the header, unlock screen, and footer when locked', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: 'react-template' })).toBeTruthy()
    expect(screen.getByLabelText('Password')).toBeTruthy()
    expect(
      screen.getByText(/react-template/, { selector: 'footer p' }),
    ).toBeTruthy()
  })
})
