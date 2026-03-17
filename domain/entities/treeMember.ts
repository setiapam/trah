import { z } from 'zod'

export const TreeMemberRoleSchema = z.enum(['owner', 'editor', 'viewer'])
export type TreeMemberRole = z.infer<typeof TreeMemberRoleSchema>

export const ROLE_HIERARCHY: Record<TreeMemberRole, number> = {
  owner: 3,
  editor: 2,
  viewer: 1,
}

export const TreeMemberSchema = z.object({
  id: z.string().uuid(),
  treeId: z.string().uuid(),
  userId: z.string().uuid(),
  role: TreeMemberRoleSchema,
  invitedAt: z.string().optional(),
  acceptedAt: z.string().nullable().optional(),
})

export type TreeMember = z.infer<typeof TreeMemberSchema>

export const CreateTreeMemberSchema = TreeMemberSchema.omit({
  id: true,
  invitedAt: true,
})
export type CreateTreeMemberInput = z.infer<typeof CreateTreeMemberSchema>

export function hasMinRole(userRole: TreeMemberRole, minRole: TreeMemberRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole]
}

export function canEdit(role: TreeMemberRole): boolean {
  return hasMinRole(role, 'editor')
}

export function canManageMembers(role: TreeMemberRole): boolean {
  return hasMinRole(role, 'owner')
}
