/**
 * Format ISO date string (YYYY-MM-DD or full ISO) to dd/mm/yyyy.
 */
export function formatDateDMY(dateStr?: string | null): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

/**
 * Convert dd/mm/yyyy string to ISO date (YYYY-MM-DD).
 * Returns empty string if invalid.
 */
export function dmyToISO(dmy: string): string {
  const match = dmy.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return ''
  const [, dd, mm, yyyy] = match
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Convert ISO date (YYYY-MM-DD) to dd/mm/yyyy for display in input.
 * Returns empty string if invalid.
 */
export function isoToDMY(iso: string): string {
  if (!iso) return ''
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return ''
  const [, yyyy, mm, dd] = match
  return `${dd}/${mm}/${yyyy}`
}
