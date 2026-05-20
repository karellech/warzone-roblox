import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Login from '../pages/Login'

describe('Login', () => {
  it('affiche le titre WARZONE', () => {
    render(<Login onLogin={vi.fn()} />)
    expect(screen.getByText(/WARZONE/i)).toBeInTheDocument()
  })

  it('affiche une erreur avec de mauvais identifiants', () => {
    render(<Login onLogin={vi.fn()} />)
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'wrong' } })
    fireEvent.click(screen.getByText('CONNEXION'))
    expect(screen.getByText(/Identifiants incorrects/i)).toBeInTheDocument()
  })

  it('appelle onLogin avec les bons identifiants', () => {
    const onLogin = vi.fn()
    render(<Login onLogin={onLogin} />)
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'admin' } })
    // Password input n'est pas un textbox, on le trouve autrement
    const passInput = document.querySelector('input[type="password"]') as HTMLElement
    fireEvent.change(passInput, { target: { value: 'admin' } })
    fireEvent.click(screen.getByText('CONNEXION'))
    expect(onLogin).toHaveBeenCalledTimes(1)
  })
})