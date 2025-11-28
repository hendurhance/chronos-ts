import { ChronosTimezone, TIMEZONES, Timezones } from '../src/core/timezone';

describe('ChronosTimezone', () => {
  // ============================================================================
  // Factory Methods
  // ============================================================================

  describe('Factory Methods', () => {
    test('create() with identifier', () => {
      const tz = ChronosTimezone.create('America/New_York');
      expect(tz.identifier).toBe('America/New_York');
    });

    test('create() defaults to UTC', () => {
      const tz = ChronosTimezone.create();
      expect(tz.identifier).toBe('UTC');
    });

    test('utc() creates UTC timezone', () => {
      const tz = ChronosTimezone.utc();
      expect(tz.identifier).toBe('UTC');
    });

    test('local() creates local timezone', () => {
      const tz = ChronosTimezone.local();
      expect(typeof tz.identifier).toBe('string');
      expect(tz.identifier.length).toBeGreaterThan(0);
    });

    test('fromOffset() creates timezone from hour offset', () => {
      const tz = ChronosTimezone.fromOffset(-5);
      // Now returns the offset string format directly
      expect(tz.identifier).toBe('-05:00');
    });

    test('localIdentifier() returns system timezone', () => {
      const identifier = ChronosTimezone.localIdentifier();
      expect(typeof identifier).toBe('string');
      expect(ChronosTimezone.isValid(identifier)).toBe(true);
    });
  });

  // ============================================================================
  // Getters
  // ============================================================================

  describe('Getters', () => {
    test('identifier getter', () => {
      const tz = ChronosTimezone.create('Europe/London');
      expect(tz.identifier).toBe('Europe/London');
    });

    test('name getter (alias for identifier)', () => {
      const tz = ChronosTimezone.create('Asia/Tokyo');
      expect(tz.name).toBe('Asia/Tokyo');
    });

    test('getAbbreviation() returns timezone abbreviation', () => {
      const tz = ChronosTimezone.create('America/New_York');
      const abbr = tz.getAbbreviation(new Date('2024-01-15'));

      expect(typeof abbr).toBe('string');
      // Could be EST or EDT depending on DST
      expect(abbr.length).toBeLessThanOrEqual(5);
    });

    test('getFullName() returns descriptive name', () => {
      const tz = ChronosTimezone.create('America/New_York');
      const name = tz.getFullName(new Date('2024-01-15'));

      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Offset Calculations
  // ============================================================================

  describe('Offset Calculations', () => {
    test('getOffsetMinutes() returns offset in minutes', () => {
      const utc = ChronosTimezone.utc();
      expect(utc.getOffsetMinutes()).toBe(0);
    });

    test('getOffsetHours() returns offset in hours', () => {
      const utc = ChronosTimezone.utc();
      expect(utc.getOffsetHours()).toBe(0);
    });

    test('getOffsetString() returns formatted string', () => {
      const utc = ChronosTimezone.utc();
      expect(utc.getOffsetString()).toBe('+00:00');
    });

    test('getOffset() returns full offset object', () => {
      const utc = ChronosTimezone.utc();
      const offset = utc.getOffset();

      expect(offset).toHaveProperty('minutes');
      expect(offset).toHaveProperty('hours');
      expect(offset).toHaveProperty('string');
    });

    test('offset varies with DST', () => {
      const tz = ChronosTimezone.create('America/New_York');
      const winter = new Date('2024-01-15');
      const summer = new Date('2024-07-15');

      const winterOffset = tz.getOffsetHours(winter);
      const summerOffset = tz.getOffsetHours(summer);

      // New York should have different offsets in summer vs winter
      expect(winterOffset).not.toBe(summerOffset);
    });
  });

  // ============================================================================
  // DST (Daylight Saving Time)
  // ============================================================================

  describe('DST', () => {
    test('isDST() detects daylight saving time', () => {
      const tz = ChronosTimezone.create('America/New_York');
      const winter = new Date('2024-01-15');
      const summer = new Date('2024-07-15');

      expect(tz.isDST(winter)).toBe(false);
      expect(tz.isDST(summer)).toBe(true);
    });

    test('observesDST() checks if timezone has DST', () => {
      const newYork = ChronosTimezone.create('America/New_York');
      const utc = ChronosTimezone.utc();
      const phoenix = ChronosTimezone.create('America/Phoenix');

      expect(newYork.observesDST()).toBe(true);
      expect(utc.observesDST()).toBe(false);
      expect(phoenix.observesDST()).toBe(false);
    });

    test('getNextDSTTransition() finds next transition', () => {
      const tz = ChronosTimezone.create('America/New_York');
      const jan = new Date('2024-01-15');

      const transition = tz.getNextDSTTransition(jan);

      if (transition) {
        expect(transition.date).toBeInstanceOf(Date);
        expect(transition).toHaveProperty('fromOffset');
        expect(transition).toHaveProperty('toOffset');
        expect(transition).toHaveProperty('isDSTStart');
      }
    });

    test('getNextDSTTransition() returns null for non-DST zones', () => {
      const utc = ChronosTimezone.utc();

      expect(utc.getNextDSTTransition()).toBeNull();
    });
  });

  // ============================================================================
  // Conversion
  // ============================================================================

  describe('Conversion', () => {
    test('static convert() converts between timezones', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const converted = ChronosTimezone.convert(date, 'UTC', 'America/New_York');

      expect(converted).toBeInstanceOf(Date);
    });

    test('fromUTC() converts from UTC', () => {
      const tz = ChronosTimezone.create('America/New_York');
      const utcDate = new Date('2024-01-15T12:00:00Z');
      const localDate = tz.fromUTC(utcDate);

      expect(localDate).toBeInstanceOf(Date);
    });

    test('toUTC() converts to UTC', () => {
      const tz = ChronosTimezone.create('America/New_York');
      const localDate = new Date('2024-01-15T12:00:00');
      const utcDate = tz.toUTC(localDate);

      expect(utcDate).toBeInstanceOf(Date);
    });

    test('format() formats date in timezone', () => {
      const tz = ChronosTimezone.create('America/New_York');
      const date = new Date();
      const formatted = tz.format(date, { year: 'numeric', month: '2-digit', day: '2-digit' });

      expect(typeof formatted).toBe('string');
    });

    test('getComponents() returns date parts in timezone', () => {
      const tz = ChronosTimezone.utc();
      const date = new Date('2024-06-15T14:30:00Z');
      const components = tz.getComponents(date);

      expect(components.year).toBe(2024);
      expect(components.month).toBe(6);
      expect(components.day).toBe(15);
    });
  });

  // ============================================================================
  // Information
  // ============================================================================

  describe('Information', () => {
    test('getInfo() returns complete timezone info', () => {
      const tz = ChronosTimezone.create('America/New_York');
      const info = tz.getInfo();

      expect(info).toHaveProperty('identifier');
      expect(info).toHaveProperty('name');
      expect(info).toHaveProperty('abbreviation');
      expect(info).toHaveProperty('offset');
      expect(info).toHaveProperty('isDST');
      expect(info).toHaveProperty('observesDST');
    });

    test('equals() compares offsets', () => {
      const utc = ChronosTimezone.utc();
      const gmt = ChronosTimezone.create('GMT');

      expect(utc.equals(gmt)).toBe(true);
    });

    test('isSame() compares identifiers', () => {
      const tz1 = ChronosTimezone.create('America/New_York');
      const tz2 = ChronosTimezone.create('America/New_York');
      const tz3 = ChronosTimezone.create('America/Chicago');

      expect(tz1.isSame(tz2)).toBe(true);
      expect(tz1.isSame(tz3)).toBe(false);
    });
  });

  // ============================================================================
  // Static Utilities
  // ============================================================================

  describe('Static Utilities', () => {
    test('getAvailableTimezones() returns array', () => {
      const timezones = ChronosTimezone.getAvailableTimezones();

      expect(Array.isArray(timezones)).toBe(true);
      expect(timezones.length).toBeGreaterThan(0);
    });

    test('isValid() validates timezone identifiers', () => {
      expect(ChronosTimezone.isValid('America/New_York')).toBe(true);
      expect(ChronosTimezone.isValid('Invalid/Timezone')).toBe(false);
    });

    test('getTimezonesByRegion() groups by region', () => {
      const grouped = ChronosTimezone.getTimezonesByRegion();

      expect(grouped).toHaveProperty('America');
      expect(grouped).toHaveProperty('Europe');
      expect(grouped).toHaveProperty('Asia');
    });

    test('findByOffset() finds matching timezones', () => {
      const matches = ChronosTimezone.findByOffset(0);

      expect(matches.length).toBeGreaterThan(0);
      matches.forEach(tz => {
        expect(tz.getOffsetHours()).toBe(0);
      });
    });

    test('now() returns current time in timezone', () => {
      const utcNow = ChronosTimezone.now('UTC');

      expect(utcNow).toBeInstanceOf(Date);
    });
  });

  // ============================================================================
  // TIMEZONES Constant
  // ============================================================================

  describe('TIMEZONES Constant', () => {
    test('contains common timezone identifiers', () => {
      expect(TIMEZONES.UTC).toBe('UTC');
      expect(TIMEZONES['America/New_York']).toBe('America/New_York');
      expect(TIMEZONES['Europe/London']).toBe('Europe/London');
      expect(TIMEZONES['Asia/Tokyo']).toBe('Asia/Tokyo');
    });
  });

  // ============================================================================
  // Timezones Pre-created Instances
  // ============================================================================

  describe('Timezones Pre-created Instances', () => {
    test('UTC instance', () => {
      expect(Timezones.UTC.identifier).toBe('UTC');
    });

    test('Eastern instance', () => {
      expect(Timezones.Eastern.identifier).toBe('America/New_York');
    });

    test('Pacific instance', () => {
      expect(Timezones.Pacific.identifier).toBe('America/Los_Angeles');
    });

    test('Tokyo instance', () => {
      expect(Timezones.Tokyo.identifier).toBe('Asia/Tokyo');
    });

    test('London instance', () => {
      expect(Timezones.London.identifier).toBe('Europe/London');
    });
  });

  // ============================================================================
  // Serialization
  // ============================================================================

  describe('Serialization', () => {
    test('toString() returns identifier', () => {
      const tz = ChronosTimezone.create('America/New_York');
      expect(tz.toString()).toBe('America/New_York');
    });

    test('toJSON() returns object', () => {
      const tz = ChronosTimezone.create('America/New_York');
      const json = tz.toJSON();

      expect(json).toHaveProperty('identifier');
      expect(json).toHaveProperty('offset');
      expect(json).toHaveProperty('isDST');
      expect(json).toHaveProperty('observesDST');
    });

    test('valueOf() returns identifier', () => {
      const tz = ChronosTimezone.create('Europe/Paris');
      expect(tz.valueOf()).toBe('Europe/Paris');
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    test('handles Z as UTC alias', () => {
      const tz = ChronosTimezone.create('Z');
      expect(tz.identifier).toBe('UTC');
    });

    test('handles GMT as UTC alias', () => {
      const tz = ChronosTimezone.create('GMT');
      expect(tz.identifier).toBe('UTC');
    });

    test('handles fractional offsets', () => {
      const tz = ChronosTimezone.create('Asia/Kolkata'); // +05:30
      const offset = tz.getOffsetMinutes();

      expect(offset % 30).toBe(0); // Should be divisible by 30
    });
  });
});
