# Chronos-ts ⏰
Chronos-ts from the name is inspired by the Greek god of time, Chronos. It is a comprehensive TypeScript package for handling time periods, intervals, and date-related operations.

## Table of Contents
- [Installation](#installation)
- [Overview](#overview)
- [Usage](#usage)
- [API Reference](#api-reference)
    - [Classes](#classes)
        - [Period](#period)
        - [Interval](#interval)
    - [Enums](#enums)
    - [Precision](#precision)
    - [Utility Function](#utility-function)
    - [Real-world Scenarios](#real-world-scenarios)
        - [Event Planning and Management](#event-planning-and-management)
        - [Financial Reporting Periods](#financial-reporting-periods)
        - [Employee Leave Management](#employee-leave-management)
        - [Project Timeline Management](#project-timeline-management)
        - [Subscription Billing Cycle Management](#subscription-billing-cycle-management)
        - [Employee Shift Management](#employee-shift-management)
        - [Travel Itinerary Planning](#travel-itinerary-planning)

## Installation
```bash
npm install chronos-ts

# or
yarn add chronos-ts

# or

pnpm add chronos-ts
```

## Overview
This package provides an easy-to-use API for working with periods and intervals, along with precise handling of date and time logic. Inspired by the [spatie/period](https://github.com/spatie/period) package in PHP, this package provides support for both TypeScript and JavaScript environments, offering advanced time manipulation. It offers a user-friendly API for working with periods and intervals, providing precise date and time logic handling. Key features include:
- Flexible period creation and manipulation with customizable precision (minute to year)
- Interval generation for recurring events (e.g., "every 3 days")
- Comprehensive period comparisons (overlaps, contains, adjacent)
- Precise start/end date handling with various time units
- Advanced operations like symmetric differences and unions between periods
- Adjacent period detection for seamless time range management
- Extensive utility functions for common date operations and formatting

Whether you're building scheduling systems, financial applications, or any project requiring sophisticated time calculations, Chronos simplifies complex time-based operations in both TypeScript and JavaScript environments.


## Usage
### Creating and Manipulating Periods
````typescript
import { Period, Precision, Interval } from 'chronos-ts';

// Create a period for the year 2023
const year2023 = new Period('2023-01-01', '2023-12-31', Precision.DAY);

// Check if a date is within the period
const isInPeriod = year2023.contains('2023-06-15'); // true

// Create a period for Q2 2023
const q2_2023 = new Period('2023-04-01', '2023-06-30', Precision.DAY);

// Check if periods overlap
const periodsOverlap = year2023.overlapsWith(q2_2023); // true

// Get the overlapping period
const overlap = year2023.overlap(q2_2023);
console.log(overlap?.startDate, overlap?.endDate); // 2023-04-01, 2023-06-30

// Subtract a period
const remainingPeriods = year2023.subtract(q2_2023);
console.log(remainingPeriods.length); // 2
console.log(remainingPeriods[0].startDate, remainingPeriods[0].endDate); // 2023-01-01, 2023-03-31
console.log(remainingPeriods[1].startDate, remainingPeriods[1].endDate); // 2023-07-01, 2023-12-31

// Create a period with an interval
const weeklyPeriod = new Period('2023-01-01', '2023-12-31', Precision.WEEK, Interval.weeks(1));

// Get dates in the interval
const weeklyDates = weeklyPeriod.getDatesInInterval();
console.log(weeklyDates?.length); // 53 (number of weeks in 2023)

// Renew a period
const nextYear = year2023.renew();
console.log(nextYear.startDate, nextYear.endDate); // 2024-01-01, 2024-12-31

// Use fluent API
const customPeriod = new Period('2023-01-01', '2023-12-31')
  .setPrecision(Precision.MONTH)
  .setInterval(Interval.months(3));

console.log(customPeriod.getDatesInInterval()?.length); // 5 (Jan, Apr, Jul, Oct, Jan)
````

### Working with Intervals
``` typescript
import { Interval } from 'chronos-ts';

const twoHours = Interval.hours(2);
console.log(twoHours.getMinutesInterval()); // 120

const threeWeeks = Interval.weeks(3);
console.log(threeWeeks.getMinutesInterval()); // 30240 (3 * 7 * 24 * 60)

const customInterval = new Interval(30, 2, 1, 0, 1); // 30 minutes, 2 hours, 1 day, 0 weeks, 1 month
console.log(customInterval.getMinutesInterval()); // 44310 (30 + 120 + 1440 + 43200)
```
### Using Utility Functions
```typescript
import { addToDate, subtractFromDate, formatDate, parseDate, getWeekNumber, isLeapYear, Precision } from 'chronos-ts';

const today = new Date();

// Add 3 months to today
const futureDate = addToDate(today, 3, Precision.MONTH);

// Subtract 2 weeks from today
const pastDate = subtractFromDate(today, 2, Precision.WEEK);

// Format a date
const formattedDate = formatDate(today, 'YYYY-MM-DD HH:mm:ss');

// Parse a date string
const parsedDate = parseDate('2023-06-15 14:30:00', 'YYYY-MM-DD HH:mm:ss');

// Get the week number
const weekNumber = getWeekNumber(today);

// Check if it's a leap year
const isLeap = isLeapYear(2024); // true
```



## API Reference
## #Classes
#### Period
The `Period` class represents a time period with a start date, end date, precision, and optional interval.

##### Constructor
```typescript
constructor(start: string | Date, end: string | Date, precision: Precision = Precision.DAY, interval: Interval | null = null)
```

##### Methods
- `contains(date: string | Date): boolean`: Checks if the given date is within the period.
- `overlapsWith(other: Period): boolean`: Checks if this period overlaps with another period.
- `isAdjacentTo(other: Period): boolean`: Checks if this period is adjacent to another period.
- `getDatesInInterval(): Date[] | null`: Returns an array of dates within the period based on the interval.
- `getMinutesInInterval(): number`: Returns the number of minutes in the period.
- `getHoursInInterval(): number`: Returns the number of hours in the period.
- `getDaysInInterval(): number`: Returns the number of days in the period.
- `getWeeksInInterval(): number`: Returns the number of weeks in the period.
- `getMonthsInInterval(): number`: Returns the number of months in the period.
- `getYearsInInterval(): number`: Returns the number of years in the period.
- `length(): number`: Returns the length of the period in the specified precision.
- `overlap(other: Period): Period | null`: Returns the overlapping period with another period, if any.
- `subtract(other: Period): Period[]`: Subtracts another period from this period.
- `gap(other: Period): Period | null`: Returns the gap between this period and another period, if any.
- `symmetricDifference(other: Period): Period[]`: Returns the symmetric difference between this period and another period.
- `renew(): Period`: Creates a new period of the same length immediately following this period.
- `union(other: Period): Period[]`: Returns the union of this period with another period.

##### Fluent API Methods

`setStart(start: string | Date): this`: Sets the start date of the period.
`setEnd(end: string | Date): this`: Sets the end date of the period.
`setPrecision(precision: Precision): this`: Sets the precision of the period.
`setInterval(interval: Interval): this`: Sets the interval of the period.

#### Interval
The `Interval` class represents a time interval with minutes, hours, days, weeks, and months.
Static Methods

- `minutes(minutes: number): Interval:` Creates an interval with the specified number of minutes.
- `hours(hours: number): Interval`: Creates an interval with the specified number of hours.
- `days(days: number): Interval`: Creates an interval with the specified number of days.
- `weeks(weeks: number): Interval`: Creates an interval with the specified number of weeks.
- `months(months: number): Interval`: Creates an interval with the specified number of months.

##### Methods

`getMinutesInterval(): number`: Returns the total number of minutes in the interval.


#### Enums
##### Precision
The Precision enum represents different levels of time precision.
typescriptCopyenum Precision {
    MINUTE = 'minute',
    HOUR = 'hour',
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
    YEAR = 'year',
}

### Utility Function
The package includes various utility functions for working with dates:

- `getDatesWithInterval(start: Date, end: Date, interval: Interval): Date[]` - Returns an array of dates within the specified interval.
- `getWeeksWithInterval(start: Date, end: Date, interval: Interval): Date[]` - Returns an array of weeks within the specified interval.
- `getDaysWithInterval(start: Date, end: Date, interval: Interval): Date[]` - Returns an array of days within the specified interval.
- `getHoursWithInterval(start: Date, end: Date, interval: Interval): Date[]` - Returns an array of hours within the specified interval.
- `getMinutesWithInterval(start: Date, end: Date, interval: Interval): Date[]` - Returns an array of minutes within the specified interval.
- `getMonthsWithInterval(start: Date, end: Date, interval: Interval): Date[]` - Returns an array of months within the specified interval.
- `getYearsWithInterval(start: Date, end: Date, interval: Interval): Date[]` - Returns an array of years within the specified interval.
- `addToDate(date: Date, amount: number, unit: Precision): Date` - Adds the specified amount of time to a date.
- `subtractFromDate(date: Date, amount: number, unit: Precision): Date` - Subtracts the specified amount of time from a date.
- `isSameDay(date1: Date, date2: Date): boolean` - Checks if two dates are on the same day.
- `getWeekNumber(date: Date): number` - Returns the week number of a date.
- `getQuarter(date: Date): number` - Returns the quarter of a date.
- `isLeapYear(year: number): boolean` - Checks if a year is a leap year.
- `getDaysInMonth(year: number, month: number): number` - Returns the number of days in a month.
- `formatDate(date: Date, format: string): string`
- `parseDate(dateString: string, format: string): Date` - Parses a date string using the specified format.
- `range(start: number, end: number, step: number = 1): number[]` - Returns an array of numbers within the specified range.

### Real-world Scenarios
**1. Event Planning and Management**
The `Period` class can be used to represent events, while the `Interval` class can help manage recurring events.
``` typescript
import { Period, Interval, Precision } from 'chronos-ts';

// Create an event
const conference = new Period('2023-09-15 09:00', '2023-09-17 18:00', Precision.HOUR);

// Check if a specific time is during the conference
const isDuringConference = conference.contains('2023-09-16 14:30'); // true

// Create a recurring weekly meeting
const weeklyMeeting = new Period('2023-01-01 10:00', '2023-12-31 11:00', Precision.HOUR, Interval.weeks(1));

// Get all meeting dates
const meetingDates = weeklyMeeting.getDatesInInterval();

// Check for conflicts with the conference
const conflictingMeetings = meetingDates?.filter(date => conference.contains(date)) || [];
console.log(`There are ${conflictingMeetings.length} conflicting meetings during the conference.`);
```

**2. Financial  Reporting Periods**
Use the `Period` class to represent financial quarters and calculate year-to-date periods.
``` typescript
import { Period, Precision } from 'chronos-ts';

const q1_2023 = new Period('2023-01-01', '2023-03-31', Precision.DAY);
const q2_2023 = new Period('2023-04-01', '2023-06-30', Precision.DAY);
const q3_2023 = new Period('2023-07-01', '2023-09-30', Precision.DAY);
const q4_2023 = new Period('2023-10-01', '2023-12-31', Precision.DAY);

// Calculate Year-to-Date period
const ytd = (currentQuarter: Period): Period => {
  return new Period('2023-01-01', currentQuarter.endDate, Precision.DAY);
};

const q3YTD = ytd(q3_2023);
console.log(`Q3 YTD period: ${q3YTD.startDate.toDateString()} - ${q3YTD.endDate.toDateString()}`);

// Calculate quarter-over-quarter growth
const calculateQoQGrowth = (currentQuarter: number, previousQuarter: number): string => {
  const growth = (currentQuarter - previousQuarter) / previousQuarter * 100;
  return `${growth.toFixed(2)}%`;
};

const q2Revenue = 1000000;
const q3Revenue = 1200000;
console.log(`Q3 QoQ Growth: ${calculateQoQGrowth(q3Revenue, q2Revenue)}`);
```

**3. Employee Leave Management**
Use the `Period` class to manage employee leave requests and calculate leave balances.
``` typescript
import { Period, Precision } from 'chronos-ts';

// Create a leave request period
const leaveRequest = new Period('2023-09-15', '2023-09-17', Precision.DAY);

// Check if the leave request overlaps with existing leave periods
const existingLeaves = [
  new Period('2023-09-10', '2023-09-14', Precision.DAY),
  new Period('2023-09-18', '2023-09-20', Precision.DAY),
];

const overlappingLeaves = existingLeaves.filter(leave => leaveRequest.overlapsWith(leave));
console.log(`There are ${overlappingLeaves.length} overlapping leave requests.`);

// Calculate remaining leave balance
const totalLeaveDays = 20;
const usedLeaveDays = existingLeaves.reduce((total, leave) => total + leave.length(), 0);
const remainingLeaveDays = totalLeaveDays - usedLeaveDays;
console.log(`Remaining leave days: ${remainingLeaveDays}`);

// Renew leave balance for the next year
const nextYearLeaveBalance = remainingLeaveDays > 0 ? new Period('2024-01-01', '2024-12-31') : null;
console.log(`Next year's leave balance: ${nextYearLeaveBalance ? nextYearLeaveBalance.length() : 0} days`);

```

**4.  Project Timeline Management**
Use the Period class to manage project timelines and track overlapping tasks.
``` typescript
import { Period, Precision } from 'chronos-ts';

const projectTimeline = new Period('2023-01-01', '2023-12-31', Precision.DAY);

const tasks = [
  new Period('2023-01-15', '2023-03-31', Precision.DAY),
  new Period('2023-03-01', '2023-05-15', Precision.DAY),
  new Period('2023-05-01', '2023-08-31', Precision.DAY),
  new Period('2023-08-15', '2023-11-30', Precision.DAY),
];

// Find overlapping tasks
const findOverlappingTasks = (tasks: Period[]): [Period, Period][] => {
  const overlaps: [Period, Period][] = [];
  for (let i = 0; i < tasks.length; i++) {
    for (let j = i + 1; j < tasks.length; j++) {
      if (tasks[i].overlapsWith(tasks[j])) {
        overlaps.push([tasks[i], tasks[j]]);
      }
    }
  }
  return overlaps;
};

const overlappingTasks = findOverlappingTasks(tasks);
console.log(`There are ${overlappingTasks.length} overlapping tasks in the project.`);

// Calculate project progress
const calculateProgress = (currentDate: Date): number => {
  const daysPassed = projectTimeline.startDate.getMinutesInInterval() / (24 * 60);
  const totalDays = projectTimeline.getDaysInInterval();
  return (daysPassed / totalDays) * 100;
};

const currentProgress = calculateProgress(new Date('2023-06-15'));
console.log(`Project progress: ${currentProgress.toFixed(2)}%`);
```

**5. Subscription Billing Cycle Management**
Use the Period class to manage subscription periods and calculate renewal dates.
``` typescript
import { Period, Precision, addToDate } from 'chronos-ts';

class Subscription {
  constructor(public startDate: Date, public plan: 'monthly' | 'annual') {}

  getCurrentPeriod(): Period {
    const endDate = addToDate(this.startDate, 1, this.plan === 'monthly' ? Precision.MONTH : Precision.YEAR);
    return new Period(this.startDate, endDate, Precision.DAY);
  }

  isActive(date: Date = new Date()): boolean {
    return this.getCurrentPeriod().contains(date);
  }

  getRenewalDate(): Date {
    return this.getCurrentPeriod().endDate;
  }

  renew(): void {
    this.startDate = this.getRenewalDate();
  }
}

const monthlySubscription = new Subscription(new Date('2023-01-01'), 'monthly');
console.log(`Monthly subscription active: ${monthlySubscription.isActive()}`);
console.log(`Monthly subscription renewal date: ${monthlySubscription.getRenewalDate().toDateString()}`);

const annualSubscription = new Subscription(new Date('2023-01-01'), 'annual');
console.log(`Annual subscription active: ${annualSubscription.isActive()}`);
console.log(`Annual subscription renewal date: ${annualSubscription.getRenewalDate().toDateString()}`);

const annualSubscription = new Subscription(new Date('2023-01-01'), 'annual');
console.log(`Annual subscription active: ${annualSubscription.isActive()}`);
console.log(`Annual subscription renewal date: ${annualSubscription.getRenewalDate().toDateString()}`);
// Check if a subscription will be active on a future date
const futureDate = new Date('2023-12-15');
console.log(`Monthly subscription active on ${futureDate.toDateString()}: ${monthlySubscription.isActive(futureDate)}`);
console.log(`Annual subscription active on ${futureDate.toDateString()}: ${annualSubscription.isActive(futureDate)}`);
// Renew a subscription
monthlySubscription.renew();
console.log(`Monthly subscription renewed. New period: ${monthlySubscription.getCurrentPeriod().startDate.toDateString()} - ${monthlySubscription.getCurrentPeriod().endDate.toDateString()})`;
```

**6. Employee Shift Management**

Use the `Period` and `Interval` classes to manage employee shifts and calculate overtime.

```typescript
import { Period, Interval, Precision, addToDate } from 'chronos-ts';

class Shift extends Period {
  constructor(public employee: string, start: Date, end: Date) {
    super(start, end, Precision.MINUTE);
  }

  getDuration(): number {
    return this.getHoursInInterval();
  }

  isOvertime(): boolean {
    return this.getDuration() > 8;
  }

  getOvertimeHours(): number {
    return Math.max(0, this.getDuration() - 8);
  }
}

// Create a week's worth of shifts for an employee
const createWeekShifts = (employee: string, startDate: Date): Shift[] => {
  const shifts: Shift[] = [];
  for (let i = 0; i < 5; i++) { // Assuming 5-day work week
    const shiftStart = addToDate(startDate, i, Precision.DAY);
    shiftStart.setHours(9, 0, 0, 0); // 9 AM start
    const shiftEnd = new Date(shiftStart);
    shiftEnd.setHours(17, 0, 0, 0); // 5 PM end
    shifts.push(new Shift(employee, shiftStart, shiftEnd));
  }
  return shifts;
};

const employeeShifts = createWeekShifts('John Doe', new Date('2023-06-19'));

// Calculate total hours worked and overtime
const totalHours = employeeShifts.reduce((sum, shift) => sum + shift.getDuration(), 0);
const overtimeHours = employeeShifts.reduce((sum, shift) => sum + shift.getOvertimeHours(), 0);

console.log(`Total hours worked: ${totalHours}`);
console.log(`Overtime hours: ${overtimeHours}`);

// Check for conflicting shifts
const hasConflict = (shifts: Shift[]): boolean => {
  for (let i = 0; i < shifts.length; i++) {
    for (let j = i + 1; j < shifts.length; j++) {
      if (shifts[i].overlapsWith(shifts[j])) {
        return true;
      }
    }
  }
  return false;
};

console.log(`Shifts have conflicts: ${hasConflict(employeeShifts)}`);
```

**7. Travel Itinerary Planning**
Use the `Period` class to manage travel itineraries and check for scheduling conflicts.
``` typescript
import { Period, Precision, addToDate } from 'chronos-ts';

class TravelEvent extends Period {
  constructor(public description: string, start: Date, end: Date) {
    super(start, end, Precision.MINUTE);
  }
}

class Itinerary {
  events: TravelEvent[] = [];

  addEvent(event: TravelEvent): void {
    if (this.hasConflict(event)) {
      throw new Error('Event conflicts with existing events');
    }
    this.events.push(event);
  }

  hasConflict(newEvent: TravelEvent): boolean {
    return this.events.some(event => event.overlapsWith(newEvent));
  }

  getDuration(): number {
    if (this.events.length === 0) return 0;
    const start = this.events.reduce((min, e) => e.startDate < min ? e.startDate : min, this.events[0].startDate);
    const end = this.events.reduce((max, e) => e.endDate > max ? e.endDate : max, this.events[0].endDate);
    return new Period(start, end, Precision.HOUR).getDaysInInterval();
  }
}

// Create a travel itinerary
const itinerary = new Itinerary();

// Add events to the itinerary
try {
  itinerary.addEvent(new TravelEvent('Flight to Paris', new Date('2023-07-01 10:00'), new Date('2023-07-01 12:00')));
  itinerary.addEvent(new TravelEvent('Hotel Check-in', new Date('2023-07-01 14:00'), new Date('2023-07-01 15:00')));
  itinerary.addEvent(new TravelEvent('Eiffel Tower Visit', new Date('2023-07-02 10:00'), new Date('2023-07-02 13:00')));
  itinerary.addEvent(new TravelEvent('Louvre Museum', new Date('2023-07-03 09:00'), new Date('2023-07-03 12:00')));
  itinerary.addEvent(new TravelEvent('Flight to Rome', new Date('2023-07-04 15:00'), new Date('2023-07-04 17:00')));
} catch (error) {
  console.error('Error creating itinerary:', error.message);
}

console.log(`Itinerary duration: ${itinerary.getDuration()} days`);

// Try to add a conflicting event
try {
  itinerary.addEvent(new TravelEvent('Conflicting Event', new Date('2023-07-01 11:00'), new Date('2023-07-01 13:00')));
} catch (error) {
  console.log('Caught conflicting event:', error.message);
}
```

## Contributing 🤝
Contributions, issues and feature requests are welcome. After cloning & setting up project locally, you can just submit a PR to this repo and it will be deployed once it's accepted. There is a list of TODOs in the [TODO.md](TODO.md) file. The project is still in its early stages, so there are plenty of opportunities to contribute.

## License 📝
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements 🙏
- [spatie/period]((https://github.com/spatie/period)
