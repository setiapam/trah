import { z } from 'zod'

export const PersonSchema = z.object({
  id: z.string().uuid(),
  treeId: z.string().uuid(),
  gedcomId: z.string().nullable().optional(),
  firstName: z.string().min(1, 'Nama depan wajib diisi'),
  lastName: z.string().nullable().optional(),
  nickname: z.string().nullable().optional(),
  gender: z.enum(['M', 'F', 'U']).default('U'),
  birthDate: z.string().nullable().optional(),
  birthPlace: z.string().nullable().optional(),
  deathDate: z.string().nullable().optional(),
  deathPlace: z.string().nullable().optional(),
  isAlive: z.boolean().default(true),
  photoUrl: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email('Format email tidak valid').nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  linkedPersonId: z.string().uuid().nullable().optional(),
  linkedFromTreeId: z.string().uuid().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type Person = z.infer<typeof PersonSchema>

export const CreatePersonSchema = PersonSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export type CreatePersonInput = z.infer<typeof CreatePersonSchema>

export const UpdatePersonSchema = PersonSchema
  .partial()
  .omit({ id: true, treeId: true, createdAt: true, updatedAt: true })
export type UpdatePersonInput = z.infer<typeof UpdatePersonSchema>

// --- Helper functions ---

export function getFullName(p: Pick<Person, 'firstName' | 'lastName'>): string {
  return [p.firstName, p.lastName].filter(Boolean).join(' ')
}

export function getDisplayName(p: Pick<Person, 'firstName' | 'lastName' | 'nickname'>): string {
  return p.nickname ?? getFullName(p)
}

export function isDeceased(p: Pick<Person, 'isAlive' | 'deathDate'>): boolean {
  return !p.isAlive || p.deathDate != null
}

export function isLinkedPerson(p: Pick<Person, 'linkedPersonId'>): boolean {
  return p.linkedPersonId != null
}

export function getAge(p: Pick<Person, 'birthDate' | 'deathDate' | 'isAlive'>): number | null {
  if (!p.birthDate) return null
  const end = p.deathDate ? new Date(p.deathDate) : new Date()
  const birth = new Date(p.birthDate)
  const age = end.getFullYear() - birth.getFullYear()
  const m = end.getMonth() - birth.getMonth()
  return m < 0 || (m === 0 && end.getDate() < birth.getDate()) ? age - 1 : age
}
