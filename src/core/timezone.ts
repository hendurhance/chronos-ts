/**
 * ChronosTimezone - Timezone handling and conversions
 * @module ChronosTimezone
 */

import { TimezoneInfo, TimezoneOffset, DSTransition } from '../types';

// ============================================================================
// Formatter Cache
// ============================================================================

/**
 * `Intl.DateTimeFormat` construction dominates the cost of every zone-aware
 * read, and the zone-aware paths build one per call. Formatters are immutable
 * once constructed, so they are shared per (option-set, timezone). The key
 * space is bounded by the number of timezones actually used.
 */
const FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();

function cachedFormatter(
  shape: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${shape}|${timeZone}`;
  let formatter = FORMATTER_CACHE.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', { ...options, timeZone });
    FORMATTER_CACHE.set(key, formatter);
  }
  return formatter;
}

// ============================================================================
// Timezone Data
// ============================================================================

/**
 * Common timezone identifiers
 */
export const TIMEZONES = {
  // UTC
  UTC: 'UTC',
  GMT: 'GMT',

  // Americas
  'America/New_York': 'America/New_York',
  'America/Chicago': 'America/Chicago',
  'America/Denver': 'America/Denver',
  'America/Los_Angeles': 'America/Los_Angeles',
  'America/Phoenix': 'America/Phoenix',
  'America/Anchorage': 'America/Anchorage',
  'America/Toronto': 'America/Toronto',
  'America/Vancouver': 'America/Vancouver',
  'America/Mexico_City': 'America/Mexico_City',
  'America/Sao_Paulo': 'America/Sao_Paulo',
  'America/Buenos_Aires': 'America/Buenos_Aires',
  'America/Lima': 'America/Lima',
  'America/Bogota': 'America/Bogota',

  // Europe
  'Europe/London': 'Europe/London',
  'Europe/Paris': 'Europe/Paris',
  'Europe/Berlin': 'Europe/Berlin',
  'Europe/Madrid': 'Europe/Madrid',
  'Europe/Rome': 'Europe/Rome',
  'Europe/Amsterdam': 'Europe/Amsterdam',
  'Europe/Brussels': 'Europe/Brussels',
  'Europe/Vienna': 'Europe/Vienna',
  'Europe/Warsaw': 'Europe/Warsaw',
  'Europe/Prague': 'Europe/Prague',
  'Europe/Moscow': 'Europe/Moscow',
  'Europe/Istanbul': 'Europe/Istanbul',
  'Europe/Athens': 'Europe/Athens',
  'Europe/Helsinki': 'Europe/Helsinki',
  'Europe/Stockholm': 'Europe/Stockholm',
  'Europe/Oslo': 'Europe/Oslo',
  'Europe/Copenhagen': 'Europe/Copenhagen',
  'Europe/Dublin': 'Europe/Dublin',
  'Europe/Zurich': 'Europe/Zurich',

  // Asia
  'Asia/Tokyo': 'Asia/Tokyo',
  'Asia/Shanghai': 'Asia/Shanghai',
  'Asia/Hong_Kong': 'Asia/Hong_Kong',
  'Asia/Singapore': 'Asia/Singapore',
  'Asia/Seoul': 'Asia/Seoul',
  'Asia/Taipei': 'Asia/Taipei',
  'Asia/Bangkok': 'Asia/Bangkok',
  'Asia/Jakarta': 'Asia/Jakarta',
  'Asia/Manila': 'Asia/Manila',
  'Asia/Kuala_Lumpur': 'Asia/Kuala_Lumpur',
  'Asia/Ho_Chi_Minh': 'Asia/Ho_Chi_Minh',
  'Asia/Dubai': 'Asia/Dubai',
  'Asia/Kolkata': 'Asia/Kolkata',
  'Asia/Mumbai': 'Asia/Mumbai',
  'Asia/Karachi': 'Asia/Karachi',
  'Asia/Dhaka': 'Asia/Dhaka',
  'Asia/Tehran': 'Asia/Tehran',
  'Asia/Riyadh': 'Asia/Riyadh',
  'Asia/Jerusalem': 'Asia/Jerusalem',

  // Australia/Pacific
  'Australia/Sydney': 'Australia/Sydney',
  'Australia/Melbourne': 'Australia/Melbourne',
  'Australia/Brisbane': 'Australia/Brisbane',
  'Australia/Perth': 'Australia/Perth',
  'Australia/Adelaide': 'Australia/Adelaide',
  'Pacific/Auckland': 'Pacific/Auckland',
  'Pacific/Fiji': 'Pacific/Fiji',
  'Pacific/Honolulu': 'Pacific/Honolulu',

  // Africa
  'Africa/Cairo': 'Africa/Cairo',
  'Africa/Johannesburg': 'Africa/Johannesburg',
  'Africa/Lagos': 'Africa/Lagos',
  'Africa/Nairobi': 'Africa/Nairobi',
  'Africa/Casablanca': 'Africa/Casablanca',
} as const;

export type TimezoneId = keyof typeof TIMEZONES | string;

// ============================================================================
// ChronosTimezone Class
// ============================================================================

/**
 * ChronosTimezone - Handles timezone operations and conversions
 *
 * This class provides comprehensive timezone handling including:
 * - Timezone information retrieval
 * - Offset calculations
 * - DST detection
 * - Timezone conversions
 *
 * @example
 * ```typescript
 * // Get timezone info
 * const tz = ChronosTimezone.create('America/New_York');
 * console.log(tz.offset); // -5 or -4 depending on DST
 *
 * // Check DST
 * console.log(tz.isDST(new Date())); // true/false
 *
 * // Convert between timezones
 * const utcDate = new Date();
 * const localDate = ChronosTimezone.convert(utcDate, 'UTC', 'America/New_York');
 * ```
 */
export class ChronosTimezone {
  private _identifier: string;
  private _originalOffset: string | null = null;
  private _extraMinutes: number = 0; // For non-whole-hour offsets like +05:30
  private _cachedOffset: number | null = null;
  private _cachedDate: Date | null = null;

  // ============================================================================
  // Constructor
  // ============================================================================

  /**
   * Create a new ChronosTimezone
   */
  constructor(identifier: TimezoneId = 'UTC') {
    const normalized = this._normalizeIdentifier(identifier);
    this._identifier = normalized.identifier;
    this._originalOffset = normalized.originalOffset;
    this._extraMinutes = normalized.extraMinutes;
  }

  /**
   * Normalize timezone identifier
   */
  private _normalizeIdentifier(identifier: string): {
    identifier: string;
    originalOffset: string | null;
    extraMinutes: number;
  } {
    // Handle UTC aliases
    if (
      identifier.toUpperCase() === 'Z' ||
      identifier.toUpperCase() === 'GMT'
    ) {
      return { identifier: 'UTC', originalOffset: null, extraMinutes: 0 };
    }

    // Handle offset strings like +05:30, -08:00
    if (/^[+-]\d{2}:\d{2}$/.test(identifier)) {
      // Store original offset and convert to Etc/GMT for internal use
      const offsetHours = this._parseOffsetString(identifier);
      const sign = offsetHours >= 0 ? 1 : -1;
      const absHours = Math.abs(offsetHours);
      const wholeHours = Math.floor(absHours);
      // Calculate extra minutes for non-whole-hour offsets (e.g., +05:30 has 30 extra minutes)
      const extraMinutes = Math.round((absHours - wholeHours) * 60) * sign;
      const etcGmt = `Etc/GMT${offsetHours >= 0 ? '-' : '+'}${wholeHours}`;
      return { identifier: etcGmt, originalOffset: identifier, extraMinutes };
    }

    return { identifier, originalOffset: null, extraMinutes: 0 };
  }

  /**
   * Parse offset string to hours
   */
  private _parseOffsetString(offset: string): number {
    const match = offset.match(/^([+-])(\d{2}):(\d{2})$/);
    if (!match) return 0;

    const sign = match[1] === '+' ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const minutes = parseInt(match[3], 10);

    return sign * (hours + minutes / 60);
  }

  // ============================================================================
  // Static Factory Methods
  // ============================================================================

  /**
   * Create a timezone instance
   */
  static create(identifier: TimezoneId = 'UTC'): ChronosTimezone {
    return new ChronosTimezone(identifier);
  }

  /**
   * Create UTC timezone
   */
  static utc(): ChronosTimezone {
    return new ChronosTimezone('UTC');
  }

  /**
   * Create timezone from local system timezone
   */
  static local(): ChronosTimezone {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return new ChronosTimezone(tz);
  }

  /**
   * Create timezone from offset in hours
   */
  static fromOffset(offsetHours: number): ChronosTimezone {
    const sign = offsetHours >= 0 ? '+' : '-';
    const absOffset = Math.abs(offsetHours);
    const hours = Math.floor(absOffset);
    const minutes = Math.round((absOffset - hours) * 60);
    const offsetString = `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    return new ChronosTimezone(offsetString);
  }

  /**
   * Get the local system timezone identifier
   */
  static localIdentifier(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  // ============================================================================
  // Getters
  // ============================================================================

  /**
   * Get timezone identifier
   * Returns the original offset string if created from an offset, otherwise returns the IANA identifier
   */
  get identifier(): string {
    return this._originalOffset ?? this._identifier;
  }

  /**
   * Get the internal IANA timezone identifier (used for Intl operations)
   */
  get ianaIdentifier(): string {
    return this._identifier;
  }

  /**
   * Get timezone name (alias for identifier)
   */
  get name(): string {
    return this._originalOffset ?? this._identifier;
  }

  /**
   * Get timezone abbreviation for a given date
   */
  getAbbreviation(date: Date = new Date()): string {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: this._identifier,
        timeZoneName: 'short',
      });
      const parts = formatter.formatToParts(date);
      const tzPart = parts.find((p) => p.type === 'timeZoneName');
      return tzPart?.value ?? this._identifier;
    } catch {
      return this._identifier;
    }
  }

  /**
   * Get full timezone name for a given date
   */
  getFullName(date: Date = new Date()): string {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: this._identifier,
        timeZoneName: 'long',
      });
      const parts = formatter.formatToParts(date);
      const tzPart = parts.find((p) => p.type === 'timeZoneName');
      return tzPart?.value ?? this._identifier;
    } catch {
      return this._identifier;
    }
  }

  // ============================================================================
  // Offset Calculations
  // ============================================================================

  /**
   * Get UTC offset in minutes for a given date
   */
  getOffsetMinutes(date: Date = new Date()): number {
    try {
      // Shared formatters for UTC and the target timezone
      const offsetOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      };
      const utcFormatter = cachedFormatter('offset', 'UTC', offsetOptions);
      const tzFormatter = cachedFormatter(
        'offset',
        this._identifier,
        offsetOptions,
      );

      const utcParts = this._parseIntlParts(utcFormatter.formatToParts(date));
      const tzParts = this._parseIntlParts(tzFormatter.formatToParts(date));

      const utcDate = new Date(
        Date.UTC(
          utcParts.year,
          utcParts.month - 1,
          utcParts.day,
          utcParts.hour,
          utcParts.minute,
        ),
      );

      const tzDate = new Date(
        Date.UTC(
          tzParts.year,
          tzParts.month - 1,
          tzParts.day,
          tzParts.hour,
          tzParts.minute,
        ),
      );

      // Add extra minutes for non-whole-hour offsets (e.g., +05:30)
      return (
        (tzDate.getTime() - utcDate.getTime()) / 60000 + this._extraMinutes
      );
    } catch {
      return this._extraMinutes;
    }
  }

  /**
   * Parse Intl formatter parts to components
   */
  private _parseIntlParts(parts: Intl.DateTimeFormatPart[]): {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  } {
    const result = { year: 0, month: 0, day: 0, hour: 0, minute: 0 };
    for (const part of parts) {
      switch (part.type) {
        case 'year':
          result.year = parseInt(part.value, 10);
          break;
        case 'month':
          result.month = parseInt(part.value, 10);
          break;
        case 'day':
          result.day = parseInt(part.value, 10);
          break;
        case 'hour':
          result.hour = parseInt(part.value, 10);
          break;
        case 'minute':
          result.minute = parseInt(part.value, 10);
          break;
      }
    }
    return result;
  }

  /**
   * Get UTC offset in hours for a given date
   */
  getOffsetHours(date: Date = new Date()): number {
    return this.getOffsetMinutes(date) / 60;
  }

  /**
   * Get UTC offset as string (e.g., "+05:30", "-08:00")
   */
  getOffsetString(date: Date = new Date()): string {
    const offsetMinutes = this.getOffsetMinutes(date);
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const absMinutes = Math.abs(offsetMinutes);
    const hours = Math.floor(absMinutes / 60);
    const minutes = absMinutes % 60;
    return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  /**
   * Get complete offset information
   */
  getOffset(date: Date = new Date()): TimezoneOffset {
    const minutes = this.getOffsetMinutes(date);
    return {
      minutes,
      hours: minutes / 60,
      string: this.getOffsetString(date),
    };
  }

  // ============================================================================
  // DST (Daylight Saving Time)
  // ============================================================================

  /**
   * Check if DST is in effect for a given date
   */
  isDST(date: Date = new Date()): boolean {
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);

    const janOffset = this.getOffsetMinutes(jan);
    const julOffset = this.getOffsetMinutes(jul);
    const currentOffset = this.getOffsetMinutes(date);

    // DST is in effect if current offset matches the larger offset
    const standardOffset = Math.min(janOffset, julOffset);
    return currentOffset !== standardOffset;
  }

  /**
   * Check if timezone observes DST
   */
  observesDST(): boolean {
    const currentYear = new Date().getFullYear();
    const jan = new Date(currentYear, 0, 15);
    const jul = new Date(currentYear, 6, 15);

    return this.getOffsetMinutes(jan) !== this.getOffsetMinutes(jul);
  }

  /**
   * Get the next DST transition
   */
  getNextDSTTransition(from: Date = new Date()): DSTransition | null {
    if (!this.observesDST()) {
      return null;
    }

    const currentOffset = this.getOffsetMinutes(from);
    const checkDate = new Date(from);

    // Search forward up to 1 year
    for (let i = 0; i < 366; i++) {
      checkDate.setDate(checkDate.getDate() + 1);
      const newOffset = this.getOffsetMinutes(checkDate);

      if (newOffset !== currentOffset) {
        // Found a transition, binary search for exact time
        const exactDate = this._findExactTransition(
          new Date(checkDate.getTime() - 24 * 60 * 60 * 1000),
          checkDate,
        );

        return {
          date: exactDate,
          fromOffset: currentOffset,
          toOffset: newOffset,
          isDSTStart: newOffset > currentOffset,
        };
      }
    }

    return null;
  }

  /**
   * Binary search to find exact DST transition time
   */
  private _findExactTransition(start: Date, end: Date): Date {
    const startOffset = this.getOffsetMinutes(start);

    while (end.getTime() - start.getTime() > 60000) {
      // Within 1 minute
      const mid = new Date((start.getTime() + end.getTime()) / 2);
      const midOffset = this.getOffsetMinutes(mid);

      if (midOffset === startOffset) {
        start = mid;
      } else {
        end = mid;
      }
    }

    return end;
  }

  // ============================================================================
  // Conversion
  // ============================================================================

  /**
   * Convert a date to this timezone (returns formatted string)
   */
  format(date: Date, formatOptions?: Intl.DateTimeFormatOptions): string {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: this._identifier,
      ...formatOptions,
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }

  /**
   * Get date components in this timezone
   */
  getComponents(date: Date): {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    dayOfWeek: number;
  } {
    const formatter = cachedFormatter('components', this._identifier, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      weekday: 'short',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const result = {
      year: 0,
      month: 0,
      day: 0,
      hour: 0,
      minute: 0,
      second: 0,
      dayOfWeek: 0,
    };

    const dayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };

    for (const part of parts) {
      switch (part.type) {
        case 'year':
          result.year = parseInt(part.value, 10);
          break;
        case 'month':
          result.month = parseInt(part.value, 10);
          break;
        case 'day':
          result.day = parseInt(part.value, 10);
          break;
        case 'hour':
          result.hour = parseInt(part.value, 10);
          break;
        case 'minute':
          result.minute = parseInt(part.value, 10);
          break;
        case 'second':
          result.second = parseInt(part.value, 10);
          break;
        case 'weekday':
          result.dayOfWeek = dayMap[part.value] ?? 0;
          break;
      }
    }

    return result;
  }

  /**
   * Convert a date from one timezone to another
   */
  static convert(date: Date, from: TimezoneId, to: TimezoneId): Date {
    const fromTz = new ChronosTimezone(from);
    const toTz = new ChronosTimezone(to);

    const fromOffset = fromTz.getOffsetMinutes(date);
    const toOffset = toTz.getOffsetMinutes(date);
    const diffMinutes = toOffset - fromOffset;

    return new Date(date.getTime() + diffMinutes * 60000);
  }

  /**
   * Convert a UTC date to this timezone
   */
  fromUTC(date: Date): Date {
    return ChronosTimezone.convert(date, 'UTC', this._identifier);
  }

  /**
   * Convert a date in this timezone to UTC
   */
  toUTC(date: Date): Date {
    return ChronosTimezone.convert(date, this._identifier, 'UTC');
  }

  // ============================================================================
  // Information
  // ============================================================================

  /**
   * Get comprehensive timezone information
   */
  getInfo(date: Date = new Date()): TimezoneInfo {
    return {
      identifier: this._originalOffset ?? this._identifier,
      abbreviation: this.getAbbreviation(date),
      name: this.getFullName(date),
      offset: this.getOffset(date),
      isDST: this.isDST(date),
      observesDST: this.observesDST(),
    };
  }

  /**
   * Check if two timezones are equivalent at a given moment
   */
  equals(other: ChronosTimezone | string, date: Date = new Date()): boolean {
    const otherTz =
      typeof other === 'string' ? new ChronosTimezone(other) : other;
    return this.getOffsetMinutes(date) === otherTz.getOffsetMinutes(date);
  }

  /**
   * Check if this is the same timezone identifier
   */
  isSame(other: ChronosTimezone | string): boolean {
    const otherIdentifier =
      typeof other === 'string' ? other : other.identifier;
    return this.identifier === otherIdentifier;
  }

  // ============================================================================
  // Static Utilities
  // ============================================================================

  /**
   * Get all available timezone identifiers
   * Note: This returns common timezones. Use Intl.supportedValuesOf('timeZone') for all.
   */
  static getAvailableTimezones(): string[] {
    // Try to use the native method if available
    if (typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl) {
      try {
        return (
          Intl as unknown as { supportedValuesOf: (key: string) => string[] }
        ).supportedValuesOf('timeZone');
      } catch {
        // Fall back to predefined list
      }
    }

    return Object.values(TIMEZONES);
  }

  /**
   * Check if a timezone identifier is valid
   */
  static isValid(identifier: string): boolean {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: identifier });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get timezones grouped by region
   */
  static getTimezonesByRegion(): Record<string, string[]> {
    const timezones = ChronosTimezone.getAvailableTimezones();
    const grouped: Record<string, string[]> = {};

    for (const tz of timezones) {
      const parts = tz.split('/');
      const region = parts[0];
      if (!grouped[region]) {
        grouped[region] = [];
      }
      grouped[region].push(tz);
    }

    return grouped;
  }

  /**
   * Find timezones that match a given offset
   */
  static findByOffset(
    offsetHours: number,
    date: Date = new Date(),
  ): ChronosTimezone[] {
    const targetMinutes = offsetHours * 60;
    const result: ChronosTimezone[] = [];

    for (const tz of ChronosTimezone.getAvailableTimezones()) {
      const timezone = new ChronosTimezone(tz);
      if (timezone.getOffsetMinutes(date) === targetMinutes) {
        result.push(timezone);
      }
    }

    return result;
  }

  /**
   * Get current time in a specific timezone
   */
  static now(identifier: TimezoneId): Date {
    const tz = new ChronosTimezone(identifier);
    return tz.fromUTC(new Date());
  }

  // ============================================================================
  // Serialization
  // ============================================================================

  /**
   * Convert to string
   */
  toString(): string {
    return this._originalOffset ?? this._identifier;
  }

  /**
   * Convert to JSON
   */
  toJSON(): object {
    const now = new Date();
    return {
      identifier: this._originalOffset ?? this._identifier,
      offset: this.getOffsetString(now),
      isDST: this.isDST(now),
      observesDST: this.observesDST(),
    };
  }

  /**
   * Get primitive value
   */
  valueOf(): string {
    return this._originalOffset ?? this._identifier;
  }
}

// ============================================================================
// Common Timezone Aliases
// ============================================================================

/**
 * Pre-created timezone instances for common timezones
 */
export const Timezones = {
  UTC: ChronosTimezone.utc(),
  Local: ChronosTimezone.local(),

  // US
  Eastern: ChronosTimezone.create('America/New_York'),
  Central: ChronosTimezone.create('America/Chicago'),
  Mountain: ChronosTimezone.create('America/Denver'),
  Pacific: ChronosTimezone.create('America/Los_Angeles'),

  // Europe
  London: ChronosTimezone.create('Europe/London'),
  Paris: ChronosTimezone.create('Europe/Paris'),
  Berlin: ChronosTimezone.create('Europe/Berlin'),

  // Asia
  Tokyo: ChronosTimezone.create('Asia/Tokyo'),
  Shanghai: ChronosTimezone.create('Asia/Shanghai'),
  Singapore: ChronosTimezone.create('Asia/Singapore'),
  Dubai: ChronosTimezone.create('Asia/Dubai'),
  Mumbai: ChronosTimezone.create('Asia/Kolkata'),

  // Australia/Pacific
  Sydney: ChronosTimezone.create('Australia/Sydney'),
  Auckland: ChronosTimezone.create('Pacific/Auckland'),
} as const;
