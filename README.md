# Chronos-ts ⏰

[![npm version](https://img.shields.io/npm/v/chronos-ts.svg)](https://www.npmjs.com/package/chronos-ts)
[![npm downloads](https://img.shields.io/npm/dt/chronos-ts.svg)](https://www.npmjs.com/package/chronos-ts)
[![tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](https://github.com/hendurhance/chronos-ts/actions)
[![build](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/hendurhance/chronos-ts/actions)
[![coverage](https://img.shields.io/badge/coverage-unknown-lightgrey.svg)](https://github.com/hendurhance/chronos-ts/actions)

**Chronos-ts** — named after the Greek god of time — is a comprehensive TypeScript library for date and time manipulation. Version 2.0 is a complete rewrite inspired by [Carbon PHP](https://carbon.nesbot.com/), bringing modern, intuitive date handling to TypeScript and JavaScript.

> [!WARNING]
> This is a major rewrite (v2.0) and is not backward compatible with v1.x. Please refer to the [migration guide](MIGRATION.md) for details.
> For Vite users, ensure you are using version 2.0.3 or later to avoid entry point resolution issues.
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

For detailed documentation on all classes and methods, please refer to the [API Reference](API_REFERENCE.md).

### Core Classes

- **[Chronos](API_REFERENCE.md#chronos)**: The main class for date/time manipulation.
- **[ChronosInterval](API_REFERENCE.md#chronosinterval)**: Represents a duration of time.
- **[ChronosPeriod](API_REFERENCE.md#chronosperiod)**: Represents a date range or schedule.
- **[ChronosPeriodCollection](API_REFERENCE.md#chronosperiodcollection)**: Manages collections of periods.
- **[ChronosTimezone](API_REFERENCE.md#chronostimezone)**: Timezone utilities.

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
