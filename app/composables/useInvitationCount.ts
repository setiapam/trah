const _count = ref(0)

export function useInvitationCount() {
  const supabase = useSupabaseClient()
  const session = useSupabaseSession()

  async function refresh(): Promise<void> {
    if (!session.value?.user?.id) {
      _count.value = 0
      return
    }
    const { count } = await supabase
      .from('tree_members')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.value.user.id)
      .is('accepted_at', null)
    _count.value = count ?? 0
  }

  return { pendingCount: readonly(_count), refresh }
}
