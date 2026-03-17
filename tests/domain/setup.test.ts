import { describe, it, expect } from 'vitest'

describe('Project Setup', () => {
  it('test runner is working', () => {
    expect(true).toBe(true)
  })

  it('environment is configured', () => {
    // Verifikasi bahwa vitest bisa berjalan
    expect(typeof process.env).toBe('object')
  })
})
