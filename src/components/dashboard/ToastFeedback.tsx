"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  title?: string;
  description?: string;
  message?: string;
  variant?: ToastType;
  type?: ToastType;
}

interface Toast {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
}

let toastIdCounter = 0;
const listeners: Array<(toasts: Toast[]) => void> = [];
let toastsState: Toast[] = [];

function notifyListeners() {
  listeners.forEach((listener) => listener([...toastsState]));
}

export function showToast(
  messageOrOptions: string | ToastOptions,
  type: ToastType = "success"
) {
  const id = `toast-${++toastIdCounter}`;
  let message = "";
  let title: string | undefined = undefined;
  let resolvedType = type;

  if (typeof messageOrOptions === "string") {
    message = messageOrOptions;
  } else {
    title = messageOrOptions.title;
    message = messageOrOptions.description || messageOrOptions.message || messageOrOptions.title || "";
    resolvedType = messageOrOptions.variant || messageOrOptions.type || type;
  }

  const toast: Toast = { id, title, message, type: resolvedType };
  toastsState = [...toastsState, toast];
  notifyListeners();

  setTimeout(() => {
    toastsState = toastsState.filter((t) => t.id !== id);
    notifyListeners();
  }, 4000);
}

export function useToast() {
  return { showToast };
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={16} className="text-success shrink-0" />,
  error: <AlertCircle size={16} className="text-danger shrink-0" />,
  warning: <AlertCircle size={16} className="text-amber-500 shrink-0" />,
  info: <Info size={16} className="text-info shrink-0" />,
};

const BORDER_COLORS: Record<ToastType, string> = {
  success: "border-l-success",
  error: "border-l-danger",
  warning: "border-l-amber-500",
  info: "border-l-info",
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const idx = listeners.indexOf(setToasts);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    toastsState = toastsState.filter((t) => t.id !== id);
    notifyListeners();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`pointer-events-auto bg-surface border border-border rounded-xl px-4 py-3 shadow-lg flex items-start gap-3 border-l-[3px] ${BORDER_COLORS[toast.type]}`}
          >
            {ICONS[toast.type]}
            <div className="flex-1 min-w-0">
              {toast.title && (
                <p className="text-xs font-bold text-text font-ui">{toast.title}</p>
              )}
              <p className="text-xs text-text-muted font-body leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-text-subtle hover:text-text transition-colors cursor-pointer shrink-0 mt-0.5"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
