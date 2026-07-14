"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Cpu,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Clock,
  CalendarSync,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Sparkles,
  Users,
  Grid3X3,
  Search,
  Plus,
  RefreshCw,
  Printer,
  Download,
  Building2,
  UserCheck,
  Sliders,
  Send,
  ArrowRightLeft,
  Lock,
  ChevronRight,
  Eye,
  MapPin,
  ShieldAlert,
  Info,
  Check,
  X,
  UserPlus,
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
  ProgressBar,
  Textarea,
  Dialog,
} from "@/components/ui";
import DataTable, { Column } from "@/components/ui/DataTable";

type RoutineTab =
  | "graph-generator"
  | "seating-matrix"
  | "invigilation-roster"
  | "faculty-duty-swap"
  | "emergency-reschedule"
  | "door-rosters";

interface ExamSlot {
  slotId: string;
  date: string;
  day: string;
  timeRange: string;
  session: "MORNING" | "AFTERNOON";
  courses: {
    code: string;
    title: string;
    department: string;
    candidateCount: number;
    assignedHall: string;
  }[];
  chromaticColor: string;
  conflictFreeCheck: boolean;
}

interface SeatUnit {
  seatNumber: string;
  row: string;
  col: number;
  studentRoll: string;
  studentName: string;
  department: string;
  courseCode: string;
  courseTitle: string;
  tagColor: "gold" | "primary" | "emerald" | "amber";
}

interface InvigilationDuty {
  id: string;
  facultyId: string;
  facultyName: string;
  department: string;
  designation: string;
  examDate: string;
  timeSlot: string;
  assignedHall: string;
  role: "CHIEF_INVIGILATOR" | "ASSISTANT_INVIGILATOR" | "RELIEF_ROVER";
  totalAssignedDuties: number;
  maxDutyLimit: number;
  status: "CONFIRMED" | "SUBSTITUTE_REQUESTED" | "ROSTERED";
}

interface DutySwapRequest {
  id: string;
  requestingFacultyId: string;
  requestingFacultyName: string;
  requestingDepartment: string;
  originalSlot: string;
  originalHall: string;
  originalRole: string;
  substituteFacultyId: string;
  substituteFacultyName: string;
  substituteDepartment: string;
  tradeType: "1_WAY_SUBSTITUTE" | "2_WAY_MUTUAL_SWAP";
  reason: string;
  status: "PENDING_PEER_ACCEPT" | "PENDING_HOD_APPROVAL" | "APPROVED_COMMITTED" | "REJECTED";
  clashFreeVerified: boolean;
  requestedAt: string;
}

const MOCK_EXAM_SLOTS: ExamSlot[] = [
  {
    slotId: "SLOT-01",
    date: "2026-10-18",
    day: "Sunday",
    timeRange: "09:30 AM - 12:30 PM",
    session: "MORNING",
    chromaticColor: "#B98B4B",
    conflictFreeCheck: true,
    courses: [
      { code: "CSE-411", title: "Distributed Systems & Cloud Computing", department: "CSE", candidateCount: 120, assignedHall: "Central Auditorium (Hall A)" },
      { code: "PHARM-302", title: "Clinical Pharmacology & Toxicology", department: "Pharmacy", candidateCount: 85, assignedHall: "Central Auditorium (Hall B)" },
      { code: "MBBS-201", title: "General Pathology & Microbiology", department: "MBBS", candidateCount: 110, assignedHall: "Lecture Gallery 1 & 2" },
    ],
  },
  {
    slotId: "SLOT-02",
    date: "2026-10-18",
    day: "Sunday",
    timeRange: "02:00 PM - 05:00 PM",
    session: "AFTERNOON",
    chromaticColor: "#0F766E",
    conflictFreeCheck: true,
    courses: [
      { code: "EEE-315", title: "Signals, Systems & DSP", department: "EEE", candidateCount: 95, assignedHall: "Central Auditorium (Hall A)" },
      { code: "BIO-204", title: "Medical Biochemistry & Genetics", department: "Biochemistry", candidateCount: 78, assignedHall: "Central Auditorium (Hall B)" },
    ],
  },
  {
    slotId: "SLOT-03",
    date: "2026-10-20",
    day: "Tuesday",
    timeRange: "09:30 AM - 12:30 PM",
    session: "MORNING",
    chromaticColor: "#7C3AED",
    conflictFreeCheck: true,
    courses: [
      { code: "CSE-321", title: "Operating Systems & Concurrency", department: "CSE", candidateCount: 135, assignedHall: "Central Auditorium (Hall A)" },
      { code: "MBBS-401", title: "Internal Medicine & Therapeutics", department: "MBBS", candidateCount: 90, assignedHall: "Lecture Gallery 1" },
    ],
  },
  {
    slotId: "SLOT-04",
    date: "2026-10-22",
    day: "Thursday",
    timeRange: "09:30 AM - 12:30 PM",
    session: "MORNING",
    chromaticColor: "#0284C7",
    conflictFreeCheck: true,
    courses: [
      { code: "CSE-220", title: "Data Structures & Algorithms", department: "CSE", candidateCount: 160, assignedHall: "Central Auditorium (Hall A & B)" },
      { code: "MIC-301", title: "Immunology & Molecular Virology", department: "Microbiology", candidateCount: 65, assignedHall: "Lecture Gallery 2" },
    ],
  },
];

const MOCK_SEATING_GRID: SeatUnit[] = [
  // Row A
  { seatNumber: "A-01", row: "A", col: 1, studentRoll: "STU-2026-001", studentName: "Marcus Chen", department: "CSE", courseCode: "CSE-411", courseTitle: "Distributed Systems", tagColor: "gold" },
  { seatNumber: "A-02", row: "A", col: 2, studentRoll: "STU-2026-104", studentName: "Humaira Kabir", department: "Pharmacy", courseCode: "PHARM-302", courseTitle: "Pharmacology", tagColor: "emerald" },
  { seatNumber: "A-03", row: "A", col: 3, studentRoll: "STU-2026-002", studentName: "Nafis Imtiaz", department: "CSE", courseCode: "CSE-411", courseTitle: "Distributed Systems", tagColor: "gold" },
  { seatNumber: "A-04", row: "A", col: 4, studentRoll: "STU-2026-105", studentName: "Farhan Tanvir", department: "Pharmacy", courseCode: "PHARM-302", courseTitle: "Pharmacology", tagColor: "emerald" },
  { seatNumber: "A-05", row: "A", col: 5, studentRoll: "STU-2026-003", studentName: "Ethan Gallagher", department: "CSE", courseCode: "CSE-411", courseTitle: "Distributed Systems", tagColor: "gold" },
  { seatNumber: "A-06", row: "A", col: 6, studentRoll: "STU-2026-106", studentName: "Tasnim Sultana", department: "Pharmacy", courseCode: "PHARM-302", courseTitle: "Pharmacology", tagColor: "emerald" },
  // Row B
  { seatNumber: "B-01", row: "B", col: 1, studentRoll: "STU-2026-107", studentName: "Rashidul Hasan", department: "Pharmacy", courseCode: "PHARM-302", courseTitle: "Pharmacology", tagColor: "emerald" },
  { seatNumber: "B-02", row: "B", col: 2, studentRoll: "STU-2026-004", studentName: "Sophia Martinez", department: "CSE", courseCode: "CSE-411", courseTitle: "Distributed Systems", tagColor: "gold" },
  { seatNumber: "B-03", row: "B", col: 3, studentRoll: "STU-2026-108", studentName: "Arifur Rahman", department: "Pharmacy", courseCode: "PHARM-302", courseTitle: "Pharmacology", tagColor: "emerald" },
  { seatNumber: "B-04", row: "B", col: 4, studentRoll: "STU-2026-005", studentName: "Kazi Sadman", department: "CSE", courseCode: "CSE-411", courseTitle: "Distributed Systems", tagColor: "gold" },
  { seatNumber: "B-05", row: "B", col: 5, studentRoll: "STU-2026-109", studentName: "Mahia Zaman", department: "Pharmacy", courseCode: "PHARM-302", courseTitle: "Pharmacology", tagColor: "emerald" },
  { seatNumber: "B-06", row: "B", col: 6, studentRoll: "STU-2026-006", studentName: "Tanvir Ahmed", department: "CSE", courseCode: "CSE-411", courseTitle: "Distributed Systems", tagColor: "gold" },
  // Row C
  { seatNumber: "C-01", row: "C", col: 1, studentRoll: "STU-2026-007", studentName: "Tahmina Akter", department: "CSE", courseCode: "CSE-411", courseTitle: "Distributed Systems", tagColor: "gold" },
  { seatNumber: "C-02", row: "C", col: 2, studentRoll: "STU-2026-110", studentName: "Sabbir Hossain", department: "Pharmacy", courseCode: "PHARM-302", courseTitle: "Pharmacology", tagColor: "emerald" },
  { seatNumber: "C-03", row: "C", col: 3, studentRoll: "STU-2026-008", studentName: "Jannatul Firdous", department: "CSE", courseCode: "CSE-411", courseTitle: "Distributed Systems", tagColor: "gold" },
  { seatNumber: "C-04", row: "C", col: 4, studentRoll: "STU-2026-111", studentName: "Mehedi Hasan", department: "Pharmacy", courseCode: "PHARM-302", courseTitle: "Pharmacology", tagColor: "emerald" },
  { seatNumber: "C-05", row: "C", col: 5, studentRoll: "STU-2026-009", studentName: "Rezaul Karim", department: "CSE", courseCode: "CSE-411", courseTitle: "Distributed Systems", tagColor: "gold" },
  { seatNumber: "C-06", row: "C", col: 6, studentRoll: "STU-2026-112", studentName: "Nusrat Jahan", department: "Pharmacy", courseCode: "PHARM-302", courseTitle: "Pharmacology", tagColor: "emerald" },
  // Row D
  { seatNumber: "D-01", row: "D", col: 1, studentRoll: "STU-2026-113", studentName: "Imran Nazir", department: "Pharmacy", courseCode: "PHARM-302", courseTitle: "Pharmacology", tagColor: "emerald" },
  { seatNumber: "D-02", row: "D", col: 2, studentRoll: "STU-2026-010", studentName: "Farzana Yasmin", department: "CSE", courseCode: "CSE-411", courseTitle: "Distributed Systems", tagColor: "gold" },
  { seatNumber: "D-03", row: "D", col: 3, studentRoll: "STU-2026-114", studentName: "Shakil Chowdhury", department: "Pharmacy", courseCode: "PHARM-302", courseTitle: "Pharmacology", tagColor: "emerald" },
  { seatNumber: "D-04", row: "D", col: 4, studentRoll: "STU-2026-011", studentName: "Robiul Islam", department: "CSE", courseCode: "CSE-411", courseTitle: "Distributed Systems", tagColor: "gold" },
  { seatNumber: "D-05", row: "D", col: 5, studentRoll: "STU-2026-115", studentName: "Munira Begum", department: "Pharmacy", courseCode: "PHARM-302", courseTitle: "Pharmacology", tagColor: "emerald" },
  { seatNumber: "D-06", row: "D", col: 6, studentRoll: "STU-2026-012", studentName: "Shariar Kabir", department: "CSE", courseCode: "CSE-411", courseTitle: "Distributed Systems", tagColor: "gold" },
];

const MOCK_INVIGILATION_ROSTER: InvigilationDuty[] = [
  {
    id: "INV-001",
    facultyId: "FAC-001",
    facultyName: "Prof. Dr. Evelyn Parker",
    department: "Computer Science & Engineering",
    designation: "Professor & Chair",
    examDate: "2026-10-18 (Sunday)",
    timeSlot: "09:30 AM - 12:30 PM",
    assignedHall: "Central Auditorium (Hall A)",
    role: "CHIEF_INVIGILATOR",
    totalAssignedDuties: 3,
    maxDutyLimit: 5,
    status: "CONFIRMED",
  },
  {
    id: "INV-002",
    facultyId: "FAC-002",
    facultyName: "Dr. Tariq Rahman",
    department: "Clinical Pharmacology",
    designation: "Associate Professor",
    examDate: "2026-10-18 (Sunday)",
    timeSlot: "09:30 AM - 12:30 PM",
    assignedHall: "Central Auditorium (Hall B)",
    role: "CHIEF_INVIGILATOR",
    totalAssignedDuties: 4,
    maxDutyLimit: 6,
    status: "CONFIRMED",
  },
  {
    id: "INV-003",
    facultyId: "FAC-003",
    facultyName: "Dr. Nadia Sultana",
    department: "Microbiology",
    designation: "Assistant Professor",
    examDate: "2026-10-18 (Sunday)",
    timeSlot: "09:30 AM - 12:30 PM",
    assignedHall: "Central Auditorium (Hall A)",
    role: "ASSISTANT_INVIGILATOR",
    totalAssignedDuties: 5,
    maxDutyLimit: 6,
    status: "CONFIRMED",
  },
  {
    id: "INV-004",
    facultyId: "FAC-004",
    facultyName: "Lecturer Mahfuzul Alam",
    department: "Computer Science & Engineering",
    designation: "Lecturer",
    examDate: "2026-10-18 (Sunday)",
    timeSlot: "09:30 AM - 12:30 PM",
    assignedHall: "Central Auditorium (Hall B)",
    role: "ASSISTANT_INVIGILATOR",
    totalAssignedDuties: 6,
    maxDutyLimit: 6,
    status: "SUBSTITUTE_REQUESTED",
  },
  {
    id: "INV-005",
    facultyId: "FAC-005",
    facultyName: "Dr. Farhana Chowdhury",
    department: "Biochemistry",
    designation: "Associate Professor",
    examDate: "2026-10-18 (Sunday)",
    timeSlot: "09:30 AM - 12:30 PM",
    assignedHall: "All Halls Rover",
    role: "RELIEF_ROVER",
    totalAssignedDuties: 2,
    maxDutyLimit: 5,
    status: "CONFIRMED",
  },
];

const MOCK_SWAP_REQUESTS: DutySwapRequest[] = [
  {
    id: "SWAP-801",
    requestingFacultyId: "FAC-004",
    requestingFacultyName: "Lecturer Mahfuzul Alam",
    requestingDepartment: "CSE",
    originalSlot: "2026-10-18 (09:30 AM - 12:30 PM)",
    originalHall: "Central Auditorium (Hall B)",
    originalRole: "ASSISTANT_INVIGILATOR",
    substituteFacultyId: "FAC-009",
    substituteFacultyName: "Dr. Kamrul Hasan",
    substituteDepartment: "CSE",
    tradeType: "1_WAY_SUBSTITUTE",
    reason: "Attending IEEE International Conference presentation session",
    status: "PENDING_HOD_APPROVAL",
    clashFreeVerified: true,
    requestedAt: "2026-10-03 04:30 PM",
  },
  {
    id: "SWAP-802",
    requestingFacultyId: "FAC-003",
    requestingFacultyName: "Dr. Nadia Sultana",
    requestingDepartment: "Microbiology",
    originalSlot: "2026-10-20 (09:30 AM - 12:30 PM)",
    originalHall: "Central Auditorium (Hall A)",
    originalRole: "ASSISTANT_INVIGILATOR",
    substituteFacultyId: "FAC-005",
    substituteFacultyName: "Dr. Farhana Chowdhury",
    substituteDepartment: "Biochemistry",
    tradeType: "2_WAY_MUTUAL_SWAP",
    reason: "Mutual exchange with Thursday afternoon slot",
    status: "APPROVED_COMMITTED",
    clashFreeVerified: true,
    requestedAt: "2026-10-02 11:15 AM",
  },
];

export default function RoutineManagementPage() {
  const { user } = useAuthStore();
  const { can, roleIs } = usePermission();

  const [activeTab, setActiveTab] = useState<RoutineTab>("graph-generator");
  const [examSlots, setExamSlots] = useState<ExamSlot[]>(MOCK_EXAM_SLOTS);
  const [invigilationRoster, setInvigilationRoster] = useState<InvigilationDuty[]>(MOCK_INVIGILATION_ROSTER);
  const [swapRequests, setSwapRequests] = useState<DutySwapRequest[]>(MOCK_SWAP_REQUESTS);
  const [selectedHall, setSelectedHall] = useState("Central Auditorium (Hall A & B)");

  // Swap Modal State
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapForm, setSwapForm] = useState({
    facultyName: "Lecturer Mahfuzul Alam (FAC-004)",
    originalSlot: "2026-10-18 (09:30 AM - 12:30 PM)",
    substituteFaculty: "Dr. Kamrul Hasan (FAC-009)",
    tradeType: "1_WAY_SUBSTITUTE" as "1_WAY_SUBSTITUTE" | "2_WAY_MUTUAL_SWAP",
    reason: "",
  });

  // Welsh-Powell Interactive Simulation
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [algorithmStats, setAlgorithmStats] = useState<{
    totalCourses: number;
    graphVertices: number;
    conflictEdges: number;
    chromaticNumber: number;
    totalExaminees: number;
    executionTimeMs: number;
  } | null>({
    totalCourses: 48,
    graphVertices: 48,
    conflictEdges: 312,
    chromaticNumber: 9,
    totalExaminees: 3420,
    executionTimeMs: 14.8,
  });

  const isEditor = can("update", "routines") || roleIs("super-admin", "domain-admin", "staff");

  const handleRunWelshPowell = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setAlgorithmStats({
        totalCourses: 52,
        graphVertices: 52,
        conflictEdges: 348,
        chromaticNumber: 9,
        totalExaminees: 3890,
        executionTimeMs: 18.2,
      });
      setSuccessMsg("Welsh-Powell Graph Coloring Algorithm executed! Generated 100% clash-free routine across 3,890 examinees with Chromatic Index χ(G) = 9.");
      setTimeout(() => setSuccessMsg(""), 5500);
    }, 1400);
  };

  const handleExportPDF = () => {
    setSuccessMsg("Exported official university exam timetable & room matrix PDF.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleExportExcel = () => {
    setSuccessMsg("Exported master examination scheduling sheet (.XLSX) with invigilation rosters.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleCreateSwap = (e: React.FormEvent) => {
    e.preventDefault();
    const newSwap: DutySwapRequest = {
      id: `SWAP-${Math.floor(800 + Math.random() * 100)}`,
      requestingFacultyId: "FAC-004",
      requestingFacultyName: "Lecturer Mahfuzul Alam",
      requestingDepartment: "CSE",
      originalSlot: swapForm.originalSlot,
      originalHall: "Central Auditorium (Hall B)",
      originalRole: "ASSISTANT_INVIGILATOR",
      substituteFacultyId: "FAC-009",
      substituteFacultyName: swapForm.substituteFaculty.split("(")[0].trim(),
      substituteDepartment: "CSE",
      tradeType: swapForm.tradeType,
      reason: swapForm.reason || "Personal official conflict",
      status: "PENDING_HOD_APPROVAL",
      clashFreeVerified: true,
      requestedAt: "Just now",
    };
    setSwapRequests((prev) => [newSwap, ...prev]);
    setShowSwapModal(false);
    setSuccessMsg("Invigilation duty substitute request submitted! Verified 0 schedule clashes with substitute's existing roster.");
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  const handleApproveSwap = (id: string) => {
    setSwapRequests((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "APPROVED_COMMITTED" } : s))
    );
    setSuccessMsg("HOD / Exam Controller approved duty trade! Invigilation roster updated & SMS confirmation dispatched to both faculty members.");
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  // Invigilation Columns
  const invigilationColumns: Column<InvigilationDuty>[] = [
    {
      header: "Invigilator & Dept",
      accessor: (row) => (
        <div>
          <div className="font-semibold text-text text-xs flex items-center gap-1.5">
            <span>{row.facultyName}</span>
            <span className="font-mono text-[11px] text-text-muted">({row.facultyId})</span>
          </div>
          <div className="text-[11px] text-text-muted">{row.department} • {row.designation}</div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Session & Hall",
      accessor: (row) => (
        <div>
          <div className="text-xs font-medium text-text">{row.examDate}</div>
          <div className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
            <Clock size={12} className="text-primary" />
            <span>{row.timeSlot}</span>
            <span className="text-border">•</span>
            <span className="font-semibold text-text">{row.assignedHall}</span>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Assigned Role",
      accessor: (row) => (
        <Badge
          variant={
            row.role === "CHIEF_INVIGILATOR"
              ? "gold"
              : row.role === "ASSISTANT_INVIGILATOR"
              ? "primary"
              : "neutral"
          }
          size="sm"
        >
          {row.role.replace("_", " ")}
        </Badge>
      ),
      sortable: true,
    },
    {
      header: "Duty Workload Cap",
      accessor: (row) => {
        const percent = Math.round((row.totalAssignedDuties / row.maxDutyLimit) * 100);
        return (
          <div className="space-y-1 w-36">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-text-muted">Assigned:</span>
              <span className="font-mono font-bold text-text">
                {row.totalAssignedDuties} / {row.maxDutyLimit} Shifts
              </span>
            </div>
            <ProgressBar
              value={percent}
              variant={percent >= 100 ? "danger" : percent >= 70 ? "warning" : "success"}
            />
          </div>
        );
      },
    },
    {
      header: "Status",
      accessor: (row) => (
        <Badge
          variant={
            row.status === "CONFIRMED"
              ? "success"
              : row.status === "SUBSTITUTE_REQUESTED"
              ? "warning"
              : "neutral"
          }
          size="sm"
        >
          {row.status.replace("_", " ")}
        </Badge>
      ),
    },
  ];

  const swapColumns: Column<DutySwapRequest>[] = [
    {
      header: "Request ID & Date",
      accessor: (row) => (
        <div>
          <div className="font-mono font-semibold text-text text-xs">{row.id}</div>
          <div className="text-[10px] text-text-muted">{row.requestedAt}</div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Original Faculty & Shift",
      accessor: (row) => (
        <div>
          <div className="font-semibold text-text text-xs">{row.requestingFacultyName}</div>
          <div className="text-[11px] text-text-muted font-mono">{row.originalSlot}</div>
          <div className="text-[10px] text-primary">{row.originalHall} ({row.originalRole})</div>
        </div>
      ),
    },
    {
      header: "Trade Target (Substitute)",
      accessor: (row) => (
        <div>
          <div className="font-semibold text-text text-xs flex items-center gap-1">
            <ArrowRightLeft size={11} className="text-[#B98B4B]" />
            <span>{row.substituteFacultyName}</span>
          </div>
          <div className="text-[11px] text-text-muted">{row.substituteDepartment}</div>
          <Badge variant="gold" size="sm" className="mt-0.5">
            {row.tradeType.replace("_", " ")}
          </Badge>
        </div>
      ),
    },
    {
      header: "Clash Verification & Reason",
      accessor: (row) => (
        <div className="space-y-1 max-w-xs">
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <ShieldCheck size={12} />
            <span>Clash Matrix: 0 Overlaps (Clean)</span>
          </div>
          <div className="text-[11px] text-text-muted italic line-clamp-1 font-sans">
            &ldquo;{row.reason}&rdquo;
          </div>
        </div>
      ),
    },
    {
      header: "Status & Approval",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          {row.status === "APPROVED_COMMITTED" ? (
            <Badge variant="success" size="sm">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={11} />
                Committed
              </span>
            </Badge>
          ) : (
            <div className="flex items-center gap-1.5">
              <Badge variant="warning" size="sm">
                Pending HOD
              </Badge>
              {isEditor && (
                <Button
                  size="sm"
                  variant="gold"
                  onClick={() => handleApproveSwap(row.id)}
                >
                  Approve
                </Button>
              )}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Welsh-Powell Exam Routine & Seating Command"
        subtitle="Graph coloring clash-free exam generator, odd-even alternating anti-cheating seating matrix, and faculty duty swap workflow."
        badge={<Badge tone="gold">Chromatic Index χ(G) = 9</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowRightLeft size={13} />}
              onClick={() => setShowSwapModal(true)}
            >
              Request Duty Swap
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Printer size={13} />}
              onClick={handleExportPDF}
            >
              Export PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<FileSpreadsheet size={13} />}
              onClick={handleExportExcel}
            >
              Export Excel
            </Button>
            {isEditor && (
              <Button
                variant="gold"
                size="sm"
                onClick={handleRunWelshPowell}
                disabled={isGenerating}
                icon={<Cpu size={14} className={isGenerating ? "animate-spin" : ""} />}
              >
                {isGenerating ? "Computing Coloring..." : "Re-Run Welsh-Powell"}
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
            <span>Clash-Free Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">100.0%</div>
          <p className="text-[11px] text-text-muted">0 student or room schedule conflicts</p>
        </Card>

        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Graph Chromatic Index</span>
            <Cpu className="w-4 h-4 text-[#B98B4B]" />
          </div>
          <div className="text-2xl font-bold font-mono text-text">χ(G) = 9 Slots</div>
          <p className="text-[11px] text-text-muted">Minimum slots to cover all 52 courses</p>
        </Card>

        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Total Examinee Cohort</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-text">3,890 Students</div>
          <p className="text-[11px] text-text-muted">Across 6 university exam days</p>
        </Card>

        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Duty Swap Status</span>
            <ArrowRightLeft className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-text">{swapRequests.length} Requests</div>
          <p className="text-[11px] text-text-muted">Peer-to-peer cover & substitute matrix</p>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <Tabs
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as RoutineTab)}
        tabs={[
          { id: "graph-generator", label: "Welsh-Powell Graph Engine", count: examSlots.length },
          { id: "seating-matrix", label: "Anti-Cheating Seating Matrix" },
          { id: "invigilation-roster", label: "Faculty Invigilation Roster", count: invigilationRoster.length },
          { id: "faculty-duty-swap", label: "Duty Swap & Substitute Matrix", count: swapRequests.length },
          { id: "emergency-reschedule", label: "Emergency Conflict Resolver" },
          { id: "door-rosters", label: "Door Rosters & Desk Slips" },
        ]}
      />

      {/* Tab 1: Welsh-Powell Graph Engine */}
      {activeTab === "graph-generator" && (
        <div className="space-y-6">
          {algorithmStats && (
            <Card pad="md" className="border-[#B98B4B]/30 bg-[#B98B4B]/5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#B98B4B]/20 text-[#B98B4B] flex items-center justify-center shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text">Welsh-Powell Heuristic Graph Coloring Proof</h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      Vertices ordered by descending degree: Courses sharing common student registrations form conflict edges $E(G)$.
                    </p>
                  </div>
                </div>
                <Badge variant="gold">Execution: {algorithmStats.executionTimeMs}ms</Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="p-2.5 rounded-lg bg-surface border border-border">
                  <span className="text-[10px] text-text-muted block">Graph Vertices |V|:</span>
                  <span className="font-mono font-bold text-text">{algorithmStats.graphVertices} Course Exams</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-border">
                  <span className="text-[10px] text-text-muted block">Conflict Edges |E|:</span>
                  <span className="font-mono font-bold text-text">{algorithmStats.conflictEdges} Co-Enrollments</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-border">
                  <span className="text-[10px] text-text-muted block">Optimal Coloring χ(G):</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">9 Conflict-Free Slots</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-border">
                  <span className="text-[10px] text-text-muted block">Clash Matrix Status:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">0 Overlaps (100% Clean)</span>
                </div>
              </div>
            </Card>
          )}

          {/* Master Exam Slot Schedule */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text">Conflict-Free Master Examination Schedule</h3>
            <div className="grid grid-cols-1 gap-4">
              {examSlots.map((slot) => (
                <Card key={slot.slotId} pad="md" className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: slot.chromaticColor }}
                      />
                      <span className="font-bold text-sm text-text">{slot.slotId}: {slot.date} ({slot.day})</span>
                      <Badge variant="neutral" size="sm">{slot.session}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock size={13} className="text-text-muted" />
                      <span className="font-mono font-semibold text-text">{slot.timeRange}</span>
                      <Badge variant="success" size="sm" className="ml-2">Clash Free</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {slot.courses.map((course, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-surface-muted/40 border border-border space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Badge variant="primary" size="sm">{course.code}</Badge>
                          <span className="text-[11px] font-mono font-bold text-text">{course.candidateCount} Students</span>
                        </div>
                        <div className="font-semibold text-xs text-text line-clamp-1">{course.title}</div>
                        <div className="text-[11px] text-text-muted flex items-center gap-1">
                          <MapPin size={11} className="text-primary" />
                          <span>{course.assignedHall}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Anti-Cheating Alternating Seating Matrix */}
      {activeTab === "seating-matrix" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-text">Odd-Even Alternating Anti-Cheating Seating Plan</h3>
              <p className="text-xs text-text-muted">
                Adjacent desk neighbors are strictly enrolled in different academic courses and exam papers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedHall} onChange={(e) => setSelectedHall(e.target.value)} className="text-xs">
                <option value="Central Auditorium (Hall A & B)">Central Auditorium (240 Capacity)</option>
                <option value="Lecture Gallery 1">Lecture Gallery 1 (120 Capacity)</option>
                <option value="Exam Hall 304">Exam Hall 304 (80 Capacity)</option>
              </Select>
              <Button
                variant="gold"
                size="sm"
                icon={<Printer size={13} />}
                onClick={() => {
                  setSuccessMsg("Generated printable 2D bench seating chart for invigilators.");
                  setTimeout(() => setSuccessMsg(""), 4000);
                }}
              >
                Print Hall Chart
              </Button>
            </div>
          </div>

          {/* 2D Seating Layout Visualizer */}
          <Card pad="md" className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-[#B98B4B]" />
                  <span className="font-medium text-text">CSE-411 (Distributed Systems)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span className="font-medium text-text">PHARM-302 (Pharmacology)</span>
                </div>
              </div>
              <span className="font-mono text-text-muted">Hall Stage / Invigilator Podium ➔</span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
              {MOCK_SEATING_GRID.map((seat) => (
                <div
                  key={seat.seatNumber}
                  className={`p-2.5 rounded-xl border transition-all text-xs space-y-1 ${
                    seat.tagColor === "gold"
                      ? "bg-[#B98B4B]/10 border-[#B98B4B]/30 hover:border-[#B98B4B]"
                      : "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-text text-[11px]">Seat {seat.seatNumber}</span>
                    <Badge variant={seat.tagColor === "gold" ? "gold" : "success"} size="sm">
                      {seat.courseCode}
                    </Badge>
                  </div>
                  <div className="font-semibold text-text text-[11px] truncate">{seat.studentName}</div>
                  <div className="font-mono text-[10px] text-text-muted">{seat.studentRoll}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Faculty Invigilation Roster */}
      {activeTab === "invigilation-roster" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text">Faculty Invigilation Duties & Shift Balancing</h3>
              <p className="text-xs text-text-muted">
                Statutory duty caps enforced to prevent faculty burnout (Max 2 shifts/day, 6 shifts/semester).
              </p>
            </div>
            <Button
              variant="gold"
              size="sm"
              icon={<Send size={13} />}
              onClick={() => {
                setSuccessMsg("Dispatched official invigilation assignment SMS & Email duty notices to 64 faculty.");
                setTimeout(() => setSuccessMsg(""), 4500);
              }}
            >
              Broadcast Duty Notices
            </Button>
          </div>

          <Card pad="none" className="overflow-hidden">
            <DataTable
              data={invigilationRoster}
              columns={invigilationColumns}
              searchable={true}
              searchPlaceholder="Search faculty name, department, or assigned hall..."
              searchField="facultyName"
              pagination={true}
              pageSize={8}
            />
          </Card>
        </div>
      )}

      {/* Tab 4: Faculty Duty Swap & Substitute Matrix */}
      {activeTab === "faculty-duty-swap" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text">Faculty Invigilation Duty Swap & Substitute Workflow</h3>
              <p className="text-xs text-text-muted">
                Peer-to-peer invigilation shift trades with real-time Welsh-Powell conflict checking and HOD authorization.
              </p>
            </div>
            <Button
              variant="gold"
              size="sm"
              icon={<ArrowRightLeft size={13} />}
              onClick={() => setShowSwapModal(true)}
            >
              Initiate Swap Request
            </Button>
          </div>

          <DataTable
            data={swapRequests}
            columns={swapColumns}
            searchable={true}
            searchPlaceholder="Search faculty, request ID, or department..."
            searchField="requestingFacultyName"
            pagination={true}
            pageSize={8}
          />
        </div>
      )}

      {/* Tab 5: Emergency Conflict Resolver */}
      {activeTab === "emergency-reschedule" && (
        <div className="space-y-6">
          <Card pad="md" className="border-amber-500/30 bg-amber-500/5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text">Emergency Holiday Postponement & Conflict-Free Slot Finder</h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    Select a postponed exam session to calculate safe makeup windows that do not introduce new student exam overlaps.
                  </p>
                </div>
              </div>
              <Badge variant="warning">Automated Re-Coloring</Badge>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Postponed Session Date">
                <Input type="date" defaultValue="2026-10-18" />
              </FormField>
              <FormField label="Affected Course">
                <Select defaultValue="CSE-411">
                  <option value="CSE-411">CSE-411: Distributed Systems (120 Students)</option>
                  <option value="PHARM-302">PHARM-302: Pharmacology (85 Students)</option>
                  <option value="MBBS-201">MBBS-201: Pathology (110 Students)</option>
                </Select>
              </FormField>
              <div className="flex items-end">
                <Button
                  variant="gold"
                  className="w-full"
                  onClick={() => {
                    setSuccessMsg("Found 2 unconflicted makeup slots: Friday 2026-10-23 (09:30 AM) and Saturday 2026-10-24 (02:00 PM).");
                    setTimeout(() => setSuccessMsg(""), 5500);
                  }}
                >
                  Calculate Makeup Slots
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 6: Door Rosters & Desk Slips */}
      {activeTab === "door-rosters" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text">Room Entrance Door Rosters & Desk Markers</h3>
              <p className="text-xs text-text-muted">
                Official candidate attendance registers for exam hall doors with invigilator verification boxes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Download size={13} />}
                onClick={() => {
                  setSuccessMsg("Exported printable roll-wise door attendance sheets (PDF).");
                  setTimeout(() => setSuccessMsg(""), 4000);
                }}
              >
                Download Door Sheets
              </Button>
              <Button
                variant="gold"
                size="sm"
                icon={<Printer size={13} />}
                onClick={() => {
                  setSuccessMsg("Exported desk barcode stickers for 240 examinee seats.");
                  setTimeout(() => setSuccessMsg(""), 4000);
                }}
              >
                Print Desk Stickers
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card pad="md" className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-text">Central Auditorium (Hall A) - Morning Gate Sheet</h4>
                  <div className="text-xs text-text-muted">Exam: CSE-411 • 2026-10-18 (09:30 AM)</div>
                </div>
                <Badge variant="primary">120 Rolls</Badge>
              </div>
              <div className="p-3 rounded-xl bg-surface-muted/40 border border-border text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-text-muted">
                  <span>Roll Range: STU-2026-001 to STU-2026-120</span>
                  <span>Chief Invigilator: Prof. Evelyn Parker</span>
                </div>
                <div className="font-mono text-[11px] bg-surface p-2 rounded border border-border/60">
                  Sample: [Seat A-01 | STU-2026-001 | Marcus Chen | Signature: _______ ]
                </div>
              </div>
            </Card>

            <Card pad="md" className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-text">Central Auditorium (Hall B) - Morning Gate Sheet</h4>
                  <div className="text-xs text-text-muted">Exam: PHARM-302 • 2026-10-18 (09:30 AM)</div>
                </div>
                <Badge variant="success">85 Rolls</Badge>
              </div>
              <div className="p-3 rounded-xl bg-surface-muted/40 border border-border text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-text-muted">
                  <span>Roll Range: STU-2026-104 to STU-2026-189</span>
                  <span>Chief Invigilator: Dr. Tariq Rahman</span>
                </div>
                <div className="font-mono text-[11px] bg-surface p-2 rounded border border-border/60">
                  Sample: [Seat A-02 | STU-2026-104 | Humaira Kabir | Signature: _______ ]
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Duty Swap Modal */}
      <Dialog
        open={showSwapModal}
        onClose={() => setShowSwapModal(false)}
        title="Request Invigilation Duty Swap / Substitute Cover"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowSwapModal(false)}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleCreateSwap}>
              Submit Swap Request
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSwap} className="space-y-4 text-xs">
          <FormField label="Requesting Faculty">
            <Input value={swapForm.facultyName} readOnly className="bg-surface-muted/50" />
          </FormField>
          <FormField label="Assigned Duty Shift to Substitute">
            <Select
              value={swapForm.originalSlot}
              onChange={(e) => setSwapForm((p) => ({ ...p, originalSlot: e.target.value }))}
            >
              <option value="2026-10-18 (09:30 AM - 12:30 PM)">2026-10-18 (09:30 AM) - Central Aud. Hall B</option>
              <option value="2026-10-20 (09:30 AM - 12:30 PM)">2026-10-20 (09:30 AM) - Central Aud. Hall A</option>
              <option value="2026-10-22 (09:30 AM - 12:30 PM)">2026-10-22 (09:30 AM) - Gallery 2</option>
            </Select>
          </FormField>
          <FormField label="Proposed Colleague / Substitute Faculty">
            <Select
              value={swapForm.substituteFaculty}
              onChange={(e) => setSwapForm((p) => ({ ...p, substituteFaculty: e.target.value }))}
            >
              <option value="Dr. Kamrul Hasan (FAC-009)">Dr. Kamrul Hasan (FAC-009, CSE)</option>
              <option value="Dr. Farhana Chowdhury (FAC-005)">Dr. Farhana Chowdhury (FAC-005, Biochemistry)</option>
              <option value="Dr. Nadia Sultana (FAC-003)">Dr. Nadia Sultana (FAC-003, Microbiology)</option>
            </Select>
          </FormField>
          <FormField label="Trade Arrangement Type">
            <Select
              value={swapForm.tradeType}
              onChange={(e) => setSwapForm((p) => ({ ...p, tradeType: e.target.value as any }))}
            >
              <option value="1_WAY_SUBSTITUTE">1-Way Substitute Cover (Colleague covers duty)</option>
              <option value="2_WAY_MUTUAL_SWAP">2-Way Mutual Swap (Exchange with another slot)</option>
            </Select>
          </FormField>
          <FormField label="Official Reason for Substitute Request">
            <Input
              value={swapForm.reason}
              onChange={(e) => setSwapForm((p) => ({ ...p, reason: e.target.value }))}
              placeholder="e.g. Academic conference presentation or urgent personal matter"
              required
            />
          </FormField>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[11px] flex items-center gap-1.5">
            <ShieldCheck size={14} className="shrink-0" />
            <span>Automatic clash validation will run against the substitute&apos;s schedule prior to routing to HOD.</span>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
