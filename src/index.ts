/**
 * Chronos v2 - A comprehensive TypeScript library for date and time manipulation
 *
 * @description
 * Chronos is a powerful, modern TypeScript library for handling dates, times,
 * intervals, periods, and timezones. Inspired by Carbon PHP, it provides an
 * intuitive and fluent API for all your time-related needs.
 *
 * @example
 * ```typescript
 * import { Chronos, ChronosInterval, ChronosPeriod, ChronosTimezone } from 'chronos-ts';
 *
 * // Create dates
 * const now = Chronos.now();
 * const birthday = Chronos.create(1990, 5, 15);
 *
 * // Manipulate
 * const nextWeek = now.addWeeks(1);
 * const endOfMonth = now.endOf('month');
 *
 * // Compare
 * if (now.isAfter(birthday)) {
 *   console.log('Birthday has passed');
 * }
 *
 * // Format
 * console.log(now.format('MMMM D, YYYY')); // "January 15, 2024"
 *
 * // Intervals
 * const duration = ChronosInterval.hours(5).addMinutes(30);
 * console.log(duration.forHumans()); // "5 hours 30 minutes"
 *
 * // Periods
 * const week = ChronosPeriod.currentWeek();
 * for (const day of week) {
 *   console.log(day.format('dddd'));
 * }
 *
 * // Timezones
 * const tz = ChronosTimezone.create('America/New_York');
 * console.log(tz.getOffsetString()); // "-05:00"
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Core Classes
// ============================================================================

export {
  Chronos,
  ChronosInterval,
  ChronosPeriod,
  ChronosPeriodCollection,
  ChronosTimezone,
  TIMEZONES,
  Timezones,
  type TimezoneId,
} from './core';

// ============================================================================
// Types
// ============================================================================

export {
  // Enums
  DayOfWeek,
  Month,
  PeriodBoundary,

  // Core Types
  type TimeUnit,
  type TimeUnitPlural,
  type TimeUnitShort,
  type AnyTimeUnit,
  type Duration,
  type DateInput,
  type ChronosLike,
  type ChronosConfig,
  type DateTimeComponents,
  type DateTimeSetter,
  type ISODuration,

  // Formatting Types
  type FormatTokens,
  type FormatPreset,
  type CompareOperator,
  type CompareGranularity,

  // Period Types
  type PeriodOptions,

  // Timezone Types
  type TimezoneInput,
  type TimezoneInfo,
  type TimezoneOffset,
  type DSTransition,

  // Locale Types
  type LocaleConfig,

  // Diff & Serialization Types
  type HumanDiffOptions,
  type DiffResult,
  type ChronosSerializable,
  type ChronosJSON,

  // Range Types
  type TimeRange,
  type BusinessHours,
  type CalendarWeek,
  type CalendarMonth,

  // Utility Types
  type DeepPartial,
  type NumericKeys,
  type TypeGuard,
  type Chainable,

  // Constants
  MILLISECONDS_PER_SECOND,
  MILLISECONDS_PER_MINUTE,
  MILLISECONDS_PER_HOUR,
  MILLISECONDS_PER_DAY,
  MILLISECONDS_PER_WEEK,
  MILLISECONDS_PER_MONTH,
  MILLISECONDS_PER_YEAR,
  SECONDS_PER_MINUTE,
  MINUTES_PER_HOUR,
  HOURS_PER_DAY,
  DAYS_PER_WEEK,
  MONTHS_PER_YEAR,
  DAYS_PER_YEAR,
  DAYS_PER_LEAP_YEAR,
  AVERAGE_DAYS_PER_MONTH,
  AVERAGE_DAYS_PER_YEAR,
} from './types';

// ============================================================================
// Utilities
// ============================================================================

export {
  // Type Guards
  isDate,
  isValidDateInput,
  isChronosLike,
  isDuration,
  isISODuration,
  isLeapYear,
  isValidDate,

  // Unit Utilities
  normalizeUnit,
  pluralizeUnit,
  getMillisecondsPerUnit,

  // Date Utilities
  getDaysInMonth,
  getDaysInYear,
  getDayOfYear,
  getISOWeek,
  getISOWeekYear,
  getQuarter,
  startOf,
  endOf,

  // Arithmetic
  addDuration,
  subtractDuration,
  addUnits,
  diffInUnits,

  // Parsing
  parseISODuration,
  durationToISO,

  // Comparison
  compareAtGranularity,
  isSameAt,

  // Helpers
  cloneDate,
  clamp,
  ordinalSuffix,
  padStart,
} from './utils';

// ============================================================================
// Locales
// ============================================================================

export {
  getLocale,
  registerLocale,
  getAvailableLocales,
  defaultLocale,
  en,
  es,
  fr,
  de,
  ja,
  zh,
  pt,
  it,
  ar,
  ru,
} from './locales';

// ============================================================================
// Default Export
// ============================================================================

// Export Chronos as default for convenience
export { Chronos as default } from './core';
