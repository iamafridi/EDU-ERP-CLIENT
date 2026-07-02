"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import {
  ChevronLeft,
  User,
  BookOpen,
  Home,
  AlertCircle,
  Edit,
  Save,
  ShieldCheck,
  CreditCard,
  GraduationCap,
  Calendar,
  Clock,
  QrCode,
  DollarSign,
  FileText,
  Printer,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Building2,
  Users,
  ShieldAlert,
  Award,
  Layers,
  Percent,
  Lock,
  RefreshCw,
  Hash,
  Scale,
  MapPin,
  UtensilsCrossed,
  Receipt,
  Download,
} from "lucide-react";
import { ProfileSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { showToast } from "@/components/dashboard/ToastFeedback";
import {
  PageHeader,
  Card,
  Badge,
  Button,
  ProgressBar,
  Modal,
  FormField,
  Input,
  Select,
} from "@/components/ui";

type DossierTab =
  | "overview"
  | "academics"
  | "financials"
  | "admissions_vault"
  | "exams_seating"
  | "zero_dues"
  | "disciplinary"
  | "hostel_mess";

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const studentId = (params.id as string) || "STU-2026-001";
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const [activeTab, setActiveTab] = useState<DossierTab>("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Live Cross-Module Event Mesh Simulation States
  const [simulatedFinancialHold, setSimulatedFinancialHold] = useState(false);
  const [simulatedDisciplinaryHold, setSimulatedDisciplinaryHold] = useState(false);
  const [simulatedLibraryHold, setSimulatedLibraryHold] = useState(false);
  const [simulatedCgpa, setSimulatedCgpa] = useState(3.88);
  const [simulatedStanding, setSimulatedStanding] = useState<"Dean's Honor List" | "Good Standing" | "Academic Probation">("Dean's Honor List");
  const [simulatedEarnedCredits, setSimulatedEarnedCredits] = useState(132);
  const [simulatedAdmitCardValid, setSimulatedAdmitCardValid] = useState(true);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: api.getStudents,
  });

  const rawStudent = students.find(
    (s: any) => s.studentId === studentId || s.id === studentId
  );

  // High-Fidelity 360 Living Dossier Data Model
  const dossier = {
    id: rawStudent?.id || "STU-2026-001",
    studentId: rawStudent?.studentId || studentId,
    name: typeof rawStudent?.name === "string" ? rawStudent.name : "Marcus Chen",
    matriculationNo: "MBBS-2023-1-GEN-0142",
    rfidUid: "E2003412017",
    department: rawStudent?.academicDepartment || "Bachelor of Medicine & Surgery (MBBS)",
    currentSemester: rawStudent?.academicSemester || "Year 4 (Term 1)",
    email: rawStudent?.email || "m.chen@medical.edu",
    contactNo: rawStudent?.contactNo || "+880 1711-234567",
    gender: rawStudent?.gender || "Male",
    bloodGroup: "O+ Positive",
    dob: "2003-08-14",
    guardianName: "Richard Chen (Father)",
    guardianContact: "+880 1819-887766",
    admissionQuota: "General Open Merit (Top 2%)",
    compositeMeritScore: 97.4,
    vaultShelfId: "VAULT-RACK-04-SHELF-B",
    originalCertificatesSurrendered: ["HSC Main Marksheet", "SSC Certificate", "Migration NOC"],
    scholarshipWaiverPct: 20,
    totalBilledTuition: 185000,
    totalPaidTuition: 155000,
    outstandingDue: 30000,
    lateFinesAccumulated: 800,
    roomNumber: rawStudent?.roomNumber || "DORM-304",
    hallName: "Shahid Dr. Milan Medical Hall",
    messSubscription: "Halal Full Board (3 Meals/Day)",
    attendancePercentage: 88.4,
    attendanceCollegiateStatus: "Collegiate (Eligible)",
    enrolledCourses: [
      { code: "PATH-401", title: "Systemic Pathology & Autopsy Lab", credits: 4, schedule: "Sun/Tue 09:30 AM", room: "Lab 3", attendance: 92 },
      { code: "PHARM-402", title: "Clinical Pharmacology & Prescribing", credits: 4, schedule: "Mon/Wed 11:00 AM", room: "Gallery 1", attendance: 86 },
      { code: "SURG-401", title: "General Surgery & Clinical Rounds", credits: 5, schedule: "Daily 08:00 AM", room: "Ward 4", attendance: 90 },
      { code: "MED-402", title: "Internal Medicine & Ward Clerkship", credits: 5, schedule: "Daily 02:00 PM", room: "Ward 2", attendance: 85 },
    ],
    examSeating: {
      hall: "Central Auditorium (Hall A)",
      seatNumber: "A-01",
      row: "A",
      col: 1,
      leftNeighbor: "PHARM-302 (Pharmacy)",
      rightNeighbor: "CSE-411 (Computer Science)",
    },
    zeroDuesChecklist: {
      accountsCleared: true,
      libraryCleared: true,
      hallProvostCleared: true,
      clinicalLabsCleared: true,
      proctorCleared: true,
    },
    disciplinarySanctions: [],
  };

  // Event Mesh Cascade Handlers
  const handleSimulateFeeDefault = () => {
    setSimulatedFinancialHold(true);
    setSimulatedAdmitCardValid(false);
    setSuccessMsg("EVENT MESH TRIGGERED: Fee default recorded -> Financial Registration Hold activated -> Exam Admit Card QR revoked -> Hall Gate scanner set to DENIED.");
    setTimeout(() => setSuccessMsg(""), 6000);
  };

  const handleSimulateFeePayment = () => {
    setSimulatedFinancialHold(false);
    setSimulatedAdmitCardValid(true);
    setSuccessMsg("EVENT MESH TRIGGERED: Payment received via bKash Gateway -> General Ledger posted -> Financial Hold evaporated -> Admit Card QR restored.");
    setTimeout(() => setSuccessMsg(""), 6000);
  };

  const handleSimulateCoEResultSealing = () => {
    const newCredits = 148;
    setSimulatedEarnedCredits(newCredits);
    setSimulatedCgpa(3.92);
    setSimulatedStanding("Dean's Honor List");
    setSuccessMsg(`EVENT MESH TRIGGERED: CoE Digitally Sealed MTS -> Total credits reached ${newCredits} (>= 140 Cr) -> Graduating status confirmed -> 5-Point Zero-Dues Clearance Dossier spawned -> Convocation Gown Token minted!`);
    setTimeout(() => setSuccessMsg(""), 6500);
  };

  const handleSimulateDisciplinaryFlag = () => {
    setSimulatedDisciplinaryHold(true);
    setSuccessMsg("EVENT MESH TRIGGERED: Proctorial Tribunal Sanction -> Advising lock activated -> Hall gate access restricted.");
    setTimeout(() => setSuccessMsg(""), 6000);
  };

  const handleClearDisciplinary = () => {
    setSimulatedDisciplinaryHold(false);
    setSuccessMsg("EVENT MESH TRIGGERED: Proctorial pardon ratified by Syndicate -> Behavioral clearance restored.");
    setTimeout(() => setSuccessMsg(""), 6000);
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  const hasAnyActiveHold = simulatedFinancialHold || simulatedDisciplinaryHold || simulatedLibraryHold;

  return (
    <div className="space-y-6 font-sans max-w-7xl pb-16">
      {/* Top Breadcrumb & PageHeader */}
      <PageHeader
        title={dossier.name}
        subtitle={`360° Unified Student Operational Dossier • ${dossier.department} • Matriculation: ${dossier.matriculationNo}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer size={14} />}
              onClick={() => window.print()}
            >
              Print Full Dossier
            </Button>
            <Button
              variant="gold"
              size="sm"
              leftIcon={<Sparkles size={14} />}
              onClick={() => setActiveTab("overview")}
            >
              Dossier Overview
            </Button>
          </div>
        }
      />

      {/* Success Notification */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2.5 shadow-md"
        >
          <Sparkles size={18} className="text-emerald-500 shrink-0 animate-pulse" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Active Operational Holds Interceptor Banner */}
      {hasAnyActiveHold && (
        <div className="p-4 bg-rose-500/10 border-2 border-rose-500/40 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
            <ShieldAlert size={18} />
            <span>CRITICAL OPERATIONAL INTERCEPT: ACTIVE REGISTRATION &amp; GATE HOLDS</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {simulatedFinancialHold && (
              <Badge variant="danger" size="sm">
                FINANCIAL HOLD: Tranche 3 Tuition Overdue (Advising &amp; Admit Card Locked)
              </Badge>
            )}
            {simulatedDisciplinaryHold && (
              <Badge variant="danger" size="sm">
                PROCTORIAL HOLD: Disciplinary Inquiry Active
              </Badge>
            )}
            {simulatedLibraryHold && (
              <Badge variant="warning" size="sm">
                LIBRARY HOLD: 1 Unreturned Clinical Atlas
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Student Master Profile Card */}
      <Card pad="lg" className="border-gold/30 bg-gradient-to-br from-surface via-surface to-surface-muted/40 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold to-gold-hover text-white flex items-center justify-center font-bold text-3xl shadow-gold shrink-0">
              {dossier.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-xs text-gold px-2.5 py-0.5 bg-gold/10 rounded-full border border-gold/30">
                  {dossier.matriculationNo}
                </span>
                <Badge variant={simulatedStanding.includes("Honor") ? "gold" : "success"} size="sm">
                  {simulatedStanding}
                </Badge>
                <Badge variant={dossier.attendanceCollegiateStatus.includes("Eligible") ? "success" : "warning"} size="sm">
                  {dossier.attendancePercentage}% Attendance ({dossier.attendanceCollegiateStatus})
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-text font-heading">{dossier.name}</h2>
              <p className="text-xs text-text-muted flex flex-wrap items-center gap-2">
                <span>{dossier.department}</span>
                <span>•</span>
                <span className="font-mono font-semibold text-text">{dossier.currentSemester}</span>
                <span>•</span>
                <span className="font-mono text-text-muted">RFID: {dossier.rfidUid}</span>
              </p>
            </div>
          </div>

          {/* Quick Stat Pill Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-muted/60 p-3.5 rounded-xl border border-border text-xs">
            <div>
              <span className="text-[10px] text-text-muted uppercase font-semibold block">Cumulative CGPA</span>
              <span className="font-mono text-lg font-bold text-gold">{simulatedCgpa.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase font-semibold block">Credits Earned</span>
              <span className="font-mono text-lg font-bold text-text">{simulatedEarnedCredits} / 140</span>
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase font-semibold block">Outstanding Due</span>
              <span className={`font-mono text-lg font-bold ${simulatedFinancialHold ? "text-danger" : "text-emerald-600"}`}>
                {simulatedFinancialHold ? "৳ 30,800" : "৳ 0"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase font-semibold block">Admit Card Gate</span>
              <span className={`font-mono text-xs font-bold block mt-1 ${simulatedAdmitCardValid ? "text-emerald-600" : "text-danger"}`}>
                {simulatedAdmitCardValid ? "✓ VALID TOKEN" : "✕ REVOKED"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Interactive Cross-Module Event Mesh Simulator Box */}
      <Card pad="md" className="border-primary/30 bg-primary/5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <RefreshCw size={16} className="text-primary animate-spin" />
            <h4 className="text-xs font-bold text-text uppercase tracking-wider">
              Cross-Module Event Mesh Interactive Simulator (Live ERP Triggers)
            </h4>
          </div>
          <Badge variant="primary" size="sm">Real-Time State Cascade</Badge>
        </div>
        <p className="text-[11px] text-text-muted">
          Trigger simulated university operational events to watch real-time state cascades across Treasury, Advising, Admit Gates, and Graduation Sentinels.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSimulateFeeDefault}
            className="text-xs text-danger hover:bg-danger/10"
          >
            Simulate Tranche 3 Default (Lock Gates)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSimulateFeePayment}
            className="text-xs text-emerald-600 hover:bg-emerald-500/10"
          >
            Simulate bKash Payment (Lift Holds)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSimulateCoEResultSealing}
            className="text-xs text-gold hover:bg-gold/10"
          >
            Simulate CoE Tabulation Sealing (Graduate Student)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={simulatedDisciplinaryHold ? handleClearDisciplinary : handleSimulateDisciplinaryFlag}
            className="text-xs"
          >
            {simulatedDisciplinaryHold ? "Pardon Disciplinary Hold" : "Simulate Proctorial Sanction"}
          </Button>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-px">
        {([
          { key: "overview", label: "Executive Summary", icon: Sparkles },
          { key: "academics", label: "Academic Progress & Prereqs", icon: BookOpen },
          { key: "financials", label: "Treasury & Installments", icon: DollarSign },
          { key: "admissions_vault", label: "Admissions & Document Vault", icon: ShieldCheck },
          { key: "exams_seating", label: "Exam Seating & Admit Gate", icon: QrCode },
          { key: "zero_dues", label: "5-Point Zero-Dues Tree", icon: GraduationCap },
          { key: "disciplinary", label: "Proctorial Governance", icon: Scale },
          { key: "hostel_mess", label: "Hostel & Halal Mess", icon: Home },
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

      {/* Tab 1: Executive Summary */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card orientation="vertical" padding="lg" className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text">Primary Student Bio &amp; Registry</h4>
            <div className="divide-y divide-border text-xs">
              <div className="py-2.5 flex justify-between"><span className="text-text-muted">Permanent Matriculation ID:</span> <span className="font-mono font-bold text-gold">{dossier.matriculationNo}</span></div>
              <div className="py-2.5 flex justify-between"><span className="text-text-muted">RFID Gate Card UID:</span> <span className="font-mono text-text">{dossier.rfidUid}</span></div>
              <div className="py-2.5 flex justify-between"><span className="text-text-muted">Institutional Email:</span> <span className="font-mono text-text">{dossier.email}</span></div>
              <div className="py-2.5 flex justify-between"><span className="text-text-muted">Mobile Contact:</span> <span className="font-mono text-text">{dossier.contactNo}</span></div>
              <div className="py-2.5 flex justify-between"><span className="text-text-muted">Emergency Contact:</span> <span className="text-text">{dossier.guardianName} ({dossier.guardianContact})</span></div>
              <div className="py-2.5 flex justify-between"><span className="text-text-muted">Blood Group:</span> <Badge variant="neutral" size="sm">{dossier.bloodGroup}</Badge></div>
            </div>
          </Card>

          <Card orientation="vertical" padding="lg" className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text">Current Operational Status</h4>
            <div className="divide-y divide-border text-xs">
              <div className="py-2.5 flex justify-between"><span className="text-text-muted">Academic Standing:</span> <Badge variant="gold" size="sm">{simulatedStanding}</Badge></div>
              <div className="py-2.5 flex justify-between"><span className="text-text-muted">Advising Registration Lock:</span> <Badge variant={hasAnyActiveHold ? "danger" : "success"} size="sm">{hasAnyActiveHold ? "LOCKED" : "UNRESTRICTED"}</Badge></div>
              <div className="py-2.5 flex justify-between"><span className="text-text-muted">Statutory Attendance Status:</span> <Badge variant="success" size="sm">88.4% (Collegiate)</Badge></div>
              <div className="py-2.5 flex justify-between"><span className="text-text-muted">Exam Admit Card Pass:</span> <Badge variant={simulatedAdmitCardValid ? "success" : "danger"} size="sm">{simulatedAdmitCardValid ? "ACTIVE QR TOKEN" : "REVOKED (UNPAID DUES)"}</Badge></div>
              <div className="py-2.5 flex justify-between"><span className="text-text-muted">Hostel Residency:</span> <span className="font-mono text-text">{dossier.roomNumber} ({dossier.hallName})</span></div>
              <div className="py-2.5 flex justify-between"><span className="text-text-muted">Graduation Readiness:</span> <span className="font-mono font-bold text-gold">{simulatedEarnedCredits >= 140 ? "GRADUATION ELIGIBLE" : "IN PROGRESS"}</span></div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Academics & Prerequisite Progress */}
      {activeTab === "academics" && (
        <div className="space-y-6">
          <Card noPadding>
            <div className="p-4 border-b border-border bg-surface-muted/30 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-text uppercase tracking-wider">
                  Currently Enrolled Course Sections (Term Load: 18 Credits)
                </h4>
                <p className="text-[11px] text-text-muted">Form Med-Ex-09 compliance threshold: ≥ 75% attendance mandatory.</p>
              </div>
              <Badge variant="gold" size="sm">Fall 2026</Badge>
            </div>

            <div className="divide-y divide-border text-xs">
              {dossier.enrolledCourses.map((c) => (
                <div key={c.code} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-muted/20">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gold">{c.code}</span>
                      <strong className="text-text">{c.title}</strong>
                      <Badge variant="neutral" size="sm">{c.credits} Credits</Badge>
                    </div>
                    <span className="text-[11px] text-text-muted mt-1 block">Schedule: {c.schedule} • Venue: {c.room}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-text-muted uppercase block">Attendance</span>
                      <span className="font-mono font-bold text-emerald-600">{c.attendance}% (Collegiate)</span>
                    </div>
                    <Badge variant="success" size="sm">Enrolled</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Treasury & Installments */}
      {activeTab === "financials" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card orientation="vertical" padding="lg" className="space-y-2">
              <span className="text-xs font-bold uppercase text-text-muted">Total Assessed Tuition</span>
              <div className="text-2xl font-mono font-bold text-text">৳ 1,85,000</div>
              <span className="text-[11px] text-emerald-600 font-semibold">Includes 20% Merit Waiver (৳ 37,000 Remitted)</span>
            </Card>

            <Card orientation="vertical" padding="lg" className="space-y-2">
              <span className="text-xs font-bold uppercase text-text-muted">Total Realized Treasury Payments</span>
              <div className="text-2xl font-mono font-bold text-emerald-600">৳ 1,55,000</div>
              <span className="text-[11px] text-text-muted">Tranche 1 (৳ 75,000) + Tranche 2 (৳ 80,000)</span>
            </Card>

            <Card orientation="vertical" padding="lg" className="space-y-2">
              <span className="text-xs font-bold uppercase text-text-muted">Tranche 3 Outstanding Balance</span>
              <div className={`text-2xl font-mono font-bold ${simulatedFinancialHold ? "text-danger" : "text-text"}`}>
                {simulatedFinancialHold ? "৳ 30,800" : "৳ 0"}
              </div>
              <span className="text-[11px] text-text-muted">{simulatedFinancialHold ? "Includes ৳800 compounding daily late fine" : "Account fully settled"}</span>
            </Card>
          </div>

          <Card noPadding>
            <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">3-Part Bank Challans &amp; Payment Receipts</h4>
              <Button
                variant="gold"
                size="sm"
                leftIcon={<Printer size={14} />}
                onClick={() => alert(`Printing 3-Part Bank Deposit Challan for ${dossier.matriculationNo}...`)}
              >
                Print 3-Part Challan
              </Button>
            </div>
            <div className="p-4 text-xs space-y-2">
              <div className="p-3 bg-surface-muted rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-text block">Tranche 1 Bank Challan (Sonali Bank Deposit)</span>
                  <span className="font-mono text-[11px] text-text-muted">Challan Ref: CHL-20261-00482 • Cleared 2026-09-02</span>
                </div>
                <Badge variant="success" size="sm">CLEARED ৳ 75,000</Badge>
              </div>
              <div className="p-3 bg-surface-muted rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-text block">Tranche 2 Midterm Clearance (bKash Gateway)</span>
                  <span className="font-mono text-[11px] text-text-muted">TrxID: 9J882K19A • Cleared 2026-10-01</span>
                </div>
                <Badge variant="success" size="sm">CLEARED ৳ 80,000</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: Admissions & Document Vault */}
      {activeTab === "admissions_vault" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card orientation="vertical" padding="lg" className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text">Intake &amp; Quota Origin</h4>
            <div className="divide-y divide-border text-xs">
              <div className="py-2 flex justify-between"><span className="text-text-muted">Admission Quota Category:</span> <Badge variant="gold" size="sm">{dossier.admissionQuota}</Badge></div>
              <div className="py-2 flex justify-between"><span className="text-text-muted">Composite Merit Score:</span> <span className="font-mono font-bold text-gold">{dossier.compositeMeritScore} / 100</span></div>
              <div className="py-2 flex justify-between"><span className="text-text-muted">Merit Rank:</span> <span className="font-mono font-bold text-text">#14 in General Pool</span></div>
              <div className="py-2 flex justify-between"><span className="text-text-muted">HSC GPA:</span> <span className="font-mono text-text">5.00 / 5.00</span></div>
              <div className="py-2 flex justify-between"><span className="text-text-muted">SSC GPA:</span> <span className="font-mono text-text">5.00 / 5.00</span></div>
            </div>
          </Card>

          <Card orientation="vertical" padding="lg" className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text">Physical Document Vault Storage</h4>
            <div className="p-3 bg-gold/5 border border-gold/20 rounded-xl space-y-1 text-xs">
              <span className="text-text-muted text-[10px] uppercase font-semibold block">Registrar Physical Vault Locator</span>
              <span className="font-mono font-bold text-gold text-sm">{dossier.vaultShelfId}</span>
            </div>

            <div className="space-y-2 text-xs pt-2">
              <span className="font-semibold text-text block">Surrendered Original Credentials:</span>
              {dossier.originalCertificatesSurrendered.map((cert) => (
                <div key={cert} className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 size={14} />
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 5: Exam Seating & Admit Gate */}
      {activeTab === "exams_seating" && (
        <div className="space-y-6">
          <Card pad="lg" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-text">
                  2D Anti-Cheating Seating Allocation &amp; Cryptographic Admit Gate Token
                </h4>
                <p className="text-[11px] text-text-muted">Odd-Even checkerboard distribution ensures zero adjacent peers share the same exam paper.</p>
              </div>
              <Badge variant={simulatedAdmitCardValid ? "success" : "danger"} size="sm">
                {simulatedAdmitCardValid ? "ADMIT PASS ACTIVE" : "GATE ACCESS REVOKED"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-surface-muted rounded-xl space-y-2">
                  <div className="flex justify-between"><span className="text-text-muted">Assigned Examination Hall:</span> <strong className="text-text">{dossier.examSeating.hall}</strong></div>
                  <div className="flex justify-between"><span className="text-text-muted">Assigned Desk / Bench:</span> <strong className="font-mono text-gold text-base">Seat {dossier.examSeating.seatNumber}</strong></div>
                  <div className="flex justify-between"><span className="text-text-muted">Left Neighbor:</span> <span className="font-mono text-text-muted">{dossier.examSeating.leftNeighbor}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Right Neighbor:</span> <span className="font-mono text-text-muted">{dossier.examSeating.rightNeighbor}</span></div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-surface-muted/40 rounded-xl border border-border text-center space-y-2">
                <QrCode size={100} className={simulatedAdmitCardValid ? "text-navy" : "text-danger opacity-40"} />
                <span className="font-mono text-[10px] text-text-muted font-bold block">
                  ADMIT-AUTH-{dossier.matriculationNo}-{simulatedAdmitCardValid ? "VALID" : "REVOKED"}
                </span>
                <Button
                  variant="gold"
                  size="sm"
                  disabled={!simulatedAdmitCardValid}
                  onClick={() => alert(`Printing verified examination admit card for ${dossier.matriculationNo}...`)}
                >
                  Download Admit Card (PDF)
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 6: 5-Point Zero-Dues Tree */}
      {activeTab === "zero_dues" && (
        <Card pad="lg" className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-text">
                5-Point Zero-Dues Clearance Tree &amp; Convocation Regalia Token
              </h4>
              <p className="text-[11px] text-text-muted">Statutory clearance across all 5 university authorities before degree conferral.</p>
            </div>
            <Badge variant={simulatedEarnedCredits >= 140 ? "success" : "warning"} size="sm">
              {simulatedEarnedCredits >= 140 ? "GRADUATION CLEARED" : `${simulatedEarnedCredits} / 140 Credits`}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-surface-muted rounded-xl flex items-center justify-between">
              <span className="font-semibold text-text">1. Finance &amp; Accounts Bursar</span>
              <Badge variant={simulatedFinancialHold ? "danger" : "success"} size="sm">{simulatedFinancialHold ? "Dues Pending" : "✓ ৳0 Balance Cleared"}</Badge>
            </div>
            <div className="p-3 bg-surface-muted rounded-xl flex items-center justify-between">
              <span className="font-semibold text-text">2. Central Medical Library</span>
              <Badge variant="success" size="sm">✓ 0 Overdue Books</Badge>
            </div>
            <div className="p-3 bg-surface-muted rounded-xl flex items-center justify-between">
              <span className="font-semibold text-text">3. Hall Provost / Dormitory Inventory</span>
              <Badge variant="success" size="sm">✓ Room Key Cleared</Badge>
            </div>
            <div className="p-3 bg-surface-muted rounded-xl flex items-center justify-between">
              <span className="font-semibold text-text">4. Clinical Skills &amp; Anatomy Labs</span>
              <Badge variant="success" size="sm">✓ Apparatus Returned</Badge>
            </div>
            <div className="p-3 bg-surface-muted rounded-xl flex items-center justify-between">
              <span className="font-semibold text-text">5. Proctorial Office &amp; Anti-Ragging Cell</span>
              <Badge variant={simulatedDisciplinaryHold ? "danger" : "success"} size="sm">{simulatedDisciplinaryHold ? "Sanction Active" : "✓ No Sanctions"}</Badge>
            </div>
            <div className="p-3 bg-gold/10 border border-gold/30 rounded-xl flex items-center justify-between">
              <span className="font-bold text-gold">Convocation Gown Pass Token</span>
              <Badge variant={simulatedEarnedCredits >= 140 && !hasAnyActiveHold ? "gold" : "neutral"} size="sm">
                {simulatedEarnedCredits >= 140 && !hasAnyActiveHold ? "PASS MINTED (CONV-2026-881)" : "AWAITING CLEARANCE"}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 7: Proctorial Governance */}
      {activeTab === "disciplinary" && (
        <Card pad="lg" className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-text">Proctorial Board &amp; Tribunal Records</h4>
              <p className="text-[11px] text-text-muted">Official quasi-judicial disciplinary history and syndicate resolutions.</p>
            </div>
            <Badge variant={simulatedDisciplinaryHold ? "danger" : "success"} size="sm">
              {simulatedDisciplinaryHold ? "ACTIVE PROCTORIAL SANCTION" : "CLEAN BEHAVIORAL RECORD"}
            </Badge>
          </div>

          <div className="p-4 bg-surface-muted rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
              <CheckCircle2 size={16} />
              <span>Zero Institutional Infractions on Permanent Record</span>
            </div>
            <p className="text-text-muted text-[11px]">
              Candidate has maintained 100% compliance with university code of conduct, clinical laboratory ethics, and dormitory regulations.
            </p>
          </div>
        </Card>
      )}

      {/* Tab 8: Hostel & Halal Mess */}
      {activeTab === "hostel_mess" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card orientation="vertical" padding="lg" className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text">Residential Dormitory Allotment</h4>
            <div className="divide-y divide-border text-xs">
              <div className="py-2 flex justify-between"><span className="text-text-muted">Hostel Hall:</span> <strong className="text-text">{dossier.hallName}</strong></div>
              <div className="py-2 flex justify-between"><span className="text-text-muted">Room Number:</span> <strong className="font-mono text-gold">{dossier.roomNumber}</strong></div>
              <div className="py-2 flex justify-between"><span className="text-text-muted">Room Capacity:</span> <span className="font-mono text-text">2 Beds (Double Occupancy)</span></div>
              <div className="py-2 flex justify-between"><span className="text-text-muted">Monthly Rent Fee:</span> <span className="font-mono font-bold text-text">৳ 4,500 / month</span></div>
            </div>
          </Card>

          <Card orientation="vertical" padding="lg" className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text">Halal Dining &amp; Mess Token</h4>
            <div className="divide-y divide-border text-xs">
              <div className="py-2 flex justify-between"><span className="text-text-muted">Subscription Plan:</span> <Badge variant="gold" size="sm">{dossier.messSubscription}</Badge></div>
              <div className="py-2 flex justify-between"><span className="text-text-muted">Dietary Compliance:</span> <span className="text-emerald-600 font-semibold">100% Halal Verified</span></div>
              <div className="py-2 flex justify-between"><span className="text-text-muted">Monthly Mess Fee:</span> <span className="font-mono font-bold text-text">৳ 4,500 / month</span></div>
              <div className="py-2 flex justify-between"><span className="text-text-muted">Digital Meal Token:</span> <Badge variant="success" size="sm">ACTIVE TOKEN</Badge></div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
