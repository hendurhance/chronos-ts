import { ChronosPeriod } from '../src/core/period';
import { Chronos } from '../src/core/chronos';
import { ChronosInterval } from '../src/core/interval';

describe('ChronosPeriod Extended Tests', () => {
  // ============================================================================
  // Extended Factory Methods
  // ============================================================================

  describe('Extended Factory Methods', () => {
    test('years() creates yearly period', () => {
      const period = ChronosPeriod.years('2024-01-01', 3);

      expect(period.interval.years).toBe(1);
    });

    test('year() creates period for specific year', () => {
      const period = ChronosPeriod.year(2024);

      expect(period.start.format('YYYY-MM-DD')).toBe('2024-01-01');
      expect(period.end?.format('YYYY-MM-DD')).toBe('2024-12-31');
    });

    test('currentQuarter() creates period for current quarter', () => {
      const period = ChronosPeriod.currentQuarter();
      const now = Chronos.now();

      expect(period.start.isSameOrBefore(now)).toBe(true);
    });

    test('between() is alias for create', () => {
      const period1 = ChronosPeriod.create('2024-01-01', '2024-01-31');
      const period2 = ChronosPeriod.between('2024-01-01', '2024-01-31');

      expect(period1.start.format('YYYY-MM-DD')).toBe(
        period2.start.format('YYYY-MM-DD'),
      );
    });

    test('fromISO() parses repeating interval with recurrences', () => {
      const period = ChronosPeriod.fromISO('R5/2024-01-01/P1D');

      expect(period.recurrences).toBe(5);
      expect(period.count()).toBe(5);
    });

    test('fromISO() parses repeating interval without count (infinite)', () => {
      const period = ChronosPeriod.fromISO('R/2024-01-01/P1D');
      // Should have infinite recurrences
      expect(period.recurrences).toBe(Infinity);
      // Don't try to iterate - it will throw
    });

    test('fromISO() parses date range', () => {
      const period = ChronosPeriod.fromISO('2024-01-01/2024-01-31');

      expect(period.start.format('YYYY-MM-DD')).toBe('2024-01-01');
      expect(period.end?.format('YYYY-MM-DD')).toBe('2024-01-31');
    });

    test('fromISO() parses date with duration', () => {
      const period = ChronosPeriod.fromISO('2024-01-01/P1M');

      expect(period.start.format('YYYY-MM-DD')).toBe('2024-01-01');
    });

    test('fromISO() parses repeating interval with end date', () => {
      const period = ChronosPeriod.fromISO('R10/2024-01-01/2024-01-15');

      expect(period.recurrences).toBe(10);
    });

    test('fromISO() throws on invalid format', () => {
      expect(() => ChronosPeriod.fromISO('invalid')).toThrow();
    });
  });

  // ============================================================================
  // Getters - Extended
  // ============================================================================

  describe('Extended Getters', () => {
    test('hasEnd returns true when end is set', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-31');

      expect(period.hasEnd).toBe(true);
    });

    test('hasEnd returns true when recurrences is set', () => {
      const period = ChronosPeriod.recur('2024-01-01').times(5);

      expect(period.hasEnd).toBe(true);
    });

    test('isUnbounded returns true for unbounded period', () => {
      const period = ChronosPeriod.recur('2024-01-01');

      expect(period.isUnbounded).toBe(true);
    });

    test('isUnbounded returns false when end or recurrences set', () => {
      const period1 = ChronosPeriod.create('2024-01-01', '2024-01-31');
      const period2 = ChronosPeriod.recur('2024-01-01').times(5);

      expect(period1.isUnbounded).toBe(false);
      expect(period2.isUnbounded).toBe(false);
    });
  });

  // ============================================================================
  // Setters - Extended
  // ============================================================================

  describe('Extended Setters', () => {
    test('setInterval with ChronosInterval', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-31');
      const newPeriod = period.setInterval(ChronosInterval.weeks(1));

      expect(newPeriod.interval.weeks).toBe(1);
    });

    test('every() with various units', () => {
      const base = ChronosPeriod.create('2024-01-01', '2024-12-31');

      expect(base.every(500, 'milliseconds').interval.milliseconds).toBe(500);
      expect(base.every(30, 'seconds').interval.seconds).toBe(30);
      expect(base.every(15, 'minutes').interval.minutes).toBe(15);
      expect(base.every(2, 'hours').interval.hours).toBe(2);
      expect(base.every(3, 'weeks').interval.weeks).toBe(3);
      expect(base.every(2, 'quarters').interval.months).toBe(6);
      expect(base.every(1, 'year').interval.years).toBe(1);
    });

    test('includeStart() includes start boundary', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-05')
        .excludeStart()
        .includeStart();

      expect(period.includesStart).toBe(true);
    });

    test('includeEnd() includes end boundary', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-05')
        .excludeEnd()
        .includeEnd();

      expect(period.includesEnd).toBe(true);
    });
  });

  // ============================================================================
  // Filters - Extended
  // ============================================================================

  describe('Extended Filters', () => {
    test('onlyMonths() filters to specific months', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-12-31')
        .every(1, 'month')
        .onlyMonths(3, 6, 9, 12);

      const dates = period.toArray();

      dates.forEach((date) => {
        expect([3, 6, 9, 12]).toContain(date.month);
      });
    });

    test('exceptMonths() excludes specific months', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-12-31')
        .every(1, 'month')
        .exceptMonths(1, 7);

      const dates = period.toArray();

      dates.forEach((date) => {
        expect(date.month).not.toBe(1);
        expect(date.month).not.toBe(7);
      });
    });
  });

  // ============================================================================
  // Iteration - Extended
  // ============================================================================

  describe('Extended Iteration', () => {
    test('nth() returns null for out of bounds index', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-05');

      expect(period.nth(100)).toBeNull();
    });

    test('first() returns null for empty period', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-05')
        .filter(() => false);

      expect(period.first()).toBeNull();
    });

    test('last() returns null for empty period', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-05')
        .filter(() => false);

      expect(period.last()).toBeNull();
    });

    test('unbounded period throws at iteration limit', () => {
      const period = ChronosPeriod.recur('2024-01-01', { days: 1 });

      expect(() => period.toArray()).toThrow('Maximum iteration limit reached');
    });
  });

  // ============================================================================
  // Range Operations - Extended
  // ============================================================================

  describe('Extended Range Operations', () => {
    test('union() returns merged period', () => {
      const period1 = ChronosPeriod.create('2024-01-01', '2024-01-20');
      const period2 = ChronosPeriod.create('2024-01-10', '2024-01-31');
      const union = period1.union(period2);

      expect(union?.start.format('YYYY-MM-DD')).toBe('2024-01-01');
      expect(union?.end?.format('YYYY-MM-DD')).toBe('2024-01-31');
    });

    test('union() returns null for non-overlapping non-adjacent', () => {
      const period1 = ChronosPeriod.create('2024-01-01', '2024-01-10');
      const period2 = ChronosPeriod.create('2024-02-01', '2024-02-28');

      expect(period1.union(period2)).toBeNull();
    });

    test('union() works for adjacent periods', () => {
      const period1 = ChronosPeriod.create('2024-01-01', '2024-01-15');
      const period2 = ChronosPeriod.create('2024-01-16', '2024-01-31');
      const union = period1.union(period2);

      expect(union).not.toBeNull();
    });

    test('diff() returns difference between periods', () => {
      const period1 = ChronosPeriod.create('2024-01-01', '2024-01-31');
      const period2 = ChronosPeriod.create('2024-01-10', '2024-01-20');
      const diffs = period1.diff(period2);

      expect(diffs.length).toBe(2);
    });

    test('diff() returns clone for non-overlapping', () => {
      const period1 = ChronosPeriod.create('2024-01-01', '2024-01-10');
      const period2 = ChronosPeriod.create('2024-02-01', '2024-02-28');
      const diffs = period1.diff(period2);

      expect(diffs.length).toBe(1);
      expect(diffs[0].start.format('YYYY-MM-DD')).toBe('2024-01-01');
    });

    test('overlaps() with unbounded periods', () => {
      const bounded = ChronosPeriod.create('2024-01-01', '2024-01-31');
      const unbounded = ChronosPeriod.recur('2024-01-15').times(5);

      // Bounded period should check against available dates
      expect(bounded.overlaps(unbounded)).toBe(true);
    });

    test('intersect() with unbounded period', () => {
      const bounded = ChronosPeriod.create('2024-01-01', '2024-01-31');
      const unbounded = ChronosPeriod.recur('2024-01-15').times(5);
      const intersection = bounded.intersect(unbounded);

      expect(intersection).not.toBeNull();
    });
  });

  // ============================================================================
  // Duration - Extended
  // ============================================================================

  describe('Extended Duration', () => {
    test('duration() throws for unbounded period', () => {
      const period = ChronosPeriod.recur('2024-01-01');

      expect(() => period.duration()).toThrow('Cannot get duration of unbounded period');
    });

    test('days() throws for unbounded period', () => {
      const period = ChronosPeriod.recur('2024-01-01');

      expect(() => period.days()).toThrow('Cannot get days of unbounded period');
    });

    test('weeks() throws for unbounded period', () => {
      const period = ChronosPeriod.recur('2024-01-01');

      expect(() => period.weeks()).toThrow('Cannot get weeks of unbounded period');
    });

    test('monthCount() throws for unbounded period', () => {
      const period = ChronosPeriod.recur('2024-01-01');

      expect(() => period.monthCount()).toThrow('Cannot get months of unbounded period');
    });

    test('yearCount() returns year count', () => {
      const period = ChronosPeriod.create('2024-01-01', '2027-01-01');

      expect(period.yearCount()).toBe(3);
    });

    test('yearCount() throws for unbounded period', () => {
      const period = ChronosPeriod.recur('2024-01-01');

      expect(() => period.yearCount()).toThrow('Cannot get years of unbounded period');
    });
  });

  // ============================================================================
  // Splitting - Extended
  // ============================================================================

  describe('Extended Splitting', () => {
    test('split() throws for unbounded period', () => {
      const period = ChronosPeriod.recur('2024-01-01');

      expect(() => period.split(3)).toThrow('Cannot split unbounded period');
    });

    test('splitBy() throws for unbounded period', () => {
      const period = ChronosPeriod.recur('2024-01-01');

      expect(() => period.splitBy({ days: 7 })).toThrow('Cannot split unbounded period');
    });

    test('splitBy() with ChronosInterval', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-28');
      const chunks = period.splitBy(ChronosInterval.weeks(1));

      expect(chunks.length).toBe(4);
    });
  });

  // ============================================================================
  // Formatting - Extended
  // ============================================================================

  describe('Extended Formatting', () => {
    test('forHumans() returns human readable string', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-10');
      const human = period.forHumans();

      expect(human).toContain('dates');
      expect(human).toContain('from');
      expect(human).toContain('to');
    });

    test('toString() with unbounded period', () => {
      const period = ChronosPeriod.recur('2024-01-01');
      const str = period.toString();

      expect(str).toContain('...');
    });

    test('toISO() with recurrences', () => {
      const period = ChronosPeriod.recur('2024-01-01', { days: 1 }).times(5);
      const iso = period.toISO();

      expect(iso).toContain('R5');
    });

    test('toISO() with infinite recurrences', () => {
      const period = ChronosPeriod.recur('2024-01-01', { days: 1 }).times(Infinity);
      const iso = period.toISO();

      expect(iso).toContain('R/');
    });
  });

  // ============================================================================
  // Cloning and Locale
  // ============================================================================

  describe('Cloning and Locale', () => {
    test('locale() creates clone with new locale', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-31');
      const localized = period.locale('fr');

      expect(localized).not.toBe(period);
    });
  });

  // ============================================================================
  // Static Helpers - Extended
  // ============================================================================

  describe('Extended Static Helpers', () => {
    test('businessDays() without holidays', () => {
      const period = ChronosPeriod.businessDays('2024-01-01', '2024-01-31');
      const dates = period.toArray();

      dates.forEach((date) => {
        expect(date.dayOfWeek).not.toBe(0);
        expect(date.dayOfWeek).not.toBe(6);
      });
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    test('iteration with mutable option', () => {
      const period = new ChronosPeriod('2024-01-01', '2024-01-05', undefined, {
        immutable: false,
      });
      const dates = period.toArray();

      expect(dates.length).toBe(5);
    });

    test('filter with index parameter', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-10')
        .filter((_, index) => index % 2 === 0);

      const dates = period.toArray();

      expect(dates.length).toBe(5);
    });

    test('map with index parameter', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-03');
      const mapped = period.map((date, index) => `${index}: ${date.format('DD')}`);

      expect(mapped[0]).toBe('0: 01');
      expect(mapped[1]).toBe('1: 02');
      expect(mapped[2]).toBe('2: 03');
    });

    test('forEach with index parameter', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-03');
      const indices: number[] = [];

      period.forEach((_, index) => {
        indices.push(index);
      });

      expect(indices).toEqual([0, 1, 2]);
    });

    test('reduce with index parameter', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-05');
      const sum = period.reduce((acc, _, index) => acc + index, 0);

      expect(sum).toBe(0 + 1 + 2 + 3 + 4);
    });
  });
});
