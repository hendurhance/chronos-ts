import { Chronos } from '../src/core/chronos';
import { DayOfWeek } from '../src/types';

describe('Chronos Extended Tests', () => {
  // ============================================================================
  // Static Factory Methods - Extended
  // ============================================================================

  describe('Extended Factory Methods', () => {
    test('fromUnix() creates from Unix timestamp (seconds)', () => {
      const timestamp = 1705276800; // 2024-01-15 00:00:00 UTC
      const date = Chronos.fromUnix(timestamp);

      expect(date.timestamp).toBe(timestamp * 1000);
    });

    test('fromMillis() creates from millisecond timestamp', () => {
      const timestamp = 1705276800000;
      const date = Chronos.fromMillis(timestamp);

      expect(date.timestamp).toBe(timestamp);
    });

    test('fromObject() creates from components object', () => {
      const date = Chronos.fromObject({
        year: 2024,
        month: 6,
        day: 15,
        hour: 10,
        minute: 30,
        second: 45,
        millisecond: 123,
      });

      expect(date.year).toBe(2024);
      expect(date.month).toBe(6);
      expect(date.day).toBe(15);
      expect(date.hour).toBe(10);
      expect(date.minute).toBe(30);
      expect(date.second).toBe(45);
      expect(date.millisecond).toBe(123);
    });

    test('fromObject() uses defaults for missing values', () => {
      const date = Chronos.fromObject({ year: 2024 });

      expect(date.year).toBe(2024);
      expect(date.hour).toBe(0);
      expect(date.minute).toBe(0);
    });

    test('fromFormat() parses date from format string', () => {
      const date = Chronos.fromFormat('15-06-2024', 'DD-MM-YYYY');

      expect(date.year).toBe(2024);
      // Month is 1-indexed (1=January, 6=June)
      expect(date.month).toBe(6);
      expect(date.day).toBe(15);
    });

    test('fromFormat() parses date with time', () => {
      const date = Chronos.fromFormat('2024/06/15 14:30:45', 'YYYY/MM/DD HH:mm:ss');

      expect(date.year).toBe(2024);
      expect(date.month).toBe(6); // Month is 1-indexed (1=January, 6=June)
      expect(date.day).toBe(15);
      expect(date.hour).toBe(14);
      expect(date.minute).toBe(30);
      expect(date.second).toBe(45);
    });

    test('fromFormat() handles single digit values', () => {
      const date = Chronos.fromFormat('5/6/2024', 'D/M/YYYY');

      expect(date.day).toBe(5);
      expect(date.month).toBe(6); // Month is 1-indexed (1=January, 6=June)
    });

    test('fromFormat() handles two-digit year (YY)', () => {
      const date1 = Chronos.fromFormat('15-06-24', 'DD-MM-YY');
      expect(date1.year).toBe(2024);

      const date2 = Chronos.fromFormat('15-06-85', 'DD-MM-YY');
      expect(date2.year).toBe(1985);
    });

    test('fromFormat() handles milliseconds (SSS)', () => {
      const date = Chronos.fromFormat('2024-06-15 14:30:45.123', 'YYYY-MM-DD HH:mm:ss.SSS');

      expect(date.millisecond).toBe(123);
    });

    test('min() creates minimum possible date', () => {
      const minDate = Chronos.min();

      expect(minDate.isValid()).toBe(true);
      expect(minDate.timestamp).toBe(-8640000000000000);
    });

    test('max() creates maximum possible date', () => {
      const maxDate = Chronos.max();

      expect(maxDate.isValid()).toBe(true);
      expect(maxDate.timestamp).toBe(8640000000000000);
    });

    test('earliest() returns the earliest of multiple dates', () => {
      const d1 = Chronos.create(2024, 6, 15);
      const d2 = Chronos.create(2024, 1, 1);
      const d3 = Chronos.create(2024, 12, 31);

      const earliest = Chronos.earliest(d1, d2, d3);

      expect(earliest.month).toBe(1);
      expect(earliest.day).toBe(1);
    });

    test('latest() returns the latest of multiple dates', () => {
      const d1 = Chronos.create(2024, 6, 15);
      const d2 = Chronos.create(2024, 1, 1);
      const d3 = Chronos.create(2024, 12, 31);

      const latest = Chronos.latest(d1, d2, d3);

      expect(latest.month).toBe(12);
      expect(latest.day).toBe(31);
    });

    test('parse() throws on invalid date string', () => {
      expect(() => Chronos.parse('not-a-valid-date-at-all')).toThrow();
    });
  });

  // ============================================================================
  // Extended Getters
  // ============================================================================

  describe('Extended Getters', () => {
    test('unix getter returns seconds', () => {
      const date = Chronos.create(2024, 1, 1, 0, 0, 0);
      const unix = date.unix;

      expect(unix).toBe(Math.floor(date.timestamp / 1000));
    });

    test('weekYear getter returns ISO week year', () => {
      const date = Chronos.create(2024, 1, 1);

      expect(date.weekYear).toBeDefined();
      expect(typeof date.weekYear).toBe('number');
    });

    test('weeksInYear getter returns correct count', () => {
      const date = Chronos.create(2024, 6, 15);
      const weeksInYear = date.weeksInYear;

      expect(weeksInYear).toBeGreaterThanOrEqual(52);
      expect(weeksInYear).toBeLessThanOrEqual(53);
    });

    test('offset getter returns timezone offset in minutes', () => {
      const date = Chronos.create(2024, 6, 15);

      expect(typeof date.offset).toBe('number');
    });

    test('offsetString getter returns formatted offset', () => {
      const date = Chronos.create(2024, 6, 15);
      const offsetStr = date.offsetString;

      expect(offsetStr).toMatch(/^[+-]\d{2}:\d{2}$/);
    });
  });

  // ============================================================================
  // Extended Setters
  // ============================================================================

  describe('Extended Setters', () => {
    test('set() with multiple values', () => {
      const date = Chronos.create(2024, 1, 1);
      const newDate = date.set({
        year: 2025,
        month: 6,
        day: 15,
        hour: 10,
        minute: 30,
        second: 45,
        millisecond: 500,
      });

      expect(newDate.year).toBe(2025);
      expect(newDate.month).toBe(6);
      expect(newDate.day).toBe(15);
      expect(newDate.hour).toBe(10);
      expect(newDate.minute).toBe(30);
      expect(newDate.second).toBe(45);
      expect(newDate.millisecond).toBe(500);
    });

    test('setSecond returns new instance', () => {
      const date = Chronos.create(2024, 1, 1, 10, 30, 0);
      const newDate = date.setSecond(45);

      expect(newDate.second).toBe(45);
    });

    test('setMillisecond returns new instance', () => {
      const date = Chronos.create(2024, 1, 1, 10, 30, 0, 0);
      const newDate = date.setMillisecond(500);

      expect(newDate.millisecond).toBe(500);
    });
  });

  // ============================================================================
  // Extended Manipulation
  // ============================================================================

  describe('Extended Manipulation', () => {
    test('add() throws error when unit not provided for number', () => {
      const date = Chronos.create(2024, 1, 1);

      expect(() => date.add(5)).toThrow('Unit is required when amount is a number');
    });

    test('subtract with Duration object', () => {
      const date = Chronos.create(2024, 6, 15);
      const newDate = date.subtract({ years: 1, months: 2, days: 3 });

      expect(newDate.year).toBe(2023);
      expect(newDate.month).toBe(4);
      expect(newDate.day).toBe(12);
    });

    test('addQuarters adds quarters correctly', () => {
      const date = Chronos.create(2024, 1, 1);
      const newDate = date.addQuarters(2);

      expect(newDate.month).toBe(7);
    });

    test('subtractQuarters subtracts quarters correctly', () => {
      const date = Chronos.create(2024, 7, 1);
      const newDate = date.subtractQuarters(2);

      expect(newDate.month).toBe(1);
    });

    test('addSeconds adds seconds', () => {
      const date = Chronos.create(2024, 1, 1, 0, 0, 0);
      const newDate = date.addSeconds(90);

      expect(newDate.minute).toBe(1);
      expect(newDate.second).toBe(30);
    });

    test('subtractSeconds subtracts seconds', () => {
      const date = Chronos.create(2024, 1, 1, 0, 2, 0);
      const newDate = date.subtractSeconds(90);

      expect(newDate.minute).toBe(0);
      expect(newDate.second).toBe(30);
    });

    test('addMilliseconds adds milliseconds', () => {
      const date = Chronos.create(2024, 1, 1, 0, 0, 0, 0);
      const newDate = date.addMilliseconds(1500);

      expect(newDate.second).toBe(1);
      expect(newDate.millisecond).toBe(500);
    });

    test('subtractMilliseconds subtracts milliseconds', () => {
      const date = Chronos.create(2024, 1, 1, 0, 0, 2, 0);
      const newDate = date.subtractMilliseconds(1500);

      expect(newDate.second).toBe(0);
      expect(newDate.millisecond).toBe(500);
    });

    test('add with Duration including all fields', () => {
      const date = Chronos.create(2024, 1, 1, 0, 0, 0, 0);
      const newDate = date.add({
        years: 1,
        months: 2,
        weeks: 1,
        days: 3,
        hours: 4,
        minutes: 5,
        seconds: 6,
        milliseconds: 7,
      });

      expect(newDate.year).toBe(2025);
      expect(newDate.month).toBe(3);
    });
  });

  // ============================================================================
  // Extended Comparison
  // ============================================================================

  describe('Extended Comparison', () => {
    test('isSameOrAfter returns true for same date', () => {
      const date1 = Chronos.create(2024, 1, 1);
      const date2 = Chronos.create(2024, 1, 1);

      expect(date1.isSameOrAfter(date2)).toBe(true);
    });

    test('isSameOrAfter returns true for after date', () => {
      const date1 = Chronos.create(2024, 1, 2);
      const date2 = Chronos.create(2024, 1, 1);

      expect(date1.isSameOrAfter(date2)).toBe(true);
    });

    test('isBetween with inclusive boundaries', () => {
      const date = Chronos.create(2024, 1, 1);
      const start = Chronos.create(2024, 1, 1);
      const end = Chronos.create(2024, 1, 31);

      expect(date.isBetween(start, end, undefined, '[]')).toBe(true);
    });

    test('isBetween with exclusive start', () => {
      const date = Chronos.create(2024, 1, 1);
      const start = Chronos.create(2024, 1, 1);
      const end = Chronos.create(2024, 1, 31);

      expect(date.isBetween(start, end, undefined, '(]')).toBe(false);
    });

    test('isBetween with exclusive end', () => {
      const date = Chronos.create(2024, 1, 31);
      const start = Chronos.create(2024, 1, 1);
      const end = Chronos.create(2024, 1, 31);

      expect(date.isBetween(start, end, undefined, '[)')).toBe(false);
    });

    test('isBefore with unit granularity', () => {
      const date1 = Chronos.create(2024, 1, 15, 10);
      const date2 = Chronos.create(2024, 2, 1, 5);

      expect(date1.isBefore(date2, 'month')).toBe(true);
    });

    test('isAfter with unit granularity', () => {
      const date1 = Chronos.create(2024, 2, 1, 5);
      const date2 = Chronos.create(2024, 1, 15, 10);

      expect(date1.isAfter(date2, 'month')).toBe(true);
    });
  });

  // ============================================================================
  // Day Type Checks
  // ============================================================================

  describe('Day Type Checks', () => {
    test('isTomorrow returns true for tomorrow', () => {
      const tomorrow = Chronos.tomorrow();

      expect(tomorrow.isTomorrow()).toBe(true);
    });

    test('isYesterday returns true for yesterday', () => {
      const yesterday = Chronos.yesterday();

      expect(yesterday.isYesterday()).toBe(true);
    });

    test('isWeekend correctly identifies weekend days', () => {
      // Find a Saturday
      let date = Chronos.create(2024, 1, 6); // This is a Saturday
      expect(date.isWeekend()).toBe(true);

      // Find a Sunday
      date = Chronos.create(2024, 1, 7); // This is a Sunday
      expect(date.isWeekend()).toBe(true);
    });

    test('isWeekday correctly identifies weekdays', () => {
      // Find a Monday
      const monday = Chronos.create(2024, 1, 8);
      expect(monday.isWeekday()).toBe(true);
    });
  });

  // ============================================================================
  // Specific Day Checks
  // ============================================================================

  describe('Specific Day Checks', () => {
    test('isSunday returns true for Sunday', () => {
      const sunday = Chronos.create(2024, 1, 7); // January 7, 2024 is Sunday
      expect(sunday.isSunday()).toBe(true);
    });

    test('isMonday returns true for Monday', () => {
      const monday = Chronos.create(2024, 1, 8);
      expect(monday.isMonday()).toBe(true);
    });

    test('isTuesday returns true for Tuesday', () => {
      const tuesday = Chronos.create(2024, 1, 9);
      expect(tuesday.isTuesday()).toBe(true);
    });

    test('isWednesday returns true for Wednesday', () => {
      const wednesday = Chronos.create(2024, 1, 10);
      expect(wednesday.isWednesday()).toBe(true);
    });

    test('isThursday returns true for Thursday', () => {
      const thursday = Chronos.create(2024, 1, 11);
      expect(thursday.isThursday()).toBe(true);
    });

    test('isFriday returns true for Friday', () => {
      const friday = Chronos.create(2024, 1, 12);
      expect(friday.isFriday()).toBe(true);
    });

    test('isSaturday returns true for Saturday', () => {
      const saturday = Chronos.create(2024, 1, 13);
      expect(saturday.isSaturday()).toBe(true);
    });
  });

  // ============================================================================
  // Difference Methods - Extended
  // ============================================================================

  describe('Extended Difference Methods', () => {
    test('diff with precise option', () => {
      const date1 = Chronos.create(2024, 1, 1, 0, 0, 0);
      const date2 = Chronos.create(2024, 1, 1, 12, 0, 0);

      expect(date2.diff(date1, 'day', true)).toBeCloseTo(0.5);
    });

    test('diff precise in hours', () => {
      const date1 = Chronos.create(2024, 1, 1, 0, 0, 0);
      const date2 = Chronos.create(2024, 1, 1, 1, 30, 0);

      expect(date2.diff(date1, 'hour', true)).toBeCloseTo(1.5);
    });

    test('diff precise in minutes', () => {
      const date1 = Chronos.create(2024, 1, 1, 0, 0, 0);
      const date2 = Chronos.create(2024, 1, 1, 0, 1, 30);

      expect(date2.diff(date1, 'minute', true)).toBeCloseTo(1.5);
    });

    test('diff precise in seconds', () => {
      const date1 = Chronos.create(2024, 1, 1, 0, 0, 0, 0);
      const date2 = Chronos.create(2024, 1, 1, 0, 0, 1, 500);

      expect(date2.diff(date1, 'second', true)).toBeCloseTo(1.5);
    });

    test('diff precise in weeks', () => {
      const date1 = Chronos.create(2024, 1, 1);
      const date2 = Chronos.create(2024, 1, 11);

      expect(date2.diff(date1, 'week', true)).toBeCloseTo(10 / 7);
    });

    test('diffDetailed returns breakdown', () => {
      const date1 = Chronos.create(2024, 1, 1);
      const date2 = Chronos.create(2025, 3, 15, 12, 30, 45);
      const result = date2.diffDetailed(date1);

      expect(result).toHaveProperty('years');
      expect(result).toHaveProperty('months');
      expect(result).toHaveProperty('days');
      expect(result).toHaveProperty('hours');
      expect(result).toHaveProperty('minutes');
      expect(result).toHaveProperty('seconds');
      expect(result).toHaveProperty('milliseconds');
      expect(result).toHaveProperty('totalMilliseconds');
      expect(result.totalMilliseconds).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Human Readable Methods
  // ============================================================================

  describe('Human Readable Methods', () => {
    beforeEach(() => {
      // Set a fixed test time
      Chronos.setTestNow(Chronos.create(2024, 6, 15, 12, 0, 0));
    });

    afterEach(() => {
      Chronos.setTestNow(undefined);
    });

    test('fromNow returns relative time string', () => {
      const date = Chronos.create(2024, 6, 10);
      const result = date.fromNow();

      expect(typeof result).toBe('string');
      expect(result).toContain('ago');
    });

    test('from returns relative time from another date', () => {
      const date1 = Chronos.create(2024, 6, 20);
      const date2 = Chronos.create(2024, 6, 15);
      const result = date1.from(date2);

      expect(typeof result).toBe('string');
    });

    test('fromNow with absolute option', () => {
      const date = Chronos.create(2024, 6, 10);
      const result = date.fromNow({ absolute: true });

      expect(typeof result).toBe('string');
      expect(result).not.toContain('ago');
    });

    test('to returns relative time to another date', () => {
      const date1 = Chronos.create(2024, 6, 10);
      const date2 = Chronos.create(2024, 6, 15);
      const result = date1.to(date2);

      expect(typeof result).toBe('string');
    });

    test('toNow returns relative time to now', () => {
      const date = Chronos.create(2024, 6, 20);
      const result = date.toNow();

      expect(typeof result).toBe('string');
    });

    test('fromNow handles seconds', () => {
      const date = Chronos.now().subtractSeconds(30);
      const result = date.fromNow();

      expect(typeof result).toBe('string');
    });

    test('fromNow handles minutes', () => {
      const date = Chronos.now().subtractMinutes(30);
      const result = date.fromNow();

      expect(typeof result).toBe('string');
    });

    test('fromNow handles hours', () => {
      const date = Chronos.now().subtractHours(5);
      const result = date.fromNow();

      expect(typeof result).toBe('string');
    });

    test('fromNow handles weeks', () => {
      const date = Chronos.now().subtractWeeks(2);
      const result = date.fromNow();

      expect(typeof result).toBe('string');
    });

    test('fromNow handles months', () => {
      const date = Chronos.now().subtractMonths(3);
      const result = date.fromNow();

      expect(typeof result).toBe('string');
    });

    test('fromNow handles years', () => {
      const date = Chronos.now().subtractYears(2);
      const result = date.fromNow();

      expect(typeof result).toBe('string');
    });

    test('fromNow handles future dates', () => {
      const date = Chronos.now().addDays(5);
      const result = date.fromNow();

      expect(typeof result).toBe('string');
    });
  });

  // ============================================================================
  // Extended Formatting
  // ============================================================================

  describe('Extended Formatting', () => {
    const date = Chronos.create(2024, 3, 15, 14, 30, 45, 123);

    test('format with month names', () => {
      expect(date.format('MMMM')).toBe('March');
      expect(date.format('MMM')).toBe('Mar');
    });

    test('format with day names', () => {
      expect(date.format('dddd')).toBe('Friday');
      expect(date.format('ddd')).toBe('Fri');
      expect(date.format('dd')).toBe('Fr');
      expect(date.format('d')).toBe('5'); // Friday = 5
    });

    test('format with 12-hour time', () => {
      expect(date.format('h')).toBe('2');
      expect(date.format('hh')).toBe('02');
    });

    test('format with meridiem', () => {
      expect(date.format('A')).toBe('PM');
      expect(date.format('a')).toBe('pm');
    });

    test('format with milliseconds', () => {
      expect(date.format('SSS')).toBe('123');
    });

    test('format with timezone offset', () => {
      expect(date.format('Z')).toMatch(/^[+-]\d{2}:\d{2}$/);
      expect(date.format('ZZ')).toMatch(/^[+-]\d{4}$/);
    });

    test('format with quarter', () => {
      expect(date.format('Q')).toBe('1');
    });

    test('format with ordinal day', () => {
      expect(date.format('Do')).toMatch(/\d+[a-z]+/);
    });

    test('format with week number', () => {
      expect(date.format('W')).toBeDefined();
      expect(date.format('WW')).toMatch(/\d{2}/);
    });

    test('format with timestamps', () => {
      expect(date.format('X')).toBe(String(date.unix));
      expect(date.format('x')).toBe(String(date.timestamp));
    });

    test('format with escaped text', () => {
      expect(date.format('[Today is] dddd')).toBe('Today is Friday');
    });

    test('toTimeString returns time format', () => {
      expect(date.toTimeString()).toBe('14:30:45');
    });

    test('toDateTimeString returns full datetime', () => {
      expect(date.toDateTimeString()).toBe('2024-03-15 14:30:45');
    });

    test('toRFC2822 returns RFC 2822 format', () => {
      const rfc = date.toRFC2822();
      expect(rfc).toContain('Fri');
      expect(rfc).toContain('Mar');
      expect(rfc).toContain('2024');
    });

    test('toRFC3339 returns RFC 3339 format', () => {
      const rfc = date.toRFC3339();
      expect(rfc).toContain('2024-03-15');
    });

    test('toAtomString returns ATOM format', () => {
      const atom = date.toAtomString();
      expect(atom).toContain('2024-03-15');
    });

    test('toCookieString returns cookie format', () => {
      const cookie = date.toCookieString();
      expect(cookie).toContain('Friday');
    });

    test('toRSSString returns RSS format', () => {
      const rss = date.toRSSString();
      expect(rss).toContain('Fri');
    });

    test('toW3CString returns W3C format', () => {
      const w3c = date.toW3CString();
      expect(w3c).toContain('2024-03-15');
    });
  });

  // ============================================================================
  // Conversion Methods
  // ============================================================================

  describe('Conversion Methods', () => {
    const date = Chronos.create(2024, 3, 15, 14, 30, 45, 123);

    test('toArray returns components array', () => {
      const arr = date.toArray();

      expect(arr[0]).toBe(2024); // year
      expect(arr[1]).toBe(3);    // month
      expect(arr[2]).toBe(15);   // day
      expect(arr[3]).toBe(14);   // hour
      expect(arr[4]).toBe(30);   // minute
      expect(arr[5]).toBe(45);   // second
      expect(arr[6]).toBe(123);  // millisecond
    });

    test('toObject returns components object', () => {
      const obj = date.toObject();

      expect(obj.year).toBe(2024);
      expect(obj.month).toBe(3);
      expect(obj.day).toBe(15);
      expect(obj.hour).toBe(14);
      expect(obj.minute).toBe(30);
      expect(obj.second).toBe(45);
      expect(obj.millisecond).toBe(123);
    });

    test('toJSON returns serializable object', () => {
      const json = date.toJSON();

      expect(json).toHaveProperty('iso');
      expect(json).toHaveProperty('timestamp');
      expect(json).toHaveProperty('timezone');
    });

    test('valueOf returns timestamp', () => {
      expect(date.valueOf()).toBe(date.timestamp);
    });

    test('toString returns ISO string', () => {
      expect(date.toString()).toBe(date.toISOString());
    });
  });

  // ============================================================================
  // Navigation Methods
  // ============================================================================

  describe('Navigation Methods', () => {
    test('next() returns next occurrence of a day', () => {
      const friday = Chronos.create(2024, 1, 12); // Friday
      const nextMonday = friday.next(DayOfWeek.Monday);

      expect(nextMonday.dayOfWeek).toBe(DayOfWeek.Monday);
      expect(nextMonday.isAfter(friday)).toBe(true);
    });

    test('next() returns next week if same day', () => {
      const friday = Chronos.create(2024, 1, 12); // Friday
      const nextFriday = friday.next(DayOfWeek.Friday);

      expect(nextFriday.dayOfWeek).toBe(DayOfWeek.Friday);
      expect(nextFriday.diff(friday, 'day')).toBe(7);
    });

    test('previous() returns previous occurrence of a day', () => {
      const friday = Chronos.create(2024, 1, 12); // Friday
      const prevMonday = friday.previous(DayOfWeek.Monday);

      expect(prevMonday.dayOfWeek).toBe(DayOfWeek.Monday);
      expect(prevMonday.isBefore(friday)).toBe(true);
    });

    test('previous() returns previous week if same day', () => {
      const friday = Chronos.create(2024, 1, 12); // Friday
      const prevFriday = friday.previous(DayOfWeek.Friday);

      expect(prevFriday.dayOfWeek).toBe(DayOfWeek.Friday);
      expect(friday.diff(prevFriday, 'day')).toBe(7);
    });

    test('closest() returns closest of two dates', () => {
      const current = Chronos.create(2024, 1, 15);
      const date1 = Chronos.create(2024, 1, 10); // 5 days away
      const date2 = Chronos.create(2024, 1, 25); // 10 days away

      const closest = current.closest(date1, date2);

      expect(closest.day).toBe(10);
    });

    test('farthest() returns farthest of two dates', () => {
      const current = Chronos.create(2024, 1, 15);
      const date1 = Chronos.create(2024, 1, 10); // 5 days away
      const date2 = Chronos.create(2024, 1, 25); // 10 days away

      const farthest = current.farthest(date1, date2);

      expect(farthest.day).toBe(25);
    });
  });

  // ============================================================================
  // Static Configuration Methods
  // ============================================================================

  describe('Static Configuration Methods', () => {
    afterEach(() => {
      // Reset configuration
      Chronos.setTestNow(undefined);
      Chronos.configure({ locale: 'en', weekStartsOn: DayOfWeek.Sunday });
    });

    test('configure() sets global config', () => {
      Chronos.configure({ locale: 'fr' });
      const config = Chronos.getConfig();

      expect(config.locale).toBe('fr');
    });

    test('getConfig() returns current config', () => {
      const config = Chronos.getConfig();

      expect(config).toHaveProperty('locale');
      expect(config).toHaveProperty('weekStartsOn');
    });

    test('setTestNow() sets test time', () => {
      const testDate = Chronos.create(2020, 1, 1);
      Chronos.setTestNow(testDate);

      expect(Chronos.hasTestNow()).toBe(true);
      expect(Chronos.now().year).toBe(2020);
    });

    test('setTestNow(undefined) clears test time', () => {
      Chronos.setTestNow(Chronos.create(2020, 1, 1));
      Chronos.setTestNow(undefined);

      expect(Chronos.hasTestNow()).toBe(false);
    });

    test('getTestNow() returns test time', () => {
      const testDate = Chronos.create(2020, 1, 1);
      Chronos.setTestNow(testDate);

      const retrieved = Chronos.getTestNow();

      expect(retrieved?.year).toBe(2020);
    });

    test('getTestNow() returns null when not set', () => {
      Chronos.setTestNow(undefined);

      expect(Chronos.getTestNow()).toBeNull();
    });
  });

  // ============================================================================
  // Validation Methods
  // ============================================================================

  describe('Validation Methods', () => {
    test('isValid() returns true for valid date', () => {
      const date = Chronos.create(2024, 1, 1);
      expect(date.isValid()).toBe(true);
    });

    test('isSameDay() compares days', () => {
      const date1 = Chronos.create(2024, 1, 15, 10);
      const date2 = Chronos.create(2024, 1, 15, 20);

      expect(date1.isSameDay(date2)).toBe(true);
    });

    test('isSameMonth() compares months', () => {
      const date1 = Chronos.create(2024, 3, 1);
      const date2 = Chronos.create(2024, 3, 31);

      expect(date1.isSameMonth(date2)).toBe(true);
    });

    test('isSameYear() compares years', () => {
      const date1 = Chronos.create(2024, 1, 1);
      const date2 = Chronos.create(2024, 12, 31);

      expect(date1.isSameYear(date2)).toBe(true);
    });
  });

  // ============================================================================
  // Calendar Methods
  // ============================================================================

  describe('Calendar Methods', () => {
    beforeEach(() => {
      Chronos.setTestNow(Chronos.create(2024, 6, 15, 12, 0, 0));
    });

    afterEach(() => {
      Chronos.setTestNow(undefined);
    });

    test('calendar() returns "Today at" for today', () => {
      const today = Chronos.today().setHour(10);
      const result = today.calendar();

      expect(result).toContain('Today at');
    });

    test('calendar() returns "Tomorrow at" for tomorrow', () => {
      const tomorrow = Chronos.tomorrow().setHour(10);
      const result = tomorrow.calendar();

      expect(result).toContain('Tomorrow at');
    });

    test('calendar() returns "Yesterday at" for yesterday', () => {
      const yesterday = Chronos.yesterday().setHour(10);
      const result = yesterday.calendar();

      expect(result).toContain('Yesterday at');
    });

    test('calendar() returns day name for near future', () => {
      const nearFuture = Chronos.now().addDays(3);
      const result = nearFuture.calendar();

      expect(result).toContain('at');
    });

    test('calendar() returns "Last [day]" for near past', () => {
      const nearPast = Chronos.now().subtractDays(3);
      const result = nearPast.calendar();

      expect(result).toContain('Last');
    });

    test('calendar() returns date format for far dates', () => {
      const farFuture = Chronos.now().addMonths(2);
      const result = farFuture.calendar();

      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    test('calendar() with custom reference date', () => {
      const date = Chronos.create(2024, 6, 20, 10);
      const refDate = Chronos.create(2024, 6, 20);
      const result = date.calendar(refDate);

      expect(result).toContain('Today at');
    });
  });

  // ============================================================================
  // Locale Methods
  // ============================================================================

  describe('Locale Methods', () => {
    test('locale() sets locale for instance', () => {
      const date = Chronos.create(2024, 1, 1);
      const localized = date.locale('fr');

      expect(localized.getLocale()).toBe('fr');
    });

    test('getLocale() returns current locale code', () => {
      const date = Chronos.create(2024, 1, 1);

      expect(date.getLocale()).toBe('en');
    });
  });
});
