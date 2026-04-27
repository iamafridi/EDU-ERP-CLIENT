"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "./Button";

type ErrorStateProps = {
  /** The error object from a React error boundary */
  error?: Error & { digest?: string };
  /** Retry callback provided by error boundary's `reset` prop */
  reset?: () => void;
  /** Override the default title */
  title?: string;
  /** Override the default description */
  description?: string;
};

export default function ErrorState({
  error,
  reset,
  title = "Runtime Exception Encountered",
  description,
}: ErrorStateProps) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-16 px-4 text-center relative overflow-hidden bg-background text-text">
      {/* Background ambient lighting */}
      <div className="absolute w-[500px] h-[300px] bg-danger/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="max-w-md w-full mx-auto"
      >
        {/* Glow Hazard Icon */}
        <div className="w-16 h-16 rounded-2xl bg-danger-soft border border-danger/20 text-danger flex items-center justify-center mx-auto mb-5 shadow-sm">
          <AlertTriangle size={28} aria-hidden="true" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-text font-display mb-2">{title}</h2>

        <p className="text-xs sm:text-sm text-text-muted max-w-sm mx-auto mb-4 font-body leading-relaxed">
          {description || error?.message || "An unexpected system exception occurred while rendering this campus view."}
        </p>

        {/* Digest is internal — only visible in development for debugging */}
        {isDev && error?.digest && (
          <p className="text-[11px] text-text-subtle font-mono mb-6 bg-surface border border-border rounded-lg p-2 max-w-xs mx-auto truncate">
            Digest: {error.digest}
          </p>
        )}

        <div className="flex items-center justify-center gap-3 mt-6">
          {reset && (
            <Button
              variant="primary"
              size="md"
              onClick={reset}
              leftIcon={<RefreshCw size={14} aria-hidden="true" />}
            >
              Retry Session
            </Button>
          )}

          <Link href="/dashboard">
            <Button
              variant="outline"
              size="md"
              leftIcon={<Home size={14} aria-hidden="true" />}
            >
              Campus Overview
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
