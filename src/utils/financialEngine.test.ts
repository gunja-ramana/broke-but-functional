import { describe, it, expect } from 'vitest';
import {
  calculateFinancialSummary,
  simulateDecision,
  generate30DayForecast,
  generateActionPlan,
} from './financialEngine';
import { formatINR, parseINR } from './currency';
import { loadStoredData, resetToDemoData } from './storage';
import type { Transaction, Commitment, SavingsGoal } from '../types/financial';

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
});
