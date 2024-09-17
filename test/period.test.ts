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
      expect(period['startDate']).toEqual(new Date('2023-01-01'))
      expect(period['endDate']).toEqual(new Date('2023-01-10'))
      expect(period['precision']).toBe(Precision.DAY)
    })
  })

  describe('contains', () => {
    it('should return true for a date within the period', () => {
      expect(period.contains('2023-01-05')).toBe(true)
    })

    it('should return false for a date outside the period', () => {
      expect(period.contains('2023-01-15')).toBe(false)
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
      expect(overlapPeriod?.['startDate']).toEqual(new Date('2023-01-05'))
      expect(overlapPeriod?.['endDate']).toEqual(new Date('2023-01-10'))
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
      const result = period.subtract(otherPeriod)
      expect(result.length).toBe(1)
      expect(result[0]['startDate']).toEqual(
        new Date('2023-01-01T00:00:00.000Z')
      )
      expect(result[0]['endDate']).toEqual(new Date('2023-01-04T23:59:59.999Z'))
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
      expect(result[0]['startDate']).toEqual(
        new Date('2023-01-01T00:00:00.000Z')
      )
      expect(result[0]['endDate']).toEqual(new Date('2023-01-05T11:59:59.999Z'))
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
  })

  describe('gap', () => {
    it('should return the gap between two periods', () => {
      const nonOverlappingPeriod = new Period(
        '2023-01-15',
        '2023-01-20',
        Precision.DAY
      )
      const gapPeriod = period.gap(nonOverlappingPeriod)
      expect(gapPeriod?.['startDate']).toEqual(new Date('2023-01-11'))
      expect(gapPeriod?.['endDate']).toEqual(new Date('2023-01-14'))
    })

    it('should return null when periods overlap or are adjacent', () => {
      expect(period.gap(otherPeriod)).toBeNull()
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
      expect(result[0]['startDate']).toEqual(
        new Date('2023-01-01T00:00:00.000Z')
      )
      expect(result[0]['endDate']).toEqual(new Date('2023-01-04T23:59:59.999Z'))
      expect(result[1]['startDate']).toEqual(
        new Date('2023-01-11T00:00:00.000Z')
      )
      expect(result[1]['endDate']).toEqual(new Date('2023-01-15T23:59:59.999Z'))
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
      expect(renewedPeriod['startDate']).toEqual(new Date('2023-01-11'))
      expect(renewedPeriod['endDate']).toEqual(new Date('2023-01-20'))
    })
  })

  describe('union', () => {
    it('should merge overlapping periods', () => {
      const result = period.union(otherPeriod)
      expect(result.length).toBe(1)
      expect(result[0]['startDate']).toEqual(new Date('2023-01-01'))
      expect(result[0]['endDate']).toEqual(new Date('2023-01-15'))
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
      period.setStart('2023-02-01')
      expect(period['startDate']).toEqual(new Date('2023-02-01'))
    })

    it('should set end date using setEnd', () => {
      period.setEnd('2023-02-10')
      expect(period['endDate']).toEqual(new Date('2023-02-10'))
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
