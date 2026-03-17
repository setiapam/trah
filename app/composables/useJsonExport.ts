import { TrahJsonService } from '../../infrastructure/parsers/json/TrahJsonService'
import type { CreateRelationshipInput } from '../../domain/entities/relationship'

export function useJsonExport() {
  const nuxtApp = useNuxtApp()
  const session = useSupabaseSession()
  const { createTree } = useTree()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getRepos(): any {
    return (nuxtApp as Record<string, unknown>).$repos
  }

  const importing = ref(false)
  const exporting = ref(false)
  const importError = ref<string | null>(null)

  /**
   * Export a tree as a Trah JSON file and trigger browser download.
   */
  async function exportJson(treeId: string, treeName: string): Promise<void> {
    exporting.value = true

    try {
      const repos = getRepos()
      const [persons, relationships] = await Promise.all([
        repos.person.getByTree(treeId),
        repos.relationship.getByTree(treeId),
      ])

      const service = new TrahJsonService()
      const jsonString = service.export(persons, relationships, treeName)

      // Trigger browser download
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${treeName}.trah.json`
      anchor.style.display = 'none'
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)
    }
    catch (e: unknown) {
      console.error('Gagal mengekspor JSON:', e)
    }
    finally {
      exporting.value = false
    }
  }

  /**
   * Import a Trah JSON file: parse → create tree + persons + relationships in Supabase.
   */
  async function importJson(
    file: File,
    treeNameOverride?: string,
  ): Promise<{ treeId: string; personCount: number; warnings: string[] } | null> {
    const userId = session.value?.user?.id
    if (!userId) {
      importError.value = 'Anda harus login untuk mengimpor data'
      return null
    }

    importing.value = true
    importError.value = null

    try {
      // Read file content
      const content = await file.text()

      // Parse and validate JSON
      const service = new TrahJsonService()
      const result = service.import(content)

      // Determine tree name
      const filename = file.name.replace(/\.trah\.json$/i, '').replace(/\.json$/i, '')
      const name = treeNameOverride?.trim() || result.treeName || filename || 'Silsilah Impor'

      // Create tree
      const tree = await createTree({
        ownerId: userId,
        name,
        description: `Diimpor dari ${file.name}`,
      })

      if (!tree) {
        importError.value = 'Gagal membuat trah baru'
        return null
      }

      // Insert persons one by one, build index → DB id map
      const indexToDbId = new Map<number, string>()
      const repos = getRepos()

      for (let i = 0; i < result.persons.length; i++) {
        const input = { ...result.persons[i]!, treeId: tree.id }
        try {
          const person = await repos.person.create(input)
          if (person) {
            indexToDbId.set(i, person.id)
          }
        }
        catch {
          result.warnings.push(`Gagal menyimpan anggota ke-${i + 1}: ${result.persons[i]!.firstName}`)
        }
      }

      // Insert relationships using the index → DB id map
      for (let i = 0; i < result.relationships.length; i++) {
        const rel = result.relationships[i]!
        const personId = indexToDbId.get(rel.personIndex)
        const relatedPersonId = indexToDbId.get(rel.relatedPersonIndex)

        if (!personId) {
          result.warnings.push(`Relasi #${i + 1}: anggota ke-${rel.personIndex + 1} tidak tersedia di database`)
          continue
        }
        if (!relatedPersonId) {
          result.warnings.push(`Relasi #${i + 1}: anggota ke-${rel.relatedPersonIndex + 1} tidak tersedia di database`)
          continue
        }

        const input: CreateRelationshipInput = {
          treeId: tree.id,
          personId,
          relatedPersonId,
          relationshipType: rel.relationshipType,
          marriageDate: rel.marriageDate ?? undefined,
          divorceDate: rel.divorceDate ?? undefined,
        }

        try {
          await repos.relationship.create(input)
        }
        catch {
          result.warnings.push(`Gagal membuat relasi anggota ke-${rel.personIndex + 1} → ke-${rel.relatedPersonIndex + 1}`)
        }
      }

      // Set rootPersonId: find person without a parent (root ancestor)
      const childIndices = new Set(
        result.relationships
          .filter(r => r.relationshipType === 'parent')
          .map(r => r.relatedPersonIndex),
      )
      const rootIndex = Array.from({ length: result.persons.length }, (_, i) => i)
        .find(i => !childIndices.has(i))
        ?? 0
      const rootDbId = indexToDbId.get(rootIndex)
      if (rootDbId) {
        try {
          await repos.tree.update(tree.id, { rootPersonId: rootDbId })
        }
        catch { /* non-fatal */ }
      }

      return {
        treeId: tree.id,
        personCount: indexToDbId.size,
        warnings: result.warnings,
      }
    }
    catch (e: unknown) {
      importError.value = e instanceof Error ? e.message : 'Gagal mengimpor file JSON'
      return null
    }
    finally {
      importing.value = false
    }
  }

  return { importing, exporting, importError, exportJson, importJson }
}
