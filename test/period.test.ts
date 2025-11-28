import { ChronosPeriod } from '../src/core/period';
import { Chronos } from '../src/core/chronos';

describe('ChronosPeriod', () => {
  // ============================================================================
  // Factory Methods
  // ============================================================================

  describe('Factory Methods', () => {
    test('create() with start and end', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-31');

      expect(period.start.format('YYYY-MM-DD')).toBe('2024-01-01');
      expect(period.end?.format('YYYY-MM-DD')).toBe('2024-01-31');
    });

    test('create() with custom interval', () => {
      const period = ChronosPeriod.create(
        '2024-01-01',
        '2024-01-31',
        { days: 7 }
      );

      expect(period.interval.days).toBe(7);
    });

    test('days() creates daily period', () => {
      const period = ChronosPeriod.days('2024-01-01', 7);
      const dates = period.toArray();

      expect(dates.length).toBe(7);
    });

    test('weeks() creates weekly period', () => {
      const period = ChronosPeriod.weeks('2024-01-01', 4);

      expect(period.interval.weeks).toBe(1);
    });

    test('months() creates monthly period', () => {
      const period = ChronosPeriod.months('2024-01-01', 3);

      expect(period.interval.months).toBe(1);
    });

    test('currentMonth() creates period for current month', () => {
      const period = ChronosPeriod.currentMonth();
      const now = Chronos.now();

      expect(period.start.month).toBe(now.month);
    });

    test('currentWeek() creates period for current week', () => {
      const period = ChronosPeriod.currentWeek();

      expect(period.start.dayOfWeek).toBe(0); // Sunday
    });

    test('month() creates period for specific month', () => {
      const period = ChronosPeriod.month(2024, 2);

      expect(period.start.format('YYYY-MM-DD')).toBe('2024-02-01');
      expect(period.end?.day).toBe(29); // Leap year
    });

    test('quarter() creates period for specific quarter', () => {
      const period = ChronosPeriod.quarter(2024, 2);

      expect(period.start.month).toBe(4); // April
    });
  });

  // ============================================================================
  // Iteration
  // ============================================================================

  describe('Iteration', () => {
    test('iterates over dates', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-05');
      const dates = period.toArray();

      expect(dates.length).toBe(5);
      expect(dates[0].format('YYYY-MM-DD')).toBe('2024-01-01');
      expect(dates[4].format('YYYY-MM-DD')).toBe('2024-01-05');
    });

    test('respects custom interval', () => {
      const period = ChronosPeriod.create(
        '2024-01-01',
        '2024-01-15',
        { days: 3 }
      );
      const dates = period.toArray();

      expect(dates[0].format('YYYY-MM-DD')).toBe('2024-01-01');
      expect(dates[1].format('YYYY-MM-DD')).toBe('2024-01-04');
      expect(dates[2].format('YYYY-MM-DD')).toBe('2024-01-07');
    });

    test('supports for...of iteration', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-03');
      const dates: Chronos[] = [];

      for (const date of period) {
        dates.push(date);
      }

      expect(dates.length).toBe(3);
    });

    test('count() returns number of dates', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-10');

      expect(period.count()).toBe(10);
    });

    test('first() returns first date', () => {
      const period = ChronosPeriod.create('2024-01-15', '2024-01-20');

      expect(period.first()?.format('YYYY-MM-DD')).toBe('2024-01-15');
    });

    test('last() returns last date', () => {
      const period = ChronosPeriod.create('2024-01-15', '2024-01-20');

      expect(period.last()?.format('YYYY-MM-DD')).toBe('2024-01-20');
    });

    test('nth() returns date at index', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-10');

      expect(period.nth(0)?.format('YYYY-MM-DD')).toBe('2024-01-01');
      expect(period.nth(4)?.format('YYYY-MM-DD')).toBe('2024-01-05');
    });
  });

  // ============================================================================
  // Filters
  // ============================================================================

  describe('Filters', () => {
    test('filter() applies custom filter', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-10')
        .filter(date => date.day % 2 === 0);

      const dates = period.toArray();
      dates.forEach(date => {
        expect(date.day % 2).toBe(0);
      });
    });

    test('weekdays() filters to weekdays only', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-07').weekdays();
      const dates = period.toArray();

      dates.forEach(date => {
        expect(date.dayOfWeek).not.toBe(0); // Not Sunday
        expect(date.dayOfWeek).not.toBe(6); // Not Saturday
      });
    });

    test('weekends() filters to weekends only', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-14').weekends();
      const dates = period.toArray();

      dates.forEach(date => {
        expect([0, 6]).toContain(date.dayOfWeek);
      });
    });

    test('onlyDays() filters specific days', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-31')
        .onlyDays(1, 3, 5); // Mon, Wed, Fri

      const dates = period.toArray();
      dates.forEach(date => {
        expect([1, 3, 5]).toContain(date.dayOfWeek);
      });
    });

    test('exceptDays() excludes specific days', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-31')
        .exceptDays(0, 6); // Exclude Sun and Sat

      const dates = period.toArray();
      dates.forEach(date => {
        expect(date.dayOfWeek).not.toBe(0);
        expect(date.dayOfWeek).not.toBe(6);
      });
    });

    test('clearFilters() removes all filters', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-07')
        .weekdays()
        .clearFilters();

      expect(period.count()).toBe(7);
    });
  });

  // ============================================================================
  // Boundaries
  // ============================================================================

  describe('Boundaries', () => {
    test('excludeStart() excludes start date', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-05')
        .excludeStart();

      const dates = period.toArray();
      expect(dates[0].format('YYYY-MM-DD')).toBe('2024-01-02');
    });

    test('excludeEnd() excludes end date', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-05')
        .excludeEnd();

      const dates = period.toArray();
      expect(dates[dates.length - 1].format('YYYY-MM-DD')).toBe('2024-01-04');
    });

    test('includesStart getter', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-05');

      expect(period.includesStart).toBe(true);
      expect(period.excludeStart().includesStart).toBe(false);
    });

    test('includesEnd getter', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-05');

      expect(period.includesEnd).toBe(true);
      expect(period.excludeEnd().includesEnd).toBe(false);
    });
  });

  // ============================================================================
  // Setters
  // ============================================================================

  describe('Setters', () => {
    test('setStart() changes start date', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-31')
        .setStart('2024-01-15');

      expect(period.start.format('YYYY-MM-DD')).toBe('2024-01-15');
    });

    test('setEnd() changes end date', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-15')
        .setEnd('2024-01-31');

      expect(period.end?.format('YYYY-MM-DD')).toBe('2024-01-31');
    });

    test('setInterval() changes interval', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-31')
        .setInterval({ days: 7 });

      expect(period.interval.days).toBe(7);
    });

    test('every() sets interval by unit', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-03-31')
        .every(2, 'weeks');

      expect(period.interval.weeks).toBe(2);
    });

    test('times() sets recurrence count', () => {
      const period = ChronosPeriod.recur('2024-01-01', { days: 1 })
        .times(5);

      expect(period.recurrences).toBe(5);
      expect(period.count()).toBe(5);
    });
  });

  // ============================================================================
  // Range Operations
  // ============================================================================

  describe('Range Operations', () => {
    test('contains() checks if date is in period', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-31');

      expect(period.contains('2024-01-15')).toBe(true);
      expect(period.contains('2024-02-15')).toBe(false);
    });

    test('overlaps() checks period overlap', () => {
      const period1 = ChronosPeriod.create('2024-01-01', '2024-01-15');
      const period2 = ChronosPeriod.create('2024-01-10', '2024-01-25');
      const period3 = ChronosPeriod.create('2024-02-01', '2024-02-15');

      expect(period1.overlaps(period2)).toBe(true);
      expect(period1.overlaps(period3)).toBe(false);
    });

    test('intersect() returns overlapping period', () => {
      const period1 = ChronosPeriod.create('2024-01-01', '2024-01-20');
      const period2 = ChronosPeriod.create('2024-01-10', '2024-01-31');
      const intersection = period1.intersect(period2);

      expect(intersection?.start.format('YYYY-MM-DD')).toBe('2024-01-10');
      expect(intersection?.end?.format('YYYY-MM-DD')).toBe('2024-01-20');
    });

    test('intersect() returns null for non-overlapping', () => {
      const period1 = ChronosPeriod.create('2024-01-01', '2024-01-15');
      const period2 = ChronosPeriod.create('2024-02-01', '2024-02-15');

      expect(period1.intersect(period2)).toBeNull();
    });
  });

  // ============================================================================
  // Duration
  // ============================================================================

  describe('Duration', () => {
    test('days() returns day count', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-11');

      expect(period.days()).toBe(10);
    });

    test('weeks() returns week count', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-29');

      expect(period.weeks()).toBe(4);
    });

    test('monthCount() returns month count', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-04-01');

      expect(period.monthCount()).toBe(3);
    });

    test('duration() returns ChronosInterval', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-11');
      const duration = period.duration();

      expect(duration.days).toBe(10);
    });
  });

  // ============================================================================
  // Splitting
  // ============================================================================

  describe('Splitting', () => {
    test('split() divides period into chunks', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-30');
      const chunks = period.split(3);

      expect(chunks.length).toBe(3);
    });

    test('splitBy() divides by interval', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-31');
      const chunks = period.splitBy({ days: 7 });

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].days()).toBeLessThanOrEqual(7);
    });
  });

  // ============================================================================
  // Functional Methods
  // ============================================================================

  describe('Functional Methods', () => {
    test('forEach() iterates with callback', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-05');
      const dates: string[] = [];

      period.forEach((date) => {
        dates.push(date.format('YYYY-MM-DD'));
      });

      expect(dates.length).toBe(5);
    });

    test('map() transforms dates', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-03');
      const formatted = period.map(date => date.format('DD'));

      expect(formatted).toEqual(['01', '02', '03']);
    });

    test('reduce() aggregates values', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-05');
      const sum = period.reduce((acc, date) => acc + date.day, 0);

      expect(sum).toBe(1 + 2 + 3 + 4 + 5);
    });
  });

  // ============================================================================
  // Formatting
  // ============================================================================

  describe('Formatting', () => {
    test('toString() returns readable string', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-31');
      const str = period.toString();

      expect(str).toContain('2024-01-01');
      expect(str).toContain('2024-01-31');
    });

    test('toISO() returns ISO format', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-31');
      const iso = period.toISO();

      expect(iso).toContain('2024-01-01');
    });

    test('toJSON() returns JSON object', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-31');
      const json = period.toJSON();

      expect(json).toHaveProperty('start');
      expect(json).toHaveProperty('end');
      expect(json).toHaveProperty('interval');
    });
  });

  // ============================================================================
  // Static Helpers
  // ============================================================================

  describe('Static Helpers', () => {
    test('weekdaysBetween() creates weekday-only period', () => {
      const period = ChronosPeriod.weekdaysBetween('2024-01-01', '2024-01-14');
      const dates = period.toArray();

      dates.forEach(date => {
        expect(date.dayOfWeek).not.toBe(0);
        expect(date.dayOfWeek).not.toBe(6);
      });
    });

    test('businessDays() excludes holidays', () => {
      const holidays = ['2024-01-15'];
      const period = ChronosPeriod.businessDays('2024-01-01', '2024-01-31', holidays);
      const dates = period.toArray();

      const hasHoliday = dates.some(d => d.format('YYYY-MM-DD') === '2024-01-15');
      expect(hasHoliday).toBe(false);
    });
  });

  // ============================================================================
  // Cloning
  // ============================================================================

  describe('Cloning', () => {
    test('clone() creates independent copy', () => {
      const original = ChronosPeriod.create('2024-01-01', '2024-01-31');
      const clone = original.clone();

      expect(clone.start.format('YYYY-MM-DD')).toBe(original.start.format('YYYY-MM-DD'));
      expect(clone).not.toBe(original);
    });

    test('modifications return new instances by default', () => {
      const original = ChronosPeriod.create('2024-01-01', '2024-01-31');
      const modified = original.setStart('2024-01-15');

      expect(original.start.format('YYYY-MM-DD')).toBe('2024-01-01');
      expect(modified.start.format('YYYY-MM-DD')).toBe('2024-01-15');
    });
  });

  // ============================================================================
  // Convenience Aliases (thisWeek, thisMonth, lastWeek, etc.)
  // ============================================================================

  describe('Convenience Aliases', () => {
    test('thisWeek() is alias for currentWeek()', () => {
      const thisWeek = ChronosPeriod.thisWeek();
      const currentWeek = ChronosPeriod.currentWeek();

      expect(thisWeek.start.format('YYYY-MM-DD')).toBe(currentWeek.start.format('YYYY-MM-DD'));
      expect(thisWeek.end?.format('YYYY-MM-DD')).toBe(currentWeek.end?.format('YYYY-MM-DD'));
    });

    test('thisMonth() is alias for currentMonth()', () => {
      const thisMonth = ChronosPeriod.thisMonth();
      const currentMonth = ChronosPeriod.currentMonth();

      expect(thisMonth.start.format('YYYY-MM-DD')).toBe(currentMonth.start.format('YYYY-MM-DD'));
      expect(thisMonth.end?.format('YYYY-MM-DD')).toBe(currentMonth.end?.format('YYYY-MM-DD'));
    });

    test('thisYear() is alias for currentYear()', () => {
      const thisYear = ChronosPeriod.thisYear();
      const currentYear = ChronosPeriod.currentYear();

      expect(thisYear.start.format('YYYY-MM-DD')).toBe(currentYear.start.format('YYYY-MM-DD'));
      expect(thisYear.end?.format('YYYY-MM-DD')).toBe(currentYear.end?.format('YYYY-MM-DD'));
    });

    test('thisQuarter() is alias for currentQuarter()', () => {
      const thisQuarter = ChronosPeriod.thisQuarter();
      const currentQuarter = ChronosPeriod.currentQuarter();

      expect(thisQuarter.start.format('YYYY-MM-DD')).toBe(currentQuarter.start.format('YYYY-MM-DD'));
      expect(thisQuarter.end?.format('YYYY-MM-DD')).toBe(currentQuarter.end?.format('YYYY-MM-DD'));
    });

    test('lastWeek() creates period for previous week', () => {
      const lastWeek = ChronosPeriod.lastWeek();
      const now = Chronos.now();
      const expectedStart = now.subtract({ weeks: 1 }).startOf('week');

      expect(lastWeek.start.format('YYYY-MM-DD')).toBe(expectedStart.format('YYYY-MM-DD'));
    });

    test('lastMonth() creates period for previous month', () => {
      const lastMonth = ChronosPeriod.lastMonth();
      const now = Chronos.now();
      const expectedStart = now.subtract({ months: 1 }).startOf('month');

      expect(lastMonth.start.format('YYYY-MM-DD')).toBe(expectedStart.format('YYYY-MM-DD'));
    });

    test('lastYear() creates period for previous year', () => {
      const lastYear = ChronosPeriod.lastYear();
      const now = Chronos.now();
      const expectedStart = now.subtract({ years: 1 }).startOf('year');

      expect(lastYear.start.format('YYYY-MM-DD')).toBe(expectedStart.format('YYYY-MM-DD'));
    });

    test('lastQuarter() creates period for previous quarter', () => {
      const lastQuarter = ChronosPeriod.lastQuarter();
      const now = Chronos.now();
      const expectedStart = now.subtract({ months: 3 }).startOf('quarter');

      expect(lastQuarter.start.format('YYYY-MM-DD')).toBe(expectedStart.format('YYYY-MM-DD'));
    });

    test('nextWeek() creates period for next week', () => {
      const nextWeek = ChronosPeriod.nextWeek();
      const now = Chronos.now();
      const expectedStart = now.add({ weeks: 1 }).startOf('week');

      expect(nextWeek.start.format('YYYY-MM-DD')).toBe(expectedStart.format('YYYY-MM-DD'));
    });

    test('nextMonth() creates period for next month', () => {
      const nextMonth = ChronosPeriod.nextMonth();
      const now = Chronos.now();
      const expectedStart = now.add({ months: 1 }).startOf('month');

      expect(nextMonth.start.format('YYYY-MM-DD')).toBe(expectedStart.format('YYYY-MM-DD'));
    });

    test('nextYear() creates period for next year', () => {
      const nextYear = ChronosPeriod.nextYear();
      const now = Chronos.now();
      const expectedStart = now.add({ years: 1 }).startOf('year');

      expect(nextYear.start.format('YYYY-MM-DD')).toBe(expectedStart.format('YYYY-MM-DD'));
    });

    test('nextQuarter() creates period for next quarter', () => {
      const nextQuarter = ChronosPeriod.nextQuarter();
      const now = Chronos.now();
      const expectedStart = now.add({ months: 3 }).startOf('quarter');

      expect(nextQuarter.start.format('YYYY-MM-DD')).toBe(expectedStart.format('YYYY-MM-DD'));
    });
  });

  // ============================================================================
  // Filter Aliases
  // ============================================================================

  describe('Filter Aliases', () => {
    test('filterWeekdays() is alias for weekdays()', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-14');
      const weekdays = period.weekdays().toArray();
      const filterWeekdays = period.filterWeekdays().toArray();

      expect(weekdays.length).toBe(filterWeekdays.length);
      weekdays.forEach((date, i) => {
        expect(date.format('YYYY-MM-DD')).toBe(filterWeekdays[i].format('YYYY-MM-DD'));
      });
    });

    test('filterWeekends() is alias for weekends()', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-14');
      const weekends = period.weekends().toArray();
      const filterWeekends = period.filterWeekends().toArray();

      expect(weekends.length).toBe(filterWeekends.length);
      weekends.forEach((date, i) => {
        expect(date.format('YYYY-MM-DD')).toBe(filterWeekends[i].format('YYYY-MM-DD'));
      });
    });
  });

  // ============================================================================
  // SplitBy Convenience Methods
  // ============================================================================

  describe('SplitBy Convenience Methods', () => {
    test('splitByDays() splits period by specified days', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-28');
      const chunks = period.splitByDays(7);

      expect(chunks.length).toBe(4);
      chunks.forEach(chunk => {
        expect(chunk.days()).toBeLessThanOrEqual(7);
      });
    });

    test('splitByWeeks() splits period by specified weeks', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-02-28');
      const chunks = period.splitByWeeks(2);

      expect(chunks.length).toBeGreaterThan(0);
    });

    test('splitByMonths() splits period by specified months', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-06-30');
      const chunks = period.splitByMonths(1);

      expect(chunks.length).toBe(6);
    });

    test('splitByYears() splits period by specified years', () => {
      const period = ChronosPeriod.create('2024-01-01', '2026-12-31');
      const chunks = period.splitByYears(1);

      expect(chunks.length).toBe(3);
    });

    test('splitByDays() handles remaining days', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-10');
      const chunks = period.splitByDays(3);

      expect(chunks.length).toBe(4); // 3+3+3+1
    });
  });

  // ============================================================================
  // Skip Method
  // ============================================================================

  describe('Skip Method', () => {
    test('skip() excludes specified dates', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-10');
      const skipped = period.skip(['2024-01-05', '2024-01-06']);
      const dates = skipped.toArray();

      const hasJan5 = dates.some(d => d.format('YYYY-MM-DD') === '2024-01-05');
      const hasJan6 = dates.some(d => d.format('YYYY-MM-DD') === '2024-01-06');

      expect(hasJan5).toBe(false);
      expect(hasJan6).toBe(false);
      expect(dates.length).toBe(8); // 10 - 2 = 8
    });

    test('skip() accepts Chronos instances', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-10');
      const skipDate = Chronos.create(2024, 1, 5);
      const skipped = period.skip([skipDate]);
      const dates = skipped.toArray();

      const hasJan5 = dates.some(d => d.format('YYYY-MM-DD') === '2024-01-05');

      expect(hasJan5).toBe(false);
    });

    test('skip() with empty array returns all dates', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-05');
      const skipped = period.skip([]);

      expect(skipped.count()).toBe(5);
    });

    test('skip() handles dates outside period gracefully', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-05');
      const skipped = period.skip(['2024-02-01']);

      expect(skipped.count()).toBe(5);
    });

    test('skip() can be combined with other filters', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-14')
        .weekdays()
        .skip(['2024-01-08']); // Skip Monday Jan 8

      const dates = period.toArray();
      const hasJan8 = dates.some(d => d.format('YYYY-MM-DD') === '2024-01-08');

      expect(hasJan8).toBe(false);
      // All remaining dates should be weekdays
      dates.forEach(date => {
        expect(date.dayOfWeek).not.toBe(0);
        expect(date.dayOfWeek).not.toBe(6);
      });
    });
  });

  // ============================================================================
  // Period Relative Static Methods Edge Cases
  // ============================================================================

  describe('Period Relative Methods Edge Cases', () => {
    test('lastWeek period has 7 days', () => {
      const lastWeek = ChronosPeriod.lastWeek();

      expect(lastWeek.count()).toBe(7);
    });

    test('lastMonth period covers full month', () => {
      const lastMonth = ChronosPeriod.lastMonth();

      // First day should be 1
      expect(lastMonth.start.day).toBe(1);
    });

    test('lastYear period starts January 1 and ends December 31', () => {
      const lastYear = ChronosPeriod.lastYear();

      expect(lastYear.start.month).toBe(1);
      expect(lastYear.start.day).toBe(1);
      expect(lastYear.end?.month).toBe(12);
      expect(lastYear.end?.day).toBe(31);
    });

    test('nextWeek period starts on Sunday', () => {
      const nextWeek = ChronosPeriod.nextWeek();

      expect(nextWeek.start.dayOfWeek).toBe(0); // Sunday
    });

    test('nextMonth period starts on 1st', () => {
      const nextMonth = ChronosPeriod.nextMonth();

      expect(nextMonth.start.day).toBe(1);
    });
  });
});

