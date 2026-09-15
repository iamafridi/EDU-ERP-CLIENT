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

interface Department {
  id: string;
  name: string;
  academicFaculty: string;
}

interface DeptForm {
  name: string;
  academicFaculty: string;
}

const EMPTY_FORM: DeptForm = { name: "", academicFaculty: "" };

export default function DepartmentsPage() {
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const canModify = roleIs("super-admin", "domain-admin");

  const [successMsg, setSuccessMsg] = useState("");
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<DeptForm>(EMPTY_FORM);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  const { data: departments = [], isLoading } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: api.getAcademicDepartments,
  });

  const { data: faculties = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["academicFaculties"],
    queryFn: api.getAcademicFaculties,
  });

  const createMutation = useMutation({
    mutationFn: api.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setSuccessMsg("Department created successfully.");
      setModalMode(null);
      setForm(EMPTY_FORM);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: DeptForm }) =>
      api.updateDepartment(payload.id, payload.data as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setSuccessMsg("Department updated successfully.");
      setModalMode(null);
      setSelectedDept(null);
      setForm(EMPTY_FORM);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setSuccessMsg("Department deleted successfully.");
      setDeleteTarget(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setSelectedDept(null);
    setModalMode("create");
  };

  const openEdit = (dept: Department) => {
    setSelectedDept(dept);
    setForm({ name: dept.name, academicFaculty: String(typeof dept.academicFaculty === "string" ? dept.academicFaculty : (dept.academicFaculty as { name?: string })?.name ?? "") });
    setModalMode("edit");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "create") {
      createMutation.mutate(form);
    } else if (modalMode === "edit" && selectedDept) {
      updateMutation.mutate({ id: selectedDept.id, data: form });
    }
  };

  const columns: Column<Department>[] = [
    {
      header: "Department Name",
      accessor: (row) => <span className="font-medium text-text">{row.name}</span>,
      sortValue: (row) => row.name,
    },
    {
      header: "Faculty Division",
      accessor: (row) => (
        <span className="text-text-muted">
          {typeof row.academicFaculty === "string" ? row.academicFaculty : (row.academicFaculty as { name?: string })?.name ?? ""}
        </span>
      ),
      sortValue: (row) => (typeof row.academicFaculty === "string" ? row.academicFaculty : ""),
    },
    ...(canModify
      ? [
          {
            header: "Actions",
            id: "actions",
            sortable: false,
            hideable: false,
            accessor: (row: Department) => (
              <div className="flex items-center gap-1">
                <IconButton label={`Edit ${row.name}`} size="sm" onClick={() => openEdit(row)}>
                  <Pencil size={14} aria-hidden="true" />
                </IconButton>
                <IconButton label={`Delete ${row.name}`} size="sm" variant="danger" onClick={() => setDeleteTarget(row)}>
                  <Trash2 size={14} aria-hidden="true" />
                </IconButton>
              </div>
            ),
          } as Column<Department>,
        ]
      : []),
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Academic Departments"
        description="Manage academic divisions and their faculty mappings."
        actions={
          canModify ? (
            <Button leftIcon={<Plus size={15} aria-hidden="true" />} onClick={openCreate}>
              Add Department
            </Button>
          ) : undefined
        }
      />

      {successMsg && (
        <Alert tone="success" className="max-w-xl">
          {successMsg}
        </Alert>
      )}

      <DataTable<Department>
        data={departments}
        columns={columns}
        loading={isLoading}
        searchPlaceholder="Search departments by name..."
        searchField="name"
        tableId="departments"
        emptyTitle="No departments yet"
        emptyDescription="Create your first department to organize courses and faculty."
        emptyAction={
          canModify ? (
            <Button size="sm" leftIcon={<Plus size={14} aria-hidden="true" />} onClick={openCreate}>
              Add Department
            </Button>
          ) : undefined
        }
      />

      <Dialog
        open={modalMode !== null}
        onClose={() => setModalMode(null)}
        title={modalMode === "create" ? "Create Department" : "Edit Department"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalMode(null)}>
              Cancel
            </Button>
            <Button type="submit" form="dept-form" loading={createMutation.isPending || updateMutation.isPending}>
              {modalMode === "create" ? "Create department" : "Save changes"}
            </Button>
          </>
        }
      >
        <form id="dept-form" onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Department Name" htmlFor="dept-name" required>
            <Input
              id="dept-name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Computer Science"
              required
            />
          </FormField>
          <FormField label="Faculty Division" htmlFor="dept-faculty" required>
            <Select
              id="dept-faculty"
              value={form.academicFaculty}
              onChange={(e) => setForm((p) => ({ ...p, academicFaculty: e.target.value }))}
              placeholder="Select faculty..."
              required
            >
              {faculties.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.name}
                </option>
              ))}
            </Select>
          </FormField>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete department?"
        tone="danger"
        confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete"}
        loading={deleteMutation.isPending}
        description={
          <>
            You are about to permanently delete <strong className="text-text">{deleteTarget?.name}</strong>. Courses
            linked to this department will need to be reassigned.
          </>
        }
      />
    </div>
  );
}
