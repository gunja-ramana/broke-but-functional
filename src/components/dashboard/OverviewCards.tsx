import React from 'react';
import {
  Wallet,
  ShieldCheck,
  TrendingDown,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { useFinance } from '../../context/useFinance';
import { formatINR } from '../../utils/currency';

export const OverviewCards: React.FC = () => {
  const { summary } = useFinance();

  const isSpendableNegative = summary.spendableBalance < 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Spendable Balance */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          isSpendableNegative
            ? 'bg-rose-950/20 border-rose-500/40 shadow-glow-danger'
            : 'bg-[#0f172a]/90 border-slate-800 hover:border-slate-700/80'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Spendable Balance
          </span>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isSpendableNegative ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            {isSpendableNegative ? <AlertTriangle className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono ${
              isSpendableNegative ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {formatINR(summary.spendableBalance)}
          </span>
        </div>

        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          {isSpendableNegative
            ? `Deficit! You owe ${formatINR(Math.abs(summary.spendableBalance))} more than your cash.`
            : 'Safe money to spend without risking unpaid bills or savings.'}
        </p>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Cash in hand</span>
          <span className="font-mono text-slate-200">{formatINR(summary.currentCashBalance)}</span>
        </div>
      </div>

      {/* 2. Recommended Daily Allowance */}
      <div className="p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800 hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Daily Allowance
          </span>
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-teal-300">
            {formatINR(summary.recommendedDailyAllowance)}
          </span>
          <span className="text-xs text-slate-400 font-medium">/ day</span>
        </div>

        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          {summary.daysRemaining > 0
            ? `Calculated over ${summary.daysRemaining} remaining survival days.`
            : 'Final day of the month! Spend remaining cash safely.'}
        </p>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Formula</span>
          <span className="font-mono text-teal-400">Spendable ÷ {Math.max(1, summary.daysRemaining)}d</span>
        </div>
      </div>

      {/* 3. Recorded Spending */}
      <div className="p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800 hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Recorded Spending
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-amber-300">
            {formatINR(summary.totalExpenses)}
          </span>
        </div>

        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          Avg. {formatINR(summary.averageDailySpend)}/day across Day 1 to {summary.currentDay}.
        </p>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Total Income</span>
          <span className="font-mono text-emerald-400">+{formatINR(summary.totalIncome)}</span>
        </div>
      </div>

      {/* 4. Ring-Fenced Liabilities & Savings */}
      <div className="p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800 hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Locked & Protected
          </span>
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-sky-300">
            {formatINR(summary.outstandingCommitments + summary.protectedSavings)}
          </span>
        </div>

        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          Protected from daily spending so you never default or drain emergency cash.
        </p>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Bills: {formatINR(summary.outstandingCommitments)}</span>
          <span>Savings: {formatINR(summary.protectedSavings)}</span>
        </div>
      </div>
    </div>
  );
};
