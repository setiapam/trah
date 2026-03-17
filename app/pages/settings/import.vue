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
        Impor GEDCOM
      </h1>
      <p class="mt-2 text-stone-500 dark:text-stone-400 text-sm">
        Unggah file GEDCOM (.ged) dari aplikasi genealogi lain seperti Gramps, MyHeritage, atau FamilySearch.
      </p>
    </div>

    <!-- Import result -->
    <template v-if="importResult">
      <GedcomValidationResult
        :warnings="importResult.warnings"
        :person-count="importResult.personCount"
        :tree-id="importResult.treeId"
      />
      <div class="trah-divider">atau impor file lain</div>
    </template>

    <!-- Import form -->
    <div class="card-emas ring-1 ring-amber-200/60 p-6 space-y-6">
      <!-- Dropzone -->
      <GedcomImportDropzone
        :loading="importing"
        @file-selected="onFileSelected"
      />

      <!-- Optional tree name override -->
      <div>
        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
          Nama Trah <span class="text-stone-400 font-normal">(opsional)</span>
        </label>
        <UInput
          v-model="treeName"
          placeholder="Biarkan kosong untuk menggunakan nama dari file"
          :disabled="importing"
          color="primary"
        />
        <p class="mt-1 text-xs text-stone-400">
          Jika dikosongkan, nama trah akan diambil dari nama file.
        </p>
      </div>

      <!-- Error message -->
      <UAlert
        v-if="importError"
        color="error"
        variant="soft"
        icon="i-heroicons-x-circle"
        :title="importError"
      />

      <!-- Submit button -->
      <div class="flex justify-end">
        <UButton
          color="primary"
          variant="solid"
          :disabled="!selectedFile || importing"
          :loading="importing"
          icon="i-heroicons-arrow-up-tray"
          size="md"
          @click="startImport"
        >
          Mulai Impor
        </UButton>
      </div>
    </div>

    <!-- Info card -->
    <div class="rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 p-5">
      <h3 class="font-javanese font-semibold text-stone-700 dark:text-stone-300 text-sm mb-2 flex items-center gap-2">
        <UIcon name="i-heroicons-information-circle" class="h-4 w-4 text-amber-500" />
        Format yang Didukung
      </h3>
      <ul class="space-y-1 text-xs text-stone-500 dark:text-stone-400 list-disc list-inside">
        <li>GEDCOM 5.5.1 (.ged, .gedcom)</li>
        <li>Gramps, MyHeritage, FamilySearch, Ancestry</li>
        <li>Nama dengan aksara UTF-8</li>
        <li>Tanggal parsial (hanya tahun atau bulan+tahun)</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import GedcomImportDropzone from '../../components/gedcom/ImportDropzone.vue'
import GedcomValidationResult from '../../components/gedcom/ValidationResult.vue'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Impor GEDCOM — Trah' })

const { importing, importError, importGedcom } = useGedcom()

const selectedFile = ref<File | null>(null)
const treeName = ref('')
const importResult = ref<{ treeId: string; personCount: number; warnings: string[] } | null>(null)

function onFileSelected(file: File) {
  selectedFile.value = file
  importResult.value = null
  // Pre-fill tree name from filename if empty
  if (!treeName.value) {
    treeName.value = file.name.replace(/\.(ged|gedcom)$/i, '')
  }
}

async function startImport() {
  if (!selectedFile.value) return
  importResult.value = null

  const result = await importGedcom(selectedFile.value, treeName.value || undefined)
  if (result) {
    importResult.value = result
    selectedFile.value = null
    treeName.value = ''
  }
}
</script>
