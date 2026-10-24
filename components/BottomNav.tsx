'use client';

import React from 'react';
import { Home, PiggyBank, HandCoins, ArrowLeftRight, UserCheck } from 'lucide-react';

export type NavTab = 'home' | 'susu' | 'loans' | 'transfers' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onChangeTab }) => {
  const tabs = [
    { id: 'home', label: 'Wallet', icon: Home },
    { id: 'susu', label: 'Susu Vault', icon: PiggyBank },
    { id: 'loans', label: 'Micro-Loan', icon: HandCoins },
    { id: 'transfers', label: 'MoMo & Bank', icon: ArrowLeftRight },
    { id: 'profile', label: 'KYC & PIN', icon: UserCheck },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#022c22]/95 backdrop-blur-xl border-t border-emerald-800/30 px-3 py-2 z-30 flex justify-between items-center">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id as NavTab)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-amber-400 font-semibold'
                : 'text-emerald-300/60 hover:text-emerald-200 font-medium'
            }`}
          >
            <div
              className={`p-1 rounded-lg transition-transform ${
                isActive ? 'scale-110 bg-amber-500/15' : ''
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-emerald-400/70'}`} />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
