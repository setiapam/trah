<template>
  <div class="space-y-4">
    <!-- Success banner -->
    <div class="card-emas ring-1 ring-amber-200/60 p-5">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <UIcon name="i-heroicons-check-circle" class="h-7 w-7 text-green-600" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-javanese text-lg font-semibold text-stone-800 dark:text-stone-100">
            Import Berhasil
          </h3>
          <p class="text-stone-600 dark:text-stone-300 mt-0.5">
            <span class="font-semibold text-amber-600 font-javanese">{{ personCount }}</span>
            anggota keluarga berhasil diimpor ke dalam trah baru.
          </p>
          <div class="mt-4">
            <UButton
              color="primary"
              variant="solid"
              size="sm"
              icon="i-heroicons-eye"
              @click="navigateTo(`/tree/${treeId}`)"
            >
              Lihat Silsilah
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Warnings collapsible -->
    <div v-if="warnings.length > 0" class="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 overflow-hidden">
      <button
        class="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors"
        @click="showWarnings = !showWarnings"
      >
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-exclamation-triangle" class="h-5 w-5 text-amber-600 shrink-0" />
          <span class="font-medium text-amber-800 dark:text-amber-300 text-sm">
            {{ warnings.length }} peringatan ditemukan
          </span>
        </div>
        <UIcon
          :name="showWarnings ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
          class="h-4 w-4 text-amber-600"
        />
      </button>

      <Transition name="slide">
        <ul v-if="showWarnings" class="divide-y divide-amber-100 dark:divide-amber-900">
          <li
            v-for="(warning, idx) in warnings"
            :key="idx"
            class="flex items-start gap-2 px-5 py-2.5"
          >
            <UIcon name="i-heroicons-exclamation-circle" class="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <span class="text-sm text-amber-800 dark:text-amber-300">{{ warning }}</span>
          </li>
        </ul>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  warnings: string[]
  personCount: number
  treeId: string
}>()

const showWarnings = ref(false)
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: max-height 0.25s ease, opacity 0.25s ease;
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-enter-to,
.slide-leave-from {
  max-height: 500px;
  opacity: 1;
}
</style>
