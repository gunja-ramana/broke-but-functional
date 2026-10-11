import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  Transaction,
  Commitment,
  SavingsGoal,
  SimulationScenario,
  ActiveTab,
  ExpenseCategory,
} from '../types/financial';
import {
  calculateFinancialSummary,
  simulateDecision,
  generate30DayForecast,
  generateActionPlan,
} from '../utils/financialEngine';
import { loadStoredData, saveStoredData, resetToDemoData } from '../utils/storage';
import { FinanceContext } from './financeContextCore';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialData] = useState(() => loadStoredData());

  const [transactions, setTransactions] = useState<Transaction[]>(initialData.transactions);
  const [commitments, setCommitments] = useState<Commitment[]>(initialData.commitments);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(initialData.savingsGoals);
  const [startingBudget, setStartingBudgetState] = useState<number>(initialData.startingBudget);
  const [currentDay, setCurrentDayState] = useState<number>(initialData.currentDay);
  const totalDays = 30;

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [simulationScenario, setSimulationScenario] = useState<SimulationScenario | null>(null);

  // Sync to localStorage
  useEffect(() => {
    saveStoredData({
      transactions,
      commitments,
      savingsGoals,
      startingBudget,
      currentDay,
    });
  }, [transactions, commitments, savingsGoals, startingBudget, currentDay]);

  // Central Calculation Engine invocation
  const summary = useMemo(() => {
    return calculateFinancialSummary(transactions, commitments, savingsGoals, {
      startingBudget,
      currentDay,
      totalDays,
    });
  }, [transactions, commitments, savingsGoals, startingBudget, currentDay, totalDays]);

  const forecastDays = useMemo(() => {
    return generate30DayForecast(transactions, commitments, savingsGoals, {
      startingBudget,
      currentDay,
    });
  }, [transactions, commitments, savingsGoals, startingBudget, currentDay]);

  const actionMoves = useMemo(() => {
    return generateActionPlan(summary, commitments);
  }, [summary, commitments]);

  // Decision Simulator computation
  const simulationResult = useMemo(() => {
    if (!simulationScenario) return null;
    return simulateDecision(transactions, commitments, savingsGoals, simulationScenario, {
      startingBudget,
      currentDay,
      totalDays,
    });
  }, [transactions, commitments, savingsGoals, simulationScenario, startingBudget, currentDay, totalDays]);

  // Mutations
  const setStartingBudget = useCallback((amount: number) => {
    setStartingBudgetState(Math.max(100, amount));
  }, []);

  const setCurrentDay = useCallback((day: number) => {
    setCurrentDayState(Math.max(1, Math.min(30, day)));
  }, []);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);
  }, []);

  const editTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addCommitment = useCallback((comm: Omit<Commitment, 'id'>) => {
    const newComm: Commitment = {
      ...comm,
      id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setCommitments((prev) => [...prev, newComm]);
  }, []);

  const editCommitment = useCallback((id: string, updates: Partial<Commitment>) => {
    setCommitments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const deleteCommitment = useCallback((id: string) => {
    setCommitments((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const payCommitment = useCallback((id: string) => {
    const comm = commitments.find((c) => c.id === id);
    if (!comm || comm.isPaid) return;

    const todayStr = `2026-10-${currentDay.toString().padStart(2, '0')}`;

    // Mark commitment paid
    setCommitments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPaid: true, paidDate: todayStr } : c))
    );

    // Create corresponding transaction with linkedCommitmentId to guarantee exact zero double counting!
    const newTx: Transaction = {
      id: `tx-paid-${Date.now()}`,
      description: `${comm.name} (Paid)`,
      amount: comm.amount,
      type: 'expense',
      category: comm.category,
      date: todayStr,
      note: `Payment for scheduled commitment: ${comm.name}`,
      linkedCommitmentId: comm.id,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);
  }, [commitments, currentDay]);

  const addSavingsGoal = useCallback((goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: Date.now(),
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  }, []);

  const editSavingsGoal = useCallback((id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
  }, []);

  const deleteSavingsGoal = useCallback((id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const contributeToGoal = useCallback((id: string, amount: number) => {
    if (amount <= 0) return;
    const todayStr = `2026-10-${currentDay.toString().padStart(2, '0')}`;
    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const entry = {
            id: `contrib-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            amount,
            date: todayStr,
            type: 'deposit' as const,
          };
          return {
            ...g,
            currentAmount: g.currentAmount + amount,
            contributions: [...(g.contributions || []), entry],
          };
        }
        return g;
      })
    );
  }, [currentDay]);

  const withdrawFromGoal = useCallback((id: string, amount: number) => {
    if (amount <= 0) return;
    const todayStr = `2026-10-${currentDay.toString().padStart(2, '0')}`;
    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const newAmt = Math.max(0, g.currentAmount - amount);
          const diff = g.currentAmount - newAmt;
          if (diff <= 0) return g;
          const entry = {
            id: `contrib-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            amount: diff,
            date: todayStr,
            type: 'withdraw' as const,
          };
          return {
            ...g,
            currentAmount: newAmt,
            contributions: [...(g.contributions || []), entry],
          };
        }
        return g;
      })
    );
  }, [currentDay]);

  const runSimulation = useCallback((scenario: SimulationScenario) => {
    setSimulationScenario(scenario);
  }, []);

  const clearSimulation = useCallback(() => {
    setSimulationScenario(null);
  }, []);

  const applySimulation = useCallback((): boolean => {
    if (!simulationScenario) return false;

    const todayStr = `2026-10-${currentDay.toString().padStart(2, '0')}`;

    if (simulationScenario.type === 'income') {
      addTransaction({
        description: simulationScenario.description || 'Additional Income',
        amount: simulationScenario.amount,
        type: 'income',
        category: 'Other',
        date: todayStr,
        note: 'Committed via Decision Simulator',
      });
    } else if (simulationScenario.type === 'subscription' || simulationScenario.type === 'bill') {
      addCommitment({
        name: simulationScenario.description || 'New Commitment',
        amount: simulationScenario.amount,
        dueDate: todayStr,
        category: simulationScenario.category,
        isPaid: false,
        type: simulationScenario.type === 'subscription' ? 'subscription' : 'one-time',
        recurrence: simulationScenario.recurrence ?? (simulationScenario.type === 'subscription' ? 'monthly' : undefined),
        note: 'Added from Decision Simulator',
      });
    } else if (simulationScenario.type === 'savings_deposit') {
      if (savingsGoals.length > 0) {
        contributeToGoal(savingsGoals[0].id, simulationScenario.amount);
      } else {
        addSavingsGoal({
          name: 'General Savings',
          targetAmount: simulationScenario.amount * 2,
          currentAmount: simulationScenario.amount,
          notes: 'Added from Decision Simulator',
        });
      }
    } else {
      // Expense
      addTransaction({
        description: simulationScenario.description || 'Simulated Purchase',
        amount: simulationScenario.amount,
        type: 'expense',
        category: simulationScenario.category,
        date: todayStr,
        note: 'Committed from Decision Simulator',
      });
    }

    setSimulationScenario(null);
    return true;
  }, [simulationScenario, currentDay, addTransaction, addCommitment, savingsGoals, contributeToGoal, addSavingsGoal]);

  const recordUnexpectedExpense = useCallback(
    (params: {
      description: string;
      amount: number;
      category: ExpenseCategory;
      note?: string;
    }) => {
      const todayStr = `2026-10-${currentDay.toString().padStart(2, '0')}`;
      addTransaction({
        description: `[EMERGENCY] ${params.description}`,
        amount: params.amount,
        type: 'expense',
        category: params.category,
        date: todayStr,
        note: params.note || 'Recorded in Unexpected Expenses flow',
      });
    },
    [currentDay, addTransaction]
  );

  const resetToDemo = useCallback(() => {
    const data = resetToDemoData();
    setTransactions(data.transactions);
    setCommitments(data.commitments);
    setSavingsGoals(data.savingsGoals);
    setStartingBudgetState(data.startingBudget);
    setCurrentDayState(data.currentDay);
    setSimulationScenario(null);
  }, []);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        commitments,
        savingsGoals,
        startingBudget,
        currentDay,
        totalDays,
        activeTab,
        summary,
        forecastDays,
        actionMoves,
        simulationScenario,
        simulationResult,
        setActiveTab,
        setCurrentDay,
        setStartingBudget,
        addTransaction,
        editTransaction,
        deleteTransaction,
        addCommitment,
        editCommitment,
        deleteCommitment,
        payCommitment,
        addSavingsGoal,
        editSavingsGoal,
        deleteSavingsGoal,
        contributeToGoal,
        withdrawFromGoal,
        runSimulation,
        clearSimulation,
        applySimulation,
        recordUnexpectedExpense,
        resetToDemo,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

