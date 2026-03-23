<template>
  <div>
    <div class="mb-6 text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Reset Kata Sandi</h1>
      <p class="mt-1 text-sm text-gray-500">Masukkan kata sandi baru Anda</p>
    </div>

    <!-- Success state -->
    <template v-if="updated">
      <UAlert
        color="success"
        variant="soft"
        icon="i-heroicons-check-circle"
        title="Kata sandi berhasil diubah"
        description="Silakan masuk dengan kata sandi baru Anda."
        class="mb-4"
      />
      <UButton to="/auth/login" variant="outline" class="w-full justify-center">
        Masuk
      </UButton>
    </template>

    <!-- Initializing session from recovery link -->
    <template v-else-if="initializing">
      <div class="flex flex-col items-center gap-3 py-8">
        <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-primary-600" />
        <p class="text-sm text-gray-500">Memverifikasi link reset...</p>
      </div>
    </template>

    <!-- Session error -->
    <template v-else-if="sessionError">
      <UAlert
        color="error"
        variant="soft"
        icon="i-heroicons-exclamation-circle"
        title="Link tidak valid"
        :description="sessionError"
        class="mb-4"
      />
      <UButton to="/auth/forgot" variant="outline" class="w-full justify-center">
        Minta link reset baru
      </UButton>
    </template>

    <!-- Password form -->
    <template v-else>
      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        :description="error"
        class="mb-4"
        icon="i-heroicons-exclamation-circle"
      />

      <form class="space-y-4" novalidate @submit.prevent="onSubmit">
        <UFormField label="Kata Sandi Baru" name="password" required :error="validationErrors.password">
          <UInput
            v-model="state.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Minimal 6 karakter"
            size="lg"
            class="w-full"
            autocomplete="new-password"
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
        <UFormField label="Konfirmasi Kata Sandi" name="confirmPassword" required :error="validationErrors.confirmPassword">
          <UInput
            v-model="state.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="Ulangi kata sandi"
            size="lg"
            class="w-full"
            autocomplete="new-password"
          >
            <template #trailing>
              <UButton
                :icon="showConfirmPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                color="neutral"
                variant="ghost"
                size="xs"
                :padded="false"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </UInput>
        </UFormField>
        <UButton type="submit" size="lg" class="w-full justify-center" :loading="loading">
          Simpan Kata Sandi Baru
        </UButton>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Reset Kata Sandi — Trah' })

const supabase = useSupabaseClient()
const session = useSupabaseSession()
const route = useRoute()
const { loading, error, updatePassword } = useAuth()

const updated = ref(false)
const initializing = ref(true)
const sessionError = ref<string | null>(null)

const schema = z.object({
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Kata sandi tidak cocok',
  path: ['confirmPassword'],
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const state = reactive({ password: '', confirmPassword: '' })
const validationErrors = reactive({ password: '', confirmPassword: '' })

function validate(): boolean {
  validationErrors.password = ''
  validationErrors.confirmPassword = ''

  const result = schema.safeParse(state)
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof typeof validationErrors
      if (field && !validationErrors[field]) {
        validationErrors[field] = issue.message
      }
    }
    return false
  }
  return true
}

async function onSubmit() {
  if (!validate()) return
  const result = await updatePassword(state.password)
  if (result?.updated) {
    updated.value = true
    // Sign out so user logs in fresh with new password
    await supabase.auth.signOut()
  }
}

// Exchange recovery code/token for session
onMounted(async () => {
  try {
    const code = route.query.code as string | undefined

    if (code) {
      // PKCE flow: exchange code for session
      const { error: err } = await supabase.auth.exchangeCodeForSession(code)
      if (err) {
        // Session might already have been exchanged by Supabase module
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
          sessionError.value = 'Link reset sudah kedaluwarsa atau tidak valid. Silakan minta link baru.'
          return
        }
      }
      initializing.value = false
      return
    }

    // Implicit flow: hash fragment tokens — Supabase client handles automatically
    // Wait for session to appear
    if (session.value) {
      initializing.value = false
      return
    }

    // Watch for session from hash token processing
    const unwatch = watch(session, (val) => {
      if (val) {
        unwatch()
        initializing.value = false
      }
    })

    // Timeout fallback
    setTimeout(async () => {
      if (!session.value) {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          session.value = data.session
          initializing.value = false
        } else {
          unwatch()
          sessionError.value = 'Link reset sudah kedaluwarsa atau tidak valid. Silakan minta link baru.'
        }
      }
    }, 5000)
  } catch {
    sessionError.value = 'Terjadi kesalahan saat memverifikasi link. Silakan minta link baru.'
  }
})
</script>
