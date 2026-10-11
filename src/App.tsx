import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { useFinance } from './context/useFinance';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { DecisionSimulator } from './components/simulator/DecisionSimulator';
import { TransactionList } from './components/transactions/TransactionList';
import { CommitmentsManager } from './components/commitments/CommitmentsManager';
import { SavingsGoalsManager } from './components/savings/SavingsGoalsManager';
import { UnexpectedExpenseFlow } from './components/unexpected/UnexpectedExpenseFlow';
import { ThirtyDayForecast } from './components/forecast/ThirtyDayForecast';
import { FinancialHealthView } from './components/health/FinancialHealthView';
import { TransactionModal } from './components/transactions/TransactionModal';
import type { Transaction } from './types/financial';

const MainContent: React.FC = () => {
  const { activeTab, addTransaction, editTransaction } = useFinance();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const handleOpenAdd = () => {
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  const handleSaveTx = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTx) {
      editTransaction(editingTx.id, data);
    } else {
      addTransaction(data);
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onOpenAddModal={handleOpenAdd} />;
      case 'simulator':
        return <DecisionSimulator />;
      case 'transactions':
        return (
          <TransactionList
            onOpenAddModal={handleOpenAdd}
            onEditTransaction={handleEditTx}
          />
        );
      case 'commitments':
        return <CommitmentsManager />;
      case 'savings':
        return <SavingsGoalsManager />;
      case 'unexpected':
        return <UnexpectedExpenseFlow />;
      case 'forecast':
        return <ThirtyDayForecast />;
      case 'health':
        return <FinancialHealthView />;
      default:
        return <DashboardView onOpenAddModal={handleOpenAdd} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col antialiased">
      {/* Skip to Main Content Link for Keyboard Accessibility (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-slate-950 focus:font-bold focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* Sidebar for Desktop & Mobile Drawer */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Header
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenAddTransaction={handleOpenAdd}
        />

        <main id="main-content" tabIndex={-1} className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full outline-none">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Reusable Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTx}
        initialData={editingTx}
      />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainContent />
    </FinanceProvider>
  );
}
