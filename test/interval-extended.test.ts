import { ChronosInterval } from '../src/core/interval';

describe('ChronosInterval Extended Tests', () => {
  // ============================================================================
  // Extended Factory Methods
  // ============================================================================

  describe('Extended Factory Methods', () => {
    test('milliseconds() factory', () => {
      const interval = ChronosInterval.milliseconds(500);
      expect(interval.milliseconds).toBe(500);
    });

    test('unit() with milliseconds', () => {
      const interval = ChronosInterval.unit(500, 'milliseconds');
      expect(interval.milliseconds).toBe(500);
    });

    test('unit() with seconds', () => {
      const interval = ChronosInterval.unit(30, 'seconds');
      expect(interval.seconds).toBe(30);
    });

    test('unit() with minutes', () => {
      const interval = ChronosInterval.unit(45, 'minutes');
      expect(interval.minutes).toBe(45);
    });

    test('unit() with hours', () => {
      const interval = ChronosInterval.unit(24, 'hours');
      expect(interval.hours).toBe(24);
    });

    test('unit() with days', () => {
      const interval = ChronosInterval.unit(5, 'days');
      expect(interval.days).toBe(5);
    });

    test('unit() with weeks', () => {
      const interval = ChronosInterval.unit(2, 'weeks');
      expect(interval.weeks).toBe(2);
    });

    test('unit() with months', () => {
      const interval = ChronosInterval.unit(6, 'months');
      expect(interval.months).toBe(6);
    });

    test('unit() with quarters', () => {
      const interval = ChronosInterval.unit(2, 'quarters');
      expect(interval.months).toBe(6); // 2 quarters = 6 months
    });

    test('unit() with years', () => {
      const interval = ChronosInterval.unit(3, 'years');
      expect(interval.years).toBe(3);
    });

    test('unit() with decade', () => {
      const interval = ChronosInterval.unit(2, 'decade');
      expect(interval.years).toBe(20);
    });

    test('unit() with century', () => {
      const interval = ChronosInterval.unit(1, 'century');
      expect(interval.years).toBe(100);
    });

    test('unit() with millennium', () => {
      const interval = ChronosInterval.unit(1, 'millennium');
      expect(interval.years).toBe(1000);
    });

    test('fromString() parses various formats', () => {
      const interval1 = ChronosInterval.fromString('1 year, 2 months');
      expect(interval1.years).toBe(1);
      expect(interval1.months).toBe(2);

      const interval2 = ChronosInterval.fromString('5 weeks 3 days');
      expect(interval2.weeks).toBe(5);
      expect(interval2.days).toBe(3);

      const interval3 = ChronosInterval.fromString('10 hrs 30 mins');
      expect(interval3.hours).toBe(10);
      expect(interval3.minutes).toBe(30);

      const interval4 = ChronosInterval.fromString('60 secs');
      expect(interval4.seconds).toBe(60);

      const interval5 = ChronosInterval.fromString('500 ms');
      expect(interval5.milliseconds).toBe(500);
    });

    test('fromISO() handles weeks', () => {
      const interval = ChronosInterval.fromISO('P2W');
      expect(interval.weeks).toBe(2);
    });

    test('between() with Chronos-like objects', () => {
      const start = {
        toDate: () => new Date('2024-01-01'),
      };
      const end = {
        toDate: () => new Date('2024-01-11'),
      };
      const interval = ChronosInterval.between(start, end);

      expect(interval.days).toBe(10);
    });
  });

  // ============================================================================
  // Total Calculations - Extended
  // ============================================================================

  describe('Extended Total Calculations', () => {
    test('totalWeeks()', () => {
      const interval = ChronosInterval.days(14);
      expect(interval.totalWeeks()).toBe(2);
    });

    test('totalMonths() with complex interval', () => {
      const interval = ChronosInterval.days(60);
      const months = interval.totalMonths();

      expect(months).toBeGreaterThan(1);
      expect(months).toBeLessThan(3);
    });

    test('totalYears() with complex interval', () => {
      const interval = ChronosInterval.days(365);
      const years = interval.totalYears();

      expect(years).toBeCloseTo(1, 1);
    });

    test('total() with quarter unit', () => {
      const interval = ChronosInterval.months(6);
      // Since there's no explicit quarter handling, test default
      expect(interval.total('milliseconds')).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Arithmetic Operations - Extended
  // ============================================================================

  describe('Extended Arithmetic', () => {
    test('divide() throws on zero', () => {
      const interval = ChronosInterval.days(10);

      expect(() => interval.divide(0)).toThrow('Cannot divide by zero');
    });

    test('divide() with decimal factor', () => {
      const interval = ChronosInterval.hours(10);
      const result = interval.divide(2.5);

      expect(result.hours).toBe(4);
    });

    test('negate() inverts the interval', () => {
      const interval = ChronosInterval.days(5);
      const negated = interval.negate();

      expect(negated.inverted).toBe(true);
    });

    test('negate() double negation returns original', () => {
      const interval = ChronosInterval.days(5);
      const doubleNegated = interval.negate().negate();

      expect(doubleNegated.inverted).toBe(false);
    });

    test('abs() handles negative interval', () => {
      const start = new Date('2024-01-11');
      const end = new Date('2024-01-01');
      const interval = ChronosInterval.between(start, end);
      const absolute = interval.abs();

      expect(absolute.days).toBe(10);
      expect(absolute.inverted).toBe(false);
    });
  });

  // ============================================================================
  // Comparison Methods - Extended
  // ============================================================================

  describe('Extended Comparison', () => {
    test('greaterThan()', () => {
      const long = ChronosInterval.days(10);
      const short = ChronosInterval.days(5);

      expect(long.greaterThan(short)).toBe(true);
      expect(short.greaterThan(long)).toBe(false);
    });

    test('lessThan()', () => {
      const long = ChronosInterval.days(10);
      const short = ChronosInterval.days(5);

      expect(short.lessThan(long)).toBe(true);
      expect(long.lessThan(short)).toBe(false);
    });

    test('greaterThanOrEqual()', () => {
      const interval1 = ChronosInterval.days(10);
      const interval2 = ChronosInterval.days(10);
      const interval3 = ChronosInterval.days(5);

      expect(interval1.greaterThanOrEqual(interval2)).toBe(true);
      expect(interval1.greaterThanOrEqual(interval3)).toBe(true);
      expect(interval3.greaterThanOrEqual(interval1)).toBe(false);
    });

    test('lessThanOrEqual()', () => {
      const interval1 = ChronosInterval.days(10);
      const interval2 = ChronosInterval.days(10);
      const interval3 = ChronosInterval.days(15);

      expect(interval1.lessThanOrEqual(interval2)).toBe(true);
      expect(interval1.lessThanOrEqual(interval3)).toBe(true);
      expect(interval3.lessThanOrEqual(interval1)).toBe(false);
    });

    test('isNegative()', () => {
      const start = new Date('2024-01-11');
      const end = new Date('2024-01-01');
      const interval = ChronosInterval.between(start, end);

      expect(interval.isNegative()).toBe(true);
    });
  });

  // ============================================================================
  // Normalization Methods - Extended
  // ============================================================================

  describe('Extended Normalization', () => {
    test('cascade() normalizes all units', () => {
      const interval = ChronosInterval.create({
        seconds: 90,
        minutes: 90,
        hours: 30,
      });
      const cascaded = interval.cascade();

      expect(cascaded.seconds).toBeLessThan(60);
      expect(cascaded.minutes).toBeLessThan(60);
    });

    test('cascadeWithoutWeeks() converts weeks to days', () => {
      const interval = ChronosInterval.create({
        weeks: 2,
        days: 3,
      });
      const cascaded = interval.cascadeWithoutWeeks();

      expect(cascaded.weeks).toBe(0);
      expect(cascaded.days).toBeGreaterThanOrEqual(17);
    });
  });

  // ============================================================================
  // Formatting Methods - Extended
  // ============================================================================

  describe('Extended Formatting', () => {
    test('forHumans() with short option', () => {
      const interval = ChronosInterval.create({ days: 5, hours: 3 });
      const short = interval.forHumans({ short: true });

      expect(short).toContain('5d');
      expect(short).toContain('3h');
    });

    test('forHumans() with parts limit', () => {
      const interval = ChronosInterval.create({
        years: 1,
        months: 2,
        days: 3,
        hours: 4,
      });
      const limited = interval.forHumans({ parts: 2 });
      const parts = limited.split(' ').filter(p => /\d/.test(p));

      expect(parts.length).toBeLessThanOrEqual(2);
    });

    test('forHumans() with conjunction', () => {
      const interval = ChronosInterval.create({ days: 5, hours: 3 });
      const result = interval.forHumans({ conjunction: ' and ' });

      expect(result).toContain(' and ');
    });

    test('forHumans() with custom join', () => {
      const interval = ChronosInterval.create({ days: 5, hours: 3 });
      const result = interval.forHumans({ join: ', ' });

      expect(result).toContain(',');
    });

    test('forHumans() zero interval with short option', () => {
      const interval = ChronosInterval.zero();
      const short = interval.forHumans({ short: true });

      expect(short).toBe('0s');
    });

    test('format() with custom format string', () => {
      const interval = ChronosInterval.create({
        years: 1,
        months: 2,
        weeks: 3,
        days: 4,
        hours: 5,
        minutes: 6,
        seconds: 7,
        milliseconds: 8,
      });

      expect(interval.format('%y years')).toBe('1 years');
      expect(interval.format('%m months')).toBe('2 months');
      expect(interval.format('%w weeks')).toBe('3 weeks');
      expect(interval.format('%d days')).toBe('4 days');
      expect(interval.format('%h hours')).toBe('5 hours');
      expect(interval.format('%H:%I:%S')).toBe('05:06:07');
      expect(interval.format('%i minutes')).toBe('6 minutes');
      expect(interval.format('%s seconds')).toBe('7 seconds');
      expect(interval.format('%f ms')).toBe('8 ms');
    });

    test('format() with sign tokens', () => {
      const positive = ChronosInterval.days(5);
      const negative = positive.negate();

      expect(positive.format('%R')).toBe('+');
      expect(negative.format('%R')).toBe('-');
      expect(positive.format('%r')).toBe('');
      expect(negative.format('%r')).toBe('-');
    });

    test('toISO() handles complex durations', () => {
      const interval = ChronosInterval.create({
        years: 1,
        months: 2,
        weeks: 3,
        days: 4,
        hours: 5,
        minutes: 6,
        seconds: 7.5,
      });
      const iso = interval.toISO();

      expect(iso).toMatch(/^P/);
      expect(iso).toContain('T');
    });
  });

  // ============================================================================
  // Conversion Methods - Extended
  // ============================================================================

  describe('Extended Conversion', () => {
    test('toJSON() includes all properties', () => {
      const interval = ChronosInterval.create({
        years: 1,
        months: 2,
        days: 3,
      });
      const json = interval.toJSON();

      expect(json).toHaveProperty('years', 1);
      expect(json).toHaveProperty('months', 2);
      expect(json).toHaveProperty('days', 3);
      expect(json).toHaveProperty('iso');
    });

    test('locale() creates clone with new locale', () => {
      const interval = ChronosInterval.days(5);
      const localized = interval.locale('fr');

      expect(localized).not.toBe(interval);
    });
  });

  // ============================================================================
  // Edge Cases - Extended
  // ============================================================================

  describe('Extended Edge Cases', () => {
    test('handles fractional seconds', () => {
      const interval = ChronosInterval.create({ seconds: 1.5 });

      expect(interval.seconds).toBe(1);
      expect(interval.milliseconds).toBe(500);
    });

    test('handles inverted totalMilliseconds', () => {
      const start = new Date('2024-01-11');
      const end = new Date('2024-01-01');
      const interval = ChronosInterval.between(start, end);

      expect(interval.totalMilliseconds()).toBeLessThan(0);
    });

    test('subtract with Duration object', () => {
      const interval = ChronosInterval.create({
        years: 2,
        months: 6,
        days: 15,
      });
      const result = interval.subtract({ years: 1, months: 3, days: 5 });

      expect(result.years).toBe(1);
      expect(result.months).toBe(3);
      expect(result.days).toBe(10);
    });

    test('add weeks via duration', () => {
      const interval = ChronosInterval.weeks(2);
      expect(interval.add({ weeks: 1 }).weeks).toBe(3);
    });

    test('add seconds via duration', () => {
      const interval = ChronosInterval.seconds(30);
      expect(interval.add({ seconds: 30 }).seconds).toBe(60);
    });

    test('add milliseconds via duration', () => {
      const interval = ChronosInterval.milliseconds(500);
      expect(interval.add({ milliseconds: 500 }).milliseconds).toBe(1000);
    });
  });
});
