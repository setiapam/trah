<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div>
      <p class="trah-ornament mb-1">Akun &amp; Data</p>
      <h1 class="trah-title text-2xl font-bold text-stone-800 dark:text-stone-100">
        Pengaturan
      </h1>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        class="card-emas ring-1 ring-amber-200/60 flex items-center gap-3 p-4 hover:ring-amber-400 hover:shadow-sm transition-all"
      >
        <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <UIcon :name="item.icon" class="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <p class="font-medium text-stone-800 dark:text-stone-100 text-sm">{{ item.label }}</p>
          <p class="text-xs text-stone-400">{{ item.desc }}</p>
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
