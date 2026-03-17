import { z } from 'zod'

export const TrahPersonSchema = z.object({
  gedcomId: z.string().nullable().optional(),
  firstName: z.string().min(1),
  lastName: z.string().nullable().optional(),
  nickname: z.string().nullable().optional(),
  gender: z.enum(['M', 'F', 'U']),
  birthDate: z.string().nullable().optional(),
  birthPlace: z.string().nullable().optional(),
  deathDate: z.string().nullable().optional(),
  deathPlace: z.string().nullable().optional(),
  isAlive: z.boolean(),
  photoUrl: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export const TrahRelationshipSchema = z.object({
  personIndex: z.number().int().nonnegative(),
  relatedPersonIndex: z.number().int().nonnegative(),
  relationshipType: z.enum(['parent', 'spouse']),
  marriageDate: z.string().nullable().optional(),
  divorceDate: z.string().nullable().optional(),
})

export const TrahJsonSchema = z.object({
  version: z.literal('1.0'),
  exportedAt: z.string(),
  treeName: z.string(),
  persons: z.array(TrahPersonSchema),
  relationships: z.array(TrahRelationshipSchema),
})

export type TrahJson = z.infer<typeof TrahJsonSchema>
export type TrahPersonJson = z.infer<typeof TrahPersonSchema>
export type TrahRelationshipJson = z.infer<typeof TrahRelationshipSchema>
