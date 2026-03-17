<template>
  <div class="max-w-xl mx-auto">
    <div class="mb-6">
      <UButton
        to="/dashboard"
        icon="i-heroicons-arrow-left"
        color="neutral"
        variant="ghost"
        class="mb-4"
      >
        Kembali
      </UButton>
      <h1 class="font-javanese text-2xl font-bold text-stone-800 dark:text-stone-100">Buat Trah Baru</h1>
      <p class="mt-1 text-sm text-stone-500 dark:text-stone-400">Langkah {{ step }} dari 2</p>
    </div>

    <!-- Progress -->
    <div class="flex gap-2 mb-8">
      <div class="flex-1 h-2 rounded-full" :class="step >= 1 ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'" />
      <div class="flex-1 h-2 rounded-full" :class="step >= 2 ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'" />
    </div>

    <!-- Step 1: Tree info -->
    <UCard v-if="step === 1">
      <template #header>
        <h2 class="font-semibold text-gray-900 dark:text-white">Informasi Trah</h2>
      </template>
      <div class="space-y-4">
        <UFormField label="Nama Trah" required :error="errors.name">
          <UInput
            v-model="treeForm.name"
            placeholder="Contoh: Trah Mangkudipuro, Keluarga Besar Sinaga"
            class="w-full"
            @blur="validateTreeForm"
          />
        </UFormField>
        <UFormField label="Deskripsi" :error="errors.description">
          <UTextarea
            v-model="treeForm.description"
            placeholder="Cerita singkat tentang trah ini (opsional)"
            :rows="3"
            class="w-full"
          />
        </UFormField>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <UButton :disabled="!treeForm.name.trim()" @click="goToStep2">
            Lanjut
            <template #trailing>
              <UIcon name="i-heroicons-arrow-right" />
            </template>
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- Step 2: First person (root ancestor) -->
    <UCard v-else>
      <template #header>
        <h2 class="font-semibold text-gray-900 dark:text-white">Leluhur Pertama</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Tambahkan anggota pertama sebagai akar silsilah. Bisa diubah nanti.
        </p>
      </template>
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Nama Depan" required :error="personErrors.firstName">
            <UInput v-model="personForm.firstName" placeholder="Nama depan" class="w-full" />
          </UFormField>
          <UFormField label="Nama Belakang">
            <UInput v-model="personForm.lastName" placeholder="Nama belakang / marga" class="w-full" />
          </UFormField>
        </div>
        <UFormField label="Nama Panggilan">
          <UInput v-model="personForm.nickname" placeholder="Nama panggilan (opsional)" class="w-full" />
        </UFormField>
        <UFormField label="Jenis Kelamin">
          <div class="flex gap-4 mt-1">
            <label
              v-for="opt in genderOptions"
              :key="opt.value"
              class="flex items-center gap-2 cursor-pointer"
            >
              <input
                v-model="personForm.gender"
                type="radio"
                :value="opt.value"
                class="text-primary-500"
              >
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ opt.label }}</span>
            </label>
          </div>
        </UFormField>
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Tanggal Lahir">
            <UInput v-model="personForm.birthDate" type="date" class="w-full" />
          </UFormField>
          <UFormField label="Tempat Lahir">
            <UInput v-model="personForm.birthPlace" placeholder="Kota / desa" class="w-full" />
          </UFormField>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-between">
          <UButton color="neutral" variant="outline" @click="step = 1">Kembali</UButton>
          <div class="flex gap-2">
            <UButton color="neutral" variant="ghost" :loading="loading" @click="skipFirstPerson">
              Lewati
            </UButton>
            <UButton :loading="loading" :disabled="!personForm.firstName.trim()" @click="createAll">
              Buat Trah
            </UButton>
          </div>
        </div>
      </template>
    </UCard>

    <UAlert v-if="errorMsg" class="mt-4" color="error" :title="errorMsg" />
  </div>
</template>

<script setup lang="ts">
import type { CreateTreeInput } from '../../../domain/entities/tree'
import type { CreatePersonInput } from '../../../domain/entities/person'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Buat Trah Baru — Trah' })

const session = useSupabaseSession()
const { createTree, loading: treeLoading, error: treeError } = useTree()
const { createPerson, loading: personLoading } = usePerson()
const toast = useToast()

const loading = computed(() => treeLoading.value || personLoading.value)

const step = ref(1)
const errorMsg = ref<string | null>(null)

const treeForm = reactive({ name: '', description: '' })
const errors = reactive({ name: '', description: '' })

const personForm = reactive({
  firstName: '',
  lastName: '',
  nickname: '',
  gender: 'U' as 'M' | 'F' | 'U',
  birthDate: '',
  birthPlace: '',
})
const personErrors = reactive({ firstName: '' })

const genderOptions = [
  { value: 'M', label: 'Laki-laki' },
  { value: 'F', label: 'Perempuan' },
  { value: 'U', label: 'Tidak diketahui' },
]

function validateTreeForm(): boolean {
  errors.name = ''
  if (!treeForm.name.trim()) {
    errors.name = 'Nama trah wajib diisi'
    return false
  }
  if (treeForm.name.trim().length > 100) {
    errors.name = 'Nama trah maksimal 100 karakter'
    return false
  }
  return true
}

function goToStep2() {
  if (validateTreeForm()) step.value = 2
}

async function skipFirstPerson() {
  if (!session.value?.user?.id) return
  const input: CreateTreeInput = {
    ownerId: session.value?.user?.id,
    name: treeForm.name.trim(),
    description: treeForm.description.trim() || null,
  }
  const tree = await createTree(input)
  if (tree) {
    toast.add({ title: `Trah "${tree.name}" berhasil dibuat!`, color: 'success' })
    await navigateTo(`/tree/${tree.id}`)
  }
  else {
    errorMsg.value = treeError.value ?? 'Gagal membuat trah'
  }
}

async function createAll() {
  if (!session.value?.user?.id || !personForm.firstName.trim()) return
  errorMsg.value = null

  // 1. Create tree
  const treeInput: CreateTreeInput = {
    ownerId: session.value?.user?.id,
    name: treeForm.name.trim(),
    description: treeForm.description.trim() || null,
  }
  const tree = await createTree(treeInput)
  if (!tree) {
    errorMsg.value = treeError.value ?? 'Gagal membuat trah'
    return
  }

  // 2. Create first person
  const personInput: CreatePersonInput = {
    treeId: tree.id,
    firstName: personForm.firstName.trim(),
    lastName: personForm.lastName.trim() || null,
    nickname: personForm.nickname.trim() || null,
    gender: personForm.gender,
    birthDate: personForm.birthDate || null,
    birthPlace: personForm.birthPlace.trim() || null,
  }
  const person = await createPerson(personInput)

  // 3. Set as root person
  if (person) {
    const nuxtApp = useNuxtApp()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const repos = nuxtApp.$repos as any
    await repos.tree.update(tree.id, { rootPersonId: person.id })
  }

  toast.add({ title: `Trah "${tree.name}" berhasil dibuat!`, color: 'success' })
  await navigateTo(`/tree/${tree.id}`)
}
</script>
