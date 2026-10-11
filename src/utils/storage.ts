import type { Transaction, Commitment, SavingsGoal } from '../types/financial';
import {
  INITIAL_STARTING_BUDGET,
  CURRENT_DAY_SAMPLE,
  INITIAL_TRANSACTIONS,
  INITIAL_COMMITMENTS,
  INITIAL_SAVINGS_GOALS,
} from './sampleData';

const STORAGE_KEYS = {
  TRANSACTIONS: 'bbf_transactions_v1',
  COMMITMENTS: 'bbf_commitments_v1',
  SAVINGS: 'bbf_savings_v1',
  BUDGET: 'bbf_starting_budget_v1',
  CURRENT_DAY: 'bbf_current_day_v1',
  INITIALIZED: 'bbf_initialized_v1',
};

export interface StoredAppState {
  transactions: Transaction[];
  commitments: Commitment[];
  savingsGoals: SavingsGoal[];
  startingBudget: number;
  currentDay: number;
}

export function loadStoredData(): StoredAppState {
  try {
    const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!isInit) {
      // First time loading: initialize with sample data
      return resetToDemoData();
    }

    const txRaw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const commRaw = localStorage.getItem(STORAGE_KEYS.COMMITMENTS);
    const savRaw = localStorage.getItem(STORAGE_KEYS.SAVINGS);
    const budgetRaw = localStorage.getItem(STORAGE_KEYS.BUDGET);
    const dayRaw = localStorage.getItem(STORAGE_KEYS.CURRENT_DAY);

    const transactions: Transaction[] = txRaw ? JSON.parse(txRaw) : INITIAL_TRANSACTIONS;
    const commitments: Commitment[] = commRaw ? JSON.parse(commRaw) : INITIAL_COMMITMENTS;
    const savingsGoals: SavingsGoal[] = savRaw ? JSON.parse(savRaw) : INITIAL_SAVINGS_GOALS;
    const startingBudget: number = budgetRaw ? Number(JSON.parse(budgetRaw)) : INITIAL_STARTING_BUDGET;
    const currentDay: number = dayRaw ? Number(JSON.parse(dayRaw)) : CURRENT_DAY_SAMPLE;

    // Validate structure
    if (!Array.isArray(transactions) || !Array.isArray(commitments) || !Array.isArray(savingsGoals)) {
      console.warn('Malformed storage state detected. Reverting to initial demo dataset.');
      return resetToDemoData();
    }

    return {
      transactions,
      commitments,
      savingsGoals,
      startingBudget: isNaN(startingBudget) ? INITIAL_STARTING_BUDGET : startingBudget,
      currentDay: isNaN(currentDay) ? CURRENT_DAY_SAMPLE : currentDay,
    };
  } catch (err) {
    console.error('Failed to load local storage state:', err);
    return resetToDemoData();
  }
}

export function saveStoredData(state: Partial<StoredAppState>): void {
  try {
    if (state.transactions !== undefined) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(state.transactions));
    }
    if (state.commitments !== undefined) {
      localStorage.setItem(STORAGE_KEYS.COMMITMENTS, JSON.stringify(state.commitments));
    }
    if (state.savingsGoals !== undefined) {
      localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(state.savingsGoals));
    }
    if (state.startingBudget !== undefined) {
      localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(state.startingBudget));
    }
    if (state.currentDay !== undefined) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_DAY, JSON.stringify(state.currentDay));
    }
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function resetToDemoData(): StoredAppState {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.COMMITMENTS, JSON.stringify(INITIAL_COMMITMENTS));
    localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(INITIAL_SAVINGS_GOALS));
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(INITIAL_STARTING_BUDGET));
    localStorage.setItem(STORAGE_KEYS.CURRENT_DAY, JSON.stringify(CURRENT_DAY_SAMPLE));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  } catch (err) {
    console.error('Failed to reset demo data in storage:', err);
  }

  return {
    transactions: INITIAL_TRANSACTIONS,
    commitments: INITIAL_COMMITMENTS,
    savingsGoals: INITIAL_SAVINGS_GOALS,
    startingBudget: INITIAL_STARTING_BUDGET,
    currentDay: CURRENT_DAY_SAMPLE,
  };
}
