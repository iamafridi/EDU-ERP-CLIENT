"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFoundPage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-tr from-[#faf8ff] via-[#ededf9] to-[#d3e4fe] relative overflow-hidden px-4"
    >
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#2563EB]/15 blur-3xl" />
      <div className="text-center relative z-10">
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }} className="text-8xl font-bold text-[#2563EB] mb-4">404</motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.4 }} className="text-lg text-slate-600 mb-2">Page not found</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.4 }} className="text-sm text-slate-400 mb-8">The page you're looking for doesn't exist or has been moved.</motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.4 }}>
          <Link
            href="/"
            className="inline-flex h-11 px-6 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm shadow-md shadow-blue-500/10 transition-colors items-center justify-center"
          >
            Go to Dashboard
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
