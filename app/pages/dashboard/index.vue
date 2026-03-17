<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Selamat datang{{ profile?.displayName ? `, ${profile.displayName}` : '' }}
        </h1>
        <p class="mt-1 text-sm text-gray-500">Kelola silsilah keluarga Anda</p>
      </div>
      <UButton to="/tree/new" icon="i-heroicons-plus">
        Buat Trah Baru
      </UButton>
    </div>

    <!-- Placeholder sampai Tahap 6 -->
    <UCard class="text-center py-16">
      <UIcon name="i-heroicons-user-group" class="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-500">Belum ada trah. Mulai dengan membuat trah pertama Anda.</p>
      <UButton to="/tree/new" class="mt-4">Buat Trah Baru</UButton>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Dashboard — Trah' })

const { profile, fetchProfile } = useProfile()
onMounted(fetchProfile)
</script>
