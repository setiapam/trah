import type { SupabaseClient } from '@supabase/supabase-js'
import type { ITreeRepository } from '../../domain/repositories/ITreeRepository'
import type { Tree, CreateTreeInput, UpdateTreeInput } from '../../domain/entities/tree'
import { treeFromDB, treeToInsert } from './mappers'

export class SupabaseTreeRepository implements ITreeRepository {
  constructor(private client: SupabaseClient) {}

  async getByOwner(ownerId: string): Promise<Tree[]> {
    const { data, error } = await this.client
      .from('trees')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(treeFromDB)
  }

  async getAccessible(userId: string): Promise<Tree[]> {
    // Ambil tree_id dari tree_members, lalu query trees
    const { data: memberData, error: memberError } = await this.client
      .from('tree_members')
      .select('tree_id')
      .eq('user_id', userId)
      .not('accepted_at', 'is', null)
    if (memberError) throw memberError

    const treeIds = (memberData ?? []).map((m: { tree_id: string }) => m.tree_id)
    if (treeIds.length === 0) return []

    const { data, error } = await this.client
      .from('trees')
      .select('*')
      .in('id', treeIds)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(treeFromDB)
  }

  async getById(id: string): Promise<Tree | null> {
    const { data, error } = await this.client
      .from('trees')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? treeFromDB(data) : null
  }

  async create(tree: CreateTreeInput): Promise<Tree> {
    const { data, error } = await this.client
      .from('trees')
      .insert(treeToInsert(tree))
      .select()
      .single()
    if (error) throw error
    return treeFromDB(data)
  }

  async update(id: string, data: UpdateTreeInput): Promise<Tree> {
    const patch: Record<string, unknown> = {}
    if (data.name !== undefined) patch.name = data.name
    if (data.description !== undefined) patch.description = data.description
    if (data.rootPersonId !== undefined) patch.root_person_id = data.rootPersonId

    const { data: row, error } = await this.client
      .from('trees')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return treeFromDB(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from('trees').delete().eq('id', id)
    if (error) throw error
  }
}
