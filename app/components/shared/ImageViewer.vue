<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div class="relative flex items-center justify-center bg-black/90 p-2 min-h-[300px]">
        <UButton
          icon="i-heroicons-x-mark"
          color="neutral"
          variant="ghost"
          size="lg"
          class="absolute top-2 right-2 text-white hover:bg-white/20 z-10"
          @click="isOpen = false"
        />
        <img
          :src="src"
          :alt="alt"
          class="max-w-full max-h-[80vh] object-contain rounded"
        >
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const isOpen = defineModel<boolean>('open', { default: false })

defineProps<{
  src: string
  alt?: string
}>()
</script>
