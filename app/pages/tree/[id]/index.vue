<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-start justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <UButton to="/dashboard" icon="i-heroicons-arrow-left" color="neutral" variant="ghost" size="sm" />
          <USkeleton v-if="!currentTree" class="h-7 w-48" />
          <h1 v-else class="font-javanese text-2xl font-bold text-stone-800 dark:text-stone-100">
            {{ currentTree.name }}
          </h1>
        </div>
        <p v-if="currentTree?.description" class="text-sm text-stone-500 dark:text-stone-400 ml-9 italic">
          {{ currentTree.description }}
        </p>
      </div>
      <div class="flex gap-2 flex-shrink-0">
        <UButton
          v-if="currentTree && isOwner"
          icon="i-heroicons-users"
          color="neutral"
          variant="outline"
          :to="`/tree/${treeId}/members`"
        >
          Anggota
        </UButton>
        <UButton v-if="currentTree && canEdit" icon="i-heroicons-user-plus" @click="openAddPerson">
          Tambah Anggota
        </UButton>
      </div>
    </div>

    <UAlert v-if="error" color="error" :title="error" class="mb-4" />

    <!-- Stats -->
    <div v-if="currentTree" class="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
      <div class="card-emas bg-white dark:bg-stone-900 rounded-xl shadow-sm ring-1 ring-amber-200/50 dark:ring-stone-700/60 text-center py-4 px-3">
        <p class="text-2xl font-bold text-amber-600 dark:text-amber-400 font-javanese">{{ persons.length }}</p>
        <p class="text-xs text-stone-500 dark:text-stone-400 mt-1">Anggota</p>
      </div>
      <div class="card-emas bg-white dark:bg-stone-900 rounded-xl shadow-sm ring-1 ring-amber-200/50 dark:ring-stone-700/60 text-center py-4 px-3">
        <p class="text-2xl font-bold text-amber-600 dark:text-amber-400 font-javanese">{{ relationships.length }}</p>
        <p class="text-xs text-stone-500 dark:text-stone-400 mt-1">Relasi</p>
      </div>
      <div class="card-emas bg-white dark:bg-stone-900 rounded-xl shadow-sm ring-1 ring-amber-200/50 dark:ring-stone-700/60 text-center py-4 px-3">
        <p class="text-2xl font-bold text-amber-600 dark:text-amber-400 font-javanese">{{ aliveCount }}</p>
        <p class="text-xs text-stone-500 dark:text-stone-400 mt-1">Masih Hidup</p>
      </div>
      <div class="card-emas bg-white dark:bg-stone-900 rounded-xl shadow-sm ring-1 ring-amber-200/50 dark:ring-stone-700/60 text-center py-4 px-3">
        <p class="text-2xl font-bold text-amber-600 dark:text-amber-400 font-javanese">{{ generationCount }}</p>
        <p class="text-xs text-stone-500 dark:text-stone-400 mt-1">Generasi</p>
      </div>
    </div>

    <!-- View toggle -->
    <div class="mb-4 flex items-center gap-2">
      <UButton
        :variant="view === 'tree' ? 'solid' : 'outline'"
        color="neutral"
        size="sm"
        icon="i-heroicons-share"
        @click="view = 'tree'"
      >
        Pohon
      </UButton>
      <UButton
        :variant="view === 'list' ? 'solid' : 'outline'"
        color="neutral"
        size="sm"
        icon="i-heroicons-list-bullet"
        @click="view = 'list'"
      >
        Daftar
      </UButton>
    </div>

    <!-- Tree view -->
    <div v-if="view === 'tree'" class="h-[600px] sm:h-[700px]">
      <TreeTreeView
        :root-person-id="currentTree?.rootPersonId ?? null"
        :persons="persons"
        :relationships="relationships"
        :tree-id="treeId"
        @node-click="(id) => navigateTo('/person/' + id)"
      />
    </div>

    <!-- List view -->
    <template v-else>
      <!-- Search -->
      <div class="mb-4 flex gap-2">
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          placeholder="Cari anggota..."
          class="flex-1"
        />
      </div>

      <!-- Loading skeletons -->
      <div v-if="personLoading" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <USkeleton v-for="i in 6" :key="i" class="h-24 rounded-xl" />
      </div>

      <!-- Empty state -->
      <UCard v-else-if="filteredPersons.length === 0 && !searchQuery" class="text-center py-12">
        <div class="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-heroicons-users" class="w-8 h-8 text-amber-600" />
        </div>
        <p class="font-javanese text-stone-600 mb-3">Belum ada anggota keluarga.</p>
        <UButton v-if="canEdit" icon="i-heroicons-user-plus" @click="openAddPerson">Tambah Anggota Pertama</UButton>
      </UCard>

      <!-- No search results -->
      <UCard v-else-if="filteredPersons.length === 0" class="text-center py-8">
        <p class="text-stone-500 dark:text-stone-400">Tidak ada anggota yang sesuai dengan "{{ searchQuery }}"</p>
      </UCard>

      <!-- Person grid -->
      <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <UCard
        v-for="person in filteredPersons"
        :key="person.id"
        class="cursor-pointer hover:shadow-md transition-shadow"
        @click="navigateTo(`/person/${person.id}`)"
      >
        <div class="flex items-center gap-3">
          <UAvatar
            :src="person.photoUrl ?? undefined"
            :alt="getFullName(person)"
            :ui="{ root: 'flex-shrink-0' }"
            size="lg"
          >
            <template v-if="!person.photoUrl" #fallback>
              <UIcon
                :name="person.gender === 'M' ? 'i-heroicons-user' : person.gender === 'F' ? 'i-heroicons-user' : 'i-heroicons-user'"
                class="h-5 w-5"
              />
            </template>
          </UAvatar>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5">
              <p class="font-medium text-gray-900 dark:text-white truncate">{{ getFullName(person) }}</p>
              <UBadge
                v-if="currentTree?.rootPersonId === person.id"
                size="xs"
                color="primary"
                variant="soft"
              >
                Akar
              </UBadge>
            </div>
            <p v-if="person.nickname" class="text-xs text-gray-400 dark:text-gray-500 truncate">
              "{{ person.nickname }}"
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              <span v-if="person.birthDate">{{ formatYear(person.birthDate) }}</span>
              <span v-if="person.birthDate && (person.deathDate || !person.isAlive)"> – </span>
              <span v-if="!person.isAlive || person.deathDate">{{ person.deathDate ? formatYear(person.deathDate) : '†' }}</span>
              <span v-if="!person.birthDate && person.isAlive" class="text-green-500">Masih hidup</span>
            </p>
          </div>
          <UDropdownMenu :items="personMenuItems(person)">
            <UButton
              icon="i-heroicons-ellipsis-vertical"
              color="neutral"
              variant="ghost"
              size="xs"
              @click.stop
            />
          </UDropdownMenu>
        </div>
      </UCard>
    </div>
    </template>

    <!-- ShareTree slideover -->
    <ShareTreeComponent
      v-if="currentTree"
      :open="showSharePanel"
      :tree-id="treeId"
      :owner-id="currentTree.ownerId"
      @close="showSharePanel = false"
    />

    <!-- PersonForm slideover -->
    <PersonPersonForm
      :open="showPersonForm"
      :tree-id="treeId"
      :person="editingPerson"
      @close="showPersonForm = false"
      @saved="onPersonSaved"
    />

    <!-- Confirm delete person -->
    <UModal v-model:open="showDeletePersonModal">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-red-600 dark:text-red-400">Hapus Anggota</h3>
          </template>
          <p class="text-gray-600 dark:text-gray-400">
            Apakah Anda yakin ingin menghapus
            <strong>{{ deletePersonTarget ? getFullName(deletePersonTarget) : '' }}</strong>?
            Semua relasi terkait akan ikut terhapus.
          </p>
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="outline" @click="showDeletePersonModal = false">Batal</UButton>
              <UButton color="error" :loading="personLoading" @click="confirmDeletePerson">Hapus</UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Person } from '../../../domain/entities/person'
import { getFullName } from '../../../domain/entities/person'
import PersonPersonForm from '../../../components/person/PersonForm.vue'
import TreeTreeView from '../../../components/tree/TreeView.vue'
import ShareTreeComponent from '../../../components/tree/ShareTree.vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const treeId = route.params.id as string
const toast = useToast()

const nuxtApp = useNuxtApp()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRepos(): any { return (nuxtApp as Record<string, unknown>).$repos }

const currentTree = ref<import('../../../domain/entities/tree').Tree | null>(null)
const { persons, loading: personLoading, error, fetchPersons, deletePerson } = usePerson()
const { relationships, fetchRelationships } = useRelationship()

const session = useSupabaseSession()
const supabase = useSupabaseClient()
const isOwner = computed(() => currentTree.value?.ownerId === session.value?.user?.id)
const userRole = ref<'owner' | 'editor' | 'viewer' | null>(null)
const canEdit = computed(() => userRole.value === 'owner' || userRole.value === 'editor')

const showSharePanel = ref(false)
const view = ref<'tree' | 'list'>('tree')
const searchQuery = ref('')
const showPersonForm = ref(false)
const editingPerson = ref<Person | null>(null)
const showDeletePersonModal = ref(false)
const deletePersonTarget = ref<Person | null>(null)

useHead(() => ({
  title: currentTree.value ? `${currentTree.value.name} — Trah` : 'Silsilah — Trah',
}))

onMounted(async () => {
  const [tree] = await Promise.all([
    getRepos().tree.getById(treeId),
    fetchPersons(treeId),
    fetchRelationships(treeId),
  ])
  currentTree.value = tree

  if (tree?.ownerId === session.value?.user?.id) {
    userRole.value = 'owner'
  }
  else {
    const { data } = await supabase
      .from('tree_members')
      .select('role')
      .eq('tree_id', treeId)
      .eq('user_id', session.value?.user?.id ?? '')
      .not('accepted_at', 'is', null)
      .maybeSingle()
    userRole.value = (data?.role as 'editor' | 'viewer') ?? null
  }
})

const filteredPersons = computed(() => {
  if (!searchQuery.value.trim()) return persons.value
  const q = searchQuery.value.toLowerCase()
  return persons.value.filter(p =>
    p.firstName.toLowerCase().includes(q)
    || (p.lastName ?? '').toLowerCase().includes(q)
    || (p.nickname ?? '').toLowerCase().includes(q),
  )
})

const aliveCount = computed(() => persons.value.filter(p => p.isAlive).length)
const generationCount = computed(() => {
  // Rough estimation: unique birth decades
  const years = persons.value
    .filter(p => p.birthDate)
    .map(p => Math.floor(new Date(p.birthDate!).getFullYear() / 25))
  const unique = new Set(years)
  return unique.size || 1
})

function formatYear(date: string): string {
  return new Date(date).getFullYear().toString()
}

function openAddPerson() {
  editingPerson.value = null
  showPersonForm.value = true
}

function personMenuItems(person: Person) {
  const items: ReturnType<typeof personMenuItems> = [
    [{
      label: 'Lihat Detail',
      icon: 'i-heroicons-eye',
      onSelect: () => navigateTo(`/person/${person.id}`),
    }],
  ]
  if (canEdit.value) {
    const editGroup: { label: string, icon: string, color?: 'error', onSelect: () => void }[] = [
      {
        label: 'Edit',
        icon: 'i-heroicons-pencil',
        onSelect: () => {
          editingPerson.value = person
          showPersonForm.value = true
        },
      },
    ]
    // Show "Jadikan Akar" only if this person is not already root
    if (currentTree.value?.rootPersonId !== person.id) {
      editGroup.push({
        label: 'Jadikan Akar',
        icon: 'i-heroicons-arrow-up-on-square',
        onSelect: () => setAsRoot(person),
      })
    }
    editGroup.push({
      label: 'Hapus',
      icon: 'i-heroicons-trash',
      color: 'error' as const,
      onSelect: () => {
        deletePersonTarget.value = person
        showDeletePersonModal.value = true
      },
    })
    items.push(editGroup)
  }
  return items
}

async function setAsRoot(person: Person) {
  try {
    await getRepos().tree.update(treeId, { rootPersonId: person.id })
    currentTree.value = { ...currentTree.value!, rootPersonId: person.id }
    toast.add({ title: `${getFullName(person)} dijadikan akar silsilah`, color: 'success' })
  }
  catch {
    toast.add({ title: 'Gagal mengubah akar silsilah', color: 'error' })
  }
}

function onPersonSaved(person: Person) {
  showPersonForm.value = false
  const idx = persons.value.findIndex(p => p.id === person.id)
  if (idx !== -1) {
    persons.value[idx] = person
  }
  else {
    persons.value.push(person)
  }
  toast.add({ title: `${getFullName(person)} berhasil disimpan`, color: 'success' })
}

async function confirmDeletePerson() {
  if (!deletePersonTarget.value) return
  const ok = await deletePerson(deletePersonTarget.value.id)
  if (ok) {
    showDeletePersonModal.value = false
    toast.add({ title: 'Anggota berhasil dihapus', color: 'success' })
  }
  else {
    toast.add({ title: error.value ?? 'Gagal menghapus', color: 'error' })
  }
}
</script>
