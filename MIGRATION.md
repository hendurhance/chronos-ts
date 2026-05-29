# Migration Guide: v1.x to v2.0

This guide will help you migrate your codebase from Chronos-ts v1.x to v2.0. Version 2.0 is a complete rewrite with a new API inspired by [Carbon PHP](https://carbon.nesbot.com/), offering a more intuitive and powerful date manipulation experience.

## Table of Contents

- [Overview](#overview)
- [Breaking Changes Summary](#breaking-changes-summary)
- [New Imports](#new-imports)
- [Period Class Migration](#period-class-migration)
- [Interval Class Migration](#interval-class-migration)
- [Precision Enum Migration](#precision-enum-migration)
- [Utility Functions Migration](#utility-functions-migration)
- [New Features in v2.0](#new-features-in-v20)
- [Side-by-Side Examples](#side-by-side-examples)

---

## Overview

v2.0 introduces several major changes:

| Aspect | v1.x | v2.0 |
|--------|------|------|
| Core Date Class | None (used native `Date`) | `Chronos` class |
| Period Class | `Period` | `ChronosPeriod` (reimagined) |
| Interval Class | `Interval` | `ChronosInterval` (reimagined) |
| Precision | `Precision` enum | Built into methods |
| Mutability | Mutable by default | **Immutable by default** |
| Iteration | `getDatesInInterval()` | Native `for...of` iteration |
| Timezone Support | None | `ChronosTimezone` class |
| Localization | None | Built-in i18n support |

---

## Breaking Changes Summary

1. **Class Renaming**
   - `Period` → `ChronosPeriod`
   - `Interval` → `ChronosInterval`
   - New core class: `Chronos`

2. **API Paradigm Shift**
   - v1.x: Period-centric with native `Date` objects
   - v2.0: `Chronos` class as the foundation, with rich Period and Interval support

3. **Immutability**
   - v1.x: Methods like `setStart()`, `setEnd()` mutated the instance
   - v2.0: All manipulation methods return new instances

4. **Precision Handling**
   - v1.x: Explicit `Precision` enum passed to constructors
   - v2.0: Precision handled automatically or via method parameters

5. **Interval Representation**
   - v1.x: Intervals stored as minutes internally
   - v2.0: Intervals store individual components (years, months, days, etc.)

---

## New Imports

### v1.x Imports

```typescript
import { Period, Interval, Precision } from 'chronos-ts';
import { addToDate, subtractFromDate, formatDate } from 'chronos-ts';
```

### v2.0 Imports

```typescript
import { 
  Chronos,           // New! Core date class
  ChronosPeriod,     // Renamed from Period
  ChronosInterval,   // Renamed from Interval
  ChronosTimezone,   // New! Timezone support
} from 'chronos-ts';
```

---

## Period Class Migration

### Constructor

#### v1.x

```typescript
import { Period, Precision, Interval } from 'chronos-ts';

const period = new Period(
  '2023-01-01',
  '2023-12-31',
  Precision.DAY,
  Interval.weeks(1)
);
```

#### v2.0

```typescript
import { ChronosPeriod } from 'chronos-ts';

// Basic creation
const period = ChronosPeriod.create('2024-01-01', '2024-12-31');

// With interval
const periodWithInterval = ChronosPeriod.create(
  '2024-01-01', 
  '2024-12-31', 
  { weeks: 1 }
);

// Or use static factories
const thisMonth = ChronosPeriod.thisMonth();
const thisYear = ChronosPeriod.thisYear();
```

### Getting Dates

#### v1.x

```typescript
const startDate = period.getStartDate();  // Returns Date
const endDate = period.getEndDate();      // Returns Date
```

#### v2.0

```typescript
const start = period.start;  // Returns Chronos instance
const end = period.end;      // Returns Chronos instance

// To get native Date:
const startDate = period.start.toDate();
const endDate = period.end.toDate();
```

### Fluent Setters

#### v1.x (Mutable)

```typescript
// WARNING: Mutates the original instance
period.setStart('2023-02-01');
period.setEnd('2023-11-30');
period.setPrecision(Precision.MONTH);
period.setInterval(Interval.months(1));
```

#### v2.0 (Immutable)

```typescript
// Returns NEW instances - original unchanged
const newPeriod = period
  .setStart('2024-02-01')
  .setEnd('2024-11-30')
  .setInterval({ months: 1 });
```

### Checking Contains

#### v1.x

```typescript
const isContained = period.contains('2023-06-15');  // boolean
```

#### v2.0

```typescript
const isContained = period.contains('2024-06-15');  // boolean
// Also accepts Chronos instances
const isContained = period.contains(Chronos.now());
```

### Period Overlap

#### v1.x

```typescript
const overlaps = period1.overlapsWith(period2);     // boolean
const overlap = period1.overlap(period2);            // Period | null
```

#### v2.0

```typescript
const overlaps = period1.overlaps(period2);          // boolean
const intersection = period1.intersect(period2);     // ChronosPeriod | null
```

### Getting Duration Information

#### v1.x

```typescript
period.getMinutesInInterval();
period.getHoursInInterval();
period.getDaysInInterval();
period.getWeeksInInterval();
period.getMonthsInInterval();
period.getYearsInInterval();
period.length();  // In precision units
```

#### v2.0

```typescript
period.days();        // Number of days
period.weeks();       // Number of weeks
period.monthCount();  // Number of months
period.count();       // Number of iteration steps
period.duration();    // Returns ChronosInterval
```

### Iterating Over Dates

#### v1.x

```typescript
const interval = Interval.days(1);
period.setInterval(interval);
const dates = period.getDatesInInterval();  // Date[] | null

if (dates) {
  dates.forEach(date => console.log(date));
}
```

#### v2.0

```typescript
// Native iteration - no need to call methods
for (const date of period) {
  console.log(date.format('YYYY-MM-DD'));
}

// Or convert to array
const dates = period.toArray();  // Chronos[]

// With custom interval
const weeklyPeriod = period.setInterval({ days: 7 });
for (const date of weeklyPeriod) {
  console.log(date.format('YYYY-MM-DD'));
}
```

### Period Operations

#### v1.x

```typescript
const subtracted = period1.subtract(period2);           // Period[]
const gap = period1.gap(period2);                       // Period | null
const symDiff = period1.symmetricDifference(period2);   // Period[]
const renewed = period.renew();                         // Period
const union = period1.union(period2);                   // Period[]
const isAdjacent = period1.isAdjacentTo(period2);       // boolean
```

#### v2.0

```typescript
// Many operations now available via ChronosPeriodCollection
import { ChronosPeriodCollection } from 'chronos-ts';

// Single period operations
const overlaps = period1.overlaps(period2);             // boolean
const intersection = period1.intersect(period2);        // ChronosPeriod | null

// Collection operations
const collection = new ChronosPeriodCollection([period1, period2]);
const adjacent = collection.touchesWith(period2);       // boolean (adjacency)
const gaps = collection.gaps();                         // ChronosPeriodCollection
const merged = collection.union();                      // ChronosPeriodCollection
const overlapping = collection.overlapAll();            // ChronosPeriodCollection
```

---

## Interval Class Migration

### Creation

#### v1.x

```typescript
import { Interval } from 'chronos-ts';

const minutes = Interval.minutes(30);
const hours = Interval.hours(2);
const days = Interval.days(5);
const weeks = Interval.weeks(1);
const months = Interval.months(3);

// Get total minutes
const totalMinutes = hours.getMinutesInterval();  // 120
```

#### v2.0

```typescript
import { ChronosInterval } from 'chronos-ts';

// Static factories
const minutes = ChronosInterval.minutes(30);
const hours = ChronosInterval.hours(2);
const days = ChronosInterval.days(5);
const weeks = ChronosInterval.weeks(1);
const months = ChronosInterval.months(3);
const years = ChronosInterval.years(1);  // New!

// From object
const interval = ChronosInterval.create({ 
  days: 5, 
  hours: 3, 
  minutes: 30 
});

// From ISO 8601 duration
const fromISO = ChronosInterval.fromISO('P1Y2M3DT4H5M6S');

// Get totals
const totalHours = hours.totalHours();
const totalDays = days.totalDays();
```

### Interval Properties

#### v1.x

```typescript
// Only had getMinutesInterval()
const minutes = interval.getMinutesInterval();
```

#### v2.0

```typescript
// Access individual components
interval.years;
interval.months;
interval.weeks;
interval.days;
interval.hours;
interval.minutes;
interval.seconds;
interval.milliseconds;

// Total conversions
interval.totalSeconds();
interval.totalMinutes();
interval.totalHours();
interval.totalDays();
```

### Interval Arithmetic

#### v1.x

Not supported.

#### v2.0

```typescript
const interval1 = ChronosInterval.hours(2);
const interval2 = ChronosInterval.minutes(30);

const sum = interval1.add(interval2);       // 2h 30m
const diff = interval1.subtract(interval2); // 1h 30m
const doubled = interval1.multiply(2);      // 4h
const halved = interval1.divide(2);         // 1h

// Human-readable
console.log(sum.forHumans());  // "2 hours 30 minutes"
console.log(sum.toISO());      // "PT2H30M"
```

---

## Precision Enum Migration

### v1.x

```typescript
import { Precision } from 'chronos-ts';

const period = new Period('2023-01-01', '2023-12-31', Precision.DAY);
period.setPrecision(Precision.MONTH);
```

### v2.0

Precision is no longer a separate enum. Instead, use time unit strings or duration objects:

```typescript
// Interval-based approach
const daily = ChronosPeriod.create(start, end, { days: 1 });
const weekly = ChronosPeriod.create(start, end, { weeks: 1 });
const monthly = ChronosPeriod.create(start, end, { months: 1 });

// Or use convenience methods
const daily = period.every(1, 'day');
const weekly = period.every(1, 'week');

// For date comparisons, use granularity
date1.isSame(date2, 'day');
date1.isSame(date2, 'month');
date1.isSame(date2, 'year');
```

---

## Utility Functions Migration

### Date Manipulation

#### v1.x

```typescript
import { addToDate, subtractFromDate, Precision } from 'chronos-ts';

const future = addToDate(new Date(), 3, Precision.MONTH);
const past = subtractFromDate(new Date(), 2, Precision.WEEK);
```

#### v2.0

```typescript
import { Chronos } from 'chronos-ts';

const future = Chronos.now().addMonths(3);
const past = Chronos.now().subtractWeeks(2);

// Or with duration objects
const future = Chronos.now().add({ months: 3 });
const past = Chronos.now().subtract({ weeks: 2 });
```

### Date Formatting

#### v1.x

```typescript
import { formatDate, parseDate } from 'chronos-ts';

const formatted = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');
const parsed = parseDate('2023-06-15 14:30:00', 'YYYY-MM-DD HH:mm:ss');
```

#### v2.0

```typescript
import { Chronos } from 'chronos-ts';

const formatted = Chronos.now().format('YYYY-MM-DD HH:mm:ss');
const parsed = Chronos.parse('2024-06-15T14:30:00');
```

### Date Queries

#### v1.x

```typescript
import { getWeekNumber, getQuarter, isLeapYear, getDaysInMonth, isSameDay } from 'chronos-ts';

const week = getWeekNumber(new Date());
const quarter = getQuarter(new Date());
const leap = isLeapYear(2024);
const days = getDaysInMonth(2024, 2);
const same = isSameDay(date1, date2);
```

#### v2.0

```typescript
import { Chronos } from 'chronos-ts';

const date = Chronos.now();
const week = date.week;
const quarter = date.quarter;
const leap = date.isLeapYear;
const days = date.daysInMonth;
const same = date.isSame(otherDate, 'day');
```

---

## New Features in v2.0

### 1. Chronos Core Class

The main date/time manipulation class:

```typescript
import { Chronos } from 'chronos-ts';

const now = Chronos.now();
const today = Chronos.today();
const birthday = Chronos.create(1990, 6, 15);

// Rich manipulation
const future = now
  .addDays(5)
  .addHours(3)
  .startOf('day');

// Human-readable differences
console.log(birthday.fromNow());  // "34 years ago"
```

### 2. Timezone Support

```typescript
import { ChronosTimezone, Timezones } from 'chronos-ts';

const nyTime = Chronos.now('America/New_York');
const tokyoTime = nyTime.toTimezone('Asia/Tokyo');

// Timezone info
const tz = ChronosTimezone.create('America/New_York');
console.log(tz.getOffsetString());  // "-05:00"
```

### 3. Internationalization

```typescript
import { Chronos, registerLocale } from 'chronos-ts';

// Use built-in locales
const spanish = Chronos.now().locale('es');
console.log(spanish.format('dddd, D [de] MMMM [de] YYYY'));
// "viernes, 15 de marzo de 2024"

// Human-readable in locale
console.log(spanish.fromNow());  // "hace 2 días"
```

### 4. Period Collections

```typescript
import { ChronosPeriodCollection, ChronosPeriod } from 'chronos-ts';

const collection = new ChronosPeriodCollection([
  ChronosPeriod.create('2024-01-01', '2024-01-15'),
  ChronosPeriod.create('2024-01-10', '2024-01-25'),
  ChronosPeriod.create('2024-02-01', '2024-02-15'),
]);

// Find overlaps
const overlapping = collection.overlapAll();

// Get gaps between periods
const gaps = collection.gaps();

// Get boundaries
const boundaries = collection.boundaries();
```

### 5. Test Time Control

```typescript
import { Chronos } from 'chronos-ts';

// Freeze time for testing
Chronos.setTestNow(Chronos.create(2024, 1, 15, 12, 0, 0));

const now = Chronos.now();  // Always returns 2024-01-15 12:00:00

// Reset to real time
Chronos.setTestNow(null);
```

---

## Side-by-Side Examples

### Example 1: Employee Leave Management

#### v1.x

```typescript
import { Period, Precision } from 'chronos-ts';

const leaveRequest = new Period('2023-09-15', '2023-09-17', Precision.DAY);

const existingLeaves = [
  new Period('2023-09-10', '2023-09-14', Precision.DAY),
  new Period('2023-09-18', '2023-09-20', Precision.DAY),
];

const overlapping = existingLeaves.filter(leave => 
  leaveRequest.overlapsWith(leave)
);

const totalUsed = existingLeaves.reduce(
  (total, leave) => total + leave.length(), 
  0
);
```

#### v2.0

```typescript
import { ChronosPeriod, ChronosPeriodCollection } from 'chronos-ts';

const leaveRequest = ChronosPeriod.create('2024-09-15', '2024-09-17');

const existingLeaves = new ChronosPeriodCollection([
  ChronosPeriod.create('2024-09-10', '2024-09-14'),
  ChronosPeriod.create('2024-09-18', '2024-09-20'),
]);

// Check for overlaps
const hasConflict = existingLeaves.overlaps(leaveRequest);

// Calculate total used
const totalUsed = existingLeaves.totalDays();
```

### Example 2: Weekly Recurring Meetings

#### v1.x

```typescript
import { Period, Interval, Precision } from 'chronos-ts';

const meetingPeriod = new Period(
  '2023-01-01 10:00',
  '2023-12-31 11:00',
  Precision.HOUR,
  Interval.weeks(1)
);

const meetingDates = meetingPeriod.getDatesInInterval();
```

#### v2.0

```typescript
import { Chronos, ChronosPeriod } from 'chronos-ts';

const meetings = ChronosPeriod
  .create(
    Chronos.create(2024, 1, 1, 10, 0),
    Chronos.create(2024, 12, 31, 11, 0),
    { weeks: 1 }
  )
  .filter(date => date.dayOfWeek === 1);  // Mondays only

// Iterate directly
for (const meeting of meetings) {
  console.log(meeting.format('YYYY-MM-DD HH:mm'));
}
```

### Example 3: Subscription Renewal

#### v1.x

```typescript
import { Period, Precision, addToDate } from 'chronos-ts';

class Subscription {
  constructor(public startDate: Date, public plan: 'monthly' | 'annual') {}

  getCurrentPeriod(): Period {
    const endDate = addToDate(
      this.startDate, 
      1, 
      this.plan === 'monthly' ? Precision.MONTH : Precision.YEAR
    );
    return new Period(this.startDate, endDate, Precision.DAY);
  }

  isActive(date: Date = new Date()): boolean {
    return this.getCurrentPeriod().contains(date);
  }
}
```

#### v2.0

```typescript
import { Chronos, ChronosInterval } from 'chronos-ts';

class Subscription {
  constructor(
    public startDate: Chronos, 
    public interval: ChronosInterval
  ) {}

  get endDate(): Chronos {
    return this.startDate.add(this.interval);
  }

  isActive(): boolean {
    return Chronos.now().isBetween(this.startDate, this.endDate);
  }

  daysRemaining(): number {
    return this.endDate.diff(Chronos.now(), 'days');
  }
}

const monthly = new Subscription(
  Chronos.now(),
  ChronosInterval.months(1)
);
```

---

## Need Help?

If you encounter issues during migration:

1. Check the [API Reference](README.md#-api-reference) in the README
2. Open an [issue](https://github.com/hendurhance/chronos-ts/issues) on GitHub
3. Review the [test files](https://github.com/hendurhance/chronos-ts/tree/v2/test) for more examples

---

Happy migrating! 🚀
