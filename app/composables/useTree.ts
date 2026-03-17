import type { Tree, CreateTreeInput, UpdateTreeInput } from '../../domain/entities/tree'
import { getErrorMessage } from '../utils/errorMessage'

export function useTree() {
  const nuxtApp = useNuxtApp()
  const session = useSupabaseSession()

  // Lazy getter — hindari capture undefined saat SSR
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getRepos(): any {
    return (nuxtApp as Record<string, unknown>).$repos
  }

  const trees = ref<Tree[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTrees() {
    const userId = session.value?.user?.id
    if (!userId) return
    loading.value = true
    error.value = null
    try {
      const repos = getRepos()
      const [owned, shared] = await Promise.all([
        repos.tree.getByOwner(userId),
        repos.tree.getAccessible(userId),
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
      error.value = getErrorMessage(e, 'Gagal memuat daftar trah')
    }
    finally {
      loading.value = false
    }
  }

  async function createTree(input: CreateTreeInput): Promise<Tree | null> {
    loading.value = true
    error.value = null
    try {
      const tree = await getRepos().tree.create(input)
      trees.value.unshift(tree)
      return tree
    }
    catch (e: unknown) {
      error.value = getErrorMessage(e, 'Gagal membuat trah')
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
      const updated = await getRepos().tree.update(id, input)
      const idx = trees.value.findIndex(t => t.id === id)
      if (idx !== -1) trees.value[idx] = updated
      return true
    }
    catch (e: unknown) {
      error.value = getErrorMessage(e, 'Gagal memperbarui trah')
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
      await getRepos().tree.delete(id)
      trees.value = trees.value.filter(t => t.id !== id)
      return true
    }
    catch (e: unknown) {
      error.value = getErrorMessage(e, 'Gagal menghapus trah')
      return false
    }
    finally {
      loading.value = false
    }
  }

  return { trees, loading, error, fetchTrees, createTree, updateTree, deleteTree }
}
