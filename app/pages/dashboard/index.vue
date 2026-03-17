<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Selamat datang{{ profile?.displayName ? `, ${profile.displayName}` : '' }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Kelola silsilah keluarga Anda</p>
      </div>
      <UButton to="/tree/new" icon="i-heroicons-plus" color="primary">
        Buat Trah Baru
      </UButton>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <USkeleton v-for="i in 3" :key="i" class="h-40 rounded-xl" />
    </div>

    <!-- Error -->
    <UAlert v-else-if="error" color="error" icon="i-heroicons-exclamation-triangle" :title="error" />

    <!-- Empty state -->
    <UCard v-else-if="trees.length === 0" class="text-center py-16">
      <UIcon name="i-heroicons-user-group" class="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400 mb-4">Belum ada trah. Mulai dengan membuat trah pertama Anda.</p>
      <UButton to="/tree/new" icon="i-heroicons-plus">Buat Trah Baru</UButton>
    </UCard>

    <!-- Tree list -->
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UCard
        v-for="tree in trees"
        :key="tree.id"
        class="cursor-pointer hover:shadow-md transition-shadow"
        @click="navigateTo(`/tree/${tree.id}`)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <UIcon name="i-heroicons-user-group" class="h-5 w-5 text-primary-500 flex-shrink-0" />
              <h3 class="font-semibold text-gray-900 dark:text-white truncate">{{ tree.name }}</h3>
            </div>
            <p v-if="tree.description" class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {{ tree.description }}
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Dibuat {{ formatDate(tree.createdAt) }}
            </p>
          </div>
          <UDropdownMenu :items="treeMenuItems(tree)">
            <UButton
              icon="i-heroicons-ellipsis-vertical"
              color="neutral"
              variant="ghost"
              size="sm"
              @click.stop
            />
          </UDropdownMenu>
        </div>
      </UCard>
    </div>

    <!-- Edit tree modal -->
    <UModal v-model:open="showEditModal">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Edit Trah</h3>
          </template>
          <div class="space-y-4">
            <UFormField label="Nama Trah" required>
              <UInput v-model="editForm.name" placeholder="Nama trah" class="w-full" />
            </UFormField>
            <UFormField label="Deskripsi">
              <UTextarea v-model="editForm.description" placeholder="Deskripsi singkat (opsional)" :rows="3" class="w-full" />
            </UFormField>
          </div>
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="outline" @click="showEditModal = false">Batal</UButton>
              <UButton :loading="loading" @click="saveEdit">Simpan</UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Confirm delete modal -->
    <UModal v-model:open="showDeleteModal">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-red-600 dark:text-red-400">Hapus Trah</h3>
          </template>
          <p class="text-gray-600 dark:text-gray-400">
            Apakah Anda yakin ingin menghapus trah <strong>{{ deleteTarget?.name }}</strong>?
            Semua anggota dan relasi akan ikut terhapus. Tindakan ini tidak bisa dibatalkan.
          </p>
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="outline" @click="showDeleteModal = false">Batal</UButton>
              <UButton color="error" :loading="loading" @click="confirmDelete">Hapus</UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Tree } from '../../../domain/entities/tree'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Dashboard — Trah' })

const { profile, fetchProfile } = useProfile()
const { trees, loading, error, fetchTrees, updateTree, deleteTree } = useTree()
const toast = useToast()

const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editTarget = ref<Tree | null>(null)
const deleteTarget = ref<Tree | null>(null)
const editForm = reactive({ name: '', description: '' })

onMounted(async () => {
  await Promise.all([fetchProfile(), fetchTrees()])
})

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function treeMenuItems(tree: Tree) {
  return [
    [{
      label: 'Lihat Silsilah',
      icon: 'i-heroicons-eye',
      onSelect: () => navigateTo(`/tree/${tree.id}`),
    }],
    [{
      label: 'Edit',
      icon: 'i-heroicons-pencil',
      onSelect: () => openEdit(tree),
    }, {
      label: 'Hapus',
      icon: 'i-heroicons-trash',
      color: 'error' as const,
      onSelect: () => openDelete(tree),
    }],
  ]
}

function openEdit(tree: Tree) {
  editTarget.value = tree
  editForm.name = tree.name
  editForm.description = tree.description ?? ''
  showEditModal.value = true
}

function openDelete(tree: Tree) {
  deleteTarget.value = tree
  showDeleteModal.value = true
}

async function saveEdit() {
  if (!editTarget.value || !editForm.name.trim()) return
  const ok = await updateTree(editTarget.value.id, {
    name: editForm.name.trim(),
    description: editForm.description.trim() || null,
  })
  if (ok) {
    showEditModal.value = false
    toast.add({ title: 'Trah berhasil diperbarui', color: 'success' })
  }
  else {
    toast.add({ title: error.value ?? 'Gagal memperbarui', color: 'error' })
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  const ok = await deleteTree(deleteTarget.value.id)
  if (ok) {
    showDeleteModal.value = false
    toast.add({ title: 'Trah berhasil dihapus', color: 'success' })
  }
  else {
    toast.add({ title: error.value ?? 'Gagal menghapus', color: 'error' })
  }
}
</script>
