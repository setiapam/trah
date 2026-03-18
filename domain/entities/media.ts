import { z } from 'zod'

export const MediaSchema = z.object({
  id: z.string().uuid(),
  personId: z.string().uuid(),
  treeId: z.string().uuid(),
  fileUrl: z.string().min(1, 'URL file wajib diisi'),
  fileType: z.string().min(1, 'Tipe file wajib diisi'),
  caption: z.string().nullable().optional(),
  createdAt: z.string().optional(),
})

export type Media = z.infer<typeof MediaSchema>

export const CreateMediaSchema = MediaSchema.omit({
  id: true,
  createdAt: true,
})
export type CreateMediaInput = z.infer<typeof CreateMediaSchema>

export const UploadMediaSchema = z.object({
  personId: z.string().uuid(),
  treeId: z.string().uuid(),
  caption: z.string().nullable().optional(),
})
export type UploadMediaInput = z.infer<typeof UploadMediaSchema>

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export function isImage(fileType: string): boolean {
  return (IMAGE_TYPES as readonly string[]).includes(fileType)
}
