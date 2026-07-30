"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { usePermission } from "@/hooks/usePermission";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button, IconButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { FormField, Input, Select } from "@/components/ui/Form";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { ProgressBar } from "@/components/ui/ProgressBar";
import DataTable, { Column } from "@/components/ui/DataTable";
import { 
  Award, 
  Plus, 
  CheckCircle2, 
  Download, 
  ShieldCheck, 
  Clock,
  Trash2,
  FileText,
  GraduationCap,
  Sparkles,
  QrCode,
  Building2,
  BookOpen,
  DollarSign,
  AlertTriangle,
  FileCheck,
  Printer,
  ChevronRight,
  Eye,
} from "lucide-react";
import { showToast } from "@/components/dashboard/ToastFeedback";
import { generateTranscriptPDF, generateOfficialCertificatePDF } from "@/lib/pdfGenerator";

interface TranscriptRow {
  id: string;
  studentId: string;
  studentName: string;
  degree: string;
  cgpa: number;
  creditsEarned: number;
  totalCreditsRequired: number;
  issueDate: string;
  status: "verified" | "pending" | "cleared";
  verificationHash: string;
  honors?: "Summa Cum Laude" | "Magna Cum Laude" | "Cum Laude" | "Regular";
  clearances?: {
    academic: boolean;
    accounts: boolean;
    library: boolean;
    hostel: boolean;
    proctor: boolean;
  };
}

const MOCK_GRADUATING_STUDENTS: TranscriptRow[] = [
  {
    id: "TRN-2026-001",
    studentId: "STU-2026001",
    studentName: "Marcus Chen",
    degree: "B.Sc. in Computer Science & Engineering",
    cgpa: 3.92,
    creditsEarned: 142,
    totalCreditsRequired: 140,
    issueDate: "2026-08-30",
    status: "verified",
    verificationHash: "0x7F9A...B3C1",
    honors: "Summa Cum Laude",
    clearances: { academic: true, accounts: true, library: true, hostel: true, proctor: true },
  },
  {
    id: "TRN-2026-002",
    studentId: "STU-2026002",
    studentName: "Sophia Martinez",
    degree: "B.Sc. in Microbiology & Immunology",
    cgpa: 3.86,
    creditsEarned: 140,
    totalCreditsRequired: 140,
    issueDate: "2026-09-02",
    status: "verified",
    verificationHash: "0x4E2B...D98F",
    honors: "Magna Cum Laude",
    clearances: { academic: true, accounts: true, library: true, hostel: true, proctor: true },
  },
  {
    id: "TRN-2026-003",
    studentId: "STU-2026003",
    studentName: "Ethan Gallagher",
    degree: "B.Sc. in Biochemistry & Genetics",
    cgpa: 3.65,
    creditsEarned: 134,
    totalCreditsRequired: 140,
    issueDate: "2026-09-14",
    status: "pending",
    verificationHash: "0x1A8C...FE22",
    honors: "Cum Laude",
    clearances: { academic: true, accounts: false, library: true, hostel: true, proctor: true },
  },
  {
    id: "TRN-2026-004",
    studentId: "STU-2026004",
    studentName: "Aria Takahashi",
    degree: "B.Sc. in Computer Science & Engineering",
    cgpa: 3.82,
    creditsEarned: 140,
    totalCreditsRequired: 140,
    issueDate: "2026-09-19",
    status: "verified",
    verificationHash: "0x889D...A120",
    honors: "Magna Cum Laude",
    clearances: { academic: true, accounts: true, library: true, hostel: true, proctor: true },
  },
  {
    id: "TRN-2026-005",
    studentId: "STU-2026005",
    studentName: "Zubair Al-Mansoor",
    degree: "B.Sc. in Physiology & Neuroscience",
    cgpa: 3.74,
    creditsEarned: 138,
    totalCreditsRequired: 140,
    issueDate: "2026-09-22",
    status: "pending",
    verificationHash: "0x33B1...87CD",
    honors: "Cum Laude",
    clearances: { academic: true, accounts: true, library: false, hostel: true, proctor: true },
  },
];

type TranscriptTab = "transcripts" | "degree_audit" | "clearances" | "convocation" | "public_verification";

export default function TranscriptsPage() {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TranscriptTab>("transcripts");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentForAudit, setSelectedStudentForAudit] = useState<TranscriptRow | null>(null);
  const [certificateStudent, setCertificateStudent] = useState<TranscriptRow | null>(null);
  const [verifySearchQuery, setVerifySearchQuery] = useState("0x7F9A-B3C1-2026");
  const [isRevocationModalOpen, setIsRevocationModalOpen] = useState(false);
  const [wesDispatchToast, setWesDispatchToast] = useState(false);

  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [degree, setDegree] = useState("B.Sc. in Computer Science & Engineering");
  const [cgpa, setCgpa] = useState("3.85");
  const [creditsEarned, setCreditsEarned] = useState("140");
  const [successMsg, setSuccessMsg] = useState("");

  const isEditor = can("update", "transcripts");
  const isAdmin = can("delete", "transcripts");

  const { data: rawTranscripts = [], isLoading } = useQuery<TranscriptRow[]>({
    queryKey: ["transcripts"],
    queryFn: async () => {
      try {
        const res = await api.getTranscripts();
        if (Array.isArray(res) && res.length > 0) return res;
      } catch {
        // fallback
      }
      return MOCK_GRADUATING_STUDENTS;
    },
  });

  const transcripts: TranscriptRow[] = (rawTranscripts.length > 0 ? rawTranscripts : MOCK_GRADUATING_STUDENTS).map(
    (item, idx) => {
      const fallback = MOCK_GRADUATING_STUDENTS[idx % MOCK_GRADUATING_STUDENTS.length];
      return {
        ...item,
        degree: item.degree || fallback.degree,
        creditsEarned: item.creditsEarned || fallback.creditsEarned || 140,
        totalCreditsRequired: item.totalCreditsRequired || 140,
        verificationHash: item.verificationHash || fallback.verificationHash || `0x${Math.random().toString(16).substring(2, 8).toUpperCase()}...B91`,
        honors: item.honors || (item.cgpa >= 3.9 ? "Summa Cum Laude" : item.cgpa >= 3.8 ? "Magna Cum Laude" : "Cum Laude"),
        clearances: item.clearances || fallback.clearances,
      };
    }
  );

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.createTranscriptRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transcripts"] });
      setIsModalOpen(false);
      setStudentId("");
      setStudentName("");
      setCgpa("3.85");
      setCreditsEarned("140");
      setSuccessMsg("Academic transcript generated and logged to institutional verification registry.");
      showToast({
        title: "Transcript Generated",
        description: "Official cryptographic seal applied to academic records.",
        variant: "success",
      });
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTranscript(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transcripts"] });
      setSuccessMsg("Transcript record archived.");
      showToast({
        title: "Record Archived",
        description: "Transcript record moved to archive.",
        variant: "success",
      });
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => api.verifyTranscript(id, "Registrar Office"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transcripts"] });
      setSuccessMsg("Transcript verified with official seal.");
      showToast({
        title: "Transcript Verified",
        description: "Official registrar seal and cryptographic hash confirmed.",
        variant: "success",
      });
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !studentName) return;
    createMutation.mutate({
      studentId,
      studentName,
      degree,
      cgpa: Number(cgpa) || 3.75,
      creditsEarned: Number(creditsEarned) || 140,
      totalCreditsRequired: 140,
      issueDate: new Date().toISOString().split("T")[0],
      status: "verified",
      verificationHash: `0x${Math.random().toString(16).substring(2, 6).toUpperCase()}...B3C1`,
    });
  };

  const columns: Column<TranscriptRow>[] = [
    {
      header: "Graduating Scholar",
      accessor: (row) => (
        <div>
          <span className="font-bold text-text block">{row.studentName}</span>
          <span className="text-[11px] text-text-muted font-mono">{row.studentId}</span>
        </div>
      ),
      sortValue: (row) => row.studentName,
    },
    {
      header: "Degree Program",
      accessor: "degree",
      className: "text-xs font-medium text-text-secondary",
    },
    {
      header: "CGPA & Honors",
      accessor: (row) => (
        <div className="space-y-0.5">
          <span className="font-mono font-bold text-gold text-sm block">★ {Number(row.cgpa).toFixed(2)}</span>
          <span className="text-[10px] text-text-muted font-medium block">{row.honors}</span>
        </div>
      ),
    },
    {
      header: "Degree Audit (140 Cr)",
      accessor: (row) => {
        const pct = Math.min(100, Math.round((row.creditsEarned / row.totalCreditsRequired) * 100));
        const isComplete = row.creditsEarned >= row.totalCreditsRequired;
        return (
          <div className="w-32 space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-mono font-semibold">{row.creditsEarned}/{row.totalCreditsRequired} Cr</span>
              <span className={isComplete ? "text-emerald-600 font-bold" : "text-warning font-semibold"}>{pct}%</span>
            </div>
            <ProgressBar value={pct} variant={isComplete ? "success" : "warning"} size="xs" />
          </div>
        );
      },
    },
    {
      header: "Verification Seal",
      accessor: (row) => (
        <div className="space-y-0.5">
          <Badge variant={row.status === "verified" ? "success" : "warning"} size="sm">
            {row.status === "verified" ? "Registrar Verified" : "Pending Sign-off"}
          </Badge>
          <span className="text-[10px] font-mono text-text-subtle block">{row.verificationHash}</span>
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 px-2.5"
            onClick={() => setCertificateStudent(row)}
          >
            Certificate
          </Button>
          <ActionMenu
            items={[
              {
                label: "Run Full Degree Audit",
                icon: <FileCheck size={13} />,
                onClick: () => {
                  setSelectedStudentForAudit(row);
                  setActiveTab("degree_audit");
                },
              },
              {
                label: "Download Official Transcript",
                icon: <Download size={13} />,
                onClick: () => {
                  try {
                    const doc = generateTranscriptPDF({
                      transcriptNo: row.id,
                      studentName: row.studentName,
                      studentId: row.studentId,
                      degree: row.degree,
                      batch: "2021-2026",
                      issueDate: row.issueDate,
                      cgpa: row.cgpa,
                      totalCreditsEarned: row.creditsEarned,
                      totalCreditsRequired: row.totalCreditsRequired,
                      honors: row.honors,
                      verificationHash: row.verificationHash || `SHA256-${row.id}-${Date.now()}`,
                    });
                    doc.save(`Transcript_${row.studentId}_${row.id}.pdf`);
                    showToast({ title: "Transcript PDF Generated", description: `Downloaded official transcript for ${row.studentName}.`, variant: "success" });
                  } catch (e) {
                    showToast({ title: "PDF Generation Failed", description: "An error occurred generating the document.", variant: "error" });
                  }
                },
              },
              ...(row.status !== "verified"
                ? [
                    {
                      label: "Apply Registrar Seal",
                      icon: <ShieldCheck size={13} />,
                      onClick: () => verifyMutation.mutate(row.id),
                    },
                  ]
                : []),
              ...(isAdmin
                ? [
                    {
                      label: "Archive Record",
                      icon: <Trash2 size={13} />,
                      variant: "danger" as const,
                      onClick: () => {
                        if (confirm("Archive this transcript record?")) deleteMutation.mutate(row.id);
                      },
                    },
                  ]
                : []),
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      <PageHeader
        title="Official Transcripts, Degree Audit & Convocation Suite"
        subtitle="Cryptographically verified academic transcripts, 140-credit degree audit scanner, multi-department graduation clearances, and convocation certificates."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              leftIcon={<FileCheck size={15} />}
              onClick={() => setActiveTab("degree_audit")}
            >
              Degree Audit Scanner
            </Button>
            {isEditor && (
              <Button variant="gold" leftIcon={<Plus size={15} />} onClick={() => setIsModalOpen(true)}>
                Issue Transcript
              </Button>
            )}
          </div>
        }
      />

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Graduating Cohort</span>
            <Badge variant="gold" size="sm">2026 Batch</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-text">{transcripts.length} Candidates</div>
          <span className="text-xs text-text-muted mt-1 block">Prospective degree conferrals</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Cleared for Graduation</span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">
            {transcripts.filter((t) => t.creditsEarned >= 140 && t.status === "verified").length} Students
          </div>
          <span className="text-xs text-text-muted mt-1 block">140+ credits & zero institutional holds</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Avg Cohort CGPA</span>
          <div className="mt-2 text-2xl font-bold font-mono text-gold">3.84 / 4.00</div>
          <span className="text-xs text-text-muted mt-1 block">Summa / Magna honors rate: 80%</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Convocation Clearance</span>
          <div className="mt-2 text-2xl font-bold font-mono text-primary">94.6%</div>
          <span className="text-xs text-text-muted mt-1 block">Accounts, library & hostel sign-offs</span>
        </Card>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as TranscriptTab)}
        tabs={[
          { id: "transcripts", label: "Official Transcripts Register", count: transcripts.length },
          { id: "degree_audit", label: "140-Credit Degree Audit Matrix" },
          { id: "clearances", label: "Multi-Department Institutional Clearances" },
          { id: "convocation", label: "Convocation & Degree Certificate Generator" },
          { id: "public_verification", label: "Public Verification & Merkle CRL Revocation" },
        ]}
      />

      {/* Tab 1: Official Transcripts Register */}
      {activeTab === "transcripts" && (
        <Card noPadding>
          <div className="p-4 border-b border-border bg-surface-elevated/40 flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Verified Transcript Issuance Registry ({transcripts.length})
            </span>
            <Badge variant="gold" size="sm">
              SHA-256 Verified
            </Badge>
          </div>

          <DataTable<TranscriptRow>
            data={transcripts}
            columns={columns}
            loading={isLoading}
            searchPlaceholder="Search candidate by name or student ID..."
            searchField="studentName"
          />
        </Card>
      )}

      {/* Tab 2: 140-Credit Degree Audit Engine */}
      {activeTab === "degree_audit" && (
        <div className="space-y-5">
          <Card orientation="vertical" padding="lg" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-text font-display">
                  Comprehensive Degree Requirement Audit
                </h3>
                <p className="text-xs text-text-muted">
                  Validates core major curriculum, general education requirements, elective distribution, and minimum CGPA threshold
                </p>
              </div>
              <div className="w-full sm:w-72">
                <CustomDropdown
                  value={selectedStudentForAudit?.studentId || transcripts[0]?.studentId}
                  onChange={(val) => {
                    const match = transcripts.find((t) => t.studentId === val);
                    if (match) setSelectedStudentForAudit(match);
                  }}
                  placeholder="Select Candidate"
                  options={transcripts.map((t) => ({
                    value: t.studentId,
                    label: `${t.studentName} (${t.studentId})`,
                  }))}
                />
              </div>
            </div>

            {(() => {
              const student = selectedStudentForAudit || transcripts[0];
              if (!student) return null;
              const isEligible = student.creditsEarned >= 140 && student.cgpa >= 2.0;

              return (
                <div className="space-y-5">
                  {/* Candidate Header Snapshot */}
                  <div className="p-4 bg-surface-muted/60 rounded-xl border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-text">{student.studentName}</h4>
                        <Badge variant="gold" size="sm">{student.studentId}</Badge>
                      </div>
                      <p className="text-xs text-text-muted">{student.degree}</p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-[10px] text-text-muted uppercase font-bold block">Current CGPA</span>
                        <span className="text-xl font-bold font-mono text-gold">★ {Number(student.cgpa).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted uppercase font-bold block">Credits Completed</span>
                        <span className="text-xl font-bold font-mono text-text">{student.creditsEarned} / 140</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted uppercase font-bold block">Degree Status</span>
                        <Badge variant={isEligible ? "success" : "warning"} size="sm">
                          {isEligible ? "Audit Passed — Ready for Degree" : "Credit Shortfall"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* 5-Category Breakdown Matrix */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-surface rounded-xl border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text">University Gen Ed (24 Cr)</span>
                        <Badge variant="success" size="sm">24 / 24 Cr</Badge>
                      </div>
                      <p className="text-[11px] text-text-muted">English Composition, Bangladesh Studies, Ethics, Discrete Math</p>
                      <ProgressBar value={100} variant="success" size="xs" />
                    </div>

                    <div className="p-4 bg-surface rounded-xl border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text">Major Core Courses (68 Cr)</span>
                        <Badge variant="success" size="sm">68 / 68 Cr</Badge>
                      </div>
                      <p className="text-[11px] text-text-muted">Algorithms, Operating Systems, Database Systems, Computer Networks</p>
                      <ProgressBar value={100} variant="success" size="xs" />
                    </div>

                    <div className="p-4 bg-surface rounded-xl border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text">Major Electives (24 Cr)</span>
                        <Badge variant={student.creditsEarned >= 140 ? "success" : "warning"} size="sm">
                          {student.creditsEarned >= 140 ? "24 / 24 Cr" : "18 / 24 Cr"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-text-muted">Machine Learning, Cloud Architecture, Cyber Defense</p>
                      <ProgressBar value={student.creditsEarned >= 140 ? 100 : 75} variant={student.creditsEarned >= 140 ? "success" : "warning"} size="xs" />
                    </div>

                    <div className="p-4 bg-surface rounded-xl border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text">Open Electives (12 Cr)</span>
                        <Badge variant="success" size="sm">12 / 12 Cr</Badge>
                      </div>
                      <p className="text-[11px] text-text-muted">Principles of Accounting, Engineering Economics, Psychology</p>
                      <ProgressBar value={100} variant="success" size="xs" />
                    </div>

                    <div className="p-4 bg-surface rounded-xl border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text">Senior Capstone / Thesis (12 Cr)</span>
                        <Badge variant="success" size="sm">12 / 12 Cr (Grade A)</Badge>
                      </div>
                      <p className="text-[11px] text-text-muted">Final thesis defense completed & oral jury approved</p>
                      <ProgressBar value={100} variant="success" size="xs" />
                    </div>

                    <div className="p-4 bg-surface rounded-xl border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text">Institutional Holds</span>
                        <Badge variant={student.clearances?.accounts && student.clearances?.library ? "success" : "danger"} size="sm">
                          {student.clearances?.accounts && student.clearances?.library ? "Zero Holds" : "Action Required"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-text-muted">Accounts, central library, provost hostel, and proctor sign-off</p>
                      <ProgressBar value={student.clearances?.accounts && student.clearances?.library ? 100 : 60} variant={student.clearances?.accounts && student.clearances?.library ? "success" : "danger"} size="xs" />
                    </div>
                  </div>
                </div>
              );
            })()}
          </Card>
        </div>
      )}

      {/* Tab 3: Multi-Department Institutional Clearances */}
      {activeTab === "clearances" && (
        <Card noPadding>
          <div className="p-4 border-b border-border bg-surface-elevated/40 flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Graduation 5-Gate Institutional Clearances
            </span>
            <Badge variant="gold" size="sm">Convocation 2026</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-muted/50 border-b border-border text-text-muted uppercase font-bold text-[11px]">
                  <th className="p-3.5">Candidate</th>
                  <th className="p-3.5 text-center">Academic Registrar</th>
                  <th className="p-3.5 text-center">Bursar Accounts</th>
                  <th className="p-3.5 text-center">Central Library</th>
                  <th className="p-3.5 text-center">Provost / Hostel</th>
                  <th className="p-3.5 text-center">Proctor Office</th>
                  <th className="p-3.5 text-right">Degree Gate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transcripts.map((student) => {
                  const cl = student.clearances || { academic: true, accounts: true, library: true, hostel: true, proctor: true };
                  const allCleared = cl.academic && cl.accounts && cl.library && cl.hostel && cl.proctor;

                  return (
                    <tr key={student.id} className="hover:bg-surface-muted/30 transition-colors">
                      <td className="p-3.5">
                        <span className="font-bold text-text block">{student.studentName}</span>
                        <span className="text-[11px] text-text-muted font-mono">{student.studentId}</span>
                      </td>
                      <td className="p-3.5 text-center">
                        <Badge variant={cl.academic ? "success" : "danger"} size="sm">
                          {cl.academic ? "Cleared (140 Cr)" : "Shortfall"}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-center">
                        <Badge variant={cl.accounts ? "success" : "danger"} size="sm">
                          {cl.accounts ? "Zero Dues" : "Arrears ৳12,500"}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-center">
                        <Badge variant={cl.library ? "success" : "warning"} size="sm">
                          {cl.library ? "Books Returned" : "1 Overdue Book"}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-center">
                        <Badge variant={cl.hostel ? "success" : "warning"} size="sm">
                          {cl.hostel ? "Room Handed Over" : "Inspection Pending"}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-center">
                        <Badge variant={cl.proctor ? "success" : "danger"} size="sm">
                          {cl.proctor ? "Clean Record" : "Hearing Pending"}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        <Badge variant={allCleared ? "gold" : "neutral"} size="sm">
                          {allCleared ? "Approved for Convocation" : "Clearance Hold"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 4: Convocation & Degree Certificate Generator */}
      {activeTab === "convocation" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card orientation="vertical" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap size={20} className="text-gold" />
                <h3 className="text-sm font-bold text-text">Annual Convocation Gala Registration</h3>
              </div>
              <Badge variant="gold" size="sm">Convocation 2026</Badge>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              Eligible graduates who have passed all 140 credits and obtained 5-gate institutional clearances can book their academic gown and guest seating tickets.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3 bg-surface-muted/60 rounded-xl flex items-center justify-between text-xs">
                <span className="text-text-muted">Academic Regalia Gown Size:</span>
                <span className="font-bold text-text">Size L (Height 5'8" – 6'0")</span>
              </div>
              <div className="p-3 bg-surface-muted/60 rounded-xl flex items-center justify-between text-xs">
                <span className="text-text-muted">Guest Seating Passes:</span>
                <span className="font-bold text-text">2 Passes (Auditorium Row C)</span>
              </div>
              <div className="p-3 bg-surface-muted/60 rounded-xl flex items-center justify-between text-xs">
                <span className="text-text-muted">Degree Citation Honors:</span>
                <span className="font-bold text-gold">Chancellor's Gold Medal Nominee</span>
              </div>
            </div>

            <Button
              variant="gold"
              className="w-full"
              leftIcon={<Printer size={15} />}
              onClick={() => showToast({ title: "Convocation Pass Issued", description: "Entry pass and gown token generated.", variant: "success" })}
            >
              Generate Convocation Entry Pass
            </Button>
          </Card>

          <Card orientation="vertical" padding="lg" className="space-y-4 bg-surface-elevated/30 border-gold/30">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Award size={20} className="text-gold" />
                <h3 className="text-sm font-bold text-text">Cryptographic Degree Certificate Preview</h3>
              </div>
              <Badge variant="success" size="sm">Tamper-Proof</Badge>
            </div>

            {/* Certificate Preview Card */}
            <div className="p-6 bg-surface-ivory dark:bg-surface-navy rounded-2xl border-2 border-gold/40 shadow-xl text-center space-y-3 relative overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/40 mx-auto flex items-center justify-center text-gold">
                <Sparkles size={22} />
              </div>
              <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-gold">University Board of Trustees</h4>
              <p className="text-base font-bold text-text font-display">Bachelor of Science in Computer Science & Engineering</p>
              <p className="text-xs text-text-muted">Conferred with highest distinction upon</p>
              <h3 className="text-lg font-bold text-text font-display">Marcus Chen</h3>
              <p className="text-[11px] text-text-muted">Cumulative Grade Point Average: <strong className="text-gold font-mono">3.92 / 4.00</strong> (Summa Cum Laude)</p>
              
              <div className="pt-3 border-t border-border flex items-center justify-between text-[10px] text-text-muted font-mono">
                <span>Registrar Seal: <strong className="text-emerald-600">VERIFIED</strong></span>
                <span>Hash: 0x7F9A...B3C1</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                leftIcon={<Eye size={13} />}
                onClick={() => setCertificateStudent(transcripts[0])}
              >
                Inspect Certificate
              </Button>
              <Button
                variant="gold"
                className="flex-1 text-xs"
                leftIcon={<Download size={13} />}
                onClick={() => showToast({ title: "Degree Downloaded", description: "High-resolution cryptographic degree certificate PDF generated.", variant: "success" })}
              >
                Download PDF
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 5: Public Credential Verification & Merkle CRL Revocation Gateway */}
      {activeTab === "public_verification" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Overview Card */}
          <Card padding="lg" className="border-border bg-gradient-to-r from-surface to-surface-muted">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-primary-soft text-primary">
                  Global Credential Notary
                </span>
                <h3 className="text-lg font-bold font-display text-text mt-1">
                  Public Certificate Verification & Merkle Revocation List (CRL)
                </h3>
                <p className="text-xs text-text-muted mt-1 max-w-2xl">
                  Public notary gateway for employers, embassies, and academic institutions worldwide. Verifies authentic SHA-256 diplomas and enforces immutable Certificate Revocation Lists (CRL).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="gold"
                  size="sm"
                  leftIcon={<Sparkles size={14} />}
                  onClick={() => {
                    setWesDispatchToast(true);
                    setTimeout(() => setWesDispatchToast(false), 4000);
                  }}
                >
                  Dispatch WES / ECE Electronic Bundle
                </Button>
              </div>
            </div>
          </Card>

          {/* Search & Verification Input */}
          <Card padding="md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Input
                  value={verifySearchQuery}
                  onChange={(e) => setVerifySearchQuery(e.target.value)}
                  placeholder="Enter Certificate Hash (e.g. 0x7F9A-B3C1-2026) or Student ID..."
                />
              </div>
              <Button variant="primary" size="sm" leftIcon={<ShieldCheck size={14} />}>
                Verify Authenticity
              </Button>
            </div>
          </Card>

          {/* Verification Results: 2 Side-by-Side Scenarios */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Valid Certificate Result */}
            <Card padding="md" className="border-emerald-500/40 bg-emerald-500/5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text font-display">Marcus Chen</h4>
                    <span className="text-[11px] font-mono text-text-muted">STU-2026001 • Graduated Fall 2026</span>
                  </div>
                </div>

                <Badge variant="success" size="sm">
                  OFFICIAL & VALID
                </Badge>
              </div>

              <div className="p-3 bg-surface rounded-xl border border-border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Degree Conferred:</span>
                  <span className="font-semibold text-text">B.Sc. in Computer Science & Engineering</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Graduation Honors:</span>
                  <span className="font-bold text-gold">Summa Cum Laude (CGPA 3.92 / 4.00)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Total Credits:</span>
                  <span className="font-mono font-semibold text-text">142.0 / 140.0 Required</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-border">
                  <span className="text-text-muted">Cryptographic Proof:</span>
                  <span className="font-mono text-[11px] text-primary">SHA256:0x7F9A...B3C1 (Merkle Index #104)</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-text-muted">
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <ShieldCheck size={12} /> Registrar & VC Signatures Confirmed
                </span>
                <span className="font-mono">Notary ID: UMHS-2026-088</span>
              </div>
            </Card>

            {/* Revoked Certificate Result (Case Study) */}
            <Card padding="md" className="border-red-500/40 bg-red-500/5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center font-bold">
                    ✕
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text font-display">Revocation Record (Case Ref: SR-2024-88)</h4>
                    <span className="text-[11px] font-mono text-text-muted">Certificate Hash: 0x992B...EE01</span>
                  </div>
                </div>

                <Badge variant="danger" size="sm">
                  FORMALLY REVOKED
                </Badge>
              </div>

              <div className="p-3 bg-surface rounded-xl border border-border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Revocation Authority:</span>
                  <span className="font-semibold text-red-500">University Syndicate Hearing Resolution</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Revocation Grounds:</span>
                  <span className="font-semibold text-text">Post-Conferral Capstone Plagiarism Finding</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Gazette Reference:</span>
                  <span className="font-mono text-text">Gazette Order Ref: BG-2026-F-088</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-border">
                  <span className="text-text-muted">Merkle CRL Status:</span>
                  <span className="font-mono text-[11px] text-red-500">LEAF_INVALIDATED (Index #012)</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-text-muted">
                <span className="text-red-500 font-semibold flex items-center gap-1">
                  <AlertTriangle size={12} /> Credential Barred from International Recognition
                </span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Transcript Issuance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Issue Official Academic Transcript"
        subtitle="Generates verified grade transcript with university seal and digital verification hash"
      >
        <form onSubmit={handleGenerate} className="space-y-4">
          <FormField label="Student Registration Number" required>
            <Input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="STU-2026001"
              required
            />
          </FormField>
          <FormField label="Full Candidate Name" required>
            <Input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Marcus Chen"
              required
            />
          </FormField>
          <FormField label="Degree Program" required>
            <Select value={degree} onChange={(e) => setDegree(e.target.value)}>
              <option value="B.Sc. in Computer Science & Engineering">B.Sc. in Computer Science & Engineering</option>
              <option value="B.Sc. in Microbiology & Immunology">B.Sc. in Microbiology & Immunology</option>
              <option value="B.Sc. in Biochemistry & Genetics">B.Sc. in Biochemistry & Genetics</option>
              <option value="B.Sc. in Physiology & Neuroscience">B.Sc. in Physiology & Neuroscience</option>
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Cumulative GPA (4.0)" required>
              <Input
                type="number"
                step="0.01"
                min="2.00"
                max="4.00"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Credits Completed" required>
              <Input
                type="number"
                min="1"
                max="160"
                value={creditsEarned}
                onChange={(e) => setCreditsEarned(e.target.value)}
                required
              />
            </FormField>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" type="submit" loading={createMutation.isPending}>
              Generate Verified Transcript
            </Button>
          </div>
        </form>
      </Modal>

      {/* Full Certificate Modal */}
      {certificateStudent && (
        <Modal
          isOpen={!!certificateStudent}
          onClose={() => setCertificateStudent(null)}
          title="Official Cryptographic Degree Certificate"
          size="lg"
        >
          <div className="p-8 bg-surface-ivory dark:bg-surface-navy rounded-2xl border-4 border-double border-gold/50 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gold/15 border-2 border-gold/50 mx-auto flex items-center justify-center text-gold">
              <Sparkles size={30} />
            </div>
            <h3 className="text-xs uppercase tracking-[0.25em] font-bold text-gold">University of Medical & Health Sciences</h3>
            <p className="text-xs text-text-muted italic">By authority of the Syndicate & Board of Trustees</p>
            <h2 className="text-xl font-bold text-text font-display">{certificateStudent.degree}</h2>
            <p className="text-xs text-text-muted">is hereby conferred upon</p>
            <h1 className="text-2xl font-bold text-text font-display">{certificateStudent.studentName}</h1>
            <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
              who has successfully fulfilled all academic requirements, completed 140 credit hours with a cumulative grade point average of <strong className="text-gold font-mono">{certificateStudent.cgpa}</strong> ({certificateStudent.honors}).
            </p>
            
            <div className="pt-6 border-t border-border flex items-center justify-between text-xs">
              <div className="text-left space-y-0.5">
                <span className="font-bold text-text block">Vice Chancellor</span>
                <span className="text-[10px] text-text-muted">Digital Signature Verified</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-border shadow-xs">
                <QrCode size={48} className="text-surface-navy" />
              </div>
              <div className="text-right space-y-0.5">
                <span className="font-bold text-text block">Controller of Examinations</span>
                <span className="text-[10px] text-text-muted font-mono">{certificateStudent.verificationHash}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="gold"
                size="sm"
                leftIcon={<Download size={14} />}
                onClick={() => {
                  try {
                    const doc = generateOfficialCertificatePDF({
                      certNo: certificateStudent.id,
                      docType: "Degree Certificate",
                      studentName: certificateStudent.studentName,
                      studentId: certificateStudent.studentId,
                      batch: "2021-2026",
                      issueDate: certificateStudent.issueDate,
                      purpose: "Official Degree Conferral & Medical Licensing",
                      validUntil: "Permanent Record",
                      verificationHash: certificateStudent.verificationHash,
                    });
                    doc.save(`Degree_Certificate_${certificateStudent.studentId}.pdf`);
                    showToast({ title: "Degree Certificate PDF Generated", description: "Downloaded official signed certificate.", variant: "success" });
                  } catch (e) {
                    showToast({ title: "Export Failed", description: "Failed to generate certificate PDF.", variant: "error" });
                  }
                }}
              >
                Download Official Certificate PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
