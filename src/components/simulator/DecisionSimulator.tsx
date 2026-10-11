import React, { useState } from 'react';
import { useFinance } from '../../context/useFinance';
import type {
  ScenarioType,
  ExpenseCategory,
  RecurrenceInterval,
} from '../../types/financial';
import { formatINR } from '../../utils/currency';
import {
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Check,
  RotateCcw,
  ShoppingBag,
  Utensils,
  Repeat,
  Zap,
  PlusCircle,
  PiggyBank,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface PresetScenario {
  label: string;
  type: ScenarioType;
  description: string;
  amount: number;
  category: ExpenseCategory;
  isRecurring?: boolean;
  recurrence?: RecurrenceInterval;
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    label: 'Swiggy Midnight Pizza',
    type: 'food',
    description: 'Late night pizza & dessert delivery',
    amount: 480,
    category: 'Food',
  },
  {
    label: 'Sneakers Flash Sale',
    type: 'purchase',
    description: 'Streetwear sneakers discount sale',
    amount: 2200,
    category: 'Shopping',
  },
  {
    label: 'Netflix UHD Plan',
    type: 'subscription',
    description: 'Monthly Netflix 4K subscription',
    amount: 649,
    category: 'Entertainment',
    isRecurring: true,
    recurrence: 'monthly',
  },
  {
    label: 'Freelance Design Gig',
    type: 'income',
    description: 'Payment for college fest banner design',
    amount: 2500,
    category: 'Other',
  },
  {
    label: 'Dentist Tooth Ache',
    type: 'unexpected',
    description: 'Urgent dental consultation & medicine',
    amount: 1400,
    category: 'Health',
  },
  {
    label: 'Top Up Emergency Fund',
    type: 'savings_deposit',
    description: 'Ring-fence spare cash into savings',
    amount: 500,
    category: 'Other',
  },
];

export const DecisionSimulator: React.FC = () => {
  const {
    summary,
    simulationScenario,
    simulationResult,
    runSimulation,
    clearSimulation,
    applySimulation,
    setActiveTab,
  } = useFinance();

  const [type, setType] = useState<ScenarioType>('purchase');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Shopping');
  const [recurrence, setRecurrence] = useState<RecurrenceInterval>('monthly');
  const [applySuccessMessage, setApplySuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleApplyPreset = (preset: PresetScenario) => {
    setType(preset.type);
    setDescription(preset.description);
    setAmount(preset.amount.toString());
    setCategory(preset.category);
    if (preset.recurrence) setRecurrence(preset.recurrence);
    setFormError(null);

    runSimulation({
      type: preset.type,
      description: preset.description,
      amount: preset.amount,
      category: preset.category,
      recurrence: preset.recurrence,
      isRecurring: preset.isRecurring,
    });
    setApplySuccessMessage(null);
  };

  const handleSimulateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid amount greater than ₹0');
      return;
    }
    setFormError(null);

    runSimulation({
      type,
      description: description.trim() || `Simulated ${type}`,
      amount: Math.round(numAmount),
      category,
      recurrence: type === 'subscription' ? recurrence : undefined,
      isRecurring: type === 'subscription',
    });
    setApplySuccessMessage(null);
  };

  const handleCommit = () => {
    const success = applySimulation();
    if (success) {
      setApplySuccessMessage('Decision successfully committed to live ledger!');
      setTimeout(() => setApplySuccessMessage(null), 5000);
    }
  };

  const scenarioTypeIcons: Record<ScenarioType, React.ReactNode> = {
    purchase: <ShoppingBag className="w-4 h-4" />,
    food: <Utensils className="w-4 h-4" />,
    subscription: <Repeat className="w-4 h-4" />,
    bill: <Zap className="w-4 h-4" />,
    unexpected: <AlertTriangle className="w-4 h-4" />,
    income: <PlusCircle className="w-4 h-4" />,
    savings_deposit: <PiggyBank className="w-4 h-4" />,
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> What-If? Financial Engine
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Before You Spend Simulator
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Test drive any financial decision before spending. See the mathematical ripple effect on your spendable cash, daily allowance, savings goals, monthly forecast, and financial health score.
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs text-slate-400 block">Baseline Spendable</span>
            <span className="text-xl sm:text-2xl font-mono font-bold text-emerald-400">
              {formatINR(summary.spendableBalance)}
            </span>
            <span className="text-xs text-slate-400 block font-mono">
              ({formatINR(summary.recommendedDailyAllowance)}/day left)
            </span>
          </div>
        </div>
      </div>

      {applySuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{applySuccessMessage}</span>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs underline text-emerald-300 font-bold hover:text-white"
          >
            View in Transactions
          </button>
        </div>
      )}

      {/* Quick Scenario Presets */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Try a Realistic Gen Z Scenario:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESET_SCENARIOS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleApplyPreset(preset)}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800/80 transition-all text-left flex flex-col justify-between space-y-1.5 cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-400 group-hover:text-emerald-400">
                {scenarioTypeIcons[preset.type]}
                <span className="text-xs font-mono font-bold">
                  {preset.type === 'income' ? `+₹${preset.amount}` : `-₹${preset.amount}`}
                </span>
              </div>
              <p className="text-xs font-bold text-white line-clamp-1 group-hover:text-emerald-300">
                {preset.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Simulator Inputs & Result Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scenario Input Form */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Configure Custom Scenario
          </h3>

          <form onSubmit={handleSimulateCustom} className="space-y-3.5">
            {/* Scenario Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Scenario Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ScenarioType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none cursor-pointer"
              >
                <option value="purchase">Discretionary Purchase (Shopping/Gadget)</option>
                <option value="food">Food Delivery / Dining Out</option>
                <option value="subscription">Recurring Subscription (Netflix, Spotify, Gym)</option>
                <option value="bill">Scheduled Bill Payment</option>
                <option value="unexpected">Unexpected Emergency Expense</option>
                <option value="income">Additional Income (Gig/Freelance/Gift)</option>
                <option value="savings_deposit">Deposit into Protected Savings</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="sim-desc">
                Description
              </label>
              <input
                id="sim-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Swiggy order, Zara jacket, New monitor"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="sim-amt">
                Proposed Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold font-mono">₹</span>
                <input
                  id="sim-amt"
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder="500"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white font-mono text-sm placeholder-slate-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                />
              </div>
              {formError && (
                <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {formError}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none cursor-pointer"
              >
                <option value="Shopping">Shopping</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Bills">Bills</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Education">Education</option>
                <option value="Health">Health</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Recurrence if subscription */}
            {type === 'subscription' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Recurrence
                </label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as RecurrenceInterval)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none cursor-pointer"
                >
                  <option value="monthly">Monthly Recurring</option>
                  <option value="weekly">Weekly Recurring</option>
                  <option value="yearly">Yearly Recurring</option>
                </select>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button variant="primary" type="submit" className="flex-1">
                Preview Consequences
              </Button>
              {simulationScenario && (
                <Button variant="ghost" type="button" onClick={clearSimulation}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Live Before-vs-After Comparison */}
        <div className="lg:col-span-7 space-y-4">
          {!simulationResult ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 rounded-2xl bg-[#0f172a]/90 border border-dashed border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">No Simulation Active</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Pick a Gen Z preset scenario above or enter custom amounts on the left to preview exact before-vs-after financial consequences.
              </p>
            </div>
          ) : (
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                    Simulation Preview
                  </span>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {simulationScenario?.description}
                    <Badge variant={simulationResult.isAffordable ? 'emerald' : 'rose'} size="sm">
                      {simulationResult.isAffordable ? 'Affordable' : 'Deficit Risk'}
                    </Badge>
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400">Proposed</span>
                  <p className="text-lg font-mono font-bold text-white">
                    {formatINR(simulationScenario?.amount || 0)}
                  </p>
                </div>
              </div>

              {/* Before vs After Comparison Grid (6 Core Financial Impact Dimensions) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* 1. Spendable Balance */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Spendable Balance
                  </span>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                    <span>Before: {formatINR(simulationResult.before.spendableBalance)}</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-white flex items-baseline justify-between">
                    <span className={simulationResult.after.spendableBalance < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      {formatINR(simulationResult.after.spendableBalance)}
                    </span>
                    <span className={`text-xs font-semibold ${
                      simulationResult.delta.spendableBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {simulationResult.delta.spendableBalance >= 0 ? '+' : ''}{formatINR(simulationResult.delta.spendableBalance)}
                    </span>
                  </div>
                </div>

                {/* 2. Daily Allowance */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Daily Allowance
                  </span>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                    <span>Before: {formatINR(simulationResult.before.dailyAllowance)}/d</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-white flex items-baseline justify-between">
                    <span className="text-teal-300 font-mono">
                      {formatINR(simulationResult.after.dailyAllowance)}/d
                    </span>
                    <span className={`text-xs font-semibold ${
                      simulationResult.delta.dailyAllowance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {simulationResult.delta.dailyAllowance >= 0 ? '+' : ''}{formatINR(simulationResult.delta.dailyAllowance)}/d
                    </span>
                  </div>
                </div>

                {/* 3. Savings Goal Progress */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Protected Savings
                  </span>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                    <span>Before: {formatINR(simulationResult.before.protectedSavings)}</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-white flex items-baseline justify-between">
                    <span className="text-purple-300 font-mono">
                      {formatINR(simulationResult.after.protectedSavings)}
                    </span>
                    <span className={`text-xs font-semibold ${
                      simulationResult.delta.protectedSavings > 0
                        ? 'text-purple-300'
                        : simulationResult.delta.protectedSavings < 0
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}>
                      {simulationResult.delta.protectedSavings > 0
                        ? `+${formatINR(simulationResult.delta.protectedSavings)}`
                        : simulationResult.delta.protectedSavings < 0
                        ? formatINR(simulationResult.delta.protectedSavings)
                        : 'Safe'}
                    </span>
                  </div>
                </div>

                {/* 4. Financial Health Score */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Health Score
                  </span>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                    <span>Before: {simulationResult.before.healthScore}/100</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-white flex items-baseline justify-between">
                    <span>{simulationResult.after.healthScore}/100</span>
                    <span className={`text-xs font-semibold ${
                      simulationResult.delta.healthScore >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {simulationResult.delta.healthScore >= 0 ? '+' : ''}{simulationResult.delta.healthScore} pts
                    </span>
                  </div>
                </div>

                {/* 5. Risk Level */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Risk Level
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs text-slate-400 font-mono">
                      {simulationResult.before.riskLevel}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className={`text-xs font-bold font-mono ${
                      simulationResult.after.riskLevel === 'Low'
                        ? 'text-emerald-400'
                        : simulationResult.after.riskLevel === 'Moderate'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}>
                      {simulationResult.after.riskLevel}
                    </span>
                  </div>
                </div>

                {/* 6. Projected Month-End */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Projected Month-End
                  </span>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                    <span>Was: {formatINR(simulationResult.before.projectedMonthEnd)}</span>
                  </div>
                  <div className="text-lg font-bold font-mono flex items-baseline justify-between">
                    <span className={simulationResult.after.projectedMonthEnd < 0 ? 'text-rose-400' : 'text-slate-200'}>
                      {formatINR(simulationResult.after.projectedMonthEnd)}
                    </span>
                    <span className={`text-xs font-semibold ${
                      simulationResult.delta.projectedMonthEnd >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {simulationResult.delta.projectedMonthEnd >= 0 ? '+' : ''}{formatINR(simulationResult.delta.projectedMonthEnd)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning / Consequence Callouts */}
              {simulationResult.warnings.length > 0 && (
                <div className="space-y-2">
                  {simulationResult.warnings.map((warn, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendation Box */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    Financial Recommendation
                  </span>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    {simulationResult.recommendation}
                  </p>
                </div>
              </div>

              {/* Clear Two Actions: Apply Decision vs Reset/Cancel */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <p className="text-[11px] text-slate-400">
                  Previewing does not alter real state. Click below to commit.
                </p>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <Button
                    variant="ghost"
                    onClick={clearSimulation}
                    className="flex-1 sm:flex-none"
                  >
                    Discard Simulation
                  </Button>
                  <Button
                    variant={simulationResult.isAffordable ? 'primary' : 'danger'}
                    icon={<Check className="w-4 h-4" />}
                    onClick={handleCommit}
                    className="flex-1 sm:flex-none"
                  >
                    Apply Decision
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
