"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import {
  ClipboardList,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  Award,
  ShieldCheck,
  Sparkles,
  BarChart3,
  TrendingUp,
  Sliders,
  Lock,
  Unlock,
  AlertTriangle,
  FileCheck,
  FileText,
  Printer,
  Download,
  Users,
  Building2,
  BookOpen,
  Filter,
  Check,
  Search,
  Eye,
  Layers,
  ArrowRightLeft,
  Share2,
  GraduationCap,
  Activity
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
  Tabs,
} from "@/components/ui";
import { ProgressBar } from "@/components/ui/ProgressBar";

type GradeTab = "mark-entry" | "obe-attainment" | "exam-moderation" | "crypto-freeze";

export default function GradesPage() {
  const { user } = useAuthStore();
  const { can, roleIs } = usePermission();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<GradeTab>("mark-entry");
  const [selectedSemester, setSelectedSemester] = useState("Fall 2026");
  const [selectedCourseSection, setSelectedCourseSection] = useState("CSE-411_SEC_01");
  const [gradeSearchQuery, setGradeSearchQuery] = useState("");
  const [isCurveModalOpen, setIsCurveModalOpen] = useState(false);
  const [curveAmount, setCurveAmount] = useState(2.5);
  const [successMsg, setSuccessMsg] = useState("");
  const [isFrozen, setIsFrozen] = useState(false);

  // Mock Students Marks Roster for CSE-411 Sec 01
  const [studentMarks, setStudentMarks] = useState([
    {
      id: "STU-2024-0089",
      name: "Ayesha Siddiqua",
      attendance: 96,
      quizAvg: 14.5, // out of 15
      assignAvg: 14.0, // out of 15
      midterm: 24.5, // out of 25
      finalExam: 33.5, // out of 35
      labContinuous: 9.5, // out of 10
      totalScore: 96.0,
      grade: "A+",
      gpa: 4.00,
      clo1: 95,
      clo2: 98,
      clo3: 94,
      clo4: 97
    },
    {
      id: "STU-2024-0104",
      name: "Rahim Al-Mansoor",
      attendance: 92,
      quizAvg: 13.0,
      assignAvg: 13.5,
      midterm: 22.0,
      finalExam: 31.0,
      labContinuous: 9.0,
      totalScore: 88.5,
      grade: "A",
      gpa: 3.75,
      clo1: 88,
      clo2: 90,
      clo3: 86,
      clo4: 90
    },
    {
      id: "STU-2024-0142",
      name: "Tahmina Chowdhury",
      attendance: 98,
      quizAvg: 14.0,
      assignAvg: 14.5,
      midterm: 23.5,
      finalExam: 32.5,
      labContinuous: 9.5,
      totalScore: 94.0,
      grade: "A+",
      gpa: 4.00,
      clo1: 92,
      clo2: 95,
      clo3: 94,
      clo4: 95
    },
    {
      id: "STU-2024-0155",
      name: "Zubair Hossain",
      attendance: 88,
      quizAvg: 11.5,
      assignAvg: 12.0,
      midterm: 19.5,
      finalExam: 27.0,
      labContinuous: 8.0,
      totalScore: 78.0,
      grade: "B+",
      gpa: 3.25,
      clo1: 76,
      clo2: 80,
      clo3: 78,
      clo4: 78
    },
    {
      id: "STU-2024-0188",
      name: "Nafisa Kamal",
      attendance: 94,
      quizAvg: 13.0,
      assignAvg: 13.0,
      midterm: 21.5,
      finalExam: 30.0,
      labContinuous: 8.5,
      totalScore: 86.0,
      grade: "A",
      gpa: 3.75,
      clo1: 85,
      clo2: 88,
      clo3: 84,
      clo4: 87
    },
    {
      id: "STU-2024-0210",
      name: "Shariar Kabir",
      attendance: 86,
      quizAvg: 10.5,
      assignAvg: 11.0,
      midterm: 17.5,
      finalExam: 25.0,
      labContinuous: 7.5,
      totalScore: 71.5,
      grade: "B",
      gpa: 3.00,
      clo1: 70,
      clo2: 74,
      clo3: 72,
      clo4: 70
    },
    {
      id: "STU-2024-0231",
      name: "Fariha Tasnim",
      attendance: 100,
      quizAvg: 15.0,
      assignAvg: 15.0,
      midterm: 25.0,
      finalExam: 34.5,
      labContinuous: 10.0,
      totalScore: 99.5,
      grade: "A+",
      gpa: 4.00,
      clo1: 100,
      clo2: 99,
      clo3: 99,
      clo4: 100
    },
    {
      id: "STU-2024-0264",
      name: "Mehedi Hasan",
      attendance: 90,
      quizAvg: 12.0,
      assignAvg: 12.5,
      midterm: 20.0,
      finalExam: 28.5,
      labContinuous: 8.5,
      totalScore: 81.5,
      grade: "A-",
      gpa: 3.50,
      clo1: 80,
      clo2: 84,
      clo3: 82,
      clo4: 80
    }
  ]);

  // Statistics calculation
  const stats = useMemo(() => {
    const scores = studentMarks.map((s) => s.totalScore);
    const mean = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (scores.length || 1);
    const stdDev = Math.sqrt(variance);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passCount = scores.filter((s) => s >= 50).length;
    const passRate = Math.round((passCount / scores.length) * 100);

    return {
      mean: mean.toFixed(1),
      stdDev: stdDev.toFixed(1),
      highest: highest.toFixed(1),
      lowest: lowest.toFixed(1),
      passRate,
      count: scores.length
    };
  }, [studentMarks]);

  // OBE Attainment Thresholds
  const obeAttainments = [
    {
      clo: "CLO-1",
      title: "Evaluate Distributed Consensus & CAP Theorem",
      bloomLevel: "Level 5: Synthesis / Evaluation",
      ploTarget: "PLO-1 (Engineering Knowledge)",
      targetScore: 60,
      cohortAttainmentPercent: 88.5,
      status: "COMPLIANT"
    },
    {
      clo: "CLO-2",
      title: "Implement Fault-Tolerant Microservices & Raft Node",
      bloomLevel: "Level 6: Design / Creation",
      ploTarget: "PLO-3 (Design & Development)",
      targetScore: 60,
      cohortAttainmentPercent: 91.2,
      status: "COMPLIANT"
    },
    {
      clo: "CLO-3",
      title: "Analyze Latency, Partition Tolerances & WASM Kernels",
      bloomLevel: "Level 4: Critical Analysis",
      ploTarget: "PLO-2 (Problem Analysis)",
      targetScore: 60,
      cohortAttainmentPercent: 86.0,
      status: "COMPLIANT"
    },
    {
      clo: "CLO-4",
      title: "Demonstrate Professional Ethics & Code Provenance",
      bloomLevel: "Level 3: Application",
      ploTarget: "PLO-8 (Ethics & Responsibility)",
      targetScore: 60,
      cohortAttainmentPercent: 89.0,
      status: "COMPLIANT"
    }
  ];

  // Moderation Review Items
  const moderationQueue = [
    {
      id: "MOD-2026-088",
      courseCode: "CSE-411",
      courseTitle: "Distributed Systems & Cloud Systems",
      section: "Sec 01",
      instructor: "Prof. Dr. Aris Thorne",
      studentsCount: 35,
      meanScore: 86.8,
      deviation: "+3.2% vs Dept Mean",
      varianceFlag: "NORMAL",
      status: "APPROVED_BY_COMMITTEE",
      signOffBy: "Prof. Dr. Jamal Uddin (External Chair, Moderation Board)"
    },
    {
      id: "MOD-2026-092",
      courseCode: "BMED-402",
      courseTitle: "Advanced Hemodynamics & Bioengineering",
      section: "Sec 01",
      instructor: "Assoc. Prof. Dr. Farzana Rahman",
      studentsCount: 29,
      meanScore: 84.1,
      deviation: "+1.8% vs Dept Mean",
      varianceFlag: "NORMAL",
      status: "APPROVED_BY_COMMITTEE",
      signOffBy: "Prof. Dr. S. K. Roy (Internal Examiner)"
    },
    {
      id: "MOD-2026-104",
      courseCode: "CSE-221",
      courseTitle: "Algorithms & Complex Networks",
      section: "Sec 03",
      instructor: "Dr. Kazi Mahfuzur Rahman",
      studentsCount: 42,
      meanScore: 64.2,
      deviation: "-16.5% vs Historical Mean",
      varianceFlag: "OUTLIER_FLAGGED",
      status: "PENDING_RE_EVALUATION",
      signOffBy: "Awaiting Committee Scrutiny"
    }
  ];

  const handleApplyCurve = () => {
    setStudentMarks((prev) =>
      prev.map((stu) => {
        const newScore = Math.min(100, stu.totalScore + curveAmount);
        let newGrade = stu.grade;
        let newGpa = stu.gpa;
        if (newScore >= 90) { newGrade = "A+"; newGpa = 4.00; }
        else if (newScore >= 85) { newGrade = "A"; newGpa = 3.75; }
        else if (newScore >= 80) { newGrade = "A-"; newGpa = 3.50; }
        else if (newScore >= 75) { newGrade = "B+"; newGpa = 3.25; }
        else if (newScore >= 70) { newGrade = "B"; newGpa = 3.00; }
        else if (newScore >= 65) { newGrade = "B-"; newGpa = 2.75; }
        else if (newScore >= 60) { newGrade = "C+"; newGpa = 2.50; }
        else if (newScore >= 50) { newGrade = "C"; newGpa = 2.00; }
        else { newGrade = "F"; newGpa = 0.00; }

        return {
          ...stu,
          totalScore: parseFloat(newScore.toFixed(1)),
          grade: newGrade,
          gpa: newGpa
        };
      })
    );
    setIsCurveModalOpen(false);
    setSuccessMsg(`Applied standard curve of +${curveAmount} marks to all enrolled students.`);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handleFreezeGrades = () => {
    setIsFrozen(true);
    setSuccessMsg("Batch SHA-256 seal executed. Grades permanently frozen and pushed to Official Transcripts.");
    setTimeout(() => setSuccessMsg(""), 4500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Academic Grade & Outcome-Based Education (OBE) Suite"
        subtitle="Continuous marks entry, statistical curve normalization, Bloom's taxonomy CLO/PLO attainment, and cryptographic grade seals."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setIsCurveModalOpen(true)}
              disabled={isFrozen}
            >
              <Sliders size={14} className="text-gold" />
              Standardize / Curve Marks
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => window.print()}
            >
              <Printer size={14} />
              Export Grade Sheet (PDF)
            </Button>
            {roleIs("super-admin", "domain-admin", "faculty") && (
              <Button
                variant={isFrozen ? "outline" : "primary"}
                size="sm"
                className="gap-1.5"
                onClick={handleFreezeGrades}
                disabled={isFrozen}
              >
                {isFrozen ? <Lock size={14} className="text-success" /> : <ShieldCheck size={14} />}
                {isFrozen ? "Grades Cryptographically Frozen" : "Freeze & Seal Grades"}
              </Button>
            )}
          </div>
        }
      />

      {/* CORE NAVIGATION TABS */}
      <Tabs
        value={activeTab}
        onChange={(val) => setActiveTab(val as GradeTab)}
        items={[
          {
            id: "mark-entry",
            label: "Continuous Mark Entry & Curve",
            icon: <ClipboardList size={14} />,
            count: studentMarks.length,
          },
          {
            id: "obe-attainment",
            label: "OBE Bloom's Attainment Radar",
            icon: <BarChart3 size={14} />,
            count: obeAttainments.length,
          },
          {
            id: "exam-moderation",
            label: "Exam Moderation Board",
            icon: <FileCheck size={14} />,
            count: moderationQueue.length,
          },
          {
            id: "crypto-freeze",
            label: "Cryptographic Seal & Transcripts",
            icon: <ShieldCheck size={14} />,
          },
        ]}
      />

      {/* TAB 1: CONTINUOUS MARK ENTRY & CURVE */}
      {activeTab === "mark-entry" && (
        <div className="space-y-6 animate-fade-in">
          {/* Statistical Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card pad="md" className="border-border">
              <div className="text-xs text-text-muted">Section Class Mean (μ)</div>
              <div className="text-xl font-bold font-display text-text mt-1">{stats.mean} / 100</div>
              <div className="text-[11px] text-primary font-medium mt-1">Normal Distribution</div>
            </Card>
            <Card pad="md" className="border-border">
              <div className="text-xs text-text-muted">Standard Deviation (σ)</div>
              <div className="text-xl font-bold font-display text-gold mt-1">± {stats.stdDev}</div>
              <div className="text-[11px] text-text-muted mt-1">Acceptable Spread</div>
            </Card>
            <Card pad="md" className="border-border">
              <div className="text-xs text-text-muted">Highest & Lowest Mark</div>
              <div className="text-xl font-bold font-display text-text mt-1">{stats.highest} / {stats.lowest}</div>
              <div className="text-[11px] text-text-muted mt-1">Spread Delta: {(parseFloat(stats.highest) - parseFloat(stats.lowest)).toFixed(1)}</div>
            </Card>
            <Card pad="md" className="border-border">
              <div className="text-xs text-text-muted">Passing Rate</div>
              <div className="text-xl font-bold font-display text-success mt-1">{stats.passRate}%</div>
              <div className="text-[11px] text-success font-medium mt-1">ABET / UGC Compliant</div>
            </Card>
            <Card pad="md" className="border-border">
              <div className="text-xs text-text-muted">Ledger State</div>
              <div className="text-lg font-bold font-display text-text mt-1 flex items-center gap-1.5">
                {isFrozen ? (
                  <>
                    <Lock size={16} className="text-success" />
                    <span className="text-success text-sm">Frozen (SHA-256)</span>
                  </>
                ) : (
                  <>
                    <Unlock size={16} className="text-gold" />
                    <span className="text-gold text-sm">Editable Draft</span>
                  </>
                )}
              </div>
              <div className="text-[11px] text-text-muted mt-1">Fall 2026 Cohort</div>
            </Card>
          </div>

          {/* Table Controls */}
          <Card pad="md" className="border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div>
                  <label className="text-[11px] font-semibold text-text-muted block mb-1">Course & Section</label>
                  <select
                    value={selectedCourseSection}
                    onChange={(e) => setSelectedCourseSection(e.target.value)}
                    className="text-xs bg-background border border-border rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:border-gold"
                  >
                    <option value="CSE-411_SEC_01">CSE-411: Distributed Systems (Sec 01)</option>
                    <option value="BMED-402_SEC_01">BMED-402: Advanced Hemodynamics (Sec 01)</option>
                    <option value="CSE-423_SEC_02">CSE-423: Machine Learning (Sec 02)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-text-muted block mb-1">Weightage Breakdown</label>
                  <span className="text-xs font-mono font-semibold text-primary bg-primary-soft px-2 py-1 rounded">
                    Quiz 15% • Asg 15% • Mid 25% • Final 35% • Lab 10%
                  </span>
                </div>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Filter student or ID..."
                  value={gradeSearchQuery}
                  onChange={(e) => setGradeSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:border-gold focus:outline-none w-48 sm:w-56"
                />
              </div>
            </div>
          </Card>

          {/* Student Marks Table */}
          <Card pad="none" className="border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/60 text-text-muted uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-3 px-4">Student Scholar</th>
                    <th className="py-3 px-3 text-center">Attd (100%)</th>
                    <th className="py-3 px-3 text-center">Quiz (15)</th>
                    <th className="py-3 px-3 text-center">Assign (15)</th>
                    <th className="py-3 px-3 text-center">Midterm (25)</th>
                    <th className="py-3 px-3 text-center">Final (35)</th>
                    <th className="py-3 px-3 text-center">Lab (10)</th>
                    <th className="py-3 px-4 text-center">Total (100)</th>
                    <th className="py-3 px-3 text-center">Grade</th>
                    <th className="py-3 px-3 text-center">GPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {studentMarks
                    .filter((s) =>
                      s.name.toLowerCase().includes(gradeSearchQuery.toLowerCase()) ||
                      s.id.toLowerCase().includes(gradeSearchQuery.toLowerCase())
                    )
                    .map((stu) => (
                      <tr key={stu.id} className="hover:bg-surface-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-text block">{stu.name}</span>
                          <span className="text-[10px] font-mono text-text-muted">{stu.id}</span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono">{stu.attendance}%</td>
                        <td className="py-3 px-3 text-center font-mono">{stu.quizAvg.toFixed(1)}</td>
                        <td className="py-3 px-3 text-center font-mono">{stu.assignAvg.toFixed(1)}</td>
                        <td className="py-3 px-3 text-center font-mono font-medium text-text">{stu.midterm.toFixed(1)}</td>
                        <td className="py-3 px-3 text-center font-mono font-medium text-text">{stu.finalExam.toFixed(1)}</td>
                        <td className="py-3 px-3 text-center font-mono">{stu.labContinuous.toFixed(1)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-mono font-bold text-sm text-text bg-surface-muted px-2 py-0.5 rounded">
                            {stu.totalScore.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge
                            tone={stu.grade.startsWith("A") ? "gold" : stu.grade.startsWith("B") ? "primary" : "neutral"}
                            className="text-xs font-bold font-mono"
                          >
                            {stu.grade}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-text">
                          {stu.gpa.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: OBE BLOOM'S ATTAINMENT RADAR */}
      {activeTab === "obe-attainment" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card */}
          <Card pad="lg" className="border-border bg-gradient-to-r from-surface to-surface-muted">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-primary-soft text-primary">
                  ABET / BAETE Accreditation Framework
                </span>
                <h3 className="text-lg font-bold font-display text-text mt-1">
                  Course Learning Outcomes (CLO) & Bloom&apos;s Taxonomy Attainment
                </h3>
                <p className="text-xs text-text-muted mt-1 max-w-2xl">
                  Evaluates cohort performance thresholds across cognitive domains (Recall, Application, Analysis, Synthesis). Benchmark requirement: $\ge 65\%$ of enrolled scholars achieving $\ge 60\%$ in designated rubrics.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-center px-4 py-2 rounded-xl bg-surface border border-border">
                  <div className="text-xs text-text-muted">Attainment Benchmark</div>
                  <div className="text-base font-bold text-success font-display">4/4 Passed</div>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-surface border border-border">
                  <div className="text-xs text-text-muted">Cohort Average</div>
                  <div className="text-base font-bold text-primary font-display">88.7%</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Attainment Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {obeAttainments.map((obe) => (
              <Card key={obe.clo} pad="md" className="border-border space-y-4 hover:border-gold/40 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge tone="primary" className="text-xs font-mono font-bold">{obe.clo}</Badge>
                      <span className="text-xs font-mono text-gold font-semibold">{obe.ploTarget}</span>
                    </div>
                    <h4 className="text-sm font-bold text-text font-display mt-1.5">{obe.title}</h4>
                    <p className="text-xs text-text-muted mt-0.5">{obe.bloomLevel}</p>
                  </div>

                  <Badge tone="success" className="text-xs font-bold">
                    {obe.status}
                  </Badge>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">Cohort Attainment vs 60% Benchmark</span>
                    <span className="font-mono font-bold text-text">{obe.cohortAttainmentPercent}%</span>
                  </div>
                  <ProgressBar
                    value={obe.cohortAttainmentPercent}
                    variant="success"
                  />
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-text-muted">
                  <span>Continuous Quality Improvement (CQI):</span>
                  <span className="text-success font-semibold">Exceeds Target (No Remediation Required)</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EXAM MODERATION BOARD */}
      {activeTab === "exam-moderation" && (
        <div className="space-y-6 animate-fade-in">
          {/* Overview */}
          <Card pad="lg" className="border-border bg-gradient-to-r from-surface to-surface-muted">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-gold-soft text-gold">
                  Statutory Academic Governance
                </span>
                <h3 className="text-lg font-bold font-display text-text mt-1">
                  Department Examination Moderation Board
                </h3>
                <p className="text-xs text-text-muted mt-1 max-w-2xl">
                  2-tier blind moderation committee review. Flags sections exhibiting outlier variances ($&gt; 15\%$), abnormal bell-curve skews, or grading discrepancies before final seal.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    setSuccessMsg("Scrutiny audit complete. 2 sections cleared for Controller seal.");
                    setTimeout(() => setSuccessMsg(""), 3500);
                  }}
                >
                  <Sparkles size={14} /> Run Variance Scrutiny
                </Button>
              </div>
            </div>
          </Card>

          {/* Moderation Items */}
          <div className="space-y-4">
            {moderationQueue.map((item) => (
              <Card
                key={item.id}
                pad="md"
                className={`border transition-all ${
                  item.varianceFlag === "OUTLIER_FLAGGED"
                    ? "border-warning/50 bg-warning-soft/10"
                    : "border-border hover:border-gold/40"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        tone={item.status === "APPROVED_BY_COMMITTEE" ? "success" : "warning"}
                        className="text-[10px] font-bold"
                      >
                        {item.status.replace(/_/g, " ")}
                      </Badge>
                      <span className="font-mono font-bold text-xs text-text">{item.courseCode} ({item.section})</span>
                      <span className="text-xs font-semibold text-text font-display">• {item.courseTitle}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-surface p-2 rounded-xl border border-border">
                      <div>
                        <span className="text-text-muted block text-[11px]">Assigned Faculty</span>
                        <span className="font-medium text-text">{item.instructor}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block text-[11px]">Enrolled Cohort</span>
                        <span className="font-medium text-text">{item.studentsCount} Students</span>
                      </div>
                      <div>
                        <span className="text-text-muted block text-[11px]">Section Mean</span>
                        <span className="font-mono font-bold text-text">{item.meanScore} / 100</span>
                      </div>
                      <div>
                        <span className="text-text-muted block text-[11px]">Deviation</span>
                        <span className={`font-mono font-bold ${item.varianceFlag === "OUTLIER_FLAGGED" ? "text-danger" : "text-success"}`}>
                          {item.deviation}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-text-muted">
                      <span className="font-semibold text-text">Moderation Sign-off:</span> {item.signOffBy}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5"
                      onClick={() => {
                        setSuccessMsg(`Endorsed moderation sheet for ${item.courseCode}`);
                        setTimeout(() => setSuccessMsg(""), 3500);
                      }}
                    >
                      <Check size={13} /> Endorse Sheet
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CRYPTOGRAPHIC GRADE FREEZE & CONTROLLER LEDGER */}
      {activeTab === "crypto-freeze" && (
        <div className="space-y-6 animate-fade-in">
          <Card pad="lg" className="border-border space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-success-soft text-success">
                  Immutable Cryptographic Ledger
                </span>
                <h3 className="text-lg font-bold font-display text-text mt-1">
                  Official Grade Seal & Transcript Push Daemon
                </h3>
                <p className="text-xs text-text-muted mt-1 max-w-2xl">
                  Once sealed, grades cannot be modified without formal Academic Council authorization. Generates verifiable SHA-256 batch proof and automatically synchronizes with student degree audits and transcript printing engines.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-surface-muted/60 border border-border">
                <ShieldCheck size={32} className={isFrozen ? "text-success" : "text-gold"} />
              </div>
            </div>

            {/* Cryptographic Ledger Details */}
            <div className="p-4 rounded-xl bg-surface-muted/40 border border-border/80 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-text-muted">Batch Seal Status:</span>
                <span className={`font-bold ${isFrozen ? "text-success" : "text-gold"}`}>
                  {isFrozen ? "LOCKED & VERIFIED (IMMUTABLE)" : "PENDING CONTROLLER AUTHORIZATION"}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-text-muted">SHA-256 Batch Digest:</span>
                <span className="text-text truncate max-w-md font-semibold">
                  {isFrozen
                    ? "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                    : "0x0000000000000000000000000000000000000000000000000000000000000000 (Unsealed)"}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-text-muted">Controller Digital Signature:</span>
                <span className="text-primary font-semibold">
                  {isFrozen ? "CONTROLLER_EXAMS_DR_M_A_KHAN_VERIFIED" : "Awaiting Authorization"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Auto-Push Synchronization:</span>
                <span className="text-text">Official Transcripts, Degree Audit & Student Portal</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  setSuccessMsg("Audit trail exported for Academic Council archive.");
                  setTimeout(() => setSuccessMsg(""), 3500);
                }}
              >
                <Download size={14} />
                Download Seal Certificate (.pem)
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5"
                onClick={handleFreezeGrades}
                disabled={isFrozen}
              >
                <Lock size={14} />
                {isFrozen ? "Seal Already Verified" : "Execute Cryptographic Seal"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Curve Marks Modal */}
      {isCurveModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <Card pad="lg" className="w-full max-w-md bg-surface border-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold font-display text-text flex items-center gap-2">
                <Sliders size={16} className="text-gold" />
                Statistical Curve Normalization
              </h3>
              <button
                onClick={() => setIsCurveModalOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface-muted"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-text-muted">
                Adjust section distribution curve uniformly across all enrolled students in <span className="font-semibold text-text">{selectedCourseSection}</span>.
              </p>

              <div>
                <label className="font-semibold text-text block mb-1">Standard Linear Curve Adjustment (Marks):</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={curveAmount}
                    onChange={(e) => setCurveAmount(parseFloat(e.target.value))}
                    className="w-full accent-gold"
                  />
                  <span className="font-mono font-bold text-sm text-gold w-12 text-right">
                    +{curveAmount}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-muted/60 border border-border/80 space-y-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Projected Mean (μ):</span>
                  <span className="font-mono font-bold text-text">
                    {(parseFloat(stats.mean) + curveAmount).toFixed(1)} / 100
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Maximum Cap:</span>
                  <span className="text-text">Hard capped at 100.0 (No overflow)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCurveModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApplyCurve}
              >
                Apply Normalization
              </Button>
            </div>
          </Card>
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
