import { Interval, Period, Precision } from '../src'

describe('Period Class', () => {
  let period: Period
  let otherPeriod: Period

  beforeEach(() => {
    period = new Period('2023-01-01', '2023-01-10', Precision.DAY)
    otherPeriod = new Period('2023-01-05', '2023-01-15', Precision.DAY)
  })

  describe('constructor', () => {
    it('should initialize with correct dates and precision', () => {
      expect(period.getStartDate()).toEqual(new Date('2023-01-01'))
      expect(period.getEndDate()).toEqual(new Date('2023-01-10'))
      expect(period['precision']).toBe(Precision.DAY)
    })

    it('should throw error when start date is after end date', () => {
      expect(() => {
        new Period('2023-01-10', '2023-01-01', Precision.DAY)
      }).toThrow('Start date must be before or equal to end date')
    })

    it('should throw error for invalid date strings', () => {
      expect(() => {
        new Period('invalid-date', '2023-01-10', Precision.DAY)
      }).toThrow('Invalid date: invalid-date')
    })
  })

  describe('contains', () => {
    it('should return true for a date within the period', () => {
      expect(period.contains('2023-01-05')).toBe(true)
    })

    it('should return false for a date outside the period', () => {
      expect(period.contains('2023-01-15')).toBe(false)
    })

    it('should throw error for invalid date', () => {
      expect(() => {
        period.contains('invalid-date')
      }).toThrow('Invalid date: invalid-date')
    })
  })

  describe('overlapsWith', () => {
    it('should return true when periods overlap', () => {
      expect(period.overlapsWith(otherPeriod)).toBe(true)
    })

    it('should return false when periods do not overlap', () => {
      const nonOverlappingPeriod = new Period(
        '2023-01-11',
        '2023-01-20',
        Precision.DAY
      )
      expect(period.overlapsWith(nonOverlappingPeriod)).toBe(false)
    })
  })

  describe('isAdjacentTo', () => {
    it('should return true when periods are adjacent with day precision', () => {
      const period1 = new Period(
        '2023-01-01T00:00:00Z',
        '2023-01-10T23:59:59.999Z',
        Precision.DAY
      )
      const adjacentPeriod = new Period(
        '2023-01-11T00:00:00Z',
        '2023-01-20T23:59:59.999Z',
        Precision.DAY
      )
      expect(period1.isAdjacentTo(adjacentPeriod)).toBe(true)
    })

    it('should return true when periods are adjacent with hour precision', () => {
      const period1 = new Period(
        '2023-01-01T00:00:00Z',
        '2023-01-10T23:00:00Z',
        Precision.HOUR
      )
      const adjacentPeriod = new Period(
        '2023-01-11T00:00:00Z',
        '2023-01-20T23:00:00Z',
        Precision.HOUR
      )
      expect(period1.isAdjacentTo(adjacentPeriod)).toBe(true)
    })

    it('should return true when periods are adjacent with minute precision', () => {
      const period1 = new Period(
        '2023-01-01T00:00:00Z',
        '2023-01-01T00:59:00Z',
        Precision.MINUTE
      )
      const adjacentPeriod = new Period(
        '2023-01-01T01:00:00Z',
        '2023-01-01T01:59:00Z',
        Precision.MINUTE
      )
      expect(period1.isAdjacentTo(adjacentPeriod)).toBe(true)
    })

    it('should return true when periods are adjacent with different precisions', () => {
      const period1 = new Period(
        '2023-01-01T00:00:00Z',
        '2023-01-10T23:59:59.999Z',
        Precision.DAY
      )
      const adjacentPeriod = new Period(
        '2023-01-11T00:00:00Z',
        '2023-01-20T23:59:59.999Z',
        Precision.HOUR
      )
      expect(period1.isAdjacentTo(adjacentPeriod)).toBe(true)
    })

    it('should return false when periods are not adjacent with day precision', () => {
      const period1 = new Period(
        '2023-01-01T00:00:00Z',
        '2023-01-10T23:59:59.999Z',
        Precision.DAY
      )
      const nonAdjacentPeriod = new Period(
        '2023-01-12T00:00:00Z',
        '2023-01-20T23:59:59.999Z',
        Precision.DAY
      )
      expect(period1.isAdjacentTo(nonAdjacentPeriod)).toBe(false)
    })

    it('should return false when periods are not adjacent with hour precision', () => {
      const period1 = new Period(
        '2023-01-01T00:00:00Z',
        '2023-01-10T23:00:00Z',
        Precision.HOUR
      )
      const nonAdjacentPeriod = new Period(
        '2023-01-11T01:00:00Z',
        '2023-01-20T23:00:00Z',
        Precision.HOUR
      )
      expect(period1.isAdjacentTo(nonAdjacentPeriod)).toBe(false)
    })

    it('should return false when periods are not adjacent with minute precision', () => {
      const period1 = new Period(
        '2023-01-01T00:00:00Z',
        '2023-01-01T00:58:00Z',
        Precision.MINUTE
      )
      const nonAdjacentPeriod = new Period(
        '2023-01-01T01:00:00Z',
        '2023-01-01T01:59:00Z',
        Precision.MINUTE
      )
      expect(period1.isAdjacentTo(nonAdjacentPeriod)).toBe(false)
    })

    it('should return false when periods overlap', () => {
      const period1 = new Period(
        '2023-01-01T00:00:00Z',
        '2023-01-10T23:59:59.999Z',
        Precision.DAY
      )
      const overlappingPeriod = new Period(
        '2023-01-10T00:00:00Z',
        '2023-01-20T23:59:59.999Z',
        Precision.DAY
      )
      expect(period1.isAdjacentTo(overlappingPeriod)).toBe(false)
    })

    it('should return true when periods are adjacent in reverse order', () => {
      const period1 = new Period(
        '2023-01-11T00:00:00Z',
        '2023-01-20T23:59:59.999Z',
        Precision.DAY
      )
      const adjacentPeriod = new Period(
        '2023-01-01T00:00:00Z',
        '2023-01-10T23:59:59.999Z',
        Precision.DAY
      )
      expect(period1.isAdjacentTo(adjacentPeriod)).toBe(true)
    })
  })

  describe('getDatesInInterval', () => {
    it('should return dates at specified intervals', () => {
      const interval = Interval.days(2)
      period.setInterval(interval)
      const dates = period.getDatesInInterval()
      expect(dates?.length).toBe(5)
      expect(dates).toEqual([
        new Date('2023-01-01'),
        new Date('2023-01-03'),
        new Date('2023-01-05'),
        new Date('2023-01-07'),
        new Date('2023-01-09')
      ])
    })

    it('should return null when interval is not set', () => {
      expect(period.getDatesInInterval()).toBeNull()
    })
  })

  describe('length', () => {
    it('should return the correct length of the period', () => {
      expect(period.length()).toBe(9) // Difference in days
    })
  })

  describe('overlap', () => {
    it('should return the overlapping period', () => {
      const overlapPeriod = period.overlap(otherPeriod)
      expect(overlapPeriod?.getStartDate()).toEqual(new Date('2023-01-05'))
      expect(overlapPeriod?.getEndDate()).toEqual(new Date('2023-01-10'))
    })

    it('should return null when there is no overlap', () => {
      const nonOverlappingPeriod = new Period(
        '2023-01-11',
        '2023-01-20',
        Precision.DAY
      )
      expect(period.overlap(nonOverlappingPeriod)).toBeNull()
    })
  })

  describe('subtract', () => {
    it('should return remaining periods after subtraction', () => {
      // period: 2023-01-01 to 2023-01-10
      // otherPeriod: 2023-01-05 to 2023-01-15
      // Expected result: 2023-01-01 to 2023-01-05 (fixed boundary)
      const result = period.subtract(otherPeriod)
      expect(result.length).toBe(1)
      expect(result[0].getStartDate()).toEqual(new Date('2023-01-01T00:00:00.000Z'))
      expect(result[0].getEndDate()).toEqual(new Date('2023-01-05T00:00:00.000Z'))
    })

    it('should handle subtraction with different precisions', () => {
      const hourPeriod = new Period(
        '2023-01-01T00:00:00Z',
        '2023-01-10T00:00:00Z',
        Precision.HOUR
      )
      const otherHourPeriod = new Period(
        '2023-01-05T12:00:00Z',
        '2023-01-15T00:00:00Z',
        Precision.HOUR
      )
      const result = hourPeriod.subtract(otherHourPeriod)
      expect(result.length).toBe(1)
      expect(result[0].getStartDate()).toEqual(new Date('2023-01-01T00:00:00.000Z'))
      expect(result[0].getEndDate()).toEqual(new Date('2023-01-05T12:00:00.000Z'))
    })

    it('should return the original period when there is no overlap', () => {
      const nonOverlappingPeriod = new Period(
        '2023-01-11',
        '2023-01-20',
        Precision.DAY
      )
      const result = period.subtract(nonOverlappingPeriod)
      expect(result.length).toBe(1)
      expect(result[0]).toEqual(period)
    })

    it('should handle complete overlap (period completely subtracted)', () => {
      const largerPeriod = new Period(
        '2022-12-01',
        '2023-02-01',
        Precision.DAY
      )
      const result = period.subtract(largerPeriod)
      expect(result.length).toBe(0)
    })

    it('should handle subtraction leaving two periods', () => {
      const middlePeriod = new Period(
        '2023-01-04',
        '2023-01-07',
        Precision.DAY
      )
      const result = period.subtract(middlePeriod)
      expect(result.length).toBe(2)
      expect(result[0].getStartDate()).toEqual(new Date('2023-01-01'))
      expect(result[0].getEndDate()).toEqual(new Date('2023-01-04'))
      expect(result[1].getStartDate()).toEqual(new Date('2023-01-07'))
      expect(result[1].getEndDate()).toEqual(new Date('2023-01-10'))
    })
  })

  describe('gap', () => {
    it('should return the gap between two periods', () => {
      // period: 2023-01-01 to 2023-01-10
      // nonOverlappingPeriod: 2023-01-15 to 2023-01-20
      // Expected gap: 2023-01-10 to 2023-01-15 (fixed boundary calculation)
      const nonOverlappingPeriod = new Period(
        '2023-01-15',
        '2023-01-20',
        Precision.DAY
      )
      const gapPeriod = period.gap(nonOverlappingPeriod)
      expect(gapPeriod?.getStartDate()).toEqual(new Date('2023-01-10'))
      expect(gapPeriod?.getEndDate()).toEqual(new Date('2023-01-15'))
    })

    it('should return null when periods overlap or are adjacent', () => {
      expect(period.gap(otherPeriod)).toBeNull()
      
      // Test truly adjacent periods (no gap between them)
      const adjacentPeriod = new Period(
        '2023-01-11',
        '2023-01-15',
        Precision.DAY
      )
      expect(period.gap(adjacentPeriod)).toBeNull()
    })

    it('should handle gaps in reverse order', () => {
      const earlierPeriod = new Period(
        '2022-12-15',
        '2022-12-20',
        Precision.DAY
      )
      const gapPeriod = period.gap(earlierPeriod)
      expect(gapPeriod?.getStartDate()).toEqual(new Date('2022-12-20'))
      expect(gapPeriod?.getEndDate()).toEqual(new Date('2023-01-01'))
    })
  })

  describe('symmetricDifference', () => {
    it('should return periods that are in either period but not both', () => {
      const period1 = new Period(
        '2023-01-01T00:00:00Z',
        '2023-01-10T23:59:59.999Z',
        Precision.DAY
      )
      const period2 = new Period(
        '2023-01-05T00:00:00Z',
        '2023-01-15T23:59:59.999Z',
        Precision.DAY
      )
      const result = period1.symmetricDifference(period2)
      expect(result.length).toBe(2)
      expect(result[0].getStartDate()).toEqual(new Date('2023-01-01T00:00:00.000Z'))
      expect(result[0].getEndDate()).toEqual(new Date('2023-01-05T00:00:00.000Z'))
      expect(result[1].getStartDate()).toEqual(new Date('2023-01-10T23:59:59.999Z'))
      expect(result[1].getEndDate()).toEqual(new Date('2023-01-15T23:59:59.999Z'))
    })

    it('should return the union when there is no overlap', () => {
      const nonOverlappingPeriod = new Period(
        '2023-01-11',
        '2023-01-20',
        Precision.DAY
      )
      const result = period.symmetricDifference(nonOverlappingPeriod)
      expect(result.length).toBe(2)
      expect(result[0]).toEqual(period)
      expect(result[1]).toEqual(nonOverlappingPeriod)
    })
  })

  describe('renew', () => {
    it('should create a new period immediately after the current one', () => {
      const renewedPeriod = period.renew()
      expect(renewedPeriod.getStartDate()).toEqual(new Date('2023-01-11'))
      expect(renewedPeriod.getEndDate()).toEqual(new Date('2023-01-20'))
    })
  })

  describe('union', () => {
    it('should merge overlapping periods', () => {
      const result = period.union(otherPeriod)
      expect(result.length).toBe(1)
      expect(result[0].getStartDate()).toEqual(new Date('2023-01-01'))
      expect(result[0].getEndDate()).toEqual(new Date('2023-01-15'))
    })

    it('should return both periods when they do not overlap', () => {
      const nonOverlappingPeriod = new Period(
        '2023-01-20',
        '2023-01-25',
        Precision.DAY
      )
      const result = period.union(nonOverlappingPeriod)
      expect(result.length).toBe(2)
      expect(result[0]).toEqual(period)
      expect(result[1]).toEqual(nonOverlappingPeriod)
    })
  })

  describe('Fluent API methods', () => {
    it('should set start date using setStart', () => {
      // Changed to a valid date that's before the end date
      period.setStart('2023-01-02')
      expect(period.getStartDate()).toEqual(new Date('2023-01-02'))
    })

    it('should set end date using setEnd', () => {
      period.setEnd('2023-02-10')
      expect(period.getEndDate()).toEqual(new Date('2023-02-10'))
    })

    it('should set precision using setPrecision', () => {
      period.setPrecision(Precision.MONTH)
      expect(period['precision']).toBe(Precision.MONTH)
    })

    it('should set interval using setInterval', () => {
      const interval = Interval.days(1)
      period.setInterval(interval)
      expect(period['interval']).toEqual(interval)
    })

    it('should throw error when setting start date after end date', () => {
      expect(() => {
        period.setStart('2023-02-01')
      }).toThrow('Start date must be before or equal to end date')
    })

    it('should throw error when setting end date before start date', () => {
      expect(() => {
        period.setEnd('2022-12-01')
      }).toThrow('End date must be after or equal to start date')
    })

    it('should throw error for invalid date in setStart', () => {
      expect(() => {
        period.setStart('invalid-date')
      }).toThrow('Invalid date: invalid-date')
    })

    it('should throw error for invalid date in setEnd', () => {
      expect(() => {
        period.setEnd('invalid-date')
      }).toThrow('Invalid date: invalid-date')
    })
  })

  describe('interval calculations', () => {
    const start = new Date('2023-01-01T00:00:00Z')
    const end = new Date('2024-03-15T12:30:00Z')
    const period = new Period(start, end, Precision.MINUTE)

    test('getMinutesInInterval', () => {
      expect(period.getMinutesInInterval()).toBe(632910)
    })

    test('getHoursInInterval', () => {
      expect(period.getHoursInInterval()).toBe(10548)
    })

    test('getDaysInInterval', () => {
      expect(period.getDaysInInterval()).toBe(439)
    })

    test('getWeeksInInterval', () => {
      expect(period.getWeeksInInterval()).toBe(62)
    })

    test('getMonthsInInterval', () => {
      expect(period.getMonthsInInterval()).toBe(14)
    })

    test('getYearsInInterval', () => {
      expect(period.getYearsInInterval()).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('same day', () => {
      const sameDayPeriod = new Period(
        '2023-01-01T00:00:00Z',
        '2023-01-01T23:59:59Z'
      )
      expect(sameDayPeriod.getDaysInInterval()).toBe(0)
      expect(sameDayPeriod.getHoursInInterval()).toBe(23)
      expect(sameDayPeriod.getMinutesInInterval()).toBe(1439)
    })

    test('leap year', () => {
      const leapYearPeriod = new Period(
        '2024-02-28T00:00:00Z',
        '2024-03-01T00:00:00Z'
      )
      expect(leapYearPeriod.getDaysInInterval()).toBe(2)
    })

    test('month boundary', () => {
      const monthBoundaryPeriod = new Period(
        '2023-01-31T00:00:00Z',
        '2023-03-01T00:00:00Z'
      )
      expect(monthBoundaryPeriod.getMonthsInInterval()).toBe(1)
      expect(monthBoundaryPeriod.getDaysInInterval()).toBe(29)
    })

    test('invalid period creation should throw error', () => {
      // Test that creating a period with start > end throws an error
      expect(() => {
        new Period('2023-03-31T00:00:00Z', '2023-03-01T00:00:00Z')
      }).toThrow('Start date must be before or equal to end date')
    })
  })

  describe('precision handling', () => {
    test('day precision', () => {
      const dayPrecisionPeriod = new Period(
        '2023-01-01T12:30:00Z',
        '2023-01-03T08:45:00Z',
        Precision.DAY
      )
      expect(dayPrecisionPeriod.getDaysInInterval()).toBe(1)
    })

    test('month precision', () => {
      const monthPrecisionPeriod = new Period(
        '2023-01-15T00:00:00Z',
        '2023-03-15T00:00:00Z',
        Precision.MONTH
      )
      expect(monthPrecisionPeriod.getMonthsInInterval()).toBe(2)
    })
  })
})
