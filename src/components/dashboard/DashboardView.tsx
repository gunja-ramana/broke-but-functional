import React from 'react';
import { OverviewCards } from './OverviewCards';
import { BudgetProgressBar } from './BudgetProgressBar';
import { DailyAllowanceCard } from './DailyAllowanceCard';
import { FinancialInsightCard } from './FinancialInsightCard';
import { ActionPlanSection } from './ActionPlanSection';
import { RecentActivityWidget } from './RecentActivityWidget';

interface DashboardViewProps {
  onOpenAddModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenAddModal }) => {
  return (
    <div className="space-y-6">
      {/* 1. Top KPI Summary Cards */}
      <OverviewCards />

      {/* 2. Budget Allocation Multi-Segment Progress Bar */}
      <BudgetProgressBar />

      {/* 3. Daily Allowance Engine & Data-Derived Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyAllowanceCard />
        <FinancialInsightCard />
      </div>

      {/* 4. Action Plan: Next Best Moves */}
      <ActionPlanSection />

      {/* 5. Recent Activity Ledger Preview */}
      <RecentActivityWidget onOpenAddModal={onOpenAddModal} />
    </div>
  );
};
