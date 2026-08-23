/**
 * Chronos - The ultimate TypeScript date/time library
 * @module Chronos
 */

import {
  DateInput,
  ChronosConfig,
  Duration,
  AnyTimeUnit,
  TimeUnit,
  DayOfWeek,
  DateTimeSetter,
  DiffResult,
  HumanDiffOptions,
  ChronosLike,
  LocaleConfig,
  DateTimeComponents,
  ChronosJSON,
} from '../types';
import { ChronosTimezone } from './timezone';
import {
  isDate,
  isValidDate,
  cloneDate,
  isLeapYear,
  getDaysInMonth,
  getDaysInYear,
  getISOWeek,
  getISOWeekYear,
  getDayOfYear,
  getQuarter,
  addUnits,
  diffInUnits,
  startOf,
  endOf,
  isChronosLike,
  isDuration,
  normalizeUnit,
  padStart,
  MILLISECONDS_PER_SECOND,
  MILLISECONDS_PER_MINUTE,
  MILLISECONDS_PER_HOUR,
  MILLISECONDS_PER_DAY,
  MILLISECONDS_PER_MONTH,
  MILLISECONDS_PER_YEAR,
} from '../utils';
import { getLocale } from '../locales';

// ============================================================================
// Global Configuration
// ============================================================================

let globalConfig: ChronosConfig = {
  timezone: undefined,
  locale: 'en',
  weekStartsOn: DayOfWeek.Sunday,
  firstWeekContainsDate: 1,
  strict: false,
};

let testNow: Chronos | null = null;

// ============================================================================
// Chronos Class
// ============================================================================

/**
 * Chronos - A comprehensive date/time manipulation library
 *
 * @example
 * ```typescript
 * // Create instances
 * const now = Chronos.now();
 * const date = Chronos.parse('2024-01-15');
 * const birthday = Chronos.create(1990, 5, 15);
 *
 * // Manipulate
 * const future = now.add(3, 'months').startOf('day');
 * const past = now.subtract(1, 'year').endOf('month');
 *
 * // Compare
 * const isAfter = date.isAfter(birthday);
 * const diff = date.diff(birthday, 'years');
 *
 * // Format
 * const formatted = now.format('YYYY-MM-DD HH:mm:ss');
 * const relative = birthday.fromNow(); // "34 years ago"
 * ```
 */
export class Chronos implements ChronosLike {
  private readonly _date: Date;
  private _locale: LocaleConfig;
  private _timezone?: string;

  // ============================================================================
  // Constructors
  // ============================================================================

  /**
   * Create a new Chronos instance
   *
   * @param input - Date input (string, number, Date, or Chronos)
   * @param timezone - Optional timezone
   */
  private constructor(input?: DateInput, timezone?: string) {
    this._locale = getLocale(globalConfig.locale ?? 'en');
    this._timezone = timezone ?? globalConfig.timezone;

    if (testNow && input === undefined) {
      this._date = new Date(testNow._date);
    } else if (input === null || input === undefined) {
      this._date = new Date();
    } else if (typeof input === 'number') {
      this._date = new Date(input);
    } else if (typeof input === 'string') {
      this._date = this.parseString(input);
    } else if (isDate(input)) {
      this._date = new Date(input);
    } else if (isChronosLike(input)) {
      this._date = input.toDate();
    } else {
      this._date = new Date();
    }

    if (!isValidDate(this._date)) {
      throw new Error(`Invalid date: ${input}`);
    }
  }

  /**
   * Matches an offset-less ISO 8601 date or date-time. Strings carrying a `Z` or
   * a numeric offset deliberately fail to match: those name an unambiguous
   * instant and must keep going through the native parser. Fractional seconds
   * are open-ended so that sub-millisecond inputs (`.123456`, as emitted by
   * Postgres and Python) take this path too rather than silently falling back.
   */
  private static readonly OFFSETLESS_ISO =
    /^(\d{4})-(\d{2})-(\d{2})(?:[Tt ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?)?$/;

  private parseString(input: string): Date {
    // An offset-less string is a wall-clock reading, not an instant. With a
    // timezone attached it has to be resolved in that zone — the native parser
    // would resolve it in the process timezone instead.
    const iso = input.match(Chronos.OFFSETLESS_ISO);
    if (iso && this._timezone) {
      const year = parseInt(iso[1], 10);
      const month = parseInt(iso[2], 10);
      const day = parseInt(iso[3], 10);
      const hour = iso[4] ? parseInt(iso[4], 10) : 0;
      const minute = iso[5] ? parseInt(iso[5], 10) : 0;
      const second = iso[6] ? parseInt(iso[6], 10) : 0;
      // Truncate rather than round, matching the native parser.
      const millisecond = iso[7]
        ? parseInt(iso[7].slice(0, 3).padEnd(3, '0'), 10)
        : 0;

      // Reject out-of-range fields rather than letting them roll over, so an
      // invalid string still falls through to the "unable to parse" error.
      if (
        month >= 1 &&
        month <= 12 &&
        day >= 1 &&
        day <= getDaysInMonth(year, month - 1) &&
        hour <= 23 &&
        minute <= 59 &&
        second <= 59
      ) {
        return Chronos.dateFromComponents(
          { year, month, day, hour, minute, second, millisecond },
          this._timezone,
        );
      }
    }

    const isoDate = new Date(input);
    if (isValidDate(isoDate)) {
      return isoDate;
    }

    // DD/MM/YYYY — only reached when the native parser above failed (e.g. the
    // day is > 12, so it cannot be interpreted as US MM/DD/YYYY).
    const dmy = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dmy) {
      const day = parseInt(dmy[1], 10);
      const month = parseInt(dmy[2], 10);
      const year = parseInt(dmy[3], 10);
      if (
        month >= 1 &&
        month <= 12 &&
        day >= 1 &&
        day <= getDaysInMonth(year, month - 1)
      ) {
        return this._timezone
          ? Chronos.dateFromComponents({ year, month, day }, this._timezone)
          : new Date(year, month - 1, day);
      }
    }

    throw new Error(`Unable to parse date: ${input}`);
  }

  private static dateFromComponents(
    components: DateTimeComponents,
    timezone: string,
  ): Date {
    const utcTime = Date.UTC(
      components.year ?? 1970,
      (components.month ?? 1) - 1,
      components.day ?? 1,
      components.hour ?? 0,
      components.minute ?? 0,
      components.second ?? 0,
      components.millisecond ?? 0,
    );

    const tz = new ChronosTimezone(timezone);
    let offset = tz.getOffsetMinutes(new Date(utcTime));
    let date = new Date(utcTime - offset * 60000);

    // Refine offset (handle DST transitions)
    for (let i = 0; i < 3; i++) {
      const newOffset = tz.getOffsetMinutes(date);
      if (newOffset === offset) break;
      offset = newOffset;
      date = new Date(utcTime - offset * 60000);
    }

    return date;
  }

  // ============================================================================
  // Static Factory Methods
  // ============================================================================

  /**
   * Create a Chronos instance from various inputs
   *
   * @example
   * ```typescript
   * Chronos.parse('2024-01-15')
   * Chronos.parse(1705276800000)
   * Chronos.parse(new Date())
   * ```
   */
  static parse(input?: DateInput, timezone?: string): Chronos {
    return new Chronos(input, timezone);
  }

  /**
   * Create a Chronos instance for the current moment
   *
   * @example
   * ```typescript
   * const now = Chronos.now();
   * ```
   */
  static now(timezone?: string): Chronos {
    return new Chronos(undefined, timezone);
  }

  /**
   * Create a Chronos instance for today at midnight
   */
  static today(timezone?: string): Chronos {
    return Chronos.now(timezone).startOf('day');
  }

  /**
   * Create a Chronos instance for tomorrow at midnight
   */
  static tomorrow(timezone?: string): Chronos {
    return Chronos.today(timezone).add(1, 'day');
  }

  /**
   * Create a Chronos instance for yesterday at midnight
   */
  static yesterday(timezone?: string): Chronos {
    return Chronos.today(timezone).subtract(1, 'day');
  }

  /**
   * Create a Chronos instance from individual components
   * Month is 1-12 (like Carbon PHP)
   *
   * @example
   * ```typescript
   * Chronos.create(2024, 1, 15, 10, 30, 0) // Jan 15, 2024 10:30:00
   * ```
   */
  static create(
    year: number,
    month: number = 1,
    day: number = 1,
    hour: number = 0,
    minute: number = 0,
    second: number = 0,
    millisecond: number = 0,
    timezone?: string,
  ): Chronos {
    if (timezone) {
      const date = Chronos.dateFromComponents(
        {
          year,
          month,
          day,
          hour,
          minute,
          second,
          millisecond,
        },
        timezone,
      );
      return new Chronos(date, timezone);
    }

    const date = new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      second,
      millisecond,
    );
    return new Chronos(date, timezone);
  }

  /**
   * Create a Chronos instance from a Unix timestamp (seconds)
   */
  static fromUnix(timestamp: number, timezone?: string): Chronos {
    return new Chronos(timestamp * 1000, timezone);
  }

  /**
   * Create a Chronos instance from a Unix timestamp (milliseconds)
   */
  static fromMillis(timestamp: number, timezone?: string): Chronos {
    return new Chronos(timestamp, timezone);
  }

  /**
   * Create a Chronos instance from components object
   * Month in components is 1-12 (like Carbon PHP)
   */
  static fromObject(
    components: DateTimeComponents,
    timezone?: string,
  ): Chronos {
    if (timezone) {
      const date = Chronos.dateFromComponents(components, timezone);
      return new Chronos(date, timezone);
    }

    const now = new Date();
    const date = new Date(
      components.year ?? now.getFullYear(),
      (components.month ?? now.getMonth() + 1) - 1,
      components.day ?? now.getDate(),
      components.hour ?? 0,
      components.minute ?? 0,
      components.second ?? 0,
      components.millisecond ?? 0,
    );
    return new Chronos(date, timezone);
  }

  /**
   * Create a Chronos instance from a format string
   *
   * @example
   * ```typescript
   * Chronos.fromFormat('15-01-2024', 'DD-MM-YYYY')
   * ```
   */
  static fromFormat(input: string, format: string, timezone?: string): Chronos {
    const components: DateTimeComponents = {};
    let inputIndex = 0;

    const tokens: string[] =
      format.match(/(YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s|SSS)/g) || [];
    const literals = format.split(/(YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s|SSS)/);

    for (let i = 0; i < literals.length; i++) {
      const literal = literals[i];

      if (tokens.includes(literal)) {
        let length = literal.length;
        if (
          literal === 'M' ||
          literal === 'D' ||
          literal === 'H' ||
          literal === 'm' ||
          literal === 's'
        ) {
          // Variable length, find next non-digit
          length = input.slice(inputIndex).search(/\D/);
          if (length === -1) length = input.length - inputIndex;
        }

        const value = parseInt(
          input.slice(inputIndex, inputIndex + length),
          10,
        );
        inputIndex += length;

        switch (literal) {
          case 'YYYY':
            components.year = value;
            break;
          case 'YY':
            components.year = value + (value >= 70 ? 1900 : 2000);
            break;
          case 'MM':
          case 'M':
            components.month = value; // Month is 1-12, fromObject expects 1-12
            break;
          case 'DD':
          case 'D':
            components.day = value;
            break;
          case 'HH':
          case 'H':
            components.hour = value;
            break;
          case 'mm':
          case 'm':
            components.minute = value;
            break;
          case 'ss':
          case 's':
            components.second = value;
            break;
          case 'SSS':
            components.millisecond = value;
            break;
        }
      } else {
        inputIndex += literal.length;
      }
    }

    return Chronos.fromObject(components, timezone);
  }

  /**
   * Create the minimum possible date
   */
  static min(): Chronos {
    return new Chronos(new Date(-8640000000000000));
  }

  /**
   * Create the maximum possible date
   */
  static max(): Chronos {
    return new Chronos(new Date(8640000000000000));
  }

  /**
   * Get the earliest of multiple dates
   */
  static earliest(...dates: (DateInput | Chronos)[]): Chronos {
    const parsed = dates.map((d) => Chronos.parse(d));
    return parsed.reduce((min, d) => (d.isBefore(min) ? d : min));
  }

  /**
   * Get the latest of multiple dates
   */
  static latest(...dates: (DateInput | Chronos)[]): Chronos {
    const parsed = dates.map((d) => Chronos.parse(d));
    return parsed.reduce((max, d) => (d.isAfter(max) ? d : max));
  }

  // ============================================================================
  // Getters
  // ============================================================================

  /** Get the year */
  get year(): number {
    if (this._timezone) {
      return new ChronosTimezone(this._timezone).getComponents(this._date).year;
    }
    return this._date.getFullYear();
  }

  /** Get the month (1-12) */
  get month(): number {
    if (this._timezone) {
      return new ChronosTimezone(this._timezone).getComponents(this._date)
        .month;
    }
    return this._date.getMonth() + 1;
  }

  /** Get the day of month (1-31) */
  get date(): number {
    if (this._timezone) {
      return new ChronosTimezone(this._timezone).getComponents(this._date).day;
    }
    return this._date.getDate();
  }

  /** Alias for date */
  get day(): number {
    return this.date;
  }

  /** Get the day of week (0-6, Sunday = 0) */
  get dayOfWeek(): DayOfWeek {
    if (this._timezone) {
      return new ChronosTimezone(this._timezone).getComponents(this._date)
        .dayOfWeek as DayOfWeek;
    }
    return this._date.getDay() as DayOfWeek;
  }

  /** Get the hour (0-23) */
  get hour(): number {
    if (this._timezone) {
      return new ChronosTimezone(this._timezone).getComponents(this._date).hour;
    }
    return this._date.getHours();
  }

  /** Get the minute (0-59) */
  get minute(): number {
    if (this._timezone) {
      return new ChronosTimezone(this._timezone).getComponents(this._date)
        .minute;
    }
    return this._date.getMinutes();
  }

  /** Get the second (0-59) */
  get second(): number {
    if (this._timezone) {
      return new ChronosTimezone(this._timezone).getComponents(this._date)
        .second;
    }
    return this._date.getSeconds();
  }

  /** Get the millisecond (0-999) */
  get millisecond(): number {
    return this._date.getMilliseconds();
  }

  /** Get Unix timestamp (seconds) */
  get unix(): number {
    return Math.floor(this._date.getTime() / 1000);
  }

  /** Get Unix timestamp (milliseconds) */
  get timestamp(): number {
    return this._date.getTime();
  }

  /** Get the quarter (1-4) */
  get quarter(): number {
    if (this._timezone) {
      const month = new ChronosTimezone(this._timezone).getComponents(
        this._date,
      ).month;
      return Math.floor((month - 1) / 3) + 1;
    }
    return getQuarter(this._date);
  }

  /** Get the day of year (1-366) */
  get dayOfYear(): number {
    if (this._timezone) {
      const c = new ChronosTimezone(this._timezone).getComponents(this._date);
      let days = c.day;
      for (let m = 1; m < c.month; m++) {
        days += getDaysInMonth(c.year, m - 1);
      }
      return days;
    }
    return getDayOfYear(this._date);
  }

  /** Get the ISO week number (1-53) */
  get week(): number {
    if (this._timezone) {
      const c = new ChronosTimezone(this._timezone).getComponents(this._date);
      return getISOWeek(new Date(c.year, c.month - 1, c.day));
    }
    return getISOWeek(this._date);
  }

  /** Get the ISO week year */
  get weekYear(): number {
    if (this._timezone) {
      const c = new ChronosTimezone(this._timezone).getComponents(this._date);
      return getISOWeekYear(new Date(c.year, c.month - 1, c.day));
    }
    return getISOWeekYear(this._date);
  }

  /** Get the number of days in the current month */
  get daysInMonth(): number {
    return getDaysInMonth(this.year, this.month - 1);
  }

  /** Get the number of days in the current year */
  get daysInYear(): number {
    return getDaysInYear(this.year);
  }

  /** Get the number of weeks in the current year */
  get weeksInYear(): number {
    return getISOWeek(new Date(this.year, 11, 28));
  }

  /** Check if the year is a leap year */
  get isLeapYear(): boolean {
    return isLeapYear(this.year);
  }

  /** Get the timezone offset in minutes */
  get offset(): number {
    if (this._timezone) {
      // getOffsetMinutes returns minutes *east* of UTC (e.g. +330 for +05:30),
      // whereas Date.getTimezoneOffset() returns minutes *behind* UTC. Negate so
      // offsetString/format('Z') keep their existing sign convention.
      return -new ChronosTimezone(this._timezone).getOffsetMinutes(this._date);
    }
    return this._date.getTimezoneOffset();
  }

  /** Get the timezone offset as string (+05:30) */
  get offsetString(): string {
    const offset = this.offset;
    const sign = offset <= 0 ? '+' : '-';
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    return `${sign}${padStart(hours, 2)}:${padStart(minutes, 2)}`;
  }

  // ============================================================================
  // Setters (Immutable)
  // ============================================================================

  /**
   * Set specific date/time components
   * Returns a new Chronos instance
   */
  /**
   * Set multiple date/time values at once
   * Month is 1-12 (like Carbon PHP)
   */
  set(values: DateTimeSetter): Chronos {
    if (this._timezone) {
      const tz = new ChronosTimezone(this._timezone);
      const current = tz.getComponents(this._date);

      const components: DateTimeComponents = {
        year: values.year ?? current.year,
        month: values.month ?? current.month,
        day: values.date ?? values.day ?? current.day,
        hour: values.hour ?? current.hour,
        minute: values.minute ?? current.minute,
        second: values.second ?? current.second,
        millisecond: values.millisecond ?? this._date.getMilliseconds(),
      };

      const date = Chronos.dateFromComponents(components, this._timezone);
      return new Chronos(date, this._timezone);
    }

    const date = cloneDate(this._date);

    if (values.year !== undefined) date.setFullYear(values.year);
    if (values.month !== undefined) date.setMonth(values.month - 1);
    if (values.date !== undefined || values.day !== undefined) {
      date.setDate(values.date ?? values.day!);
    }
    if (values.hour !== undefined) date.setHours(values.hour);
    if (values.minute !== undefined) date.setMinutes(values.minute);
    if (values.second !== undefined) date.setSeconds(values.second);
    if (values.millisecond !== undefined)
      date.setMilliseconds(values.millisecond);

    return new Chronos(date, this._timezone);
  }

  /** Set the year */
  setYear(year: number): Chronos {
    return this.set({ year });
  }

  /** Set the month (1-12) */
  setMonth(month: number): Chronos {
    return this.set({ month });
  }

  /** Set the day of month (1-31) */
  setDate(date: number): Chronos {
    return this.set({ date });
  }

  /** Set the hour (0-23) */
  setHour(hour: number): Chronos {
    return this.set({ hour });
  }

  /** Set the minute (0-59) */
  setMinute(minute: number): Chronos {
    return this.set({ minute });
  }

  /** Set the second (0-59) */
  setSecond(second: number): Chronos {
    return this.set({ second });
  }

  /** Set the millisecond (0-999) */
  setMillisecond(millisecond: number): Chronos {
    return this.set({ millisecond });
  }

  // ============================================================================
  // Manipulation Methods
  // ============================================================================

  /**
   * Add time to the date
   *
   * @example
   * ```typescript
   * chronos.add(5, 'days')
   * chronos.add(2, 'months')
   * chronos.add({ years: 1, months: 2 })
   * ```
   */
  add(amount: number | Duration, unit?: AnyTimeUnit): Chronos {
    if (isDuration(amount)) {
      let result = this.clone();
      const duration = amount as Duration;

      if (duration.years) result = result.add(duration.years, 'years');
      if (duration.months) result = result.add(duration.months, 'months');
      if (duration.weeks) result = result.add(duration.weeks, 'weeks');
      if (duration.days) result = result.add(duration.days, 'days');
      if (duration.hours) result = result.add(duration.hours, 'hours');
      if (duration.minutes) result = result.add(duration.minutes, 'minutes');
      if (duration.seconds) result = result.add(duration.seconds, 'seconds');
      if (duration.milliseconds)
        result = result.add(duration.milliseconds, 'milliseconds');

      return result;
    }

    if (unit === undefined) {
      throw new Error('Unit is required when amount is a number');
    }

    const normalizedUnit = normalizeUnit(unit);
    if (this._timezone) {
      return this.addInZone(amount as number, normalizedUnit);
    }
    const newDate = addUnits(this._date, amount as number, normalizedUnit);
    return new Chronos(newDate, this._timezone);
  }

  /**
   * Add an amount of a single unit while respecting the instance timezone.
   * Calendar units (day/week/month/quarter/year/…) preserve the wall-clock time
   * in the zone (DST-safe); absolute units (hour/minute/second/millisecond) add a
   * fixed offset to the instant. Day clamping mirrors the local-time path.
   */
  private addInZone(amount: number, unit: TimeUnit): Chronos {
    const absoluteMs: Partial<Record<TimeUnit, number>> = {
      millisecond: 1,
      second: MILLISECONDS_PER_SECOND,
      minute: MILLISECONDS_PER_MINUTE,
      hour: MILLISECONDS_PER_HOUR,
    };

    const perUnit = absoluteMs[unit];
    if (perUnit !== undefined) {
      const newDate = new Date(this._date.getTime() + amount * perUnit);
      return new Chronos(newDate, this._timezone);
    }

    const tz = new ChronosTimezone(this._timezone as string);
    const c = tz.getComponents(this._date);
    let year = c.year;
    let month = c.month; // 1-12
    let day = c.day;
    const calendarUnit =
      unit === 'month' ||
      unit === 'quarter' ||
      unit === 'year' ||
      unit === 'decade' ||
      unit === 'century' ||
      unit === 'millennium';

    switch (unit) {
      case 'day':
        day += amount;
        break;
      case 'week':
        day += amount * 7;
        break;
      case 'month':
        month += amount;
        break;
      case 'quarter':
        month += amount * 3;
        break;
      case 'year':
        year += amount;
        break;
      case 'decade':
        year += amount * 10;
        break;
      case 'century':
        year += amount * 100;
        break;
      case 'millennium':
        year += amount * 1000;
        break;
    }

    // Normalize month overflow/underflow into years.
    year += Math.floor((month - 1) / 12);
    month = ((((month - 1) % 12) + 12) % 12) + 1;

    // For month-and-larger units, clamp the day to the last day of the target
    // month (e.g. Jan 31 + 1 month -> Feb 28/29), matching addDuration().
    if (calendarUnit) {
      const maxDay = getDaysInMonth(year, month - 1);
      if (day > maxDay) day = maxDay;
    }

    const date = Chronos.dateFromComponents(
      {
        year,
        month,
        day,
        hour: c.hour,
        minute: c.minute,
        second: c.second,
        millisecond: this._date.getMilliseconds(),
      },
      this._timezone as string,
    );
    return new Chronos(date, this._timezone);
  }

  /**
   * Subtract time from the date
   */
  subtract(amount: number | Duration, unit?: AnyTimeUnit): Chronos {
    if (isDuration(amount)) {
      const negated: Duration = {};
      for (const [key, value] of Object.entries(amount)) {
        if (typeof value === 'number') {
          (negated as Record<string, number>)[key] = -value;
        }
      }
      return this.add(negated);
    }

    return this.add(-(amount as number), unit);
  }

  /**
   * Get the start of a time unit
   *
   * @example
   * ```typescript
   * chronos.startOf('day')   // 00:00:00.000
   * chronos.startOf('month') // First day of month
   * chronos.startOf('year')  // January 1st
   * ```
   */
  startOf(unit: AnyTimeUnit): Chronos {
    const normalizedUnit = normalizeUnit(unit);
    if (this._timezone) {
      return this.boundaryInZone(normalizedUnit, false);
    }
    const newDate = startOf(this._date, normalizedUnit);
    return new Chronos(newDate, this._timezone);
  }

  /**
   * Get the end of a time unit
   *
   * @example
   * ```typescript
   * chronos.endOf('day')   // 23:59:59.999
   * chronos.endOf('month') // Last day of month
   * chronos.endOf('year')  // December 31st
   * ```
   */
  endOf(unit: AnyTimeUnit): Chronos {
    const normalizedUnit = normalizeUnit(unit);
    if (this._timezone) {
      return this.boundaryInZone(normalizedUnit, true);
    }
    const newDate = endOf(this._date, normalizedUnit);
    return new Chronos(newDate, this._timezone);
  }

  /**
   * Compute the start/end boundary of a unit in the instance timezone.
   * The plain `startOf`/`endOf` helpers operate on local wall-clock fields of the
   * underlying Date, which is wrong when an explicit timezone is attached. Here we
   * read the wall-clock components in the target zone, snap them to the boundary,
   * and rebuild the instant (dateFromComponents handles DST).
   */
  private boundaryInZone(unit: TimeUnit, end: boolean): Chronos {
    if (unit === 'millisecond') {
      return this.clone();
    }

    const tz = new ChronosTimezone(this._timezone as string);
    const c = tz.getComponents(this._date);
    const comp: DateTimeComponents = {
      year: c.year,
      month: c.month,
      day: c.day,
      hour: c.hour,
      minute: c.minute,
      second: c.second,
      millisecond: this._date.getMilliseconds(),
    };

    const resetTime = (): void => {
      comp.hour = end ? 23 : 0;
      comp.minute = end ? 59 : 0;
      comp.second = end ? 59 : 0;
      comp.millisecond = end ? 999 : 0;
    };

    switch (unit) {
      case 'second':
        comp.millisecond = end ? 999 : 0;
        break;
      case 'minute':
        comp.second = end ? 59 : 0;
        comp.millisecond = end ? 999 : 0;
        break;
      case 'hour':
        comp.minute = end ? 59 : 0;
        comp.second = end ? 59 : 0;
        comp.millisecond = end ? 999 : 0;
        break;
      case 'day':
        resetTime();
        break;
      case 'week':
        resetTime();
        // Sunday-based week, matching the local-time helpers.
        comp.day = c.day + (end ? 6 - c.dayOfWeek : -c.dayOfWeek);
        break;
      case 'month':
        resetTime();
        comp.day = end ? getDaysInMonth(c.year, c.month - 1) : 1;
        break;
      case 'quarter': {
        resetTime();
        const qStartMonth = Math.floor((c.month - 1) / 3) * 3 + 1;
        if (end) {
          comp.month = qStartMonth + 2;
          comp.day = getDaysInMonth(c.year, comp.month - 1);
        } else {
          comp.month = qStartMonth;
          comp.day = 1;
        }
        break;
      }
      case 'year':
        resetTime();
        comp.month = end ? 12 : 1;
        comp.day = end ? 31 : 1;
        break;
      case 'decade':
      case 'century':
      case 'millennium': {
        resetTime();
        comp.month = end ? 12 : 1;
        comp.day = end ? 31 : 1;
        const span =
          unit === 'decade' ? 10 : unit === 'century' ? 100 : 1000;
        const base = Math.floor(c.year / span) * span;
        comp.year = end ? base + span - 1 : base;
        break;
      }
    }

    const date = Chronos.dateFromComponents(comp, this._timezone as string);
    return new Chronos(date, this._timezone);
  }

  // ============================================================================
  // Convenience Add/Subtract Methods
  // ============================================================================

  addMilliseconds(amount: number): Chronos {
    return this.add(amount, 'milliseconds');
  }
  addSeconds(amount: number): Chronos {
    return this.add(amount, 'seconds');
  }
  addMinutes(amount: number): Chronos {
    return this.add(amount, 'minutes');
  }
  addHours(amount: number): Chronos {
    return this.add(amount, 'hours');
  }
  addDays(amount: number): Chronos {
    return this.add(amount, 'days');
  }
  addWeeks(amount: number): Chronos {
    return this.add(amount, 'weeks');
  }
  addMonths(amount: number): Chronos {
    return this.add(amount, 'months');
  }
  addQuarters(amount: number): Chronos {
    return this.add(amount * 3, 'months');
  }
  addYears(amount: number): Chronos {
    return this.add(amount, 'years');
  }

  subtractMilliseconds(amount: number): Chronos {
    return this.subtract(amount, 'milliseconds');
  }
  subtractSeconds(amount: number): Chronos {
    return this.subtract(amount, 'seconds');
  }
  subtractMinutes(amount: number): Chronos {
    return this.subtract(amount, 'minutes');
  }
  subtractHours(amount: number): Chronos {
    return this.subtract(amount, 'hours');
  }
  subtractDays(amount: number): Chronos {
    return this.subtract(amount, 'days');
  }
  subtractWeeks(amount: number): Chronos {
    return this.subtract(amount, 'weeks');
  }
  subtractMonths(amount: number): Chronos {
    return this.subtract(amount, 'months');
  }
  subtractQuarters(amount: number): Chronos {
    return this.subtract(amount * 3, 'months');
  }
  subtractYears(amount: number): Chronos {
    return this.subtract(amount, 'years');
  }

  // ============================================================================
  // Comparison Methods
  // ============================================================================

  /**
   * Start-of-unit instant for `date`, evaluated in this instance's timezone.
   * Unit comparisons must bucket both operands with the same zone; the plain
   * `startOf` helper reads local wall-clock fields and would bucket them by the
   * process timezone instead.
   */
  private unitStart(date: Date, unit: TimeUnit): number {
    if (this._timezone) {
      return new Chronos(date, this._timezone)
        .boundaryInZone(unit, false)
        .valueOf();
    }
    return startOf(date, unit).getTime();
  }

  /**
   * Check if this date is before another
   */
  isBefore(other: DateInput, unit?: AnyTimeUnit): boolean {
    const otherDate = Chronos.parse(other, this._timezone);
    if (unit) {
      const normalizedUnit = normalizeUnit(unit);
      return (
        this.unitStart(this._date, normalizedUnit) <
        this.unitStart(otherDate._date, normalizedUnit)
      );
    }
    return this._date < otherDate._date;
  }

  /**
   * Check if this date is after another
   */
  isAfter(other: DateInput, unit?: AnyTimeUnit): boolean {
    const otherDate = Chronos.parse(other, this._timezone);
    if (unit) {
      const normalizedUnit = normalizeUnit(unit);
      return (
        this.unitStart(this._date, normalizedUnit) >
        this.unitStart(otherDate._date, normalizedUnit)
      );
    }
    return this._date > otherDate._date;
  }

  /**
   * Check if this date is the same as another
   */
  isSame(other: DateInput, unit?: AnyTimeUnit): boolean {
    const otherDate = Chronos.parse(other, this._timezone);
    if (unit) {
      const normalizedUnit = normalizeUnit(unit);
      return (
        this.unitStart(this._date, normalizedUnit) ===
        this.unitStart(otherDate._date, normalizedUnit)
      );
    }
    return this._date.getTime() === otherDate._date.getTime();
  }

  /**
   * Check if this date is same or before another
   */
  isSameOrBefore(other: DateInput, unit?: AnyTimeUnit): boolean {
    return this.isSame(other, unit) || this.isBefore(other, unit);
  }

  /**
   * Check if this date is same or after another
   */
  isSameOrAfter(other: DateInput, unit?: AnyTimeUnit): boolean {
    return this.isSame(other, unit) || this.isAfter(other, unit);
  }

  /**
   * Check if this date is between two others
   */
  isBetween(
    start: DateInput,
    end: DateInput,
    unit?: AnyTimeUnit,
    inclusivity: '()' | '[]' | '[)' | '(]' = '()',
  ): boolean {
    const startDate = Chronos.parse(start, this._timezone);
    const endDate = Chronos.parse(end, this._timezone);

    const leftInclusive = inclusivity[0] === '[';
    const rightInclusive = inclusivity[1] === ']';

    const afterStart = leftInclusive
      ? this.isSameOrAfter(startDate, unit)
      : this.isAfter(startDate, unit);
    const beforeEnd = rightInclusive
      ? this.isSameOrBefore(endDate, unit)
      : this.isBefore(endDate, unit);

    return afterStart && beforeEnd;
  }

  // ============================================================================
  // Day Type Checks
  // ============================================================================

  /** Check if this date is today */
  isToday(): boolean {
    return this.isSame(Chronos.today(this._timezone), 'day');
  }

  /** Check if this date is tomorrow */
  isTomorrow(): boolean {
    return this.isSame(Chronos.tomorrow(this._timezone), 'day');
  }

  /** Check if this date is yesterday */
  isYesterday(): boolean {
    return this.isSame(Chronos.yesterday(this._timezone), 'day');
  }

  /** Check if this date is in the past */
  isPast(): boolean {
    return this.isBefore(Chronos.now());
  }

  /** Check if this date is in the future */
  isFuture(): boolean {
    return this.isAfter(Chronos.now());
  }

  /** Check if this is a weekend (Saturday or Sunday) */
  isWeekend(): boolean {
    return (
      this.dayOfWeek === DayOfWeek.Saturday ||
      this.dayOfWeek === DayOfWeek.Sunday
    );
  }

  /** Check if this is a weekday (Monday-Friday) */
  isWeekday(): boolean {
    return !this.isWeekend();
  }

  // ============================================================================
  // Specific Day Checks
  // ============================================================================

  isSunday(): boolean {
    return this.dayOfWeek === DayOfWeek.Sunday;
  }
  isMonday(): boolean {
    return this.dayOfWeek === DayOfWeek.Monday;
  }
  isTuesday(): boolean {
    return this.dayOfWeek === DayOfWeek.Tuesday;
  }
  isWednesday(): boolean {
    return this.dayOfWeek === DayOfWeek.Wednesday;
  }
  isThursday(): boolean {
    return this.dayOfWeek === DayOfWeek.Thursday;
  }
  isFriday(): boolean {
    return this.dayOfWeek === DayOfWeek.Friday;
  }
  isSaturday(): boolean {
    return this.dayOfWeek === DayOfWeek.Saturday;
  }

  // ============================================================================
  // Difference Methods
  // ============================================================================

  /**
   * Get the difference between two dates in a specific unit
   */
  diff(
    other: DateInput,
    unit: AnyTimeUnit = 'millisecond',
    precise = false,
  ): number {
    const otherDate = Chronos.parse(other, this._timezone);
    const normalizedUnit = normalizeUnit(unit);

    if (precise) {
      const diffMs = this._date.getTime() - otherDate._date.getTime();
      switch (normalizedUnit) {
        case 'second':
          return diffMs / MILLISECONDS_PER_SECOND;
        case 'minute':
          return diffMs / MILLISECONDS_PER_MINUTE;
        case 'hour':
          return diffMs / MILLISECONDS_PER_HOUR;
        case 'day':
          return diffMs / MILLISECONDS_PER_DAY;
        case 'week':
          return diffMs / (MILLISECONDS_PER_DAY * 7);
        case 'month':
          return diffMs / MILLISECONDS_PER_MONTH;
        case 'quarter':
          return diffMs / (MILLISECONDS_PER_MONTH * 3);
        case 'year':
          return diffMs / MILLISECONDS_PER_YEAR;
        default:
          break;
      }
    }

    if (this._timezone) {
      const calendar = this.calendarDiffInZone(otherDate, normalizedUnit);
      if (calendar !== null) {
        return calendar;
      }
    }

    return diffInUnits(this._date, otherDate._date, normalizedUnit);
  }

  /**
   * Whole-unit difference for calendar units, read from wall-clock fields in the
   * instance timezone. `diffInUnits` uses local `Date` getters, so it would count
   * months and years in the process timezone. Returns null for the units that are
   * pure instant arithmetic and so need no zone handling.
   */
  private calendarDiffInZone(other: Chronos, unit: TimeUnit): number | null {
    const years = this.year - other.year;

    switch (unit) {
      case 'year':
        return years;
      case 'decade':
        return Math.floor(years / 10);
      case 'century':
        return Math.floor(years / 100);
      case 'millennium':
        return Math.floor(years / 1000);
      case 'month':
      case 'quarter': {
        let months = years * 12 + (this.month - other.month);
        if (this.date < other.date) {
          months--;
        }
        return unit === 'quarter' ? Math.floor(months / 3) : months;
      }
      default:
        return null;
    }
  }

  /**
   * Get a detailed diff breakdown
   */
  diffDetailed(other: DateInput): DiffResult {
    const otherDate = Chronos.parse(other);
    const diffMs = Math.abs(this._date.getTime() - otherDate._date.getTime());

    let remaining = diffMs;

    const years = Math.floor(remaining / (365.25 * MILLISECONDS_PER_DAY));
    remaining -= years * 365.25 * MILLISECONDS_PER_DAY;

    const months = Math.floor(remaining / (30.44 * MILLISECONDS_PER_DAY));
    remaining -= months * 30.44 * MILLISECONDS_PER_DAY;

    const weeks = Math.floor(remaining / (7 * MILLISECONDS_PER_DAY));
    remaining -= weeks * 7 * MILLISECONDS_PER_DAY;

    const days = Math.floor(remaining / MILLISECONDS_PER_DAY);
    remaining -= days * MILLISECONDS_PER_DAY;

    const hours = Math.floor(remaining / MILLISECONDS_PER_HOUR);
    remaining -= hours * MILLISECONDS_PER_HOUR;

    const minutes = Math.floor(remaining / MILLISECONDS_PER_MINUTE);
    remaining -= minutes * MILLISECONDS_PER_MINUTE;

    const seconds = Math.floor(remaining / MILLISECONDS_PER_SECOND);
    remaining -= seconds * MILLISECONDS_PER_SECOND;

    return {
      years,
      months,
      weeks,
      days,
      hours,
      minutes,
      seconds,
      milliseconds: remaining,
      totalMilliseconds: diffMs,
    };
  }

  // ============================================================================
  // Human Readable Methods
  // ============================================================================

  /**
   * Get a human-readable relative time string
   *
   * @example
   * ```typescript
   * date.fromNow()         // "2 days ago"
   * date.from(other)       // "in 3 months"
   * date.fromNow({ short: true }) // "2d ago"
   * ```
   */
  fromNow(options: HumanDiffOptions = {}): string {
    return this.from(Chronos.now(), options);
  }

  /**
   * Get relative time from another date
   */
  from(other: DateInput, options: HumanDiffOptions = {}): string {
    const otherDate = Chronos.parse(other);
    const diffMs = this._date.getTime() - otherDate._date.getTime();
    const absDiff = Math.abs(diffMs);
    const isFuture = diffMs > 0;

    const { short = false, absolute = false } = options;
    const relative = this._locale.relativeTime;

    let value: number;
    let unit: string;

    if (absDiff < MILLISECONDS_PER_MINUTE) {
      value = Math.round(absDiff / MILLISECONDS_PER_SECOND);
      unit = value === 1 ? 's' : 'ss';
    } else if (absDiff < MILLISECONDS_PER_HOUR) {
      value = Math.round(absDiff / MILLISECONDS_PER_MINUTE);
      unit = value === 1 ? 'm' : 'mm';
    } else if (absDiff < MILLISECONDS_PER_DAY) {
      value = Math.round(absDiff / MILLISECONDS_PER_HOUR);
      unit = value === 1 ? 'h' : 'hh';
    } else if (absDiff < MILLISECONDS_PER_DAY * 7) {
      value = Math.round(absDiff / MILLISECONDS_PER_DAY);
      unit = value === 1 ? 'd' : 'dd';
    } else if (absDiff < MILLISECONDS_PER_DAY * 30) {
      value = Math.round(absDiff / (MILLISECONDS_PER_DAY * 7));
      unit = value === 1 ? 'w' : 'ww';
    } else if (absDiff < MILLISECONDS_PER_DAY * 365) {
      value = Math.round(absDiff / (MILLISECONDS_PER_DAY * 30));
      unit = value === 1 ? 'M' : 'MM';
    } else {
      value = Math.round(absDiff / (MILLISECONDS_PER_DAY * 365));
      unit = value === 1 ? 'y' : 'yy';
    }

    const shortUnits: Record<string, string> = {
      s: 's',
      ss: 's',
      m: 'm',
      mm: 'm',
      h: 'h',
      hh: 'h',
      d: 'd',
      dd: 'd',
      w: 'w',
      ww: 'w',
      M: 'mo',
      MM: 'mo',
      y: 'y',
      yy: 'y',
    };

    const relativeStr = short
      ? `${value}${shortUnits[unit] ?? unit}`
      : ((relative as Record<string, string>)[unit]?.replace(
          '%d',
          String(value),
        ) ?? `${value} ${unit}`);

    if (absolute) {
      return relativeStr;
    }

    return isFuture
      ? relative.future.replace('%s', relativeStr)
      : relative.past.replace('%s', relativeStr);
  }

  /**
   * Get relative time to another date
   */
  to(other: DateInput, options: HumanDiffOptions = {}): string {
    return Chronos.parse(other).from(this, options);
  }

  /**
   * Get relative time to now
   */
  toNow(options: HumanDiffOptions = {}): string {
    return this.to(Chronos.now(), options);
  }

  // ============================================================================
  // Formatting Methods
  // ============================================================================

  /**
   * Format the date using a format string
   *
   * Supported tokens:
   * - YYYY: 4-digit year
   * - YY: 2-digit year
   * - MMMM: Full month name
   * - MMM: Short month name
   * - MM: 2-digit month
   * - M: 1-2 digit month
   * - DD: 2-digit day
   * - D: 1-2 digit day
   * - dddd: Full weekday name
   * - ddd: Short weekday name
   * - dd: Min weekday name
   * - d: Day of week number
   * - HH: 2-digit hour (24h)
   * - H: 1-2 digit hour (24h)
   * - hh: 2-digit hour (12h)
   * - h: 1-2 digit hour (12h)
   * - mm: 2-digit minute
   * - m: 1-2 digit minute
   * - ss: 2-digit second
   * - s: 1-2 digit second
   * - SSS: 3-digit millisecond
   * - A: AM/PM
   * - a: am/pm
   * - Z: Timezone offset (+05:00)
   * - ZZ: Timezone offset (+0500)
   */
  format(formatStr = 'YYYY-MM-DDTHH:mm:ssZ'): string {
    const tokens: Record<string, () => string> = {
      YYYY: () => String(this.year),
      YY: () => String(this.year).slice(-2),
      MMMM: () => this._locale.months[this.month - 1],
      MMM: () => this._locale.monthsShort[this.month - 1],
      MM: () => padStart(this.month, 2),
      M: () => String(this.month),
      DD: () => padStart(this.date, 2),
      D: () => String(this.date),
      dddd: () => this._locale.weekdays[this.dayOfWeek],
      ddd: () => this._locale.weekdaysShort[this.dayOfWeek],
      dd: () => this._locale.weekdaysMin[this.dayOfWeek],
      d: () => String(this.dayOfWeek),
      HH: () => padStart(this.hour, 2),
      H: () => String(this.hour),
      hh: () => padStart(this.hour % 12 || 12, 2),
      h: () => String(this.hour % 12 || 12),
      mm: () => padStart(this.minute, 2),
      m: () => String(this.minute),
      ss: () => padStart(this.second, 2),
      s: () => String(this.second),
      SSS: () => padStart(this.millisecond, 3),
      A: () =>
        this._locale.meridiem
          ? this._locale.meridiem(this.hour, this.minute, false)
          : this.hour < 12
            ? 'AM'
            : 'PM',
      a: () =>
        this._locale.meridiem
          ? this._locale.meridiem(this.hour, this.minute, true)
          : this.hour < 12
            ? 'am'
            : 'pm',
      Z: () => this.offsetString,
      ZZ: () => this.offsetString.replace(':', ''),
      Q: () => String(this.quarter),
      Do: () => this._locale.ordinal(this.date),
      W: () => String(this.week),
      WW: () => padStart(this.week, 2),
      X: () => String(this.unix),
      x: () => String(this.timestamp),
    };

    // Sort tokens by length (longest first) to avoid partial matches
    const sortedTokens = Object.keys(tokens).sort(
      (a, b) => b.length - a.length,
    );
    const regex = new RegExp(
      `\\[([^\\]]+)\\]|(${sortedTokens.join('|')})`,
      'g',
    );

    return formatStr.replace(regex, (match, escaped, token) => {
      if (escaped) {
        return escaped;
      }
      return tokens[token]?.() ?? match;
    });
  }

  // ============================================================================
  // Standard Format Methods
  // ============================================================================

  /** Format as ISO 8601 */
  toISOString(): string {
    return this._date.toISOString();
  }

  /** Format as ISO date (YYYY-MM-DD) */
  toDateString(): string {
    return this.format('YYYY-MM-DD');
  }

  /** Format as time (HH:mm:ss) */
  toTimeString(): string {
    return this.format('HH:mm:ss');
  }

  /** Format as datetime (YYYY-MM-DD HH:mm:ss) */
  toDateTimeString(): string {
    return this.format('YYYY-MM-DD HH:mm:ss');
  }

  /** Format as RFC 2822 */
  toRFC2822(): string {
    return this.format('ddd, DD MMM YYYY HH:mm:ss ZZ');
  }

  /** Format as RFC 3339 */
  toRFC3339(): string {
    return this.format('YYYY-MM-DDTHH:mm:ssZ');
  }

  /** Format as ATOM */
  toAtomString(): string {
    return this.format('YYYY-MM-DDTHH:mm:ssZ');
  }

  /** Format as Cookie */
  toCookieString(): string {
    return this.format('dddd, DD-MMM-YYYY HH:mm:ss Z');
  }

  /** Format as RSS */
  toRSSString(): string {
    return this.format('ddd, DD MMM YYYY HH:mm:ss ZZ');
  }

  /** Format as W3C */
  toW3CString(): string {
    return this.format('YYYY-MM-DDTHH:mm:ssZ');
  }

  // ============================================================================
  // Conversion Methods
  // ============================================================================

  /**
   * Convert to a specific timezone
   */
  toTimezone(timezone: string): Chronos {
    return new Chronos(this._date, timezone);
  }

  /** Convert to native Date object */
  toDate(): Date {
    return new Date(this._date);
  }

  /** Convert to array [year, month, day, hour, minute, second, millisecond] */
  toArray(): number[] {
    return [
      this.year,
      this.month,
      this.date,
      this.hour,
      this.minute,
      this.second,
      this.millisecond,
    ];
  }

  /** Convert to object */
  toObject(): DateTimeComponents {
    return {
      year: this.year,
      month: this.month,
      day: this.date,
      hour: this.hour,
      minute: this.minute,
      second: this.second,
      millisecond: this.millisecond,
    };
  }

  /** Convert to JSON-serializable object */
  toJSON(): ChronosJSON {
    return {
      iso: this.toISOString(),
      timestamp: this.timestamp,
      timezone: this._timezone ?? 'local',
    };
  }

  /** Get primitive value (timestamp) */
  valueOf(): number {
    return this._date.getTime();
  }

  /** Convert to string */
  toString(): string {
    return this.toISOString();
  }

  // ============================================================================
  // Cloning and Locale
  // ============================================================================

  /**
   * Create a clone of this instance
   */
  clone(): Chronos {
    const cloned = new Chronos(this._date, this._timezone);
    (cloned as unknown as { _locale: LocaleConfig })._locale = this._locale;
    return cloned;
  }

  /**
   * Set the locale for this instance
   */
  locale(code: string): Chronos {
    const cloned = this.clone();
    (cloned as unknown as { _locale: LocaleConfig })._locale = getLocale(code);
    return cloned;
  }

  /**
   * Get the current locale code
   */
  getLocale(): string {
    return this._locale.code;
  }

  // ============================================================================
  // Navigation Methods
  // ============================================================================

  /**
   * Get the next occurrence of a specific day
   */
  next(day: DayOfWeek): Chronos {
    const current = this.dayOfWeek;
    const daysToAdd = (day - current + 7) % 7 || 7;
    return this.addDays(daysToAdd);
  }

  /**
   * Get the previous occurrence of a specific day
   */
  previous(day: DayOfWeek): Chronos {
    const current = this.dayOfWeek;
    const daysToSubtract = (current - day + 7) % 7 || 7;
    return this.subtractDays(daysToSubtract);
  }

  /**
   * Get the closest date (either this or other)
   */
  closest(date1: DateInput, date2: DateInput): Chronos {
    const d1 = Chronos.parse(date1);
    const d2 = Chronos.parse(date2);
    const diff1 = Math.abs(this.diff(d1));
    const diff2 = Math.abs(this.diff(d2));
    return diff1 <= diff2 ? d1 : d2;
  }

  /**
   * Get the farthest date (either this or other)
   */
  farthest(date1: DateInput, date2: DateInput): Chronos {
    const d1 = Chronos.parse(date1);
    const d2 = Chronos.parse(date2);
    const diff1 = Math.abs(this.diff(d1));
    const diff2 = Math.abs(this.diff(d2));
    return diff1 >= diff2 ? d1 : d2;
  }

  // ============================================================================
  // Static Configuration Methods
  // ============================================================================

  /**
   * Set global configuration
   */
  static configure(config: Partial<ChronosConfig>): void {
    globalConfig = { ...globalConfig, ...config };
  }

  /**
   * Get current global configuration
   */
  static getConfig(): ChronosConfig {
    return { ...globalConfig };
  }

  /**
   * Set test time (for testing purposes)
   */
  static setTestNow(date?: DateInput): void {
    testNow = date ? Chronos.parse(date) : null;
  }

  /**
   * Check if test mode is active
   */
  static hasTestNow(): boolean {
    return testNow !== null;
  }

  /**
   * Get the test time
   */
  static getTestNow(): Chronos | null {
    return testNow?.clone() ?? null;
  }

  // ============================================================================
  // Validation Methods
  // ============================================================================

  /**
   * Check if the date is valid
   */
  isValid(): boolean {
    return isValidDate(this._date);
  }

  /**
   * Check if this date is the same day as another (regardless of time)
   */
  isSameDay(other: DateInput): boolean {
    return this.isSame(other, 'day');
  }

  /**
   * Check if this date is in the same month as another
   */
  isSameMonth(other: DateInput): boolean {
    return this.isSame(other, 'month');
  }

  /**
   * Check if this date is in the same year as another
   */
  isSameYear(other: DateInput): boolean {
    return this.isSame(other, 'year');
  }

  // ============================================================================
  // Calendar Methods
  // ============================================================================

  /**
   * Get calendar output for the current month
   */
  calendar(referenceDate?: DateInput): string {
    const ref = referenceDate ? Chronos.parse(referenceDate) : Chronos.now();
    const diffDays = this.diff(ref, 'days');

    if (this.isSame(ref, 'day')) {
      return `Today at ${this.format('h:mm A')}`;
    } else if (this.isSame(ref.addDays(1), 'day')) {
      return `Tomorrow at ${this.format('h:mm A')}`;
    } else if (this.isSame(ref.subtractDays(1), 'day')) {
      return `Yesterday at ${this.format('h:mm A')}`;
    } else if (diffDays > 0 && diffDays < 7) {
      return `${this.format('dddd')} at ${this.format('h:mm A')}`;
    } else if (diffDays < 0 && diffDays > -7) {
      return `Last ${this.format('dddd')} at ${this.format('h:mm A')}`;
    } else {
      return this.format('MM/DD/YYYY');
    }
  }
}

// ============================================================================
// Export Default
// ============================================================================

export default Chronos;
