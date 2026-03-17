<template>
  <div class="text-center py-20">
    <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Trah</h1>
    <p class="text-xl text-gray-600 dark:text-gray-400 italic mb-8">
      Nguri-uri Trah, Njaga Sejarah
    </p>
    <p class="text-gray-500 max-w-md mx-auto mb-10">
      Aplikasi pencatatan silsilah keluarga digital. Simpan, kelola, dan visualisasikan pohon
      keluarga Anda.
    </p>
    <div class="flex gap-4 justify-center">
      <UButton to="/auth/register" size="lg">Mulai Sekarang</UButton>
      <UButton to="/auth/login" variant="outline" size="lg">Masuk</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Trah — Nguri-uri Trah, Njaga Sejarah',
  meta: [
    {
      name: 'description',
      content: 'Aplikasi web pencatatan silsilah keluarga. Simpan dan visualisasikan pohon keluarga Anda secara digital.',
    },
  ],
})
</script>
