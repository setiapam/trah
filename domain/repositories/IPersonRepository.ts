import type { Person, CreatePersonInput, UpdatePersonInput } from '../entities/person'

export interface IPersonRepository {
  getByTree(treeId: string): Promise<Person[]>
  getById(id: string): Promise<Person | null>
  create(person: CreatePersonInput): Promise<Person>
  update(id: string, data: UpdatePersonInput): Promise<Person>
  delete(id: string): Promise<void>
  bulkInsert(persons: CreatePersonInput[]): Promise<Person[]>
  search(treeId: string, query: string): Promise<Person[]>
  searchAcrossTrees(query: string, excludeTreeId?: string): Promise<(Person & { treeName: string })[]>
  createLinkedCopy(sourcePersonId: string, targetTreeId: string): Promise<Person>
  createLinkedCopyWithDescendants(
    sourcePersonId: string,
    targetTreeId: string,
    sourceTreeRelationships: { personId: string; relatedPersonId: string; relationshipType: string; marriageDate?: string | null; divorceDate?: string | null }[],
  ): Promise<{ copiedPersons: Person[]; idMap: Map<string, string> }>
}
