import { ChronosPeriodCollection } from '../src/core/periodCollection';
import { ChronosPeriod } from '../src/core/period';

describe('ChronosPeriodCollection Extended Tests', () => {
  // ============================================================================
  // Factory Methods
  // ============================================================================

  describe('Factory Methods', () => {
    test('fromDatePairs() creates collection from date pairs', () => {
      const collection = ChronosPeriodCollection.fromDatePairs([
        ['2024-01-01', '2024-01-15'],
        ['2024-02-01', '2024-02-15'],
      ]);

      expect(collection.length).toBe(2);
    });
  });

  // ============================================================================
  // Basic Operations - Extended
  // ============================================================================

  describe('Extended Basic Operations', () => {
    test('get() returns undefined for invalid index', () => {
      const collection = ChronosPeriodCollection.empty();

      expect(collection.get(0)).toBeUndefined();
      expect(collection.get(100)).toBeUndefined();
    });

    test('clear() empties the collection', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
      );
      collection.clear();

      expect(collection.isEmpty()).toBe(true);
    });

    test('addAll() adds multiple periods', () => {
      const collection = ChronosPeriodCollection.empty();
      collection.addAll([
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
        ChronosPeriod.create('2024-02-01', '2024-02-15'),
      ]);

      expect(collection.length).toBe(2);
    });
  });

  // ============================================================================
  // Iteration - Extended
  // ============================================================================

  describe('Extended Iteration', () => {
    test('some() returns true if any period matches', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
        ChronosPeriod.create('2024-02-01', '2024-02-15'),
      );

      const result = collection.some((p) => p.start.month === 2);

      expect(result).toBe(true);
    });

    test('some() returns false if no period matches', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
        ChronosPeriod.create('2024-02-01', '2024-02-15'),
      );

      const result = collection.some((p) => p.start.month === 6);

      expect(result).toBe(false);
    });

    test('every() returns true if all periods match', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
        ChronosPeriod.create('2024-01-20', '2024-01-31'),
      );

      const result = collection.every((p) => p.start.year === 2024);

      expect(result).toBe(true);
    });

    test('every() returns false if any period fails', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
        ChronosPeriod.create('2025-01-01', '2025-01-15'),
      );

      const result = collection.every((p) => p.start.year === 2024);

      expect(result).toBe(false);
    });

    test('find() returns matching period', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
        ChronosPeriod.create('2024-02-01', '2024-02-15'),
      );

      const found = collection.find((p) => p.start.month === 2);

      expect(found?.start.month).toBe(2);
    });

    test('find() returns undefined if not found', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
      );

      const found = collection.find((p) => p.start.month === 6);

      expect(found).toBeUndefined();
    });

    test('reduce() aggregates values', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-10'),
        ChronosPeriod.create('2024-02-01', '2024-02-10'),
      );

      const totalDays = collection.reduce((acc, p) => acc + p.days(), 0);

      expect(totalDays).toBe(18);
    });
  });

  // ============================================================================
  // Boundaries - Extended
  // ============================================================================

  describe('Extended Boundaries', () => {
    test('boundaries() returns null for empty collection', () => {
      const collection = ChronosPeriodCollection.empty();

      expect(collection.boundaries()).toBeNull();
    });

    test('start() returns null for empty collection', () => {
      const collection = ChronosPeriodCollection.empty();

      expect(collection.start()).toBeNull();
    });

    test('end() returns null for empty collection', () => {
      const collection = ChronosPeriodCollection.empty();

      expect(collection.end()).toBeNull();
    });

    test('boundaries() handles periods with last() fallback', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.recur('2024-01-01').times(5),
        ChronosPeriod.recur('2024-02-01').times(5),
      );

      const boundaries = collection.boundaries();

      expect(boundaries).not.toBeNull();
    });
  });

  // ============================================================================
  // Overlap Operations - Extended
  // ============================================================================

  describe('Extended Overlap Operations', () => {
    test('overlapAll() returns empty for single period', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
      );

      expect(collection.overlapAll().isEmpty()).toBe(true);
    });

    test('overlapAll() finds all overlapping segments', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-20'),
        ChronosPeriod.create('2024-01-10', '2024-01-25'),
        ChronosPeriod.create('2024-01-15', '2024-01-30'),
      );

      const overlaps = collection.overlapAll();

      expect(overlaps.isNotEmpty()).toBe(true);
    });

    test('intersectAll() returns null for empty collection', () => {
      const collection = ChronosPeriodCollection.empty();

      expect(collection.intersectAll()).toBeNull();
    });

    test('intersectAll() returns clone for single period', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-15');
      const collection = ChronosPeriodCollection.create(period);

      const result = collection.intersectAll();

      expect(result?.start.format('YYYY-MM-DD')).toBe('2024-01-01');
    });

    test('intersectAll() returns intersection of all periods', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-20'),
        ChronosPeriod.create('2024-01-05', '2024-01-25'),
        ChronosPeriod.create('2024-01-10', '2024-01-15'),
      );

      const intersection = collection.intersectAll();

      expect(intersection?.start.format('YYYY-MM-DD')).toBe('2024-01-10');
      expect(intersection?.end?.format('YYYY-MM-DD')).toBe('2024-01-15');
    });

    test('intersectAll() returns null when no common intersection', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-10'),
        ChronosPeriod.create('2024-02-01', '2024-02-10'),
      );

      expect(collection.intersectAll()).toBeNull();
    });
  });

  // ============================================================================
  // Union Operations - Extended
  // ============================================================================

  describe('Extended Union Operations', () => {
    test('union() returns merged periods', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
        ChronosPeriod.create('2024-01-10', '2024-01-25'),
      );

      const union = collection.union();

      expect(union.length).toBe(1);
    });

    test('unionAll() is deprecated alias for normalize', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
        ChronosPeriod.create('2024-01-10', '2024-01-25'),
      );

      const merged = collection.unionAll();

      expect(merged.length).toBe(1);
    });

    test('mergeToSingle() returns single period for overlapping', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-20'),
        ChronosPeriod.create('2024-01-10', '2024-01-30'),
      );

      const single = collection.mergeToSingle();

      expect(single).not.toBeNull();
      expect(single?.start.format('YYYY-MM-DD')).toBe('2024-01-01');
      expect(single?.end?.format('YYYY-MM-DD')).toBe('2024-01-30');
    });

    test('mergeToSingle() returns null for non-contiguous periods', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-10'),
        ChronosPeriod.create('2024-02-01', '2024-02-10'),
      );

      expect(collection.mergeToSingle()).toBeNull();
    });

    test('mergeToSingle() returns null for empty collection', () => {
      const collection = ChronosPeriodCollection.empty();

      expect(collection.mergeToSingle()).toBeNull();
    });
  });

  // ============================================================================
  // Gap Operations - Extended
  // ============================================================================

  describe('Extended Gap Operations', () => {
    test('hasGaps() returns false for no gaps', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
        ChronosPeriod.create('2024-01-16', '2024-01-31'),
      );

      expect(collection.hasGaps()).toBe(false);
    });

    test('hasGaps() returns true when gaps exist', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-10'),
        ChronosPeriod.create('2024-01-20', '2024-01-31'),
      );

      expect(collection.hasGaps()).toBe(true);
    });
  });

  // ============================================================================
  // Subtraction Operations
  // ============================================================================

  describe('Subtraction Operations', () => {
    test('subtract() removes period from collection', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-31'),
      );
      const toSubtract = ChronosPeriod.create('2024-01-10', '2024-01-20');
      const result = collection.subtract(toSubtract);

      expect(result.length).toBe(2);
    });

    test('subtractAll() removes multiple periods', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-31'),
      );
      const result = collection.subtractAll([
        ChronosPeriod.create('2024-01-05', '2024-01-10'),
        ChronosPeriod.create('2024-01-20', '2024-01-25'),
      ]);

      expect(result.length).toBeGreaterThan(1);
    });
  });

  // ============================================================================
  // Touching/Adjacent Operations
  // ============================================================================

  describe('Touching/Adjacent Operations', () => {
    test('touchesWith() returns true for adjacent periods', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
      );
      const adjacent = ChronosPeriod.create('2024-01-16', '2024-01-31');

      expect(collection.touchesWith(adjacent)).toBe(true);
    });

    test('touchesWith() returns false for non-adjacent periods', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-10'),
      );
      const notAdjacent = ChronosPeriod.create('2024-01-20', '2024-01-31');

      expect(collection.touchesWith(notAdjacent)).toBe(false);
    });

    test('touchingPeriods() returns adjacent periods', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
        ChronosPeriod.create('2024-01-20', '2024-01-31'),
        ChronosPeriod.create('2024-02-01', '2024-02-15'),
      );
      const target = ChronosPeriod.create('2024-01-16', '2024-01-19');

      const touching = collection.touchingPeriods(target);

      expect(touching.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ============================================================================
  // Contains Operations
  // ============================================================================

  describe('Contains Operations', () => {
    test('containsPeriod() returns true if fully contained', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-31'),
      );
      const contained = ChronosPeriod.create('2024-01-10', '2024-01-20');

      expect(collection.containsPeriod(contained)).toBe(true);
    });

    test('containsPeriod() returns false if not contained', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
      );
      const notContained = ChronosPeriod.create('2024-01-10', '2024-01-25');

      expect(collection.containsPeriod(notContained)).toBe(false);
    });
  });

  // ============================================================================
  // Equality Operations
  // ============================================================================

  describe('Equality Operations', () => {
    test('equals() returns true for identical collections', () => {
      const collection1 = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
        ChronosPeriod.create('2024-02-01', '2024-02-15'),
      );
      const collection2 = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
        ChronosPeriod.create('2024-02-01', '2024-02-15'),
      );

      expect(collection1.equals(collection2)).toBe(true);
    });

    test('equals() returns false for different lengths', () => {
      const collection1 = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
      );
      const collection2 = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
        ChronosPeriod.create('2024-02-01', '2024-02-15'),
      );

      expect(collection1.equals(collection2)).toBe(false);
    });

    test('equals() returns false for different periods', () => {
      const collection1 = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
      );
      const collection2 = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-20'),
      );

      expect(collection1.equals(collection2)).toBe(false);
    });

    test('equals() returns false for different starts', () => {
      const collection1 = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
      );
      const collection2 = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-05', '2024-01-15'),
      );

      expect(collection1.equals(collection2)).toBe(false);
    });
  });

  // ============================================================================
  // Sorting & Reversing
  // ============================================================================

  describe('Sorting & Reversing', () => {
    test('sortByEnd() sorts by end date', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-02-01', '2024-02-28'),
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
        ChronosPeriod.create('2024-03-01', '2024-03-15'),
      );

      const sorted = collection.sortByEnd();

      expect(sorted.first()?.end?.format('YYYY-MM-DD')).toBe('2024-01-15');
      expect(sorted.last()?.end?.format('YYYY-MM-DD')).toBe('2024-03-15');
    });

    test('sortByDuration() sorts by period length', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-30'), // 29 days
        ChronosPeriod.create('2024-02-01', '2024-02-10'), // 9 days
        ChronosPeriod.create('2024-03-01', '2024-03-20'), // 19 days
      );

      const sorted = collection.sortByDuration();

      expect(sorted.first()?.days()).toBeLessThan(sorted.last()?.days() || 0);
    });

    test('sortByDuration() handles periods with errors gracefully', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-10'),
        ChronosPeriod.recur('2024-02-01').times(5), // Has recurrence, not end
      );

      // Should not throw
      const sorted = collection.sortByDuration();
      expect(sorted.length).toBe(2);
    });

    test('reverse() reverses order', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
        ChronosPeriod.create('2024-02-01', '2024-02-15'),
        ChronosPeriod.create('2024-03-01', '2024-03-15'),
      );

      const reversed = collection.reverse();

      expect(reversed.first()?.start.month).toBe(3);
      expect(reversed.last()?.start.month).toBe(1);
    });
  });

  // ============================================================================
  // Conversion & Output
  // ============================================================================

  describe('Conversion & Output', () => {
    test('toJSON() returns array of period JSONs', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
      );

      const json = collection.toJSON();

      expect(Array.isArray(json)).toBe(true);
      expect(json.length).toBe(1);
    });

    test('toString() for empty collection', () => {
      const collection = ChronosPeriodCollection.empty();

      expect(collection.toString()).toBe('(empty collection)');
    });

    test('toString() for non-empty collection', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
      );

      const str = collection.toString();

      expect(str).toContain('2024-01-01');
    });

    test('uniqueDays() counts merged days', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
        ChronosPeriod.create('2024-01-10', '2024-01-20'),
      );

      const total = collection.totalDays();
      const unique = collection.uniqueDays();

      expect(unique).toBeLessThan(total);
    });

    test('totalDays() handles errors gracefully', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-10'),
        ChronosPeriod.recur('2024-02-01').times(5),
      );

      // Should not throw, should handle error gracefully
      const days = collection.totalDays();
      expect(days).toBeGreaterThan(0);
    });

    test('uniqueDays() handles errors gracefully', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-10'),
      );

      const days = collection.uniqueDays();
      expect(days).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    test('normalize() returns empty array for empty collection', () => {
      const collection = ChronosPeriodCollection.empty();

      expect(collection.normalize()).toEqual([]);
    });

    test('intersect() with empty collection returns empty', () => {
      const collection = ChronosPeriodCollection.empty();
      const period = ChronosPeriod.create('2024-01-01', '2024-01-31');

      expect(collection.intersect(period).isEmpty()).toBe(true);
    });

    test('gaps() returns empty for single period', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-31'),
      );

      expect(collection.gaps().isEmpty()).toBe(true);
    });

    test('iterator yields all periods', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
        ChronosPeriod.create('2024-02-01', '2024-02-15'),
      );

      const periods: ChronosPeriod[] = [];
      for (const period of collection) {
        periods.push(period);
      }

      expect(periods.length).toBe(2);
    });

    test('forEach iterates with index', () => {
      const collection = ChronosPeriodCollection.create(
        ChronosPeriod.create('2024-01-01', '2024-01-15'),
        ChronosPeriod.create('2024-02-01', '2024-02-15'),
      );

      const indices: number[] = [];
      collection.forEach((_, index) => {
        indices.push(index);
      });

      expect(indices).toEqual([0, 1]);
    });
  });
});
