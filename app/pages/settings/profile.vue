<template>
  <div class="max-w-lg space-y-6">
    <div class="mb-6">
      <p class="trah-ornament mb-1">Akun</p>
      <h1 class="trah-title font-javanese text-2xl font-bold text-stone-800 dark:text-stone-100">Profil Saya</h1>
      <p class="mt-1 text-sm text-stone-500">Kelola informasi akun Anda</p>
    </div>

    <!-- User ID section -->
    <div class="card-emas bg-white dark:bg-stone-900 rounded-xl p-5 ring-1 ring-amber-200/60 space-y-2">
      <p class="text-sm font-medium text-stone-700 dark:text-stone-300 font-javanese">User ID Saya</p>
      <p class="text-xs text-stone-500 mb-2">
        Bagikan ID ini ke orang yang ingin mengundang Anda ke silsilah mereka.
      </p>
      <div class="flex items-center gap-2">
        <code class="flex-1 bg-stone-100 dark:bg-stone-800 rounded-lg px-3 py-2 text-xs font-mono text-stone-700 dark:text-stone-300 truncate">
          {{ user?.id ?? '-' }}
        </code>
        <UButton icon="i-heroicons-clipboard" size="xs" color="neutral" variant="outline" @click="copyUserId">
          Salin
        </UButton>
      </div>
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
      <UIcon name="i-heroicons-arrow-path" class="h-6 w-6 animate-spin text-stone-400" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Profil — Trah' })

const { user } = useAuth()
const { profile, loading, error, fetchProfile, updateProfile, uploadAvatar } = useProfile()
const toast = useToast()

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

function copyUserId(): void {
  navigator.clipboard.writeText(user.value?.id ?? '').then(() => {
    toast.add({ title: 'User ID disalin', color: 'success' })
  }).catch(() => {
    toast.add({ title: 'Gagal menyalin', color: 'error' })
  })
}

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
