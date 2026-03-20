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

          <!-- Other parent selection (for child type) -->
          <div v-if="selectedType === 'child' && spouseOptions.length > 0">
            <UFormField :label="spouseOptions.length === 1 ? 'Orang Tua Kedua (Otomatis)' : 'Pilih Orang Tua Kedua'">
              <div v-if="spouseOptions.length === 1" class="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <UAvatar :src="spouseOptions[0].photoUrl ?? undefined" :alt="getFullName(spouseOptions[0])" size="xs" />
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ getFullName(spouseOptions[0]) }}</span>
                <UBadge color="success" variant="soft" size="xs">Otomatis ditambahkan</UBadge>
              </div>
              <div v-else class="space-y-1">
                <button
                  v-for="sp in spouseOptions"
                  :key="sp.id"
                  class="w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm"
                  :class="selectedOtherParentId === sp.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'"
                  @click="selectedOtherParentId = selectedOtherParentId === sp.id ? null : sp.id"
                >
                  <UAvatar :src="sp.photoUrl ?? undefined" :alt="getFullName(sp)" size="xs" />
                  <span class="text-gray-700 dark:text-gray-300">{{ getFullName(sp) }}</span>
                  <UIcon v-if="selectedOtherParentId === sp.id" name="i-heroicons-check-circle" class="ml-auto text-primary-500 h-4 w-4" />
                </button>
                <button
                  class="w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm"
                  :class="selectedOtherParentId === null
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'"
                  @click="selectedOtherParentId = null"
                >
                  <UIcon name="i-heroicons-minus-circle" class="h-5 w-5 text-gray-400" />
                  <span class="text-gray-500">Tanpa orang tua kedua</span>
                </button>
              </div>
            </UFormField>
          </div>

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
const selectedOtherParentId = ref<string | null>(null)
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

// Compute sibling IDs (children of the same parents, excluding self)
const siblingIds = computed(() => {
  const ids = new Set<string>()
  // Find parents of current person
  const parentIds = props.existingRelationships
    .filter(r => r.relationshipType === 'parent' && r.relatedPersonId === props.personId)
    .map(r => r.personId)
  // Find all relationships in the tree to get other children of these parents
  for (const rel of allTreeRelationships.value) {
    if (rel.relationshipType === 'parent' && parentIds.includes(rel.personId) && rel.relatedPersonId !== props.personId) {
      ids.add(rel.relatedPersonId)
    }
  }
  return ids
})

// All relationships in the tree (needed to compute siblings)
const allTreeRelationships = ref<Relationship[]>([])

// Load all tree relationships when modal opens
watch(() => props.open, async (val) => {
  if (val) {
    try {
      allTreeRelationships.value = await repos.relationship.getByTree(props.treeId)
    }
    catch {
      allTreeRelationships.value = []
    }
  }
})

// Compute spouses of current person (for auto-assigning other parent when adding child)
const spouseOptions = computed(() => {
  const spouseIds = props.existingRelationships
    .filter(r => r.relationshipType === 'spouse'
      && (r.personId === props.personId || r.relatedPersonId === props.personId))
    .map(r => r.personId === props.personId ? r.relatedPersonId : r.personId)
  return props.persons.filter(p => spouseIds.includes(p.id))
})

// Auto-select the only spouse when switching to child type
watch([selectedType, spouseOptions], () => {
  if (selectedType.value === 'child' && spouseOptions.value.length === 1) {
    selectedOtherParentId.value = spouseOptions.value[0].id
  }
  else {
    selectedOtherParentId.value = null
  }
})

const filteredLocalPersons = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return props.persons.filter((p) => {
    if (p.id === props.personId) return false
    if (existingRelatedIds.value.has(p.id)) return false
    if (siblingIds.value.has(p.id)) return false
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
    // Auto-select other parent if only one spouse
    if (spouseOptions.value.length === 1) {
      selectedOtherParentId.value = spouseOptions.value[0].id
    }
    else {
      selectedOtherParentId.value = null
    }
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

      // Pre-map: the current person already exists in the target tree.
      // Find the spouse(s) of the selected person in the source tree and map to current person.
      // Only auto-map if there's exactly one spouse (otherwise ambiguous).
      const preMap = new Map<string, string>()
      const sourceSpouseIds: string[] = []
      for (const r of relData) {
        if (r.relationshipType === 'spouse') {
          if (r.personId === selectedCrossTreePerson.value!.id) {
            sourceSpouseIds.push(r.relatedPersonId)
          }
          else if (r.relatedPersonId === selectedCrossTreePerson.value!.id) {
            sourceSpouseIds.push(r.personId)
          }
        }
      }
      if (sourceSpouseIds.length === 1) {
        preMap.set(sourceSpouseIds[0], props.personId)
      }

      const result = await createLinkedCopyWithDescendants(selectedCrossTreePerson.value.id, props.treeId, relData, preMap)
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
  if (!rel) {
    submitError.value = repoError.value ?? 'Gagal menambah relasi'
    return
  }

  // Auto-add other parent relationship when adding a child
  if (selectedType.value === 'child' && selectedOtherParentId.value) {
    await createRelationship({
      treeId: props.treeId,
      personId: selectedOtherParentId.value,
      relatedPersonId: targetPersonId,
      relationshipType: 'parent',
    })
  }

  emit('added', rel)
}
</script>
