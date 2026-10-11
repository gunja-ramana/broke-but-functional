import React from 'react';
import { useFinance } from '../../context/useFinance';
import { Target, ArrowRight, ShieldAlert, Sparkles, PiggyBank, CalendarClock } from 'lucide-react';
import { Badge } from '../common/Badge';
import type { ActionMove } from '../../types/financial';

export const ActionPlanSection: React.FC = () => {
  const { actionMoves, setActiveTab } = useFinance();

  const handleAction = (move: ActionMove) => {
    if (move.actionType === 'open_simulator') setActiveTab('simulator');
    else if (move.actionType === 'open_commitments') setActiveTab('commitments');
    else if (move.actionType === 'open_savings') setActiveTab('savings');
    else if (move.actionType === 'open_transactions') setActiveTab('transactions');
  };

  const priorityBadge: Record<string, 'rose' | 'amber' | 'emerald'> = {
    high: 'rose',
    medium: 'amber',
    low: 'emerald',
  };

  const categoryIcon: Record<string, React.ReactNode> = {
    commitments: <CalendarClock className="w-4 h-4 text-sky-400" />,
    savings: <PiggyBank className="w-4 h-4 text-purple-400" />,
    spending: <ShieldAlert className="w-4 h-4 text-amber-400" />,
    budget: <Sparkles className="w-4 h-4 text-emerald-400" />,
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Your Next Best Moves</h2>
            <p className="text-xs text-slate-400">Ranked, non-judgmental actions derived from your live numbers</p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
          {actionMoves.length} Actions Ready
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {actionMoves.map((move) => (
          <div
            key={move.id}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  {categoryIcon[move.category]}
                  <span className="text-[11px] font-semibold text-slate-400 capitalize">{move.category}</span>
                </div>
                <Badge size="sm" variant={priorityBadge[move.priority]}>
                  {move.priority} priority
                </Badge>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                {move.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {move.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-mono text-emerald-400 font-semibold truncate max-w-[170px]">
                {move.impactLabel}
              </span>

              {move.actionType !== 'none' && (
                <button
                  onClick={() => handleAction(move)}
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform cursor-pointer"
                >
                  Take Action <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
