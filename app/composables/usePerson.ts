import type { Person, CreatePersonInput, UpdatePersonInput } from '../../domain/entities/person'
import { getErrorMessage } from '../utils/errorMessage'

export function usePerson() {
  const nuxtApp = useNuxtApp()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getRepos(): any {
    return (nuxtApp as Record<string, unknown>).$repos
  }

  const persons = ref<Person[]>([])
  const currentPerson = ref<Person | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchPersons(treeId: string) {
    loading.value = true
    error.value = null
    try {
      persons.value = await getRepos().person.getByTree(treeId)
    }
    catch (e: unknown) {
      error.value = getErrorMessage(e, 'Gagal memuat anggota keluarga')
    }
    finally {
      loading.value = false
    }
  }

  async function fetchPerson(id: string) {
    loading.value = true
    error.value = null
    try {
      currentPerson.value = await getRepos().person.getById(id)
    }
    catch (e: unknown) {
      error.value = getErrorMessage(e, 'Gagal memuat data anggota')
    }
    finally {
      loading.value = false
    }
  }

  async function createPerson(input: CreatePersonInput): Promise<Person | null> {
    loading.value = true
    error.value = null
    try {
      const person = await getRepos().person.create(input)
      persons.value.push(person)
      return person
    }
    catch (e: unknown) {
      error.value = getErrorMessage(e, 'Gagal menambah anggota keluarga')
      return null
    }
    finally {
      loading.value = false
    }
  }

  async function updatePerson(id: string, input: UpdatePersonInput): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const updated = await getRepos().person.update(id, input)
      const idx = persons.value.findIndex(p => p.id === id)
      if (idx !== -1) persons.value[idx] = updated
      if (currentPerson.value?.id === id) currentPerson.value = updated
      return true
    }
    catch (e: unknown) {
      error.value = getErrorMessage(e, 'Gagal memperbarui data anggota')
      return false
    }
    finally {
      loading.value = false
    }
  }

  async function deletePerson(id: string): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      await getRepos().person.delete(id)
      persons.value = persons.value.filter(p => p.id !== id)
      if (currentPerson.value?.id === id) currentPerson.value = null
      return true
    }
    catch (e: unknown) {
      error.value = getErrorMessage(e, 'Gagal menghapus anggota keluarga')
      return false
    }
    finally {
      loading.value = false
    }
  }

  async function searchPersons(treeId: string, query: string): Promise<Person[]> {
    try {
      return await getRepos().person.search(treeId, query)
    }
    catch {
      return []
    }
  }

  async function searchAcrossTrees(query: string, excludeTreeId?: string): Promise<(Person & { treeName: string })[]> {
    try {
      return await getRepos().person.searchAcrossTrees(query, excludeTreeId)
    }
    catch {
      return []
    }
  }

  async function createLinkedCopy(sourcePersonId: string, targetTreeId: string): Promise<Person | null> {
    loading.value = true
    error.value = null
    try {
      const person = await getRepos().person.createLinkedCopy(sourcePersonId, targetTreeId)
      persons.value.push(person)
      return person
    }
    catch (e: unknown) {
      error.value = getErrorMessage(e, 'Gagal menambah anggota dari trah lain')
      return null
    }
    finally {
      loading.value = false
    }
  }

  return {
    persons,
    currentPerson,
    loading,
    error,
    fetchPersons,
    fetchPerson,
    createPerson,
    updatePerson,
    deletePerson,
    searchPersons,
    searchAcrossTrees,
    createLinkedCopy,
  }
}
