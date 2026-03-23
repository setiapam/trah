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
const session = useSupabaseSession()
const route = useRoute()
const statusMessage = ref('Memproses autentikasi...')

// If session is already available (e.g. auto-exchanged by Supabase module), navigate immediately
if (session.value) {
  await navigateTo('/dashboard')
}

// Handle error from OAuth provider
if (route.query.error) {
  console.error('OAuth error:', route.query.error, route.query.error_description)
  statusMessage.value = `Error: ${route.query.error_description ?? route.query.error}`
  setTimeout(() => navigateTo('/auth/login'), 3000)
} else {
  // Watch for session changes — most reliable way to detect when auth completes
  const unwatch = watch(session, (val) => {
    if (val) {
      unwatch()
      navigateTo('/dashboard')
    }
  })

  onMounted(async () => {
    // PKCE flow: code in query string
    const code = route.query.code as string | undefined
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error && data.session) {
        // Manually update session state so watcher + middleware see it immediately
        session.value = data.session
        return
      }
      if (error) {
        // Session might already have been exchanged by Supabase module
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData.session) {
          session.value = sessionData.session
          return
        }
      }
    }

    // Implicit flow / hash token: wait for Supabase client to process it
    // The watcher above will catch it when onAuthStateChange fires
    // Fallback timeout if nothing happens
    setTimeout(async () => {
      if (!session.value) {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          session.value = data.session
        } else {
          unwatch()
          statusMessage.value = 'Sesi tidak ditemukan. Mengalihkan...'
          setTimeout(() => navigateTo('/auth/login'), 2000)
        }
      }
    }, 5000)
  })
}
</script>
