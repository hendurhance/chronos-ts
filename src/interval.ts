export class Interval {
  private minutes: number;
  private hours: number;
  private days: number;
  private weeks: number;
  private months: number;

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

  static minutes(minutes: number): Interval {
    return new Interval(minutes);
  }

  static hours(hours: number): Interval {
    return new Interval(0, hours);
  }

  static days(days: number): Interval {
    return new Interval(0, 0, days);
  }

  static weeks(weeks: number): Interval {
    return new Interval(0, 0, 0, weeks);
  }

  static months(months: number): Interval {
    return new Interval(0, 0, 0, 0, months);
  }

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
