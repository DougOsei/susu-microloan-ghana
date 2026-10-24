import React from 'react';

export const WalletSkeleton: React.FC = () => {
  return (
    <div className="w-full rounded-2xl p-6 glass-card-gold animate-pulse border border-amber-500/20 shadow-xl mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="h-4 w-32 bg-emerald-800/60 rounded" />
        <div className="h-6 w-20 bg-emerald-800/80 rounded-full" />
      </div>

      <div className="h-10 w-48 bg-emerald-700/60 rounded mb-2" />
      <div className="h-3 w-40 bg-emerald-800/50 rounded mb-6" />

      {/* Action Buttons Skeleton */}
      <div className="grid grid-cols-4 gap-3 pt-4 border-t border-emerald-700/30">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-800/60" />
            <div className="h-3 w-12 bg-emerald-800/50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};
