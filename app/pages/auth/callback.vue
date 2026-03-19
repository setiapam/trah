<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
      <p class="text-gray-600 dark:text-gray-400">{{ statusMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Memproses — Trah' })

const supabase = useSupabaseClient()
const statusMessage = ref('Memproses autentikasi...')

onMounted(async () => {
  const route = useRoute()

  // Handle error dari OAuth provider / Supabase
  if (route.query.error) {
    console.error('OAuth error:', route.query.error, route.query.error_description)
    statusMessage.value = `Error: ${route.query.error_description ?? route.query.error}`
    setTimeout(() => navigateTo('/auth/login'), 3000)
    return
  }

  // PKCE flow: code ada di query string
  const code = route.query.code as string | undefined
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Exchange session error:', error.message)
      // Check if session was already established (e.g. by Supabase module)
      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session) {
        await navigateTo('/dashboard')
        return
      }
      statusMessage.value = 'Gagal memproses autentikasi. Silakan coba lagi.'
      setTimeout(() => navigateTo('/auth/login'), 3000)
      return
    }
    await navigateTo('/dashboard')
    return
  }

  // Implicit flow / hash token: cek session yang sudah terbentuk
  // Retry briefly to allow hash-based session to be processed
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      await navigateTo('/dashboard')
      return
    }
    if (attempt < 2) await new Promise(r => setTimeout(r, 1000))
  }

  // Tidak ada session — redirect ke login
  statusMessage.value = 'Sesi tidak ditemukan. Mengalihkan...'
  setTimeout(() => navigateTo('/auth/login'), 2000)
})
</script>
