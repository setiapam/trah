import { describe, it, expect } from 'vitest'
import {
  TreeMemberSchema,
  hasMinRole,
  canEdit,
  canManageMembers,
} from '../../domain/entities/treeMember'

const USER  = '123e4567-e89b-4d3a-a456-426614174000'
const TREE  = 'fedcba98-7654-4321-89ab-cdef01234567'
const MEM   = 'abcdef01-2345-4678-9abc-def012345678'

describe('TreeMember Entity', () => {
  describe('TreeMemberSchema', () => {
    it('menerima role owner', () => {
      expect(TreeMemberSchema.safeParse({ id: MEM, treeId: TREE, userId: USER, role: 'owner' }).success).toBe(true)
    })

    it('gagal jika role tidak valid', () => {
      expect(TreeMemberSchema.safeParse({ id: MEM, treeId: TREE, userId: USER, role: 'admin' }).success).toBe(false)
    })
  })

  describe('hasMinRole', () => {
    it('owner memiliki semua akses', () => {
      expect(hasMinRole('owner', 'viewer')).toBe(true)
      expect(hasMinRole('owner', 'editor')).toBe(true)
      expect(hasMinRole('owner', 'owner')).toBe(true)
    })

    it('editor tidak bisa owner', () => {
      expect(hasMinRole('editor', 'owner')).toBe(false)
      expect(hasMinRole('editor', 'editor')).toBe(true)
      expect(hasMinRole('editor', 'viewer')).toBe(true)
    })

    it('viewer hanya bisa lihat', () => {
      expect(hasMinRole('viewer', 'viewer')).toBe(true)
      expect(hasMinRole('viewer', 'editor')).toBe(false)
      expect(hasMinRole('viewer', 'owner')).toBe(false)
    })
  })

  describe('canEdit', () => {
    it('owner dan editor bisa edit, viewer tidak', () => {
      expect(canEdit('owner')).toBe(true)
      expect(canEdit('editor')).toBe(true)
      expect(canEdit('viewer')).toBe(false)
    })
  })

  describe('canManageMembers', () => {
    it('hanya owner yang bisa manage members', () => {
      expect(canManageMembers('owner')).toBe(true)
      expect(canManageMembers('editor')).toBe(false)
      expect(canManageMembers('viewer')).toBe(false)
    })
  })
})
