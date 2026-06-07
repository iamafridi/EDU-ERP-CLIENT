"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Stethoscope,
  ClipboardList,
  Users,
  BookOpen,
  ArrowRight,
  Calendar,
} from "lucide-react";

interface AgendaItem {
  time: string;
  title: string;
  location: string;
  detail: string;
  icon: React.ReactNode;
  color: string;
  bgColor?: string;
}

const AGENDA_ITEMS: AgendaItem[] = [
  {
    time: "09:30",
    title: "Ward round · Medicine II",
    location: "Clinical Wing",
    detail: "Dr. Sterling · 24 students",
    icon: <Stethoscope size={14} />,
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    time: "11:00",
    title: "OSCE assessment",
    location: "Clinical Skills Lab",
    detail: "3 stations · 18 students",
    icon: <ClipboardList size={14} />,
    color: "text-gold",
    bgColor: "bg-gold/10",
  },
  {
    time: "13:30",
    title: "Faculty senate meeting",
    location: "Boardroom A",
    detail: "12 attendees",
    icon: <Users size={14} />,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    time: "16:00",
    title: "Library inventory review",
    location: "Archives",
    detail: "1,240 records",
    icon: <BookOpen size={14} />,
    color: "text-success",
    bgColor: "bg-success/10",
  },
];

export function AgendaCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-surface border border-border rounded-2xl p-5 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gold/[0.08] flex items-center justify-center">
            <Calendar size={15} className="text-gold" aria-hidden="true" />
          </div>
          <h3 className="text-base font-bold text-text font-ui">Agenda</h3>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {AGENDA_ITEMS.map((item, i) => (
          <div key={i} className="relative flex gap-3 pb-4 last:pb-0">
            {/* Timeline line */}
            {i < AGENDA_ITEMS.length - 1 && (
              <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
            )}
            {/* Icon */}
            <div className={`w-[30px] h-[30px] rounded-lg ${item.bgColor} ${item.color} flex items-center justify-center shrink-0 z-10`}>
              {item.icon}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-[11px] font-bold text-text-muted tabular-nums font-ui">{item.time}</span>
                <span className="text-[10px] text-text-subtle font-body">—</span>
                <span className="text-sm font-semibold text-text truncate font-ui">{item.title}</span>
              </div>
              <p className="text-[11px] text-text-subtle font-body">
                {item.location} · {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Action */}
      <div className="mt-5 pt-4 border-t border-border">
        <Link
          href="/timetable"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gold hover:text-gold-hover transition-colors font-ui"
        >
          Open full calendar
          <ArrowRight size={12} aria-hidden="true" />
        </Link>
      </div>
    </motion.div>
  );
}
