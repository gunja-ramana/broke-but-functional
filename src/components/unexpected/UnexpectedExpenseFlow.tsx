import React, { useState } from 'react';
import { useFinance } from '../../context/useFinance';
import { formatINR } from '../../utils/currency';
import {
  AlertOctagon,
  Stethoscope,
  Wrench,
  Zap,
  Car,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../common/Button';
import type { ExpenseCategory } from '../../types/financial';

interface EmergencyPreset {
  label: string;
  icon: React.ReactNode;
  amount: number;
  category: ExpenseCategory;
  description: string;
}

const EMERGENCY_PRESETS: EmergencyPreset[] = [
  {
    label: 'Doctor / Medical Clinic',
    icon: <Stethoscope className="w-5 h-5 text-rose-400" />,
    amount: 850,
    category: 'Health',
    description: 'Urgent doctor consultation, antibiotics and tests',
  },
  {
    label: 'Bike / Scooter Breakdown',
    icon: <Wrench className="w-5 h-5 text-amber-400" />,
    amount: 1200,
    category: 'Transport',
    description: 'Puncture, engine oil service and clutch repair',
  },
  {
    label: 'Replacement Charger / Cable',
    icon: <Zap className="w-5 h-5 text-sky-400" />,
    amount: 650,
    category: 'Shopping',
    description: 'Laptop 65W fast charger burnt out during exams',
  },
  {
    label: 'Heavy Rain Surge Commute',
    icon: <Car className="w-5 h-5 text-purple-400" />,
    amount: 420,
    category: 'Transport',
    description: 'Surge auto/cab after train services halted',
  },
];

export const UnexpectedExpenseFlow: React.FC = () => {
  const { summary, recordUnexpectedExpense, setActiveTab } = useFinance();

  const [description, setDescription] = useState('Medical Consultation & Meds');
  const [amount, setAmount] = useState('850');
  const [category, setCategory] = useState<ExpenseCategory>('Health');
  const [isLogged, setIsLogged] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const numAmount = parseFloat(amount) || 0;
  const daysLeft = Math.max(1, summary.daysRemaining);

  // Before vs After math
  const newSpendable = summary.spendableBalance - numAmount;
  const newAllowance = Math.max(0, Math.floor(newSpendable / daysLeft));
  const deltaAllowance = newAllowance - summary.recommendedDailyAllowance;
  const hasShortfall = newSpendable < 0;
  const shortfallAmount = hasShortfall ? Math.abs(newSpendable) : 0;

  // Recovery trade-off calculation
  const dailyCutNeeded = Math.ceil(numAmount / daysLeft);

  const handleSelectPreset = (preset: EmergencyPreset) => {
    setDescription(preset.description);
    setAmount(preset.amount.toString());
    setCategory(preset.category);
    setIsLogged(false);
    setFormError(null);
  };

  const handleCommitEmergency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setFormError('Please enter an emergency description');
      return;
    }
    if (numAmount <= 0) {
      setFormError('Please enter a valid emergency amount greater than ₹0');
      return;
    }

    setFormError(null);
    recordUnexpectedExpense({
      description: description.trim(),
      amount: numAmount,
      category,
      note: 'Emergency triage logged',
    });

    setIsLogged(true);
    setTimeout(() => {
      setIsLogged(false);
    }, 6000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5" /> Emergency Shock Absorber
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Unexpected Expense Triage
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real life happens. When an unexpected emergency hits your ₹10,000 budget, stress-test the damage immediately and implement realistic recovery cutbacks to survive the month.
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs text-slate-400 block">Emergency Cushion</span>
            <span className="text-xl sm:text-2xl font-mono font-bold text-purple-400">
              {formatINR(summary.protectedSavings)}
            </span>
            <span className="text-xs text-slate-400 block">
              in protected savings
            </span>
          </div>
        </div>
      </div>

      {isLogged && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Emergency expense recorded into live ledger. Totals updated!</span>
          </div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-xs underline text-emerald-300 font-bold hover:text-white"
          >
            Go to Dashboard
          </button>
        </div>
      )}

      {/* Quick Presets */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Select Common Emergency Scenario:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {EMERGENCY_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleSelectPreset(preset)}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 transition-all text-left flex items-start gap-3 cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-slate-800 shrink-0 group-hover:scale-105 transition-transform">
                {preset.icon}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">
                  {preset.label}
                </span>
                <span className="text-sm font-mono font-extrabold text-rose-400 block mt-0.5">
                  ₹{preset.amount}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Emergency Details</h3>

          <form onSubmit={handleCommitEmergency} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="urg-desc">
                Description
              </label>
              <input
                id="urg-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="urg-amt">
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold font-mono">₹</span>
                <input
                  id="urg-amt"
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
              >
                <option value="Health">Health</option>
                <option value="Transport">Transport</option>
                <option value="Bills">Bills</option>
                <option value="Shopping">Shopping / Repair</option>
                <option value="Food">Food</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {formError && (
              <p className="text-xs text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {formError}
              </p>
            )}

            <Button
              variant="danger"
              type="submit"
              className="w-full mt-2"
              icon={<ShieldAlert className="w-4 h-4" />}
            >
              Record Emergency Expense
            </Button>
          </form>
        </div>

        {/* Right: Shockwave Analysis & Recovery Playbook */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>Financial Shockwave Analysis</span>
              <span className="text-xs font-mono text-slate-400 font-normal">
                {daysLeft} Days to absorb shock
              </span>
            </h3>

            {/* Metric Impact Tiles */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Spendable Balance</span>
                <div className="flex items-center justify-between text-sm font-mono">
                  <span className="text-slate-400">{formatINR(summary.spendableBalance)}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className={`font-bold ${newSpendable < 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                    {formatINR(newSpendable)}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Daily Allowance</span>
                <div className="flex items-center justify-between text-sm font-mono">
                  <span className="text-slate-400">{formatINR(summary.recommendedDailyAllowance)}/d</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-teal-300 font-bold">
                    {formatINR(newAllowance)}/d
                  </span>
                </div>
                <span className="text-[10px] text-rose-400 font-mono mt-1 block">
                  ({deltaAllowance}/d drop)
                </span>
              </div>
            </div>

            {/* Shortfall Alert */}
            {hasShortfall ? (
              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Deficit Warning: ₹{shortfallAmount} Shortfall</span>
                </div>
                <p className="text-slate-300">
                  This expense wipes out your remaining spendable cash. You will need to withdraw from your ₹{summary.protectedSavings} savings cushion or delay a bill.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs">
                <span>
                  Survival Intact: Your ₹{newSpendable} spendable buffer can absorb this shock without borrowing or skipping scheduled bills.
                </span>
              </div>
            )}

            {/* Actionable Recovery Playbook */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Recommended Survival Trade-Offs
              </span>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-emerald-400 font-bold shrink-0">1.</span>
                  <span>
                    Cut daily discretionary dining and coffee by <strong>₹{dailyCutNeeded}/day</strong> for the next {daysLeft} days to fully offset this expense.
                  </span>
                </li>

                {summary.protectedSavings >= numAmount && (
                  <li className="flex items-start gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-purple-400 font-bold shrink-0">2.</span>
                    <span>
                      Withdraw <strong>₹{numAmount}</strong> from your Emergency Cushion savings goal to protect your ₹{summary.recommendedDailyAllowance}/day daily allowance.
                    </span>
                  </li>
                )}

                {summary.upcomingSubscriptions > 0 && (
                  <li className="flex items-start gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-sky-400 font-bold shrink-0">3.</span>
                    <span>
                      Pause non-essential subscriptions ({formatINR(summary.upcomingSubscriptions)} total) until next month.
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
