'use client';

import React from 'react';
import { ShieldCheck, ShieldAlert, LogOut, Bell, User } from 'lucide-react';
import { UserProfile } from '@/lib/types';

interface HeaderProps {
  user?: UserProfile | null;
  onOpenKyc: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onOpenKyc, onLogout }) => {
  return (
    <header className="px-5 pt-6 pb-4 flex items-center justify-between border-b border-emerald-800/20 bg-[#022c22]/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md shadow-black/30 border border-amber-300/30">
          <span className="font-extrabold text-stone-950 text-base tracking-tighter">QS</span>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-bold text-white tracking-tight">
              {user?.fullName || 'QuickSave Customer'}
            </h1>
            {user?.ghanaCardVerified ? (
              <span
                onClick={onOpenKyc}
                title="Ghana Card Verified (Tier 2)"
                className="cursor-pointer inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded-full border border-emerald-500/30"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Tier 2</span>
              </span>
            ) : (
              <span
                onClick={onOpenKyc}
                title="Click to Verify Ghana Card"
                className="cursor-pointer inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded-full border border-amber-500/30 animate-pulse"
              >
                <ShieldAlert className="w-3 h-3 text-amber-400" />
                <span>Verify KYC</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-emerald-400/80 font-mono">
            {user?.phone || '+233 24 412 3456'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onLogout}
          title="Switch Account / Log Out"
          className="w-9 h-9 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/50 border border-emerald-700/40 flex items-center justify-center text-emerald-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
