import { GedcomParser } from '../../infrastructure/parsers/gedcom/GedcomParser'
import { GedcomSerializer } from '../../infrastructure/parsers/gedcom/GedcomSerializer'
import type { CreatePersonInput } from '../../domain/entities/person'
import type { CreateRelationshipInput } from '../../domain/entities/relationship'

export function useGedcom() {
  const { createTree } = useTree()
  const nuxtApp = useNuxtApp()
  const session = useSupabaseSession()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getRepos(): any {
    return (nuxtApp as Record<string, unknown>).$repos
  }

  const importing = ref(false)
  const exporting = ref(false)
  const importError = ref<string | null>(null)

  /**
   * Import a GEDCOM file: parse → create tree + persons + relationships in Supabase.
   */
  async function importGedcom(
    file: File,
    treeName?: string,
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

      // Parse GEDCOM
      const parser = new GedcomParser()
      const result = parser.parse(content)

      // Determine tree name
      const filename = file.name.replace(/\.(ged|gedcom)$/i, '')
      const name = treeName?.trim() || filename || 'Silsilah Impor'

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

      // Create persons in batches of 100, build gedcomId → supabase id map
      const gedcomToDbId = new Map<string, string>()
      const BATCH_SIZE = 100

      for (let i = 0; i < result.persons.length; i += BATCH_SIZE) {
        const batch = result.persons.slice(i, i + BATCH_SIZE)
        const inputs: CreatePersonInput[] = batch.map(p => ({
          treeId: tree.id,
          gedcomId: p.gedcomId,
          firstName: p.firstName,
          lastName: p.lastName,
          gender: p.gender,
          birthDate: p.birthDate,
          birthPlace: p.birthPlace,
          deathDate: p.deathDate,
          deathPlace: p.deathPlace,
          isAlive: p.isAlive,
          notes: p.notes,
        }))

        // Use bulkInsert if available, otherwise create one by one
        const repos = getRepos()
        if (typeof repos.person.bulkInsert === 'function') {
          const created = await repos.person.bulkInsert(inputs)
          for (let j = 0; j < created.length; j++) {
            const originalGedcomId = batch[j]?.gedcomId
            if (originalGedcomId) {
              gedcomToDbId.set(originalGedcomId, created[j].id)
            }
          }
        }
        else {
          for (const input of inputs) {
            const person = await repos.person.create(input)
            if (person && input.gedcomId) {
              gedcomToDbId.set(input.gedcomId, person.id)
            }
          }
        }
      }

      // Create relationships
      const warnings = [...result.warnings]

      for (let i = 0; i < result.relationships.length; i += BATCH_SIZE) {
        const batch = result.relationships.slice(i, i + BATCH_SIZE)
        for (const rel of batch) {
          const personId = gedcomToDbId.get(rel.personGedcomId)
          const relatedPersonId = gedcomToDbId.get(rel.relatedPersonGedcomId)

          if (!personId) {
            warnings.push(`ID tidak ditemukan dalam database: ${rel.personGedcomId}`)
            continue
          }
          if (!relatedPersonId) {
            warnings.push(`ID tidak ditemukan dalam database: ${rel.relatedPersonGedcomId}`)
            continue
          }

          const input: CreateRelationshipInput = {
            treeId: tree.id,
            personId,
            relatedPersonId,
            relationshipType: rel.type,
            marriageDate: rel.marriageDate,
          }

          try {
            await getRepos().relationship.create(input)
          }
          catch {
            warnings.push(`Gagal membuat relasi: ${rel.personGedcomId} → ${rel.relatedPersonGedcomId}`)
          }
        }
      }

      // Set rootPersonId: cari person yang tidak punya orang tua (root ancestor)
      // Fallback ke person pertama yang diimport
      const importedPersonGedcomIds = result.persons.map(p => p.gedcomId)
      const childGedcomIds = new Set(
        result.relationships
          .filter(r => r.type === 'parent')
          .map(r => r.relatedPersonGedcomId),
      )
      const rootGedcomId = importedPersonGedcomIds.find(id => !childGedcomIds.has(id))
        ?? importedPersonGedcomIds[0]
      if (rootGedcomId) {
        const rootDbId = gedcomToDbId.get(rootGedcomId)
        if (rootDbId) {
          try {
            await getRepos().tree.update(tree.id, { rootPersonId: rootDbId })
          }
          catch { /* non-fatal */ }
        }
      }

      return {
        treeId: tree.id,
        personCount: gedcomToDbId.size,
        warnings,
      }
    }
    catch (e: unknown) {
      importError.value = e instanceof Error ? e.message : 'Gagal mengimpor file GEDCOM'
      return null
    }
    finally {
      importing.value = false
    }
  }

  /**
   * Export tree data as a GEDCOM file and trigger browser download.
   */
  async function exportGedcom(treeId: string, treeName: string): Promise<void> {
    exporting.value = true

    try {
      const repos = getRepos()
      const [persons, relationships] = await Promise.all([
        repos.person.getByTree(treeId),
        repos.relationship.getByTree(treeId),
      ])

      const serializer = new GedcomSerializer()
      const gedcomString = serializer.serialize(persons, relationships, treeName)

      // Trigger download
      const blob = new Blob([gedcomString], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${treeName}.ged`
      anchor.style.display = 'none'
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)
    }
    catch (e: unknown) {
      console.error('Gagal mengekspor GEDCOM:', e)
    }
    finally {
      exporting.value = false
    }
  }

  return { importing, exporting, importError, importGedcom, exportGedcom }
}
