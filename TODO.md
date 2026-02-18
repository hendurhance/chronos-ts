# Chronos-ts v2 Roadmap

## ✅ Completed (v2.0.0)

### Core Features
- [x] Complete rewrite inspired by Carbon PHP
- [x] Immutable API design
- [x] Full TypeScript support with comprehensive types
- [x] Zero external dependencies

### Chronos Class
- [x] Factory methods (now, today, tomorrow, yesterday, create, parse)
- [x] Date/time getters and setters
- [x] Date manipulation (add, subtract)
- [x] Boundary operations (startOf, endOf)
- [x] Comparison methods
- [x] Difference calculations
- [x] Flexible formatting with tokens
- [x] Standard format outputs (ISO, RFC)

### ChronosInterval
- [x] Duration creation from components
- [x] Static factories for common durations
- [x] ISO 8601 duration parsing
- [x] Arithmetic operations (add, subtract, multiply, divide)
- [x] Total calculations (totalHours, totalDays, etc.)
- [x] Human-readable output
- [x] Cascading normalization

### ChronosPeriod
- [x] Date range iteration (Iterator protocol)
- [x] Configurable intervals
- [x] Recurrence limits
- [x] Date filtering (weekdays, weekends, custom)
- [x] Period splitting
- [x] Static factories for common periods

### ChronosTimezone
- [x] Timezone database with major world zones
- [x] DST detection and handling
- [x] Offset calculations
- [x] Timezone abbreviations

### ChronosPeriodCollection
- [x] Collection of ChronosPeriod instances
- [x] Merging overlapping/adjacent periods
- [x] Finding gaps between periods
- [x] Conflict detection between periods
- [x] Total covered duration calculation

### Localization
- [x] Extensible locale system
- [x] English locale (built-in)
- [x] Spanish locale (built-in)
- [x] Relative time formatting
- [x] Custom locale registration

## ✅ Completed (v2.0.2)
### Bug Fixes & Enhancements
- [x] Fixed `dayOfYear()` method to return correct day of the year
- [x] Short unit 'M' for month is interpreted as 'm' for minute
- [x] Timezone offset with non-zero minutes loses precision

### ✅ Completed (v2.0.3)
### Bug Fixes & Enhancements
- [x] Fixed issue with Vite failed to resolve entry point (https://github.com/hendurhance/chronos-ts/issues/5)
- [x] Improved test coverage for edge cases in date manipulation and formatting
- [x] Use `tsup` for bundling to ensure better compatibility
---

## 🔄 Planned (v2.1.0)
### Bug Fixes & Enhancements
- [ ] Address issues from v2.0.0 release
- [ ] Improve test coverage
- [ ] Optimize performance for large date ranges

### Additional Locales
- [ ] Hindi (hi)
- [ ] Thai (th)
- [ ] Bengali (bn)
- [ ] Urdu (ur)
- [ ] Korean (ko)
- [ ] Turkish (tr)
- [ ] Indonesian (vi)
- [ ] Polish (pl)
- [ ] Swedish (sv)

### Parsing Improvements
- [ ] More format patterns support
- [ ] Relative date parsing ("next Monday", "last week")
- [ ] Natural language parsing
- [ ] Timezone-aware parsing

---

## 🎯 Future (v2.2.0+)

### Calendar Systems
- [ ] Julian calendar support
- [ ] Islamic calendar support
- [ ] Hebrew calendar support
- [ ] Buddhist calendar support

### Business Logic
- [ ] Business days calculations
- [ ] Holiday handling
- [ ] Working hours support
- [ ] Fiscal year/quarter support

### Visualization
- [ ] Timeline visualization helpers
- [ ] Calendar grid generation
- [ ] Gantt chart data structures

### Performance
- [ ] Lazy evaluation for periods
- [ ] Caching for expensive calculations
- [ ] Memory optimization for large date ranges

### Integration
- [ ] React hooks package
- [ ] Vue composables package
- [ ] Date picker adapter interfaces
- [ ] JSON serialization helpers

---

## 💡 Ideas Under Consideration

- Recurrence rules (RRULE) support
- Astronomical calculations (sunrise, sunset)
- Date validation and constraints
- Date range presets library

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute to Chronos-ts.

Suggestions and feature requests are welcome! Please open an issue to discuss.
