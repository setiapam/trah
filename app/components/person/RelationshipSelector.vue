<template>
  <UModal :open="open" @update:open="$emit('close')" :ui="{ width: 'max-w-lg' }">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Tambah Relasi</h3>
            <UButton icon="i-heroicons-x-mark" color="neutral" variant="ghost" @click="$emit('close')" />
          </div>
        </template>

        <div class="space-y-4">
          <!-- Relationship type -->
          <UFormField label="Jenis Relasi" required>
            <div class="grid grid-cols-3 gap-2 mt-1">
              <button
                v-for="type in relTypes"
                :key="type.value"
                class="flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors text-sm"
                :class="selectedType === type.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'"
                @click="selectedType = type.value"
              >
                <UIcon :name="type.icon" class="h-5 w-5" />
                <span>{{ type.label }}</span>
              </button>
            </div>
          </UFormField>

          <!-- Search mode toggle (only for spouse) -->
          <div v-if="selectedType === 'spouse'" class="flex gap-2">
            <UButton
              :variant="searchMode === 'local' ? 'solid' : 'outline'"
              color="neutral"
              size="xs"
              @click="switchSearchMode('local')"
            >
              Trah Ini
            </UButton>
            <UButton
              :variant="searchMode === 'cross' ? 'solid' : 'outline'"
              color="neutral"
              size="xs"
              icon="i-heroicons-link"
              @click="switchSearchMode('cross')"
            >
              Semua Trah
            </UButton>
          </div>

          <!-- Search and select person -->
          <UFormField label="Pilih Anggota" required :error="personError">
            <UInput
              v-model="searchQuery"
              icon="i-heroicons-magnifying-glass"
              :placeholder="searchMode === 'cross' ? 'Ketik nama untuk mencari di semua trah...' : 'Cari nama...'"
              class="w-full mb-2"
            />

            <!-- Cross-tree search hint -->
            <p v-if="searchMode === 'cross' && searchQuery.length > 0 && searchQuery.length < 2" class="text-xs text-gray-400 mb-2">
              Ketik minimal 2 karakter untuk mencari...
            </p>
            <p v-if="searchMode === 'cross' && crossTreeSearching" class="text-xs text-gray-400 mb-2">
              Mencari di semua trah...
            </p>

            <div class="max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <div v-if="displayedPersons.length === 0" class="py-4 text-center text-sm text-gray-400">
                {{ searchMode === 'cross' && searchQuery.length < 2 ? 'Ketik nama untuk mencari' : 'Tidak ada anggota yang sesuai' }}
              </div>
              <button
                v-for="p in displayedPersons"
                :key="p.id"
                class="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                :class="selectedPersonId === p.id ? 'bg-primary-50 dark:bg-primary-950' : ''"
                @click="onSelectPerson(p)"
              >
                <UAvatar :src="p.photoUrl ?? undefined" :alt="getFullName(p)" size="sm" />
                <div class="text-left flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ getFullName(p) }}</p>
                  <div class="flex items-center gap-1.5">
                    <span v-if="p.birthDate" class="text-xs text-gray-400">{{ formatYear(p.birthDate) }}</span>
                    <UBadge
                      v-if="searchMode === 'cross' && (p as CrossTreePerson).treeName"
                      color="primary"
                      variant="soft"
                      size="xs"
                    >
                      {{ (p as CrossTreePerson).treeName }}
                    </UBadge>
                  </div>
                </div>
                <UIcon v-if="selectedPersonId === p.id" name="i-heroicons-check-circle" class="ml-auto text-primary-500 h-4 w-4 flex-shrink-0" />
              </button>
            </div>
          </UFormField>

          <!-- Cross-tree info banner -->
          <UAlert
            v-if="selectedCrossTreePerson"
            color="info"
            variant="soft"
            icon="i-heroicons-link"
          >
            <template #description>
              <strong>{{ getFullName(selectedCrossTreePerson) }}</strong> dari trah
              <strong>{{ selectedCrossTreePerson.treeName }}</strong>
              akan ditambahkan beserta anak dan keturunannya sebagai salinan ke trah ini.
            </template>
          </UAlert>

          <!-- Marriage date (for spouse) -->
          <UFormField v-if="selectedType === 'spouse'" label="Tanggal Nikah (Opsional)">
            <SharedDateInput v-model="marriageDate" />
          </UFormField>

          <UAlert v-if="submitError" color="error" :title="submitError" />
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="outline" @click="$emit('close')">Batal</UButton>
            <UButton :loading="loading || crossTreeCreating" :disabled="!selectedPersonId || !selectedType" @click="submit">
              Tambah Relasi
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Person } from '../../../domain/entities/person'
import { getFullName } from '../../../domain/entities/person'
import type { Relationship, CreateRelationshipInput } from '../../../domain/entities/relationship'

type CrossTreePerson = Person & { treeName: string }

const props = defineProps<{
  open: boolean
  personId: string
  treeId: string
  persons: Person[]
  existingRelationships: Relationship[]
}>()

const emit = defineEmits<{
  close: []
  added: [rel: Relationship]
}>()

const { createRelationship, loading, error: repoError } = useRelationship()
const { searchAcrossTrees, createLinkedCopyWithDescendants } = usePerson()

const nuxtApp = useNuxtApp()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const repos = nuxtApp.$repos as any

const selectedType = ref<'parent' | 'child' | 'spouse'>('child')
const selectedPersonId = ref<string | null>(null)
const marriageDate = ref('')
const searchQuery = ref('')
const personError = ref('')
const submitError = ref<string | null>(null)
const searchMode = ref<'local' | 'cross'>('local')
const crossTreeResults = ref<CrossTreePerson[]>([])
const crossTreeSearching = ref(false)
const crossTreeCreating = ref(false)
const selectedCrossTreePerson = ref<CrossTreePerson | null>(null)

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const relTypes = [
  { value: 'parent' as const, label: 'Orang Tua', icon: 'i-heroicons-arrow-up-circle' },
  { value: 'child' as const, label: 'Anak', icon: 'i-heroicons-arrow-down-circle' },
  { value: 'spouse' as const, label: 'Pasangan', icon: 'i-heroicons-heart' },
]

const existingRelatedIds = computed(() => {
  return new Set(props.existingRelationships.flatMap(r => [r.personId, r.relatedPersonId]))
})

const filteredLocalPersons = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return props.persons.filter((p) => {
    if (p.id === props.personId) return false
    if (existingRelatedIds.value.has(p.id)) return false
    if (!q) return true
    return getFullName(p).toLowerCase().includes(q)
      || (p.nickname ?? '').toLowerCase().includes(q)
  })
})

const displayedPersons = computed(() => {
  if (searchMode.value === 'local') return filteredLocalPersons.value
  return crossTreeResults.value
})

// Debounced cross-tree search
watch(searchQuery, (q) => {
  if (searchMode.value !== 'cross') return
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  selectedPersonId.value = null
  selectedCrossTreePerson.value = null

  if (q.length < 2) {
    crossTreeResults.value = []
    return
  }

  crossTreeSearching.value = true
  searchDebounceTimer = setTimeout(async () => {
    crossTreeResults.value = await searchAcrossTrees(q, props.treeId)
    crossTreeSearching.value = false
  }, 400)
})

function switchSearchMode(mode: 'local' | 'cross') {
  searchMode.value = mode
  selectedPersonId.value = null
  selectedCrossTreePerson.value = null
  searchQuery.value = ''
  crossTreeResults.value = []
}

watch(() => props.open, (val) => {
  if (val) {
    selectedPersonId.value = null
    selectedType.value = 'child'
    marriageDate.value = ''
    searchQuery.value = ''
    personError.value = ''
    submitError.value = null
    searchMode.value = 'local'
    crossTreeResults.value = []
    selectedCrossTreePerson.value = null
  }
})

// Reset search mode when switching away from spouse
watch(selectedType, (val) => {
  if (val !== 'spouse') {
    switchSearchMode('local')
  }
})

function formatYear(date: string): string {
  return new Date(date).getFullYear().toString()
}

function onSelectPerson(p: Person | CrossTreePerson) {
  selectedPersonId.value = p.id
  if (searchMode.value === 'cross' && 'treeName' in p) {
    selectedCrossTreePerson.value = p as CrossTreePerson
  }
  else {
    selectedCrossTreePerson.value = null
  }
}

async function submit() {
  personError.value = ''
  submitError.value = null

  if (!selectedPersonId.value) {
    personError.value = 'Pilih anggota keluarga'
    return
  }

  let targetPersonId = selectedPersonId.value

  // If cross-tree person selected, create linked copy with descendants
  if (selectedCrossTreePerson.value) {
    crossTreeCreating.value = true
    try {
      // Load relationships from source tree to copy descendants
      const sourceTreeId = selectedCrossTreePerson.value.treeId
      const sourceRels = await repos.relationship.getByTree(sourceTreeId)
      const relData = sourceRels.map((r: { personId: string; relatedPersonId: string; relationshipType: string; marriageDate?: string | null; divorceDate?: string | null }) => ({
        personId: r.personId,
        relatedPersonId: r.relatedPersonId,
        relationshipType: r.relationshipType,
        marriageDate: r.marriageDate,
        divorceDate: r.divorceDate,
      }))

      const result = await createLinkedCopyWithDescendants(selectedCrossTreePerson.value.id, props.treeId, relData)
      if (!result) {
        submitError.value = 'Gagal menambah anggota dari trah lain'
        crossTreeCreating.value = false
        return
      }

      targetPersonId = result.idMap.get(selectedCrossTreePerson.value.id) ?? ''
      if (!targetPersonId) {
        submitError.value = 'Gagal menambah anggota dari trah lain'
        crossTreeCreating.value = false
        return
      }

      // Copy relationships between copied persons to this tree
      const relsToCopy = sourceRels.filter((r: { personId: string; relatedPersonId: string }) =>
        result.idMap.has(r.personId) && result.idMap.has(r.relatedPersonId),
      )
      if (relsToCopy.length > 0) {
        await repos.relationship.bulkInsert(
          relsToCopy.map((r: { personId: string; relatedPersonId: string; relationshipType: string; marriageDate?: string | null; divorceDate?: string | null }) => ({
            treeId: props.treeId,
            personId: result.idMap.get(r.personId)!,
            relatedPersonId: result.idMap.get(r.relatedPersonId)!,
            relationshipType: r.relationshipType,
            marriageDate: r.marriageDate ?? null,
            divorceDate: r.divorceDate ?? null,
          })),
        )
      }
    }
    catch (e: unknown) {
      submitError.value = e instanceof Error ? e.message : 'Gagal menambah anggota dari trah lain'
      crossTreeCreating.value = false
      return
    }
    finally {
      crossTreeCreating.value = false
    }
  }

  // Build input based on relationship type
  let input: CreateRelationshipInput

  if (selectedType.value === 'parent') {
    input = {
      treeId: props.treeId,
      personId: targetPersonId,
      relatedPersonId: props.personId,
      relationshipType: 'parent',
    }
  }
  else if (selectedType.value === 'child') {
    input = {
      treeId: props.treeId,
      personId: props.personId,
      relatedPersonId: targetPersonId,
      relationshipType: 'parent',
    }
  }
  else {
    input = {
      treeId: props.treeId,
      personId: props.personId,
      relatedPersonId: targetPersonId,
      relationshipType: 'spouse',
      marriageDate: marriageDate.value || null,
    }
  }

  const rel = await createRelationship(input)
  if (rel) {
    emit('added', rel)
  }
  else {
    submitError.value = repoError.value ?? 'Gagal menambah relasi'
  }
}
</script>
