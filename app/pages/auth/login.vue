<template>
  <div>
    <div class="mb-6 text-center">
      <h1 class="font-javanese text-2xl font-bold text-stone-800 dark:text-stone-100">Masuk</h1>
      <p class="mt-1 text-sm text-amber-700/70 dark:text-amber-400/70 italic">Selamat datang kembali</p>
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
          :type="showPassword ? 'text' : 'password'"
          placeholder="Kata sandi"
          size="lg"
          class="w-full"
          autocomplete="current-password"
        >
          <template #trailing>
            <UButton
              :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
              color="neutral"
              variant="ghost"
              size="xs"
              :padded="false"
              @click="showPassword = !showPassword"
            />
          </template>
        </UInput>
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
      Masuk dengan Google
    </UButton>

    <p class="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
      Belum punya akun?
      <NuxtLink to="/auth/register" class="text-amber-700 dark:text-amber-400 font-medium hover:underline">
        Daftar sekarang
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ layout: 'auth' })

useHead({ title: 'Masuk — Trah', meta: [{ name: 'robots', content: 'noindex' }] })

// Redirect jika sudah login
const user = useSupabaseUser()
if (user.value) await navigateTo('/dashboard')

const { loading, error, clearError, signInWithEmail, signInWithGoogle } = useAuth()

const schema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
})

type Schema = z.output<typeof schema>

const showPassword = ref(false)
const state = reactive({ email: '', password: '' })

async function onSubmit(event: FormSubmitEvent<Schema>) {
  await signInWithEmail(event.data.email, event.data.password)
}
</script>
