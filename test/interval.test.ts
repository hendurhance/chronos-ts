import { Interval } from '../src'

describe('Interval Class', () => {
  describe('Static Methods', () => {
    it('should create an interval with minutes', () => {
      const interval = Interval.minutes(30)
      expect(interval.getMinutesInterval()).toBe(30)
    })

    it('should create an interval with hours', () => {
      const interval = Interval.hours(2)
      expect(interval.getMinutesInterval()).toBe(120)
    })

    it('should create an interval with days', () => {
      const interval = Interval.days(1)
      expect(interval.getMinutesInterval()).toBe(1440)
    })

    it('should create an interval with weeks', () => {
      const interval = Interval.weeks(1)
      expect(interval.getMinutesInterval()).toBe(10080)
    })

    it('should create an interval with months', () => {
      const interval = Interval.months(1)
      expect(interval.getMinutesInterval()).toBe(43200)
    })
  })
})
