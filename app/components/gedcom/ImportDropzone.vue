<template>
  <div
    class="relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer select-none"
    :class="isDragging
      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
      : 'border-amber-300/60 hover:border-amber-400 bg-white dark:bg-stone-900 hover:bg-amber-50/40 dark:hover:bg-stone-800'"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
    @click="handleClick"
  >
    <input
      ref="fileInput"
      type="file"
      accept=".ged,.gedcom"
      class="hidden"
      @change="onFileChange"
    />

    <div class="flex flex-col items-center gap-3">
      <!-- Upload icon -->
      <div
        class="w-16 h-16 rounded-full flex items-center justify-center transition-colors"
        :class="isDragging ? 'bg-amber-200' : 'bg-amber-100'"
      >
        <UIcon
          v-if="!loading"
          name="i-heroicons-arrow-up-tray"
          class="h-8 w-8 text-amber-600"
        />
        <UIcon
          v-else
          name="i-heroicons-arrow-path"
          class="h-8 w-8 text-amber-600 animate-spin"
        />
      </div>

      <!-- Selected file info or prompt -->
      <template v-if="selectedFile && !loading">
        <p class="text-base font-medium text-stone-800 dark:text-stone-100 font-javanese">
          {{ selectedFile.name }}
        </p>
        <p class="text-sm text-stone-500 dark:text-stone-400">
          {{ formatFileSize(selectedFile.size) }} &middot; Siap diimpor
        </p>
        <button
          class="text-xs text-amber-600 hover:text-amber-700 underline underline-offset-2"
          @click.stop="clearFile"
        >
          Ganti file
        </button>
      </template>
      <template v-else-if="loading">
        <p class="text-base font-medium text-stone-600 dark:text-stone-300 font-javanese">
          Mengimpor data...
        </p>
        <p class="text-sm text-stone-400">Mohon tunggu, proses import sedang berjalan</p>
      </template>
      <template v-else>
        <p class="text-base font-medium text-stone-700 dark:text-stone-200 font-javanese">
          Drag &amp; drop file <span class="text-amber-600">.ged</span> di sini
        </p>
        <p class="text-sm text-stone-500 dark:text-stone-400">atau klik untuk memilih file</p>
        <p class="text-xs text-stone-400 dark:text-stone-500 mt-1">
          Mendukung format GEDCOM 5.5.1 &middot; Maksimal 50 MB
        </p>
      </template>
    </div>

    <!-- Drag overlay -->
    <div
      v-if="isDragging"
      class="absolute inset-0 rounded-xl bg-amber-100/60 dark:bg-amber-900/30 flex items-center justify-center pointer-events-none"
    >
      <p class="text-amber-700 font-medium text-lg font-javanese">Lepaskan file di sini</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'file-selected', file: File): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const selectedFile = ref<File | null>(null)

function handleClick() {
  if (!props.loading) {
    fileInput.value?.click()
  }
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  if (props.loading) return

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files.item(0)
    if (file && isValidGedcomFile(file)) {
      selectedFile.value = file
      emit('file-selected', file)
    }
  }
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file && isValidGedcomFile(file)) {
    selectedFile.value = file
    emit('file-selected', file)
  }
  // Reset input value so the same file can be selected again
  input.value = ''
}

function clearFile() {
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function isValidGedcomFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return name.endsWith('.ged') || name.endsWith('.gedcom')
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>
