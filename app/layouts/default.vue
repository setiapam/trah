<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Header -->
    <header class="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2">
          <span class="text-xl font-bold text-primary-600 dark:text-primary-400">Trah</span>
          <span class="text-xs text-gray-500 hidden sm:block">Nguri-uri Trah, Njaga Sejarah</span>
        </NuxtLink>

        <nav class="flex items-center gap-4">
          <NuxtLink
            v-if="user"
            to="/dashboard"
            class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink
            v-if="user"
            to="/settings"
            class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600"
          >
            Pengaturan
          </NuxtLink>
          <UButton v-if="user" variant="ghost" size="sm" @click="handleLogout">Keluar</UButton>
          <UButton v-else to="/auth/login" size="sm">Masuk</UButton>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

async function handleLogout() {
  await supabase.auth.signOut()
  await navigateTo('/auth/login')
}
</script>
