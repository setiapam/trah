import type { TreeMember, CreateTreeMemberInput, TreeMemberRole } from '../entities/treeMember'

export interface ITreeMemberRepository {
  getByTree(treeId: string): Promise<TreeMember[]>
  getByUser(userId: string): Promise<TreeMember[]>
  getRole(treeId: string, userId: string): Promise<TreeMemberRole | null>
  invite(input: CreateTreeMemberInput): Promise<TreeMember>
  accept(id: string): Promise<TreeMember>
  updateRole(id: string, role: TreeMemberRole): Promise<TreeMember>
  remove(id: string): Promise<void>
}
