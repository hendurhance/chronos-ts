/**
 * ChronosInterval - Duration/Interval handling
 * @module ChronosInterval
 */

import {
  Duration,
  TimeUnit,
  AnyTimeUnit,
  MILLISECONDS_PER_SECOND,
  MILLISECONDS_PER_MINUTE,
  MILLISECONDS_PER_HOUR,
  MILLISECONDS_PER_DAY,
  MILLISECONDS_PER_WEEK,
  AVERAGE_DAYS_PER_MONTH,
  AVERAGE_DAYS_PER_YEAR,
} from '../types';
import {
  normalizeUnit,
  pluralizeUnit,
  parseISODuration,
  durationToISO,
  padStart,
} from '../utils';
import { getLocale, LocaleConfig } from '../locales';

// ============================================================================
// ChronosInterval Class
// ============================================================================

/**
 * ChronosInterval - Represents a duration/interval of time
 *
 * @example
 * ```typescript
 * // Create intervals
 * const interval = ChronosInterval.create({ days: 5, hours: 3 });
 * const hours = ChronosInterval.hours(24);
 * const fromISO = ChronosInterval.fromISO('P1Y2M3D');
 *
 * // Arithmetic
 * const doubled = interval.multiply(2);
 * const combined = interval.add(hours);
 *
 * // Formatting
 * console.log(interval.forHumans()); // "5 days 3 hours"
 * console.log(interval.toISO());     // "P5DT3H"
 * ```
 */
export class ChronosInterval {
  private _years: number;
  private _months: number;
  private _weeks: number;
  private _days: number;
  private _hours: number;
  private _minutes: number;
  private _seconds: number;
  private _milliseconds: number;
  private _locale: LocaleConfig;
  private _inverted: boolean;

  // ============================================================================
  // Constructor
  // ============================================================================

  private constructor(duration: Duration = {}, inverted = false) {
    this._years = duration.years ?? 0;
    this._months = duration.months ?? 0;
    this._weeks = duration.weeks ?? 0;
    this._days = duration.days ?? 0;
    this._hours = duration.hours ?? 0;
    this._minutes = duration.minutes ?? 0;
    const totalSeconds = duration.seconds ?? 0;
    this._seconds = Math.trunc(totalSeconds);
    this._milliseconds =
      duration.milliseconds ??
      Math.round((totalSeconds - this._seconds) * 1000);
    this._locale = getLocale('en');
    this._inverted = inverted;
  }

  // ============================================================================
  // Static Factory Methods
  // ============================================================================

  /**
   * Create an interval from a duration object
   */
  static create(duration: Duration): ChronosInterval {
    return new ChronosInterval(duration);
  }

  /**
   * Create an interval from years
   */
  static years(years: number): ChronosInterval {
    return new ChronosInterval({ years });
  }

  /**
   * Create an interval from months
   */
  static months(months: number): ChronosInterval {
    return new ChronosInterval({ months });
  }

  /**
   * Create an interval from weeks
   */
  static weeks(weeks: number): ChronosInterval {
    return new ChronosInterval({ weeks });
  }

  /**
   * Create an interval from days
   */
  static days(days: number): ChronosInterval {
    return new ChronosInterval({ days });
  }

  /**
   * Create an interval from hours
   */
  static hours(hours: number): ChronosInterval {
    return new ChronosInterval({ hours });
  }

  /**
   * Create an interval from minutes
   */
  static minutes(minutes: number): ChronosInterval {
    return new ChronosInterval({ minutes });
  }

  /**
   * Create an interval from seconds
   */
  static seconds(seconds: number): ChronosInterval {
    return new ChronosInterval({ seconds });
  }

  /**
   * Create an interval from milliseconds
   */
  static milliseconds(milliseconds: number): ChronosInterval {
    return new ChronosInterval({ milliseconds });
  }

  /**
   * Create a single unit interval
   */
  static unit(amount: number, unit: AnyTimeUnit): ChronosInterval {
    const normalizedUnit = normalizeUnit(unit);
    const duration: Duration = {};

    switch (normalizedUnit) {
      case 'millisecond':
        duration.milliseconds = amount;
        break;
      case 'second':
        duration.seconds = amount;
        break;
      case 'minute':
        duration.minutes = amount;
        break;
      case 'hour':
        duration.hours = amount;
        break;
      case 'day':
        duration.days = amount;
        break;
      case 'week':
        duration.weeks = amount;
        break;
      case 'month':
        duration.months = amount;
        break;
      case 'quarter':
        duration.months = amount * 3;
        break;
      case 'year':
        duration.years = amount;
        break;
      case 'decade':
        duration.years = amount * 10;
        break;
      case 'century':
        duration.years = amount * 100;
        break;
      case 'millennium':
        duration.years = amount * 1000;
        break;
    }

    return new ChronosInterval(duration);
  }

  /**
   * Create from ISO 8601 duration string (P1Y2M3DT4H5M6S)
   */
  static fromISO(iso: string): ChronosInterval {
    const duration = parseISODuration(iso);
    return new ChronosInterval(duration);
  }

  /**
   * Create from a human-readable string
   *
   * @example
   * ```typescript
   * ChronosInterval.fromString('2 days 3 hours')
   * ChronosInterval.fromString('1 year, 6 months')
   * ```
   */
  static fromString(input: string): ChronosInterval {
    const duration: Duration = {};

    const patterns: [RegExp, keyof Duration][] = [
      [/(\d+)\s*(?:years?|y)/i, 'years'],
      [/(\d+)\s*(?:months?|mo)/i, 'months'],
      [/(\d+)\s*(?:weeks?|w)/i, 'weeks'],
      [/(\d+)\s*(?:days?|d)/i, 'days'],
      [/(\d+)\s*(?:hours?|hrs?|h)/i, 'hours'],
      [/(\d+)\s*(?:minutes?|mins?|m)(?!\w)/i, 'minutes'],
      [/(\d+)\s*(?:seconds?|secs?|s)(?!\w)/i, 'seconds'],
      [/(\d+)\s*(?:milliseconds?|ms)/i, 'milliseconds'],
    ];

    for (const [pattern, key] of patterns) {
      const match = input.match(pattern);
      if (match) {
        duration[key] = parseInt(match[1], 10);
      }
    }

    return new ChronosInterval(duration);
  }

  /**
   * Create a zero-length interval
   */
  static zero(): ChronosInterval {
    return new ChronosInterval();
  }

  /**
   * Create an interval from the difference between two dates
   *
   * @example
   * ```typescript
   * const start = new Date('2024-01-01');
   * const end = new Date('2024-03-15');
   * const interval = ChronosInterval.between(start, end);
   * ```
   */
  static between(
    start: Date | { toDate(): Date },
    end: Date | { toDate(): Date },
  ): ChronosInterval {
    const startDate = start instanceof Date ? start : start.toDate();
    const endDate = end instanceof Date ? end : end.toDate();

    const diffMs = endDate.getTime() - startDate.getTime();
    const inverted = diffMs < 0;
    const absDiffMs = Math.abs(diffMs);

    // Calculate approximate components
    const days = Math.floor(absDiffMs / MILLISECONDS_PER_DAY);
    const remainingMs = absDiffMs % MILLISECONDS_PER_DAY;
    const hours = Math.floor(remainingMs / MILLISECONDS_PER_HOUR);
    const remainingAfterHours = remainingMs % MILLISECONDS_PER_HOUR;
    const minutes = Math.floor(remainingAfterHours / MILLISECONDS_PER_MINUTE);
    const remainingAfterMinutes = remainingAfterHours % MILLISECONDS_PER_MINUTE;
    const seconds = Math.floor(remainingAfterMinutes / MILLISECONDS_PER_SECOND);
    const milliseconds = remainingAfterMinutes % MILLISECONDS_PER_SECOND;

    return new ChronosInterval(
      { days, hours, minutes, seconds, milliseconds },
      inverted,
    );
  }

  // ============================================================================
  // Getters
  // ============================================================================

  get years(): number {
    return this._years;
  }
  get months(): number {
    return this._months;
  }
  get weeks(): number {
    return this._weeks;
  }
  get days(): number {
    return this._days;
  }
  get hours(): number {
    return this._hours;
  }
  get minutes(): number {
    return this._minutes;
  }
  get seconds(): number {
    return this._seconds;
  }
  get milliseconds(): number {
    return this._milliseconds;
  }
  get inverted(): boolean {
    return this._inverted;
  }

  // ============================================================================
  // Total Calculations
  // ============================================================================

  /**
   * Get total duration in a specific unit
   */
  total(unit: AnyTimeUnit): number {
    const ms = this.totalMilliseconds();
    const normalizedUnit = normalizeUnit(unit);

    switch (normalizedUnit) {
      case 'millisecond':
        return ms;
      case 'second':
        return ms / MILLISECONDS_PER_SECOND;
      case 'minute':
        return ms / MILLISECONDS_PER_MINUTE;
      case 'hour':
        return ms / MILLISECONDS_PER_HOUR;
      case 'day':
        return ms / MILLISECONDS_PER_DAY;
      case 'week':
        return ms / MILLISECONDS_PER_WEEK;
      case 'month':
        return ms / (AVERAGE_DAYS_PER_MONTH * MILLISECONDS_PER_DAY);
      case 'year':
        return ms / (AVERAGE_DAYS_PER_YEAR * MILLISECONDS_PER_DAY);
      default:
        return ms;
    }
  }

  /**
   * Get total duration in milliseconds
   */
  totalMilliseconds(): number {
    let ms = this._milliseconds;
    ms += this._seconds * MILLISECONDS_PER_SECOND;
    ms += this._minutes * MILLISECONDS_PER_MINUTE;
    ms += this._hours * MILLISECONDS_PER_HOUR;
    ms += this._days * MILLISECONDS_PER_DAY;
    ms += this._weeks * MILLISECONDS_PER_WEEK;
    ms += this._months * AVERAGE_DAYS_PER_MONTH * MILLISECONDS_PER_DAY;
    ms += this._years * AVERAGE_DAYS_PER_YEAR * MILLISECONDS_PER_DAY;

    return this._inverted ? -ms : ms;
  }

  /**
   * Get total duration in seconds
   */
  totalSeconds(): number {
    return this.total('seconds');
  }

  /**
   * Get total duration in minutes
   */
  totalMinutes(): number {
    return this.total('minutes');
  }

  /**
   * Get total duration in hours
   */
  totalHours(): number {
    return this.total('hours');
  }

  /**
   * Get total duration in days
   */
  totalDays(): number {
    return this.total('days');
  }

  /**
   * Get total duration in weeks
   */
  totalWeeks(): number {
    return this.total('weeks');
  }

  /**
   * Get total duration in months (approximate)
   */
  totalMonths(): number {
    return this.total('months');
  }

  /**
   * Get total duration in years (approximate)
   */
  totalYears(): number {
    return this.total('years');
  }

  // ============================================================================
  // Arithmetic Operations
  // ============================================================================

  /**
   * Add another interval to this one
   */
  add(other: ChronosInterval | Duration): ChronosInterval {
    const otherInterval =
      other instanceof ChronosInterval ? other : ChronosInterval.create(other);

    return new ChronosInterval({
      years: this._years + otherInterval._years,
      months: this._months + otherInterval._months,
      weeks: this._weeks + otherInterval._weeks,
      days: this._days + otherInterval._days,
      hours: this._hours + otherInterval._hours,
      minutes: this._minutes + otherInterval._minutes,
      seconds: this._seconds + otherInterval._seconds,
      milliseconds: this._milliseconds + otherInterval._milliseconds,
    });
  }

  /**
   * Subtract another interval from this one
   */
  subtract(other: ChronosInterval | Duration): ChronosInterval {
    const otherInterval =
      other instanceof ChronosInterval ? other : ChronosInterval.create(other);

    return new ChronosInterval({
      years: this._years - otherInterval._years,
      months: this._months - otherInterval._months,
      weeks: this._weeks - otherInterval._weeks,
      days: this._days - otherInterval._days,
      hours: this._hours - otherInterval._hours,
      minutes: this._minutes - otherInterval._minutes,
      seconds: this._seconds - otherInterval._seconds,
      milliseconds: this._milliseconds - otherInterval._milliseconds,
    });
  }

  /**
   * Multiply the interval by a factor
   */
  multiply(factor: number): ChronosInterval {
    return new ChronosInterval({
      years: this._years * factor,
      months: this._months * factor,
      weeks: this._weeks * factor,
      days: this._days * factor,
      hours: this._hours * factor,
      minutes: this._minutes * factor,
      seconds: this._seconds * factor,
      milliseconds: this._milliseconds * factor,
    });
  }

  /**
   * Divide the interval by a factor
   */
  divide(factor: number): ChronosInterval {
    if (factor === 0) {
      throw new Error('Cannot divide by zero');
    }
    return this.multiply(1 / factor);
  }

  /**
   * Negate the interval
   */
  negate(): ChronosInterval {
    return new ChronosInterval(
      {
        years: this._years,
        months: this._months,
        weeks: this._weeks,
        days: this._days,
        hours: this._hours,
        minutes: this._minutes,
        seconds: this._seconds,
        milliseconds: this._milliseconds,
      },
      !this._inverted,
    );
  }

  /**
   * Get absolute value of interval
   */
  abs(): ChronosInterval {
    return new ChronosInterval(
      {
        years: Math.abs(this._years),
        months: Math.abs(this._months),
        weeks: Math.abs(this._weeks),
        days: Math.abs(this._days),
        hours: Math.abs(this._hours),
        minutes: Math.abs(this._minutes),
        seconds: Math.abs(this._seconds),
        milliseconds: Math.abs(this._milliseconds),
      },
      false,
    );
  }

  // ============================================================================
  // Comparison Methods
  // ============================================================================

  /**
   * Check if equal to another interval
   */
  equals(other: ChronosInterval): boolean {
    return this.totalMilliseconds() === other.totalMilliseconds();
  }

  /**
   * Check if greater than another interval
   */
  greaterThan(other: ChronosInterval): boolean {
    return this.totalMilliseconds() > other.totalMilliseconds();
  }

  /**
   * Check if less than another interval
   */
  lessThan(other: ChronosInterval): boolean {
    return this.totalMilliseconds() < other.totalMilliseconds();
  }

  /**
   * Check if greater than or equal to another interval
   */
  greaterThanOrEqual(other: ChronosInterval): boolean {
    return this.totalMilliseconds() >= other.totalMilliseconds();
  }

  /**
   * Check if less than or equal to another interval
   */
  lessThanOrEqual(other: ChronosInterval): boolean {
    return this.totalMilliseconds() <= other.totalMilliseconds();
  }

  /**
   * Check if the interval is zero
   */
  isZero(): boolean {
    return this.totalMilliseconds() === 0;
  }

  /**
   * Check if the interval is positive
   */
  isPositive(): boolean {
    return this.totalMilliseconds() > 0;
  }

  /**
   * Check if the interval is negative
   */
  isNegative(): boolean {
    return this.totalMilliseconds() < 0;
  }

  // ============================================================================
  // Normalization Methods
  // ============================================================================

  /**
   * Cascade units to proper values (normalize overflow)
   *
   * @example
   * 90 seconds becomes 1 minute 30 seconds
   */
  cascade(): ChronosInterval {
    let ms = Math.abs(this.totalMilliseconds());

    const years = Math.floor(
      ms / (AVERAGE_DAYS_PER_YEAR * MILLISECONDS_PER_DAY),
    );
    ms %= AVERAGE_DAYS_PER_YEAR * MILLISECONDS_PER_DAY;

    const months = Math.floor(
      ms / (AVERAGE_DAYS_PER_MONTH * MILLISECONDS_PER_DAY),
    );
    ms %= AVERAGE_DAYS_PER_MONTH * MILLISECONDS_PER_DAY;

    const weeks = Math.floor(ms / MILLISECONDS_PER_WEEK);
    ms %= MILLISECONDS_PER_WEEK;

    const days = Math.floor(ms / MILLISECONDS_PER_DAY);
    ms %= MILLISECONDS_PER_DAY;

    const hours = Math.floor(ms / MILLISECONDS_PER_HOUR);
    ms %= MILLISECONDS_PER_HOUR;

    const minutes = Math.floor(ms / MILLISECONDS_PER_MINUTE);
    ms %= MILLISECONDS_PER_MINUTE;

    const seconds = Math.floor(ms / MILLISECONDS_PER_SECOND);
    const milliseconds = ms % MILLISECONDS_PER_SECOND;

    return new ChronosInterval(
      {
        years,
        months,
        weeks,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
      },
      this._inverted,
    );
  }

  /**
   * Cascade without including weeks
   */
  cascadeWithoutWeeks(): ChronosInterval {
    const cascaded = this.cascade();
    return new ChronosInterval(
      {
        years: cascaded._years,
        months: cascaded._months,
        days: cascaded._days + cascaded._weeks * 7,
        hours: cascaded._hours,
        minutes: cascaded._minutes,
        seconds: cascaded._seconds,
        milliseconds: cascaded._milliseconds,
      },
      this._inverted,
    );
  }

  // ============================================================================
  // Formatting Methods
  // ============================================================================

  /**
   * Format as ISO 8601 duration
   */
  toISO(): string {
    return durationToISO({
      years: this._years,
      months: this._months,
      weeks: this._weeks,
      days: this._days,
      hours: this._hours,
      minutes: this._minutes,
      seconds: this._seconds + this._milliseconds / 1000,
    });
  }

  /**
   * Format for human reading
   *
   * @example
   * ```typescript
   * interval.forHumans()           // "2 days 3 hours"
   * interval.forHumans({ short: true }) // "2d 3h"
   * interval.forHumans({ parts: 2 })    // "2 days 3 hours" (max 2 parts)
   * ```
   */
  forHumans(
    options: {
      short?: boolean;
      parts?: number;
      join?: string;
      conjunction?: string;
    } = {},
  ): string {
    const { short = false, parts = 7, join = ' ', conjunction } = options;

    const cascaded = this.cascade();
    const result: string[] = [];

    const units: [number, TimeUnit][] = [
      [cascaded._years, 'year'],
      [cascaded._months, 'month'],
      [cascaded._weeks, 'week'],
      [cascaded._days, 'day'],
      [cascaded._hours, 'hour'],
      [cascaded._minutes, 'minute'],
      [cascaded._seconds, 'second'],
    ];

    for (const [value, unit] of units) {
      if (value !== 0 && result.length < parts) {
        const label = short ? unit[0] : ` ${pluralizeUnit(unit, value)}`;
        result.push(`${value}${label}`);
      }
    }

    if (result.length === 0) {
      return short ? '0s' : '0 seconds';
    }

    if (conjunction && result.length > 1) {
      const last = result.pop()!;
      return `${result.join(join)}${conjunction}${last}`;
    }

    return result.join(join);
  }

  /**
   * Format using a format string
   *
   * Tokens:
   * - %y: years
   * - %m: months
   * - %w: weeks
   * - %d: days
   * - %h: hours
   * - %i: minutes
   * - %s: seconds
   * - %f: milliseconds
   * - %R: +/- sign
   * - %r: +/- or empty
   */
  format(formatStr: string): string {
    const sign = this._inverted ? '-' : '+';

    return formatStr
      .replace(/%y/g, String(Math.abs(this._years)))
      .replace(/%m/g, String(Math.abs(this._months)))
      .replace(/%w/g, String(Math.abs(this._weeks)))
      .replace(/%d/g, String(Math.abs(this._days)))
      .replace(/%h/g, String(Math.abs(this._hours)))
      .replace(/%H/g, padStart(Math.abs(this._hours), 2))
      .replace(/%i/g, String(Math.abs(this._minutes)))
      .replace(/%I/g, padStart(Math.abs(this._minutes), 2))
      .replace(/%s/g, String(Math.abs(this._seconds)))
      .replace(/%S/g, padStart(Math.abs(this._seconds), 2))
      .replace(/%f/g, String(Math.abs(this._milliseconds)))
      .replace(/%R/g, sign)
      .replace(/%r/g, this._inverted ? '-' : '');
  }

  // ============================================================================
  // Conversion Methods
  // ============================================================================

  /**
   * Convert to Duration object
   */
  toDuration(): Duration {
    return {
      years: this._years,
      months: this._months,
      weeks: this._weeks,
      days: this._days,
      hours: this._hours,
      minutes: this._minutes,
      seconds: this._seconds,
      milliseconds: this._milliseconds,
    };
  }

  /**
   * Convert to array
   */
  toArray(): number[] {
    return [
      this._years,
      this._months,
      this._weeks,
      this._days,
      this._hours,
      this._minutes,
      this._seconds,
      this._milliseconds,
    ];
  }

  /**
   * Clone this interval
   */
  clone(): ChronosInterval {
    const cloned = new ChronosInterval(this.toDuration(), this._inverted);
    (cloned as unknown as { _locale: LocaleConfig })._locale = this._locale;
    return cloned;
  }

  /**
   * Set locale for this interval
   */
  locale(code: string): ChronosInterval {
    const cloned = this.clone();
    (cloned as unknown as { _locale: LocaleConfig })._locale = getLocale(code);
    return cloned;
  }

  /**
   * Get primitive value (total milliseconds)
   */
  valueOf(): number {
    return this.totalMilliseconds();
  }

  /**
   * Convert to string
   */
  toString(): string {
    return this.forHumans();
  }

  /**
   * Convert to JSON
   */
  toJSON(): Duration & { iso: string } {
    return {
      ...this.toDuration(),
      iso: this.toISO(),
    };
  }
}

// ============================================================================
// Export Default
// ============================================================================

export default ChronosInterval;
