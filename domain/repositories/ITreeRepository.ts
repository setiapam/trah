import type { Tree, CreateTreeInput, UpdateTreeInput } from '../entities/tree'

export interface ITreeRepository {
  getByOwner(ownerId: string): Promise<Tree[]>
  getAccessible(userId: string): Promise<Tree[]>
  getById(id: string): Promise<Tree | null>
  create(tree: CreateTreeInput): Promise<Tree>
  update(id: string, data: UpdateTreeInput): Promise<Tree>
  delete(id: string): Promise<void>
}
