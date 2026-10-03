"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Building2,
  MapPin,
  CheckCircle2,
  Plus,
  Clock,
  GraduationCap,
  Hospital,
  Send,
  Users,
  Search,
  Calendar,
  DollarSign,
  Award,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Eye,
  Trash2,
  Sparkles,
  TrendingUp,
  FileCheck,
  Printer,
  Download,
  Sliders,
  Check,
  XCircle,
  QrCode,
  FileText,
} from "lucide-react";
import DataTable, { Column } from "@/components/ui/DataTable";
import {
  PageHeader,
  Card,
  Tabs,
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

type CareerTab =
  | "campus-drives"
  | "interview-slots"
  | "applications-ledger"
  | "corporate-partners"
  | "placement-analytics";

interface JobOpening {
  id: string;
  title: string;
  organization: string;
  category: "CLINICAL_RESIDENCY" | "TECH_ENGINEERING" | "PHARMA_RD" | "RESEARCH_FELLOWSHIP";
  departmentTarget: string;
  location: string;
  salaryPackage: string;
  minimumCgpa: number;
  openPositions: number;
  appliedCount: number;
  deadline: string;
  interviewDate: string;
  status: "ACTIVE" | "INTERVIEWING" | "CLOSED";
}

interface StudentApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  organization: string;
  studentId: string;
  studentName: string;
  department: string;
  cgpa: number;
  status: "APPLIED" | "SHORTLISTED" | "INTERVIEW_SCHEDULED" | "OFFER_EXTENDED" | "HIRED" | "REJECTED";
  interviewSlot?: string;
  interviewVenue?: string;
  appliedDate: string;
  transcriptHash: string;
}

interface CorporatePartner {
  id: string;
  name: string;
  industry: string;
  partnershipTier: "PLATINUM" | "GOLD" | "SILVER";
  totalHiredAlumni: number;
  activeMoU: boolean;
  contactPerson: string;
  contactEmail: string;
  headquarters: string;
}

const MOCK_JOBS: JobOpening[] = [
  {
    id: "JOB-2026-01",
    title: "Resident Medical Officer (Cardiology & ICU)",
    organization: "Evercare Hospital Dhaka",
    category: "CLINICAL_RESIDENCY",
    departmentTarget: "MBBS Clinical Medicine",
    location: "Dhaka, Bangladesh",
    salaryPackage: "৳ 75,000 - 90,000 / month",
    minimumCgpa: 3.50,
    openPositions: 8,
    appliedCount: 24,
    deadline: "2026-10-30",
    interviewDate: "2026-11-05",
    status: "ACTIVE",
  },
  {
    id: "JOB-2026-02",
    title: "Junior Cloud Infrastructure & AI Systems Engineer",
    organization: "Samsung R&D Institute Bangladesh",
    category: "TECH_ENGINEERING",
    departmentTarget: "Computer Science & Engineering",
    location: "Dhaka, Bangladesh",
    salaryPackage: "৳ 85,000 - 110,000 / month",
    minimumCgpa: 3.60,
    openPositions: 5,
    appliedCount: 42,
    deadline: "2026-10-25",
    interviewDate: "2026-10-28",
    status: "ACTIVE",
  },
  {
    id: "JOB-2026-03",
    title: "Formulation R&D & Regulatory Affairs Officer",
    organization: "Square Pharmaceuticals Ltd.",
    category: "PHARMA_RD",
    departmentTarget: "Pharmacy (B.Pharm)",
    location: "Gazipur / Dhaka",
    salaryPackage: "৳ 60,000 - 75,000 / month",
    minimumCgpa: 3.25,
    openPositions: 10,
    appliedCount: 31,
    deadline: "2026-11-02",
    interviewDate: "2026-11-08",
    status: "ACTIVE",
  },
  {
    id: "JOB-2026-04",
    title: "Postdoctoral Research Fellow (Genomics & Biofilms)",
    organization: "icddr,b Infectious Disease Division",
    category: "RESEARCH_FELLOWSHIP",
    departmentTarget: "Microbiology & Biochemistry",
    location: "Mohakhali, Dhaka",
    salaryPackage: "৳ 120,000 - 140,000 / month",
    minimumCgpa: 3.75,
    openPositions: 3,
    appliedCount: 14,
    deadline: "2026-10-20",
    interviewDate: "2026-10-24",
    status: "INTERVIEWING",
  },
];

const MOCK_APPLICATIONS: StudentApplication[] = [
  {
    id: "APP-CAR-01",
    jobId: "JOB-2026-02",
    jobTitle: "Junior Cloud Infrastructure & AI Systems Engineer",
    organization: "Samsung R&D Institute",
    studentId: "STU-2026001",
    studentName: "Marcus Chen",
    department: "Computer Science & Engineering",
    cgpa: 3.92,
    status: "OFFER_EXTENDED",
    interviewSlot: "2026-10-28 • 10:30 AM",
    interviewVenue: "Campus Career Suite 401",
    appliedDate: "2026-09-20",
    transcriptHash: "0x7F9A...B3C1",
  },
  {
    id: "APP-CAR-02",
    jobId: "JOB-2026-04",
    jobTitle: "Postdoctoral Research Fellow (Genomics)",
    organization: "icddr,b Infectious Disease",
    studentId: "STU-2026002",
    studentName: "Sophia Martinez",
    department: "Microbiology & Immunology",
    cgpa: 3.86,
    status: "INTERVIEW_SCHEDULED",
    interviewSlot: "2026-10-24 • 02:00 PM",
    interviewVenue: "Conference Hall B",
    appliedDate: "2026-09-22",
    transcriptHash: "0x4E2B...D98F",
  },
  {
    id: "APP-CAR-03",
    jobId: "JOB-2026-03",
    jobTitle: "Formulation R&D Officer",
    organization: "Square Pharmaceuticals",
    studentId: "STU-2026003",
    studentName: "Ethan Gallagher",
    department: "Biochemistry & Genetics",
    cgpa: 3.65,
    status: "SHORTLISTED",
    appliedDate: "2026-09-25",
    transcriptHash: "0x1A8C...FE22",
  },
  {
    id: "APP-CAR-04",
    jobId: "JOB-2026-01",
    jobTitle: "Resident Medical Officer (ICU)",
    organization: "Evercare Hospital",
    studentId: "STU-2026005",
    studentName: "Dr. Zubair Al-Mansoor",
    department: "MBBS Clinical Medicine",
    cgpa: 3.74,
    status: "HIRED",
    interviewSlot: "2026-10-12 • 11:00 AM",
    interviewVenue: "Hospital Board Room",
    appliedDate: "2026-09-18",
    transcriptHash: "0x33B1...87CD",
  },
];

const MOCK_PARTNERS: CorporatePartner[] = [
  {
    id: "PRT-01",
    name: "Evercare Hospitals Group",
    industry: "Healthcare & Tertiary Clinical Care",
    partnershipTier: "PLATINUM",
    totalHiredAlumni: 64,
    activeMoU: true,
    contactPerson: "Dr. Arifur Rahman (Medical Director)",
    contactEmail: "recruitment@evercarebd.com",
    headquarters: "Dhaka, Bangladesh",
  },
  {
    id: "PRT-02",
    name: "Samsung R&D Institute Bangladesh",
    industry: "Information Technology & AI",
    partnershipTier: "PLATINUM",
    totalHiredAlumni: 48,
    activeMoU: true,
    contactPerson: "Tanvir Hasan (Talent Acquisition Lead)",
    contactEmail: "srbd.hr@samsung.com",
    headquarters: "Dhaka, Bangladesh",
  },
  {
    id: "PRT-03",
    name: "Square Pharmaceuticals Ltd.",
    industry: "Pharmaceuticals & Healthcare",
    partnershipTier: "GOLD",
    totalHiredAlumni: 82,
    activeMoU: true,
    contactPerson: "Kazi Mahbub (HR Operations)",
    contactEmail: "career@squaregroup.com",
    headquarters: "Dhaka, Bangladesh",
  },
  {
    id: "PRT-04",
    name: "icddr,b Global Health Research",
    industry: "Biomedical & Epidemiological Research",
    partnershipTier: "PLATINUM",
    totalHiredAlumni: 35,
    activeMoU: true,
    contactPerson: "Dr. Firdausi Qadri (Senior Director)",
    contactEmail: "hrd@icddrb.org",
    headquarters: "Dhaka, Bangladesh",
  },
];

export default function CareerPage() {
  const { user } = useAuthStore();
  const { can, roleIs } = usePermission();

  const [activeTab, setActiveTab] = useState<CareerTab>("campus-drives");
  const [jobs, setJobs] = useState<JobOpening[]>(MOCK_JOBS);
  const [applications, setApplications] = useState<StudentApplication[]>(MOCK_APPLICATIONS);
  const [partners, setPartners] = useState<CorporatePartner[]>(MOCK_PARTNERS);

  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const isStaffOrAdmin = roleIs("super-admin", "domain-admin", "staff");

  const totalOpenings = useMemo(() => {
    return jobs.reduce((acc, j) => acc + j.openPositions, 0);
  }, [jobs]);

  const totalHired = useMemo(() => {
    return applications.filter((a) => a.status === "HIRED" || a.status === "OFFER_EXTENDED").length;
  }, [applications]);

  // Handle Create Job Posting
  const handleCreateJob = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formTarget = e.currentTarget;
    const newJob: JobOpening = {
      id: `JOB-2026-0${jobs.length + 1}`,
      title: (formTarget.elements.namedItem("title") as HTMLInputElement).value,
      organization: (formTarget.elements.namedItem("org") as HTMLInputElement).value,
      category: (formTarget.elements.namedItem("category") as HTMLSelectElement).value as any,
      departmentTarget: (formTarget.elements.namedItem("dept") as HTMLSelectElement).value,
      location: (formTarget.elements.namedItem("location") as HTMLInputElement).value,
      salaryPackage: (formTarget.elements.namedItem("salary") as HTMLInputElement).value,
      minimumCgpa: Number((formTarget.elements.namedItem("cgpa") as HTMLInputElement).value),
      openPositions: Number((formTarget.elements.namedItem("positions") as HTMLInputElement).value),
      appliedCount: 0,
      deadline: (formTarget.elements.namedItem("deadline") as HTMLInputElement).value,
      interviewDate: (formTarget.elements.namedItem("interviewDate") as HTMLInputElement).value,
      status: "ACTIVE",
    };

    setJobs([newJob, ...jobs]);
    setShowPostJobModal(false);
    setSuccessMsg(`Campus recruitment drive for "${newJob.title}" published to student placement portal.`);
    setTimeout(() => setSuccessMsg(""), 4500);
  };

  // Job Columns
  const jobColumns: Column<JobOpening>[] = [
    {
      header: "Opportunity & Company",
      accessor: (row) => (
        <div>
          <div className="font-semibold text-text text-xs flex items-center gap-1.5">
            <span>{row.title}</span>
          </div>
          <div className="text-[11px] text-[#B98B4B] font-medium flex items-center gap-1 mt-0.5">
            <Building2 size={11} />
            <span>{row.organization}</span>
            <span className="text-border">•</span>
            <span className="text-text-muted">{row.location}</span>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Target Dept & Min CGPA",
      accessor: (row) => (
        <div>
          <Badge variant="primary" size="sm">{row.departmentTarget}</Badge>
          <div className="text-[11px] text-text-muted mt-1 font-mono">
            Min CGPA: <span className="font-bold text-text">{row.minimumCgpa.toFixed(2)}</span>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Compensation Package",
      accessor: (row) => (
        <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
          {row.salaryPackage}
        </span>
      ),
      sortable: true,
    },
    {
      header: "Intake & Applicants",
      accessor: (row) => (
        <div>
          <div className="text-xs font-semibold text-text">
            {row.openPositions} Seats
          </div>
          <div className="text-[11px] text-text-muted">
            {row.appliedCount} Candidates Applied
          </div>
        </div>
      ),
    },
    {
      header: "Key Dates",
      accessor: (row) => (
        <div className="text-[11px] text-text-muted space-y-0.5">
          <div>Deadline: <span className="font-mono font-medium text-text">{row.deadline}</span></div>
          <div>Interviews: <span className="font-mono font-medium text-primary">{row.interviewDate}</span></div>
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="gold"
            size="sm"
            onClick={() => {
              const newApp: StudentApplication = {
                id: `APP-CAR-0${applications.length + 1}`,
                jobId: row.id,
                jobTitle: row.title,
                organization: row.organization,
                studentId: user?.id || "STU-2026001",
                studentName: user?.name || "Marcus Chen",
                department: row.departmentTarget,
                cgpa: 3.92,
                status: "APPLIED",
                appliedDate: new Date().toISOString().split("T")[0],
                transcriptHash: "0x7F9A...B3C1",
              };
              setApplications([newApp, ...applications]);
              setJobs(jobs.map((j) => (j.id === row.id ? { ...j, appliedCount: j.appliedCount + 1 } : j)));
              setSuccessMsg(`Application & verified digital transcript submitted to ${row.organization}.`);
              setTimeout(() => setSuccessMsg(""), 4500);
            }}
          >
            Apply Now
          </Button>
        </div>
      ),
    },
  ];

  // Application Columns
  const applicationColumns: Column<StudentApplication>[] = [
    {
      header: "Candidate & Dept",
      accessor: (row) => (
        <div>
          <div className="font-semibold text-text text-xs flex items-center gap-1.5">
            <span>{row.studentName}</span>
            <span className="font-mono text-[11px] text-text-muted">({row.studentId})</span>
          </div>
          <div className="text-[11px] text-text-muted">{row.department} • CGPA: {row.cgpa.toFixed(2)}</div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Applied Position & Employer",
      accessor: (row) => (
        <div>
          <div className="text-xs font-semibold text-text">{row.jobTitle}</div>
          <div className="text-[11px] text-[#B98B4B]">{row.organization}</div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Interview Schedule",
      accessor: (row) => (
        <div>
          {row.interviewSlot ? (
            <div className="text-xs space-y-0.5">
              <div className="font-mono font-semibold text-primary flex items-center gap-1">
                <Clock size={12} />
                <span>{row.interviewSlot}</span>
              </div>
              <div className="text-[10px] text-text-muted">{row.interviewVenue}</div>
            </div>
          ) : (
            <span className="text-xs text-text-muted">Not Scheduled</span>
          )}
        </div>
      ),
    },
    {
      header: "Application Status",
      accessor: (row) => (
        <Badge
          variant={
            row.status === "HIRED" || row.status === "OFFER_EXTENDED"
              ? "success"
              : row.status === "INTERVIEW_SCHEDULED"
              ? "gold"
              : row.status === "SHORTLISTED"
              ? "primary"
              : row.status === "REJECTED"
              ? "danger"
              : "neutral"
          }
          size="sm"
        >
          {row.status.replace("_", " ")}
        </Badge>
      ),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Campus Placements, Residency & Corporate Hub"
        subtitle="On-campus clinical residency recruitment, engineering drives, interview scheduling, and verified credential matching."
        badge={<Badge tone="gold">Class of 2026 Recruitment</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Download size={13} />}
              onClick={() => {
                setSuccessMsg("Exported statutory annual campus placement and salary audit report (PDF/XLSX).");
                setTimeout(() => setSuccessMsg(""), 4000);
              }}
            >
              Export Placement Report
            </Button>
            {isStaffOrAdmin && (
              <Button
                variant="gold"
                size="sm"
                icon={<Plus size={15} />}
                onClick={() => setShowPostJobModal(true)}
              >
                Post Recruitment Drive
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

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Open Positions</span>
            <Briefcase className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-text">{totalOpenings} Vacancies</div>
          <p className="text-[11px] text-text-muted">Across 4 premier partner drives</p>
        </Card>

        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Offers Extended / Hired</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {totalHired} Placements
          </div>
          <p className="text-[11px] text-text-muted">Graduates with formal contract offers</p>
        </Card>

        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Corporate Partners</span>
            <Building2 className="w-4 h-4 text-[#B98B4B]" />
          </div>
          <div className="text-2xl font-bold font-mono text-text">24 Companies</div>
          <p className="text-[11px] text-text-muted">Active MoUs with campus recruitment</p>
        </Card>

        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Average Package</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-text">৳ 85,000 / Mo</div>
          <p className="text-[11px] text-text-muted">+14.2% YoY starting graduate salary</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as CareerTab)}
        tabs={[
          { id: "campus-drives", label: "Active Recruitment Drives", count: jobs.length },
          { id: "interview-slots", label: "Interview Schedules & Panels" },
          { id: "applications-ledger", label: "Candidate Applications Dossier", count: applications.length },
          { id: "corporate-partners", label: "Corporate Partners & Hospitals", count: partners.length },
          { id: "placement-analytics", label: "Placement Statistics & Salary Index" },
        ]}
      />

      {/* Tab 1: Active Recruitment Drives */}
      {activeTab === "campus-drives" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text">Campus Recruitment Openings & Clinical Residencies</h3>
          </div>

          <Card pad="none" className="overflow-hidden">
            <DataTable
              data={jobs}
              columns={jobColumns}
              searchable={true}
              searchPlaceholder="Search position title, employer, or department..."
              searchField="title"
              pagination={true}
              pageSize={8}
            />
          </Card>
        </div>
      )}

      {/* Tab 2: Interview Slots */}
      {activeTab === "interview-slots" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications
              .filter((a) => a.interviewSlot)
              .map((app) => (
                <Card key={app.id} pad="md" className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-text">{app.studentName}</h4>
                      <p className="text-xs text-text-muted font-mono">{app.studentId} • {app.department}</p>
                    </div>
                    <Badge variant="gold" size="sm">Interview Scheduled</Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-muted/50 border border-border space-y-1.5 text-xs">
                    <div className="font-semibold text-text">{app.jobTitle}</div>
                    <div className="text-[#B98B4B] font-medium">{app.organization}</div>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-text-muted">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-primary" />
                        <span className="font-mono text-text font-bold">{app.interviewSlot}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-emerald-500" />
                        <span>{app.interviewVenue}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 text-xs">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSuccessMsg(`Sent interview confirmation & entrance token to ${app.studentName}.`);
                        setTimeout(() => setSuccessMsg(""), 4000);
                      }}
                    >
                      Resend Confirmation SMS
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Tab 3: Applications Ledger */}
      {activeTab === "applications-ledger" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text">Candidate Applications & Verifiable Transcripts</h3>
          </div>

          <Card pad="none" className="overflow-hidden">
            <DataTable
              data={applications}
              columns={applicationColumns}
              searchable={true}
              searchPlaceholder="Search candidate name, employer, or job..."
              searchField="studentName"
              pagination={true}
              pageSize={8}
            />
          </Card>
        </div>
      )}

      {/* Tab 4: Corporate Partners */}
      {activeTab === "corporate-partners" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partners.map((partner) => (
              <Card key={partner.id} pad="md" className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-text">{partner.name}</h4>
                    <p className="text-xs text-text-muted">{partner.industry}</p>
                  </div>
                  <Badge variant={partner.partnershipTier === "PLATINUM" ? "gold" : "primary"} size="sm">
                    {partner.partnershipTier} Partner
                  </Badge>
                </div>

                <div className="p-3 rounded-xl bg-surface-muted/50 border border-border text-xs grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-text-muted block">Alumni Hired:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {partner.totalHiredAlumni} Graduates
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted block">MoU Status:</span>
                    <span className="font-semibold text-text flex items-center gap-1">
                      <ShieldCheck size={13} className="text-emerald-500" />
                      <span>Active Institutional MoU</span>
                    </span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-border/60">
                    <span className="text-[10px] text-text-muted block">Campus Liaison:</span>
                    <span className="font-medium text-text">{partner.contactPerson} ({partner.contactEmail})</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Placement Analytics */}
      {activeTab === "placement-analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card pad="md" className="space-y-3">
              <span className="text-xs font-bold text-text uppercase tracking-wider">
                CSE & Software Engineering
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">94.2%</div>
              <ProgressBar value={94} variant="success" />
              <p className="text-[11px] text-text-muted">Top recruiters: Samsung, Google, bKash, Brain Station 23</p>
            </Card>

            <Card pad="md" className="space-y-3">
              <span className="text-xs font-bold text-text uppercase tracking-wider">
                MBBS Clinical Medicine
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">98.5%</div>
              <ProgressBar value={98} variant="success" />
              <p className="text-[11px] text-text-muted">Top placements: Evercare, Square Hospital, NHS UK Training</p>
            </Card>

            <Card pad="md" className="space-y-3">
              <span className="text-xs font-bold text-text uppercase tracking-wider">
                Pharmacy (B.Pharm)
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">91.0%</div>
              <ProgressBar value={91} variant="success" />
              <p className="text-[11px] text-text-muted">Top placements: Square Pharma, Incepta, Beximco, Novartis</p>
            </Card>
          </div>
        </div>
      )}

      {/* Post Job Modal */}
      <Modal
        isOpen={showPostJobModal}
        onClose={() => setShowPostJobModal(false)}
        title="Post Campus Recruitment Drive"
        description="Publish residency or engineering opening to university career portal"
        size="md"
      >
        <form onSubmit={handleCreateJob} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Position Title" required>
              <Input name="title" required placeholder="e.g. Clinical Research Fellow" />
            </FormField>
            <FormField label="Organization / Hospital" required>
              <Input name="org" required placeholder="e.g. Apollo Health City" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Target Department" required>
              <Select name="dept">
                <option value="MBBS Clinical Medicine">MBBS Clinical Medicine</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Pharmacy (B.Pharm)">Pharmacy (B.Pharm)</option>
                <option value="Microbiology & Biochemistry">Microbiology & Biochemistry</option>
              </Select>
            </FormField>
            <FormField label="Category" required>
              <Select name="category">
                <option value="CLINICAL_RESIDENCY">Clinical Residency</option>
                <option value="TECH_ENGINEERING">Tech & Software Engineering</option>
                <option value="PHARMA_RD">Pharmaceutical R&D</option>
                <option value="RESEARCH_FELLOWSHIP">Postgraduate Research</option>
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Salary Package" required>
              <Input name="salary" required placeholder="৳ 80,000 / month" />
            </FormField>
            <FormField label="Minimum CGPA" required>
              <Input name="cgpa" type="number" step="0.01" defaultValue="3.50" required />
            </FormField>
            <FormField label="Open Seats" required>
              <Input name="positions" type="number" defaultValue="5" required />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Location" required>
              <Input name="location" defaultValue="Dhaka, Bangladesh" required />
            </FormField>
            <FormField label="Application Deadline" required>
              <Input name="deadline" type="date" defaultValue="2026-11-15" required />
            </FormField>
          </div>

          <FormField label="On-Campus Interview Date" required>
            <Input name="interviewDate" type="date" defaultValue="2026-11-20" required />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setShowPostJobModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold">
              Publish Recruitment Drive
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
