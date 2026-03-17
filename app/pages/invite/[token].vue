<template>
  <div class="min-h-screen bg-amber-50 dark:bg-stone-950 bg-kawung flex items-center justify-center px-4">
    <div class="w-full max-w-md text-center">
      <NuxtLink to="/" class="inline-flex flex-col items-center gap-2 mb-10">
        <span class="trah-logo text-3xl">Trah</span>
      </NuxtLink>

      <!-- Loading -->
      <div v-if="loading" class="card-emas bg-white dark:bg-stone-900 ring-1 ring-amber-200/60 rounded-2xl p-10">
        <USkeleton class="h-12 w-12 rounded-full mx-auto mb-4" />
        <USkeleton class="h-5 w-48 mx-auto mb-2" />
        <USkeleton class="h-4 w-32 mx-auto" />
      </div>

      <!-- Already logged in redirect notice -->
      <div v-else-if="!user" class="card-emas bg-white dark:bg-stone-900 ring-1 ring-amber-200/60 rounded-2xl p-10">
        <div class="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-heroicons-envelope-open" class="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <p class="trah-ornament justify-center mb-3 text-amber-700/70">Undangan Kolaborasi</p>
        <h1 class="font-javanese text-xl font-bold text-stone-800 dark:text-stone-100 mb-3">
          Anda mendapat undangan
        </h1>
        <p class="text-sm text-stone-500 dark:text-stone-400 mb-6">
          Login atau daftar terlebih dahulu untuk menerima undangan kolaborasi silsilah ini.
        </p>
        <div class="flex flex-col gap-3">
          <UButton color="primary" to="/auth/login" :query="{ redirect: $route.fullPath }">
            Masuk
          </UButton>
          <UButton color="neutral" variant="outline" to="/auth/register" :query="{ redirect: $route.fullPath }">
            Daftar Gratis
          </UButton>
        </div>
      </div>

      <!-- Accepted state -->
      <div v-else-if="accepted" class="card-emas bg-white dark:bg-stone-900 ring-1 ring-amber-200/60 rounded-2xl p-10">
        <div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-heroicons-check-circle" class="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 class="font-javanese text-xl font-bold text-stone-800 dark:text-stone-100 mb-3">
          Undangan diterima!
        </h1>
        <p class="text-sm text-stone-500 dark:text-stone-400 mb-6">
          Anda kini bisa mengakses silsilah yang dibagikan.
        </p>
        <UButton color="primary" to="/dashboard">
          Buka Dashboard
        </UButton>
      </div>

      <!-- Error state -->
      <div v-else-if="errorMsg" class="card-emas bg-white dark:bg-stone-900 ring-1 ring-amber-200/60 rounded-2xl p-10">
        <div class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-heroicons-x-circle" class="w-8 h-8 text-red-500" />
        </div>
        <h1 class="font-javanese text-xl font-bold text-stone-800 dark:text-stone-100 mb-3">
          Undangan tidak valid
        </h1>
        <p class="text-sm text-stone-500 dark:text-stone-400 mb-6">{{ errorMsg }}</p>
        <UButton color="neutral" variant="outline" to="/dashboard">
          Kembali ke Dashboard
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Undangan — Trah', meta: [{ name: 'robots', content: 'noindex' }] })

const route = useRoute()
const token = route.params.token as string
const user = useSupabaseUser()
const { fetchMyInvitations, acceptInvitation } = useTreeMembers()

const loading = ref(true)
const accepted = ref(false)
const errorMsg = ref<string | null>(null)

onMounted(async () => {
  if (!user.value) {
    loading.value = false
    return
  }

  try {
    // token is the tree_member id
    const invitations = await fetchMyInvitations()
    const match = invitations.find(i => i.id === token)

    if (!match) {
      errorMsg.value = 'Undangan tidak ditemukan atau sudah tidak berlaku.'
      return
    }

    const ok = await acceptInvitation(token)
    if (ok) {
      accepted.value = true
    }
    else {
      errorMsg.value = 'Gagal menerima undangan. Coba lagi nanti.'
    }
  }
  catch {
    errorMsg.value = 'Terjadi kesalahan. Silakan coba lagi.'
  }
  finally {
    loading.value = false
  }
})
</script>
