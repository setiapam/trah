<template>
  <UModal :open="open" @update:open="$emit('close')" :ui="{ width: 'max-w-md' }">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Ubah Relasi</h3>
            <UButton icon="i-heroicons-x-mark" color="neutral" variant="ghost" @click="$emit('close')" />
          </div>
        </template>

        <div v-if="relationship" class="space-y-4">
          <!-- Current relationship info -->
          <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <UAvatar
              :src="relatedPerson?.photoUrl ?? undefined"
              :alt="relatedPerson ? getFullName(relatedPerson) : ''"
              size="sm"
            />
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ relatedPerson ? getFullName(relatedPerson) : '' }}
              </p>
              <p class="text-xs text-gray-400">{{ currentTypeLabel }}</p>
            </div>
          </div>

          <!-- Relationship type -->
          <UFormField label="Jenis Relasi">
            <div class="grid grid-cols-3 gap-2 mt-1">
              <button
                v-for="type in relTypes"
                :key="type.value"
                class="flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors text-sm"
                :class="editType === type.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'"
                @click="editType = type.value"
              >
                <UIcon :name="type.icon" class="h-5 w-5" />
                <span>{{ type.label }}</span>
              </button>
            </div>
          </UFormField>

          <!-- Marriage date (for spouse) -->
          <UFormField v-if="editType === 'spouse'" label="Tanggal Nikah">
            <UInput v-model="editMarriageDate" type="date" class="w-full" />
          </UFormField>

          <!-- Divorce date (for spouse) -->
          <UFormField v-if="editType === 'spouse'" label="Tanggal Cerai">
            <UInput v-model="editDivorceDate" type="date" class="w-full" />
          </UFormField>

          <UAlert v-if="submitError" color="error" :title="submitError" />
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="outline" @click="$emit('close')">Batal</UButton>
            <UButton :loading="saving" @click="submit">
              Simpan
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
import type { Relationship } from '../../../domain/entities/relationship'

const props = defineProps<{
  open: boolean
  relationship: Relationship | null
  currentPersonId: string
  persons: Person[]
}>()

const emit = defineEmits<{
  close: []
  updated: [rel: Relationship]
}>()

const { updateRelationship, loading: saving, error: repoError } = useRelationship()

const editType = ref<'parent' | 'child' | 'spouse'>('parent')
const editMarriageDate = ref('')
const editDivorceDate = ref('')
const submitError = ref<string | null>(null)

const relTypes = [
  { value: 'parent' as const, label: 'Orang Tua', icon: 'i-heroicons-arrow-up-circle' },
  { value: 'child' as const, label: 'Anak', icon: 'i-heroicons-arrow-down-circle' },
  { value: 'spouse' as const, label: 'Pasangan', icon: 'i-heroicons-heart' },
]

const relatedPerson = computed(() => {
  if (!props.relationship) return null
  const otherId = props.relationship.personId === props.currentPersonId
    ? props.relationship.relatedPersonId
    : props.relationship.personId
  return props.persons.find(p => p.id === otherId) ?? null
})

const currentTypeLabel = computed(() => {
  if (!props.relationship) return ''
  if (props.relationship.relationshipType === 'spouse') return 'Pasangan'
  if (props.relationship.personId === props.currentPersonId) return 'Anak'
  return 'Orang Tua'
})

// Determine the "logical" type from the perspective of currentPerson
function getLogicalType(rel: Relationship): 'parent' | 'child' | 'spouse' {
  if (rel.relationshipType === 'spouse') return 'spouse'
  // parent type: personId is parent of relatedPersonId
  if (rel.personId === props.currentPersonId) return 'child'
  return 'parent'
}

watch(() => props.open, (val) => {
  if (val && props.relationship) {
    editType.value = getLogicalType(props.relationship)
    editMarriageDate.value = props.relationship.marriageDate ?? ''
    editDivorceDate.value = props.relationship.divorceDate ?? ''
    submitError.value = null
  }
})

async function submit() {
  if (!props.relationship) return
  submitError.value = null

  const rel = props.relationship
  const otherId = rel.personId === props.currentPersonId
    ? rel.relatedPersonId
    : rel.personId

  // Determine new DB-level values
  let newDbType: 'parent' | 'spouse'
  let newPersonId: string
  let newRelatedPersonId: string

  if (editType.value === 'spouse') {
    newDbType = 'spouse'
    newPersonId = props.currentPersonId
    newRelatedPersonId = otherId
  }
  else if (editType.value === 'parent') {
    // other person is parent of current person
    newDbType = 'parent'
    newPersonId = otherId
    newRelatedPersonId = props.currentPersonId
  }
  else {
    // current person is parent of other person
    newDbType = 'parent'
    newPersonId = props.currentPersonId
    newRelatedPersonId = otherId
  }

  // Check if type or direction changed - need to delete and recreate
  const typeChanged = newDbType !== rel.relationshipType
    || newPersonId !== rel.personId
    || newRelatedPersonId !== rel.relatedPersonId

  if (typeChanged) {
    // Delete old and create new relationship
    const nuxtApp = useNuxtApp()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const repos = (nuxtApp as Record<string, unknown>).$repos as any
    try {
      await repos.relationship.delete(rel.id)
      const newRel = await repos.relationship.create({
        treeId: rel.treeId,
        personId: newPersonId,
        relatedPersonId: newRelatedPersonId,
        relationshipType: newDbType,
        marriageDate: editType.value === 'spouse' ? (editMarriageDate.value || null) : null,
        divorceDate: editType.value === 'spouse' ? (editDivorceDate.value || null) : null,
      })
      emit('updated', newRel)
    }
    catch (e: unknown) {
      submitError.value = e instanceof Error ? e.message : 'Gagal mengubah relasi'
    }
  }
  else {
    // Only update dates
    const updated = await updateRelationship(rel.id, {
      marriageDate: editType.value === 'spouse' ? (editMarriageDate.value || null) : null,
      divorceDate: editType.value === 'spouse' ? (editDivorceDate.value || null) : null,
    })
    if (updated) {
      emit('updated', updated)
    }
    else {
      submitError.value = repoError.value ?? 'Gagal mengubah relasi'
    }
  }
}
</script>
