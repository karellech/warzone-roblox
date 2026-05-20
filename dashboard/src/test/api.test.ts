import { describe, it, expect, vi, beforeEach } from 'vitest'
import { formatDate, formatDuration, GRADE_COLORS } from '../services/api'

// ── Tests des fonctions utilitaires ─────────────────────────
// Ces fonctions sont pures (pas d'appel API) donc faciles à tester

describe('formatDuration', () => {
  it('retourne — si null', () => {
    expect(formatDuration(null)).toBe('—')
  })
  it('formate 300 secondes en 5m00s', () => {
    expect(formatDuration(300)).toBe('5m00s')
  })
  it('formate 245 secondes en 4m05s', () => {
    expect(formatDuration(245)).toBe('4m05s')
  })
  it('formate 60 secondes en 1m00s', () => {
    expect(formatDuration(60)).toBe('1m00s')
  })
})

describe('formatDate', () => {
  it('retourne une chaîne non vide', () => {
    const result = formatDate('2025-01-15T14:30:00')
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })
})

describe('GRADE_COLORS', () => {
  it('contient tous les grades', () => {
    const grades = ['Recrue', 'Soldat', 'Sergent', 'Lieutenant', 'Général']
    grades.forEach(g => {
      expect(GRADE_COLORS[g]).toBeDefined()
    })
  })
})