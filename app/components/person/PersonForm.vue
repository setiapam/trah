<template>
  <USlideover :open="open" @update:open="$emit('close')" side="right" :ui="{ width: 'max-w-xl' }">
    <template #content>
      <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ person ? 'Edit Anggota' : 'Tambah Anggota' }}
          </h2>
          <UButton icon="i-heroicons-x-mark" color="neutral" variant="ghost" @click="$emit('close')" />
        </div>

        <!-- Form -->
        <div class="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          <!-- Name fields -->
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Nama Depan" required :error="errors.firstName">
              <UInput v-model="form.firstName" placeholder="Nama depan" class="w-full" />
            </UFormField>
            <UFormField label="Nama Belakang">
              <UInput v-model="form.lastName" placeholder="Nama belakang / marga" class="w-full" />
            </UFormField>
          </div>

          <UFormField label="Nama Panggilan">
            <UInput v-model="form.nickname" placeholder="Nama panggilan (opsional)" class="w-full" />
          </UFormField>

          <!-- Gender -->
          <UFormField label="Jenis Kelamin">
            <div class="flex gap-4 mt-1">
              <label v-for="opt in genderOptions" :key="opt.value" class="flex items-center gap-2 cursor-pointer">
                <input v-model="form.gender" type="radio" :value="opt.value" class="accent-primary-500">
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ opt.label }}</span>
              </label>
            </div>
          </UFormField>

          <USeparator />

          <!-- Birth info -->
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Tanggal Lahir" :error="errors.birthDate">
              <SharedDateInput v-model="form.birthDate" />
            </UFormField>
            <UFormField label="Tempat Lahir">
              <UInput v-model="form.birthPlace" placeholder="Kota / desa" class="w-full" />
            </UFormField>
          </div>

          <!-- Death info -->
          <UFormField label="Status">
            <label class="flex items-center gap-2 cursor-pointer mt-1">
              <UCheckbox v-model="form.isAlive" />
              <span class="text-sm text-gray-700 dark:text-gray-300">Masih hidup</span>
            </label>
          </UFormField>

          <div v-if="!form.isAlive" class="grid grid-cols-2 gap-4">
            <UFormField label="Tanggal Wafat" :error="errors.deathDate">
              <SharedDateInput v-model="form.deathDate" />
            </UFormField>
            <UFormField label="Tempat Wafat">
              <UInput v-model="form.deathPlace" placeholder="Kota / desa" class="w-full" />
            </UFormField>
          </div>

          <USeparator />

          <!-- Contact info -->
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Kontak (Opsional)</p>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Telepon">
              <UInput v-model="form.phone" placeholder="08xx" class="w-full" />
            </UFormField>
            <UFormField label="Email" :error="errors.email">
              <UInput v-model="form.email" type="email" placeholder="email@contoh.com" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Alamat">
            <UTextarea v-model="form.address" placeholder="Alamat lengkap" :rows="2" class="w-full" />
          </UFormField>

          <USeparator />

          <UFormField label="Catatan">
            <UTextarea v-model="form.notes" placeholder="Catatan atau biografi singkat" :rows="3" class="w-full" />
          </UFormField>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <UAlert v-if="submitError" color="error" :title="submitError" class="mb-3" />
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="outline" @click="$emit('close')">Batal</UButton>
            <UButton :loading="loading" @click="submit">
              {{ person ? 'Simpan Perubahan' : 'Tambah Anggota' }}
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import type { Person, CreatePersonInput, UpdatePersonInput } from '../../../domain/entities/person'
import { validatePerson } from '../../../domain/rules/personRules'

const props = defineProps<{
  open: boolean
  treeId: string
  person?: Person | null
}>()

const emit = defineEmits<{
  close: []
  saved: [person: Person]
}>()

const { createPerson, updatePerson, loading, error: repoError } = usePerson()

const submitError = ref<string | null>(null)
const errors = reactive({
  firstName: '',
  birthDate: '',
  deathDate: '',
  email: '',
})

const genderOptions = [
  { value: 'M', label: 'Laki-laki' },
  { value: 'F', label: 'Perempuan' },
  { value: 'U', label: 'Tidak diketahui' },
]

const form = reactive({
  firstName: '',
  lastName: '',
  nickname: '',
  gender: 'U' as 'M' | 'F' | 'U',
  birthDate: '',
  birthPlace: '',
  deathDate: '',
  deathPlace: '',
  isAlive: true,
  phone: '',
  email: '',
  address: '',
  notes: '',
})

// Reset form when person changes or modal opens
watch(() => [props.open, props.person], () => {
  submitError.value = null
  Object.assign(errors, { firstName: '', birthDate: '', deathDate: '', email: '' })

  if (props.person) {
    form.firstName = props.person.firstName
    form.lastName = props.person.lastName ?? ''
    form.nickname = props.person.nickname ?? ''
    form.gender = props.person.gender
    form.birthDate = props.person.birthDate ?? ''
    form.birthPlace = props.person.birthPlace ?? ''
    form.deathDate = props.person.deathDate ?? ''
    form.deathPlace = props.person.deathPlace ?? ''
    form.isAlive = props.person.isAlive
    form.phone = props.person.phone ?? ''
    form.email = props.person.email ?? ''
    form.address = props.person.address ?? ''
    form.notes = props.person.notes ?? ''
  }
  else {
    form.firstName = ''
    form.lastName = ''
    form.nickname = ''
    form.gender = 'U'
    form.birthDate = ''
    form.birthPlace = ''
    form.deathDate = ''
    form.deathPlace = ''
    form.isAlive = true
    form.phone = ''
    form.email = ''
    form.address = ''
    form.notes = ''
  }
}, { immediate: true })

function buildInput(): CreatePersonInput {
  return {
    treeId: props.treeId,
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim() || null,
    nickname: form.nickname.trim() || null,
    gender: form.gender,
    birthDate: form.birthDate || null,
    birthPlace: form.birthPlace.trim() || null,
    deathDate: form.isAlive ? null : (form.deathDate || null),
    deathPlace: form.isAlive ? null : (form.deathPlace.trim() || null),
    isAlive: form.isAlive,
    phone: form.phone.trim() || null,
    email: form.email.trim() || null,
    address: form.address.trim() || null,
    notes: form.notes.trim() || null,
  }
}

async function submit() {
  submitError.value = null
  Object.assign(errors, { firstName: '', birthDate: '', deathDate: '', email: '' })

  if (!form.firstName.trim()) {
    errors.firstName = 'Nama depan wajib diisi'
    return
  }

  const input = buildInput()

  // Domain validation
  const validationResults = validatePerson({ ...input, id: props.person?.id ?? 'validate', treeId: props.treeId })
  const invalidResults = validationResults.filter(r => !r.valid)
  if (invalidResults.length > 0) {
    submitError.value = invalidResults.map(r => (!r.valid ? r.error : '')).join(', ')
    return
  }

  let saved: Person | null | boolean = null
  if (props.person) {
    const updateInput: UpdatePersonInput = { ...input }
    delete (updateInput as Record<string, unknown>).treeId
    const ok = await updatePerson(props.person.id, updateInput)
    if (ok) {
      saved = { ...props.person, ...input }
    }
  }
  else {
    saved = await createPerson(input)
  }

  if (saved) {
    emit('saved', saved as Person)
  }
  else {
    submitError.value = repoError.value ?? 'Gagal menyimpan data'
  }
}
</script>
