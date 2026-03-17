<template>
  <div class="max-w-lg">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Profil Saya</h1>
      <p class="mt-1 text-sm text-gray-500">Kelola informasi akun Anda</p>
    </div>

    <UCard v-if="profile">
      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        :description="error"
        class="mb-4"
        icon="i-heroicons-exclamation-circle"
      />

      <UAlert
        v-if="saved"
        color="success"
        variant="soft"
        description="Profil berhasil diperbarui"
        class="mb-4"
        icon="i-heroicons-check-circle"
      />

      <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-5">
        <!-- Avatar -->
        <div class="flex items-center gap-4">
          <UAvatar
            :src="avatarPreview ?? profile.avatarUrl ?? undefined"
            :alt="profile.displayName"
            size="xl"
          />
          <div>
            <label class="cursor-pointer">
              <UButton variant="outline" size="sm" as="span">
                Ganti Foto
              </UButton>
              <input
                type="file"
                class="hidden"
                accept="image/jpeg,image/png,image/webp"
                @change="onAvatarChange"
              />
            </label>
            <p class="mt-1 text-xs text-gray-400">JPG, PNG, WebP. Maks 2MB</p>
          </div>
        </div>

        <UFormField label="Nama Tampilan" name="displayName" required>
          <UInput v-model="state.displayName" placeholder="Nama Anda" size="lg" class="w-full" />
        </UFormField>

        <UFormField label="Email">
          <UInput :value="user?.email" disabled size="lg" class="w-full" />
        </UFormField>

        <div class="flex justify-end">
          <UButton type="submit" :loading="loading">Simpan Perubahan</UButton>
        </div>
      </UForm>
    </UCard>

    <div v-else-if="loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="h-6 w-6 animate-spin text-gray-400" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Profil — Trah' })

const { user } = useAuth()
const { profile, loading, error, fetchProfile, updateProfile, uploadAvatar } = useProfile()

const saved = ref(false)
const avatarPreview = ref<string | null>(null)
const pendingAvatarFile = ref<File | null>(null)

const schema = z.object({
  displayName: z.string().min(2, 'Nama minimal 2 karakter'),
})

const state = reactive({ displayName: '' })

onMounted(async () => {
  await fetchProfile()
  if (profile.value) state.displayName = profile.value.displayName
})

function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    alert('Ukuran file maksimal 2MB')
    return
  }
  pendingAvatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

async function onSubmit() {
  saved.value = false
  let avatarUrl: string | undefined

  if (pendingAvatarFile.value) {
    try {
      avatarUrl = await uploadAvatar(pendingAvatarFile.value) ?? undefined
    } catch {
      // error sudah di-set oleh uploadAvatar
      return
    }
  }

  const result = await updateProfile(state.displayName, avatarUrl)
  if (result?.success) {
    saved.value = true
    pendingAvatarFile.value = null
    setTimeout(() => { saved.value = false }, 3000)
  }
}
</script>
