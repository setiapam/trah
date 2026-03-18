import type { SupabaseClient } from '@supabase/supabase-js'
import type { IMediaRepository } from '../../domain/repositories/IMediaRepository'
import type { Media, UploadMediaInput } from '../../domain/entities/media'
import { mediaFromDB, mediaToInsert } from './mappers'

const STORAGE_BUCKET = 'media'

export class SupabaseMediaRepository implements IMediaRepository {
  constructor(private client: SupabaseClient) {}

  async getByPerson(personId: string): Promise<Media[]> {
    const { data, error } = await this.client
      .from('media')
      .select('*')
      .eq('person_id', personId)
      .order('created_at')
    if (error) throw error
    return (data ?? []).map(mediaFromDB)
  }

  async getById(id: string): Promise<Media | null> {
    const { data, error } = await this.client
      .from('media')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? mediaFromDB(data) : null
  }

  async upload(input: UploadMediaInput, file: File): Promise<Media> {
    // 1. Upload ke Supabase Storage
    const ext = file.name.split('.').pop() ?? 'bin'
    const path = `${input.treeId}/${input.personId}/${Date.now()}.${ext}`

    const { error: uploadError } = await this.client.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false })
    if (uploadError) throw uploadError

    // 2. Ambil public URL
    const { data: urlData } = this.client.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path)

    // 3. Simpan record ke DB
    const { data, error } = await this.client
      .from('media')
      .insert(mediaToInsert({
        personId: input.personId,
        treeId: input.treeId,
        fileUrl: urlData.publicUrl,
        fileType: file.type,
        caption: input.caption ?? null,
      }))
      .select()
      .single()
    if (error) throw error
    return mediaFromDB(data)
  }

  async delete(id: string): Promise<void> {
    // Ambil file_url dulu untuk hapus dari storage
    const media = await this.getById(id)
    if (!media) return

    // Extract storage path dari URL
    const url = new URL(media.fileUrl)
    const storagePath = url.pathname.split(`/${STORAGE_BUCKET}/`)[1]
    if (storagePath) {
      await this.client.storage.from(STORAGE_BUCKET).remove([storagePath])
    }

    const { error } = await this.client.from('media').delete().eq('id', id)
    if (error) throw error
  }
}
