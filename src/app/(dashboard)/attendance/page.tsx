"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ClipboardList,
  UserCheck,
  Plus,
  Calendar,
  Edit2,
  Trash2,
  ShieldAlert,
  Fingerprint,
  Radio,
  Sliders,
  AlertTriangle,
  Stethoscope,
  HeartPulse,
  FileText,
  FileCheck,
  ShieldCheck,
  Lock,
  Unlock,
  Printer,
  QrCode,
  Sparkles,
  Download,
} from "lucide-react";
import {
  PageHeader,
  Card,
  Modal,
  FormField,
  Input,
  Select,
  Textarea,
  Button,
  IconButton,
  Badge,
  ProgressBar,
} from "@/components/ui";

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: string;
  course: string;
  type: "Theory (1h)" | "Laboratory (3h)";
}

interface StudentAttendanceSummary {
  studentId: string;
  studentName: string;
  course: string;
  totalClasses: number;
  attendedClasses: number;
  excusedMedicalClasses: number;
  rawPercentage: number;
  adjustedPercentage: number;
  status: "Collegiate (>=75%)" | "Non-Collegiate (60-74%)" | "Dis-Collegiate (<60%)";
  fineAmount: number;
  medicalExemptionApproved: boolean;
  medicalDossier?: {
    formId: string;
    diagnosis: string;
    hospitalName: string;
    admissionDates: string;
    doctorName: string;
    signedByCmo: boolean;
  };
}

const mockSummaries: StudentAttendanceSummary[] = [
  {
    studentId: "CSE-2023-0142",
    studentName: "Tahmid Hasan",
    course: "CSE110 (Programming I)",
    totalClasses: 28,
    attendedClasses: 27,
    excusedMedicalClasses: 0,
    rawPercentage: 96.4,
    adjustedPercentage: 96.4,
    status: "Collegiate (>=75%)",
    fineAmount: 0,
    medicalExemptionApproved: false,
  },
  {
    studentId: "CSE-2023-0143",
    studentName: "Nafis Fuad",
    course: "CSE110 (Programming I)",
    totalClasses: 28,
    attendedClasses: 20,
    excusedMedicalClasses: 0,
    rawPercentage: 71.4,
    adjustedPercentage: 71.4,
    status: "Non-Collegiate (60-74%)",
    fineAmount: 1000,
    medicalExemptionApproved: false,
  },
  {
    studentId: "CSE-2023-0144",
    studentName: "Rifat Chowdhury",
    course: "CSE110 (Programming I)",
    totalClasses: 28,
    attendedClasses: 15,
    excusedMedicalClasses: 0,
    rawPercentage: 53.6,
    adjustedPercentage: 53.6,
    status: "Dis-Collegiate (<60%)",
    fineAmount: 0,
    medicalExemptionApproved: false,
  },
  {
    studentId: "MED-2024-0089",
    studentName: "Tahmina Akter",
    course: "MBBS-201 (Pathology & Micro)",
    totalClasses: 70,
    attendedClasses: 38,
    excusedMedicalClasses: 20,
    rawPercentage: 54.2,
    adjustedPercentage: 76.0,
    status: "Collegiate (>=75%)",
    fineAmount: 0,
    medicalExemptionApproved: true,
    medicalDossier: {
      formId: "FORM-MED-EX-09",
      diagnosis: "Severe Dengue Hemorrhagic Fever with Thrombocytopenia",
      hospitalName: "Evercare Hospital Clinical ICU",
      admissionDates: "2026-09-02 to 2026-09-22 (Weeks 7–9)",
      doctorName: "Prof. Dr. Tariq Rahman (Chief Medical Officer)",
      signedByCmo: true,
    },
  },
];

export default function AttendancePage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const canMarkAttendance = roleIs("super-admin", "domain-admin", "faculty");
  const [activeTab, setActiveTab] = useState<"mark" | "ugc_compliance" | "medical_exemption" | "report" | "biometric">("mark");
  const [summaries, setSummaries] = useState<StudentAttendanceSummary[]>(mockSummaries);
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExemptionModalOpen, setIsExemptionModalOpen] = useState(false);
  const [selectedExemptionTarget, setSelectedExemptionTarget] = useState<StudentAttendanceSummary | null>(null);

  const [newAttendance, setNewAttendance] = useState({
    studentId: "",
    studentName: "",
    course: "",
    date: new Date().toISOString().split("T")[0],
    status: "present",
    type: "Theory (1h)",
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery<any[]>({
    queryKey: ["students"],
    queryFn: api.getStudents,
  });

  const { data: attendanceRecords = [], isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ["attendanceRecords"],
    queryFn: api.getAttendanceRecords,
  });

  const markAttendanceMutation = useMutation({
    mutationFn: api.markAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendanceRecords"] });
      setSuccessMsg("Attendance submitted successfully.");
      setSelectedStatuses({});
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const createAttendanceMutation = useMutation({
    mutationFn: api.markAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendanceRecords"] });
      setSuccessMsg("Attendance entry created successfully.");
      setIsModalOpen(false);
      setNewAttendance({
        studentId: "",
        studentName: "",
        course: "",
        date: new Date().toISOString().split("T")[0],
        status: "present",
        type: "Theory (1h)",
      });
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleAddAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    createAttendanceMutation.mutate(newAttendance);
  };

  const handleBulkMark = () => {
    const entries = Object.entries(selectedStatuses).filter(([_, s]) => s);
    if (entries.length === 0) return;
    entries.forEach(([studentId, status]) => {
      const student = students.find((s) => s.id === studentId || s.studentId === studentId);
      markAttendanceMutation.mutate({
        studentId,
        studentName: student?.name || "",
        date: new Date().toISOString().split("T")[0],
        status,
        course: "CSE110",
      });
    });
  };

  // Grant Medical Exemption
  const handleApproveMedicalExemption = (studentId: string) => {
    setSummaries((prev) =>
      prev.map((s) => {
        if (s.studentId === studentId) {
          const excused = 10;
          const adj = Math.round((s.attendedClasses / (s.totalClasses - excused)) * 1000) / 10;
          return {
            ...s,
            excusedMedicalClasses: excused,
            adjustedPercentage: adj,
            status: adj >= 75 ? ("Collegiate (>=75%)" as const) : adj >= 60 ? ("Non-Collegiate (60-74%)" as const) : ("Dis-Collegiate (<60%)" as const),
            medicalExemptionApproved: true,
            medicalDossier: {
              formId: "FORM-MED-EX-10",
              diagnosis: "Acute Viral Illness & Hospitalization",
              hospitalName: "University Teaching Hospital",
              admissionDates: "2026-09-10 to 2026-09-20",
              doctorName: "Chief Medical Officer",
              signedByCmo: true,
            },
          };
        }
        return s;
      })
    );
    setSuccessMsg(`Medical exemption granted for ${studentId}. Adjusted divisor recalculated, admit card unlocked.`);
    setSelectedExemptionTarget(null);
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  const uniqueCourses = [...new Set(attendanceRecords.map((r) => r.course))].sort();
  const filteredRecords = courseFilter
    ? attendanceRecords.filter((r) => r.course === courseFilter)
    : attendanceRecords;

  const reportColumns: Column<AttendanceRecord>[] = [
    {
      header: "Student Name",
      accessor: "studentName",
      className: "font-semibold text-text",
    },
    {
      header: "Student ID",
      accessor: (row) => <span className="font-mono text-text-muted">{row.studentId}</span>,
    },
    {
      header: "Date",
      accessor: (row) => <span className="font-mono text-text-muted">{row.date}</span>,
    },
    {
      header: "Course & Type",
      accessor: (row) => <span className="font-mono text-text">{row.course}</span>,
    },
    {
      header: "Status",
      accessor: (row) => (
        <Badge variant={row.status === "present" ? "success" : row.status === "late" ? "warning" : "danger"} size="sm">
          {row.status.toUpperCase()}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Lecture & Lab Attendance Sentinel"
        subtitle="Live class attendance marking, biometric RFID turnstile sync, UGC 75% collegiate compliance rules, and statutory medical exemption protocols."
        actions={
          canMarkAttendance ? (
            <div className="flex items-center gap-2">
              <Button
                variant="gold"
                size="md"
                onClick={() => setIsModalOpen(true)}
                leftIcon={<Plus size={15} />}
              >
                Log Attendance
              </Button>
            </div>
          ) : undefined
        }
      />

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-semibold rounded-xl flex items-center gap-2"
        >
          <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Average Attendance</span>
            <Badge variant="success" size="sm">Active Cohort</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            87.4%
          </div>
          <span className="text-xs text-text-muted mt-1 block">Fall 2026 overall average</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Collegiate (≥ 75%)</span>
            <Badge variant="success" size="sm">Exam Eligible</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-text">
            91.2% <span className="text-xs font-normal text-text-muted">Students</span>
          </div>
          <span className="text-xs text-text-muted mt-1 block">Admit Card Auto-Issued</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Non-Collegiate</span>
            <Badge variant="warning" size="sm">৳ 1,000 Fine</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-warning">
            6.5% <span className="text-xs font-normal text-text-muted">Students</span>
          </div>
          <span className="text-xs text-text-muted mt-1 block">60%–74% attendance band</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Dis-Collegiate</span>
            <Badge variant="danger" size="sm">Exam Debarred</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-danger">
            2.3% <span className="text-xs font-normal text-text-muted">Students</span>
          </div>
          <span className="text-xs text-text-muted mt-1 block">&lt; 60% mandatory course repeat</span>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-px">
        {([
          { key: "mark", label: "Mark Today's Session", icon: UserCheck },
          { key: "ugc_compliance", label: "UGC 75% Compliance & Fines", icon: ShieldAlert },
          { key: "medical_exemption", label: "Medical Exemption Protocol (Form 09)", icon: Stethoscope },
          { key: "report", label: "Historical Attendance Logs", icon: ClipboardList },
          { key: "biometric", label: "RFID & Biometric Telemetry", icon: Fingerprint },
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

      {/* Tab 1: Mark Today */}
      {activeTab === "mark" && (
        <Card noPadding>
          <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck size={15} /> Class Roster — {new Date().toLocaleDateString("en-US", { dateStyle: "long" })}
            </span>
            <Badge variant="gold" size="sm">CSE110 (Section 01)</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted/50 border-b border-border">
                  <th className="p-3.5 text-xs font-bold text-text-muted uppercase">Student Name</th>
                  <th className="p-3.5 text-xs font-bold text-text-muted uppercase">Registration ID</th>
                  <th className="p-3.5 text-xs font-bold text-text-muted uppercase w-52">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {studentsLoading ? (
                  <tr><td colSpan={3} className="p-6 text-center text-text-muted">Loading roster...</td></tr>
                ) : (
                  students.map((student) => {
                    const currentStatus = selectedStatuses[student.studentId || student.id] || "";
                    return (
                      <tr key={student.id || student.studentId} className="hover:bg-surface-muted/30">
                        <td className="p-3.5 font-semibold text-text">{student.name}</td>
                        <td className="p-3.5 font-mono text-text-muted">{student.studentId || student.id}</td>
                        <td className="p-3.5">
                          <Select
                            value={currentStatus}
                            onChange={(e) =>
                              setSelectedStatuses((prev) => ({
                                ...prev,
                                [student.studentId || student.id]: e.target.value,
                              }))
                            }
                            className="h-8 text-xs"
                          >
                            <option value="">— Select Status —</option>
                            <option value="present">Present (On Time)</option>
                            <option value="late">Late Arrival (&lt;15 min)</option>
                            <option value="absent">Absent (Unexcused)</option>
                          </Select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-border flex justify-end gap-3">
            <Button
              variant="gold"
              onClick={handleBulkMark}
              disabled={Object.values(selectedStatuses).filter(Boolean).length === 0 || markAttendanceMutation.isPending}
              leftIcon={<CheckCircle2 size={15} />}
            >
              {markAttendanceMutation.isPending ? "Submitting..." : `Submit Attendance Roster (${Object.values(selectedStatuses).filter(Boolean).length}/${students.length})`}
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 2: UGC 75% Compliance & Fines */}
      {activeTab === "ugc_compliance" && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <ShieldAlert size={16} className="text-gold" />
                UGC Statutory 75% Collegiate Attendance Sentinel & Fine Calculation
              </h3>
              <p className="text-xs text-text-muted">
                Governs semester examination eligibility. Automatically flags Non-Collegiate (৳ 1,000 fine) and Dis-Collegiate debarment.
              </p>
            </div>
            <Badge variant="gold" size="sm">Rule 14-A Active</Badge>
          </div>

          <div className="divide-y divide-border bg-surface border border-border rounded-2xl overflow-hidden">
            {summaries.map((sum) => (
              <div key={sum.studentId} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-muted/30 transition-colors">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-gold text-sm">{sum.studentId}</span>
                    <span className="font-bold text-text text-sm">{sum.studentName}</span>
                    <Badge
                      variant={
                        sum.status.includes("Collegiate (") ? "success" : sum.status.includes("Non-Collegiate") ? "warning" : "danger"
                      }
                      size="sm"
                    >
                      {sum.status}
                    </Badge>
                    {sum.medicalExemptionApproved && (
                      <Badge variant="primary" size="sm" className="flex items-center gap-1">
                        <Stethoscope size={11} />
                        <span>Med-Exempted (Form 09)</span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-text-muted">
                    Course: <strong className="text-text">{sum.course}</strong> • Attended: <strong className="font-mono text-text">{sum.attendedClasses}/{sum.totalClasses} Classes</strong>
                    {sum.excusedMedicalClasses > 0 ? (
                      <span> (Raw: {sum.rawPercentage}% ➔ Adjusted: <strong className="text-emerald-600 font-bold">{sum.adjustedPercentage}%</strong>)</span>
                    ) : (
                      <span> ({sum.rawPercentage.toFixed(1)}%)</span>
                    )}
                  </p>
                  <div className="w-56 pt-1">
                    <ProgressBar
                      value={sum.adjustedPercentage}
                      variant={sum.adjustedPercentage >= 75 ? "success" : sum.adjustedPercentage >= 60 ? "warning" : "danger"}
                      size="xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {sum.fineAmount > 0 && (
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-text-muted font-bold block">Non-Collegiate Fine</span>
                      <span className="font-mono font-bold text-warning text-base">৳{sum.fineAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {sum.adjustedPercentage < 60 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="danger" size="md">
                        DEBARRED FROM EXAM
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedExemptionTarget(sum)}
                        leftIcon={<Stethoscope size={13} />}
                      >
                        File Exemption
                      </Button>
                    </div>
                  )}
                  {sum.adjustedPercentage >= 75 && (
                    <Badge variant="success" size="sm" className="flex items-center gap-1">
                      <ShieldCheck size={13} />
                      <span>Admit Card Unlocked</span>
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Medical Exemption Protocol (Form Med-Ex-09) */}
      {activeTab === "medical_exemption" && (
        <div className="space-y-6">
          <Card pad="md" className="border-emerald-500/30 bg-emerald-500/5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <Stethoscope size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text">Chief Medical Officer (CMO) Statutory Exemption Protocol</h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    Governed under University Academic Senate Resolution (Form Med-Ex-09). Deducts certified hospital admission hours from attendance denominator.
                  </p>
                </div>
              </div>
              <Badge variant="success">Adjusted Divisor Recalculator Active</Badge>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border text-xs space-y-2">
              <div className="font-mono font-bold text-text text-sm">
                Adjusted Formula: Score % = Attended Hours / (Total Contact Hours − Excused Medical Hours)
              </div>
              <p className="text-text-muted">
                Protects candidates hospitalized due to dengue, accidents, or acute surgery without lowering university academic rigor. Automatically restores biometric turnstile access within 60 seconds.
              </p>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summaries
              .filter((s) => s.medicalDossier)
              .map((s) => (
                <Card key={s.studentId} pad="md" className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-text">{s.studentName}</h4>
                      <p className="text-xs text-text-muted font-mono">{s.studentId} • {s.course}</p>
                    </div>
                    <Badge variant="success" size="sm">{s.medicalDossier?.formId}</Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-muted/50 border border-border space-y-1.5 text-xs">
                    <div>
                      <span className="text-text-muted block text-[10px]">Clinical Diagnosis:</span>
                      <span className="font-semibold text-text">{s.medicalDossier?.diagnosis}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[10px]">Hospital & Admission Window:</span>
                      <span className="text-text">{s.medicalDossier?.hospitalName} ({s.medicalDossier?.admissionDates})</span>
                    </div>
                    <div className="pt-1 border-t border-border/60 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-600 font-medium">Attending: {s.medicalDossier?.doctorName}</span>
                      <Badge variant="gold" size="sm">CMO Verified</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-text-muted">Adjusted Score: <strong className="text-emerald-600 font-bold">{s.adjustedPercentage}%</strong></span>
                    <Badge variant="success" size="sm">Admit Card Unlocked</Badge>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Tab 4: Report Logs */}
      {activeTab === "report" && (
        <Card noPadding>
          <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardList size={15} /> Historical Attendance Log
            </span>
            {uniqueCourses.length > 0 && (
              <div className="w-48">
                <Select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="h-8 text-xs"
                >
                  <option value="">All Courses</option>
                  {uniqueCourses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={5} cols={5} />
            </div>
          ) : (
            <DataTable<AttendanceRecord>
              data={filteredRecords}
              columns={reportColumns}
              searchPlaceholder="Search by student name..."
              searchField="studentName"
            />
          )}
        </Card>
      )}

      {/* Tab 5: Biometric & RFID Turnstile Sync */}
      {activeTab === "biometric" && (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-r from-surface via-surface-muted to-surface border border-border rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gold/10 text-gold rounded-xl">
                <Fingerprint size={26} />
              </div>
              <div>
                <h3 className="text-base font-bold text-text">IoT RFID & Biometric Turnstile Telemetry Engine</h3>
                <p className="text-xs text-text-muted">
                  Automated synchronization from classroom biometric scanners and building turnstiles directly into academic lecture attendance logs.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-surface rounded-xl border border-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text">Scanner 01: Lab 402</span>
                  <Badge variant="success" size="sm">Online</Badge>
                </div>
                <p className="text-xs text-text-muted">Synced 40 RFID taps today @ 08:32 AM</p>
              </div>

              <div className="p-4 bg-surface rounded-xl border border-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text">Scanner 02: Aud 1</span>
                  <Badge variant="success" size="sm">Online</Badge>
                </div>
                <p className="text-xs text-text-muted">Synced 120 RFID taps today @ 10:15 AM</p>
              </div>

              <div className="p-4 bg-surface rounded-xl border border-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text">Scanner 03: Library</span>
                  <Badge variant="success" size="sm">Online</Badge>
                </div>
                <p className="text-xs text-text-muted">Synced 240 RFID taps today @ 11:45 AM</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medical Exemption Modal */}
      {selectedExemptionTarget && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedExemptionTarget(null)}
          title={`File Medical Exemption: ${selectedExemptionTarget.studentName}`}
          description={`Student ID #${selectedExemptionTarget.studentId} • Current Attendance: ${selectedExemptionTarget.rawPercentage}%`}
          size="md"
        >
          <div className="space-y-4">
            <FormField label="Clinical Diagnosis" required>
              <Input defaultValue="Acute Viral Infection & Hospital Admission" required />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Hospital / Clinic" required>
                <Input defaultValue="University Teaching Hospital" required />
              </FormField>
              <FormField label="Excused Contact Hours" required>
                <Input type="number" defaultValue="10" required />
              </FormField>
            </div>
            <FormField label="Chief Medical Officer Sign-off" required>
              <Input defaultValue="Dr. Tariq Rahman, Chief Medical Officer" readOnly />
            </FormField>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button variant="outline" onClick={() => setSelectedExemptionTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="gold"
                onClick={() => handleApproveMedicalExemption(selectedExemptionTarget.studentId)}
                leftIcon={<ShieldCheck size={14} />}
              >
                Approve & Unlock Admit Card
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Manual Entry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Manual Attendance Log"
        subtitle="Register an individual session attendance record"
        size="md"
      >
        <form onSubmit={handleAddAttendance} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Student Registration ID" required>
              <Input
                value={newAttendance.studentId}
                onChange={(e) => setNewAttendance((p) => ({ ...p, studentId: e.target.value }))}
                placeholder="e.g. CSE-2023-0142"
                className="font-mono"
                required
              />
            </FormField>
            <FormField label="Student Full Name" required>
              <Input
                value={newAttendance.studentName}
                onChange={(e) => setNewAttendance((p) => ({ ...p, studentName: e.target.value }))}
                placeholder="Candidate name"
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Course Code" required>
              <Input
                value={newAttendance.course}
                onChange={(e) => setNewAttendance((p) => ({ ...p, course: e.target.value }))}
                placeholder="e.g. CSE110"
                className="font-mono"
                required
              />
            </FormField>
            <FormField label="Date" required>
              <Input
                type="date"
                value={newAttendance.date}
                onChange={(e) => setNewAttendance((p) => ({ ...p, date: e.target.value }))}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Status" required>
              <Select
                value={newAttendance.status}
                onChange={(e) => setNewAttendance((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="present">Present (On Time)</option>
                <option value="late">Late Arrival</option>
                <option value="absent">Absent</option>
              </Select>
            </FormField>

            <FormField label="Contact Multiplier" required>
              <Select
                value={newAttendance.type}
                onChange={(e) => setNewAttendance((p) => ({ ...p, type: e.target.value as any }))}
              >
                <option value="Theory (1h)">Theory (1h Contact)</option>
                <option value="Laboratory (3h)">Laboratory (3h Contact)</option>
              </Select>
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              disabled={createAttendanceMutation.isPending}
              leftIcon={<Plus size={14} />}
            >
              {createAttendanceMutation.isPending ? "Adding..." : "Log Attendance"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
