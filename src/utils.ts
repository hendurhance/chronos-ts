import { Interval } from './interval';
import { Precision } from './precision';

/**
 * Generates an array of dates between the given start and end dates, 
 * with a specified interval between each date.
 *
 * @param start - The start date.
 * @param end - The end date.
 * @param interval - An object representing the interval between dates.
 * @returns An array of dates between the start and end dates, inclusive, 
 *          with the specified interval.
 */
export function getDatesWithInterval(
  start: Date,
  end: Date,
  interval: Interval,
): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(new Date(current));
    current.setMinutes(current.getMinutes() + interval.getMinutesInterval());
  }

  return dates;
}

/**
 * Generates an array of dates representing the start of each week within a given interval.
 *
 * @param start - The start date of the interval.
 * @param end - The end date of the interval.
 * @param interval - An object representing the interval in minutes.
 * @returns An array of dates, each representing the start of a week within the interval.
 */
export function getWeeksWithInterval(
  start: Date,
  end: Date,
  interval: Interval,
): Date[] {
  const weeks: Date[] = [];
  let current = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
  );
  // Move to the start of the week (Sunday)
  current.setUTCDate(current.getUTCDate() - current.getUTCDay());

  while (current <= end) {
    weeks.push(new Date(current));
    // Add the interval in minutes, converted to milliseconds
    current = new Date(
      current.getTime() + interval.getMinutesInterval() * 60000,
    );
    // Ensure we're at the start of the week
    current.setUTCDate(current.getUTCDate() - current.getUTCDay());
  }

  return weeks;
}

/**
 * Generates an array of dates between the start and end dates, inclusive, 
 * with a specified interval.
 *
 * @param start - The start date.
 * @param end - The end date.
 * @param interval - The interval object that provides the interval in minutes.
 * @returns An array of dates with the specified interval.
 */
export function getDaysWithInterval(
  start: Date,
  end: Date,
  interval: Interval,
): Date[] {
  const days: Date[] = [];
  const current = new Date(start);
  current.setUTCHours(0, 0, 0, 0);

  while (current <= end) {
    days.push(new Date(current));
    current.setUTCDate(
      current.getUTCDate() + interval.getMinutesInterval() / (24 * 60),
    );
  }

  return days;
}

/**
 * Generates an array of Date objects representing hours between the start and end dates,
 * incremented by a specified interval.
 *
 * @param start - The start date and time.
 * @param end - The end date and time.
 * @param interval - An object that provides the interval in minutes.
 * @returns An array of Date objects representing the hours within the specified interval.
 */
export function getHoursWithInterval(
  start: Date,
  end: Date,
  interval: Interval,
): Date[] {
  const hours: Date[] = [];
  const current = new Date(start);
  current.setMinutes(0, 0, 0);

  while (current <= end) {
    hours.push(new Date(current));
    current.setHours(current.getHours() + interval.getMinutesInterval() / 60);
  }

  return hours;
}

/**
 * Generates an array of Date objects representing each minute within a specified interval
 * between a start and end date.
 *
 * @param start - The start date and time.
 * @param end - The end date and time.
 * @param interval - An object that provides the interval in minutes.
 * @returns An array of Date objects, each representing a minute within the specified interval.
 */
export function getMinutesWithInterval(
  start: Date,
  end: Date,
  interval: Interval,
): Date[] {
  const minutes: Date[] = [];
  const current = new Date(start);
  current.setSeconds(0, 0);

  while (current <= end) {
    minutes.push(new Date(current));
    current.setMinutes(current.getMinutes() + interval.getMinutesInterval());
  }

  return minutes;
}

/**
 * Generates an array of Date objects representing the start of each month
 * within the specified interval between the start and end dates.
 *
 * @param start - The start date of the interval.
 * @param end - The end date of the interval.
 * @param interval - An object representing the interval in minutes.
 * @returns An array of Date objects, each representing the start of a month within the interval.
 */
export function getMonthsWithInterval(
  start: Date,
  end: Date,
  interval: Interval,
): Date[] {
  const months: Date[] = [];
  const current = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1),
  );

  while (current <= end) {
    months.push(new Date(current));
    current.setUTCMonth(
      current.getUTCMonth() + interval.getMinutesInterval() / (30 * 24 * 60),
    );
  }

  return months;
}

/**
 * Generates an array of Date objects representing the start of each year
 * within the specified interval between the start and end dates.
 *
 * @param start - The start date.
 * @param end - The end date.
 * @param interval - An Interval object that determines the interval in minutes.
 * @returns An array of Date objects representing the start of each year within the interval.
 */
export function getYearsWithInterval(
  start: Date,
  end: Date,
  interval: Interval,
): Date[] {
  const years: Date[] = [];
  const current = new Date(Date.UTC(start.getUTCFullYear(), 0, 1));

  while (current <= end) {
    years.push(new Date(current));
    // Calculate the number of years to add based on the interval
    const yearsToAdd = Math.max(
      1,
      Math.round(interval.getMinutesInterval() / 525600),
    ); // 525600 minutes in a year
    current.setUTCFullYear(current.getUTCFullYear() + yearsToAdd);
  }

  return years;
}

/**
 * Adds a specified amount of time to a given date based on the provided precision unit.
 *
 * @param date - The original date to which the amount will be added.
 * @param amount - The amount of time to add. Can be positive or negative.
 * @param unit - The unit of time to add (e.g., minute, hour, day, week, month, year).
 * 
 * @returns A new `Date` object with the specified amount of time added.
 *
 * @example
 * ```typescript
 * const originalDate = new Date(Date.UTC(2023, 0, 1));
 * const newDate = addToDate(originalDate, 5, Precision.DAY);
 * console.log(newDate); // Outputs: 2023-01-06T00:00:00.000Z
 * ```
 */
export function addToDate(date: Date, amount: number, unit: Precision): Date {
  const newDate = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    ),
  );
  switch (unit) {
    case Precision.MINUTE:
      newDate.setUTCMinutes(newDate.getUTCMinutes() + amount);
      break;
    case Precision.HOUR:
      newDate.setUTCHours(newDate.getUTCHours() + amount);
      break;
    case Precision.DAY:
      newDate.setUTCDate(newDate.getUTCDate() + amount);
      break;
    case Precision.WEEK:
      newDate.setUTCDate(newDate.getUTCDate() + amount * 7);
      break;
    case Precision.MONTH:
      newDate.setUTCMonth(newDate.getUTCMonth() + amount);
      if (newDate.getUTCDate() !== date.getUTCDate()) {
        newDate.setUTCDate(0); // Set to last day of previous month
      }
      break;
    case Precision.YEAR:
      newDate.setUTCFullYear(newDate.getUTCFullYear() + amount);
      break;
  }
  return newDate;
}

/**
 * Subtracts a specified amount of time from a given date.
 *
 * @param date - The original date from which to subtract.
 * @param amount - The amount of time to subtract.
 * @param unit - The unit of time to subtract (e.g., days, months, years).
 * @returns A new Date object with the specified amount of time subtracted.
 */
export function subtractFromDate(
  date: Date,
  amount: number,
  unit: Precision,
): Date {
  return addToDate(date, -amount, unit);
}

/**
 * Checks if two dates are on the same calendar day.
 *
 * @param date1 - The first date to compare.
 * @param date2 - The second date to compare.
 * @returns `true` if both dates are on the same day, otherwise `false`.
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Calculates the ISO week number for a given date.
 *
 * The ISO week date system is a leap week calendar system that is part of the ISO 8601 date and time standard.
 * It assigns a week number to each week of the year, where the first week of the year is the week that contains
 * the first Thursday of the year.
 *
 * @param date - The date object for which to calculate the week number.
 * @returns The ISO week number of the given date.
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Returns the quarter of the year for a given date.
 * 
 * @param date - The date object for which to determine the quarter.
 * @returns The quarter of the year (1, 2, 3, or 4).
 */
export function getQuarter(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1;
}

/**
 * Determines whether a given year is a leap year.
 *
 * A leap year is exactly divisible by 4 except for end-of-century years, which must be divisible by 400.
 * This means that the year 2000 was a leap year, although 1900 was not.
 *
 * @param year - The year to be checked.
 * @returns `true` if the year is a leap year, otherwise `false`.
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Returns the number of days in a given month of a specific year.
 *
 * @param year - The year for which to get the number of days in the month.
 * @param month - The month (0-indexed, where 0 = January, 11 = December) for which to get the number of days.
 * @returns The number of days in the specified month of the given year.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Formats a given date according to the specified format string.
 *
 * The format string can contain the following placeholders:
 * - `YYYY`: Full year (e.g., 2023)
 * - `MM`: Month (01-12)
 * - `DD`: Day of the month (01-31)
 * - `HH`: Hours (00-23)
 * - `mm`: Minutes (00-59)
 * - `ss`: Seconds (00-59)
 *
 * Example usage:
 * ```typescript
 * const date = new Date(2023, 0, 1, 12, 30, 45);
 * const formattedDate = formatDate(date, 'YYYY-MM-DD HH:mm:ss');
 * console.log(formattedDate); // Output: "2023-01-01 12:30:45"
 * ```
 *
 * @param date - The date object to format.
 * @param format - The format string.
 * @returns The formatted date string.
 */
export function formatDate(date: Date, format: string): string {
  const pad = (n: number): string => n.toString().padStart(2, '0');
  const map: { [key: string]: string } = {
    YYYY: date.getFullYear().toString(),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
  };
  return format.replace(/YYYY|MM|DD|HH|mm|ss/gi, (matched) => map[matched]);
}

/**
 * Parses a date string according to the specified format and returns a Date object.
 *
 * @param dateString - The date string to parse.
 * @param format - The format of the date string. Supported format parts are YYYY, MM, DD, HH, mm, ss.
 * @returns A Date object representing the parsed date.
 *
 * @example
 * ```typescript
 * const date = parseDate('2023-10-05 14:30:00', 'YYYY-MM-DD HH:mm:ss');
 * console.log(date); // Outputs: Thu Oct 05 2023 14:30:00 GMT+0000 (Coordinated Universal Time)
 * ```
 */
export function parseDate(dateString: string, format: string): Date {
  const map: { [key: string]: number } = {};
  const formatParts = format.match(/YYYY|MM|DD|HH|mm|ss/gi) || [];
  const dateParts = dateString.match(/\d+/g) || [];

  formatParts.forEach((part, index) => {
    map[part] = parseInt(dateParts[index]);
  });

  return new Date(
    map['YYYY'] || 0,
    (map['MM'] || 1) - 1,
    map['DD'] || 1,
    map['HH'] || 0,
    map['mm'] || 0,
    map['ss'] || 0,
  );
}

/**
 * Generates an array of numbers within a specified range.
 *
 * @param start - The starting number of the range.
 * @param end - The ending number of the range.
 * @param step - The step between each number in the range. Defaults to 1.
 * @returns An array of numbers from start to end, incremented by step.
 */
export function range(start: number, end: number, step: number = 1): number[] {
  return Array.from(
    { length: Math.floor((end - start) / step) + 1 },
    (_, i) => start + i * step,
  );
}
