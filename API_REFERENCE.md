# API Reference

This document provides a comprehensive reference for the Chronos-ts library.

## Table of Contents

- [Chronos](#chronos)
  - [Creation & Parsing](#creation--parsing)
  - [Getters](#getters)
  - [Setters](#setters)
  - [Manipulation](#manipulation)
  - [Comparison](#comparison)
  - [Difference](#difference)
  - [Formatting](#formatting)
  - [Timezones](#timezones)
- [ChronosInterval](#chronosinterval)
  - [Creation](#creation)
  - [Properties](#properties)
  - [Arithmetic](#arithmetic)
  - [Conversion](#conversion)
- [ChronosPeriod](#chronosperiod)
  - [Creation](#creation-1)
  - [Configuration](#configuration)
  - [Filtering](#filtering)
  - [Iteration](#iteration)
  - [Set Operations](#set-operations)
- [ChronosPeriodCollection](#chronosperiodcollection)
  - [Creation](#creation-2)
  - [Analysis](#analysis)
  - [Set Operations](#set-operations-1)
- [ChronosTimezone](#chronostimezone)

---

## Chronos

The core class for date and time manipulation. Instances are immutable.

### Creation & Parsing

#### `Chronos.now(timezone?: string): Chronos`
Creates a Chronos instance for the current date and time.

#### `Chronos.create(year: number, month: number, date?: number, ...): Chronos`
Creates a Chronos instance from specific components. Month is 1-indexed (1=January).

#### `Chronos.parse(input?: DateInput, timezone?: string): Chronos`
Parses a date from various inputs (Date object, timestamp, ISO string, or supported date string). The optional second argument is a **timezone**, not a format. To parse a custom format string, use `Chronos.fromFormat`.

#### `Chronos.fromFormat(input: string, format: string, timezone?: string): Chronos`
Parses a date string using an explicit format pattern (e.g. `Chronos.fromFormat('15-01-2024', 'DD-MM-YYYY')`).

#### `Chronos.fromUnix(timestamp: number): Chronos`
Creates a Chronos instance from a Unix timestamp (seconds).

#### `Chronos.today(timezone?: string): Chronos`
Creates a Chronos instance for the current date at midnight (00:00:00).

#### `Chronos.tomorrow(timezone?: string): Chronos`
Creates a Chronos instance for tomorrow at midnight.

#### `Chronos.yesterday(timezone?: string): Chronos`
Creates a Chronos instance for yesterday at midnight.

### Getters

- `year`: The year (e.g., 2024)
- `month`: The month (1-12)
- `date`: The day of the month (1-31)
- `day`: Alias for `date`
- `hour`: The hour (0-23)
- `minute`: The minute (0-59)
- `second`: The second (0-59)
- `millisecond`: The millisecond (0-999)
- `dayOfWeek`: The day of the week (0=Sunday, 6=Saturday)
- `dayOfYear`: The day of the year (1-366)
- `week`: The ISO week number
- `quarter`: The quarter of the year (1-4)
- `daysInMonth`: Number of days in the current month
- `isLeapYear`: Boolean indicating if it's a leap year
- `unix`: Unix timestamp in seconds
- `timestamp`: Unix timestamp in milliseconds

### Day Checks

These are **methods** (call with `()`), not getters.

- `isWeekend()`: True if Saturday or Sunday
- `isWeekday()`: True if Monday–Friday
- `isToday()`, `isTomorrow()`, `isYesterday()`
- `isPast()`, `isFuture()`
- `isSunday()` … `isSaturday()`

### Setters

All setters return a **new** Chronos instance.

- `setYear(value: number)`
- `setMonth(value: number)`
- `setDate(value: number)`
- `setHour(value: number)`
- `setMinute(value: number)`
- `setSecond(value: number)`
- `setMillisecond(value: number)`
- `set(values: DateTimeSetter)`: Set multiple components at once.

### Manipulation

All manipulation methods return a **new** Chronos instance.

#### Addition
- `add(amount: number, unit: TimeUnit)`
- `add(duration: Duration)`
- `addYears(amount: number)`
- `addMonths(amount: number)`
- `addWeeks(amount: number)`
- `addDays(amount: number)`
- `addHours(amount: number)`
- `addMinutes(amount: number)`
- `addSeconds(amount: number)`
- `addMilliseconds(amount: number)`

#### Subtraction
- `subtract(amount: number, unit: TimeUnit)`
- `subtract(duration: Duration)`
- `subtractYears(amount: number)`
- `subtractMonths(amount: number)`
- `subtractWeeks(amount: number)`
- `subtractDays(amount: number)`
- `subtractHours(amount: number)`
- `subtractMinutes(amount: number)`
- `subtractSeconds(amount: number)`
- `subtractMilliseconds(amount: number)`

#### Boundaries
- `startOf(unit: TimeUnit)`: Set to the start of a unit (e.g., start of month).
- `endOf(unit: TimeUnit)`: Set to the end of a unit (e.g., end of day).

### Comparison

- `isBefore(other: DateInput)`
- `isAfter(other: DateInput)`
- `isSame(other: DateInput, unit?: TimeUnit)`
- `isSameOrBefore(other: DateInput)`
- `isSameOrAfter(other: DateInput)`
- `isBetween(start: DateInput, end: DateInput, unit?: TimeUnit, inclusivity?: string)`

### Difference

- `diff(other: DateInput, unit?: TimeUnit, precise?: boolean)`: Get difference in specified unit.
- `diffDetailed(other: DateInput)`: Get a full breakdown (years, months, …, milliseconds).

#### Human-readable

- `fromNow(options?)`: Relative time from now (e.g., "2 days ago"). `options.short` gives `"2d ago"`.
- `from(other, options?)`: Relative time from another date.
- `to(other, options?)` / `toNow(options?)`: Relative time to another date / to now.

### Formatting

- `format(formatString: string)`: Format the date using a string pattern.
- `toISOString()`: ISO 8601 string.
- `toDate()`: Convert to native JavaScript Date object.
- `toString()`: String representation.

### Timezones

- `toTimezone(timezone: string)`: Return a new instance associated with the given timezone (keeps the same underlying instant; getters and `format` render in the new zone).

> Note: there is no `setTimezone` method on `Chronos`.

---

## ChronosInterval

Represents a duration of time (e.g., "2 days and 5 hours").

### Creation

#### `ChronosInterval.create(duration: Duration)`
Creates an interval from a duration object.

#### `ChronosInterval.fromISO(isoString: string)`
Creates an interval from an ISO 8601 duration string (e.g., "P1Y2M").

#### `ChronosInterval.between(start: DateInput, end: DateInput)`
Creates an interval representing the difference between two dates.

#### Static Factories
- `ChronosInterval.years(amount: number)`
- `ChronosInterval.months(amount: number)`
- `ChronosInterval.weeks(amount: number)`
- `ChronosInterval.days(amount: number)`
- `ChronosInterval.hours(amount: number)`
- `ChronosInterval.minutes(amount: number)`
- `ChronosInterval.seconds(amount: number)`
- `ChronosInterval.milliseconds(amount: number)`

### Properties

- `years`, `months`, `weeks`, `days`, `hours`, `minutes`, `seconds`, `milliseconds`

### Arithmetic

- `add(other: ChronosInterval)`: Add another interval.
- `subtract(other: ChronosInterval)`: Subtract another interval.
- `multiply(factor: number)`: Multiply the interval.
- `divide(divisor: number)`: Divide the interval.
- `negate()`: Flip the sign of the interval (positive ↔ negative).
- `abs()`: Absolute (always-positive) interval.

### Conversion

- `totalDays()`: Approximate total days.
- `totalHours()`: Approximate total hours.
- `totalMinutes()`: Approximate total minutes.
- `totalSeconds()`: Approximate total seconds.
- `toDuration()`: Convert to a plain Duration object.
- `toISO()`: Convert to ISO 8601 duration string.
- `forHumans()`: Human-readable string (e.g., "1 year 2 months").

---

## ChronosPeriod

Represents a range of time or a recurring schedule.

### Creation

#### `ChronosPeriod.create(start: DateInput, end: DateInput, interval?: Duration)`
Creates a period between two dates.

#### `ChronosPeriod.recur(start: DateInput, interval?: Duration)`
Creates an unbounded recurring period.

#### Static Factories
- `ChronosPeriod.thisWeek()`, `ChronosPeriod.thisMonth()`, `ChronosPeriod.thisYear()`
- `ChronosPeriod.month(year, month)`
- `ChronosPeriod.year(year)`

### Configuration

- `setInterval(interval: Duration)`: Set the iteration interval.
- `times(count: number)`: Limit the number of recurrences.
- `excludeStart()`: Exclude the start date from iteration.
- `excludeEnd()`: Exclude the end date from iteration.

### Filtering

- `filter(callback: (date: Chronos) => boolean)`: Filter dates in the period.
- `filterWeekdays()`: Only include weekdays.
- `filterWeekends()`: Only include weekends.
- `skip(dates: DateInput[])`: Skip specific dates.

### Iteration

- `[Symbol.iterator]`: Iterate using `for...of`.
- `toArray()`: Convert to an array of Chronos instances.
- `count()`: Get the number of dates in the period.
- `first()`: Get the first date.
- `last()`: Get the last date.
- `contains(date: DateInput)`: Check if a date is within the period.

### Set Operations

- `overlaps(other: ChronosPeriod)`: Check if periods overlap.
- `intersect(other: ChronosPeriod)`: Get the intersection of two periods.
- `union(other: ChronosPeriod)`: Get the union of two periods (if they overlap/touch).
- `diff(other: ChronosPeriod)`: Get the difference (subtraction) of two periods.
- `splitBy(interval: Duration)`: Split the period into smaller chunks.

---

## ChronosPeriodCollection

Manages a collection of `ChronosPeriod` objects.

### Creation

#### `new ChronosPeriodCollection(periods: ChronosPeriod[])`
Creates a new collection.

### Analysis

- `overlaps(period: ChronosPeriod)`: Check if any period in the collection overlaps with the given period.
- `overlapAll()`: Find all overlaps within the collection (returns a new collection of overlaps).
- `gaps()`: Find gaps between periods in the collection.
- `boundaries()`: Get the period spanning from the earliest start to the latest end.
- `totalDays()`: Get the total duration of all periods (summed).

### Set Operations

- `add(period: ChronosPeriod)`: Add a period to the collection.
- `subtract(period: ChronosPeriod)`: Subtract a period from all periods in the collection.
- `subtractAll(periods: ChronosPeriod[])`: Subtract multiple periods.
- `intersect(period: ChronosPeriod)`: Intersect the collection with a period.
- `union()`: Merge overlapping/adjacent periods in the collection.

---

## ChronosTimezone

Utilities for timezone handling.

### Static

- `ChronosTimezone.create(timezone: string)`: Create a timezone instance.
- `ChronosTimezone.convert(date: Date, fromTz: string, toTz: string)`: Convert a date between timezones.
- `ChronosTimezone.utc()`, `ChronosTimezone.local()`, `ChronosTimezone.fromOffset(hours: number)`.

### Instance

- `getOffsetMinutes(date?: Date)`: Offset from UTC in minutes.
- `getOffset(date?: Date)`: Offset info object `{ minutes, hours, string }`.
- `getOffsetString(date?: Date)`: Offset as a string (e.g. `+05:30`).
- `isDST(date?: Date)`: Whether DST is active for the given date.
- `getComponents(date: Date)`: Date/time components in this timezone.
