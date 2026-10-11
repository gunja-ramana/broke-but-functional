import React, { useState } from 'react';
import { useFinance } from '../../context/useFinance';
import type { SavingsGoal } from '../../types/financial';
import { formatINR } from '../../utils/currency';
import {
  PiggyBank,
  Plus,
  Shield,
  Target,
  Trash2,
  Edit2,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { SavingsGoalModal } from './SavingsGoalModal';
import { SavingsContributeModal } from './SavingsContributeModal';
import { ConfirmModal } from '../common/ConfirmModal';

export const SavingsGoalsManager: React.FC = () => {
  const { savingsGoals, summary, addSavingsGoal, editSavingsGoal, deleteSavingsGoal } =
    useFinance();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [contributeTargetGoal, setContributeTargetGoal] = useState<SavingsGoal | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallPercent = totalTarget > 0 ? Math.round((summary.protectedSavings / totalTarget) * 100) : 0;

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleOpenEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = (data: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    if (editingGoal) {
      editSavingsGoal(editingGoal.id, data);
    } else {
      addSavingsGoal(data);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteSavingsGoal(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase mb-1">
            <span>Ring-Fenced Savings</span>
            <Shield className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-purple-300">
            {formatINR(summary.protectedSavings)}
          </p>
          <p className="text-xs text-slate-500 mt-1">100% protected from daily spending</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase mb-1">
            <span>Total Savings Target</span>
            <Target className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">
            {formatINR(totalTarget)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Combined target for all goals</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase mb-1">
            <span>Overall Progress</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">
            {overallPercent}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {formatINR(Math.max(0, totalTarget - summary.protectedSavings))} remaining
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-4 rounded-2xl bg-[#0f172a]/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-purple-400" /> Protected Savings Vault
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Money saved here is deducted from your daily allowance so you don't accidentally burn it.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          New Goal
        </Button>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savingsGoals.map((goal) => {
          const progressPercent = Math.min(
            100,
            Math.round((goal.currentAmount / (goal.targetAmount || 1)) * 100)
          );
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className="p-5 sm:p-6 rounded-2xl bg-[#0f172a]/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-white">{goal.name}</h3>
                    {goal.targetDate && (
                      <span className="text-xs text-slate-400 font-mono">
                        Target Date: {goal.targetDate}
                      </span>
                    )}
                  </div>

                  <Badge
                    size="sm"
                    variant={progressPercent >= 100 ? 'emerald' : progressPercent >= 50 ? 'purple' : 'slate'}
                  >
                    {progressPercent}% Complete
                  </Badge>
                </div>

                <div className="flex items-baseline justify-between mt-3 mb-1.5">
                  <span className="text-2xl font-extrabold font-mono text-purple-300">
                    {formatINR(goal.currentAmount)}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Target: {formatINR(goal.targetAmount)}
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800"
                  role="progressbar"
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                  <span>{remaining > 0 ? `${formatINR(remaining)} to go` : 'Goal Accomplished! 🎉'}</span>
                  {goal.notes && <span className="truncate max-w-[150px]">{goal.notes}</span>}
                </div>

                {goal.contributions && goal.contributions.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Recent Vault Activity
                    </span>
                    <div className="space-y-1">
                      {goal.contributions.slice(-2).reverse().map((c) => (
                        <div key={c.id} className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-mono text-slate-500">{c.date}</span>
                          <span
                            className={`font-mono font-medium ${
                              c.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {c.type === 'deposit' ? '+' : '-'}{formatINR(c.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setContributeTargetGoal(goal)}
                  className="w-full text-purple-300 hover:text-white"
                >
                  Deposit / Withdraw
                </Button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(goal)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Edit goal"
                    aria-label={`Edit ${goal.name}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(goal.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete goal"
                    aria-label={`Delete ${goal.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleSaveGoal}
        initialData={editingGoal}
      />

      <SavingsContributeModal
        isOpen={contributeTargetGoal !== null}
        onClose={() => setContributeTargetGoal(null)}
        goal={contributeTargetGoal}
      />

      <ConfirmModal
        isOpen={deleteTargetId !== null}
        title="Delete Savings Goal?"
        message="This will delete this goal. Any ring-fenced funds will be returned to your spendable cash balance."
        confirmLabel="Delete Goal"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
