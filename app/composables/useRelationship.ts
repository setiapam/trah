import type { Relationship, CreateRelationshipInput, UpdateRelationshipInput } from '../../domain/entities/relationship'
import { getErrorMessage } from '../utils/errorMessage'

export function useRelationship() {
  const nuxtApp = useNuxtApp()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getRepos(): any {
    return (nuxtApp as Record<string, unknown>).$repos
  }

  const relationships = ref<Relationship[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchRelationships(treeId: string) {
    loading.value = true
    error.value = null
    try {
      relationships.value = await getRepos().relationship.getByTree(treeId)
    }
    catch (e: unknown) {
      error.value = getErrorMessage(e, 'Gagal memuat data relasi')
    }
    finally {
      loading.value = false
    }
  }

  async function createRelationship(input: CreateRelationshipInput): Promise<Relationship | null> {
    loading.value = true
    error.value = null
    try {
      const rel = await getRepos().relationship.create(input)
      relationships.value.push(rel)
      return rel
    }
    catch (e: unknown) {
      error.value = getErrorMessage(e, 'Gagal menambah relasi')
      return null
    }
    finally {
      loading.value = false
    }
  }

  async function updateRelationship(id: string, input: UpdateRelationshipInput): Promise<Relationship | null> {
    loading.value = true
    error.value = null
    try {
      const updated = await getRepos().relationship.update(id, input)
      const idx = relationships.value.findIndex(r => r.id === id)
      if (idx !== -1) relationships.value[idx] = updated
      return updated
    }
    catch (e: unknown) {
      error.value = getErrorMessage(e, 'Gagal mengubah relasi')
      return null
    }
    finally {
      loading.value = false
    }
  }

  async function deleteRelationship(id: string): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      await getRepos().relationship.delete(id)
      relationships.value = relationships.value.filter(r => r.id !== id)
      return true
    }
    catch (e: unknown) {
      error.value = getErrorMessage(e, 'Gagal menghapus relasi')
      return false
    }
    finally {
      loading.value = false
    }
  }

  function getPersonRelationships(personId: string) {
    return relationships.value.filter(
      r => r.personId === personId || r.relatedPersonId === personId,
    )
  }

  function getParents(personId: string): string[] {
    return relationships.value
      .filter(r => r.relationshipType === 'parent' && r.relatedPersonId === personId)
      .map(r => r.personId)
  }

  function getChildRelationships(personId: string): { relId: string; childId: string; sortOrder: number }[] {
    return relationships.value
      .filter(r => r.relationshipType === 'parent' && r.personId === personId)
      .map(r => ({ relId: r.id, childId: r.relatedPersonId, sortOrder: r.sortOrder }))
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }

  function getChildren(personId: string): string[] {
    return getChildRelationships(personId).map(r => r.childId)
  }

  async function reorderChildren(parentId: string, childRelationshipIds: string[]): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      await getRepos().relationship.reorderChildren(parentId, childRelationshipIds)
      // Update local sort_order for the specified parent
      const childSortMap = new Map<string, number>()
      childRelationshipIds.forEach((relId, index) => {
        const rel = relationships.value.find(r => r.id === relId)
        if (rel) {
          rel.sortOrder = index
          childSortMap.set(rel.relatedPersonId, index)
        }
      })
      // Also sync local sort_order for other parents' relationships to the same children
      for (const rel of relationships.value) {
        if (
          rel.relationshipType === 'parent'
          && rel.personId !== parentId
          && childSortMap.has(rel.relatedPersonId)
        ) {
          rel.sortOrder = childSortMap.get(rel.relatedPersonId)!
        }
      }
      return true
    }
    catch (e: unknown) {
      error.value = getErrorMessage(e, 'Gagal mengubah urutan anak')
      return false
    }
    finally {
      loading.value = false
    }
  }

  function getSpouses(personId: string): string[] {
    return relationships.value
      .filter(r => r.relationshipType === 'spouse'
        && (r.personId === personId || r.relatedPersonId === personId))
      .map(r => r.personId === personId ? r.relatedPersonId : r.personId)
  }

  function getSiblings(personId: string): string[] {
    const parentIds = getParents(personId)
    if (parentIds.length === 0) return []
    const siblingIds = new Set<string>()
    for (const parentId of parentIds) {
      for (const childId of getChildren(parentId)) {
        if (childId !== personId) siblingIds.add(childId)
      }
    }
    return Array.from(siblingIds)
  }

  return {
    relationships,
    loading,
    error,
    fetchRelationships,
    createRelationship,
    updateRelationship,
    deleteRelationship,
    getPersonRelationships,
    getParents,
    getChildren,
    getChildRelationships,
    getSpouses,
    getSiblings,
    reorderChildren,
  }
}
