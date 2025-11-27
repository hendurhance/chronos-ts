/**
 * Core type definitions for Chronos
 * @module types
 */

// ============================================================================
// Time Unit Types
// ============================================================================

/**
 * All supported time units in the library
 */
export type TimeUnit =
  | 'millisecond'
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'
  | 'decade'
  | 'century'
  | 'millennium';

/**
 * Plural forms of time units
 */
export type TimeUnitPlural =
  | 'milliseconds'
  | 'seconds'
  | 'minutes'
  | 'hours'
  | 'days'
  | 'weeks'
  | 'months'
  | 'quarters'
  | 'years'
  | 'decades'
  | 'centuries'
  | 'millennia';

/**
 * Short forms of time units
 */
export type TimeUnitShort =
  | 'ms'
  | 's'
  | 'm'
  | 'h'
  | 'd'
  | 'w'
  | 'M'
  | 'Q'
  | 'y';

/**
 * Combined time unit type accepting any form
 */
export type AnyTimeUnit = TimeUnit | TimeUnitPlural | TimeUnitShort;

// ============================================================================
// Day of Week Types
// ============================================================================

/**
 * Days of the week (0 = Sunday, 6 = Saturday)
 */
export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

/**
 * Months of the year (1 = January, 12 = December)
 */
export enum Month {
  January = 1,
  February = 2,
  March = 3,
  April = 4,
  May = 5,
  June = 6,
  July = 7,
  August = 8,
  September = 9,
  October = 10,
  November = 11,
  December = 12,
}

// ============================================================================
// Date Input Types
// ============================================================================

/**
 * Valid input types that can be parsed into a Chronos instance
 */
export type DateInput = string | number | Date | ChronosLike | null | undefined;

/**
 * Interface for Chronos-like objects
 */
export interface ChronosLike {
  toDate(): Date;
  valueOf(): number;
}

/**
 * Object representing individual date/time components
 */
export interface DateTimeComponents {
  year?: number;
  month?: number; // 1-12
  day?: number; // 1-31
  hour?: number; // 0-23
  minute?: number; // 0-59
  second?: number; // 0-59
  millisecond?: number; // 0-999
}

/**
 * Object for setting date/time parts
 */
export interface DateTimeSetter {
  year?: number;
  month?: number;
  date?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
}

// ============================================================================
// Duration/Interval Types
// ============================================================================

/**
 * Duration object for intervals
 */
export interface Duration {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

/**
 * ISO 8601 duration string pattern
 */
export type ISODuration = string;

// ============================================================================
// Timezone Types
// ============================================================================

/**
 * Valid timezone input types
 */
export type TimezoneInput = string | number | TimezoneInfo;

/**
 * Timezone offset information
 */
export interface TimezoneOffset {
  /**
   * Offset in minutes from UTC
   */
  minutes: number;
  /**
   * Offset in hours from UTC
   */
  hours: number;
  /**
   * Offset as string (e.g., "+05:30", "-08:00")
   */
  string: string;
}

/**
 * DST transition information
 */
export interface DSTransition {
  /**
   * Date of the DST transition
   */
  date: Date;
  /**
   * Offset before transition (in minutes)
   */
  fromOffset: number;
  /**
   * Offset after transition (in minutes)
   */
  toOffset: number;
  /**
   * Whether this is the start of DST (spring forward)
   */
  isDSTStart: boolean;
}

/**
 * Timezone information object
 */
export interface TimezoneInfo {
  /**
   * IANA timezone identifier
   */
  identifier: string;
  /**
   * Display name of the timezone
   */
  name: string;
  /**
   * Timezone abbreviation (e.g., EST, PST)
   */
  abbreviation: string;
  /**
   * Current UTC offset
   */
  offset: TimezoneOffset;
  /**
   * Whether DST is currently in effect
   */
  isDST: boolean;
  /**
   * Whether this timezone observes DST
   */
  observesDST: boolean;
}

// ============================================================================
// Formatting Types
// ============================================================================

/**
 * Format token types for custom formatting
 */
export interface FormatTokens {
  [key: string]: ((date: Date) => string) | string;
}

/**
 * Predefined format presets
 */
export type FormatPreset =
  | 'date'
  | 'time'
  | 'datetime'
  | 'iso'
  | 'rfc2822'
  | 'rfc3339'
  | 'atom'
  | 'cookie'
  | 'rss'
  | 'w3c';

// ============================================================================
// Comparison Types
// ============================================================================

/**
 * Comparison operators
 */
export type CompareOperator = '<' | '<=' | '=' | '>=' | '>' | '!=';

/**
 * Comparison granularity options
 */
export type CompareGranularity = TimeUnit | 'default';

// ============================================================================
// Period Types
// ============================================================================

/**
 * Period options for iteration
 */
export interface PeriodOptions {
  /**
   * Exclude the start date from iteration
   */
  excludeStart?: boolean;
  /**
   * Exclude the end date from iteration
   */
  excludeEnd?: boolean;
  /**
   * Maximum number of iterations
   */
  recurrences?: number;
  /**
   * Whether period modifications return new instances
   */
  immutable?: boolean;
}

/**
 * Period boundary options
 */
export enum PeriodBoundary {
  Open = 'open',
  Closed = 'closed',
  OpenStart = 'openStart',
  OpenEnd = 'openEnd',
}

// ============================================================================
// Locale Types
// ============================================================================

/**
 * Locale configuration
 */
export interface LocaleConfig {
  code: string;
  months: string[];
  monthsShort: string[];
  weekdays: string[];
  weekdaysShort: string[];
  weekdaysMin: string[];
  ordinal: (n: number) => string;
  formats: {
    LT: string;
    LTS: string;
    L: string;
    LL: string;
    LLL: string;
    LLLL: string;
    l?: string;
    ll?: string;
    lll?: string;
    llll?: string;
  };
  relativeTime: {
    future: string;
    past: string;
    s: string;
    ss: string;
    m: string;
    mm: string;
    h: string;
    hh: string;
    d: string;
    dd: string;
    w?: string;
    ww?: string;
    M: string;
    MM: string;
    y: string;
    yy: string;
  };
  meridiem?: (hour: number, minute: number, isLowercase: boolean) => string;
  week?: {
    dow: number; // Day of week start (0 = Sunday)
    doy: number; // Day of year for first week
  };
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Global configuration options
 */
export interface ChronosConfig {
  /**
   * Default timezone
   */
  timezone?: string;
  /**
   * Default locale
   */
  locale?: string;
  /**
   * First day of week (0 = Sunday, 1 = Monday, etc.)
   */
  weekStartsOn?: DayOfWeek;
  /**
   * First week of year contains this date
   */
  firstWeekContainsDate?: 1 | 4;
  /**
   * Strict parsing mode
   */
  strict?: boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Makes all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extract numeric keys from an object type
 */
export type NumericKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

/**
 * Type guard result
 */
export type TypeGuard<T> = (value: unknown) => value is T;

/**
 * Chainable method return type
 */
export type Chainable<T> = T & { clone(): T };

// ============================================================================
// Human Readable Types
// ============================================================================

/**
 * Options for human-readable difference output
 */
export interface HumanDiffOptions {
  /**
   * Use short form (1d vs 1 day)
   */
  short?: boolean;
  /**
   * Number of units to include
   */
  parts?: number;
  /**
   * Use absolute value
   */
  absolute?: boolean;
  /**
   * Separator between parts
   */
  separator?: string;
  /**
   * Conjunction for last part
   */
  conjunction?: string;
  /**
   * Include numeric suffix (st, nd, rd, th)
   */
  ordinal?: boolean;
}

/**
 * Diff result with all units
 */
export interface DiffResult {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  totalMilliseconds: number;
}

// ============================================================================
// Serialization Types
// ============================================================================

/**
 * Serializable representation of a Chronos instance
 */
export interface ChronosSerializable {
  timestamp: number;
  timezone: string;
  offset: number;
}

/**
 * JSON representation
 */
export interface ChronosJSON {
  iso: string;
  timestamp: number;
  timezone: string;
}

// ============================================================================
// Range Types
// ============================================================================

/**
 * Represents a time range/span
 */
export interface TimeRange {
  start: Date;
  end: Date;
}

/**
 * Business hours configuration
 */
export interface BusinessHours {
  open: { hour: number; minute: number };
  close: { hour: number; minute: number };
  days: DayOfWeek[];
  holidays?: Date[];
}

// ============================================================================
// Calendar Types
// ============================================================================

/**
 * Calendar week representation
 */
export interface CalendarWeek {
  weekNumber: number;
  year: number;
  days: Date[];
}

/**
 * Calendar month representation
 */
export interface CalendarMonth {
  year: number;
  month: number;
  weeks: CalendarWeek[];
}

// ============================================================================
// Constants
// ============================================================================

export const MILLISECONDS_PER_SECOND = 1000;
export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const DAYS_PER_WEEK = 7;
export const MONTHS_PER_YEAR = 12;
export const DAYS_PER_YEAR = 365;
export const DAYS_PER_LEAP_YEAR = 366;

export const MILLISECONDS_PER_MINUTE =
  MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE;
export const MILLISECONDS_PER_HOUR = MILLISECONDS_PER_MINUTE * MINUTES_PER_HOUR;
export const MILLISECONDS_PER_DAY = MILLISECONDS_PER_HOUR * HOURS_PER_DAY;
export const MILLISECONDS_PER_WEEK = MILLISECONDS_PER_DAY * DAYS_PER_WEEK;

// Average values for variable-length units
export const AVERAGE_DAYS_PER_MONTH = 30.436875;
export const AVERAGE_DAYS_PER_YEAR = 365.2425;
export const MILLISECONDS_PER_MONTH =
  MILLISECONDS_PER_DAY * AVERAGE_DAYS_PER_MONTH;
export const MILLISECONDS_PER_YEAR =
  MILLISECONDS_PER_DAY * AVERAGE_DAYS_PER_YEAR;
