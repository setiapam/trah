import type { TreeMemberRole } from '../../domain/entities/treeMember'

export type MemberRole = TreeMemberRole

export interface TreeMemberWithProfile {
  id: string
  treeId: string
  userId: string | null
  role: MemberRole
  invitedAt: string
  acceptedAt: string | null
  displayName: string
  avatarUrl: string | null
  invitedEmail: string | null
}

export interface PendingInvitation {
  id: string
  treeId: string
  treeName: string
  role: MemberRole
  invitedAt: string
}

export function useTreeMembers() {
  const supabase = useSupabaseClient()
  const session = useSupabaseSession()

  const members = ref<TreeMemberWithProfile[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMembers(treeId: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('tree_members')
        .select(`
          id, tree_id, user_id, role, invited_at, accepted_at, invited_email,
          profiles(display_name, avatar_url)
        `)
        .eq('tree_id', treeId)
        .order('invited_at', { ascending: true })

      if (err) {
        error.value = err.message
        return
      }

      members.value = (data ?? []).map((row: unknown) => {
        const r = row as Record<string, unknown>
        const profile = r.profiles as Record<string, unknown> | null
        const invitedEmail = (r.invited_email as string | null) ?? null
        return {
          id: r.id as string,
          treeId: r.tree_id as string,
          userId: (r.user_id as string | null) ?? null,
          role: r.role as MemberRole,
          invitedAt: r.invited_at as string,
          acceptedAt: (r.accepted_at as string | null) ?? null,
          displayName: (profile?.display_name as string) ?? (invitedEmail ?? 'User'),
          avatarUrl: (profile?.avatar_url as string | null) ?? null,
          invitedEmail,
        }
      })
    }
    finally {
      loading.value = false
    }
  }

  async function inviteMember(treeId: string, userId: string | null, role: MemberRole, email?: string): Promise<boolean> {
    error.value = null
    const insertData: Record<string, unknown> = {
      tree_id: treeId,
      role,
      invited_at: new Date().toISOString(),
    }
    if (userId) {
      insertData.user_id = userId
    }
    if (email) {
      insertData.invited_email = email.toLowerCase()
    }
    const { error: err } = await supabase
      .from('tree_members')
      .insert(insertData)

    if (err) {
      error.value = err.message
      return false
    }
    return true
  }

  async function fetchMyInvitations(): Promise<PendingInvitation[]> {
    error.value = null
    const userId = session.value?.user?.id ?? ''
    const userEmail = session.value?.user?.email ?? ''

    // Fetch invitations by user_id OR by email
    const { data, error: err } = await supabase
      .from('tree_members')
      .select(`
        id, tree_id, user_id, role, invited_at, accepted_at, invited_email,
        trees(name)
      `)
      .is('accepted_at', null)
      .or(`user_id.eq.${userId},invited_email.eq.${userEmail.toLowerCase()}`)

    if (err) {
      error.value = err.message
      return []
    }

    return (data ?? []).map((row: unknown) => {
      const r = row as Record<string, unknown>
      const tree = r.trees as Record<string, unknown> | null
      return {
        id: r.id as string,
        treeId: r.tree_id as string,
        treeName: (tree?.name as string) ?? 'Silsilah',
        role: r.role as MemberRole,
        invitedAt: r.invited_at as string,
      }
    })
  }

  async function acceptInvitation(memberId: string): Promise<boolean> {
    error.value = null
    const userId = session.value?.user?.id ?? ''

    // Update: set accepted_at and claim user_id (for email-based invites)
    const { error: err } = await supabase
      .from('tree_members')
      .update({
        accepted_at: new Date().toISOString(),
        user_id: userId,
      })
      .eq('id', memberId)

    if (err) {
      error.value = err.message
      return false
    }
    return true
  }

  async function declineInvitation(memberId: string): Promise<boolean> {
    error.value = null
    const { error: err } = await supabase
      .from('tree_members')
      .delete()
      .eq('id', memberId)

    if (err) {
      error.value = err.message
      return false
    }
    return true
  }

  async function claimEmailInvitations(): Promise<void> {
    const userId = session.value?.user?.id
    const email = session.value?.user?.email
    if (!userId || !email) return

    await supabase.rpc('claim_email_invitations', {
      p_user_id: userId,
      p_email: email.toLowerCase(),
    })
  }

  async function updateMemberRole(memberId: string, role: MemberRole): Promise<boolean> {
    error.value = null
    const { error: err } = await supabase
      .from('tree_members')
      .update({ role })
      .eq('id', memberId)

    if (err) {
      error.value = err.message
      return false
    }
    return true
  }

  async function removeMember(memberId: string): Promise<boolean> {
    error.value = null
    const { error: err } = await supabase
      .from('tree_members')
      .delete()
      .eq('id', memberId)

    if (err) {
      error.value = err.message
      return false
    }
    return true
  }

  function getMyRole(
    membersList: TreeMemberWithProfile[],
    ownerId: string,
  ): 'owner' | MemberRole | null {
    if (session.value?.user?.id === ownerId) return 'owner'
    const found = membersList.find(
      m => m.userId === session.value?.user?.id && m.acceptedAt !== null,
    )
    if (found) return found.role
    return null
  }

  return {
    members,
    loading,
    error,
    fetchMembers,
    inviteMember,
    fetchMyInvitations,
    acceptInvitation,
    declineInvitation,
    claimEmailInvitations,
    updateMemberRole,
    removeMember,
    getMyRole,
  }
}
