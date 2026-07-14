"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import {
  Calendar,
  Grid3X3,
  List,
  Plus,
  Trash2,
  Pencil,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  GraduationCap,
  Download,
  Printer,
  ShieldAlert,
  Sparkles,
  Users,
  Building2,
  BookOpen,
  Filter,
  Check,
  Search,
  ExternalLink,
  Layers,
  ArrowRightLeft,
  Share2
} from "lucide-react";
import {
  PageHeader,
  Card,
  Modal,
  FormField,
  Input,
  Select,
  Button,
  IconButton,
  Badge,
  Tabs,
} from "@/components/ui";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ProgressBar } from "@/components/ui/ProgressBar";

type TimetableTab = "student-routine" | "faculty-schedule" | "dept-master" | "clash-detector";

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday"];
const DAY_LABELS: Record<string, string> = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
};

const TIME_SLOTS = [
  "08:30 - 09:50",
  "10:00 - 11:20",
  "11:30 - 12:50",
  "13:00 - 14:20",
  "14:30 - 15:50",
  "16:00 - 17:20",
];

export default function TimetablePage() {
  const { user } = useAuthStore();
  const { can, roleIs } = usePermission();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TimetableTab>("student-routine");
  const [selectedSemester, setSelectedSemester] = useState("Fall 2026");
  const [selectedDepartment, setSelectedDepartment] = useState("CSE");
  const [selectedSection, setSelectedSection] = useState("SEC_01");
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState("ALL");
  const [clashFilter, setClashFilter] = useState<"ALL" | "ROOM" | "FACULTY" | "STUDENT">("ALL");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [calendarSyncToast, setCalendarSyncToast] = useState(false);

  // New Slot Form State
  const [newSlot, setNewSlot] = useState({
    courseCode: "CSE-411",
    courseTitle: "Distributed Systems & Cloud Computing",
    section: "SEC_01",
    day: "sunday",
    timeSlot: "08:30 - 09:50",
    room: "Lab Complex 402",
    facultyName: "Prof. Dr. Aris Thorne",
    type: "lecture"
  });

  // Mock Student Routine Data (Fall 2026)
  const studentWeeklyRoutine = [
    {
      id: "slot-1",
      day: "sunday",
      time: "08:30 - 09:50",
      courseCode: "CSE-411",
      courseTitle: "Distributed Systems & Cloud Systems",
      section: "Sec 01",
      room: "Lab Complex 402",
      instructor: "Prof. Dr. Aris Thorne",
      type: "lecture",
      colorTone: "primary",
      lmsUrl: "/lms"
    },
    {
      id: "slot-2",
      day: "sunday",
      time: "11:30 - 12:50",
      courseCode: "BMED-402",
      courseTitle: "Advanced Hemodynamics & Bioengineering",
      section: "Sec 01",
      room: "Biomedical Annex Rm 204",
      instructor: "Assoc. Prof. Dr. Farzana Rahman",
      type: "lecture",
      colorTone: "gold",
      lmsUrl: "/lms"
    },
    {
      id: "slot-3",
      day: "monday",
      time: "10:00 - 11:20",
      courseCode: "CSE-423",
      courseTitle: "Machine Learning & Neural Architectures",
      section: "Sec 02",
      room: "North Block Auditorium 101",
      instructor: "Dr. Kazi Mahfuzur Rahman",
      type: "lecture",
      colorTone: "primary",
      lmsUrl: "/lms"
    },
    {
      id: "slot-4",
      day: "monday",
      time: "14:30 - 17:20",
      courseCode: "CSE-423L",
      courseTitle: "Neural Networks GPU Lab",
      section: "Sec 02L",
      room: "AI High-Performance Computing Lab",
      instructor: "Engr. Tanvir Ahmed (TA)",
      type: "lab",
      colorTone: "info",
      lmsUrl: "/lms"
    },
    {
      id: "slot-5",
      day: "tuesday",
      time: "08:30 - 09:50",
      courseCode: "CSE-411",
      courseTitle: "Distributed Systems & Cloud Systems",
      section: "Sec 01",
      room: "Lab Complex 402",
      instructor: "Prof. Dr. Aris Thorne",
      type: "lecture",
      colorTone: "primary",
      lmsUrl: "/lms"
    },
    {
      id: "slot-6",
      day: "tuesday",
      time: "11:30 - 12:50",
      courseCode: "BMED-402",
      courseTitle: "Advanced Hemodynamics & Bioengineering",
      section: "Sec 01",
      room: "Biomedical Annex Rm 204",
      instructor: "Assoc. Prof. Dr. Farzana Rahman",
      type: "lecture",
      colorTone: "gold",
      lmsUrl: "/lms"
    },
    {
      id: "slot-7",
      day: "wednesday",
      time: "10:00 - 11:20",
      courseCode: "CSE-423",
      courseTitle: "Machine Learning & Neural Architectures",
      section: "Sec 02",
      room: "North Block Auditorium 101",
      instructor: "Dr. Kazi Mahfuzur Rahman",
      type: "lecture",
      colorTone: "primary",
      lmsUrl: "/lms"
    },
    {
      id: "slot-8",
      day: "thursday",
      time: "09:00 - 12:00",
      courseCode: "CSE-499",
      courseTitle: "Senior Capstone & Thesis Defense Jury",
      section: "Panel A",
      room: "Conference Hall 3B",
      instructor: "Department Defense Board",
      type: "defense",
      colorTone: "gold",
      lmsUrl: "/research"
    }
  ];

  // Mock Faculty Teaching Matrix
  const facultyWorkloads = [
    {
      facultyId: "FAC-001",
      name: "Prof. Dr. Aris Thorne",
      designation: "Professor & Chair",
      department: "CSE",
      ugcLimit: 12,
      assignedHours: 9,
      officeHours: "Sun & Tue: 14:00 - 16:30",
      assignedSections: [
        { code: "CSE-411 (Sec 01)", schedule: "Sun/Tue 08:30 - 09:50", room: "Lab Complex 402", students: 35 },
        { code: "CSE-411 (Sec 02)", schedule: "Sun/Tue 10:00 - 11:20", room: "Lab Complex 402", students: 34 },
        { code: "CSE-601 (Grad)", schedule: "Thu 15:00 - 18:00", room: "Seminar Rm 1", students: 18 },
      ]
    },
    {
      facultyId: "FAC-002",
      name: "Assoc. Prof. Dr. Farzana Rahman",
      designation: "Associate Professor",
      department: "EEE & BMED",
      ugcLimit: 14,
      assignedHours: 12,
      officeHours: "Mon & Wed: 11:00 - 13:00",
      assignedSections: [
        { code: "BMED-402 (Sec 01)", schedule: "Sun/Tue 11:30 - 12:50", room: "Biomedical Annex 204", students: 29 },
        { code: "BMED-402 (Sec 02)", schedule: "Mon/Wed 11:30 - 12:50", room: "Biomedical Annex 204", students: 29 },
        { code: "EEE-312 (Sec 01)", schedule: "Sun/Tue 14:30 - 15:50", room: "North Block Rm 302", students: 40 },
        { code: "EEE-312 (Sec 02)", schedule: "Mon/Wed 14:30 - 15:50", room: "North Block Rm 302", students: 38 },
      ]
    },
    {
      facultyId: "FAC-003",
      name: "Dr. Kazi Mahfuzur Rahman",
      designation: "Assistant Professor",
      department: "CSE",
      ugcLimit: 16,
      assignedHours: 15,
      officeHours: "Sun, Mon & Wed: 13:00 - 14:30",
      assignedSections: [
        { code: "CSE-423 (Sec 01)", schedule: "Sun/Tue 10:00 - 11:20", room: "North Block Aud 101", students: 45 },
        { code: "CSE-423 (Sec 02)", schedule: "Mon/Wed 10:00 - 11:20", room: "North Block Aud 101", students: 44 },
        { code: "CSE-221 (Sec 01)", schedule: "Sun/Tue 13:00 - 14:20", room: "South Block Rm 201", students: 42 },
        { code: "CSE-221 (Sec 02)", schedule: "Mon/Wed 13:00 - 14:20", room: "South Block Rm 201", students: 40 },
      ]
    },
    {
      facultyId: "FAC-004",
      name: "Engr. Tanvir Ahmed",
      designation: "Senior Lecturer",
      department: "CSE",
      ugcLimit: 18,
      assignedHours: 18,
      officeHours: "Thu: 14:00 - 17:00",
      assignedSections: [
        { code: "CSE-423L (Sec 01L)", schedule: "Sun 14:30 - 17:20", room: "AI HPC Lab", students: 30 },
        { code: "CSE-423L (Sec 02L)", schedule: "Mon 14:30 - 17:20", room: "AI HPC Lab", students: 30 },
        { code: "CSE-221L (Sec 01L)", schedule: "Tue 14:30 - 17:20", room: "Algorithm Lab 1", students: 28 },
        { code: "CSE-221L (Sec 02L)", schedule: "Wed 14:30 - 17:20", room: "Algorithm Lab 1", students: 28 },
      ]
    }
  ];

  // Mock Clash & Conflict Detection Registry
  const detectedClashes = [
    {
      id: "clash-101",
      severity: "CRITICAL",
      type: "ROOM",
      title: "Room Overlapping Booking Collision",
      description: "Room 'Lab Complex 402' is scheduled simultaneously for CSE-411 (Sec 01) and EEE-401 (Sec 02) on Sun 08:30 - 09:50.",
      affectedParties: "Prof. Dr. Aris Thorne & Assoc. Prof. Dr. Farzana Rahman",
      recommendation: "Reallocate EEE-401 (Sec 02) to available Smart Classroom Rm 308 (North Block).",
      status: "UNRESOLVED"
    },
    {
      id: "clash-102",
      severity: "WARNING",
      type: "FACULTY",
      title: "Faculty Weekly Teaching Ceiling Exceeded",
      description: "Engr. Tanvir Ahmed is assigned 18.0 contact hours (100% of maximum UGC teaching limit for Lecturers).",
      affectedParties: "Engr. Tanvir Ahmed (Lecturer, CSE)",
      recommendation: "Delegate 1 Lab section (CSE-221L) to Graduate Teaching Assistant to avoid burnout.",
      status: "FLAGGED"
    },
    {
      id: "clash-103",
      severity: "INFO",
      type: "STUDENT",
      title: "Common Elective Corequisite Gap Optimization",
      description: "42 students in Section 01 have a 3-hour idle window between Slot 1 (08:30) and Slot 3 (13:00) on Tuesdays.",
      affectedParties: "Undergraduate Cohort Term 4.1",
      recommendation: "Shift BMED-402 to Slot 2 (10:00 - 11:20) to consolidate student presence.",
      status: "OPTIMIZABLE"
    }
  ];

  const handleExportICS = () => {
    setCalendarSyncToast(true);
    setTimeout(() => setCalendarSyncToast(false), 3500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="University Timetable & Dynamic Routine Suite"
        subtitle="Institutional multi-department class routines, faculty teaching workload ceilings, and algorithmic clash resolution."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleExportICS}
            >
              <Calendar size={14} className="text-gold" />
              Sync to Google / iCal (.ics)
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setIsPrintModalOpen(true)}
            >
              <Printer size={14} />
              Print Official Routine
            </Button>
            {roleIs("super-admin", "domain-admin", "faculty") && (
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus size={14} />
                Add Schedule Slot
              </Button>
            )}
          </div>
        }
      />

      {/* TABS NAVIGATION */}
      <Tabs
        value={activeTab}
        onChange={(val) => setActiveTab(val as TimetableTab)}
        items={[
          {
            id: "student-routine",
            label: "Student Weekly Routine",
            icon: <Calendar size={14} />,
            count: studentWeeklyRoutine.length,
          },
          {
            id: "faculty-schedule",
            label: "Faculty Workload & Invigilation",
            icon: <User size={14} />,
            count: facultyWorkloads.length,
          },
          {
            id: "dept-master",
            label: "Department Master Grid",
            icon: <Building2 size={14} />,
          },
          {
            id: "clash-detector",
            label: "Clash & Capacity Monitor",
            icon: <ShieldAlert size={14} />,
            count: detectedClashes.length,
          },
        ]}
      />

      {/* TAB 1: STUDENT PERSONAL WEEKLY ROUTINE */}
      {activeTab === "student-routine" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card pad="md" className="border-border">
              <div className="text-xs text-text-muted">Registered Credits</div>
              <div className="text-xl font-bold font-display text-text mt-1">15.0 Credits</div>
              <div className="text-[11px] text-primary font-medium mt-1">5 Courses • 2 Lab Sections</div>
            </Card>
            <Card pad="md" className="border-border">
              <div className="text-xs text-text-muted">Weekly Contact Hours</div>
              <div className="text-xl font-bold font-display text-gold mt-1">18.5 Hours</div>
              <div className="text-[11px] text-text-muted mt-1">Sun – Thu In-Person</div>
            </Card>
            <Card pad="md" className="border-border">
              <div className="text-xs text-text-muted">Next Scheduled Class</div>
              <div className="text-xl font-bold font-display text-text mt-1">CSE-411</div>
              <div className="text-[11px] text-text-muted mt-1">Sun 08:30 AM • Lab 402</div>
            </Card>
            <Card pad="md" className="border-border">
              <div className="text-xs text-text-muted">Attendance Benchmark</div>
              <div className="text-xl font-bold font-display text-success mt-1">94.8%</div>
              <div className="text-[11px] text-success font-medium mt-1">Admit Card Cleared</div>
            </Card>
          </div>

          {/* Routine Grid Table */}
          <Card pad="lg" className="border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-border">
              <div>
                <h3 className="text-base font-bold font-display text-text flex items-center gap-2">
                  <Calendar size={18} className="text-gold" />
                  Weekly Class Matrix (Fall 2026)
                </h3>
                <p className="text-xs text-text-muted">
                  Interactive lecture slots, room allocations, and direct links to Classroom++ LMS streams.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-muted">Semester:</span>
                <Badge tone="primary" className="text-xs font-mono">{selectedSemester}</Badge>
              </div>
            </div>

            {/* Days Grid View */}
            <div className="space-y-4">
              {DAYS.map((dayKey) => {
                const daySlots = studentWeeklyRoutine.filter((s) => s.day === dayKey);
                return (
                  <div key={dayKey} className="border border-border/80 rounded-2xl p-4 bg-surface-muted/20">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
                      <h4 className="text-sm font-bold font-display text-text uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-gold inline-block" />
                        {DAY_LABELS[dayKey]}
                      </h4>
                      <span className="text-xs text-text-muted font-medium">
                        {daySlots.length} {daySlots.length === 1 ? "Session" : "Sessions"} Scheduled
                      </span>
                    </div>

                    {daySlots.length === 0 ? (
                      <div className="py-6 text-center text-xs text-text-muted italic bg-surface/50 rounded-xl border border-dashed border-border/60">
                        No lectures or lab sessions scheduled for this day (Designated Study / Research Day).
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            className={`p-3.5 rounded-xl border transition-all hover:shadow-md bg-surface ${
                              slot.colorTone === "gold"
                                ? "border-gold/40 hover:border-gold"
                                : slot.colorTone === "info"
                                ? "border-info/40 hover:border-info"
                                : "border-primary/40 hover:border-primary"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-xs text-text">{slot.courseCode}</span>
                                  <Badge
                                    tone={slot.type === "lab" ? "info" : slot.type === "defense" ? "gold" : "primary"}
                                    className="text-[10px] uppercase font-bold"
                                  >
                                    {slot.type}
                                  </Badge>
                                </div>
                                <h5 className="text-xs font-semibold text-text mt-0.5 line-clamp-1">{slot.courseTitle}</h5>
                              </div>
                            </div>

                            <div className="space-y-1.5 text-xs text-text-muted mt-2 pt-2 border-t border-border/50">
                              <div className="flex items-center gap-1.5 font-medium text-text">
                                <Clock size={12} className="text-gold flex-shrink-0" />
                                <span>{slot.time}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin size={12} className="text-primary flex-shrink-0" />
                                <span className="truncate">{slot.room}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <User size={12} className="text-text-muted flex-shrink-0" />
                                <span className="truncate">{slot.instructor}</span>
                              </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between">
                              <span className="text-[11px] font-mono text-text-muted">{slot.section}</span>
                              <a
                                href={slot.lmsUrl}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                              >
                                LMS Stream <ExternalLink size={10} />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: FACULTY WORKLOAD & INVIGILATION MATRIX */}
      {activeTab === "faculty-schedule" && (
        <div className="space-y-6 animate-fade-in">
          {/* Workload Governance Overview */}
          <Card pad="lg" className="border-border bg-gradient-to-r from-surface to-surface-muted">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-gold-soft text-gold">
                  UGC Compliance Standards
                </span>
                <h3 className="text-lg font-bold font-display text-text mt-1">
                  Faculty Contact Hours & Teaching Load Matrix
                </h3>
                <p className="text-xs text-text-muted mt-1 max-w-2xl">
                  Enforcing statutory teaching limits (Professors $\le 12$h, Assoc. Profs $\le 14$h, Lecturers $\le 18$h). Weekly schedules include lectures, laboratory demonstrations, and published office consultation hours.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-center px-4 py-2 rounded-xl bg-surface border border-border">
                  <div className="text-xs text-text-muted">Total Active Faculty</div>
                  <div className="text-base font-bold text-text font-display">42 Professors</div>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-surface border border-border">
                  <div className="text-xs text-text-muted">Average Workload</div>
                  <div className="text-base font-bold text-primary font-display">13.2 hrs/wk</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Faculty Workload Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {facultyWorkloads.map((fac) => {
              const loadPercent = Math.min(100, Math.round((fac.assignedHours / fac.ugcLimit) * 100));
              const isNearCap = loadPercent >= 90;

              return (
                <Card key={fac.facultyId} pad="md" className="border-border space-y-4 hover:border-gold/40 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-text font-display">{fac.name}</h4>
                        <Badge tone="primary" className="text-[10px]">{fac.designation}</Badge>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">
                        Dept. of {fac.department} • Office Hours: <span className="text-text font-medium">{fac.officeHours}</span>
                      </p>
                    </div>

                    <Badge
                      tone={isNearCap ? "warning" : "success"}
                      className="text-xs font-mono font-bold"
                    >
                      {fac.assignedHours} / {fac.ugcLimit} hrs
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-text-muted">Weekly Teaching Load</span>
                      <span className="font-semibold text-text">{loadPercent}% Capacity</span>
                    </div>
                    <ProgressBar
                      value={loadPercent}
                      variant={loadPercent > 95 ? "danger" : loadPercent >= 80 ? "warning" : "success"}
                    />
                  </div>

                  {/* Assigned Sections */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <span className="text-xs font-semibold text-text block">Assigned Sections & Lecture Venues:</span>
                    <div className="space-y-1.5">
                      {fac.assignedSections.map((sec, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs bg-surface-muted/40 p-2 rounded-lg border border-border/50"
                        >
                          <div>
                            <span className="font-semibold text-text block">{sec.code}</span>
                            <span className="text-[11px] text-text-muted">{sec.schedule} • {sec.room}</span>
                          </div>
                          <span className="text-[11px] font-mono text-primary font-medium">{sec.students} Students</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTMENT MASTER GRID */}
      {activeTab === "dept-master" && (
        <div className="space-y-6 animate-fade-in">
          {/* Controls Bar */}
          <Card pad="md" className="border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div>
                  <label className="text-[11px] font-semibold text-text-muted block mb-1">Academic Department</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="text-xs bg-background border border-border rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:border-gold"
                  >
                    <option value="CSE">Computer Science & Engineering</option>
                    <option value="EEE">Electrical & Electronic Engineering</option>
                    <option value="BMED">Biomedical Engineering</option>
                    <option value="BBA">School of Business Administration</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-text-muted block mb-1">Semester Cohort</label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="text-xs bg-background border border-border rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:border-gold"
                  >
                    <option value="Fall 2026">Fall 2026 (Active)</option>
                    <option value="Spring 2027">Spring 2027 (Draft Planning)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-text-muted block mb-1">Section Cohort</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="text-xs bg-background border border-border rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:border-gold"
                  >
                    <option value="ALL">All Sections</option>
                    <option value="SEC_01">Section 01</option>
                    <option value="SEC_02">Section 02</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus size={13} /> Allocate Slot
                </Button>
              </div>
            </div>
          </Card>

          {/* Department Master Weekly Grid */}
          <Card pad="lg" className="border-border overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-surface-muted/60 text-text-muted uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-4 w-32">Time Slot</th>
                  {DAYS.map((day) => (
                    <th key={day} className="py-3 px-4 text-center font-bold text-text">
                      {DAY_LABELS[day]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {TIME_SLOTS.map((slotTime, idx) => (
                  <tr key={idx} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-text bg-surface-muted/20 border-r border-border/60">
                      {slotTime}
                    </td>
                    {DAYS.map((dayKey) => {
                      const match = studentWeeklyRoutine.find(
                        (s) => s.day === dayKey && s.time.includes(slotTime.split(" - ")[0])
                      );

                      return (
                        <td key={dayKey} className="py-2.5 px-3 border-r border-border/40 text-center">
                          {match ? (
                            <div className="p-2 rounded-xl bg-primary-soft text-primary border border-primary/20 text-left space-y-1">
                              <div className="font-bold font-mono text-[11px]">{match.courseCode} ({match.section})</div>
                              <div className="text-[10px] text-text font-medium truncate">{match.room}</div>
                              <div className="text-[10px] text-text-muted truncate">{match.instructor}</div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-text-subtle font-mono">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* TAB 4: CLASH & CAPACITY MONITOR */}
      {activeTab === "clash-detector" && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Card */}
          <Card pad="lg" className="border-border bg-gradient-to-r from-surface to-surface-muted">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-danger-soft text-danger">
                  Live Algorithmic Validator
                </span>
                <h3 className="text-lg font-bold font-display text-text mt-1">
                  Automated Clash & Capacity Conflict Monitor
                </h3>
                <p className="text-xs text-text-muted mt-1 max-w-2xl">
                  Continuously scans room occupancies, faculty double-bookings, and student corequisite time conflicts across all university sections.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    setSuccessMsg("Deep algorithmic scan completed. 3 items cataloged.");
                    setTimeout(() => setSuccessMsg(""), 3500);
                  }}
                >
                  <Sparkles size={14} /> Run Full Campus Audit
                </Button>
              </div>
            </div>
          </Card>

          {/* Clash Cards List */}
          <div className="space-y-4">
            {detectedClashes.map((clash) => (
              <Card
                key={clash.id}
                pad="md"
                className={`border transition-all ${
                  clash.severity === "CRITICAL"
                    ? "border-danger/50 bg-danger-soft/10"
                    : clash.severity === "WARNING"
                    ? "border-warning/50 bg-warning-soft/10"
                    : "border-primary/40 bg-surface"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        tone={clash.severity === "CRITICAL" ? "danger" : clash.severity === "WARNING" ? "warning" : "primary"}
                        className="text-[10px] font-bold"
                      >
                        {clash.severity} CLASH
                      </Badge>
                      <span className="text-xs font-mono text-text-muted">{clash.id}</span>
                      <span className="text-xs font-semibold text-text font-display">• {clash.title}</span>
                    </div>

                    <p className="text-xs text-text leading-relaxed">{clash.description}</p>

                    <div className="text-xs bg-surface p-2.5 rounded-xl border border-border space-y-1">
                      <div className="text-[11px] text-text-muted">
                        <span className="font-semibold text-text">Affected Parties:</span> {clash.affectedParties}
                      </div>
                      <div className="text-[11px] text-primary font-medium">
                        <span className="font-semibold text-text">Algorithmic Recommendation:</span> {clash.recommendation}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5"
                      onClick={() => {
                        setSuccessMsg(`Automated resolution applied to ${clash.id}`);
                        setTimeout(() => setSuccessMsg(""), 3500);
                      }}
                    >
                      <Check size={13} /> Auto-Resolve
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add Slot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <Card pad="lg" className="w-full max-w-lg bg-surface border-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold font-display text-text flex items-center gap-2">
                <Plus size={16} className="text-gold" />
                Allocate Master Timetable Slot
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface-muted"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Course Code</label>
                  <input
                    type="text"
                    value={newSlot.courseCode}
                    onChange={(e) => setNewSlot({ ...newSlot, courseCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg font-mono focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Section</label>
                  <input
                    type="text"
                    value={newSlot.section}
                    onChange={(e) => setNewSlot({ ...newSlot, section: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg font-mono focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">Course Title</label>
                <input
                  type="text"
                  value={newSlot.courseTitle}
                  onChange={(e) => setNewSlot({ ...newSlot, courseTitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Day of Week</label>
                  <select
                    value={newSlot.day}
                    onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-gold"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{DAY_LABELS[d]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Time Slot</label>
                  <select
                    value={newSlot.timeSlot}
                    onChange={(e) => setNewSlot({ ...newSlot, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg font-mono focus:outline-none focus:border-gold"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Room / Venue</label>
                  <input
                    type="text"
                    value={newSlot.room}
                    onChange={(e) => setNewSlot({ ...newSlot, room: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Assigned Faculty</label>
                  <input
                    type="text"
                    value={newSlot.facultyName}
                    onChange={(e) => setNewSlot({ ...newSlot, facultyName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSuccessMsg("Schedule slot successfully allocated into master timetable.");
                  setTimeout(() => setSuccessMsg(""), 3500);
                }}
              >
                Confirm Allocation
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Sync Toast Notification */}
      {calendarSyncToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium border border-primary/40 animate-fade-in no-print">
          <CheckCircle2 size={16} className="text-gold" />
          Synchronized 8 active semester sessions to Google Calendar & Apple iCal (.ics).
        </div>
      )}

      {/* Success Notification */}
      {successMsg && (
        <div className="fixed bottom-6 left-6 z-50 bg-surface text-text px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium border border-border animate-fade-in no-print">
          <CheckCircle2 size={16} className="text-success" />
          {successMsg}
        </div>
      )}

      {/* Printable Master Routine Modal (A4 Landscape Layout) */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="bg-white text-zinc-900 w-full max-w-5xl rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 printable-document my-auto">
            {/* Action Bar (Hidden in Print) */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 no-print">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Document Preview • A4 Landscape Formatted
                </span>
                <Badge tone="gold">Official Academic Transcript Format</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPrintModalOpen(false)}
                >
                  Close Preview
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-1.5 bg-zinc-900 text-white"
                  onClick={() => window.print()}
                >
                  <Printer size={14} />
                  Print A4 Routine (Clean PDF)
                </Button>
              </div>
            </div>

            {/* Official University Header */}
            <div className="border-b-2 border-zinc-900 pb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-zinc-900 text-white text-[10px] font-mono font-bold uppercase">
                    BMDC ACCREDITED
                  </span>
                  <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">
                    GOVERNMENT RECOGNIZED
                  </span>
                </div>
                <h1 className="text-xl font-black tracking-tight text-zinc-900 uppercase mt-1">
                  Central Medical College & Hospital University System
                </h1>
                <p className="text-xs text-zinc-600 font-medium">
                  Office of the Academic Dean & Controller of Examinations • Class Timetable Division
                </p>
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-700 mt-2">
                  <span>TERM: <strong>Fall 2026</strong></span>
                  <span>•</span>
                  <span>DEPT: <strong>{selectedDepartment} (Computer Science & Biomedical Eng.)</strong></span>
                  <span>•</span>
                  <span>SECTION: <strong>{selectedSection}</strong></span>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="w-16 h-16 border-2 border-zinc-900 rounded-lg flex flex-col items-center justify-center p-1 text-center">
                  <span className="text-[8px] font-mono font-bold leading-tight">OFFICIAL SEAL</span>
                  <span className="text-[10px] font-bold text-zinc-800">VERIFIED</span>
                </div>
                <div className="text-[9px] font-mono text-zinc-500">REF: TT-2026-F-{selectedDepartment}</div>
              </div>
            </div>

            {/* 5-Day Master Weekly Timetable Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-zinc-300 text-xs">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-900 font-bold border-b border-zinc-300">
                    <th className="border border-zinc-300 p-2 text-left w-24">Day / Slot</th>
                    {TIME_SLOTS.map((slot) => (
                      <th key={slot} className="border border-zinc-300 p-2 text-center font-mono text-[11px]">
                        {slot}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => (
                    <tr key={day} className="border-b border-zinc-200">
                      <td className="border border-zinc-300 p-2 font-bold bg-zinc-50 uppercase text-[11px]">
                        {DAY_LABELS[day]}
                      </td>
                      {TIME_SLOTS.map((slot) => {
                        const match = studentWeeklyRoutine.find(
                          (item: any) => item.day === day && item.time === slot
                        );
                        return (
                          <td key={slot} className="border border-zinc-300 p-2 text-center align-top">
                            {match ? (
                              <div className="p-1.5 rounded bg-zinc-50 border border-zinc-300 space-y-0.5 text-left">
                                <div className="font-bold font-mono text-[11px] text-zinc-900">
                                  {match.courseCode}
                                </div>
                                <div className="text-[10px] font-semibold text-zinc-800 line-clamp-1">
                                  {match.courseTitle}
                                </div>
                                <div className="text-[9px] text-zinc-600 flex items-center justify-between pt-0.5 border-t border-zinc-200 font-mono">
                                  <span>{match.room}</span>
                                  <span>{match.instructor.split(' ')[0]}</span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-zinc-300 font-mono text-[11px]">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Statutory Notes & Signatures */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-zinc-300 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-700">
                  Institutional Policy:
                </span>
                <p className="text-[10px] text-zinc-600 leading-relaxed">
                  Minimum 75% biometric attendance is mandatory across theory and lab sessions to qualify for final university professional examinations.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="h-8 border-b border-dashed border-zinc-400 mx-auto w-40" />
                <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-800">
                  Head of Department (HOD)
                </span>
              </div>

              <div className="text-center space-y-4">
                <div className="h-8 border-b border-dashed border-zinc-400 mx-auto w-40" />
                <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-800">
                  Academic Registrar & Controller
                </span>
              </div>
            </div>

            {/* Print Footer */}
            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 pt-2 border-t border-zinc-200">
              <span>Generated via MedicalCollegeERP Portal System</span>
              <span>Document Security Hash: SHA256-A89F930D • Valid for Fall 2026</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
