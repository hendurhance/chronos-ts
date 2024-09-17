export class Interval {
  private minutes: number;
  private hours: number;
  private days: number;
  private weeks: number;
  private months: number;

  /**
   * Constructs a new instance of the Interval class.
   * 
   * @param minutes - The number of minutes (default is 0).
   * @param hours - The number of hours (default is 0).
   * @param days - The number of days (default is 0).
   * @param weeks - The number of weeks (default is 0).
   * @param months - The number of months (default is 0).
   */
  private constructor(
    minutes: number = 0,
    hours: number = 0,
    days: number = 0,
    weeks: number = 0,
    months: number = 0,
  ) {
    this.minutes = minutes;
    this.hours = hours;
    this.days = days;
    this.weeks = weeks;
    this.months = months;
  }

  /**
   * Creates an Interval instance representing the specified number of minutes.
   *
   * @param minutes - The number of minutes for the interval.
   * @returns An Interval instance representing the specified number of minutes.
   */
  static minutes(minutes: number): Interval {
    return new Interval(minutes);
  }

  /**
   * Creates an Interval instance representing the given number of hours.
   *
   * @param hours - The number of hours for the interval.
   * @returns An Interval instance with the specified hours.
   */
  static hours(hours: number): Interval {
    return new Interval(0, hours);
  }

  /**
   * Creates an Interval instance representing the specified number of days.
   *
   * @param days - The number of days for the interval.
   * @returns An Interval instance with the specified number of days.
   */
  static days(days: number): Interval {
    return new Interval(0, 0, days);
  }

  /**
   * Creates an Interval instance representing the specified number of weeks.
   *
   * @param weeks - The number of weeks for the interval.
   * @returns An Interval instance with the specified number of weeks.
   */
  static weeks(weeks: number): Interval {
    return new Interval(0, 0, 0, weeks);
  }

  /**
   * Creates an Interval instance representing a specified number of months.
   *
   * @param months - The number of months for the interval.
   * @returns An Interval instance with the specified number of months.
   */
  static months(months: number): Interval {
    return new Interval(0, 0, 0, 0, months);
  }

  /**
   * Calculates the total interval in minutes.
   *
   * This method sums up the minutes, hours, days, weeks, and months
   * to return the total interval in minutes.
   *
   * @returns {number} The total interval in minutes.
   */
  getMinutesInterval(): number {
    return (
      this.minutes +
      this.hours * 60 +
      this.days * 24 * 60 +
      this.weeks * 7 * 24 * 60 +
      this.months * 30 * 24 * 60
    );
  }
}
