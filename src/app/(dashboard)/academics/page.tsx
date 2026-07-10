"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import {
  Calendar,
  Award,
  BookOpen,
  Clipboard,
  ChevronRight,
  BookMarked,
  FolderOpen,
  FileSpreadsheet,
  GraduationCap,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";

const ACADEMIC_HUBS = [
  {
    title: "Courses & Cohorts",
    desc: "Active curriculum subjects, credit points, and faculty allocation",
    href: "/courses",
    icon: GraduationCap,
    badge: "Curriculum Core",
  },
  {
    title: "Lecture Timetable",
    desc: "Weekly class schedule grid view with section & room allocation",
    href: "/timetable",
    icon: Calendar,
    badge: "Scheduling",
  },
  {
    title: "Curriculum & Outcomes (OBE)",
    desc: "Course outcomes, program outcomes, and CO-PO matrix mapping",
    href: "/curriculum",
    icon: BookOpen,
    badge: "Accreditation",
  },
  {
    title: "Course Syllabus",
    desc: "Prescribed textbooks, modular topics, and evaluation criteria",
    href: "/syllabus",
    icon: BookMarked,
    badge: "Registry",
  },
  {
    title: "Study Materials",
    desc: "Digital lecture slides, notes, assignments, and references",
    href: "/study-materials",
    icon: FolderOpen,
    badge: "Resources",
  },
  {
    title: "Exams & Continuous Evaluation",
    desc: "Scheduled exams, quizzes, CIE marks, and GPA grade books",
    href: "/exams",
    icon: FileSpreadsheet,
    badge: "Evaluations",
  },
  {
    title: "Academic Transcripts",
    desc: "Semester GPA records, official transcript generation, and verification",
    href: "/transcripts",
    icon: Award,
    badge: "Records",
  },
];

export default function AcademicsHubPage() {
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["schedules"],
    queryFn: api.getSchedules,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academics & Curriculum Hub"
        subtitle="Centralized governance for lecture timetables, curriculum learning outcomes, syllabi, study materials, and transcripts."
      />

      {/* Hub Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACADEMIC_HUBS.map((hub) => {
          const Icon = hub.icon;
          return (
            <Link key={hub.href} href={hub.href} className="block group">
              <Card className="h-full flex flex-col justify-between hover:border-primary/50 hover:shadow-md transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon size={20} />
                    </div>
                    <Badge variant="neutral" size="sm">
                      {hub.badge}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold text-text group-hover:text-primary transition-colors flex items-center justify-between">
                    <span>{hub.title}</span>
                    <ChevronRight
                      size={16}
                      className="text-text-subtle group-hover:text-primary group-hover:translate-x-1 transition-all"
                    />
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">{hub.desc}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Weekly Lecture Schedules Overview */}
      <Card noPadding>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Clipboard size={15} /> Weekly Lecture Schedules
          </span>
          <Badge variant="primary" size="sm">
            {schedules.length} Sessions Scheduled
          </Badge>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-border flex items-start gap-4 animate-pulse bg-surface-muted/20"
              >
                <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : schedules.length === 0 ? (
          <EmptyState
            title="No Active Schedules Set"
            description="Manage and schedule weekly course routines in the Lecture Timetable module."
            icon={<Calendar size={28} className="text-gold" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {schedules.map((sch: any) => (
              <Card
                key={sch.id}
                className="flex items-start gap-4 border border-border hover:border-primary/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
                  <Calendar size={18} />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold text-primary">
                      {sch.courseCode}
                    </span>
                    <span className="text-[11px] text-text-subtle font-medium capitalize">
                      {sch.day}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-text truncate">{sch.courseTitle}</h3>
                  <p className="text-xs text-text-muted flex items-center gap-1">
                    <User size={12} className="shrink-0" />
                    <span>{sch.facultyName}</span>
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-text-subtle font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {sch.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} /> {sch.room}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
