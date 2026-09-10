import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the header, home content, and footer', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: 'react-template' })).toBeTruthy()
    expect(screen.getByText('It works')).toBeTruthy()
    expect(
      screen.getByText(/react-template/, { selector: 'footer p' }),
    ).toBeTruthy()
  })
})
