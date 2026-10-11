import React from 'react';
import { useFinance } from '../../context/useFinance';
import { formatINR } from '../../utils/currency';
import { Compass, Sparkles, AlertCircle } from 'lucide-react';

export const DailyAllowanceCard: React.FC = () => {
  const { summary, setActiveTab } = useFinance();

  const isCritical = summary.recommendedDailyAllowance <= 100;
  const daysLeft = summary.daysRemaining;

  // Impact simulation micro-examples
  const spend500Impact = daysLeft > 1 ? Math.round(500 / (daysLeft - 1)) : 500;
  const save200Impact = daysLeft > 1 ? Math.round(200 / (daysLeft - 1)) : 200;

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#0f172a]/90 border border-slate-800 flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">Daily Spending Allowance Engine</h2>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-teal-500/15 text-teal-300 border border-teal-500/30">
            {daysLeft > 0 ? `${daysLeft} Days to Survive` : 'Final Day!'}
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          The single most vital metric to avoid going broke. Spend at or below this amount today to reach Day 30 with bills and emergency savings 100% intact.
        </p>
      </div>

      {/* Main Stat Callout */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
            Today's Safe Limit
          </span>
          <div className="text-3xl font-extrabold font-mono text-teal-300 mt-0.5">
            {formatINR(summary.recommendedDailyAllowance)}
            <span className="text-sm font-normal text-slate-400 ml-1">/ day</span>
          </div>
        </div>
        <div className="text-right text-xs text-slate-400">
          <p>Spendable Pool: <span className="font-mono text-slate-200">{formatINR(summary.spendableBalance)}</span></p>
          <p>Divided by: <span className="font-mono text-teal-400">{Math.max(1, daysLeft)} days</span></p>
        </div>
      </div>

      {/* Ripple Effect Explainer */}
      <div className="space-y-2 text-xs">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
          Consequences of Spending Decisions
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 text-slate-300 flex items-start gap-2">
            <span className="text-rose-400 font-mono font-bold shrink-0">-₹500</span>
            <p className="text-[11px] leading-tight text-slate-400">
              A ₹500 binge today reduces your allowance by <strong className="text-rose-300 font-mono">-₹{spend500Impact}/day</strong> for the rest of the month.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-slate-300 flex items-start gap-2">
            <span className="text-emerald-400 font-mono font-bold shrink-0">+₹200</span>
            <p className="text-[11px] leading-tight text-slate-400">
              Saving ₹200 today boosts your daily breathing room by <strong className="text-emerald-300 font-mono">+₹{save200Impact}/day</strong> going forward.
            </p>
          </div>
        </div>
      </div>

      {isCritical && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Warning: Your daily allowance is below ₹100. Discretionary spending should be paused until the end of the month.
          </p>
        </div>
      )}

      <button
        onClick={() => setActiveTab('simulator')}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-xl transition-colors cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Simulate a Purchase in "What-If?" Calculator
      </button>
    </div>
  );
};
