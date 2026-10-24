import React from 'react';

export const SusuSkeleton: React.FC = () => {
  return (
    <div className="w-full rounded-2xl p-5 glass-panel animate-pulse border border-emerald-700/30 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-800/70" />
          <div className="h-4 w-32 bg-emerald-800/60 rounded" />
        </div>
        <div className="h-6 w-24 bg-amber-500/20 rounded-full" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded-xl bg-emerald-950/40">
          <div className="h-3 w-16 bg-emerald-800/50 rounded mb-2" />
          <div className="h-6 w-24 bg-emerald-700/60 rounded" />
        </div>
        <div className="p-3 rounded-xl bg-emerald-950/40">
          <div className="h-3 w-20 bg-emerald-800/50 rounded mb-2" />
          <div className="h-6 w-20 bg-amber-500/40 rounded" />
        </div>
      </div>

      <div className="h-10 w-full bg-emerald-800/50 rounded-xl" />
    </div>
  );
};
