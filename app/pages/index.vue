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
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full">
          <path d="M0 60 C360 0 1080 0 1440 60 L1440 60 L0 60Z" fill="#fffbeb" />
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

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

    <!-- Quote / Tagline Section -->
    <section class="bg-gradient-to-br from-stone-800 to-amber-950 py-20 px-4 text-center relative overflow-hidden">
      <div class="absolute inset-0 bg-parang opacity-30" />
      <div class="relative z-10 max-w-3xl mx-auto">
        <div class="flex items-center justify-center gap-4 mb-8">
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

    <!-- CTA Section -->
    <section class="bg-amber-50 py-20 px-4 text-center bg-kawung">
      <div class="max-w-2xl mx-auto">
        <h2 class="font-javanese text-3xl sm:text-4xl font-bold text-stone-800 mb-4">
          Mulai hari ini
        </h2>
        <p class="text-stone-600 mb-8 text-lg">
          Bergabung dengan keluarga-keluarga yang sudah melestarikan silsilah mereka bersama Trah.
        </p>
        <UButton
          to="/auth/register"
          size="xl"
          class="px-10"
        >
          Daftar Gratis
        </UButton>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-stone-900 text-stone-400 py-10 px-4 text-center border-t border-stone-800">
      <div class="trah-ornament justify-center mb-4 text-amber-600/60">
        Trah — Nguri-uri Trah, Njaga Sejarah
      </div>
      <p class="text-xs text-stone-600">
        © {{ new Date().getFullYear() }} Trah. Dibuat dengan ♥ untuk keluarga Indonesia.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Trah — Nguri-uri Trah, Njaga Sejarah',
  meta: [
    {
      name: 'description',
      content: 'Aplikasi web pencatatan silsilah keluarga. Simpan dan visualisasikan pohon keluarga Anda secara digital.',
    },
  ],
})

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
]
</script>
