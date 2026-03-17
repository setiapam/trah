import { describe, it, expect } from 'vitest'
import { TreeSchema, CreateTreeSchema } from '../../domain/entities/tree'

const OWNER = '123e4567-e89b-4d3a-a456-426614174000'
const TREE  = 'fedcba98-7654-4321-89ab-cdef01234567'

describe('Tree Entity', () => {
  describe('TreeSchema', () => {
    it('menerima data valid', () => {
      expect(TreeSchema.safeParse({ id: TREE, ownerId: OWNER, name: 'Trah Santoso' }).success).toBe(true)
    })

    it('gagal jika name kosong', () => {
      expect(TreeSchema.safeParse({ id: TREE, ownerId: OWNER, name: '' }).success).toBe(false)
    })

    it('gagal jika name lebih dari 100 karakter', () => {
      expect(TreeSchema.safeParse({ id: TREE, ownerId: OWNER, name: 'a'.repeat(101) }).success).toBe(false)
    })

    it('menerima description null', () => {
      expect(TreeSchema.safeParse({ id: TREE, ownerId: OWNER, name: 'Trah', description: null }).success).toBe(true)
    })
  })

  describe('CreateTreeSchema', () => {
    it('valid tanpa id', () => {
      expect(CreateTreeSchema.safeParse({ ownerId: OWNER, name: 'Trah Baru' }).success).toBe(true)
    })
  })
})
