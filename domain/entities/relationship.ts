import { z } from 'zod'

export const RelationshipTypeSchema = z.enum(['parent', 'spouse'])
export type RelationshipType = z.infer<typeof RelationshipTypeSchema>

export const RelationshipSchema = z.object({
  id: z.string().uuid(),
  treeId: z.string().uuid(),
  personId: z.string().uuid(),
  relatedPersonId: z.string().uuid(),
  relationshipType: RelationshipTypeSchema,
  marriageDate: z.string().nullable().optional(),
  divorceDate: z.string().nullable().optional(),
  sortOrder: z.number().default(0),
  createdAt: z.string().optional(),
})

export type Relationship = z.infer<typeof RelationshipSchema>

export const CreateRelationshipSchema = RelationshipSchema.omit({
  id: true,
  createdAt: true,
})
export type CreateRelationshipInput = z.infer<typeof CreateRelationshipSchema>

export const UpdateRelationshipSchema = RelationshipSchema
  .partial()
  .omit({ id: true, treeId: true, personId: true, relatedPersonId: true, createdAt: true })
export type UpdateRelationshipInput = z.infer<typeof UpdateRelationshipSchema>
