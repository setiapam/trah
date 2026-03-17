<template>
  <div class="min-h-screen bg-amber-50 dark:bg-stone-950 bg-kawung-lg flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex flex-col items-center gap-2">
          <span class="trah-logo text-4xl">Trah</span>
          <span class="trah-ornament text-amber-700/80 dark:text-amber-500/70 text-xs">
            Nguri-uri Trah, Njaga Sejarah
          </span>
        </NuxtLink>
      </div>

      <!-- Card with gold top bar -->
      <div class="card-emas rounded-xl bg-white dark:bg-stone-900 shadow-lg ring-1 ring-amber-200/60 dark:ring-stone-700/60 overflow-hidden">
        <div class="p-6 sm:p-8">
          <slot />
        </div>
      </div>

      <!-- Decorative bottom line -->
      <div class="mt-6 trah-divider opacity-50">
        <span class="text-xs">◆</span>
      </div>
    </div>
  </div>
</template>
