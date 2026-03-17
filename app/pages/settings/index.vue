<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Pengaturan</h1>
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 hover:border-primary-400 hover:shadow-sm transition-all"
      >
        <UIcon :name="item.icon" class="h-5 w-5 text-primary-600" />
        <div>
          <p class="font-medium text-gray-900 dark:text-white text-sm">{{ item.label }}</p>
          <p class="text-xs text-gray-400">{{ item.desc }}</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Pengaturan — Trah' })

const menuItems = [
  { to: '/settings/profile', icon: 'i-heroicons-user-circle', label: 'Profil', desc: 'Nama dan foto akun' },
  { to: '/settings/import', icon: 'i-heroicons-arrow-up-tray', label: 'Import Data', desc: 'GEDCOM & JSON' },
  { to: '/settings/export', icon: 'i-heroicons-arrow-down-tray', label: 'Export Data', desc: 'GEDCOM & JSON' },
]
</script>
