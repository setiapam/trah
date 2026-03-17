<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
      <p class="text-gray-600 dark:text-gray-400">Memproses autentikasi...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Callback page untuk OAuth (Google, dll).
 * @nuxtjs/supabase menangani exchange code → session secara otomatis.
 * Halaman ini hanya menampilkan loading sementara redirect terjadi.
 */
definePageMeta({ layout: false })

useHead({ title: 'Memproses — Trah' })

const user = useSupabaseUser()

// Tunggu session terbentuk lalu redirect
watchEffect(() => {
  if (user.value) {
    navigateTo('/dashboard')
  }
})

// Fallback: jika 5 detik tidak ada user, redirect ke login
onMounted(() => {
  setTimeout(() => {
    if (!user.value) navigateTo('/auth/login')
  }, 5000)
})
</script>
