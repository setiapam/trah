/**
 * Composable utama untuk autentikasi.
 * Wrapper di atas @nuxtjs/supabase dengan state management tambahan.
 */
export function useAuth() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const loading = ref(false)
  const error = ref<string | null>(null)

  function clearError() {
    error.value = null
  }

  async function signInWithEmail(email: string, password: string) {
    loading.value = true
    clearError()
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
      await navigateTo('/dashboard')
    } catch (e: unknown) {
      error.value = getAuthErrorMessage(e)
    } finally {
      loading.value = false
    }
  }

  async function signUpWithEmail(email: string, password: string, displayName: string) {
    loading.value = true
    clearError()
    try {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: displayName } },
      })
      if (err) throw err
      // Tampilkan pesan verifikasi email
      return { needsEmailVerification: true }
    } catch (e: unknown) {
      error.value = getAuthErrorMessage(e)
    } finally {
      loading.value = false
    }
  }

  async function signInWithGoogle() {
    loading.value = true
    clearError()
    try {
      const redirectTo = `${window.location.origin}/auth/callback`
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })
      if (err) throw err
    } catch (e: unknown) {
      error.value = getAuthErrorMessage(e)
      loading.value = false
    }
  }

  async function signOut() {
    loading.value = true
    try {
      await supabase.auth.signOut()
      await navigateTo('/auth/login')
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(email: string) {
    loading.value = true
    clearError()
    try {
      const redirectTo = `${window.location.origin}/auth/reset`
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (err) throw err
      return { sent: true }
    } catch (e: unknown) {
      error.value = getAuthErrorMessage(e)
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    clearError,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    resetPassword,
  }
}

function getAuthErrorMessage(e: unknown): string {
  if (e instanceof Error) {
    // Terjemahkan pesan Supabase yang umum
    const msg = e.message.toLowerCase()
    if (msg.includes('invalid login credentials')) return 'Email atau kata sandi salah'
    if (msg.includes('email not confirmed')) return 'Email belum diverifikasi. Cek kotak masuk Anda'
    if (msg.includes('user already registered')) return 'Email sudah terdaftar'
    if (msg.includes('password should be')) return 'Kata sandi minimal 6 karakter'
    return e.message
  }
  return 'Terjadi kesalahan. Coba lagi.'
}
