/**
 * Composable untuk manajemen profil user.
 */
export function useProfile() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const profile = ref<{ id: string; displayName: string; avatarUrl: string | null } | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProfile() {
    if (!user.value) return
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .eq('id', user.value.id)
        .single()
      if (err) throw err
      profile.value = {
        id: data.id,
        displayName: data.display_name,
        avatarUrl: data.avatar_url,
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Gagal memuat profil'
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(displayName: string, avatarUrl?: string | null) {
    if (!user.value) return
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          ...(avatarUrl !== undefined && { avatar_url: avatarUrl }),
        })
        .eq('id', user.value.id)
        .select('id, display_name, avatar_url')
        .single()
      if (err) throw err
      profile.value = {
        id: data.id,
        displayName: data.display_name,
        avatarUrl: data.avatar_url,
      }
      return { success: true }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Gagal memperbarui profil'
    } finally {
      loading.value = false
    }
  }

  async function uploadAvatar(file: File): Promise<string | null> {
    if (!user.value) return null
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `avatars/${user.value.id}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('media')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (uploadErr) throw uploadErr

    const { data } = supabase.storage.from('media').getPublicUrl(path)
    return data.publicUrl
  }

  return { profile, loading, error, fetchProfile, updateProfile, uploadAvatar }
}
