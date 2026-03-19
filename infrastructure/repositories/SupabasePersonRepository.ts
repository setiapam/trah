import type { SupabaseClient } from '@supabase/supabase-js'
import type { IPersonRepository } from '../../domain/repositories/IPersonRepository'
import type { Person, CreatePersonInput, UpdatePersonInput } from '../../domain/entities/person'
import { personFromDB, personToInsert, personToUpdate, chunkArray } from './mappers'

export class SupabasePersonRepository implements IPersonRepository {
  constructor(private client: SupabaseClient) {}

  async getByTree(treeId: string): Promise<Person[]> {
    const { data, error } = await this.client
      .from('persons')
      .select('*')
      .eq('tree_id', treeId)
      .order('created_at')
    if (error) throw error
    return (data ?? []).map(personFromDB)
  }

  async getById(id: string): Promise<Person | null> {
    const { data, error } = await this.client
      .from('persons')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? personFromDB(data) : null
  }

  async create(person: CreatePersonInput): Promise<Person> {
    const { data, error } = await this.client
      .from('persons')
      .insert(personToInsert(person))
      .select()
      .single()
    if (error) throw error
    return personFromDB(data)
  }

  async update(id: string, data: UpdatePersonInput): Promise<Person> {
    const { data: row, error } = await this.client
      .from('persons')
      .update(personToUpdate(data))
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return personFromDB(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from('persons').delete().eq('id', id)
    if (error) throw error
  }

  async bulkInsert(persons: CreatePersonInput[]): Promise<Person[]> {
    const chunks = chunkArray(persons, 100)
    const results: Person[] = []
    for (const chunk of chunks) {
      const { data, error } = await this.client
        .from('persons')
        .insert(chunk.map(personToInsert))
        .select()
      if (error) throw error
      results.push(...(data ?? []).map(personFromDB))
    }
    return results
  }

  async search(treeId: string, query: string): Promise<Person[]> {
    const q = `%${query}%`
    const { data, error } = await this.client
      .from('persons')
      .select('*')
      .eq('tree_id', treeId)
      .or(`first_name.ilike.${q},last_name.ilike.${q},nickname.ilike.${q}`)
      .order('first_name')
      .limit(50)
    if (error) throw error
    return (data ?? []).map(personFromDB)
  }

  async searchAcrossTrees(query: string, excludeTreeId?: string): Promise<(Person & { treeName: string })[]> {
    const { data, error } = await this.client
      .rpc('search_persons_across_trees', {
        search_query: query,
        exclude_tree_id: excludeTreeId ?? null,
      })
    if (error) throw error
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((row: any) => ({
      ...personFromDB(row),
      treeName: row.tree_name ?? '',
    }))
  }

  async createLinkedCopy(sourcePersonId: string, targetTreeId: string): Promise<Person> {
    // Fetch source person
    const source = await this.getById(sourcePersonId)
    if (!source) throw new Error('Person asal tidak ditemukan')

    // Resolve to the ultimate original (avoid copy-of-copy)
    let originalId = source.id
    let originalTreeId = source.treeId
    if (source.linkedPersonId) {
      const original = await this.getById(source.linkedPersonId)
      if (original) {
        originalId = original.id
        originalTreeId = original.treeId
      }
    }

    // Check if a linked copy already exists in target tree
    const { data: existing } = await this.client
      .from('persons')
      .select('id')
      .eq('tree_id', targetTreeId)
      .eq('linked_person_id', originalId)
      .maybeSingle()
    if (existing) throw new Error('Anggota ini sudah ada di trah ini sebagai salinan')

    // Create the copy
    const copyInput: CreatePersonInput = {
      treeId: targetTreeId,
      firstName: source.firstName,
      lastName: source.lastName,
      nickname: source.nickname,
      gender: source.gender,
      birthDate: source.birthDate,
      birthPlace: source.birthPlace,
      deathDate: source.deathDate,
      deathPlace: source.deathPlace,
      isAlive: source.isAlive,
      photoUrl: source.photoUrl,
      phone: source.phone,
      email: source.email,
      address: source.address,
      notes: source.notes,
      linkedPersonId: originalId,
      linkedFromTreeId: originalTreeId,
    }
    return this.create(copyInput)
  }

  async createLinkedCopyWithDescendants(
    sourcePersonId: string,
    targetTreeId: string,
    sourceTreeRelationships: { personId: string; relatedPersonId: string; relationshipType: string; marriageDate?: string | null; divorceDate?: string | null }[],
  ): Promise<{ copiedPersons: Person[]; idMap: Map<string, string> }> {
    // Map from source person ID to target person ID
    const idMap = new Map<string, string>()
    const copiedPersons: Person[] = []

    // Collect all person IDs to copy: the root person + all descendants (spouses, children, recursively)
    const personIdsToCopy = new Set<string>()

    const collectDescendants = (personId: string) => {
      if (personIdsToCopy.has(personId)) return
      personIdsToCopy.add(personId)

      for (const rel of sourceTreeRelationships) {
        if (rel.relationshipType === 'spouse') {
          // Copy spouses
          if (rel.personId === personId && !personIdsToCopy.has(rel.relatedPersonId)) {
            personIdsToCopy.add(rel.relatedPersonId)
          }
          if (rel.relatedPersonId === personId && !personIdsToCopy.has(rel.personId)) {
            personIdsToCopy.add(rel.personId)
          }
        }
        if (rel.relationshipType === 'parent' && rel.personId === personId) {
          // This person is parent of relatedPersonId → copy child and recurse
          collectDescendants(rel.relatedPersonId)
        }
      }
    }

    collectDescendants(sourcePersonId)

    // Copy each person
    for (const pid of personIdsToCopy) {
      // Check if already exists as linked copy in target tree
      const { data: existing } = await this.client
        .from('persons')
        .select('id')
        .eq('tree_id', targetTreeId)
        .eq('linked_person_id', pid)
        .maybeSingle()

      if (existing) {
        idMap.set(pid, existing.id)
        continue
      }

      const source = await this.getById(pid)
      if (!source) continue

      // Resolve original (avoid copy-of-copy)
      let originalId = source.id
      let originalTreeId = source.treeId
      if (source.linkedPersonId) {
        const original = await this.getById(source.linkedPersonId)
        if (original) {
          originalId = original.id
          originalTreeId = original.treeId
        }
      }

      const copy = await this.create({
        treeId: targetTreeId,
        firstName: source.firstName,
        lastName: source.lastName,
        nickname: source.nickname,
        gender: source.gender,
        birthDate: source.birthDate,
        birthPlace: source.birthPlace,
        deathDate: source.deathDate,
        deathPlace: source.deathPlace,
        isAlive: source.isAlive,
        photoUrl: source.photoUrl,
        phone: source.phone,
        email: source.email,
        address: source.address,
        notes: source.notes,
        linkedPersonId: originalId,
        linkedFromTreeId: originalTreeId,
      })

      idMap.set(pid, copy.id)
      copiedPersons.push(copy)
    }

    return { copiedPersons, idMap }
  }
}
