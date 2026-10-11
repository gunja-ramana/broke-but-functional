import React, { useState } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  ReceiptText,
  CalendarClock,
  PiggyBank,
  AlertOctagon,
  TrendingUp,
  HeartPulse,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useFinance } from '../../context/useFinance';
import type { ActiveTab } from '../../types/financial';
import { formatINR } from '../../utils/currency';
import { ConfirmModal } from '../common/ConfirmModal';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  isSpecial?: boolean;
}

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { activeTab, setActiveTab, currentDay, totalDays, summary, resetToDemo } = useFinance();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'simulator',
      label: 'Decision Simulator',
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
      badge: 'What-If?',
      isSpecial: true,
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: <ReceiptText className="w-5 h-5" />,
      badge: `${summary.totalExpenses > 0 ? formatINR(summary.totalExpenses, { compact: true }) : ''}`,
    },
    {
      id: 'commitments',
      label: 'Commitments & Subs',
      icon: <CalendarClock className="w-5 h-5" />,
      badge: summary.outstandingCommitments > 0 ? formatINR(summary.outstandingCommitments, { compact: true }) : undefined,
    },
    {
      id: 'savings',
      label: 'Savings Goals',
      icon: <PiggyBank className="w-5 h-5" />,
      badge: formatINR(summary.protectedSavings, { compact: true }),
    },
    {
      id: 'unexpected',
      label: 'Unexpected Expense',
      icon: <AlertOctagon className="w-5 h-5 text-amber-400" />,
      badge: 'Emergency',
    },
    {
      id: 'forecast',
      label: '30-Day Forecast',
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      id: 'health',
      label: 'Risk & Health',
      icon: <HeartPulse className="w-5 h-5 text-rose-400" />,
      badge: `${summary.health.score}/100`,
    },
  ];

  const handleNavClick = (id: ActiveTab) => {
    setActiveTab(id);
    onClose();
  };

  const dayProgressPercent = Math.round((currentDay / totalDays) * 100);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-[#090e1c] border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/25">
              <Zap className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                Broke But Functional
              </h1>
              <p className="text-xs text-emerald-400 font-mono font-medium tracking-wide">
                SURVIVE THE MONTH
              </p>
            </div>
          </div>

          {/* Month Survival Tracker */}
          <div className="mt-4 p-3 bg-slate-900/90 rounded-xl border border-slate-800/90">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-400">Day {currentDay} of {totalDays}</span>
              <span className="text-emerald-400 font-mono">{summary.daysRemaining} days left</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                style={{ width: `${dayProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto" aria-label="Main sidebar navigation">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                } ${item.isSpecial && !isActive ? 'hover:border-emerald-500/30' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                        : item.isSpecial
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-3 bg-[#080d19]">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <p className="text-slate-400 font-medium">Health Status</p>
              <p className="text-white font-bold text-sm mt-0.5">{summary.health.grade}</p>
            </div>
            <div className="text-right font-mono">
              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                summary.health.riskLevel === 'Low'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : summary.health.riskLevel === 'Moderate'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}>
                {summary.health.riskLevel} Risk
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors border border-transparent hover:border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Scenario</span>
          </button>
        </div>
      </aside>

      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset to Initial Demo?"
        message="This will reset all transactions, commitments, and savings back to the realistic Day 12 baseline scenario (₹10,000 budget)."
        confirmLabel="Reset Everything"
        isDestructive={false}
        onConfirm={resetToDemo}
        onCancel={() => setShowResetConfirm(false)}
      />
    </>
  );
};
