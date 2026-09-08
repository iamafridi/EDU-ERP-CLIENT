"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Coins,
  ShieldCheck,
  Scale,
  GraduationCap,
  Search,
  FileText,
  Check,
  XCircle,
  Clock,
  ArrowRight,
  Download,
  Printer,
  Building2,
  Sparkles,
  RefreshCw,
  DollarSign,
  Filter,
  Users,
  Wallet,
  ChevronRight,
  Eye,
  Sliders,
  Receipt,
  FileCheck,
} from "lucide-react";
import {
  PageHeader,
  Card,
  FormField,
  Input,
  Select,
  Textarea,
  Button,
  IconButton,
  Badge,
  Modal,
  Tabs,
  ProgressBar,
} from "@/components/ui";
import DataTable, { Column } from "@/components/ui/DataTable";
import { showToast } from "@/components/dashboard/ToastFeedback";

type ScholarshipTab =
  | "active-grants"
  | "cgpa-audit"
  | "applications-pipeline"
  | "endowment-funds"
  | "ledger-sync";

interface ScholarshipGrant {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  semester: string;
  fundSource: string;
  category: "MERIT" | "FREEDOM_FIGHTER" | "NEED_BASED" | "SIBLING" | "ATHLETIC";
  waiverPercent: number;
  semesterTuition: number;
  waiverAmount: number;
  cgpa: number;
  cgpaStatus: "COMPLIANT" | "WARNING" | "BREACH_DOWNGRADED" | "SUSPENDED";
  ledgerStatus: "POSTED" | "PENDING_CREDIT" | "ON_HOLD";
  effectiveSemester: string;
  verifiedBy: string;
}

interface FinancialAidApplication {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  cgpa: number;
  familyMonthlyIncome: number;
  dependentsCount: number;
  requestedWaiverPercent: number;
  needScore: number;
  status: "SUBMITTED" | "VERIFIED" | "COMMITTEE_APPROVED" | "REJECTED";
  submittedDate: string;
  statementSummary: string;
  supportingDocuments: string[];
}

interface EndowmentFund {
  id: string;
  fundName: string;
  donorEntity: string;
  corpusTotal: number;
  annualAllocation: number;
  disbursedThisYear: number;
  remainingBalance: number;
  activeBeneficiariesCount: number;
  statutoryCategory: string;
  yieldRate: string;
}

const MOCK_GRANTS: ScholarshipGrant[] = [
  {
    id: "SCH-2026-001",
    studentId: "STU-2026001",
    studentName: "Marcus Chen",
    department: "Computer Science & Engineering",
    semester: "Term 4.2",
    fundSource: "Vice-Chancellor's 100% Merit Fellowship",
    category: "MERIT",
    waiverPercent: 100,
    semesterTuition: 75000,
    waiverAmount: 75000,
    cgpa: 3.92,
    cgpaStatus: "COMPLIANT",
    ledgerStatus: "POSTED",
    effectiveSemester: "Fall 2026",
    verifiedBy: "Prof. Dr. Evelyn Parker (Dean)",
  },
  {
    id: "SCH-2026-002",
    studentId: "STU-2026002",
    studentName: "Sophia Martinez",
    department: "Microbiology & Immunology",
    semester: "Term 3.1",
    fundSource: "Bangabandhu Freedom Fighter Trust",
    category: "FREEDOM_FIGHTER",
    waiverPercent: 100,
    semesterTuition: 68000,
    waiverAmount: 68000,
    cgpa: 3.86,
    cgpaStatus: "COMPLIANT",
    ledgerStatus: "POSTED",
    effectiveSemester: "Fall 2026",
    verifiedBy: "Office of the Registrar",
  },
  {
    id: "SCH-2026-003",
    studentId: "STU-2026003",
    studentName: "Ethan Gallagher",
    department: "Biochemistry & Genetics",
    semester: "Term 3.2",
    fundSource: "Trustee Academic Distinction Grant",
    category: "MERIT",
    waiverPercent: 50,
    semesterTuition: 72000,
    waiverAmount: 36000,
    cgpa: 3.68,
    cgpaStatus: "BREACH_DOWNGRADED",
    ledgerStatus: "PENDING_CREDIT",
    effectiveSemester: "Fall 2026",
    verifiedBy: "Scholarship Review Committee",
  },
  {
    id: "SCH-2026-004",
    studentId: "STU-2025-0144",
    studentName: "Tahmina Akter",
    department: "MBBS Clinical Sciences",
    semester: "Year 4",
    fundSource: "Apex Healthcare Need-Based Bursary",
    category: "NEED_BASED",
    waiverPercent: 75,
    semesterTuition: 120000,
    waiverAmount: 90000,
    cgpa: 3.52,
    cgpaStatus: "COMPLIANT",
    ledgerStatus: "POSTED",
    effectiveSemester: "Fall 2026",
    verifiedBy: "Financial Aid Board",
  },
  {
    id: "SCH-2026-005",
    studentId: "STU-2025-0189",
    studentName: "Farhan Tanvir",
    department: "Electrical & Electronic Engineering",
    semester: "Term 2.2",
    fundSource: "Sibling Tuition Concession Grant",
    category: "SIBLING",
    waiverPercent: 25,
    semesterTuition: 65000,
    waiverAmount: 16250,
    cgpa: 3.24,
    cgpaStatus: "COMPLIANT",
    ledgerStatus: "POSTED",
    effectiveSemester: "Fall 2026",
    verifiedBy: "Accounts Section",
  },
  {
    id: "SCH-2026-006",
    studentId: "STU-2024-0312",
    studentName: "Rashidul Hasan",
    department: "Pharmacy (B.Pharm)",
    semester: "Term 3.1",
    fundSource: "Vice-Chancellor's 100% Merit Fellowship",
    category: "MERIT",
    waiverPercent: 0,
    semesterTuition: 70000,
    waiverAmount: 0,
    cgpa: 3.38,
    cgpaStatus: "SUSPENDED",
    ledgerStatus: "ON_HOLD",
    effectiveSemester: "Fall 2026",
    verifiedBy: "Academic Council Audit",
  },
];

const MOCK_APPLICATIONS: FinancialAidApplication[] = [
  {
    id: "APP-FA-2026-101",
    studentId: "STU-2026-0882",
    studentName: "Nafis Imtiaz",
    department: "Computer Science & Engineering",
    cgpa: 3.84,
    familyMonthlyIncome: 22000,
    dependentsCount: 5,
    requestedWaiverPercent: 75,
    needScore: 92,
    status: "VERIFIED",
    submittedDate: "2026-09-12",
    statementSummary: "Sole earner father retired government clerk; supporting two younger school-going siblings.",
    supportingDocuments: ["Ward Councilor Income Certificate", "Tax Return Exemption", "Father Pension Statement"],
  },
  {
    id: "APP-FA-2026-102",
    studentId: "STU-2026-0914",
    studentName: "Humaira Tasnim",
    department: "MBBS Clinical Medicine",
    cgpa: 3.76,
    familyMonthlyIncome: 35000,
    dependentsCount: 4,
    requestedWaiverPercent: 50,
    needScore: 84,
    status: "COMMITTEE_APPROVED",
    submittedDate: "2026-09-18",
    statementSummary: "Single-mother household from rural Sylhet; consistent distinction in clinical exams.",
    supportingDocuments: ["Union Parishad Need Certificate", "HSC & SSC Official Marksheets"],
  },
  {
    id: "APP-FA-2026-103",
    studentId: "STU-2026-0955",
    studentName: "Kazi Sadman",
    department: "Biomedical Engineering",
    cgpa: 3.20,
    familyMonthlyIncome: 85000,
    dependentsCount: 2,
    requestedWaiverPercent: 50,
    needScore: 38,
    status: "REJECTED",
    submittedDate: "2026-09-22",
    statementSummary: "Household income exceeds statutory ceiling for needs-based hardship concession.",
    supportingDocuments: ["Bank Statement (Above Cutoff)"],
  },
];

const MOCK_ENDOWMENTS: EndowmentFund[] = [
  {
    id: "FND-01",
    fundName: "Vice-Chancellor's Academic Excellence Corpus",
    donorEntity: "University Board of Trustees",
    corpusTotal: 25000000,
    annualAllocation: 2500000,
    disbursedThisYear: 1850000,
    remainingBalance: 650000,
    activeBeneficiariesCount: 24,
    statutoryCategory: "Merit Distinction",
    yieldRate: "9.5% per annum",
  },
  {
    id: "FND-02",
    fundName: "Bangabandhu Freedom Fighter Memorial Trust",
    donorEntity: "Ministry of Liberation War Affairs & Trustee Endowment",
    corpusTotal: 18500000,
    annualAllocation: 1850000,
    disbursedThisYear: 1240000,
    remainingBalance: 610000,
    activeBeneficiariesCount: 16,
    statutoryCategory: "Freedom Fighter Quota",
    yieldRate: "8.8% per annum",
  },
  {
    id: "FND-03",
    fundName: "Apex Pharma Medical Research & Clinical Fellowship",
    donorEntity: "Apex Pharmaceuticals Ltd. Corporate CSR",
    corpusTotal: 12000000,
    annualAllocation: 1200000,
    disbursedThisYear: 900000,
    remainingBalance: 300000,
    activeBeneficiariesCount: 10,
    statutoryCategory: "Clinical Research",
    yieldRate: "10.2% per annum",
  },
  {
    id: "FND-04",
    fundName: "Alumni Association Hardship Emergency Bursary",
    donorEntity: "Global Medical College Alumni Federation",
    corpusTotal: 6500000,
    annualAllocation: 650000,
    disbursedThisYear: 450000,
    remainingBalance: 200000,
    activeBeneficiariesCount: 8,
    statutoryCategory: "Hardship & Emergency",
    yieldRate: "7.5% per annum",
  },
];

export default function ScholarshipsPage() {
  const { user } = useAuthStore();
  const { can, roleIs } = usePermission();

  const [activeTab, setActiveTab] = useState<ScholarshipTab>("active-grants");
  const [grants, setGrants] = useState<ScholarshipGrant[]>(MOCK_GRANTS);
  const [applications, setApplications] = useState<FinancialAidApplication[]>(MOCK_APPLICATIONS);
  const [endowments, setEndowments] = useState<EndowmentFund[]>(MOCK_ENDOWMENTS);

  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<FinancialAidApplication | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{ scanned: number; compliant: number; downgraded: number; suspended: number } | null>(null);

  const [grantForm, setGrantForm] = useState({
    studentId: "",
    studentName: "",
    department: "Computer Science & Engineering",
    semester: "Fall 2026",
    fundSource: "Vice-Chancellor's 100% Merit Fellowship",
    category: "MERIT" as ScholarshipGrant["category"],
    waiverPercent: 100,
    semesterTuition: 75000,
    cgpa: 3.85,
  });

  const isEditor = can("update", "scholarships") || roleIs("super-admin", "domain-admin", "staff");

  const totalAllocatedWaiver = useMemo(() => {
    return grants.reduce((acc, g) => acc + g.waiverAmount, 0);
  }, [grants]);

  const totalBeneficiaries = useMemo(() => {
    return grants.filter((g) => g.waiverPercent > 0).length;
  }, [grants]);

  const totalEndowmentCorpus = useMemo(() => {
    return endowments.reduce((acc, e) => acc + e.corpusTotal, 0);
  }, [endowments]);

  const handleCreateGrant = (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedAmount = (grantForm.semesterTuition * grantForm.waiverPercent) / 100;
    let cgpaStatus: ScholarshipGrant["cgpaStatus"] = "COMPLIANT";
    if (grantForm.category === "MERIT") {
      if (grantForm.cgpa < 3.50) cgpaStatus = "SUSPENDED";
      else if (grantForm.cgpa < 3.80 && grantForm.waiverPercent === 100) cgpaStatus = "BREACH_DOWNGRADED";
    }

    const newGrant: ScholarshipGrant = {
      id: `SCH-2026-00${grants.length + 1}`,
      studentId: grantForm.studentId || `STU-202600${grants.length + 1}`,
      studentName: grantForm.studentName,
      department: grantForm.department,
      semester: grantForm.semester,
      fundSource: grantForm.fundSource,
      category: grantForm.category,
      waiverPercent: grantForm.waiverPercent,
      semesterTuition: Number(grantForm.semesterTuition),
      waiverAmount: calculatedAmount,
      cgpa: Number(grantForm.cgpa),
      cgpaStatus,
      ledgerStatus: "PENDING_CREDIT",
      effectiveSemester: grantForm.semester,
      verifiedBy: user?.name || "Financial Aid Committee",
    };

    setGrants([newGrant, ...grants]);
    setShowGrantModal(false);
    setGrantForm({
      studentId: "",
      studentName: "",
      department: "Computer Science & Engineering",
      semester: "Fall 2026",
      fundSource: "Vice-Chancellor's 100% Merit Fellowship",
      category: "MERIT",
      waiverPercent: 100,
      semesterTuition: 75000,
      cgpa: 3.85,
    });
    setSuccessMsg(`Scholarship award of ৳ ${calculatedAmount.toLocaleString()} granted to ${newGrant.studentName}.`);
    setTimeout(() => setSuccessMsg(""), 4500);
  };

  const handleRunCGPAAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      let comp = 0;
      let down = 0;
      let susp = 0;

      const updated = grants.map((g) => {
        if (g.category === "MERIT") {
          if (g.cgpa >= 3.80) {
            comp++;
            return { ...g, cgpaStatus: "COMPLIANT" as const, waiverPercent: 100, waiverAmount: g.semesterTuition };
          } else if (g.cgpa >= 3.50) {
            down++;
            return {
              ...g,
              cgpaStatus: "BREACH_DOWNGRADED" as const,
              waiverPercent: 50,
              waiverAmount: g.semesterTuition * 0.5,
            };
          } else {
            susp++;
            return {
              ...g,
              cgpaStatus: "SUSPENDED" as const,
              waiverPercent: 0,
              waiverAmount: 0,
              ledgerStatus: "ON_HOLD" as const,
            };
          }
        } else {
          comp++;
          return g;
        }
      });

      setGrants(updated);
      setAuditResult({
        scanned: grants.length,
        compliant: comp,
        downgraded: down,
        suspended: susp,
      });
      setIsAuditing(false);
      setSuccessMsg("Statutory UGC CGPA maintenance audit completed across all active scholarship cohorts.");
      setTimeout(() => setSuccessMsg(""), 5000);
    }, 1200);
  };

  const handleBatchPostToLedger = () => {
    const updated = grants.map((g) => ({
      ...g,
      ledgerStatus: g.waiverAmount > 0 ? ("POSTED" as const) : g.ledgerStatus,
    }));
    setGrants(updated);
    setSuccessMsg(`Successfully synchronized ৳ ${totalAllocatedWaiver.toLocaleString()} in tuition credits directly to Student Accounts Ledgers.`);
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  const handleApproveApplication = (appId: string, approvedPercent: number) => {
    setApplications(
      applications.map((a) =>
        a.id === appId ? { ...a, status: "COMMITTEE_APPROVED" as const, requestedWaiverPercent: approvedPercent } : a
      )
    );
    const target = applications.find((a) => a.id === appId);
    if (target) {
      const tuition = 75000;
      const calculated = (tuition * approvedPercent) / 100;
      const newGrant: ScholarshipGrant = {
        id: `SCH-2026-00${grants.length + 1}`,
        studentId: target.studentId,
        studentName: target.studentName,
        department: target.department,
        semester: "Fall 2026",
        fundSource: "Alumni Association Hardship Emergency Bursary",
        category: "NEED_BASED",
        waiverPercent: approvedPercent,
        semesterTuition: tuition,
        waiverAmount: calculated,
        cgpa: target.cgpa,
        cgpaStatus: "COMPLIANT",
        ledgerStatus: "PENDING_CREDIT",
        effectiveSemester: "Fall 2026",
        verifiedBy: user?.name || "Financial Aid Committee",
      };
      setGrants([newGrant, ...grants]);
    }
    setSuccessMsg(`Application approved at ${approvedPercent}% waiver. Enrolled in scholarship ledger.`);
    setSelectedApp(null);
    setTimeout(() => setSuccessMsg(""), 4500);
  };

  const handleRejectApplication = (appId: string) => {
    setApplications(
      applications.map((a) => (a.id === appId ? { ...a, status: "REJECTED" as const } : a))
    );
    setSuccessMsg("Application rejected based on statutory rubric criteria.");
    setSelectedApp(null);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const grantColumns: Column<ScholarshipGrant>[] = [
    {
      header: "Student & Dept",
      accessor: (row) => (
        <div>
          <div className="font-semibold text-text text-xs flex items-center gap-1.5">
            <span>{row.studentName}</span>
            <span className="font-mono text-[11px] text-text-muted">({row.studentId})</span>
          </div>
          <div className="text-[11px] text-text-muted">{row.department} • {row.semester}</div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Endowment Fund Source",
      accessor: (row) => (
        <div>
          <div className="text-xs font-medium text-text">{row.fundSource}</div>
          <Badge
            variant={
              row.category === "MERIT"
                ? "gold"
                : row.category === "FREEDOM_FIGHTER"
                ? "success"
                : row.category === "NEED_BASED"
                ? "primary"
                : "neutral"
            }
            size="sm"
            className="mt-1"
          >
            {row.category.replace("_", " ")}
          </Badge>
        </div>
      ),
      sortable: true,
    },
    {
      header: "CGPA & Retention Status",
      accessor: (row) => (
        <div>
          <div className="font-mono font-bold text-xs text-text flex items-center gap-1.5">
            <span>{row.cgpa.toFixed(2)} CGPA</span>
            {row.cgpa >= 3.80 ? (
              <ShieldCheck size={13} className="text-emerald-500" />
            ) : row.cgpa >= 3.50 ? (
              <AlertTriangle size={13} className="text-amber-500" />
            ) : (
              <XCircle size={13} className="text-red-500" />
            )}
          </div>
          <Badge
            variant={
              row.cgpaStatus === "COMPLIANT"
                ? "success"
                : row.cgpaStatus === "BREACH_DOWNGRADED"
                ? "warning"
                : "danger"
            }
            size="sm"
            className="mt-1"
          >
            {row.cgpaStatus === "COMPLIANT"
              ? "Eligible (100%)"
              : row.cgpaStatus === "BREACH_DOWNGRADED"
              ? "Downgraded (50%)"
              : "Suspended (0%)"}
          </Badge>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Tuition Waiver & Credit",
      accessor: (row) => (
        <div>
          <div className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
            ৳ {row.waiverAmount.toLocaleString()} BDT
          </div>
          <div className="text-[11px] text-text-muted">
            {row.waiverPercent}% of ৳ {row.semesterTuition.toLocaleString()}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Ledger State",
      accessor: (row) => (
        <Badge
          variant={
            row.ledgerStatus === "POSTED"
              ? "success"
              : row.ledgerStatus === "PENDING_CREDIT"
              ? "warning"
              : "danger"
          }
          size="sm"
        >
          {row.ledgerStatus === "POSTED"
            ? "Credited to Ledger"
            : row.ledgerStatus === "PENDING_CREDIT"
            ? "Pending Sync"
            : "On Hold"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <IconButton
            variant="ghost"
            size="sm"
            label="View Award Certificate"
            onClick={() => {
              setSuccessMsg(`Opening verifiable award voucher for ${row.studentName}.`);
              setTimeout(() => setSuccessMsg(""), 3000);
            }}
            icon={<FileText size={14} />}
          />
          {isEditor && (
            <IconButton
              variant="danger"
              size="sm"
              label="Revoke Grant"
              onClick={() => {
                if (confirm(`Revoke scholarship grant for ${row.studentName}?`)) {
                  setGrants(grants.filter((g) => g.id !== row.id));
                  setSuccessMsg(`Grant revoked for ${row.studentName}.`);
                  setTimeout(() => setSuccessMsg(""), 4000);
                }
              }}
              icon={<Trash2 size={14} />}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Endowment, Financial Aid & Merit Stipend Governance"
        subtitle="Statutory merit waivers, CGPA retention thresholds, needs-based bursary evaluation, and student accounts ledger credit synchronizer."
        badge={<Badge tone="gold">UGC Statutory Aid Suite</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRunCGPAAudit}
              disabled={isAuditing}
              icon={<RefreshCw size={14} className={isAuditing ? "animate-spin" : ""} />}
            >
              {isAuditing ? "Auditing CGPA..." : "Run CGPA Audit"}
            </Button>
            {isEditor && (
              <Button
                variant="gold"
                onClick={() => setShowGrantModal(true)}
                icon={<Plus size={15} />}
              >
                Award Scholarship
              </Button>
            )}
          </div>
        }
      />

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Metric Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Semester Aid Disbursed</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            ৳ {totalAllocatedWaiver.toLocaleString()}
          </div>
          <p className="text-[11px] text-text-muted">Direct tuition credits credited to student ledgers</p>
        </Card>

        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Active Beneficiaries</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-text">{totalBeneficiaries} Scholars</div>
          <p className="text-[11px] text-text-muted">Merit, freedom fighter, needs-based & quota</p>
        </Card>

        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Endowment Corpus Total</span>
            <Coins className="w-4 h-4 text-[#B98B4B]" />
          </div>
          <div className="text-2xl font-bold font-mono text-text">
            ৳ {(totalEndowmentCorpus / 10000000).toFixed(2)} Crore
          </div>
          <p className="text-[11px] text-text-muted">4 dedicated philanthropy & trust funds</p>
        </Card>

        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Retention Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-text">83.3%</div>
          <p className="text-[11px] text-text-muted">Scholars maintaining 3.80+ CGPA baseline</p>
        </Card>
      </div>

      {/* CGPA Audit Summary Alert */}
      {auditResult && (
        <Card pad="md" className="border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Scale size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text">Semester CGPA Compliance Audit Outcome</h4>
                <p className="text-xs text-text-muted mt-0.5">
                  Scanned {auditResult.scanned} active scholars against statutory minimum retaining thresholds.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success">{auditResult.compliant} Compliant (Full Waiver)</Badge>
              <Badge variant="warning">{auditResult.downgraded} Downgraded to 50%</Badge>
              <Badge variant="danger">{auditResult.suspended} Suspended on Probation</Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs Suite */}
      <Tabs
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as ScholarshipTab)}
        tabs={[
          { id: "active-grants", label: "Active Scholarships Ledger", count: grants.length },
          { id: "cgpa-audit", label: "CGPA Maintenance Rules & Retention" },
          { id: "applications-pipeline", label: "Financial Aid Applications", count: applications.length },
          { id: "endowment-funds", label: "Endowment Trusts & Corpus", count: endowments.length },
          { id: "ledger-sync", label: "Student Accounts Ledger Offset" },
        ]}
      />

      {/* Tab 1: Active Grants Ledger */}
      {activeTab === "active-grants" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text">Awarded Student Waivers & Stipends</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Printer size={13} />}
                onClick={() => {
                  window.print();
                }}
              >
                Print Official Ledger
              </Button>
              <Button
                variant="gold"
                size="sm"
                icon={<Receipt size={13} />}
                onClick={handleBatchPostToLedger}
              >
                Post All to Accounts Ledger
              </Button>
            </div>
          </div>

          <Card pad="none" className="overflow-hidden">
            <DataTable
              data={grants}
              columns={grantColumns}
              searchable={true}
              searchPlaceholder="Search student, department, or fund source..."
              searchField="studentName"
              pagination={true}
              pageSize={8}
            />
          </Card>
        </div>
      )}

      {/* Tab 2: CGPA Maintenance Rules */}
      {activeTab === "cgpa-audit" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card pad="md" className="border-emerald-500/30 bg-emerald-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Tier 1: Full Distinction (100% Waiver)
                </span>
                <Badge variant="success">CGPA ≥ 3.80</Badge>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Full 100% tuition coverage for top 5% cohort performers. Must maintain a minimum of 15 registered credits per term with zero disciplinary flags.
              </p>
              <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-xs">
                <span className="text-text-muted">Grace Period:</span>
                <span className="font-semibold text-text">None (Immediate Downgrade)</span>
              </div>
            </Card>

            <Card pad="md" className="border-amber-500/30 bg-amber-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Tier 2: Honors Concession (50% Waiver)
                </span>
                <Badge variant="warning">3.50 ≤ CGPA &lt; 3.80</Badge>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Automatically triggered when a Tier 1 scholar falls below 3.80. Receives 50% tuition remission for one probationary term to recover CGPA.
              </p>
              <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs">
                <span className="text-text-muted">Recovery Window:</span>
                <span className="font-semibold text-text">1 Academic Term</span>
              </div>
            </Card>

            <Card pad="md" className="border-red-500/30 bg-red-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
                  Tier 3: Suspension on Probation
                </span>
                <Badge variant="danger">CGPA &lt; 3.50</Badge>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Waiver is temporarily suspended (0% aid). Student must pay standard tuition until their cumulative GPA is restored to 3.50+ via retakes.
              </p>
              <div className="pt-2 border-t border-red-500/20 flex items-center justify-between text-xs">
                <span className="text-text-muted">Status in Accounts:</span>
                <span className="font-semibold text-red-500">Hold Active / Regular Fees</span>
              </div>
            </Card>
          </div>

          <Card pad="md" className="space-y-4">
            <h4 className="text-sm font-bold text-text">Retention Simulator & Automated Warning Engine</h4>
            <p className="text-xs text-text-muted">
              The retention engine cross-references real-time marks published by the Controller of Examinations with statutory scholarship retention bylaws.
            </p>
            <div className="p-4 rounded-xl bg-surface-muted/50 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B98B4B]/10 text-[#B98B4B] flex items-center justify-center">
                  <Sliders size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-text">Automated Warning SMS & Email Dispatcher</div>
                  <div className="text-[11px] text-text-muted">
                    Notifies students currently in the 3.50 to 3.79 zone of impending waiver downgrade risk before midterm enrollment.
                  </div>
                </div>
              </div>
              <Button
                variant="gold"
                size="sm"
                onClick={() => {
                  setSuccessMsg("Dispatched CGPA retention advisory SMS & Email notifications to 14 students.");
                  setTimeout(() => setSuccessMsg(""), 4500);
                }}
              >
                Dispatch Advisories
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Applications Pipeline */}
      {activeTab === "applications-pipeline" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text">Financial Aid & Needs-Based Intake Pipeline</h3>
              <p className="text-xs text-text-muted">
                Applications screened via family income criteria, dependency load, and certified municipal ward documents.
              </p>
            </div>
            <Button
              variant="gold"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => setShowAppModal(true)}
            >
              New Application
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {applications.map((app) => (
              <Card key={app.id} pad="md" className="flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm text-text">{app.studentName}</div>
                      <div className="text-[11px] text-text-muted font-mono">{app.studentId} • {app.department}</div>
                    </div>
                    <Badge
                      variant={
                        app.status === "COMMITTEE_APPROVED"
                          ? "success"
                          : app.status === "VERIFIED"
                          ? "gold"
                          : app.status === "REJECTED"
                          ? "danger"
                          : "neutral"
                      }
                      size="sm"
                    >
                      {app.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Need Score Index:</span>
                      <span className="font-mono font-bold text-text">{app.needScore} / 100</span>
                    </div>
                    <ProgressBar
                      value={app.needScore}
                      variant={app.needScore >= 80 ? "success" : app.needScore >= 50 ? "gold" : "danger"}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-surface-muted/40 p-2.5 rounded-lg border border-border/50">
                    <div>
                      <span className="text-text-muted block text-[10px]">Monthly Income:</span>
                      <span className="font-mono font-semibold text-text">৳ {app.familyMonthlyIncome.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[10px]">Dependents:</span>
                      <span className="font-mono font-semibold text-text">{app.dependentsCount} Family Members</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[10px]">Current CGPA:</span>
                      <span className="font-mono font-semibold text-text">{app.cgpa.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[10px]">Requested Aid:</span>
                      <span className="font-mono font-semibold text-text">{app.requestedWaiverPercent}% Waiver</span>
                    </div>
                  </div>

                  <p className="text-xs text-text-muted line-clamp-2 italic">
                    "{app.statementSummary}"
                  </p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedApp(app)}
                    icon={<Eye size={13} />}
                  >
                    Review Dossier
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Endowment Funds & Corpus */}
      {activeTab === "endowment-funds" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text">Philanthropy Endowments & Trust Corpus Management</h3>
              <p className="text-xs text-text-muted">
                Statutory corpus balances, annual interest yields, and disbursement drawdown tracking.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<Download size={14} />}
              onClick={() => {
                setSuccessMsg("Exported statutory donor endowment audit statement (PDF/XLSX).");
                setTimeout(() => setSuccessMsg(""), 4000);
              }}
            >
              Export Donor Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {endowments.map((fund) => {
              const usagePercent = Math.round((fund.disbursedThisYear / fund.annualAllocation) * 100);
              return (
                <Card key={fund.id} pad="md" className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-text">{fund.fundName}</h4>
                      <p className="text-xs text-text-muted mt-0.5">{fund.donorEntity}</p>
                    </div>
                    <Badge variant="gold" size="sm">{fund.statutoryCategory}</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-surface-muted/50 border border-border text-xs">
                    <div>
                      <span className="text-[10px] text-text-muted block">Corpus Total:</span>
                      <span className="font-mono font-bold text-text">৳ {(fund.corpusTotal / 100000).toFixed(1)} Lakh</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted block">Annual Yield:</span>
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{fund.yieldRate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted block">Active Scholars:</span>
                      <span className="font-mono font-bold text-text">{fund.activeBeneficiariesCount} Students</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Annual Drawdown Disbursed:</span>
                      <span className="font-mono font-bold text-text">
                        ৳ {fund.disbursedThisYear.toLocaleString()} / ৳ {fund.annualAllocation.toLocaleString()} ({usagePercent}%)
                      </span>
                    </div>
                    <ProgressBar
                      value={usagePercent}
                      variant={usagePercent > 85 ? "danger" : usagePercent > 60 ? "gold" : "success"}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Ledger Offset Sync */}
      {activeTab === "ledger-sync" && (
        <div className="space-y-6">
          <Card pad="md" className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-text">Student Accounts Receivable Credit Offset Gateway</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Direct reconciliation between the University Financial Aid Trust and Accounts Receivable Ledgers.
                </p>
              </div>
              <Badge variant="success">Auto-Reconciliation Engine</Badge>
            </div>

            <div className="p-4 rounded-xl bg-surface-muted/40 border border-border grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-text-muted">Total Pending Disbursals:</span>
                <div className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                  ৳ {grants.filter((g) => g.ledgerStatus === "PENDING_CREDIT").reduce((a, b) => a + b.waiverAmount, 0).toLocaleString()}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-text-muted">Already Credited to Student Invoices:</span>
                <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  ৳ {grants.filter((g) => g.ledgerStatus === "POSTED").reduce((a, b) => a + b.waiverAmount, 0).toLocaleString()}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-text-muted">General Ledger Batch Journal:</span>
                <div className="font-mono font-semibold text-text text-xs">GL-JV-2026-AID-088</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="gold"
                icon={<Receipt size={14} />}
                onClick={handleBatchPostToLedger}
              >
                Execute 1-Click Batch Ledger Posting
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Grant Award Modal */}
      <Modal
        isOpen={showGrantModal}
        onClose={() => setShowGrantModal(false)}
        title="Award Scholarship / Tuition Waiver"
        description="Allocate statutory merit waiver or trust grant to student ledger"
        size="md"
      >
        <form onSubmit={handleCreateGrant} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Student Full Name" required>
              <Input
                type="text"
                value={grantForm.studentName}
                onChange={(e) => setGrantForm((p) => ({ ...p, studentName: e.target.value }))}
                placeholder="e.g. Ayesha Siddiqua"
                required
              />
            </FormField>
            <FormField label="Student ID / Roll">
              <Input
                type="text"
                value={grantForm.studentId}
                onChange={(e) => setGrantForm((p) => ({ ...p, studentId: e.target.value }))}
                placeholder="STU-2026007"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Academic Department" required>
              <Select
                value={grantForm.department}
                onChange={(e) => setGrantForm((p) => ({ ...p, department: e.target.value }))}
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Microbiology & Immunology">Microbiology & Immunology</option>
                <option value="Biochemistry & Genetics">Biochemistry & Genetics</option>
                <option value="MBBS Clinical Sciences">MBBS Clinical Sciences</option>
                <option value="Pharmacy (B.Pharm)">Pharmacy (B.Pharm)</option>
              </Select>
            </FormField>
            <FormField label="Category Scheme" required>
              <Select
                value={grantForm.category}
                onChange={(e) => setGrantForm((p) => ({ ...p, category: e.target.value as any }))}
              >
                <option value="MERIT">Merit Distinction (Top Tier)</option>
                <option value="FREEDOM_FIGHTER">Freedom Fighter Quota</option>
                <option value="NEED_BASED">Needs-Based Financial Aid</option>
                <option value="SIBLING">Sibling Concession</option>
                <option value="ATHLETIC">Athletic / Sports Scholar</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Funding Trust / Source" required>
            <Select
              value={grantForm.fundSource}
              onChange={(e) => setGrantForm((p) => ({ ...p, fundSource: e.target.value }))}
            >
              <option value="Vice-Chancellor's 100% Merit Fellowship">Vice-Chancellor's 100% Merit Fellowship</option>
              <option value="Bangabandhu Freedom Fighter Memorial Trust">Bangabandhu Freedom Fighter Memorial Trust</option>
              <option value="Apex Pharma Medical Research Fellowship">Apex Pharma Medical Research Fellowship</option>
              <option value="Alumni Association Hardship Emergency Bursary">Alumni Association Hardship Emergency Bursary</option>
              <option value="Sibling Tuition Concession Grant">Sibling Tuition Concession Grant</option>
            </Select>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Waiver Percentage (%)" required>
              <Select
                value={grantForm.waiverPercent}
                onChange={(e) => setGrantForm((p) => ({ ...p, waiverPercent: Number(e.target.value) }))}
              >
                <option value={100}>100% (Full Waiver)</option>
                <option value={75}>75% (Three-Quarter)</option>
                <option value={50}>50% (Half Tuition)</option>
                <option value={25}>25% (Quarter Waiver)</option>
              </Select>
            </FormField>

            <FormField label="Semester Fee (৳)" required>
              <Input
                type="number"
                value={grantForm.semesterTuition}
                onChange={(e) => setGrantForm((p) => ({ ...p, semesterTuition: Number(e.target.value) }))}
                className="font-mono"
              />
            </FormField>

            <FormField label="Current CGPA" required>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="4.0"
                value={grantForm.cgpa}
                onChange={(e) => setGrantForm((p) => ({ ...p, cgpa: Number(e.target.value) }))}
                className="font-mono"
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setShowGrantModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold">
              Grant Scholarship
            </Button>
          </div>
        </form>
      </Modal>

      {/* Review Application Dossier Modal */}
      {selectedApp && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedApp(null)}
          title={`Financial Aid Dossier: ${selectedApp.studentName}`}
          description={`Application Ref #${selectedApp.id} • Submitted ${selectedApp.submittedDate}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-surface-muted/50 border border-border text-xs">
              <div>
                <span className="text-text-muted block text-[10px]">Monthly Household Income:</span>
                <span className="font-mono font-bold text-text">৳ {selectedApp.familyMonthlyIncome.toLocaleString()} BDT</span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px]">Family Size:</span>
                <span className="font-semibold text-text">{selectedApp.dependentsCount} Dependents</span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px]">Academic Standing:</span>
                <span className="font-mono font-bold text-text">{selectedApp.cgpa.toFixed(2)} CGPA</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text">Student Hardship Statement:</label>
              <div className="p-3 rounded-xl bg-surface-muted/30 border border-border text-xs text-text-muted italic leading-relaxed">
                "{selectedApp.statementSummary}"
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text">Verified Supporting Documents:</label>
              <div className="flex flex-wrap gap-2">
                {selectedApp.supportingDocuments.map((doc, idx) => (
                  <Badge key={idx} variant="neutral" size="sm" className="flex items-center gap-1">
                    <FileCheck size={12} className="text-emerald-500" />
                    <span>{doc}</span>
                  </Badge>
                ))}
              </div>
            </div>

            {selectedApp.status !== "COMMITTEE_APPROVED" && selectedApp.status !== "REJECTED" && (
              <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRejectApplication(selectedApp.id)}
                >
                  Reject Application
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApproveApplication(selectedApp.id, 50)}
                  >
                    Approve 50%
                  </Button>
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => handleApproveApplication(selectedApp.id, selectedApp.requestedWaiverPercent)}
                  >
                    Approve Full {selectedApp.requestedWaiverPercent}%
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* New Application Modal */}
      <Modal
        isOpen={showAppModal}
        onClose={() => setShowAppModal(false)}
        title="Submit Financial Aid Application"
        description="Intake form for student hardship or need-based assistance"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formTarget = e.currentTarget;
            const newApp: FinancialAidApplication = {
              id: `APP-FA-2026-${100 + applications.length + 1}`,
              studentId: (formTarget.elements.namedItem("studentId") as HTMLInputElement).value || "STU-2026-0999",
              studentName: (formTarget.elements.namedItem("studentName") as HTMLInputElement).value,
              department: (formTarget.elements.namedItem("dept") as HTMLSelectElement).value,
              cgpa: Number((formTarget.elements.namedItem("cgpa") as HTMLInputElement).value),
              familyMonthlyIncome: Number((formTarget.elements.namedItem("income") as HTMLInputElement).value),
              dependentsCount: Number((formTarget.elements.namedItem("dependents") as HTMLInputElement).value),
              requestedWaiverPercent: Number((formTarget.elements.namedItem("waiverReq") as HTMLSelectElement).value),
              needScore: 85,
              status: "SUBMITTED",
              submittedDate: new Date().toISOString().split("T")[0],
              statementSummary: (formTarget.elements.namedItem("statement") as HTMLTextAreaElement).value,
              supportingDocuments: ["Ward Certificate", "Income Statement"],
            };
            setApplications([newApp, ...applications]);
            setShowAppModal(false);
            setSuccessMsg(`Application for ${newApp.studentName} submitted to Financial Aid Board.`);
            setTimeout(() => setSuccessMsg(""), 4500);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Student Full Name" required>
              <Input name="studentName" required placeholder="e.g. Mahia Zaman" />
            </FormField>
            <FormField label="Student ID / Roll">
              <Input name="studentId" placeholder="STU-2026-0999" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Department" required>
              <Select name="dept">
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="MBBS Clinical Medicine">MBBS Clinical Medicine</option>
                <option value="Biochemistry & Genetics">Biochemistry & Genetics</option>
                <option value="Pharmacy (B.Pharm)">Pharmacy (B.Pharm)</option>
              </Select>
            </FormField>
            <FormField label="Current CGPA" required>
              <Input name="cgpa" type="number" step="0.01" defaultValue="3.65" required />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Family Income (৳/Mo)" required>
              <Input name="income" type="number" defaultValue="28000" required />
            </FormField>
            <FormField label="Dependents" required>
              <Input name="dependents" type="number" defaultValue="4" required />
            </FormField>
            <FormField label="Requested Aid (%)" required>
              <Select name="waiverReq">
                <option value={100}>100%</option>
                <option value={75}>75%</option>
                <option value={50}>50%</option>
                <option value={25}>25%</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Hardship Statement" required>
            <Textarea
              name="statement"
              required
              rows={3}
              placeholder="State reason for aid request, economic background, and supporting family situation..."
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setShowAppModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold">
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
