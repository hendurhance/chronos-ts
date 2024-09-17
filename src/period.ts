import { Interval } from './interval';
import { getPrecisionInMilliseconds, Precision } from './precision';
import { getDatesWithInterval } from './utils';

export class Period {
  private startDate: Date;
  private endDate: Date;
  private precision: Precision;
  private interval: Interval | null;

  constructor(
    start: string | Date,
    end: string | Date,
    precision: Precision = Precision.DAY,
    interval: Interval | null = null,
  ) {
    this.startDate = new Date(start);
    this.endDate = new Date(end);
    this.precision = precision;
    this.interval = interval;
  }

  getStartDate(): Date {
    return new Date(this.startDate);
  }

  getEndDate(): Date {
    return new Date(this.endDate);
  }

  contains(date: string | Date): boolean {
    const checkDate = new Date(date);
    return checkDate >= this.startDate && checkDate <= this.endDate;
  }

  overlapsWith(other: Period): boolean {
    return this.startDate < other.endDate && this.endDate > other.startDate;
  }

  isAdjacentTo(other: Period): boolean {
    const thisPrecisionMs = getPrecisionInMilliseconds(this.precision);
    const otherPrecisionMs = getPrecisionInMilliseconds(other.precision);
    const maxPrecisionMs = Math.max(thisPrecisionMs, otherPrecisionMs);

    const thisEndTime = this.endDate.getTime();
    const otherStartTime = other.startDate.getTime();
    const thisStartTime = this.startDate.getTime();
    const otherEndTime = other.endDate.getTime();

    // Check for overlap
    if (thisStartTime <= otherEndTime && otherStartTime <= thisEndTime) {
      return false;
    }

    // Check if the gap between periods is within one precision unit
    const gap = Math.abs(otherStartTime - thisEndTime);
    const reverseGap = Math.abs(thisStartTime - otherEndTime);

    return (
      (gap > 0 && gap <= maxPrecisionMs) ||
      (reverseGap > 0 && reverseGap <= maxPrecisionMs)
    );
  }

  getDatesInInterval(): Date[] | null {
    if (this.interval) {
      return getDatesWithInterval(this.startDate, this.endDate, this.interval);
    }
    return null;
  }

  getMinutesInInterval(): number {
    return Math.floor(
      (this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60),
    );
  }

  getHoursInInterval(): number {
    return Math.floor(this.getMinutesInInterval() / 60);
  }

  getDaysInInterval(): number {
    return Math.floor(this.getHoursInInterval() / 24);
  }

  getWeeksInInterval(): number {
    return Math.floor(this.getDaysInInterval() / 7);
  }

  getMonthsInInterval(): number {
    let months =
      (this.endDate.getFullYear() - this.startDate.getFullYear()) * 12;
    months += this.endDate.getMonth() - this.startDate.getMonth();

    // Adjust for month boundaries
    if (this.endDate.getDate() < this.startDate.getDate()) {
      months--;
    }

    return months;
  }

  getYearsInInterval(): number {
    return Math.floor(this.getMonthsInInterval() / 12);
  }

  length(): number {
    return Math.floor(
      (this.endDate.getTime() - this.startDate.getTime()) /
        getPrecisionInMilliseconds(this.precision),
    );
  }

  overlap(other: Period): Period | null {
    if (!this.overlapsWith(other)) {
      return null;
    }
    const start = new Date(
      Math.max(this.startDate.getTime(), other.startDate.getTime()),
    );
    const end = new Date(
      Math.min(this.endDate.getTime(), other.endDate.getTime()),
    );
    return new Period(start, end, this.precision);
  }

  subtract(other: Period): Period[] {
    if (!this.overlapsWith(other)) {
      return [this];
    }

    const periods: Period[] = [];

    if (this.startDate < other.startDate) {
      const endDate = new Date(other.startDate.getTime() - 1);
      periods.push(new Period(this.startDate, endDate, this.precision));
    }
    if (this.endDate > other.endDate) {
      const startDate = new Date(other.endDate.getTime() + 1);
      periods.push(new Period(startDate, this.endDate, this.precision));
    }
    return periods;
  }

  gap(other: Period): Period | null {
    if (this.overlapsWith(other) || this.isAdjacentTo(other)) {
      return null;
    }

    const precisionMs = getPrecisionInMilliseconds(this.precision);
    const start = this.endDate < other.startDate ? this.endDate : other.endDate;
    const end =
      this.startDate > other.startDate ? this.startDate : other.startDate;

    return new Period(
      new Date(start.getTime() + precisionMs),
      new Date(end.getTime() - precisionMs),
      this.precision,
    );
  }

  symmetricDifference(other: Period): Period[] {
    const periods: Period[] = [];

    const overlapPeriod = this.overlap(other);

    if (!overlapPeriod) {
      // No overlap, return both periods
      return [this, other].sort(
        (a, b) => a.startDate.getTime() - b.startDate.getTime(),
      );
    }

    const thisSubtracted = this.subtract(overlapPeriod);
    const otherSubtracted = other.subtract(overlapPeriod);

    periods.push(...thisSubtracted, ...otherSubtracted);

    // Sort periods and merge adjacent ones
    return this.mergeAdjacentPeriods(periods);
  }

  private mergeAdjacentPeriods(periods: Period[]): Period[] {
    if (periods.length <= 1) return periods;

    periods.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    const merged: Period[] = [periods[0]];

    for (let i = 1; i < periods.length; i++) {
      const current = periods[i];
      const previous = merged[merged.length - 1];

      if (previous.isAdjacentTo(current) || previous.overlapsWith(current)) {
        merged[merged.length - 1] = new Period(
          previous.startDate,
          current.endDate > previous.endDate
            ? current.endDate
            : previous.endDate,
          this.precision,
        );
      } else {
        merged.push(current);
      }
    }

    return merged;
  }

  renew(): Period {
    const length = this.length();
    const newStart = new Date(
      this.endDate.getTime() + getPrecisionInMilliseconds(this.precision),
    );
    const newEnd = new Date(
      newStart.getTime() + length * getPrecisionInMilliseconds(this.precision),
    );
    return new Period(newStart, newEnd, this.precision, this.interval);
  }

  union(other: Period): Period[] {
    if (this.overlapsWith(other) || this.isAdjacentTo(other)) {
      const start = new Date(
        Math.min(this.startDate.getTime(), other.startDate.getTime()),
      );
      const end = new Date(
        Math.max(this.endDate.getTime(), other.endDate.getTime()),
      );
      return [new Period(start, end, this.precision)];
    }
    return [this, other].sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime(),
    );
  }

  // Fluent API methods
  setStart(start: string | Date): this {
    this.startDate = new Date(start);
    return this;
  }

  setEnd(end: string | Date): this {
    this.endDate = new Date(end);
    return this;
  }

  setPrecision(precision: Precision): this {
    this.precision = precision;
    return this;
  }

  setInterval(interval: Interval): this {
    this.interval = interval;
    return this;
  }
}
