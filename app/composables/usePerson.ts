import type { Person, CreatePersonInput, UpdatePersonInput } from '../../domain/entities/person'

export function usePerson() {
  const nuxtApp = useNuxtApp()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const repos = nuxtApp.$repos as any

  const persons = ref<Person[]>([])
  const currentPerson = ref<Person | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchPersons(treeId: string) {
    loading.value = true
    error.value = null
    try {
      persons.value = await repos.person.getByTree(treeId)
    }
    catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Gagal memuat anggota keluarga'
    }
    finally {
      loading.value = false
    }
  }

  async function fetchPerson(id: string) {
    loading.value = true
    error.value = null
    try {
      currentPerson.value = await repos.person.getById(id)
    }
    catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Gagal memuat data anggota'
    }
    finally {
      loading.value = false
    }
  }

  async function createPerson(input: CreatePersonInput): Promise<Person | null> {
    loading.value = true
    error.value = null
    try {
      const person = await repos.person.create(input)
      persons.value.push(person)
      return person
    }
    catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Gagal menambah anggota keluarga'
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
      const updated = await repos.person.update(id, input)
      const idx = persons.value.findIndex(p => p.id === id)
      if (idx !== -1) persons.value[idx] = updated
      if (currentPerson.value?.id === id) currentPerson.value = updated
      return true
    }
    catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Gagal memperbarui data anggota'
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
      await repos.person.delete(id)
      persons.value = persons.value.filter(p => p.id !== id)
      if (currentPerson.value?.id === id) currentPerson.value = null
      return true
    }
    catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Gagal menghapus anggota keluarga'
      return false
    }
    finally {
      loading.value = false
    }
  }

  async function searchPersons(treeId: string, query: string): Promise<Person[]> {
    try {
      return await repos.person.search(treeId, query)
    }
    catch {
      return []
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
  }
}
