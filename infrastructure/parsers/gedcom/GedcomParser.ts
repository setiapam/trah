import type { GedcomIndividual, GedcomFamily, GedcomImportResult } from './types'
import { gedcomDateToISO } from './dateUtils'

interface GedcomLine {
  level: number
  xref: string | null
  tag: string
  value: string
}

function parseLine(line: string): GedcomLine | null {
  const trimmed = line.trim()
  if (trimmed === '') return null

  // Pattern: LEVEL [XREF] TAG [VALUE]
  const match = trimmed.match(/^(\d+)\s+(?:(@[^@]+@)\s+)?(\S+)(?:\s+(.*))?$/)
  if (!match) return null

  const levelStr = match[1]
  const tag = match[3]
  if (!levelStr || !tag) return null

  return {
    level: parseInt(levelStr, 10),
    xref: match[2] ?? null,
    tag: tag.toUpperCase(),
    value: (match[4] ?? '').trim(),
  }
}

/**
 * Parse "First /Last/" style GEDCOM names.
 * Returns { firstName, lastName }
 */
function parseName(raw: string): { firstName: string; lastName: string | null } {
  const slashMatch = raw.match(/^(.*?)\s*\/(.*)\/\s*$/)
  if (slashMatch) {
    const firstName = (slashMatch[1] ?? '').trim() || raw.trim()
    const lastName = (slashMatch[2] ?? '').trim() || null
    return { firstName: firstName || 'Unknown', lastName }
  }
  // No slashes — treat the whole thing as first name
  const name = raw.trim()
  return { firstName: name || 'Unknown', lastName: null }
}

export class GedcomParser {
  parse(content: string): GedcomImportResult {
    const lines = content.split(/\r?\n/)
    const parsed = lines.map(parseLine).filter((l): l is GedcomLine => l !== null)

    const individuals = new Map<string, GedcomIndividual>()
    const families = new Map<string, GedcomFamily>()

    let currentIndi: GedcomIndividual | null = null
    let currentFam: GedcomFamily | null = null
    let currentContext: 'INDI' | 'FAM' | null = null
    let subContext: string | null = null // BIRT, DEAT, MARR

    for (const line of parsed) {
      // Level 0: new record
      if (line.level === 0) {
        // Flush current
        if (currentIndi) individuals.set(currentIndi.id, currentIndi)
        if (currentFam) families.set(currentFam.id, currentFam)
        currentIndi = null
        currentFam = null
        currentContext = null
        subContext = null

        if (line.tag === 'INDI' && line.xref) {
          currentIndi = { id: line.xref, notes: [] }
          currentContext = 'INDI'
        }
        else if (line.tag === 'FAM' && line.xref) {
          currentFam = { id: line.xref, childIds: [] }
          currentContext = 'FAM'
        }
        continue
      }

      // Level 1 tags within INDI
      if (currentContext === 'INDI' && currentIndi && line.level === 1) {
        subContext = null
        switch (line.tag) {
          case 'NAME':
            currentIndi.name = line.value
            break
          case 'SEX':
            if (line.value === 'M' || line.value === 'F') {
              currentIndi.sex = line.value
            }
            else {
              currentIndi.sex = 'U'
            }
            break
          case 'BIRT':
            subContext = 'BIRT'
            break
          case 'DEAT':
            currentIndi.isDead = true
            subContext = 'DEAT'
            break
          case 'NOTE':
            if (line.value) currentIndi.notes?.push(line.value)
            break
        }
        continue
      }

      // Level 2 tags within INDI sub-context
      if (currentContext === 'INDI' && currentIndi && line.level === 2 && subContext) {
        if (subContext === 'BIRT') {
          if (line.tag === 'DATE') currentIndi.birthDate = line.value
          if (line.tag === 'PLAC') currentIndi.birthPlace = line.value
        }
        else if (subContext === 'DEAT') {
          if (line.tag === 'DATE') currentIndi.deathDate = line.value
          if (line.tag === 'PLAC') currentIndi.deathPlace = line.value
        }
        continue
      }

      // Level 1 tags within FAM
      if (currentContext === 'FAM' && currentFam && line.level === 1) {
        subContext = null
        switch (line.tag) {
          case 'HUSB':
            currentFam.husbId = line.value
            break
          case 'WIFE':
            currentFam.wifeId = line.value
            break
          case 'CHIL':
            if (line.value) currentFam.childIds.push(line.value)
            break
          case 'MARR':
            subContext = 'MARR'
            break
          case 'DIV':
            subContext = 'DIV'
            break
        }
        continue
      }

      // Level 2 tags within FAM sub-context
      if (currentContext === 'FAM' && currentFam && line.level === 2 && subContext) {
        if (subContext === 'MARR' && line.tag === 'DATE') {
          currentFam.marrDate = line.value
        }
        else if (subContext === 'DIV' && line.tag === 'DATE') {
          currentFam.divDate = line.value
        }
        continue
      }
    }

    // Flush last records
    if (currentIndi) individuals.set(currentIndi.id, currentIndi)
    if (currentFam) families.set(currentFam.id, currentFam)

    // Convert to GedcomImportResult
    const warnings: string[] = []

    const persons = Array.from(individuals.values()).map((indi) => {
      const { firstName, lastName } = parseName(indi.name ?? '')
      const gender: 'M' | 'F' | 'U' = indi.sex ?? 'U'
      const birthDate = indi.birthDate ? gedcomDateToISO(indi.birthDate) : null
      const deathDate = indi.deathDate ? gedcomDateToISO(indi.deathDate) : null
      const isAlive = !(indi.isDead === true || deathDate !== null)

      return {
        gedcomId: indi.id,
        firstName,
        lastName,
        gender,
        birthDate,
        birthPlace: indi.birthPlace ?? null,
        deathDate,
        deathPlace: indi.deathPlace ?? null,
        isAlive,
        notes: indi.notes && indi.notes.length > 0 ? indi.notes.join('\n') : null,
      }
    })

    const relationships: GedcomImportResult['relationships'] = []

    for (const fam of families.values()) {
      const marrDateISO = fam.marrDate ? gedcomDateToISO(fam.marrDate) : null

      // Spouse relationship
      if (fam.husbId && fam.wifeId) {
        if (!individuals.has(fam.husbId)) {
          warnings.push(`Referensi tidak ditemukan: ${fam.husbId} (dalam FAM ${fam.id})`)
        }
        else if (!individuals.has(fam.wifeId)) {
          warnings.push(`Referensi tidak ditemukan: ${fam.wifeId} (dalam FAM ${fam.id})`)
        }
        else {
          relationships.push({
            type: 'spouse',
            personGedcomId: fam.husbId,
            relatedPersonGedcomId: fam.wifeId,
            marriageDate: marrDateISO,
          })
        }
      }

      // Parent relationships
      const parentIds: string[] = []
      if (fam.husbId) {
        if (!individuals.has(fam.husbId)) {
          warnings.push(`Referensi tidak ditemukan: ${fam.husbId} (dalam FAM ${fam.id})`)
        }
        else {
          parentIds.push(fam.husbId)
        }
      }
      if (fam.wifeId) {
        if (!individuals.has(fam.wifeId)) {
          warnings.push(`Referensi tidak ditemukan: ${fam.wifeId} (dalam FAM ${fam.id})`)
        }
        else {
          parentIds.push(fam.wifeId)
        }
      }

      for (const childId of fam.childIds) {
        if (!individuals.has(childId)) {
          warnings.push(`Referensi tidak ditemukan: ${childId} (dalam FAM ${fam.id})`)
          continue
        }
        for (const parentId of parentIds) {
          relationships.push({
            type: 'parent',
            personGedcomId: parentId,
            relatedPersonGedcomId: childId,
            marriageDate: null,
          })
        }
      }
    }

    return { persons, relationships, warnings }
  }
}
