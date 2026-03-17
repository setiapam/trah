import type { Person, CreatePersonInput, UpdatePersonInput } from '../entities/person'

export interface IPersonRepository {
  getByTree(treeId: string): Promise<Person[]>
  getById(id: string): Promise<Person | null>
  create(person: CreatePersonInput): Promise<Person>
  update(id: string, data: UpdatePersonInput): Promise<Person>
  delete(id: string): Promise<void>
  bulkInsert(persons: CreatePersonInput[]): Promise<Person[]>
  search(treeId: string, query: string): Promise<Person[]>
}
