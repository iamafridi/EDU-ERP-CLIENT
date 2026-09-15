"use client";

import React, { useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "./Button";

function useFocusTrap(ref: React.RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;
    const focusables = () =>
      Array.from(
        node.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    // Move focus into the dialog on open
    const initial = node.querySelector<HTMLElement>("[autofocus], input, button");
    (initial || node).focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, ref]);
}

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

function useMounted() {
  // SSR-safe mount detection: false on the server, true after hydration.
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function OverlayShell({ open, onClose, title, children, footer }: OverlayProps) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open);
  const triggerRef = useRef<HTMLElement | null>(null);

  const handleClose = useCallback(() => {
    triggerRef.current?.focus?.();
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) triggerRef.current = document.activeElement as HTMLElement;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="relative w-full max-w-lg bg-surface-raised border border-border rounded-xl shadow-lg p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-sm font-semibold text-text">{title}</h2>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close dialog"
          className="p-1.5 -m-1.5 rounded-md text-text-muted hover:bg-surface-muted hover:text-text transition-colors cursor-pointer"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      <div className="mt-4">{children}</div>
      {footer && <div className="mt-5 flex items-center justify-end gap-2">{footer}</div>}
    </motion.div>
  );
}

/** Modal dialog. Interruption only where justified; prefer Sheet for row details. */
export function Dialog({ open, onClose, title, children, footer }: OverlayProps) {
  const mounted = useMounted();
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
          <OverlayShell open={open} onClose={onClose} title={title} footer={footer}>
            {children}
          </OverlayShell>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/** Side sheet - preferred for row details and secondary editing. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  side = "right",
}: OverlayProps & { side?: "right" | "left" }) {
  const mounted = useMounted();
  if (!mounted) return null;
  const isRight = side === "right";
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ x: isRight ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: isRight ? "100%" : "-100%" }}
            transition={{ type: "tween", duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className={`absolute top-0 bottom-0 ${isRight ? "right-0" : "left-0"} w-full max-w-md bg-surface-raised border-border ${isRight ? "border-l" : "border-r"} shadow-lg flex flex-col`}
          >
            <div className="flex items-center justify-between px-5 h-14 border-b border-border shrink-0">
              <h2 className="text-sm font-semibold text-text">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close panel"
                className="p-1.5 -m-1.5 rounded-md text-text-muted hover:bg-surface-muted hover:text-text transition-colors cursor-pointer"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
            {footer && <div className="px-5 py-3 border-t border-border flex items-center justify-end gap-2 shrink-0">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  loading?: boolean;
}

/** Destructive-action confirmation with explicit consequence copy. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {tone === "danger" && (
        <div className="mb-3 flex items-center gap-2 text-danger">
          <AlertTriangle size={16} aria-hidden="true" />
          <span className="text-xs font-medium">This action cannot be undone.</span>
        </div>
      )}
      <div className="text-xs text-text-muted leading-5">{description}</div>
    </Dialog>
  );
}