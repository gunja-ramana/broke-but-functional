import React from 'react';
import { useFinance } from '../../context/useFinance';
import type { ActiveTab } from '../../types/financial';
import {
  LayoutDashboard,
  Sparkles,
  ReceiptText,
  CalendarClock,
  PiggyBank,
  AlertOctagon,
  TrendingUp,
  HeartPulse,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab } = useFinance();

  const items: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'simulator', label: 'What-If?', icon: <Sparkles className="w-5 h-5 text-emerald-400" /> },
    { id: 'transactions', label: 'Ledger', icon: <ReceiptText className="w-5 h-5" /> },
    { id: 'commitments', label: 'Bills', icon: <CalendarClock className="w-5 h-5" /> },
    { id: 'savings', label: 'Vault', icon: <PiggyBank className="w-5 h-5" /> },
    { id: 'unexpected', label: 'Shock', icon: <AlertOctagon className="w-5 h-5" /> },
    { id: 'forecast', label: 'Forecast', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'health', label: 'Health', icon: <HeartPulse className="w-5 h-5" /> },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080d1a]/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around overflow-x-auto no-scrollbar shadow-2xl"
      aria-label="Mobile navigation"
    >
      {items.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-medium transition-colors shrink-0 min-w-[50px] ${
              isActive
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="mb-0.5">{item.icon}</span>
            <span className="truncate max-w-[55px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
