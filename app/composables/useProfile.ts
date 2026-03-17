/**
 * Composable untuk manajemen profil user.
 */
export function useProfile() {
  const supabase = useSupabaseClient()
  const session = useSupabaseSession()

  const profile = ref<{ id: string; displayName: string; avatarUrl: string | null } | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProfile() {
    const userId = session.value?.user?.id
    if (!userId) return
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .eq('id', userId)
        .single()
      if (err) throw err
      profile.value = {
        id: data.id,
        displayName: data.display_name,
        avatarUrl: data.avatar_url,
      }
    }
    catch (e: unknown) {
      const msg = (e instanceof Error ? e.message : null)
        ?? (e && typeof e === 'object' && 'message' in e ? (e as { message: string }).message : null)
        ?? 'Gagal memuat profil'
      error.value = msg
    }
    finally {
      loading.value = false
    }
  }

  async function updateProfile(displayName: string, avatarUrl?: string | null) {
    const userId = session.value?.user?.id
    if (!userId) return
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          ...(avatarUrl !== undefined && { avatar_url: avatarUrl }),
        })
        .eq('id', userId)
        .select('id, display_name, avatar_url')
        .single()
      if (err) throw err
      profile.value = {
        id: data.id,
        displayName: data.display_name,
        avatarUrl: data.avatar_url,
      }
      return { success: true }
    }
    catch (e: unknown) {
      const msg = (e instanceof Error ? e.message : null)
        ?? (e && typeof e === 'object' && 'message' in e ? (e as { message: string }).message : null)
        ?? 'Gagal memperbarui profil'
      error.value = msg
    }
    finally {
      loading.value = false
    }
  }

  async function uploadAvatar(file: File): Promise<string | null> {
    const userId = session.value?.user?.id
    if (!userId) return null
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `avatars/${userId}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('media')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (uploadErr) throw uploadErr

    const { data } = supabase.storage.from('media').getPublicUrl(path)
    return data.publicUrl
  }

  return { profile, loading, error, fetchProfile, updateProfile, uploadAvatar }
}
