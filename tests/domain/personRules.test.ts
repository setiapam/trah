import { describe, it, expect } from 'vitest'
import {
  validatePersonDates,
  warnMissingDeathDate,
  isValidISODate,
  validatePerson,
} from '../../domain/rules/personRules'

describe('Person Rules', () => {
  describe('validatePersonDates', () => {
    it('valid jika tidak ada tanggal', () => {
      expect(validatePersonDates(null, null)).toEqual({ valid: true })
    })

    it('valid jika hanya tanggal lahir', () => {
      expect(validatePersonDates('1950-01-01', null)).toEqual({ valid: true })
    })

    it('valid jika wafat setelah lahir', () => {
      expect(validatePersonDates('1950-01-01', '2020-06-15')).toEqual({ valid: true })
    })

    it('tidak valid jika wafat sebelum lahir', () => {
      const result = validatePersonDates('2020-01-01', '1950-01-01')
      expect(result.valid).toBe(false)
    })

    it('valid jika tanggal sama (meninggal hari lahir)', () => {
      expect(validatePersonDates('1950-01-01', '1950-01-01')).toEqual({ valid: true })
    })
  })

  describe('warnMissingDeathDate', () => {
    it('null jika masih hidup', () => {
      expect(warnMissingDeathDate(true, null)).toBeNull()
    })

    it('null jika wafat dan tanggal terisi', () => {
      expect(warnMissingDeathDate(false, '2020-01-01')).toBeNull()
    })

    it('mengembalikan warning jika wafat tapi tanggal kosong', () => {
      expect(warnMissingDeathDate(false, null)).not.toBeNull()
    })
  })

  describe('isValidISODate', () => {
    it('valid untuk format YYYY-MM-DD', () => {
      expect(isValidISODate('2000-06-15')).toBe(true)
    })

    it('tidak valid untuk format DD/MM/YYYY', () => {
      expect(isValidISODate('15/06/2000')).toBe(false)
    })

    it('tidak valid untuk tanggal tidak ada', () => {
      expect(isValidISODate('2000-02-30')).toBe(false)
    })

    it('tidak valid untuk string acak', () => {
      expect(isValidISODate('bukan-tanggal')).toBe(false)
    })
  })

  describe('validatePerson', () => {
    it('tidak ada error untuk person valid', () => {
      const errors = validatePerson({ firstName: 'Budi', isAlive: true })
      expect(errors.every((r) => r.valid)).toBe(true)
    })

    it('error jika firstName kosong', () => {
      const errors = validatePerson({ firstName: '  ' })
      expect(errors.some((r) => !r.valid)).toBe(true)
    })

    it('error jika tanggal tidak urut', () => {
      const errors = validatePerson({
        firstName: 'Budi',
        birthDate: '2020-01-01',
        deathDate: '1990-01-01',
      })
      expect(errors.some((r) => !r.valid)).toBe(true)
    })
  })
})
