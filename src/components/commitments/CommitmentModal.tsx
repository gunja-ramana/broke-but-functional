import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { Commitment, CommitmentType, RecurrenceInterval, ExpenseCategory } from '../../types/financial';
import { AlertCircle } from 'lucide-react';

interface CommitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (comm: {
    name: string;
    amount: number;
    dueDate: string;
    category: ExpenseCategory;
    isPaid: boolean;
    type: CommitmentType;
    recurrence?: RecurrenceInterval;
    note?: string;
  }) => void;
  initialData?: Commitment | null;
}

const CATEGORIES: ExpenseCategory[] = [
  'Bills',
  'Food',
  'Transport',
  'Shopping',
  'Education',
  'Entertainment',
  'Health',
  'Other',
];

interface FormProps {
  initialData?: Commitment | null;
  onSave: CommitmentModalProps['onSave'];
  onClose: () => void;
}

const CommitmentForm: React.FC<FormProps> = ({ initialData, onSave, onClose }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [amount, setAmount] = useState(initialData?.amount ? initialData.amount.toString() : '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '2026-10-18');
  const [category, setCategory] = useState<ExpenseCategory>(initialData?.category || 'Bills');
  const [type, setType] = useState<CommitmentType>(initialData?.type || 'one-time');
  const [recurrence, setRecurrence] = useState<RecurrenceInterval>(initialData?.recurrence || 'monthly');
  const [isPaid, setIsPaid] = useState(initialData?.isPaid || false);
  const [note, setNote] = useState(initialData?.note || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Commitment name is required';
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!dueDate) newErrors.dueDate = 'Due date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      name: name.trim(),
      amount: Math.round(parseFloat(amount)),
      dueDate,
      category,
      isPaid,
      type,
      recurrence: type === 'subscription' ? recurrence : undefined,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Commitment Type Toggle */}
      <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => setType('one-time')}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            type === 'one-time'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          One-Time Bill
        </button>
        <button
          type="button"
          onClick={() => setType('subscription')}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${
            type === 'subscription'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Recurring Subscription
        </button>
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="comm-name">
          Commitment / Service Name *
        </label>
        <input
          id="comm-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. WiFi Bill, Spotify, Mess Fees, Hostel Rent"
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        {errors.name && (
          <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
          </p>
        )}
      </div>

      {/* Amount & Due Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="comm-amt">
            Amount (₹) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold font-mono">₹</span>
            <input
              id="comm-amt"
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="499"
              className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          {errors.amount && (
            <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.amount}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="comm-due">
            Due Date *
          </label>
          <input
            id="comm-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          {errors.dueDate && (
            <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.dueDate}
            </p>
          )}
        </div>
      </div>

      {/* Category & Recurrence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="comm-category">Category</label>
          <select
            id="comm-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {type === 'subscription' ? (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="comm-recurrence">Recurrence</label>
            <select
              id="comm-recurrence"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as RecurrenceInterval)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none cursor-pointer"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Status</label>
            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-400"
                />
                <span>Mark as already paid</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="comm-note">
          Note (Optional)
        </label>
        <input
          id="comm-note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Account number, shared with 3 roommates"
          className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none"
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
        <Button variant="ghost" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          {initialData ? 'Update Commitment' : 'Add Commitment'}
        </Button>
      </div>
    </form>
  );
};

export const CommitmentModal: React.FC<CommitmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Commitment' : 'Add Financial Commitment or Subscription'}
      subtitle="Ring-fence funds for upcoming bills and services"
      maxWidth="md"
    >
      <CommitmentForm
        key={initialData?.id || (isOpen ? 'comm-open' : 'comm-closed')}
        initialData={initialData}
        onSave={onSave}
        onClose={onClose}
      />
    </Modal>
  );
};
