import type { Relationship } from '../entities/relationship'
import type { RuleResult } from './personRules'

/**
 * Seseorang tidak bisa berelasi dengan dirinya sendiri.
 */
export function validateNoSelfRelation(personId: string, relatedPersonId: string): RuleResult {
  if (personId === relatedPersonId) {
    return { valid: false, error: 'Seseorang tidak bisa memiliki relasi dengan dirinya sendiri' }
  }
  return { valid: true }
}

/**
 * Tanggal cerai harus setelah tanggal nikah.
 */
export function validateRelationshipDates(
  marriageDate?: string | null,
  divorceDate?: string | null
): RuleResult {
  if (marriageDate && divorceDate) {
    if (divorceDate < marriageDate) {
      return { valid: false, error: 'Tanggal cerai tidak boleh sebelum tanggal nikah' }
    }
  }
  return { valid: true }
}

/**
 * Deteksi relasi duplikat: pasangan yang sama sudah ada.
 */
export function isDuplicateRelationship(
  existing: Relationship[],
  personId: string,
  relatedPersonId: string,
  type: Relationship['relationshipType']
): boolean {
  return existing.some(
    (r) =>
      r.relationshipType === type &&
      ((r.personId === personId && r.relatedPersonId === relatedPersonId) ||
        (r.personId === relatedPersonId && r.relatedPersonId === personId))
  )
}

/**
 * Validasi lengkap relasi sebelum disimpan.
 */
export function validateRelationship(
  rel: Partial<Relationship>,
  existing: Relationship[] = []
): RuleResult[] {
  const results: RuleResult[] = []

  if (rel.personId && rel.relatedPersonId) {
    const selfResult = validateNoSelfRelation(rel.personId, rel.relatedPersonId)
    if (!selfResult.valid) results.push(selfResult)

    if (rel.relationshipType && isDuplicateRelationship(existing, rel.personId, rel.relatedPersonId, rel.relationshipType)) {
      results.push({ valid: false, error: 'Relasi yang sama sudah ada' })
    }
  }

  const dateResult = validateRelationshipDates(rel.marriageDate, rel.divorceDate)
  if (!dateResult.valid) results.push(dateResult)

  return results
}
