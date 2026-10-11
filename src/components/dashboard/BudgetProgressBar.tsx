import React from 'react';
import { useFinance } from '../../context/useFinance';
import { formatINR } from '../../utils/currency';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const BudgetProgressBar: React.FC = () => {
  const { summary } = useFinance();

  const totalEffectiveBudget = summary.startingBudget + summary.totalIncome;
  
  // Percent calculations relative to total effective budget
  const spentPercent = Math.min(100, Math.round((summary.totalExpenses / totalEffectiveBudget) * 100));
  const commitmentsPercent = Math.min(100, Math.round((summary.outstandingCommitments / totalEffectiveBudget) * 100));
  const savingsPercent = Math.min(100, Math.round((summary.protectedSavings / totalEffectiveBudget) * 100));
  const spendablePercent = Math.max(0, 100 - spentPercent - commitmentsPercent - savingsPercent);

  const isOverBudget = summary.spendableBalance < 0;

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            Monthly Budget Allocation & Progress
            {isOverBudget ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Budget Deficit
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Within Budget
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Total Effective Pool: <span className="font-mono text-slate-200 font-semibold">{formatINR(totalEffectiveBudget)}</span> ({formatINR(summary.startingBudget)} base + {formatINR(summary.totalIncome)} income)
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400">Survival Runway</span>
          <p className="text-sm font-mono font-bold text-emerald-400">
            {Math.max(0, spendablePercent)}% Available
          </p>
        </div>
      </div>

      {/* Accessible Multi-Segment Progress Bar */}
      <div
        className="relative w-full h-4 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800"
        role="progressbar"
        aria-valuenow={spentPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Monthly budget allocation breakdown"
      >
        {/* Spent */}
        <div
          className="h-full bg-amber-500 transition-all duration-300"
          style={{ width: `${spentPercent}%` }}
          title={`Spent: ${spentPercent}%`}
        />
        {/* Unpaid Commitments */}
        <div
          className="h-full bg-sky-500 transition-all duration-300"
          style={{ width: `${commitmentsPercent}%` }}
          title={`Commitments: ${commitmentsPercent}%`}
        />
        {/* Protected Savings */}
        <div
          className="h-full bg-purple-500 transition-all duration-300"
          style={{ width: `${savingsPercent}%` }}
          title={`Savings: ${savingsPercent}%`}
        />
        {/* Spendable Runway */}
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${spendablePercent}%` }}
          title={`Spendable Runway: ${spendablePercent}%`}
        />
      </div>

      {/* Legend & Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[11px]">Spent So Far</span>
            <span className="font-mono font-semibold text-slate-200">
              {formatINR(summary.totalExpenses)} ({spentPercent}%)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-sky-500 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[11px]">Unpaid Bills</span>
            <span className="font-mono font-semibold text-slate-200">
              {formatINR(summary.outstandingCommitments)} ({commitmentsPercent}%)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[11px]">Protected Savings</span>
            <span className="font-mono font-semibold text-slate-200">
              {formatINR(summary.protectedSavings)} ({savingsPercent}%)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[11px]">Spendable Left</span>
            <span className={`font-mono font-semibold ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
              {formatINR(summary.spendableBalance)} ({spendablePercent}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
