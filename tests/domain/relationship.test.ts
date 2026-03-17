import { describe, it, expect } from 'vitest'
import { RelationshipSchema } from '../../domain/entities/relationship'
import {
  validateNoSelfRelation,
  validateRelationshipDates,
  isDuplicateRelationship,
  validateRelationship,
} from '../../domain/rules/relationshipRules'
import type { Relationship } from '../../domain/entities/relationship'

const P1    = '123e4567-e89b-4d3a-a456-426614174000'
const P2    = '987fcdeb-51a2-4b78-9c67-890123456789'
const TREE  = 'fedcba98-7654-4321-89ab-cdef01234567'
const REL   = 'abcdef01-2345-4678-9abc-def012345678'

describe('Relationship Entity', () => {
  describe('RelationshipSchema', () => {
    it('menerima relasi parent valid', () => {
      expect(RelationshipSchema.safeParse({
        id: REL, treeId: TREE, personId: P1, relatedPersonId: P2, relationshipType: 'parent',
      }).success).toBe(true)
    })

    it('menerima relasi spouse valid', () => {
      expect(RelationshipSchema.safeParse({
        id: REL, treeId: TREE, personId: P1, relatedPersonId: P2, relationshipType: 'spouse',
      }).success).toBe(true)
    })

    it('gagal jika relationship_type tidak valid', () => {
      expect(RelationshipSchema.safeParse({
        id: REL, treeId: TREE, personId: P1, relatedPersonId: P2, relationshipType: 'sibling',
      }).success).toBe(false)
    })
  })
})

describe('Relationship Rules', () => {
  describe('validateNoSelfRelation', () => {
    it('valid jika dua orang berbeda', () => {
      expect(validateNoSelfRelation(P1, P2)).toEqual({ valid: true })
    })

    it('tidak valid jika id sama', () => {
      expect(validateNoSelfRelation(P1, P1).valid).toBe(false)
    })
  })

  describe('validateRelationshipDates', () => {
    it('valid tanpa tanggal', () => {
      expect(validateRelationshipDates(null, null)).toEqual({ valid: true })
    })

    it('valid jika cerai setelah nikah', () => {
      expect(validateRelationshipDates('2000-01-01', '2010-01-01')).toEqual({ valid: true })
    })

    it('tidak valid jika cerai sebelum nikah', () => {
      expect(validateRelationshipDates('2010-01-01', '2000-01-01').valid).toBe(false)
    })
  })

  describe('isDuplicateRelationship', () => {
    const existing: Relationship[] = [
      { id: REL, treeId: TREE, personId: P1, relatedPersonId: P2, relationshipType: 'spouse' },
    ]

    it('terdeteksi duplikat relasi yang sama', () => {
      expect(isDuplicateRelationship(existing, P1, P2, 'spouse')).toBe(true)
    })

    it('terdeteksi duplikat meski urutan terbalik', () => {
      expect(isDuplicateRelationship(existing, P2, P1, 'spouse')).toBe(true)
    })

    it('tidak duplikat jika tipe berbeda', () => {
      expect(isDuplicateRelationship(existing, P1, P2, 'parent')).toBe(false)
    })

    it('tidak duplikat jika belum ada', () => {
      expect(isDuplicateRelationship([], P1, P2, 'spouse')).toBe(false)
    })
  })

  describe('validateRelationship', () => {
    it('tidak ada error untuk relasi valid', () => {
      const errors = validateRelationship({ personId: P1, relatedPersonId: P2, relationshipType: 'parent' })
      expect(errors.every((r) => r.valid)).toBe(true)
    })

    it('error jika self-relation', () => {
      const errors = validateRelationship({ personId: P1, relatedPersonId: P1, relationshipType: 'parent' })
      expect(errors.some((r) => !r.valid)).toBe(true)
    })
  })
})
