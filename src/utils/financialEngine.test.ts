import { describe, it, expect } from 'vitest';
import {
  calculateFinancialSummary,
  simulateDecision,
  generate30DayForecast,
  generateActionPlan,
  calculateDepletionDay,
} from './financialEngine';
import { formatINR, parseINR } from './currency';
import { loadStoredData, resetToDemoData } from './storage';
import type { Transaction, Commitment, SavingsGoal, ForecastDay } from '../types/financial';

describe('Financial Calculation Engine', () => {
  it('correctly calculates baseline empty state', () => {
    const summary = calculateFinancialSummary([], [], [], {
      startingBudget: 10000,
      currentDay: 1,
      totalDays: 30,
    });

    expect(summary.startingBudget).toBe(10000);
    expect(summary.totalIncome).toBe(0);
    expect(summary.totalExpenses).toBe(0);
    expect(summary.currentCashBalance).toBe(10000);
    expect(summary.outstandingCommitments).toBe(0);
    expect(summary.protectedSavings).toBe(0);
    expect(summary.spendableBalance).toBe(10000);
    expect(summary.daysRemaining).toBe(29);
    expect(summary.recommendedDailyAllowance).toBe(Math.floor(10000 / 29));
  });

  it('correctly accounts for income, expenses, commitments, and protected savings', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        description: 'Salary advance',
        amount: 2000,
        type: 'income',
        category: 'Other',
        date: '2026-10-02',
        createdAt: 1,
      },
      {
        id: '2',
        description: 'Groceries',
        amount: 1500,
        type: 'expense',
        category: 'Food',
        date: '2026-10-03',
        createdAt: 2,
      },
    ];

    const commitments: Commitment[] = [
      {
        id: 'c1',
        name: 'Internet',
        amount: 800,
        dueDate: '2026-10-15',
        category: 'Bills',
        isPaid: false,
        type: 'subscription',
      },
      {
        id: 'c2',
        name: 'Past Rent',
        amount: 1000,
        dueDate: '2026-10-01',
        category: 'Bills',
        isPaid: true,
        type: 'one-time',
      },
    ];

    const savings: SavingsGoal[] = [
      {
        id: 's1',
        name: 'Emergency',
        targetAmount: 3000,
        currentAmount: 1200,
        createdAt: 1,
      },
    ];

    // Cash = 10,000 + 2,000 - 1,500 = 10,500
    // Unpaid commitments = 800
    // Protected savings = 1,200
    // Spendable = 10,500 - 800 - 1,200 = 8,500
    const summary = calculateFinancialSummary(transactions, commitments, savings, {
      startingBudget: 10000,
      currentDay: 10,
      totalDays: 30,
    });

    expect(summary.currentCashBalance).toBe(10500);
    expect(summary.outstandingCommitments).toBe(800);
    expect(summary.paidCommitments).toBe(1000);
    expect(summary.protectedSavings).toBe(1200);
    expect(summary.spendableBalance).toBe(8500);
    expect(summary.daysRemaining).toBe(20);
    expect(summary.recommendedDailyAllowance).toBe(Math.floor(8500 / 20));
  });

  it('guarantees zero double counting when paying a commitment', () => {
    // Before paying: cash = 10000, commitment = 1000 unpaid, spendable = 9000
    const initialCommitments: Commitment[] = [
      {
        id: 'bill1',
        name: 'Electricity',
        amount: 1000,
        dueDate: '2026-10-15',
        category: 'Bills',
        isPaid: false,
        type: 'one-time',
      },
    ];

    const beforeSummary = calculateFinancialSummary([], initialCommitments, [], {
      startingBudget: 10000,
      currentDay: 10,
    });
    expect(beforeSummary.currentCashBalance).toBe(10000);
    expect(beforeSummary.outstandingCommitments).toBe(1000);
    expect(beforeSummary.spendableBalance).toBe(9000);

    // User marks bill as paid -> now transaction is recorded (expense: 1000) and commitment is marked isPaid: true
    const paidCommitments: Commitment[] = [
      {
        ...initialCommitments[0],
        isPaid: true,
      },
    ];
    const paidTransactions: Transaction[] = [
      {
        id: 'tx-bill1',
        description: 'Electricity Bill',
        amount: 1000,
        type: 'expense',
        category: 'Bills',
        date: '2026-10-15',
        linkedCommitmentId: 'bill1',
        createdAt: 100,
      },
    ];

    const afterSummary = calculateFinancialSummary(paidTransactions, paidCommitments, [], {
      startingBudget: 10000,
      currentDay: 10,
    });

    // Cash drops by 1000 to 9000, unpaid commitment drops from 1000 to 0.
    // Spendable balance remains 9000! NO DOUBLE COUNTING!
    expect(afterSummary.currentCashBalance).toBe(9000);
    expect(afterSummary.outstandingCommitments).toBe(0);
    expect(afterSummary.spendableBalance).toBe(9000);
    expect(afterSummary.spendableBalance).toBe(beforeSummary.spendableBalance);
  });

  it('handles edge case: zero remaining days without division by zero', () => {
    const summary = calculateFinancialSummary([], [], [], {
      startingBudget: 10000,
      currentDay: 30,
      totalDays: 30,
    });
    expect(summary.daysRemaining).toBe(0);
    expect(summary.recommendedDailyAllowance).toBe(10000);
  });

  it('handles edge case: negative spendable balance without crashing', () => {
    const transactions: Transaction[] = [
      {
        id: 'huge',
        description: 'Big mistake',
        amount: 12000,
        type: 'expense',
        category: 'Other',
        date: '2026-10-05',
        createdAt: 1,
      },
    ];
    const summary = calculateFinancialSummary(transactions, [], [], {
      startingBudget: 10000,
      currentDay: 10,
    });
    expect(summary.currentCashBalance).toBe(-2000);
    expect(summary.spendableBalance).toBe(-2000);
    expect(summary.recommendedDailyAllowance).toBe(0);
    expect(summary.health.riskLevel).toBe('Critical');
  });

  it('simulates a purchase without mutating original data and calculates accurate deltas', () => {
    const transactions: Transaction[] = [];
    const commitments: Commitment[] = [];
    const savings: SavingsGoal[] = [];

    const simResult = simulateDecision(
      transactions,
      commitments,
      savings,
      {
        type: 'purchase',
        description: 'New shoes',
        amount: 2000,
        category: 'Shopping',
      },
      { startingBudget: 10000, currentDay: 10, totalDays: 30 }
    );

    expect(simResult.before.spendableBalance).toBe(10000);
    expect(simResult.after.spendableBalance).toBe(8000);
    expect(simResult.delta.spendableBalance).toBe(-2000);
    expect(simResult.delta.dailyAllowance).toBeLessThan(0);
    expect(transactions.length).toBe(0); // Untouched original state
  });

  it('simulates income and correctly increases spendable balance and daily allowance', () => {
    const simResult = simulateDecision([], [], [], {
      type: 'income',
      description: 'Freelance gig',
      amount: 3000,
      category: 'Other',
    }, { startingBudget: 10000, currentDay: 10, totalDays: 30 });

    expect(simResult.before.spendableBalance).toBe(10000);
    expect(simResult.after.spendableBalance).toBe(13000);
    expect(simResult.delta.spendableBalance).toBe(3000);
    expect(simResult.delta.dailyAllowance).toBeGreaterThan(0);
    expect(simResult.isAffordable).toBe(true);
  });

  it('detects shortfalls when simulating an unaffordable decision', () => {
    const simResult = simulateDecision([], [], [], {
      type: 'purchase',
      description: 'Flagship Phone',
      amount: 15000,
      category: 'Shopping',
    }, { startingBudget: 10000, currentDay: 10, totalDays: 30 });

    expect(simResult.after.spendableBalance).toBe(-5000);
    expect(simResult.isAffordable).toBe(false);
    expect(simResult.shortfall).toBe(5000);
    expect(simResult.warnings.length).toBeGreaterThan(0);
  });

  it('simulates savings deposit and ring-fences spendable money', () => {
    const existingSavings: SavingsGoal[] = [
      { id: 'goal-1', name: 'Emergency', targetAmount: 2000, currentAmount: 500, createdAt: 1 },
    ];
    const simResult = simulateDecision([], [], existingSavings, {
      type: 'savings_deposit',
      description: 'Save for rainy day',
      amount: 500,
      category: 'Other',
    }, { startingBudget: 10000, currentDay: 10, totalDays: 30 });

    // Spendable balance drops by 500 because money is protected in savings!
    expect(simResult.delta.spendableBalance).toBe(-500);
  });

  it('generates a complete 30-day deterministic forecast', () => {
    const forecast = generate30DayForecast([], [], [], {
      startingBudget: 10000,
      currentDay: 12,
    });
    expect(forecast.length).toBe(30);
    expect(forecast[0].dayNumber).toBe(1);
    expect(forecast[29].dayNumber).toBe(30);
  });

  it('correctly formats INR currency', () => {
    expect(formatINR(10000)).toBe('₹10,000');
    expect(formatINR(2500.5)).toBe('₹2,501');
    expect(formatINR(500, { showSign: true })).toBe('+₹500');
    expect(formatINR(-500, { showSign: true })).toBe('-₹500');
    expect(formatINR(15000, { compact: true })).toBe('₹15.0k');
    expect(parseINR('₹2,500')).toBe(2500);
  });

  it('generates prioritized action moves when facing commitments or deficits', () => {
    const summary = calculateFinancialSummary([], [
      { id: 'c1', name: 'Hostel Rent', amount: 4000, dueDate: '2026-10-15', category: 'Bills', isPaid: false, type: 'one-time' },
    ], [], { startingBudget: 3000, currentDay: 12, totalDays: 30 });

    const moves = generateActionPlan(summary, [
      { id: 'c1', name: 'Hostel Rent', amount: 4000, dueDate: '2026-10-15', category: 'Bills', isPaid: false, type: 'one-time' },
    ]);

    expect(moves.length).toBeGreaterThan(0);
    const highPriorityMove = moves.find((m) => m.priority === 'high');
    expect(highPriorityMove).toBeDefined();
  });

  it('safely clamps 4-pillar health score within [0, 100] across extreme conditions', () => {
    // Huge deficit scenario
    const summaryDeficit = calculateFinancialSummary([
      { id: 'e1', description: 'Huge splurge', amount: 25000, type: 'expense', category: 'Shopping', date: '2026-10-02', createdAt: 1 },
    ], [], [], { startingBudget: 10000, currentDay: 10, totalDays: 30 });

    expect(summaryDeficit.health.score).toBeGreaterThanOrEqual(0);
    expect(summaryDeficit.health.score).toBeLessThanOrEqual(100);
    expect(summaryDeficit.health.riskLevel).toBe('Critical');

    // Flawless scenario
    const summaryPerfect = calculateFinancialSummary([], [], [
      { id: 's1', name: 'Emergency Cushion', targetAmount: 5000, currentAmount: 3000, createdAt: 1 },
    ], { startingBudget: 10000, currentDay: 5, totalDays: 30 });

    expect(summaryPerfect.health.score).toBeGreaterThanOrEqual(50);
    expect(summaryPerfect.health.score).toBeLessThanOrEqual(100);
  });

  it('correctly models unexpected emergency expense shockwaves', () => {
    const initialSummary = calculateFinancialSummary([], [], [], {
      startingBudget: 10000,
      currentDay: 12,
      totalDays: 30,
    });
    const initialAllowance = initialSummary.recommendedDailyAllowance;

    // Simulate emergency medical shock of ₹1,400
    const shockResult = simulateDecision([], [], [], {
      type: 'unexpected',
      description: 'Emergency Clinic Visit',
      amount: 1400,
      category: 'Health',
    }, { startingBudget: 10000, currentDay: 12, totalDays: 30 });

    expect(shockResult.delta.spendableBalance).toBe(-1400);
    expect(shockResult.after.dailyAllowance).toBeLessThan(initialAllowance);
    expect(shockResult.delta.dailyAllowance).toBe(Math.floor((10000 - 1400) / 18) - Math.floor(10000 / 18));
  });

  it('handles edge case: zero or boundary day inputs safely', () => {
    const summary = calculateFinancialSummary([], [], [], {
      startingBudget: 0,
      currentDay: 35, // clamped to 30
      totalDays: 30,
    });

    expect(summary.currentDay).toBe(30);
    expect(summary.daysRemaining).toBe(0);
    expect(summary.spendableBalance).toBe(0);
    expect(summary.recommendedDailyAllowance).toBe(0);
  });

  it('recovers gracefully from storage reset and corrupted fallback', () => {
    const demoData = resetToDemoData();
    expect(demoData.transactions.length).toBeGreaterThan(0);
    expect(demoData.startingBudget).toBe(10000);

    const loaded = loadStoredData();
    expect(loaded.transactions.length).toBeGreaterThan(0);
    expect(loaded.commitments.length).toBeGreaterThan(0);
  });

  it('calculates depletion day correctly when projected balance goes negative and returns null when safe', () => {
    // Solvent forecast: cash remains positive through Day 30
    const safeForecast = generate30DayForecast([], [], [], {
      startingBudget: 10000,
      currentDay: 12,
    });
    const safeDepletion = calculateDepletionDay(safeForecast, 12);
    expect(safeDepletion).toBeNull();

    // Deficit forecast: large bill on Day 15 causing deficit
    const deficitCommitments: Commitment[] = [
      { id: 'huge-bill', name: 'Semester Fee', amount: 15000, dueDate: '2026-10-15', category: 'Bills', isPaid: false, type: 'one-time' },
    ];
    const deficitForecast = generate30DayForecast([], deficitCommitments, [], {
      startingBudget: 10000,
      currentDay: 12,
    });
    const deficitDepletion = calculateDepletionDay(deficitForecast, 12);
    expect(deficitDepletion).toBe(15);
  });

  it('dynamically respects currentDay date scrubbing in simulateDecision', () => {
    // Simulate on Day 25
    const simDay25 = simulateDecision([], [], [], {
      type: 'purchase',
      description: 'Late month expense',
      amount: 500,
      category: 'Shopping',
    }, { startingBudget: 10000, currentDay: 25, totalDays: 30 });

    // Days remaining = 30 - 25 = 5 days
    expect(simDay25.before.dailyAllowance).toBe(Math.floor(10000 / 5));
    expect(simDay25.after.dailyAllowance).toBe(Math.floor(9500 / 5));
    expect(simDay25.delta.spendableBalance).toBe(-500);
  });

  it('accurately reports depletionDay inside simulation before and after comparisons', () => {
    // Normal purchase of 2000 does not deplete budget
    const safeSim = simulateDecision([], [], [], {
      type: 'purchase',
      description: 'Shoes',
      amount: 2000,
      category: 'Shopping',
    }, { startingBudget: 10000, currentDay: 12, totalDays: 30 });
    expect(safeSim.before.depletionDay).toBeNull();
    expect(safeSim.after.depletionDay).toBeNull();

    // Catastrophic purchase of 15000 causes immediate depletion
    const crashSim = simulateDecision([], [], [], {
      type: 'purchase',
      description: 'Motorcycle down payment',
      amount: 15000,
      category: 'Other',
    }, { startingBudget: 10000, currentDay: 12, totalDays: 30 });
    expect(crashSim.after.depletionDay).not.toBeNull();
    expect(crashSim.after.depletionDay).toBeGreaterThanOrEqual(12);
  });

  it('scales health score benchmarks proportionally for custom starting budgets', () => {
    // Starting budget = ₹20,000 (surplus benchmark 15% = ₹3,000, buffer 5% = ₹1,000)
    const summaryCustom = calculateFinancialSummary([], [], [
      { id: 'cushion', name: 'Vault', targetAmount: 4000, currentAmount: 2500, createdAt: 1 },
    ], { startingBudget: 20000, currentDay: 10, totalDays: 30 });

    expect(summaryCustom.health.score).toBeGreaterThanOrEqual(60);
    expect(summaryCustom.health.score).toBeLessThanOrEqual(100);
  });

  it('correctly handles compact currency formatting for lakhs and thousands', () => {
    expect(formatINR(1000, { compact: true })).toBe('₹1.0k');
    expect(formatINR(50000, { compact: true })).toBe('₹50.0k');
    expect(formatINR(100000, { compact: true })).toBe('₹1.0L');
    expect(formatINR(250000, { compact: true })).toBe('₹2.5L');
  });

  it('handles exactly-zero forecast and spendable balance boundaries correctly', () => {
    // 1. Forecast with balance dropping to exactly 0 on Day 20 (solvent, not depleted)
    const mockZeroForecast = [
      { dayNumber: 12, dateStr: '2026-10-12', cashBalance: 500, spendableBalance: 500, actualDailySpend: 0, projectedDailySpend: 100, isPast: false, isToday: true, isFuture: false, commitmentsDue: 0, commitmentsList: [] },
      { dayNumber: 20, dateStr: '2026-10-20', cashBalance: 0, spendableBalance: 0, actualDailySpend: 0, projectedDailySpend: 100, isPast: false, isToday: false, isFuture: true, commitmentsDue: 0, commitmentsList: [] },
      { dayNumber: 30, dateStr: '2026-10-30', cashBalance: 0, spendableBalance: 0, actualDailySpend: 0, projectedDailySpend: 0, isPast: false, isToday: false, isFuture: true, commitmentsDue: 0, commitmentsList: [] },
    ] as ForecastDay[];
    // Exactly zero balance is solvent (not depleted)
    expect(calculateDepletionDay(mockZeroForecast, 12)).toBeNull();

    // 2. Forecast where cash drops below 0 (-1) on Day 20 is immediately depleted
    const mockNegativeForecast = [
      { dayNumber: 12, dateStr: '2026-10-12', cashBalance: 500, spendableBalance: 500, actualDailySpend: 0, projectedDailySpend: 100, isPast: false, isToday: true, isFuture: false, commitmentsDue: 0, commitmentsList: [] },
      { dayNumber: 20, dateStr: '2026-10-20', cashBalance: -1, spendableBalance: -1, actualDailySpend: 0, projectedDailySpend: 100, isPast: false, isToday: false, isFuture: true, commitmentsDue: 0, commitmentsList: [] },
    ] as ForecastDay[];
    expect(calculateDepletionDay(mockNegativeForecast, 12)).toBe(20);

    // 3. Spending exactly the remaining budget produces exactly 0 spendable balance (affordable, shortfall = 0)
    const exactBudgetSim = simulateDecision([], [], [], {
      type: 'purchase',
      description: 'Spend all cash',
      amount: 10000,
      category: 'Other',
    }, { startingBudget: 10000, currentDay: 12, totalDays: 30 });
    expect(exactBudgetSim.after.spendableBalance).toBe(0);
    expect(exactBudgetSim.isAffordable).toBe(true);
    expect(exactBudgetSim.shortfall).toBe(0);

    // 4. Overspending by ₹1 produces negative spendable balance (not affordable, shortfall = 1)
    const overspendSim = simulateDecision([], [], [], {
      type: 'purchase',
      description: 'Overspend by 1 rupee',
      amount: 10001,
      category: 'Other',
    }, { startingBudget: 10000, currentDay: 12, totalDays: 30 });
    expect(overspendSim.after.spendableBalance).toBe(-1);
    expect(overspendSim.isAffordable).toBe(false);
    expect(overspendSim.shortfall).toBe(1);
  });

  it('safely handles date boundaries: Day 1, Day 30, and out-of-range clamping', () => {
    // Day 1 boundary
    const simDay1 = simulateDecision([], [], [], {
      type: 'purchase',
      description: 'Opening day expense',
      amount: 500,
      category: 'Food',
    }, { startingBudget: 10000, currentDay: 1, totalDays: 30 });
    expect(simDay1.before.dailyAllowance).toBe(Math.floor(10000 / 29)); // 30 - 1 = 29 days remaining
    expect(simDay1.after.spendableBalance).toBe(9500);

    // Day 30 boundary (final day of month: daysRemaining = 0)
    const simDay30 = simulateDecision([], [], [], {
      type: 'purchase',
      description: 'Final day grocery',
      amount: 200,
      category: 'Food',
    }, { startingBudget: 10000, currentDay: 30, totalDays: 30 });
    // When daysRemaining <= 0, dailyAllowance equals full remaining spendable balance
    expect(simDay30.before.dailyAllowance).toBe(10000);
    expect(simDay30.after.dailyAllowance).toBe(9800);
    expect(Number.isNaN(simDay30.after.dailyAllowance)).toBe(false);

    // Out-of-range clamping boundary (currentDay > 30 clamped to Day 30)
    const simClamped = simulateDecision([], [], [], {
      type: 'purchase',
      description: 'Clamped expense',
      amount: 100,
      category: 'Food',
    }, { startingBudget: 10000, currentDay: 35, totalDays: 30 });
    expect(Number.isNaN(simClamped.after.dailyAllowance)).toBe(false);

    // Forecast out-of-range clamping (currentDay: 0 clamped to 1)
    const forecastClamped = generate30DayForecast([], [], [], {
      startingBudget: 10000,
      currentDay: 0,
    });
    expect(forecastClamped.length).toBe(30);
    expect(forecastClamped[0].isToday).toBe(true);
  });

  it('correctly distinguishes immediate affordability from future belt-tightening recovery', () => {
    // Scenario 1: Insufficient spendable balance (e.g. ₹500 spendable cash, ₹1,500 purchase)
    const tightTx: Transaction[] = [
      { id: 't1', description: 'Rent share', amount: 1500, type: 'expense', category: 'Bills', date: '2026-10-05', createdAt: 1 },
    ];
    const deficitSim = simulateDecision(tightTx, [], [], {
      type: 'purchase',
      description: 'Course Certification',
      amount: 1500,
      category: 'Education',
    }, { startingBudget: 2000, currentDay: 12, totalDays: 30 });

    // Immediate affordability check: spendableBalance drops from 500 to -1000
    expect(deficitSim.after.spendableBalance).toBe(-1000);
    expect(deficitSim.isAffordable).toBe(false);
    expect(deficitSim.shortfall).toBe(1000);

    // Scenario 2: Sufficient spendable balance (e.g. ₹5,000 spendable cash, ₹1,500 purchase)
    const solventSim = simulateDecision([], [], [], {
      type: 'purchase',
      description: 'Winter Coat',
      amount: 1500,
      category: 'Shopping',
    }, { startingBudget: 5000, currentDay: 12, totalDays: 30 });

    expect(solventSim.after.spendableBalance).toBe(3500);
    expect(solventSim.isAffordable).toBe(true);
    expect(solventSim.shortfall).toBe(0);
  });
});
