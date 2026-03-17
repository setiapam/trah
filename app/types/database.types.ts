// Auto-generated types dari Supabase schema
// Jalankan: npx supabase gen types typescript --project-id <id> > app/types/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_url?: string | null
          updated_at?: string
        }
      }
      trees: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          root_person_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          root_person_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          root_person_id?: string | null
          updated_at?: string
        }
      }
      persons: {
        Row: {
          id: string
          tree_id: string
          gedcom_id: string | null
          first_name: string
          last_name: string | null
          nickname: string | null
          gender: 'M' | 'F' | 'U'
          birth_date: string | null
          birth_place: string | null
          death_date: string | null
          death_place: string | null
          is_alive: boolean
          photo_url: string | null
          phone: string | null
          email: string | null
          address: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tree_id: string
          gedcom_id?: string | null
          first_name: string
          last_name?: string | null
          nickname?: string | null
          gender?: 'M' | 'F' | 'U'
          birth_date?: string | null
          birth_place?: string | null
          death_date?: string | null
          death_place?: string | null
          is_alive?: boolean
          photo_url?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tree_id?: string
          gedcom_id?: string | null
          first_name?: string
          last_name?: string | null
          nickname?: string | null
          gender?: 'M' | 'F' | 'U'
          birth_date?: string | null
          birth_place?: string | null
          death_date?: string | null
          death_place?: string | null
          is_alive?: boolean
          photo_url?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      relationships: {
        Row: {
          id: string
          tree_id: string
          person_id: string
          related_person_id: string
          relationship_type: 'parent' | 'spouse'
          marriage_date: string | null
          divorce_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tree_id: string
          person_id: string
          related_person_id: string
          relationship_type: 'parent' | 'spouse'
          marriage_date?: string | null
          divorce_date?: string | null
          created_at?: string
        }
        Update: {
          relationship_type?: 'parent' | 'spouse'
          marriage_date?: string | null
          divorce_date?: string | null
        }
      }
      tree_members: {
        Row: {
          id: string
          tree_id: string
          user_id: string
          role: 'owner' | 'editor' | 'viewer'
          invited_at: string
          accepted_at: string | null
        }
        Insert: {
          id?: string
          tree_id: string
          user_id: string
          role: 'owner' | 'editor' | 'viewer'
          invited_at?: string
          accepted_at?: string | null
        }
        Update: {
          role?: 'owner' | 'editor' | 'viewer'
          accepted_at?: string | null
        }
      }
      media: {
        Row: {
          id: string
          person_id: string
          tree_id: string
          file_url: string
          file_type: string
          caption: string | null
          created_at: string
        }
        Insert: {
          id?: string
          person_id: string
          tree_id: string
          file_url: string
          file_type: string
          caption?: string | null
          created_at?: string
        }
        Update: {
          file_url?: string
          file_type?: string
          caption?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      has_tree_access: {
        Args: { p_tree_id: string; min_role?: string }
        Returns: boolean
      }
    }
    Enums: Record<string, never>
  }
}
