<template>
  <USlideover :open="open" @update:open="$emit('close')" side="right">
    <template #content>
      <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="border-emas-top flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <div>
            <h2 class="font-javanese font-semibold text-stone-800">Bagikan Silsilah</h2>
            <p class="text-xs text-stone-500 mt-0.5">Undang anggota untuk berkolaborasi</p>
          </div>
          <UButton icon="i-heroicons-x-mark" color="neutral" variant="ghost" @click="$emit('close')" />
        </div>

        <!-- Invite form (hanya owner) -->
        <div v-if="isOwner" class="px-6 py-4 border-b border-stone-100 bg-amber-50/40 space-y-3">
          <p class="text-sm font-medium text-stone-700">Undang Anggota Baru</p>
          <div class="space-y-2">
            <UInput
              v-model="inviteUserId"
              placeholder="User ID (dari halaman profil mereka)"
              :disabled="inviting"
            />
            <div class="flex gap-2">
              <USelect v-model="inviteRole" :items="roleOptions" value-key="value" class="w-32" />
              <UButton
                :loading="inviting"
                :disabled="!inviteUserId.trim()"
                class="flex-1"
                @click="doInvite"
              >
                Undang
              </UButton>
            </div>
          </div>
          <UAlert v-if="inviteError" color="error" variant="soft" :title="inviteError" class="text-xs" />
          <UAlert v-if="inviteSuccess" color="success" variant="soft" :title="inviteSuccess" class="text-xs" />
          <p class="text-xs text-stone-400">
            <UIcon name="i-heroicons-information-circle" class="inline h-3 w-3 mr-1" />
            User ID dapat ditemukan di halaman Profil masing-masing pengguna.
          </p>
        </div>

        <!-- Members list -->
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <div v-if="loading" class="space-y-2">
            <USkeleton v-for="i in 3" :key="i" class="h-14 rounded-lg" />
          </div>

          <div v-else-if="members.length === 0" class="text-center py-8">
            <p class="text-sm text-stone-500">Belum ada anggota lain</p>
          </div>

          <div v-else class="space-y-2">
            <p class="text-xs text-stone-400 uppercase tracking-wide mb-3">
              {{ members.length }} Anggota
            </p>

            <div
              v-for="member in members"
              :key="member.id"
              class="flex items-center gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800 ring-1 ring-stone-200/60"
            >
              <UAvatar :alt="member.displayName" size="sm" class="flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-stone-800 dark:text-stone-100 truncate">
                  {{ member.displayName }}
                </p>
                <p class="text-xs text-stone-400">
                  {{ member.acceptedAt ? 'Aktif' : '⏳ Menunggu konfirmasi' }}
                </p>
              </div>
              <UBadge :color="roleColor(member.role)" variant="soft" size="xs">
                {{ roleLabel(member.role) }}
              </UBadge>
              <UButton
                v-if="isOwner"
                icon="i-heroicons-trash"
                size="xs"
                color="error"
                variant="ghost"
                :loading="removingId === member.id"
                @click="doRemove(member.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import type { MemberRole } from '../../composables/useTreeMembers'

const props = defineProps<{
  open: boolean
  treeId: string
  ownerId: string
}>()

defineEmits<{ close: [] }>()

const session = useSupabaseSession()
const { members, loading, fetchMembers, inviteMember, removeMember } = useTreeMembers()

const isOwner = computed(() => session.value?.user?.id === props.ownerId)

const inviteUserId = ref('')
const inviteRole = ref<'editor' | 'viewer'>('viewer')
const inviting = ref(false)
const inviteError = ref<string | null>(null)
const inviteSuccess = ref<string | null>(null)
const removingId = ref<string | null>(null)

const roleOptions = [
  { label: 'Editor', value: 'editor' },
  { label: 'Viewer', value: 'viewer' },
]

watch(() => props.open, (val) => {
  if (val) fetchMembers(props.treeId)
})

async function doInvite(): Promise<void> {
  inviteError.value = null
  inviteSuccess.value = null
  inviting.value = true
  try {
    const ok = await inviteMember(props.treeId, inviteUserId.value.trim(), inviteRole.value as MemberRole)
    if (ok) {
      inviteSuccess.value = 'Undangan berhasil dikirim'
      inviteUserId.value = ''
      await fetchMembers(props.treeId)
    }
    else {
      inviteError.value = 'Gagal mengundang. Periksa User ID dan coba lagi.'
    }
  }
  finally {
    inviting.value = false
  }
}

async function doRemove(memberId: string): Promise<void> {
  removingId.value = memberId
  await removeMember(memberId)
  await fetchMembers(props.treeId)
  removingId.value = null
}

function roleLabel(role: string): string {
  return ({ owner: 'Pemilik', editor: 'Editor', viewer: 'Viewer' } as Record<string, string>)[role] ?? role
}

function roleColor(role: string): 'primary' | 'neutral' | 'success' {
  return (({ owner: 'primary', editor: 'success', viewer: 'neutral' } as Record<string, string>)[role] ?? 'neutral') as 'primary' | 'neutral' | 'success'
}
</script>
