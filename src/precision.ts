export enum Precision {
  MINUTE = 'minute',
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

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
