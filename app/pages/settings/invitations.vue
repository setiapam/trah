<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center gap-3 mb-2">
      <UButton to="/settings" variant="ghost" color="neutral" size="sm" icon="i-heroicons-arrow-left">
        Pengaturan
      </UButton>
    </div>

    <div>
      <p class="trah-ornament mb-1">Kolaborasi</p>
      <h1 class="trah-title font-javanese text-2xl font-bold text-stone-800">Undangan Masuk</h1>
    </div>

    <!-- My User ID (untuk di-share) -->
    <div class="card-emas bg-white rounded-xl p-5 ring-1 ring-amber-200/60 space-y-2">
      <p class="text-sm font-medium text-stone-700 font-javanese">User ID Saya</p>
      <p class="text-xs text-stone-500 mb-2">
        Bagikan ID ini ke orang yang ingin mengundang Anda ke silsilah mereka.
      </p>
      <div class="flex items-center gap-2">
        <code class="flex-1 bg-stone-100 rounded-lg px-3 py-2 text-xs font-mono text-stone-700 truncate">
          {{ session?.user?.id ?? '-' }}
        </code>
        <UButton icon="i-heroicons-clipboard" size="xs" color="neutral" variant="outline" @click="copyId">
          Salin
        </UButton>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <USkeleton v-for="i in 2" :key="i" class="h-20 rounded-xl" />
    </div>

    <!-- Empty -->
    <div v-else-if="invitations.length === 0" class="text-center py-12">
      <div class="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
        <UIcon name="i-heroicons-envelope" class="w-7 h-7 text-amber-600" />
      </div>
      <p class="font-javanese text-stone-600">Tidak ada undangan</p>
      <p class="text-sm text-stone-400 mt-1">Anda belum mendapatkan undangan untuk berkolaborasi.</p>
    </div>

    <!-- Invitations list -->
    <div v-else class="space-y-3">
      <div
        v-for="inv in invitations"
        :key="inv.id"
        class="card-emas bg-white rounded-xl p-5 ring-1 ring-amber-200/60 flex items-center gap-4"
      >
        <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <UIcon name="i-heroicons-user-group" class="w-5 h-5 text-amber-600" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-javanese font-semibold text-stone-800 truncate">{{ inv.treeName }}</p>
          <p class="text-xs text-stone-500 mt-0.5">
            Sebagai
            <UBadge
              :color="inv.role === 'editor' ? 'success' : 'neutral'"
              variant="soft"
              size="xs"
            >{{ inv.role }}</UBadge>
            · {{ formatDate(inv.invitedAt) }}
          </p>
        </div>
        <div class="flex gap-2 flex-shrink-0">
          <UButton
            size="sm"
            color="neutral"
            variant="outline"
            :loading="decliningId === inv.id"
            @click="doDecline(inv.id)"
          >
            Tolak
          </UButton>
          <UButton
            size="sm"
            :loading="acceptingId === inv.id"
            @click="doAccept(inv.id)"
          >
            Terima
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PendingInvitation } from '../../composables/useTreeMembers'

definePageMeta({ middleware: 'auth', layout: 'default' })
useHead({ title: 'Undangan Masuk — Trah' })

const session = useSupabaseSession()
const toast = useToast()
const { fetchMyInvitations, acceptInvitation, declineInvitation } = useTreeMembers()

const loading = ref(false)
const invitations = ref<PendingInvitation[]>([])
const acceptingId = ref<string | null>(null)
const decliningId = ref<string | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    invitations.value = await fetchMyInvitations()
  }
  finally {
    loading.value = false
  }
})

async function doAccept(id: string): Promise<void> {
  acceptingId.value = id
  try {
    const ok = await acceptInvitation(id)
    if (ok) {
      invitations.value = invitations.value.filter(i => i.id !== id)
      toast.add({ title: 'Undangan diterima', color: 'success' })
    }
    else {
      toast.add({ title: 'Gagal menerima undangan', color: 'error' })
    }
  }
  finally {
    acceptingId.value = null
  }
}

async function doDecline(id: string): Promise<void> {
  decliningId.value = id
  try {
    const ok = await declineInvitation(id)
    if (ok) {
      invitations.value = invitations.value.filter(i => i.id !== id)
      toast.add({ title: 'Undangan ditolak', color: 'neutral' })
    }
    else {
      toast.add({ title: 'Gagal menolak undangan', color: 'error' })
    }
  }
  finally {
    decliningId.value = null
  }
}

function copyId(): void {
  navigator.clipboard.writeText(session.value?.user?.id ?? '').then(() => {
    toast.add({ title: 'User ID disalin', color: 'success' })
  }).catch(() => {
    toast.add({ title: 'Gagal menyalin', color: 'error' })
  })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>
