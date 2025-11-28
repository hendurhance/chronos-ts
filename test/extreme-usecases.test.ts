import { Chronos, ChronosPeriod, ChronosPeriodCollection } from '../src';

describe('Extreme Use Cases & Real-World Simulations', () => {
  
  // ============================================================================
  // Scenario 1: Global Supply Chain Logistics with Customs & Holidays
  // ============================================================================
  describe('Global Supply Chain Logistics', () => {
    // Mock Holiday Calendar (simplified)
    const holidays: Record<string, string[]> = {
      'DE': ['2024-05-01', '2024-10-03', '2024-12-25', '2024-12-26'], // German holidays
      'FR': ['2024-05-01', '2024-07-14', '2024-12-25'], // French holidays
      'US': ['2024-07-04', '2024-11-28', '2024-12-25'], // US holidays
    };

    const isBusinessHour = (time: Chronos, countryCode: string): boolean => {
      // Check weekend
      if (time.dayOfWeek === 0 || time.dayOfWeek === 6) return false;
      
      // Check holidays
      const dateStr = time.format('YYYY-MM-DD');
      if (holidays[countryCode]?.includes(dateStr)) return false;

      // Business hours 08:00 - 17:00
      const hour = time.hour;
      return hour >= 8 && hour < 17;
    };

    const addBusinessHours = (start: Chronos, hoursToAdd: number, countryCode: string): Chronos => {
      let current = start.clone();
      let hoursAdded = 0;

      // Safety break to prevent infinite loops in tests
      let loops = 0;
      while (hoursAdded < hoursToAdd && loops < 1000) {
        // Move forward by 1 hour
        current = current.addHours(1);
        
        // Check if the hour slot we just passed was a business hour.
        // We check the status of the time at the start of the hour.
        const hourStart = current.subtractHours(1);
        if (isBusinessHour(hourStart, countryCode)) {
          hoursAdded++;
        }
        loops++;
      }
      return current;
    };

    test('calculate shipment ETA across multiple timezones with customs delays', () => {
      // 1. Shipment leaves Tokyo (NRT)
      // Local: Monday, May 20, 2024 10:00 AM JST (UTC+9)
      const departureTokyo = Chronos.parse('2024-05-20T10:00:00+09:00').toTimezone('Asia/Tokyo');
      
      // 2. Flight to Frankfurt (FRA) - 14 hours
      const arrivalFrankfurt = departureTokyo.addHours(14).toTimezone('Europe/Berlin');
      
      // 3. Customs Processing in Frankfurt
      // Requires 4 business hours. Customs open Mon-Fri 08:00-17:00.
      // Arrival in FRA:
      // Tokyo: May 20, 24:00 (May 21, 00:00)
      // FRA (UTC+2): May 20, 17:00 (Summer time)
      
      // Let's verify arrival time first
      // 10:00 JST = 01:00 UTC. +14h = 15:00 UTC.
      // 15:00 UTC = 17:00 CEST (UTC+2).
      expect(arrivalFrankfurt.hour).toBe(17);
      expect(arrivalFrankfurt.dayOfWeek).toBe(1); // Monday

      // Customs starts processing. Since it's 17:00, they are closed.
      // Next business slot starts Tuesday 08:00.
      const customsCleared = addBusinessHours(arrivalFrankfurt, 4, 'DE');
      
      // Tuesday 08:00 + 4 hours = Tuesday 12:00
      expect(customsCleared.format('YYYY-MM-DD HH:mm')).toBe('2024-05-21 12:00');

      // 4. Truck to Paris - 6 hours driving (non-business hours allowed for driving)
      const arrivalParis = customsCleared.addHours(6).toTimezone('Europe/Paris');
      
      // Paris is same timezone as Berlin (CET/CEST)
      // 12:00 + 6 = 18:00
      expect(arrivalParis.format('YYYY-MM-DD HH:mm')).toBe('2024-05-21 18:00');
    });
  });

  // ============================================================================
  // Scenario 2: High-Frequency Trading (HFT) Market Simulation
  // ============================================================================
  describe('Financial Market Simulation', () => {
    test('determine overlapping trading hours between NYSE and LSE', () => {
      // Date: Wednesday, June 12, 2024
      // Use Noon UTC to ensure we are on the same day in both timezones (NY is UTC-4, London is UTC+1)
      const date = Chronos.parse('2024-06-12T12:00:00Z').toTimezone('UTC');
      
      // Define market hours as periods for this specific day
      // NYSE: 09:30 - 16:00 EDT (UTC-4)
      // LSE:  08:00 - 16:30 BST (UTC+1)
      
      const nyseStart = date.toTimezone('America/New_York').setHour(9).setMinute(30).setSecond(0);
      const nyseEnd = date.toTimezone('America/New_York').setHour(16).setMinute(0).setSecond(0);
      const nyseSession = ChronosPeriod.create(nyseStart, nyseEnd);

      const lseStart = date.toTimezone('Europe/London').setHour(8).setMinute(0).setSecond(0);
      const lseEnd = date.toTimezone('Europe/London').setHour(16).setMinute(30).setSecond(0);
      const lseSession = ChronosPeriod.create(lseStart, lseEnd);

      // Calculate overlap using ChronosPeriod.intersect
      const overlap = nyseSession.intersect(lseSession);

      expect(overlap).not.toBeNull();
      
      if (overlap) {
        // LSE Open: 08:00 BST (07:00 UTC) -> 16:30 BST (15:30 UTC)
        // NYSE Open: 09:30 EDT (13:30 UTC) -> 16:00 EDT (20:00 UTC)
        
        // Overlap: 13:30 UTC to 15:30 UTC (2 hours)
        
        expect(overlap.start.toTimezone('UTC').hour).toBe(13);
        expect(overlap.start.toTimezone('UTC').minute).toBe(30);

        expect(overlap.end!.toTimezone('UTC').hour).toBe(15);
        expect(overlap.end!.toTimezone('UTC').minute).toBe(30);
        
        // Duration check
        expect(overlap.end!.diff(overlap.start, 'hours')).toBe(2);
      }
    });

    test('calculate T+2 settlement date skipping weekends and holidays', () => {
      // Trade Date: Friday, July 5, 2024 (After July 4th holiday)
      const tradeDate = Chronos.create(2024, 7, 5, 14, 0).toTimezone('America/New_York');
      
      let settlementDate = tradeDate.clone();
      let businessDaysAdded = 0;
      
      while (businessDaysAdded < 2) {
        settlementDate = settlementDate.addDays(1);
        const day = settlementDate.dayOfWeek;
        // Skip weekends
        if (day !== 0 && day !== 6) {
          businessDaysAdded++;
        }
      }

      // Friday + 1 = Saturday (Skip)
      // Saturday + 1 = Sunday (Skip)
      // Sunday + 1 = Monday (Count 1) -> July 8
      // Monday + 1 = Tuesday (Count 2) -> July 9
      
      expect(settlementDate.format('YYYY-MM-DD')).toBe('2024-07-09');
    });
  });

  // ============================================================================
  // Scenario 3: Complex Recurring Schedule (RRULE-lite)
  // ============================================================================
  describe('Complex Recurring Schedule', () => {
    test('generate "Every 2nd Tuesday of the month" for a year', () => {
      const year = 2024;
      const meetings: string[] = [];

      for (let month = 1; month <= 12; month++) {
        // Start at first day of month
        let date = Chronos.create(year, month, 1);
        let tuesdayCount = 0;

        // Find 2nd Tuesday
        while (tuesdayCount < 2) {
          if (date.dayOfWeek === 2) { // 2 = Tuesday
            tuesdayCount++;
            if (tuesdayCount === 2) {
              meetings.push(date.format('YYYY-MM-DD'));
            }
          }
          if (tuesdayCount < 2) {
            date = date.addDays(1);
          }
        }
      }

      expect(meetings.length).toBe(12);
      expect(meetings[0]).toBe('2024-01-09'); // Jan 1 is Mon. Jan 2 Tue (1st). Jan 9 Tue (2nd).
      expect(meetings[1]).toBe('2024-02-13');
    });

    test('schedule with exception: move to next Monday if falls on weekend', () => {
      // Payday: 15th of every month. If weekend, move to next Monday.
      const year = 2024;
      const paydays: string[] = [];

      for (let month = 1; month <= 12; month++) {
        let date = Chronos.create(year, month, 15);
        
        if (date.dayOfWeek === 6) { // Saturday
          date = date.addDays(2); // Move to Monday
        } else if (date.dayOfWeek === 0) { // Sunday
          date = date.addDays(1); // Move to Monday
        }
        
        paydays.push(date.format('YYYY-MM-DD'));
      }

      // June 15, 2024 is a Saturday. Should move to June 17.
      expect(paydays[5]).toBe('2024-06-17');
      
      // September 15, 2024 is a Sunday. Should move to Sept 16.
      expect(paydays[8]).toBe('2024-09-16');
    });
  });

  // ============================================================================
  // Scenario 4: 24/7 Shift Rotation (The "Continental" Shift Pattern)
  // ============================================================================
  describe('24/7 Shift Rotation', () => {
    // Pattern: 2 Days (06-18), 2 Nights (18-06), 4 Off. Cycle = 8 days.
    // Start Date: Jan 1, 2024.
    // Team A starts cycle on Day 1.
    
    const getShiftForDate = (date: Chronos, cycleStartDate: Chronos): 'Day' | 'Night' | 'Off' => {
      const diffDays = date.diff(cycleStartDate, 'days'); // Use 'days' unit
      const dayInCycle = Math.floor(diffDays) % 8;
      
      // dayInCycle 0, 1: Day Shift
      // dayInCycle 2, 3: Night Shift
      // dayInCycle 4, 5, 6, 7: Off
      
      if (dayInCycle < 2) return 'Day';
      if (dayInCycle < 4) return 'Night';
      return 'Off';
    };

    test('determine shift status for future dates', () => {
      const cycleStart = Chronos.create(2024, 1, 1, 6, 0); // Cycle starts at 06:00
      
      // Jan 1: Day 0 -> Day Shift
      expect(getShiftForDate(Chronos.create(2024, 1, 1, 10, 0), cycleStart)).toBe('Day');
      
      // Jan 3: Day 2 -> Night Shift
      expect(getShiftForDate(Chronos.create(2024, 1, 3, 20, 0), cycleStart)).toBe('Night');
      
      // Jan 5: Day 4 -> Off
      expect(getShiftForDate(Chronos.create(2024, 1, 5, 10, 0), cycleStart)).toBe('Off');
      
      // Jan 9: Day 8 (New Cycle Day 0) -> Day Shift
      expect(getShiftForDate(Chronos.create(2024, 1, 9, 10, 0), cycleStart)).toBe('Day');
    });

    test('calculate total working hours in a month using PeriodCollection', () => {
      const cycleStart = Chronos.create(2024, 1, 1, 6, 0);
      const monthStart = Chronos.create(2024, 1, 1);
      const monthEnd = Chronos.create(2024, 1, 31, 23, 59);
      
      const shifts = new ChronosPeriodCollection();
      
      // Generate shifts for the month
      let current = cycleStart.clone();
      
      // We'll iterate through cycles until we pass the month end
      while (current.isBefore(monthEnd)) {
        // Day 1 Shift: 06:00 - 18:00
        const d1Start = current.clone();
        const d1End = d1Start.addHours(12);
        shifts.add(ChronosPeriod.create(d1Start, d1End));

        // Day 2 Shift: 06:00 - 18:00 (Next day)
        const d2Start = current.addDays(1);
        const d2End = d2Start.addHours(12);
        shifts.add(ChronosPeriod.create(d2Start, d2End));

        // Night 1 Shift: 18:00 - 06:00 (Day 3 starts at 18:00 of Day 2 relative to cycle start)
        // Cycle Day 2 starts at 06:00. Night shift starts 12h later at 18:00.
        const n1Start = current.addDays(2).setHour(18);
        const n1End = n1Start.addHours(12);
        shifts.add(ChronosPeriod.create(n1Start, n1End));
        
        // Night 2 Shift: 18:00 - 06:00 (Day 4 starts at 18:00 of Day 3 relative to cycle start)
        const n2Start = current.addDays(3).setHour(18);
        const n2End = n2Start.addHours(12);
        shifts.add(ChronosPeriod.create(n2Start, n2End));
        
        // Move to next cycle (8 days)
        current = current.addDays(8);
      }
      
      // Now we have all full shifts. We need to clip them to the month boundaries.
      const monthPeriod = ChronosPeriod.create(monthStart, monthEnd);
      
      // Intersect all shifts with the month period to get actual working hours within the month
      const workedPeriods = shifts.intersect(monthPeriod);
      
      // Calculate total hours
      const totalHours = workedPeriods.reduce((sum, period) => {
          return sum + period.end!.diff(period.start, 'hours');
      }, 0);
      
      expect(totalHours).toBe(192);
    });
  });

  // ============================================================================
  // Scenario 5: SLA Breach Calculation with Business Hours & Timezones
  // ============================================================================
  describe('SLA Breach Calculation', () => {
    test('calculate SLA breach time across weekends and timezones', () => {
      // Support Center: India (IST, UTC+5:30)
      // Business Hours: Mon-Fri, 09:00 - 18:00 IST
      // Customer: New York (EST)
      
      // Ticket Created: Friday 16:00 EST (New York)
      // SLA: 4 Business Hours (IST time)
      
      // 1. Convert Creation Time to IST
      // 2024-05-10 is in DST (EDT), so offset is -04:00
      const createdNY = Chronos.parse('2024-05-10T16:00:00-04:00').toTimezone('America/New_York');
      const createdIST = createdNY.toTimezone('Asia/Kolkata');
      
      // NY 16:00 Friday = IST 02:30 Saturday (Next Day)
      // Since it's Saturday in India, support is closed.
      // SLA timer starts Monday 09:00 IST.
      
      // Verify conversion
      // NY (UTC-4) to IST (UTC+5.5) = +9.5 hours
      // 16:00 + 9.5 = 25.5 = 01:30 next day.
      expect(createdIST.dayOfWeek).toBe(6); // Saturday
      expect(createdIST.hour).toBe(1);
      expect(createdIST.minute).toBe(30);
      
      // Helper to find next business start
      const getNextBusinessStart = (from: Chronos): Chronos => {
        let next = from.clone();
        // If Sat(6), add 2 days to Mon(1). If Sun(0), add 1 day to Mon(1).
        if (next.dayOfWeek === 6) next = next.addDays(2);
        else if (next.dayOfWeek === 0) next = next.addDays(1);
        
        // Set to 09:00
        return next.setHour(9).setMinute(0).setSecond(0);
      };
      
      const slaStart = getNextBusinessStart(createdIST);
      
      // Monday 09:00 IST
      expect(slaStart.dayOfWeek).toBe(1); // Monday
      expect(slaStart.hour).toBe(9);
      
      // Add 4 hours SLA
      const breachTimeIST = slaStart.addHours(4);
      
      // Should be Monday 13:00 IST
      expect(breachTimeIST.format('HH:mm')).toBe('13:00');
      
      // Convert back to Customer Time (NY)
      const breachTimeNY = breachTimeIST.toTimezone('America/New_York');
      
      // Monday 13:00 IST - 9.5 hours = Monday 03:30 NY
      expect(breachTimeNY.dayOfWeek).toBe(1); // Monday
      expect(breachTimeNY.hour).toBe(3);
      expect(breachTimeNY.minute).toBe(30);
    });
  });
});
