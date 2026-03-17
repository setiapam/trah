/**
 * Composable untuk verifikasi koneksi Supabase.
 * Digunakan saat development / diagnostik.
 */
export function useSupabaseHealth() {
  const isConnected = ref(false)
  const isChecking = ref(false)
  const error = ref<string | null>(null)

  async function checkConnection() {
    isChecking.value = true
    error.value = null

    try {
      const result = await $fetch<{ status: string; message?: string }>('/api/health')
      isConnected.value = result.status === 'ok'
      if (result.status !== 'ok') {
        error.value = result.message ?? 'Connection failed'
      }
    } catch (err: unknown) {
      isConnected.value = false
      error.value = err instanceof Error ? err.message : 'Network error'
    } finally {
      isChecking.value = false
    }
  }

  return { isConnected, isChecking, error, checkConnection }
}
