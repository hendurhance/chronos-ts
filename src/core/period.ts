/**
 * ChronosPeriod - Date range iteration
 * @module ChronosPeriod
 */

import { Duration, AnyTimeUnit, DateInput, PeriodOptions } from '../types';
import { normalizeUnit } from '../utils';
import { getLocale, LocaleConfig } from '../locales';
import { Chronos } from './chronos';
import { ChronosInterval } from './interval';

// ============================================================================
// ChronosPeriod Class
// ============================================================================

/**
 * ChronosPeriod - Represents a date range with iteration capabilities
 *
 * Inspired by CarbonPeriod, this class provides powerful date range
 * iteration with support for various interval types, filters, and
 * recurrence patterns.
 *
 * @example
 * ```typescript
 * // Basic iteration
 * const period = ChronosPeriod.create('2024-01-01', '2024-01-31');
 * for (const date of period) {
 *   console.log(date.format('YYYY-MM-DD'));
 * }
 *
 * // With custom interval
 * const weekly = ChronosPeriod.create('2024-01-01', '2024-03-31')
 *   .setInterval(ChronosInterval.weeks(1));
 *
 * // With filters
 * const weekdays = period.filter(date => date.dayOfWeek < 6);
 *
 * // Recurrence
 * const recur = ChronosPeriod.recur('2024-01-01')
 *   .every(1, 'month')
 *   .times(12);
 * ```
 */
export class ChronosPeriod implements Iterable<Chronos> {
  private _start: Chronos;
  private _end: Chronos | null;
  private _interval: ChronosInterval;
  private _recurrences: number | null;
  private _options: PeriodOptions;
  private _filters: Array<(date: Chronos, key: number) => boolean>;
  private _current: number;
  private _locale: LocaleConfig;

  // ============================================================================
  // Constructor
  // ============================================================================

  /**
   * Create a new ChronosPeriod
   */
  constructor(
    start: DateInput,
    end?: DateInput,
    interval?: Duration | ChronosInterval,
    options: Partial<PeriodOptions> = {},
  ) {
    this._start = Chronos.parse(start);
    this._end = end !== undefined ? Chronos.parse(end) : null;
    this._interval =
      interval instanceof ChronosInterval
        ? interval
        : ChronosInterval.create(interval || { days: 1 });

    // Validate interval is not zero to prevent infinite loops
    if (this._interval.isZero()) {
      throw new Error('ChronosPeriod: Interval cannot be zero');
    }

    // Validate interval is not negative
    if (this._interval.isNegative()) {
      throw new Error('ChronosPeriod: Interval cannot be negative');
    }

    // Warn about potentially large iterations (optional safety check)
    if (this._end !== null) {
      const durationMs = Math.abs(this._end.valueOf() - this._start.valueOf());
      const intervalMs = Math.abs(this._interval.totalMilliseconds());
      
      if (intervalMs > 0) {
        const estimatedIterations = durationMs / intervalMs;
        
        // Warn if period would generate more than 1 million iterations
        if (estimatedIterations > 1000000) {
          console.warn(
            `ChronosPeriod: Large number of iterations detected (~${Math.floor(estimatedIterations).toLocaleString()}). ` +
            `This may cause performance issues. Consider using a larger interval or setting a recurrence limit.`
          );
        }
        
        // Hard limit: throw error if more than 10 million iterations
        if (estimatedIterations > 10000000) {
          throw new Error(
            `ChronosPeriod: Period would generate ~${Math.floor(estimatedIterations).toLocaleString()} iterations, ` +
            `which exceeds the safety limit of 10 million. Use a larger interval or set explicit recurrence limits.`
          );
        }
      }
    }

    this._recurrences = null;
    this._options = {
      excludeStart: options.excludeStart ?? false,
      excludeEnd: options.excludeEnd ?? false,
      immutable: options.immutable ?? true,
    };
    this._filters = [];
    this._current = 0;
    this._locale = getLocale('en');
  }

  // ============================================================================
  // Static Factory Methods
  // ============================================================================

  /**
   * Create a period between two dates
   */
  static create(
    start: DateInput,
    end?: DateInput,
    interval?: Duration | ChronosInterval,
  ): ChronosPeriod {
    return new ChronosPeriod(start, end, interval);
  }

  /**
   * Create a period from a start date with recurrences
   */
  static recur(
    start: DateInput,
    interval?: Duration | ChronosInterval,
  ): ChronosPeriod {
    return new ChronosPeriod(start, undefined, interval);
  }

  /**
   * Create a period for a specific number of days
   */
  static days(start: DateInput, count: number): ChronosPeriod {
    const startDate = Chronos.parse(start);
    const endDate = startDate.addDays(count - 1);
    return new ChronosPeriod(startDate, endDate, { days: 1 });
  }

  /**
   * Create a period for a specific number of weeks
   */
  static weeks(start: DateInput, count: number): ChronosPeriod {
    const startDate = Chronos.parse(start);
    const endDate = startDate.addWeeks(count);
    return new ChronosPeriod(startDate, endDate, { weeks: 1 });
  }

  /**
   * Create a period for a specific number of months
   */
  static months(start: DateInput, count: number): ChronosPeriod {
    const startDate = Chronos.parse(start);
    const endDate = startDate.addMonths(count);
    return new ChronosPeriod(startDate, endDate, { months: 1 });
  }

  /**
   * Create a period for a specific number of years
   */
  static years(start: DateInput, count: number): ChronosPeriod {
    const startDate = Chronos.parse(start);
    const endDate = startDate.addYears(count);
    return new ChronosPeriod(startDate, endDate, { years: 1 });
  }

  /**
   * Create a period for the current month
   */
  static currentMonth(): ChronosPeriod {
    const now = Chronos.now();
    return new ChronosPeriod(now.startOf('month'), now.endOf('month'), {
      days: 1,
    });
  }

  /**
   * Create a period for the current year
   */
  static currentYear(): ChronosPeriod {
    const now = Chronos.now();
    return new ChronosPeriod(now.startOf('year'), now.endOf('year'), {
      days: 1,
    });
  }

  /**
   * Create a period for the current week
   */
  static currentWeek(): ChronosPeriod {
    const now = Chronos.now();
    return new ChronosPeriod(now.startOf('week'), now.endOf('week'), {
      days: 1,
    });
  }

  /**
   * Create a period for the current quarter
   */
  static currentQuarter(): ChronosPeriod {
    const now = Chronos.now();
    return new ChronosPeriod(now.startOf('quarter'), now.endOf('quarter'), {
      days: 1,
    });
  }

  // ============================================================================
  // Convenience Aliases (thisWeek, thisMonth, lastWeek, etc.)
  // ============================================================================

  /**
   * Alias for currentWeek()
   */
  static thisWeek(): ChronosPeriod {
    return ChronosPeriod.currentWeek();
  }

  /**
   * Alias for currentMonth()
   */
  static thisMonth(): ChronosPeriod {
    return ChronosPeriod.currentMonth();
  }

  /**
   * Alias for currentYear()
   */
  static thisYear(): ChronosPeriod {
    return ChronosPeriod.currentYear();
  }

  /**
   * Alias for currentQuarter()
   */
  static thisQuarter(): ChronosPeriod {
    return ChronosPeriod.currentQuarter();
  }

  /**
   * Create a period for the previous week
   */
  static lastWeek(): ChronosPeriod {
    const now = Chronos.now().subtract({ weeks: 1 });
    return new ChronosPeriod(now.startOf('week'), now.endOf('week'), {
      days: 1,
    });
  }

  /**
   * Create a period for the previous month
   */
  static lastMonth(): ChronosPeriod {
    const now = Chronos.now().subtract({ months: 1 });
    return new ChronosPeriod(now.startOf('month'), now.endOf('month'), {
      days: 1,
    });
  }

  /**
   * Create a period for the previous year
   */
  static lastYear(): ChronosPeriod {
    const now = Chronos.now().subtract({ years: 1 });
    return new ChronosPeriod(now.startOf('year'), now.endOf('year'), {
      days: 1,
    });
  }

  /**
   * Create a period for the previous quarter
   */
  static lastQuarter(): ChronosPeriod {
    const now = Chronos.now().subtract({ months: 3 });
    return new ChronosPeriod(now.startOf('quarter'), now.endOf('quarter'), {
      days: 1,
    });
  }

  /**
   * Create a period for the next week
   */
  static nextWeek(): ChronosPeriod {
    const now = Chronos.now().add({ weeks: 1 });
    return new ChronosPeriod(now.startOf('week'), now.endOf('week'), {
      days: 1,
    });
  }

  /**
   * Create a period for the next month
   */
  static nextMonth(): ChronosPeriod {
    const now = Chronos.now().add({ months: 1 });
    return new ChronosPeriod(now.startOf('month'), now.endOf('month'), {
      days: 1,
    });
  }

  /**
   * Create a period for the next year
   */
  static nextYear(): ChronosPeriod {
    const now = Chronos.now().add({ years: 1 });
    return new ChronosPeriod(now.startOf('year'), now.endOf('year'), {
      days: 1,
    });
  }

  /**
   * Create a period for the next quarter
   */
  static nextQuarter(): ChronosPeriod {
    const now = Chronos.now().add({ months: 3 });
    return new ChronosPeriod(now.startOf('quarter'), now.endOf('quarter'), {
      days: 1,
    });
  }

  /**
   * Create a period between two dates (alias for create)
   */
  static between(
    start: DateInput,
    end: DateInput,
    interval?: Duration | ChronosInterval,
  ): ChronosPeriod {
    return ChronosPeriod.create(start, end, interval);
  }

  /**
   * Create a period from an ISO 8601 repeating interval string
   * @example
   * ```typescript
   * ChronosPeriod.fromISO('R5/2024-01-01/P1D') // 5 recurrences, daily from 2024-01-01
   * ChronosPeriod.fromISO('2024-01-01/2024-01-31') // Date range
   * ChronosPeriod.fromISO('2024-01-01/P1M') // From date with duration
   * ```
   */
  static fromISO(iso: string): ChronosPeriod {
    // Pattern for repeating interval: R[n]/start/duration or R[n]/start/end
    const repeatMatch = iso.match(/^R(\d*)\/([\d\-T:Z]+)\/(P.+|[\d\-T:Z]+)$/);
    if (repeatMatch) {
      const recurrences = repeatMatch[1]
        ? parseInt(repeatMatch[1], 10)
        : Infinity;
      const start = Chronos.parse(repeatMatch[2]);
      const durationOrEnd = repeatMatch[3];

      if (durationOrEnd.startsWith('P')) {
        const interval = ChronosInterval.fromISO(durationOrEnd);
        return new ChronosPeriod(start, undefined, interval).times(recurrences);
      } else {
        const end = Chronos.parse(durationOrEnd);
        return new ChronosPeriod(start, end).times(recurrences);
      }
    }

    // Pattern for date range: start/end or start/duration
    const rangeMatch = iso.match(/^([\d\-T:Z]+)\/(P.+|[\d\-T:Z]+)$/);
    if (rangeMatch) {
      const start = Chronos.parse(rangeMatch[1]);
      const durationOrEnd = rangeMatch[2];

      if (durationOrEnd.startsWith('P')) {
        const interval = ChronosInterval.fromISO(durationOrEnd);
        const end = start.add(interval.toDuration());
        return new ChronosPeriod(start, end, interval);
      } else {
        const end = Chronos.parse(durationOrEnd);
        return new ChronosPeriod(start, end);
      }
    }

    throw new Error(`Invalid ISO 8601 period: ${iso}`);
  }

  // ============================================================================
  // Getters
  // ============================================================================

  /**
   * Get the start date
   */
  get start(): Chronos {
    return this._start;
  }

  /**
   * Get the end date
   */
  get end(): Chronos | null {
    return this._end;
  }

  /**
   * Get the interval
   */
  get interval(): ChronosInterval {
    return this._interval;
  }

  /**
   * Get the number of recurrences
   */
  get recurrences(): number | null {
    return this._recurrences;
  }

  /**
   * Check if the period includes the start boundary
   */
  get includesStart(): boolean {
    return !this._options.excludeStart;
  }

  /**
   * Check if the period includes the end boundary
   */
  get includesEnd(): boolean {
    return !this._options.excludeEnd;
  }

  /**
   * Check if the period has an end date
   */
  get hasEnd(): boolean {
    return this._end !== null || this._recurrences !== null;
  }

  /**
   * Check if the period is unbounded
   */
  get isUnbounded(): boolean {
    return this._end === null && this._recurrences === null;
  }

  // ============================================================================
  // Setters (Fluent Interface)
  // ============================================================================

  /**
   * Set the start date
   */
  setStart(start: DateInput): ChronosPeriod {
    const period = this._cloneForModification();
    period._start = Chronos.parse(start);
    return period;
  }

  /**
   * Set the end date
   */
  setEnd(end: DateInput): ChronosPeriod {
    const period = this._cloneForModification();
    period._end = Chronos.parse(end);
    return period;
  }

  /**
   * Set the interval
   */
  setInterval(interval: Duration | ChronosInterval): ChronosPeriod {
    const period = this._cloneForModification();
    const newInterval =
      interval instanceof ChronosInterval
        ? interval
        : ChronosInterval.create(interval);

    // Validate interval is not zero to prevent infinite loops
    if (newInterval.isZero()) {
      throw new Error('ChronosPeriod: Interval cannot be zero');
    }

    // Validate interval is not negative
    if (newInterval.isNegative()) {
      throw new Error('ChronosPeriod: Interval cannot be negative');
    }

    period._interval = newInterval;
    return period;
  }

  /**
   * Set the number of recurrences
   */
  times(count: number): ChronosPeriod {
    const period = this._cloneForModification();
    period._recurrences = count;
    return period;
  }

  /**
   * Set interval by unit
   */
  every(amount: number, unit: AnyTimeUnit): ChronosPeriod {
    // Validate amount is positive
    if (amount <= 0) {
      throw new Error('ChronosPeriod: Amount must be positive');
    }

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
      default:
        duration.days = amount;
    }

    return this.setInterval(duration);
  }

  /**
   * Exclude the start boundary
   */
  excludeStart(): ChronosPeriod {
    const period = this._cloneForModification();
    period._options.excludeStart = true;
    return period;
  }

  /**
   * Exclude the end boundary
   */
  excludeEnd(): ChronosPeriod {
    const period = this._cloneForModification();
    period._options.excludeEnd = true;
    return period;
  }

  /**
   * Include the start boundary
   */
  includeStart(): ChronosPeriod {
    const period = this._cloneForModification();
    period._options.excludeStart = false;
    return period;
  }

  /**
   * Include the end boundary
   */
  includeEnd(): ChronosPeriod {
    const period = this._cloneForModification();
    period._options.excludeEnd = false;
    return period;
  }

  // ============================================================================
  // Filters
  // ============================================================================

  /**
   * Add a filter function
   */
  filter(fn: (date: Chronos, key: number) => boolean): ChronosPeriod {
    const period = this._cloneForModification();
    period._filters.push(fn);
    return period;
  }

  /**
   * Filter to only include weekdays
   */
  weekdays(): ChronosPeriod {
    return this.filter((date) => date.dayOfWeek !== 0 && date.dayOfWeek !== 6);
  }

  /**
   * Alias for weekdays()
   */
  filterWeekdays(): ChronosPeriod {
    return this.weekdays();
  }

  /**
   * Filter to only include weekends
   */
  weekends(): ChronosPeriod {
    return this.filter((date) => date.dayOfWeek === 0 || date.dayOfWeek === 6);
  }

  /**
   * Alias for weekends()
   */
  filterWeekends(): ChronosPeriod {
    return this.weekends();
  }

  /**
   * Filter to only include specific days of week
   */
  onlyDays(...days: number[]): ChronosPeriod {
    return this.filter((date) => days.includes(date.dayOfWeek));
  }

  /**
   * Filter to exclude specific days of week
   */
  exceptDays(...days: number[]): ChronosPeriod {
    return this.filter((date) => !days.includes(date.dayOfWeek));
  }

  /**
   * Filter to only include specific months
   */
  onlyMonths(...months: number[]): ChronosPeriod {
    return this.filter((date) => months.includes(date.month));
  }

  /**
   * Filter to exclude specific months
   */
  exceptMonths(...months: number[]): ChronosPeriod {
    return this.filter((date) => !months.includes(date.month));
  }

  /**
   * Clear all filters
   */
  clearFilters(): ChronosPeriod {
    const period = this._cloneForModification();
    period._filters = [];
    return period;
  }

  // ============================================================================
  // Iteration
  // ============================================================================

  /**
   * Get all dates in the period as an array
   */
  toArray(): Chronos[] {
    return [...this];
  }

  /**
   * Iterate over the period
   */
  *[Symbol.iterator](): Iterator<Chronos> {
    let current = this._start.clone();
    let count = 0;

    // Handle excludeStart
    if (this._options.excludeStart) {
      current = this._applyInterval(current);
      count++;
    }

    while (this._shouldContinue(current, count)) {
      // Apply filters
      if (this._passesFilters(current, count)) {
        yield this._options.immutable ? current.clone() : current;
      }

      current = this._applyInterval(current);
      count++;
    }
  }

  /**
   * Apply the interval to a date
   */
  private _applyInterval(date: Chronos): Chronos {
    return date.add(this._interval.toDuration());
  }

  /**
   * Check if iteration should continue
   */
  private _shouldContinue(date: Chronos, count: number): boolean {
    // Check recurrence limit
    if (this._recurrences !== null && count >= this._recurrences) {
      return false;
    }

    // Check end date
    if (this._end !== null) {
      if (this._options.excludeEnd) {
        return date.isBefore(this._end);
      }
      return date.isSameOrBefore(this._end);
    }

    // No end - check for unbounded
    if (this._recurrences === null) {
      // Prevent infinite iteration
      if (count > 10000) {
        throw new Error(
          'ChronosPeriod: Maximum iteration limit reached. Set an end date or recurrence limit.',
        );
      }
    }

    return true;
  }

  /**
   * Check if a date passes all filters
   */
  private _passesFilters(date: Chronos, key: number): boolean {
    return this._filters.every((filter) => filter(date, key));
  }

  /**
   * Get count of dates in the period
   */
  count(): number {
    return this.toArray().length;
  }

  /**
   * Get the first date in the period
   */
  first(): Chronos | null {
    const iterator = this[Symbol.iterator]();
    const result = iterator.next();
    return result.done ? null : result.value;
  }

  /**
   * Get the last date in the period
   */
  last(): Chronos | null {
    let lastDate: Chronos | null = null;
    for (const date of this) {
      lastDate = date;
    }
    return lastDate;
  }

  /**
   * Get a date at a specific index
   */
  nth(index: number): Chronos | null {
    let count = 0;
    for (const date of this) {
      if (count === index) {
        return date;
      }
      count++;
    }
    return null;
  }

  /**
   * Check if a date is within the period
   */
  contains(date: DateInput): boolean {
    const target = Chronos.parse(date);
    for (const d of this) {
      if (d.isSame(target, 'day')) {
        return true;
      }
    }
    return false;
  }

  /**
   * For each iteration
   */
  forEach(callback: (date: Chronos, index: number) => void): void {
    let index = 0;
    for (const date of this) {
      callback(date, index);
      index++;
    }
  }

  /**
   * Map dates to another type
   */
  map<T>(callback: (date: Chronos, index: number) => T): T[] {
    const result: T[] = [];
    let index = 0;
    for (const date of this) {
      result.push(callback(date, index));
      index++;
    }
    return result;
  }

  /**
   * Reduce dates to a single value
   */
  reduce<T>(
    callback: (acc: T, date: Chronos, index: number) => T,
    initial: T,
  ): T {
    let acc = initial;
    let index = 0;
    for (const date of this) {
      acc = callback(acc, date, index);
      index++;
    }
    return acc;
  }

  // ============================================================================
  // Range Operations
  // ============================================================================

  /**
   * Check if two periods overlap
   */
  overlaps(other: ChronosPeriod): boolean {
    const thisEnd = this._end ?? this.last();
    const otherEnd = other._end ?? other.last();

    if (!thisEnd || !otherEnd) {
      return true; // Unbounded periods always overlap
    }

    return (
      this._start.isSameOrBefore(otherEnd) &&
      thisEnd.isSameOrAfter(other._start)
    );
  }

  /**
   * Get the intersection of two periods
   */
  intersect(other: ChronosPeriod): ChronosPeriod | null {
    if (!this.overlaps(other)) {
      return null;
    }

    const start = this._start.isAfter(other._start)
      ? this._start
      : other._start;
    const thisEnd = this._end ?? this.last();
    const otherEnd = other._end ?? other.last();

    if (!thisEnd || !otherEnd) {
      return new ChronosPeriod(start, undefined, this._interval);
    }

    const end = thisEnd.isBefore(otherEnd) ? thisEnd : otherEnd;
    return new ChronosPeriod(start, end, this._interval);
  }

  /**
   * Get the union of two periods
   */
  union(other: ChronosPeriod): ChronosPeriod | null {
    if (!this.overlaps(other) && !this._adjacentTo(other)) {
      return null;
    }

    const start = this._start.isBefore(other._start)
      ? this._start
      : other._start;
    const thisEnd = this._end ?? this.last();
    const otherEnd = other._end ?? other.last();

    if (!thisEnd || !otherEnd) {
      return new ChronosPeriod(start, undefined, this._interval);
    }

    const end = thisEnd.isAfter(otherEnd) ? thisEnd : otherEnd;
    return new ChronosPeriod(start, end, this._interval);
  }

  /**
   * Get the difference between two periods
   * Returns the parts of this period that don't overlap with the other period
   */
  diff(other: ChronosPeriod): ChronosPeriod[] {
    if (!this.overlaps(other)) {
      return [this.clone()];
    }

    const results: ChronosPeriod[] = [];
    const thisEnd = this._end ?? this.last();
    const otherEnd = other._end ?? other.last();

    // Before the other period starts - create gap from this start to other start
    if (this._start.isBefore(other._start)) {
      results.push(
        new ChronosPeriod(
          this._start,
          other._start,
          this._interval,
        ),
      );
    }

    // After the other period ends - create gap from other end to this end
    if (otherEnd && thisEnd && thisEnd.isAfter(otherEnd)) {
      results.push(
        new ChronosPeriod(
          otherEnd,
          thisEnd,
          this._interval,
        ),
      );
    }

    return results;
  }

  /**
   * Check if this period is adjacent to another
   */
  private _adjacentTo(other: ChronosPeriod): boolean {
    const thisEnd = this._end ?? this.last();
    const otherEnd = other._end ?? other.last();

    if (!thisEnd || !otherEnd) {
      return false;
    }

    return (
      thisEnd.add(this._interval.toDuration()).isSame(other._start) ||
      otherEnd.add(other._interval.toDuration()).isSame(this._start)
    );
  }

  // ============================================================================
  // Duration
  // ============================================================================

  /**
   * Get the duration of the period
   */
  duration(): ChronosInterval {
    if (this._end === null) {
      throw new Error('Cannot get duration of unbounded period');
    }
    return ChronosInterval.between(this._start.toDate(), this._end.toDate());
  }

  /**
   * Get the number of days in the period
   */
  days(): number {
    if (this._end === null) {
      throw new Error('Cannot get days of unbounded period');
    }
    return Math.abs(this._start.diff(this._end, 'day'));
  }

  /**
   * Get the number of weeks in the period
   */
  weeks(): number {
    if (this._end === null) {
      throw new Error('Cannot get weeks of unbounded period');
    }
    return Math.abs(this._start.diff(this._end, 'week'));
  }

  /**
   * Get the number of months in the period
   */
  monthCount(): number {
    if (this._end === null) {
      throw new Error('Cannot get months of unbounded period');
    }
    return Math.abs(this._start.diff(this._end, 'month'));
  }

  /**
   * Get the number of years in the period
   */
  yearCount(): number {
    if (this._end === null) {
      throw new Error('Cannot get years of unbounded period');
    }
    return Math.abs(this._start.diff(this._end, 'year'));
  }

  // ============================================================================
  // Splitting
  // ============================================================================

  /**
   * Split the period into chunks
   */
  split(count: number): ChronosPeriod[] {
    if (this._end === null) {
      throw new Error('Cannot split unbounded period');
    }

    const totalDays = this.days();
    const daysPerChunk = Math.ceil(totalDays / count);
    const chunks: ChronosPeriod[] = [];

    let current = this._start.clone();
    for (let i = 0; i < count && current.isSameOrBefore(this._end); i++) {
      const chunkEnd = current.addDays(daysPerChunk - 1);
      const end = chunkEnd.isAfter(this._end) ? this._end : chunkEnd;
      chunks.push(new ChronosPeriod(current, end, this._interval));
      current = end.addDays(1);
    }

    return chunks;
  }

  /**
   * Split by a specific interval
   */
  splitBy(interval: Duration | ChronosInterval): ChronosPeriod[] {
    if (this._end === null) {
      throw new Error('Cannot split unbounded period');
    }

    const splitInterval =
      interval instanceof ChronosInterval
        ? interval
        : ChronosInterval.create(interval);

    // Validate that the interval is not zero
    if (splitInterval.isZero()) {
      throw new Error('Cannot split by zero interval');
    }

    // Validate that the interval is positive
    if (splitInterval.isNegative()) {
      throw new Error('Cannot split by negative interval');
    }

    const chunks: ChronosPeriod[] = [];
    let current = this._start.clone();

    while (current.isSameOrBefore(this._end)) {
      const chunkEnd = current
        .add(splitInterval.toDuration())
        .subtract({ days: 1 });
      const end = chunkEnd.isAfter(this._end) ? this._end : chunkEnd;
      chunks.push(new ChronosPeriod(current, end, this._interval));
      current = current.add(splitInterval.toDuration());
    }

    return chunks;
  }

  /**
   * Split the period by a specified number of days
   */
  splitByDays(days: number): ChronosPeriod[] {
    return this.splitBy({ days });
  }

  /**
   * Split the period by a specified number of weeks
   */
  splitByWeeks(weeks: number): ChronosPeriod[] {
    return this.splitBy({ weeks });
  }

  /**
   * Split the period by a specified number of months
   */
  splitByMonths(months: number): ChronosPeriod[] {
    return this.splitBy({ months });
  }

  /**
   * Split the period by a specified number of years
   */
  splitByYears(years: number): ChronosPeriod[] {
    return this.splitBy({ years });
  }

  /**
   * Skip specific dates from the period iteration
   * @param dates - Dates to exclude from iteration
   */
  skip(dates: DateInput[]): ChronosPeriod {
    const skipDates = dates.map((d) => Chronos.parse(d).format('YYYY-MM-DD'));
    return this.filter(
      (date) => !skipDates.includes(date.format('YYYY-MM-DD')),
    );
  }

  // ============================================================================
  // Formatting
  // ============================================================================

  /**
   * Convert to ISO 8601 string
   */
  toISO(): string {
    let iso = '';

    if (this._recurrences !== null && this._recurrences !== Infinity) {
      iso += `R${this._recurrences}/`;
    } else if (this._recurrences === Infinity) {
      iso += 'R/';
    }

    iso += this._start.toISOString().split('T')[0];
    iso += '/';

    if (this._end) {
      iso += this._end.toISOString().split('T')[0];
    } else {
      iso += this._interval.toISO();
    }

    return iso;
  }

  /**
   * Convert to string
   */
  toString(): string {
    const start = this._start.format('YYYY-MM-DD');
    const end = this._end ? this._end.format('YYYY-MM-DD') : '...';
    return `${start} to ${end}`;
  }

  /**
   * Convert to human-readable string
   */
  forHumans(): string {
    const count = this.count();
    const start = this._start.format('MMMM D, YYYY');
    const end = this._end ? this._end.format('MMMM D, YYYY') : 'indefinitely';

    return `${count} dates from ${start} to ${end}`;
  }

  /**
   * Convert to JSON
   */
  toJSON(): object {
    return {
      start: this._start.toISOString(),
      end: this._end?.toISOString() ?? null,
      interval: this._interval.toISO(),
      recurrences: this._recurrences,
      options: this._options,
    };
  }

  // ============================================================================
  // Cloning and Locale
  // ============================================================================

  /**
   * Clone this period
   */
  clone(): ChronosPeriod {
    const period = new ChronosPeriod(
      this._start,
      this._end ?? undefined,
      this._interval,
      { ...this._options },
    );
    period._recurrences = this._recurrences;
    period._filters = [...this._filters];
    (period as unknown as { _locale: LocaleConfig })._locale = this._locale;
    return period;
  }

  /**
   * Clone for modification (respects immutable option)
   */
  private _cloneForModification(): ChronosPeriod {
    return this._options.immutable ? this.clone() : this;
  }

  /**
   * Set locale for this period
   */
  locale(code: string): ChronosPeriod {
    const period = this._cloneForModification();
    (period as unknown as { _locale: LocaleConfig })._locale = getLocale(code);
    return period;
  }

  // ============================================================================
  // Static Helpers
  // ============================================================================

  /**
   * Create a period for a specific month
   */
  static month(year: number, month: number): ChronosPeriod {
    const start = Chronos.create(year, month, 1);
    const end = start.endOf('month');
    return new ChronosPeriod(start, end, { days: 1 });
  }

  /**
   * Create a period for a specific year
   */
  static year(year: number): ChronosPeriod {
    const start = Chronos.create(year, 1, 1);
    const end = Chronos.create(year, 12, 31);
    return new ChronosPeriod(start, end, { days: 1 });
  }

  /**
   * Create a period for a specific quarter
   */
  static quarter(year: number, quarter: number): ChronosPeriod {
    const startMonth = (quarter - 1) * 3 + 1;
    const start = Chronos.create(year, startMonth, 1);
    const end = start.endOf('quarter');
    return new ChronosPeriod(start, end, { days: 1 });
  }

  /**
   * Create a period between two dates as weekdays only
   */
  static weekdaysBetween(start: DateInput, end: DateInput): ChronosPeriod {
    return ChronosPeriod.create(start, end).weekdays();
  }

  /**
   * Create a period with business days only (weekdays, can add holidays filter)
   */
  static businessDays(
    start: DateInput,
    end: DateInput,
    holidays?: DateInput[],
  ): ChronosPeriod {
    let period = ChronosPeriod.create(start, end).weekdays();

    if (holidays && holidays.length > 0) {
      const holidayDates = holidays.map((h) =>
        Chronos.parse(h).format('YYYY-MM-DD'),
      );
      period = period.filter(
        (date) => !holidayDates.includes(date.format('YYYY-MM-DD')),
      );
    }

    return period;
  }
}
