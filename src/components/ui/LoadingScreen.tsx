"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ShieldCheck, Cpu, Database, Stethoscope, Sparkles } from "lucide-react";

interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
  variant?: "full" | "embedded" | "minimal";
  showProgress?: boolean;
}

const BOOT_STAGES = [
  { text: "Establishing secure multi-tenant cryptographic channel...", icon: ShieldCheck },
  { text: "Mounting GASB 34/35 dimensional general ledger...", icon: Database },
  { text: "Calibrating medical telemetry & clinical ward matrix...", icon: Stethoscope },
  { text: "Verifying faculty & student role-based access tokens...", icon: Cpu },
  { text: "Synchronizing real-time university operations stream...", icon: Activity },
];

export function LoadingScreen({
  title = "HOSTEL-PRO ERP",
  subtitle = "Advanced Campus, Living & Enterprise Operations System",
  variant = "full",
  showProgress = true,
}: LoadingScreenProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % BOOT_STAGES.length);
    }, 1800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        const jump = Math.floor(Math.random() * 12) + 6;
        return Math.min(prev + jump, 95);
      });
    }, 400);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const CurrentIcon = BOOT_STAGES[stageIndex].icon;

  if (variant === "minimal") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-gold border-r-primary"
          />
          <Activity className="w-5 h-5 text-gold absolute animate-pulse" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Loading Data Stream...
        </p>
      </div>
    );
  }

  const containerClasses =
    variant === "full"
      ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070D14] text-white overflow-hidden select-none"
      : "relative w-full min-h-[400px] flex flex-col items-center justify-center bg-[#070D14]/90 backdrop-blur-xl rounded-2xl border border-white/10 text-white overflow-hidden p-8";

  return (
    <div className={containerClasses}>
      {/* Background Matrix & Ambient Lighting */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Glowing Orb Blurs */}
      <div className="absolute w-[600px] h-[350px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none -top-20 -left-20" />
      <div className="absolute w-[500px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none -bottom-20 -right-20" />
      <div className="absolute w-[400px] h-[250px] bg-blue-600/15 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Visual Core */}
      <div className="relative flex flex-col items-center z-10 max-w-md w-full px-6">
        
        {/* Holographic Gyro & Medical Beacon */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-8">
          {/* Ring 1 - Outer Counter-Clockwise Dash */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-dashed border-cyan-400/30"
          />

          {/* Ring 2 - Mid Clockwise Cyan/Gold Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="absolute inset-2 rounded-full border-2 border-transparent border-t-cyan-400 border-r-amber-400/60"
          />

          {/* Ring 3 - Inner Pulsing Hexagon Glow */}
          <motion.div
            animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="absolute inset-5 rounded-full bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-amber-500/20 blur-sm"
          />

          {/* Central Glassmorphism Badge */}
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="relative w-20 h-20 rounded-2xl bg-[#0F1E2E]/90 border border-white/20 shadow-[0_0_30px_rgba(6,182,212,0.25)] backdrop-blur-md flex flex-col items-center justify-center gap-1 overflow-hidden"
          >
            {/* Shimmer light sweep */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", repeatDelay: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
            />

            <div className="relative flex items-center justify-center">
              <Activity className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse" />
            </div>
            <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase font-mono">
              ERP-OS
            </span>
          </motion.div>

          {/* Orbiting Satellite Particle */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="absolute inset-0 flex items-start justify-center pointer-events-none"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b] -translate-y-1" />
          </motion.div>
        </div>

        {/* Institution Brand & System Info */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono font-medium text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>NODE ACTIVE // SECURE HTTPS</span>
          </div>
          
          <h2 className="text-xl font-bold tracking-tight text-white font-ui pt-1">
            {title}
          </h2>
          <p className="text-xs text-white/50 tracking-wide font-body">
            {subtitle}
          </p>
        </div>

        {/* Dynamic Boot Sequence Console */}
        <div className="w-full bg-[#0D1A27]/80 rounded-xl border border-white/10 p-3.5 mb-5 shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-white/40 font-mono mb-2">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Sparkles className="w-3 h-3" />
              SYSTEM INITIALIZATION
            </span>
            <span>STAGE {stageIndex + 1}/{BOOT_STAGES.length}</span>
          </div>

          <div className="min-h-[28px] flex items-center gap-2.5 text-xs text-white/80 font-mono">
            <CurrentIcon className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
            <AnimatePresence mode="wait">
              <motion.span
                key={stageIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="truncate"
              >
                {BOOT_STAGES[stageIndex].text}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Modern Shimmer Progress Bar */}
        {showProgress && (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-white/50">
              <span>INITIALIZING CORE MODULES</span>
              <span className="text-cyan-400 font-bold">{progress}%</span>
            </div>

            <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-400 rounded-full relative"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.3 }}
              >
                {/* Glow bar tip */}
                <div className="absolute right-0 top-0 bottom-0 w-3 bg-white shadow-[0_0_8px_#ffffff] rounded-full" />
              </motion.div>
            </div>
          </div>
        )}

        {/* Institutional Footer Tag */}
        <div className="mt-8 text-center">
          <span className="text-[10px] uppercase font-mono tracking-widest text-white/30">
            Encrypted End-to-End Enterprise Architecture • 2026
          </span>
        </div>

      </div>
    </div>
  );
}

export default LoadingScreen;
