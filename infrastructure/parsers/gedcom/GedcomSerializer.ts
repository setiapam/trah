import type { Person } from '../../../domain/entities/person'
import type { Relationship } from '../../../domain/entities/relationship'
import { isoToGedcomDate } from './dateUtils'

export class GedcomSerializer {
  serialize(
    persons: Person[],
    relationships: Relationship[],
    treeName: string,
  ): string {
    const lines: string[] = []

    // Build personId → gedcom index map (1-based)
    const personToGedcom = new Map<string, string>()
    persons.forEach((p, idx) => {
      personToGedcom.set(p.id, `@I${idx + 1}@`)
    })

    // Header
    lines.push('0 HEAD')
    lines.push('1 SOUR TRAH')
    lines.push('2 VERS 1.0')
    lines.push('2 NAME Trah - Silsilah Keluarga')
    lines.push('1 GEDC')
    lines.push('2 VERS 5.5.1')
    lines.push('2 FORM LINEAGE-LINKED')
    lines.push('1 CHAR UTF-8')
    lines.push(`1 FILE ${treeName}.ged`)

    // INDI records
    for (const person of persons) {
      const gedId = personToGedcom.get(person.id)
      if (!gedId) continue

      lines.push(`0 ${gedId} INDI`)

      // NAME
      const lastName = person.lastName ? person.lastName : ''
      lines.push(`1 NAME ${person.firstName} /${lastName}/`)

      // SEX
      if (person.gender === 'M' || person.gender === 'F') {
        lines.push(`1 SEX ${person.gender}`)
      }

      // BIRT
      if (person.birthDate || person.birthPlace) {
        lines.push('1 BIRT')
        if (person.birthDate) lines.push(`2 DATE ${isoToGedcomDate(person.birthDate)}`)
        if (person.birthPlace) lines.push(`2 PLAC ${person.birthPlace}`)
      }

      // DEAT
      if (!person.isAlive || person.deathDate || person.deathPlace) {
        lines.push('1 DEAT Y')
        if (person.deathDate) lines.push(`2 DATE ${isoToGedcomDate(person.deathDate)}`)
        if (person.deathPlace) lines.push(`2 PLAC ${person.deathPlace}`)
      }

      // NOTE
      if (person.notes) {
        // Split notes into multiple NOTE tags if needed (80 char limit per line ideally, but keep simple)
        const noteLines = person.notes.split('\n')
        for (let i = 0; i < noteLines.length; i++) {
          if (i === 0) {
            lines.push(`1 NOTE ${noteLines[i]}`)
          }
          else {
            lines.push(`2 CONT ${noteLines[i]}`)
          }
        }
      }
    }

    // Build FAM records from relationships
    // Group spouse relationships; then find children for each couple
    const spouseRels = relationships.filter(r => r.relationshipType === 'spouse')
    const parentRels = relationships.filter(r => r.relationshipType === 'parent')

    // Track which persons already have a FAM as husband/wife to avoid duplicate FAMs
    // FAM key: "husbId|wifeId" (canonical) or "single|personId"
    interface FamRecord {
      famIndex: number
      husbId: string | null
      wifeId: string | null
      marriageDate: string | null
      childIds: string[]
    }

    const famMap = new Map<string, FamRecord>()
    let famCount = 0

    // Create FAM records from spouse relationships
    for (const rel of spouseRels) {
      const personA = rel.personId
      const personB = rel.relatedPersonId
      const personAGender = persons.find(p => p.id === personA)?.gender
      const personBGender = persons.find(p => p.id === personB)?.gender

      let husbId: string | null
      let wifeId: string | null

      // Assign husband/wife based on gender
      if (personAGender === 'M' || personBGender === 'F') {
        husbId = personA
        wifeId = personB
      }
      else if (personAGender === 'F' || personBGender === 'M') {
        husbId = personB
        wifeId = personA
      }
      else {
        // Default: personA as husband
        husbId = personA
        wifeId = personB
      }

      const key = `${husbId}|${wifeId}`
      if (!famMap.has(key)) {
        famCount++
        famMap.set(key, {
          famIndex: famCount,
          husbId,
          wifeId,
          marriageDate: rel.marriageDate ?? null,
          childIds: [],
        })
      }
    }

    // Assign children to FAM records
    // For each parent relationship, find the spouse FAM containing that parent
    // A child belongs to a FAM if both parents of that child are in the same FAM
    for (const parentRel of parentRels) {
      const parentId = parentRel.personId
      const childId = parentRel.relatedPersonId

      // Find all FAMs this parent belongs to
      let placed = false
      for (const [, fam] of famMap) {
        if (fam.husbId === parentId || fam.wifeId === parentId) {
          // Check if the other parent also has a parent relationship to this child
          const otherParentId = fam.husbId === parentId ? fam.wifeId : fam.husbId
          const otherAlsoParent = otherParentId === null || parentRels.some(
            r => r.personId === otherParentId && r.relatedPersonId === childId,
          )
          if (otherAlsoParent && !fam.childIds.includes(childId)) {
            fam.childIds.push(childId)
            placed = true
            break
          }
        }
      }

      // If not placed, create a single-parent FAM
      if (!placed) {
        const parentGender = persons.find(p => p.id === parentId)?.gender
        const singleKey = `single|${parentId}`
        if (!famMap.has(singleKey)) {
          famCount++
          const isHusband = parentGender !== 'F'
          famMap.set(singleKey, {
            famIndex: famCount,
            husbId: isHusband ? parentId : null,
            wifeId: isHusband ? null : parentId,
            marriageDate: null,
            childIds: [childId],
          })
        }
        else {
          const existingFam = famMap.get(singleKey)
          if (existingFam && !existingFam.childIds.includes(childId)) {
            existingFam.childIds.push(childId)
          }
        }
      }
    }

    // Write FAM records
    for (const [, fam] of famMap) {
      lines.push(`0 @F${fam.famIndex}@ FAM`)

      if (fam.husbId) {
        const gedId = personToGedcom.get(fam.husbId)
        if (gedId) lines.push(`1 HUSB ${gedId}`)
      }
      if (fam.wifeId) {
        const gedId = personToGedcom.get(fam.wifeId)
        if (gedId) lines.push(`1 WIFE ${gedId}`)
      }
      if (fam.marriageDate) {
        lines.push('1 MARR')
        lines.push(`2 DATE ${isoToGedcomDate(fam.marriageDate)}`)
      }
      for (const childId of fam.childIds) {
        const gedId = personToGedcom.get(childId)
        if (gedId) lines.push(`1 CHIL ${gedId}`)
      }
    }

    // Trailer
    lines.push('0 TRLR')

    return lines.join('\n')
  }
}
