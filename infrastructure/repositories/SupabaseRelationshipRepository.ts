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
      .order('sort_order')
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
    const insert = relationshipToInsert(rel)

    // Auto-assign sort_order for parent relationships if not explicitly set
    if (rel.relationshipType === 'parent' && (rel.sortOrder === undefined || rel.sortOrder === 0)) {
      const { data: maxRow } = await this.client
        .from('relationships')
        .select('sort_order')
        .eq('person_id', rel.personId)
        .eq('relationship_type', 'parent')
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle()
      insert.sort_order = (maxRow?.sort_order ?? -1) + 1
    }

    const { data, error } = await this.client
      .from('relationships')
      .insert(insert)
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
    if (data.sortOrder !== undefined) patch.sort_order = data.sortOrder

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

  async reorderChildren(parentId: string, childRelationshipIds: string[]): Promise<void> {
    let treeId: string | null = null
    const childSortOrders: { childId: string; sortOrder: number }[] = []

    // Update the specified parent's relationships
    for (let i = 0; i < childRelationshipIds.length; i++) {
      const { data, error } = await this.client
        .from('relationships')
        .update({ sort_order: i })
        .eq('id', childRelationshipIds[i])
        .select('related_person_id, tree_id')
        .single()
      if (error) throw error
      if (data) {
        treeId = data.tree_id
        childSortOrders.push({ childId: data.related_person_id, sortOrder: i })
      }
    }

    // Sync sort_order to other parents' relationships for the same children
    if (treeId) {
      for (const { childId, sortOrder } of childSortOrders) {
        await this.client
          .from('relationships')
          .update({ sort_order: sortOrder })
          .eq('tree_id', treeId)
          .eq('related_person_id', childId)
          .eq('relationship_type', 'parent')
          .neq('person_id', parentId)
      }
    }
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
