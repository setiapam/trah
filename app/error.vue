<template>
  <div class="min-h-screen bg-amber-50 dark:bg-stone-950 bg-kawung flex items-center justify-center px-4">
    <!-- Top ornamental border -->
    <div class="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-900 via-amber-400 to-amber-900" />

    <div class="max-w-lg w-full text-center">
      <!-- Logo -->
      <NuxtLink to="/" class="inline-flex flex-col items-center gap-2 mb-10">
        <span class="trah-logo text-3xl">Trah</span>
      </NuxtLink>

      <!-- Error card -->
      <div class="card-emas bg-white dark:bg-stone-900 ring-1 ring-amber-200/60 dark:ring-stone-700/60 rounded-2xl p-10 shadow-lg">
        <!-- Error code -->
        <div class="font-javanese text-7xl font-bold text-amber-500/40 dark:text-amber-600/30 mb-2 leading-none select-none">
          {{ is404 ? '404' : error?.statusCode ?? '???' }}
        </div>

        <!-- Icon -->
        <div class="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-5">
          <UIcon
            :name="is404 ? 'i-heroicons-map' : 'i-heroicons-exclamation-triangle'"
            class="w-8 h-8 text-amber-600 dark:text-amber-400"
          />
        </div>

        <p class="trah-ornament justify-center mb-3 text-amber-700/70 dark:text-amber-500/60">
          {{ is404 ? 'Halaman Tidak Ditemukan' : 'Terjadi Kesalahan' }}
        </p>

        <h1 class="font-javanese text-xl font-bold text-stone-800 dark:text-stone-100 mb-3">
          {{ is404 ? 'Aduh, jejaknya hilang...' : 'Trah sedang kurang sehat' }}
        </h1>

        <p class="text-sm text-stone-500 dark:text-stone-400 mb-8 leading-relaxed">
          {{ is404
            ? 'Halaman yang Anda cari tidak ada, atau sudah dipindahkan. Silakan kembali ke beranda.'
            : (error?.message ?? 'Ada yang tidak beres. Coba muat ulang halaman atau kembali ke beranda.')
          }}
        </p>

        <div class="trah-divider mb-8 opacity-40">
          <span class="text-xs">◆</span>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <UButton
            color="primary"
            variant="solid"
            icon="i-heroicons-home"
            to="/"
            @click="handleError"
          >
            Kembali ke Beranda
          </UButton>
          <UButton
            v-if="!is404"
            color="neutral"
            variant="outline"
            icon="i-heroicons-arrow-path"
            @click="reloadPage"
          >
            Muat Ulang
          </UButton>
        </div>
      </div>

      <p class="mt-6 text-xs text-stone-400 dark:text-stone-600">
        Butuh bantuan? Hubungi kami melalui halaman beranda.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const is404 = computed(() => props.error?.statusCode === 404)

useHead({
  title: is404.value ? 'Halaman Tidak Ditemukan — Trah' : 'Terjadi Kesalahan — Trah',
})

function handleError() {
  clearError({ redirect: '/' })
}

function reloadPage() {
  clearError()
  window.location.reload()
}
</script>
