<template>
  <div class="-mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900">
      <!-- Kawung background pattern -->
      <div class="absolute inset-0 bg-kawung-lg opacity-30" />

      <!-- Top ornamental border -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-900 via-amber-400 to-amber-900" />

      <!-- Decorative circle ornaments -->
      <div class="absolute top-20 left-10 w-32 h-32 rounded-full border border-amber-500/20 opacity-50" />
      <div class="absolute top-24 left-14 w-24 h-24 rounded-full border border-amber-400/15" />
      <div class="absolute bottom-32 right-10 w-48 h-48 rounded-full border border-amber-500/20 opacity-40" />
      <div class="absolute bottom-36 right-14 w-36 h-36 rounded-full border border-amber-400/15" />

      <div class="relative z-10 text-center px-4 py-24 max-w-4xl mx-auto">
        <!-- Pre-heading ornament -->
        <div class="trah-ornament justify-center mb-6 text-amber-400/80">
          Aplikasi Silsilah Keluarga Digital
        </div>

        <!-- Main title -->
        <h1 class="font-javanese text-6xl sm:text-7xl lg:text-8xl font-bold text-amber-400 mb-4 leading-tight">
          Trah
        </h1>

        <p class="font-javanese italic text-xl sm:text-2xl text-amber-200/90 mb-8">
          Nguri-uri Trah, Njaga Sejarah
        </p>

        <!-- Divider -->
        <div class="flex items-center justify-center gap-4 mb-8">
          <div class="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/60" />
          <span class="text-amber-500/60 text-lg">◆</span>
          <div class="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/60" />
        </div>

        <p class="text-stone-300 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
          Simpan, kelola, dan visualisasikan silsilah keluarga Anda secara digital.
          Lestarikan warisan leluhur untuk generasi mendatang.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <UButton
            to="/auth/register"
            size="xl"
            class="bg-amber-500 hover:bg-amber-400 text-amber-950 font-semibold px-8"
          >
            Mulai Sekarang — Gratis
          </UButton>
          <UButton
            to="/auth/login"
            variant="outline"
            size="xl"
            class="border-amber-500/50 text-amber-300 hover:bg-amber-500/10 px-8"
          >
            Masuk
          </UButton>
        </div>
      </div>

      <!-- Bottom wave ornament -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full" aria-hidden="true">
          <path d="M0 60 C360 0 1080 0 1440 60 L1440 60 L0 60Z" class="fill-amber-50 dark:fill-stone-950" />
        </svg>
      </div>
    </section>

    <!-- Features Section -->
    <section class="bg-amber-50 py-20 px-4 sm:px-6 lg:px-8 bg-kawung">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-14">
          <span class="trah-ornament justify-center mb-3 text-amber-700/70">Fitur Unggulan</span>
          <h2 class="trah-title font-javanese text-3xl sm:text-4xl font-bold text-stone-800 dark:text-stone-100 mb-4">
            Semua yang Anda butuhkan
          </h2>
          <p class="text-stone-600 max-w-xl mx-auto">
            Kelola silsilah keluarga dengan mudah dan lengkap dalam satu platform.
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="card-emas bg-white dark:bg-stone-900 rounded-xl p-6 shadow-sm ring-1 ring-amber-200/60 hover:shadow-md hover:ring-amber-300/80 transition-all"
          >
            <div class="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
              <UIcon :name="feature.icon" class="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 class="font-javanese font-semibold text-stone-800 dark:text-stone-100 mb-2">
              {{ feature.title }}
            </h3>
            <p class="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works section -->
    <section class="bg-white dark:bg-stone-900 py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-14">
          <span class="trah-ornament justify-center mb-3 text-amber-700/70">Cara Kerja</span>
          <h2 class="trah-title font-javanese text-3xl sm:text-4xl font-bold text-stone-800 dark:text-stone-100 mb-4">
            Tiga langkah mudah
          </h2>
        </div>

        <div class="grid sm:grid-cols-3 gap-8">
          <div v-for="step in steps" :key="step.number" class="text-center">
            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-md shadow-amber-200 dark:shadow-amber-900/40">
              <span class="font-javanese font-bold text-xl text-white">{{ step.number }}</span>
            </div>
            <h3 class="font-javanese font-semibold text-stone-800 dark:text-stone-100 mb-2">{{ step.title }}</h3>
            <p class="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Quote / Tagline Section -->
    <section class="bg-gradient-to-br from-stone-800 to-amber-950 py-20 px-4 text-center relative overflow-hidden">
      <div class="absolute inset-0 bg-parang opacity-30" aria-hidden="true" />
      <div class="relative z-10 max-w-3xl mx-auto">
        <div class="flex items-center justify-center gap-4 mb-8" aria-hidden="true">
          <div class="h-px w-12 bg-amber-500/50" />
          <span class="text-amber-500/60">◆ ◆ ◆</span>
          <div class="h-px w-12 bg-amber-500/50" />
        </div>
        <blockquote class="font-javanese italic text-2xl sm:text-3xl text-amber-200 mb-4 leading-relaxed">
          "Wong Jawa nggon-nggone ora ilang, trah-trahe ora pedhot."
        </blockquote>
        <p class="text-amber-400/70 text-sm">
          Orang Jawa tempatnya tidak hilang, silsilahnya tidak terputus.
        </p>
      </div>
    </section>

    <!-- FAQ Section (SEO long-tail keywords) -->
    <section class="bg-amber-50 dark:bg-stone-950 py-20 px-4 sm:px-6 lg:px-8 bg-kawung">
      <div class="max-w-3xl mx-auto">
        <div class="text-center mb-14">
          <span class="trah-ornament justify-center mb-3 text-amber-700/70">Pertanyaan Umum</span>
          <h2 class="trah-title font-javanese text-3xl sm:text-4xl font-bold text-stone-800 dark:text-stone-100 mb-4">
            Yang sering ditanyakan
          </h2>
        </div>

        <div class="space-y-4">
          <details
            v-for="faq in faqs"
            :key="faq.q"
            class="group card-emas bg-white dark:bg-stone-900 rounded-xl ring-1 ring-amber-200/60 overflow-hidden"
          >
            <summary class="flex items-center justify-between cursor-pointer px-6 py-4 font-medium text-stone-800 dark:text-stone-100 hover:bg-amber-50/50 dark:hover:bg-stone-800/50 transition-colors">
              <span>{{ faq.q }}</span>
              <UIcon name="i-heroicons-chevron-down" class="h-5 w-5 text-amber-600 transition-transform group-open:rotate-180 flex-shrink-0 ml-4" />
            </summary>
            <div class="px-6 pb-4 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              {{ faq.a }}
            </div>
          </details>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-white dark:bg-stone-900 py-20 px-4 text-center">
      <div class="max-w-2xl mx-auto">
        <p class="trah-ornament justify-center mb-3 text-amber-700/70">Mulai Sekarang</p>
        <h2 class="font-javanese text-3xl sm:text-4xl font-bold text-stone-800 dark:text-stone-100 mb-4">
          Jaga silsilah keluarga Anda
        </h2>
        <p class="text-stone-600 dark:text-stone-400 mb-8 text-lg leading-relaxed">
          Gratis selamanya. Tidak perlu kartu kredit.
          Mulai catat silsilah keluarga Anda hari ini.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <UButton to="/auth/register" size="xl" color="primary" class="px-10 font-semibold">
            Daftar Gratis
          </UButton>
          <UButton to="/auth/login" size="xl" color="neutral" variant="outline" class="px-10">
            Sudah punya akun? Masuk
          </UButton>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-stone-900 text-stone-400 py-12 px-4 border-t border-stone-800">
      <div class="max-w-6xl mx-auto">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div class="text-center md:text-left">
            <span class="trah-logo text-2xl">Trah</span>
            <p class="text-xs text-stone-500 mt-1 font-javanese italic">Nguri-uri Trah, Njaga Sejarah</p>
          </div>
          <nav class="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm" aria-label="Footer navigation">
            <NuxtLink to="/auth/register" class="hover:text-amber-400 transition-colors">Daftar</NuxtLink>
            <NuxtLink to="/auth/login" class="hover:text-amber-400 transition-colors">Masuk</NuxtLink>
            <NuxtLink to="/dashboard" class="hover:text-amber-400 transition-colors">Dashboard</NuxtLink>
            <NuxtLink to="/settings/import" class="hover:text-amber-400 transition-colors">Import GEDCOM</NuxtLink>
            <a href="https://github.com/setiapam/trah" target="_blank" rel="noopener" class="hover:text-amber-400 transition-colors">GitHub</a>
          </nav>
        </div>
        <div class="trah-divider opacity-20 mb-6">
          <span class="text-xs">◆</span>
        </div>
        <p class="text-xs text-stone-600 text-center">
          © {{ new Date().getFullYear() }} Trah. Dibuat dengan ♥ untuk keluarga Indonesia.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const title = 'Trah — Aplikasi Silsilah Keluarga Digital Indonesia'
const description = 'Aplikasi gratis untuk mencatat, mengelola, dan memvisualisasikan silsilah keluarga secara digital. Pohon keluarga interaktif, ekspor GEDCOM, kolaborasi keluarga, dan pernikahan antar-trah. Lestarikan warisan leluhur untuk generasi mendatang.'

useHead({
  title,
  titleTemplate: '',
  link: [
    { rel: 'canonical', href: 'https://trah.murphi.my.id/' },
  ],
})

useSeoMeta({
  description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: 'https://trah.murphi.my.id/',
  ogImage: 'https://trah.murphi.my.id/og-image.png',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: 'https://trah.murphi.my.id/og-image.png',
})

const steps = [
  {
    number: '1',
    title: 'Buat Trah',
    desc: 'Buat akun gratis dan mulai trah baru. Beri nama, tambahkan deskripsi singkat tentang keluarga Anda.',
  },
  {
    number: '2',
    title: 'Tambah Anggota',
    desc: 'Catat setiap anggota keluarga lengkap dengan foto, tanggal lahir, dan relasinya dalam keluarga.',
  },
  {
    number: '3',
    title: 'Lihat & Bagikan',
    desc: 'Visualisasikan pohon keluarga interaktif dan undang anggota keluarga lain untuk berkolaborasi.',
  },
]

const features = [
  {
    icon: 'i-heroicons-users',
    title: 'Kelola Anggota Keluarga',
    description: 'Catat data lengkap setiap anggota keluarga: nama, tanggal lahir, tempat lahir, foto, dan lebih banyak lagi.',
  },
  {
    icon: 'i-heroicons-chart-bar-square',
    title: 'Visualisasi Pohon Keluarga',
    description: 'Lihat silsilah keluarga dalam bentuk pohon interaktif. Zoom, pan, dan eksplorasi dengan mudah.',
  },
  {
    icon: 'i-heroicons-share',
    title: 'Kolaborasi Keluarga',
    description: 'Undang anggota keluarga lain untuk ikut mengisi dan menjaga data silsilah bersama-sama.',
  },
  {
    icon: 'i-heroicons-arrow-down-tray',
    title: 'Ekspor GEDCOM & JSON',
    description: 'Unduh data dalam format GEDCOM 5.5.1 standar internasional atau JSON untuk interoperabilitas.',
  },
  {
    icon: 'i-heroicons-arrow-up-tray',
    title: 'Impor dari Platform Lain',
    description: 'Import data dari Gramps, MyHeritage, FamilySearch, atau platform genealogi lainnya.',
  },
  {
    icon: 'i-heroicons-lock-closed',
    title: 'Privasi & Keamanan',
    description: 'Data Anda aman dengan enkripsi dan kontrol akses penuh. Anda yang menentukan siapa yang boleh melihat.',
  },
  {
    icon: 'i-heroicons-link',
    title: 'Pernikahan Antar-Trah',
    description: 'Hubungkan anggota keluarga dari trah berbeda saat menikah. Data tetap sinkron tanpa perlu input ulang.',
  },
  {
    icon: 'i-heroicons-plus-circle',
    title: 'Buat Trah dari Anggota',
    description: 'Buat trah baru langsung dari anggota yang sudah ada. Otomatis terhubung dengan trah asal melalui salinan terlink.',
  },
]

const faqs = [
  {
    q: 'Apa itu Trah?',
    a: 'Trah adalah aplikasi web gratis untuk mencatat dan memvisualisasikan silsilah keluarga secara digital. Kata "Trah" berasal dari bahasa Jawa yang berarti keturunan atau garis keluarga. Aplikasi ini membantu Anda melestarikan sejarah keluarga untuk generasi mendatang.',
  },
  {
    q: 'Apakah Trah gratis?',
    a: 'Ya, Trah sepenuhnya gratis. Anda bisa membuat akun, menambah anggota keluarga, memvisualisasikan pohon keluarga, dan berkolaborasi dengan keluarga tanpa biaya apapun.',
  },
  {
    q: 'Bagaimana cara membuat pohon keluarga di Trah?',
    a: 'Cukup daftar akun gratis, buat trah baru, dan mulai tambahkan anggota keluarga beserta relasinya (orang tua, anak, pasangan). Pohon keluarga akan otomatis divisualisasikan secara interaktif.',
  },
  {
    q: 'Apa itu format GEDCOM?',
    a: 'GEDCOM (Genealogical Data Communication) adalah format standar internasional untuk pertukaran data silsilah keluarga. Trah mendukung GEDCOM 5.5.1 sehingga Anda bisa mengimpor data dari Gramps, MyHeritage, FamilySearch, dan platform genealogi lainnya.',
  },
  {
    q: 'Bisakah anggota keluarga dari trah berbeda dihubungkan?',
    a: 'Ya! Fitur Pernikahan Antar-Trah memungkinkan Anda menghubungkan anggota keluarga dari trah berbeda saat menikah. Data akan otomatis terhubung tanpa perlu input ulang.',
  },
  {
    q: 'Apakah data silsilah keluarga saya aman?',
    a: 'Keamanan data adalah prioritas kami. Trah menggunakan Supabase dengan Row Level Security (RLS) sehingga hanya Anda dan anggota yang Anda undang yang bisa mengakses data keluarga Anda.',
  },
]

useSchemaOrg([
  defineWebPage({
    '@type': 'WebPage',
    name: title,
    description,
  }),
  defineSoftwareApp({
    name: 'Trah',
    operatingSystem: 'Web',
    applicationCategory: 'LifestyleApplication',
    description,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
  }),
])

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a,
          },
        })),
      }),
    },
  ],
})
</script>
