<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex flex-col items-center gap-1">
          <span class="text-3xl font-bold text-primary-600 dark:text-primary-400">Trah</span>
          <span class="text-sm text-gray-500 italic">Nguri-uri Trah, Njaga Sejarah</span>
        </NuxtLink>
      </div>

      <!-- Card -->
      <UCard>
        <slot />
      </UCard>
    </div>
  </div>
</template>
