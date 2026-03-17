import type { Relationship, CreateRelationshipInput } from '../../domain/entities/relationship'

export function useRelationship() {
  const nuxtApp = useNuxtApp()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const repos = nuxtApp.$repos as any

  const relationships = ref<Relationship[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchRelationships(treeId: string) {
    loading.value = true
    error.value = null
    try {
      relationships.value = await repos.relationship.getByTree(treeId)
    }
    catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Gagal memuat data relasi'
    }
    finally {
      loading.value = false
    }
  }

  async function createRelationship(input: CreateRelationshipInput): Promise<Relationship | null> {
    loading.value = true
    error.value = null
    try {
      const rel = await repos.relationship.create(input)
      relationships.value.push(rel)
      return rel
    }
    catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Gagal menambah relasi'
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
      await repos.relationship.delete(id)
      relationships.value = relationships.value.filter(r => r.id !== id)
      return true
    }
    catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Gagal menghapus relasi'
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
  }
}
