import React from 'react';

export const LoanSkeleton: React.FC = () => {
  return (
    <div className="w-full rounded-2xl p-5 glass-panel animate-pulse border border-emerald-700/30 mb-6">
      <div className="flex justify-between items-center mb-3">
        <div className="h-4 w-28 bg-emerald-800/60 rounded" />
        <div className="h-4 w-16 bg-amber-500/30 rounded" />
      </div>
      <div className="h-7 w-36 bg-emerald-700/60 rounded mb-3" />
      <div className="w-full h-2 bg-emerald-900/60 rounded-full mb-3 overflow-hidden">
        <div className="h-full w-2/3 bg-emerald-700/50 rounded-full" />
      </div>
      <div className="flex justify-between items-center">
        <div className="h-3 w-24 bg-emerald-800/50 rounded" />
        <div className="h-3 w-20 bg-emerald-800/50 rounded" />
      </div>
    </div>
  );
};
