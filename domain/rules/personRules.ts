import type { Person } from '../entities/person'

export type RuleResult = { valid: true } | { valid: false; error: string }

/**
 * Tanggal wafat harus setelah tanggal lahir.
 */
export function validatePersonDates(
  birthDate?: string | null,
  deathDate?: string | null
): RuleResult {
  if (birthDate && deathDate) {
    if (deathDate < birthDate) {
      return { valid: false, error: 'Tanggal wafat tidak boleh sebelum tanggal lahir' }
    }
  }
  return { valid: true }
}

/**
 * Jika status wafat, tanggal wafat sebaiknya diisi (soft warning).
 */
export function warnMissingDeathDate(
  isAlive: boolean,
  deathDate?: string | null
): string | null {
  if (!isAlive && !deathDate) {
    return 'Anggota ditandai wafat namun tanggal wafat belum diisi'
  }
  return null
}

/**
 * Validasi format tanggal ISO (YYYY-MM-DD).
 */
export function isValidISODate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  const d = new Date(date)
  if (isNaN(d.getTime())) return false
  // Pastikan tanggal tidak roll-over (mis. Feb 30 → Mar 1)
  const [y, m, day] = date.split('-').map(Number)
  return d.getUTCFullYear() === y && d.getUTCMonth() + 1 === m && d.getUTCDate() === day
}

/**
 * Validasi lengkap person sebelum disimpan.
 */
export function validatePerson(person: Partial<Person>): RuleResult[] {
  const results: RuleResult[] = []

  if (!person.firstName?.trim()) {
    results.push({ valid: false, error: 'Nama depan wajib diisi' })
  }

  const dateResult = validatePersonDates(person.birthDate, person.deathDate)
  if (!dateResult.valid) results.push(dateResult)

  if (person.birthDate && !isValidISODate(person.birthDate)) {
    results.push({ valid: false, error: 'Format tanggal lahir tidak valid (gunakan YYYY-MM-DD)' })
  }

  if (person.deathDate && !isValidISODate(person.deathDate)) {
    results.push({ valid: false, error: 'Format tanggal wafat tidak valid (gunakan YYYY-MM-DD)' })
  }

  return results
}
