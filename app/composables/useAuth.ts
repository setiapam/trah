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
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
      // Manually update session state before navigating to prevent
      // auth-redirect middleware from redirecting back to login
      // (onAuthStateChange fires asynchronously via setTimeout)
      if (data.session) {
        const currentSession = useSupabaseSession()
        currentSession.value = data.session
      }
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

  async function updatePassword(newPassword: string) {
    loading.value = true
    clearError()
    try {
      const { error: err } = await supabase.auth.updateUser({ password: newPassword })
      if (err) throw err
      return { updated: true }
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
    updatePassword,
  }
}

function getAuthErrorMessage(e: unknown): string {
  if (e instanceof Error) {
    // Terjemahkan pesan Supabase yang umum
    const msg = e.message.toLowerCase()
    if (msg.includes('invalid login credentials')) return 'Email atau kata sandi salah'
    if (msg.includes('email not confirmed')) return 'Email belum diverifikasi. Cek kotak masuk Anda'
    if (msg.includes('user already registered')) return 'Email sudah terdaftar'
    if (msg.includes('password')) {
      // Extract actual requirement from Supabase error (e.g. "at least 8 characters", "contain uppercase")
      const lengthMatch = e.message.match(/at least (\d+) characters/)
      if (lengthMatch) return `Kata sandi minimal ${lengthMatch[1]} karakter`
      // Characters/content requirements
      if (msg.includes('uppercase') || msg.includes('lower') || msg.includes('digit') || msg.includes('symbol'))
        return `Kata sandi tidak memenuhi syarat: ${e.message}`
      if (msg.includes('password should be') || msg.includes('password is too'))
        return `Kata sandi tidak memenuhi syarat: ${e.message}`
    }
    return e.message
  }
  return 'Terjadi kesalahan. Coba lagi.'
}
