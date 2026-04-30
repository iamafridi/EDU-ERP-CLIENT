"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export type SpinnerVariant = "orbital" | "ecg" | "beacon" | "dots" | "minimal";
export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";

interface LoadingSpinnerProps {
  variant?: SpinnerVariant;
  size?: SpinnerSize;
  color?: string;
  className?: string;
  label?: string;
}

const sizeMap: Record<SpinnerSize, { container: string; icon: string; dot: string }> = {
  xs: { container: "w-4 h-4", icon: "w-3 h-3", dot: "w-1 h-1" },
  sm: { container: "w-6 h-6", icon: "w-4 h-4", dot: "w-1.5 h-1.5" },
  md: { container: "w-10 h-10", icon: "w-6 h-6", dot: "w-2.5 h-2.5" },
  lg: { container: "w-16 h-16", icon: "w-10 h-10", dot: "w-3.5 h-3.5" },
  xl: { container: "w-24 h-24", icon: "w-14 h-14", dot: "w-5 h-5" },
};

export function LoadingSpinner({
  variant = "orbital",
  size = "md",
  className = "",
  label,
}: LoadingSpinnerProps) {
  const dimensions = sizeMap[size];

  return (
    <div className={`inline-flex flex-col items-center justify-center gap-2 ${className}`}>
      {variant === "orbital" && (
        <div className={`relative ${dimensions.container} flex items-center justify-center`}>
          {/* Outer spin ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-gold border-r-transparent"
          />
          {/* Counter spin ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute inset-1 rounded-full border border-dashed border-cyan-500/40"
          />
          {/* Center pulse */}
          <div className="w-1/3 h-1/3 rounded-full bg-gold/80 shadow-[0_0_8px_var(--color-gold)] animate-ping" />
        </div>
      )}

      {variant === "ecg" && (
        <div className={`relative ${dimensions.container} flex items-center justify-center`}>
          <motion.div
            animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
            className="relative flex items-center justify-center"
          >
            <Activity className={`${dimensions.icon} text-gold animate-pulse drop-shadow-[0_0_6px_rgba(185,139,75,0.6)]`} />
          </motion.div>
        </div>
      )}

      {variant === "beacon" && (
        <div className={`relative ${dimensions.container} flex items-center justify-center`}>
          <motion.div
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-cyan-500/30"
          />
          <div className="w-1/2 h-1/2 rounded-full bg-gradient-to-tr from-cyan-600 to-amber-400 shadow-md" />
        </div>
      )}

      {variant === "dots" && (
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [-3, 3, -3], opacity: [0.4, 1, 0.4] }}
              transition={{
                repeat: Infinity,
                duration: 0.9,
                delay: i * 0.18,
                ease: "easeInOut",
              }}
              className={`${dimensions.dot} rounded-full bg-gold shadow-sm`}
            />
          ))}
        </div>
      )}

      {variant === "minimal" && (
        <div
          className={`${dimensions.container} rounded-full border-2 border-slate-200 border-t-primary animate-spin`}
        />
      )}

      {label && (
        <span className="text-xs font-semibold text-text-muted tracking-wide font-ui animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
}

export default LoadingSpinner;
