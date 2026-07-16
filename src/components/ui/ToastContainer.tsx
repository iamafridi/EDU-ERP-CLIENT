"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";
import { CheckCircle2, XCircle, Info, AlertTriangle, X, RotateCcw } from "lucide-react";

const typeStyles: Record<string, { bg: string; border: string; icon: React.ElementType; iconColor: string }> = {
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: XCircle,
    iconColor: "text-red-600",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Info,
    iconColor: "text-blue-600",
  },
  undo: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
  },
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useToastStore();

  return (
    <div className="fixed bottom-20 right-6 z-[60] flex flex-col-reverse gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const style = typeStyles[toast.type] || typeStyles.info;
          const Icon = style.icon;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${style.bg} ${style.border} min-w-[300px] max-w-[420px]`}
            >
              <Icon size={18} className={`shrink-0 ${style.iconColor}`} />
              <span className="flex-1 text-xs font-semibold text-slate-700">
                {toast.message}
              </span>
              {toast.type === "undo" && toast.undoAction && (
                <button
                  onClick={() => {
                    toast.undoAction?.();
                    dismissToast(toast.id);
                  }}
                  className="flex items-center gap-1 h-7 px-2.5 bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                >
                  <RotateCcw size={12} />
                  Undo
                </button>
              )}
              <button
                onClick={() => dismissToast(toast.id)}
                className="p-1 rounded-full hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
