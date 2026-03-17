<template>
  <div>
    <div class="mb-6 text-center">
      <h1 class="font-javanese text-2xl font-bold text-stone-800 dark:text-stone-100">Daftar</h1>
      <p class="mt-1 text-sm text-amber-700/70 dark:text-amber-400/70 italic">Mulai catat silsilah keluarga Anda</p>
    </div>

    <!-- Sukses: verifikasi email -->
    <template v-if="registered">
      <UAlert
        color="success"
        variant="soft"
        icon="i-heroicons-envelope-open"
        title="Cek email Anda"
        description="Link verifikasi telah dikirim. Klik link tersebut untuk mengaktifkan akun."
        class="mb-4"
      />
      <UButton to="/auth/login" variant="outline" class="w-full justify-center">
        Kembali ke halaman masuk
      </UButton>
    </template>

    <template v-else>
      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        :description="error"
        class="mb-4"
        icon="i-heroicons-exclamation-circle"
        @close="clearError"
      />

      <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-4">
        <UFormField label="Nama Lengkap" name="displayName" required>
          <UInput
            v-model="state.displayName"
            placeholder="Contoh: Budi Santoso"
            size="lg"
            class="w-full"
            autocomplete="name"
          />
        </UFormField>

        <UFormField label="Email" name="email" required>
          <UInput
            v-model="state.email"
            type="email"
            placeholder="nama@email.com"
            size="lg"
            class="w-full"
            autocomplete="email"
          />
        </UFormField>

        <UFormField label="Kata Sandi" name="password" required>
          <UInput
            v-model="state.password"
            type="password"
            placeholder="Minimal 6 karakter"
            size="lg"
            class="w-full"
            autocomplete="new-password"
          />
        </UFormField>

        <UFormField label="Konfirmasi Kata Sandi" name="confirmPassword" required>
          <UInput
            v-model="state.confirmPassword"
            type="password"
            placeholder="Ulangi kata sandi"
            size="lg"
            class="w-full"
            autocomplete="new-password"
          />
        </UFormField>

        <UButton
          type="submit"
          size="lg"
          class="w-full justify-center"
          :loading="loading"
        >
          Daftar
        </UButton>
      </UForm>

      <div class="mt-4 trah-divider text-xs opacity-70">
        atau
      </div>

      <UButton
        variant="outline"
        size="lg"
        class="mt-4 w-full justify-center gap-2"
        :loading="loading"
        @click="signInWithGoogle"
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" class="h-4 w-4" />
        Daftar dengan Google
      </UButton>

      <p class="mt-6 text-center text-sm text-gray-500">
        Sudah punya akun?
        <NuxtLink to="/auth/login" class="text-primary-600 font-medium hover:underline">
          Masuk
        </NuxtLink>
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

definePageMeta({ layout: 'auth' })

useHead({ title: 'Daftar — Trah', meta: [{ name: 'robots', content: 'noindex' }] })

const user = useSupabaseUser()
if (user.value) await navigateTo('/dashboard')

const { loading, error, clearError, signUpWithEmail, signInWithGoogle } = useAuth()

const registered = ref(false)

const schema = z.object({
  displayName: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Kata sandi tidak cocok',
  path: ['confirmPassword'],
})

const state = reactive({ displayName: '', email: '', password: '', confirmPassword: '' })

async function onSubmit() {
  const result = await signUpWithEmail(state.email, state.password, state.displayName)
  if (result?.needsEmailVerification) {
    registered.value = true
  }
}
</script>
