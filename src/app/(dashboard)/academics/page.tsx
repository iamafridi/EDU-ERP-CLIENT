"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { usePermission } from "@/hooks/usePermission";
import { Calendar, Award, BookOpen, Clipboard, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AcademicsHubPage() {
  const { can } = usePermission();

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["schedules"],
    queryFn: api.getSchedules,
  });

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="text-[#2563EB]" />
            Academics Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Schedules, transcripts, curriculum mapping, and outcomes-based education tracking.
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/transcripts"
          className="bg-white border border-[#e1e2ed] rounded-xl p-4 hover:shadow-md hover:border-[#2563EB]/30 transition-all group flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#2563EB] transition-colors">Academic Transcripts</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">GPA records, transcript requests, and verification</p>
          </div>
          <ChevronRight size={18} className="text-slate-300 group-hover:text-[#2563EB] transition-colors" />
        </Link>
        <Link href="/curriculum"
          className="bg-white border border-[#e1e2ed] rounded-xl p-4 hover:shadow-md hover:border-[#2563EB]/30 transition-all group flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#2563EB] transition-colors">Curriculum & Outcomes</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Course outcomes, program outcomes, curriculum mapping</p>
          </div>
          <ChevronRight size={18} className="text-slate-300 group-hover:text-[#2563EB] transition-colors" />
        </Link>
      </div>

      {/* Weekly Lecture Schedules */}
      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Clipboard size={16} /> Weekly Lecture Schedules
          </span>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-[#e1e2ed] flex items-start gap-4">
                <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-4">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : schedules.length === 0 ? (
          <p className="p-12 text-center text-xs text-slate-400">No schedules set for this semester.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-slate-50/50">
            {schedules.map((sch: any) => (
              <div key={sch.id} className="bg-white p-4 rounded-xl border border-[#e1e2ed] shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                  <Calendar size={20} />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold font-mono text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded">{sch.courseCode}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{sch.day}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 truncate">{sch.courseTitle}</h3>
                  <p className="text-xs text-slate-500 font-medium">{sch.facultyName}</p>
                  <div className="flex items-center gap-4 text-[10px] text-slate-400 font-semibold font-mono pt-1">
                    <span>Time: {sch.time}</span>
                    <span>Hall: {sch.room}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
