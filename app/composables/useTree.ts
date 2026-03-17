import type { Tree, CreateTreeInput, UpdateTreeInput } from '../../domain/entities/tree'

export function useTree() {
  const nuxtApp = useNuxtApp()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const repos = nuxtApp.$repos as any
  const user = useSupabaseUser()

  const trees = ref<Tree[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTrees() {
    if (!user.value) return
    loading.value = true
    error.value = null
    try {
      const [owned, shared] = await Promise.all([
        repos.tree.getByOwner(user.value.id),
        repos.tree.getAccessible(user.value.id),
      ])
      const all = [...owned, ...shared]
      const seen = new Set<string>()
      trees.value = all.filter((t: Tree) => {
        if (seen.has(t.id)) return false
        seen.add(t.id)
        return true
      })
    }
    catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Gagal memuat daftar trah'
    }
    finally {
      loading.value = false
    }
  }

  async function createTree(input: CreateTreeInput): Promise<Tree | null> {
    loading.value = true
    error.value = null
    try {
      const tree = await repos.tree.create(input)
      trees.value.unshift(tree)
      return tree
    }
    catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Gagal membuat trah'
      return null
    }
    finally {
      loading.value = false
    }
  }

  async function updateTree(id: string, input: UpdateTreeInput): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const updated = await repos.tree.update(id, input)
      const idx = trees.value.findIndex(t => t.id === id)
      if (idx !== -1) trees.value[idx] = updated
      return true
    }
    catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Gagal memperbarui trah'
      return false
    }
    finally {
      loading.value = false
    }
  }

  async function deleteTree(id: string): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      await repos.tree.delete(id)
      trees.value = trees.value.filter(t => t.id !== id)
      return true
    }
    catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Gagal menghapus trah'
      return false
    }
    finally {
      loading.value = false
    }
  }

  return { trees, loading, error, fetchTrees, createTree, updateTree, deleteTree }
}
