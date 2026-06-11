"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";

interface NoticeStripProps {
  userName: string;
  message?: string;
}

export function NoticeStrip({ userName, message }: NoticeStripProps) {
  const [read, setRead] = useState(false);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  const text = message || `${greeting}, ${userName} — all systems are operating within their ideal range.`;

  return (
    <AnimatePresence mode="wait">
      {!read ? (
        <motion.div
          key="strip"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3 }}
          className="relative bg-surface border border-border rounded-2xl px-5 py-4 overflow-hidden"
        >
          {/* Gold left accent */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-gold to-gold/40" />

          <div className="flex items-start gap-3 pl-2">
            <div className="w-8 h-8 rounded-lg bg-gold/[0.08] flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles size={15} className="text-gold" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text font-body leading-relaxed">{text}</p>
            </div>
            <button
              onClick={() => setRead(true)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-gold hover:bg-gold/[0.06] border border-gold/20 hover:border-gold/30 transition-all duration-200 cursor-pointer font-ui"
            >
              <CheckCircle2 size={12} aria-hidden="true" />
              Mark as read
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
