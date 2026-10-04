"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Download,
  Eye,
  FileText,
  Printer,
  CheckCircle2,
  ClipboardList,
  Users,
  CreditCard,
  GraduationCap,
  Building2,
  Wallet,
  Receipt,
  PieChart,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Award,
  Layers,
  Percent,
  Landmark,
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
  ProgressBar,
} from "@/components/ui";

const REPORT_TYPES = [
  { id: "grade-sheet", label: "Grade Sheet", description: "Per course grade summary and cohorts", icon: ClipboardList, color: "bg-blue-50 text-blue-600", roles: ["super-admin", "domain-admin", "faculty"] },
  { id: "transcript", label: "Academic Transcript", description: "Per student collegiate academic dossier", icon: GraduationCap, color: "bg-purple-50 text-purple-600", roles: ["super-admin", "domain-admin", "faculty", "student"] },
  { id: "attendance-summary", label: "Attendance Summary", description: "Class-wise attendance percentage report", icon: Users, color: "bg-emerald-50 text-emerald-600", roles: ["super-admin", "domain-admin", "faculty"] },
  { id: "fee-collection", label: "Fee Collection Report", description: "Dues clearing and payments summary", icon: CreditCard, color: "bg-amber-50 text-amber-600", roles: ["super-admin", "domain-admin"] },
  { id: "student-fee-ledger", label: "Student Fee Ledger", description: "Individual student billing statement", icon: Receipt, color: "bg-red-50 text-red-600", roles: ["super-admin", "domain-admin", "staff"] },
  { id: "expense-summary", label: "Expense Breakdown", description: "Operational campus spending by category", icon: TrendingDown, color: "bg-rose-50 text-rose-600", roles: ["super-admin", "domain-admin"] },
  { id: "budget-vs-actual", label: "Budget vs Actual", description: "Fiscal appropriation vs expenditure", icon: PieChart, color: "bg-violet-50 text-violet-600", roles: ["super-admin", "domain-admin"] },
  { id: "payroll-disbursement", label: "Payroll Disbursement", description: "Staff salary clearance details", icon: Wallet, color: "bg-indigo-50 text-indigo-600", roles: ["super-admin", "domain-admin"] },
  { id: "receipts-collection", label: "Receipts Collection", description: "Bursar vouchers issued and totals", icon: Receipt, color: "bg-teal-50 text-teal-600", roles: ["super-admin", "domain-admin", "staff"] },
  { id: "financial-overview", label: "Financial Position", description: "Combined revenue, disbursements & net surplus", icon: TrendingUp, color: "bg-emerald-50 text-emerald-600", roles: ["super-admin", "domain-admin"] },
  { id: "library-overdue", label: "Library Circulation", description: "Overdue books and library fines", icon: BookOpen, color: "bg-rose-50 text-rose-600", roles: ["super-admin", "domain-admin", "staff"] },
  { id: "admission-merit", label: "Admission Merit Dossier", description: "Student admission rankings and quotas", icon: Users, color: "bg-cyan-50 text-cyan-600", roles: ["super-admin", "domain-admin"] },
  { id: "department-stats", label: "Faculty Analytics", description: "Cohort performance per department", icon: Building2, color: "bg-orange-50 text-orange-600", roles: ["super-admin", "domain-admin"] },
];

interface UgcMetric {
  department: string;
  enrolledStudents: number;
  femaleCount: number;
  femalePct: number;
  fullTimeFaculty: number;
  phdFaculty: number;
  tsr: string;
  labUtilization: number;
  ugcComplianceStatus: "Compliant" | "Action Required";
}

const ugcBanbeisMetrics: UgcMetric[] = [
  {
    department: "Computer Science & Engineering",
    enrolledStudents: 620,
    femaleCount: 228,
    femalePct: 36.8,
    fullTimeFaculty: 31,
    phdFaculty: 14,
    tsr: "1 : 20.0",
    labUtilization: 92.4,
    ugcComplianceStatus: "Compliant",
  },
  {
    department: "Electrical & Electronic Engineering",
    enrolledStudents: 380,
    femaleCount: 114,
    femalePct: 30.0,
    fullTimeFaculty: 20,
    phdFaculty: 9,
    tsr: "1 : 19.0",
    labUtilization: 88.0,
    ugcComplianceStatus: "Compliant",
  },
  {
    department: "School of Business (BBA / MBA)",
    enrolledStudents: 540,
    femaleCount: 248,
    femalePct: 45.9,
    fullTimeFaculty: 24,
    phdFaculty: 11,
    tsr: "1 : 22.5",
    labUtilization: 78.5,
    ugcComplianceStatus: "Compliant",
  },
  {
    department: "Biomedical & Microbiology",
    enrolledStudents: 290,
    femaleCount: 168,
    femalePct: 57.9,
    fullTimeFaculty: 16,
    phdFaculty: 8,
    tsr: "1 : 18.1",
    labUtilization: 94.2,
    ugcComplianceStatus: "Compliant",
  },
];

interface ReportRow {
  id: string;
  title: string;
  type: string;
  generatedDate: string;
  status: string;
  createdBy: string;
}

export default function ReportsPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "catalog" | "ugc-banbeis" | "tsr-gender" | "retention-cohorts" | "tuition-audit"
  >("catalog");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [previewReport, setPreviewReport] = useState<ReportRow | null>(null);

  const [reportTitle, setReportTitle] = useState("");
  const [reportType, setReportType] = useState("attendance-summary");
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");
  const [department, setDepartment] = useState("");

  const isAdmin = roleIs("domain-admin", "super-admin");

  const { data: reports = [], isLoading } = useQuery<ReportRow[]>({
    queryKey: ["reports"],
    queryFn: api.getReports,
  });

  const generateMutation = useMutation({
    mutationFn: api.generateReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setSuccessMsg("Dossier report compiled successfully.");
      setShowGenerateModal(false);
      resetForm();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const resetForm = () => {
    setReportTitle("");
    setReportType("attendance-summary");
    setDateRangeStart("");
    setDateRangeEnd("");
    setDepartment("");
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const typeConfig = REPORT_TYPES.find((r) => r.id === reportType);
    generateMutation.mutate({
      title: reportTitle || typeConfig?.label || "Report",
      type: typeConfig?.label || reportType,
      dateRange: `${dateRangeStart || "N/A"} — ${dateRangeEnd || "N/A"}`,
      createdBy: user?.name || "System",
    });
  };

  const filteredTypes = REPORT_TYPES.filter((r) => r.roles.includes(user?.role || ""));

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Institutional Intelligence, UGC / BANBEIS Statutory Returns & Audits"
        subtitle="Generate official accreditation returns, Teacher-Student Ratio (TSR) analytics, cohort retention and 4-year completion efficiency indices, and tuition vs scholarship remittance ledgers."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => alert("Exporting full institutional audit pack (ZIP)...")}
              leftIcon={<Download size={14} />}
            >
              Export Audit Pack
            </Button>
            <Button
              variant="gold"
              size="md"
              onClick={() => setShowGenerateModal(true)}
              leftIcon={<FileText size={14} />}
            >
              Generate Report
            </Button>
          </div>
        }
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
            <span className="text-xs font-semibold text-text-muted uppercase">Overall TSR Ratio</span>
            <Badge variant="success" size="sm">UGC Standard ≤ 1:25</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">
            1 : 20.3 <span className="text-xs font-normal text-text-muted">Faculty Ratio</span>
          </div>
          <span className="text-xs text-text-muted mt-1 block">91 Full-time Faculty Members</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Female Student Ratio</span>
            <Badge variant="gold" size="sm">Gender Parity</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-gold">
            41.2% <span className="text-xs font-normal text-text-muted">Female Scholars</span>
          </div>
          <span className="text-xs text-text-muted mt-1 block">758 / 1,830 Total Students</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">4-Yr On-Time Grad</span>
            <Badge variant="primary" size="sm">Cohort 2022</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-primary">
            78.4% <span className="text-xs font-normal text-text-muted">Efficiency</span>
          </div>
          <span className="text-xs text-text-muted mt-1 block">4% Dropout • 17.6% Retaining</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Waiver Remission</span>
            <Badge variant="gold" size="sm">Bot Subsidies</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-text">
            ৳ 62.5 Lac <span className="text-xs font-normal text-text-muted">This Term</span>
          </div>
          <span className="text-xs text-text-muted mt-1 block">18.5% of Gross Tuition Remitted</span>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-px">
        {([
          { key: "catalog", label: "Executive Report Dossiers", icon: FileText },
          { key: "ugc-banbeis", label: "Statutory UGC / BANBEIS Annual Return", icon: Landmark },
          { key: "tsr-gender", label: "TSR & Inclusivity Matrix", icon: Users },
          { key: "retention-cohorts", label: "Cohort Retention & On-Time Graduation", icon: GraduationCap },
          { key: "tuition-audit", label: "Tuition Income vs Remission Audit", icon: Wallet },
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

      {/* Tab 1: Catalog */}
      {activeTab === "catalog" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredTypes.map((type) => (
            <Card key={type.id} orientation="vertical" padding="lg" className="space-y-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${type.color}`}>
                  <type.icon size={20} />
                </div>
                <Badge variant="neutral" size="sm">Instant Export</Badge>
              </div>
              <h4 className="font-bold text-sm text-text">{type.label}</h4>
              <p className="text-xs text-text-muted leading-relaxed">{type.description}</p>
              <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download size={13} />}
                  onClick={() => alert(`Exporting ${type.label} as signed PDF...`)}
                >
                  Export PDF
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: UGC / BANBEIS Annual Return */}
      {activeTab === "ugc-banbeis" && (
        <Card noPadding>
          <div className="p-4 border-b border-border bg-surface flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-2">
                <Landmark size={16} className="text-gold" />
                Statutory UGC &amp; BANBEIS Annual Compliance Return Table (Form HE-04)
              </h3>
              <p className="text-[11px] text-text-muted">
                Mandatory data points submitted to University Grants Commission and Bangladesh Bureau of Educational Information and Statistics.
              </p>
            </div>
            <Button
              variant="gold"
              size="sm"
              leftIcon={<Printer size={14} />}
              onClick={() => alert("Printing Official BANBEIS HE-04 Gazette...")}
            >
              Print BANBEIS Gazette
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted/50 border-b border-border text-[11px] font-bold text-text-muted uppercase">
                  <th className="p-3">Academic Department</th>
                  <th className="p-3">Total Students</th>
                  <th className="p-3">Female (Ratio)</th>
                  <th className="p-3">Faculty (PhD)</th>
                  <th className="p-3">Teacher-Student Ratio</th>
                  <th className="p-3">Lab Utilization</th>
                  <th className="p-3 text-right">UGC Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {ugcBanbeisMetrics.map((row) => (
                  <tr key={row.department} className="hover:bg-surface-muted/30">
                    <td className="p-3 font-bold text-text">{row.department}</td>
                    <td className="p-3 font-mono">{row.enrolledStudents}</td>
                    <td className="p-3 font-mono text-gold">
                      {row.femaleCount} ({row.femalePct}%)
                    </td>
                    <td className="p-3 font-mono">
                      {row.fullTimeFaculty} ({row.phdFaculty} PhDs)
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-600">{row.tsr}</td>
                    <td className="p-3 font-mono">{row.labUtilization}%</td>
                    <td className="p-3 text-right">
                      <Badge variant="success" size="sm">
                        {row.ugcComplianceStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: TSR & Inclusivity */}
      {activeTab === "tsr-gender" && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <Users size={16} className="text-gold" />
                Teacher-Student Ratio &amp; Gender Diversity Benchmarks
              </h3>
              <p className="text-xs text-text-muted">
                Monitors departmental capacity against international accreditation guidelines (e.g. BAETE, UGC).
              </p>
            </div>
            <Badge variant="gold" size="sm">Target TSR ≤ 1:20</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ugcBanbeisMetrics.map((m) => (
              <Card key={m.department} orientation="vertical" padding="lg" className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text text-sm">{m.department}</span>
                  <Badge variant="gold" size="sm">TSR {m.tsr}</Badge>
                </div>
                <div className="flex justify-between text-xs text-text-muted">
                  <span>Female Student Representation:</span>
                  <span className="font-mono font-bold text-gold">{m.femalePct}%</span>
                </div>
                <ProgressBar value={m.femalePct} variant="gold" size="sm" />
                <div className="flex justify-between text-xs pt-2 border-t border-border text-text-muted">
                  <span>Full-Time Faculty: <strong className="text-text">{m.fullTimeFaculty}</strong></span>
                  <span>Doctoral Holders: <strong className="text-emerald-600">{m.phdFaculty} PhDs</strong></span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Cohort Retention */}
      {activeTab === "retention-cohorts" && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <GraduationCap size={16} className="text-gold" />
                4-Year Longitudinal Cohort Retention &amp; Graduation Efficiency
              </h3>
              <p className="text-xs text-text-muted">
                Tracks matriculated freshman cohorts over 8 academic semesters to identify dropout triggers and delayed progression.
              </p>
            </div>
            <Badge variant="success" size="sm">78.4% On-Time Completion</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card orientation="vertical" padding="lg" className="space-y-2">
              <span className="text-xs font-bold text-emerald-600 uppercase">On-Time Graduated</span>
              <div className="text-3xl font-mono font-bold text-emerald-600">78.4%</div>
              <p className="text-xs text-text-muted">Completed required 140 credits within 8 semesters.</p>
            </Card>

            <Card orientation="vertical" padding="lg" className="space-y-2">
              <span className="text-xs font-bold text-gold uppercase">Extended Progression</span>
              <div className="text-3xl font-mono font-bold text-gold">17.6%</div>
              <p className="text-xs text-text-muted">Enrolled in 9th or 10th semester for retake grade improvement.</p>
            </Card>

            <Card orientation="vertical" padding="lg" className="space-y-2">
              <span className="text-xs font-bold text-danger uppercase">Attrition / Dropout</span>
              <div className="text-3xl font-mono font-bold text-danger">4.0%</div>
              <p className="text-xs text-text-muted">Withdrawn due to academic probation or migration.</p>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 5: Tuition Audit */}
      {activeTab === "tuition-audit" && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <Wallet size={16} className="text-gold" />
                Tuition Gross Revenue vs Philanthropy &amp; Scholarship Remission
              </h3>
              <p className="text-xs text-text-muted">
                Financial audit breakdown reconciling gross billed tuition against merit waivers, endowment offsets, and realized bank deposits.
              </p>
            </div>
            <Badge variant="gold" size="sm">Fall 2026 Fiscal Term</Badge>
          </div>

          <div className="divide-y divide-border bg-surface border border-border rounded-2xl overflow-hidden text-xs">
            <div className="p-4 flex items-center justify-between">
              <span className="text-text font-bold">1. Gross Assessed Student Tuition (1,830 Students @ 14 Credits Avg)</span>
              <span className="font-mono font-bold text-text text-sm">৳ 16,65,30,000</span>
            </div>
            <div className="p-4 flex items-center justify-between text-danger">
              <span className="font-semibold">2. Less: Statutory Merit &amp; Quota Remissions (CGPA ≥ 3.85 / FF Quota)</span>
              <span className="font-mono font-bold text-sm">- ৳ 1,86,50,000</span>
            </div>
            <div className="p-4 flex items-center justify-between text-gold">
              <span className="font-semibold">3. Plus: Philanthropy Endowment Corpus Offset Inflow</span>
              <span className="font-mono font-bold text-sm">+ ৳ 45,00,000</span>
            </div>
            <div className="p-4 flex items-center justify-between text-emerald-600 bg-emerald-50/50 font-bold">
              <span>Net Realized Treasury Inflow (Bank Branches + MFS Gateways)</span>
              <span className="font-mono text-base">৳ 15,23,80,000</span>
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Compile Official Institutional Dossier"
        subtitle="Select parameters and target timeframe for compilation"
        size="md"
      >
        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          <FormField label="Report Dossier Type" required>
            <Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
              {filteredTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Custom Report Title">
            <Input
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="e.g. Fall 2026 Statutory BANBEIS Return"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start Date">
              <Input type="date" value={dateRangeStart} onChange={(e) => setDateRangeStart(e.target.value)} />
            </FormField>
            <FormField label="End Date">
              <Input type="date" value={dateRangeEnd} onChange={(e) => setDateRangeEnd(e.target.value)} />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setShowGenerateModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              disabled={generateMutation.isPending}
              leftIcon={<FileText size={14} />}
            >
              {generateMutation.isPending ? "Compiling..." : "Generate Dossier"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
