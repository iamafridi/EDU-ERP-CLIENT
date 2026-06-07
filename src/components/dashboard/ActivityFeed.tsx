"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, CreditCard, UserCheck, Wrench, AlertOctagon, Calendar, MessageSquare, Megaphone, Heart } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

interface Activity {
  id: string;
  type: "fee" | "leave" | "complaint" | "incident" | "attendance" | "notice" | "message" | "health";
  message: string;
  timestamp: string;
  href?: string;
}

const typeConfig: Record<Activity["type"], { icon: React.ElementType; color: string; bg: string }> = {
  fee: { icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50" },
  leave: { icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
  complaint: { icon: AlertOctagon, color: "text-amber-600", bg: "bg-amber-50" },
  incident: { icon: Wrench, color: "text-red-600", bg: "bg-red-50" },
  attendance: { icon: UserCheck, color: "text-purple-600", bg: "bg-purple-50" },
  notice: { icon: Megaphone, color: "text-cyan-600", bg: "bg-cyan-50" },
  message: { icon: MessageSquare, color: "text-sky-600", bg: "bg-sky-50" },
  health: { icon: Heart, color: "text-rose-600", bg: "bg-rose-50" },
};

const mockActivities: Activity[] = [
  { id: "a1", type: "fee", message: "Marcus Chen paid fee $500 (Tuition Fee)", timestamp: new Date(Date.now() - 2 * 60000).toISOString(), href: "/fees" },
  { id: "a2", type: "leave", message: "Dr. Drake approved leave for Sophia Martinez", timestamp: new Date(Date.now() - 15 * 60000).toISOString(), href: "/leave" },
  { id: "a3", type: "complaint", message: "Ethan Gallagher filed complaint about mess food", timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), href: "/grievances" },
  { id: "a4", type: "incident", message: "Room B-203 reported water leak — assigned to maintenance", timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), href: "/incidents" },
  { id: "a5", type: "attendance", message: "MBBS Y1 — 4 students marked absent today", timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), href: "/attendance" },
  { id: "a6", type: "notice", message: "New notice: Hostel Winter Break Schedule published", timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), href: "/notices" },
  { id: "a7", type: "message", message: "New message from Aria Takahashi to Dr. Harrison", timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), href: "/chat" },
  { id: "a8", type: "health", message: "Student visited Health Center: John Doe — mild fever", timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), href: "/health-center" },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface ActivityFeedProps {
  open: boolean;
  onClose: () => void;
}

export default function ActivityFeed({ open, onClose }: ActivityFeedProps) {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const token = useAuthStore((s) => s.token);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/notifications/activity-feed`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data?.data) {
        setActivities(res.data.data.slice(0, 20));
      }
    } catch {
      // Use mock data
    }
  }, [token]);

  useEffect(() => {
    if (open) fetchActivities();
  }, [open, fetchActivities]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Activity feed"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white border-l border-border shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-gold" />
                <span className="text-sm font-bold text-slate-800">Activity Feed</span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {activities.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">No recent activity</div>
              ) : (
                activities.map((act) => {
                  const cfg = typeConfig[act.type];
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={act.id}
                      onClick={() => { onClose(); if (act.href) router.push(act.href); }}
                      className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer"
                    >
                      <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Icon size={16} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-700 leading-relaxed">{act.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{timeAgo(act.timestamp)}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
