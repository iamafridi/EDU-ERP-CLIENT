"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Building2,
  Bus,
  Library,
  DollarSign,
  Users,
  ShieldCheck,
  Stethoscope,
  GraduationCap,
  Layers,
  Activity,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  GitBranch,
  Cpu,
  BedDouble,
  Receipt,
  FileSpreadsheet,
  Clock,
  Compass,
  Utensils,
  Calculator,
  ShieldAlert,
  Zap,
  Printer,
  FileText,
  UserCheck,
  Briefcase,
  Sliders,
  Check,
} from "lucide-react";
import { useAuthStore, type UserProfile, type UserRole } from "@/store/useAuthStore";
import { createDemoSessionToken } from "@/lib/mockJwt";
import { useToast } from "@/components/landing/ToastFeedback";
import TryDemoModal, { DEMO_PERSONAS } from "@/components/landing/TryDemoModal";
import ContactModal from "@/components/landing/ContactModal";

type ActiveTab = "modules" | "personas" | "accounting-23" | "orbound-edu";
type ModuleCategory = "all" | "academics" | "residential" | "finance" | "campus";

interface ModuleData {
  id: string;
  category: "academics" | "residential" | "finance" | "campus";
  title: string;
  tagline: string;
  badge: string;
  icon: typeof BookOpen;
  progressPercent: number;
  description: string;
  features: string[];
  mockStats: { label: string; value: string; note: string }[];
  mindmapNode: string;
  image?: string;
  route?: string;
}

const MODULES_LIST: ModuleData[] = [
  {
    id: "student-lifecycle",
    category: "academics",
    title: "Student Enrollment & Identity OS",
    tagline: "Centralized Student Onboarding, Digital Locker & Registry",
    badge: "12 Modules",
    icon: Users,
    progressPercent: 100,
    image: "/screenshots/student-profile.png",
    route: "/profile",
    description:
      "Manages the end-to-end student journey from first application to alumni registry. Features cryptographically verified certificates, identity card generation, disciplinary records, and self-service student profile portals.",
    features: [
      "Online admission application intake with merit list generation",
      "Biometric, RFID card and digital student identity allocation",
      "Digital student credential locker for marksheets, affidavits & clearances",
      "Parent/Guardian monitoring portal with attendance alerts & notices",
      "Integrated scholarship, quota & fee waiver allotment rules",
    ],
    mockStats: [
      { label: "Active Enrolled Medicos & Students", value: "4,286", note: "100% Digitized Dossiers" },
      { label: "Identity Verification Rate", value: "99.8%", note: "Zero Duplicate Profiles" },
    ],
    mindmapNode: "Student Admissions -> Biometrics -> Digital Dossier -> Alumni",
  },
  {
    id: "academics-timetable",
    category: "academics",
    title: "Courses, Classes & Dynamic Timetables",
    tagline: "Conflict-Free Faculty Scheduling & Curriculum Mapping",
    badge: "18 Modules",
    icon: BookOpen,
    progressPercent: 100,
    image: "/screenshots/routines-timetable.png",
    route: "/routines",
    description:
      "A rule-based scheduling engine that prevents classroom clashes, faculty over-allocation, and equipment bottlenecks. Supports multi-semester medical & technical curricula, internal assessments, and university examination seating.",
    features: [
      "Automatic timetable generator with room capacity & faculty clash avoidance",
      "Semester syllabus tracking with lecture completion percentages",
      "Biometric and mobile classroom attendance logging with 75% shortage warnings",
      "Exam hall scheduling, invigilator duty allocation & barcode admit cards",
      "Internal grading, GPA computation and university transcript formatting",
    ],
    mockStats: [
      { label: "Timetable Conflict Rate", value: "0.00%", note: "Automated Constraint Solver" },
      { label: "Attendance Capture Speed", value: "<15 secs", note: "Per 150-student Lecture Hall" },
    ],
    mindmapNode: "Curriculum -> Room Assignment -> Timetable -> Exams -> Transcripts",
  },
  {
    id: "hostel-residential",
    category: "residential",
    title: "Multi-Block Hostel & Bed Matrix",
    tagline: "Dormitory Allotment, Warden Approvals & Gate Out-Passes",
    badge: "14 Modules",
    icon: Building2,
    progressPercent: 100,
    image: "/screenshots/student-fees.png",
    route: "/rooms",
    description:
      "The flagship residential backbone of Hostel Pro-ERP. Visualizes multi-wing hostel blocks, room occupancy, resident inventory check-in/out, digital out-passes approved by wardens, and facility maintenance dispatch.",
    features: [
      "Interactive 3D bed matrix by hostel block, floor, and room category",
      "Warden digital portal for overnight leave & library out-pass authorization",
      "Campus gate security barcode scanner validating student exit/entry in real time",
      "Automated hostel fee demand generation linked directly to the financial ledger",
      "Facility maintenance ticketing with photo verification and SLA escalation",
    ],
    mockStats: [
      { label: "Hostel Residents Housed", value: "1,850+", note: "Across Blocks A, B, C & D" },
      { label: "Gate Pass Verification Speed", value: "1.2 secs", note: "Biometric Scanner Terminal" },
    ],
    mindmapNode: "Hostel Blocks -> Bed Allotment -> Warden Portal -> Gate Pass -> Maintenance",
  },
  {
    id: "smart-mess",
    category: "residential",
    title: "Smart Mess, Dining & Cafeteria",
    tagline: "Digital Meal Cards, Diet Schedules & Kitchen Inventory",
    badge: "10 Modules",
    icon: Utensils,
    progressPercent: 100,
    image: "/screenshots/expenses.png",
    route: "/mess",
    description:
      "Eliminates paper meal coupons and cafeteria leaks. Tracks resident food allowance balance, kitchen raw material procurement, weekly dietitian menu plans, and meal scanner counts for breakfast, lunch, and dinner.",
    features: [
      "Digital meal card QR/RFID scanner tracking dining hall entry per service",
      "Dietary preference and special medical diet logging for student medicos",
      "Real-time mess ledger deductions linked to student term accounts",
      "Bulk kitchen grocery purchase orders and pantry stock valuation",
      "Student dining feedback ratings and waste management auditing",
    ],
    mockStats: [
      { label: "Daily Meals Scanned", value: "3,200+", note: "Breakfast, Lunch, Dinner" },
      { label: "Cafeteria Reconciliation", value: "100%", note: "Zero Paper Coupon Fraud" },
    ],
    mindmapNode: "Dietary Menu -> Meal Scanner -> Resident Balance -> Kitchen Stock",
  },
  {
    id: "transport-fleet",
    category: "campus",
    title: "Bus Routes & Campus Fleet Logistics",
    tagline: "GPS Transit Scheduling, Designated Stops & Student Passes",
    badge: "8 Modules",
    icon: Bus,
    progressPercent: 100,
    image: "/screenshots/iot-telemetry.png",
    route: "/iot",
    description:
      "Coordinates campus shuttle buses, day-scholar transportation, clinical rotation vans, and university transport fleets. Assigns student bus stops, tracks vehicle maintenance, fuel consumption, and transit fee collection.",
    features: [
      "Dynamic bus route optimization connecting residential neighborhoods and campus",
      "Designated pickup and drop-off student roster per vehicle",
      "Driver shift scheduling, license verification & trip mileage logs",
      "Digital student transit passes with automated term fee demand linkage",
      "Emergency campus shuttle dispatch for clinical rotation batches",
    ],
    mockStats: [
      { label: "Active Campus Buses", value: "24 Fleets", note: "Covering 18 City Routes" },
      { label: "Daily Transit Commuters", value: "1,400+", note: "Students, Faculty & Staff" },
    ],
    mindmapNode: "City Routes -> Designated Stops -> Fleet GPS -> Transit Passes",
  },
  {
    id: "double-entry-finance",
    category: "finance",
    title: "Double-Entry Accounting & Payroll HR",
    tagline: "GAAP Ledger, Multi-Voucher Approvals & Salary Slips",
    badge: "16 Modules",
    icon: DollarSign,
    progressPercent: 100,
    image: "/screenshots/accounting-reports.png",
    route: "/accounting/reports",
    description:
      "An enterprise accounting core designed for large academic and residential organizations. Manages 5-tier Chart of Accounts, tuition demand generation, multi-counter cash balancing, staff payroll slips, and real-time balance sheets.",
    features: [
      "5-tier hierarchical Chart of Accounts (Assets, Liabilities, Equity, Income, Expense)",
      "Automated tuition & hostel fee demand batches with scholarship deductions",
      "Multi-voucher journal entries with dual-approver hierarchy and immutable trails",
      "Real-time Balance Sheet, Trial Balance, Cashflow Statement & Subledger reports",
      "Faculty and administrative staff payroll engine with tax, leave & deduction calculation",
    ],
    mockStats: [
      { label: "YTD Managed Collections", value: "৳38.4 Cr", note: "99.98% Auto-Reconciled" },
      { label: "Voucher Discrepancy Rate", value: "0.00%", note: "ACID Transaction Locks" },
    ],
    mindmapNode: "Tuition Inflow -> Journal Voucher -> Dual Approval -> General Ledger -> Payroll",
  },
  {
    id: "library-management",
    category: "campus",
    title: "Library Catalog & Digital Repository",
    tagline: "Dewey Decimal Classification, Barcode Issue & E-Journals",
    badge: "10 Modules",
    icon: Library,
    progressPercent: 100,
    image: "/screenshots/digital-locker.png",
    route: "/digital-locker",
    description:
      "Full library automation from book accession to digital lending. Integrates barcode scanner check-in/out, overdue fine calculators, journal subscriptions, and digital thesis repositories for faculty and researchers.",
    features: [
      "Dewey Decimal & ISBN accession cataloging with shelf location mapping",
      "Rapid barcode/RFID book issue and return counter with fine calculation",
      "Digital repository for academic research papers, syllabi & e-book lending",
      "Reading room seat reservation & quiet study zone monitoring",
      "Annual library inventory audit and missing book replacement tracking",
    ],
    mockStats: [
      { label: "Cataloged Volumes", value: "48,000+", note: "Books, Journals & Theses" },
      { label: "Daily Circulation Rate", value: "650+ Items", note: "Average Checkout TAT <20s" },
    ],
    mindmapNode: "Accession Catalog -> Barcode Circulation -> E-Repository -> Audit",
  },
  {
    id: "campus-clinic-care",
    category: "campus",
    title: "Integrated Campus Health & Clinic",
    tagline: "Campus Infirmary, OPD Token Triage & Student Vitals",
    badge: "12 Modules",
    icon: Stethoscope,
    progressPercent: 100,
    image: "/screenshots/research-grants.png",
    route: "/research",
    description:
      "Hostel Pro-ERP includes an integrated medical clinic and infirmary module for residential campuses, university health centers, and teaching hospitals. Connects outpatient queues, bed admissions, lab orders, and student health records.",
    features: [
      "Token-driven OPD queue routing students and staff to campus medical officers",
      "Infirmary bed occupancy, vital signs monitoring & night nursing shift notes",
      "Diagnostic laboratory test tracking (CBC, urine, culture) with digital report delivery",
      "Emergency campus ambulance dispatch and hospital referral transfer logs",
      "Digital prescription inventory tracking dispensing from the campus pharmacy",
    ],
    mockStats: [
      { label: "Infirmary Beds Managed", value: "40 Beds", note: "Plus 400 Teaching Hospital Beds" },
      { label: "Daily Clinic Consultations", value: "240+", note: "Students, Staff & Faculty" },
    ],
    mindmapNode: "OPD Triage -> Medical Vitals -> Infirmary Beds -> Pharmacy Dispense",
  },
  {
    id: "governance-audit",
    category: "academics",
    title: "Domain Administration & Immutable Audits",
    tagline: "5-Role RBAC, Cryptographic Logging & Regulatory Returns",
    badge: "10 Modules",
    icon: ShieldCheck,
    progressPercent: 100,
    image: "/screenshots/admin-mission-control.png",
    route: "/admin",
    description:
      "Provides institutional governance and data privacy. Enforces strict domain segregation so that hostel wardens, finance accountants, faculty members, and provosts only access their respective operational domains with tamper-evident audit trails.",
    features: [
      "Multi-domain Role-Based Access Control (Super Admin, Domain Admins, Faculty, Student, Staff)",
      "Cryptographically chained audit logs tracking timestamp, user ID, IP address & delta snapshot",
      "One-click regulatory compliance report generation (NAAC, NMC, AICTE, UGC)",
      "Automated daily encrypted database backups with point-in-time disaster recovery",
      "Centralized campus branch configuration for multi-institute university groups",
    ],
    mockStats: [
      { label: "Audit Integrity Score", value: "100%", note: "Zero Unauthorized Overwrites" },
      { label: "Compliance Return Gen", value: "1-Click", note: "300+ Man-Hours Saved" },
    ],
    mindmapNode: "Central Authority -> Domain RBAC -> Audit Trail -> Inspection Return",
  },
];

// The 23+ Core Accounting Features List
const ACCOUNTING_23_FEATURES = [
  {
    id: 1,
    title: "GAAP Double-Entry Balance Validator",
    engine: "validation.engine.ts",
    category: "GAAP Integrity",
    desc: "Enforces mathematical equality of total debits and credits with zero float variance before database commitment.",
  },
  {
    id: 2,
    title: "Atomic Session Orchestrator",
    engine: "orchestrator.engine.ts",
    category: "ACID Concurrency",
    desc: "Executes multi-document MongoDB transaction sessions to eliminate orphaned line-items or partial postings.",
  },
  {
    id: 3,
    title: "Journal Voucher Auto-Sequencer",
    engine: "journal.engine.ts",
    category: "Ledger Posting",
    desc: "Mints immutable, sequential voucher numbers (JN-timestamp) with line-item narrations and user audit trail.",
  },
  {
    id: 4,
    title: "5-Tier Chart of Accounts (COA)",
    engine: "account.model.ts",
    category: "Account Master",
    desc: "Organized account tree (1000 Assets, 2000 Liabilities, 3000 Equity, 4000 Revenue, 5000 Expenses).",
  },
  {
    id: 5,
    title: "Control Account Invariant Validator",
    engine: "validation.engine.ts",
    category: "Subledger Control",
    desc: "Blocks direct posting to Accounts Receivable or Payable without an attached student or vendor subledger ID.",
  },
  {
    id: 6,
    title: "Party Subledger Aggregator",
    engine: "subledger.engine.ts",
    category: "Subledger Control",
    desc: "Maintains real-time individual customer accounts for every student and vendor accounts for campus suppliers.",
  },
  {
    id: 7,
    title: "Dynamic Trial Balance Generator",
    engine: "balance.engine.ts",
    category: "Financial Reporting",
    desc: "Instantly aggregates posted journal lines across all ledger codes, verifying total debit and credit equilibrium.",
  },
  {
    id: 8,
    title: "Real-Time GL Balance Query Pipeline",
    engine: "balance.engine.ts",
    category: "Financial Reporting",
    desc: "Calculates instantaneous debit sum, credit sum, and net closing balance for any account code via Mongo aggregation.",
  },
  {
    id: 9,
    title: "EDU Orbound Credit Tuition Engine",
    engine: "fee.model.ts",
    category: "Student Billing",
    desc: "Dynamically multiplies advised course credits by departmental credit rate (Credits × ৳ Rate) to generate billing.",
  },
  {
    id: 10,
    title: "Itemized Multi-Head Fee Allocation",
    engine: "feeStructure.model.ts",
    category: "Student Billing",
    desc: "Segregates billings into distinct heads: Tuition, Advising Fee, Lab Fee, Development Fee, Library & Clinic Insurance.",
  },
  {
    id: 11,
    title: "Cohort Batch Demand Invoicing",
    engine: "fee.controller.ts",
    category: "Student Billing",
    desc: "Executes semester fee runs across full batches or academic departments simultaneously with atomic session safety.",
  },
  {
    id: 12,
    title: "Merit Scholarship Waiver Calculator",
    engine: "scholarship.model.ts",
    category: "Student Billing",
    desc: "Computes merit, sibling, and trustee waivers (25%, 50%, 100%) and posts contra-revenue credit adjustments.",
  },
  {
    id: 13,
    title: "Late Advising Penalty Assessor",
    engine: "fee.interface.ts",
    category: "Surcharges",
    desc: "Automatically appends late advising surcharges when student course selections occur past the registrar deadline.",
  },
  {
    id: 14,
    title: "Late Tuition Payment Surcharge Calculator",
    engine: "fee.service.ts",
    category: "Surcharges",
    desc: "Applies penalty fees for payments submitted after invoice due dates, auto-updating student running balances.",
  },
  {
    id: 15,
    title: "Multi-Channel Payment Settlement",
    engine: "payment.model.ts",
    category: "Payment Clearing",
    desc: "Reconciles bank challan deposit slips, physical campus cash desk collections, and digital mobile wallet gateways.",
  },
  {
    id: 16,
    title: "Money Receipts Generator & PDF",
    engine: "receipt.model.ts",
    category: "Documentation",
    desc: "Generates formatted, printable receipts with institutional seal, transaction ID, roll number, and fee heads.",
  },
  {
    id: 17,
    title: "Vendor Master & Tax Profile Registry",
    engine: "procurement.interface.ts",
    category: "Procurement",
    desc: "Onboards suppliers with TIN/BIN, bank clearance details, contact profiles, and accounts payable balances.",
  },
  {
    id: 18,
    title: "Purchase Order (PO) Lifecycle Engine",
    engine: "procurement.interface.ts",
    category: "Procurement",
    desc: "Tracks requisition items, unit rates, tax lines, and approval workflow through purchase fulfillment.",
  },
  {
    id: 19,
    title: "Goods Receipt Note (GRN) 3-Way Matching",
    engine: "procurement.interface.ts",
    category: "Procurement",
    desc: "Verifies physical goods arrival and inspection against PO numbers before clearing vendor invoices for payment.",
  },
  {
    id: 20,
    title: "6-Voucher Dual Approver Workflow",
    engine: "voucher.interface.ts",
    category: "Voucher Core",
    desc: "Supports Sales Invoice, Purchase Bill, Payment, Receipt, Contra, and Journal Vouchers across Draft to Posted states.",
  },
  {
    id: 21,
    title: "Staff & Faculty Payroll Compensation Engine",
    engine: "payroll.interface.ts",
    category: "Payroll & HR",
    desc: "Calculates gross pay, allowances (HRA, DA, Medical), deductions (tax/TDS, provident fund), and net pay slips.",
  },
  {
    id: 22,
    title: "Departmental Expense Claim System",
    engine: "expense.interface.ts",
    category: "Expense Management",
    desc: "Manages operational expenses (labs, utilities, maintenance) with receipt attachments and budget account limits.",
  },
  {
    id: 23,
    title: "Institutional Budget Variance Monitor",
    engine: "budget.interface.ts",
    category: "Budgeting",
    desc: "Tracks annual CapEx and OpEx by department, reporting allocated vs. utilized funds in real-time.",
  },
  {
    id: 24,
    title: "Chained Cryptographic Audit Trail",
    engine: "auditLog.model.ts",
    category: "Compliance",
    desc: "Timestamp, user ID, IP address, and complete before/after delta JSON snapshot for every financial update.",
  },
];

// Sample Courses for the EDU Orbound Simulator
interface SimCourse {
  code: string;
  name: string;
  credits: number;
  isLab: boolean;
}

const SAMPLE_COURSES: SimCourse[] = [
  { code: "CSE 311", name: "Database Management Systems", credits: 3.0, isLab: false },
  { code: "CSE 312", name: "Database Management Systems Lab", credits: 1.5, isLab: true },
  { code: "MAT 205", name: "Linear Algebra & Differential Equations", credits: 3.0, isLab: false },
  { code: "ENG 102", name: "Professional & Technical Communication", credits: 3.0, isLab: false },
  { code: "CSE 323", name: "Operating Systems Principles", credits: 3.0, isLab: false },
];

export default function ModulesPage() {
  const router = useRouter();
  const loginUser = useAuthStore((state) => state.login);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>("modules");
  const [selectedCategory, setSelectedCategory] = useState<ModuleCategory>("all");
  const [activeMindmap, setActiveMindmap] = useState<string>(MODULES_LIST[0].id);

  // Modals state
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Orbound Simulator State
  const [perCreditRate, setPerCreditRate] = useState<number>(6500); // ৳6,500 BDT per credit
  const [selectedCourseCodes, setSelectedCourseCodes] = useState<string[]>([
    "CSE 311",
    "CSE 312",
    "MAT 205",
    "ENG 102",
  ]);
  const [advisingFee, setAdvisingFee] = useState<number>(2500);
  const [labFee, setLabFee] = useState<number>(4000);
  const [devFee, setDevFee] = useState<number>(3000);
  const [medicalFee, setMedicalFee] = useState<number>(800);
  const [lateAdvising, setLateAdvising] = useState<boolean>(true);
  const [latePayment, setLatePayment] = useState<boolean>(false);
  const [waiverPercent, setWaiverPercent] = useState<number>(25); // 25% Merit Waiver
  const [paidAmount, setPaidAmount] = useState<number>(50000); // ৳50,000 paid

  // Filtered modules for the 82+ modules catalog
  const filteredModules =
    selectedCategory === "all"
      ? MODULES_LIST
      : MODULES_LIST.filter((m) => m.category === selectedCategory);

  const activeModuleItem = MODULES_LIST.find((m) => m.id === activeMindmap) || MODULES_LIST[0];

  // Orbound Calculations
  const orboundCalculation = useMemo(() => {
    const chosenCourses = SAMPLE_COURSES.filter((c) => selectedCourseCodes.includes(c.code));
    const totalCredits = chosenCourses.reduce((sum, c) => sum + c.credits, 0);
    const tuitionRaw = totalCredits * perCreditRate;
    const waiverAmount = (tuitionRaw * waiverPercent) / 100;
    const netTuition = tuitionRaw - waiverAmount;

    const lateAdvisingFine = lateAdvising ? 1000 : 0;
    const latePaymentFine = latePayment ? 500 : 0;

    const institutionalHeadsTotal = advisingFee + labFee + devFee + medicalFee;
    const grandTotalBilled = netTuition + institutionalHeadsTotal + lateAdvisingFine + latePaymentFine;
    const netBalance = grandTotalBilled - paidAmount;

    return {
      chosenCourses,
      totalCredits,
      tuitionRaw,
      waiverAmount,
      netTuition,
      institutionalHeadsTotal,
      lateAdvisingFine,
      latePaymentFine,
      grandTotalBilled,
      netBalance,
    };
  }, [
    selectedCourseCodes,
    perCreditRate,
    waiverPercent,
    advisingFee,
    labFee,
    devFee,
    medicalFee,
    lateAdvising,
    latePayment,
    paidAmount,
  ]);

  const toggleCourse = (code: string) => {
    setSelectedCourseCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleLaunchRole = (persona: typeof DEMO_PERSONAS[0]) => {
    const profile: UserProfile = {
      id: persona.key,
      name: persona.name,
      email: persona.email,
      role: persona.role,
      isDemo: true,
      domainAdminType: persona.domainAdminType,
      staffSubRole: persona.staffSubRole as any,
    };
    const token = createDemoSessionToken(persona.role || "student", persona.email);
    loginUser(profile, token);
    showToast(`Launching session as ${persona.roleLabel}...`);
    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  };

  return (
    <div className="flex flex-col bg-[#060B12] text-white selection:bg-[#B98B4B] selection:text-[#060B12] min-h-dvh">
      {/* ─── Live Telemetry Engine Ticker ─── */}
      <div className="bg-[#09121E] border-b border-white/[0.08] py-2 px-4 text-center">
        <div className="mx-auto max-w-[1300px] flex items-center justify-between text-[11px] font-mono text-white/60">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[#D4AF37] font-bold">CAMPUS CLOUD MESH:</span>
            <span>97 WORKSPACES ACTIVE</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-white/50">
            <span>REPLICATION: &lt;12MS</span>
            <span>•</span>
            <span>ACID TRANSACTIONS: 100% COMMITTED</span>
            <span>•</span>
            <span className="text-teal-400 font-bold">ZERO-TRUST RBAC</span>
          </div>
        </div>
      </div>

      {/* ─── Hero Section with Sub-System Navigator ─── */}
      <section className="relative pt-14 pb-16 lg:pt-18 lg:pb-24 border-b border-white/[0.08] bg-[#070D14] overflow-hidden">
        {/* Ambient Volumetric Rays & Blueprint Grid */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] gold-beam-conic opacity-35 pointer-events-none -z-10 radial-fade-mask" />
        <div className="absolute inset-0 blueprint-grid-bg opacity-35 radial-fade-mask pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#B98B4B]/15 blur-[160px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/4 right-10 w-[500px] h-[400px] bg-[#0F766E]/15 blur-[150px] rounded-full pointer-events-none -z-10" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-bold text-[#D4AF37] uppercase tracking-widest font-ui mb-5">
              <Sparkles size={13} />
              CAMPUS OPERATING SYSTEM MASTER ARCHITECTURE
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight font-display mb-5 leading-[1.12]"
          >
            Every module, desk, and financial ledger{" "}
            <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#2DD4BF]">
              fully explained
            </span>
            .
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-sm sm:text-base text-white/75 max-w-3xl mx-auto leading-relaxed font-body mb-8"
          >
            Engineered modeled after East Delta University&apos;s credit-hour advising and financial system,
            powered by an ACID-compliant double-entry accounting engine and a Google Classroom style LMS.
          </motion.p>

          {/* Master View Navigation Tabs (Pill Style) */}
          <div className="inline-flex flex-wrap items-center justify-center p-1.5 rounded-2xl bg-[#0B1522] border border-white/15 backdrop-blur-2xl shadow-2xl gap-1.5">
            {[
              { id: "modules", label: "82+ Modules & Mindmap", icon: Layers },
              { id: "orbound-edu", label: "East Delta Univ Orbound Billing", icon: Calculator },
              { id: "accounting-23", label: "23+ Core Accounting Features", icon: DollarSign },
              { id: "personas", label: "Roles & Access Matrix", icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer font-ui flex items-center gap-2 ${
                    isActive
                      ? "bg-gradient-to-r from-[#B98B4B] to-[#9E743A] text-white shadow-lg shadow-[#B98B4B]/30 border border-[#D4AF37]/40"
                      : "text-white/70 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-[#FFFEFA]" : "text-[#D4AF37]"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── TAB CONTENT 1: EAST DELTA UNIVERSITY ORBOUND FINANCIAL SIMULATOR ─── */}
      {activeTab === "orbound-edu" && (
        <section className="py-16 bg-[#090A10] border-b border-white/[0.08]">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-emerald-400 font-ui block mb-2">
                STUDENT FINANCE &amp; BLACKBOX LEDGER SPECIFICATION
              </span>
              <h2 className="text-3xl sm:text-4xl font-normal text-white font-display mb-3">
                East Delta University Orbound / Blackbox Billing Model
              </h2>
              <p className="text-xs sm:text-sm text-white/60 font-body">
                In East Delta University, student billings are determined dynamically by the exact courses and credits
                advised, itemized institutional fees, late advising/payment fines, and waivers. Test our live calculation below:
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Interactive Course Advising & Fee Heads Picker */}
              <div className="lg:col-span-7 space-y-6">
                {/* Course Selection Panel */}
                <div className="p-6 rounded-3xl border border-white/10 bg-[#0C0D18] shadow-2xl">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap size={18} className="text-[#8C7BE8]" />
                      <h3 className="text-sm font-bold text-white font-ui">
                        Semester Course Advising Selection
                      </h3>
                    </div>
                    <div className="text-xs font-mono text-white/60">
                      Rate: <span className="font-bold text-emerald-400">৳{perCreditRate.toLocaleString()}</span> / Credit
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {SAMPLE_COURSES.map((course) => {
                      const isSelected = selectedCourseCodes.includes(course.code);
                      const courseCost = course.credits * perCreditRate;
                      return (
                        <div
                          key={course.code}
                          onClick={() => toggleCourse(course.code)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? "bg-violet-600/15 border-violet-500/50 text-white"
                              : "bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/[0.05]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                                isSelected
                                  ? "bg-violet-600 border-violet-400 text-white"
                                  : "border-white/20 bg-white/[0.05]"
                              }`}
                            >
                              {isSelected && <Check size={12} />}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white font-ui flex items-center gap-2">
                                <span>{course.code}</span>
                                {course.isLab && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                                    LAB
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-white/50">{course.name}</div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-bold text-emerald-400 font-mono">
                              ৳{courseCost.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-white/40">
                              {course.credits.toFixed(1)} Credits
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary of Advised Credits */}
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-white/60">Total Advised Course Credits:</span>
                    <span className="font-bold text-white">
                      {orboundCalculation.totalCredits.toFixed(1)} Credits
                    </span>
                  </div>
                </div>

                {/* Institutional Fee Heads & Surcharges Panel */}
                <div className="p-6 rounded-3xl border border-white/10 bg-[#0C0D18] shadow-2xl">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-2">
                      <Receipt size={18} className="text-[#8C7BE8]" />
                      <h3 className="text-sm font-bold text-white font-ui">
                        Itemized Institutional Fee Heads &amp; Surcharges
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-white/40 uppercase font-ui">
                      East Delta University Rules
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                      <span className="text-xs text-white/70">Advising Fee:</span>
                      <span className="text-xs font-bold text-white font-mono">৳{advisingFee.toLocaleString()}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                      <span className="text-xs text-white/70">Laboratory Fee:</span>
                      <span className="text-xs font-bold text-white font-mono">৳{labFee.toLocaleString()}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                      <span className="text-xs text-white/70">Campus Development:</span>
                      <span className="text-xs font-bold text-white font-mono">৳{devFee.toLocaleString()}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                      <span className="text-xs text-white/70">Clinic &amp; Insurance:</span>
                      <span className="text-xs font-bold text-white font-mono">৳{medicalFee.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Surcharges and Waivers Toggles */}
                  <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10 cursor-pointer">
                      <span className="flex items-center gap-2 text-white/80">
                        <Clock size={14} className="text-amber-400" />
                        <span>Late Advising Penalty Surcharge</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-amber-400 font-bold">+৳1,000</span>
                        <input
                          type="checkbox"
                          checked={lateAdvising}
                          onChange={(e) => setLateAdvising(e.target.checked)}
                          className="rounded accent-violet-600"
                        />
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10 cursor-pointer">
                      <span className="flex items-center gap-2 text-white/80">
                        <Clock size={14} className="text-rose-400" />
                        <span>Late Tuition Payment Penalty Surcharge</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-rose-400 font-bold">+৳500</span>
                        <input
                          type="checkbox"
                          checked={latePayment}
                          onChange={(e) => setLatePayment(e.target.checked)}
                          className="rounded accent-violet-600"
                        />
                      </div>
                    </label>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                      <span className="text-white/80">Merit Scholarship / Sibling Waiver:</span>
                      <div className="flex items-center gap-2">
                        <select
                          value={waiverPercent}
                          onChange={(e) => setWaiverPercent(Number(e.target.value))}
                          className="px-2 py-1 rounded bg-[#121424] border border-white/20 text-white font-mono text-xs"
                        >
                          <option value={0}>0% Waiver</option>
                          <option value={25}>25% Merit Waiver</option>
                          <option value={50}>50% Half Waiver</option>
                          <option value={100}>100% Full Trustee</option>
                        </select>
                        <span className="font-mono text-emerald-400 font-bold">
                          -৳{orboundCalculation.waiverAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: The Orbound Statement Card & Money Receipt */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-6 rounded-3xl border border-white/15 bg-gradient-to-b from-[#101222] to-[#0A0C16] shadow-2xl relative">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        OFFICIAL STATEMENT
                      </span>
                      <h3 className="text-base font-bold text-white font-ui mt-1">
                        Student Semester Account Summary
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast("Printing Official Watermarked Money Receipt PDF...")}
                      className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white/80 hover:text-white transition-colors cursor-pointer border border-white/10"
                      title="Print Money Receipt"
                    >
                      <Printer size={16} />
                    </button>
                  </div>

                  {/* Statement Line-Items */}
                  <div className="space-y-2 text-xs font-mono mb-6">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-white/60">Gross Course Tuition ({orboundCalculation.totalCredits} Cr):</span>
                      <span className="text-white">৳{orboundCalculation.tuitionRaw.toLocaleString()}</span>
                    </div>
                    {orboundCalculation.waiverAmount > 0 && (
                      <div className="flex justify-between py-1 border-b border-white/5 text-emerald-400">
                        <span>Scholarship / Waiver ({waiverPercent}%):</span>
                        <span>-৳{orboundCalculation.waiverAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-white/60">Institutional Fee Heads (Total):</span>
                      <span className="text-white">৳{orboundCalculation.institutionalHeadsTotal.toLocaleString()}</span>
                    </div>
                    {orboundCalculation.lateAdvisingFine > 0 && (
                      <div className="flex justify-between py-1 border-b border-white/5 text-amber-400">
                        <span>Late Advising Penalty:</span>
                        <span>+৳{orboundCalculation.lateAdvisingFine.toLocaleString()}</span>
                      </div>
                    )}
                    {orboundCalculation.latePaymentFine > 0 && (
                      <div className="flex justify-between py-1 border-b border-white/5 text-rose-400">
                        <span>Late Payment Penalty:</span>
                        <span>+৳{orboundCalculation.latePaymentFine.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-t-2 border-white/15 text-sm font-bold">
                      <span className="text-white">Grand Total Billed:</span>
                      <span className="text-violet-300">৳{orboundCalculation.grandTotalBilled.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Amount Paid Slider / Input */}
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 mb-6">
                    <div className="flex items-center justify-between text-xs font-ui mb-2">
                      <span className="text-white/70">Recorded Student Payments:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        ৳{paidAmount.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={80000}
                      step={5000}
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-white/40 font-mono mt-1">
                      <span>৳0 (Unpaid)</span>
                      <span>৳40,000</span>
                      <span>৳80,000 (Advance)</span>
                    </div>
                  </div>

                  {/* Final Net Due vs Extra Paid Callout */}
                  <div
                    className={`p-4 rounded-2xl border text-center ${
                      orboundCalculation.netBalance > 0
                        ? "bg-rose-500/15 border-rose-500/30 text-rose-200"
                        : orboundCalculation.netBalance < 0
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-200"
                        : "bg-blue-500/15 border-blue-500/30 text-blue-200"
                    }`}
                  >
                    <span className="text-[10px] font-extrabold uppercase tracking-wider block font-ui mb-1">
                      {orboundCalculation.netBalance > 0
                        ? "Outstanding Semester Dues"
                        : orboundCalculation.netBalance < 0
                        ? "Advance Credit Balance (Extra Paid)"
                        : "Semester Account Fully Settled"}
                    </span>
                    <div className="text-2xl font-black font-mono">
                      ৳{Math.abs(orboundCalculation.netBalance).toLocaleString()}
                    </div>
                    <span className="text-[11px] opacity-80 block mt-1 font-body">
                      {orboundCalculation.netBalance > 0
                        ? "Payable at designated bank counter or bKash gateway"
                        : orboundCalculation.netBalance < 0
                        ? "Carried forward to next semester registration credit"
                        : "Cleared for examination hall admit card download"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── TAB CONTENT 2: 23+ CORE ACCOUNTING FEATURES BREAKDOWN ─── */}
      {activeTab === "accounting-23" && (
        <section className="py-16 bg-[#090A10] border-b border-white/[0.08]">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-violet-400 font-ui block mb-2">
                GAAP COMPLIANCE &amp; DOUBLE-ENTRY ENGINE INVENTORY
              </span>
              <h2 className="text-3xl sm:text-4xl font-normal text-white font-display mb-3">
                The 23+ Core Accounting &amp; Finance Features
              </h2>
              <p className="text-xs sm:text-sm text-white/60 font-body">
                Here is the verified, code-level inventory of all 23 financial and double-entry features implemented
                in this system — from atomic session validation to subledger controls, multi-head billing, and payroll.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ACCOUNTING_23_FEATURES.map((feat) => (
                <div
                  key={feat.id}
                  className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-violet-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-mono font-bold text-[#8C7BE8]">
                        #{String(feat.id).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30 uppercase font-ui">
                        {feat.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white font-ui mb-1.5">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed font-body mb-3">
                      {feat.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/40">
                    <span>Engine:</span>
                    <span className="text-emerald-400">{feat.engine}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── TAB CONTENT 3: ROLES & PERSONA ACCESS MATRIX ─── */}
      {activeTab === "personas" && (
        <section className="py-16 bg-[#090A10] border-b border-white/[0.08]">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-violet-400 font-ui block mb-2">
                ROLE-BASED ACCESS CONTROL (RBAC)
              </span>
              <h2 className="text-3xl sm:text-4xl font-normal text-white font-display mb-3">
                Who Sees What: 5 Personas &amp; 150+ Screens
              </h2>
              <p className="text-xs sm:text-sm text-white/60 font-body">
                Hostel Pro-ERP cleanly separates administrative, teaching, student, and campus logistics roles.
                Click <span className="text-violet-300 font-bold">⚡ Launch Demo</span> on any role to immediately test
                its exact operational desks without passwords:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {DEMO_PERSONAS.map((persona) => {
                const Icon = persona.icon;
                return (
                  <div
                    key={persona.key}
                    className="p-6 rounded-3xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-violet-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${persona.color} flex items-center justify-center text-white shadow-md`}
                        >
                          <Icon size={20} />
                        </div>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${persona.badgeBg} font-ui`}
                        >
                          {persona.category}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white font-ui mb-0.5">
                        {persona.roleLabel}
                      </h3>
                      <div className="text-xs text-white/50 mb-2 font-body">
                        {persona.name}
                      </div>

                      <p className="text-xs text-white/70 leading-relaxed font-body mb-4">
                        {persona.tagline}
                      </p>

                      <ul className="space-y-1.5 mb-5 border-t border-white/10 pt-3">
                        {persona.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-white/60">
                            <span className="text-violet-400 font-bold mt-0.5">•</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <div className="text-[11px] font-mono text-white/40 truncate">
                        {persona.email}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleLaunchRole(persona)}
                        className="w-full h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold font-ui transition-all shadow-md shadow-violet-900/40 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Zap size={13} className="fill-white" />
                        <span>⚡ Launch {persona.roleLabel}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── TAB CONTENT 4: 82+ MODULES & VISUAL DATA MINDMAP ─── */}
      {activeTab === "modules" && (
        <>
          {/* Interactive Mindmap Section */}
          <section className="py-16 bg-[#090A10] border-b border-white/[0.08] relative">
            <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <span className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-[#8C7BE8] font-ui block mb-2">
                  INTEGRATED WORKFLOW TOPOLOGY
                </span>
                <h2 className="text-3xl sm:text-4xl font-normal text-white font-display mb-3">
                  Visual Campus Data Flow Mindmap
                </h2>
                <p className="text-sm sm:text-base text-white/60 font-body">
                  Click any campus node below to trace how operational data travels across student records,
                  residences, transport, and financial accounts.
                </p>
              </div>

              {/* Mindmap Interactive Canvas */}
              <div className="p-6 sm:p-10 rounded-3xl border border-white/10 bg-[#0C0D18] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-10 w-[400px] h-[300px] bg-violet-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

                {/* Center Core Hub */}
                <div className="flex flex-col items-center justify-center mb-8 text-center">
                  <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-violet-900/40 font-bold font-ui text-sm flex items-center gap-2 border border-violet-400/40">
                    <Cpu size={16} />
                    <span>Hostel Pro-ERP Core Kernel &amp; Domain Authority Engine</span>
                  </div>
                  <p className="text-xs text-white/50 mt-2 font-mono">
                    Single Source of Truth • ACID Relational Database &amp; Document Persistence
                  </p>
                </div>

                {/* Mindmap Grid of Interactive Nodes */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-8">
                  {MODULES_LIST.map((m) => {
                    const isActive = activeMindmap === m.id;
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setActiveMindmap(m.id)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer font-ui flex flex-col justify-between ${
                          isActive
                            ? "bg-white/[0.12] border-violet-400 shadow-xl shadow-violet-900/30 ring-1 ring-violet-400 text-white"
                            : "bg-white/[0.03] border-white/10 text-white/70 hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isActive
                                ? "bg-violet-600 text-white"
                                : "bg-white/[0.06] text-[#8C7BE8] border border-white/10"
                            }`}
                          >
                            <Icon size={16} />
                          </div>
                          <span className="text-[10px] font-bold text-white/50">{m.badge}</span>
                        </div>
                        <span className="text-xs font-bold text-white line-clamp-1">{m.title}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Mindmap Active Node Inspector Panel */}
                <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/15 shadow-xl text-white">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#5E9B7D]/20 text-[#5E9B7D] border border-[#5E9B7D]/30 font-ui">
                          Active Node
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-white font-ui">
                          {activeModuleItem.title}
                        </h3>
                      </div>
                      <p className="text-xs text-white/60 mt-0.5 font-body">
                        {activeModuleItem.tagline}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-white/[0.04] px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-[#8C7BE8] shrink-0">
                      <GitBranch size={14} />
                      <span>Pipeline: {activeModuleItem.mindmapNode}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">
                    <div className="lg:col-span-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 font-ui mb-2">
                        Architectural Capability:
                      </h4>
                      <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-body mb-4">
                        {activeModuleItem.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {activeModuleItem.mockStats.map((st, i) => (
                          <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-ui block">
                              {st.label}
                            </span>
                            <div className="text-base font-extrabold text-white font-ui mt-0.5">
                              {st.value}
                            </div>
                            <span className="text-[10px] text-[#5E9B7D] font-semibold mt-0.5 block truncate">
                              {st.note}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      {activeModuleItem.image && (
                        <div className="rounded-2xl overflow-hidden border border-white/15 bg-black/60 shadow-2xl group relative">
                          <div className="px-4 py-2.5 bg-black/80 border-b border-white/10 flex items-center justify-between text-xs text-white/60">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 animate-pulse" />
                              <span className="font-mono text-[11px] text-white/80">{activeModuleItem.route || "/dashboard"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const profile: UserProfile = {
                                    id: "super-admin",
                                    name: "System Provost / Administrator",
                                    email: "super.admin@college.edu",
                                    role: "super-admin",
                                    isDemo: true,
                                  };
                                  const token = createDemoSessionToken("super-admin", "super.admin@college.edu");
                                  loginUser(profile, token);
                                  showToast(`Launching sandbox for ${activeModuleItem.route || "/dashboard"}...`);
                                  setTimeout(() => router.push(activeModuleItem.route || "/dashboard"), 350);
                                }}
                                className="px-3 py-1 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-[11px] font-bold font-ui inline-flex items-center gap-1.5 shadow-md shadow-violet-900/40 border border-violet-400/30 cursor-pointer"
                              >
                                <Zap size={11} className="text-amber-300" />
                                <span>Launch Live Sandbox</span>
                                <ArrowRight size={11} />
                              </button>
                            </div>
                          </div>
                          <img
                            src={activeModuleItem.image}
                            alt={activeModuleItem.title}
                            className="w-full h-64 object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Detailed Module Catalog */}
          <section className="py-20 lg:py-28 bg-[#090A10]">
            <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <span className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-[#8C7BE8] font-ui block mb-2">
                    DETAILED FUNCTIONAL SPECIFICATIONS
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-normal text-white font-display">
                    Exhaustive Module Directory
                  </h2>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: "All Modules (82+)", value: "all" },
                    { label: "Academics & Life", value: "academics" },
                    { label: "Hostel & Dining", value: "residential" },
                    { label: "Finance & Payroll", value: "finance" },
                    { label: "Campus & Logistics", value: "campus" },
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setSelectedCategory(tab.value as ModuleCategory)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-ui border ${
                        selectedCategory === tab.value
                          ? "bg-[#624FDA] text-white border-violet-400 shadow-md shadow-[#624FDA]/30"
                          : "bg-white/[0.04] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.08]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModules.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="p-6 rounded-3xl border border-white/10 bg-white/[0.03] hover:border-violet-500/40 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-violet-950/40 transition-all duration-200 flex flex-col justify-between text-white"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 rounded-xl bg-white/[0.08] text-[#8C7BE8] border border-white/10 flex items-center justify-center">
                            <Icon size={20} />
                          </div>
                          <span className="text-[10px] font-bold text-[#8C7BE8] bg-[#624FDA]/25 border border-[#624FDA]/30 px-2.5 py-0.5 rounded-full font-ui">
                            {item.badge}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-white font-ui mb-1">{item.title}</h3>
                        <p className="text-xs font-medium text-white/50 mb-3 font-body">{item.tagline}</p>

                        {item.image && (
                          <div className="mb-4 rounded-xl overflow-hidden border border-white/10 group relative bg-black/40">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-36 object-cover object-top opacity-85 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur border border-white/10 text-[10px] font-mono text-white/80">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>{item.route || "Live UI"}</span>
                            </div>
                          </div>
                        )}

                        <div className="mb-5 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-white font-ui mb-1.5">
                            <span>Production Readiness</span>
                            <span className="text-[#5E9B7D] font-bold">100% Certified</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="w-full h-full bg-[#5E9B7D] rounded-full" />
                          </div>
                        </div>

                        <div className="space-y-2 mb-6">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 font-ui block">
                            Core Built-in Capabilities:
                          </span>
                          {item.features.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-white/70 font-body">
                              <CheckCircle2 size={14} className="text-[#5E9B7D] shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.route) {
                              const profile: UserProfile = {
                                id: "super-admin",
                                name: "System Provost / Administrator",
                                email: "super.admin@college.edu",
                                role: "super-admin",
                                isDemo: true,
                              };
                              const token = createDemoSessionToken("super-admin", "super.admin@college.edu");
                              loginUser(profile, token);
                              showToast(`Launching sandbox for ${item.route}...`);
                              setTimeout(() => router.push(item.route!), 350);
                            } else {
                              setContactModalOpen(true);
                            }
                          }}
                          className="text-[#5E9B7D] hover:text-[#7bbd9d] font-bold inline-flex items-center gap-1 font-ui cursor-pointer"
                        >
                          <Zap size={12} className="text-amber-300" />
                          <span>Launch Sandbox</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setContactModalOpen(true)}
                          className="text-[#8C7BE8] font-bold hover:underline inline-flex items-center gap-1 font-ui cursor-pointer"
                        >
                          <span>Request Briefing</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ─── Bottom CTA ─── */}
      <section className="py-20 bg-[#0B0C16] border-t border-white/[0.08] text-center text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-normal text-white font-display mb-4">
            Deploy Hostel Pro-ERP across your campus.
          </h2>
          <p className="text-sm sm:text-base text-white/60 mb-8 font-body">
            Get complete operational clarity across classes, dormitories, buses, and financial vouchers today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setDemoModalOpen(true)}
              className="h-12 px-7 bg-[#624FDA] hover:bg-[#523ec2] text-white font-bold rounded-xl text-sm transition-all font-ui flex items-center gap-2 shadow-lg shadow-[#624FDA]/30 cursor-pointer"
            >
              <Sparkles size={14} className="text-amber-300" />
              <span>Test Live Demo Environment</span>
              <ArrowRight size={15} />
            </button>
            <button
              type="button"
              onClick={() => setContactModalOpen(true)}
              className="h-12 px-7 bg-white/[0.05] border border-white/15 hover:border-white/30 text-white font-bold rounded-xl text-sm transition-all font-ui cursor-pointer"
            >
              Schedule Institutional Briefing
            </button>
          </div>
        </div>
      </section>

      {/* Modals */}
      <TryDemoModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
      <ContactModal isOpen={contactModalOpen} onClose={() => setContactModalOpen(false)} />
    </div>
  );
}
