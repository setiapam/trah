/**
 * Mapper antara snake_case database rows dan camelCase domain entities.
 */

import type { Person, CreatePersonInput } from '../../domain/entities/person'
import type { Tree, CreateTreeInput } from '../../domain/entities/tree'
import type { Relationship, CreateRelationshipInput } from '../../domain/entities/relationship'
import type { Media, CreateMediaInput } from '../../domain/entities/media'
import type { TreeMember } from '../../domain/entities/treeMember'

// ─── Person ──────────────────────────────────────────────────────────────────

export function personFromDB(row: Record<string, unknown>): Person {
  return {
    id: row.id as string,
    treeId: row.tree_id as string,
    gedcomId: (row.gedcom_id as string | null) ?? null,
    firstName: row.first_name as string,
    lastName: (row.last_name as string | null) ?? null,
    nickname: (row.nickname as string | null) ?? null,
    gender: (row.gender as 'M' | 'F' | 'U') ?? 'U',
    birthDate: (row.birth_date as string | null) ?? null,
    birthPlace: (row.birth_place as string | null) ?? null,
    deathDate: (row.death_date as string | null) ?? null,
    deathPlace: (row.death_place as string | null) ?? null,
    isAlive: row.is_alive as boolean,
    photoUrl: (row.photo_url as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    address: (row.address as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    linkedPersonId: (row.linked_person_id as string | null) ?? null,
    linkedFromTreeId: (row.linked_from_tree_id as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function personToInsert(p: CreatePersonInput): Record<string, unknown> {
  return {
    tree_id: p.treeId,
    gedcom_id: p.gedcomId ?? null,
    first_name: p.firstName,
    last_name: p.lastName ?? null,
    nickname: p.nickname ?? null,
    gender: p.gender ?? 'U',
    birth_date: p.birthDate ?? null,
    birth_place: p.birthPlace ?? null,
    death_date: p.deathDate ?? null,
    death_place: p.deathPlace ?? null,
    is_alive: p.isAlive ?? true,
    photo_url: p.photoUrl ?? null,
    phone: p.phone ?? null,
    email: p.email ?? null,
    address: p.address ?? null,
    notes: p.notes ?? null,
    linked_person_id: p.linkedPersonId ?? null,
    linked_from_tree_id: p.linkedFromTreeId ?? null,
  }
}

export function personToUpdate(p: Partial<CreatePersonInput>): Record<string, unknown> {
  const obj: Record<string, unknown> = {}
  if (p.gedcomId !== undefined) obj.gedcom_id = p.gedcomId
  if (p.firstName !== undefined) obj.first_name = p.firstName
  if (p.lastName !== undefined) obj.last_name = p.lastName
  if (p.nickname !== undefined) obj.nickname = p.nickname
  if (p.gender !== undefined) obj.gender = p.gender
  if (p.birthDate !== undefined) obj.birth_date = p.birthDate
  if (p.birthPlace !== undefined) obj.birth_place = p.birthPlace
  if (p.deathDate !== undefined) obj.death_date = p.deathDate
  if (p.deathPlace !== undefined) obj.death_place = p.deathPlace
  if (p.isAlive !== undefined) obj.is_alive = p.isAlive
  if (p.photoUrl !== undefined) obj.photo_url = p.photoUrl
  if (p.phone !== undefined) obj.phone = p.phone
  if (p.email !== undefined) obj.email = p.email
  if (p.address !== undefined) obj.address = p.address
  if (p.notes !== undefined) obj.notes = p.notes
  return obj
}

// ─── Tree ─────────────────────────────────────────────────────────────────────

export function treeFromDB(row: Record<string, unknown>): Tree {
  return {
    id: row.id as string,
    ownerId: row.owner_id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    rootPersonId: (row.root_person_id as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function treeToInsert(t: CreateTreeInput): Record<string, unknown> {
  return {
    owner_id: t.ownerId,
    name: t.name,
    description: t.description ?? null,
    root_person_id: t.rootPersonId ?? null,
  }
}

// ─── Relationship ─────────────────────────────────────────────────────────────

export function relationshipFromDB(row: Record<string, unknown>): Relationship {
  return {
    id: row.id as string,
    treeId: row.tree_id as string,
    personId: row.person_id as string,
    relatedPersonId: row.related_person_id as string,
    relationshipType: row.relationship_type as 'parent' | 'spouse',
    marriageDate: (row.marriage_date as string | null) ?? null,
    divorceDate: (row.divorce_date as string | null) ?? null,
    createdAt: row.created_at as string,
  }
}

export function relationshipToInsert(r: CreateRelationshipInput): Record<string, unknown> {
  return {
    tree_id: r.treeId,
    person_id: r.personId,
    related_person_id: r.relatedPersonId,
    relationship_type: r.relationshipType,
    marriage_date: r.marriageDate ?? null,
    divorce_date: r.divorceDate ?? null,
  }
}

// ─── Media ────────────────────────────────────────────────────────────────────

export function mediaFromDB(row: Record<string, unknown>): Media {
  return {
    id: row.id as string,
    personId: row.person_id as string,
    treeId: row.tree_id as string,
    fileUrl: row.file_url as string,
    fileType: row.file_type as string,
    caption: (row.caption as string | null) ?? null,
    createdAt: row.created_at as string,
  }
}

export function mediaToInsert(m: CreateMediaInput): Record<string, unknown> {
  return {
    person_id: m.personId,
    tree_id: m.treeId,
    file_url: m.fileUrl,
    file_type: m.fileType,
    caption: m.caption ?? null,
  }
}

// ─── TreeMember ───────────────────────────────────────────────────────────────

export function treeMemberFromDB(row: Record<string, unknown>): TreeMember {
  return {
    id: row.id as string,
    treeId: row.tree_id as string,
    userId: (row.user_id as string | null) ?? null,
    role: row.role as 'owner' | 'editor' | 'viewer',
    invitedAt: row.invited_at as string,
    acceptedAt: (row.accepted_at as string | null) ?? null,
    invitedEmail: (row.invited_email as string | null) ?? null,
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}
