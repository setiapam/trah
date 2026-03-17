import type { Relationship, CreateRelationshipInput } from '../../domain/entities/relationship'
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

  function getChildren(personId: string): string[] {
    return relationships.value
      .filter(r => r.relationshipType === 'parent' && r.personId === personId)
      .map(r => r.relatedPersonId)
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
    deleteRelationship,
    getPersonRelationships,
    getParents,
    getChildren,
    getSpouses,
    getSiblings,
  }
}
