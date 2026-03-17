import type { SupabaseClient } from '@supabase/supabase-js'
import type { ITreeMemberRepository } from '../../domain/repositories/ITreeMemberRepository'
import type { TreeMember, CreateTreeMemberInput, TreeMemberRole } from '../../domain/entities/treeMember'
import { treeMemberFromDB } from './mappers'

export class SupabaseTreeMemberRepository implements ITreeMemberRepository {
  constructor(private client: SupabaseClient) {}

  async getByTree(treeId: string): Promise<TreeMember[]> {
    const { data, error } = await this.client
      .from('tree_members')
      .select('*')
      .eq('tree_id', treeId)
      .order('invited_at')
    if (error) throw error
    return (data ?? []).map(treeMemberFromDB)
  }

  async getByUser(userId: string): Promise<TreeMember[]> {
    const { data, error } = await this.client
      .from('tree_members')
      .select('*')
      .eq('user_id', userId)
      .not('accepted_at', 'is', null)
    if (error) throw error
    return (data ?? []).map(treeMemberFromDB)
  }

  async getRole(treeId: string, userId: string): Promise<TreeMemberRole | null> {
    const { data, error } = await this.client
      .from('tree_members')
      .select('role')
      .eq('tree_id', treeId)
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error
    return data ? (data.role as TreeMemberRole) : null
  }

  async invite(input: CreateTreeMemberInput): Promise<TreeMember> {
    const { data, error } = await this.client
      .from('tree_members')
      .insert({
        tree_id: input.treeId,
        user_id: input.userId,
        role: input.role,
        accepted_at: input.acceptedAt ?? null,
      })
      .select()
      .single()
    if (error) throw error
    return treeMemberFromDB(data)
  }

  async accept(id: string): Promise<TreeMember> {
    const { data, error } = await this.client
      .from('tree_members')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return treeMemberFromDB(data)
  }

  async updateRole(id: string, role: TreeMemberRole): Promise<TreeMember> {
    const { data, error } = await this.client
      .from('tree_members')
      .update({ role })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return treeMemberFromDB(data)
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.client.from('tree_members').delete().eq('id', id)
    if (error) throw error
  }
}
