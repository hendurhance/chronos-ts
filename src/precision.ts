export enum Precision {
  MINUTE = 'minute',
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

/**
 * Converts a given precision to its equivalent duration in milliseconds.
 *
 * @param precision - The precision to convert. It can be one of the following:
 * - `Precision.MINUTE`: 1 minute in milliseconds.
 * - `Precision.HOUR`: 1 hour in milliseconds.
 * - `Precision.DAY`: 1 day in milliseconds.
 * - `Precision.WEEK`: 1 week in milliseconds.
 * - `Precision.MONTH`: 1 month (approximated as 30 days) in milliseconds.
 * - `Precision.YEAR`: 1 year (approximated as 365 days) in milliseconds.
 *
 * @returns The duration in milliseconds corresponding to the given precision.
 *
 * @throws Will throw an error if the provided precision is not supported.
 */
export function getPrecisionInMilliseconds(precision: Precision): number {
  switch (precision) {
    case Precision.MINUTE:
      return 1000 * 60;
    case Precision.HOUR:
      return 1000 * 60 * 60;
    case Precision.DAY:
      return 1000 * 60 * 60 * 24;
    case Precision.WEEK:
      return 1000 * 60 * 60 * 24 * 7;
    case Precision.MONTH:
      return 1000 * 60 * 60 * 24 * 30;
    case Precision.YEAR:
      return 1000 * 60 * 60 * 24 * 365;
    default:
      throw new Error('Unsupported precision');
  }
}
