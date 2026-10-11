import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/useFinance';
import type { Commitment } from '../../types/financial';
import { formatINR } from '../../utils/currency';
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Repeat,
  Trash2,
  Edit2,
  Check,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { CommitmentModal } from './CommitmentModal';
import { ConfirmModal } from '../common/ConfirmModal';

export const CommitmentsManager: React.FC = () => {
  const {
    commitments,
    summary,
    currentDay,
    addCommitment,
    editCommitment,
    deleteCommitment,
    payCommitment,
  } = useFinance();

  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid' | 'subscriptions'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommitment, setEditingCommitment] = useState<Commitment | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [payTargetCommitment, setPayTargetCommitment] = useState<Commitment | null>(null);

  const filteredCommitments = useMemo(() => {
    return commitments.filter((c) => {
      if (filter === 'unpaid') return !c.isPaid;
      if (filter === 'paid') return c.isPaid;
      if (filter === 'subscriptions') return c.type === 'subscription';
      return true;
    });
  }, [commitments, filter]);

  const handleOpenAdd = () => {
    setEditingCommitment(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Commitment) => {
    setEditingCommitment(c);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: any) => {
    if (editingCommitment) {
      editCommitment(editingCommitment.id, data);
    } else {
      addCommitment(data);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteCommitment(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const handlePayConfirm = () => {
    if (payTargetCommitment) {
      payCommitment(payTargetCommitment.id);
      setPayTargetCommitment(null);
    }
  };

  const getDueStatus = (dueDate: string, isPaid: boolean) => {
    if (isPaid) return { text: 'Paid & Settled', variant: 'emerald' as const };
    const dueDay = parseInt(dueDate.split('-')[2], 10);
    const diff = dueDay - currentDay;

    if (diff < 0) return { text: `Overdue by ${Math.abs(diff)}d`, variant: 'rose' as const };
    if (diff === 0) return { text: 'Due Today!', variant: 'rose' as const };
    if (diff <= 3) return { text: `Due in ${diff} days`, variant: 'amber' as const };
    return { text: `Due in ${diff} days`, variant: 'slate' as const };
  };

  const cashCoveragePercent =
    summary.outstandingCommitments > 0
      ? Math.round((summary.currentCashBalance / summary.outstandingCommitments) * 100)
      : 100;

  return (
    <div className="space-y-6">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase mb-1">
            <span>Outstanding Bills</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-sky-300">
            {formatINR(summary.outstandingCommitments)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Earmarked and protected</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase mb-1">
            <span>Upcoming Subscriptions</span>
            <Repeat className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-purple-300">
            {formatINR(summary.upcomingSubscriptions)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Recurring streaming/services</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase mb-1">
            <span>Settled Payments</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">
            {formatINR(summary.paidCommitments)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Paid this month</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase mb-1">
            <span>Cash Coverage Ratio</span>
            <AlertTriangle className={`w-4 h-4 ${cashCoveragePercent >= 100 ? 'text-emerald-400' : 'text-rose-400'}`} />
          </div>
          <p className={`text-2xl font-bold font-mono ${cashCoveragePercent >= 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {cashCoveragePercent}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {cashCoveragePercent >= 100 ? 'Bills fully backed by cash' : 'Cash shortfall for bills!'}
          </p>
        </div>
      </div>

      {/* Control Header */}
      <div className="p-4 rounded-2xl bg-[#0f172a]/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'unpaid', 'paid', 'subscriptions'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer ${
                filter === mode
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          Add Commitment / Sub
        </Button>
      </div>

      {/* Commitments Cards / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCommitments.map((comm) => {
          const status = getDueStatus(comm.dueDate, comm.isPaid);
          const isOverdue = !comm.isPaid && parseInt(comm.dueDate.split('-')[2], 10) < currentDay;

          return (
            <div
              key={comm.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                comm.isPaid
                  ? 'bg-slate-900/60 border-slate-800/80 opacity-80'
                  : isOverdue
                  ? 'bg-rose-950/20 border-rose-500/40 shadow-glow-danger'
                  : 'bg-[#0f172a]/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        comm.isPaid
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : comm.type === 'subscription'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-sky-500/20 text-sky-400'
                      }`}
                    >
                      {comm.type === 'subscription' ? <Repeat className="w-4 h-4" /> : <CalendarClock className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        {comm.category} • {comm.type === 'subscription' ? 'Subscription' : 'Bill'}
                      </span>
                      <h3 className="text-base font-bold text-white">{comm.name}</h3>
                    </div>
                  </div>

                  <Badge size="sm" variant={status.variant}>
                    {status.text}
                  </Badge>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold font-mono text-white">
                    {formatINR(comm.amount)}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Due: {comm.dueDate}
                  </span>
                </div>

                {comm.note && (
                  <p className="text-xs text-slate-400 mt-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                    {comm.note}
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                {!comm.isPaid ? (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Check className="w-3.5 h-3.5" />}
                    onClick={() => setPayTargetCommitment(comm)}
                    className="w-full"
                  >
                    Mark as Paid
                  </Button>
                ) : (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Logged & Settled
                  </span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(comm)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Edit commitment"
                    aria-label={`Edit ${comm.name}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(comm.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete commitment"
                    aria-label={`Delete ${comm.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <CommitmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingCommitment}
      />

      <ConfirmModal
        isOpen={payTargetCommitment !== null}
        title="Mark Commitment as Paid?"
        message={`This will record an expense transaction of ${formatINR(payTargetCommitment?.amount || 0)} for "${payTargetCommitment?.name}". Your spendable balance will remain mathematically identical because this amount was already reserved in advance.`}
        confirmLabel="Confirm & Pay"
        isDestructive={false}
        onConfirm={handlePayConfirm}
        onCancel={() => setPayTargetCommitment(null)}
      />

      <ConfirmModal
        isOpen={deleteTargetId !== null}
        title="Delete Commitment?"
        message="This will delete this upcoming commitment and release the earmarked funds back into your spendable allowance."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
