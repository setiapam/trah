<template>
  <div>
    <div class="mb-6 text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Masuk</h1>
      <p class="mt-1 text-sm text-gray-500">Selamat datang kembali</p>
    </div>

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
          placeholder="Kata sandi"
          size="lg"
          class="w-full"
          autocomplete="current-password"
        />
      </UFormField>

      <div class="flex justify-end">
        <NuxtLink to="/auth/forgot" class="text-sm text-primary-600 hover:underline">
          Lupa kata sandi?
        </NuxtLink>
      </div>

      <UButton
        type="submit"
        size="lg"
        class="w-full justify-center"
        :loading="loading"
      >
        Masuk
      </UButton>
    </UForm>

    <div class="mt-4 flex items-center gap-3">
      <div class="flex-1 border-t border-gray-200 dark:border-gray-700" />
      <span class="text-xs text-gray-400">atau</span>
      <div class="flex-1 border-t border-gray-200 dark:border-gray-700" />
    </div>

    <UButton
      variant="outline"
      size="lg"
      class="mt-4 w-full justify-center gap-2"
      :loading="loading"
      @click="signInWithGoogle"
    >
      <img src="https://www.google.com/favicon.ico" alt="Google" class="h-4 w-4" />
      Masuk dengan Google
    </UButton>

    <p class="mt-6 text-center text-sm text-gray-500">
      Belum punya akun?
      <NuxtLink to="/auth/register" class="text-primary-600 font-medium hover:underline">
        Daftar sekarang
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

definePageMeta({ layout: 'auth' })

useHead({ title: 'Masuk — Trah' })

// Redirect jika sudah login
const user = useSupabaseUser()
if (user.value) await navigateTo('/dashboard')

const { loading, error, clearError, signInWithEmail, signInWithGoogle } = useAuth()

const schema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
})

const state = reactive({ email: '', password: '' })

async function onSubmit() {
  await signInWithEmail(state.email, state.password)
}
</script>
