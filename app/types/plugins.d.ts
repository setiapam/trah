import type { SupabasePersonRepository } from '../../infrastructure/repositories/SupabasePersonRepository'
import type { SupabaseTreeRepository } from '../../infrastructure/repositories/SupabaseTreeRepository'
import type { SupabaseRelationshipRepository } from '../../infrastructure/repositories/SupabaseRelationshipRepository'
import type { SupabaseMediaRepository } from '../../infrastructure/repositories/SupabaseMediaRepository'
import type { SupabaseTreeMemberRepository } from '../../infrastructure/repositories/SupabaseTreeMemberRepository'

declare module '#app' {
  interface NuxtApp {
    $repos: {
      person: SupabasePersonRepository
      tree: SupabaseTreeRepository
      relationship: SupabaseRelationshipRepository
      media: SupabaseMediaRepository
      treeMember: SupabaseTreeMemberRepository
    }
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $repos: {
      person: SupabasePersonRepository
      tree: SupabaseTreeRepository
      relationship: SupabaseRelationshipRepository
      media: SupabaseMediaRepository
      treeMember: SupabaseTreeMemberRepository
    }
  }
}

export {}
