"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { usePermission } from "@/hooks/usePermission";
import DataTable, { Column } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button, IconButton } from "@/components/ui/Button";
import { Dialog, ConfirmDialog } from "@/components/ui/Dialog";
import { FormField, Input, Select } from "@/components/ui/Form";
import { Alert } from "@/components/ui/Feedback";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Users,
  Sparkles,
  FileSpreadsheet,
  RefreshCw,
  ShieldCheck,
  DollarSign,
  Lock,
} from "lucide-react";

interface Semester {
  id: string;
  name: string;
  code: string;
  startMonth: string;
  endMonth: string;
}

interface SemForm {
  name: string;
  code: string;
  startMonth: string;
  endMonth: string;
}

interface BatchRolloverCohort {
  batchId: string;
  batchName: string;
  department: string;
  currentSemester: string;
  targetSemester: string;
  totalStudents: number;
  eligibleCount: number;
  backlogCount: number;
  holdsCount: number;
  tuitionFeePerStudent: number;
  status: "READY" | "PROMOTED" | "REQUIRES_REVIEW";
}

const SAMPLE_COHORTS: BatchRolloverCohort[] = [
  {
    batchId: "MBBS-B48",
    batchName: "MBBS 48th Batch (2025-2026)",
    department: "Bachelor of Medicine & Surgery",
    currentSemester: "1st Year (Term 2)",
    targetSemester: "2nd Year (Term 1 - Anatomy & Physio Final)",
    totalStudents: 120,
    eligibleCount: 114,
    backlogCount: 4,
    holdsCount: 2,
    tuitionFeePerStudent: 95000,
    status: "READY",
  },
  {
    batchId: "BDS-B22",
    batchName: "BDS 22nd Batch",
    department: "Bachelor of Dental Surgery",
    currentSemester: "2nd Year (Term 1)",
    targetSemester: "2nd Year (Term 2)",
    totalStudents: 60,
    eligibleCount: 57,
    backlogCount: 2,
    holdsCount: 1,
    tuitionFeePerStudent: 75000,
    status: "READY",
  },
  {
    batchId: "CSE-B14",
    batchName: "CSE 14th Intake",
    department: "Computer Science & Engineering",
    currentSemester: "Summer 2026",
    targetSemester: "Fall 2026",
    totalStudents: 180,
    eligibleCount: 172,
    backlogCount: 6,
    holdsCount: 2,
    tuitionFeePerStudent: 65000,
    status: "READY",
  },
];

const EMPTY_FORM: SemForm = { name: "", code: "", startMonth: "", endMonth: "" };

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function SemestersPage() {
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const canModify = roleIs("super-admin", "domain-admin");

  const [activeView, setActiveView] = useState<"terms" | "rollover">("terms");
  const [successMsg, setSuccessMsg] = useState("");
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<SemForm>(EMPTY_FORM);
  const [selectedSem, setSelectedSem] = useState<Semester | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Semester | null>(null);

  // Rollover state
  const [cohorts, setCohorts] = useState<BatchRolloverCohort[]>(SAMPLE_COHORTS);
  const [selectedCohort, setSelectedCohort] = useState<BatchRolloverCohort | null>(null);
  const [isPromoting, setIsPromoting] = useState(false);
  const [generateInvoices, setGenerateInvoices] = useState(true);
  const [carryBacklogs, setCarryBacklogs] = useState(true);

  const { data: semesters = [], isLoading } = useQuery<Semester[]>({
    queryKey: ["semesters"],
    queryFn: api.getSemesters,
  });

  const createMutation = useMutation({
    mutationFn: api.createSemester,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
      setSuccessMsg("Semester created successfully.");
      setModalMode(null);
      setForm(EMPTY_FORM);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: SemForm }) =>
      api.updateSemester(payload.id, payload.data as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
      setSuccessMsg("Semester updated successfully.");
      setModalMode(null);
      setSelectedSem(null);
      setForm(EMPTY_FORM);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteSemester,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
      setSuccessMsg("Semester deleted successfully.");
      setDeleteTarget(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setSelectedSem(null);
    setModalMode("create");
  };

  const openEdit = (sem: Semester) => {
    setSelectedSem(sem);
    setForm({ name: sem.name, code: sem.code, startMonth: sem.startMonth, endMonth: sem.endMonth });
    setModalMode("edit");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "create") {
      createMutation.mutate(form);
    } else if (modalMode === "edit" && selectedSem) {
      updateMutation.mutate({ id: selectedSem.id, data: form });
    }
  };

  const handleExecuteRollover = () => {
    if (!selectedCohort) return;
    setIsPromoting(true);

    setTimeout(() => {
      setCohorts((prev) =>
        prev.map((c) =>
          c.batchId === selectedCohort.batchId
            ? { ...c, status: "PROMOTED", currentSemester: c.targetSemester }
            : c
        )
      );
      setIsPromoting(false);
      setSuccessMsg(
        `Successfully promoted ${selectedCohort.eligibleCount} students in ${selectedCohort.batchId} to ${selectedCohort.targetSemester}. ${generateInvoices ? `${selectedCohort.eligibleCount} tuition demand invoices queued in GAAP ledger.` : ""}`
      );
      setSelectedCohort(null);
      setTimeout(() => setSuccessMsg(""), 6000);
    }, 1200);
  };

  const columns: Column<Semester>[] = [
    {
      header: "Semester Name",
      accessor: (row) => <span className="font-medium text-text">{row.name}</span>,
      sortValue: (row) => row.name,
    },
    { header: "Code", accessor: "code", className: "font-mono text-text-muted" },
    { header: "Start Month", accessor: "startMonth" },
    { header: "End Month", accessor: "endMonth" },
    ...(canModify
      ? [
          {
            header: "Actions",
            id: "actions",
            sortable: false,
            hideable: false,
            accessor: (row: Semester) => (
              <div className="flex items-center gap-1">
                <IconButton label={`Edit ${row.name}`} size="sm" onClick={() => openEdit(row)}>
                  <Pencil size={14} aria-hidden="true" />
                </IconButton>
                <IconButton label={`Delete ${row.name}`} size="sm" variant="danger" onClick={() => setDeleteTarget(row)}>
                  <Trash2 size={14} aria-hidden="true" />
                </IconButton>
              </div>
            ),
          } as Column<Semester>,
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Semesters & Cohort Rollover"
        description="Configure academic term periods and execute whole-cohort semester promotions with automated tuition fee generation."
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 rounded-xl bg-surface border border-border">
              <button
                type="button"
                onClick={() => setActiveView("terms")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeView === "terms"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-text-muted hover:text-text"
                }`}
              >
                Semester Terms Master
              </button>
              <button
                type="button"
                onClick={() => setActiveView("rollover")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeView === "rollover"
                    ? "bg-gold text-on-gold shadow-sm"
                    : "text-text-muted hover:text-text"
                }`}
              >
                <Sparkles size={12} />
                <span>Batch Rollover Engine</span>
              </button>
            </div>

            {canModify && activeView === "terms" && (
              <Button leftIcon={<Plus size={15} aria-hidden="true" />} onClick={openCreate}>
                Add Semester
              </Button>
            )}
          </div>
        }
      />

      {successMsg && (
        <Alert tone="success" className="max-w-3xl">
          {successMsg}
        </Alert>
      )}

      {/* ─── TAB 1: SEMESTER TERMS MASTER ─── */}
      {activeView === "terms" && (
        <DataTable<Semester>
          data={semesters}
          columns={columns}
          loading={isLoading}
          searchPlaceholder="Search semesters by name..."
          searchField="name"
          tableId="semesters"
          emptyTitle="No semesters yet"
          emptyDescription="Create your first semester to schedule courses and exams."
          emptyAction={
            canModify ? (
              <Button size="sm" leftIcon={<Plus size={14} aria-hidden="true" />} onClick={openCreate}>
                Add Semester
              </Button>
            ) : undefined
          }
        />
      )}

      {/* ─── TAB 2: BATCH SEMESTER ROLLOVER & AUTO-PROMOTION ENGINE ─── */}
      {activeView === "rollover" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border-border bg-surface flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                  Active Cohorts Ready
                </span>
                <span className="text-xl font-extrabold text-text font-ui">
                  {cohorts.filter((c) => c.status === "READY").length} Batches
                </span>
              </div>
            </Card>

            <Card className="p-4 border-border bg-surface flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/15 text-success flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                  Eligible Students
                </span>
                <span className="text-xl font-extrabold text-success font-ui">
                  {cohorts.reduce((acc, c) => acc + c.eligibleCount, 0)} Students
                </span>
              </div>
            </Card>

            <Card className="p-4 border-border bg-surface flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/15 text-warning flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                  Backlog &amp; Holds
                </span>
                <span className="text-xl font-extrabold text-warning font-ui">
                  {cohorts.reduce((acc, c) => acc + c.backlogCount + c.holdsCount, 0)} Flagged
                </span>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {cohorts.map((cohort) => (
              <Card
                key={cohort.batchId}
                className={`p-6 flex flex-col justify-between transition-all ${
                  cohort.status === "PROMOTED"
                    ? "border-success/40 bg-success-soft/20"
                    : "border-border hover:border-gold/50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge tone={cohort.status === "PROMOTED" ? "success" : "gold"}>
                      {cohort.status === "PROMOTED" ? "PROMOTED TO NEXT TERM" : "READY FOR ROLLOVER"}
                    </Badge>
                    <span className="text-xs font-mono font-bold text-text-muted">
                      {cohort.batchId}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-text mb-1">{cohort.batchName}</h3>
                  <p className="text-xs text-text-muted mb-4">{cohort.department}</p>

                  <div className="p-3.5 rounded-xl bg-surface-muted/50 border border-border space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Current Term:</span>
                      <span className="font-semibold text-text">{cohort.currentSemester}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Target Term:</span>
                      <span className="font-bold text-gold">{cohort.targetSemester}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
                      <span className="text-text-muted">Term Tuition:</span>
                      <span className="font-bold text-text tabular-nums">৳{cohort.tuitionFeePerStudent.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-text-muted mb-4">
                    <div className="flex justify-between">
                      <span>Total Strength:</span>
                      <span className="font-bold text-text">{cohort.totalStudents}</span>
                    </div>
                    <div className="flex justify-between text-success">
                      <span>Eligible for Promotion:</span>
                      <span className="font-bold">{cohort.eligibleCount} ({((cohort.eligibleCount / cohort.totalStudents) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="flex justify-between text-warning">
                      <span>Backlog Courses:</span>
                      <span className="font-bold">{cohort.backlogCount} Students</span>
                    </div>
                    <div className="flex justify-between text-danger">
                      <span>Clearance Holds:</span>
                      <span className="font-bold">{cohort.holdsCount} Students</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  {cohort.status === "PROMOTED" ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-success">
                      <CheckCircle2 size={16} />
                      <span>Term promotion executed &amp; bills posted</span>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      leftIcon={<ArrowRight size={15} />}
                      onClick={() => setSelectedCohort(cohort)}
                    >
                      Configure &amp; Promote Batch
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── ROLLOVER EXECUTION MODAL ─── */}
      <Dialog
        open={selectedCohort !== null}
        onClose={() => setSelectedCohort(null)}
        title="Execute Whole-Cohort Batch Semester Rollover"
        footer={
          <>
            <Button variant="outline" onClick={() => setSelectedCohort(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleExecuteRollover}
              loading={isPromoting}
              leftIcon={<Sparkles size={15} />}
            >
              Confirm 1-Click Batch Promotion
            </Button>
          </>
        }
      >
        {selectedCohort && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-gold-soft border border-border-gold">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={18} className="text-gold" />
                <h4 className="text-sm font-bold text-text">
                  Promoting {selectedCohort.batchName}
                </h4>
              </div>
              <p className="text-xs text-text-muted">
                Advancing from <strong className="text-text">{selectedCohort.currentSemester}</strong> to{" "}
                <strong className="text-gold">{selectedCohort.targetSemester}</strong>.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-surface-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateInvoices}
                  onChange={(e) => setGenerateInvoices(e.target.checked)}
                  className="mt-0.5 rounded text-gold focus:ring-gold"
                />
                <div>
                  <span className="text-xs font-bold text-text block">
                    Auto-Generate Next Term Tuition Demands (৳{selectedCohort.tuitionFeePerStudent.toLocaleString()} / student)
                  </span>
                  <span className="text-[11px] text-text-muted">
                    Immediately creates 3-tranche promissory accounts and prints bank challan stubs in GAAP Ledger.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-surface-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={carryBacklogs}
                  onChange={(e) => setCarryBacklogs(e.target.checked)}
                  className="mt-0.5 rounded text-gold focus:ring-gold"
                />
                <div>
                  <span className="text-xs font-bold text-text block">
                    Carry Forward Failed Prerequisite Courses ({selectedCohort.backlogCount} students)
                  </span>
                  <span className="text-[11px] text-text-muted">
                    Automatically tags students for supplementary retake slots in Welsh-Powell routine solver.
                  </span>
                </div>
              </label>
            </div>

            <div className="p-3 rounded-xl bg-surface-muted border border-border text-xs text-text-muted flex items-center justify-between">
              <span>Total Promoted Students:</span>
              <span className="font-extrabold text-text font-ui">{selectedCohort.eligibleCount} Medicos</span>
            </div>
          </div>
        )}
      </Dialog>

      {/* ─── CREATE / EDIT SEMESTER MODAL ─── */}
      <Dialog
        open={modalMode !== null}
        onClose={() => setModalMode(null)}
        title={modalMode === "create" ? "Create Semester" : "Edit Semester"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalMode(null)}>
              Cancel
            </Button>
            <Button type="submit" form="sem-form" loading={createMutation.isPending || updateMutation.isPending}>
              {modalMode === "create" ? "Create semester" : "Save changes"}
            </Button>
          </>
        }
      >
        <form id="sem-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Semester Name" htmlFor="sem-name" required>
              <Input
                id="sem-name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Fall 2026"
                required
              />
            </FormField>
            <FormField label="Code" htmlFor="sem-code" required>
              <Input
                id="sem-code"
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                placeholder="e.g. 01"
                required
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Start Month" htmlFor="sem-start" required>
              <Select
                id="sem-start"
                value={form.startMonth}
                onChange={(e) => setForm((p) => ({ ...p, startMonth: e.target.value }))}
                placeholder="Select month..."
                required
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="End Month" htmlFor="sem-end" required>
              <Select
                id="sem-end"
                value={form.endMonth}
                onChange={(e) => setForm((p) => ({ ...p, endMonth: e.target.value }))}
                placeholder="Select month..."
                required
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete semester?"
        tone="danger"
        confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete"}
        loading={deleteMutation.isPending}
        description={
          <>
            You are about to permanently delete <strong className="text-text">{deleteTarget?.name}</strong>. Enrollments
            and schedules tied to this semester will need review.
          </>
        }
      />
    </div>
  );
}
