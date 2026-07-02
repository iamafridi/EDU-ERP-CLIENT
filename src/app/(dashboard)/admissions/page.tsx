"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  ListChecks,
  Plus,
  CheckCircle2,
  Award,
  UserCheck,
  Send,
  Download,
  Users,
  Building,
  QrCode,
  FileCheck,
  GraduationCap,
  Sparkles,
  Search,
  Layers,
  ArrowRightLeft,
  ShieldCheck,
  Printer,
  Sliders,
  AlertTriangle,
  RefreshCw,
  Hash,
} from "lucide-react";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import {
  PageHeader,
  Card,
  Modal,
  FormField,
  Input,
  Select,
  Button,
  Badge,
  ProgressBar,
} from "@/components/ui";

interface ApplicationRow {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  firstChoiceDept: string;
  secondChoiceDept: string;
  hscGpa: number;
  sscGpa: number;
  entranceScore: number;
  compositeScore: number;
  quotaCategory: "General" | "Freedom Fighter (5%)" | "Tribal (2%)" | "International (10%)" | "Disadvantaged (2%)";
  status: "pending" | "docs_verified" | "selected" | "migrated" | "admitted" | "rejected";
  submittedAt: string;
  docVerification?: {
    hscTranscript: boolean;
    sscTranscript: boolean;
    migrationCert: boolean;
    medicalFitness: boolean;
    verifiedBy?: string;
  };
  allocatedDept?: string;
  permanentStudentId?: string;
}

interface QuotaStat {
  category: string;
  totalSeats: number;
  allocatedSeats: number;
  reservedPct: number;
}

const initialApplications: ApplicationRow[] = [
  {
    id: "APP-2026-001",
    applicantName: "Tanvir Ahmed",
    email: "tanvir.ahmed@gmail.com",
    phone: "+880 1711-223344",
    firstChoiceDept: "Computer Science & Engineering",
    secondChoiceDept: "Electrical & Electronic Engineering",
    hscGpa: 5.0,
    sscGpa: 5.0,
    entranceScore: 92.5,
    compositeScore: 97.0,
    quotaCategory: "General",
    status: "admitted",
    submittedAt: "2026-09-15",
    docVerification: {
      hscTranscript: true,
      sscTranscript: true,
      migrationCert: true,
      medicalFitness: true,
      verifiedBy: "Registrar Office (Sec-A)",
    },
    allocatedDept: "Computer Science & Engineering",
    permanentStudentId: "CSE-2026-1-0142",
  },
  {
    id: "APP-2026-002",
    applicantName: "Samia Rahman",
    email: "samia.r@yahoo.com",
    phone: "+880 1819-334455",
    firstChoiceDept: "Computer Science & Engineering",
    secondChoiceDept: "Electrical & Electronic Engineering",
    hscGpa: 4.9,
    sscGpa: 5.0,
    entranceScore: 88.0,
    compositeScore: 94.6,
    quotaCategory: "Freedom Fighter (5%)",
    status: "selected",
    submittedAt: "2026-09-18",
    docVerification: {
      hscTranscript: true,
      sscTranscript: true,
      migrationCert: true,
      medicalFitness: true,
      verifiedBy: "Registrar Office (Sec-A)",
    },
    allocatedDept: "Electrical & Electronic Engineering",
  },
  {
    id: "APP-2026-003",
    applicantName: "Mehedi Hasan",
    email: "mehedi.h@outlook.com",
    phone: "+880 1912-778899",
    firstChoiceDept: "Computer Science & Engineering",
    secondChoiceDept: "School of Business (BBA)",
    hscGpa: 4.75,
    sscGpa: 4.8,
    entranceScore: 78.5,
    compositeScore: 88.7,
    quotaCategory: "General",
    status: "docs_verified",
    submittedAt: "2026-09-20",
    docVerification: {
      hscTranscript: true,
      sscTranscript: true,
      migrationCert: false,
      medicalFitness: true,
    },
  },
  {
    id: "APP-2026-004",
    applicantName: "Aung San Prue",
    email: "aung.prue@cht.bd",
    phone: "+880 1552-112233",
    firstChoiceDept: "Computer Science & Engineering",
    secondChoiceDept: "Biomedical Engineering",
    hscGpa: 4.6,
    sscGpa: 4.7,
    entranceScore: 74.0,
    compositeScore: 85.4,
    quotaCategory: "Tribal (2%)",
    status: "selected",
    submittedAt: "2026-09-22",
    docVerification: {
      hscTranscript: true,
      sscTranscript: true,
      migrationCert: true,
      medicalFitness: true,
      verifiedBy: "Registrar Office (Sec-B)",
    },
    allocatedDept: "Biomedical Engineering",
  },
];

const quotaDistribution: QuotaStat[] = [
  { category: "General Open Merit", totalSeats: 275, allocatedSeats: 260, reservedPct: 55 },
  { category: "Freedom Fighter / Ward (5%)", totalSeats: 25, allocatedSeats: 22, reservedPct: 5 },
  { category: "Tribal & Indigenous (2%)", totalSeats: 10, allocatedSeats: 8, reservedPct: 2 },
  { category: "International / SAARC (10%)", totalSeats: 50, allocatedSeats: 35, reservedPct: 10 },
  { category: "Disadvantaged & Physically Challenged (2%)", totalSeats: 10, allocatedSeats: 6, reservedPct: 2 },
];

export default function AdmissionsPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "applications" | "composite" | "quotas" | "migration" | "scrutiny" | "minting"
  >("applications");
  const [applications, setApplications] = useState<ApplicationRow[]>(initialApplications);
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedAppForScrutiny, setSelectedAppForScrutiny] = useState<ApplicationRow | null>(null);
  const [selectedAppForMinting, setSelectedAppForMinting] = useState<ApplicationRow | null>(null);
  const [testWeight, setTestWeight] = useState(40);
  const [hscWeight, setHscWeight] = useState(30);
  const [sscWeight, setSscWeight] = useState(30);

  const isRegistrarOrAdmin = roleIs("super-admin", "domain-admin");

  // Re-calculate composite scores dynamically based on weight sliders
  const recalculatedApplications = useMemo(() => {
    return applications.map((app) => {
      const testPart = (app.entranceScore / 100) * testWeight;
      const hscPart = (app.hscGpa / 5.0) * hscWeight;
      const sscPart = (app.sscGpa / 5.0) * sscWeight;
      const comp = testPart + hscPart + sscPart;
      return {
        ...app,
        compositeScore: parseFloat(comp.toFixed(2)),
      };
    });
  }, [applications, testWeight, hscWeight, sscWeight]);

  const handleVerifyDocs = (appId: string) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: "docs_verified",
              docVerification: {
                hscTranscript: true,
                sscTranscript: true,
                migrationCert: true,
                medicalFitness: true,
                verifiedBy: "Registrar Directorate (Verified)",
              },
            }
          : a
      )
    );
    setSuccessMsg(`Physical document credentials verified and tamper-checked for ${appId}.`);
    setSelectedAppForScrutiny(null);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleSlideMigration = (appId: string) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: "migrated",
              allocatedDept: a.firstChoiceDept,
            }
          : a
      )
    );
    setSuccessMsg(`Auto-sliding migration executed! Student promoted to first choice: Computer Science & Engineering.`);
    setTimeout(() => setSuccessMsg(""), 4500);
  };

  const handleMintStudentId = (appId: string) => {
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const generatedId = `CSE-2026-1-${randomSeq}`;
    setApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: "admitted",
              permanentStudentId: generatedId,
            }
          : a
      )
    );
    setSuccessMsg(`Permanent Student ID ${generatedId} minted and linked with RFID Turnstile and Student Ledger!`);
    setSelectedAppForMinting(null);
    setTimeout(() => setSuccessMsg(""), 4500);
  };

  const appColumns: Column<ApplicationRow>[] = [
    {
      header: "Applicant Name",
      accessor: "applicantName",
      className: "font-semibold text-text",
    },
    {
      header: "Contact",
      accessor: (row) => (
        <span className="text-xs text-text-muted">
          {row.email}
          <br />
          <span className="font-mono text-[11px]">{row.phone}</span>
        </span>
      ),
    },
    {
      header: "Dept Choices",
      accessor: (row) => (
        <div className="text-xs">
          <span className="font-bold text-text">1st: {row.firstChoiceDept}</span>
          <br />
          <span className="text-text-muted text-[11px]">2nd: {row.secondChoiceDept}</span>
        </div>
      ),
    },
    {
      header: "HSC / SSC GPA",
      accessor: (row) => (
        <span className="font-mono font-bold text-text text-xs">
          {row.hscGpa.toFixed(2)} / {row.sscGpa.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Composite Score",
      accessor: (row) => (
        <span className="font-mono font-bold text-gold text-xs">
          {row.compositeScore.toFixed(1)} / 100
        </span>
      ),
    },
    {
      header: "Quota",
      accessor: (row) => (
        <Badge variant={row.quotaCategory === "General" ? "neutral" : "gold"} size="sm">
          {row.quotaCategory}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessor: (row) => (
        <Badge
          variant={
            row.status === "admitted"
              ? "success"
              : row.status === "selected" || row.status === "migrated"
              ? "gold"
              : row.status === "docs_verified"
              ? "primary"
              : "warning"
          }
          size="sm"
        >
          {row.status.replace(/_/g, " ").toUpperCase()}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          {row.status !== "admitted" && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => setSelectedAppForScrutiny(row)}
            >
              Verify Docs
            </Button>
          )}
          {row.status === "selected" && (
            <Button
              variant="gold"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => setSelectedAppForMinting(row)}
            >
              Mint ID
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="University Admissions, Quota Allotment & Intake Pipeline"
        subtitle="Manage composite entrance test merit formulas, statutory multi-category quotas, round-wise subject sliding migrations, physical document verification, and permanent Student ID minting."
      />

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl flex items-center gap-2"
        >
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Total Applicants</span>
            <Badge variant="gold" size="sm">Intake 2026</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-text">
            4,850 <span className="text-xs font-normal text-text-muted">Candidates</span>
          </div>
          <span className="text-xs text-text-muted mt-1 block">500 Total University Seats</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Admitted Cohort</span>
            <Badge variant="success" size="sm">94.2% Filled</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">
            471 <span className="text-xs font-normal text-text-muted">Enrolled</span>
          </div>
          <span className="text-xs text-text-muted mt-1 block">Student IDs Minted</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Statutory Quota Fill</span>
            <Badge variant="gold" size="sm">UGC Statutory</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-gold">
            88.5% <span className="text-xs font-normal text-text-muted">Utilized</span>
          </div>
          <span className="text-xs text-text-muted mt-1 block">Freedom Fighter, Tribal, SAARC</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Auto-Sliding Transfers</span>
            <Badge variant="warning" size="sm">Round 2</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-warning">
            38 <span className="text-xs font-normal text-text-muted">Migrated</span>
          </div>
          <span className="text-xs text-text-muted mt-1 block">To 1st Choice Departments</span>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-px">
        {([
          { key: "applications", label: "Candidate Applications Dossier", icon: FileText },
          { key: "composite", label: "Composite Merit Formula Builder", icon: Sliders },
          { key: "quotas", label: "Statutory Quota Allotment Cell", icon: Users },
          { key: "migration", label: "Auto-Sliding & Subject Migration", icon: ArrowRightLeft },
          { key: "scrutiny", label: "Document Verification & Tamper Check", icon: ShieldCheck },
          { key: "minting", label: "Student ID & RFID Minting", icon: Hash },
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

      {/* Tab 1: Applications */}
      {activeTab === "applications" && (
        <Card noPadding>
          <DataTable<ApplicationRow>
            data={recalculatedApplications}
            columns={appColumns}
            searchPlaceholder="Search applicants by name, email, or department..."
            searchField="applicantName"
          />
        </Card>
      )}

      {/* Tab 2: Composite Merit Formula Builder */}
      {activeTab === "composite" && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <Sliders size={16} className="text-gold" />
                Dynamic Composite Admission Merit Score Engine
              </h3>
              <p className="text-xs text-text-muted">
                Calibrate relative weight distribution for Entrance Test Score, HSC GPA, and SSC GPA. Total weight must sum to 100%.
              </p>
            </div>
            <Badge variant="gold" size="sm">
              Total Weight: {testWeight + hscWeight + sscWeight}%
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card orientation="vertical" padding="lg" className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span>Entrance Test Weightage</span>
                <span className="font-mono text-gold text-sm">{testWeight}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={70}
                value={testWeight}
                onChange={(e) => setTestWeight(Number(e.target.value))}
                className="w-full accent-gold cursor-pointer"
              />
              <p className="text-[11px] text-text-muted">
                Calculated on normalized 100-mark MCQ + Written examination score.
              </p>
            </Card>

            <Card orientation="vertical" padding="lg" className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span>HSC / A-Level Weightage</span>
                <span className="font-mono text-gold text-sm">{hscWeight}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                value={hscWeight}
                onChange={(e) => setHscWeight(Number(e.target.value))}
                className="w-full accent-gold cursor-pointer"
              />
              <p className="text-[11px] text-text-muted">
                Scaled proportionally against maximum 5.00 GPA without optional 4th subject.
              </p>
            </Card>

            <Card orientation="vertical" padding="lg" className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span>SSC / O-Level Weightage</span>
                <span className="font-mono text-gold text-sm">{sscWeight}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                value={sscWeight}
                onChange={(e) => setSscWeight(Number(e.target.value))}
                className="w-full accent-gold cursor-pointer"
              />
              <p className="text-[11px] text-text-muted">
                Secondary school certificate academic foundation benchmark.
              </p>
            </Card>
          </div>

          <Card orientation="vertical" padding="lg" className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text">
              Live Recalculated Merit Rank Simulation Top 3
            </h4>
            <div className="divide-y divide-border text-xs">
              {recalculatedApplications.slice(0, 3).map((app, idx) => (
                <div key={app.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gold/10 text-gold font-mono font-bold flex items-center justify-center text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <strong className="text-text">{app.applicantName}</strong>
                      <span className="text-text-muted text-[11px] ml-2">({app.firstChoiceDept})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-text">Test: {app.entranceScore}%</span>
                    <span className="font-mono font-bold text-gold">{app.compositeScore.toFixed(2)} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Statutory Quota Allotment Cell */}
      {activeTab === "quotas" && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <Users size={16} className="text-gold" />
                UGC &amp; Ministry Statutory Quota Allocation Matrix
              </h3>
              <p className="text-xs text-text-muted">
                Prescribed seat allocations per university charter with automated de-reservation rules after Round 3 admissions.
              </p>
            </div>
            <Badge variant="gold" size="sm">500 Total University Seats</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quotaDistribution.map((q) => (
              <Card key={q.category} orientation="vertical" padding="lg" className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text">{q.category}</span>
                  <Badge variant="gold" size="sm">{q.reservedPct}% of Total</Badge>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-text-muted">Allocated:</span>
                  <span className="font-mono font-bold text-text">
                    {q.allocatedSeats} / {q.totalSeats} Seats ({Math.round((q.allocatedSeats / q.totalSeats) * 100)}%)
                  </span>
                </div>
                <ProgressBar
                  value={(q.allocatedSeats / q.totalSeats) * 100}
                  variant={q.allocatedSeats === q.totalSeats ? "success" : "gold"}
                  size="sm"
                />
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Auto-Sliding & Subject Migration */}
      {activeTab === "migration" && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <ArrowRightLeft size={16} className="text-gold" />
                Round-Wise Auto-Sliding Subject Migration Algorithm
              </h3>
              <p className="text-xs text-text-muted">
                When top-ranked students forfeit their allocated seats, waiting list candidates automatically slide into their higher-preference departments.
              </p>
            </div>
            <Badge variant="gold" size="sm">Round 2 Active</Badge>
          </div>

          <div className="divide-y divide-border bg-surface border border-border rounded-2xl overflow-hidden">
            {applications.map((app) => (
              <div
                key={app.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-muted/30 transition-colors"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gold text-xs">{app.id}</span>
                    <span className="font-bold text-text">{app.applicantName}</span>
                    <Badge variant="neutral" size="sm">{app.quotaCategory}</Badge>
                  </div>
                  <p className="text-xs text-text-muted">
                    Allocated: <strong className="text-text">{app.allocatedDept || app.secondChoiceDept}</strong> • 1st Choice: <strong className="text-gold">{app.firstChoiceDept}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    variant={app.status === "migrated" || app.status === "admitted" ? "success" : "warning"}
                    size="sm"
                  >
                    {app.status === "migrated" ? "SLID TO 1ST CHOICE" : app.status.toUpperCase()}
                  </Badge>

                  {app.status !== "migrated" && app.status !== "admitted" && (
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => handleSlideMigration(app.id)}
                      leftIcon={<ArrowRightLeft size={13} />}
                    >
                      Execute Slide to CSE
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Document Scrutiny & Tamper Check */}
      {activeTab === "scrutiny" && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <ShieldCheck size={16} className="text-gold" />
                Physical Document Verification &amp; Tamper Check Registry
              </h3>
              <p className="text-xs text-text-muted">
                Official physical audit checklist for HSC Original Transcripts, Migration Certificates, and CMO Medical clearances.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications.map((app) => (
              <Card key={app.id} orientation="vertical" padding="lg" className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-text block text-sm">{app.applicantName}</span>
                    <span className="font-mono text-xs text-gold">{app.id}</span>
                  </div>
                  <Badge
                    variant={app.docVerification?.verifiedBy ? "success" : "warning"}
                    size="sm"
                  >
                    {app.docVerification?.verifiedBy ? "AUDIT VERIFIED" : "PENDING AUDIT"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className={app.docVerification?.hscTranscript ? "text-emerald-600" : "text-text-muted"} />
                    <span>HSC Original Marksheet</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className={app.docVerification?.sscTranscript ? "text-emerald-600" : "text-text-muted"} />
                    <span>SSC Certificate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className={app.docVerification?.migrationCert ? "text-emerald-600" : "text-text-muted"} />
                    <span>Migration Clearance</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className={app.docVerification?.medicalFitness ? "text-emerald-600" : "text-text-muted"} />
                    <span>CMO Medical Fitness</span>
                  </div>
                </div>

                {!app.docVerification?.verifiedBy && (
                  <Button
                    variant="gold"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => handleVerifyDocs(app.id)}
                    leftIcon={<ShieldCheck size={14} />}
                  >
                    Verify &amp; Seal Credentials
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Student ID Minting */}
      {activeTab === "minting" && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <Hash size={16} className="text-gold" />
                Permanent Student ID, Institutional Email &amp; RFID Minting Cell
              </h3>
              <p className="text-xs text-text-muted">
                Mint permanent registration numbers upon fee clearance and provision university directory accounts.
              </p>
            </div>
          </div>

          <div className="divide-y divide-border bg-surface border border-border rounded-2xl overflow-hidden">
            {applications.map((app) => (
              <div
                key={app.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-muted/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text">{app.applicantName}</span>
                    {app.permanentStudentId ? (
                      <span className="font-mono font-bold text-gold px-2 py-0.5 bg-gold/10 rounded text-xs">
                        {app.permanentStudentId}
                      </span>
                    ) : (
                      <Badge variant="warning" size="sm">ID UNMINTED</Badge>
                    )}
                  </div>
                  <p className="text-xs text-text-muted">
                    Department: <strong className="text-text">{app.allocatedDept || app.firstChoiceDept}</strong> • Term: <strong className="text-text">Fall 2026</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {app.permanentStudentId ? (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Printer size={14} />}
                      onClick={() => alert(`Printing RFID Student Identity Card for ${app.permanentStudentId}...`)}
                    >
                      Print RFID ID Card
                    </Button>
                  ) : (
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => handleMintStudentId(app.id)}
                      leftIcon={<Sparkles size={14} />}
                    >
                      Mint Student ID
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Scrutiny Modal */}
      <Modal
        isOpen={!!selectedAppForScrutiny}
        onClose={() => setSelectedAppForScrutiny(null)}
        title="Physical Document Scrutiny"
        subtitle={`Audit credential authenticity for ${selectedAppForScrutiny?.applicantName}`}
        size="md"
      >
        {selectedAppForScrutiny && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-surface-muted rounded-xl border border-border space-y-1">
              <div className="flex justify-between"><span className="text-text-muted">Application ID:</span> <strong>{selectedAppForScrutiny.id}</strong></div>
              <div className="flex justify-between"><span className="text-text-muted">HSC GPA:</span> <strong>{selectedAppForScrutiny.hscGpa.toFixed(2)}</strong></div>
              <div className="flex justify-between"><span className="text-text-muted">Entrance Test:</span> <strong>{selectedAppForScrutiny.entranceScore}%</strong></div>
            </div>

            <div className="space-y-2 border-t border-border pt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-gold accent-gold" />
                <span>Original HSC Transcript &amp; Certificate verified</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-gold accent-gold" />
                <span>Original SSC Transcript &amp; Certificate verified</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-gold accent-gold" />
                <span>Board Migration Certificate submitted</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-gold accent-gold" />
                <span>Chief Medical Officer Fitness Certificate cleared</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setSelectedAppForScrutiny(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="gold"
                onClick={() => handleVerifyDocs(selectedAppForScrutiny.id)}
                leftIcon={<ShieldCheck size={14} />}
              >
                Approve &amp; Seal Documents
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Student ID Minting Modal */}
      <Modal
        isOpen={!!selectedAppForMinting}
        onClose={() => setSelectedAppForMinting(null)}
        title="Mint Permanent Student Registration Number"
        subtitle={`Generate institutional roll number for ${selectedAppForMinting?.applicantName}`}
        size="md"
      >
        {selectedAppForMinting && (
          <div className="space-y-4 text-xs">
            <p className="text-text-muted">
              Generating permanent student registration ID will bind the student to their designated department ledger, provision institutional Google Workspace email, and unlock semester course advising.
            </p>

            <div className="p-3 bg-surface-muted rounded-xl border border-border space-y-1 font-mono">
              <div>Format: [DEPT]-[YEAR]-[TERM]-[SEQUENCE]</div>
              <div className="text-gold font-bold">Target Department: {selectedAppForMinting.allocatedDept || selectedAppForMinting.firstChoiceDept}</div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setSelectedAppForMinting(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="gold"
                onClick={() => handleMintStudentId(selectedAppForMinting.id)}
                leftIcon={<Sparkles size={14} />}
              >
                Confirm &amp; Mint ID
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
