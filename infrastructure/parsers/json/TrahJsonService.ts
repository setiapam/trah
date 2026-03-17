import type { Person, CreatePersonInput } from '../../../domain/entities/person'
import type { Relationship } from '../../../domain/entities/relationship'
import { TrahJsonSchema, type TrahPersonJson, type TrahRelationshipJson } from './schema'

export interface TrahImportResult {
  persons: CreatePersonInput[]
  relationships: Array<{
    personIndex: number
    relatedPersonIndex: number
    relationshipType: 'parent' | 'spouse'
    marriageDate: string | null
    divorceDate: string | null
  }>
  treeName: string
  warnings: string[]
}

export class TrahJsonService {
  /**
   * Export persons and relationships to a Trah JSON string.
   */
  export(persons: Person[], relationships: Relationship[], treeName: string): string {
    // Build persons array without DB-specific fields
    const personList: TrahPersonJson[] = persons.map(p => ({
      gedcomId: p.gedcomId ?? null,
      firstName: p.firstName,
      lastName: p.lastName ?? null,
      nickname: p.nickname ?? null,
      gender: p.gender ?? 'U',
      birthDate: p.birthDate ?? null,
      birthPlace: p.birthPlace ?? null,
      deathDate: p.deathDate ?? null,
      deathPlace: p.deathPlace ?? null,
      isAlive: p.isAlive,
      photoUrl: p.photoUrl ?? null,
      phone: p.phone ?? null,
      email: p.email ?? null,
      address: p.address ?? null,
      notes: p.notes ?? null,
    }))

    // Build index map: personId → index in persons array
    const personIndexMap = new Map<string, number>()
    persons.forEach((p, idx) => personIndexMap.set(p.id, idx))

    // Build relationships array using index references
    const relationshipList: TrahRelationshipJson[] = []
    for (const rel of relationships) {
      const personIndex = personIndexMap.get(rel.personId)
      const relatedPersonIndex = personIndexMap.get(rel.relatedPersonId)

      // Skip if either person is not in the persons array
      if (personIndex === undefined || relatedPersonIndex === undefined) {
        continue
      }

      relationshipList.push({
        personIndex,
        relatedPersonIndex,
        relationshipType: rel.relationshipType,
        marriageDate: rel.marriageDate ?? null,
        divorceDate: rel.divorceDate ?? null,
      })
    }

    const payload = {
      version: '1.0' as const,
      exportedAt: new Date().toISOString(),
      treeName,
      persons: personList,
      relationships: relationshipList,
    }

    return JSON.stringify(payload, null, 2)
  }

  /**
   * Import a Trah JSON string: validate and convert to CreateInput arrays.
   * treeId will be filled by the caller.
   */
  import(jsonString: string): TrahImportResult {
    // Parse raw JSON
    let parsed: unknown
    try {
      parsed = JSON.parse(jsonString)
    }
    catch {
      throw new Error('File JSON tidak valid atau rusak')
    }

    // Validate with Zod schema
    let data
    try {
      data = TrahJsonSchema.parse(parsed)
    }
    catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Format JSON tidak sesuai skema Trah'
      throw new Error(`Validasi JSON gagal: ${message}`)
    }

    const warnings: string[] = []

    // Convert TrahPersonJson[] to CreatePersonInput[]
    // treeId is intentionally omitted here — caller must set it
    const persons: CreatePersonInput[] = data.persons.map(p => ({
      treeId: '', // placeholder, caller must fill
      gedcomId: p.gedcomId ?? undefined,
      firstName: p.firstName,
      lastName: p.lastName ?? undefined,
      nickname: p.nickname ?? undefined,
      gender: p.gender,
      birthDate: p.birthDate ?? undefined,
      birthPlace: p.birthPlace ?? undefined,
      deathDate: p.deathDate ?? undefined,
      deathPlace: p.deathPlace ?? undefined,
      isAlive: p.isAlive,
      photoUrl: p.photoUrl ?? undefined,
      phone: p.phone ?? undefined,
      email: p.email ?? undefined,
      address: p.address ?? undefined,
      notes: p.notes ?? undefined,
    }))

    // Convert relationships, validate indices are in range
    const relationships: TrahImportResult['relationships'] = []
    const maxIndex = data.persons.length - 1

    for (let i = 0; i < data.relationships.length; i++) {
      const rel = data.relationships[i]!
      if (rel.personIndex > maxIndex) {
        warnings.push(`Relasi #${i + 1}: personIndex ${rel.personIndex} di luar jangkauan (max ${maxIndex})`)
        continue
      }
      if (rel.relatedPersonIndex > maxIndex) {
        warnings.push(`Relasi #${i + 1}: relatedPersonIndex ${rel.relatedPersonIndex} di luar jangkauan (max ${maxIndex})`)
        continue
      }

      relationships.push({
        personIndex: rel.personIndex,
        relatedPersonIndex: rel.relatedPersonIndex,
        relationshipType: rel.relationshipType,
        marriageDate: rel.marriageDate ?? null,
        divorceDate: rel.divorceDate ?? null,
      })
    }

    return {
      persons,
      relationships,
      treeName: data.treeName,
      warnings,
    }
  }
}
