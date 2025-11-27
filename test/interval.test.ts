import { ChronosInterval } from '../src/core/interval';

describe('ChronosInterval', () => {
  // ============================================================================
  // Factory Methods
  // ============================================================================

  describe('Factory Methods', () => {
    test('create() with duration object', () => {
      const interval = ChronosInterval.create({ days: 5, hours: 3 });

      expect(interval.days).toBe(5);
      expect(interval.hours).toBe(3);
    });

    test('years() factory', () => {
      const interval = ChronosInterval.years(2);
      expect(interval.years).toBe(2);
    });

    test('months() factory', () => {
      const interval = ChronosInterval.months(6);
      expect(interval.months).toBe(6);
    });

    test('weeks() factory', () => {
      const interval = ChronosInterval.weeks(3);
      expect(interval.weeks).toBe(3);
    });

    test('days() factory', () => {
      const interval = ChronosInterval.days(10);
      expect(interval.days).toBe(10);
    });

    test('hours() factory', () => {
      const interval = ChronosInterval.hours(24);
      expect(interval.hours).toBe(24);
    });

    test('minutes() factory', () => {
      const interval = ChronosInterval.minutes(90);
      expect(interval.minutes).toBe(90);
    });

    test('seconds() factory', () => {
      const interval = ChronosInterval.seconds(3600);
      expect(interval.seconds).toBe(3600);
    });

    test('zero() creates empty interval', () => {
      const interval = ChronosInterval.zero();

      expect(interval.years).toBe(0);
      expect(interval.months).toBe(0);
      expect(interval.days).toBe(0);
    });

    test('fromISO() parses ISO 8601 duration', () => {
      const interval = ChronosInterval.fromISO('P1Y2M3DT4H5M6S');

      expect(interval.years).toBe(1);
      expect(interval.months).toBe(2);
      expect(interval.days).toBe(3);
      expect(interval.hours).toBe(4);
      expect(interval.minutes).toBe(5);
      expect(interval.seconds).toBe(6);
    });

    test('fromString() parses human-readable string', () => {
      const interval = ChronosInterval.fromString('2 days 3 hours');

      expect(interval.days).toBe(2);
      expect(interval.hours).toBe(3);
    });

    test('between() calculates difference between dates', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-11');
      const interval = ChronosInterval.between(start, end);

      expect(interval.days).toBe(10);
    });
  });

  // ============================================================================
  // Getters
  // ============================================================================

  describe('Getters', () => {
    const interval = ChronosInterval.create({
      years: 1,
      months: 2,
      weeks: 1,
      days: 3,
      hours: 4,
      minutes: 5,
      seconds: 6,
      milliseconds: 7,
    });

    test('years getter', () => {
      expect(interval.years).toBe(1);
    });

    test('months getter', () => {
      expect(interval.months).toBe(2);
    });

    test('weeks getter', () => {
      expect(interval.weeks).toBe(1);
    });

    test('days getter', () => {
      expect(interval.days).toBe(3);
    });

    test('hours getter', () => {
      expect(interval.hours).toBe(4);
    });

    test('minutes getter', () => {
      expect(interval.minutes).toBe(5);
    });

    test('seconds getter', () => {
      expect(interval.seconds).toBe(6);
    });

    test('milliseconds getter', () => {
      expect(interval.milliseconds).toBe(7);
    });
  });

  // ============================================================================
  // Total Calculations
  // ============================================================================

  describe('Total Calculations', () => {
    test('total() in different units', () => {
      const interval = ChronosInterval.hours(48);

      expect(interval.total('hours')).toBe(48);
      expect(interval.total('days')).toBeCloseTo(2);
      expect(interval.total('minutes')).toBeCloseTo(48 * 60);
    });

    test('totalMilliseconds()', () => {
      const interval = ChronosInterval.seconds(60);
      expect(interval.totalMilliseconds()).toBe(60000);
    });

    test('totalSeconds()', () => {
      const interval = ChronosInterval.minutes(2);
      expect(interval.totalSeconds()).toBe(120);
    });

    test('totalMinutes()', () => {
      const interval = ChronosInterval.hours(2);
      expect(interval.totalMinutes()).toBe(120);
    });

    test('totalHours()', () => {
      const interval = ChronosInterval.days(1);
      expect(interval.totalHours()).toBe(24);
    });

    test('totalDays()', () => {
      const interval = ChronosInterval.weeks(1);
      expect(interval.totalDays()).toBe(7);
    });
  });

  // ============================================================================
  // Arithmetic
  // ============================================================================

  describe('Arithmetic', () => {
    test('add() combines intervals', () => {
      const interval1 = ChronosInterval.days(5);
      const interval2 = ChronosInterval.days(3);
      const result = interval1.add(interval2);

      expect(result.days).toBe(8);
    });

    test('subtract() removes interval', () => {
      const interval1 = ChronosInterval.days(10);
      const interval2 = ChronosInterval.days(3);
      const result = interval1.subtract(interval2);

      expect(result.days).toBe(7);
    });

    test('multiply() scales interval', () => {
      const interval = ChronosInterval.hours(2);
      const result = interval.multiply(3);

      expect(result.hours).toBe(6);
    });

    test('divide() reduces interval', () => {
      const interval = ChronosInterval.hours(6);
      const result = interval.divide(2);

      expect(result.hours).toBe(3);
    });

    test('add years via duration', () => {
      const interval = ChronosInterval.years(1);
      expect(interval.add({ years: 2 }).years).toBe(3);
    });

    test('add months via duration', () => {
      const interval = ChronosInterval.months(3);
      expect(interval.add({ months: 3 }).months).toBe(6);
    });

    test('add days via duration', () => {
      const interval = ChronosInterval.days(5);
      expect(interval.add({ days: 5 }).days).toBe(10);
    });

    test('add hours via duration', () => {
      const interval = ChronosInterval.hours(10);
      expect(interval.add({ hours: 5 }).hours).toBe(15);
    });

    test('add minutes via duration', () => {
      const interval = ChronosInterval.minutes(30);
      expect(interval.add({ minutes: 30 }).minutes).toBe(60);
    });
  });

  // ============================================================================
  // Comparison
  // ============================================================================

  describe('Comparison', () => {
    test('compare by total milliseconds', () => {
      const long = ChronosInterval.days(10);
      const short = ChronosInterval.days(5);

      expect(long.totalMilliseconds() > short.totalMilliseconds()).toBe(true);
      expect(short.totalMilliseconds() < long.totalMilliseconds()).toBe(true);
    });

    test('equals()', () => {
      const interval1 = ChronosInterval.hours(24);
      const interval2 = ChronosInterval.days(1);

      expect(interval1.equals(interval2)).toBe(true);
    });

    test('isZero()', () => {
      expect(ChronosInterval.zero().isZero()).toBe(true);
      expect(ChronosInterval.days(1).isZero()).toBe(false);
    });

    test('isPositive()', () => {
      expect(ChronosInterval.days(1).isPositive()).toBe(true);
      expect(ChronosInterval.zero().isPositive()).toBe(false);
    });
  });

  // ============================================================================
  // Formatting
  // ============================================================================

  describe('Formatting', () => {
    test('toISO() returns ISO 8601 string', () => {
      const interval = ChronosInterval.create({ years: 1, months: 2, days: 3 });
      expect(interval.toISO()).toBe('P1Y2M3D');
    });

    test('toISO() with time components', () => {
      const interval = ChronosInterval.create({ hours: 4, minutes: 5, seconds: 6 });
      expect(interval.toISO()).toBe('PT4H5M6S');
    });

    test('forHumans() returns readable string', () => {
      const interval = ChronosInterval.create({ days: 5, hours: 3 });
      const human = interval.forHumans();

      expect(human).toContain('5');
      expect(human).toContain('day');
      expect(human).toContain('3');
      expect(human).toContain('hour');
    });

    test('toString() returns string representation', () => {
      const interval = ChronosInterval.days(5);
      expect(typeof interval.toString()).toBe('string');
    });
  });

  // ============================================================================
  // Conversion
  // ============================================================================

  describe('Conversion', () => {
    test('toDuration() returns duration object', () => {
      const interval = ChronosInterval.create({ days: 5, hours: 3 });
      const duration = interval.toDuration();

      expect(duration.days).toBe(5);
      expect(duration.hours).toBe(3);
    });

    test('toArray() returns components array', () => {
      const interval = ChronosInterval.create({ years: 1, months: 2 });
      const array = interval.toArray();

      expect(Array.isArray(array)).toBe(true);
    });
  });

  // ============================================================================
  // Cloning and Immutability
  // ============================================================================

  describe('Immutability', () => {
    test('clone() creates independent copy', () => {
      const original = ChronosInterval.days(5);
      const clone = original.clone();

      expect(clone.days).toBe(original.days);
      expect(clone).not.toBe(original);
    });

    test('operations return new instances', () => {
      const original = ChronosInterval.days(5);
      const modified = original.add({ days: 3 });

      expect(original.days).toBe(5);
      expect(modified.days).toBe(8);
    });
  });

  // ============================================================================
  // Inversion
  // ============================================================================

  describe('Inversion', () => {
    test('inverted getter tracks sign from between()', () => {
      const start = new Date('2024-01-11');
      const end = new Date('2024-01-01'); // End before start
      const interval = ChronosInterval.between(start, end);
      expect(interval.inverted).toBe(true);
    });

    test('abs() returns non-inverted interval', () => {
      const start = new Date('2024-01-11');
      const end = new Date('2024-01-01');
      const interval = ChronosInterval.between(start, end);
      const absolute = interval.abs();

      expect(absolute.inverted).toBe(false);
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    test('handles empty duration', () => {
      const interval = ChronosInterval.create({});

      expect(interval.years).toBe(0);
      expect(interval.isZero()).toBe(true);
    });

    test('handles fractional values in total', () => {
      const interval = ChronosInterval.hours(36);

      expect(interval.total('days')).toBeCloseTo(1.5);
    });

    test('cascade() normalizes units', () => {
      const interval = ChronosInterval.minutes(90).cascade();

      expect(interval.hours).toBeGreaterThanOrEqual(1);
      expect(interval.minutes).toBeLessThan(60);
    });
  });
});
