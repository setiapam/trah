import { describe, it, expect } from 'vitest'
import {
  personFromDB, personToInsert, personToUpdate,
  treeFromDB, treeToInsert,
  relationshipFromDB, relationshipToInsert,
  mediaFromDB, mediaToInsert,
  treeMemberFromDB,
  chunkArray,
} from '../../infrastructure/repositories/mappers'

const P_ID   = '123e4567-e89b-4d3a-a456-426614174000'
const TREE   = 'fedcba98-7654-4321-89ab-cdef01234567'
const OWNER  = '987fcdeb-51a2-4b78-9c67-890123456789'

// ─── Person mappers ───────────────────────────────────────────────────────────

describe('personFromDB', () => {
  const row = {
    id: P_ID, tree_id: TREE, gedcom_id: '@I1@',
    first_name: 'Budi', last_name: 'Santoso', nickname: 'Pak Budi',
    gender: 'M', birth_date: '1950-01-01', birth_place: 'Solo',
    death_date: null, death_place: null, is_alive: true,
    photo_url: null, phone: null, email: null, address: null, notes: null,
    created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  }

  it('memetakan semua field snake_case ke camelCase', () => {
    const p = personFromDB(row)
    expect(p.id).toBe(P_ID)
    expect(p.treeId).toBe(TREE)
    expect(p.gedcomId).toBe('@I1@')
    expect(p.firstName).toBe('Budi')
    expect(p.lastName).toBe('Santoso')
    expect(p.nickname).toBe('Pak Budi')
    expect(p.gender).toBe('M')
    expect(p.birthDate).toBe('1950-01-01')
    expect(p.birthPlace).toBe('Solo')
    expect(p.isAlive).toBe(true)
  })

  it('null handling untuk field opsional', () => {
    const p = personFromDB({ ...row, last_name: null, gedcom_id: null })
    expect(p.lastName).toBeNull()
    expect(p.gedcomId).toBeNull()
  })
})

describe('personToInsert', () => {
  it('mengonversi camelCase ke snake_case untuk insert', () => {
    const input = { treeId: TREE, firstName: 'Budi', lastName: 'Santoso', gender: 'M' as const, isAlive: true }
    const row = personToInsert(input)
    expect(row.tree_id).toBe(TREE)
    expect(row.first_name).toBe('Budi')
    expect(row.last_name).toBe('Santoso')
    expect(row.gender).toBe('M')
    expect(row.is_alive).toBe(true)
    // field id tidak ada di insert
    expect(row.id).toBeUndefined()
  })
})

describe('personToUpdate', () => {
  it('hanya menginclude field yang di-set', () => {
    const row = personToUpdate({ firstName: 'Siti' })
    expect(row.first_name).toBe('Siti')
    expect(Object.keys(row)).toEqual(['first_name'])
  })

  it('menginclude null untuk field yang di-set ke null', () => {
    const row = personToUpdate({ lastName: null })
    expect(row.last_name).toBeNull()
  })
})

// ─── Tree mappers ─────────────────────────────────────────────────────────────

describe('treeFromDB', () => {
  it('memetakan semua field', () => {
    const row = {
      id: TREE, owner_id: OWNER, name: 'Trah Santoso',
      description: 'Silsilah keluarga', root_person_id: P_ID,
      created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
    }
    const t = treeFromDB(row)
    expect(t.id).toBe(TREE)
    expect(t.ownerId).toBe(OWNER)
    expect(t.name).toBe('Trah Santoso')
    expect(t.rootPersonId).toBe(P_ID)
  })
})

describe('treeToInsert', () => {
  it('mengonversi camelCase ke snake_case', () => {
    const input = { ownerId: OWNER, name: 'Trah Baru', rootPersonId: null }
    const row = treeToInsert(input)
    expect(row.owner_id).toBe(OWNER)
    expect(row.name).toBe('Trah Baru')
    expect(row.root_person_id).toBeNull()
  })
})

// ─── Relationship mappers ─────────────────────────────────────────────────────

const P2 = 'abcdef01-2345-4678-9abc-def012345678'

describe('relationshipFromDB', () => {
  it('memetakan semua field', () => {
    const row = {
      id: 'a1b2c3d4-e5f6-4789-8abc-def012345678',
      tree_id: TREE, person_id: P_ID, related_person_id: P2,
      relationship_type: 'parent', marriage_date: null, divorce_date: null,
      created_at: '2024-01-01T00:00:00Z',
    }
    const r = relationshipFromDB(row)
    expect(r.treeId).toBe(TREE)
    expect(r.personId).toBe(P_ID)
    expect(r.relatedPersonId).toBe(P2)
    expect(r.relationshipType).toBe('parent')
  })
})

describe('relationshipToInsert', () => {
  it('mengonversi ke snake_case', () => {
    const input = { treeId: TREE, personId: P_ID, relatedPersonId: P2, relationshipType: 'spouse' as const }
    const row = relationshipToInsert(input)
    expect(row.tree_id).toBe(TREE)
    expect(row.person_id).toBe(P_ID)
    expect(row.related_person_id).toBe(P2)
    expect(row.relationship_type).toBe('spouse')
  })
})

// ─── Media mappers ────────────────────────────────────────────────────────────

describe('mediaFromDB', () => {
  it('memetakan semua field', () => {
    const row = {
      id: 'a1b2c3d4-e5f6-4789-8abc-def012345678',
      person_id: P_ID, tree_id: TREE,
      file_url: 'https://example.com/photo.jpg', file_type: 'image/jpeg',
      caption: 'Foto keluarga', created_at: '2024-01-01T00:00:00Z',
    }
    const m = mediaFromDB(row)
    expect(m.personId).toBe(P_ID)
    expect(m.treeId).toBe(TREE)
    expect(m.fileUrl).toBe('https://example.com/photo.jpg')
    expect(m.fileType).toBe('image/jpeg')
    expect(m.caption).toBe('Foto keluarga')
  })
})

// ─── TreeMember mappers ───────────────────────────────────────────────────────

describe('treeMemberFromDB', () => {
  it('memetakan semua field termasuk role', () => {
    const row = {
      id: 'a1b2c3d4-e5f6-4789-8abc-def012345678',
      tree_id: TREE, user_id: OWNER, role: 'editor',
      invited_at: '2024-01-01T00:00:00Z', accepted_at: '2024-01-02T00:00:00Z',
    }
    const m = treeMemberFromDB(row)
    expect(m.treeId).toBe(TREE)
    expect(m.userId).toBe(OWNER)
    expect(m.role).toBe('editor')
    expect(m.acceptedAt).toBe('2024-01-02T00:00:00Z')
  })
})

// ─── chunkArray ───────────────────────────────────────────────────────────────

describe('chunkArray', () => {
  it('membagi array menjadi chunks yang benar', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(chunkArray(arr, 2)).toEqual([[1, 2], [3, 4], [5]])
  })

  it('array kosong menghasilkan array kosong', () => {
    expect(chunkArray([], 10)).toEqual([])
  })

  it('chunk lebih besar dari array menghasilkan satu chunk', () => {
    expect(chunkArray([1, 2, 3], 10)).toEqual([[1, 2, 3]])
  })
})
