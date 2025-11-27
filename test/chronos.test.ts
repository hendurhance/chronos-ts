import { Chronos } from '../src/core/chronos';

describe('Chronos', () => {
  // ============================================================================
  // Factory Methods
  // ============================================================================

  describe('Factory Methods', () => {
    test('now() creates current date', () => {
      const before = Date.now();
      const chronos = Chronos.now();
      const after = Date.now();

      expect(chronos.timestamp).toBeGreaterThanOrEqual(before);
      expect(chronos.timestamp).toBeLessThanOrEqual(after);
    });

    test('today() creates date at start of day', () => {
      const today = Chronos.today();

      expect(today.hour).toBe(0);
      expect(today.minute).toBe(0);
      expect(today.second).toBe(0);
      expect(today.millisecond).toBe(0);
    });

    test('create() builds date from components', () => {
      const date = Chronos.create(2024, 3, 15, 10, 30, 45);

      expect(date.year).toBe(2024);
      expect(date.month).toBe(3);
      expect(date.day).toBe(15);
      expect(date.hour).toBe(10);
      expect(date.minute).toBe(30);
      expect(date.second).toBe(45);
    });

    test('parse() handles ISO string', () => {
      const date = Chronos.parse('2024-06-15T14:30:00Z');

      expect(date.year).toBe(2024);
      expect(date.month).toBe(6);
      expect(date.day).toBe(15);
    });

    test('parse() handles Date object', () => {
      const native = new Date(2024, 5, 15);
      const date = Chronos.parse(native);

      expect(date.year).toBe(2024);
      expect(date.month).toBe(6);
      expect(date.day).toBe(15);
    });

    test('parse() handles timestamp', () => {
      const timestamp = Date.UTC(2024, 5, 15);
      const date = Chronos.parse(timestamp);

      expect(date.year).toBe(2024);
    });

    test('tomorrow() returns next day', () => {
      const today = Chronos.today();
      const tomorrow = Chronos.tomorrow();

      expect(tomorrow.diff(today, 'day')).toBe(1);
    });

    test('yesterday() returns previous day', () => {
      const today = Chronos.today();
      const yesterday = Chronos.yesterday();

      expect(today.diff(yesterday, 'day')).toBe(1);
    });
  });

  // ============================================================================
  // Getters
  // ============================================================================

  describe('Getters', () => {
    const date = Chronos.create(2024, 3, 15, 14, 30, 45, 500);

    test('year getter', () => {
      expect(date.year).toBe(2024);
    });

    test('month getter (1-indexed)', () => {
      expect(date.month).toBe(3);
    });

    test('day getter', () => {
      expect(date.day).toBe(15);
    });

    test('hour getter', () => {
      expect(date.hour).toBe(14);
    });

    test('minute getter', () => {
      expect(date.minute).toBe(30);
    });

    test('second getter', () => {
      expect(date.second).toBe(45);
    });

    test('millisecond getter', () => {
      expect(date.millisecond).toBe(500);
    });

    test('dayOfWeek getter (0=Sunday)', () => {
      // March 15, 2024 is a Friday
      expect(date.dayOfWeek).toBe(5);
    });

    test('dayOfYear getter', () => {
      // March 15 is day 75 in 2024 (leap year)
      expect(date.dayOfYear).toBe(75);
    });

    test('week getter', () => {
      expect(date.week).toBeGreaterThan(0);
      expect(date.week).toBeLessThanOrEqual(53);
    });

    test('quarter getter', () => {
      expect(date.quarter).toBe(1); // March is Q1
    });

    test('isLeapYear getter', () => {
      expect(Chronos.create(2024, 1, 1).isLeapYear).toBe(true);
      expect(Chronos.create(2023, 1, 1).isLeapYear).toBe(false);
    });

    test('daysInMonth getter', () => {
      expect(Chronos.create(2024, 2, 1).daysInMonth).toBe(29); // Leap year February
      expect(Chronos.create(2023, 2, 1).daysInMonth).toBe(28); // Non-leap year February
      expect(Chronos.create(2024, 1, 1).daysInMonth).toBe(31);
    });
  });

  // ============================================================================
  // Setters
  // ============================================================================

  describe('Setters', () => {
    test('setYear returns new instance', () => {
      const date = Chronos.create(2024, 3, 15);
      const newDate = date.setYear(2025);

      expect(newDate.year).toBe(2025);
      expect(date.year).toBe(2024); // Original unchanged
    });

    test('setMonth returns new instance', () => {
      const date = Chronos.create(2024, 3, 15);
      const newDate = date.setMonth(6);

      expect(newDate.month).toBe(6);
    });

    test('setDate returns new instance', () => {
      const date = Chronos.create(2024, 3, 15);
      const newDate = date.setDate(20);

      expect(newDate.day).toBe(20);
    });

    test('setHour returns new instance', () => {
      const date = Chronos.create(2024, 3, 15, 10);
      const newDate = date.setHour(15);

      expect(newDate.hour).toBe(15);
    });

    test('setMinute returns new instance', () => {
      const date = Chronos.create(2024, 3, 15, 10, 30);
      const newDate = date.setMinute(45);

      expect(newDate.minute).toBe(45);
    });
  });

  // ============================================================================
  // Manipulation
  // ============================================================================

  describe('Manipulation', () => {
    describe('add/subtract', () => {
      test('addDays', () => {
        const date = Chronos.create(2024, 3, 15);
        const newDate = date.addDays(10);

        expect(newDate.day).toBe(25);
      });

      test('subtractDays', () => {
        const date = Chronos.create(2024, 3, 15);
        const newDate = date.subtractDays(10);

        expect(newDate.day).toBe(5);
      });

      test('addMonths handles overflow', () => {
        const date = Chronos.create(2024, 1, 31);
        const newDate = date.addMonths(1);

        // January 31 + 1 month = February 29 (2024 is leap year)
        expect(newDate.month).toBe(2);
      });

      test('addYears', () => {
        const date = Chronos.create(2024, 3, 15);
        const newDate = date.addYears(5);

        expect(newDate.year).toBe(2029);
      });

      test('addWeeks', () => {
        const date = Chronos.create(2024, 3, 15);
        const newDate = date.addWeeks(2);

        expect(newDate.day).toBe(29);
      });

      test('addHours', () => {
        const date = Chronos.create(2024, 3, 15, 10);
        const newDate = date.addHours(5);

        expect(newDate.hour).toBe(15);
      });

      test('addMinutes', () => {
        const date = Chronos.create(2024, 3, 15, 10, 30);
        const newDate = date.addMinutes(45);

        expect(newDate.minute).toBe(15);
        expect(newDate.hour).toBe(11);
      });
    });

    describe('add with Duration', () => {
      test('add duration object', () => {
        const date = Chronos.create(2024, 1, 1);
        const newDate = date.add({ years: 1, months: 2, days: 3 });

        expect(newDate.year).toBe(2025);
        expect(newDate.month).toBe(3);
        expect(newDate.day).toBe(4);
      });
    });
  });

  // ============================================================================
  // Comparison
  // ============================================================================

  describe('Comparison', () => {
    test('isBefore returns true for earlier date', () => {
      const date1 = Chronos.create(2024, 1, 1);
      const date2 = Chronos.create(2024, 1, 2);

      expect(date1.isBefore(date2)).toBe(true);
      expect(date2.isBefore(date1)).toBe(false);
    });

    test('isAfter returns true for later date', () => {
      const date1 = Chronos.create(2024, 1, 2);
      const date2 = Chronos.create(2024, 1, 1);

      expect(date1.isAfter(date2)).toBe(true);
      expect(date2.isAfter(date1)).toBe(false);
    });

    test('isSame compares at granularity', () => {
      const date1 = Chronos.create(2024, 1, 15, 10, 30);
      const date2 = Chronos.create(2024, 1, 15, 14, 45);

      expect(date1.isSame(date2, 'day')).toBe(true);
      expect(date1.isSame(date2, 'hour')).toBe(false);
    });

    test('isSameOrBefore', () => {
      const date1 = Chronos.create(2024, 1, 1);
      const date2 = Chronos.create(2024, 1, 1);
      const date3 = Chronos.create(2024, 1, 2);

      expect(date1.isSameOrBefore(date2)).toBe(true);
      expect(date1.isSameOrBefore(date3)).toBe(true);
      expect(date3.isSameOrBefore(date1)).toBe(false);
    });

    test('isBetween', () => {
      const date = Chronos.create(2024, 1, 15);
      const start = Chronos.create(2024, 1, 1);
      const end = Chronos.create(2024, 1, 31);

      expect(date.isBetween(start, end)).toBe(true);
      expect(start.isBetween(date, end)).toBe(false);
    });

    test('isToday', () => {
      const today = Chronos.today();
      const tomorrow = Chronos.tomorrow();

      expect(today.isToday()).toBe(true);
      expect(tomorrow.isToday()).toBe(false);
    });

    test('isFuture and isPast', () => {
      const future = Chronos.now().addDays(1);
      const past = Chronos.now().subtractDays(1);

      expect(future.isFuture()).toBe(true);
      expect(future.isPast()).toBe(false);
      expect(past.isPast()).toBe(true);
      expect(past.isFuture()).toBe(false);
    });
  });

  // ============================================================================
  // Boundaries
  // ============================================================================

  describe('Boundaries', () => {
    test('startOf day', () => {
      const date = Chronos.create(2024, 3, 15, 14, 30, 45, 500);
      const start = date.startOf('day');

      expect(start.hour).toBe(0);
      expect(start.minute).toBe(0);
      expect(start.second).toBe(0);
      expect(start.millisecond).toBe(0);
    });

    test('endOf day', () => {
      const date = Chronos.create(2024, 3, 15, 14, 30, 45);
      const end = date.endOf('day');

      expect(end.hour).toBe(23);
      expect(end.minute).toBe(59);
      expect(end.second).toBe(59);
      expect(end.millisecond).toBe(999);
    });

    test('startOf month', () => {
      const date = Chronos.create(2024, 3, 15);
      const start = date.startOf('month');

      expect(start.day).toBe(1);
      expect(start.hour).toBe(0);
    });

    test('endOf month', () => {
      const date = Chronos.create(2024, 3, 15);
      const end = date.endOf('month');

      expect(end.day).toBe(31);
      expect(end.hour).toBe(23);
    });

    test('startOf year', () => {
      const date = Chronos.create(2024, 6, 15);
      const start = date.startOf('year');

      expect(start.month).toBe(1);
      expect(start.day).toBe(1);
    });

    test('endOf year', () => {
      const date = Chronos.create(2024, 6, 15);
      const end = date.endOf('year');

      expect(end.month).toBe(12);
      expect(end.day).toBe(31);
    });

    test('startOf week', () => {
      const date = Chronos.create(2024, 3, 15); // Friday
      const start = date.startOf('week');

      expect(start.dayOfWeek).toBe(0); // Sunday
    });

    test('startOf quarter', () => {
      const date = Chronos.create(2024, 5, 15); // May - Q2
      const start = date.startOf('quarter');

      expect(start.month).toBe(4); // April
      expect(start.day).toBe(1);
    });
  });

  // ============================================================================
  // Difference
  // ============================================================================

  describe('Difference', () => {
    test('diff in days', () => {
      const date1 = Chronos.create(2024, 1, 1);
      const date2 = Chronos.create(2024, 1, 11);

      expect(date2.diff(date1, 'day')).toBe(10);
      expect(date1.diff(date2, 'day')).toBe(-10);
    });

    test('diff in months', () => {
      const date1 = Chronos.create(2024, 1, 15);
      const date2 = Chronos.create(2024, 4, 15);

      expect(date2.diff(date1, 'month')).toBe(3);
    });

    test('diff in years', () => {
      const date1 = Chronos.create(2020, 1, 1);
      const date2 = Chronos.create(2024, 1, 1);

      expect(date2.diff(date1, 'year')).toBe(4);
    });

    test('diff in hours', () => {
      const date1 = Chronos.create(2024, 1, 1, 10);
      const date2 = Chronos.create(2024, 1, 1, 15);

      expect(date2.diff(date1, 'hour')).toBe(5);
    });
  });

  // ============================================================================
  // Formatting
  // ============================================================================

  describe('Formatting', () => {
    const date = Chronos.create(2024, 3, 15, 14, 30, 45);

    test('format with YYYY-MM-DD', () => {
      expect(date.format('YYYY-MM-DD')).toBe('2024-03-15');
    });

    test('format with HH:mm:ss', () => {
      expect(date.format('HH:mm:ss')).toBe('14:30:45');
    });

    test('format with full date time', () => {
      expect(date.format('YYYY-MM-DD HH:mm:ss')).toBe('2024-03-15 14:30:45');
    });

    test('toISOString', () => {
      const iso = date.toISOString();
      expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    test('toDateString', () => {
      const str = date.toDateString();
      expect(str).toBe('2024-03-15'); // ISO date format
    });
  });

  // ============================================================================
  // Cloning and Immutability
  // ============================================================================

  describe('Immutability', () => {
    test('clone creates independent copy', () => {
      const original = Chronos.create(2024, 1, 1);
      const clone = original.clone();

      expect(clone.year).toBe(original.year);
      expect(clone).not.toBe(original);
    });

    test('mutations return new instances', () => {
      const original = Chronos.create(2024, 1, 1);
      const modified = original.addDays(1);

      expect(original.day).toBe(1);
      expect(modified.day).toBe(2);
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    test('handles month overflow', () => {
      const date = Chronos.create(2024, 1, 31).addMonths(1);
      expect(date.month).toBe(2);
      expect(date.day).toBeLessThanOrEqual(29);
    });

    test('handles year overflow', () => {
      const date = Chronos.create(2024, 12, 31).addDays(1);
      expect(date.year).toBe(2025);
      expect(date.month).toBe(1);
      expect(date.day).toBe(1);
    });

    test('handles negative operations', () => {
      const date = Chronos.create(2024, 1, 1).subtractDays(1);
      expect(date.year).toBe(2023);
      expect(date.month).toBe(12);
      expect(date.day).toBe(31);
    });

    test('handles leap year February', () => {
      const leapYear = Chronos.create(2024, 2, 29);
      expect(leapYear.day).toBe(29);
      expect(leapYear.isLeapYear).toBe(true);
    });
  });
});
