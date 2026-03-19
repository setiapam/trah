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
            <div class="flex flex-col items-center gap-2">
              <UAvatar
                :src="currentPerson.photoUrl ?? undefined"
                :alt="getFullName(currentPerson)"
                size="2xl"
                class="ring-2 ring-white dark:ring-gray-800"
                :class="currentPerson.photoUrl ? 'cursor-pointer hover:ring-amber-400 transition-all' : ''"
                @click="currentPerson.photoUrl && (showPhotoViewer = true)"
              />
              <div v-if="canEdit" class="flex gap-1">
                <label class="cursor-pointer">
                  <UButton variant="outline" size="xs" as="span" :loading="photoUploading">
                    <UIcon v-if="!photoUploading" name="i-heroicons-camera" class="h-3 w-3" />
                    Ganti Foto
                  </UButton>
                  <input
                    type="file"
                    class="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    :disabled="photoUploading"
                    @change="onPhotoFileChange"
                  >
                </label>
                <UButton
                  v-if="currentPerson.photoUrl"
                  variant="outline"
                  color="error"
                  size="xs"
                  icon="i-heroicons-trash"
                  :loading="photoDeleting"
                  @click="onDeletePhoto"
                />
              </div>
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
              <!-- Linked person indicator -->
              <div
                v-if="currentPerson.linkedPersonId"
                class="flex items-center gap-2 mt-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg"
              >
                <UIcon name="i-heroicons-link" class="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span class="text-sm text-amber-800 dark:text-amber-300">
                  Salinan dari
                  <NuxtLink
                    v-if="canAccessLinkedTree"
                    :to="`/person/${currentPerson.linkedPersonId}`"
                    class="font-medium text-amber-700 dark:text-amber-400 hover:text-amber-900 underline"
                  >
                    {{ linkedTreeName }}
                  </NuxtLink>
                  <span v-else class="font-medium">trah lain</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex gap-2 flex-shrink-0">
          <UButton v-if="canEdit" icon="i-heroicons-pencil" color="neutral" variant="outline" @click="showEditForm = true">
            Edit
          </UButton>
          <UButton
            icon="i-heroicons-plus-circle"
            color="neutral"
            variant="outline"
            :loading="creatingTreeFromPerson"
            @click="showCreateTreeModal = true"
          >
            Buat Trah Baru
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
                <UButton v-if="canEdit" icon="i-heroicons-plus" size="sm" variant="outline" @click="showRelSelector = true">
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
                    :role-label="getParentRoleLabel(p.person)"
                    :can-edit="canEdit"
                    :show-edit="true"
                    @edit="onEditRel"
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
                    :can-edit="canEdit"
                    :show-edit="true"
                    @edit="onEditRel"
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
                    :can-edit="canEdit"
                    :show-edit="true"
                    @edit="onEditRel"
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

      <!-- Photo viewer -->
      <SharedImageViewer
        v-if="currentPerson.photoUrl"
        v-model:open="showPhotoViewer"
        :src="currentPerson.photoUrl"
        :alt="getFullName(currentPerson)"
      />

      <!-- Relationship edit modal -->
      <PersonRelationshipEditModal
        :open="showRelEditModal"
        :relationship="editingRelationship"
        :current-person-id="currentPerson.id"
        :persons="treeParsons"
        @close="showRelEditModal = false; editingRelationship = null"
        @updated="onRelUpdated"
      />

      <!-- Create tree from person modal -->
      <UModal v-model:open="showCreateTreeModal">
        <template #content>
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Buat Trah Baru</h3>
                <UButton icon="i-heroicons-x-mark" color="neutral" variant="ghost" @click="showCreateTreeModal = false" />
              </div>
            </template>
            <div class="space-y-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Buat trah baru dengan <strong>{{ getFullName(currentPerson) }}</strong> sebagai akar silsilah.
                Pasangan, anak, cucu, dan seluruh keturunan akan ikut disalin beserta relasinya.
                Data tetap terhubung dengan trah asal.
              </p>
              <UFormField label="Nama Trah" required>
                <UInput v-model="newTreeName" placeholder="Contoh: Keluarga Besar Soekarno" class="w-full" />
              </UFormField>
              <UFormField label="Deskripsi (Opsional)">
                <UTextarea v-model="newTreeDescription" placeholder="Deskripsi singkat tentang trah" :rows="2" class="w-full" />
              </UFormField>
              <UAlert v-if="createTreeError" color="error" :title="createTreeError" />
            </div>
            <template #footer>
              <div class="flex justify-end gap-2">
                <UButton color="neutral" variant="outline" @click="showCreateTreeModal = false">Batal</UButton>
                <UButton :loading="creatingTreeFromPerson" :disabled="!newTreeName.trim()" @click="onCreateTreeFromPerson">
                  Buat Trah
                </UButton>
              </div>
            </template>
          </UCard>
        </template>
      </UModal>
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

const session = useSupabaseSession()
const supabase = useSupabaseClient()
const { currentPerson, loading: personLoading, fetchPerson, updatePerson } = usePerson()
const { relationships, loading: relLoading, fetchRelationships, createRelationship, updateRelationship, deleteRelationship, getParents, getChildren, getSpouses, getSiblings } = useRelationship()

const showEditForm = ref(false)
const showRelSelector = ref(false)
const showRelEditModal = ref(false)
const showPhotoViewer = ref(false)
const photoUploading = ref(false)
const photoDeleting = ref(false)
const linkedTreeName = ref('trah lain')
const canAccessLinkedTree = ref(false)
const showCreateTreeModal = ref(false)
const creatingTreeFromPerson = ref(false)
const newTreeName = ref('')
const newTreeDescription = ref('')
const createTreeError = ref<string | null>(null)

const nuxtApp = useNuxtApp()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const repos = nuxtApp.$repos as any
const toast = useToast()
const editingRelationship = ref<Relationship | null>(null)
const canEdit = ref(false)

// All persons in the tree (for relationship selector)
const treeParsons = ref<Person[]>([])

useHead(() => ({
  title: currentPerson.value ? `${getFullName(currentPerson.value)} — Trah` : 'Detail Anggota — Trah',
}))

onMounted(async () => {
  await fetchPerson(personId)
  if (currentPerson.value) {
    const treeId = currentPerson.value.treeId
    await fetchRelationships(treeId)

    // Load all persons for the relationship selector
    const nuxtApp = useNuxtApp()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    treeParsons.value = await ((nuxtApp as Record<string, unknown>).$repos as any).person.getByTree(treeId)

    // Determine edit permission
    const { data: tree } = await supabase.from('trees').select('owner_id').eq('id', treeId).single()
    if (tree?.owner_id === session.value?.user?.id) {
      canEdit.value = true
    }
    else {
      const { data: member } = await supabase
        .from('tree_members')
        .select('role')
        .eq('tree_id', treeId)
        .eq('user_id', session.value?.user?.id ?? '')
        .not('accepted_at', 'is', null)
        .maybeSingle()
      canEdit.value = member?.role === 'editor'
    }

    // Check linked person info
    if (currentPerson.value.linkedFromTreeId) {
      const { data: linkedTree } = await supabase
        .from('trees')
        .select('name')
        .eq('id', currentPerson.value.linkedFromTreeId)
        .maybeSingle()
      if (linkedTree) {
        linkedTreeName.value = linkedTree.name
        canAccessLinkedTree.value = true
      }
    }
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
    { label: 'Tanggal Lahir', value: p.birthDate ? formatDateDMY(p.birthDate) : null },
    { label: 'Tempat Lahir', value: p.birthPlace },
    { label: 'Tanggal Wafat', value: p.isAlive ? null : (p.deathDate ? formatDateDMY(p.deathDate) : null) },
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

function getParentRoleLabel(parent: Person): string {
  if (parent.gender === 'M') return 'Ayah'
  if (parent.gender === 'F') return 'Ibu'
  return 'Orang Tua'
}

const PHOTO_MAX_SIZE = 2 * 1024 * 1024
const PHOTO_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

async function onPhotoFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!PHOTO_ALLOWED_TYPES.includes(file.type)) {
    toast.add({ title: 'Format tidak didukung. Gunakan JPG, PNG, atau WebP.', color: 'error' })
    input.value = ''
    return
  }
  if (file.size > PHOTO_MAX_SIZE) {
    toast.add({ title: 'Ukuran file maksimal 2 MB.', color: 'error' })
    input.value = ''
    return
  }

  photoUploading.value = true
  try {
    const media = await repos.media.upload(
      { personId: currentPerson.value!.id, treeId: currentPerson.value!.treeId },
      file,
    )
    onPhotoUploaded(media.fileUrl)
    toast.add({ title: 'Foto berhasil diperbarui', color: 'success' })
  }
  catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Gagal mengunggah foto'
    toast.add({ title: msg, color: 'error' })
  }
  finally {
    photoUploading.value = false
    input.value = ''
  }
}

function onPhotoUploaded(url: string) {
  if (currentPerson.value) {
    updatePerson(currentPerson.value.id, { photoUrl: url })
    currentPerson.value = { ...currentPerson.value, photoUrl: url }
  }
}

async function onDeletePhoto() {
  if (!currentPerson.value?.photoUrl) return
  const confirmed = window.confirm('Yakin ingin menghapus foto ini?')
  if (!confirmed) return

  photoDeleting.value = true
  try {
    await updatePerson(currentPerson.value.id, { photoUrl: null })
    currentPerson.value = { ...currentPerson.value, photoUrl: null }
    showPhotoViewer.value = false
    toast.add({ title: 'Foto berhasil dihapus', color: 'success' })
  }
  catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Gagal menghapus foto'
    toast.add({ title: msg, color: 'error' })
  }
  finally {
    photoDeleting.value = false
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

function onEditRel(relId: string) {
  const rel = relationships.value.find(r => r.id === relId) ?? null
  editingRelationship.value = rel
  showRelEditModal.value = true
}

function onRelUpdated(_rel: Relationship) {
  showRelEditModal.value = false
  editingRelationship.value = null
  fetchRelationships(currentPerson.value!.treeId)
}

async function onDeleteRel(relId: string) {
  const confirmed = window.confirm('Yakin ingin menghapus relasi ini?')
  if (!confirmed) return
  await deleteRelationship(relId)
}

async function onCreateTreeFromPerson() {
  if (!currentPerson.value || !newTreeName.value.trim()) return
  creatingTreeFromPerson.value = true
  createTreeError.value = null

  try {
    // 1. Create the new tree
    const tree = await repos.tree.create({
      ownerId: session.value?.user?.id ?? '',
      name: newTreeName.value.trim(),
      description: newTreeDescription.value.trim() || null,
    })

    // 2. Load all relationships from source tree
    const sourceRels = await repos.relationship.getByTree(currentPerson.value.treeId)
    const relData = sourceRels.map((r: { personId: string; relatedPersonId: string; relationshipType: string; marriageDate?: string | null; divorceDate?: string | null }) => ({
      personId: r.personId,
      relatedPersonId: r.relatedPersonId,
      relationshipType: r.relationshipType,
      marriageDate: r.marriageDate,
      divorceDate: r.divorceDate,
    }))

    // 3. Create linked copies of this person + descendants (spouses, children, grandchildren, etc.)
    const { idMap } = await repos.person.createLinkedCopyWithDescendants(currentPerson.value.id, tree.id, relData)

    // 4. Set the copy as root of the new tree
    const rootCopyId = idMap.get(currentPerson.value.id)
    if (rootCopyId) {
      await repos.tree.update(tree.id, { rootPersonId: rootCopyId })
    }

    // 5. Copy relevant relationships to the new tree
    const relsToCopy = sourceRels.filter((r: { personId: string; relatedPersonId: string }) =>
      idMap.has(r.personId) && idMap.has(r.relatedPersonId),
    )
    if (relsToCopy.length > 0) {
      await repos.relationship.bulkInsert(
        relsToCopy.map((r: { personId: string; relatedPersonId: string; relationshipType: string; marriageDate?: string | null; divorceDate?: string | null }) => ({
          treeId: tree.id,
          personId: idMap.get(r.personId)!,
          relatedPersonId: idMap.get(r.relatedPersonId)!,
          relationshipType: r.relationshipType,
          marriageDate: r.marriageDate ?? null,
          divorceDate: r.divorceDate ?? null,
        })),
      )
    }

    showCreateTreeModal.value = false
    toast.add({ title: `Trah "${tree.name}" berhasil dibuat`, color: 'success' })

    // Navigate to the new tree
    navigateTo(`/tree/${tree.id}`)
  }
  catch (e: unknown) {
    createTreeError.value = e instanceof Error ? e.message : 'Gagal membuat trah baru'
  }
  finally {
    creatingTreeFromPerson.value = false
  }
}
</script>
