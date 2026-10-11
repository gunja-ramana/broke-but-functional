import React from 'react';
import { useFinance } from '../../context/useFinance';
import { formatINR } from '../../utils/currency';
import {
  HeartPulse,
  ShieldCheck,
  AlertTriangle,
  Compass,
  Repeat,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const FinancialHealthView: React.FC = () => {
  const { summary, setActiveTab } = useFinance();
  const { health } = summary;

  const riskBadgeVariant = {
    Low: 'emerald' as const,
    Moderate: 'amber' as const,
    High: 'rose' as const,
    Critical: 'rose' as const,
  }[health.riskLevel];

  return (
    <div className="space-y-6">
      {/* Top Banner with Circular Score Gauge */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-[#0e1a2e] border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <HeartPulse className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Educational Financial Resilience Engine
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Financial Health Score: {health.score}/100
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              A transparent, 4-pillar deterministic heuristic that measures your financial resilience against budget depletion, overdue bills, and emergency shocks.
            </p>
          </div>

          {/* Health Gauge Box */}
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${
                    health.score >= 70
                      ? 'text-emerald-400'
                      : health.score >= 50
                      ? 'text-amber-400'
                      : 'text-rose-500'
                  } transition-all duration-1000 ease-out`}
                  strokeDasharray={`${health.score}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono font-extrabold text-xl text-white">
                {health.score}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">Health Rating</span>
              <p className="text-lg font-bold text-white">{health.grade}</p>
              <div className="mt-1">
                <Badge size="sm" variant={riskBadgeVariant}>
                  {health.riskLevel} Risk
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Insights List */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Core Determinants Influencing Your Score
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {health.insights.map((insight, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Pillars Breakdown */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white">
          Transparent 4-Pillar Mathematical Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1 */}
          <div className="p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Pillar 1: Runway</span>
                <Compass className="w-4 h-4 text-teal-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-teal-300">
                  {health.runwayScore} / 35
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {formatINR(summary.recommendedDailyAllowance)}/d
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Evaluates daily allowance against ₹333/day baseline. Depletion drops this score immediately.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
              Spendable: {formatINR(summary.spendableBalance)}
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Pillar 2: Bills</span>
                <Repeat className="w-4 h-4 text-sky-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-sky-300">
                  {health.commitmentCoverageScore} / 25
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {formatINR(summary.outstandingCommitments)} due
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Measures whether current bank cash fully covers all remaining unpaid bills.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
              Cash: {formatINR(summary.currentCashBalance)}
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Pillar 3: Cushion</span>
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-purple-300">
                  {health.savingsDisciplineScore} / 20
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {formatINR(summary.protectedSavings)} saved
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Benchmark is ₹1,000 (10% of monthly budget) in protected emergency savings.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
              Target: ₹1,000 (10%)
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Pillar 4: Burn Rate</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-amber-300">
                  {health.burnRateDisciplineScore} / 20
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {formatINR(summary.averageDailySpend)}/d avg
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Rates historical spending velocity. Burning faster than ₹333/day deducts points.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
              Projected End: {formatINR(summary.projectedMonthEndBalance)}
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Shortcut CTA */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" /> Want to boost this score?
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Test how earning freelance cash or ring-fencing ₹500 into savings elevates your score in the Simulator.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('simulator')}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
        >
          Open Decision Simulator
        </button>
      </div>

      {/* Educational Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Educational Notice:</strong> This health score and risk level are algorithmic estimations intended solely to guide personal budgeting decisions and illustrate financial trade-offs within the context of the &quot;Broke But Functional&quot; simulation. They do not constitute formal banking, credit, or certified financial advice.
        </p>
      </div>
    </div>
  );
};
