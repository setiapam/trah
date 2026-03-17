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

          <!-- Search and select person -->
          <UFormField label="Pilih Anggota" required :error="personError">
            <UInput
              v-model="searchQuery"
              icon="i-heroicons-magnifying-glass"
              placeholder="Cari nama..."
              class="w-full mb-2"
            />
            <div class="max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <div v-if="filteredPersons.length === 0" class="py-4 text-center text-sm text-gray-400">
                Tidak ada anggota yang sesuai
              </div>
              <button
                v-for="p in filteredPersons"
                :key="p.id"
                class="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                :class="selectedPersonId === p.id ? 'bg-primary-50 dark:bg-primary-950' : ''"
                @click="selectedPersonId = p.id"
              >
                <UAvatar :src="p.photoUrl ?? undefined" :alt="getFullName(p)" size="sm" />
                <div class="text-left">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ getFullName(p) }}</p>
                  <p v-if="p.birthDate" class="text-xs text-gray-400">{{ formatYear(p.birthDate) }}</p>
                </div>
                <UIcon v-if="selectedPersonId === p.id" name="i-heroicons-check-circle" class="ml-auto text-primary-500 h-4 w-4" />
              </button>
            </div>
          </UFormField>

          <!-- Marriage date (for spouse) -->
          <UFormField v-if="selectedType === 'spouse'" label="Tanggal Nikah (Opsional)">
            <UInput v-model="marriageDate" type="date" class="w-full" />
          </UFormField>

          <UAlert v-if="submitError" color="error" :title="submitError" />
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="outline" @click="$emit('close')">Batal</UButton>
            <UButton :loading="loading" :disabled="!selectedPersonId || !selectedType" @click="submit">
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

const selectedType = ref<'parent' | 'child' | 'spouse'>('child')
const selectedPersonId = ref<string | null>(null)
const marriageDate = ref('')
const searchQuery = ref('')
const personError = ref('')
const submitError = ref<string | null>(null)

const relTypes = [
  { value: 'parent' as const, label: 'Orang Tua', icon: 'i-heroicons-arrow-up-circle' },
  { value: 'child' as const, label: 'Anak', icon: 'i-heroicons-arrow-down-circle' },
  { value: 'spouse' as const, label: 'Pasangan', icon: 'i-heroicons-heart' },
]

// IDs that already have relationship with current person
const existingRelatedIds = computed(() => {
  return new Set(props.existingRelationships.flatMap(r => [r.personId, r.relatedPersonId]))
})

const filteredPersons = computed(() => {
  // Exclude self and already related persons
  const q = searchQuery.value.toLowerCase()
  return props.persons.filter((p) => {
    if (p.id === props.personId) return false
    if (existingRelatedIds.value.has(p.id)) return false
    if (!q) return true
    return getFullName(p).toLowerCase().includes(q)
      || (p.nickname ?? '').toLowerCase().includes(q)
  })
})

watch(() => props.open, (val) => {
  if (val) {
    selectedPersonId.value = null
    selectedType.value = 'child'
    marriageDate.value = ''
    searchQuery.value = ''
    personError.value = ''
    submitError.value = null
  }
})

function formatYear(date: string): string {
  return new Date(date).getFullYear().toString()
}

async function submit() {
  personError.value = ''
  submitError.value = null

  if (!selectedPersonId.value) {
    personError.value = 'Pilih anggota keluarga'
    return
  }

  // Build input based on relationship type:
  // 'parent' type in DB: personId = parent, relatedPersonId = child
  let input: CreateRelationshipInput

  if (selectedType.value === 'parent') {
    // selectedPerson is the parent of current person
    input = {
      treeId: props.treeId,
      personId: selectedPersonId.value,
      relatedPersonId: props.personId,
      relationshipType: 'parent',
    }
  }
  else if (selectedType.value === 'child') {
    // current person is parent of selectedPerson
    input = {
      treeId: props.treeId,
      personId: props.personId,
      relatedPersonId: selectedPersonId.value,
      relationshipType: 'parent',
    }
  }
  else {
    // spouse
    input = {
      treeId: props.treeId,
      personId: props.personId,
      relatedPersonId: selectedPersonId.value,
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
