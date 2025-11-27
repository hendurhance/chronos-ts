/**
 * ChronosPeriodCollection - Manage collections of ChronosPeriod
 * Inspired by spatie/period PHP library
 * @see https://github.com/spatie/period
 */
import { ChronosPeriod } from './period';
import { Chronos } from './chronos';
import { DateInput } from '../types';

/**
 * ChronosPeriodCollection - A collection of periods with powerful operations
 *
 * Inspired by spatie/period, this class provides a rich API for working with
 * collections of time periods including overlap detection, gap analysis,
 * and set operations.
 *
 * @example
 * ```typescript
 * const collection = new ChronosPeriodCollection([
 *   ChronosPeriod.create('2024-01-01', '2024-01-15'),
 *   ChronosPeriod.create('2024-01-10', '2024-01-25'),
 *   ChronosPeriod.create('2024-02-01', '2024-02-15'),
 * ]);
 *
 * // Find overlapping periods
 * const overlapping = collection.overlapAll();
 *
 * // Get gaps between periods
 * const gaps = collection.gaps();
 *
 * // Get boundaries
 * const boundaries = collection.boundaries();
 * ```
 */
export class ChronosPeriodCollection implements Iterable<ChronosPeriod> {
  private _periods: ChronosPeriod[];

  // ============================================================================
  // Constructor & Factory Methods
  // ============================================================================

  constructor(periods: ChronosPeriod[] = []) {
    this._periods = [...periods];
  }

  /**
   * Create a new collection from periods
   */
  static create(...periods: ChronosPeriod[]): ChronosPeriodCollection {
    return new ChronosPeriodCollection(periods);
  }

  /**
   * Create an empty collection
   */
  static empty(): ChronosPeriodCollection {
    return new ChronosPeriodCollection();
  }

  /**
   * Create a collection from an array of date pairs
   */
  static fromDatePairs(
    pairs: Array<[DateInput, DateInput]>,
  ): ChronosPeriodCollection {
    const periods = pairs.map(([start, end]) =>
      ChronosPeriod.create(start, end),
    );
    return new ChronosPeriodCollection(periods);
  }

  // ============================================================================
  // Basic Operations
  // ============================================================================

  /** Add a period to the collection */
  add(period: ChronosPeriod): this {
    this._periods.push(period);
    return this;
  }

  /** Add multiple periods */
  addAll(periods: ChronosPeriod[]): this {
    this._periods.push(...periods);
    return this;
  }

  /** Get a shallow copy of periods */
  toArray(): ChronosPeriod[] {
    return [...this._periods];
  }

  /** Get the number of periods in the collection */
  get length(): number {
    return this._periods.length;
  }

  /** Check if collection is empty */
  isEmpty(): boolean {
    return this._periods.length === 0;
  }

  /** Check if collection is not empty */
  isNotEmpty(): boolean {
    return this._periods.length > 0;
  }

  /** Get a period at a specific index */
  get(index: number): ChronosPeriod | undefined {
    return this._periods[index];
  }

  /** Get the first period */
  first(): ChronosPeriod | undefined {
    return this._periods[0];
  }

  /** Get the last period */
  last(): ChronosPeriod | undefined {
    return this._periods[this._periods.length - 1];
  }

  /** Clear collection */
  clear(): this {
    this._periods = [];
    return this;
  }

  // ============================================================================
  // Iteration
  // ============================================================================

  /** Iterator implementation */
  *[Symbol.iterator](): Iterator<ChronosPeriod> {
    for (const period of this._periods) {
      yield period;
    }
  }

  /** ForEach iteration */
  forEach(callback: (period: ChronosPeriod, index: number) => void): void {
    this._periods.forEach(callback);
  }

  /** Map periods to a new array */
  map<T>(callback: (period: ChronosPeriod, index: number) => T): T[] {
    return this._periods.map(callback);
  }

  /** Filter periods */
  filter(
    predicate: (period: ChronosPeriod, index: number) => boolean,
  ): ChronosPeriodCollection {
    return new ChronosPeriodCollection(this._periods.filter(predicate));
  }

  /** Reduce periods to a single value */
  reduce<T>(
    callback: (acc: T, period: ChronosPeriod, index: number) => T,
    initial: T,
  ): T {
    return this._periods.reduce(callback, initial);
  }

  /** Find a period matching a predicate */
  find(
    predicate: (period: ChronosPeriod, index: number) => boolean,
  ): ChronosPeriod | undefined {
    return this._periods.find(predicate);
  }

  /** Check if any period matches a predicate */
  some(predicate: (period: ChronosPeriod, index: number) => boolean): boolean {
    return this._periods.some(predicate);
  }

  /** Check if all periods match a predicate */
  every(predicate: (period: ChronosPeriod, index: number) => boolean): boolean {
    return this._periods.every(predicate);
  }

  // ============================================================================
  // Boundaries (spatie/period inspired)
  // ============================================================================

  /**
   * Get the overall boundaries of the collection
   * Returns a period from the earliest start to the latest end
   */
  boundaries(): ChronosPeriod | null {
    if (this._periods.length === 0) return null;

    let earliestStart: Chronos | null = null;
    let latestEnd: Chronos | null = null;

    for (const period of this._periods) {
      if (!earliestStart || period.start.isBefore(earliestStart)) {
        earliestStart = period.start;
      }
      const end = period.end ?? period.last();
      if (end && (!latestEnd || end.isAfter(latestEnd))) {
        latestEnd = end;
      }
    }

    if (!earliestStart) return null;

    return ChronosPeriod.create(earliestStart, latestEnd ?? earliestStart);
  }

  /**
   * Get the earliest start date across all periods
   */
  start(): Chronos | null {
    if (this._periods.length === 0) return null;

    let earliest: Chronos | null = null;
    for (const period of this._periods) {
      if (!earliest || period.start.isBefore(earliest)) {
        earliest = period.start;
      }
    }
    return earliest;
  }

  /**
   * Get the latest end date across all periods
   */
  end(): Chronos | null {
    if (this._periods.length === 0) return null;

    let latest: Chronos | null = null;
    for (const period of this._periods) {
      const end = period.end ?? period.last();
      if (end && (!latest || end.isAfter(latest))) {
        latest = end;
      }
    }
    return latest;
  }

  // ============================================================================
  // Overlap Operations (spatie/period inspired)
  // ============================================================================

  /** Normalize and merge overlapping/adjacent periods */
  normalize(): ChronosPeriod[] {
    if (this._periods.length === 0) return [];

    // Sort by start
    const sorted = this._periods.slice().sort((a, b) => {
      const aStart = a.start.toDate().getTime();
      const bStart = b.start.toDate().getTime();
      return aStart - bStart;
    });

    const merged: ChronosPeriod[] = [];
    let current = sorted[0].clone();

    for (let i = 1; i < sorted.length; i++) {
      const next = sorted[i];
      const union = current.union(next as ChronosPeriod);
      if (union) {
        current = union;
      } else {
        merged.push(current);
        current = next.clone();
      }
    }

    merged.push(current);
    return merged;
  }

  /** Check if any period overlaps with the provided period */
  overlaps(period: ChronosPeriod): boolean {
    return this._periods.some((p) => p.overlaps(period));
  }

  /**
   * Check if any period in the collection overlaps with any other period
   * in the collection (internal overlaps)
   */
  overlapAny(): boolean {
    for (let i = 0; i < this._periods.length; i++) {
      for (let j = i + 1; j < this._periods.length; j++) {
        if (this._periods[i].overlaps(this._periods[j])) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get all overlapping period segments across the collection
   * Returns periods where two or more periods in the collection overlap
   */
  overlapAll(): ChronosPeriodCollection {
    if (this._periods.length < 2) {
      return ChronosPeriodCollection.empty();
    }

    const overlaps: ChronosPeriod[] = [];

    // Sort periods by start date
    const sorted = this._periods
      .slice()
      .sort((a, b) => a.start.toDate().getTime() - b.start.toDate().getTime());

    // Find all pairwise intersections
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const intersection = sorted[i].intersect(sorted[j]);
        if (intersection) {
          // Check if this intersection is not already covered
          const isDuplicate = overlaps.some(
            (existing) =>
              existing.start.isSame(intersection.start, 'day') &&
              existing.end?.isSame(
                intersection.end ?? (null as unknown as Chronos),
                'day',
              ),
          );
          if (!isDuplicate) {
            overlaps.push(intersection);
          }
        }
      }
    }

    return new ChronosPeriodCollection(overlaps);
  }

  /** Return intersections between collection and a given period */
  intersect(period: ChronosPeriod): ChronosPeriodCollection {
    const intersections: ChronosPeriod[] = [];
    for (const p of this._periods) {
      const inter = p.intersect(period);
      if (inter) intersections.push(inter);
    }
    return new ChronosPeriodCollection(intersections);
  }

  /**
   * Get intersection of all periods in the collection
   * Returns the period where ALL periods overlap (if any)
   */
  intersectAll(): ChronosPeriod | null {
    if (this._periods.length === 0) return null;
    if (this._periods.length === 1) return this._periods[0].clone();

    let result: ChronosPeriod | null = this._periods[0].clone();

    for (let i = 1; i < this._periods.length; i++) {
      if (!result) return null;
      result = result.intersect(this._periods[i]);
    }

    return result;
  }

  // ============================================================================
  // Union Operations
  // ============================================================================

  /** Return the union (merged) of all periods in the collection */
  union(): ChronosPeriodCollection {
    return new ChronosPeriodCollection(this.normalize());
  }

  /**
   * Alias for normalize() - returns merged periods
   * @deprecated Use union() instead
   */
  unionAll(): ChronosPeriod[] {
    return this.normalize();
  }

  /** Merge collection into a single union period if contiguous/overlapping */
  mergeToSingle(): ChronosPeriod | null {
    const merged = this.normalize();
    if (merged.length === 0) return null;
    if (merged.length === 1) return merged[0];

    // If there are multiple, they are not adjacent/overlapping, cannot merge into single
    return null;
  }

  // ============================================================================
  // Gap Operations (spatie/period inspired)
  // ============================================================================

  /** Return gaps between merged periods */
  gaps(): ChronosPeriodCollection {
    const merged = this.normalize();
    const gaps: ChronosPeriod[] = [];

    for (let i = 0; i < merged.length - 1; i++) {
      const end = merged[i].end ?? merged[i].last();
      const startNext = merged[i + 1].start;

      if (end && startNext) {
        const gapStart = end.add({ days: 1 });
        const gapEnd = startNext.subtract({ days: 1 });

        // Only create gap if there's actual space between periods
        if (gapStart.isSameOrBefore(gapEnd)) {
          gaps.push(ChronosPeriod.create(gapStart, gapEnd));
        }
      }
    }

    return new ChronosPeriodCollection(gaps);
  }

  /**
   * Check if there are any gaps between periods
   */
  hasGaps(): boolean {
    return this.gaps().isNotEmpty();
  }

  // ============================================================================
  // Subtraction Operations (spatie/period inspired)
  // ============================================================================

  /**
   * Subtract a period from all periods in the collection
   * Returns periods with the subtracted portion removed
   */
  subtract(period: ChronosPeriod): ChronosPeriodCollection {
    const results: ChronosPeriod[] = [];

    for (const p of this._periods) {
      const diffs = p.diff(period);
      results.push(...diffs);
    }

    return new ChronosPeriodCollection(results);
  }

  /**
   * Subtract multiple periods from the collection
   */
  subtractAll(periods: ChronosPeriod[]): ChronosPeriodCollection {
    let result = new ChronosPeriodCollection([...this._periods]);

    for (const period of periods) {
      result = result.subtract(period);
    }

    return result;
  }

  // ============================================================================
  // Touching/Adjacent Operations (spatie/period inspired)
  // ============================================================================

  /**
   * Check if any period touches (is adjacent to) the given period
   * Two periods touch if one ends exactly where the other begins
   */
  touchesWith(period: ChronosPeriod): boolean {
    return this._periods.some((p) => this._periodsTouch(p, period));
  }

  /**
   * Check if two periods touch (are adjacent)
   */
  private _periodsTouch(a: ChronosPeriod, b: ChronosPeriod): boolean {
    const aEnd = a.end ?? a.last();
    const bEnd = b.end ?? b.last();

    if (!aEnd || !bEnd) return false;

    // a ends exactly where b starts
    if (aEnd.add({ days: 1 }).isSame(b.start, 'day')) return true;

    // b ends exactly where a starts
    if (bEnd.add({ days: 1 }).isSame(a.start, 'day')) return true;

    return false;
  }

  /**
   * Get all periods that touch the given period
   */
  touchingPeriods(period: ChronosPeriod): ChronosPeriodCollection {
    return this.filter((p) => this._periodsTouch(p, period));
  }

  // ============================================================================
  // Contains Operations (spatie/period inspired)
  // ============================================================================

  /**
   * Check if a date is contained in any period of the collection
   */
  contains(date: DateInput): boolean {
    const target = Chronos.parse(date);
    return this._periods.some((p) => p.contains(target));
  }

  /**
   * Check if a period is fully contained in any period of the collection
   */
  containsPeriod(period: ChronosPeriod): boolean {
    return this._periods.some((p) => {
      const pEnd = p.end ?? p.last();
      const periodEnd = period.end ?? period.last();

      if (!pEnd || !periodEnd) return false;

      return (
        p.start.isSameOrBefore(period.start) && pEnd.isSameOrAfter(periodEnd)
      );
    });
  }

  // ============================================================================
  // Equality Operations (spatie/period inspired)
  // ============================================================================

  /**
   * Check if two collections are equal (same periods)
   */
  equals(other: ChronosPeriodCollection): boolean {
    if (this._periods.length !== other._periods.length) {
      return false;
    }

    const thisSorted = this._sortedByStart();
    const otherSorted = other._sortedByStart();

    for (let i = 0; i < thisSorted.length; i++) {
      const thisEnd = thisSorted[i].end ?? thisSorted[i].last();
      const otherEnd = otherSorted[i].end ?? otherSorted[i].last();

      if (!thisSorted[i].start.isSame(otherSorted[i].start, 'day')) {
        return false;
      }
      if (thisEnd && otherEnd && !thisEnd.isSame(otherEnd, 'day')) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get periods sorted by start date
   */
  private _sortedByStart(): ChronosPeriod[] {
    return this._periods
      .slice()
      .sort((a, b) => a.start.toDate().getTime() - b.start.toDate().getTime());
  }

  // ============================================================================
  // Sorting & Reversing
  // ============================================================================

  /**
   * Sort periods by start date (ascending)
   */
  sortByStart(): ChronosPeriodCollection {
    return new ChronosPeriodCollection(this._sortedByStart());
  }

  /**
   * Sort periods by end date (ascending)
   */
  sortByEnd(): ChronosPeriodCollection {
    const sorted = this._periods.slice().sort((a, b) => {
      const aEnd = (a.end ?? a.last())?.toDate().getTime() ?? 0;
      const bEnd = (b.end ?? b.last())?.toDate().getTime() ?? 0;
      return aEnd - bEnd;
    });
    return new ChronosPeriodCollection(sorted);
  }

  /**
   * Sort periods by duration (ascending)
   */
  sortByDuration(): ChronosPeriodCollection {
    const sorted = this._periods.slice().sort((a, b) => {
      try {
        return a.days() - b.days();
      } catch {
        return 0;
      }
    });
    return new ChronosPeriodCollection(sorted);
  }

  /**
   * Reverse the order of periods
   */
  reverse(): ChronosPeriodCollection {
    return new ChronosPeriodCollection([...this._periods].reverse());
  }

  // ============================================================================
  // Conversion & Output
  // ============================================================================

  /**
   * Convert to JSON
   */
  toJSON(): object[] {
    return this._periods.map((p) => p.toJSON());
  }

  /**
   * Convert to string
   */
  toString(): string {
    if (this._periods.length === 0) return '(empty collection)';
    return this._periods.map((p) => p.toString()).join(', ');
  }

  /**
   * Get total duration across all periods (in days)
   * Note: Overlapping portions may be counted multiple times
   */
  totalDays(): number {
    return this._periods.reduce((sum, p) => {
      try {
        return sum + p.days();
      } catch {
        return sum;
      }
    }, 0);
  }

  /**
   * Get total unique duration (merged periods, no double-counting)
   */
  uniqueDays(): number {
    const merged = this.normalize();
    return merged.reduce((sum, p) => {
      try {
        return sum + p.days();
      } catch {
        return sum;
      }
    }, 0);
  }
}
