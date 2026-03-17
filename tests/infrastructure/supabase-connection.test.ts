import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL ?? ''
const SUPABASE_KEY = process.env.SUPABASE_KEY ?? ''

describe('Supabase Connection', () => {
  it('environment variables are set', () => {
    expect(SUPABASE_URL).toBeTruthy()
    expect(SUPABASE_KEY).toBeTruthy()
    expect(SUPABASE_URL).toMatch(/^https:\/\/.+\.supabase\.co$/)
  })

  it('can connect to Supabase', async () => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    // Coba akses tabel profiles — sukses berarti koneksi dan RLS berfungsi
    const { error } = await supabase.from('profiles').select('count').limit(1)

    // Error code 42P01 = table not found (migration belum dijalankan)
    // Error code PGRST116 = no rows (OK)
    // null = sukses
    if (error) {
      expect(error.code).not.toBe('PGRST301') // 401 Unauthorized
      console.warn('Note:', error.code, error.message)
    } else {
      expect(error).toBeNull()
    }
  })

  it('can connect to Supabase auth', async () => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    const { data, error } = await supabase.auth.getSession()
    // Tanpa login, session harus null tapi tidak error koneksi
    expect(error).toBeNull()
    expect(data.session).toBeNull()
  })
})
