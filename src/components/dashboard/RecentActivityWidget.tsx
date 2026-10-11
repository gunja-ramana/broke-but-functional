import React from 'react';
import { useFinance } from '../../context/useFinance';
import { formatINR } from '../../utils/currency';
import { ArrowUpRight, ArrowDownLeft, ChevronRight, Plus, Receipt } from 'lucide-react';
import { Badge } from '../common/Badge';

interface RecentActivityWidgetProps {
  onOpenAddModal: () => void;
}

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({
  onOpenAddModal,
}) => {
  const { transactions, setActiveTab } = useFinance();

  const recentTransactions = transactions.slice(0, 5);

  const categoryColorMap: Record<string, 'emerald' | 'amber' | 'rose' | 'sky' | 'purple' | 'slate'> = {
    Food: 'amber',
    Transport: 'sky',
    Shopping: 'purple',
    Bills: 'rose',
    Education: 'emerald',
    Entertainment: 'purple',
    Health: 'rose',
    Other: 'slate',
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Recent Activity</h2>
            <p className="text-xs text-slate-400">Latest synchronized ledger entries</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors border border-emerald-500/30 cursor-pointer"
            title="Add transaction"
            aria-label="Add transaction"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-0.5 hover:underline"
          >
            View All ({transactions.length})
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {recentTransactions.length === 0 ? (
        <div className="p-6 text-center text-slate-400 text-xs rounded-xl bg-slate-900/60 border border-slate-800/80">
          No transactions recorded yet. Add your first spending or income entry!
        </div>
      ) : (
        <div className="divide-y divide-slate-800/80">
          {recentTransactions.map((tx) => {
            const isIncome = tx.type === 'income';
            return (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-400 font-mono">{tx.date}</span>
                      <Badge size="sm" variant={categoryColorMap[tx.category] || 'slate'}>
                        {tx.category}
                      </Badge>
                      {tx.linkedCommitmentId && (
                        <span className="text-[10px] text-teal-400 font-mono bg-teal-950 px-1.5 py-0.2 rounded border border-teal-800/50">
                          Bill
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-mono font-bold text-sm ${
                      isIncome ? 'text-emerald-400' : 'text-slate-200'
                    }`}
                  >
                    {isIncome ? `+${formatINR(tx.amount)}` : `-${formatINR(tx.amount)}`}
                  </span>
                  {tx.note && (
                    <p className="text-[10px] text-slate-400 truncate max-w-[120px] sm:max-w-[160px] text-right">
                      {tx.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
