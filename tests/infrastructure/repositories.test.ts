import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SupabasePersonRepository } from '../../infrastructure/repositories/SupabasePersonRepository'
import { SupabaseTreeRepository } from '../../infrastructure/repositories/SupabaseTreeRepository'
import { SupabaseRelationshipRepository } from '../../infrastructure/repositories/SupabaseRelationshipRepository'

// ─── Mock Supabase builder ────────────────────────────────────────────────────

function makeClient(returnData: unknown, returnError: unknown = null) {
  const single  = vi.fn().mockResolvedValue({ data: returnData, error: returnError })
  const select  = vi.fn().mockReturnValue({ single, maybeSingle: single, order: vi.fn().mockReturnValue({ data: returnData, error: returnError }) })
  const insert  = vi.fn().mockReturnValue({ select })
  const update  = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ select }) })
  const del     = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
  const eqChain = { eq: vi.fn(), order: vi.fn(), maybeSingle: single, not: vi.fn(), or: vi.fn() }

  // eq().order() and eq().maybeSingle() chains
  eqChain.eq.mockReturnValue(eqChain)
  eqChain.order.mockResolvedValue({ data: returnData, error: returnError })
  eqChain.not.mockReturnValue(eqChain)
  eqChain.or.mockReturnValue({ order: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue({ data: returnData, error: returnError }) }) })

  const from = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue(eqChain),
    insert,
    update,
    delete: del,
  })

  return { from } as unknown as Parameters<typeof SupabasePersonRepository>[0]
}

// ─── Test data ────────────────────────────────────────────────────────────────

const TREE = 'fedcba98-7654-4321-89ab-cdef01234567'
const P_ID = '123e4567-e89b-4d3a-a456-426614174000'

const dbPerson = {
  id: P_ID, tree_id: TREE, gedcom_id: null,
  first_name: 'Budi', last_name: 'Santoso', nickname: null,
  gender: 'M', birth_date: '1950-01-01', birth_place: null,
  death_date: null, death_place: null, is_alive: true,
  photo_url: null, phone: null, email: null, address: null, notes: null,
  created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
}

const dbTree = {
  id: TREE, owner_id: P_ID, name: 'Trah Santoso',
  description: null, root_person_id: null,
  created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
}

// ─── PersonRepository ─────────────────────────────────────────────────────────

describe('SupabasePersonRepository', () => {
  it('getById mengembalikan Person dari DB row', async () => {
    const client = makeClient(dbPerson)
    const repo = new SupabasePersonRepository(client)
    const person = await repo.getById(P_ID)
    expect(person).not.toBeNull()
    expect(person?.firstName).toBe('Budi')
    expect(person?.treeId).toBe(TREE)
    expect(person?.birthDate).toBe('1950-01-01')
  })

  it('getById mengembalikan null jika tidak ada', async () => {
    const client = makeClient(null)
    const repo = new SupabasePersonRepository(client)
    const person = await repo.getById(P_ID)
    expect(person).toBeNull()
  })

  it('create mengembalikan Person setelah insert', async () => {
    const client = makeClient(dbPerson)
    const repo = new SupabasePersonRepository(client)
    const person = await repo.create({ treeId: TREE, firstName: 'Budi', gender: 'M', isAlive: true })
    expect(person.firstName).toBe('Budi')
    expect(person.treeId).toBe(TREE)
  })

  it('getById melempar error jika query gagal', async () => {
    const client = makeClient(null, { message: 'DB error', code: '500' })
    const repo = new SupabasePersonRepository(client)
    await expect(repo.getById(P_ID)).rejects.toMatchObject({ message: 'DB error' })
  })
})

// ─── TreeRepository ───────────────────────────────────────────────────────────

describe('SupabaseTreeRepository', () => {
  it('getById mengembalikan Tree dari DB row', async () => {
    const client = makeClient(dbTree)
    const repo = new SupabaseTreeRepository(client)
    const tree = await repo.getById(TREE)
    expect(tree).not.toBeNull()
    expect(tree?.name).toBe('Trah Santoso')
    expect(tree?.ownerId).toBe(P_ID)
  })

  it('getById mengembalikan null jika tidak ada', async () => {
    const client = makeClient(null)
    const repo = new SupabaseTreeRepository(client)
    const tree = await repo.getById(TREE)
    expect(tree).toBeNull()
  })

  it('create mengembalikan Tree setelah insert', async () => {
    const client = makeClient(dbTree)
    const repo = new SupabaseTreeRepository(client)
    const tree = await repo.create({ ownerId: P_ID, name: 'Trah Santoso' })
    expect(tree.name).toBe('Trah Santoso')
  })
})

// ─── RelationshipRepository ───────────────────────────────────────────────────

const P2 = 'abcdef01-2345-4678-9abc-def012345678'
const REL = 'a1b2c3d4-e5f6-4789-8abc-def012345678'

const dbRel = {
  id: REL, tree_id: TREE, person_id: P_ID, related_person_id: P2,
  relationship_type: 'parent', marriage_date: null, divorce_date: null,
  created_at: '2024-01-01T00:00:00Z',
}

describe('SupabaseRelationshipRepository', () => {
  it('create mengembalikan Relationship yang dimapping dengan benar', async () => {
    const client = makeClient(dbRel)
    const repo = new SupabaseRelationshipRepository(client)
    const rel = await repo.create({
      treeId: TREE, personId: P_ID, relatedPersonId: P2, relationshipType: 'parent',
    })
    expect(rel.treeId).toBe(TREE)
    expect(rel.personId).toBe(P_ID)
    expect(rel.relatedPersonId).toBe(P2)
    expect(rel.relationshipType).toBe('parent')
  })
})
