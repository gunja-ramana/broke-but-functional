export type TransactionType = 'expense' | 'income';

export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Bills'
  | 'Education'
  | 'Entertainment'
  | 'Health'
  | 'Other';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  note?: string;
  isSimulated?: boolean;
  linkedCommitmentId?: string; // Prevents double counting when paying commitment
  createdAt: number;
}

export type CommitmentType = 'one-time' | 'subscription';
export type RecurrenceInterval = 'monthly' | 'weekly' | 'yearly';

export interface Commitment {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  category: ExpenseCategory;
  isPaid: boolean;
  type: CommitmentType;
  recurrence?: RecurrenceInterval;
  note?: string;
  paidDate?: string;
}

export interface SavingsContribution {
  id: string;
  amount: number;
  date: string;
  type: 'deposit' | 'withdraw';
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  category?: string;
  createdAt: number;
  notes?: string;
  contributions?: SavingsContribution[];
}

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';
export type HealthGrade = 'Excellent' | 'Healthy' | 'Fragile' | 'High Risk' | 'Critical';

export interface HealthBreakdown {
  score: number; // 0-100
  grade: HealthGrade;
  riskLevel: RiskLevel;
  runwayScore: number; // max 35
  commitmentCoverageScore: number; // max 25
  savingsDisciplineScore: number; // max 20
  burnRateDisciplineScore: number; // max 20
  insights: string[];
}

export interface FinancialSummary {
  startingBudget: number; // Default ₹10,000
  currentDay: number; // e.g. Day 12
  totalDays: number; // 30 days
  daysRemaining: number; // 30 - currentDay (e.g. 18)
  
  totalIncome: number; // Recorded additional income
  totalExpenses: number; // Recorded expenses
  currentCashBalance: number; // Starting budget + income - expenses
  
  outstandingCommitments: number; // Unpaid commitments
  paidCommitments: number; // Already paid commitments
  upcomingSubscriptions: number; // Unpaid subscriptions
  
  protectedSavings: number; // Total locked in savings goals
  spendableBalance: number; // Cash balance - unpaid commitments - protected savings
  
  recommendedDailyAllowance: number; // spendableBalance / daysRemaining (safe min 0)
  projectedMonthEndBalance: number; // Estimated cash on day 30
  averageDailySpend: number; // Recorded discretionary spend / days passed
  burnRateRatio: number; // average daily spend vs ideal daily allowance
  
  health: HealthBreakdown;
}

export type ScenarioType =
  | 'purchase'
  | 'food'
  | 'subscription'
  | 'bill'
  | 'unexpected'
  | 'income'
  | 'savings_deposit';

export interface SimulationScenario {
  type: ScenarioType;
  description: string;
  amount: number;
  category: ExpenseCategory;
  recurrence?: RecurrenceInterval;
  isRecurring?: boolean;
}

export interface SimulationComparison {
  before: {
    spendableBalance: number;
    dailyAllowance: number;
    protectedSavings: number;
    projectedMonthEnd: number;
    healthScore: number;
    riskLevel: RiskLevel;
  };
  after: {
    spendableBalance: number;
    dailyAllowance: number;
    protectedSavings: number;
    projectedMonthEnd: number;
    healthScore: number;
    riskLevel: RiskLevel;
  };
  delta: {
    spendableBalance: number;
    dailyAllowance: number;
    protectedSavings: number;
    projectedMonthEnd: number;
    healthScore: number;
  };
  warnings: string[];
  recommendation: string;
  isAffordable: boolean;
  shortfall: number;
}

export interface ActionMove {
  id: string;
  title: string;
  description: string;
  impactLabel: string;
  impactAmount?: number;
  priority: 'high' | 'medium' | 'low';
  category: 'commitments' | 'savings' | 'spending' | 'budget';
  actionType: 'open_simulator' | 'open_commitments' | 'open_savings' | 'open_transactions' | 'none';
}

export interface ForecastDay {
  dayNumber: number;
  dateStr: string;
  isPast: boolean;
  isToday: boolean;
  isFuture: boolean;
  actualDailySpend: number;
  projectedDailySpend: number;
  cashBalance: number;
  spendableBalance: number;
  commitmentsDue: number;
  commitmentsList: string[];
  eventNote?: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'transactions'
  | 'simulator'
  | 'commitments'
  | 'savings'
  | 'unexpected'
  | 'forecast'
  | 'health';
