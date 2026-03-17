import type { Media, CreateMediaInput } from '../entities/media'

export interface IMediaRepository {
  getByPerson(personId: string): Promise<Media[]>
  getById(id: string): Promise<Media | null>
  upload(input: CreateMediaInput, file: File): Promise<Media>
  delete(id: string): Promise<void>
}
