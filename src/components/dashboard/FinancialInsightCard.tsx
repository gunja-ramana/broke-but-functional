import React from 'react';
import { useFinance } from '../../context/useFinance';
import { Lightbulb, Info } from 'lucide-react';
import { formatINR } from '../../utils/currency';

export const FinancialInsightCard: React.FC = () => {
  const { summary } = useFinance();

  // Deterministic, data-derived insight based on real figures
  let insightHeadline = '';
  let insightExplanation = '';
  let insightType: 'positive' | 'warning' | 'alert' = 'positive';

  if (summary.spendableBalance < 0) {
    insightType = 'alert';
    insightHeadline = `Critical Budget Deficit of ${formatINR(Math.abs(summary.spendableBalance))}`;
    insightExplanation = `Your cash in hand (${formatINR(summary.currentCashBalance)}) is less than your unpaid commitments (${formatINR(summary.outstandingCommitments)}) plus protected savings (${formatINR(summary.protectedSavings)}). You risk failing scheduled bill payments unless non-essential expenses are frozen immediately.`;
  } else if (summary.recommendedDailyAllowance < 150) {
    insightType = 'warning';
    insightHeadline = `Tight Daily Margin (${formatINR(summary.recommendedDailyAllowance)}/day)`;
    insightExplanation = `You have only ${formatINR(summary.spendableBalance)} spendable balance remaining across ${summary.daysRemaining} days. At your current pace, even a minor ₹300 takeout order will consume more than 2 full days of spending allowance.`;
  } else if (summary.outstandingCommitments > summary.currentCashBalance * 0.4) {
    insightType = 'warning';
    insightHeadline = 'Heavy Upcoming Bill Load';
    insightExplanation = `Unpaid commitments (${formatINR(summary.outstandingCommitments)}) make up ${Math.round((summary.outstandingCommitments / (summary.currentCashBalance || 1)) * 100)}% of your existing cash reserves. Reserve funds now for these obligations before considering any shopping or leisure.`;
  } else if (summary.protectedSavings >= 1000) {
    insightType = 'positive';
    insightHeadline = 'Emergency Safety Net Intact';
    insightExplanation = `You have preserved ${formatINR(summary.protectedSavings)} in protected savings while keeping your daily allowance at ${formatINR(summary.recommendedDailyAllowance)}/day. Your financial runway is healthy and capable of absorbing small unforeseen shocks without defaulting.`;
  } else {
    insightType = 'positive';
    insightHeadline = 'Balanced Survival Pace';
    insightExplanation = `With ${formatINR(summary.spendableBalance)} spendable across ${summary.daysRemaining} remaining days, your recommended allowance of ${formatINR(summary.recommendedDailyAllowance)}/day is sustainable if you avoid unscheduled impulse purchases.`;
  }

  const borderStyles = {
    positive: 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300',
    warning: 'bg-amber-950/20 border-amber-500/30 text-amber-300',
    alert: 'bg-rose-950/20 border-rose-500/30 text-rose-300',
  }[insightType];

  return (
    <div className={`p-5 sm:p-6 rounded-2xl border ${borderStyles} flex flex-col justify-between space-y-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-current/10 flex items-center justify-center shrink-0">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
              Live Data-Derived Financial Insight
            </span>
            <h2 className="text-base font-bold text-white mt-0.5">{insightHeadline}</h2>
          </div>
        </div>

        <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-current/15 border border-current/30 shrink-0">
          Data Verified
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        {insightExplanation}
      </p>

      <div className="pt-2 border-t border-current/20 flex items-center gap-1.5 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 shrink-0" />
        <span>Derived from real balance, unpaid bills, and {summary.daysRemaining}-day time horizon.</span>
      </div>
    </div>
  );
};
