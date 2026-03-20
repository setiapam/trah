import type { Person } from '../../domain/entities/person'
import type { Relationship } from '../../domain/entities/relationship'

export interface FamilyTreeNode {
  id: string
  person: Person
  spouse: Person | null
  children: FamilyTreeNode[]
}

export function buildTree(
  rootPersonId: string,
  persons: Person[],
  relationships: Relationship[],
): FamilyTreeNode | null {
  const personMap = new Map<string, Person>()
  for (const p of persons) {
    personMap.set(p.id, p)
  }

  const rootPerson = personMap.get(rootPersonId)
  if (!rootPerson) return null

  const visited = new Set<string>()

  function buildNode(personId: string): FamilyTreeNode | null {
    if (visited.has(personId)) return null
    const person = personMap.get(personId)
    if (!person) return null

    visited.add(personId)

    // Find spouse: a 'spouse' relationship that involves this person
    const spouseRel = relationships.find(
      r => r.relationshipType === 'spouse'
        && (r.personId === personId || r.relatedPersonId === personId),
    )

    let spouse: Person | null = null
    if (spouseRel) {
      const spouseId = spouseRel.personId === personId
        ? spouseRel.relatedPersonId
        : spouseRel.personId
      if (!visited.has(spouseId)) {
        spouse = personMap.get(spouseId) ?? null
        if (spouse) {
          visited.add(spouseId)
        }
      }
    }

    // Find children: 'parent' relationships where personId = this person OR spouse
    const parentIds = new Set<string>([personId])
    if (spouse) parentIds.add(spouse.id)

    const childIds = new Set<string>()
    for (const r of relationships) {
      if (r.relationshipType === 'parent' && parentIds.has(r.personId)) {
        childIds.add(r.relatedPersonId)
      }
    }

    // Sort children by sortOrder first, then birthDate asc (null last)
    const sortedChildIds = Array.from(childIds).sort((a, b) => {
      // Find the parent→child relationship to get sortOrder
      const relA = relationships.find(r => r.relationshipType === 'parent' && parentIds.has(r.personId) && r.relatedPersonId === a)
      const relB = relationships.find(r => r.relationshipType === 'parent' && parentIds.has(r.personId) && r.relatedPersonId === b)
      const sortA = relA?.sortOrder ?? 0
      const sortB = relB?.sortOrder ?? 0
      if (sortA !== sortB) return sortA - sortB

      const pa = personMap.get(a)
      const pb = personMap.get(b)
      const da = pa?.birthDate ? new Date(pa.birthDate).getTime() : null
      const db = pb?.birthDate ? new Date(pb.birthDate).getTime() : null
      if (da === null && db === null) return 0
      if (da === null) return 1
      if (db === null) return -1
      return da - db
    })

    const children: FamilyTreeNode[] = []
    for (const childId of sortedChildIds) {
      const childNode = buildNode(childId)
      if (childNode) children.push(childNode)
    }

    return {
      id: personId,
      person,
      spouse,
      children,
    }
  }

  return buildNode(rootPersonId)
}

export function useTreeData() {
  function build(
    rootPersonId: string | null,
    persons: Person[],
    relationships: Relationship[],
  ): FamilyTreeNode | null {
    if (!rootPersonId) return null
    return buildTree(rootPersonId, persons, relationships)
  }

  return { build }
}
