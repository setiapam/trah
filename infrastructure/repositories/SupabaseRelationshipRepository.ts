import type { SupabaseClient } from '@supabase/supabase-js'
import type { IRelationshipRepository } from '../../domain/repositories/IRelationshipRepository'
import type {
  Relationship,
  CreateRelationshipInput,
  UpdateRelationshipInput,
} from '../../domain/entities/relationship'
import { relationshipFromDB, relationshipToInsert, chunkArray } from './mappers'

export class SupabaseRelationshipRepository implements IRelationshipRepository {
  constructor(private client: SupabaseClient) {}

  async getByTree(treeId: string): Promise<Relationship[]> {
    const { data, error } = await this.client
      .from('relationships')
      .select('*')
      .eq('tree_id', treeId)
      .order('created_at')
    if (error) throw error
    return (data ?? []).map(relationshipFromDB)
  }

  async getByPerson(personId: string): Promise<Relationship[]> {
    const { data, error } = await this.client
      .from('relationships')
      .select('*')
      .or(`person_id.eq.${personId},related_person_id.eq.${personId}`)
      .order('created_at')
    if (error) throw error
    return (data ?? []).map(relationshipFromDB)
  }

  async getById(id: string): Promise<Relationship | null> {
    const { data, error } = await this.client
      .from('relationships')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? relationshipFromDB(data) : null
  }

  async create(rel: CreateRelationshipInput): Promise<Relationship> {
    const { data, error } = await this.client
      .from('relationships')
      .insert(relationshipToInsert(rel))
      .select()
      .single()
    if (error) throw error
    return relationshipFromDB(data)
  }

  async update(id: string, data: UpdateRelationshipInput): Promise<Relationship> {
    const patch: Record<string, unknown> = {}
    if (data.relationshipType !== undefined) patch.relationship_type = data.relationshipType
    if (data.marriageDate !== undefined) patch.marriage_date = data.marriageDate
    if (data.divorceDate !== undefined) patch.divorce_date = data.divorceDate

    const { data: row, error } = await this.client
      .from('relationships')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return relationshipFromDB(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from('relationships').delete().eq('id', id)
    if (error) throw error
  }

  async bulkInsert(rels: CreateRelationshipInput[]): Promise<Relationship[]> {
    const chunks = chunkArray(rels, 100)
    const results: Relationship[] = []
    for (const chunk of chunks) {
      const { data, error } = await this.client
        .from('relationships')
        .insert(chunk.map(relationshipToInsert))
        .select()
      if (error) throw error
      results.push(...(data ?? []).map(relationshipFromDB))
    }
    return results
  }
}
