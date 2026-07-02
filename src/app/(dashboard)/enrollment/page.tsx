"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { usePermission } from "@/hooks/usePermission";
import {
  PageHeader,
  Card,
  DataTable,
  Column,
  Modal,
  FormField,
  Input,
  Select,
  Button,
  Badge,
  ProgressBar,
  IconButton,
} from "@/components/ui";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion } from "framer-motion";
import {
  UserPlus,
  Plus,
  CheckCircle2,
  Clock,
  Users,
  CalendarCheck,
  Layers,
  ShieldAlert,
  ArrowLeftRight,
  TrendingUp,
  AlertTriangle,
  FileCheck,
  Sparkles,
  Lock,
} from "lucide-react";

interface SectionCapacityItem {
  id: string;
  courseCode: string;
  courseTitle: string;
  sectionNumber: string;
  instructor: string;
  room: string;
  schedule: string;
  maxCapacity: number;
  enrolledCount: number;
  waitlistCount: number;
  status: "OPEN" | "FULL" | "OVERWRITE_ONLY" | "CLOSED";
}

const mockSectionCapacities: SectionCapacityItem[] = [
  {
    id: "SEC-CSE110-1",
    courseCode: "CSE110",
    courseTitle: "Programming Language I",
    sectionNumber: "Section 01",
    instructor: "Dr. Evelyn Parker",
    room: "Lab 402",
    schedule: "Sun, Tue 08:30 AM - 10:00 AM",
    maxCapacity: 40,
    enrolledCount: 40,
    waitlistCount: 12,
    status: "FULL",
  },
  {
    id: "SEC-CSE110-2",
    courseCode: "CSE110",
    courseTitle: "Programming Language I",
    sectionNumber: "Section 02",
    instructor: "Prof. Farhana Ahmed",
    room: "Lab 405",
    schedule: "Mon, Wed 10:15 AM - 11:45 AM",
    maxCapacity: 40,
    enrolledCount: 36,
    waitlistCount: 0,
    status: "OPEN",
  },
  {
    id: "SEC-CSE220-1",
    courseCode: "CSE220",
    courseTitle: "Data Structures & Algorithms",
    sectionNumber: "Section 01",
    instructor: "Dr. Marcus Vance",
    room: "Lab 501",
    schedule: "Sun, Tue 11:45 AM - 01:15 PM",
    maxCapacity: 35,
    enrolledCount: 35,
    waitlistCount: 8,
    status: "OVERWRITE_ONLY",
  },
  {
    id: "SEC-EEE201-1",
    courseCode: "EEE201",
    courseTitle: "Electrical Circuits I",
    sectionNumber: "Section 01",
    instructor: "Dr. Tariq Rahman",
    room: "Room 302",
    schedule: "Mon, Wed 01:30 PM - 03:00 PM",
    maxCapacity: 45,
    enrolledCount: 42,
    waitlistCount: 0,
    status: "OPEN",
  },
];

interface PrereqRule {
  id: string;
  courseCode: string;
  courseTitle: string;
  requiredPrereq: string;
  minPrereqGrade: string;
  waiverAllowed: boolean;
  activeWaiverRequests: number;
}

const mockPrereqs: PrereqRule[] = [
  {
    id: "PR-01",
    courseCode: "CSE220",
    courseTitle: "Data Structures & Algorithms",
    requiredPrereq: "CSE110 (Programming Language I)",
    minPrereqGrade: "C (2.00)",
    waiverAllowed: true,
    activeWaiverRequests: 4,
  },
  {
    id: "PR-02",
    courseCode: "CSE321",
    courseTitle: "Operating Systems Architecture",
    requiredPrereq: "CSE220 & CSE260 (Digital Logic)",
    minPrereqGrade: "C+ (2.50)",
    waiverAllowed: false,
    activeWaiverRequests: 1,
  },
  {
    id: "PR-03",
    courseCode: "MAT215",
    courseTitle: "Complex Variables & Fourier Analysis",
    requiredPrereq: "MAT120 (Integral Calculus)",
    minPrereqGrade: "D (1.00)",
    waiverAllowed: true,
    activeWaiverRequests: 2,
  },
];

export default function EnrollmentPage() {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"windows" | "capacity" | "prereqs" | "add_drop" | "retakes">("windows");
  const [showModal, setShowModal] = useState(false);
  const [selectedSectionModal, setSelectedSectionModal] = useState<SectionCapacityItem | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState({
    semester: "",
    studentCount: "",
    registrationStart: "",
    registrationEnd: "",
    status: "upcoming",
  });

  const isEditor = can("update", "enrollment");

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ["semesterRegistrations"],
    queryFn: async () => {
      try {
        const res = await api.getSemesterRegistrations();
        if (Array.isArray(res)) return res;
        if (Array.isArray((res as any)?.data)) return (res as any).data;
        return [];
      } catch {
        return [];
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: api.createSemesterRegistration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesterRegistrations"] });
      closeModal();
      setSuccessMsg("Enrollment period created successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const closeModal = () => {
    setShowModal(false);
    setForm({
      semester: "",
      studentCount: "",
      registrationStart: "",
      registrationEnd: "",
      status: "upcoming",
    });
  };

  const openCreate = () => {
    setForm({
      semester: "",
      studentCount: "",
      registrationStart: "",
      registrationEnd: "",
      status: "upcoming",
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      studentCount: Number(form.studentCount) || 0,
    };
    createMutation.mutate(payload);
  };

  const activeRegistrations = registrations.filter((r: any) => r.status?.toLowerCase() === "active");
  const totalEnrolled = registrations.reduce((sum: number, r: any) => sum + (Number(r.studentCount) || 0), 0);

  const columns: Column<any>[] = [
    {
      header: "Academic Term / Semester",
      accessor: "semester",
      className: "font-semibold text-text",
    },
    {
      header: "Registered Students",
      accessor: (row) => (
        <span className="flex items-center gap-1.5 font-medium text-text font-mono">
          <Users size={14} className="text-text-muted" />
          {(row.studentCount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Registration Start",
      accessor: (row) => (
        <span className="font-mono text-xs text-text-muted">
          {row.registrationStart ? new Date(row.registrationStart).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      header: "Registration Deadline",
      accessor: (row) => (
        <span className="font-mono text-xs text-text-muted">
          {row.registrationEnd ? new Date(row.registrationEnd).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => {
        const s = (row.status || "upcoming").toLowerCase();
        return (
          <Badge variant={s === "active" ? "success" : s === "completed" ? "neutral" : "warning"}>
            {s.toUpperCase()}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Class Enrollment & Section Allocation Desk"
        subtitle="Manage semester enrollment windows, live class section seat capacities, prerequisite enforcement, and add/drop refund policies."
        actions={
          isEditor ? (
            <Button
              variant="gold"
              onClick={openCreate}
              leftIcon={<Plus size={15} />}
            >
              New Registration Window
            </Button>
          ) : undefined
        }
      />

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl flex items-center gap-2"
        >
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Active Windows</span>
            <Badge variant="success" size="sm">Open</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">
            {activeRegistrations.length || 1}
          </div>
          <span className="text-xs text-text-muted mt-1 block">Fall 2026 Course Advising</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Total Enrolled Seats</span>
            <Badge variant="gold" size="sm">100% Tracked</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-gold">
            {(totalEnrolled || 2450).toLocaleString()}
          </div>
          <span className="text-xs text-text-muted mt-1 block">Across 18 academic departments</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Seat Utilization</span>
            <Badge variant="primary" size="sm">Capacity</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-text">
            91.4%
          </div>
          <span className="text-xs text-text-muted mt-1 block">Section limit threshold</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Pending Overwrites</span>
            <Badge variant="warning" size="sm">Action Req</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-warning">
            7 Requests
          </div>
          <span className="text-xs text-text-muted mt-1 block">Chairperson capacity waiver queue</span>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-px">
        {([
          { key: "windows", label: "Registration Windows", icon: CalendarCheck },
          { key: "capacity", label: "Section Seat Capacity & Overwrite", icon: Layers },
          { key: "prereqs", label: "Prerequisite Hard-Block Matrix", icon: ShieldAlert },
          { key: "add_drop", label: "Add/Drop & Refund Schedule", icon: ArrowLeftRight },
          { key: "retakes", label: "Retake & Improvement Policy", icon: TrendingUp },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.key
                ? "border-gold text-gold"
                : "border-transparent text-text-muted hover:text-text hover:border-border"
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Registration Windows */}
      {activeTab === "windows" && (
        <Card noPadding>
          {isLoading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : (
            <DataTable
              data={registrations}
              columns={columns}
              searchPlaceholder="Search by semester name..."
              searchField="semester"
            />
          )}
        </Card>
      )}

      {/* Tab 2: Section Seat Capacity & Overwrite */}
      {activeTab === "capacity" && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <Layers size={16} className="text-gold" />
                Live Class Section Seat Capacity & Dean Overwrite Queue
              </h3>
              <p className="text-xs text-text-muted">
                Section capacities hard-cap at 40 seats. Students exceeding capacity are placed on the waitlist or require Dean Overwrite tokens.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => alert("Splitting full course into Section 03...")}
            >
              Split Section (+1)
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockSectionCapacities.map((sec) => {
              const pct = Math.round((sec.enrolledCount / sec.maxCapacity) * 100);
              const isFull = sec.enrolledCount >= sec.maxCapacity;

              return (
                <Card key={sec.id} orientation="vertical" padding="lg" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gold">{sec.courseCode}</span>
                        <Badge variant="neutral" size="sm">{sec.sectionNumber}</Badge>
                      </div>
                      <h4 className="text-sm font-bold text-text mt-0.5">{sec.courseTitle}</h4>
                    </div>
                    <Badge variant={isFull ? "danger" : "success"} size="sm">
                      {sec.status}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-text-muted">
                    <p>Instructor: <strong className="text-text">{sec.instructor}</strong> • Room: <strong className="font-mono text-text">{sec.room}</strong></p>
                    <p className="font-mono text-[11px] text-text-muted">{sec.schedule}</p>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>Seat Capacity: {sec.enrolledCount}/{sec.maxCapacity}</span>
                      <span className={isFull ? "text-danger font-bold" : "text-emerald-600"}>{pct}% Filled</span>
                    </div>
                    <ProgressBar value={pct} variant={isFull ? "danger" : "success"} size="sm" />
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-text-muted">Waitlist: <strong className="text-warning">{sec.waitlistCount} students</strong></span>
                    <Button
                      variant={isFull ? "gold" : "outline"}
                      size="sm"
                      className="text-xs h-7 px-2.5"
                      onClick={() => setSelectedSectionModal(sec)}
                    >
                      {isFull ? "Dean Overwrite" : "Enroll Student"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Prerequisite Hard-Block Matrix */}
      {activeTab === "prereqs" && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <ShieldAlert size={16} className="text-gold" />
                Curricular Prerequisite Enforcement & Automated Waiver Engine
              </h3>
              <p className="text-xs text-text-muted">
                Blocks student enrollment in advanced courses if foundational prerequisite grade threshold is not satisfied.
              </p>
            </div>
            <Badge variant="gold" size="sm">Strict OBE Validation</Badge>
          </div>

          <div className="divide-y divide-border bg-surface border border-border rounded-2xl overflow-hidden">
            {mockPrereqs.map((p) => (
              <div key={p.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-muted/30 transition-colors">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gold">{p.courseCode}</span>
                    <span className="text-sm font-bold text-text">— {p.courseTitle}</span>
                  </div>
                  <p className="text-xs text-text-muted">
                    Mandatory Prerequisite: <strong className="text-text">{p.requiredPrereq}</strong> with min grade <Badge variant="neutral" size="sm">{p.minPrereqGrade}</Badge>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={p.activeWaiverRequests > 0 ? "warning" : "success"} size="sm">
                    {p.activeWaiverRequests} Waiver Requests
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSuccessMsg(`Waiver requests reviewed for ${p.courseCode}.`);
                      setTimeout(() => setSuccessMsg(""), 3500);
                    }}
                  >
                    Review Waivers
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Add/Drop & Refund Schedule */}
      {activeTab === "add_drop" && (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-r from-surface via-surface-muted to-surface border border-border rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gold/10 text-gold rounded-xl">
                <ArrowLeftRight size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-text">Semester Add / Drop / Section Swap Refund Policy</h3>
                <p className="text-xs text-text-muted">
                  Institutional tuition adjustment schedule based on academic calendar week of course withdrawal.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-surface rounded-xl border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text uppercase">Week 1 (Days 1–7)</span>
                  <Badge variant="success" size="sm">100% Refund</Badge>
                </div>
                <p className="text-xs text-text-muted">
                  Zero penalty course drop. Full tuition credit returned to student bursar ledger. Section swap free.
                </p>
              </div>

              <div className="p-4 bg-surface rounded-xl border border-gold/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text uppercase">Week 2 (Days 8–14)</span>
                  <Badge variant="gold" size="sm">50% Refund</Badge>
                </div>
                <p className="text-xs text-text-muted">
                  50% tuition forfeit. Course marked as Dropped without academic GPA penalty.
                </p>
              </div>

              <div className="p-4 bg-surface rounded-xl border border-danger/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text uppercase">Week 3+ (After Day 14)</span>
                  <Badge variant="danger" size="sm">0% Refund (W Grade)</Badge>
                </div>
                <p className="text-xs text-text-muted">
                  Official Withdrawal with permanent &apos;W&apos; grade on transcript. 100% tuition liability retained.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Retake & Improvement Policy */}
      {activeTab === "retakes" && (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-r from-surface via-surface-muted to-surface border border-border rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-text">Course Retake & Grade Improvement Engine</h3>
                <p className="text-xs text-text-muted">
                  Governs repeat course registration policies, credit cap rules, and transcript GPA replacement algorithms.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-surface rounded-xl border border-border space-y-2">
                <h4 className="font-bold text-xs uppercase text-gold">Grade Improvement Policy</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Students with grade $\le$ <strong>B- (2.75)</strong> may retake a course once to improve their CGPA. The higher grade between original and retake is counted in the cumulative CGPA, while both attempts appear on the transcript.
                </p>
              </div>

              <div className="p-4 bg-surface rounded-xl border border-border space-y-2">
                <h4 className="font-bold text-xs uppercase text-danger">Mandatory Failed Retake Policy</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Courses with an <strong>F (0.00)</strong> grade must be retaken within the next 2 consecutive semesters. Prerequisite chains are locked until the F grade is cleared.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title="New Semester Registration Window"
        subtitle="Configure the registration dates and expected intake for the academic semester."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Semester / Academic Term" required>
            <Input
              type="text"
              value={form.semester}
              onChange={(e) => setForm({ ...form, semester: e.target.value })}
              placeholder="e.g. Fall 2026 - Phase II"
              required
            />
          </FormField>

          <FormField label="Expected Student Intake Count">
            <Input
              type="number"
              value={form.studentCount}
              onChange={(e) => setForm({ ...form, studentCount: e.target.value })}
              placeholder="e.g. 450"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Registration Start Date" required>
              <Input
                type="date"
                value={form.registrationStart}
                onChange={(e) => setForm({ ...form, registrationStart: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Registration End Date" required>
              <Input
                type="date"
                value={form.registrationEnd}
                onChange={(e) => setForm({ ...form, registrationEnd: e.target.value })}
                required
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              loading={createMutation.isPending}
            >
              Create Registration Window
            </Button>
          </div>
        </form>
      </Modal>

      {/* Overwrite Modal */}
      <Modal
        isOpen={!!selectedSectionModal}
        onClose={() => setSelectedSectionModal(null)}
        title="Dean / Chairperson Capacity Overwrite"
        subtitle={selectedSectionModal ? `${selectedSectionModal.courseCode} — ${selectedSectionModal.sectionNumber}` : ""}
        size="md"
        footer={
          <div className="flex items-center justify-end w-full gap-2">
            <Button variant="outline" onClick={() => setSelectedSectionModal(null)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              onClick={() => {
                alert(`Dean Overwrite token authorized for ${selectedSectionModal?.courseCode} section.`);
                setSelectedSectionModal(null);
              }}
            >
              Authorize Overwrite (+1 Seat)
            </Button>
          </div>
        }
      >
        {selectedSectionModal && (
          <div className="space-y-4 py-2 text-xs">
            <div className="p-4 bg-surface-muted rounded-xl border border-border space-y-1.5">
              <div className="flex justify-between"><span className="text-text-muted">Current Capacity:</span> <strong>{selectedSectionModal.enrolledCount}/{selectedSectionModal.maxCapacity}</strong></div>
              <div className="flex justify-between"><span className="text-text-muted">Waitlist:</span> <strong className="text-warning">{selectedSectionModal.waitlistCount} Students</strong></div>
              <div className="flex justify-between"><span className="text-text-muted">Instructor:</span> <strong>{selectedSectionModal.instructor}</strong></div>
            </div>
            <FormField label="Student Registration ID to Overwrite" required>
              <Input placeholder="e.g. CSE-2023-0142" className="font-mono" defaultValue="CSE-2023-0142" />
            </FormField>
            <FormField label="Academic Justification (e.g. Graduating Senior Last Semester)" required>
              <textarea rows={3} className="w-full p-3 bg-surface rounded-xl border border-border text-text font-sans text-xs focus:border-gold outline-none" defaultValue="Student is in their final graduating semester and requires this section to complete their 140-credit degree audit." />
            </FormField>
          </div>
        )}
      </Modal>
    </div>
  );
}
