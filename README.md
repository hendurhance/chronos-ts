# Chronos-ts ⏰

[![npm version](https://img.shields.io/npm/v/chronos-ts.svg)](https://www.npmjs.com/package/chronos-ts)
[![npm downloads](https://img.shields.io/npm/dt/chronos-ts.svg)](https://www.npmjs.com/package/chronos-ts)
[![tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](https://github.com/hendurhance/chronos-ts/actions)
[![build](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/hendurhance/chronos-ts/actions)
[![coverage](https://img.shields.io/badge/coverage-unknown-lightgrey.svg)](https://github.com/hendurhance/chronos-ts/actions)

**Chronos-ts** — named after the Greek god of time — is a comprehensive TypeScript library for date and time manipulation. Version 2.0 is a complete rewrite inspired by [Carbon PHP](https://carbon.nesbot.com/), bringing modern, intuitive date handling to TypeScript and JavaScript.

> [!WARNING]
> This is a major rewrite (v2.0) and is not backward compatible with v1.x. Please refer to the [migration guide](MIGRATION.md) for details.

## ✨ Features

- 🎯 **Intuitive API** — Fluent, chainable methods for all date operations
- 📅 **Immutable by Default** — All operations return new instances
- 🌍 **Timezone Support** — Built-in timezone handling with DST awareness
- 🌐 **Internationalization** — Extensible locale system with human-readable output
- ⏱️ **Intervals** — Powerful duration/interval handling (like CarbonInterval)
- 📆 **Periods** — Date range iteration with filtering and transformations
- 📋 **Period Collections** — Manage and analyze multiple date periods easily
- 📐 **Type-Safe** — Full TypeScript support with comprehensive types
- 🪶 **Zero Dependencies** — No external runtime dependencies

## 📦 Installation

```bash
npm install chronos-ts

# or
yarn add chronos-ts

# or
pnpm add chronos-ts
```

## 🚀 Quick Start

```typescript
import { Chronos, ChronosInterval, ChronosPeriod } from 'chronos-ts';

// Create dates
const now = Chronos.now();
const birthday = Chronos.create(1990, 6, 15);
const parsed = Chronos.parse('2024-03-15T10:30:00');

// Manipulate dates
const nextWeek = now.addWeeks(1);
const lastMonth = now.subtractMonths(1);
const startOfDay = now.startOf('day');

// Format dates
console.log(now.format('YYYY-MM-DD HH:mm:ss')); // "2024-03-15 14:30:45"
console.log(now.diffForHumans(birthday));        // "33 years ago"

// Work with intervals
const interval = ChronosInterval.create({ hours: 2, minutes: 30 });
console.log(interval.forHumans()); // "2 hours 30 minutes"

// Iterate over periods
const thisMonth = ChronosPeriod.thisMonth();
for (const day of thisMonth) {
  console.log(day.format('YYYY-MM-DD'));
}
```

## 📖 API Reference

### Chronos Class

The main class for date/time manipulation.

#### Factory Methods

```typescript
// Current moment
Chronos.now()
Chronos.today()
Chronos.tomorrow()
Chronos.yesterday()

// Create from components (month is 1-12)
Chronos.create(2024, 3, 15, 10, 30, 0)

// Parse from various formats
Chronos.parse('2024-03-15')
Chronos.parse(new Date())
Chronos.parse(1710505800000) // Unix timestamp in ms

// Parse with specific format
Chronos.fromFormat('15-03-2024', 'DD-MM-YYYY')

// From Unix timestamp
Chronos.fromUnix(1710505800)

// Get earliest/latest
Chronos.earliest(date1, date2, date3)
Chronos.latest(date1, date2, date3)
```

#### Getters

```typescript
const date = Chronos.create(2024, 3, 15, 14, 30, 45);

date.year           // 2024
date.month          // 3 (1-12)
date.day            // 15 (alias for date)
date.date           // 15
date.hour           // 14
date.minute         // 30
date.second         // 45
date.millisecond    // 0
date.dayOfWeek      // 5 (0=Sunday, 5=Friday)
date.dayOfYear      // 75
date.week           // 11 (ISO week)
date.quarter        // 1
date.daysInMonth    // 31
date.daysInYear     // 366 (leap year)
date.isLeapYear     // true
date.isWeekend      // false
date.isWeekday      // true
date.unix           // Unix timestamp (seconds)
date.timestamp      // Unix timestamp (milliseconds)
```

#### Setters (Return New Instance)

```typescript
date.setYear(2025)
date.setMonth(6)
date.setDate(20)
date.setHour(10)
date.setMinute(0)
date.setSecond(0)
date.setMillisecond(0)

// Set multiple at once
date.set({ year: 2025, month: 6, date: 20 })
```

#### Manipulation

```typescript
// Adding
date.add(1, 'day')
date.add({ days: 5, hours: 2 })
date.addDays(5)
date.addWeeks(2)
date.addMonths(3)
date.addYears(1)
date.addHours(6)
date.addMinutes(30)
date.addSeconds(45)

// Subtracting
date.subtract(1, 'week')
date.subtractDays(5)
date.subtractMonths(1)
// ... same pattern as add

// Boundaries
date.startOf('day')    // 00:00:00.000
date.startOf('week')   // Start of week (Sunday)
date.startOf('month')  // First day of month
date.startOf('year')   // January 1st
date.startOf('quarter') // First day of quarter

date.endOf('day')      // 23:59:59.999
date.endOf('month')    // Last day of month
date.endOf('year')     // December 31st
```

#### Comparison

```typescript
date.isBefore(other)
date.isAfter(other)
date.isSame(other)
date.isSameOrBefore(other)
date.isSameOrAfter(other)
date.isBetween(start, end)

// Unit-specific comparisons
date.isSame(other, 'day')
date.isSame(other, 'month')
date.isSame(other, 'year')
```

#### Difference

```typescript
// Get difference in milliseconds
date.diff(other)

// Get difference in specific units
date.diffInMilliseconds(other)
date.diffInSeconds(other)
date.diffInMinutes(other)
date.diffInHours(other)
date.diffInDays(other)
date.diffInWeeks(other)
date.diffInMonths(other)
date.diffInYears(other)

// Human-readable difference
date.diffForHumans(other)  // "2 months ago"
date.diffForHumans()       // Compared to now
```

#### Formatting

```typescript
// Custom format
date.format('YYYY-MM-DD')           // "2024-03-15"
date.format('dddd, MMMM Do YYYY')   // "Friday, March 15th 2024"
date.format('h:mm A')               // "2:30 PM"

// Format tokens:
// YYYY - 4 digit year
// YY   - 2 digit year
// MMMM - Full month name
// MMM  - Short month name
// MM   - 2 digit month
// M    - Month (no leading zero)
// DD   - 2 digit day
// D    - Day (no leading zero)
// Do   - Day with ordinal (1st, 2nd, etc.)
// dddd - Full weekday name
// ddd  - Short weekday name
// dd   - Min weekday name
// d    - Day of week (0-6)
// HH   - 24-hour (2 digit)
// H    - 24-hour (no leading zero)
// hh   - 12-hour (2 digit)
// h    - 12-hour (no leading zero)
// mm   - Minutes (2 digit)
// m    - Minutes (no leading zero)
// ss   - Seconds (2 digit)
// s    - Seconds (no leading zero)
// SSS  - Milliseconds
// A    - AM/PM
// a    - am/pm
// Z    - Timezone offset (+05:30)
// ZZ   - Timezone offset (+0530)
// Q    - Quarter (1-4)
// W    - ISO week number
// WW   - ISO week number (2 digit)
// X    - Unix timestamp (seconds)
// x    - Unix timestamp (milliseconds)

// Standard formats
date.toISOString()     // "2024-03-15T14:30:45.000Z"
date.toDateString()    // "2024-03-15"
date.toTimeString()    // "14:30:45"
date.toDateTimeString() // "2024-03-15 14:30:45"
date.toRFC2822String() // "Fri, 15 Mar 2024 14:30:45 +0000"
date.toRFC3339String() // "2024-03-15T14:30:45+00:00"
```

#### Localization

```typescript
// Set locale for instance
const spanish = date.locale('es');
spanish.format('dddd, D [de] MMMM [de] YYYY')
// "viernes, 15 de marzo de 2024"

// Register custom locale
import { registerLocale } from 'chronos-ts';

registerLocale({
  code: 'fr',
  months: ['janvier', 'février', ...],
  monthsShort: ['janv.', 'févr.', ...],
  weekdays: ['dimanche', 'lundi', ...],
  weekdaysShort: ['dim.', 'lun.', ...],
  weekdaysMin: ['di', 'lu', ...],
  relativeTime: {
    future: 'dans %s',
    past: 'il y a %s',
    // ...
  }
});
```

---

### ChronosInterval Class

Represents a duration/interval of time.

#### Creation

```typescript
// From components
ChronosInterval.create({ hours: 2, minutes: 30 })
ChronosInterval.create({ days: 5, hours: 3, minutes: 15 })

// Static factories
ChronosInterval.years(2)
ChronosInterval.months(6)
ChronosInterval.weeks(3)
ChronosInterval.days(10)
ChronosInterval.hours(24)
ChronosInterval.minutes(90)
ChronosInterval.seconds(3600)

// From ISO 8601 duration
ChronosInterval.fromISO('P1Y2M3DT4H5M6S')
// 1 year, 2 months, 3 days, 4 hours, 5 minutes, 6 seconds

// Between two dates
ChronosInterval.between(startDate, endDate)
```

#### Properties

```typescript
const interval = ChronosInterval.create({ 
  years: 1, 
  months: 2, 
  days: 15, 
  hours: 8 
});

interval.years       // 1
interval.months      // 2
interval.weeks       // 0
interval.days        // 15
interval.hours       // 8
interval.minutes     // 0
interval.seconds     // 0
interval.milliseconds // 0
```

#### Manipulation

```typescript
// Arithmetic
interval.add(other)
interval.subtract(other)
interval.multiply(2)
interval.divide(2)

// Modification
interval.addYears(1)
interval.addMonths(3)
interval.addDays(10)
interval.addHours(5)
// ... similar for subtract

// Inversion
interval.invert()   // Negate all values
interval.abs()      // Make all values positive
```

#### Conversion

```typescript
// Total in specific units
interval.totalSeconds()
interval.totalMinutes()
interval.totalHours()
interval.totalDays()
interval.totalWeeks()

// Normalize to standard units
interval.cascade()  // Converts 90 minutes to 1 hour 30 minutes

// To ISO 8601
interval.toISO()    // "P1Y2M15DT8H0M0S"
```

#### Display

```typescript
interval.forHumans()
// "1 year 2 months 15 days 8 hours"

interval.forHumans({ short: true })
// "1y 2mo 15d 8h"
```

---

### ChronosPeriod Class

Represents a date range for iteration.

#### Creation

```typescript
// Basic period
new ChronosPeriod(startDate, endDate)

// With interval
ChronosPeriod.create(start, end, { days: 1 })

// Static factories
ChronosPeriod.thisWeek()
ChronosPeriod.thisMonth()
ChronosPeriod.thisYear()
ChronosPeriod.thisQuarter()
ChronosPeriod.lastWeek()
ChronosPeriod.lastMonth()
ChronosPeriod.lastYear()
ChronosPeriod.lastQuarter()

// Specific periods
ChronosPeriod.month(2024, 3)    // March 2024
ChronosPeriod.year(2024)       // All of 2024
ChronosPeriod.quarter(2024, 2)  // Q2 2024
```

#### Iteration

```typescript
const period = ChronosPeriod.thisMonth();

// For...of loop
for (const date of period) {
  console.log(date.format('YYYY-MM-DD'));
}

// Convert to array
const dates = period.toArray();

// Get count
const count = period.count();
```

#### Configuration

```typescript
period
  .setStart(newStart)
  .setEnd(newEnd)
  .setInterval({ days: 2 })    // Every 2 days
  .times(10)                   // Limit to 10 iterations
  .excludeStart()              // Skip start date
  .excludeEnd()                // Skip end date
```

#### Filtering

```typescript
// Filter by condition
period.filter(date => date.isWeekday())

// Built-in filters
period.filterWeekdays()
period.filterWeekends()

// Skip specific dates
period.skip(holidays)
```

#### Splitting

```typescript
// Split into smaller periods
period.splitByDays(7)     // Weekly chunks
period.splitByMonths(1)   // Monthly chunks
period.splitByYears(1)    // Yearly chunks
```

---

### ChronosTimezone Class

Handles timezone operations and conversions.

```typescript
import { ChronosTimezone, Timezones } from 'chronos-ts';

// Get timezone info
const nyTz = ChronosTimezone.get(Timezones.AMERICA_NEW_YORK);
console.log(nyTz.offset);     // -5 (or -4 during DST)
console.log(nyTz.abbreviation); // "EST" or "EDT"

// Check DST
ChronosTimezone.isDST(Timezones.AMERICA_NEW_YORK, new Date())

// Get current offset
ChronosTimezone.getCurrentOffset(Timezones.AMERICA_LOS_ANGELES)

// Get all timezone names
const zones = ChronosTimezone.getAllTimezones();
```

---

## 🌍 Localization

Chronos-ts includes built-in support for English and Spanish, with an extensible locale system.

```typescript
import { Chronos, registerLocale, getLocale } from 'chronos-ts';

// Use built-in locale
const date = Chronos.now().locale('es');
date.format('dddd, D [de] MMMM [de] YYYY');
// "viernes, 15 de marzo de 2024"

// Human-readable in Spanish
date.diffForHumans(Chronos.yesterday());
// "hace 1 día"

// Register custom locale
registerLocale({
  code: 'de',
  months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
           'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  monthsShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
                'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  weekdays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 
             'Donnerstag', 'Freitag', 'Samstag'],
  weekdaysShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  weekdaysMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  relativeTime: {
    future: 'in %s',
    past: 'vor %s',
    s: 'wenigen Sekunden',
    ss: '%d Sekunden',
    m: 'einer Minute',
    mm: '%d Minuten',
    h: 'einer Stunde',
    hh: '%d Stunden',
    d: 'einem Tag',
    dd: '%d Tagen',
    M: 'einem Monat',
    MM: '%d Monaten',
    y: 'einem Jahr',
    yy: '%d Jahren',
  },
});
```

---

## 🔧 Configuration

```typescript
import { Chronos } from 'chronos-ts';

// Set global configuration
Chronos.configure({
  defaultTimezone: 'America/New_York',
  defaultLocale: 'en',
});

// Set test/mock time (useful for testing)
Chronos.setTestNow(Chronos.create(2024, 1, 1));
const now = Chronos.now(); // Returns 2024-01-01

// Reset test time
Chronos.setTestNow(null);
```

---

## 📚 Real-World Examples

### Event Planning

```typescript
import { Chronos, ChronosPeriod, ChronosInterval } from 'chronos-ts';

// Conference dates
const conference = {
  start: Chronos.create(2024, 6, 15, 9, 0),
  end: Chronos.create(2024, 6, 17, 18, 0),
};

// Check if a session conflicts
const session = Chronos.create(2024, 6, 16, 14, 0);
const isDuringConference = session.isBetween(conference.start, conference.end);

// Create weekly recurring meeting
const meetings = ChronosPeriod
  .create(
    Chronos.now(),
    Chronos.now().addMonths(3),
    { weeks: 1 }
  )
  .filter(date => date.dayOfWeek === 1) // Mondays only
  .toArray();
```

### Subscription Management

```typescript
import { Chronos, ChronosInterval } from 'chronos-ts';

class Subscription {
  constructor(
    public startDate: Chronos,
    public interval: ChronosInterval
  ) {}

  get nextBillingDate(): Chronos {
    return this.startDate.add(this.interval);
  }

  isActive(): boolean {
    return Chronos.now().isBefore(this.nextBillingDate);
  }

  daysUntilRenewal(): number {
    return this.nextBillingDate.diffInDays(Chronos.now());
  }
}

const monthly = new Subscription(
  Chronos.now(),
  ChronosInterval.months(1)
);

console.log(`Days until renewal: ${monthly.daysUntilRenewal()}`);
```

### Work Schedule

```typescript
import { Chronos, ChronosPeriod } from 'chronos-ts';

// Get working days this month
const workingDays = ChronosPeriod
  .thisMonth()
  .filterWeekdays()
  .toArray();

console.log(`Working days this month: ${workingDays.length}`);

// Calculate hours worked
const clockIn = Chronos.create(2024, 3, 15, 9, 0);
const clockOut = Chronos.create(2024, 3, 15, 17, 30);

const hoursWorked = clockOut.diffInHours(clockIn);
const overtime = Math.max(0, hoursWorked - 8);

console.log(`Hours worked: ${hoursWorked}`);
console.log(`Overtime: ${overtime}`);
```

### Age Calculator

```typescript
import { Chronos } from 'chronos-ts';

function getAge(birthDate: Chronos): { years: number; months: number; days: number } {
  const now = Chronos.now();
  
  return {
    years: now.diffInYears(birthDate),
    months: now.diffInMonths(birthDate) % 12,
    days: now.diffInDays(birthDate.addYears(now.diffInYears(birthDate))) % 30,
  };
}

const birthday = Chronos.create(1990, 6, 15);
const age = getAge(birthday);
console.log(`Age: ${age.years} years, ${age.months} months, ${age.days} days`);
```

---

## 🧪 Testing

```typescript
import { Chronos } from 'chronos-ts';

describe('MyFeature', () => {
  beforeEach(() => {
    // Freeze time for consistent tests
    Chronos.setTestNow(Chronos.create(2024, 1, 15, 12, 0, 0));
  });

  afterEach(() => {
    // Reset to real time
    Chronos.setTestNow(null);
  });

  it('should calculate correct deadline', () => {
    const deadline = Chronos.now().addDays(30);
    expect(deadline.format('YYYY-MM-DD')).toBe('2024-02-14');
  });
});
```

---

## 🆚 Comparison with Other Libraries

| Feature | Chronos-ts | Day.js | Moment.js | date-fns |
|---------|-----------|--------|-----------|----------|
| Immutable | ✅ | ✅ | ❌ | ✅ |
| TypeScript | ✅ Native | Plugin | Plugin | ✅ Native |
| Tree-shakeable | ✅ | ✅ | ❌ | ✅ |
| Intervals | ✅ | Plugin | ✅ | ❌ |
| Periods | ✅ | ❌ | ❌ | ❌ |
| Timezones | ✅ | Plugin | Plugin | ✅ |
| Zero deps | ✅ | ✅ | ❌ | ✅ |
| API Style | Fluent | Fluent | Fluent | Functional |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
# Clone the repository
git clone https://github.com/hendurhance/chronos-ts.git

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Carbon PHP](https://carbon.nesbot.com/) — Primary API inspiration
- [Day.js](https://day.js.org/) — Immutability patterns
- [Moment.js](https://momentjs.com/) — Format string patterns
- [Period](https://github.com/spatie/period) - Complex period comparisons
---

Made with ❤️ by the Chronos-ts team
