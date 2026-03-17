/**
 * Ekstrak pesan error dari berbagai tipe exception termasuk PostgrestError
 */
export function getErrorMessage(e: unknown, fallback: string): string {
  if (!e) return fallback
  if (e instanceof Error) return e.message
  if (typeof e === 'object' && 'message' in e && typeof (e as Record<string, unknown>).message === 'string') {
    return (e as { message: string }).message
  }
  if (typeof e === 'string') return e
  return fallback
}
