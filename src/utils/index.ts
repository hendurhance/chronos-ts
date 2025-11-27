/**
 * Utility functions for Chronos
 * @module utils
 */

import {
  AnyTimeUnit,
  TimeUnit,
  Duration,
  DateInput,
  ChronosLike,
  MILLISECONDS_PER_SECOND,
  MILLISECONDS_PER_MINUTE,
  MILLISECONDS_PER_HOUR,
  MILLISECONDS_PER_DAY,
  MILLISECONDS_PER_WEEK,
  MILLISECONDS_PER_MONTH,
  MILLISECONDS_PER_YEAR,
} from '../types';

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if value is a Date object
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Check if value is a valid date input
 */
export function isValidDateInput(value: unknown): value is DateInput {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' || typeof value === 'number') return true;
  if (isDate(value)) return true;
  if (isChronosLike(value)) return true;
  return false;
}

/**
 * Check if value implements ChronosLike interface
 */
export function isChronosLike(value: unknown): value is ChronosLike {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.toDate === 'function' && typeof obj.valueOf === 'function';
}

/**
 * Check if value is a Duration object
 */
export function isDuration(value: unknown): value is Duration {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  const keys = [
    'years',
    'months',
    'weeks',
    'days',
    'hours',
    'minutes',
    'seconds',
    'milliseconds',
  ];
  return keys.some((key) => typeof obj[key] === 'number');
}

/**
 * Check if value is a valid ISO 8601 duration string
 */
export function isISODuration(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const pattern =
    /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;
  return pattern.test(value);
}

/**
 * Check if a year is a leap year
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// ============================================================================
// Time Unit Utilities
// ============================================================================

/**
 * Unit aliases mapping
 */
const UNIT_ALIASES: Record<string, TimeUnit> = {
  // Singular
  millisecond: 'millisecond',
  second: 'second',
  minute: 'minute',
  hour: 'hour',
  day: 'day',
  week: 'week',
  month: 'month',
  quarter: 'quarter',
  year: 'year',
  decade: 'decade',
  century: 'century',
  millennium: 'millennium',
  // Plural
  milliseconds: 'millisecond',
  seconds: 'second',
  minutes: 'minute',
  hours: 'hour',
  days: 'day',
  weeks: 'week',
  months: 'month',
  quarters: 'quarter',
  years: 'year',
  decades: 'decade',
  centuries: 'century',
  millennia: 'millennium',
  // Short
  ms: 'millisecond',
  s: 'second',
  m: 'minute',
  h: 'hour',
  d: 'day',
  w: 'week',
  M: 'month',
  Q: 'quarter',
  y: 'year',
};

/**
 * Normalize a time unit to its canonical form
 */
export function normalizeUnit(unit: AnyTimeUnit | string): TimeUnit {
  const normalized = UNIT_ALIASES[unit.toLowerCase()] ?? UNIT_ALIASES[unit];
  if (!normalized) {
    throw new Error(`Invalid time unit: ${unit}`);
  }
  return normalized;
}

/**
 * Get the plural form of a time unit
 */
export function pluralizeUnit(unit: TimeUnit, count: number): string {
  const plurals: Record<TimeUnit, string> = {
    millisecond: 'milliseconds',
    second: 'seconds',
    minute: 'minutes',
    hour: 'hours',
    day: 'days',
    week: 'weeks',
    month: 'months',
    quarter: 'quarters',
    year: 'years',
    decade: 'decades',
    century: 'centuries',
    millennium: 'millennia',
  };
  return Math.abs(count) === 1 ? unit : plurals[unit];
}

/**
 * Get milliseconds for a given time unit
 */
export function getMillisecondsPerUnit(unit: TimeUnit): number {
  switch (unit) {
    case 'millisecond':
      return 1;
    case 'second':
      return MILLISECONDS_PER_SECOND;
    case 'minute':
      return MILLISECONDS_PER_MINUTE;
    case 'hour':
      return MILLISECONDS_PER_HOUR;
    case 'day':
      return MILLISECONDS_PER_DAY;
    case 'week':
      return MILLISECONDS_PER_WEEK;
    case 'month':
      return MILLISECONDS_PER_MONTH;
    case 'quarter':
      return MILLISECONDS_PER_MONTH * 3;
    case 'year':
      return MILLISECONDS_PER_YEAR;
    case 'decade':
      return MILLISECONDS_PER_YEAR * 10;
    case 'century':
      return MILLISECONDS_PER_YEAR * 100;
    case 'millennium':
      return MILLISECONDS_PER_YEAR * 1000;
    default:
      throw new Error(`Unknown unit: ${unit}`);
  }
}

// ============================================================================
// Date Utilities
// ============================================================================

/**
 * Get the number of days in a specific month
 */
export function getDaysInMonth(year: number, month: number): number {
  // Create date for first day of next month, then subtract one day
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/**
 * Get the number of days in a year
 */
export function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

/**
 * Get the day of year (1-366)
 */
export function getDayOfYear(date: Date): number {
  const start = new Date(Date.UTC(date.getFullYear(), 0, 0));
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / MILLISECONDS_PER_DAY);
}

/**
 * Get the ISO week number (1-53)
 */
export function getISOWeek(date: Date): number {
  const target = new Date(date.valueOf());
  // Set to nearest Thursday: current date + 4 - current day number (make Sunday=7)
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  // Store first Thursday of year
  const firstThursday = target.valueOf();
  // Set to start of year
  target.setMonth(0, 1);
  // If not Thursday, set to first Thursday of year
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  // Calculate week number
  return (
    1 + Math.ceil((firstThursday - target.valueOf()) / MILLISECONDS_PER_WEEK)
  );
}

/**
 * Get the ISO week year
 */
export function getISOWeekYear(date: Date): number {
  const target = new Date(date.valueOf());
  target.setDate(target.getDate() + 3 - ((date.getDay() + 6) % 7));
  return target.getFullYear();
}

/**
 * Get the quarter (1-4)
 */
export function getQuarter(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1;
}

/**
 * Get start of a time unit
 */
export function startOf(date: Date, unit: TimeUnit): Date {
  const result = new Date(date);

  switch (unit) {
    case 'second':
      result.setMilliseconds(0);
      break;
    case 'minute':
      result.setSeconds(0, 0);
      break;
    case 'hour':
      result.setMinutes(0, 0, 0);
      break;
    case 'day':
      result.setHours(0, 0, 0, 0);
      break;
    case 'week':
      result.setHours(0, 0, 0, 0);
      result.setDate(result.getDate() - result.getDay());
      break;
    case 'month':
      result.setHours(0, 0, 0, 0);
      result.setDate(1);
      break;
    case 'quarter':
      result.setHours(0, 0, 0, 0);
      result.setMonth(Math.floor(result.getMonth() / 3) * 3, 1);
      break;
    case 'year':
      result.setHours(0, 0, 0, 0);
      result.setMonth(0, 1);
      break;
    case 'decade':
      result.setHours(0, 0, 0, 0);
      result.setMonth(0, 1);
      result.setFullYear(Math.floor(result.getFullYear() / 10) * 10);
      break;
    case 'century':
      result.setHours(0, 0, 0, 0);
      result.setMonth(0, 1);
      result.setFullYear(Math.floor(result.getFullYear() / 100) * 100);
      break;
    case 'millennium':
      result.setHours(0, 0, 0, 0);
      result.setMonth(0, 1);
      result.setFullYear(Math.floor(result.getFullYear() / 1000) * 1000);
      break;
    case 'millisecond':
    default:
      break;
  }

  return result;
}

/**
 * Get end of a time unit
 */
export function endOf(date: Date, unit: TimeUnit): Date {
  const result = new Date(date);

  switch (unit) {
    case 'second':
      result.setMilliseconds(999);
      break;
    case 'minute':
      result.setSeconds(59, 999);
      break;
    case 'hour':
      result.setMinutes(59, 59, 999);
      break;
    case 'day':
      result.setHours(23, 59, 59, 999);
      break;
    case 'week':
      result.setHours(23, 59, 59, 999);
      result.setDate(result.getDate() + (6 - result.getDay()));
      break;
    case 'month':
      result.setHours(23, 59, 59, 999);
      result.setMonth(result.getMonth() + 1, 0);
      break;
    case 'quarter':
      result.setHours(23, 59, 59, 999);
      result.setMonth(Math.floor(result.getMonth() / 3) * 3 + 3, 0);
      break;
    case 'year':
      result.setHours(23, 59, 59, 999);
      result.setMonth(11, 31);
      break;
    case 'decade':
      result.setHours(23, 59, 59, 999);
      result.setFullYear(
        Math.floor(result.getFullYear() / 10) * 10 + 9,
        11,
        31,
      );
      break;
    case 'century':
      result.setHours(23, 59, 59, 999);
      result.setFullYear(
        Math.floor(result.getFullYear() / 100) * 100 + 99,
        11,
        31,
      );
      break;
    case 'millennium':
      result.setHours(23, 59, 59, 999);
      result.setFullYear(
        Math.floor(result.getFullYear() / 1000) * 1000 + 999,
        11,
        31,
      );
      break;
    case 'millisecond':
    default:
      break;
  }

  return result;
}

// ============================================================================
// Arithmetic Utilities
// ============================================================================

/**
 * Add a duration to a date
 * Handles month overflow by clamping to the last day of the month
 */
export function addDuration(date: Date, duration: Duration): Date {
  const result = new Date(date);

  if (duration.years) {
    const originalDay = result.getDate();
    result.setFullYear(result.getFullYear() + duration.years);
    // Handle year overflow (e.g., Feb 29 in a leap year to Feb 28 in non-leap year)
    if (result.getDate() !== originalDay) {
      result.setDate(0); // Go to last day of previous month
    }
  }
  if (duration.months) {
    const originalDay = result.getDate();
    result.setMonth(result.getMonth() + duration.months);
    // Handle month overflow (e.g., Jan 31 + 1 month = Feb 28/29, not March 2/3)
    if (result.getDate() !== originalDay) {
      result.setDate(0); // Go to last day of previous month
    }
  }
  if (duration.weeks) {
    result.setDate(result.getDate() + duration.weeks * 7);
  }
  if (duration.days) {
    result.setDate(result.getDate() + duration.days);
  }
  if (duration.hours) {
    result.setHours(result.getHours() + duration.hours);
  }
  if (duration.minutes) {
    result.setMinutes(result.getMinutes() + duration.minutes);
  }
  if (duration.seconds) {
    result.setSeconds(result.getSeconds() + duration.seconds);
  }
  if (duration.milliseconds) {
    result.setMilliseconds(result.getMilliseconds() + duration.milliseconds);
  }

  return result;
}

/**
 * Subtract a duration from a date
 */
export function subtractDuration(date: Date, duration: Duration): Date {
  const negated: Duration = {};

  for (const [key, value] of Object.entries(duration)) {
    if (typeof value === 'number') {
      (negated as Record<string, number>)[key] = -value;
    }
  }

  return addDuration(date, negated);
}

/**
 * Add a specific number of units to a date
 */
export function addUnits(date: Date, amount: number, unit: TimeUnit): Date {
  const duration: Duration = {};

  switch (unit) {
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

  return addDuration(date, duration);
}

// ============================================================================
// Difference Utilities
// ============================================================================

/**
 * Calculate the difference between two dates in a specific unit
 */
export function diffInUnits(date1: Date, date2: Date, unit: TimeUnit): number {
  const diff = date1.getTime() - date2.getTime();

  switch (unit) {
    case 'millisecond':
      return diff;
    case 'second':
      return Math.floor(diff / MILLISECONDS_PER_SECOND);
    case 'minute':
      return Math.floor(diff / MILLISECONDS_PER_MINUTE);
    case 'hour':
      return Math.floor(diff / MILLISECONDS_PER_HOUR);
    case 'day':
      return Math.floor(diff / MILLISECONDS_PER_DAY);
    case 'week':
      return Math.floor(diff / MILLISECONDS_PER_WEEK);
    case 'month':
      return monthDiff(date2, date1);
    case 'quarter':
      return Math.floor(monthDiff(date2, date1) / 3);
    case 'year':
      return date1.getFullYear() - date2.getFullYear();
    case 'decade':
      return Math.floor((date1.getFullYear() - date2.getFullYear()) / 10);
    case 'century':
      return Math.floor((date1.getFullYear() - date2.getFullYear()) / 100);
    case 'millennium':
      return Math.floor((date1.getFullYear() - date2.getFullYear()) / 1000);
    default:
      throw new Error(`Unknown unit: ${unit}`);
  }
}

/**
 * Calculate month difference between two dates
 */
function monthDiff(from: Date, to: Date): number {
  const years = to.getFullYear() - from.getFullYear();
  const months = to.getMonth() - from.getMonth();
  const days = to.getDate() - from.getDate();

  let diff = years * 12 + months;

  // Adjust for day difference
  if (days < 0) {
    diff--;
  }

  return diff;
}

// ============================================================================
// Parsing Utilities
// ============================================================================

/**
 * Parse an ISO 8601 duration string
 */
export function parseISODuration(duration: string): Duration {
  const pattern =
    /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;
  const match = duration.match(pattern);

  if (!match) {
    throw new Error(`Invalid ISO 8601 duration: ${duration}`);
  }

  return {
    years: match[1] ? parseInt(match[1], 10) : undefined,
    months: match[2] ? parseInt(match[2], 10) : undefined,
    weeks: match[3] ? parseInt(match[3], 10) : undefined,
    days: match[4] ? parseInt(match[4], 10) : undefined,
    hours: match[5] ? parseInt(match[5], 10) : undefined,
    minutes: match[6] ? parseInt(match[6], 10) : undefined,
    seconds: match[7] ? parseFloat(match[7]) : undefined,
  };
}

/**
 * Convert a duration to ISO 8601 format
 */
export function durationToISO(duration: Duration): string {
  let result = 'P';

  if (duration.years) result += `${duration.years}Y`;
  if (duration.months) result += `${duration.months}M`;
  if (duration.weeks) result += `${duration.weeks}W`;
  if (duration.days) result += `${duration.days}D`;

  const hasTime =
    duration.hours ||
    duration.minutes ||
    duration.seconds ||
    duration.milliseconds;
  if (hasTime) {
    result += 'T';
    if (duration.hours) result += `${duration.hours}H`;
    if (duration.minutes) result += `${duration.minutes}M`;

    const seconds =
      (duration.seconds ?? 0) + (duration.milliseconds ?? 0) / 1000;
    if (seconds) result += `${seconds}S`;
  }

  return result === 'P' ? 'PT0S' : result;
}

// ============================================================================
// Comparison Utilities
// ============================================================================

/**
 * Compare two dates at a specific granularity
 */
export function compareAtGranularity(
  date1: Date,
  date2: Date,
  unit: TimeUnit,
): number {
  const d1 = startOf(date1, unit);
  const d2 = startOf(date2, unit);

  if (d1.getTime() < d2.getTime()) return -1;
  if (d1.getTime() > d2.getTime()) return 1;
  return 0;
}

/**
 * Check if two dates are the same at a specific granularity
 */
export function isSameAt(date1: Date, date2: Date, unit: TimeUnit): boolean {
  return compareAtGranularity(date1, date2, unit) === 0;
}

// ============================================================================
// Cloning Utilities
// ============================================================================

/**
 * Create a deep clone of a date
 */
export function cloneDate(date: Date): Date {
  return new Date(date.getTime());
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Check if a date is valid
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Ensure a value is within bounds
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ============================================================================
// Ordinal Utilities
// ============================================================================

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
export function ordinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ============================================================================
// Padding Utilities
// ============================================================================

/**
 * Pad a number with leading zeros
 */
export function padStart(
  value: number | string,
  length: number,
  char = '0',
): string {
  const str = String(value);
  if (str.length >= length) return str;
  return char.repeat(length - str.length) + str;
}
