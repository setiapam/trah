<template>
  <div class="max-w-2xl mx-auto space-y-8">
    <!-- Back + heading -->
    <div class="flex items-center gap-3">
      <UButton
        to="/settings"
        variant="ghost"
        color="neutral"
        size="sm"
        icon="i-heroicons-arrow-left"
        class="text-stone-600 hover:text-stone-800"
      >
        Pengaturan
      </UButton>
    </div>

    <div>
      <p class="trah-ornament mb-1">Akun</p>
      <h1 class="trah-title text-2xl font-bold text-stone-800 dark:text-stone-100">
        Profil Saya
      </h1>
      <p class="mt-2 text-stone-500 dark:text-stone-400 text-sm">
        Kelola nama tampilan dan foto akun Anda.
      </p>
    </div>

    <!-- User ID section -->
    <div class="card-emas ring-1 ring-amber-200/60 p-6 space-y-3">
      <h3 class="font-javanese font-semibold text-stone-700 dark:text-stone-300 text-sm flex items-center gap-2">
        <UIcon name="i-heroicons-identification" class="h-4 w-4 text-amber-500" />
        User ID Saya
      </h3>
      <p class="text-xs text-stone-500 dark:text-stone-400">
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

    <!-- Loading -->
    <div v-if="loading && !profile" class="flex justify-center py-12">
      <USkeleton class="h-64 w-full rounded-xl" />
    </div>

    <!-- Profile form -->
    <div v-else-if="profile" class="card-emas ring-1 ring-amber-200/60 p-6 space-y-5">
      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        :description="error"
        icon="i-heroicons-exclamation-circle"
      />
      <UAlert
        v-if="saved"
        color="success"
        variant="soft"
        description="Profil berhasil diperbarui"
        icon="i-heroicons-check-circle"
      />

      <UForm :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
        <!-- Avatar -->
        <div class="flex items-center gap-4">
          <UAvatar
            :src="avatarPreview ?? profile.avatarUrl ?? undefined"
            :alt="profile.displayName"
            size="xl"
          />
          <div>
            <label class="cursor-pointer">
              <UButton variant="outline" size="sm" as="span">Ganti Foto</UButton>
              <input
                type="file"
                class="hidden"
                accept="image/jpeg,image/png,image/webp"
                @change="onAvatarChange"
              />
            </label>
            <p class="mt-1 text-xs text-stone-400">JPG, PNG, WebP. Maks 2MB</p>
          </div>
        </div>

        <UFormField label="Nama Tampilan" name="displayName" required>
          <UInput v-model="state.displayName" placeholder="Nama Anda" size="lg" class="w-full" />
        </UFormField>

        <UFormField label="Email">
          <UInput :value="user?.email" disabled size="lg" class="w-full" />
        </UFormField>

        <div class="flex justify-end">
          <UButton type="submit" color="primary" :loading="loading">Simpan Perubahan</UButton>
        </div>
      </UForm>
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
const { copy, isSupported: clipboardSupported } = useClipboard()

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

async function copyUserId(): Promise<void> {
  const id = user.value?.id ?? ''
  if (!id) return
  try {
    if (clipboardSupported.value) {
      await copy(id)
    }
    else {
      const el = document.createElement('textarea')
      el.value = id
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    toast.add({ title: 'User ID disalin', color: 'success' })
  }
  catch {
    toast.add({ title: 'Gagal menyalin. Salin manual dari kotak di atas.', color: 'error' })
  }
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
