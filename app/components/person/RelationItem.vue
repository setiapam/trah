<template>
  <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 group">
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
      <p v-if="marriageDate" class="text-xs text-gray-400">
        Menikah {{ formatDate(marriageDate) }}
      </p>
    </div>
    <UButton
      v-if="showDelete !== false"
      icon="i-heroicons-x-mark"
      color="neutral"
      variant="ghost"
      size="xs"
      class="opacity-0 group-hover:opacity-100"
      @click="$emit('delete', relationshipId)"
    />
  </div>
</template>

<script setup lang="ts">
import type { Person } from '../../../domain/entities/person'
import { getFullName } from '../../../domain/entities/person'

defineProps<{
  person: Person
  relationshipId: string
  marriageDate?: string | null
  showDelete?: boolean
}>()

defineEmits<{
  delete: [relId: string]
}>()

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>
