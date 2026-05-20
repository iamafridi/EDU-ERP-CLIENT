"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, Sparkles, Building2, RefreshCw } from "lucide-react";

const LOADING_STATUSES = [
  "Synchronizing institutional ledger & telemetry...",
  "Loading active campus rosters & departments...",
  "Verifying GAAP double-entry ledger integrity...",
  "Decrypting student digital records & attendance...",
  "Authenticating access clearance...",
];

export default function DashboardLoading() {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % LOADING_STATUSES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in duration-300">
      {/* Brand Spinner Orb */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing Gold Halo */}
        <div className="absolute w-24 h-24 rounded-full bg-gold/15 blur-xl animate-pulse" />
        
        {/* Outer Orbit Ring */}
        <div className="w-20 h-20 rounded-full border-2 border-gold/20 border-t-gold animate-spin" />
        
        {/* Inner Counter-spinning Ring */}
        <div className="absolute w-14 h-14 rounded-full border-2 border-border border-b-gold/80 animate-[spin_1.5s_linear_infinite_reverse]" />
        
        {/* Center Institutional Emblem */}
        <div className="absolute w-10 h-10 rounded-xl bg-surface-navy border border-gold/40 flex items-center justify-center shadow-lg shadow-black/20">
          <Building2 size={18} className="text-gold animate-pulse" />
        </div>
      </div>

      {/* Dynamic Status Text */}
      <div className="text-center space-y-2 max-w-md">
        <div className="flex items-center justify-center gap-2 text-xs font-mono tracking-wider uppercase text-gold">
          <Sparkles size={13} className="animate-spin text-gold" />
          <span>HOSTEL PRO-ERP ENGINE</span>
        </div>
        <p className="text-sm font-ui font-medium text-text min-h-[1.5rem] transition-all duration-300">
          {LOADING_STATUSES[statusIndex]}
        </p>
        <p className="text-xs text-text-subtle font-ui">
          Please wait while operational data streams into your workspace
        </p>
      </div>

      {/* Sophisticated Theme-Aligned Skeleton Preview */}
      <div className="w-full max-w-4xl space-y-5 pt-4 opacity-40">
        <div className="flex items-center justify-between">
          <div className="h-5 w-44 bg-surface-muted rounded-lg animate-pulse" />
          <div className="h-8 w-28 bg-surface-muted rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 bg-surface rounded-2xl border border-border p-4 space-y-3 shadow-xs animate-pulse"
            >
              <div className="h-3 w-20 bg-surface-muted rounded" />
              <div className="h-6 w-28 bg-surface-muted rounded-md" />
            </div>
          ))}
        </div>
        <div className="h-44 bg-surface rounded-2xl border border-border p-6 shadow-xs animate-pulse" />
      </div>
    </div>
  );
}
