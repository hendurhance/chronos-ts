import {
  getDatesWithInterval,
  getWeeksWithInterval,
  getDaysWithInterval,
  getHoursWithInterval,
  getMinutesWithInterval,
  getMonthsWithInterval,
  getYearsWithInterval,
  addToDate,
  subtractFromDate,
  isSameDay,
  getWeekNumber,
  getQuarter,
  isLeapYear,
  getDaysInMonth,
  formatDate,
  parseDate,
  range
} from '../src/utils'
import { Interval } from '../src/interval'
import { Precision } from '../src/precision'

describe('Utils', () => {
  describe('getDatesWithInterval', () => {
    it('should return correct dates for daily interval', () => {
      const start = new Date('2023-01-01')
      const end = new Date('2023-01-05')
      const interval = Interval.days(1)
      const result = getDatesWithInterval(start, end, interval)
      expect(result.length).toBe(5)
      expect(result[0]).toEqual(new Date('2023-01-01'))
      expect(result[4]).toEqual(new Date('2023-01-05'))
    })

    it("should handle intervals that don't divide evenly into the period", () => {
      const start = new Date('2023-01-01')
      const end = new Date('2023-01-05')
      const interval = Interval.days(2)
      const result = getDatesWithInterval(start, end, interval)
      expect(result.length).toBe(3)
      expect(result[2]).toEqual(new Date('2023-01-05'))
    })
  })

  describe('getWeeksWithInterval', () => {
    it('should return correct weeks', () => {
      const start = new Date('2023-01-01T00:00:00Z')
      const end = new Date('2023-01-31T23:59:59Z')
      const interval = Interval.weeks(1)
      const result = getWeeksWithInterval(start, end, interval)
      expect(result.length).toBe(5)
      expect(result[0]).toEqual(new Date('2023-01-01T00:00:00.000Z'))
      expect(result[4]).toEqual(new Date('2023-01-29T00:00:00.000Z'))
    })

    it('should handle bi-weekly intervals', () => {
      const start = new Date('2023-01-01T00:00:00Z')
      const end = new Date('2023-02-28T23:59:59Z')
      const interval = Interval.weeks(2)
      const result = getWeeksWithInterval(start, end, interval)
      expect(result.length).toBe(5)
      expect(result[0]).toEqual(new Date('2023-01-01T00:00:00.000Z'))
      expect(result[4]).toEqual(new Date('2023-02-26T00:00:00.000Z'))
    })
  })

  describe('getDaysWithInterval', () => {
    it('should return correct days', () => {
      const start = new Date('2023-01-01T00:00:00Z')
      const end = new Date('2023-01-05T23:59:59Z')
      const interval = Interval.days(2)
      const result = getDaysWithInterval(start, end, interval)
      expect(result.length).toBe(3)
      expect(result[0]).toEqual(new Date('2023-01-01T00:00:00Z'))
      expect(result[2]).toEqual(new Date('2023-01-05T00:00:00Z'))
    })
  })

  describe('getHoursWithInterval', () => {
    it('should return correct hours', () => {
      const start = new Date('2023-01-01T00:00:00')
      const end = new Date('2023-01-01T23:59:59')
      const interval = Interval.hours(6)
      const result = getHoursWithInterval(start, end, interval)
      expect(result.length).toBe(4)
      expect(result[0]).toEqual(new Date('2023-01-01T00:00:00'))
      expect(result[3]).toEqual(new Date('2023-01-01T18:00:00'))
    })
  })

  describe('getMinutesWithInterval', () => {
    it('should return correct minutes', () => {
      const start = new Date('2023-01-01T00:00:00')
      const end = new Date('2023-01-01T00:59:59')
      const interval = Interval.minutes(15)
      const result = getMinutesWithInterval(start, end, interval)
      expect(result.length).toBe(4)
      expect(result[0]).toEqual(new Date('2023-01-01T00:00:00'))
      expect(result[3]).toEqual(new Date('2023-01-01T00:45:00'))
    })
  })

  describe('getMonthsWithInterval', () => {
    it('should return correct months', () => {
      const start = new Date('2023-01-01T00:00:00Z')
      const end = new Date('2023-12-31T23:59:59Z')
      const interval = Interval.months(3)
      const result = getMonthsWithInterval(start, end, interval)
      expect(result.length).toBe(4)
      expect(result[0]).toEqual(new Date('2023-01-01T00:00:00Z'))
      expect(result[3]).toEqual(new Date('2023-10-01T00:00:00Z'))
    })
  })

  describe('getYearsWithInterval', () => {
    it('should return correct years for 2-year interval', () => {
      const start = new Date('2020-01-01T00:00:00Z')
      const end = new Date('2025-12-31T23:59:59Z')
      const interval = Interval.months(24) // 2 years
      const result = getYearsWithInterval(start, end, interval)
      expect(result.length).toBe(3)
      expect(result[0]).toEqual(new Date('2020-01-01T00:00:00.000Z'))
      expect(result[2]).toEqual(new Date('2024-01-01T00:00:00.000Z'))
    })

    it('should handle 1-year intervals', () => {
      const start = new Date('2020-01-01T00:00:00Z')
      const end = new Date('2023-12-31T23:59:59Z')
      const interval = Interval.months(12) // 1 year
      const result = getYearsWithInterval(start, end, interval)
      expect(result.length).toBe(4)
      expect(result[0]).toEqual(new Date('2020-01-01T00:00:00.000Z'))
      expect(result[3]).toEqual(new Date('2023-01-01T00:00:00.000Z'))
    })
  })

  describe('addToDate', () => {
    it('should correctly add minutes', () => {
      const date = new Date('2023-01-01T00:00:00')
      const result = addToDate(date, 30, Precision.MINUTE)
      expect(result).toEqual(new Date('2023-01-01T00:30:00'))
    })

    it('should correctly add hours', () => {
      const date = new Date('2023-01-01T00:00:00')
      const result = addToDate(date, 2, Precision.HOUR)
      expect(result).toEqual(new Date('2023-01-01T02:00:00'))
    })

    it('should correctly add days', () => {
      const date = new Date('2023-01-01')
      const result = addToDate(date, 5, Precision.DAY)
      expect(result).toEqual(new Date('2023-01-06'))
    })

    it('should correctly add weeks', () => {
      const date = new Date('2023-01-01')
      const result = addToDate(date, 2, Precision.WEEK)
      expect(result).toEqual(new Date('2023-01-15'))
    })

    it('should correctly add months', () => {
      const date = new Date('2023-01-31T00:00:00Z')
      const result = addToDate(date, 1, Precision.MONTH)
      expect(result).toEqual(new Date('2023-02-28T00:00:00Z'))
    })

    it('should correctly add years', () => {
      const date = new Date('2023-01-01')
      const result = addToDate(date, 1, Precision.YEAR)
      expect(result).toEqual(new Date('2024-01-01'))
    })
  })

  describe('subtractFromDate', () => {
    it('should correctly subtract days', () => {
      const date = new Date('2023-01-05')
      const result = subtractFromDate(date, 3, Precision.DAY)
      expect(result).toEqual(new Date('2023-01-02'))
    })
  })

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      const date1 = new Date('2023-01-01T10:00:00')
      const date2 = new Date('2023-01-01T22:00:00')
      expect(isSameDay(date1, date2)).toBe(true)
    })

    it('should return false for different days', () => {
      const date1 = new Date('2023-01-01')
      const date2 = new Date('2023-01-02')
      expect(isSameDay(date1, date2)).toBe(false)
    })
  })

  describe('getWeekNumber', () => {
    it('should return correct week number', () => {
      const date = new Date('2023-01-01')
      expect(getWeekNumber(date)).toBe(52) // Jan 1, 2023 is in week 52 of 2022

      const date2 = new Date('2023-01-02')
      expect(getWeekNumber(date2)).toBe(1)
    })
  })

  describe('getQuarter', () => {
    it('should return correct quarter', () => {
      expect(getQuarter(new Date('2023-01-01'))).toBe(1)
      expect(getQuarter(new Date('2023-04-01'))).toBe(2)
      expect(getQuarter(new Date('2023-07-01'))).toBe(3)
      expect(getQuarter(new Date('2023-10-01'))).toBe(4)
    })
  })

  describe('isLeapYear', () => {
    it('should correctly identify leap years', () => {
      expect(isLeapYear(2000)).toBe(true)
      expect(isLeapYear(2004)).toBe(true)
      expect(isLeapYear(2100)).toBe(false)
      expect(isLeapYear(2023)).toBe(false)
    })
  })

  describe('getDaysInMonth', () => {
    it('should return correct number of days for each month', () => {
      expect(getDaysInMonth(2023, 0)).toBe(31) // January
      expect(getDaysInMonth(2023, 1)).toBe(28) // February in non-leap year
      expect(getDaysInMonth(2024, 1)).toBe(29) // February in leap year
      expect(getDaysInMonth(2023, 3)).toBe(30) // April
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-05-15T14:30:45')
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2023-05-15')
      expect(formatDate(date, 'DD/MM/YYYY HH:mm:ss')).toBe(
        '15/05/2023 14:30:45'
      )
    })
  })

  describe('parseDate', () => {
    it('should parse date string correctly', () => {
      const dateString = '2023-05-15 14:30:45'
      const format = 'YYYY-MM-DD HH:mm:ss'
      const result = parseDate(dateString, format)
      expect(result).toEqual(new Date(2023, 4, 15, 14, 30, 45))
    })
  })

  describe('range', () => {
    it('should generate correct range of numbers', () => {
      expect(range(1, 5)).toEqual([1, 2, 3, 4, 5])
      expect(range(1, 10, 2)).toEqual([1, 3, 5, 7, 9])
    })
  })
})
