import React from 'react';
import { Menu, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { useFinance } from '../../context/useFinance';
import { formatINR } from '../../utils/currency';
import { Button } from '../common/Button';

interface HeaderProps {
  onOpenSidebar: () => void;
  onOpenAddTransaction: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  onOpenAddTransaction,
}) => {
  const { activeTab, setActiveTab, summary, currentDay, setCurrentDay } = useFinance();

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Month Survival Dashboard',
      subtitle: `Managing ₹10,000 budget • Day ${currentDay} of 30 (${summary.daysRemaining} days left)`,
    },
    simulator: {
      title: 'Financial Decision Simulator',
      subtitle: 'Simulate financial moves before committing a single rupee',
    },
    transactions: {
      title: 'Transactions Ledger',
      subtitle: 'Track, categorize, and audit every inflow and outflow',
    },
    commitments: {
      title: 'Commitments & Subscriptions',
      subtitle: 'Fixed liabilities, bills, and monthly recurring services',
    },
    savings: {
      title: 'Protected Savings Goals',
      subtitle: 'Ring-fenced emergency cushion and planned goals',
    },
    unexpected: {
      title: 'Unexpected Expense Triage',
      subtitle: 'Stress test and log financial emergencies with immediate recovery plans',
    },
    forecast: {
      title: '30-Day Financial Forecast',
      subtitle: 'Deterministic projection across all 30 days of the month',
    },
    health: {
      title: 'Financial Health & Risk Score',
      subtitle: 'Transparent 4-pillar financial resilience heuristic',
    },
  };

  const currentMeta = tabTitles[activeTab] || tabTitles.dashboard;

  return (
    <header className="sticky top-0 z-30 bg-[#080d1a]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3.5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Mobile hamburger & Titles */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {currentMeta.title}
              {summary.spendableBalance < 0 && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  <AlertCircle className="w-3 h-3" /> Deficit
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              {currentMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Quick metrics & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Day scrubber */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-slate-400">Day:</span>
            <select
              value={currentDay}
              onChange={(e) => setCurrentDay(Number(e.target.value))}
              className="bg-transparent text-emerald-400 font-mono font-bold focus:outline-none cursor-pointer"
              aria-label="Select current simulation day"
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d} className="bg-slate-900 text-slate-200">
                  {d} / 30
                </option>
              ))}
            </select>
          </div>

          {/* Spendable Allowance Pill */}
          <div className="hidden xl:flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Spendable</span>
              <span className={`font-mono font-bold ${summary.spendableBalance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {formatINR(summary.spendableBalance)}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Daily Cap</span>
              <span className="font-mono font-bold text-teal-300">
                {formatINR(summary.recommendedDailyAllowance)}/d
              </span>
            </div>
          </div>

          {/* Quick Simulator CTA */}
          <Button
            variant="secondary"
            size="sm"
            icon={<Sparkles className="w-4 h-4 text-emerald-400" />}
            onClick={() => setActiveTab('simulator')}
            className="hidden sm:inline-flex"
          >
            What-If?
          </Button>

          {/* Add Transaction Button */}
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={onOpenAddTransaction}
          >
            Add Record
          </Button>
        </div>
      </div>
    </header>
  );
};
