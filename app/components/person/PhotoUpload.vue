<template>
  <div class="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity">
    <label
      class="w-full bg-black/60 text-white text-xs text-center py-1 cursor-pointer rounded-b-full"
      :class="uploading ? 'cursor-wait' : 'cursor-pointer'"
    >
      <span v-if="uploading">
        <UIcon name="i-heroicons-arrow-path" class="h-3 w-3 animate-spin inline" />
      </span>
      <span v-else>Ganti Foto</span>
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        :disabled="uploading"
        @change="onFileChange"
      >
    </label>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  personId: string
  treeId: string
  currentUrl: string | null
}>()

const emit = defineEmits<{
  uploaded: [url: string]
}>()

const nuxtApp = useNuxtApp()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const repos = nuxtApp.$repos as any
const toast = useToast()

const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const MAX_SIZE = 2 * 1024 * 1024 // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // Validate
  if (!ALLOWED_TYPES.includes(file.type)) {
    toast.add({ title: 'Format tidak didukung. Gunakan JPG, PNG, atau WebP.', color: 'error' })
    input.value = ''
    return
  }
  if (file.size > MAX_SIZE) {
    toast.add({ title: 'Ukuran file maksimal 2 MB.', color: 'error' })
    input.value = ''
    return
  }

  uploading.value = true
  try {
    const media = await repos.media.upload({
      personId: props.personId,
      treeId: props.treeId,
      file,
    })
    emit('uploaded', media.fileUrl)
    toast.add({ title: 'Foto berhasil diperbarui', color: 'success' })
  }
  catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Gagal mengunggah foto'
    toast.add({ title: msg, color: 'error' })
  }
  finally {
    uploading.value = false
    input.value = ''
  }
}
</script>
