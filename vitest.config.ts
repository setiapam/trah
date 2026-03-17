import { defineVitestConfig } from '@nuxt/test-utils/config'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env sebelum apapun diinisialisasi, termasuk Nuxt modules di worker
config({ path: resolve(process.cwd(), '.env') })

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
    exclude: ['tests/e2e/**', 'node_modules', '.nuxt'],
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['node_modules', '.nuxt', 'tests'],
    },
  },
})
