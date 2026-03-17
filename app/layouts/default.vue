<template>
  <div class="min-h-screen bg-stone-50 dark:bg-stone-950 bg-kawung">
    <!-- Header with gold border -->
    <header class="border-emas-top border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-3">
          <span class="trah-logo text-2xl">Trah</span>
          <span class="hidden sm:block text-xs text-amber-700/70 dark:text-amber-400/60 italic font-javanese">
            Nguri-uri Trah, Njaga Sejarah
          </span>
        </NuxtLink>

        <nav class="flex items-center gap-2">
          <template v-if="user">
            <NuxtLink
              to="/dashboard"
              class="hidden sm:block text-sm text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 px-3 py-2 rounded-md hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors font-medium"
            >
              Dashboard
            </NuxtLink>

            <!-- Invitation bell -->
            <UButton
              to="/settings/invitations"
              icon="i-heroicons-bell"
              color="neutral"
              variant="ghost"
              size="sm"
              class="relative"
            >
              <span
                v-if="pendingCount > 0"
                class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none"
              >
                {{ pendingCount > 9 ? '9+' : pendingCount }}
              </span>
            </UButton>

            <UButton
              :icon="colorModeIcon"
              color="neutral"
              variant="ghost"
              size="sm"
              :title="colorModeLabel"
              @click="cycleColorMode"
            />

            <UDropdownMenu :items="userMenuItems">
              <UButton variant="ghost" size="sm" class="gap-2">
                <UAvatar :alt="user.email" size="xs" />
                <span class="hidden sm:block text-sm">{{ user.email }}</span>
                <UIcon name="i-heroicons-chevron-down" class="h-4 w-4 text-stone-400" />
              </UButton>
            </UDropdownMenu>
          </template>

          <template v-else>
            <UButton
              :icon="colorModeIcon"
              color="neutral"
              variant="ghost"
              size="sm"
              :title="colorModeLabel"
              @click="cycleColorMode"
            />
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
const session = useSupabaseSession()
const colorMode = useColorMode()

const { pendingCount, refresh: refreshInvitationCount } = useInvitationCount()

watch(() => session.value?.user?.id, (id) => {
  if (id) refreshInvitationCount()
}, { immediate: true })

const colorModeIcon = computed(() => {
  if (colorMode.preference === 'dark') return 'i-heroicons-moon'
  if (colorMode.preference === 'light') return 'i-heroicons-sun'
  return 'i-heroicons-computer-desktop'
})

const colorModeLabel = computed(() => {
  if (colorMode.preference === 'dark') return 'Mode Gelap'
  if (colorMode.preference === 'light') return 'Mode Terang'
  return 'Ikuti Sistem'
})

function cycleColorMode() {
  const modes = ['system', 'light', 'dark'] as const
  const current = modes.indexOf(colorMode.preference as typeof modes[number])
  colorMode.preference = modes[(current + 1) % modes.length]
}

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
      label: pendingCount.value > 0 ? `Undangan Masuk (${pendingCount.value})` : 'Undangan Masuk',
      icon: 'i-heroicons-bell',
      to: '/settings/invitations',
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
