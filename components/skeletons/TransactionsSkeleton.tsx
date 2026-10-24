import React from 'react';

export const TransactionsSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-3 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3.5 rounded-xl glass-panel border border-emerald-800/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-800/60" />
            <div>
              <div className="h-4 w-28 bg-emerald-700/60 rounded mb-1.5" />
              <div className="h-3 w-20 bg-emerald-800/50 rounded" />
            </div>
          </div>
          <div className="text-right">
            <div className="h-4 w-16 bg-emerald-700/60 rounded mb-1.5 ml-auto" />
            <div className="h-3 w-12 bg-emerald-800/50 rounded ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
};
