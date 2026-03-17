import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl as string,
    config.public.supabaseKey as string
  )

  try {
    // Coba query sederhana untuk verifikasi koneksi
    const { error } = await supabase.from('profiles').select('count').limit(1)

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows, masih OK
      return {
        status: 'error',
        message: error.message,
        code: error.code,
      }
    }

    return {
      status: 'ok',
      supabaseUrl: config.public.supabaseUrl,
      timestamp: new Date().toISOString(),
    }
  } catch (err: unknown) {
    return {
      status: 'error',
      message: err instanceof Error ? err.message : 'Unknown error',
    }
  }
})
