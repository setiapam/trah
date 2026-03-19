<template>
  <UApp>
    <NuxtLayout>
      <NuxtRouteAnnouncer />
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
const siteUrl = 'https://trah.murphi.my.id'
const siteName = 'Trah'
const defaultDescription = 'Aplikasi silsilah keluarga digital. Simpan, kelola, dan visualisasikan pohon keluarga Anda secara digital. Gratis, aman, dan mendukung format GEDCOM.'

useHead({
  htmlAttrs: { lang: 'id' },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { charset: 'utf-8' },
    { name: 'theme-color', content: '#d97706' },
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
  ],
  titleTemplate: (title) => title ? `${title} | Trah` : 'Trah — Aplikasi Silsilah Keluarga Digital',
})

useSeoMeta({
  ogSiteName: siteName,
  ogLocale: 'id_ID',
  ogType: 'website',
  ogImageUrl: `${siteUrl}/og-image.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'Trah — Aplikasi Silsilah Keluarga Digital Indonesia',
  ogUrl: siteUrl,
  description: defaultDescription,
  twitterCard: 'summary_large_image',
  twitterSite: '@trah',
  robots: 'index, follow',
})

useSchemaOrg([
  defineWebSite({
    name: siteName,
    url: siteUrl,
    description: defaultDescription,
    inLanguage: 'id',
  }),
  defineOrganization({
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/favicon.svg`,
  }),
])
</script>
