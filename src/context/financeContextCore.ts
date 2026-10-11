import { createContext, useContext } from 'react';
import type {
  Transaction,
  Commitment,
  SavingsGoal,
  FinancialSummary,
  SimulationScenario,
  SimulationComparison,
  ForecastDay,
  ActionMove,
  ActiveTab,
  ExpenseCategory,
} from '../types/financial';

export interface FinanceContextType {
  // State
  transactions: Transaction[];
  commitments: Commitment[];
  savingsGoals: SavingsGoal[];
  startingBudget: number;
  currentDay: number;
  totalDays: number;
  activeTab: ActiveTab;
  
  // Computed Engine Values
  summary: FinancialSummary;
  forecastDays: ForecastDay[];
  actionMoves: ActionMove[];
  
  // Simulation State
  simulationScenario: SimulationScenario | null;
  simulationResult: SimulationComparison | null;
  
  // Methods
  setActiveTab: (tab: ActiveTab) => void;
  setCurrentDay: (day: number) => void;
  setStartingBudget: (amount: number) => void;
  
  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  editTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Commitments
  addCommitment: (comm: Omit<Commitment, 'id'>) => void;
  editCommitment: (id: string, updates: Partial<Commitment>) => void;
  deleteCommitment: (id: string) => void;
  payCommitment: (id: string) => void;
  
  // Savings
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  editSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;
  withdrawFromGoal: (id: string, amount: number) => void;
  
  // Simulator
  runSimulation: (scenario: SimulationScenario) => void;
  clearSimulation: () => void;
  applySimulation: () => boolean;
  
  // Unexpected Expense
  recordUnexpectedExpense: (params: {
    description: string;
    amount: number;
    category: ExpenseCategory;
    note?: string;
  }) => void;
  
  // Reset
  resetToDemo: () => void;
}

export const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function useFinance(): FinanceContextType {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
