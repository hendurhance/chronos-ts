import { Interval } from './interval';
import { getPrecisionInMilliseconds, Precision } from './precision';
import { getDatesWithInterval } from './utils';

export class Period {
  private startDate: Date;
  private endDate: Date;
  private precision: Precision;
  private interval: Interval | null;

  /**
   * Constructs a new Period instance.
   *
   * @param start - The start date of the period, either as a string or a Date object.
   * @param end - The end date of the period, either as a string or a Date object.
   * @param precision - The precision level of the period, defaulting to Precision.DAY.
   * @param interval - An optional interval associated with the period, defaulting to null.
   */
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

  /**
   * Retrieves the start date of the period.
   *
   * @returns {Date} The start date as a Date object.
   */
  getStartDate(): Date {
    return new Date(this.startDate);
  }

  /**
   * Retrieves the end date of the period.
   *
   * @returns {Date} The end date as a Date object.
   */
  getEndDate(): Date {
    return new Date(this.endDate);
  }

  /**
   * Checks if a given date is within the period defined by `startDate` and `endDate`.
   *
   * @param date - The date to check, either as a string or a Date object.
   * @returns `true` if the date is within the period, `false` otherwise.
   */
  contains(date: string | Date): boolean {
    const checkDate = new Date(date);
    return checkDate >= this.startDate && checkDate <= this.endDate;
  }

  /**
   * Determines if the current period overlaps with another period.
   *
   * @param other - The other period to compare with.
   * @returns `true` if the periods overlap, otherwise `false`.
   */
  overlapsWith(other: Period): boolean {
    return this.startDate < other.endDate && this.endDate > other.startDate;
  }

  /**
   * Determines if the current period is adjacent to another period.
   * 
   * Two periods are considered adjacent if they do not overlap and the gap 
   * between them is within one precision unit of the larger precision of the two periods.
   * 
   * @param other - The other period to compare with.
   * @returns `true` if the periods are adjacent, `false` otherwise.
   */
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

  /**
   * Retrieves an array of dates within the specified interval.
   * 
   * @returns {Date[] | null} An array of dates if the interval is defined, otherwise `null`.
   */
  getDatesInInterval(): Date[] | null {
    if (this.interval) {
      return getDatesWithInterval(this.startDate, this.endDate, this.interval);
    }
    return null;
  }

  /**
   * Calculates the number of minutes in the interval between the start and end dates.
   *
   * @returns {number} The number of minutes between the start and end dates.
   */
  getMinutesInInterval(): number {
    return Math.floor(
      (this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60),
    );
  }

  /**
   * Calculates the number of whole hours in the interval.
   *
   * @returns {number} The number of whole hours in the interval.
   */
  getHoursInInterval(): number {
    return Math.floor(this.getMinutesInInterval() / 60);
  }

  /**
   * Calculates the number of whole days in the interval.
   *
   * @returns The number of whole days in the interval.
   */
  getDaysInInterval(): number {
    return Math.floor(this.getHoursInInterval() / 24);
  }

  /**
   * Calculates the number of whole weeks in the interval.
   *
   * @returns The number of whole weeks in the interval.
   */
  getWeeksInInterval(): number {
    return Math.floor(this.getDaysInInterval() / 7);
  }

  /**
   * Calculates the number of whole months in the interval between the start and end dates.
   *
   * This method computes the difference in months between the `startDate` and `endDate` properties.
   * It adjusts for month boundaries by decrementing the month count if the end date's day is less than the start date's day.
   *
   * @returns {number} The number of whole months in the interval.
   */
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

  /**
   * Calculates the number of whole years in the interval.
   *
   * @returns The number of whole years in the interval.
   */
  getYearsInInterval(): number {
    return Math.floor(this.getMonthsInInterval() / 12);
  }

  /**
   * Calculates the length of the period in the specified precision.
   *
   * @returns {number} The length of the period, rounded down to the nearest whole number.
   */
  length(): number {
    return Math.floor(
      (this.endDate.getTime() - this.startDate.getTime()) /
        getPrecisionInMilliseconds(this.precision),
    );
  }

  /**
   * Determines the overlapping period between this period and another period.
   *
   * @param other - The other period to check for overlap with.
   * @returns The overlapping period as a new `Period` instance, or `null` if there is no overlap.
   */
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

  /**
   * Subtracts the given period from the current period and returns the resulting periods.
   * If the periods do not overlap, the current period is returned as a single-element array.
   * If they do overlap, the resulting periods are returned as an array.
   *
   * @param other - The period to subtract from the current period.
   * @returns An array of resulting periods after subtraction.
   */
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

  /**
   * Calculates the gap between this period and another period.
   * If the periods overlap or are adjacent, returns null.
   * Otherwise, returns a new Period representing the gap between the two periods.
   *
   * @param other - The other period to compare with.
   * @returns A new Period representing the gap, or null if the periods overlap or are adjacent.
   */
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

  /**
   * Computes the symmetric difference between this period and another period.
   * The symmetric difference is defined as the set of periods that are in either
   * of the two periods but not in their intersection.
   *
   * @param other - The other period to compute the symmetric difference with.
   * @returns An array of periods representing the symmetric difference, sorted
   *          by start date and merged if adjacent.
   */
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

  /**
   * Renews the current period by creating a new `Period` instance.
   * The new period starts immediately after the end of the current period
   * and has the same length and precision.
   *
   * @returns {Period} A new `Period` instance with updated start and end dates.
   */
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

  /**
   * Computes the union of this period with another period.
   * If the periods overlap or are adjacent, they are merged into a single period.
   * Otherwise, the periods are returned as separate, sorted periods.
   *
   * @param other - The other period to union with this period.
   * @returns An array of periods resulting from the union operation.
   */
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
  /**
   * Sets the start date for the period.
   *
   * @param start - The start date, which can be a string or a Date object.
   * @returns The current instance for method chaining.
   */
  setStart(start: string | Date): this {
    this.startDate = new Date(start);
    return this;
  }

  /**
   * Sets the end date for the period.
   *
   * @param end - The end date as a string or Date object.
   * @returns The current instance for method chaining.
   */
  setEnd(end: string | Date): this {
    this.endDate = new Date(end);
    return this;
  }

  /**
   * Sets the precision for the period.
   *
   * @param precision - The precision to set.
   * @returns The current instance for method chaining.
   */
  setPrecision(precision: Precision): this {
    this.precision = precision;
    return this;
  }

  /**
   * Sets the interval for the period.
   *
   * @param interval - The interval to be set.
   * @returns The current instance of the period.
   */
  setInterval(interval: Interval): this {
    this.interval = interval;
    return this;
  }
}
