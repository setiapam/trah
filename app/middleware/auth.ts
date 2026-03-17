/**
 * Route middleware — melindungi halaman yang membutuhkan autentikasi.
 * Gunakan di page dengan: definePageMeta({ middleware: 'auth' })
 */
export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser()

  if (!user.value) {
    return navigateTo('/auth/login')
  }
})
