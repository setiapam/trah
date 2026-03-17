import { z } from 'zod'

export const TreeSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  name: z.string().min(1, 'Nama trah wajib diisi').max(100, 'Nama trah maksimal 100 karakter'),
  description: z.string().nullable().optional(),
  rootPersonId: z.string().uuid().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type Tree = z.infer<typeof TreeSchema>

export const CreateTreeSchema = TreeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export type CreateTreeInput = z.infer<typeof CreateTreeSchema>

export const UpdateTreeSchema = TreeSchema
  .partial()
  .omit({ id: true, ownerId: true, createdAt: true, updatedAt: true })
export type UpdateTreeInput = z.infer<typeof UpdateTreeSchema>
