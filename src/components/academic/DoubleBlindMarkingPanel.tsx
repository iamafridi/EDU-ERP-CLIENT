"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  EyeOff,
  Scale,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Plus,
  Search,
  Gavel,
  Lock,
  Sparkles,
  BookOpen,
  ArrowRight,
  Calculator,
} from "lucide-react";
import { doubleBlindApi } from "@/services/api";
import { Card, Button, Badge, Modal, FormField, Input, Select } from "@/components/ui";

export function DoubleBlindMarkingPanel() {
  const queryClient = useQueryClient();

  const [isFirstEvalModalOpen, setIsFirstEvalModalOpen] = useState(false);
  const [isSecondEvalModalOpen, setIsSecondEvalModalOpen] = useState(false);
  const [isAdjudicateModalOpen, setIsAdjudicateModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const [searchFilter, setSearchFilter] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // First eval form
  const [examId, setExamId] = useState("EXAM-ANAT-2026");
  const [studentRoll, setStudentRoll] = useState("");
  const [blindCode, setBlindCode] = useState("");
  const [firstMarks, setFirstMarks] = useState<number>(80);
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [evaluatorRemarks, setEvaluatorRemarks] = useState("");

  // Second eval form
  const [secondMarks, setSecondMarks] = useState<number>(80);

  // Adjudication form
  const [chairFinalMarks, setChairFinalMarks] = useState<number>(82);
  const [chairNotes, setChairNotes] = useState("");

  // Queries
  const { data: marksList = [], isLoading } = useQuery({
    queryKey: ["double-blind-marks"],
    queryFn: () => doubleBlindApi.getMarks(),
  });

  // Mutations
  const firstEvalMutation = useMutation({
    mutationFn: (payload: any) => doubleBlindApi.submitFirstMark(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["double-blind-marks"] });
      setIsFirstEvalModalOpen(false);
      resetFirstForm();
      setSuccessMsg("First blind evaluation recorded successfully.");
      setTimeout(() => setSuccessMsg(""), 4500);
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || "Failed to submit first evaluation.");
      setTimeout(() => setErrorMsg(""), 5000);
    },
  });

  const secondEvalMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      doubleBlindApi.submitSecondMark(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["double-blind-marks"] });
      setIsSecondEvalModalOpen(false);
      setSuccessMsg("Second blind evaluation recorded. Discrepancy checked against 5% threshold.");
      setTimeout(() => setSuccessMsg(""), 4500);
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || "Failed to submit second evaluation.");
      setTimeout(() => setErrorMsg(""), 5000);
    },
  });

  const adjudicateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      doubleBlindApi.adjudicateChairMark(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["double-blind-marks"] });
      setIsAdjudicateModalOpen(false);
      setSuccessMsg("Department Chair adjudication applied and grade locked.");
      setTimeout(() => setSuccessMsg(""), 4500);
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || "Failed to adjudicate grade discrepancy.");
      setTimeout(() => setErrorMsg(""), 5000);
    },
  });

  const resetFirstForm = () => {
    setStudentRoll(`MED-2026-${Math.floor(100 + Math.random() * 900)}`);
    setBlindCode(`BLIND-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
    setFirstMarks(80);
    setEvaluatorRemarks("");
  };

  const filteredMarks = marksList.filter((m: any) => {
    const q = searchFilter.toLowerCase();
    return (
      (m.blindCode || "").toLowerCase().includes(q) ||
      (m.studentRoll || "").toLowerCase().includes(q) ||
      (m.courseCode || "").toLowerCase().includes(q) ||
      (m.status || "").toLowerCase().includes(q)
    );
  });

  const totalFlagged = marksList.filter((m: any) => m.requiresAdjudication || m.status === "DISCREPANCY_FLAGGED").length;
  const totalResolved = marksList.filter((m: any) => m.status === "RESOLVED" || m.status === "ADJUDICATED").length;

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-3 text-sm font-medium"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-3 text-sm font-medium"
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Double-Blind Assessment & 5% Variance Adjudication
            </h2>
            <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-600 border-indigo-500/20 font-mono">
              BM&DC & WFME Blind Protocol
            </Badge>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Independent dual-blind script evaluation with automated &gt;5% delta detection and Head of Department arbitration.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              resetFirstForm();
              setIsFirstEvalModalOpen(true);
            }}
            className="gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Submit 1st Blind Evaluation
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Evaluated Scripts</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">{marksList.length}</span>
            <span className="text-xs text-neutral-500">Dual-masked entries</span>
          </div>
        </Card>

        <Card className="p-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">&gt;5% Discrepancies</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600">{totalFlagged}</span>
            <span className="text-xs text-rose-500 font-medium">Requires Chair arbitration</span>
          </div>
        </Card>

        <Card className="p-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Resolved & Finalized</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">{totalResolved}</span>
            <span className="text-xs text-emerald-600 font-medium">Official grades published</span>
          </div>
        </Card>

        <Card className="p-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Blind Integrity Level</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
              <EyeOff className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">100%</span>
            <span className="text-xs text-purple-600 font-medium">Cryptographic masking</span>
          </div>
        </Card>
      </div>

      {/* Filter and Table */}
      <Card className="overflow-hidden bg-white/70 dark:bg-neutral-900/70 border-neutral-200 dark:border-neutral-800">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary-500" />
            <span className="font-semibold text-sm text-neutral-900 dark:text-white">
              Double-Blind Marking Ledger & Discrepancy Flags
            </span>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search blind code, course, status..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 font-semibold text-xs border-b border-neutral-200 dark:border-neutral-800 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Blind Code / Script ID</th>
                <th className="px-4 py-3">Course & Exam</th>
                <th className="px-4 py-3">1st Evaluator</th>
                <th className="px-4 py-3">2nd Evaluator</th>
                <th className="px-4 py-3">Variance (%)</th>
                <th className="px-4 py-3">Final Grade</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                    Loading double-blind markings...
                  </td>
                </tr>
              ) : filteredMarks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                    No double-blind evaluation records found.
                  </td>
                </tr>
              ) : (
                filteredMarks.map((row: any) => {
                  const hasDiscrepancy = (row.discrepancyPercentage || 0) > 5.0 || row.requiresAdjudication;
                  return (
                    <tr key={row._id || row.blindCode} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1.5">
                          <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
                          {row.blindCode}
                        </div>
                        <div className="text-xs text-neutral-400 font-mono">
                          Student Roll: {row.studentRoll || "PROTECTED"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">
                          {row.courseCode || "ANAT-101"}
                        </div>
                        <div className="text-xs text-neutral-500 truncate max-w-[160px]">
                          {row.courseTitle || "Gross Anatomy"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-neutral-900 dark:text-white">
                          {row.firstMarks !== null && row.firstMarks !== undefined ? `${row.firstMarks} / ${row.maxMarks || 100}` : "—"}
                        </div>
                        <div className="text-xs text-neutral-400 truncate max-w-[140px]">
                          {row.firstEvaluatorName || "Examiner 1"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {row.secondMarks !== null && row.secondMarks !== undefined ? (
                          <div>
                            <div className="font-semibold text-neutral-900 dark:text-white">
                              {row.secondMarks} / {row.maxMarks || 100}
                            </div>
                            <div className="text-xs text-neutral-400 truncate max-w-[140px]">
                              {row.secondEvaluatorName || "Examiner 2"}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                            Awaiting 2nd Eval
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {row.discrepancyPercentage !== null && row.discrepancyPercentage !== undefined ? (
                          <Badge
                            variant={hasDiscrepancy ? "danger" : "success"}
                            className={`text-xs gap-1 font-mono ${
                              hasDiscrepancy ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : ""
                            }`}
                          >
                            {hasDiscrepancy ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                            {row.discrepancyPercentage.toFixed(1)}%
                          </Badge>
                        ) : (
                          <span className="text-xs text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {row.finalMarks !== null && row.finalMarks !== undefined ? (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-base">
                            {row.finalMarks}
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-400 italic">Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            row.status === "RESOLVED" || row.status === "ADJUDICATED"
                              ? "success"
                              : hasDiscrepancy
                              ? "danger"
                              : "warning"
                          }
                          className="text-xs"
                        >
                          {row.status || "IN_PROGRESS"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.secondMarks === null || row.secondMarks === undefined ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs gap-1"
                            onClick={() => {
                              setSelectedRecord(row);
                              setSecondMarks(row.firstMarks || 80);
                              setIsSecondEvalModalOpen(true);
                            }}
                          >
                            <FileCheck className="w-3 h-3 text-blue-500" />
                            2nd Eval
                          </Button>
                        ) : hasDiscrepancy && row.status !== "ADJUDICATED" ? (
                          <Button
                            size="sm"
                            variant="primary"
                            className="text-xs gap-1 bg-rose-600 hover:bg-rose-700 text-white"
                            onClick={() => {
                              setSelectedRecord(row);
                              setChairFinalMarks(
                                Math.round(((row.firstMarks || 0) + (row.secondMarks || 0)) / 2)
                              );
                              setChairNotes("");
                              setIsAdjudicateModalOpen(true);
                            }}
                          >
                            <Gavel className="w-3 h-3" />
                            Chair Adjudicate
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-xs gap-1 text-neutral-400">
                            <Lock className="w-3 h-3" /> Locked
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal 1: Submit First Eval */}
      <Modal
        isOpen={isFirstEvalModalOpen}
        onClose={() => setIsFirstEvalModalOpen(false)}
        title="Submit 1st Blind Script Evaluation"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-500">
            Enter marks under anonymous Blind Code token. Examiner will not have access to student identity.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Target Exam">
              <Select
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                options={[
                  { label: "Gross Human Anatomy Final (2026)", value: "EXAM-ANAT-2026" },
                  { label: "Cellular Physiology Mid-Term", value: "EXAM-PHYS-2026" },
                  { label: "Clinical Biochemistry Term 1", value: "EXAM-BIOC-2026" },
                  { label: "Community Medicine Field Exam", value: "EXAM-COMM-2026" },
                ]}
              />
            </FormField>

            <FormField label="Anonymous Blind Code">
              <Input
                value={blindCode}
                onChange={(e) => setBlindCode(e.target.value)}
                placeholder="BLIND-9942A"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Student Roll ID">
              <Input
                value={studentRoll}
                onChange={(e) => setStudentRoll(e.target.value)}
                placeholder="MED-2026-042"
              />
            </FormField>

            <FormField label="Evaluator Marks (Max 100)">
              <Input
                type="number"
                value={firstMarks}
                onChange={(e) => setFirstMarks(Number(e.target.value))}
                min={0}
                max={100}
              />
            </FormField>
          </div>

          <FormField label="Evaluation Remarks / Key Weaknesses">
            <Input
              value={evaluatorRemarks}
              onChange={(e) => setEvaluatorRemarks(e.target.value)}
              placeholder="Good clinical reasoning on brachial plexus branch questions."
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <Button variant="outline" onClick={() => setIsFirstEvalModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={firstEvalMutation.isPending || !blindCode || !studentRoll}
              onClick={() => {
                firstEvalMutation.mutate({
                  examId,
                  studentRoll,
                  blindCode,
                  marks: firstMarks,
                  maxMarks,
                  remarks: evaluatorRemarks,
                });
              }}
            >
              {firstEvalMutation.isPending ? "Submitting..." : "Save 1st Evaluation"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal 2: Submit Second Eval */}
      <Modal
        isOpen={isSecondEvalModalOpen}
        onClose={() => setIsSecondEvalModalOpen(false)}
        title="Submit 2nd Blind Script Evaluation"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-500">
            Blind script code: <span className="font-mono font-bold text-primary-600">{selectedRecord?.blindCode}</span>.
            The system will compare marks and automatically trigger an alert if variance exceeds 5%.
          </p>

          <FormField label="2nd Evaluator Independent Marks (Max 100)">
            <Input
              type="number"
              value={secondMarks}
              onChange={(e) => setSecondMarks(Number(e.target.value))}
              min={0}
              max={100}
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <Button variant="outline" onClick={() => setIsSecondEvalModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={secondEvalMutation.isPending || !selectedRecord}
              onClick={() => {
                secondEvalMutation.mutate({
                  id: selectedRecord._id || selectedRecord.id,
                  payload: { marks: secondMarks },
                });
              }}
            >
              {secondEvalMutation.isPending ? "Validating..." : "Submit 2nd Evaluation"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal 3: Chair Adjudication */}
      <Modal
        isOpen={isAdjudicateModalOpen}
        onClose={() => setIsAdjudicateModalOpen(false)}
        title="Department Chair Grade Adjudication"
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs space-y-1.5 text-amber-800 dark:text-amber-200">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Discrepancy Threshold Exceeded (&gt;5.0% Variance)
            </div>
            <div className="flex justify-between font-mono">
              <span>Examiner 1: {selectedRecord?.firstMarks} marks</span>
              <span>Examiner 2: {selectedRecord?.secondMarks} marks</span>
              <span>Delta: {selectedRecord?.discrepancyPercentage?.toFixed(1)}%</span>
            </div>
          </div>

          <FormField label="Adjudicated Final Grade">
            <Input
              type="number"
              value={chairFinalMarks}
              onChange={(e) => setChairFinalMarks(Number(e.target.value))}
              min={0}
              max={100}
            />
          </FormField>

          <FormField label="Chair Audit Justification & Decision Note">
            <Input
              value={chairNotes}
              onChange={(e) => setChairNotes(e.target.value)}
              placeholder="Examined rubric alignment on Section B Question 4; consensus reached at 82 marks."
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <Button variant="outline" onClick={() => setIsAdjudicateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={adjudicateMutation.isPending || !selectedRecord}
              onClick={() => {
                adjudicateMutation.mutate({
                  id: selectedRecord._id || selectedRecord.id,
                  payload: {
                    finalMarks: chairFinalMarks,
                    notes: chairNotes || "Chair verified and settled variance.",
                  },
                });
              }}
            >
              {adjudicateMutation.isPending ? "Locking Grade..." : "Approve & Lock Official Grade"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
