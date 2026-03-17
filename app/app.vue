<template>
  <UApp>
    <NuxtLayout>
      <NuxtRouteAnnouncer />
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'id' },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { charset: 'utf-8' },
    { name: 'theme-color', content: '#d97706' },
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  ],
  titleTemplate: (title) => title ?? 'Trah — Nguri-uri Trah, Njaga Sejarah',
})
</script>
