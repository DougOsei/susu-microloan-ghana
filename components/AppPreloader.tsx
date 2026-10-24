'use client';

import React, { useEffect, useState } from 'react';

interface AppPreloaderProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

const STATUS_STEPS = [
  'Initializing QuickSave core...',
  'Securing cryptographic session...',
  'Syncing Mobile Money rails (MTN, Telecel, AT)...',
  'Auditing double-entry ledger in PostgreSQL...',
  'Bank of Ghana Tier-3 Compliance Verified',
  'Ready',
];

export const AppPreloader: React.FC<AppPreloaderProps> = ({
  onComplete,
  minDurationMs = 1800,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(10);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const stepInterval = minDurationMs / STATUS_STEPS.length;
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < STATUS_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
      setProgress((prev) => Math.min(100, prev + 18));
    }, stepInterval);

    const finishTimeout = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 400);
    }, minDurationMs);

    return () => {
      clearInterval(interval);
      clearTimeout(finishTimeout);
    };
  }, [minDurationMs, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#022c22] via-[#043c2f] to-[#011c15] text-white transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Decorative Glow */}
      <div className="absolute w-72 h-72 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />
      <div className="absolute w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

      {/* Brand Insignia & Circular Spinner */}
      <div className="relative mb-8 flex items-center justify-center">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="#064e3b"
            strokeWidth="5"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="url(#goldGradient)"
            strokeWidth="5"
            strokeDasharray={264}
            strokeDashoffset={264 - (264 * progress) / 100}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300 ease-out"
          />
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Crest */}
        <div className="absolute flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#065f46] to-[#022c22] border-2 border-amber-400/40 flex items-center justify-center shadow-lg shadow-black/40">
            <span className="text-2xl font-black text-gold-gradient tracking-tighter">QS</span>
          </div>
        </div>
      </div>

      {/* App Title */}
      <div className="text-center px-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1">
          QuickSave <span className="text-gold-gradient">Ghana</span>
        </h1>
        <p className="text-xs text-emerald-300/80 font-medium tracking-wide uppercase">
          Bank of Ghana Tier-3 Digital Microfinance
        </p>
      </div>

      {/* Progressive Status Message */}
      <div className="mt-8 flex flex-col items-center w-64">
        <div className="w-full bg-[#064e3b]/60 h-1.5 rounded-full overflow-hidden border border-emerald-500/20 mb-3">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-emerald-200/90 font-mono tracking-tight text-center h-5 transition-all">
          {STATUS_STEPS[stepIndex]}
        </p>
      </div>

      {/* Security & Regulatory Footnote */}
      <div className="absolute bottom-6 flex items-center gap-2 text-[11px] text-emerald-400/60 font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>256-bit TLS • BoG Act 1052 • NIA Certified</span>
      </div>
    </div>
  );
};
