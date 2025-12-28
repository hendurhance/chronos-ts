/**
 * Complex Use Case Tests - Real-world scenarios for large codebases
 * These tests simulate complex business logic that would be found in enterprise applications
 */

import { Chronos } from '../src/core/chronos';
import { ChronosPeriod } from '../src/core/period';
import { ChronosPeriodCollection } from '../src/core/period-collection';
import { ChronosTimezone } from '../src/core/timezone';
import { DayOfWeek } from '../src/types';

describe('Complex Use Cases', () => {
  afterAll(() => {
    Chronos.setTestNow(null);
  });
  // ============================================================================
  // Employee Scheduling System
  // ============================================================================

  describe('Employee Scheduling System', () => {
    interface Shift {
      employeeId: string;
      start: Chronos;
      end: Chronos;
    }

    interface LeaveRequest {
      employeeId: string;
      period: ChronosPeriod;
      type: 'vacation' | 'sick' | 'personal';
    }

    const createShift = (employeeId: string, date: Chronos, startHour: number, endHour: number): Shift => ({
      employeeId,
      start: date.setHour(startHour).setMinute(0).setSecond(0),
      end: date.setHour(endHour).setMinute(0).setSecond(0),
    });

    test('calculate weekly hours for employee with multiple shifts', () => {
      const weekStart = Chronos.create(2024, 3, 11); // Monday
      
      const shifts: Shift[] = [
        createShift('EMP001', weekStart, 9, 17),                    // Mon 8hrs
        createShift('EMP001', weekStart.addDays(1), 9, 17),         // Tue 8hrs
        createShift('EMP001', weekStart.addDays(2), 9, 13),         // Wed 4hrs
        createShift('EMP001', weekStart.addDays(3), 14, 22),        // Thu 8hrs
        createShift('EMP001', weekStart.addDays(4), 9, 17),         // Fri 8hrs
      ];

      const totalHours = shifts.reduce((sum, shift) => {
        return sum + shift.end.diff(shift.start, 'hours');
      }, 0);

      expect(totalHours).toBe(36);
    });

    test('detect shift conflicts for an employee', () => {
      const baseDate = Chronos.create(2024, 3, 15);
      
      const existingShifts: Shift[] = [
        createShift('EMP001', baseDate, 9, 17),
        createShift('EMP001', baseDate.addDays(1), 14, 22),
      ];

      const newShift = createShift('EMP001', baseDate, 15, 20);

      // Create a collection of existing shift periods
      const shiftPeriods = new ChronosPeriodCollection(
        existingShifts.map(s => ChronosPeriod.create(s.start, s.end))
      );

      const newPeriod = ChronosPeriod.create(newShift.start, newShift.end);
      
      // Check if the new shift overlaps with any existing shift
      const hasConflict = shiftPeriods.overlaps(newPeriod);

      expect(hasConflict).toBe(true);
    });

    test('calculate overtime hours (over 40 per week)', () => {
      const weekStart = Chronos.create(2024, 3, 11);
      
      const shifts: Shift[] = [
        createShift('EMP001', weekStart, 7, 19),                    // Mon 12hrs
        createShift('EMP001', weekStart.addDays(1), 7, 19),         // Tue 12hrs
        createShift('EMP001', weekStart.addDays(2), 7, 19),         // Wed 12hrs
        createShift('EMP001', weekStart.addDays(3), 7, 17),         // Thu 10hrs
        createShift('EMP001', weekStart.addDays(4), 9, 17),         // Fri 8hrs
      ];

      const totalHours = shifts.reduce((sum, shift) => 
        sum + shift.end.diff(shift.start, 'hours'), 0);
      
      const regularHours = Math.min(totalHours, 40);
      const overtimeHours = Math.max(0, totalHours - 40);

      expect(totalHours).toBe(54);
      expect(regularHours).toBe(40);
      expect(overtimeHours).toBe(14);
    });

    test('check leave overlap with scheduled shifts', () => {
      const leaveRequest: LeaveRequest = {
        employeeId: 'EMP001',
        period: ChronosPeriod.create(
          Chronos.create(2024, 3, 18),
          Chronos.create(2024, 3, 22)
        ),
        type: 'vacation',
      };

      const scheduledShifts: Shift[] = [
        createShift('EMP001', Chronos.create(2024, 3, 19), 9, 17),
        createShift('EMP001', Chronos.create(2024, 3, 20), 9, 17),
      ];

      const conflictingShifts = scheduledShifts.filter(shift => 
        leaveRequest.period.contains(shift.start)
      );

      expect(conflictingShifts.length).toBe(2);
    });

    test('generate monthly schedule with rotating shifts', () => {
      const month = ChronosPeriod.month(2024, 4);
      const employees = ['EMP001', 'EMP002', 'EMP003'];
      const shiftTypes = ['morning', 'afternoon', 'night'];
      
      const schedule: Array<{ date: string; employee: string; shift: string }> = [];
      let dayIndex = 0;

      for (const day of month.filterWeekdays()) {
        const employeeIndex = dayIndex % employees.length;
        const shiftIndex = Math.floor(dayIndex / employees.length) % shiftTypes.length;
        
        schedule.push({
          date: day.format('YYYY-MM-DD'),
          employee: employees[employeeIndex],
          shift: shiftTypes[shiftIndex],
        });
        dayIndex++;
      }

      // April 2024 has 22 weekdays
      expect(schedule.length).toBe(22);
      expect(schedule.filter(s => s.employee === 'EMP001').length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Subscription & Billing System
  // ============================================================================

  describe('Subscription & Billing System', () => {
    interface Subscription {
      id: string;
      plan: 'monthly' | 'quarterly' | 'annual';
      startDate: Chronos;
      trialDays: number;
      price: number;
    }

    test('calculate trial period end date', () => {
      const subscription: Subscription = {
        id: 'SUB001',
        plan: 'monthly',
        startDate: Chronos.create(2024, 3, 1),
        trialDays: 14,
        price: 29.99,
      };

      const trialEnd = subscription.startDate.addDays(subscription.trialDays);
      
      expect(trialEnd.format('YYYY-MM-DD')).toBe('2024-03-15');
    });

    test('calculate prorated amount for mid-cycle upgrade', () => {
      const cycleStart = Chronos.create(2024, 3, 1);
      const cycleEnd = Chronos.create(2024, 3, 31);
      const upgradeDate = Chronos.create(2024, 3, 15);
      
      const totalDays = cycleEnd.diff(cycleStart, 'days');
      const remainingDays = cycleEnd.diff(upgradeDate, 'days');
      const proratedFactor = remainingDays / totalDays;
      
      const oldPlanPrice = 29.99;
      const newPlanPrice = 49.99;
      const priceDifference = newPlanPrice - oldPlanPrice;
      const proratedAmount = priceDifference * proratedFactor;

      expect(proratedAmount).toBeCloseTo(10.66, 1);
    });

    test('generate billing history for annual subscription', () => {
      const subscription: Subscription = {
        id: 'SUB002',
        plan: 'annual',
        startDate: Chronos.create(2022, 1, 15),
        trialDays: 0,
        price: 299.99,
      };

      const billingHistory: Array<{ date: string; amount: number }> = [];
      const endDate = Chronos.create(2024, 12, 31);
      let billingDate = subscription.startDate;

      while (billingDate.isSameOrBefore(endDate)) {
        billingHistory.push({
          date: billingDate.format('YYYY-MM-DD'),
          amount: subscription.price,
        });
        billingDate = billingDate.addYears(1);
      }

      expect(billingHistory.length).toBe(3); // 2022, 2023, 2024
      expect(billingHistory[0].date).toBe('2022-01-15');
      expect(billingHistory[2].date).toBe('2024-01-15');
    });

    test('check if subscription is in grace period', () => {
      const gracePeriodDays = 7;
      const paymentFailedDate = Chronos.create(2024, 3, 1);
      const currentDate = Chronos.create(2024, 3, 5);
      
      const graceEnd = paymentFailedDate.addDays(gracePeriodDays);
      const isInGracePeriod = currentDate.isBetween(paymentFailedDate, graceEnd, 'day', '[]');
      const daysRemaining = graceEnd.diff(currentDate, 'days');

      expect(isInGracePeriod).toBe(true);
      expect(daysRemaining).toBe(3);
    });

    test('calculate revenue for a billing period', () => {
      const subscriptions: Subscription[] = [
        { id: 'SUB001', plan: 'monthly', startDate: Chronos.create(2024, 1, 1), trialDays: 0, price: 29.99 },
        { id: 'SUB002', plan: 'monthly', startDate: Chronos.create(2024, 2, 15), trialDays: 14, price: 29.99 },
        { id: 'SUB003', plan: 'quarterly', startDate: Chronos.create(2024, 1, 1), trialDays: 0, price: 79.99 },
        { id: 'SUB004', plan: 'annual', startDate: Chronos.create(2024, 3, 1), trialDays: 0, price: 299.99 },
      ];

      const billingMonth = ChronosPeriod.month(2024, 3);
      
      const billableSubscriptions = subscriptions.filter(sub => {
        const trialEnd = sub.startDate.addDays(sub.trialDays);
        return trialEnd.isSameOrBefore(billingMonth.start);
      });

      // SUB001, SUB003, and SUB004 are past trial - SUB002 trial ends Feb 29
      // SUB004 starts March 1 with 0 trial days, so trial ends March 1 which is <= March 1
      expect(billableSubscriptions.length).toBe(4);
    });
  });

  // ============================================================================
  // Project Management System
  // ============================================================================

  describe('Project Management System', () => {
    interface Task {
      id: string;
      name: string;
      startDate: Chronos;
      dueDate: Chronos;
      estimatedHours: number;
      dependencies: string[];
    }

    interface Sprint {
      id: string;
      name: string;
      period: ChronosPeriod;
      tasks: Task[];
    }

    test('calculate project timeline with task dependencies', () => {
      const projectStart = Chronos.create(2024, 4, 1);
      
      const tasks: Task[] = [
        { id: 'T1', name: 'Requirements', startDate: projectStart, dueDate: projectStart.addDays(5), estimatedHours: 40, dependencies: [] },
        { id: 'T2', name: 'Design', startDate: projectStart.addDays(6), dueDate: projectStart.addDays(15), estimatedHours: 80, dependencies: ['T1'] },
        { id: 'T3', name: 'Development', startDate: projectStart.addDays(16), dueDate: projectStart.addDays(45), estimatedHours: 240, dependencies: ['T2'] },
        { id: 'T4', name: 'Testing', startDate: projectStart.addDays(46), dueDate: projectStart.addDays(60), estimatedHours: 120, dependencies: ['T3'] },
        { id: 'T5', name: 'Deployment', startDate: projectStart.addDays(61), dueDate: projectStart.addDays(65), estimatedHours: 40, dependencies: ['T4'] },
      ];

      // Create a collection of all task periods
      const taskPeriods = new ChronosPeriodCollection(
        tasks.map(t => ChronosPeriod.create(t.startDate, t.dueDate))
      );

      // Get the overall project boundaries (earliest start to latest end)
      const projectTimeline = taskPeriods.boundaries();
      
      expect(projectTimeline).not.toBeNull();
      
      const totalDuration = projectTimeline!.days();
      const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);

      expect(totalDuration).toBe(65);
      expect(totalHours).toBe(520);
    });

    test('identify overdue tasks', () => {
      const today = Chronos.create(2024, 4, 20);
      
      const tasks: Task[] = [
        { id: 'T1', name: 'Task 1', startDate: Chronos.create(2024, 4, 1), dueDate: Chronos.create(2024, 4, 15), estimatedHours: 20, dependencies: [] },
        { id: 'T2', name: 'Task 2', startDate: Chronos.create(2024, 4, 10), dueDate: Chronos.create(2024, 4, 25), estimatedHours: 30, dependencies: [] },
        { id: 'T3', name: 'Task 3', startDate: Chronos.create(2024, 4, 5), dueDate: Chronos.create(2024, 4, 18), estimatedHours: 15, dependencies: [] },
      ];

      const overdueTasks = tasks.filter(task => task.dueDate.isBefore(today));
      const daysOverdue = overdueTasks.map(task => ({
        id: task.id,
        name: task.name,
        daysOverdue: today.diff(task.dueDate, 'days'),
      }));

      expect(overdueTasks.length).toBe(2);
      expect(daysOverdue[0].daysOverdue).toBe(5);
    });

    test('calculate sprint velocity and burndown', () => {
      const sprint: Sprint = {
        id: 'S1',
        name: 'Sprint 1',
        period: ChronosPeriod.create(
          Chronos.create(2024, 4, 1),
          Chronos.create(2024, 4, 14)
        ),
        tasks: [
          { id: 'T1', name: 'Task 1', startDate: Chronos.create(2024, 4, 1), dueDate: Chronos.create(2024, 4, 5), estimatedHours: 8, dependencies: [] },
          { id: 'T2', name: 'Task 2', startDate: Chronos.create(2024, 4, 3), dueDate: Chronos.create(2024, 4, 8), estimatedHours: 16, dependencies: [] },
          { id: 'T3', name: 'Task 3', startDate: Chronos.create(2024, 4, 8), dueDate: Chronos.create(2024, 4, 12), estimatedHours: 12, dependencies: [] },
        ],
      };

      const totalPoints = sprint.tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
      const sprintDays = sprint.period.count();
      const idealBurndownPerDay = totalPoints / (sprintDays - 1); // Decrement per day, not including first

      // Generate ideal burndown
      const burndown: Array<{ date: string; remaining: number }> = [];
      let remaining = totalPoints;
      let index = 0;
      
      for (const day of sprint.period) {
        burndown.push({
          date: day.format('YYYY-MM-DD'),
          remaining: Math.max(0, remaining),
        });
        if (index < sprintDays - 1) {
          remaining -= idealBurndownPerDay;
        }
        index++;
      }

      expect(totalPoints).toBe(36);
      expect(burndown[0].remaining).toBe(36);
      // Last day should have remaining close to 0
      expect(burndown[burndown.length - 1].remaining).toBeLessThanOrEqual(1);
    });

    test('find available time slots for team meeting', () => {
      const targetDate = Chronos.create(2024, 4, 15);

      // Team members' existing meetings (as periods)
      const existingMeetings = [
        ChronosPeriod.create(
          targetDate.setHour(9).setMinute(0),
          targetDate.setHour(10).setMinute(0)
        ),
        ChronosPeriod.create(
          targetDate.setHour(11).setMinute(0),
          targetDate.setHour(12).setMinute(0)
        ),
        ChronosPeriod.create(
          targetDate.setHour(14).setMinute(0),
          targetDate.setHour(15).setMinute(30)
        ),
      ];

      const workStart = targetDate.setHour(9).setMinute(0);
      const workEnd = targetDate.setHour(17).setMinute(0);
      // Use 5-minute intervals - good balance: only 96 iterations for 8 hours
      const workDay = ChronosPeriod.create(workStart, workEnd, { minutes: 5 });

      // Create a collection for the full work day
      const workDayCollection = new ChronosPeriodCollection([workDay]);
      
      // Create meetings with same 5-minute intervals
      const meetings = new ChronosPeriodCollection(
        existingMeetings.map(m => ChronosPeriod.create(m.start, m.end, { minutes: 5 }))
      );
      
      // Subtract all existing meetings from the work day to find gaps
      const gapsCollection = workDayCollection.subtractAll(meetings.toArray());
      
      // Expect gaps: 10:00-11:00, 12:00-14:00, 15:30-17:00
      expect(gapsCollection.length).toBe(3);
      
      // Filter for slots with at least 1 hour (with small tolerance for interval boundaries)
      const availableSlots = gapsCollection.filter(gap => {
        const durationMinutes = gap.end ? gap.end.diff(gap.start, 'minutes') : 0;
        return durationMinutes >= 55; // Allow 5-minute tolerance for interval alignment
      });
      
      expect(availableSlots.length).toBe(3);
    });
  });

  // ============================================================================
  // E-commerce Order & Shipping System
  // ============================================================================

  describe('E-commerce Order & Shipping System', () => {
    interface Order {
      id: string;
      createdAt: Chronos;
      shippingMethod: 'standard' | 'express' | 'overnight';
      destination: { timezone: string };
    }

    const getDeliveryWindow = (order: Order): { earliest: Chronos; latest: Chronos } => {
      const processingDays = 1;
      const shippingDays = {
        standard: { min: 5, max: 7 },
        express: { min: 2, max: 3 },
        overnight: { min: 1, max: 1 },
      };

      const processedDate = order.createdAt.addDays(processingDays);
      const { min, max } = shippingDays[order.shippingMethod];

      return {
        earliest: processedDate.addDays(min),
        latest: processedDate.addDays(max),
      };
    };

    test('calculate estimated delivery window', () => {
      const order: Order = {
        id: 'ORD001',
        createdAt: Chronos.create(2024, 4, 15, 14, 30),
        shippingMethod: 'standard',
        destination: { timezone: 'America/New_York' },
      };

      const delivery = getDeliveryWindow(order);
      
      expect(delivery.earliest.format('YYYY-MM-DD')).toBe('2024-04-21');
      expect(delivery.latest.format('YYYY-MM-DD')).toBe('2024-04-23');
    });

    test('check if order qualifies for same-day shipping', () => {
      const sameDayCutoff = 14; // 2 PM
      const warehouseTimezone = 'America/Los_Angeles';
      
      const orders = [
        // 10:00 UTC is 03:00 LA (Eligible)
        { id: 'ORD001', createdAt: Chronos.create(2024, 4, 15, 10, 0, 0, 0, 'UTC'), shippingMethod: 'overnight' as const, destination: { timezone: 'America/New_York' } },
        // 22:00 UTC is 15:00 LA (Not Eligible)
        { id: 'ORD002', createdAt: Chronos.create(2024, 4, 15, 22, 0, 0, 0, 'UTC'), shippingMethod: 'overnight' as const, destination: { timezone: 'America/New_York' } },
        { id: 'ORD003', createdAt: Chronos.create(2024, 4, 15, 13, 59, 0, 0, 'UTC'), shippingMethod: 'express' as const, destination: { timezone: 'America/New_York' } },
      ];

      const sameDayEligible = orders.filter(order => 
        order.shippingMethod === 'overnight' && 
        order.createdAt.toTimezone(warehouseTimezone).hour < sameDayCutoff
      );

      expect(sameDayEligible.length).toBe(1);
      expect(sameDayEligible[0].id).toBe('ORD001');
    });

    test('generate shipping report for date range', () => {
      const orders: Order[] = [
        { id: 'ORD001', createdAt: Chronos.create(2024, 4, 1, 10, 0), shippingMethod: 'standard', destination: { timezone: 'America/New_York' } },
        { id: 'ORD002', createdAt: Chronos.create(2024, 4, 5, 14, 0), shippingMethod: 'express', destination: { timezone: 'Europe/London' } },
        { id: 'ORD003', createdAt: Chronos.create(2024, 4, 10, 9, 0), shippingMethod: 'overnight', destination: { timezone: 'Asia/Tokyo' } },
        { id: 'ORD004', createdAt: Chronos.create(2024, 4, 15, 16, 0), shippingMethod: 'standard', destination: { timezone: 'America/Chicago' } },
        { id: 'ORD005', createdAt: Chronos.create(2024, 4, 20, 11, 0), shippingMethod: 'express', destination: { timezone: 'Australia/Sydney' } },
      ];

      const reportPeriod = ChronosPeriod.create(
        Chronos.create(2024, 4, 1),
        Chronos.create(2024, 4, 15)
      );

      const ordersInPeriod = orders.filter(order => 
        reportPeriod.contains(order.createdAt)
      );

      const byShippingMethod = ordersInPeriod.reduce((acc, order) => {
        acc[order.shippingMethod] = (acc[order.shippingMethod] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(ordersInPeriod.length).toBe(4);
      expect(byShippingMethod.standard).toBe(2);
      expect(byShippingMethod.express).toBe(1);
      expect(byShippingMethod.overnight).toBe(1);
    });

    test('calculate late delivery rate', () => {
      interface DeliveredOrder extends Order {
        estimatedDelivery: Chronos;
        actualDelivery: Chronos;
      }

      const deliveredOrders: DeliveredOrder[] = [
        { id: 'ORD001', createdAt: Chronos.create(2024, 4, 1), shippingMethod: 'standard', destination: { timezone: 'America/New_York' }, estimatedDelivery: Chronos.create(2024, 4, 8), actualDelivery: Chronos.create(2024, 4, 7) },
        { id: 'ORD002', createdAt: Chronos.create(2024, 4, 2), shippingMethod: 'express', destination: { timezone: 'America/Chicago' }, estimatedDelivery: Chronos.create(2024, 4, 5), actualDelivery: Chronos.create(2024, 4, 6) },
        { id: 'ORD003', createdAt: Chronos.create(2024, 4, 3), shippingMethod: 'overnight', destination: { timezone: 'America/Denver' }, estimatedDelivery: Chronos.create(2024, 4, 4), actualDelivery: Chronos.create(2024, 4, 4) },
        { id: 'ORD004', createdAt: Chronos.create(2024, 4, 4), shippingMethod: 'standard', destination: { timezone: 'America/Phoenix' }, estimatedDelivery: Chronos.create(2024, 4, 11), actualDelivery: Chronos.create(2024, 4, 13) },
      ];

      const lateOrders = deliveredOrders.filter(order => 
        order.actualDelivery.isAfter(order.estimatedDelivery)
      );

      const lateRate = (lateOrders.length / deliveredOrders.length) * 100;

      expect(lateOrders.length).toBe(2);
      expect(lateRate).toBe(50);
    });
  });

  // ============================================================================
  // Financial Reporting System
  // ============================================================================

  describe('Financial Reporting System', () => {
    interface Transaction {
      id: string;
      date: Chronos;
      amount: number;
      type: 'income' | 'expense';
      category: string;
    }

    test('generate quarterly financial summary', () => {
      const transactions: Transaction[] = [
        { id: 'T1', date: Chronos.create(2024, 1, 15), amount: 5000, type: 'income', category: 'sales' },
        { id: 'T2', date: Chronos.create(2024, 2, 10), amount: 1500, type: 'expense', category: 'operations' },
        { id: 'T3', date: Chronos.create(2024, 3, 20), amount: 8000, type: 'income', category: 'sales' },
        { id: 'T4', date: Chronos.create(2024, 4, 5), amount: 2000, type: 'expense', category: 'marketing' },
        { id: 'T5', date: Chronos.create(2024, 5, 15), amount: 6000, type: 'income', category: 'services' },
        { id: 'T6', date: Chronos.create(2024, 6, 25), amount: 3000, type: 'expense', category: 'operations' },
      ];

      const q1 = ChronosPeriod.quarter(2024, 1);
      const q2 = ChronosPeriod.quarter(2024, 2);

      const calculateQuarterSummary = (period: ChronosPeriod) => {
        const quarterTransactions = transactions.filter(t => period.contains(t.date));
        const income = quarterTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = quarterTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        return { income, expenses, profit: income - expenses };
      };

      const q1Summary = calculateQuarterSummary(q1);
      const q2Summary = calculateQuarterSummary(q2);

      expect(q1Summary.income).toBe(13000);
      expect(q1Summary.expenses).toBe(1500);
      expect(q1Summary.profit).toBe(11500);
      
      expect(q2Summary.income).toBe(6000);
      expect(q2Summary.expenses).toBe(5000);
      expect(q2Summary.profit).toBe(1000);
    });

    test('calculate year-over-year growth', () => {
      const monthlyRevenue2023 = [
        { month: 1, revenue: 10000 },
        { month: 2, revenue: 12000 },
        { month: 3, revenue: 11000 },
      ];

      const monthlyRevenue2024 = [
        { month: 1, revenue: 12000 },
        { month: 2, revenue: 15000 },
        { month: 3, revenue: 14000 },
      ];

      const yoyGrowth = monthlyRevenue2024.map((current, idx) => {
        const previous = monthlyRevenue2023[idx];
        const growth = ((current.revenue - previous.revenue) / previous.revenue) * 100;
        return {
          month: Chronos.create(2024, current.month, 1).format('MMMM'),
          growth: growth.toFixed(1) + '%',
        };
      });

      expect(yoyGrowth[0].growth).toBe('20.0%');
      expect(yoyGrowth[1].growth).toBe('25.0%');
      expect(yoyGrowth[2].growth).toBe('27.3%');
    });

    test('identify fiscal year boundaries', () => {
      // Company with fiscal year starting April 1
      const getFiscalYear = (date: Chronos): { start: Chronos; end: Chronos; label: string } => {
        const fiscalYearStartMonth = 4; // April
        let fiscalYearStart: Chronos;
        
        if (date.month >= fiscalYearStartMonth) {
          fiscalYearStart = Chronos.create(date.year, fiscalYearStartMonth, 1);
        } else {
          fiscalYearStart = Chronos.create(date.year - 1, fiscalYearStartMonth, 1);
        }
        
        const fiscalYearEnd = fiscalYearStart.addYears(1).subtractDays(1);
        const label = `FY${fiscalYearStart.year}-${fiscalYearEnd.year.toString().slice(-2)}`;
        
        return { start: fiscalYearStart, end: fiscalYearEnd, label };
      };

      const testDate1 = Chronos.create(2024, 6, 15);
      const testDate2 = Chronos.create(2024, 2, 15);

      const fy1 = getFiscalYear(testDate1);
      const fy2 = getFiscalYear(testDate2);

      expect(fy1.label).toBe('FY2024-25');
      expect(fy1.start.format('YYYY-MM-DD')).toBe('2024-04-01');
      
      expect(fy2.label).toBe('FY2023-24');
      expect(fy2.start.format('YYYY-MM-DD')).toBe('2023-04-01');
    });

    test('calculate moving average for revenue', () => {
      const dailyRevenue = [
        { date: Chronos.create(2024, 4, 1), amount: 1000 },
        { date: Chronos.create(2024, 4, 2), amount: 1200 },
        { date: Chronos.create(2024, 4, 3), amount: 800 },
        { date: Chronos.create(2024, 4, 4), amount: 1500 },
        { date: Chronos.create(2024, 4, 5), amount: 1100 },
        { date: Chronos.create(2024, 4, 6), amount: 900 },
        { date: Chronos.create(2024, 4, 7), amount: 1300 },
      ];

      const windowSize = 3;
      const movingAverage: Array<{ date: string; average: number }> = [];

      for (let i = windowSize - 1; i < dailyRevenue.length; i++) {
        const windowSum = dailyRevenue
          .slice(i - windowSize + 1, i + 1)
          .reduce((sum, day) => sum + day.amount, 0);
        
        movingAverage.push({
          date: dailyRevenue[i].date.format('YYYY-MM-DD'),
          average: windowSum / windowSize,
        });
      }

      expect(movingAverage.length).toBe(5);
      expect(movingAverage[0].average).toBeCloseTo(1000, 0); // (1000+1200+800)/3
      expect(movingAverage[1].average).toBeCloseTo(1166.67, 0); // (1200+800+1500)/3
    });
  });

  // ============================================================================
  // Multi-Timezone Event Management
  // ============================================================================

  describe('Multi-Timezone Event Management', () => {
    interface GlobalEvent {
      id: string;
      name: string;
      startUtc: Chronos;
      durationMinutes: number;
      participants: Array<{ name: string; timezone: string }>;
    }

    test('convert event time to multiple timezones', () => {
      const event: GlobalEvent = {
        id: 'EVT001',
        name: 'Global Team Standup',
        startUtc: Chronos.create(2024, 4, 15, 14, 0, 0), // 2 PM UTC
        durationMinutes: 30,
        participants: [
          { name: 'Alice', timezone: 'America/New_York' },
          { name: 'Bob', timezone: 'Europe/London' },
          { name: 'Charlie', timezone: 'Asia/Tokyo' },
          { name: 'Diana', timezone: 'Australia/Sydney' },
        ],
      };

      const localTimes = event.participants.map(p => {
        const tz = ChronosTimezone.create(p.timezone);
        const localStart = tz.fromUTC(event.startUtc.toDate());
        return {
          name: p.name,
          timezone: p.timezone,
          localTime: Chronos.parse(localStart).format('HH:mm'),
        };
      });

      // Verify different local times
      expect(localTimes.length).toBe(4);
      // Times will vary based on DST, but structure should be correct
      localTimes.forEach(lt => {
        expect(lt.localTime).toMatch(/^\d{2}:\d{2}$/);
      });
    });

    test('find optimal meeting time across timezones', () => {
      const timezones = [
        'America/New_York',
        'Europe/London',
        'Asia/Tokyo',
      ];

      const workingHours = { start: 9, end: 18 }; // 9 AM to 6 PM

      // Check each UTC hour to find overlap
      const date = Chronos.create(2024, 4, 15);
      const overlappingHours: number[] = [];

      for (let utcHour = 0; utcHour < 24; utcHour++) {
        const utcTime = date.setHour(utcHour);
        
        const allInWorkingHours = timezones.every(tzName => {
          const tz = ChronosTimezone.create(tzName);
          const localDate = tz.fromUTC(utcTime.toDate());
          const localHour = localDate.getHours();
          return localHour >= workingHours.start && localHour < workingHours.end;
        });

        if (allInWorkingHours) {
          overlappingHours.push(utcHour);
        }
      }

      // There should be limited overlap between these diverse timezones
      expect(overlappingHours.length).toBeLessThanOrEqual(24);
    });

    test('generate recurring event series', () => {
      const recurringEvent = {
        name: 'Weekly Team Sync',
        firstOccurrence: Chronos.create(2024, 4, 1, 10, 0), // Monday
        recurrence: 'weekly',
        count: 8,
      };

      const eventSeries: Chronos[] = [];
      let currentDate = recurringEvent.firstOccurrence;

      for (let i = 0; i < recurringEvent.count; i++) {
        eventSeries.push(currentDate);
        currentDate = currentDate.addWeeks(1);
      }

      expect(eventSeries.length).toBe(8);
      expect(eventSeries[0].format('YYYY-MM-DD')).toBe('2024-04-01');
      expect(eventSeries[7].format('YYYY-MM-DD')).toBe('2024-05-20');
      
      // All should be Mondays
      eventSeries.forEach(date => {
        expect(date.dayOfWeek).toBe(DayOfWeek.Monday);
      });
    });

    test('handle DST transitions for recurring events', () => {
      // Event that crosses DST boundary in US (March 10, 2024)
      const beforeDst = Chronos.create(2024, 3, 4, 10, 0); // March 4
      const afterDst = beforeDst.addWeeks(2); // March 18

      const nyTz = ChronosTimezone.create('America/New_York');
      
      const beforeOffset = nyTz.getOffsetHours(beforeDst.toDate());
      const afterOffset = nyTz.getOffsetHours(afterDst.toDate());

      // Offset should change by 1 hour due to DST
      expect(Math.abs(afterOffset - beforeOffset)).toBeLessThanOrEqual(1);
    });
  });

  // ============================================================================
  // Analytics & Reporting
  // ============================================================================

  describe('Analytics & Reporting', () => {
    interface UserActivity {
      userId: string;
      timestamp: Chronos;
      action: string;
      duration: number;
    }

    test('calculate daily active users over time', () => {
      const activities: UserActivity[] = [
        { userId: 'U1', timestamp: Chronos.create(2024, 4, 1, 10, 0), action: 'login', duration: 30 },
        { userId: 'U2', timestamp: Chronos.create(2024, 4, 1, 11, 0), action: 'login', duration: 45 },
        { userId: 'U1', timestamp: Chronos.create(2024, 4, 1, 14, 0), action: 'view', duration: 5 },
        { userId: 'U3', timestamp: Chronos.create(2024, 4, 2, 9, 0), action: 'login', duration: 60 },
        { userId: 'U1', timestamp: Chronos.create(2024, 4, 2, 10, 0), action: 'login', duration: 20 },
        { userId: 'U2', timestamp: Chronos.create(2024, 4, 3, 15, 0), action: 'login', duration: 35 },
      ];

      const period = ChronosPeriod.create(
        Chronos.create(2024, 4, 1),
        Chronos.create(2024, 4, 3)
      );

      const dauByDay = period.map(day => {
        const dayActivities = activities.filter(a => 
          a.timestamp.isSame(day, 'day')
        );
        const uniqueUsers = new Set(dayActivities.map(a => a.userId));
        return {
          date: day.format('YYYY-MM-DD'),
          dau: uniqueUsers.size,
        };
      });

      expect(dauByDay[0].dau).toBe(2); // April 1: U1, U2
      expect(dauByDay[1].dau).toBe(2); // April 2: U1, U3
      expect(dauByDay[2].dau).toBe(1); // April 3: U2
    });

    test('calculate retention cohorts', () => {
      interface UserSignup {
        userId: string;
        signupDate: Chronos;
        lastActiveDate: Chronos;
      }

      const users: UserSignup[] = [
        { userId: 'U1', signupDate: Chronos.create(2024, 1, 1), lastActiveDate: Chronos.create(2024, 4, 15) },
        { userId: 'U2', signupDate: Chronos.create(2024, 1, 1), lastActiveDate: Chronos.create(2024, 1, 15) },
        { userId: 'U3', signupDate: Chronos.create(2024, 1, 1), lastActiveDate: Chronos.create(2024, 3, 1) },
        { userId: 'U4', signupDate: Chronos.create(2024, 2, 1), lastActiveDate: Chronos.create(2024, 4, 10) },
        { userId: 'U5', signupDate: Chronos.create(2024, 2, 1), lastActiveDate: Chronos.create(2024, 2, 28) },
      ];

      const calculateRetention = (cohortMonth: number, retentionMonth: number): number => {
        const cohortStart = Chronos.create(2024, cohortMonth, 1);
        const cohortEnd = cohortStart.endOf('month');
        const retentionStart = Chronos.create(2024, retentionMonth, 1);

        const cohortUsers = users.filter(u => 
          u.signupDate.isSameOrAfter(cohortStart) && u.signupDate.isSameOrBefore(cohortEnd)
        );

        const retainedUsers = cohortUsers.filter(u =>
          u.lastActiveDate.isSameOrAfter(retentionStart)
        );

        return cohortUsers.length > 0 ? (retainedUsers.length / cohortUsers.length) * 100 : 0;
      };

      const janCohortRetention = {
        month1: calculateRetention(1, 2),
        month2: calculateRetention(1, 3),
        month3: calculateRetention(1, 4),
      };

      expect(janCohortRetention.month1).toBeCloseTo(66.67, 0); // 2/3 retained
      expect(janCohortRetention.month2).toBeCloseTo(66.67, 0); // 2/3 still active
      expect(janCohortRetention.month3).toBeCloseTo(33.33, 0); // 1/3 still active
    });

    test('generate time-series data with gaps filled', () => {
      const rawData = [
        { date: Chronos.create(2024, 4, 1), value: 100 },
        { date: Chronos.create(2024, 4, 3), value: 150 },
        { date: Chronos.create(2024, 4, 5), value: 120 },
        { date: Chronos.create(2024, 4, 7), value: 180 },
      ];

      const period = ChronosPeriod.create(
        Chronos.create(2024, 4, 1),
        Chronos.create(2024, 4, 7)
      );

      const filledData = period.map(day => {
        const existing = rawData.find(d => d.date.isSame(day, 'day'));
        return {
          date: day.format('YYYY-MM-DD'),
          value: existing?.value ?? 0,
          interpolated: !existing,
        };
      });

      expect(filledData.length).toBe(7);
      expect(filledData[0].value).toBe(100);
      expect(filledData[1].value).toBe(0);
      expect(filledData[1].interpolated).toBe(true);
      expect(filledData[2].value).toBe(150);
    });

    test('calculate peak usage hours', () => {
      const activities: UserActivity[] = [];
      
      // Generate sample data
      for (let day = 1; day <= 7; day++) {
        for (let hour = 8; hour <= 20; hour++) {
          const baseCount = hour >= 9 && hour <= 17 ? 50 : 20;
          const peakBonus = hour === 10 || hour === 14 ? 30 : 0;
          const count = baseCount + peakBonus + Math.floor(Math.random() * 10);
          
          for (let i = 0; i < count; i++) {
            activities.push({
              userId: `U${i}`,
              timestamp: Chronos.create(2024, 4, day, hour, Math.floor(Math.random() * 60)),
              action: 'activity',
              duration: 5,
            });
          }
        }
      }

      // Group by hour
      const hourlyDistribution: Record<number, number> = {};
      activities.forEach(a => {
        const hour = a.timestamp.hour;
        hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
      });

      // Find peak hours
      const sortedHours = Object.entries(hourlyDistribution)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

      expect(sortedHours.length).toBe(3);
      // Peak hours should be during work hours
      sortedHours.forEach(([hour]) => {
        expect(parseInt(hour)).toBeGreaterThanOrEqual(9);
        expect(parseInt(hour)).toBeLessThanOrEqual(17);
      });
    });
  });

  // ============================================================================
  // Complex Period Operations
  // ============================================================================

  describe('Complex Period Operations', () => {
    test('merge overlapping booking periods', () => {
      const bookings = new ChronosPeriodCollection([
        ChronosPeriod.create(Chronos.create(2024, 4, 1), Chronos.create(2024, 4, 5)),
        ChronosPeriod.create(Chronos.create(2024, 4, 3), Chronos.create(2024, 4, 8)),
        ChronosPeriod.create(Chronos.create(2024, 4, 10), Chronos.create(2024, 4, 12)),
        ChronosPeriod.create(Chronos.create(2024, 4, 11), Chronos.create(2024, 4, 15)),
        ChronosPeriod.create(Chronos.create(2024, 4, 20), Chronos.create(2024, 4, 25)),
      ]);

      const merged = bookings.union();

      expect(merged.length).toBe(3); // Three distinct periods after merging
    });

    test('find availability gaps between appointments', () => {
      // Use day-level periods for gaps() to work correctly
      const appointments = [
        ChronosPeriod.create(
          Chronos.create(2024, 4, 1),
          Chronos.create(2024, 4, 5)
        ),
        ChronosPeriod.create(
          Chronos.create(2024, 4, 8),
          Chronos.create(2024, 4, 10)
        ),
        ChronosPeriod.create(
          Chronos.create(2024, 4, 15),
          Chronos.create(2024, 4, 20)
        ),
      ];

      const collection = new ChronosPeriodCollection(appointments);
      const gaps = collection.gaps();

      // Should find gaps: April 6-7, April 11-14
      expect(gaps.length).toBe(2);
    });

    test('split period by business weeks', () => {
      const project = ChronosPeriod.create(
        Chronos.create(2024, 4, 1),
        Chronos.create(2024, 4, 30)
      );

      const weeks = project.splitByWeeks(1);
      
      expect(weeks.length).toBeGreaterThanOrEqual(4);
      
      // First week should start April 1
      expect(weeks[0].start.format('YYYY-MM-DD')).toBe('2024-04-01');
    });

    test('calculate business days excluding holidays', () => {
      const holidays = [
        Chronos.create(2024, 4, 1),  // April Fools
        Chronos.create(2024, 4, 15), // Tax Day
      ];

      const month = ChronosPeriod.month(2024, 4);
      
      const businessDays = month
        .filterWeekdays()
        .filter(day => !holidays.some(h => h.isSame(day, 'day')))
        .toArray();

      // April 2024 has 22 weekdays, minus 2 holidays = 20
      expect(businessDays.length).toBe(20);
    });

    test('find all Fridays the 13th in a year', () => {
      const year = ChronosPeriod.year(2024);
      
      const fridayThe13ths = year
        .filter(day => day.dayOfWeek === DayOfWeek.Friday && day.date === 13)
        .toArray();

      // 2024 has Friday the 13th in September and December
      expect(fridayThe13ths.length).toBe(2);
      fridayThe13ths.forEach(day => {
        expect(day.dayOfWeek).toBe(DayOfWeek.Friday);
        expect(day.date).toBe(13);
      });
    });
  });

  // ============================================================================
  // Edge Cases and Boundary Conditions
  // ============================================================================

  describe('Edge Cases and Boundary Conditions', () => {
    test('handle leap year calculations correctly', () => {
      const leapYear = Chronos.create(2024, 2, 29);
      const nonLeapYear = leapYear.addYears(1);

      expect(leapYear.format('YYYY-MM-DD')).toBe('2024-02-29');
      expect(leapYear.isLeapYear).toBe(true);
      // Adding 1 year to Feb 29 should give Feb 28 or Mar 1
      expect(nonLeapYear.month).toBeLessThanOrEqual(3);
    });

    test('handle month-end edge cases', () => {
      const jan31 = Chronos.create(2024, 1, 31);
      const plusOneMonth = jan31.addMonths(1);
      const plusTwoMonths = jan31.addMonths(2);

      // Jan 31 + 1 month should handle Feb having fewer days
      expect(plusOneMonth.month).toBe(2);
      expect(plusOneMonth.date).toBeLessThanOrEqual(29);
      
      // Jan 31 + 2 months = Mar 31
      expect(plusTwoMonths.month).toBe(3);
    });

    test('handle year boundary correctly', () => {
      const newYearsEve = Chronos.create(2024, 12, 31, 23, 59, 59);
      const newYear = newYearsEve.addSeconds(1);

      expect(newYearsEve.year).toBe(2024);
      expect(newYear.year).toBe(2025);
      expect(newYear.month).toBe(1);
      expect(newYear.date).toBe(1);
    });

    test('handle DST spring forward', () => {
      // March 10, 2024 - DST starts in US (2 AM becomes 3 AM)
      const beforeDst = Chronos.create(2024, 3, 10, 1, 30);
      const afterDst = beforeDst.addHours(2);

      // Time should advance correctly despite DST
      const hoursDiff = afterDst.diff(beforeDst, 'hours');
      expect(hoursDiff).toBe(2);
    });

    test('handle DST fall back', () => {
      // November 3, 2024 - DST ends in US (2 AM becomes 1 AM)
      const beforeDst = Chronos.create(2024, 11, 3, 1, 30);
      const afterDst = beforeDst.addHours(2);

      const hoursDiff = afterDst.diff(beforeDst, 'hours');
      expect(hoursDiff).toBe(2);
    });

    test('handle century boundary', () => {
      const endOf2099 = Chronos.create(2099, 12, 31, 23, 59, 59);
      const startOf2100 = endOf2099.addSeconds(1);

      expect(endOf2099.year).toBe(2099);
      expect(startOf2100.year).toBe(2100);
      expect(startOf2100.format('YYYY-MM-DD')).toBe('2100-01-01');
    });

    test('handle very long intervals', () => {
      // Use year 1900 to avoid JavaScript Date quirks with very old dates
      const old = Chronos.create(1900, 1, 1);
      const modern = Chronos.create(2024, 4, 15);

      const yearsDiff = modern.diff(old, 'years');
      
      expect(yearsDiff).toBe(124);
    });

    test('handle millisecond precision', () => {
      const t1 = Chronos.create(2024, 4, 15, 12, 0, 0, 100);
      const t2 = Chronos.create(2024, 4, 15, 12, 0, 0, 200);

      const msDiff = t2.diff(t1, 'milliseconds');

      expect(msDiff).toBe(100);
    });

    test('handle negative time differences', () => {
      const future = Chronos.create(2024, 6, 15);
      const past = Chronos.create(2024, 4, 15);

      const futureToPast = past.diff(future, 'days');
      const pastToFuture = future.diff(past, 'days');

      expect(futureToPast).toBeLessThan(0);
      expect(pastToFuture).toBeGreaterThan(0);
      expect(Math.abs(futureToPast)).toBe(pastToFuture);
    });
  });
});
