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
        Ekspor GEDCOM
      </h1>
      <p class="mt-2 text-stone-500 dark:text-stone-400 text-sm">
        Unduh data silsilah keluarga Anda dalam format GEDCOM 5.5.1 yang kompatibel dengan Gramps, MyHeritage, FamilySearch, dan aplikasi genealogi lainnya.
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
        class="card-emas ring-1 ring-amber-200/60 p-5 flex items-center justify-between gap-4"
      >
        <div class="min-w-0 flex-1">
          <h3 class="font-javanese font-semibold text-stone-800 dark:text-stone-100 truncate">
            {{ tree.name }}
          </h3>
          <p v-if="tree.description" class="text-sm text-stone-500 dark:text-stone-400 truncate mt-0.5">
            {{ tree.description }}
          </p>
          <p class="text-xs text-stone-400 mt-1">
            Dibuat {{ formatDate(tree.createdAt) }}
          </p>
        </div>

        <UButton
          color="primary"
          variant="outline"
          size="sm"
          icon="i-heroicons-arrow-down-tray"
          :loading="exportingId === tree.id"
          :disabled="exporting"
          @click="handleExport(tree.id, tree.name)"
        >
          Ekspor GEDCOM
        </UButton>
      </div>
    </div>

    <!-- Info card -->
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Ekspor GEDCOM — Trah' })

const { trees, loading: loadingTrees, fetchTrees } = useTree()
const { exporting, exportGedcom } = useGedcom()

const exportingId = ref<string | null>(null)

// Fetch trees on mount
await useAsyncData('export-trees', () => fetchTrees().then(() => true))

async function handleExport(treeId: string, treeName: string) {
  exportingId.value = treeId
  try {
    await exportGedcom(treeId, treeName)
  }
  finally {
    exportingId.value = null
  }
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>
