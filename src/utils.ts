import { Interval } from './interval';
import { Precision } from './precision';

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

export function subtractFromDate(
  date: Date,
  amount: number,
  unit: Precision,
): Date {
  return addToDate(date, -amount, unit);
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getQuarter(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

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

export function range(start: number, end: number, step: number = 1): number[] {
  return Array.from(
    { length: Math.floor((end - start) / step) + 1 },
    (_, i) => start + i * step,
  );
}
