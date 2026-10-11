import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/useFinance';
import type { Transaction, ExpenseCategory } from '../../types/financial';
import { formatINR } from '../../utils/currency';
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Edit2,
  Receipt,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import type { BadgeVariant } from '../common/Badge';
import { Button } from '../common/Button';
import { ConfirmModal } from '../common/ConfirmModal';

interface TransactionListProps {
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

const CATEGORIES: ('All' | ExpenseCategory)[] = [
  'All',
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Education',
  'Entertainment',
  'Health',
  'Other',
];

export const TransactionList: React.FC<TransactionListProps> = ({
  onOpenAddModal,
  onEditTransaction,
}) => {
  const { transactions, deleteTransaction, summary } = useFinance();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ExpenseCategory>('All');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Filter & Sort
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        const matchesSearch =
          tx.description.toLowerCase().includes(search.toLowerCase()) ||
          (tx.note && tx.note.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory =
          selectedCategory === 'All' || tx.category === selectedCategory;
        const matchesType =
          selectedType === 'all' || tx.type === selectedType;

        return matchesSearch && matchesCategory && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
        if (sortBy === 'date-asc') return a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, search, selectedCategory, selectedType, sortBy]);

  const categoryColorMap: Record<ExpenseCategory, BadgeVariant> = {
    Food: 'amber',
    Transport: 'sky',
    Shopping: 'purple',
    Bills: 'rose',
    Education: 'emerald',
    Entertainment: 'purple',
    Health: 'rose',
    Other: 'slate',
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteTransaction(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Ledger Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Outflow</span>
          <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
            -{formatINR(summary.totalExpenses)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Total recorded purchases</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Inflow</span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            +{formatINR(summary.totalIncome)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Additional income outside budget</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Ledger Entries</span>
          <p className="text-2xl font-bold font-mono text-slate-200 mt-1">
            {transactions.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Showing {filteredTransactions.length} filtered
          </p>
        </div>
      </div>

      {/* Control Bar: Search, Category pills, and Actions */}
      <div className="p-4 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by description or note..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Type Filter & Sort */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'all' | 'expense' | 'income')}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>

            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={onOpenAddModal}
            >
              Add Record
            </Button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="rounded-2xl bg-[#0f172a]/90 border border-slate-800 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No transactions found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No transactions match your current search and filter criteria. Try clearing filters or record a new transaction.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setSelectedType('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">Transaction</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Description & Note */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isIncome ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              <span>{tx.description}</span>
                              {tx.linkedCommitmentId && (
                                <span className="text-[10px] text-teal-300 font-mono bg-teal-950 px-1.5 py-0.5 rounded border border-teal-800/40">
                                  Scheduled Bill
                                </span>
                              )}
                            </div>
                            {tx.note && (
                              <p className="text-xs text-slate-400 mt-0.5 max-w-md">
                                {tx.note}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <Badge size="sm" variant={categoryColorMap[tx.category] || 'slate'}>
                          {tx.category}
                        </Badge>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                        {tx.date}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-mono font-bold ${
                            isIncome ? 'text-emerald-400' : 'text-slate-100'
                          }`}
                        >
                          {isIncome ? `+${formatINR(tx.amount)}` : `-${formatINR(tx.amount)}`}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Edit transaction"
                            aria-label={`Edit ${tx.description}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Delete transaction"
                            aria-label={`Delete ${tx.description}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteTargetId !== null}
        title="Delete Transaction?"
        message="This will permanently delete this transaction and recalculate all spendable balances, daily allowances, forecasts, and health scores."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
