"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Calendar,
  HeartHandshake,
  Plus,
  CheckCircle2,
  Users,
  MapPin,
  CircleDollarSign,
  Award,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  QrCode,
  Download,
  Printer,
  Sparkles,
  Search,
  Building2,
  DollarSign,
  BookOpen,
  Send,
  Eye,
  Trash2,
  Sliders,
  Check,
  XCircle,
  Clock,
  Layers,
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

type AlumniTab =
  | "clearance-gateway"
  | "convocation-tokens"
  | "degree-vault"
  | "alumni-directory"
  | "alumni-giving";

interface GraduatingCandidate {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  degree: string;
  cgpa: number;
  creditsEarned: number;
  creditsRequired: number;
  clearances: {
    accounts: boolean; // Tuition & fees = 0
    library: boolean; // Books returned
    laboratory: boolean; // Equipment/chemical clearance
    hostel: boolean; // Room & mess cleared
    proctor: boolean; // No disciplinary holds
  };
  overallStatus: "CLEARED" | "PENDING_ACCOUNTS" | "PENDING_LIBRARY" | "HELD_BY_PROCTOR";
  gownSize: "S" | "M" | "L" | "XL";
  guestPassesCount: number;
  convocationFeePaid: boolean;
  convocationToken: string;
  gownCollected: boolean;
}

interface AlumniMember {
  id: string;
  name: string;
  email: string;
  graduationYear: number;
  department: string;
  degree: string;
  currentPosition: string;
  currentOrganization: string;
  location: string;
  country: string;
  phone: string;
  verifiedGraduate: boolean;
}

interface AlumniDonation {
  id: string;
  donorName: string;
  graduationYear: number;
  amount: number;
  purpose: "SCHOLARSHIP_FUND" | "CLINICAL_EQUIPMENT" | "LIBRARY_JOURNALS" | "RESEARCH_ENDOWMENT";
  date: string;
  paymentMethod: string;
  receiptNumber: string;
}

const MOCK_GRADUATING_COHORT: GraduatingCandidate[] = [
  {
    id: "GRAD-2026-001",
    studentId: "STU-2026001",
    studentName: "Marcus Chen",
    department: "Computer Science & Engineering",
    degree: "B.Sc. in Computer Science & Engineering",
    cgpa: 3.92,
    creditsEarned: 142,
    creditsRequired: 140,
    clearances: { accounts: true, library: true, laboratory: true, hostel: true, proctor: true },
    overallStatus: "CLEARED",
    gownSize: "L",
    guestPassesCount: 2,
    convocationFeePaid: true,
    convocationToken: "CONV-14-TKN-8821",
    gownCollected: true,
  },
  {
    id: "GRAD-2026-002",
    studentId: "STU-2026002",
    studentName: "Sophia Martinez",
    department: "Microbiology & Immunology",
    degree: "B.Sc. in Microbiology & Immunology",
    cgpa: 3.86,
    creditsEarned: 140,
    creditsRequired: 140,
    clearances: { accounts: true, library: true, laboratory: true, hostel: true, proctor: true },
    overallStatus: "CLEARED",
    gownSize: "M",
    guestPassesCount: 2,
    convocationFeePaid: true,
    convocationToken: "CONV-14-TKN-8822",
    gownCollected: false,
  },
  {
    id: "GRAD-2026-003",
    studentId: "STU-2026003",
    studentName: "Ethan Gallagher",
    department: "Biochemistry & Genetics",
    degree: "B.Sc. in Biochemistry & Genetics",
    cgpa: 3.65,
    creditsEarned: 140,
    creditsRequired: 140,
    clearances: { accounts: false, library: true, laboratory: true, hostel: true, proctor: true },
    overallStatus: "PENDING_ACCOUNTS",
    gownSize: "M",
    guestPassesCount: 1,
    convocationFeePaid: false,
    convocationToken: "PENDING_CLEARANCE",
    gownCollected: false,
  },
  {
    id: "GRAD-2026-004",
    studentId: "STU-2026004",
    studentName: "Aria Takahashi",
    department: "Computer Science & Engineering",
    degree: "B.Sc. in Computer Science & Engineering",
    cgpa: 3.82,
    creditsEarned: 140,
    creditsRequired: 140,
    clearances: { accounts: true, library: false, laboratory: true, hostel: true, proctor: true },
    overallStatus: "PENDING_LIBRARY",
    gownSize: "S",
    guestPassesCount: 2,
    convocationFeePaid: true,
    convocationToken: "PENDING_CLEARANCE",
    gownCollected: false,
  },
  {
    id: "GRAD-2026-005",
    studentId: "STU-2026005",
    studentName: "Dr. Zubair Al-Mansoor",
    department: "MBBS Clinical Medicine",
    degree: "Bachelor of Medicine, Bachelor of Surgery (MBBS)",
    cgpa: 3.74,
    creditsEarned: 180,
    creditsRequired: 180,
    clearances: { accounts: true, library: true, laboratory: true, hostel: true, proctor: true },
    overallStatus: "CLEARED",
    gownSize: "XL",
    guestPassesCount: 2,
    convocationFeePaid: true,
    convocationToken: "CONV-14-TKN-8825",
    gownCollected: true,
  },
];

const MOCK_ALUMNI_MEMBERS: AlumniMember[] = [
  {
    id: "ALU-101",
    name: "Dr. Farhana Yasmin",
    email: "dr.farhana@bshospital.org",
    graduationYear: 2021,
    department: "MBBS Clinical Medicine",
    degree: "MBBS, FCPS (Cardiology)",
    currentPosition: "Consultant Interventional Cardiologist",
    currentOrganization: "National Heart Foundation & Research Institute",
    location: "Dhaka",
    country: "Bangladesh",
    phone: "+880 1711-892110",
    verifiedGraduate: true,
  },
  {
    id: "ALU-102",
    name: "Syed Tanveer Ahmed",
    email: "t.ahmed@deepmind.google.com",
    graduationYear: 2022,
    department: "Computer Science & Engineering",
    degree: "B.Sc. in Computer Science",
    currentPosition: "Staff AI Research Engineer",
    currentOrganization: "Google DeepMind",
    location: "London",
    country: "United Kingdom",
    phone: "+44 7700 900123",
    verifiedGraduate: true,
  },
  {
    id: "ALU-103",
    name: "Dr. Kazi Mahfuzur Rahman",
    email: "kazi.mahfuz@nhs.net",
    graduationYear: 2019,
    department: "MBBS Clinical Medicine",
    degree: "MBBS, MRCP (UK)",
    currentPosition: "Specialist Registrar (Emergency Medicine)",
    currentOrganization: "Guy's and St Thomas' NHS Foundation Trust",
    location: "London",
    country: "United Kingdom",
    phone: "+44 7891 234567",
    verifiedGraduate: true,
  },
  {
    id: "ALU-104",
    name: "Nusrat Jahan Chowdhury",
    email: "nusrat.jahan@novartis.com",
    graduationYear: 2023,
    department: "Pharmacy (B.Pharm)",
    degree: "Bachelor of Pharmacy",
    currentPosition: "Senior Regulatory Affairs Specialist",
    currentOrganization: "Novartis Healthcare",
    location: "Basel",
    country: "Switzerland",
    phone: "+41 79 123 4567",
    verifiedGraduate: true,
  },
];

const MOCK_DONATIONS: AlumniDonation[] = [
  {
    id: "DON-2026-01",
    donorName: "Dr. Farhana Yasmin (Batch '21)",
    graduationYear: 2021,
    amount: 500000,
    purpose: "SCHOLARSHIP_FUND",
    date: "2026-09-15",
    paymentMethod: "Sonali Bank Wire Transfer",
    receiptNumber: "RCP-ALUM-2026-089",
  },
  {
    id: "DON-2026-02",
    donorName: "Syed Tanveer Ahmed (Batch '22)",
    graduationYear: 2022,
    amount: 1200000,
    purpose: "RESEARCH_ENDOWMENT",
    date: "2026-09-22",
    paymentMethod: "International Wire / Stripe",
    receiptNumber: "RCP-ALUM-2026-094",
  },
  {
    id: "DON-2026-03",
    donorName: "Global Alumni Federation UK Chapter",
    graduationYear: 2018,
    amount: 850000,
    purpose: "CLINICAL_EQUIPMENT",
    date: "2026-09-28",
    paymentMethod: "Standard Chartered Bank Wire",
    receiptNumber: "RCP-ALUM-2026-102",
  },
];

export default function AlumniPage() {
  const { user } = useAuthStore();
  const { can, roleIs } = usePermission();

  const [activeTab, setActiveTab] = useState<AlumniTab>("clearance-gateway");
  const [candidates, setCandidates] = useState<GraduatingCandidate[]>(MOCK_GRADUATING_COHORT);
  const [alumniList, setAlumniList] = useState<AlumniMember[]>(MOCK_ALUMNI_MEMBERS);
  const [donations, setDonations] = useState<AlumniDonation[]>(MOCK_DONATIONS);

  const [selectedCandidate, setSelectedCandidate] = useState<GraduatingCandidate | null>(null);
  const [showClearanceModal, setShowClearanceModal] = useState(false);
  const [showAlumniModal, setShowAlumniModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isSyncingClearance, setIsSyncingClearance] = useState(false);

  const isEditor = can("update", "alumni") || roleIs("super-admin", "domain-admin", "staff");

  // Metrics
  const clearedCount = useMemo(() => {
    return candidates.filter((c) => c.overallStatus === "CLEARED").length;
  }, [candidates]);

  const totalDonations = useMemo(() => {
    return donations.reduce((acc, d) => acc + d.amount, 0);
  }, [donations]);

  // Run Batch Multi-Department Clearance
  const handleRunBatchClearance = () => {
    setIsSyncingClearance(true);
    setTimeout(() => {
      const updated = candidates.map((c) => {
        if (c.studentId === "STU-2026003") {
          // Ethan Gallagher settled Accounts
          return {
            ...c,
            clearances: { ...c.clearances, accounts: true },
            overallStatus: "CLEARED" as const,
            convocationFeePaid: true,
            convocationToken: "CONV-14-TKN-8823",
          };
        }
        if (c.studentId === "STU-2026004") {
          // Aria returned Library books
          return {
            ...c,
            clearances: { ...c.clearances, library: true },
            overallStatus: "CLEARED" as const,
            convocationToken: "CONV-14-TKN-8824",
          };
        }
        return c;
      });
      setCandidates(updated);
      setIsSyncingClearance(false);
      setSuccessMsg("Multi-Department Zero-Dues Clearance successfully synchronized across Accounts, Library, Labs, and Provost ledgers.");
      setTimeout(() => setSuccessMsg(""), 5500);
    }, 1200);
  };

  // Clearance Table Columns
  const clearanceColumns: Column<GraduatingCandidate>[] = [
    {
      header: "Graduating Candidate",
      accessor: (row) => (
        <div>
          <div className="font-semibold text-text text-xs flex items-center gap-1.5">
            <span>{row.studentName}</span>
            <span className="font-mono text-[11px] text-text-muted">({row.studentId})</span>
          </div>
          <div className="text-[11px] text-text-muted">{row.department}</div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Academic Progress",
      accessor: (row) => (
        <div>
          <div className="font-mono font-bold text-xs text-text">{row.cgpa.toFixed(2)} CGPA</div>
          <div className="text-[11px] text-text-muted">
            {row.creditsEarned} / {row.creditsRequired} Credits
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "5-Department Clearance Matrix",
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <Badge
            variant={row.clearances.accounts ? "success" : "danger"}
            size="sm"
            title="Accounts Ledger Zero Dues"
          >
            Accounts
          </Badge>
          <Badge
            variant={row.clearances.library ? "success" : "danger"}
            size="sm"
            title="Central Library Books Returned"
          >
            Library
          </Badge>
          <Badge
            variant={row.clearances.laboratory ? "success" : "danger"}
            size="sm"
            title="Lab & Chemical Store Sign-off"
          >
            Lab
          </Badge>
          <Badge
            variant={row.clearances.hostel ? "success" : "danger"}
            size="sm"
            title="Hostel Room & Mess Handover"
          >
            Hostel
          </Badge>
          <Badge
            variant={row.clearances.proctor ? "success" : "danger"}
            size="sm"
            title="Proctorial Disciplinary Sign-off"
          >
            Proctor
          </Badge>
        </div>
      ),
    },
    {
      header: "Convocation Token",
      accessor: (row) => (
        <div>
          {row.overallStatus === "CLEARED" ? (
            <div className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <QrCode size={13} />
              <span>{row.convocationToken}</span>
            </div>
          ) : (
            <Badge variant="warning" size="sm">
              Pending Clearance
            </Badge>
          )}
          <div className="text-[10px] text-text-muted mt-0.5">
            Gown Size: {row.gownSize} • {row.gownCollected ? "Gown Collected" : "Pending Pickup"}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (row) => (
        <Badge
          variant={row.overallStatus === "CLEARED" ? "success" : "danger"}
          size="sm"
        >
          {row.overallStatus === "CLEARED" ? "Degree Cleared" : "Hold Active"}
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
            label="View Clearance Certificate"
            onClick={() => setSelectedCandidate(row)}
            icon={<Eye size={14} />}
          />
          {row.overallStatus === "CLEARED" && (
            <IconButton
              variant="ghost"
              size="sm"
              label="Print Convocation Token Pass"
              onClick={() => {
                setSuccessMsg(`Printed 14th Convocation Ceremony Pass & Gown Token for ${row.studentName}.`);
                setTimeout(() => setSuccessMsg(""), 4000);
              }}
              icon={<Printer size={14} className="text-[#B98B4B]" />}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Multi-Department Graduation Clearance & Convocation Gateway"
        subtitle="End-to-end zero-dues clearance verification, convocation gown token minting, verifiable digital degree locker, and global alumni network."
        badge={<Badge tone="gold">14th Grand Convocation</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunBatchClearance}
              disabled={isSyncingClearance}
              icon={<ShieldCheck size={14} className={isSyncingClearance ? "animate-spin" : ""} />}
            >
              {isSyncingClearance ? "Synchronizing..." : "Run Multi-Dept Audit"}
            </Button>
            {isEditor && (
              <Button
                variant="gold"
                size="sm"
                icon={<GraduationCap size={15} />}
                onClick={() => {
                  setSuccessMsg("Dispatched Convocation Invitations & Digital Passes to all 100% Cleared Graduates.");
                  setTimeout(() => setSuccessMsg(""), 5000);
                }}
              >
                Dispatch Passes
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
            <span>Graduating Cohort</span>
            <GraduationCap className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-text">{candidates.length} Candidates</div>
          <p className="text-[11px] text-text-muted">Class of 2026 eligible for degree award</p>
        </Card>

        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>100% Zero-Dues Cleared</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {clearedCount} / {candidates.length}
          </div>
          <p className="text-[11px] text-text-muted">Accounts, Library, Labs, Hostel & Proctor</p>
        </Card>

        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Convocation Passes Minted</span>
            <QrCode className="w-4 h-4 text-[#B98B4B]" />
          </div>
          <div className="text-2xl font-bold font-mono text-text">
            {candidates.filter((c) => c.convocationToken.startsWith("CONV")).length} Passes
          </div>
          <p className="text-[11px] text-text-muted">QR-secured ceremony access tokens</p>
        </Card>

        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Alumni Philanthropy Fund</span>
            <CircleDollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-text">
            ৳ {(totalDonations / 100000).toFixed(1)} Lakh
          </div>
          <p className="text-[11px] text-text-muted">3 active endowment & equipment drives</p>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <Tabs
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as AlumniTab)}
        tabs={[
          { id: "clearance-gateway", label: "Multi-Dept Clearance Gateway", count: candidates.length },
          { id: "convocation-tokens", label: "Convocation Passes & Gowns" },
          { id: "degree-vault", label: "Verifiable Digital Degree Vault" },
          { id: "alumni-directory", label: "Global Alumni Directory", count: alumniList.length },
          { id: "alumni-giving", label: "Alumni Giving & Endowments", count: donations.length },
        ]}
      />

      {/* Tab 1: Multi-Dept Clearance Gateway */}
      {activeTab === "clearance-gateway" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text">5-Point Zero-Dues Clearance Checklist</h3>
              <p className="text-xs text-text-muted">
                Statutory cross-departmental verification required before official degree scroll and transcript issuance.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<Download size={13} />}
              onClick={() => {
                setSuccessMsg("Exported statutory graduation clearance roster (PDF/XLSX).");
                setTimeout(() => setSuccessMsg(""), 4000);
              }}
            >
              Export Clearance Roster
            </Button>
          </div>

          <Card pad="none" className="overflow-hidden">
            <DataTable
              data={candidates}
              columns={clearanceColumns}
              searchable={true}
              searchPlaceholder="Search graduating candidate or department..."
              searchField="studentName"
              pagination={true}
              pageSize={8}
            />
          </Card>
        </div>
      )}

      {/* Tab 2: Convocation Passes & Gowns */}
      {activeTab === "convocation-tokens" && (
        <div className="space-y-6">
          <Card pad="md" className="border-[#B98B4B]/30 bg-[#B98B4B]/5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B98B4B]/20 text-[#B98B4B] flex items-center justify-center shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text">14th Grand University Convocation Ceremony</h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    Date: December 12, 2026 • Venue: University Central Sports Arena • Chief Guest: Hon. Education Minister
                  </p>
                </div>
              </div>
              <Badge variant="gold">Registration Fee: ৳ 6,500</Badge>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates
              .filter((c) => c.overallStatus === "CLEARED")
              .map((c) => (
                <Card key={c.id} pad="md" className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-text">{c.studentName}</h4>
                      <p className="text-xs text-text-muted font-mono">{c.studentId} • {c.degree}</p>
                    </div>
                    <Badge variant="gold" size="sm">Pass Confirmed</Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-muted/50 border border-border flex items-center justify-between">
                    <div className="space-y-0.5 text-xs">
                      <div className="text-text-muted text-[10px]">Ceremony Token Code:</div>
                      <div className="font-mono font-bold text-text text-sm">{c.convocationToken}</div>
                      <div className="text-[11px] text-text-muted">
                        Gown Size: <span className="font-bold text-text">{c.gownSize}</span> • Guest Passes: <span className="font-bold text-text">{c.guestPassesCount}</span>
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-surface rounded-lg border border-border flex items-center justify-center text-text-muted">
                      <QrCode size={36} className="text-text" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <span className="text-text-muted">Gown Pickup Status:</span>
                    <Badge variant={c.gownCollected ? "success" : "warning"} size="sm">
                      {c.gownCollected ? "Collected from Wardrobe" : "Pending Wardrobe Pickup"}
                    </Badge>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Tab 3: Digital Degree Vault */}
      {activeTab === "degree-vault" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text">Cryptographically Sealed Verifiable Degree Parchments</h3>
              <p className="text-xs text-text-muted">
                Tamper-proof digital certificates verifiable globally via SHA-256 cryptographic seal.
              </p>
            </div>
            <Badge variant="success">WES & ECFMG Compatible</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates
              .filter((c) => c.overallStatus === "CLEARED")
              .map((c) => (
                <Card key={c.id} pad="md" className="space-y-4 border-2 border-border/70 hover:border-[#B98B4B] transition-all">
                  <div className="text-center space-y-1 pb-3 border-b border-border">
                    <div className="text-[10px] font-bold tracking-widest text-[#B98B4B] uppercase">Official Degree Scroll</div>
                    <div className="text-base font-serif font-bold text-text">{c.studentName}</div>
                    <div className="text-xs text-text-muted italic">{c.degree}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded-lg bg-surface-muted/40 border border-border/50">
                    <div>
                      <span className="text-text-muted block text-[10px]">Cumulative GPA:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{c.cgpa.toFixed(2)} / 4.00</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[10px]">Academic Standing:</span>
                      <span className="font-semibold text-text">{c.cgpa >= 3.80 ? "Summa Cum Laude" : "Good Standing"}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[10px]">Cryptographic Seal:</span>
                      <span className="font-mono text-[10px] text-text-muted">SHA-256: 0x8F9B...21C4</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[10px]">Chancellor Signature:</span>
                      <span className="font-serif text-[11px] text-text">Verified Digital Sign</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      icon={<Download size={13} />}
                      onClick={() => {
                        setSuccessMsg(`Downloading high-resolution official PDF degree scroll for ${c.studentName}.`);
                        setTimeout(() => setSuccessMsg(""), 4000);
                      }}
                    >
                      Download PDF Scroll
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Tab 4: Global Alumni Directory */}
      {activeTab === "alumni-directory" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text">Global Alumni Practitioners & Engineers Network</h3>
              <p className="text-xs text-text-muted">
                Directory of verified graduates across NHS UK, USMLE Hospitals, and Tech Enterprises.
              </p>
            </div>
            <Button
              variant="gold"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => setShowAlumniModal(true)}
            >
              Add Alumni
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alumniList.map((a) => (
              <Card key={a.id} pad="md" className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-text flex items-center gap-1.5">
                      <span>{a.name}</span>
                      {a.verifiedGraduate && <ShieldCheck size={14} className="text-emerald-500" />}
                    </h4>
                    <p className="text-xs text-[#B98B4B] font-medium">{a.currentPosition}</p>
                    <p className="text-xs text-text-muted">{a.currentOrganization}</p>
                  </div>
                  <Badge variant="gold" size="sm">Class of {a.graduationYear}</Badge>
                </div>

                <div className="p-2.5 rounded-lg bg-surface-muted/50 border border-border text-xs grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-text-muted block">Degree Earned:</span>
                    <span className="font-semibold text-text text-[11px] truncate block">{a.degree}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted block">Location:</span>
                    <span className="font-semibold text-text text-[11px] flex items-center gap-1">
                      <MapPin size={11} className="text-primary" />
                      <span>{a.location}, {a.country}</span>
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-text-muted">
                  <span>{a.email}</span>
                  <span>{a.phone}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Alumni Giving & Endowments */}
      {activeTab === "alumni-giving" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text">Alumni Philanthropy & Endowment Contribution Ledger</h3>
              <p className="text-xs text-text-muted">
                Statutory donations allocated toward scholarships, student emergency aid, and medical equipment.
              </p>
            </div>
            <Button
              variant="gold"
              size="sm"
              icon={<HeartHandshake size={14} />}
              onClick={() => setShowDonationModal(true)}
            >
              Record Donation
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {donations.map((d) => (
              <Card key={d.id} pad="md" className="space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-text">{d.donorName}</h4>
                      <p className="text-xs text-text-muted font-mono">{d.receiptNumber}</p>
                    </div>
                    <Badge variant="success" size="sm">{d.purpose.replace("_", " ")}</Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-muted/50 border border-border">
                    <span className="text-[10px] text-text-muted block">Contribution Amount:</span>
                    <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      ৳ {d.amount.toLocaleString()} BDT
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
                  <span>{d.date}</span>
                  <span>{d.paymentMethod}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Clearance Details Modal */}
      {selectedCandidate && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCandidate(null)}
          title={`Graduation Clearance Dossier: ${selectedCandidate.studentName}`}
          description={`Student ID #${selectedCandidate.studentId} • ${selectedCandidate.department}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-surface-muted/50 border border-border text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Accounts Section (Tuition & Fees):</span>
                <Badge variant={selectedCandidate.clearances.accounts ? "success" : "danger"} size="sm">
                  {selectedCandidate.clearances.accounts ? "Zero Dues (Cleared)" : "Outstanding Balance Due"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Central Library (Books & Fines):</span>
                <Badge variant={selectedCandidate.clearances.library ? "success" : "danger"} size="sm">
                  {selectedCandidate.clearances.library ? "All Volumes Returned" : "Unreturned Books Flagged"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Laboratories & Chemical Store:</span>
                <Badge variant={selectedCandidate.clearances.laboratory ? "success" : "danger"} size="sm">
                  {selectedCandidate.clearances.laboratory ? "Inventory Cleared" : "Breakage Fee Pending"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Hostel & Dining Hall:</span>
                <Badge variant={selectedCandidate.clearances.hostel ? "success" : "danger"} size="sm">
                  {selectedCandidate.clearances.hostel ? "Room Handed Over" : "Dorm Keys Outstanding"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Proctorial Disciplinary Board:</span>
                <Badge variant={selectedCandidate.clearances.proctor ? "success" : "danger"} size="sm">
                  {selectedCandidate.clearances.proctor ? "No Active Infractions" : "Disciplinary Hold Active"}
                </Badge>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <Button variant="outline" onClick={() => setSelectedCandidate(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Alumni Modal */}
      <Modal
        isOpen={showAlumniModal}
        onClose={() => setShowAlumniModal(false)}
        title="Register Alumni Member"
        description="Add verified university graduate to global directory"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formTarget = e.currentTarget;
            const newAlumni: AlumniMember = {
              id: `ALU-${100 + alumniList.length + 1}`,
              name: (formTarget.elements.namedItem("name") as HTMLInputElement).value,
              email: (formTarget.elements.namedItem("email") as HTMLInputElement).value,
              graduationYear: Number((formTarget.elements.namedItem("gradYear") as HTMLInputElement).value),
              department: (formTarget.elements.namedItem("dept") as HTMLSelectElement).value,
              degree: (formTarget.elements.namedItem("degree") as HTMLInputElement).value,
              currentPosition: (formTarget.elements.namedItem("position") as HTMLInputElement).value,
              currentOrganization: (formTarget.elements.namedItem("org") as HTMLInputElement).value,
              location: (formTarget.elements.namedItem("location") as HTMLInputElement).value,
              country: (formTarget.elements.namedItem("country") as HTMLInputElement).value,
              phone: (formTarget.elements.namedItem("phone") as HTMLInputElement).value,
              verifiedGraduate: true,
            };
            setAlumniList([newAlumni, ...alumniList]);
            setShowAlumniModal(false);
            setSuccessMsg(`Alumni profile for ${newAlumni.name} created and verified.`);
            setTimeout(() => setSuccessMsg(""), 4500);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Full Name" required>
              <Input name="name" required placeholder="e.g. Dr. Asif Ahmed" />
            </FormField>
            <FormField label="Email Address" required>
              <Input name="email" type="email" required placeholder="asif@hospital.org" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Department" required>
              <Select name="dept">
                <option value="MBBS Clinical Medicine">MBBS Clinical Medicine</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Microbiology & Immunology">Microbiology & Immunology</option>
                <option value="Pharmacy (B.Pharm)">Pharmacy (B.Pharm)</option>
              </Select>
            </FormField>
            <FormField label="Graduation Year" required>
              <Input name="gradYear" type="number" defaultValue="2024" required />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Current Position" required>
              <Input name="position" required placeholder="e.g. Specialist Registrar" />
            </FormField>
            <FormField label="Organization / Hospital" required>
              <Input name="org" required placeholder="e.g. Apollo Hospitals" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="City / Location" required>
              <Input name="location" required placeholder="e.g. London" />
            </FormField>
            <FormField label="Country" required>
              <Input name="country" required placeholder="e.g. United Kingdom" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Degree Earned" required>
              <Input name="degree" required placeholder="e.g. MBBS, FCPS" />
            </FormField>
            <FormField label="Phone Number">
              <Input name="phone" placeholder="+44 7700 900123" />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setShowAlumniModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold">
              Register Alumni
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Donation Modal */}
      <Modal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        title="Record Alumni Donation"
        description="Log philanthropic contribution to university trust ledger"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formTarget = e.currentTarget;
            const newDonation: AlumniDonation = {
              id: `DON-2026-${100 + donations.length + 1}`,
              donorName: (formTarget.elements.namedItem("donorName") as HTMLInputElement).value,
              graduationYear: Number((formTarget.elements.namedItem("gradYear") as HTMLInputElement).value),
              amount: Number((formTarget.elements.namedItem("amount") as HTMLInputElement).value),
              purpose: (formTarget.elements.namedItem("purpose") as HTMLSelectElement).value as any,
              date: new Date().toISOString().split("T")[0],
              paymentMethod: (formTarget.elements.namedItem("paymentMethod") as HTMLInputElement).value,
              receiptNumber: `RCP-ALUM-2026-${100 + donations.length + 1}`,
            };
            setDonations([newDonation, ...donations]);
            setShowDonationModal(false);
            setSuccessMsg(`Donation of ৳ ${newDonation.amount.toLocaleString()} BDT recorded successfully.`);
            setTimeout(() => setSuccessMsg(""), 4500);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Donor / Chapter Name" required>
              <Input name="donorName" required placeholder="e.g. Dr. Farhana Yasmin (Batch '21)" />
            </FormField>
            <FormField label="Graduation Year">
              <Input name="gradYear" type="number" defaultValue="2021" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Donation Amount (৳ BDT)" required>
              <Input name="amount" type="number" required placeholder="500000" className="font-mono" />
            </FormField>
            <FormField label="Endowment Purpose" required>
              <Select name="purpose">
                <option value="SCHOLARSHIP_FUND">Scholarship & Merit Waivers</option>
                <option value="CLINICAL_EQUIPMENT">Hospital Clinical Equipment</option>
                <option value="LIBRARY_JOURNALS">Digital Library & Journals</option>
                <option value="RESEARCH_ENDOWMENT">Medical Research Fellowship</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Payment Method" required>
            <Input name="paymentMethod" required placeholder="e.g. Sonali Bank Wire Transfer" />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setShowDonationModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold">
              Post Contribution
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
