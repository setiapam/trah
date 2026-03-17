import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env untuk tests yang membutuhkan Supabase credentials
config({ path: resolve(process.cwd(), '.env') })
