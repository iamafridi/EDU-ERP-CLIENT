"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, CheckCircle2, Plus, Upload, X, FileSpreadsheet, BookOpen, Users, Award, Edit2, Trash2 } from "lucide-react";

interface Exam {
  id: string;
  code: string;
  title: string;
  date: string;
  duration: string;
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

const ASSESSMENT_TYPES = ["quiz", "assignment", "sessional", "viva"];

export default function ExamsGradesPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"exams" | "grades" | "assessments">("exams");
  const [assessSubTab, setAssessSubTab] = useState<"list" | "scores" | "gradebook">("list");
  const [successMsg, setSuccessMsg] = useState("");
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isAssessModalOpen, setIsAssessModalOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [newExam, setNewExam] = useState({ code: "", title: "", date: "", duration: "3 hours" });
  const [newGrade, setNewGrade] = useState({ studentId: "", studentName: "", examId: "", examTitle: "", grade: "A", score: 0 });
  const [newAssessment, setNewAssessment] = useState({ course: "", title: "", type: "quiz", maxMarks: 100, weightage: 20, date: "" });
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [bulkScores, setBulkScores] = useState<{ student: string; marksObtained: number }[]>([]);

  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [deleteExamId, setDeleteExamId] = useState<string | null>(null);
  const [editGrade, setEditGrade] = useState<Grade | null>(null);
  const [deleteGradeId, setDeleteGradeId] = useState<string | null>(null);
  const [editGradeForm, setEditGradeForm] = useState({ grade: "", score: 0 });
  const [editExamForm, setEditExamForm] = useState({ title: "", date: "", duration: "" });
  const [editAssessment, setEditAssessment] = useState<any>(null);
  const [editAssessmentForm, setEditAssessmentForm] = useState({ title: "", type: "quiz", maxMarks: 100, weightage: 20, date: "" });
  const [deleteAssessmentId, setDeleteAssessmentId] = useState<string | null>(null);

  const isAdminOrPrincipal = roleIs("super-admin", "domain-admin");
  const isFacultyOrAbove = roleIs("super-admin", "domain-admin", "faculty");

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

  const { data: assessmentScores = [], isLoading: loadingScores } = useQuery({
    queryKey: ["assessmentScores"],
    queryFn: api.getAssessmentScores,
  });

  const { data: gradeBooks = [], isLoading: loadingGB } = useQuery({
    queryKey: ["gradeBooks"],
    queryFn: api.getGradeBooks,
  });

  const createExamMutation = useMutation({
    mutationFn: api.createExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      setSuccessMsg("Exam created successfully.");
      setIsExamModalOpen(false);
      setNewExam({ code: "", title: "", date: "", duration: "3 hours" });
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateExamMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateExam(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      setSuccessMsg("Exam updated.");
      setEditExam(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteExamMutation = useMutation({
    mutationFn: api.deleteExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      setSuccessMsg("Exam deleted.");
      setDeleteExamId(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const createGradeMutation = useMutation({
    mutationFn: api.createGrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      setSuccessMsg("Grade recorded successfully.");
      setIsGradeModalOpen(false);
      setNewGrade({ studentId: "", studentName: "", examId: "", examTitle: "", grade: "A", score: 0 });
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateGradeMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateGrade(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      setSuccessMsg("Grade updated.");
      setEditGrade(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteGradeMutation = useMutation({
    mutationFn: api.deleteGrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      setSuccessMsg("Grade deleted.");
      setDeleteGradeId(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateAssessmentMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateAssessment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      setSuccessMsg("Assessment updated.");
      setEditAssessment(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteAssessmentMutation = useMutation({
    mutationFn: api.deleteAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      setSuccessMsg("Assessment deleted.");
      setDeleteAssessmentId(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const publishMutation = useMutation({
    mutationFn: ({ courseId, semesterId }: { courseId: string; semesterId: string }) => api.publishResults(courseId, semesterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gradeBooks"] });
      setSuccessMsg("Results published successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const createAssessMutation = useMutation({
    mutationFn: api.createAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      setSuccessMsg("Assessment created.");
      setIsAssessModalOpen(false);
      setNewAssessment({ course: "", title: "", type: "quiz", maxMarks: 100, weightage: 20, date: "" });
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const bulkScoreMutation = useMutation({
    mutationFn: (payload: any) => api.bulkCreateAssessmentScores(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessmentScores"] });
      setSuccessMsg("Scores recorded.");
      setIsScoreModalOpen(false);
      setSelectedAssessment(null);
      setBulkScores([]);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    createExamMutation.mutate(newExam);
  };

  const handleCreateGrade = (e: React.FormEvent) => {
    e.preventDefault();
    createGradeMutation.mutate(newGrade);
  };

  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    createAssessMutation.mutate(newAssessment);
  };

  const openScoreModal = (assessment: any) => {
    setSelectedAssessment(assessment);
    setBulkScores([]);
    setIsScoreModalOpen(true);
  };

  const addBulkScoreRow = () => {
    setBulkScores((prev) => [...prev, { student: "", marksObtained: 0 }]);
  };

  const updateBulkScore = (index: number, field: string, value: any) => {
    setBulkScores((prev) => {
      const updated = [...prev];
      (updated[index] as any)[field] = value;
      return updated;
    });
  };

  const removeBulkScoreRow = (index: number) => {
    setBulkScores((prev) => prev.filter((_, i) => i !== index));
  };

  const submitBulkScores = () => {
    if (!selectedAssessment) return;
    bulkScoreMutation.mutate({
      assessment: selectedAssessment.id,
      scores: bulkScores,
      gradedBy: user?.id || "FAC-001",
    });
  };

  const examColumns: Column<Exam>[] = [
    { header: "Exam Code", accessor: "code", className: "font-mono text-[#2563EB] font-bold" },
    { header: "Exam Title", accessor: "title" },
    { header: "Date", accessor: (row) => <span className="font-mono text-slate-500">{row.date}</span> },
    { header: "Duration", accessor: "duration" },
    ...(isAdminOrPrincipal
      ? [{
          header: "Actions",
          accessor: (row: Exam) => (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setEditExam(row); setEditExamForm({ title: row.title, date: row.date, duration: row.duration }); }}
                className="w-7 h-7 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors flex items-center justify-center"
                title="Edit"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => setDeleteExamId(row.id)}
                className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors flex items-center justify-center"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ),
        } as Column<Exam>]
      : []),
  ];

  const gradeColumns: Column<Grade>[] = [
    { header: "Student Name", accessor: "studentName" },
    { header: "Student ID", accessor: "studentId", className: "font-mono text-slate-500" },
    { header: "Exam", accessor: "examTitle" },
    {
      header: "Grade",
      accessor: (row) => (
        <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${
          row.grade.startsWith("A") ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
          row.grade.startsWith("B") ? "bg-blue-50 text-blue-700 border-blue-100" :
          "bg-amber-50 text-amber-700 border-amber-100"
        }`}>
          {row.grade}
        </span>
      ),
    },
    {
      header: "Score",
      accessor: (row) => <span className="font-mono font-bold text-slate-700">{row.score}%</span>,
    },
    ...(isAdminOrPrincipal
      ? [{
          header: "Actions",
          accessor: (row: Grade) => (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setEditGrade(row); setEditGradeForm({ grade: row.grade, score: row.score }); }}
                className="w-7 h-7 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors flex items-center justify-center"
                title="Edit"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => setDeleteGradeId(row.id)}
                className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors flex items-center justify-center"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ),
        } as Column<Grade>]
      : []),
  ];

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="text-[#2563EB]" />
            Exams & Assessments Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage examinations, internal assessments, scores, and grade books.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdminOrPrincipal && activeTab === "exams" && (
            <button onClick={() => setIsExamModalOpen(true)}
              className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-sm shadow-blue-500/10">
              <Plus size={16} /> Create Exam
            </button>
          )}
          {isAdminOrPrincipal && activeTab === "grades" && (
            <div className="flex items-center gap-2">
              <button onClick={() => setIsGradeModalOpen(true)}
                className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-sm shadow-blue-500/10">
                <Plus size={16} /> Record Grade
              </button>
              <button onClick={() => alert("Bulk upload CSV: please select a CSV file with studentId, examId, grade, score columns.")}
                className="h-10 px-4 bg-white border border-[#c3c6d7] hover:bg-slate-50 text-slate-600 font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2">
                <Upload size={16} /> Bulk Upload
              </button>
            </div>
          )}
          {isFacultyOrAbove && activeTab === "assessments" && assessSubTab === "list" && (
            <button onClick={() => setIsAssessModalOpen(true)}
              className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-sm shadow-blue-500/10">
              <Plus size={16} /> New Assessment
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      <div className="flex border-b border-[#e1e2ed] gap-2">
        <button onClick={() => setActiveTab("exams")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "exams" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}>Exams</button>
        <button onClick={() => setActiveTab("grades")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "grades" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}>Grades</button>
        <button onClick={() => setActiveTab("assessments")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "assessments" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}>Assessments</button>
      </div>

      <div className="bg-white rounded-xl border border-[#e1e2ed] shadow-sm overflow-hidden">
        {activeTab === "exams" ? (
          <div>
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet size={16} /> Scheduled Examinations
              </span>
            </div>
            {isLoadingExams ? <TableSkeleton rows={5} cols={6} /> : (
              <DataTable<Exam> data={exams} columns={examColumns} searchPlaceholder="Search exams by title or code..." searchField="title" />
            )}
          </div>
        ) : activeTab === "grades" ? (
          <div>
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList size={16} /> Grade Records
              </span>
            </div>
            {isLoadingGrades ? <TableSkeleton rows={5} cols={6} /> : (
              <DataTable<Grade> data={grades} columns={gradeColumns} searchPlaceholder="Search by student name..." searchField="studentName" />
            )}
          </div>
        ) : (
          <div>
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={16} /> Internal Assessments
              </span>
            </div>

            <div className="flex border-b border-[#e1e2ed] bg-slate-50/50 px-4 gap-4">
              <button onClick={() => setAssessSubTab("list")}
                className={`py-2 text-xs font-bold tracking-wider border-b-2 transition-all cursor-pointer ${
                  assessSubTab === "list" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-slate-400 hover:text-slate-600"
                }`}>Assessments</button>
              <button onClick={() => setAssessSubTab("scores")}
                className={`py-2 text-xs font-bold tracking-wider border-b-2 transition-all cursor-pointer ${
                  assessSubTab === "scores" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-slate-400 hover:text-slate-600"
                }`}>Scores</button>
              <button onClick={() => setAssessSubTab("gradebook")}
                className={`py-2 text-xs font-bold tracking-wider border-b-2 transition-all cursor-pointer ${
                  assessSubTab === "gradebook" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-slate-400 hover:text-slate-600"
                }`}>Grade Book</button>
            </div>

            {assessSubTab === "list" && (
              <div>
                {loadingAssess ? <TableSkeleton rows={4} cols={6} /> : assessments.length === 0 ? (
                  <p className="p-12 text-center text-xs text-slate-400">No assessments created yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                          <th className="p-3 text-xs font-bold text-slate-400 uppercase">Title</th>
                          <th className="p-3 text-xs font-bold text-slate-400 uppercase">Course</th>
                          <th className="p-3 text-xs font-bold text-slate-400 uppercase">Type</th>
                          <th className="p-3 text-xs font-bold text-slate-400 uppercase">Max Marks</th>
                          <th className="p-3 text-xs font-bold text-slate-400 uppercase">Weightage</th>
                          <th className="p-3 text-xs font-bold text-slate-400 uppercase">Date</th>
                          {isFacultyOrAbove && <th className="p-3 text-xs font-bold text-slate-400 uppercase">Action</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e1e2ed]">
                        {assessments.map((a: any) => (
                          <tr key={a.id} className="hover:bg-slate-50/50 text-xs">
                            <td className="p-3 font-semibold text-slate-700">{a.title}</td>
                            <td className="p-3 text-slate-500">{a.courseTitle || a.course}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded text-[10px] font-semibold">{a.type}</span>
                            </td>
                            <td className="p-3 font-mono text-slate-600">{a.maxMarks}</td>
                            <td className="p-3 font-mono text-slate-600">{a.weightage}%</td>
                            <td className="p-3 font-mono text-slate-500">{a.date}</td>
                            {isFacultyOrAbove && (
                              <td className="p-3">
                                <div className="flex items-center gap-1">
                                  <button onClick={() => openScoreModal(a)}
                                    className="h-7 px-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded text-[10px] transition-colors cursor-pointer flex items-center gap-1 border border-slate-200">
                                    <Users size={11} /> Scores
                                  </button>
                                  {isAdminOrPrincipal && (
                                    <>
                                      <button onClick={() => { setEditAssessment(a); setEditAssessmentForm({ title: a.title, type: a.type, maxMarks: a.maxMarks, weightage: a.weightage, date: a.date }); }}
                                        className="w-7 h-7 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors flex items-center justify-center" title="Edit">
                                        <Edit2 size={13} />
                                      </button>
                                      <button onClick={() => setDeleteAssessmentId(a.id)}
                                        className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors flex items-center justify-center" title="Delete">
                                        <Trash2 size={13} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {assessSubTab === "scores" && (
              <div>
                {loadingScores ? <TableSkeleton rows={4} cols={5} /> : assessmentScores.length === 0 ? (
                  <p className="p-12 text-center text-xs text-slate-400">No scores recorded yet. Select an assessment and enter scores.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                          <th className="p-3 text-xs font-bold text-slate-400 uppercase">Student</th>
                          <th className="p-3 text-xs font-bold text-slate-400 uppercase">Assessment</th>
                          <th className="p-3 text-xs font-bold text-slate-400 uppercase">Marks</th>
                          <th className="p-3 text-xs font-bold text-slate-400 uppercase">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e1e2ed]">
                        {assessmentScores.map((s: any) => (
                          <tr key={s.id} className="hover:bg-slate-50/50 text-xs">
                            <td className="p-3">
                              <span className="font-bold text-slate-700 block">{s.studentName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{s.student}</span>
                            </td>
                            <td className="p-3 text-slate-500">{s.assessment}</td>
                            <td className="p-3 font-mono font-bold text-slate-700">{s.marksObtained}</td>
                            <td className="p-3 text-slate-400 italic">{s.remarks || "\u2014"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {assessSubTab === "gradebook" && (
              <div>
                {isAdminOrPrincipal && (
                  <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-end">
                    <button
                      onClick={() => publishMutation.mutate({ courseId: "", semesterId: "" })}
                      disabled={publishMutation.isPending}
                      className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-[11px] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {publishMutation.isPending ? (
                        <div className="w-3 h-3 rounded-full border-2 border-white/25 border-t-white animate-spin" />
                      ) : (
                        <Award size={13} />
                      )}
                      Publish Results
                    </button>
                  </div>
                )}
                {loadingGB ? <TableSkeleton rows={4} cols={6} /> : gradeBooks.length === 0 ? (
                  <p className="p-12 text-center text-xs text-slate-400">No grade books generated yet. Publish results to generate grade books.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                          <th className="p-3 text-xs font-bold text-slate-400 uppercase">Student</th>
                          <th className="p-3 text-xs font-bold text-slate-400 uppercase">Course</th>
                          <th className="p-3 text-xs font-bold text-slate-400 uppercase">Total %</th>
                          <th className="p-3 text-xs font-bold text-slate-400 uppercase">Grade</th>
                          <th className="p-3 text-xs font-bold text-slate-400 uppercase">GPA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e1e2ed]">
                        {gradeBooks.map((gb: any) => (
                          <tr key={gb.id} className="hover:bg-slate-50/50 text-xs">
                            <td className="p-3">
                              <span className="font-bold text-slate-700 block">{gb.studentName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{gb.student}</span>
                            </td>
                            <td className="p-3 text-slate-500">{gb.courseTitle || gb.course}</td>
                            <td className="p-3 font-mono font-bold text-slate-700">{gb.totalMarks?.toFixed(1)}%</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${
                                gb.grade?.startsWith("A") ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                gb.grade?.startsWith("B") ? "bg-blue-50 text-blue-700 border-blue-100" :
                                gb.grade?.startsWith("C") ? "bg-amber-50 text-amber-700 border-amber-100" :
                                "bg-red-50 text-red-700 border-red-100"
                              }`}>{gb.grade}</span>
                            </td>
                            <td className="p-3 font-mono font-bold text-[#2563EB]">{gb.gpa?.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Exam Modal */}
      <AnimatePresence>{isExamModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Create New Exam</span>
              <button onClick={() => setIsExamModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateExam} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Course Code</label>
                  <input type="text" value={newExam.code} onChange={(e) => setNewExam((p) => ({ ...p, code: e.target.value }))} placeholder="e.g. CS-301" required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Duration</label>
                  <select value={newExam.duration} onChange={(e) => setNewExam((p) => ({ ...p, duration: e.target.value }))} className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                    <option value="1 hour">1 hour</option>
                    <option value="2 hours">2 hours</option>
                    <option value="3 hours">3 hours</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Exam Title</label>
                <input type="text" value={newExam.title} onChange={(e) => setNewExam((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Advanced Database Systems - Midterm" required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Exam Date</label>
                <input type="date" value={newExam.date} onChange={(e) => setNewExam((p) => ({ ...p, date: e.target.value }))} required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                <button type="button" onClick={() => setIsExamModalOpen(false)} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"><Plus size={14} /> Create Exam</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}</AnimatePresence>

      {/* Record Grade Modal */}
      <AnimatePresence>{isGradeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Record Grade</span>
              <button onClick={() => setIsGradeModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateGrade} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Student ID</label>
                  <input type="text" value={newGrade.studentId} onChange={(e) => setNewGrade((p) => ({ ...p, studentId: e.target.value }))} placeholder="e.g. STU-001" required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Student Name</label>
                  <input type="text" value={newGrade.studentName} onChange={(e) => setNewGrade((p) => ({ ...p, studentName: e.target.value }))} placeholder="Full name" required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Exam</label>
                <select value={newGrade.examId} onChange={(e) => { const exam = exams.find((ex) => ex.id === e.target.value); setNewGrade((p) => ({ ...p, examId: e.target.value, examTitle: exam?.title || "" })); }} className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                  <option value="">Select exam</option>
                  {exams.map((ex) => (<option key={ex.id} value={ex.id}>{ex.title} ({ex.code})</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Grade</label>
                  <select value={newGrade.grade} onChange={(e) => setNewGrade((p) => ({ ...p, grade: e.target.value }))} className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                    <option value="A">A</option><option value="A-">A-</option><option value="B+">B+</option>
                    <option value="B">B</option><option value="B-">B-</option><option value="C+">C+</option>
                    <option value="C">C</option><option value="F">F</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Score (%)</label>
                  <input type="number" value={newGrade.score} onChange={(e) => setNewGrade((p) => ({ ...p, score: Number(e.target.value) }))} min={0} max={100} required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                <button type="button" onClick={() => setIsGradeModalOpen(false)} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"><Plus size={14} /> Record Grade</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}</AnimatePresence>

      {/* Create Assessment Modal */}
      <AnimatePresence>{isAssessModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">New Assessment</span>
              <button onClick={() => setIsAssessModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateAssessment} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Course ID</label>
                <input type="text" value={newAssessment.course} onChange={(e) => setNewAssessment((p) => ({ ...p, course: e.target.value }))} placeholder="e.g. CRS-001" required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Title</label>
                <input type="text" value={newAssessment.title} onChange={(e) => setNewAssessment((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Normalization Quiz" required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Type</label>
                  <select value={newAssessment.type} onChange={(e) => setNewAssessment((p) => ({ ...p, type: e.target.value }))} className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                    {ASSESSMENT_TYPES.map((t) => (<option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Weightage (%)</label>
                  <input type="number" value={newAssessment.weightage} onChange={(e) => setNewAssessment((p) => ({ ...p, weightage: Number(e.target.value) }))} min={0} max={100} required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Max Marks</label>
                  <input type="number" value={newAssessment.maxMarks} onChange={(e) => setNewAssessment((p) => ({ ...p, maxMarks: Number(e.target.value) }))} min={1} required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Date</label>
                  <input type="date" value={newAssessment.date} onChange={(e) => setNewAssessment((p) => ({ ...p, date: e.target.value }))} required className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                <button type="button" onClick={() => setIsAssessModalOpen(false)} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"><Plus size={14} /> Create</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}</AnimatePresence>

      {/* Bulk Score Entry Modal */}
      <AnimatePresence>{isScoreModalOpen && selectedAssessment && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Enter Scores: {selectedAssessment.title}</span>
              <button onClick={() => { setIsScoreModalOpen(false); setSelectedAssessment(null); }} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-xs text-slate-400">Max marks: {selectedAssessment.maxMarks} | Weightage: {selectedAssessment.weightage}%</p>
              {bulkScores.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input type="text" placeholder="Student ID" value={row.student} onChange={(e) => updateBulkScore(idx, "student", e.target.value)} className="flex-1 h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono" />
                  <input type="number" placeholder="Marks" value={row.marksObtained} onChange={(e) => updateBulkScore(idx, "marksObtained", Number(e.target.value))} min={0} max={selectedAssessment.maxMarks} className="w-24 h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono" />
                  <button onClick={() => removeBulkScoreRow(idx)} className="h-10 w-10 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><X size={16} /></button>
                </div>
              ))}
              <button onClick={addBulkScoreRow} className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1 border border-slate-200"><Plus size={12} /> Add Student</button>
            </div>
            <div className="p-4 border-t border-[#e1e2ed] flex justify-end gap-3">
              <button onClick={() => { setIsScoreModalOpen(false); setSelectedAssessment(null); }} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={submitBulkScores} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"><CheckCircle2 size={14} /> Save All Scores</button>
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>

      {/* Edit Exam Modal */}
      <AnimatePresence>{editExam && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Edit Exam</span>
              <button onClick={() => setEditExam(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Title</label>
                <input type="text" value={editExamForm.title} onChange={(e) => setEditExamForm((p) => ({ ...p, title: e.target.value }))} className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Date</label>
                  <input type="date" value={editExamForm.date} onChange={(e) => setEditExamForm((p) => ({ ...p, date: e.target.value }))} className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Duration</label>
                  <select value={editExamForm.duration} onChange={(e) => setEditExamForm((p) => ({ ...p, duration: e.target.value }))} className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                    <option value="1 hour">1 hour</option>
                    <option value="2 hours">2 hours</option>
                    <option value="3 hours">3 hours</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                <button onClick={() => setEditExam(null)} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={() => updateExamMutation.mutate({ id: editExam.id, payload: { title: editExamForm.title, date: editExamForm.date, duration: editExamForm.duration } })}
                  disabled={updateExamMutation.isPending}
                  className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  {updateExamMutation.isPending ? <div className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" /> : <CheckCircle2 size={14} />}
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>

      {/* Edit Assessment Modal */}
      <AnimatePresence>{editAssessment && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Edit Assessment</span>
              <button onClick={() => setEditAssessment(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Title</label>
                <input type="text" value={editAssessmentForm.title} onChange={(e) => setEditAssessmentForm((p) => ({ ...p, title: e.target.value }))} className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Type</label>
                  <select value={editAssessmentForm.type} onChange={(e) => setEditAssessmentForm((p) => ({ ...p, type: e.target.value }))} className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                    {ASSESSMENT_TYPES.map((t) => (<option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Weightage (%)</label>
                  <input type="number" value={editAssessmentForm.weightage} onChange={(e) => setEditAssessmentForm((p) => ({ ...p, weightage: Number(e.target.value) }))} min={0} max={100} className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Max Marks</label>
                  <input type="number" value={editAssessmentForm.maxMarks} onChange={(e) => setEditAssessmentForm((p) => ({ ...p, maxMarks: Number(e.target.value) }))} min={1} className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Date</label>
                  <input type="date" value={editAssessmentForm.date} onChange={(e) => setEditAssessmentForm((p) => ({ ...p, date: e.target.value }))} className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                <button onClick={() => setEditAssessment(null)} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={() => updateAssessmentMutation.mutate({ id: editAssessment.id, payload: { title: editAssessmentForm.title, type: editAssessmentForm.type, maxMarks: editAssessmentForm.maxMarks, weightage: editAssessmentForm.weightage, date: editAssessmentForm.date } })}
                  disabled={updateAssessmentMutation.isPending}
                  className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  {updateAssessmentMutation.isPending ? <div className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" /> : <CheckCircle2 size={14} />}
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>

      {/* Delete Assessment Confirmation */}
      <AnimatePresence>{deleteAssessmentId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Delete Assessment</span>
              <button onClick={() => setDeleteAssessmentId(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">Are you sure you want to delete this assessment? This action cannot be undone.</p>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                <button onClick={() => setDeleteAssessmentId(null)} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={() => deleteAssessmentMutation.mutate(deleteAssessmentId)}
                  disabled={deleteAssessmentMutation.isPending}
                  className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  {deleteAssessmentMutation.isPending ? <div className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" /> : <Trash2 size={14} />}
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>

      {/* Delete Exam Confirmation */}
      <AnimatePresence>{deleteExamId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Delete Exam</span>
              <button onClick={() => setDeleteExamId(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">Are you sure you want to delete this exam? This action cannot be undone.</p>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                <button onClick={() => setDeleteExamId(null)} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={() => deleteExamMutation.mutate(deleteExamId)}
                  disabled={deleteExamMutation.isPending}
                  className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  {deleteExamMutation.isPending ? <div className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" /> : <Trash2 size={14} />}
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>

      {/* Edit Grade Modal */}
      <AnimatePresence>{editGrade && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Edit Grade</span>
              <button onClick={() => setEditGrade(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Student:</span> {editGrade.studentName} ({editGrade.examTitle})</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Grade</label>
                  <select value={editGradeForm.grade} onChange={(e) => setEditGradeForm((p) => ({ ...p, grade: e.target.value }))} className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                    <option value="A">A</option><option value="A-">A-</option><option value="B+">B+</option>
                    <option value="B">B</option><option value="B-">B-</option><option value="C+">C+</option>
                    <option value="C">C</option><option value="F">F</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Score (%)</label>
                  <input type="number" value={editGradeForm.score} onChange={(e) => setEditGradeForm((p) => ({ ...p, score: Number(e.target.value) }))} min={0} max={100} className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                <button onClick={() => setEditGrade(null)} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={() => updateGradeMutation.mutate({ id: editGrade.id, payload: { grade: editGradeForm.grade, score: editGradeForm.score } })}
                  disabled={updateGradeMutation.isPending}
                  className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  {updateGradeMutation.isPending ? <div className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" /> : <CheckCircle2 size={14} />}
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>

      {/* Delete Grade Confirmation */}
      <AnimatePresence>{deleteGradeId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Delete Grade</span>
              <button onClick={() => setDeleteGradeId(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">Are you sure you want to delete this grade record? This action cannot be undone.</p>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                <button onClick={() => setDeleteGradeId(null)} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={() => deleteGradeMutation.mutate(deleteGradeId)}
                  disabled={deleteGradeMutation.isPending}
                  className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  {deleteGradeMutation.isPending ? <div className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" /> : <Trash2 size={14} />}
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>
    </div>
  );
}
