"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Eye,
  Target,
  GitBranch,
  ArrowLeft,
  Check,
} from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
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
  EmptyState,
} from "@/components/ui";

const COGNITIVE_LEVELS = [
  { level: "C1 - Remember", domain: "Cognitive", desc: "Recall facts, basic medical terminology and anatomical structures" },
  { level: "C2 - Understand", domain: "Cognitive", desc: "Explain physiological mechanisms and biochemical pathways" },
  { level: "C3 - Apply", domain: "Cognitive", desc: "Execute diagnostic protocols and laboratory procedures" },
  { level: "C4 - Analyze", domain: "Cognitive", desc: "Differentiate differential diagnoses and pharmacological interactions" },
  { level: "C5 - Evaluate", domain: "Cognitive", desc: "Appraise treatment efficacy and clinical trial methodologies" },
  { level: "C6 - Create", domain: "Cognitive", desc: "Formulate specialized patient management regimens" },
  { level: "P1 - Precision & Clinical Skill", domain: "Psychomotor", desc: "Perform clinical palpation, auscultation, and aseptic procedures" },
  { level: "A1 - Professional Ethics & Empathy", domain: "Affective", desc: "Demonstrate bedside manner, patient empathy, and medical code of conduct" },
];

const MOCK_BOS_REVISIONS = [
  {
    id: "BOS-2026-01",
    resolutionNo: "BoS/MED/2026/04-A",
    degreeProgram: "Bachelor of Medicine & Surgery (MBBS)",
    academicSession: "2026-2027",
    bosApprovalDate: "2026-02-14",
    academicCouncilApprovalDate: "2026-03-01",
    status: "Enacted & Active",
    version: "v4.2 (OBE Aligned)",
    totalCredits: 220,
    directAttainmentBenchmark: "70% students score >= 60%",
    leadSignatory: "Prof. Dr. Evelyn Parker (Dean of Faculty)",
  },
  {
    id: "BOS-2025-03",
    resolutionNo: "BoS/CSE/2025/11-C",
    degreeProgram: "B.Sc. in Computer Science & Engineering",
    academicSession: "2025-2026",
    bosApprovalDate: "2025-08-20",
    academicCouncilApprovalDate: "2025-09-12",
    status: "Active (Archived Revision in 2028)",
    version: "v3.1 (BAETE/Washington Accord)",
    totalCredits: 148,
    directAttainmentBenchmark: "65% students score >= 60%",
    leadSignatory: "Prof. Dr. Marcus Vance (BoS Convener)",
  },
];

const MOCK_WEIGHTED_MATRIX = [
  {
    coCode: "CO1: Cellular Pathology",
    course: "PATH-201",
    poWeights: { PO1: 3, PO2: 2, PO3: 1, PO4: 0, PO5: 2, PO6: 1, PO7: 3 },
    targetAttainment: 75,
    actualAttainment: 78.4,
    status: "Attained",
  },
  {
    coCode: "CO2: Microbial Antimicrobial Resistance",
    course: "MICRO-202",
    poWeights: { PO1: 2, PO2: 3, PO3: 2, PO4: 1, PO5: 3, PO6: 2, PO7: 2 },
    targetAttainment: 70,
    actualAttainment: 72.1,
    status: "Attained",
  },
  {
    coCode: "CO3: Clinical Auscultation & Vitals",
    course: "CLIN-301",
    poWeights: { PO1: 1, PO2: 2, PO3: 3, PO4: 3, PO5: 2, PO6: 3, PO7: 3 },
    targetAttainment: 80,
    actualAttainment: 69.5,
    status: "Continuous Improvement Plan",
  },
  {
    coCode: "CO4: Pharmacokinetics & Dosing",
    course: "PHARM-203",
    poWeights: { PO1: 3, PO2: 3, PO3: 2, PO4: 1, PO5: 2, PO6: 1, PO7: 2 },
    targetAttainment: 70,
    actualAttainment: 74.0,
    status: "Attained",
  },
];

const coSchema = zod.object({
  course: zod.string().min(1, "Course code or ID is required"),
  code: zod.string().min(1, "Outcome code is required"),
  description: zod.string().min(1, "Description is required"),
  cognitiveLevel: zod.string().min(1, "Cognitive level is required"),
});

const poSchema = zod.object({
  code: zod.string().min(1, "Outcome code is required"),
  description: zod.string().min(1, "Description is required"),
});

type COFormValues = zod.infer<typeof coSchema>;
type POFormValues = zod.infer<typeof poSchema>;

export default function CurriculumPage() {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("cos");
  const [isCOModalOpen, setIsCOModalOpen] = useState(false);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [editingCO, setEditingCO] = useState<any>(null);
  const [editingPO, setEditingPO] = useState<any>(null);
  const [viewingMatrixId, setViewingMatrixId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const isEditor = can("update", "curriculum");
  const isAdmin = can("delete", "curriculum");

  const { data: courseOutcomes = [], isLoading: loadingCO } = useQuery({
    queryKey: ["courseOutcomes"],
    queryFn: api.getCourseOutcomes,
  });

  const { data: programOutcomes = [], isLoading: loadingPO } = useQuery({
    queryKey: ["programOutcomes"],
    queryFn: api.getProgramOutcomes,
  });

  const { data: curriculumMaps = [], isLoading: loadingMaps } = useQuery({
    queryKey: ["curriculumMaps"],
    queryFn: api.getCurriculumMaps,
  });

  const { data: coPoMatrix = [], isLoading: loadingMatrix } = useQuery({
    queryKey: ["coPoMatrix", viewingMatrixId],
    queryFn: () => api.getCOPOMatrix(viewingMatrixId!),
    enabled: !!viewingMatrixId,
  });

  const createCOMutation = useMutation({
    mutationFn: (data: any) =>
      editingCO
        ? api.updateCourseOutcome(editingCO.id, data)
        : api.createCourseOutcome(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseOutcomes"] });
      setSuccessMsg(editingCO ? "Course Outcome updated." : "Course Outcome created.");
      setIsCOModalOpen(false);
      setEditingCO(null);
      resetCOForm();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteCOMutation = useMutation({
    mutationFn: (id: string) => api.deleteCourseOutcome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseOutcomes"] });
      setSuccessMsg("Course Outcome deleted.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const createPOMutation = useMutation({
    mutationFn: (data: any) =>
      editingPO
        ? api.updateProgramOutcome(editingPO.id, data)
        : api.createProgramOutcome(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programOutcomes"] });
      setSuccessMsg(editingPO ? "Program Outcome updated." : "Program Outcome created.");
      setIsPOModalOpen(false);
      setEditingPO(null);
      resetPOForm();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deletePOMutation = useMutation({
    mutationFn: (id: string) => api.deleteProgramOutcome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programOutcomes"] });
      setSuccessMsg("Program Outcome deleted.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteMapMutation = useMutation({
    mutationFn: (id: string) => api.deleteCurriculumMap(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculumMaps"] });
      setSuccessMsg("Curriculum map deleted.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const {
    register: registerCO,
    handleSubmit: handleSubmitCO,
    reset: resetCOForm,
    setValue: setCOValue,
    formState: { errors: coErrors },
  } = useForm<COFormValues>({
    resolver: zodResolver(coSchema),
    defaultValues: { course: "", code: "", description: "", cognitiveLevel: "C3 - Apply" },
  });

  const {
    register: registerPO,
    handleSubmit: handleSubmitPO,
    reset: resetPOForm,
    setValue: setPOValue,
    formState: { errors: poErrors },
  } = useForm<POFormValues>({
    resolver: zodResolver(poSchema),
    defaultValues: { code: "", description: "" },
  });

  const openCOModal = (co?: any) => {
    if (co) {
      setEditingCO(co);
      setCOValue("course", co.course);
      setCOValue("code", co.code);
      setCOValue("description", co.description);
      setCOValue("cognitiveLevel", co.cognitiveLevel);
    } else {
      setEditingCO(null);
      resetCOForm();
    }
    setIsCOModalOpen(true);
  };

  const openPOModal = (po?: any) => {
    if (po) {
      setEditingPO(po);
      setPOValue("code", po.code);
      setPOValue("description", po.description);
    } else {
      setEditingPO(null);
      resetPOForm();
    }
    setIsPOModalOpen(true);
  };

  const tabItems = [
    {
      id: "cos",
      label: "Course Outcomes (CO)",
      icon: <Target size={14} />,
      count: courseOutcomes.length,
    },
    {
      id: "pos",
      label: "Program Outcomes (PO)",
      icon: <GitBranch size={14} />,
      count: programOutcomes.length,
    },
    {
      id: "weighted_matrix",
      label: "CO-PO Correlation Matrix & Attainment",
      icon: <BookOpen size={14} />,
      count: MOCK_WEIGHTED_MATRIX.length,
    },
    {
      id: "bos_governance",
      label: "Board of Studies (BoS) Revisions",
      icon: <CheckCircle2 size={14} />,
      count: MOCK_BOS_REVISIONS.length,
    },
    {
      id: "maps",
      label: "Curriculum Maps & Syllabi Links",
      icon: <BookOpen size={14} />,
      count: curriculumMaps.length,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Curriculum & Outcomes"
        subtitle="Outcome-Based Education (OBE) course outcomes, program outcomes, and curriculum mapping."
        actions={
          <div className="flex items-center gap-2">
            {activeTab === "cos" && isEditor && (
              <Button
                variant="gold"
                size="md"
                onClick={() => openCOModal()}
                icon={<Plus size={15} />}
              >
                Add Course Outcome
              </Button>
            )}
            {activeTab === "pos" && isEditor && (
              <Button
                variant="gold"
                size="md"
                onClick={() => openPOModal()}
                icon={<Plus size={15} />}
              >
                Add Program Outcome
              </Button>
            )}
          </div>
        }
      />

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs items={tabItems} value={activeTab} onChange={(id) => setActiveTab(id)} />

      {/* Course Outcomes Tab */}
      {activeTab === "cos" && (
        <Card noPadding>
          {loadingCO ? (
            <div className="p-6">
              <TableSkeleton rows={4} cols={5} />
            </div>
          ) : courseOutcomes.length === 0 ? (
            <EmptyState
              title="No Course Outcomes Registered"
              description="Define course learning outcomes according to Bloom's Taxonomy."
              icon={<Target size={28} className="text-gold" />}
              action={
                isEditor ? (
                  <Button variant="gold" onClick={() => openCOModal()} icon={<Plus size={15} />}>
                    Add Course Outcome
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-muted/50 border-b border-border">
                    <th className="p-3 text-[11px] font-semibold text-text-muted uppercase">Code</th>
                    <th className="p-3 text-[11px] font-semibold text-text-muted uppercase">Course</th>
                    <th className="p-3 text-[11px] font-semibold text-text-muted uppercase">Description</th>
                    <th className="p-3 text-[11px] font-semibold text-text-muted uppercase">Cognitive Level</th>
                    {isEditor && (
                      <th className="p-3 text-[11px] font-semibold text-text-muted uppercase text-right">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {courseOutcomes.map((co: any) => (
                    <tr key={co.id} className="hover:bg-surface-hover text-xs">
                      <td className="p-3 font-mono font-bold text-primary">{co.code}</td>
                      <td className="p-3 font-semibold text-text">{co.courseTitle || co.course}</td>
                      <td className="p-3 text-text-muted max-w-sm">{co.description}</td>
                      <td className="p-3">
                        <Badge variant="neutral" size="sm">
                          {co.cognitiveLevel}
                        </Badge>
                      </td>
                      {isEditor && (
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <IconButton
                              variant="ghost"
                              size="sm"
                              label="Edit CO"
                              icon={<Edit2 size={13} />}
                              onClick={() => openCOModal(co)}
                            />
                            {isAdmin && (
                              <IconButton
                                variant="ghost"
                                size="sm"
                                label="Delete CO"
                                icon={<Trash2 size={13} className="text-rose-500" />}
                                onClick={() => {
                                  if (confirm("Delete this course outcome?")) {
                                    deleteCOMutation.mutate(co.id);
                                  }
                                }}
                              />
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
        </Card>
      )}

      {/* Program Outcomes Tab */}
      {activeTab === "pos" && (
        <Card noPadding>
          {loadingPO ? (
            <div className="p-6">
              <TableSkeleton rows={4} cols={3} />
            </div>
          ) : programOutcomes.length === 0 ? (
            <EmptyState
              title="No Program Outcomes Registered"
              description="Define overarching degree program graduate attributes (POs)."
              icon={<GitBranch size={28} className="text-gold" />}
              action={
                isEditor ? (
                  <Button variant="gold" onClick={() => openPOModal()} icon={<Plus size={15} />}>
                    Add Program Outcome
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-muted/50 border-b border-border">
                    <th className="p-3 text-[11px] font-semibold text-text-muted uppercase w-28">
                      Code
                    </th>
                    <th className="p-3 text-[11px] font-semibold text-text-muted uppercase">
                      Graduate Attribute / Description
                    </th>
                    {isEditor && (
                      <th className="p-3 text-[11px] font-semibold text-text-muted uppercase text-right w-24">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {programOutcomes.map((po: any) => (
                    <tr key={po.id} className="hover:bg-surface-hover text-xs">
                      <td className="p-3 font-mono font-bold text-primary">{po.code}</td>
                      <td className="p-3 text-text">{po.description}</td>
                      {isEditor && (
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <IconButton
                              variant="ghost"
                              size="sm"
                              label="Edit PO"
                              icon={<Edit2 size={13} />}
                              onClick={() => openPOModal(po)}
                            />
                            {isAdmin && (
                              <IconButton
                                variant="ghost"
                                size="sm"
                                label="Delete PO"
                                icon={<Trash2 size={13} className="text-rose-500" />}
                                onClick={() => {
                                  if (confirm("Delete this program outcome?")) {
                                    deletePOMutation.mutate(po.id);
                                  }
                                }}
                              />
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
        </Card>
      )}

      {/* Curriculum Maps Tab */}
      {activeTab === "maps" && (
        <Card noPadding>
          {viewingMatrixId ? (
            <div>
              <div className="p-4 border-b border-border bg-surface-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingMatrixId(null)}
                    icon={<ArrowLeft size={14} />}
                  >
                    Back to Maps
                  </Button>
                  <span className="text-xs font-semibold text-text">
                    CO-PO Correlation Matrix
                  </span>
                </div>
              </div>
              {loadingMatrix ? (
                <div className="p-6">
                  <TableSkeleton rows={4} cols={5} />
                </div>
              ) : coPoMatrix.length === 0 ? (
                <EmptyState
                  title="No Matrix Data Available"
                  description="No mapping relationships defined for this curriculum map yet."
                />
              ) : (
                <div className="overflow-x-auto p-4">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-muted/50 border-b border-border">
                        <th className="p-3 text-[11px] font-semibold text-text-muted uppercase w-24">
                          CO Code
                        </th>
                        {coPoMatrix[0]?.poMappings?.map((pm: any) => (
                          <th
                            key={pm.po?.id || pm.po}
                            className="p-3 text-[11px] font-semibold text-text-muted uppercase text-center"
                          >
                            {pm.po?.code || pm.po}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {coPoMatrix.map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-surface-hover text-xs">
                          <td className="p-3 font-mono font-bold text-primary">
                            {row.co?.code || row.co}
                          </td>
                          {row.poMappings?.map((pm: any, j: number) => (
                            <td key={j} className="p-3 text-center">
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                  pm.mapped
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-surface-muted text-text-subtle border border-border"
                                }`}
                              >
                                {pm.mapped ? <Check size={12} /> : "—"}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div>
              {loadingMaps ? (
                <div className="p-6">
                  <TableSkeleton rows={3} cols={5} />
                </div>
              ) : curriculumMaps.length === 0 ? (
                <EmptyState
                  title="No Curriculum Maps Created"
                  description="Curriculum maps connect course outcomes with semester syllabi."
                  icon={<BookOpen size={28} className="text-gold" />}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-muted/50 border-b border-border">
                        <th className="p-3 text-[11px] font-semibold text-text-muted uppercase">Course</th>
                        <th className="p-3 text-[11px] font-semibold text-text-muted uppercase">Semester</th>
                        <th className="p-3 text-[11px] font-semibold text-text-muted uppercase">Outcomes</th>
                        <th className="p-3 text-[11px] font-semibold text-text-muted uppercase">Topics</th>
                        <th className="p-3 text-[11px] font-semibold text-text-muted uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {curriculumMaps.map((cm: any) => (
                        <tr key={cm.id} className="hover:bg-surface-hover text-xs">
                          <td className="p-3 font-semibold text-text">{cm.courseTitle || cm.course}</td>
                          <td className="p-3 text-text-muted">{cm.academicSemester}</td>
                          <td className="p-3">
                            <Badge variant="primary" size="sm">
                              {cm.courseOutcomes?.length || 0} COs
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="neutral" size="sm">
                              {cm.topics?.length || 0} topics
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewingMatrixId(cm.id)}
                                icon={<Eye size={12} />}
                              >
                                View Matrix
                              </Button>
                              {isAdmin && (
                                <IconButton
                                  variant="ghost"
                                  size="sm"
                                  label="Delete Map"
                                  icon={<Trash2 size={13} className="text-rose-500" />}
                                  onClick={() => {
                                    if (confirm("Delete this curriculum map?")) {
                                      deleteMapMutation.mutate(cm.id);
                                    }
                                  }}
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Weighted CO-PO Correlation Matrix Tab */}
      {activeTab === "weighted_matrix" && (
        <Card noPadding>
          <div className="p-4 border-b border-border bg-surface-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">
                NBA / Washington Accord CO-PO Correlation Matrix & Direct Cohort Attainment
              </h4>
              <p className="text-[11px] text-text-muted mt-0.5">
                Correlation weights: 1 (Slight/Low), 2 (Moderate/Medium), 3 (Substantial/High). Attainment benchmark: $\ge 60\%$ threshold.
              </p>
            </div>
            <Badge variant="gold" size="sm">UGC OBE Framework</Badge>
          </div>

          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted/50 border-b border-border text-[11px] text-text-muted uppercase font-semibold">
                  <th className="p-3">Course & Learning Outcome</th>
                  <th className="p-3 text-center">PO1 (Knowledge)</th>
                  <th className="p-3 text-center">PO2 (Analysis)</th>
                  <th className="p-3 text-center">PO3 (Design/Clinical)</th>
                  <th className="p-3 text-center">PO4 (Investigation)</th>
                  <th className="p-3 text-center">PO5 (Modern Tools)</th>
                  <th className="p-3 text-center">PO6 (Ethics)</th>
                  <th className="p-3 text-center">PO7 (Lifelong)</th>
                  <th className="p-3 text-center">Target %</th>
                  <th className="p-3 text-center">Attained %</th>
                  <th className="p-3 text-right">CQI Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {MOCK_WEIGHTED_MATRIX.map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface-hover">
                    <td className="p-3">
                      <span className="font-bold text-text block">{row.coCode}</span>
                      <span className="text-[11px] text-text-muted font-mono">{row.course}</span>
                    </td>
                    {Object.values(row.poWeights).map((weight, wIdx) => (
                      <td key={wIdx} className="p-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-mono font-bold text-xs ${
                            weight === 3
                              ? "bg-emerald-500/10 text-emerald-700 border border-emerald-300"
                              : weight === 2
                              ? "bg-amber-500/10 text-amber-700 border border-amber-300"
                              : weight === 1
                              ? "bg-blue-500/10 text-blue-700 border border-blue-200"
                              : "text-text-subtle"
                          }`}
                        >
                          {weight > 0 ? weight : "—"}
                        </span>
                      </td>
                    ))}
                    <td className="p-3 text-center font-mono font-semibold text-text">{row.targetAttainment}%</td>
                    <td className="p-3 text-center font-mono font-bold text-gold">{row.actualAttainment}%</td>
                    <td className="p-3 text-right">
                      <Badge
                        variant={row.status === "Attained" ? "success" : "warning"}
                        size="sm"
                      >
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* BoS Governance Tab */}
      {activeTab === "bos_governance" && (
        <Card noPadding>
          <div className="p-4 border-b border-border bg-surface-muted/30 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">
                Board of Studies (BoS) Curriculum Resolutions & Academic Council Gazette
              </h4>
              <p className="text-[11px] text-text-muted mt-0.5">
                Statutory tracking of degree syllabi versioning, total credit ceilings, and Academic Council ratifications.
              </p>
            </div>
            <Badge variant="gold" size="sm">Statutory Gazette</Badge>
          </div>

          <div className="divide-y divide-border">
            {MOCK_BOS_REVISIONS.map((bos) => (
              <div key={bos.id} className="p-4 hover:bg-surface-hover transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center font-bold text-xs">
                      {bos.version.slice(0, 4)}
                    </div>
                    <div>
                      <h5 className="font-bold text-text text-sm">{bos.degreeProgram}</h5>
                      <span className="text-xs text-text-muted font-mono">{bos.resolutionNo} • Session {bos.academicSession}</span>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">{bos.status}</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-muted/40 p-3 rounded-lg text-xs">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-semibold block">BoS Approval</span>
                    <span className="font-mono text-text font-medium">{bos.bosApprovalDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-semibold block">Academic Council</span>
                    <span className="font-mono text-text font-medium">{bos.academicCouncilApprovalDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-semibold block">Total Degree Credits</span>
                    <span className="font-mono text-gold font-bold">{bos.totalCredits} Credits</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-semibold block">Attainment Target</span>
                    <span className="text-text font-medium">{bos.directAttainmentBenchmark}</span>
                  </div>
                </div>

                <div className="text-[11px] text-text-muted flex items-center justify-between">
                  <span>Signatory: <strong>{bos.leadSignatory}</strong></span>
                  <span className="text-gold font-bold cursor-pointer hover:underline">Download BoS Resolution PDF</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Course Outcome Modal */}
      <Modal
        isOpen={isCOModalOpen}
        onClose={() => {
          setIsCOModalOpen(false);
          setEditingCO(null);
        }}
        title={editingCO ? "Edit Course Outcome" : "Add Course Outcome"}
        subtitle="Specify measurable performance outcome and target cognitive level"
        size="md"
      >
        <form
          onSubmit={handleSubmitCO((values) => createCOMutation.mutate(values))}
          className="space-y-4"
        >
          <FormField label="Course Code / ID" required error={coErrors.course?.message}>
            <Input {...registerCO("course")} placeholder="e.g. MBBS-101" />
          </FormField>

          <FormField label="Outcome Code" required error={coErrors.code?.message}>
            <Input {...registerCO("code")} placeholder="e.g. CO1" />
          </FormField>

          <FormField label="Outcome Description" required error={coErrors.description?.message}>
            <Textarea
              {...registerCO("description")}
              rows={3}
              placeholder="Describe student capability upon completing course module..."
            />
          </FormField>

          <FormField label="Cognitive Level & Domain" required error={coErrors.cognitiveLevel?.message}>
            <Select {...registerCO("cognitiveLevel")}>
              {COGNITIVE_LEVELS.map((lvl) => (
                <option key={lvl.level} value={lvl.level}>
                  {lvl.level} ({lvl.domain})
                </option>
              ))}
            </Select>
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCOModalOpen(false);
                setEditingCO(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createCOMutation.isPending}
              icon={<CheckCircle2 size={14} />}
            >
              {editingCO ? "Update Outcome" : "Create Outcome"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Program Outcome Modal */}
      <Modal
        isOpen={isPOModalOpen}
        onClose={() => {
          setIsPOModalOpen(false);
          setEditingPO(null);
        }}
        title={editingPO ? "Edit Program Outcome" : "Add Program Outcome"}
        subtitle="Institutional graduate attribute for accreditation (NBA / PMDC / BMDC)"
        size="md"
      >
        <form
          onSubmit={handleSubmitPO((values) => createPOMutation.mutate(values))}
          className="space-y-4"
        >
          <FormField label="Outcome Code" required error={poErrors.code?.message}>
            <Input {...registerPO("code")} placeholder="e.g. PO1" />
          </FormField>

          <FormField label="Graduate Attribute Description" required error={poErrors.description?.message}>
            <Textarea
              {...registerPO("description")}
              rows={3}
              placeholder="Describe overarching graduate skill, ethics, or clinical competence..."
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsPOModalOpen(false);
                setEditingPO(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createPOMutation.isPending}
              icon={<CheckCircle2 size={14} />}
            >
              {editingPO ? "Update PO" : "Create PO"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
