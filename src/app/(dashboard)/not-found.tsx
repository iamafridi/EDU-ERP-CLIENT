"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardNotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="text-center max-w-md">
        <motion.h1 initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 200 }} className="text-6xl font-bold text-[#2563EB] mb-4">404</motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.3 }} className="text-lg text-slate-600 dark:text-slate-300 mb-2">Page not found</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.3 }} className="text-sm text-slate-400 dark:text-slate-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.3 }}>
          <Link
            href="/"
            className="inline-flex h-10 px-5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm shadow-md shadow-blue-500/10 transition-colors items-center justify-center"
          >
            Go to Dashboard
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
