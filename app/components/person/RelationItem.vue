<template>
  <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
    <UAvatar
      :src="person.photoUrl ?? undefined"
      :alt="getFullName(person)"
      size="sm"
      class="flex-shrink-0"
    />
    <div class="flex-1 min-w-0">
      <NuxtLink
        :to="`/person/${person.id}`"
        class="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-500 truncate block"
      >
        {{ getFullName(person) }}
      </NuxtLink>
      <p v-if="roleLabel" class="text-xs text-gray-400">
        {{ roleLabel }}
      </p>
      <p v-if="marriageDate" class="text-xs text-gray-400">
        Menikah {{ formatDate(marriageDate) }}
      </p>
    </div>
    <div v-if="canEdit" class="flex items-center gap-1 flex-shrink-0">
      <UButton
        v-if="showEdit"
        icon="i-heroicons-pencil-square"
        color="neutral"
        variant="ghost"
        size="xs"
        title="Ubah relasi"
        @click="$emit('edit', relationshipId)"
      />
      <UButton
        icon="i-heroicons-trash"
        color="error"
        variant="ghost"
        size="xs"
        title="Hapus relasi"
        @click="$emit('delete', relationshipId)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Person } from '../../../domain/entities/person'
import { getFullName } from '../../../domain/entities/person'

defineProps<{
  person: Person
  relationshipId: string
  marriageDate?: string | null
  roleLabel?: string | null
  canEdit?: boolean
  showEdit?: boolean
  showDelete?: boolean
}>()

defineEmits<{
  edit: [relId: string]
  delete: [relId: string]
}>()

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>
