export interface GedcomIndividual {
  id: string          // e.g. "@I1@"
  name?: string       // "First /Last/"
  sex?: 'M' | 'F' | 'U'
  birthDate?: string  // raw GEDCOM date string
  birthPlace?: string
  deathDate?: string
  deathPlace?: string
  isDead?: boolean
  notes?: string[]
}

export interface GedcomFamily {
  id: string          // e.g. "@F1@"
  husbId?: string     // "@I1@"
  wifeId?: string     // "@I2@"
  childIds: string[]  // ["@I3@", "@I4@"]
  marrDate?: string
  divDate?: string
}

export interface GedcomData {
  individuals: Map<string, GedcomIndividual>
  families: Map<string, GedcomFamily>
  source?: string
}

export interface GedcomImportResult {
  persons: Array<{
    gedcomId: string
    firstName: string
    lastName: string | null
    gender: 'M' | 'F' | 'U'
    birthDate: string | null
    birthPlace: string | null
    deathDate: string | null
    deathPlace: string | null
    isAlive: boolean
    notes: string | null
  }>
  relationships: Array<{
    type: 'parent' | 'spouse'
    personGedcomId: string
    relatedPersonGedcomId: string
    marriageDate: string | null
  }>
  warnings: string[]
}
