import { describe, it, expect } from 'vitest'
import {
  PersonSchema,
  CreatePersonSchema,
  getFullName,
  getDisplayName,
  getAge,
  isDeceased,
} from '../../domain/entities/person'

const P1 = '123e4567-e89b-4d3a-a456-426614174000'
const TREE = 'fedcba98-7654-4321-89ab-cdef01234567'

describe('Person Entity', () => {
  const validPerson = {
    id: P1,
    treeId: TREE,
    firstName: 'Budi',
    lastName: 'Santoso',
    gender: 'M' as const,
    isAlive: true,
  }

  describe('PersonSchema', () => {
    it('menerima data valid', () => {
      expect(PersonSchema.safeParse(validPerson).success).toBe(true)
    })

    it('gagal jika firstName kosong', () => {
      expect(PersonSchema.safeParse({ ...validPerson, firstName: '' }).success).toBe(false)
    })

    it('gagal jika id bukan UUID', () => {
      expect(PersonSchema.safeParse({ ...validPerson, id: 'bukan-uuid' }).success).toBe(false)
    })

    it('gagal jika email tidak valid', () => {
      expect(PersonSchema.safeParse({ ...validPerson, email: 'bukan-email' }).success).toBe(false)
    })

    it('menerima email null', () => {
      expect(PersonSchema.safeParse({ ...validPerson, email: null }).success).toBe(true)
    })

    it('default gender adalah U', () => {
      const result = CreatePersonSchema.safeParse({ treeId: TREE, firstName: 'Test' })
      expect(result.success).toBe(true)
      if (result.success) expect(result.data.gender).toBe('U')
    })

    it('default isAlive adalah true', () => {
      const result = CreatePersonSchema.safeParse({ treeId: TREE, firstName: 'Test' })
      expect(result.success).toBe(true)
      if (result.success) expect(result.data.isAlive).toBe(true)
    })

    it('menolak gender selain M/F/U', () => {
      expect(PersonSchema.safeParse({ ...validPerson, gender: 'X' }).success).toBe(false)
    })
  })

  describe('getFullName', () => {
    it('menggabungkan firstName dan lastName', () => {
      expect(getFullName({ firstName: 'Budi', lastName: 'Santoso' })).toBe('Budi Santoso')
    })

    it('hanya firstName jika lastName null', () => {
      expect(getFullName({ firstName: 'Budi', lastName: null })).toBe('Budi')
    })
  })

  describe('getDisplayName', () => {
    it('mengembalikan nickname jika ada', () => {
      expect(getDisplayName({ firstName: 'Budi', lastName: 'Santoso', nickname: 'Pak Budi' })).toBe('Pak Budi')
    })

    it('mengembalikan fullName jika nickname null', () => {
      expect(getDisplayName({ firstName: 'Budi', lastName: 'Santoso', nickname: null })).toBe('Budi Santoso')
    })
  })

  describe('isDeceased', () => {
    it('true jika isAlive false', () => expect(isDeceased({ isAlive: false, deathDate: null })).toBe(true))
    it('true jika deathDate terisi', () => expect(isDeceased({ isAlive: true, deathDate: '2020-01-01' })).toBe(true))
    it('false jika masih hidup', () => expect(isDeceased({ isAlive: true, deathDate: null })).toBe(false))
  })

  describe('getAge', () => {
    it('mengembalikan null jika birthDate kosong', () => {
      expect(getAge({ birthDate: null, deathDate: null, isAlive: true })).toBeNull()
    })

    it('menghitung usia dari tanggal lahir ke wafat', () => {
      expect(getAge({ birthDate: '1950-01-01', deathDate: '2010-01-01', isAlive: false })).toBe(60)
    })
  })
})
