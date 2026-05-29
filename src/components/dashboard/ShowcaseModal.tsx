"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  GraduationCap,
  DollarSign,
  Building2,
  ShieldCheck,
  Search,
  Maximize2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface ScreenshotItem {
  id: string;
  title: string;
  category: "Academics" | "Faculty & Research" | "Students" | "Finance" | "Campus Life" | "Governance";
  imagePath: string;
  route: string;
  description: string;
  features: string[];
}

export const SCREENSHOTS: ScreenshotItem[] = [
  {
    id: "dash-overview",
    title: "Command Dashboard Overview",
    category: "Governance",
    imagePath: "/screenshots/dashboard-overview.png",
    route: "/dashboard",
    description: "Real-time institutional KPI telemetry, multi-domain activity stream, and biometric card swipes.",
    features: ["Biometric check-in graphs", "Financial revenue summary", "Daily attendance gauges"],
  },
  {
    id: "admin-mission",
    title: "Executive Mission Control",
    category: "Governance",
    imagePath: "/screenshots/admin-mission-control.png",
    route: "/admin",
    description: "System node topology, role-based access matrix, and enterprise security control center.",
    features: ["Node health monitor", "Role delegation switch", "Database backup status"],
  },
  {
    id: "student-prof",
    title: "Student Unified Identity & Profile",
    category: "Students",
    imagePath: "/screenshots/student-profile.png",
    route: "/profile",
    description: "Comprehensive student curriculum tracker, clinical logbook credits, and digital verification.",
    features: ["Curriculum progression bar", "Clinical credit breakdown", "BMDC Registration Stamp"],
  },
  {
    id: "admissions-intake",
    title: "Admissions & Batch Intake",
    category: "Students",
    imagePath: "/screenshots/admissions.png",
    route: "/admissions",
    description: "Online application intake pipeline, entrance exam scoring, and merit-list generation.",
    features: ["Merit ranking engine", "Document verification queue", "Batch quota tracking"],
  },
  {
    id: "semester-enroll",
    title: "Term & Semester Enrollment",
    category: "Academics",
    imagePath: "/screenshots/semester-enrollment.png",
    route: "/enrollment",
    description: "Prerequisite validation, course section seats, and cohort advising matrix.",
    features: ["Seat capacity gauge", "Prerequisite graph solver", "Tuition clearance gate"],
  },
  {
    id: "acad-calendar",
    title: "Interactive Academic Calendar",
    category: "Academics",
    imagePath: "/screenshots/academic-calendar.png",
    route: "/academic-calendar",
    description: "Semester milestones, midterm assessments, clinical ward clerkships, and university recesses.",
    features: ["Milestone timeline", "Assessment schedule", "Sync with Google/Outlook"],
  },
  {
    id: "routines-clash",
    title: "Clash-Free Exam Timetable",
    category: "Academics",
    imagePath: "/screenshots/routines-timetable.png",
    route: "/exams",
    description: "Welsh-Powell graph coloring algorithm for conflict-free exam hall seat allocations.",
    features: ["Seat allocation matrix", "Invigilator assignment", "Zero conflict verification"],
  },
  {
    id: "curriculum-builder",
    title: "OBE Curriculum & Syllabus Builder",
    category: "Academics",
    imagePath: "/screenshots/curriculum-builder.png",
    route: "/curriculum",
    description: "Course modular blocks, Bloom's Taxonomy learning levels, and credit hour weighting.",
    features: ["Bloom's taxonomy tags", "Credit weight matrix", "Module prerequisite tree"],
  },
  {
    id: "prog-outcomes",
    title: "Accreditation & PO/CO Attainment",
    category: "Academics",
    imagePath: "/screenshots/curriculum-program-outcomes.png",
    route: "/accreditation",
    description: "Outcome-Based Education (OBE) program outcomes and continuous quality improvement.",
    features: ["CO-PO radar charts", "UGC accreditation score", "Direct assessment rubric"],
  },
  {
    id: "timetable-sched",
    title: "Weekly Lecture & Practical Grid",
    category: "Academics",
    imagePath: "/screenshots/timetable-schedule.png",
    route: "/timetable",
    description: "Interactive weekly timetable with venue mapping and lecture capture URLs.",
    features: ["Room venue booking", "Faculty conflict lock", "Student personalized view"],
  },
  {
    id: "transcripts-desk",
    title: "Official Academic Transcripts",
    category: "Academics",
    imagePath: "/screenshots/transcripts.png",
    route: "/transcripts",
    description: "Cryptographically verifiable transcripts, SGPA/CGPA calculations, and automated registrar stamps.",
    features: ["Dynamic GPA calculation", "BMDC Roll validation", "Registrar seal generator"],
  },
  {
    id: "research-grants",
    title: "Research, Trials & Endowments",
    category: "Faculty & Research",
    imagePath: "/screenshots/research-grants.png",
    route: "/research",
    description: "Peer-reviewed publications, clinical trial protocols, and BDT (৳) institutional research grants.",
    features: ["Grant expenditure tracker", "Ethics committee approval", "Citation index tracker"],
  },
  {
    id: "faculty-payroll",
    title: "Faculty & Staff Payroll Engine",
    category: "Finance",
    imagePath: "/screenshots/faculty-payroll.png",
    route: "/payroll",
    description: "Monthly salary disbursement, provident fund calculations, tax withholding, and pay slip advice.",
    features: ["Grade-based salary tiers", "Tax deduction schedule", "Direct bank MFS transfer"],
  },
  {
    id: "leave-mgmt",
    title: "Faculty & Staff Leave Roster",
    category: "Faculty & Research",
    imagePath: "/screenshots/leave-management.png",
    route: "/leave",
    description: "Casual, medical, and sabbatical leave workflows with automated substitute lecturer routing.",
    features: ["Substitute teacher cover", "Leave balance tracker", "Head of Dept sign-off"],
  },
  {
    id: "chart-accounts",
    title: "Chart of Accounts Ledger Tree",
    category: "Finance",
    imagePath: "/screenshots/chart-of-accounts.png",
    route: "/accounting/chart-of-accounts",
    description: "Enterprise multi-level account hierarchy with real-time balance calculations.",
    features: ["5-level COA tree", "Dr/Cr real-time check", "Restricted grant subledgers"],
  },
  {
    id: "trial-balance",
    title: "Double-Entry Verified Trial Balance",
    category: "Finance",
    imagePath: "/screenshots/accounting-trial-balance.png",
    route: "/accounting/reports",
    description: "Strict mathematical proof of general ledger integrity (`Debit = Credit`).",
    features: ["Balance variance check", "Automated MT940 bank match", "Audit drill-down"],
  },
  {
    id: "student-fees",
    title: "Student Fees & Accounts Receivable",
    category: "Finance",
    imagePath: "/screenshots/student-fees.png",
    route: "/fees",
    description: "Tuition billing, late fine calculations, payment clearance vouchers, and bursar receipts.",
    features: ["Overdue fine calculator", "Bank voucher generator", "MFS payment integration"],
  },
  {
    id: "budget-alloc",
    title: "Institutional Fiscal Budget Planning",
    category: "Finance",
    imagePath: "/screenshots/budget-allocation.png",
    route: "/budget",
    description: "Departmental fiscal year capital and operational expenditure budget management.",
    features: ["Variance alarm thresholds", "Quarterly tranche release", "HoD spend governance"],
  },
  {
    id: "procurement-store",
    title: "Campus & Lab Procurement",
    category: "Campus Life",
    imagePath: "/screenshots/procurement.png",
    route: "/procurement",
    description: "Purchase requisitions, three-way vendor bidding, and goods receipt inspections.",
    features: ["3-way invoice matching", "Inventory batch tracking", "Vendor PO lifecycle"],
  },
  {
    id: "iot-telemetry",
    title: "Campus IoT Telemetry & Edge Nodes",
    category: "Campus Life",
    imagePath: "/screenshots/iot-telemetry.png",
    route: "/iot",
    description: "Live RFID turnstile edge nodes, lab sensor monitoring, and campus smart meter telemetry.",
    features: ["Sub-second event stream", "Hardware health heartbeat", "Access card scanner"],
  },
  {
    id: "digital-locker",
    title: "Cryptographic Digital Locker",
    category: "Students",
    imagePath: "/screenshots/digital-locker.png",
    route: "/digital-locker",
    description: "Tamper-evident vault for certificates, NID/Passport records, and medical fitness proofs.",
    features: ["SHA-256 hash verify", "Expiring guest access", "Encrypted document store"],
  },
  {
    id: "disciplinary-desk",
    title: "Disciplinary & Conduct Hearings",
    category: "Governance",
    imagePath: "/screenshots/disciplinary.png",
    route: "/disciplinary",
    description: "Student grievance investigations, proctorial committee hearings, and restorative actions.",
    features: ["Hearing transcript log", "Penalty appeal system", "Proctorial board sign-off"],
  },
  {
    id: "career-desk",
    title: "Career & Clinical Placements",
    category: "Students",
    imagePath: "/screenshots/career-placements.png",
    route: "/career",
    description: "Postgraduate residency openings, hospital clinical fellowships, and alumni placement tracker.",
    features: ["Residency matchmaking", "CV recommendation engine", "Employer placement log"],
  },
  {
    id: "audit-trail",
    title: "Immutable System Audit Trail",
    category: "Governance",
    imagePath: "/screenshots/audit-trail.png",
    route: "/audit",
    description: "Complete forensic timeline of every database mutation with IP, actor, and state snapshots.",
    features: ["Before/After diff viewer", "Forensic IP capture", "Non-repudiation log"],
  },
  {
    id: "settings-conf",
    title: "System Parameters & Settings",
    category: "Governance",
    imagePath: "/screenshots/system-settings.png",
    route: "/settings",
    description: "Institutional branding, academic grading scales, SMTP gateways, and security policies.",
    features: ["Grading scale customizer", "MFS API configuration", "Role privilege matrix"],
  },
];

const CATEGORIES = ["All", "Academics", "Faculty & Research", "Students", "Finance", "Campus Life", "Governance"] as const;

export default function ShowcaseModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeItem, setActiveItem] = useState<ScreenshotItem | null>(null);

  if (!isOpen) return null;

  const filtered = SCREENSHOTS.filter((item) => {
    const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleNext = () => {
    if (!activeItem) return;
    const currIdx = filtered.findIndex((i) => i.id === activeItem.id);
    const nextIdx = (currIdx + 1) % filtered.length;
    setActiveItem(filtered[nextIdx]);
  };

  const handlePrev = () => {
    if (!activeItem) return;
    const currIdx = filtered.findIndex((i) => i.id === activeItem.id);
    const prevIdx = (currIdx - 1 + filtered.length) % filtered.length;
    setActiveItem(filtered[prevIdx]);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-surface-navy/80 backdrop-blur-md overflow-hidden">
        {/* Main Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between gap-4 bg-surface-elevated/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-text font-display">University ERP Visual Showcase</h2>
                  <Badge variant="gold" size="sm">
                    {SCREENSHOTS.length} Live Modules
                  </Badge>
                </div>
                <p className="text-xs text-text-muted">
                  Explore high-resolution visual previews of every module in the campus operating system
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-muted transition-colors cursor-pointer"
              aria-label="Close Showcase"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="p-4 border-b border-border bg-surface-muted/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1 sm:pb-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-surface-navy text-gold shadow-sm"
                      : "text-text-muted hover:text-text hover:bg-surface-elevated"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
              <input
                type="text"
                placeholder="Search screens & features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-border bg-surface text-text placeholder:text-text-subtle focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Gallery Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-surface-muted/20">
            {filtered.length === 0 ? (
              <div className="p-12 text-center">
                <Layers size={40} className="text-text-subtle mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-text">No screens matched your filter</p>
                <p className="text-xs text-text-muted mt-1">Try selecting 'All' or searching for another keyword.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -3 }}
                    className="group rounded-xl border border-border bg-surface overflow-hidden shadow-sm hover:shadow-lg hover:border-gold/40 transition-all flex flex-col"
                  >
                    {/* Thumbnail */}
                    <div
                      onClick={() => setActiveItem(item)}
                      className="relative h-44 w-full bg-surface-muted overflow-hidden cursor-pointer"
                    >
                      <img
                        src={item.imagePath}
                        alt={item.title}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3 text-white">
                        <span className="text-xs font-semibold flex items-center gap-1.5">
                          <Maximize2 size={13} /> Click to Expand
                        </span>
                        <Badge variant="gold" size="sm">
                          {item.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-text group-hover:text-gold transition-colors truncate">
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {item.features.slice(0, 2).map((feat, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-surface-muted text-text-muted font-medium"
                          >
                            • {feat}
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-between">
                        <button
                          onClick={() => setActiveItem(item)}
                          className="text-xs font-semibold text-gold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          Preview Screen
                        </button>
                        <Link
                          href={item.route}
                          onClick={onClose}
                          className="inline-flex items-center gap-1 text-xs font-medium text-text-muted hover:text-text px-2 py-1 rounded-md hover:bg-surface-muted transition-colors"
                        >
                          <span>Open Module</span>
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Status Bar */}
          <div className="px-5 py-3 border-t border-border bg-surface-elevated flex items-center justify-between text-xs text-text-muted">
            <span>
              Displaying <strong className="text-text">{filtered.length}</strong> of {SCREENSHOTS.length} verified screens
            </span>
            <span className="font-mono text-[11px] text-text-subtle">MedicalCollegeERP v2.4 • Clinical Luxury</span>
          </div>
        </motion.div>

        {/* Full-Screen Lightbox Modal for Active Item */}
        {activeItem && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-lg">
            <div className="relative max-w-5xl w-full flex flex-col max-h-[95vh] bg-surface rounded-2xl border border-gold/30 shadow-2xl overflow-hidden">
              {/* Lightbox Topbar */}
              <div className="p-4 bg-surface-navy text-white flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Badge variant="gold" size="sm">
                    {activeItem.category}
                  </Badge>
                  <div>
                    <h3 className="text-base font-bold text-white">{activeItem.title}</h3>
                    <p className="text-xs text-white/70">{activeItem.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={activeItem.route}
                    onClick={() => {
                      setActiveItem(null);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold text-surface-navy font-bold text-xs hover:bg-gold/90 transition-colors"
                  >
                    <span>Launch Live Page</span>
                    <ExternalLink size={13} />
                  </Link>
                  <button
                    onClick={() => setActiveItem(null)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Lightbox Image Preview */}
              <div className="relative flex-1 bg-surface-navy/95 overflow-auto p-4 flex items-center justify-center min-h-[400px]">
                <img
                  src={activeItem.imagePath}
                  alt={activeItem.title}
                  className="max-h-[70vh] w-auto object-contain rounded-lg border border-white/10 shadow-2xl"
                />

                {/* Left/Right Carousel Nav */}
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-surface/80 hover:bg-surface text-text shadow-xl border border-border transition-colors cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-surface/80 hover:bg-surface text-text shadow-xl border border-border transition-colors cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Lightbox Footer with Feature Highlights */}
              <div className="p-3.5 bg-surface border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-text">Key Features:</span>
                  {activeItem.features.map((f, idx) => (
                    <Badge key={idx} variant="neutral" size="sm">
                      {f}
                    </Badge>
                  ))}
                </div>
                <span className="text-text-muted font-mono text-[11px]">
                  Source: <code className="text-gold">{activeItem.route}</code>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
}
