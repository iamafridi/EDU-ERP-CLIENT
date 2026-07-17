"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard } from "lucide-react";

interface ShortcutGroup {
  group: string;
  shortcuts: { keys: string; label: string }[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    group: "Navigation",
    shortcuts: [
      { keys: "G then S", label: "Go to Students" },
      { keys: "G then F", label: "Go to Faculty" },
      { keys: "G then C", label: "Go to Courses" },
      { keys: "G then H", label: "Go to Hostel" },
      { keys: "G then L", label: "Go to Library" },
      { keys: "G then D", label: "Go to Dashboard" },
    ],
  },
  {
    group: "Actions",
    shortcuts: [
      { keys: "A", label: "Mark Attendance" },
      { keys: "L", label: "Leave Management" },
      { keys: "N", label: "New Notice" },
      { keys: "F", label: "Fees & Ledger" },
    ],
  },
  {
    group: "Global",
    shortcuts: [
      { keys: "Cmd + K", label: "Command Palette / Search" },
      { keys: "?", label: "Toggle this help" },
      { keys: "Esc", label: "Close modal / panel" },
    ],
  },
];

interface ShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
}

export default function ShortcutsHelp({ open, onClose }: ShortcutsHelpProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg bg-white border border-[#e1e2ed] rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 h-14 border-b border-[#e1e2ed]">
              <div className="flex items-center gap-2">
                <Keyboard size={18} className="text-[#2563EB]" />
                <span className="text-sm font-bold text-slate-800">Keyboard Shortcuts</span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {shortcutGroups.map((group) => (
                <div key={group.group}>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {group.group}
                  </h4>
                  <div className="space-y-2">
                    {group.shortcuts.map((sc) => (
                      <div key={sc.keys} className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">{sc.label}</span>
                        <kbd className="px-2 py-1 bg-slate-100 border border-[#e1e2ed] rounded text-[10px] font-mono text-slate-500">
                          {sc.keys}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
