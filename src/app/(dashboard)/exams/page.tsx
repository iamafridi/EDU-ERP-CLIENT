"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  CheckCircle2,
  Plus,
  FileSpreadsheet,
  BookOpen,
  Users,
  Award,
  Calendar,
  Clock,
  Layers,
  GraduationCap,
  Sparkles,
  Sliders,
  Lock,
  Send,
  Download,
  AlertOctagon,
  Printer,
  Scale,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Hash,
  UserCheck,
  Check,
  RefreshCw,
  EyeOff,
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
import { FacultyDutySwapPanel } from "@/components/academic/FacultyDutySwapPanel";
import { MakeUpExamPanel } from "@/components/academic/MakeUpExamPanel";
import { DoubleBlindMarkingPanel } from "@/components/academic/DoubleBlindMarkingPanel";

interface Exam {
  id: string;
  code: string;
  title: string;
  date: string;
  duration: string;
  room?: string;
  totalCandidates?: number;
}

interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  examId: string;
  examTitle: string;
  grade: string;
  score: number;
}

interface MultiExaminerScript {
  scriptBarcode: string;
  rollNo: string;
  studentName: string;
  courseCode: string;
  examiner1Score: number;
  examiner2Score: number;
  delta: number;
  discrepancyFlag: boolean;
  examiner3Score?: number;
  finalHarmonizedScore: number;
  status: "MATCHED" | "ARBITRATION_REQUIRED" | "ARBITRATION_RESOLVED";
}

interface TabulationStudent {
  rollNo: string;
  studentName: string;
  cse110Marks: number;
  cse220Marks: number;
  mat120Marks: number;
  phy111Marks: number;
  creditsAttempted: number;
  creditsEarned: number;
  rawTgpa: number;
  tgpa: number;
  cgpa: number;
  graceApplied: boolean;
  graceDelta?: number;
  standing: "Dean's Honor List" | "Good Standing" | "Academic Warning" | "Probation 1";
}

interface RescrutinyAppeal {
  id: string;
  studentId: string;
  studentName: string;
  courseCode: string;
  originalMarks: number;
  publishedGrade: string;
  feePaid: boolean;
  status: "UNDER_HEAD_EXAMINER_REVIEW" | "MARKS_AMENDED" | "NO_CHANGE";
  revisedMarks?: number;
  revisedGrade?: string;
}

interface QuestionBankItem {
  id: string;
  courseCode: string;
  topic: string;
  cognitiveLevel: "Recall / Knowledge" | "Comprehension" | "Clinical Application" | "Problem Solving";
  marks: number;
  questionText: string;
  authorFaculty: string;
  status: "LOCKED_VAULT" | "MODERATED" | "DRAFT";
}

const mockQuestionPool: QuestionBankItem[] = [
  {
    id: "QBK-0101",
    courseCode: "ANAT101",
    topic: "Upper Limb Brachial Plexus",
    cognitiveLevel: "Clinical Application",
    marks: 10,
    questionText: "A 28-year-old motorcyclist sustains a trauma causing Erb-Duchenne palsy (waiter's tip deformity). Describe the nerve roots involved, muscular deficits, and anatomical relations of the brachial plexus roots.",
    authorFaculty: "Prof. Dr. M. Rahman (Anatomy)",
    status: "MODERATED",
  },
  {
    id: "QBK-0102",
    courseCode: "PHYS102",
    topic: "Cardiac Electrophysiology",
    cognitiveLevel: "Recall / Knowledge",
    marks: 5,
    questionText: "Draw and label the action potential of a ventricular myocyte. Explain the ionic basis of the plateau phase (Phase 2).",
    authorFaculty: "Assoc. Prof. Dr. Farhana (Physiology)",
    status: "MODERATED",
  },
  {
    id: "QBK-0103",
    courseCode: "BIOCHEM103",
    topic: "Heme Synthesis & Porphyria",
    cognitiveLevel: "Problem Solving",
    marks: 10,
    questionText: "Explain the biochemical regulation of ALA Synthase. Detail how acute intermittent porphyria leads to neurovisceral symptoms.",
    authorFaculty: "Dr. K. Alam (Biochemistry)",
    status: "LOCKED_VAULT",
  },
  {
    id: "QBK-0104",
    courseCode: "CSE220",
    topic: "Graph Traversal & BFS/DFS",
    cognitiveLevel: "Problem Solving",
    marks: 10,
    questionText: "Implement Welsh-Powell graph coloring algorithm to assign conflict-free examination seating slots for 120 students with time complexity analysis.",
    authorFaculty: "Engr. Tahmid Hasan",
    status: "MODERATED",
  },
];

const initialMultiExaminerScripts: MultiExaminerScript[] = [
  {
    scriptBarcode: "SCR-88901",
    rollNo: "CSE-2023-0142",
    studentName: "Tahmid Hasan",
    courseCode: "CSE220 (Data Structures)",
    examiner1Score: 92,
    examiner2Score: 90,
    delta: 2,
    discrepancyFlag: false,
    finalHarmonizedScore: 91,
    status: "MATCHED",
  },
  {
    scriptBarcode: "SCR-88902",
    rollNo: "CSE-2023-0143",
    studentName: "Nafis Fuad",
    courseCode: "CSE220 (Data Structures)",
    examiner1Score: 84,
    examiner2Score: 72,
    delta: 12,
    discrepancyFlag: false,
    finalHarmonizedScore: 78,
    status: "MATCHED",
  },
  {
    scriptBarcode: "SCR-88903",
    rollNo: "CSE-2023-0144",
    studentName: "Rifat Chowdhury",
    courseCode: "CSE220 (Data Structures)",
    examiner1Score: 48,
    examiner2Score: 68,
    delta: 20,
    discrepancyFlag: true,
    examiner3Score: 61,
    finalHarmonizedScore: 61,
    status: "ARBITRATION_RESOLVED",
  },
  {
    scriptBarcode: "SCR-88904",
    rollNo: "CSE-2023-0145",
    studentName: "Sabbir Ahmed",
    courseCode: "CSE220 (Data Structures)",
    examiner1Score: 36,
    examiner2Score: 54,
    delta: 18,
    discrepancyFlag: true,
    status: "ARBITRATION_REQUIRED",
    finalHarmonizedScore: 45,
  },
];

const mockTabulationSheet: TabulationStudent[] = [
  {
    rollNo: "CSE-2023-0142",
    studentName: "Tahmid Hasan",
    cse110Marks: 94,
    cse220Marks: 91,
    mat120Marks: 88,
    phy111Marks: 96,
    creditsAttempted: 13,
    creditsEarned: 13,
    rawTgpa: 3.96,
    tgpa: 3.96,
    cgpa: 3.92,
    graceApplied: false,
    standing: "Dean's Honor List",
  },
  {
    rollNo: "CSE-2023-0143",
    studentName: "Nafis Fuad",
    cse110Marks: 82,
    cse220Marks: 78,
    mat120Marks: 85,
    phy111Marks: 80,
    creditsAttempted: 13,
    creditsEarned: 13,
    rawTgpa: 3.62,
    tgpa: 3.62,
    cgpa: 3.55,
    graceApplied: false,
    standing: "Good Standing",
  },
  {
    rollNo: "CSE-2023-0144",
    studentName: "Rifat Chowdhury",
    cse110Marks: 62,
    cse220Marks: 58,
    mat120Marks: 65,
    phy111Marks: 60,
    creditsAttempted: 13,
    creditsEarned: 13,
    rawTgpa: 2.38,
    tgpa: 2.38,
    cgpa: 2.18,
    graceApplied: false,
    standing: "Academic Warning",
  },
  {
    rollNo: "CSE-2023-0145",
    studentName: "Sabbir Ahmed",
    cse110Marks: 45,
    cse220Marks: 42,
    mat120Marks: 38,
    phy111Marks: 52,
    creditsAttempted: 13,
    creditsEarned: 10,
    rawTgpa: 1.84,
    tgpa: 1.84,
    cgpa: 1.95,
    graceApplied: false,
    standing: "Probation 1",
  },
  {
    rollNo: "CSE-2023-0146",
    studentName: "Sadia Sultana",
    cse110Marks: 79.5,
    cse220Marks: 84,
    mat120Marks: 79.6,
    phy111Marks: 82,
    creditsAttempted: 13,
    creditsEarned: 13,
    rawTgpa: 3.72,
    tgpa: 3.82,
    cgpa: 3.80,
    graceApplied: true,
    graceDelta: 0.5,
    standing: "Dean's Honor List",
  },
];

const mockRescrutinyAppeals: RescrutinyAppeal[] = [
  {
    id: "REV-2026-001",
    studentId: "CSE-2023-0144",
    studentName: "Rifat Chowdhury",
    courseCode: "CSE220 (Data Structures)",
    originalMarks: 58,
    publishedGrade: "C (2.00)",
    feePaid: true,
    status: "UNDER_HEAD_EXAMINER_REVIEW",
  },
  {
    id: "REV-2026-002",
    studentId: "CSE-2023-0145",
    studentName: "Sabbir Ahmed",
    courseCode: "MAT120 (Calculus)",
    originalMarks: 38,
    publishedGrade: "F (0.00)",
    feePaid: true,
    status: "MARKS_AMENDED",
    revisedMarks: 44,
    revisedGrade: "D (1.00)",
  },
];

export default function ExamsGradesPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    | "exams"
    | "grades"
    | "double-blind"
    | "arbitration"
    | "duty-swaps"
    | "makeup-exams"
    | "assessments"
    | "tabulation"
    | "publication"
    | "rescrutiny"
    | "question-bank"
  >("exams");
  const [successMsg, setSuccessMsg] = useState("");
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isResultPublished, setIsResultPublished] = useState(false);
  const [curveOffset, setCurveOffset] = useState(0);
  const [enableGraceRule, setEnableGraceRule] = useState(true);
  const [scripts, setScripts] = useState<MultiExaminerScript[]>(initialMultiExaminerScripts);
  const [resolvingScript, setResolvingScript] = useState<MultiExaminerScript | null>(null);
  const [examiner3Input, setExaminer3Input] = useState<number>(60);

  const [newExam, setNewExam] = useState({
    code: "",
    title: "",
    date: "",
    duration: "3 hours",
    room: "Auditorium 1",
    totalCandidates: 120,
  });

  const isAdminOrPrincipal = roleIs("super-admin", "domain-admin");

  const { data: exams = [], isLoading: isLoadingExams } = useQuery<Exam[]>({
    queryKey: ["exams"],
    queryFn: api.getExams,
  });

  const { data: grades = [], isLoading: isLoadingGrades } = useQuery<Grade[]>({
    queryKey: ["grades"],
    queryFn: api.getGrades,
  });

  const { data: assessments = [], isLoading: loadingAssess } = useQuery({
    queryKey: ["assessments"],
    queryFn: api.getAssessments,
  });

  const createExamMutation = useMutation({
    mutationFn: api.createExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      setSuccessMsg("Exam created successfully.");
      setIsExamModalOpen(false);
      setNewExam({
        code: "",
        title: "",
        date: "",
        duration: "3 hours",
        room: "Auditorium 1",
        totalCandidates: 120,
      });
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    createExamMutation.mutate(newExam);
  };

  const handleResolveArbitration = () => {
    if (!resolvingScript) return;
    setScripts((prev) =>
      prev.map((s) =>
        s.scriptBarcode === resolvingScript.scriptBarcode
          ? {
              ...s,
              examiner3Score: examiner3Input,
              finalHarmonizedScore: examiner3Input,
              status: "ARBITRATION_RESOLVED",
            }
          : s
      )
    );
    setSuccessMsg(
      `Arbitration resolved for ${resolvingScript.scriptBarcode}. Head Examiner score of ${examiner3Input}% finalized.`
    );
    setResolvingScript(null);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const examColumns: Column<Exam>[] = [
    {
      header: "Exam Code",
      accessor: (row) => <span className="font-mono text-gold font-bold">{row.code}</span>,
    },
    { header: "Examination Title", accessor: "title" },
    {
      header: "Scheduled Date",
      accessor: (row) => (
        <span className="font-mono text-text-muted flex items-center gap-1.5">
          <Calendar size={13} className="text-gold" />
          {row.date}
        </span>
      ),
    },
    {
      header: "Duration",
      accessor: (row) => (
        <span className="text-text flex items-center gap-1.5">
          <Clock size={13} className="text-text-muted" />
          {row.duration}
        </span>
      ),
    },
    {
      header: "Room & Hall",
      accessor: (row) => <span className="font-mono text-xs text-text">{row.room || "Auditorium 1"}</span>,
    },
  ];

  const gradeColumns: Column<Grade>[] = [
    { header: "Student Name", accessor: "studentName" },
    {
      header: "Student ID",
      accessor: (row) => <span className="font-mono text-text-muted">{row.studentId}</span>,
    },
    { header: "Exam / Subject", accessor: "examTitle" },
    {
      header: "Grade Letter",
      accessor: (row) => (
        <Badge
          variant={
            row.grade.startsWith("A")
              ? "success"
              : row.grade.startsWith("B")
              ? "gold"
              : row.grade.startsWith("C")
              ? "warning"
              : "danger"
          }
          size="sm"
        >
          {row.grade}
        </Badge>
      ),
    },
    {
      header: "Raw Score",
      accessor: (row) => (
        <span className="font-mono font-bold text-text">{row.score}%</span>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Examination Controller, Grading & Master Tabulation Desk"
        subtitle="Manage semester examination timetables, multi-examiner arbitration (Δ > 15%), UGC 4.0 grading curves, 0.6% statutory grace mark engine, master tabulation sheets, and cryptographic result publication."
        actions={
          <div className="flex items-center gap-2">
            {isAdminOrPrincipal && (
              <Button
                variant="gold"
                size="md"
                onClick={() => setIsExamModalOpen(true)}
                leftIcon={<Plus size={15} />}
              >
                Schedule Paper
              </Button>
            )}
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
            <span className="text-xs font-semibold text-text-muted uppercase">Scheduled Papers</span>
            <Badge variant="gold" size="sm">Fall 2026</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-text">
            {exams.length || 14} <span className="text-xs font-normal text-text-muted">Papers</span>
          </div>
          <span className="text-xs text-text-muted mt-1 block">Midterm & Final Series</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Examiner Arbitrations</span>
            <Badge variant="danger" size="sm">Δ &gt; 15%</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-danger">
            {scripts.filter((s) => s.discrepancyFlag && s.status === "ARBITRATION_REQUIRED").length} <span className="text-xs font-normal text-text-muted">Pending E3</span>
          </div>
          <span className="text-xs text-text-muted mt-1 block">Head Examiner Review</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Dean&apos;s Honor List</span>
            <Badge variant="gold" size="sm">CGPA ≥ 3.75</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-gold">
            21.2% <span className="text-xs font-normal text-text-muted">Scholars</span>
          </div>
          <span className="text-xs text-text-muted mt-1 block">Statutory High Honors</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Re-Scrutiny Appeals</span>
            <Badge variant="warning" size="sm">14-Day Window</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-warning">
            {mockRescrutinyAppeals.length} Cases
          </div>
          <span className="text-xs text-text-muted mt-1 block">Script Recount Desk</span>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-px">
        {([
          { key: "exams", label: "Exam Timetable", icon: FileSpreadsheet },
          { key: "double-blind", label: "Double-Blind & 5% Variance", icon: EyeOff },
          { key: "duty-swaps", label: "Faculty Duty Swaps & Roster", icon: UserCheck },
          { key: "makeup-exams", label: "Medical Make-Up Exams", icon: Sparkles },
          { key: "grades", label: "UGC 4.0 & Grace Engine", icon: GraduationCap },
          { key: "arbitration", label: "Multi-Examiner Arbitration (Δ>15%)", icon: Scale },
          { key: "assessments", label: "Continuous Evaluation (CIE)", icon: Layers },
          { key: "tabulation", label: "Master Tabulation Sheet (MTS)", icon: BookOpen },
          { key: "publication", label: "1-Click Result Publication", icon: Send },
          { key: "rescrutiny", label: "Re-Scrutiny Appeals", icon: AlertOctagon },
          { key: "question-bank", label: "Locked Question Bank & Moderation", icon: Lock },
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

      {/* Tab 1: Scheduled Exams */}
      {activeTab === "exams" && (
        <Card noPadding>
          {isLoadingExams ? (
            <TableSkeleton rows={5} cols={5} />
          ) : (
            <DataTable<Exam>
              data={exams}
              columns={examColumns}
              searchPlaceholder="Search exams by title or code..."
              searchField="title"
            />
          )}
        </Card>
      )}

      {/* Tab 2: Grade Letters, Scale & 0.6% Grace Rule */}
      {activeTab === "grades" && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <GraduationCap size={16} className="text-gold" />
                UGC Statutory 4.0 Standard Scale with Statistical Curve &amp; 0.6% CIE Grace Engine
              </h3>
              <p className="text-xs text-text-muted">
                Statutory University Grants Commission grading bands with automated Continuous Internal Evaluation (CIE) boundary distinction rules.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableGraceRule}
                  onChange={(e) => setEnableGraceRule(e.target.checked)}
                  className="rounded border-border text-gold accent-gold"
                />
                <span>Auto-Apply Statutory 0.6% Grace Rule</span>
              </label>
              <Badge variant="gold" size="sm">Curve: +{curveOffset}%</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card orientation="vertical" padding="lg" className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-text">UGC Statutory Grading Band</h4>
              <div className="divide-y divide-border text-xs">
                <div className="py-2 flex justify-between"><span>80% – 100%</span> <span className="font-bold text-emerald-600">A+ (4.00) — Outstanding</span></div>
                <div className="py-2 flex justify-between"><span>75% – 79%</span> <span className="font-bold text-emerald-600">A (3.75) — Excellent</span></div>
                <div className="py-2 flex justify-between"><span>70% – 74%</span> <span className="font-bold text-emerald-600">A- (3.50) — Very Good</span></div>
                <div className="py-2 flex justify-between"><span>65% – 69%</span> <span className="font-bold text-gold">B+ (3.25) — Good</span></div>
                <div className="py-2 flex justify-between"><span>60% – 64%</span> <span className="font-bold text-gold">B (3.00) — Satisfactory</span></div>
                <div className="py-2 flex justify-between"><span>55% – 59%</span> <span className="font-bold text-warning">B- (2.75) — Above Average</span></div>
                <div className="py-2 flex justify-between"><span>50% – 54%</span> <span className="font-bold text-warning">C+ (2.50) — Average</span></div>
                <div className="py-2 flex justify-between"><span>45% – 49%</span> <span className="font-bold text-warning">C (2.25) — Below Average</span></div>
                <div className="py-2 flex justify-between"><span>40% – 44%</span> <span className="font-bold text-warning">D (2.00) — Pass</span></div>
                <div className="py-2 flex justify-between text-danger"><span>&lt; 40%</span> <span className="font-bold">F (0.00) — Fail (Mandatory Retake)</span></div>
              </div>
            </Card>

            <Card orientation="vertical" padding="lg" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-text">Statistical Bell Curve Normalization</h4>
                <Sliders size={16} className="text-gold" />
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Applies standard deviation normalization across sections with disparate examiner strictness to calibrate cohort grade distributions.
              </p>

              <div className="p-4 bg-surface-muted rounded-xl border border-border space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Median Normalization Offset</span>
                  <span className="font-mono text-gold font-bold">+{curveOffset}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={curveOffset}
                  onChange={(e) => setCurveOffset(Number(e.target.value))}
                  className="w-full accent-gold cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-text-muted">
                  <span>0% Raw Score</span>
                  <span>+5% Median Shift</span>
                  <span>+10% Max Curve</span>
                </div>
              </div>

              <div className="p-3 bg-gold/5 border border-gold/20 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-gold">
                  <Sparkles size={14} />
                  <span>Statutory 0.6% Grace Rule Simulation</span>
                </div>
                <p className="text-text-muted text-[11px]">
                  Students within 0.6% of a higher grade band (e.g. 79.4% to 80.0%) with ≥ 85% attendance automatically receive the distinction elevation.
                </p>
              </div>

              <Button
                variant="gold"
                className="w-full"
                onClick={() => {
                  setSuccessMsg(`Statistical curve shift of +${curveOffset}% and 0.6% grace engine applied to Master Tabulation.`);
                  setTimeout(() => setSuccessMsg(""), 3500);
                }}
              >
                Apply Normalization &amp; Grace Rules
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 3: Multi-Examiner Discrepancy & Arbitration */}
      {activeTab === "arbitration" && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <Scale size={16} className="text-gold" />
                Multi-Examiner Blind Script Arbitration Cell (Δ &gt; 15%)
              </h3>
              <p className="text-xs text-text-muted">
                Statutory protocol: When Examiner 1 ($E_1$) and Examiner 2 ($E_2$) differ by more than 15%, the script is referred to the Head Examiner ($E_3$) for final grade arbitration.
              </p>
            </div>
            <Badge variant="danger" size="sm">
              {scripts.filter((s) => s.status === "ARBITRATION_REQUIRED").length} Flagged for E3 Review
            </Badge>
          </div>

          <div className="divide-y divide-border bg-surface border border-border rounded-2xl overflow-hidden">
            {scripts.map((sc) => (
              <div
                key={sc.scriptBarcode}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-muted/30 transition-colors"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gold px-2 py-0.5 bg-gold/10 rounded text-xs">
                      {sc.scriptBarcode}
                    </span>
                    <span className="font-bold text-text text-sm">
                      {sc.studentName} ({sc.rollNo})
                    </span>
                  </div>
                  <div className="text-xs text-text-muted flex items-center gap-4">
                    <span>Course: <strong className="text-text">{sc.courseCode}</strong></span>
                    <span>Examiner 1: <strong className="font-mono text-text">{sc.examiner1Score}%</strong></span>
                    <span>Examiner 2: <strong className="font-mono text-text">{sc.examiner2Score}%</strong></span>
                    <span className={sc.delta > 15 ? "text-danger font-bold" : "text-emerald-600 font-bold"}>
                      Δ: {sc.delta}%
                    </span>
                  </div>
                  {sc.examiner3Score && (
                    <div className="text-xs text-gold font-semibold flex items-center gap-1.5">
                      <CheckCircle2 size={13} />
                      Head Examiner (E3) Arbitration Final Score: <span className="font-mono font-bold text-text">{sc.examiner3Score}%</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    variant={
                      sc.status === "MATCHED"
                        ? "success"
                        : sc.status === "ARBITRATION_RESOLVED"
                        ? "gold"
                        : "danger"
                    }
                    size="sm"
                  >
                    {sc.status.replace(/_/g, " ")}
                  </Badge>

                  {sc.status === "ARBITRATION_REQUIRED" && (
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => {
                        setResolvingScript(sc);
                        setExaminer3Input(Math.round((sc.examiner1Score + sc.examiner2Score) / 2));
                      }}
                      leftIcon={<Scale size={13} />}
                    >
                      Arbitrate with E3
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Continuous Assessment (CIE) */}
      {activeTab === "assessments" && (
        <Card noPadding>
          {loadingAssess ? (
            <TableSkeleton rows={4} cols={6} />
          ) : (
            <DataTable<Grade>
              data={grades}
              columns={gradeColumns}
              searchPlaceholder="Search grade entries by student name..."
              searchField="studentName"
            />
          )}
        </Card>
      )}

      {/* Tab 5: Master Tabulation Sheet */}
      {activeTab === "tabulation" && (
        <Card noPadding>
          <div className="p-4 border-b border-border bg-surface flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={16} className="text-gold" />
                Official Master Tabulation Sheet (MTS) — Computer Science &amp; Engineering (Fall 2026)
              </h3>
              <p className="text-[11px] text-text-muted">
                Detailed roll-wise breakdown of Theory, Lab, Total Grade Points, TGPA, CGPA, and Academic Standing with 0.6% Grace Markers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Printer size={14} />}
                onClick={() => alert("Printing Official Gazette Tabulation Sheet with CoE Seal...")}
              >
                Print Gazette
              </Button>
              <Button
                variant="gold"
                size="sm"
                leftIcon={<Download size={14} />}
                onClick={() => alert("Exporting official signed PDF format...")}
              >
                Export MTS (PDF)
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted/50 border-b border-border text-[11px] font-bold text-text-muted uppercase">
                  <th className="p-3">Roll &amp; Candidate</th>
                  <th className="p-3">CSE110</th>
                  <th className="p-3">CSE220</th>
                  <th className="p-3">MAT120</th>
                  <th className="p-3">PHY111</th>
                  <th className="p-3">Credits</th>
                  <th className="p-3">TGPA</th>
                  <th className="p-3">CGPA</th>
                  <th className="p-3">Grace</th>
                  <th className="p-3 text-right">Academic Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {mockTabulationSheet.map((row) => (
                  <tr key={row.rollNo} className="hover:bg-surface-muted/30">
                    <td className="p-3">
                      <span className="font-bold text-text block">{row.studentName}</span>
                      <span className="font-mono text-[10px] text-gold">{row.rollNo}</span>
                    </td>
                    <td className="p-3 font-mono">{row.cse110Marks}%</td>
                    <td className="p-3 font-mono">{row.cse220Marks}%</td>
                    <td className="p-3 font-mono">{row.mat120Marks}%</td>
                    <td className="p-3 font-mono">{row.phy111Marks}%</td>
                    <td className="p-3 font-mono font-bold text-text">{row.creditsEarned}/{row.creditsAttempted}</td>
                    <td className="p-3 font-mono font-bold text-gold">{row.tgpa.toFixed(2)}</td>
                    <td className="p-3 font-mono font-bold text-emerald-600">{row.cgpa.toFixed(2)}</td>
                    <td className="p-3">
                      {row.graceApplied ? (
                        <Badge variant="gold" size="sm" className="font-mono">
                          +{row.graceDelta}%
                        </Badge>
                      ) : (
                        <span className="text-text-muted font-mono text-[11px]">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <Badge
                        variant={
                          row.standing === "Dean's Honor List"
                            ? "gold"
                            : row.standing === "Good Standing"
                            ? "success"
                            : row.standing === "Academic Warning"
                            ? "warning"
                            : "danger"
                        }
                        size="sm"
                      >
                        {row.standing}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 6: 1-Click Result Publication */}
      {activeTab === "publication" && (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-r from-surface via-surface-muted to-surface border border-gold/40 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gold/10 text-gold rounded-xl">
                  <Lock size={26} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text">Cryptographic Semester Result Publication Suite</h3>
                  <p className="text-xs text-text-muted">
                    Publishes official verified semester results to student self-service portals, generates digital grade sheets, and dispatches SMS alerts.
                  </p>
                </div>
              </div>
              <Badge variant={isResultPublished ? "success" : "warning"} size="md">
                {isResultPublished ? "RESULTS PUBLISHED & SEALED" : "DRAFT STATE"}
              </Badge>
            </div>

            <div className="p-4 bg-surface rounded-xl border border-border space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-text-muted">Target Term:</span> <strong className="text-text">Fall 2026 Semester</strong></div>
              <div className="flex justify-between"><span className="text-text-muted">Total Tabulated Candidates:</span> <strong className="font-mono text-text">1,120 Students</strong></div>
              <div className="flex justify-between"><span className="text-text-muted">SHA-256 Ledger Digest:</span> <strong className="font-mono text-gold">e8b39a4f21d994cc81ae7b29ff01cd20</strong></div>
              <div className="flex justify-between"><span className="text-text-muted">Controller of Examinations Seal:</span> <strong className="text-emerald-600">Prof. Dr. A. K. Azad (Multi-Sig Cryptographic Seal Verified)</strong></div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                leftIcon={<Printer size={15} />}
                onClick={() => alert("Printing official Registrar Grade Tabulation Ledger...")}
              >
                Print Official Gazette
              </Button>
              <Button
                variant="gold"
                leftIcon={<Send size={15} />}
                onClick={() => {
                  setIsResultPublished(true);
                  setSuccessMsg("Fall 2026 results officially published! SMS notifications dispatched to 1,120 students and guardians.");
                  setTimeout(() => setSuccessMsg(""), 4500);
                }}
              >
                1-Click Cryptographic Publish &amp; SMS Broadcast
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Re-Scrutiny & Appeals */}
      {activeTab === "rescrutiny" && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <AlertOctagon size={16} className="text-gold" />
                Grade Re-Scrutiny &amp; Re-Evaluation Appeals Desk
              </h3>
              <p className="text-xs text-text-muted">
                Statutory 14-day window for student examination re-check appeals with Head Examiner script recount.
              </p>
            </div>
            <Badge variant="gold" size="sm">BDT ৳500 / Paper Fee</Badge>
          </div>

          <div className="divide-y divide-border bg-surface border border-border rounded-2xl overflow-hidden">
            {mockRescrutinyAppeals.map((rev) => (
              <div key={rev.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-muted/30 transition-colors">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gold">{rev.id}</span>
                    <span className="font-bold text-text">{rev.studentName} ({rev.studentId})</span>
                  </div>
                  <p className="text-xs text-text-muted">
                    Appealed Course: <strong className="text-text">{rev.courseCode}</strong> • Original Score: <strong className="font-mono text-text">{rev.originalMarks}%</strong> ({rev.publishedGrade})
                  </p>
                  {rev.revisedMarks && (
                    <p className="text-xs text-emerald-600 font-semibold">
                      ✓ Head Examiner Recount: Revised to {rev.revisedMarks}% ({rev.revisedGrade})
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={rev.status === "MARKS_AMENDED" ? "success" : "warning"} size="sm">
                    {rev.status.replace(/_/g, " ")}
                  </Badge>
                  {rev.status === "UNDER_HEAD_EXAMINER_REVIEW" && (
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => {
                        rev.status = "MARKS_AMENDED";
                        rev.revisedMarks = rev.originalMarks + 6;
                        rev.revisedGrade = "B- (2.75)";
                        setSuccessMsg(`Marks amended for ${rev.studentName}. Grade updated to B-.`);
                        setTimeout(() => setSuccessMsg(""), 3500);
                      }}
                    >
                      Authorize Amendment
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 8: Locked Question Bank & Moderation Board */}
      {activeTab === "question-bank" && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <Lock size={16} className="text-gold" />
                Locked Question Paper Bank &amp; Moderation Board
              </h3>
              <p className="text-xs text-text-muted">
                Bloom&apos;s Taxonomy topic blueprint (Recall, Application, Problem Solving) with cryptographic committee signing and 1-click randomized paper synthesizer.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="gold" size="sm">SHA-256 VAULT SEALED</Badge>
              <Button
                variant="gold"
                size="sm"
                leftIcon={<Sparkles size={14} />}
                onClick={() => {
                  setSuccessMsg("Randomized balanced exam paper synthesized with 30% Recall, 40% Clinical Application, and 30% Problem Solving.");
                  setTimeout(() => setSuccessMsg(""), 5000);
                }}
              >
                Synthesize Balanced Paper
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card orientation="vertical" padding="md">
              <span className="text-xs font-semibold text-text-muted uppercase">Topic Blueprint Breakdown</span>
              <div className="mt-2 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span>Recall / Knowledge:</span>
                  <strong className="font-mono text-text">30% (30 Marks)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Clinical Application:</span>
                  <strong className="font-mono text-emerald-600">40% (40 Marks)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Problem Solving:</span>
                  <strong className="font-mono text-gold">30% (30 Marks)</strong>
                </div>
              </div>
            </Card>

            <Card orientation="vertical" padding="md">
              <span className="text-xs font-semibold text-text-muted uppercase">Vault Status</span>
              <div className="mt-2 text-xl font-bold font-mono text-emerald-600">
                128 Questions
              </div>
              <span className="text-xs text-text-muted mt-1 block">Across Anatomy, Physio, Biochem &amp; CSE</span>
            </Card>

            <Card orientation="vertical" padding="md">
              <span className="text-xs font-semibold text-text-muted uppercase">Moderation Committee</span>
              <div className="mt-2 text-xs font-bold text-text">
                ✓ Sealed by 3 Senior Examiners
              </div>
              <span className="text-[11px] font-mono text-text-muted mt-1 block">Hash: a8f9...4c21</span>
            </Card>
          </div>

          <div className="divide-y divide-border bg-surface border border-border rounded-2xl overflow-hidden">
            {mockQuestionPool.map((q) => (
              <div key={q.id} className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-surface-muted/30 transition-colors">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gold">{q.id}</span>
                    <Badge variant="primary" size="sm">{q.courseCode}</Badge>
                    <span className="text-xs font-bold text-text">{q.topic}</span>
                  </div>
                  <p className="text-xs text-text leading-relaxed font-body">
                    {q.questionText}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    Author: {q.authorFaculty} • Marks: <strong className="font-mono text-text">{q.marks}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={q.cognitiveLevel === "Clinical Application" ? "success" : q.cognitiveLevel === "Problem Solving" ? "gold" : "primary"} size="sm">
                    {q.cognitiveLevel}
                  </Badge>
                  <Badge variant="gold" size="sm">
                    {q.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Double Blind Marking Tab */}
      {activeTab === "double-blind" && <DoubleBlindMarkingPanel />}

      {/* Duty Swaps Tab */}
      {activeTab === "duty-swaps" && <FacultyDutySwapPanel />}

      {/* Medical Make-Up Exams Tab */}
      {activeTab === "makeup-exams" && <MakeUpExamPanel />}

      {/* Head Examiner Arbitration Modal */}
      <Modal
        isOpen={!!resolvingScript}
        onClose={() => setResolvingScript(null)}
        title="Head Examiner (E3) Arbitration"
        subtitle={`Resolving evaluation discrepancy for script ${resolvingScript?.scriptBarcode}`}
        size="md"
      >
        {resolvingScript && (
          <div className="space-y-4">
            <div className="p-3 bg-surface-muted rounded-xl border border-border space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Student:</span>
                <strong>{resolvingScript.studentName} ({resolvingScript.rollNo})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Course:</span>
                <strong>{resolvingScript.courseCode}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Examiner 1:</span>
                <span className="font-mono font-bold text-text">{resolvingScript.examiner1Score}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Examiner 2:</span>
                <span className="font-mono font-bold text-text">{resolvingScript.examiner2Score}%</span>
              </div>
              <div className="flex justify-between text-danger font-bold">
                <span>Discrepancy (Δ):</span>
                <span>{resolvingScript.delta}%</span>
              </div>
            </div>

            <FormField label="Head Examiner Final Marks (%)" required>
              <Input
                type="number"
                value={examiner3Input}
                onChange={(e) => setExaminer3Input(Number(e.target.value))}
                min={0}
                max={100}
                required
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setResolvingScript(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="gold"
                onClick={handleResolveArbitration}
                leftIcon={<CheckCircle2 size={14} />}
              >
                Finalize &amp; Seal Grade
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Exam Modal */}
      <Modal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        title="Schedule Examination Paper"
        subtitle="Configure examination code, date, duration, and hall allocation"
        size="md"
      >
        <form onSubmit={handleCreateExam} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Course Code" required>
              <Input
                value={newExam.code}
                onChange={(e) => setNewExam({ ...newExam, code: e.target.value })}
                placeholder="e.g. CSE110"
                className="font-mono uppercase"
                required
              />
            </FormField>
            <FormField label="Duration" required>
              <Input
                value={newExam.duration}
                onChange={(e) => setNewExam({ ...newExam, duration: e.target.value })}
                placeholder="e.g. 3 hours"
                required
              />
            </FormField>
          </div>

          <FormField label="Examination Title" required>
            <Input
              value={newExam.title}
              onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
              placeholder="e.g. Semester Final Examination — Programming Language I"
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Examination Date" required>
              <Input
                type="date"
                value={newExam.date}
                onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Examination Hall / Room" required>
              <Input
                value={newExam.room}
                onChange={(e) => setNewExam({ ...newExam, room: e.target.value })}
                placeholder="e.g. Auditorium Hall 1"
                required
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsExamModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              disabled={createExamMutation.isPending}
              leftIcon={<FileSpreadsheet size={14} />}
            >
              {createExamMutation.isPending ? "Scheduling..." : "Publish Timetable"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
