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
}
