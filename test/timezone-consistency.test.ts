import { Chronos } from '../src/core/chronos';

describe('Timezone consistency', () => {
  const MADRID = 'Europe/Madrid';

  describe('parse() resolves offset-less strings in the supplied timezone', () => {
    test('offset-less date-time matches create()', () => {
      const created = Chronos.create(2026, 3, 28, 12, 0, 0, 0, MADRID);
      const parsed = Chronos.parse('2026-03-28T12:00:00', MADRID);

      expect(parsed.toISOString()).toBe('2026-03-28T11:00:00.000Z');
      expect(parsed.toISOString()).toBe(created.toISOString());
    });

    test('date-only string is midnight in the supplied timezone', () => {
      const parsed = Chronos.parse('2026-03-28', MADRID);

      expect(parsed.toISOString()).toBe('2026-03-27T23:00:00.000Z');
      expect(parsed.format('YYYY-MM-DD HH:mm:ss')).toBe('2026-03-28 00:00:00');
    });

    test('space-separated date-time is honoured', () => {
      expect(Chronos.parse('2026-03-28 12:00:00', MADRID).toISOString()).toBe(
        '2026-03-28T11:00:00.000Z',
      );
    });

    test('fractional seconds are preserved', () => {
      expect(
        Chronos.parse('2026-03-28T12:00:00.250', MADRID).toISOString(),
      ).toBe('2026-03-28T11:00:00.250Z');
      expect(Chronos.parse('2026-03-28T12:00:00.5', MADRID).toISOString()).toBe(
        '2026-03-28T11:00:00.500Z',
      );
    });

    test('DD/MM/YYYY is midnight in the supplied timezone', () => {
      expect(Chronos.parse('28/03/2026', MADRID).toISOString()).toBe(
        '2026-03-27T23:00:00.000Z',
      );
    });

    test('a summer date uses the summer offset', () => {
      expect(Chronos.parse('2026-07-15T12:00:00', MADRID).toISOString()).toBe(
        '2026-07-15T10:00:00.000Z',
      );
    });

    test('an explicit Z still names the instant it says', () => {
      expect(Chronos.parse('2026-03-28T12:00:00Z', MADRID).toISOString()).toBe(
        '2026-03-28T12:00:00.000Z',
      );
    });

    test('an explicit numeric offset still names the instant it says', () => {
      expect(
        Chronos.parse('2026-03-28T12:00:00+05:00', MADRID).toISOString(),
      ).toBe('2026-03-28T07:00:00.000Z');
    });

    test('without a timezone the native parse is unchanged', () => {
      expect(Chronos.parse('2026-03-28T12:00:00').valueOf()).toBe(
        new Date('2026-03-28T12:00:00').getTime(),
      );
      expect(Chronos.parse('2026-03-28').valueOf()).toBe(
        new Date('2026-03-28').getTime(),
      );
      expect(Chronos.parse('28/03/2026').valueOf()).toBe(
        new Date(2026, 2, 28).getTime(),
      );
    });

    test('sub-millisecond fractional seconds take the zone path', () => {
      expect(
        Chronos.parse('2026-03-28T12:00:00.123456', MADRID).toISOString(),
      ).toBe('2026-03-28T11:00:00.123Z');
      expect(
        Chronos.parse('2026-03-28T12:00:00.1234', MADRID).toISOString(),
      ).toBe('2026-03-28T11:00:00.123Z');
    });

    test('a lowercase ISO separator is honoured', () => {
      expect(Chronos.parse('2026-03-28t12:00:00', MADRID).toISOString()).toBe(
        '2026-03-28T11:00:00.000Z',
      );
    });

    test('offset-string timezones resolve, including partial-hour ones', () => {
      expect(Chronos.parse('2026-03-28T12:00:00', '+05:30').toISOString()).toBe(
        '2026-03-28T06:30:00.000Z',
      );
      expect(Chronos.parse('2026-03-28T12:00:00', '+05:45').toISOString()).toBe(
        '2026-03-28T06:15:00.000Z',
      );
    });

    test('parse() agrees with create() across DST transitions', () => {
      const stamps: [number, number, number, number, number][] = [
        [2026, 3, 29, 2, 30], // spring-forward gap in Madrid
        [2026, 10, 25, 2, 30], // fall-back ambiguity in Madrid
        [2026, 7, 15, 12, 0],
      ];

      for (const [y, mo, d, h, mi] of stamps) {
        const pad = (n: number) => String(n).padStart(2, '0');
        const iso = `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}:00`;

        expect(Chronos.parse(iso, MADRID).toISOString()).toBe(
          Chronos.create(y, mo, d, h, mi, 0, 0, MADRID).toISOString(),
        );
      }
    });

    test('interleaved zones stay independent', () => {
      // Guards the shared Intl formatter cache against cross-zone bleed.
      for (let i = 0; i < 3; i++) {
        expect(Chronos.parse('2026-03-28T12:00:00', MADRID).toISOString()).toBe(
          '2026-03-28T11:00:00.000Z',
        );
        expect(
          Chronos.parse('2026-03-28T12:00:00', 'Asia/Kolkata').toISOString(),
        ).toBe('2026-03-28T06:30:00.000Z');
        expect(Chronos.parse('2026-03-28T12:00:00', 'UTC').toISOString()).toBe(
          '2026-03-28T12:00:00.000Z',
        );
      }
    });

    test('the global default timezone drives parsing too', () => {
      Chronos.configure({ timezone: MADRID });
      try {
        expect(Chronos.parse('2026-03-28T12:00:00').toISOString()).toBe(
          '2026-03-28T11:00:00.000Z',
        );
        expect(Chronos.parse('2026-03-28T12:00:00Z').toISOString()).toBe(
          '2026-03-28T12:00:00.000Z',
        );
      } finally {
        Chronos.configure({ timezone: undefined });
      }

      expect(Chronos.parse('2026-03-28T12:00:00').valueOf()).toBe(
        new Date('2026-03-28T12:00:00').getTime(),
      );
    });

    test('unparseable strings still throw', () => {
      expect(() => Chronos.parse('2026-13-01', MADRID)).toThrow();
      expect(() => Chronos.parse('31/02/2026', MADRID)).toThrow();
      expect(() => Chronos.parse('not a date', MADRID)).toThrow();
    });

    test('out-of-range days fall through to the native parser either way', () => {
      // V8 rolls 2026-02-30 over to 2 March. That is pre-existing behaviour;
      // what matters is that attaching a timezone does not change it.
      expect(Chronos.parse('2026-02-30', MADRID).valueOf()).toBe(
        Chronos.parse('2026-02-30').valueOf(),
      );
    });
  });

  describe('midnight in a zone reads as hour 0, not 24', () => {
    const midnight = Chronos.fromMillis(
      Date.parse('2026-03-27T23:00:00Z'),
      MADRID,
    );

    test('the hour getter returns 0', () => {
      expect(midnight.hour).toBe(0);
    });

    test('format() prints 00:00:00', () => {
      expect(midnight.format('YYYY-MM-DD HH:mm:ss')).toBe(
        '2026-03-28 00:00:00',
      );
    });

    test('create() at midnight lands on the right instant', () => {
      expect(
        Chronos.create(2026, 3, 28, 0, 0, 0, 0, MADRID).toISOString(),
      ).toBe('2026-03-27T23:00:00.000Z');
    });

    test('startOf/endOf day are the right instants', () => {
      expect(midnight.startOf('day').toISOString()).toBe(
        '2026-03-27T23:00:00.000Z',
      );
      expect(midnight.endOf('day').toISOString()).toBe(
        '2026-03-28T22:59:59.999Z',
      );
    });

    test('midnight in zones at every offset sign', () => {
      for (const [zone, utc] of [
        ['Asia/Tokyo', '2026-03-27T15:00:00Z'],
        ['America/New_York', '2026-03-28T04:00:00Z'],
        ['Asia/Kolkata', '2026-03-27T18:30:00Z'],
        ['UTC', '2026-03-28T00:00:00Z'],
      ] as const) {
        const m = Chronos.fromMillis(Date.parse(utc), zone);
        expect(m.hour).toBe(0);
        expect(m.format('YYYY-MM-DD HH:mm')).toBe('2026-03-28 00:00');
      }
    });
  });

  describe('unit comparisons use the instance timezone', () => {
    // Both instants fall on 30 March 2026 in Madrid, but on different days in UTC.
    const a = Chronos.fromMillis(Date.parse('2026-03-29T22:30:00Z'), MADRID);
    const b = Chronos.fromMillis(Date.parse('2026-03-30T21:30:00Z'), MADRID);

    test('the two instants are the same Madrid day', () => {
      expect(a.format('YYYY-MM-DD HH:mm:ss')).toBe('2026-03-30 00:30:00');
      expect(b.format('YYYY-MM-DD HH:mm:ss')).toBe('2026-03-30 23:30:00');
    });

    test('isSame/isBefore/isAfter agree on the day', () => {
      expect(a.isSame(b, 'day')).toBe(true);
      expect(a.isBefore(b, 'day')).toBe(false);
      expect(a.isAfter(b, 'day')).toBe(false);
    });

    test('isSameOrBefore/isSameOrAfter agree on the day', () => {
      expect(a.isSameOrBefore(b, 'day')).toBe(true);
      expect(a.isSameOrAfter(b, 'day')).toBe(true);
    });

    test('isSameDay agrees', () => {
      expect(a.isSameDay(b)).toBe(true);
    });

    test('isBetween buckets by the instance timezone', () => {
      const start = Chronos.parse('2026-03-30', MADRID);
      const end = Chronos.parse('2026-03-30', MADRID);

      expect(a.isBetween(start, end, 'day', '[]')).toBe(true);
      expect(b.isBetween(start, end, 'day', '[]')).toBe(true);
    });

    test('month boundaries follow the instance timezone', () => {
      const first = Chronos.fromMillis(
        Date.parse('2026-03-31T22:30:00Z'),
        MADRID,
      ); // 2026-04-01 00:30 Madrid
      const last = Chronos.fromMillis(
        Date.parse('2026-04-30T21:30:00Z'),
        MADRID,
      ); // 2026-04-30 23:30 Madrid

      expect(first.isSame(last, 'month')).toBe(true);
      expect(first.isSameMonth(last)).toBe(true);
    });

    test('year boundaries follow the instance timezone', () => {
      const jan = Chronos.fromMillis(
        Date.parse('2025-12-31T23:30:00Z'),
        MADRID,
      ); // 2026-01-01 00:30 Madrid
      const dec = Chronos.fromMillis(
        Date.parse('2026-12-31T22:30:00Z'),
        MADRID,
      ); // 2026-12-31 23:30 Madrid

      expect(jan.isSame(dec, 'year')).toBe(true);
      expect(jan.isSameYear(dec)).toBe(true);
    });

    test('offset-less string operands are read in the instance timezone', () => {
      expect(b.isSame('2026-03-30', 'day')).toBe(true);
      expect(b.isSame('2026-03-30T23:30:00')).toBe(true);
    });

    test('without a timezone the comparisons are unchanged', () => {
      const x = Chronos.create(2026, 3, 30, 0, 30);
      const y = Chronos.create(2026, 3, 30, 23, 30);

      expect(x.isSame(y, 'day')).toBe(true);
      expect(x.isBefore(y, 'day')).toBe(false);
      expect(x.isBefore(y)).toBe(true);
    });
  });

  describe('isToday/isTomorrow/isYesterday use the instance timezone', () => {
    afterEach(() => {
      Chronos.setTestNow();
    });

    test('an instant past midnight in the zone is still "today" there', () => {
      // 2026-06-15 22:30Z is already 2026-06-16 00:30 in Madrid.
      Chronos.setTestNow(new Date('2026-06-15T22:30:00Z'));

      const justAfterMidnight = Chronos.fromMillis(
        Date.parse('2026-06-15T22:45:00Z'),
        MADRID,
      );
      const nextDay = Chronos.fromMillis(
        Date.parse('2026-06-16T22:45:00Z'),
        MADRID,
      );
      const previousDay = Chronos.fromMillis(
        Date.parse('2026-06-14T22:45:00Z'),
        MADRID,
      );

      expect(justAfterMidnight.isToday()).toBe(true);
      expect(nextDay.isTomorrow()).toBe(true);
      expect(previousDay.isYesterday()).toBe(true);
    });
  });

  describe('diff() counts calendar units in the instance timezone', () => {
    const jan = Chronos.fromMillis(Date.parse('2025-12-31T23:30:00Z'), MADRID); // 2026-01-01 00:30 Madrid
    const dec = Chronos.fromMillis(Date.parse('2025-12-30T23:30:00Z'), MADRID); // 2025-12-31 00:30 Madrid

    test('years cross the zone new year, not the UTC one', () => {
      expect(jan.diff(dec, 'year')).toBe(1);
    });

    test('months are counted from the zone wall clock', () => {
      expect(jan.diff(dec, 'month')).toBe(0);

      const june = Chronos.fromMillis(
        Date.parse('2026-05-31T22:30:00Z'),
        MADRID,
      ); // 2026-06-01 00:30 Madrid
      const may = Chronos.fromMillis(
        Date.parse('2026-04-30T22:30:00Z'),
        MADRID,
      ); // 2026-05-01 00:30 Madrid

      expect(june.diff(may, 'month')).toBe(1);
      expect(june.diff(may, 'quarter')).toBe(0);
    });

    test('instant-based units are unaffected', () => {
      expect(jan.diff(dec, 'hour')).toBe(24);
      expect(jan.diff(dec, 'millisecond')).toBe(86400000);
    });
  });
});
