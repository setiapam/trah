import type { Relationship, CreateRelationshipInput, UpdateRelationshipInput } from '../entities/relationship'

export interface IRelationshipRepository {
  getByTree(treeId: string): Promise<Relationship[]>
  getByPerson(personId: string): Promise<Relationship[]>
  getById(id: string): Promise<Relationship | null>
  create(rel: CreateRelationshipInput): Promise<Relationship>
  update(id: string, data: UpdateRelationshipInput): Promise<Relationship>
  delete(id: string): Promise<void>
  bulkInsert(rels: CreateRelationshipInput[]): Promise<Relationship[]>
  reorderChildren(parentId: string, childRelationshipIds: string[]): Promise<void>
}
