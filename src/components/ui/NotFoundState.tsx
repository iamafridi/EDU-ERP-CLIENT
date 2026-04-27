"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, ArrowLeft, Home, BookOpen, Layers, Users } from "lucide-react";

type NotFoundStateProps = {
  /** Shown as the large heading. Defaults to "404" */
  code?: string;
  /** Primary message */
  title?: string;
  /** Supporting text */
  description?: string;
  /** Link destination. Defaults to "/" */
  actionHref?: string;
  /** Button label. Defaults to "Return to Home" */
  actionLabel?: string;
};

export default function NotFoundState({
  code = "404",
  title = "Institutional Record Not Found",
  description = "The campus workspace, module route, or resource terminal you requested cannot be located.",
  actionHref = "/dashboard",
  actionLabel = "Return to Dashboard",
}: NotFoundStateProps) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-16 px-4 text-center relative overflow-hidden bg-background text-text">
      {/* Ambient warm background accent */}
      <div className="absolute w-[500px] h-[300px] bg-gold/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-md w-full mx-auto"
      >
        {/* Monogram Icon Container */}
        <motion.div
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
          className="w-16 h-16 rounded-2xl bg-surface border border-border text-gold flex items-center justify-center mx-auto mb-6 shadow-sm"
        >
          <MapPin size={28} aria-hidden="true" />
        </motion.div>

        {/* Large 404 Headline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-6xl sm:text-7xl font-bold font-mono tracking-tight text-primary mb-2"
        >
          {code}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl sm:text-2xl font-bold text-text font-display mb-2"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-sm mx-auto mb-8 font-body"
        >
          {description}
        </motion.p>

        {/* Main Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 h-10 px-5 bg-primary text-on-primary hover:bg-primary-hover font-semibold rounded-xl text-xs font-ui transition-all shadow-sm"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span>{actionLabel}</span>
          </Link>
        </motion.div>

        {/* Quick Recovery Navigation Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="pt-6 border-t border-border"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle font-ui block mb-3">
            Quick Recovery Links
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <Link
              href="/dashboard"
              className="p-2.5 rounded-xl bg-surface border border-border hover:border-gold/50 text-text-muted hover:text-text transition-all flex flex-col items-center gap-1 font-ui shadow-xs"
            >
              <Home size={15} className="text-gold" />
              <span>Overview</span>
            </Link>
            <Link
              href="/academics"
              className="p-2.5 rounded-xl bg-surface border border-border hover:border-gold/50 text-text-muted hover:text-text transition-all flex flex-col items-center gap-1 font-ui shadow-xs"
            >
              <BookOpen size={15} className="text-primary" />
              <span>Academics</span>
            </Link>
            <Link
              href="/students"
              className="p-2.5 rounded-xl bg-surface border border-border hover:border-gold/50 text-text-muted hover:text-text transition-all flex flex-col items-center gap-1 font-ui shadow-xs"
            >
              <Users size={15} className="text-info" />
              <span>Students</span>
            </Link>
            <Link
              href="/modules"
              className="p-2.5 rounded-xl bg-surface border border-border hover:border-gold/50 text-text-muted hover:text-text transition-all flex flex-col items-center gap-1 font-ui shadow-xs"
            >
              <Layers size={15} className="text-success" />
              <span>Modules</span>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
