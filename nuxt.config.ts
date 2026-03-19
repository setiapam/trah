// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  site: {
    url: 'https://trah.murphi.my.id',
    name: 'Trah — Aplikasi Silsilah Keluarga Digital',
  },

  modules: [
    '@nuxtjs/supabase',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/test-utils/module',
    '@nuxt/eslint',
    '@nuxtjs/sitemap',
    'nuxt-schema-org',
    '@vite-pwa/nuxt',
  ],

  pwa: {
    registerType: 'autoUpdate',
    manifest: false, // Use existing site.webmanifest
    workbox: {
      // Precache build assets
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      // Runtime caching strategies
      runtimeCaching: [
        {
          // Google Fonts stylesheets
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-stylesheets',
            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          // Google Fonts webfont files
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-webfonts',
            expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          // Supabase storage images (person photos)
          urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'supabase-storage',
            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          // Nuxt page navigations — network first, fallback to cache
          urlPattern: /^https:\/\/trah\.murphi\.my\.id\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages',
            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            cacheableResponse: { statuses: [0, 200] },
            networkTimeoutSeconds: 5,
          },
        },
      ],
      // Don't precache service worker itself
      navigateFallback: null,
    },
    client: {
      installPrompt: false,
    },
    devOptions: {
      enabled: false, // Disable in development
    },
  },

  schemaOrg: {
    identity: 'Organization',
  },

  sitemap: {
    exclude: [
      '/auth/**',
      '/settings/**',
      '/dashboard/**',
      '/tree/**',
      '/person/**',
      '/invite/**',
    ],
  },

  supabase: {
    types: '~/types/database.types.ts',
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/callback',
      exclude: ['/', '/about', '/auth/login', '/auth/register', '/auth/forgot', '/auth/callback', '/invite/*'],
    },
  },

  routeRules: {
    // Hashed build assets — immutable, cache 1 year
    '/_nuxt/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
    // Static files (favicon, images, manifest, robots) — cache 1 week
    '/favicon.ico': {
      headers: { 'Cache-Control': 'public, max-age=604800' },
    },
    '/favicon.svg': {
      headers: { 'Cache-Control': 'public, max-age=604800' },
    },
    '/apple-touch-icon.png': {
      headers: { 'Cache-Control': 'public, max-age=604800' },
    },
    '/og-image.png': {
      headers: { 'Cache-Control': 'public, max-age=604800' },
    },
    '/site.webmanifest': {
      headers: { 'Cache-Control': 'public, max-age=604800' },
    },
    '/robots.txt': {
      headers: { 'Cache-Control': 'public, max-age=86400' },
    },
    // HTML pages — short cache with stale-while-revalidate
    '/': {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200',
      },
    },
    '/about': {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200',
      },
    },
    // API routes — no cache
    '/api/**': {
      headers: { 'Cache-Control': 'no-store' },
    },
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
    },
  },
})
