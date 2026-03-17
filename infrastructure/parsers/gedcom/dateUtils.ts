const MONTHS: Record<string, number> = {
  JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
  JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
}

const MONTH_NAMES: string[] = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/**
 * Parse GEDCOM date string to ISO date string (YYYY-MM-DD).
 * Handles formats: "DD MMM YYYY", "MMM YYYY", "YYYY"
 * Strips approximate/qualifier prefixes: ABT, CAL, EST, BEF, AFT, etc.
 * Returns null if unparseable.
 */
export function gedcomDateToISO(gedDate: string): string | null {
  if (!gedDate || gedDate.trim() === '') return null

  // Remove qualifier prefixes (ABT, CAL, EST, BEF, AFT, FROM, TO, INT, etc.)
  const cleaned = gedDate.trim().replace(/^(ABT|CAL|EST|BEF|AFT|FROM|TO|INT|ABOUT|CALC|ESTIMATED|BEFORE|AFTER)\s+/i, '').trim()

  if (cleaned === '') return null

  const parts = cleaned.toUpperCase().split(/\s+/)
  const p0 = parts[0] ?? ''
  const p1 = parts[1] ?? ''
  const p2 = parts[2] ?? ''

  // "YYYY" only
  if (parts.length === 1) {
    const year = parseInt(p0, 10)
    if (!isNaN(year) && year > 0 && year <= 9999) {
      return `${String(year).padStart(4, '0')}-01-01`
    }
    return null
  }

  // "MMM YYYY"
  if (parts.length === 2) {
    const monthNum = MONTHS[p0]
    const year = parseInt(p1, 10)
    if (monthNum !== undefined && !isNaN(year) && year > 0) {
      return `${String(year).padStart(4, '0')}-${String(monthNum).padStart(2, '0')}-01`
    }
    return null
  }

  // "DD MMM YYYY"
  if (parts.length >= 3) {
    const day = parseInt(p0, 10)
    const monthNum = MONTHS[p1]
    const year = parseInt(p2, 10)
    if (!isNaN(day) && monthNum !== undefined && !isNaN(year) && year > 0) {
      return `${String(year).padStart(4, '0')}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
    return null
  }

  return null
}

/**
 * Convert ISO date string (YYYY-MM-DD) to GEDCOM date string ("DD MMM YYYY").
 */
export function isoToGedcomDate(isoDate: string): string {
  if (!isoDate) return ''

  const parts = isoDate.split('-')
  const p0 = parts[0] ?? '0'
  const p1 = parts[1] ?? '1'
  const p2 = parts[2] ?? '1'

  const year = parseInt(p0, 10)
  const month = parts.length >= 2 ? parseInt(p1, 10) : 1
  const day = parts.length >= 3 ? parseInt(p2, 10) : 1

  const monthName = MONTH_NAMES[month - 1] ?? 'JAN'

  return `${String(day).padStart(2, '0')} ${monthName} ${String(year).padStart(4, '0')}`
}
