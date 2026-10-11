import React, { useState } from 'react';
import { useFinance } from '../../context/useFinance';
import { formatINR } from '../../utils/currency';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Badge } from '../common/Badge';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-bold text-white border-b border-slate-800 pb-1">
          Day {data.dayNumber} {data.isToday ? '(Today)' : data.isFuture ? '(Projected)' : '(Recorded)'}
        </p>
        <p className="text-emerald-400 font-mono">
          Cash Balance: {formatINR(data.cashBalance)}
        </p>
        <p className="text-teal-300 font-mono">
          Spendable Runway: {formatINR(data.spendableBalance)}
        </p>
        <p className="text-amber-400 font-mono">
          Spend: {formatINR(data.dailySpend)}
        </p>
        {data.commitmentsDue > 0 && (
          <p className="text-sky-300 font-mono font-semibold">
            Bill Due: {formatINR(data.commitmentsDue)}
          </p>
        )}
        {data.eventNote && (
          <p className="text-slate-400 text-[11px] pt-1">
            Note: {data.eventNote}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const ThirtyDayForecast: React.FC = () => {
  const { forecastDays, summary, currentDay } = useFinance();
  const [viewMode, setViewMode] = useState<'balance' | 'daily'>('balance');

  // Chart data
  const chartData = forecastDays.map((d) => ({
    day: `D${d.dayNumber}`,
    dayNumber: d.dayNumber,
    isPast: d.isPast,
    isToday: d.isToday,
    isFuture: d.isFuture,
    cashBalance: d.cashBalance,
    spendableBalance: d.spendableBalance,
    dailySpend: d.isFuture ? d.projectedDailySpend : d.actualDailySpend,
    commitmentsDue: d.commitmentsDue,
    eventNote: d.eventNote,
  }));

  const isFinalPositive = (forecastDays[29]?.cashBalance ?? 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-6 rounded-2xl bg-[#0f172a]/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white">30-Day Financial Trajectory</h2>
          </div>
          <p className="text-xs text-slate-400">
            Deterministic baseline combining actual ledger history with upcoming bill deadlines and daily allowance pace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('balance')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'balance'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Balance Path
          </button>
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'daily'
                ? 'bg-teal-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Daily Spend Pace
          </button>
        </div>
      </div>

      {/* Trajectory Milestone Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Starting Point (Day 1)</span>
          <p className="text-2xl font-bold font-mono text-white mt-1">
            {formatINR(summary.startingBudget)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Starting monthly baseline</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Current State (Day {currentDay})</span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {formatINR(summary.currentCashBalance)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Spendable: {formatINR(summary.spendableBalance)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Projected Day 30 Finish</span>
          <p className={`text-2xl font-bold font-mono mt-1 ${isFinalPositive ? 'text-teal-300' : 'text-rose-400'}`}>
            {formatINR(forecastDays[29]?.cashBalance ?? 0)}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-xs">
            {isFinalPositive ? (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" /> Month Survived!
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" /> Deficit Alert
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive Recharts Area */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">
            {viewMode === 'balance' ? 'Running Cash Balance & Spendable Buffer' : 'Daily Outflow & Bill Spikes'}
          </h3>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Cash Balance
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
              Spendable
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              Bill Day
            </span>
          </div>
        </div>

        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="spendableGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickFormatter={(val) => `₹${val}`}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                x={`D${currentDay}`}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: 'Today', fill: '#f59e0b', fontSize: 11, position: 'top' }}
              />
              <ReferenceLine y={0} stroke="#f43f5e" strokeWidth={1.5} />

              {viewMode === 'balance' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="cashBalance"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#cashGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="spendableBalance"
                    stroke="#2dd4bf"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#spendableGradient)"
                  />
                </>
              ) : (
                <Area
                  type="monotone"
                  dataKey="dailySpend"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="#f59e0b"
                  fillOpacity={0.2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
          <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span>
            Days 1–{currentDay} are factual recorded transactions. Days {currentDay + 1}–30 project your daily allowance + scheduled commitments on exact due dates.
          </span>
        </div>
      </div>

      {/* Key Survival Milestones Timeline Table */}
      <div className="rounded-2xl bg-[#0f172a]/90 border border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Critical Scheduled Bill Dates</h3>
        </div>

        <div className="divide-y divide-slate-800/60">
          {forecastDays
            .filter((d) => d.commitmentsDue > 0)
            .map((d) => (
              <div
                key={d.dayNumber}
                className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-slate-800 text-sky-300">
                    Day {d.dayNumber}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {d.commitmentsList.join(', ')}
                    </p>
                    <span className="text-xs text-slate-400">{d.dateStr}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-rose-400 block">
                    {formatINR(d.commitmentsDue)}
                  </span>
                  <Badge size="sm" variant={d.dayNumber < currentDay ? 'emerald' : 'amber'}>
                    {d.dayNumber < currentDay ? 'Completed' : 'Upcoming Due Date'}
                  </Badge>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
