import type { Media, UploadMediaInput } from '../entities/media'

export interface IMediaRepository {
  getByPerson(personId: string): Promise<Media[]>
  getById(id: string): Promise<Media | null>
  upload(input: UploadMediaInput, file: File): Promise<Media>
  delete(id: string): Promise<void>
}
