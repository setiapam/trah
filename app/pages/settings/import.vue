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
        Impor Data
      </h1>
      <p class="mt-2 text-stone-500 dark:text-stone-400 text-sm">
        Impor data silsilah dari file GEDCOM atau format JSON Trah.
      </p>
    </div>

    <!-- Format tabs -->
    <div class="flex gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
      <button
        class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200"
        :class="activeTab === 'gedcom'
          ? 'bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-400 shadow-sm'
          : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'"
        @click="switchTab('gedcom')"
      >
        <UIcon name="i-heroicons-document-text" class="h-4 w-4 inline mr-1.5 align-text-bottom" />
        GEDCOM (.ged)
      </button>
      <button
        class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200"
        :class="activeTab === 'json'
          ? 'bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-400 shadow-sm'
          : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'"
        @click="switchTab('json')"
      >
        <UIcon name="i-heroicons-code-bracket" class="h-4 w-4 inline mr-1.5 align-text-bottom" />
        JSON Trah (.json)
      </button>
    </div>

    <!-- ======== GEDCOM TAB ======== -->
    <template v-if="activeTab === 'gedcom'">
      <!-- Import result -->
      <template v-if="gedcomResult">
        <GedcomValidationResult
          :warnings="gedcomResult.warnings"
          :person-count="gedcomResult.personCount"
          :tree-id="gedcomResult.treeId"
        />
        <div class="trah-divider">atau impor file lain</div>
      </template>

      <!-- Import form -->
      <div class="card-emas ring-1 ring-amber-200/60 p-6 space-y-6">
        <GedcomImportDropzone
          :loading="importing"
          @file-selected="onGedcomFileSelected"
        />

        <!-- Optional tree name override -->
        <div>
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            Nama Trah <span class="text-stone-400 font-normal">(opsional)</span>
          </label>
          <UInput
            v-model="gedcomTreeName"
            placeholder="Biarkan kosong untuk menggunakan nama dari file"
            :disabled="importing"
            color="primary"
          />
          <p class="mt-1 text-xs text-stone-400">
            Jika dikosongkan, nama trah akan diambil dari nama file.
          </p>
        </div>

        <UAlert
          v-if="gedcomImportError"
          color="error"
          variant="soft"
          icon="i-heroicons-x-circle"
          :title="gedcomImportError"
        />

        <div class="flex justify-end">
          <UButton
            color="primary"
            variant="solid"
            :disabled="!gedcomSelectedFile || importing"
            :loading="importing"
            icon="i-heroicons-arrow-up-tray"
            size="md"
            @click="startGedcomImport"
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
    </template>

    <!-- ======== JSON TAB ======== -->
    <template v-else>
      <!-- Import result -->
      <template v-if="jsonResult">
        <GedcomValidationResult
          :warnings="jsonResult.warnings"
          :person-count="jsonResult.personCount"
          :tree-id="jsonResult.treeId"
        />
        <div class="trah-divider">atau impor file lain</div>
      </template>

      <!-- Import form -->
      <div class="card-emas ring-1 ring-amber-200/60 p-6 space-y-6">
        <!-- JSON dropzone -->
        <div
          class="relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer select-none"
          :class="jsonDragging
            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
            : 'border-amber-300/60 hover:border-amber-400 bg-white dark:bg-stone-900 hover:bg-amber-50/40 dark:hover:bg-stone-800'"
          @dragover.prevent="jsonDragging = true"
          @dragleave.prevent="jsonDragging = false"
          @drop.prevent="onJsonDrop"
          @click="jsonFileInput?.click()"
        >
          <input
            ref="jsonFileInput"
            type="file"
            accept=".json"
            class="hidden"
            @change="onJsonFileChange"
          />

          <div class="flex flex-col items-center gap-3">
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center transition-colors"
              :class="jsonDragging ? 'bg-amber-200' : 'bg-amber-100'"
            >
              <UIcon
                v-if="!jsonImporting"
                name="i-heroicons-code-bracket"
                class="h-8 w-8 text-amber-600"
              />
              <UIcon
                v-else
                name="i-heroicons-arrow-path"
                class="h-8 w-8 text-amber-600 animate-spin"
              />
            </div>

            <template v-if="jsonSelectedFile && !jsonImporting">
              <p class="text-base font-medium text-stone-800 dark:text-stone-100 font-javanese">
                {{ jsonSelectedFile.name }}
              </p>
              <p class="text-sm text-stone-500 dark:text-stone-400">
                {{ formatFileSize(jsonSelectedFile.size) }} &middot; Siap diimpor
              </p>
              <button
                class="text-xs text-amber-600 hover:text-amber-700 underline underline-offset-2"
                @click.stop="clearJsonFile"
              >
                Ganti file
              </button>
            </template>
            <template v-else-if="jsonImporting">
              <p class="text-base font-medium text-stone-600 dark:text-stone-300 font-javanese">
                Mengimpor data...
              </p>
              <p class="text-sm text-stone-400">Mohon tunggu, proses import sedang berjalan</p>
            </template>
            <template v-else>
              <p class="text-base font-medium text-stone-700 dark:text-stone-200 font-javanese">
                Drag &amp; drop file <span class="text-amber-600">.json</span> di sini
              </p>
              <p class="text-sm text-stone-500 dark:text-stone-400">atau klik untuk memilih file</p>
              <p class="text-xs text-stone-400 dark:text-stone-500 mt-1">
                Format JSON Trah &middot; Ekspor dari aplikasi Trah
              </p>
            </template>
          </div>

          <div
            v-if="jsonDragging"
            class="absolute inset-0 rounded-xl bg-amber-100/60 dark:bg-amber-900/30 flex items-center justify-center pointer-events-none"
          >
            <p class="text-amber-700 font-medium text-lg font-javanese">Lepaskan file di sini</p>
          </div>
        </div>

        <!-- Optional tree name override -->
        <div>
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            Nama Trah <span class="text-stone-400 font-normal">(opsional)</span>
          </label>
          <UInput
            v-model="jsonTreeName"
            placeholder="Biarkan kosong untuk menggunakan nama dari file"
            :disabled="jsonImporting"
            color="primary"
          />
          <p class="mt-1 text-xs text-stone-400">
            Jika dikosongkan, nama trah akan diambil dari isi file JSON.
          </p>
        </div>

        <UAlert
          v-if="jsonImportError"
          color="error"
          variant="soft"
          icon="i-heroicons-x-circle"
          :title="jsonImportError"
        />

        <div class="flex justify-end">
          <UButton
            color="primary"
            variant="solid"
            :disabled="!jsonSelectedFile || jsonImporting"
            :loading="jsonImporting"
            icon="i-heroicons-arrow-up-tray"
            size="md"
            @click="startJsonImport"
          >
            Mulai Impor
          </UButton>
        </div>
      </div>

      <!-- Info card -->
      <div class="rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 p-5">
        <h3 class="font-javanese font-semibold text-stone-700 dark:text-stone-300 text-sm mb-2 flex items-center gap-2">
          <UIcon name="i-heroicons-information-circle" class="h-4 w-4 text-amber-500" />
          Tentang Format JSON Trah
        </h3>
        <ul class="space-y-1 text-xs text-stone-500 dark:text-stone-400 list-disc list-inside">
          <li>Format JSON khusus aplikasi Trah (.trah.json)</li>
          <li>Menyertakan semua data anggota dan relasi keluarga</li>
          <li>Mendukung impor kembali data yang diekspor dari Trah</li>
          <li>Validasi otomatis format dan struktur data</li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import GedcomImportDropzone from '../../components/gedcom/ImportDropzone.vue'
import GedcomValidationResult from '../../components/gedcom/ValidationResult.vue'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Impor Data — Trah' })

// ---- Tab state ----
const activeTab = ref<'gedcom' | 'json'>('gedcom')

function switchTab(tab: 'gedcom' | 'json') {
  activeTab.value = tab
}

// ---- GEDCOM section ----
const { importing, importError: gedcomImportError, importGedcom } = useGedcom()

const gedcomSelectedFile = ref<File | null>(null)
const gedcomTreeName = ref('')
const gedcomResult = ref<{ treeId: string; personCount: number; warnings: string[] } | null>(null)

function onGedcomFileSelected(file: File) {
  gedcomSelectedFile.value = file
  gedcomResult.value = null
  if (!gedcomTreeName.value) {
    gedcomTreeName.value = file.name.replace(/\.(ged|gedcom)$/i, '')
  }
}

async function startGedcomImport() {
  if (!gedcomSelectedFile.value) return
  gedcomResult.value = null

  const result = await importGedcom(gedcomSelectedFile.value, gedcomTreeName.value || undefined)
  if (result) {
    gedcomResult.value = result
    gedcomSelectedFile.value = null
    gedcomTreeName.value = ''
  }
}

// ---- JSON section ----
const { importing: jsonImporting, importError: jsonImportError, importJson } = useJsonExport()

const jsonSelectedFile = ref<File | null>(null)
const jsonTreeName = ref('')
const jsonResult = ref<{ treeId: string; personCount: number; warnings: string[] } | null>(null)
const jsonDragging = ref(false)
const jsonFileInput = ref<HTMLInputElement | null>(null)

function onJsonDrop(event: DragEvent) {
  jsonDragging.value = false
  if (jsonImporting.value) return
  const file = event.dataTransfer?.files?.item(0)
  if (file && file.name.toLowerCase().endsWith('.json')) {
    setJsonFile(file)
  }
}

function onJsonFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    setJsonFile(file)
  }
  input.value = ''
}

function setJsonFile(file: File) {
  jsonSelectedFile.value = file
  jsonResult.value = null
  if (!jsonTreeName.value) {
    jsonTreeName.value = file.name.replace(/\.trah\.json$/i, '').replace(/\.json$/i, '')
  }
}

function clearJsonFile() {
  jsonSelectedFile.value = null
  if (jsonFileInput.value) jsonFileInput.value.value = ''
}

async function startJsonImport() {
  if (!jsonSelectedFile.value) return
  jsonResult.value = null

  const result = await importJson(jsonSelectedFile.value, jsonTreeName.value || undefined)
  if (result) {
    jsonResult.value = result
    jsonSelectedFile.value = null
    jsonTreeName.value = ''
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>
