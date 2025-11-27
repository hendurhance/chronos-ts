import { ChronosPeriodCollection } from '../src/core/periodCollection';
import { ChronosPeriod } from '../src/core/period';
import { Chronos } from '../src/core/chronos';

describe('ChronosPeriodCollection', () => {
  // ============================================================================
  // Factory Methods
  // ============================================================================

  describe('Factory Methods', () => {
    test('constructor creates empty collection', () => {
      const collection = new ChronosPeriodCollection();

      expect(collection.isEmpty()).toBe(true);
      expect(collection.length).toBe(0);
    });

    test('constructor accepts array of periods', () => {
      const periods = [
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
        ChronosPeriod.create('2024-02-01', '2024-02-15'),
      ];
      const collection = new ChronosPeriodCollection(periods);

      expect(collection.length).toBe(2);
    });

    test('create() creates collection from variadic periods', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
        ChronosPeriod.create('2024-02-01', '2024-02-15'),
      );

      expect(collection.length).toBe(2);
    });

    test('empty() creates empty collection', () => {
      const collection = ChronosPeriodCollection.empty();

      expect(collection.isEmpty()).toBe(true);
    });

    test('fromDatePairs() creates collection from date pairs', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
        ['2024-03-01', '2024-03-15'],
      ]);

      expect(collection.length).toBe(3);
      expect(collection.first()?.start.format('YYYY-MM-DD')).toBe('2024-01-01');
    });
  });

  // ============================================================================
  // Basic Operations
  // ============================================================================

  describe('Basic Operations', () => {
    test('add() adds a period', () => {
      const collection = new ChronosPeriodCollection();
      collection.add(ChronosPeriod.create('2024-01-01', '2024-01-15'));

      expect(collection.length).toBe(1);
    });

    test('add() returns this for chaining', () => {
      const collection = new ChronosPeriodCollection();
      const result = collection.add(ChronosPeriod.create('2024-01-01', '2024-01-15'));

      expect(result).toBe(collection);
    });

    test('addAll() adds multiple periods', () => {
      const collection = new ChronosPeriodCollection();
      collection.addAll([
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
        ChronosPeriod.create('2024-02-01', '2024-02-15'),
      ]);

      expect(collection.length).toBe(2);
    });

    test('toArray() returns shallow copy of periods', () => {
      const periods = [
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
        ChronosPeriod.create('2024-02-01', '2024-02-15'),
      ];
      const collection = new ChronosPeriodCollection(periods);
      const array = collection.toArray();

      expect(array.length).toBe(2);
      expect(array).not.toBe(periods); // Different array instance
    });

    test('get() returns period at index', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
      ]);

      expect(collection.get(0)?.start.format('YYYY-MM-DD')).toBe('2024-01-01');
      expect(collection.get(1)?.start.format('YYYY-MM-DD')).toBe('2024-02-01');
      expect(collection.get(99)).toBeUndefined();
    });

    test('first() returns first period', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
      ]);

      expect(collection.first()?.start.format('YYYY-MM-DD')).toBe('2024-01-01');
    });

    test('first() returns undefined for empty collection', () => {
      const collection = ChronosPeriodCollection.empty();

      expect(collection.first()).toBeUndefined();
    });

    test('last() returns last period', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
      ]);

      expect(collection.last()?.start.format('YYYY-MM-DD')).toBe('2024-02-01');
    });

    test('clear() removes all periods', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
      ]);

      collection.clear();

      expect(collection.isEmpty()).toBe(true);
      expect(collection.length).toBe(0);
    });

    test('isEmpty() returns true for empty collection', () => {
      expect(ChronosPeriodCollection.empty().isEmpty()).toBe(true);
    });

    test('isEmpty() returns false for non-empty collection', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
      ]);

      expect(collection.isEmpty()).toBe(false);
    });

    test('isNotEmpty() returns opposite of isEmpty()', () => {
      const empty = ChronosPeriodCollection.empty();
      const nonEmpty = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
      ]);

      expect(empty.isNotEmpty()).toBe(false);
      expect(nonEmpty.isNotEmpty()).toBe(true);
    });
  });

  // ============================================================================
  // Iteration
  // ============================================================================

  describe('Iteration', () => {
    test('supports for...of iteration', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
        ['2024-03-01', '2024-03-15'],
      ]);

      const periods: ChronosPeriod[] = [];
      for (const period of collection) {
        periods.push(period);
      }

      expect(periods.length).toBe(3);
    });

    test('forEach() iterates with callback', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
      ]);

      const indices: number[] = [];
      collection.forEach((period, index) => {
        indices.push(index);
      });

      expect(indices).toEqual([0, 1]);
    });

    test('map() transforms periods', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
      ]);

      const starts = collection.map(period => period.start.format('YYYY-MM'));

      expect(starts).toEqual(['2024-01', '2024-02']);
    });

    test('filter() returns filtered collection', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-28'],
        ['2024-03-01', '2024-03-15'],
      ]);

      const filtered = collection.filter(period => period.days() > 20);

      expect(filtered.length).toBe(1);
      expect(filtered.first()?.start.month).toBe(2);
    });

    test('reduce() aggregates values', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-10'],
        ['2024-02-01', '2024-02-10'],
        ['2024-03-01', '2024-03-10'],
      ]);

      const totalDays = collection.reduce((acc, period) => acc + period.days(), 0);

      expect(totalDays).toBe(27); // 9 + 9 + 9
    });

    test('find() returns first matching period', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-28'],
        ['2024-03-01', '2024-03-15'],
      ]);

      const found = collection.find(period => period.days() > 20);

      expect(found?.start.month).toBe(2);
    });

    test('find() returns undefined if not found', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
      ]);

      const found = collection.find(period => period.days() > 100);

      expect(found).toBeUndefined();
    });

    test('some() returns true if any match', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-28'],
      ]);

      expect(collection.some(p => p.days() > 20)).toBe(true);
      expect(collection.some(p => p.days() > 100)).toBe(false);
    });

    test('every() returns true if all match', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
      ]);

      expect(collection.every(p => p.days() > 10)).toBe(true);
      expect(collection.every(p => p.days() > 20)).toBe(false);
    });
  });

  // ============================================================================
  // Boundaries (spatie/period inspired)
  // ============================================================================

  describe('Boundaries', () => {
    test('boundaries() returns overall period', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-02-01', '2024-02-15'],
        ['2024-01-01', '2024-01-15'],
        ['2024-03-01', '2024-03-31'],
      ]);

      const boundaries = collection.boundaries();

      expect(boundaries?.start.format('YYYY-MM-DD')).toBe('2024-01-01');
      expect(boundaries?.end?.format('YYYY-MM-DD')).toBe('2024-03-31');
    });

    test('boundaries() returns null for empty collection', () => {
      const collection = ChronosPeriodCollection.empty();

      expect(collection.boundaries()).toBeNull();
    });

    test('start() returns earliest start date', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-02-01', '2024-02-15'],
        ['2024-01-01', '2024-01-15'],
        ['2024-03-01', '2024-03-31'],
      ]);

      expect(collection.start()?.format('YYYY-MM-DD')).toBe('2024-01-01');
    });

    test('start() returns null for empty collection', () => {
      expect(ChronosPeriodCollection.empty().start()).toBeNull();
    });

    test('end() returns latest end date', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-02-01', '2024-02-15'],
        ['2024-01-01', '2024-01-15'],
        ['2024-03-01', '2024-03-31'],
      ]);

      expect(collection.end()?.format('YYYY-MM-DD')).toBe('2024-03-31');
    });

    test('end() returns null for empty collection', () => {
      expect(ChronosPeriodCollection.empty().end()).toBeNull();
    });
  });

  // ============================================================================
  // Overlap Operations (spatie/period inspired)
  // ============================================================================

  describe('Overlap Operations', () => {
    test('normalize() merges overlapping periods', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-01-10', '2024-01-25'],
        ['2024-02-01', '2024-02-15'],
      ]);

      const normalized = collection.normalize();

      expect(normalized.length).toBe(2);
      expect(normalized[0].start.format('YYYY-MM-DD')).toBe('2024-01-01');
      expect(normalized[0].end?.format('YYYY-MM-DD')).toBe('2024-01-25');
    });

    test('normalize() handles non-overlapping periods', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
        ['2024-03-01', '2024-03-15'],
      ]);

      const normalized = collection.normalize();

      expect(normalized.length).toBe(3);
    });

    test('overlaps() checks if any period overlaps', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
      ]);

      const overlapping = ChronosPeriod.create('2024-01-10', '2024-01-20');
      const nonOverlapping = ChronosPeriod.create('2024-03-01', '2024-03-15');

      expect(collection.overlaps(overlapping)).toBe(true);
      expect(collection.overlaps(nonOverlapping)).toBe(false);
    });

    test('overlapAny() detects internal overlaps', () => {
      const overlapping = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-01-10', '2024-01-25'],
      ]);

      const nonOverlapping = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
      ]);

      expect(overlapping.overlapAny()).toBe(true);
      expect(nonOverlapping.overlapAny()).toBe(false);
    });

    test('overlapAll() returns overlapping segments', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-20'],
        ['2024-01-10', '2024-01-25'],
        ['2024-02-01', '2024-02-15'],
      ]);

      const overlaps = collection.overlapAll();

      expect(overlaps.isNotEmpty()).toBe(true);
      // The overlap between first two periods is 2024-01-10 to 2024-01-20
    });

    test('overlapAll() returns empty for non-overlapping', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
        ['2024-03-01', '2024-03-15'],
      ]);

      const overlaps = collection.overlapAll();

      expect(overlaps.isEmpty()).toBe(true);
    });

    test('intersect() returns intersections with a period', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-20'],
        ['2024-02-01', '2024-02-20'],
      ]);

      const testPeriod = ChronosPeriod.create('2024-01-10', '2024-02-10');
      const intersections = collection.intersect(testPeriod);

      expect(intersections.length).toBe(2);
    });

    test('intersectAll() returns intersection of all periods', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-31'],
        ['2024-01-10', '2024-01-25'],
        ['2024-01-15', '2024-01-20'],
      ]);

      const intersection = collection.intersectAll();

      expect(intersection?.start.format('YYYY-MM-DD')).toBe('2024-01-15');
      expect(intersection?.end?.format('YYYY-MM-DD')).toBe('2024-01-20');
    });

    test('intersectAll() returns null for non-overlapping periods', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
      ]);

      expect(collection.intersectAll()).toBeNull();
    });
  });

  // ============================================================================
  // Union Operations
  // ============================================================================

  describe('Union Operations', () => {
    test('union() returns merged collection', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-01-10', '2024-01-25'],
      ]);

      const unioned = collection.union();

      expect(unioned.length).toBe(1);
    });

    test('unionAll() returns normalized array', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-01-10', '2024-01-25'],
      ]);

      const merged = collection.unionAll();

      expect(merged.length).toBe(1);
    });

    test('mergeToSingle() merges contiguous periods', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-01-10', '2024-01-25'],
      ]);

      const merged = collection.mergeToSingle();

      expect(merged?.start.format('YYYY-MM-DD')).toBe('2024-01-01');
      expect(merged?.end?.format('YYYY-MM-DD')).toBe('2024-01-25');
    });

    test('mergeToSingle() returns null for non-contiguous periods', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
      ]);

      expect(collection.mergeToSingle()).toBeNull();
    });
  });

  // ============================================================================
  // Gap Operations (spatie/period inspired)
  // ============================================================================

  describe('Gap Operations', () => {
    test('gaps() returns gaps between periods', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-10'],
        ['2024-01-20', '2024-01-31'],
      ]);

      const gaps = collection.gaps();

      expect(gaps.length).toBe(1);
      expect(gaps.first()?.start.format('YYYY-MM-DD')).toBe('2024-01-11');
      expect(gaps.first()?.end?.format('YYYY-MM-DD')).toBe('2024-01-19');
    });

    test('gaps() returns empty for overlapping/contiguous periods', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-01-10', '2024-01-25'],
      ]);

      const gaps = collection.gaps();

      expect(gaps.isEmpty()).toBe(true);
    });

    test('gaps() handles multiple gaps', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-10'],
        ['2024-01-20', '2024-01-25'],
        ['2024-02-05', '2024-02-15'],
      ]);

      const gaps = collection.gaps();

      expect(gaps.length).toBe(2);
    });

    test('hasGaps() returns true if gaps exist', () => {
      const withGaps = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-10'],
        ['2024-01-20', '2024-01-31'],
      ]);

      const withoutGaps = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-01-10', '2024-01-25'],
      ]);

      expect(withGaps.hasGaps()).toBe(true);
      expect(withoutGaps.hasGaps()).toBe(false);
    });
  });

  // ============================================================================
  // Subtraction Operations (spatie/period inspired)
  // ============================================================================

  describe('Subtraction Operations', () => {
    test('subtract() removes period from collection', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-31'],
      ]);

      const toSubtract = ChronosPeriod.create('2024-01-10', '2024-01-20');
      const result = collection.subtract(toSubtract);

      expect(result.length).toBe(2);
    });

    test('subtract() handles non-overlapping period', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
      ]);

      const toSubtract = ChronosPeriod.create('2024-02-01', '2024-02-15');
      const result = collection.subtract(toSubtract);

      expect(result.length).toBe(1);
      expect(result.first()?.start.format('YYYY-MM-DD')).toBe('2024-01-01');
    });

    test('subtractAll() removes multiple periods', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-31'],
      ]);

      const toSubtract = [
        ChronosPeriod.create('2024-01-05', '2024-01-10'),
        ChronosPeriod.create('2024-01-20', '2024-01-25'),
      ];

      const result = collection.subtractAll(toSubtract);

      expect(result.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Touching/Adjacent Operations (spatie/period inspired)
  // ============================================================================

  describe('Touching Operations', () => {
    test('touchesWith() detects adjacent periods', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
      ]);

      const touching = ChronosPeriod.create('2024-01-16', '2024-01-25');
      const notTouching = ChronosPeriod.create('2024-01-20', '2024-01-30');

      expect(collection.touchesWith(touching)).toBe(true);
      expect(collection.touchesWith(notTouching)).toBe(false);
    });

    test('touchingPeriods() returns periods that touch', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
        ['2024-03-01', '2024-03-15'],
      ]);

      const testPeriod = ChronosPeriod.create('2024-01-16', '2024-01-25');
      const touching = collection.touchingPeriods(testPeriod);

      expect(touching.length).toBe(1);
      expect(touching.first()?.end?.format('YYYY-MM-DD')).toBe('2024-01-15');
    });
  });

  // ============================================================================
  // Contains Operations (spatie/period inspired)
  // ============================================================================

  describe('Contains Operations', () => {
    test('contains() checks if date is in any period', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
      ]);

      expect(collection.contains('2024-01-10')).toBe(true);
      expect(collection.contains('2024-02-10')).toBe(true);
      expect(collection.contains('2024-01-20')).toBe(false);
    });

    test('contains() accepts Chronos instance', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
      ]);

      expect(collection.contains(Chronos.create(2024, 1, 10))).toBe(true);
    });

    test('containsPeriod() checks if period is fully contained', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-31'],
      ]);

      const contained = ChronosPeriod.create('2024-01-10', '2024-01-20');
      const notContained = ChronosPeriod.create('2024-01-25', '2024-02-05');

      expect(collection.containsPeriod(contained)).toBe(true);
      expect(collection.containsPeriod(notContained)).toBe(false);
    });
  });

  // ============================================================================
  // Equality Operations (spatie/period inspired)
  // ============================================================================

  describe('Equality Operations', () => {
    test('equals() returns true for equal collections', () => {
      const collection1 = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
      ]);

      const collection2 = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
      ]);

      expect(collection1.equals(collection2)).toBe(true);
    });

    test('equals() returns false for different collections', () => {
      const collection1 = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
      ]);

      const collection2 = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-20'],
      ]);

      expect(collection1.equals(collection2)).toBe(false);
    });

    test('equals() returns false for different lengths', () => {
      const collection1 = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
      ]);

      const collection2 = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
      ]);

      expect(collection1.equals(collection2)).toBe(false);
    });

    test('equals() handles order independently', () => {
      const collection1 = ChronosPeriodCollection.fromDatePairs([
        ['2024-02-01', '2024-02-15'],
        ['2024-01-01', '2024-01-15'],
      ]);

      const collection2 = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
      ]);

      expect(collection1.equals(collection2)).toBe(true);
    });
  });

  // ============================================================================
  // Sorting & Reversing
  // ============================================================================

  describe('Sorting & Reversing', () => {
    test('sortByStart() sorts by start date ascending', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-03-01', '2024-03-15'],
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
      ]);

      const sorted = collection.sortByStart();

      expect(sorted.get(0)?.start.month).toBe(1);
      expect(sorted.get(1)?.start.month).toBe(2);
      expect(sorted.get(2)?.start.month).toBe(3);
    });

    test('sortByEnd() sorts by end date ascending', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-03-15'],
        ['2024-02-01', '2024-02-15'],
        ['2024-01-15', '2024-01-31'],
      ]);

      const sorted = collection.sortByEnd();

      expect(sorted.get(0)?.end?.format('YYYY-MM-DD')).toBe('2024-01-31');
      expect(sorted.get(1)?.end?.format('YYYY-MM-DD')).toBe('2024-02-15');
      expect(sorted.get(2)?.end?.format('YYYY-MM-DD')).toBe('2024-03-15');
    });

    test('sortByDuration() sorts by duration ascending', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-31'], // 30 days
        ['2024-02-01', '2024-02-10'], // 9 days
        ['2024-03-01', '2024-03-20'], // 19 days
      ]);

      const sorted = collection.sortByDuration();

      expect(sorted.get(0)?.days()).toBe(9);
      expect(sorted.get(1)?.days()).toBe(19);
      expect(sorted.get(2)?.days()).toBe(30);
    });

    test('reverse() reverses order', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
        ['2024-03-01', '2024-03-15'],
      ]);

      const reversed = collection.reverse();

      expect(reversed.get(0)?.start.month).toBe(3);
      expect(reversed.get(1)?.start.month).toBe(2);
      expect(reversed.get(2)?.start.month).toBe(1);
    });
  });

  // ============================================================================
  // Conversion & Output
  // ============================================================================

  describe('Conversion & Output', () => {
    test('toJSON() returns array of period JSON objects', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
      ]);

      const json = collection.toJSON();

      expect(Array.isArray(json)).toBe(true);
      expect(json.length).toBe(2);
      expect(json[0]).toHaveProperty('start');
      expect(json[0]).toHaveProperty('end');
    });

    test('toString() returns readable string', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
      ]);

      const str = collection.toString();

      expect(str).toContain('2024-01-01');
      expect(str).toContain('2024-02-15');
    });

    test('toString() handles empty collection', () => {
      const collection = ChronosPeriodCollection.empty();

      expect(collection.toString()).toBe('(empty collection)');
    });

    test('totalDays() returns sum of all period days', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-11'], // 10 days
        ['2024-02-01', '2024-02-11'], // 10 days
      ]);

      expect(collection.totalDays()).toBe(20);
    });

    test('uniqueDays() returns merged total days', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-01-10', '2024-01-25'], // Overlaps with first
      ]);

      const total = collection.totalDays();
      const unique = collection.uniqueDays();

      expect(unique).toBeLessThan(total);
    });
  });

  // ============================================================================
  // Empty Collection Edge Cases
  // ============================================================================

  describe('Empty Collection Edge Cases', () => {
    test('empty collection has length 0', () => {
      expect(ChronosPeriodCollection.empty().length).toBe(0);
    });

    test('empty collection returns empty from normalize()', () => {
      expect(ChronosPeriodCollection.empty().normalize()).toEqual([]);
    });

    test('empty collection returns empty from gaps()', () => {
      expect(ChronosPeriodCollection.empty().gaps().isEmpty()).toBe(true);
    });

    test('empty collection returns empty from union()', () => {
      expect(ChronosPeriodCollection.empty().union().isEmpty()).toBe(true);
    });

    test('empty collection returns 0 from totalDays()', () => {
      expect(ChronosPeriodCollection.empty().totalDays()).toBe(0);
    });

    test('empty collection returns 0 from uniqueDays()', () => {
      expect(ChronosPeriodCollection.empty().uniqueDays()).toBe(0);
    });
  });

  // ============================================================================
  // Single Period Collection Edge Cases
  // ============================================================================

  describe('Single Period Collection', () => {
    test('single period collection boundaries match period', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
      ]);

      const boundaries = collection.boundaries();

      expect(boundaries?.start.format('YYYY-MM-DD')).toBe('2024-01-01');
      expect(boundaries?.end?.format('YYYY-MM-DD')).toBe('2024-01-15');
    });

    test('single period collection has no gaps', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
      ]);

      expect(collection.hasGaps()).toBe(false);
    });

    test('single period collection has no internal overlaps', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
      ]);

      expect(collection.overlapAny()).toBe(false);
    });

    test('single period can merge to single', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
      ]);

      expect(collection.mergeToSingle()).not.toBeNull();
    });
  });
});
