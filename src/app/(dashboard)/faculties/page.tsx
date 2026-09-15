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
import { Avatar } from "@/components/ui/Avatar";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface FacultyRow {
  id?: string;
  facultyId: string;
  name: string;
  email: string;
  contactNo: string;
  designation: string;
  academicDepartment: string;
}

interface FacultyForm {
  name: string;
  email: string;
  contactNo: string;
  designation: string;
  academicDepartment: string;
}

const EMPTY_FORM: FacultyForm = {
  name: "",
  email: "",
  contactNo: "",
  designation: "Professor",
  academicDepartment: "",
};

function displayName(name: FacultyRow["name"]): string {
  if (typeof name === "string") return name;
  const obj = name as { firstName?: string; lastName?: string } | null;
  return `${obj?.firstName ?? ""} ${obj?.lastName ?? ""}`.trim();
}

export default function FacultyDirectoryPage() {
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const canModify = roleIs("super-admin", "domain-admin");

  const [successMsg, setSuccessMsg] = useState("");
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<FacultyForm>(EMPTY_FORM);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FacultyRow | null>(null);

  const { data: faculties = [], isLoading } = useQuery<FacultyRow[]>({
    queryKey: ["faculties"],
    queryFn: api.getFaculties,
  });

  const { data: departments = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["departments"],
    queryFn: api.getAcademicDepartments,
  });

  const deptOptions =
    departments.length > 0
      ? departments.map((d) => d.name)
      : ["Computer Science", "Microbiology", "Cardiology", "Neurology"];

  const createFacultyMutation = useMutation({
    mutationFn: api.createFaculty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
      setModalMode(null);
      setForm(EMPTY_FORM);
      setSuccessMsg("Faculty created successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: Record<string, unknown> }) =>
      api.updateFaculty(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
      setSuccessMsg("Faculty updated successfully.");
      setModalMode(null);
      setSelectedFaculty(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteFaculty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
      setSuccessMsg("Faculty deleted successfully.");
      setDeleteTarget(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setSelectedFaculty(null);
    setModalMode("create");
  };

  const openEdit = (fac: FacultyRow) => {
    setSelectedFaculty(fac);
    setForm({
      name: displayName(fac.name),
      email: fac.email,
      contactNo: fac.contactNo,
      designation: fac.designation,
      academicDepartment: fac.academicDepartment,
    });
    setModalMode("edit");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "create") {
      createFacultyMutation.mutate({
        password: "facultypassword123",
        faculty: { ...form },
      });
    } else if (modalMode === "edit" && selectedFaculty) {
      updateMutation.mutate({
        id: selectedFaculty.id || selectedFaculty.facultyId,
        data: { ...form },
      });
    }
  };

  const columns: Column<FacultyRow>[] = [
    {
      header: "Faculty Name",
      accessor: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={displayName(row.name)} size="sm" />
          <a
            href={`/faculties/${row.facultyId}`}
            className="font-medium text-text hover:text-primary transition-colors"
          >
            {displayName(row.name) || "Unknown"}
          </a>
        </div>
      ),
      sortValue: (row) => displayName(row.name),
    },
    {
      header: "Faculty ID",
      accessor: "facultyId",
      className: "font-mono text-text-muted tabular-nums",
    },
    { header: "Designation", accessor: "designation" },
    { header: "Department", accessor: "academicDepartment" },
    { header: "Email Address", accessor: "email" },
    { header: "Contact Number", accessor: "contactNo", className: "tabular-nums" },
    ...(canModify
      ? [
          {
            header: "Actions",
            id: "actions",
            sortable: false,
            hideable: false,
            accessor: (row: FacultyRow) => (
              <div className="flex items-center gap-1">
                <IconButton label={`Edit ${displayName(row.name) || row.facultyId}`} size="sm" onClick={() => openEdit(row)}>
                  <Pencil size={14} aria-hidden="true" />
                </IconButton>
                <IconButton
                  label={`Delete ${displayName(row.name) || row.facultyId}`}
                  size="sm"
                  variant="danger"
                  onClick={() => setDeleteTarget(row)}
                >
                  <Trash2 size={14} aria-hidden="true" />
                </IconButton>
              </div>
            ),
          } as Column<FacultyRow>,
        ]
      : []),
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Faculty Directory"
        description="Registered academic staff, designations and department assignments."
        actions={
          canModify ? (
            <Button leftIcon={<Plus size={15} aria-hidden="true" />} onClick={openCreate}>
              Onboard Faculty
            </Button>
          ) : undefined
        }
      />

      {successMsg && (
        <Alert tone="success" className="max-w-xl">
          {successMsg}
        </Alert>
      )}

      <DataTable<FacultyRow>
        data={faculties}
        columns={columns}
        loading={isLoading}
        searchPlaceholder="Search faculty by name..."
        searchField="name"
        tableId="faculty-directory"
        emptyTitle="No faculty records yet"
        emptyDescription="Onboard your first faculty member to get started."
        emptyAction={
          canModify ? (
            <Button size="sm" leftIcon={<Plus size={14} aria-hidden="true" />} onClick={openCreate}>
              Onboard Faculty
            </Button>
          ) : undefined
        }
      />

      {/* Create / Edit dialog */}
      <Dialog
        open={modalMode !== null}
        onClose={() => setModalMode(null)}
        title={modalMode === "create" ? "Onboard New Faculty Member" : "Edit Faculty"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalMode(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="faculty-form"
              loading={createFacultyMutation.isPending || updateMutation.isPending}
            >
              {modalMode === "create" ? "Create faculty" : "Save changes"}
            </Button>
          </>
        }
      >
        <form id="faculty-form" onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Full Name" htmlFor="fac-name" required>
            <Input
              id="fac-name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Dr. Evelyn Parker"
              required
            />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Academic Email" htmlFor="fac-email" required>
              <Input
                id="fac-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="e.parker@college.edu"
                required
              />
            </FormField>
            <FormField label="Contact Number" htmlFor="fac-contact" required>
              <Input
                id="fac-contact"
                value={form.contactNo}
                onChange={(e) => setForm((p) => ({ ...p, contactNo: e.target.value }))}
                placeholder="+1 555-4831"
                required
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Designation" htmlFor="fac-designation">
              <Select
                id="fac-designation"
                value={form.designation}
                onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))}
              >
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer</option>
              </Select>
            </FormField>
            <FormField label="Assigned Department" htmlFor="fac-dept" required>
              <Select
                id="fac-dept"
                value={form.academicDepartment}
                onChange={(e) => setForm((p) => ({ ...p, academicDepartment: e.target.value }))}
                placeholder="Select department..."
                required
              >
                {deptOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        </form>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id || deleteTarget.facultyId)}
        title="Delete faculty record?"
        tone="danger"
        confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete"}
        loading={deleteMutation.isPending}
        description={
          <>
            You are about to permanently delete{" "}
            <strong className="text-text">{deleteTarget ? displayName(deleteTarget.name) : ""}</strong>. Their profile
            and course assignments will be removed.
          </>
        }
      />
    </div>
  );
}
