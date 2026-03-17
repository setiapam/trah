<template>
  <div>
    <!-- Loading -->
    <div v-if="personLoading && !currentPerson" class="space-y-4">
      <USkeleton class="h-8 w-64" />
      <USkeleton class="h-48 rounded-xl" />
      <USkeleton class="h-32 rounded-xl" />
    </div>

    <!-- Not found -->
    <UCard v-else-if="!currentPerson && !personLoading" class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Anggota tidak ditemukan.</p>
      <UButton class="mt-4" @click="$router.back()">Kembali</UButton>
    </UCard>

    <template v-else-if="currentPerson">
      <!-- Header -->
      <div class="mb-6 flex items-start justify-between gap-4">
        <div class="flex items-start gap-4">
          <UButton icon="i-heroicons-arrow-left" color="neutral" variant="ghost" size="sm" @click="$router.back()" />
          <div class="flex items-start gap-4">
            <!-- Photo -->
            <div class="relative group">
              <UAvatar
                :src="currentPerson.photoUrl ?? undefined"
                :alt="getFullName(currentPerson)"
                size="2xl"
                class="ring-2 ring-white dark:ring-gray-800"
              />
              <PersonPhotoUpload
                :person-id="currentPerson.id"
                :tree-id="currentPerson.treeId"
                :current-url="currentPerson.photoUrl ?? null"
                @uploaded="onPhotoUploaded"
              />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ getFullName(currentPerson) }}
              </h1>
              <p v-if="currentPerson.nickname" class="text-gray-500 dark:text-gray-400">
                "{{ currentPerson.nickname }}"
              </p>
              <div class="flex items-center gap-2 mt-1">
                <UBadge :color="genderColor" variant="soft" size="sm">{{ genderLabel }}</UBadge>
                <UBadge :color="currentPerson.isAlive ? 'success' : 'neutral'" variant="soft" size="sm">
                  {{ currentPerson.isAlive ? 'Masih Hidup' : 'Almarhum/ah' }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
        <div class="flex gap-2 flex-shrink-0">
          <UButton icon="i-heroicons-pencil" color="neutral" variant="outline" @click="showEditForm = true">
            Edit
          </UButton>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Left: personal info -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Basic info -->
          <UCard>
            <template #header>
              <h2 class="font-semibold text-gray-900 dark:text-white">Informasi Pribadi</h2>
            </template>
            <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div v-for="field in infoFields" :key="field.label">
                <dt class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {{ field.label }}
                </dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                  {{ field.value || '—' }}
                </dd>
              </div>
            </dl>
            <template v-if="currentPerson.notes" #footer>
              <div>
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Catatan</p>
                <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ currentPerson.notes }}</p>
              </div>
            </template>
          </UCard>

          <!-- Relationships -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="font-semibold text-gray-900 dark:text-white">Relasi Keluarga</h2>
                <UButton icon="i-heroicons-plus" size="sm" variant="outline" @click="showRelSelector = true">
                  Tambah Relasi
                </UButton>
              </div>
            </template>

            <div v-if="relLoading" class="space-y-2">
              <USkeleton v-for="i in 3" :key="i" class="h-12 rounded-lg" />
            </div>

            <div v-else-if="parentPersons.length === 0 && spousePersons.length === 0 && childPersons.length === 0" class="text-center py-6">
              <p class="text-sm text-gray-500 dark:text-gray-400">Belum ada relasi. Tambahkan relasi keluarga.</p>
            </div>

            <div v-else class="space-y-4">
              <!-- Parents -->
              <div v-if="parentPersons.length > 0">
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Orang Tua</p>
                <div class="space-y-2">
                  <PersonRelationItem
                    v-for="p in parentPersons"
                    :key="p.person.id"
                    :person="p.person"
                    :relationship-id="p.relId"
                    @delete="onDeleteRel"
                  />
                </div>
              </div>
              <!-- Spouses -->
              <div v-if="spousePersons.length > 0">
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Pasangan</p>
                <div class="space-y-2">
                  <PersonRelationItem
                    v-for="p in spousePersons"
                    :key="p.person.id"
                    :person="p.person"
                    :relationship-id="p.relId"
                    :marriage-date="p.marriageDate"
                    @delete="onDeleteRel"
                  />
                </div>
              </div>
              <!-- Children -->
              <div v-if="childPersons.length > 0">
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Anak</p>
                <div class="space-y-2">
                  <PersonRelationItem
                    v-for="p in childPersons"
                    :key="p.person.id"
                    :person="p.person"
                    :relationship-id="p.relId"
                    @delete="onDeleteRel"
                  />
                </div>
              </div>
              <!-- Siblings -->
              <div v-if="siblingPersons.length > 0">
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Saudara Kandung</p>
                <div class="space-y-2">
                  <PersonRelationItem
                    v-for="p in siblingPersons"
                    :key="p.id"
                    :person="p"
                    relationship-id=""
                    :show-delete="false"
                  />
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Right: sidebar info -->
        <div class="space-y-6">
          <!-- Contact -->
          <UCard v-if="currentPerson.phone || currentPerson.email || currentPerson.address">
            <template #header>
              <h2 class="font-semibold text-gray-900 dark:text-white">Kontak</h2>
            </template>
            <dl class="space-y-3">
              <div v-if="currentPerson.phone">
                <dt class="text-xs text-gray-500 dark:text-gray-400">Telepon</dt>
                <dd class="text-sm text-gray-900 dark:text-white">{{ currentPerson.phone }}</dd>
              </div>
              <div v-if="currentPerson.email">
                <dt class="text-xs text-gray-500 dark:text-gray-400">Email</dt>
                <dd class="text-sm text-gray-900 dark:text-white">{{ currentPerson.email }}</dd>
              </div>
              <div v-if="currentPerson.address">
                <dt class="text-xs text-gray-500 dark:text-gray-400">Alamat</dt>
                <dd class="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{{ currentPerson.address }}</dd>
              </div>
            </dl>
          </UCard>

          <!-- Quick stats -->
          <UCard>
            <template #header>
              <h2 class="font-semibold text-gray-900 dark:text-white">Ringkasan</h2>
            </template>
            <dl class="space-y-2">
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500 dark:text-gray-400">Usia</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ ageDisplay }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500 dark:text-gray-400">Orang tua</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ parentPersons.length }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500 dark:text-gray-400">Pasangan</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ spousePersons.length }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500 dark:text-gray-400">Anak</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ childPersons.length }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-sm text-gray-500 dark:text-gray-400">Saudara kandung</dt>
                <dd class="text-sm font-medium text-gray-900 dark:text-white">{{ siblingPersons.length }}</dd>
              </div>
            </dl>
          </UCard>
        </div>
      </div>

      <!-- Edit form -->
      <PersonPersonForm
        :open="showEditForm"
        :tree-id="currentPerson.treeId"
        :person="currentPerson"
        @close="showEditForm = false"
        @saved="onPersonUpdated"
      />

      <!-- Relationship selector -->
      <PersonRelationshipSelector
        :open="showRelSelector"
        :person-id="currentPerson.id"
        :tree-id="currentPerson.treeId"
        :persons="treeParsons"
        :existing-relationships="personRelationships"
        @close="showRelSelector = false"
        @added="onRelAdded"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { getFullName, getAge } from '../../../domain/entities/person'
import type { Person } from '../../../domain/entities/person'
import type { Relationship } from '../../../domain/entities/relationship'
import PersonPersonForm from '../../components/person/PersonForm.vue'
import PersonRelationshipSelector from '../../components/person/RelationshipSelector.vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const personId = route.params.id as string

const { currentPerson, loading: personLoading, fetchPerson, updatePerson } = usePerson()
const { relationships, loading: relLoading, fetchRelationships, createRelationship, deleteRelationship, getParents, getChildren, getSpouses, getSiblings } = useRelationship()

const showEditForm = ref(false)
const showRelSelector = ref(false)

// All persons in the tree (for relationship selector)
const treeParsons = ref<Person[]>([])

useHead(() => ({
  title: currentPerson.value ? `${getFullName(currentPerson.value)} — Trah` : 'Detail Anggota — Trah',
}))

onMounted(async () => {
  await fetchPerson(personId)
  if (currentPerson.value) {
    await fetchRelationships(currentPerson.value.treeId)
    // Load all persons for the relationship selector
    const nuxtApp = useNuxtApp()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    treeParsons.value = await ((nuxtApp as Record<string, unknown>).$repos as any).person.getByTree(currentPerson.value.treeId)
  }
})

// --- Computed ---

const genderLabel = computed(() => {
  if (!currentPerson.value) return ''
  return { M: 'Laki-laki', F: 'Perempuan', U: 'Tidak diketahui' }[currentPerson.value.gender] ?? ''
})

const genderColor = computed(() => {
  if (!currentPerson.value) return 'neutral' as const
  return { M: 'info', F: 'pink', U: 'neutral' }[currentPerson.value.gender] as 'info' | 'pink' | 'neutral'
})

const ageDisplay = computed(() => {
  if (!currentPerson.value) return '—'
  const age = getAge(currentPerson.value)
  if (age === null) return '—'
  return currentPerson.value.isAlive ? `${age} tahun` : `${age} tahun (wafat)`
})

const infoFields = computed(() => {
  if (!currentPerson.value) return []
  const p = currentPerson.value
  return [
    { label: 'Nama Lengkap', value: getFullName(p) },
    { label: 'Jenis Kelamin', value: genderLabel.value },
    { label: 'Tanggal Lahir', value: formatDate(p.birthDate) },
    { label: 'Tempat Lahir', value: p.birthPlace },
    { label: 'Tanggal Wafat', value: p.isAlive ? null : formatDate(p.deathDate) },
    { label: 'Tempat Wafat', value: p.isAlive ? null : p.deathPlace },
  ].filter(f => f.value)
})

const personRelationships = computed(() => {
  if (!currentPerson.value) return []
  return relationships.value.filter(
    r => r.personId === currentPerson.value!.id || r.relatedPersonId === currentPerson.value!.id,
  )
})

function getPersonById(id: string): Person | undefined {
  return treeParsons.value.find(p => p.id === id)
}

const parentPersons = computed(() => {
  if (!currentPerson.value) return []
  return getParents(currentPerson.value.id)
    .map((id) => {
      const rel = relationships.value.find(r => r.personId === id && r.relatedPersonId === currentPerson.value!.id)
      return { person: getPersonById(id), relId: rel?.id ?? '' }
    })
    .filter(x => x.person) as { person: Person, relId: string, marriageDate?: string | null }[]
})

const spousePersons = computed(() => {
  if (!currentPerson.value) return []
  return getSpouses(currentPerson.value.id)
    .map((id) => {
      const rel = relationships.value.find(r =>
        r.relationshipType === 'spouse'
        && (r.personId === id || r.relatedPersonId === id)
        && (r.personId === currentPerson.value!.id || r.relatedPersonId === currentPerson.value!.id),
      )
      return { person: getPersonById(id), relId: rel?.id ?? '', marriageDate: rel?.marriageDate }
    })
    .filter(x => x.person) as { person: Person, relId: string, marriageDate?: string | null }[]
})

const childPersons = computed(() => {
  if (!currentPerson.value) return []
  return getChildren(currentPerson.value.id)
    .map((id) => {
      const rel = relationships.value.find(r => r.personId === currentPerson.value!.id && r.relatedPersonId === id)
      return { person: getPersonById(id), relId: rel?.id ?? '' }
    })
    .filter(x => x.person) as { person: Person, relId: string }[]
})

const siblingPersons = computed(() => {
  if (!currentPerson.value) return []
  return getSiblings(currentPerson.value.id)
    .map(id => getPersonById(id))
    .filter((p): p is Person => !!p)
    .sort((a, b) => {
      if (!a.birthDate && !b.birthDate) return 0
      if (!a.birthDate) return 1
      if (!b.birthDate) return -1
      return new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime()
    })
})

// --- Methods ---

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function onPhotoUploaded(url: string) {
  if (currentPerson.value) {
    updatePerson(currentPerson.value.id, { photoUrl: url })
    currentPerson.value = { ...currentPerson.value, photoUrl: url }
  }
}

function onPersonUpdated(person: Person) {
  currentPerson.value = person
  showEditForm.value = false
}

function onRelAdded(_rel: Relationship) {
  showRelSelector.value = false
  fetchRelationships(currentPerson.value!.treeId)
}

async function onDeleteRel(relId: string) {
  await deleteRelationship(relId)
}
</script>
