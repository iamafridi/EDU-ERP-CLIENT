"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import {
  BookOpen,
  Plus,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Pencil,
  AlertCircle,
  Coins,
  ShieldAlert,
  ShieldCheck,
  Search,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Download,
  Users,
  Building2,
  Filter,
  Check,
  Sparkles,
  Layers,
  GraduationCap,
  FileText,
  Lock,
  Unlock
} from "lucide-react";
import {
  PageHeader,
  Card,
  FormField,
  Input,
  Select,
  Button,
  IconButton,
  Badge,
  Modal,
  Tabs,
} from "@/components/ui";

type LibraryTab = "catalog-circulation" | "overdue-holds" | "carrel-booking" | "e-journals";

export default function LibraryPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<LibraryTab>("catalog-circulation");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isCarrelModalOpen, setIsCarrelModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const isLibrarianOrAdmin =
    roleIs("super-admin", "domain-admin") || user?.staffSubRole === "librarian";

  // Mock Books Catalog
  const [booksList, setBooksList] = useState([
    {
      id: "BK-1001",
      isbn: "978-0133591620",
      title: "Operating System Concepts (10th Edition)",
      author: "Silberschatz, Galvin & Gagne",
      category: "Computer Science",
      callNumber: "QA76.76.O63 S55 2018",
      shelfLocation: "Stack 4, Aisle B, Shelf 2",
      totalCopies: 12,
      availableCopies: 3,
      rfidTag: "RFID-88219-OS"
    },
    {
      id: "BK-1002",
      isbn: "978-0134685991",
      title: "Distributed Systems: Principles and Paradigms (3rd Ed)",
      author: "Andrew S. Tanenbaum, Maarten van Steen",
      category: "Computer Science",
      callNumber: "QA76.9.D5 T36 2017",
      shelfLocation: "Stack 4, Aisle C, Shelf 1",
      totalCopies: 8,
      availableCopies: 2,
      rfidTag: "RFID-94211-DS"
    },
    {
      id: "BK-1003",
      isbn: "978-0323529730",
      title: "Guyton and Hall Textbook of Medical Physiology (14th Ed)",
      author: "John E. Hall, Michael E. Hall",
      category: "Biomedical Systems",
      callNumber: "QP34.5 .G9 2020",
      shelfLocation: "Stack 2, Aisle A, Shelf 3",
      totalCopies: 15,
      availableCopies: 6,
      rfidTag: "RFID-10492-MED"
    },
    {
      id: "BK-1004",
      isbn: "978-0262033848",
      title: "Introduction to Algorithms (4th Edition)",
      author: "Cormen, Leiserson, Rivest, Stein",
      category: "Computer Science",
      callNumber: "QA76.6 .C662 2022",
      shelfLocation: "Stack 4, Aisle A, Shelf 1",
      totalCopies: 20,
      availableCopies: 5,
      rfidTag: "RFID-55291-CLRS"
    },
    {
      id: "BK-1005",
      isbn: "978-0134608327",
      title: "Computer Networks (6th Edition)",
      author: "Tanenbaum, Feamster, Wetherall",
      category: "Telecommunications",
      callNumber: "TK5105.5 .T36 2021",
      shelfLocation: "Stack 3, Aisle B, Shelf 4",
      totalCopies: 10,
      availableCopies: 4,
      rfidTag: "RFID-67210-CN"
    }
  ]);

  // Mock Active Overdue Holds & Blockades
  const [overdueHolds, setOverdueHolds] = useState([
    {
      loanId: "LOAN-2026-891",
      studentId: "STU-2024-0155",
      studentName: "Zubair Hossain",
      department: "CSE (Term 4.1)",
      bookTitle: "Operating System Concepts (10th Edition)",
      isbn: "978-0133591620",
      rfidTag: "RFID-88219-OS",
      dueDate: "2026-09-15",
      daysOverdue: 18,
      dailyFineRate: 10,
      totalFine: 180,
      holdStatus: "ADVISING_RESTRICTED",
      advisingHoldActive: true
    },
    {
      loanId: "LOAN-2026-920",
      studentId: "STU-2024-0210",
      studentName: "Shariar Kabir",
      department: "CSE (Term 4.1)",
      bookTitle: "Introduction to Algorithms (4th Edition)",
      isbn: "978-0262033848",
      rfidTag: "RFID-55291-CLRS",
      dueDate: "2026-09-08",
      daysOverdue: 25,
      dailyFineRate: 10,
      totalFine: 250,
      holdStatus: "TRANSCRIPT_AND_ADVISING_BLOCKED",
      advisingHoldActive: true
    }
  ]);

  // Mock Study Pod / Carrel Bookings
  const [carrelsList, setCarrelsList] = useState([
    {
      id: "CARREL-01",
      name: "Doctoral Silent Pod Alpha",
      floor: "3rd Floor West (Research Wing)",
      capacity: 1,
      amenities: "Dual 4K Monitors, Acoustic Isolation, Gigabit LAN",
      status: "OCCUPIED",
      bookedBy: "Engr. Tanvir Ahmed (M.Sc Scholar)",
      timeSlot: "14:00 - 18:00 (Today)"
    },
    {
      id: "CARREL-02",
      name: "Graduate Research Pod Beta",
      floor: "3rd Floor West (Research Wing)",
      capacity: 1,
      amenities: "Standing Desk, Acoustic Glass, Power Array",
      status: "AVAILABLE",
      bookedBy: null,
      timeSlot: "Available for Reservation"
    },
    {
      id: "ROOM-302",
      name: "Capstone Collaboration Room 302",
      floor: "2nd Floor East (Commons)",
      capacity: 6,
      amenities: "Smart Whiteboard, 65-inch 4K Casting Display, Video Conf",
      status: "RESERVED",
      bookedBy: "Team BioPulse Alpha (Lead: Ayesha Siddiqua)",
      timeSlot: "16:00 - 18:00 (Today)"
    },
    {
      id: "ROOM-304",
      name: "Faculty Consultation Carrel 304",
      floor: "2nd Floor East (Commons)",
      capacity: 4,
      amenities: "Conference Table, Document Scanner, Private Keycard",
      status: "AVAILABLE",
      bookedBy: null,
      timeSlot: "Available for Reservation"
    }
  ]);

  // Mock E-Journals and Theses
  const eJournals = [
    {
      id: "PUB-2026-001",
      doi: "10.1109/TBME.2026.3298412",
      title: "Real-Time Hemodynamic Waveform Synthesis Using Edge WASM Kernels",
      authors: "Prof. Dr. Aris Thorne, Engr. Tanvir Ahmed, Assoc. Prof. Dr. Farzana Rahman",
      journal: "IEEE Transactions on Biomedical Engineering (Scopus Q1, IF: 5.8)",
      publishedYear: 2026,
      category: "Biomedical Systems & Cloud Computing",
      accessType: "INSTITUTIONAL_FULL_ACCESS",
      citationsCount: 14
    },
    {
      id: "PUB-2026-002",
      doi: "10.1016/j.artmed.2026.102891",
      title: "Outcome-Based Autonomous Patient Socratic Triage via LLM Fine-Tuning",
      authors: "Assoc. Prof. Dr. Farzana Rahman, Nusrat Jahan",
      journal: "Artificial Intelligence in Medicine (Scopus Q1, IF: 7.5)",
      publishedYear: 2026,
      category: "Artificial Intelligence & Clinical Informatics",
      accessType: "INSTITUTIONAL_FULL_ACCESS",
      citationsCount: 22
    },
    {
      id: "THESIS-2025-084",
      doi: "URI:20.500.1234/THESIS-2025-084",
      title: "Distributed Fault-Tolerant Raft Protocols for High-Throughput Academic Ledgers",
      authors: "Senior Scholar Capstone Team (Supervised by Prof. Dr. Aris Thorne)",
      journal: "Department of CSE Institutional Theses Archive",
      publishedYear: 2025,
      category: "Senior Capstone Thesis",
      accessType: "OPEN_ACCESS_PDF",
      citationsCount: 6
    }
  ];

  const handleSettleFineAndClear = (loanId: string, studentName: string) => {
    setOverdueHolds((prev) => prev.filter((h) => h.loanId !== loanId));
    setSuccessMsg(`Fine settled and physical book checked in. Advising & transcript holds removed for ${studentName}.`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Central University Library & Knowledge Commons"
        subtitle="RFID physical circulation, automated overdue advising holds, digital carrel bookings, and institutional Scopus Q1 e-journal repository."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setIsCarrelModalOpen(true)}
            >
              <Building2 size={14} className="text-gold" />
              Reserve Study Pod / Carrel
            </Button>
            {isLibrarianOrAdmin && (
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5"
                onClick={() => setIsIssueModalOpen(true)}
              >
                <Plus size={14} />
                Issue RFID Book Loan
              </Button>
            )}
          </div>
        }
      />

      {/* CORE NAVIGATION TABS */}
      <Tabs
        value={activeTab}
        onChange={(val) => setActiveTab(val as LibraryTab)}
        items={[
          {
            id: "catalog-circulation",
            label: "Catalog & RFID Circulation",
            icon: <BookOpen size={14} />,
            count: booksList.length,
          },
          {
            id: "overdue-holds",
            label: "Overdue Holds & Advising Blockades",
            icon: <ShieldAlert size={14} />,
            count: overdueHolds.length,
          },
          {
            id: "carrel-booking",
            label: "Study Pods & Research Carrels",
            icon: <Building2 size={14} />,
            count: carrelsList.length,
          },
          {
            id: "e-journals",
            label: "Scopus E-Journals & Theses",
            icon: <FileText size={14} />,
            count: eJournals.length,
          },
        ]}
      />

      {/* TAB 1: CATALOG & RFID CIRCULATION */}
      {activeTab === "catalog-circulation" && (
        <div className="space-y-6 animate-fade-in">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card pad="md" className="border-border">
              <div className="text-xs text-text-muted">Total Catalog Titles</div>
              <div className="text-xl font-bold font-display text-text mt-1">54,820 Volumes</div>
              <div className="text-[11px] text-primary font-medium mt-1">5 Major Academic Disciplines</div>
            </Card>
            <Card pad="md" className="border-border">
              <div className="text-xs text-text-muted">Active Circulated Loans</div>
              <div className="text-xl font-bold font-display text-gold mt-1">1,482 Books</div>
              <div className="text-[11px] text-text-muted mt-1">98.2% Returned On Time</div>
            </Card>
            <Card pad="md" className="border-border">
              <div className="text-xs text-text-muted">Borrowing Quotas</div>
              <div className="text-sm font-semibold text-text mt-1">UG: 3 (14d) • Grad: 5 (30d)</div>
              <div className="text-[11px] text-text-muted mt-1">Faculty: 10 (90d)</div>
            </Card>
            <Card pad="md" className="border-border">
              <div className="text-xs text-text-muted">RFID Gate Sensor</div>
              <div className="text-xl font-bold font-display text-success mt-1">Online (Kiosk A-D)</div>
              <div className="text-[11px] text-success font-medium mt-1">Anti-Theft Active</div>
            </Card>
          </div>

          {/* Search Bar */}
          <Card pad="md" className="border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-lg">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search by Title, Author, ISBN or Call Number..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex items-center gap-2">
                <Badge tone="primary" className="text-xs font-mono">RFID Auto-Scanner Linked</Badge>
              </div>
            </div>
          </Card>

          {/* Books List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {booksList
              .filter((b) =>
                b.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                b.author.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                b.isbn.includes(catalogSearch)
              )
              .map((book) => (
                <Card key={book.id} pad="md" className="border-border hover:border-gold/40 transition-all space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-muted text-text font-bold">
                          {book.category}
                        </span>
                        <span className="text-[10px] font-mono text-text-muted">{book.id}</span>
                      </div>
                      <h4 className="text-sm font-bold text-text font-display mt-1.5">{book.title}</h4>
                      <p className="text-xs text-text-muted mt-0.5">By {book.author}</p>
                    </div>

                    <Badge
                      tone={book.availableCopies > 0 ? "success" : "danger"}
                      className="text-xs font-mono font-bold"
                    >
                      {book.availableCopies} / {book.totalCopies} Available
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs bg-surface-muted/30 p-2.5 rounded-xl border border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted text-[11px]">ISBN:</span>
                      <span className="font-mono text-text">{book.isbn}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted text-[11px]">Call Number:</span>
                      <span className="font-mono font-semibold text-text">{book.callNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted text-[11px]">Shelf Location:</span>
                      <span className="font-medium text-primary">{book.shelfLocation}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-text-muted">{book.rfidTag}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2.5 gap-1"
                      disabled={book.availableCopies === 0}
                      onClick={() => {
                        setSuccessMsg(`Reserved copy of '${book.title}'. Collect from circulation desk within 24h.`);
                        setTimeout(() => setSuccessMsg(""), 3500);
                      }}
                    >
                      <BookOpen size={12} />
                      {book.availableCopies > 0 ? "Reserve Volume" : "All Copies Loaned"}
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* TAB 2: OVERDUE HOLDS & ADVISING BLOCKADES */}
      {activeTab === "overdue-holds" && (
        <div className="space-y-6 animate-fade-in">
          {/* Warning Overview */}
          <Card pad="lg" className="border-border bg-gradient-to-r from-surface to-surface-muted">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-danger-soft text-danger">
                  Automated Cross-System Holds
                </span>
                <h3 className="text-lg font-bold font-display text-text mt-1">
                  Central Library Overdue Holds & Advising Blockade Gateway
                </h3>
                <p className="text-xs text-text-muted mt-1 max-w-2xl">
                  Enforces statutory fines (৳ 10/day). Unsettled overdue books or unpaid penalties automatically lock semester advising registration and official transcript generation until cleared.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-center px-4 py-2 rounded-xl bg-surface border border-border">
                  <div className="text-xs text-text-muted">Active Locked Students</div>
                  <div className="text-base font-bold text-danger font-display">2 Scholars</div>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-surface border border-border">
                  <div className="text-xs text-text-muted">Uncollected Fines</div>
                  <div className="text-base font-bold text-gold font-display">৳ 430 BDT</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Overdue Items List */}
          <div className="space-y-4">
            {overdueHolds.map((hold) => (
              <Card key={hold.loanId} pad="md" className="border-danger/40 bg-danger-soft/5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge tone="danger" className="text-[10px] font-bold">
                        {hold.holdStatus.replace(/_/g, " ")}
                      </Badge>
                      <span className="font-mono font-bold text-xs text-text">{hold.studentName} ({hold.studentId})</span>
                      <span className="text-xs text-text-muted">• {hold.department}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-surface border border-border space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">Overdue Book Title:</span>
                        <span className="font-semibold text-text">{hold.bookTitle}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">Scheduled Return Date:</span>
                        <span className="font-mono text-danger font-bold">{hold.dueDate} ({hold.daysOverdue} Days Overdue)</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-border">
                        <span className="text-text-muted">Accrued Penalty Fine (@ ৳ 10/day):</span>
                        <span className="font-mono text-sm font-bold text-gold">৳ {hold.totalFine} BDT</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-danger font-medium">
                      <Lock size={12} />
                      Advising Portal & Transcript Export blocked across all campus nodes.
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => handleSettleFineAndClear(hold.loanId, hold.studentName)}
                    >
                      <Unlock size={13} />
                      Return Book & Remove Hold
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STUDY PODS & RESEARCH CARRELS */}
      {activeTab === "carrel-booking" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <Card pad="lg" className="border-border bg-gradient-to-r from-surface to-surface-muted">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-primary-soft text-primary">
                  Graduate & Capstone Facilities
                </span>
                <h3 className="text-lg font-bold font-display text-text mt-1">
                  Silent Study Carrels & Collaborative Pod Reservation
                </h3>
                <p className="text-xs text-text-muted mt-1 max-w-2xl">
                  Acoustic pods and capstone squad discussion rooms equipped with 4K casting displays, high-speed Gigabit LAN, and digital RFID door access.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                className="gap-1.5"
                onClick={() => setIsCarrelModalOpen(true)}
              >
                <Plus size={14} /> New Pod Reservation
              </Button>
            </div>
          </Card>

          {/* Carrels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {carrelsList.map((carrel) => (
              <Card key={carrel.id} pad="md" className="border-border space-y-3 hover:border-gold/40 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-text">{carrel.id}</span>
                      <Badge
                        tone={carrel.status === "AVAILABLE" ? "success" : "primary"}
                        className="text-[10px] font-bold"
                      >
                        {carrel.status}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-bold text-text font-display mt-1">{carrel.name}</h4>
                    <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="text-gold" /> {carrel.floor} • Capacity: {carrel.capacity} Person(s)
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-muted/40 border border-border/50 text-xs space-y-1">
                  <div className="text-[11px] text-text-muted">
                    <span className="font-semibold text-text">Amenities:</span> {carrel.amenities}
                  </div>
                  <div className="text-[11px] text-primary font-medium">
                    <span className="font-semibold text-text">Current Slot:</span> {carrel.timeSlot}
                  </div>
                  {carrel.bookedBy && (
                    <div className="text-[11px] text-text">
                      <span className="font-semibold text-text-muted">Reserved By:</span> {carrel.bookedBy}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-end">
                  <Button
                    variant={carrel.status === "AVAILABLE" ? "primary" : "outline"}
                    size="sm"
                    className="text-xs h-7 px-2.5"
                    disabled={carrel.status !== "AVAILABLE"}
                    onClick={() => {
                      setSuccessMsg(`Reserved ${carrel.name} for 2 hours.`);
                      setTimeout(() => setSuccessMsg(""), 3500);
                    }}
                  >
                    {carrel.status === "AVAILABLE" ? "Reserve This Pod" : "Occupied"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SCOPUS E-JOURNALS & THESES */}
      {activeTab === "e-journals" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <Card pad="lg" className="border-border bg-gradient-to-r from-surface to-surface-muted">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-gold-soft text-gold">
                  Institutional Knowledge Repository
                </span>
                <h3 className="text-lg font-bold font-display text-text mt-1">
                  Peer-Reviewed Scopus Q1 E-Journals & University Theses Archive
                </h3>
                <p className="text-xs text-text-muted mt-1 max-w-2xl">
                  Direct digital access to faculty peer-reviewed publications, IEEE/ACM digital library subscriptions, and archived senior capstone manuscripts.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-center px-4 py-2 rounded-xl bg-surface border border-border">
                  <div className="text-xs text-text-muted">Indexed Publications</div>
                  <div className="text-base font-bold text-text font-display">1,240 Papers</div>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-surface border border-border">
                  <div className="text-xs text-text-muted">Total Citations</div>
                  <div className="text-base font-bold text-gold font-display">14,890</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Publications List */}
          <div className="space-y-4">
            {eJournals.map((pub) => (
              <Card key={pub.id} pad="md" className="border-border hover:border-gold/40 transition-all space-y-3">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex items-center gap-2">
                      <Badge tone="gold" className="text-[10px] font-bold font-mono">
                        {pub.accessType.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-xs font-mono text-primary font-semibold">{pub.journal}</span>
                    </div>
                    <h4 className="text-sm font-bold text-text font-display">{pub.title}</h4>
                    <p className="text-xs text-text-muted">Authors: {pub.authors}</p>
                    <div className="text-[11px] font-mono text-text-muted">DOI / URI: {pub.doi}</div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5"
                      onClick={() => {
                        setSuccessMsg(`Downloading full-text manuscript for ${pub.id}`);
                        setTimeout(() => setSuccessMsg(""), 3500);
                      }}
                    >
                      <Download size={13} /> Full Text PDF
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMsg && (
        <div className="fixed bottom-6 left-6 z-50 bg-surface text-text px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium border border-border animate-fade-in">
          <CheckCircle2 size={16} className="text-success" />
          {successMsg}
        </div>
      )}
    </div>
  );
}
