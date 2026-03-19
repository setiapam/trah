const _count = ref(0)

export function useInvitationCount() {
  const supabase = useSupabaseClient()
  const session = useSupabaseSession()

  async function refresh(): Promise<void> {
    const userId = session.value?.user?.id
    const email = session.value?.user?.email
    if (!userId) {
      _count.value = 0
      return
    }
    const { count } = await supabase
      .from('tree_members')
      .select('id', { count: 'exact', head: true })
      .is('accepted_at', null)
      .or(`user_id.eq.${userId}${email ? `,invited_email.eq.${email.toLowerCase()}` : ''}`)
    _count.value = count ?? 0
  }

  return { pendingCount: readonly(_count), refresh }
}
