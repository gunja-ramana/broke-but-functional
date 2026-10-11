import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { SavingsGoal } from '../../types/financial';
import { useFinance } from '../../context/useFinance';
import { formatINR } from '../../utils/currency';
import { AlertCircle } from 'lucide-react';

interface SavingsContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export const SavingsContributeModal: React.FC<SavingsContributeModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  const { summary, contributeToGoal, withdrawFromGoal } = useFinance();
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('300');
  const [error, setError] = useState<string | null>(null);

  if (!goal) return null;

  const numAmount = parseFloat(amount) || 0;
  const daysLeft = Math.max(1, summary.daysRemaining);

  // Impact calculations
  const projectedSpendable =
    mode === 'deposit'
      ? summary.spendableBalance - numAmount
      : summary.spendableBalance + numAmount;

  const projectedAllowance = Math.max(0, Math.floor(projectedSpendable / daysLeft));
  const deltaAllowance = projectedAllowance - summary.recommendedDailyAllowance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (mode === 'deposit' && numAmount > summary.spendableBalance) {
      setError(`Cannot deposit more than available spendable balance (${formatINR(summary.spendableBalance)})`);
      return;
    }

    if (mode === 'withdraw' && numAmount > goal.currentAmount) {
      setError(`Cannot withdraw more than current saved amount (${formatINR(goal.currentAmount)})`);
      return;
    }

    if (mode === 'deposit') {
      contributeToGoal(goal.id, numAmount);
    } else {
      withdrawFromGoal(goal.id, numAmount);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${mode === 'deposit' ? 'Contribute to' : 'Withdraw from'} ${goal.name}`}
      subtitle="Adjust your protected savings allocation"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle Deposit vs Withdraw */}
        <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('deposit');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'deposit'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Deposit (+)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('withdraw');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'withdraw'
                ? 'bg-slate-800 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Withdraw (-)
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="contrib-amt">
            Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold font-mono">₹</span>
            <input
              id="contrib-amt"
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
              }}
              className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 mt-2">
            {[100, 250, 500, 1000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset.toString())}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-mono border border-slate-800 cursor-pointer"
              >
                +₹{preset}
              </button>
            ))}
          </div>

          {error && (
            <p className="text-xs text-rose-400 flex items-center gap-1 mt-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </p>
          )}
        </div>

        {/* Live Mathematical Impact Preview */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Impact On Spendable Balance
          </span>

          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-400">Spendable Cash:</span>
            <span className={projectedSpendable < 0 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
              {formatINR(summary.spendableBalance)} → {formatINR(projectedSpendable)}
            </span>
          </div>

          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-400">Daily Allowance:</span>
            <span className="flex items-center gap-1 text-teal-300 font-bold">
              {formatINR(summary.recommendedDailyAllowance)} → {formatINR(projectedAllowance)}/d
              <span className={`text-[10px] ${deltaAllowance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({deltaAllowance >= 0 ? '+' : ''}{deltaAllowance}/d)
              </span>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Confirm {mode === 'deposit' ? 'Deposit' : 'Withdrawal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
