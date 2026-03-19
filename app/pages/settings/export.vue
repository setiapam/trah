<template>
  <div class="max-w-2xl mx-auto space-y-8">
    <!-- Back + heading -->
    <div class="flex items-center gap-3">
      <UButton
        to="/settings"
        variant="ghost"
        color="neutral"
        size="sm"
        icon="i-heroicons-arrow-left"
        class="text-stone-600 hover:text-stone-800"
      >
        Pengaturan
      </UButton>
    </div>

    <div>
      <p class="trah-ornament mb-1">Data Silsilah</p>
      <h1 class="trah-title text-2xl font-bold text-stone-800 dark:text-stone-100">
        Ekspor Data
      </h1>
      <p class="mt-2 text-stone-500 dark:text-stone-400 text-sm">
        Unduh data silsilah keluarga Anda dalam format GEDCOM 5.5.1 atau JSON Trah.
      </p>
    </div>

    <!-- Loading state -->
    <div v-if="loadingTrees" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-20 bg-stone-100 dark:bg-stone-800 rounded-xl animate-pulse" />
    </div>

    <!-- Empty state -->
    <div v-else-if="trees.length === 0" class="card-emas ring-1 ring-amber-200/60 p-10 text-center">
      <div class="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-heroicons-folder-open" class="h-8 w-8 text-amber-500" />
      </div>
      <h3 class="font-javanese font-semibold text-stone-700 dark:text-stone-300 text-lg mb-2">
        Belum ada trah
      </h3>
      <p class="text-stone-400 text-sm mb-4">
        Buat trah baru terlebih dahulu untuk bisa mengekspor data.
      </p>
      <UButton to="/tree/new" color="primary" variant="solid" size="sm">
        Buat Trah Baru
      </UButton>
    </div>

    <!-- Tree list -->
    <div v-else class="space-y-3">
      <div
        v-for="tree in trees"
        :key="tree.id"
        class="card-emas ring-1 ring-amber-200/60 p-5"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0 flex-1">
            <h3 class="font-javanese font-semibold text-stone-800 dark:text-stone-100 truncate">
              {{ tree.name }}
            </h3>
            <p v-if="tree.description" class="text-sm text-stone-500 dark:text-stone-400 truncate mt-0.5">
              {{ tree.description }}
            </p>
            <p class="text-xs text-stone-400 mt-1">
              Dibuat {{ formatDateDMY(tree.createdAt) }}
            </p>
          </div>
        </div>

        <!-- Export buttons -->
        <div class="mt-4 flex flex-wrap gap-2">
          <UButton
            color="primary"
            variant="outline"
            size="sm"
            icon="i-heroicons-arrow-down-tray"
            :loading="gedcomExportingId === tree.id"
            :disabled="gedcomExporting || jsonExporting"
            @click="handleGedcomExport(tree.id, tree.name)"
          >
            Ekspor GEDCOM
          </UButton>

          <UButton
            color="primary"
            variant="soft"
            size="sm"
            icon="i-heroicons-code-bracket"
            :loading="jsonExportingId === tree.id"
            :disabled="gedcomExporting || jsonExporting"
            @click="handleJsonExport(tree.id, tree.name)"
          >
            Ekspor JSON
          </UButton>
        </div>
      </div>
    </div>

    <!-- Info cards -->
    <div class="space-y-3">
      <div class="rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 p-5">
        <h3 class="font-javanese font-semibold text-stone-700 dark:text-stone-300 text-sm mb-2 flex items-center gap-2">
          <UIcon name="i-heroicons-information-circle" class="h-4 w-4 text-amber-500" />
          Tentang Format GEDCOM
        </h3>
        <ul class="space-y-1 text-xs text-stone-500 dark:text-stone-400 list-disc list-inside">
          <li>File diunduh dalam format GEDCOM 5.5.1 standar internasional</li>
          <li>Kompatibel dengan Gramps, MyHeritage, FamilySearch, Ancestry</li>
          <li>Menyertakan data nama, tanggal, tempat, dan relasi keluarga</li>
          <li>Foto profil tidak disertakan dalam ekspor GEDCOM</li>
        </ul>
      </div>

      <div class="rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 p-5">
        <h3 class="font-javanese font-semibold text-stone-700 dark:text-stone-300 text-sm mb-2 flex items-center gap-2">
          <UIcon name="i-heroicons-information-circle" class="h-4 w-4 text-amber-500" />
          Tentang Format JSON Trah
        </h3>
        <ul class="space-y-1 text-xs text-stone-500 dark:text-stone-400 list-disc list-inside">
          <li>Format JSON khusus aplikasi Trah (.trah.json)</li>
          <li>Menyertakan semua data lengkap termasuk catatan dan kontak</li>
          <li>Dapat diimpor kembali ke aplikasi Trah</li>
          <li>Ideal untuk backup dan pemindahan data antar akun</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Ekspor Data — Trah' })

const { trees, loading: loadingTrees, fetchTrees } = useTree()
const { exporting: gedcomExporting, exportGedcom } = useGedcom()
const { exporting: jsonExporting, exportJson } = useJsonExport()

const gedcomExportingId = ref<string | null>(null)
const jsonExportingId = ref<string | null>(null)

// Fetch trees on mount
await useAsyncData('export-trees', () => fetchTrees().then(() => true))

async function handleGedcomExport(treeId: string, treeName: string) {
  gedcomExportingId.value = treeId
  try {
    await exportGedcom(treeId, treeName)
  }
  finally {
    gedcomExportingId.value = null
  }
}

async function handleJsonExport(treeId: string, treeName: string) {
  jsonExportingId.value = treeId
  try {
    await exportJson(treeId, treeName)
  }
  finally {
    jsonExportingId.value = null
  }
}

</script>
