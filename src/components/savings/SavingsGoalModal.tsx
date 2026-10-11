import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { SavingsGoal } from '../../types/financial';
import { AlertCircle } from 'lucide-react';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate?: string;
    notes?: string;
  }) => void;
  initialData?: SavingsGoal | null;
}

interface FormProps {
  initialData?: SavingsGoal | null;
  onSave: SavingsGoalModalProps['onSave'];
  onClose: () => void;
}

const SavingsGoalForm: React.FC<FormProps> = ({ initialData, onSave, onClose }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [targetAmount, setTargetAmount] = useState(initialData?.targetAmount ? initialData.targetAmount.toString() : '');
  const [currentAmount, setCurrentAmount] = useState(initialData?.currentAmount ? initialData.currentAmount.toString() : '0');
  const [targetDate, setTargetDate] = useState(initialData?.targetDate || '2026-12-31');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Goal title is required';
    const targetNum = parseFloat(targetAmount);
    if (isNaN(targetNum) || targetNum <= 0) newErrors.targetAmount = 'Target amount must be greater than 0';
    const currentNum = parseFloat(currentAmount);
    if (isNaN(currentNum) || currentNum < 0) newErrors.currentAmount = 'Starting amount must be 0 or positive';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      name: name.trim(),
      targetAmount: Math.round(parseFloat(targetAmount)),
      currentAmount: Math.round(parseFloat(currentAmount || '0')),
      targetDate: targetDate || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="goal-name">
          Goal Name *
        </label>
        <input
          id="goal-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Emergency Fund, New Smartphone, Exam Fees"
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        {errors.name && (
          <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
          </p>
        )}
      </div>

      {/* Target & Current Amount */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="goal-target">
            Target Amount (₹) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold font-mono">₹</span>
            <input
              id="goal-target"
              type="number"
              min="1"
              step="1"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="2000"
              className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          {errors.targetAmount && (
            <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.targetAmount}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="goal-current">
            Initial Protected Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold font-mono">₹</span>
            <input
              id="goal-current"
              type="number"
              min="0"
              step="1"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0"
              className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          {errors.currentAmount && (
            <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.currentAmount}
            </p>
          )}
        </div>
      </div>

      {/* Target Date */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="goal-date">
          Target Date (Optional)
        </label>
        <input
          id="goal-date"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="goal-notes">
          Purpose & Rules (Optional)
        </label>
        <input
          id="goal-notes"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Only withdraw in medical emergencies"
          className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
        <Button variant="ghost" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          {initialData ? 'Update Goal' : 'Create Goal'}
        </Button>
      </div>
    </form>
  );
};

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Savings Goal' : 'Create Protected Savings Goal'}
      subtitle="Ring-fenced funds are protected from daily discretionary spending"
      maxWidth="md"
    >
      <SavingsGoalForm
        key={initialData?.id || (isOpen ? 'goal-open' : 'goal-closed')}
        initialData={initialData}
        onSave={onSave}
        onClose={onClose}
      />
    </Modal>
  );
};
