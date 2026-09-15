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
import { Plus, Pencil, Trash2 } from "lucide-react";

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

const EMPTY_FORM: SemForm = { name: "", code: "", startMonth: "", endMonth: "" };

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function SemestersPage() {
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const canModify = roleIs("super-admin", "domain-admin");

  const [successMsg, setSuccessMsg] = useState("");
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<SemForm>(EMPTY_FORM);
  const [selectedSem, setSelectedSem] = useState<Semester | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Semester | null>(null);

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
    <div className="space-y-5">
      <PageHeader
        title="Academic Semesters"
        description="Manage academic semesters and their time periods."
        actions={
          canModify ? (
            <Button leftIcon={<Plus size={15} aria-hidden="true" />} onClick={openCreate}>
              Add Semester
            </Button>
          ) : undefined
        }
      />

      {successMsg && (
        <Alert tone="success" className="max-w-xl">
          {successMsg}
        </Alert>
      )}

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
