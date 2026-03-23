<template>
  <div class="max-w-2xl mx-auto space-y-8">
    <!-- Back + heading -->
    <div class="flex items-center gap-3">
      <UButton
        :to="`/tree/${treeId}`"
        variant="ghost"
        color="neutral"
        size="sm"
        icon="i-heroicons-arrow-left"
        class="text-stone-600 hover:text-stone-800"
      >
        Kembali ke Silsilah
      </UButton>
    </div>

    <div>
      <p class="trah-ornament mb-1">Kolaborasi</p>
      <h1 class="trah-title text-2xl font-bold text-stone-800 dark:text-stone-100">
        Kelola Anggota
      </h1>
      <p v-if="tree" class="mt-1 text-stone-500 dark:text-stone-400 text-sm italic">
        {{ tree.name }}
      </p>
      <p class="mt-1 text-stone-500 dark:text-stone-400 text-sm">
        Undang kolaborator dan atur hak akses mereka.
      </p>
    </div>

    <!-- Loading tree -->
    <div v-if="treeLoading" class="flex justify-center py-12">
      <USkeleton class="h-40 w-full rounded-xl" />
    </div>

    <!-- Not owner / no access -->
    <UAlert
      v-else-if="!isOwner"
      color="warning"
      variant="soft"
      icon="i-heroicons-lock-closed"
      title="Hanya pemilik trah yang dapat mengelola anggota."
    />

    <template v-else>
      <!-- Invite form -->
      <div class="card-emas ring-1 ring-amber-200/60 p-6 space-y-4">
        <h3 class="font-javanese font-semibold text-stone-700 dark:text-stone-300 text-sm flex items-center gap-2">
          <UIcon name="i-heroicons-user-plus" class="h-4 w-4 text-amber-500" />
          Undang Anggota Baru
        </h3>

        <UAlert
          v-if="inviteError"
          color="error"
          variant="soft"
          :title="inviteError"
          icon="i-heroicons-exclamation-circle"
        />
        <UAlert
          v-if="inviteSuccess"
          color="success"
          variant="soft"
          :title="inviteSuccess"
          icon="i-heroicons-check-circle"
        />

        <div class="space-y-3">
          <UFormField label="Email atau User ID">
            <UInput
              v-model="inviteInput"
              placeholder="nama@email.com atau User ID (UUID)"
              :disabled="inviting"
              class="w-full text-sm"
            />
          </UFormField>
          <div class="flex gap-2 items-end">
            <UFormField label="Hak Akses" class="w-36">
              <USelect v-model="inviteRole" :items="roleOptions" value-key="value" class="w-full" />
            </UFormField>
            <UButton
              color="primary"
              :loading="inviting"
              :disabled="!inviteInput.trim()"
              @click="doInvite"
            >
              Kirim Undangan
            </UButton>
          </div>
        </div>
        <p class="text-xs text-stone-400 flex items-start gap-1">
          <UIcon name="i-heroicons-information-circle" class="h-3.5 w-3.5 mt-0.5 shrink-0" />
          Masukkan email atau User ID. Jika email belum terdaftar, undangan akan menunggu hingga pemilik email mendaftar.
        </p>
      </div>

      <!-- Members list -->
      <div class="card-emas ring-1 ring-amber-200/60 p-6 space-y-4">
        <h3 class="font-javanese font-semibold text-stone-700 dark:text-stone-300 text-sm flex items-center gap-2">
          <UIcon name="i-heroicons-users" class="h-4 w-4 text-amber-500" />
          Daftar Anggota
          <span class="ml-auto text-xs text-stone-400 font-normal">{{ members.length }} anggota</span>
        </h3>

        <div v-if="membersLoading" class="space-y-3">
          <USkeleton v-for="i in 3" :key="i" class="h-16 rounded-xl" />
        </div>

        <div v-else-if="members.length === 0" class="text-center py-8">
          <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
            <UIcon name="i-heroicons-users" class="w-6 h-6 text-amber-500" />
          </div>
          <p class="text-sm text-stone-500">Belum ada kolaborator lain.</p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="member in members"
            :key="member.id"
            class="flex items-center gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 ring-1 ring-stone-200/60 dark:ring-stone-700/40"
          >
            <UAvatar :alt="member.displayName" size="sm" class="shrink-0" />

            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-stone-800 dark:text-stone-100 truncate">
                {{ member.displayName }}
              </p>
              <p v-if="member.invitedEmail && !member.userId" class="text-xs text-stone-400 truncate">
                {{ member.invitedEmail }}
              </p>
              <p class="text-xs text-stone-400">
                <span v-if="member.acceptedAt" class="text-green-600 dark:text-green-400">● Aktif</span>
                <span v-else-if="!member.userId && member.invitedEmail" class="text-blue-500">📧 Menunggu pendaftaran</span>
                <span v-else class="text-amber-500">⏳ Menunggu konfirmasi</span>
                &middot; diundang {{ formatDateDMY(member.invitedAt) }}
              </p>
            </div>

            <!-- Role selector -->
            <USelect
              :model-value="member.role"
              :items="roleOptions"
              value-key="value"
              size="xs"
              class="w-28"
              :loading="updatingRoleId === member.id"
              @update:model-value="(val: string) => doUpdateRole(member.id, val)"
            />

            <!-- Kick button -->
            <UButton
              icon="i-heroicons-x-mark"
              size="xs"
              color="error"
              variant="ghost"
              :loading="kickingId === member.id"
              title="Keluarkan anggota"
              @click="confirmKick(member)"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- Kick confirmation modal -->
    <UModal v-model:open="showKickModal">
      <template #content>
        <div class="p-6 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <UIcon name="i-heroicons-user-minus" class="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 class="font-javanese font-semibold text-stone-800 dark:text-stone-100">Keluarkan Anggota?</h3>
              <p class="text-sm text-stone-500">
                {{ kickTarget?.displayName }} tidak akan bisa mengakses silsilah ini lagi.
              </p>
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="outline" @click="showKickModal = false">Batal</UButton>
            <UButton color="error" :loading="kickingId !== null" @click="doKick">Keluarkan</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { MemberRole, TreeMemberWithProfile } from '../../../composables/useTreeMembers'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const treeId = route.params.id as string

useHead({ title: 'Kelola Anggota — Trah' })

const session = useSupabaseSession()
const supabase = useSupabaseClient()
const toast = useToast()
const { members, loading: membersLoading, fetchMembers, inviteMember, updateMemberRole, removeMember, error: memberError } = useTreeMembers()
const { refresh: refreshInvitationCount } = useInvitationCount()

// Load tree info
const tree = ref<{ id: string, name: string, ownerId: string } | null>(null)
const treeLoading = ref(true)
const isOwner = computed(() => session.value?.user?.id === tree.value?.ownerId)

onMounted(async () => {
  const { data } = await supabase
    .from('trees')
    .select('id, name, owner_id')
    .eq('id', treeId)
    .single()

  if (data) {
    tree.value = { id: data.id, name: data.name, ownerId: data.owner_id }
    useHead({ title: `Kelola Anggota — ${data.name}` })
  }
  treeLoading.value = false
  await fetchMembers(treeId)
})

// Invite
const inviteInput = ref('')
const inviteRole = ref<'editor' | 'viewer'>('viewer')
const inviting = ref(false)
const inviteError = ref<string | null>(null)
const inviteSuccess = ref<string | null>(null)

const roleOptions = [
  { label: 'Editor', value: 'editor' },
  { label: 'Viewer', value: 'viewer' },
]

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function doInvite(): Promise<void> {
  inviteError.value = null
  inviteSuccess.value = null
  const input = inviteInput.value.trim()

  const isUUID = UUID_REGEX.test(input)
  const isEmail = EMAIL_REGEX.test(input)

  if (!isUUID && !isEmail) {
    inviteError.value = 'Masukkan email yang valid atau User ID (UUID) yang lengkap.'
    return
  }

  // Self-invite check
  if (isUUID && input === session.value?.user?.id) {
    inviteError.value = 'Tidak bisa mengundang diri sendiri.'
    return
  }
  if (isEmail && input.toLowerCase() === session.value?.user?.email?.toLowerCase()) {
    inviteError.value = 'Tidak bisa mengundang diri sendiri.'
    return
  }

  inviting.value = true
  try {
    let ok = false

    if (isUUID) {
      // UUID-based invite: check if user exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', input)
        .maybeSingle()

      if (!profile) {
        inviteError.value = 'User dengan ID tersebut tidak ditemukan.'
        return
      }

      ok = await inviteMember(treeId, input, inviteRole.value as MemberRole)
    }
    else {
      // Email-based invite: store email, user_id will be linked on login
      ok = await inviteMember(treeId, null, inviteRole.value as MemberRole, input.toLowerCase())
    }

    if (ok) {
      // Send invitation email for email-based invites
      if (isEmail && tree.value) {
        try {
          await supabase.functions.invoke('send-invite', {
            body: {
              email: input.toLowerCase(),
              treeName: tree.value.name,
              role: inviteRole.value,
            },
          })
        } catch (emailErr) {
          console.warn('Invitation email failed to send:', emailErr)
        }
      }

      inviteSuccess.value = isEmail
        ? `Undangan dikirim ke ${input}. ${!isUUID ? 'Jika belum terdaftar, undangan menunggu hingga mendaftar.' : ''}`
        : 'Undangan berhasil dikirim!'
      inviteInput.value = ''
      await fetchMembers(treeId)
      setTimeout(() => { inviteSuccess.value = null }, 6000)
    }
    else {
      const msg = memberError.value
      if (msg?.includes('duplicate') || msg?.includes('unique') || msg?.includes('idx_tree_members')) {
        inviteError.value = 'Email atau user ini sudah diundang atau sudah menjadi anggota.'
      }
      else {
        inviteError.value = msg ? `Gagal mengundang: ${msg}` : 'Gagal mengundang. Coba lagi.'
      }
    }
  }
  finally {
    inviting.value = false
  }
}

// Update role
const updatingRoleId = ref<string | null>(null)

async function doUpdateRole(memberId: string, role: string): Promise<void> {
  updatingRoleId.value = memberId
  const ok = await updateMemberRole(memberId, role as MemberRole)
  if (ok) {
    toast.add({ title: 'Hak akses diperbarui', color: 'success' })
    await fetchMembers(treeId)
  }
  else {
    toast.add({ title: 'Gagal memperbarui hak akses', color: 'error' })
  }
  updatingRoleId.value = null
}

// Kick
const kickingId = ref<string | null>(null)
const showKickModal = ref(false)
const kickTarget = ref<TreeMemberWithProfile | null>(null)

function confirmKick(member: TreeMemberWithProfile): void {
  kickTarget.value = member
  showKickModal.value = true
}

async function doKick(): Promise<void> {
  if (!kickTarget.value) return
  kickingId.value = kickTarget.value.id
  const ok = await removeMember(kickTarget.value.id)
  if (ok) {
    toast.add({ title: `${kickTarget.value.displayName} dikeluarkan`, color: 'neutral' })
    showKickModal.value = false
    kickTarget.value = null
    refreshInvitationCount()
    await fetchMembers(treeId)
  }
  else {
    toast.add({ title: 'Gagal mengeluarkan anggota', color: 'error' })
  }
  kickingId.value = null
}

</script>
