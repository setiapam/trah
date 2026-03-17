<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Header -->
    <header class="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2">
          <span class="text-xl font-bold text-primary-600 dark:text-primary-400">Trah</span>
          <span class="text-xs text-gray-500 hidden sm:block italic">Nguri-uri Trah, Njaga Sejarah</span>
        </NuxtLink>

        <nav class="flex items-center gap-2">
          <template v-if="user">
            <NuxtLink
              to="/dashboard"
              class="hidden sm:block text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Dashboard
            </NuxtLink>

            <UDropdownMenu :items="userMenuItems">
              <UButton variant="ghost" size="sm" class="gap-2">
                <UAvatar :alt="user.email" size="xs" />
                <span class="hidden sm:block text-sm">{{ user.email }}</span>
                <UIcon name="i-heroicons-chevron-down" class="h-4 w-4 text-gray-400" />
              </UButton>
            </UDropdownMenu>
          </template>

          <template v-else>
            <UButton to="/auth/login" variant="ghost" size="sm">Masuk</UButton>
            <UButton to="/auth/register" size="sm">Daftar</UButton>
          </template>
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
const { user, signOut } = useAuth()

const userMenuItems = computed(() => [
  [
    {
      label: 'Dashboard',
      icon: 'i-heroicons-squares-2x2',
      to: '/dashboard',
    },
    {
      label: 'Profil Saya',
      icon: 'i-heroicons-user-circle',
      to: '/settings/profile',
    },
    {
      label: 'Pengaturan',
      icon: 'i-heroicons-cog-6-tooth',
      to: '/settings',
    },
  ],
  [
    {
      label: 'Keluar',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      color: 'error' as const,
      onSelect: signOut,
    },
  ],
])
</script>
