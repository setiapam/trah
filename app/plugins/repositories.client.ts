import { SupabasePersonRepository } from '../../infrastructure/repositories/SupabasePersonRepository'
import { SupabaseTreeRepository } from '../../infrastructure/repositories/SupabaseTreeRepository'
import { SupabaseRelationshipRepository } from '../../infrastructure/repositories/SupabaseRelationshipRepository'
import { SupabaseMediaRepository } from '../../infrastructure/repositories/SupabaseMediaRepository'
import { SupabaseTreeMemberRepository } from '../../infrastructure/repositories/SupabaseTreeMemberRepository'

export default defineNuxtPlugin(() => {
  const supabase = useSupabaseClient()

  return {
    provide: {
      repos: {
        person: new SupabasePersonRepository(supabase),
        tree: new SupabaseTreeRepository(supabase),
        relationship: new SupabaseRelationshipRepository(supabase),
        media: new SupabaseMediaRepository(supabase),
        treeMember: new SupabaseTreeMemberRepository(supabase),
      },
    },
  }
})
