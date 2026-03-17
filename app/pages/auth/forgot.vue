<template>
  <div>
    <div class="mb-6 text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Lupa Kata Sandi</h1>
      <p class="mt-1 text-sm text-gray-500">Masukkan email Anda untuk menerima link reset</p>
    </div>

    <template v-if="sent">
      <UAlert
        color="success"
        variant="soft"
        icon="i-heroicons-envelope-open"
        title="Email terkirim"
        description="Cek kotak masuk Anda dan klik link untuk reset kata sandi."
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
      />

      <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-4">
        <UFormField label="Email" name="email" required>
          <UInput v-model="state.email" type="email" placeholder="nama@email.com" size="lg" class="w-full" />
        </UFormField>
        <UButton type="submit" size="lg" class="w-full justify-center" :loading="loading">
          Kirim Link Reset
        </UButton>
      </UForm>

      <p class="mt-4 text-center text-sm text-gray-500">
        <NuxtLink to="/auth/login" class="text-primary-600 hover:underline">Kembali ke masuk</NuxtLink>
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Lupa Kata Sandi — Trah' })

const { loading, error, resetPassword } = useAuth()
const sent = ref(false)

const schema = z.object({ email: z.string().email('Format email tidak valid') })
const state = reactive({ email: '' })

async function onSubmit() {
  const result = await resetPassword(state.email)
  if (result?.sent) sent.value = true
}
</script>
