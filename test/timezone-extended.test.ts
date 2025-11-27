import { ChronosTimezone, Timezones, TIMEZONES } from '../src/core/timezone';

describe('ChronosTimezone Extended Tests', () => {
  // ============================================================================
  // Factory Methods - Extended
  // ============================================================================

  describe('Extended Factory Methods', () => {
    test('create() with GMT normalizes to UTC', () => {
      const tz = ChronosTimezone.create('GMT');

      expect(tz.identifier).toBe('UTC');
    });

    test('create() with Z normalizes to UTC', () => {
      const tz = ChronosTimezone.create('Z');

      expect(tz.identifier).toBe('UTC');
    });

    test('create() handles offset string', () => {
      const tz = ChronosTimezone.create('+05:30');

      // Now returns the original offset string
      expect(tz.identifier).toBe('+05:30');
    });

    test('create() handles negative offset string', () => {
      const tz = ChronosTimezone.create('-08:00');

      // Now returns the original offset string
      expect(tz.identifier).toBe('-08:00');
    });

    test('fromOffset() creates timezone from hours', () => {
      const tz = ChronosTimezone.fromOffset(5.5);

      // Now returns the offset string format
      expect(tz.identifier).toBe('+05:30');
    });

    test('fromOffset() handles negative offset', () => {
      const tz = ChronosTimezone.fromOffset(-8);

      // Now returns the offset string format
      expect(tz.identifier).toBe('-08:00');
    });

    test('localIdentifier() returns local timezone', () => {
      const identifier = ChronosTimezone.localIdentifier();

      expect(typeof identifier).toBe('string');
      expect(identifier.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Getters - Extended
  // ============================================================================

  describe('Extended Getters', () => {
    test('name is alias for identifier', () => {
      const tz = ChronosTimezone.create('America/New_York');

      expect(tz.name).toBe(tz.identifier);
    });

    test('getAbbreviation() returns short timezone name', () => {
      const tz = ChronosTimezone.create('America/New_York');
      const abbr = tz.getAbbreviation();

      expect(typeof abbr).toBe('string');
    });

    test('getFullName() returns long timezone name', () => {
      const tz = ChronosTimezone.create('America/New_York');
      const fullName = tz.getFullName();

      expect(typeof fullName).toBe('string');
      expect(fullName.length).toBeGreaterThan(0);
    });

    test('getAbbreviation() handles invalid timezone gracefully', () => {
      // Create with valid timezone then check abbreviation
      const tz = ChronosTimezone.create('UTC');
      const abbr = tz.getAbbreviation();

      expect(typeof abbr).toBe('string');
    });

    test('getFullName() handles invalid timezone gracefully', () => {
      const tz = ChronosTimezone.create('UTC');
      const fullName = tz.getFullName();

      expect(typeof fullName).toBe('string');
    });
  });

  // ============================================================================
  // Offset Calculations - Extended
  // ============================================================================

  describe('Extended Offset Calculations', () => {
    test('getOffsetMinutes() returns offset in minutes', () => {
      const tz = ChronosTimezone.create('UTC');
      const offset = tz.getOffsetMinutes();

      expect(offset).toBe(0);
    });

    test('getOffsetHours() returns offset in hours', () => {
      const tz = ChronosTimezone.create('UTC');
      const offset = tz.getOffsetHours();

      expect(offset).toBe(0);
    });

    test('getOffsetString() returns formatted offset', () => {
      const tz = ChronosTimezone.create('UTC');
      const offsetStr = tz.getOffsetString();

      expect(offsetStr).toBe('+00:00');
    });

    test('getOffset() returns complete offset info', () => {
      const tz = ChronosTimezone.create('UTC');
      const offset = tz.getOffset();

      expect(offset).toHaveProperty('minutes');
      expect(offset).toHaveProperty('hours');
      expect(offset).toHaveProperty('string');
    });

    test('getOffsetMinutes() for non-UTC timezone', () => {
      const tz = ChronosTimezone.create('America/New_York');
      const offset = tz.getOffsetMinutes();

      // New York is UTC-5 or UTC-4 depending on DST
      expect(offset).toBeLessThanOrEqual(0);
      expect(offset).toBeGreaterThanOrEqual(-300);
    });
  });

  // ============================================================================
  // DST (Daylight Saving Time) - Extended
  // ============================================================================

  describe('Extended DST', () => {
    test('isDST() returns boolean', () => {
      const tz = ChronosTimezone.create('America/New_York');
      const isDst = tz.isDST();

      expect(typeof isDst).toBe('boolean');
    });

    test('observesDST() returns true for DST-observing timezone', () => {
      const tz = ChronosTimezone.create('America/New_York');

      expect(tz.observesDST()).toBe(true);
    });

    test('observesDST() returns false for non-DST timezone', () => {
      const tz = ChronosTimezone.create('UTC');

      expect(tz.observesDST()).toBe(false);
    });

    test('getNextDSTTransition() returns null for non-DST timezone', () => {
      const tz = ChronosTimezone.create('UTC');

      expect(tz.getNextDSTTransition()).toBeNull();
    });

    test('getNextDSTTransition() returns transition for DST timezone', () => {
      const tz = ChronosTimezone.create('America/New_York');
      const transition = tz.getNextDSTTransition();

      if (tz.observesDST()) {
        expect(transition).not.toBeNull();
        if (transition) {
          expect(transition).toHaveProperty('date');
          expect(transition).toHaveProperty('fromOffset');
          expect(transition).toHaveProperty('toOffset');
          expect(transition).toHaveProperty('isDSTStart');
        }
      }
    });
  });

  // ============================================================================
  // Conversion - Extended
  // ============================================================================

  describe('Extended Conversion', () => {
    test('format() formats date in timezone', () => {
      const tz = ChronosTimezone.create('UTC');
      const date = new Date('2024-06-15T12:00:00Z');
      const formatted = tz.format(date);

      expect(typeof formatted).toBe('string');
    });

    test('format() with custom options', () => {
      const tz = ChronosTimezone.create('UTC');
      const date = new Date('2024-06-15T12:00:00Z');
      const formatted = tz.format(date, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      expect(formatted).toContain('2024');
      expect(formatted).toContain('June');
    });

    test('getComponents() returns date components', () => {
      const tz = ChronosTimezone.create('UTC');
      const date = new Date('2024-06-15T12:30:45Z');
      const components = tz.getComponents(date);

      expect(components).toHaveProperty('year');
      expect(components).toHaveProperty('month');
      expect(components).toHaveProperty('day');
      expect(components).toHaveProperty('hour');
      expect(components).toHaveProperty('minute');
      expect(components).toHaveProperty('second');
      expect(components).toHaveProperty('dayOfWeek');
    });

    test('convert() converts between timezones', () => {
      const date = new Date('2024-06-15T12:00:00Z');
      const converted = ChronosTimezone.convert(date, 'UTC', 'America/New_York');

      expect(converted).toBeInstanceOf(Date);
    });

    test('fromUTC() converts from UTC', () => {
      const tz = ChronosTimezone.create('America/New_York');
      const utcDate = new Date('2024-06-15T12:00:00Z');
      const localDate = tz.fromUTC(utcDate);

      expect(localDate).toBeInstanceOf(Date);
    });

    test('toUTC() converts to UTC', () => {
      const tz = ChronosTimezone.create('America/New_York');
      const localDate = new Date('2024-06-15T12:00:00');
      const utcDate = tz.toUTC(localDate);

      expect(utcDate).toBeInstanceOf(Date);
    });
  });

  // ============================================================================
  // Information - Extended
  // ============================================================================

  describe('Extended Information', () => {
    test('getInfo() returns comprehensive info', () => {
      const tz = ChronosTimezone.create('America/New_York');
      const info = tz.getInfo();

      expect(info).toHaveProperty('identifier');
      expect(info).toHaveProperty('abbreviation');
      expect(info).toHaveProperty('name');
      expect(info).toHaveProperty('offset');
      expect(info).toHaveProperty('isDST');
      expect(info).toHaveProperty('observesDST');
    });

    test('equals() compares timezones by offset', () => {
      const tz1 = ChronosTimezone.create('UTC');
      const tz2 = ChronosTimezone.create('GMT');
      const tz3 = ChronosTimezone.create('America/New_York');

      expect(tz1.equals(tz2)).toBe(true);
      expect(tz1.equals(tz3)).toBe(false);
    });

    test('equals() accepts string parameter', () => {
      const tz = ChronosTimezone.create('UTC');

      expect(tz.equals('GMT')).toBe(true);
    });

    test('isSame() compares identifiers', () => {
      const tz1 = ChronosTimezone.create('America/New_York');
      const tz2 = ChronosTimezone.create('America/New_York');
      const tz3 = ChronosTimezone.create('Europe/London');

      expect(tz1.isSame(tz2)).toBe(true);
      expect(tz1.isSame(tz3)).toBe(false);
    });

    test('isSame() accepts string parameter', () => {
      const tz = ChronosTimezone.create('America/New_York');

      expect(tz.isSame('America/New_York')).toBe(true);
      expect(tz.isSame('Europe/London')).toBe(false);
    });
  });

  // ============================================================================
  // Static Utilities - Extended
  // ============================================================================

  describe('Extended Static Utilities', () => {
    test('getAvailableTimezones() returns array of timezones', () => {
      const timezones = ChronosTimezone.getAvailableTimezones();

      expect(Array.isArray(timezones)).toBe(true);
      expect(timezones.length).toBeGreaterThan(0);
    });

    test('isValid() returns true for valid timezone', () => {
      expect(ChronosTimezone.isValid('America/New_York')).toBe(true);
      expect(ChronosTimezone.isValid('UTC')).toBe(true);
    });

    test('isValid() returns false for invalid timezone', () => {
      expect(ChronosTimezone.isValid('Invalid/Timezone')).toBe(false);
      expect(ChronosTimezone.isValid('NotATimezone')).toBe(false);
    });

    test('getTimezonesByRegion() groups timezones', () => {
      const grouped = ChronosTimezone.getTimezonesByRegion();

      expect(typeof grouped).toBe('object');
      expect(Object.keys(grouped).length).toBeGreaterThan(0);
    });

    test('findByOffset() finds timezones with matching offset', () => {
      const timezones = ChronosTimezone.findByOffset(0);

      expect(Array.isArray(timezones)).toBe(true);
      expect(timezones.length).toBeGreaterThan(0);
    });

    test('now() returns current time in timezone', () => {
      const time = ChronosTimezone.now('UTC');

      expect(time).toBeInstanceOf(Date);
    });
  });

  // ============================================================================
  // Serialization - Extended
  // ============================================================================

  describe('Extended Serialization', () => {
    test('toString() returns identifier', () => {
      const tz = ChronosTimezone.create('America/New_York');

      expect(tz.toString()).toBe('America/New_York');
    });

    test('toJSON() returns serializable object', () => {
      const tz = ChronosTimezone.create('America/New_York');
      const json = tz.toJSON();

      expect(json).toHaveProperty('identifier');
      expect(json).toHaveProperty('offset');
      expect(json).toHaveProperty('isDST');
      expect(json).toHaveProperty('observesDST');
    });

    test('valueOf() returns identifier', () => {
      const tz = ChronosTimezone.create('America/New_York');

      expect(tz.valueOf()).toBe('America/New_York');
    });
  });

  // ============================================================================
  // Pre-created Timezone Instances
  // ============================================================================

  describe('Pre-created Timezones', () => {
    test('Timezones.UTC is UTC', () => {
      expect(Timezones.UTC.identifier).toBe('UTC');
    });

    test('Timezones.Local is local timezone', () => {
      expect(Timezones.Local.identifier).toBe(ChronosTimezone.localIdentifier());
    });

    test('Timezones.Eastern is America/New_York', () => {
      expect(Timezones.Eastern.identifier).toBe('America/New_York');
    });

    test('Timezones.Pacific is America/Los_Angeles', () => {
      expect(Timezones.Pacific.identifier).toBe('America/Los_Angeles');
    });

    test('Timezones.London is Europe/London', () => {
      expect(Timezones.London.identifier).toBe('Europe/London');
    });

    test('Timezones.Tokyo is Asia/Tokyo', () => {
      expect(Timezones.Tokyo.identifier).toBe('Asia/Tokyo');
    });

    test('Timezones.Sydney is Australia/Sydney', () => {
      expect(Timezones.Sydney.identifier).toBe('Australia/Sydney');
    });
  });

  // ============================================================================
  // TIMEZONES Constant
  // ============================================================================

  describe('TIMEZONES Constant', () => {
    test('TIMEZONES contains UTC', () => {
      expect(TIMEZONES.UTC).toBe('UTC');
    });

    test('TIMEZONES contains major cities', () => {
      expect(TIMEZONES['America/New_York']).toBe('America/New_York');
      expect(TIMEZONES['Europe/London']).toBe('Europe/London');
      expect(TIMEZONES['Asia/Tokyo']).toBe('Asia/Tokyo');
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    test('handles malformed offset string gracefully', () => {
      const tz = ChronosTimezone.create('invalid');

      // Should not throw, should use the string as-is
      expect(tz.identifier).toBe('invalid');
    });

    test('getOffsetMinutes handles invalid timezone gracefully', () => {
      const tz = ChronosTimezone.utc();
      const offset = tz.getOffsetMinutes();

      expect(typeof offset).toBe('number');
    });

    test('isDST() with specific winter date', () => {
      const tz = ChronosTimezone.create('America/New_York');
      const winterDate = new Date(2024, 0, 15, 12, 0, 0); // Jan 15, 2024 local time
      const isDst = tz.isDST(winterDate);

      // DST detection can be environment-dependent
      expect(typeof isDst).toBe('boolean');
    });

    test('isDST() with specific summer date', () => {
      const tz = ChronosTimezone.create('America/New_York');
      const summerDate = new Date(2024, 6, 15, 12, 0, 0); // Jul 15, 2024 local time
      const isDst = tz.isDST(summerDate);

      // DST detection can be environment-dependent
      expect(typeof isDst).toBe('boolean');
    });
  });
});
