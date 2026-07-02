"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import DataTable, { Column } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button, IconButton } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/Card";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { UserPlus, Trash2, Eye, FileText, Stethoscope } from "lucide-react";
import { usePermission } from "@/hooks/usePermission";
import { showToast } from "@/components/dashboard/ToastFeedback";

interface StudentRow {
  id?: string;
  studentId: string;
  name: string;
  email: string;
  academicDepartment: string;
  roomNumber?: string;
  gender: string;
}

function displayName(name: StudentRow["name"]): string {
  if (typeof name === "string") return name;
  const obj = name as { firstName?: string; lastName?: string } | null;
  return `${obj?.firstName ?? ""} ${obj?.lastName ?? ""}`.trim();
}

export default function StudentDirectoryPage() {
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const isAdmin = roleIs("domain-admin", "super-admin");

  const { data: students = [], isLoading } = useQuery<StudentRow[]>({
    queryKey: ["students"],
    queryFn: api.getStudents,
  });

  const deleteStudentMutation = useMutation({
    mutationFn: api.deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      showToast({
        title: "Student Record Removed",
        description: "The student record was successfully archived from active rosters.",
        variant: "success",
      });
    },
    onError: (err: any) => {
      showToast({
        title: "Deletion Failed",
        description: err?.response?.data?.message || "Failed to remove student record.",
        variant: "error",
      });
    },
  });

  // Pending destructive action, confirmed via ConfirmDialog.
  const [deleteTarget, setDeleteTarget] = useState<{ ids: string[]; label: string } | null>(null);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteTarget.ids.forEach((id) => deleteStudentMutation.mutate(id));
    setDeleteTarget(null);
  };

  const columns: Column<StudentRow>[] = [
    {
      header: "Student Name",
      accessor: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={displayName(row.name)} size="sm" />
          <a
            href={`/students/${row.studentId}`}
            className="font-medium text-text hover:text-primary transition-colors"
          >
            {displayName(row.name) || "Unknown"}
          </a>
        </div>
      ),
      sortValue: (row) => displayName(row.name),
    },
    {
      header: "Student ID",
      accessor: "studentId",
      className: "font-mono text-text-muted tabular-nums",
    },
    { header: "Email Address", accessor: "email" },
    { header: "Department", accessor: "academicDepartment" },
    {
      header: "Dorm Room",
      accessor: (row) =>
        row.roomNumber ? (
          <Badge tone="primary" className="font-mono">
            {row.roomNumber}
          </Badge>
        ) : (
          <span className="text-xs text-text-subtle">Unallocated</span>
        ),
      sortValue: (row) => row.roomNumber || "",
    },
    { header: "Gender", accessor: "gender" },
    {
      header: "Actions",
      id: "actions",
      sortable: false,
      hideable: false,
      accessor: (row) => {
        const studentIdentifier = row.studentId || row.id;
        const studentName = displayName(row.name) || studentIdentifier;

        const menuItems = [
          {
            label: "View Full Profile",
            icon: <Eye size={13} className="text-gold" />,
            onClick: () => {
              window.location.href = `/students/${studentIdentifier}`;
            },
          },
          {
            label: "Academic Transcripts",
            icon: <FileText size={13} className="text-text-muted" />,
            onClick: () => {
              window.location.href = `/transcripts`;
            },
          },
          {
            label: "Clinical DOPS Logbook",
            icon: <Stethoscope size={13} className="text-emerald-500" />,
            onClick: () => {
              window.location.href = `/skill-lab`;
            },
          },
          ...(isAdmin
            ? [
                {
                  label: "Delete Student",
                  icon: <Trash2 size={13} className="text-red-500" />,
                  variant: "danger" as const,
                  divider: true,
                  onClick: () =>
                    setDeleteTarget({
                      ids: [String(row.id || row.studentId || "")],
                      label: String(studentName || "Student"),
                    }),
                },
              ]
            : []),
        ];

        return (
          <div className="flex items-center gap-1.5 justify-end">
            <a
              href={`/students/${studentIdentifier}`}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-surface-muted/60 hover:bg-gold-soft hover:text-gold text-text transition-colors inline-flex items-center gap-1"
            >
              <Eye size={12} /> Dossier
            </a>
            <ActionMenu items={menuItems} align="right" />
          </div>
        );
      },
    },
  ];

  const allocated = students.filter((s) => s.roomNumber).length;
  const departments = new Set(students.map((s) => s.academicDepartment).filter(Boolean)).size;
  const allocationRate = students.length > 0 ? Math.round((allocated / students.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Students"
        description="Registered student records, contact details and room allocations."
        actions={
          isAdmin ? (
            <Button leftIcon={<UserPlus size={15} aria-hidden="true" />} onClick={() => (window.location.href = "/students/register")}>
              Onboard Student
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total Students" value={students.length} />
        <StatCard label="Rooms Allocated" value={allocated} />
        <StatCard label="Departments" value={departments} />
      </div>

      <DataTable<StudentRow>
        data={students}
        columns={columns}
        loading={isLoading}
        searchPlaceholder="Search students by name or ID..."
        searchField="name"
        tableId="students-directory"
        selectable={isAdmin}
        rowKey={(row) => row.id || row.studentId}
        emptyTitle="No students yet"
        emptyDescription="Onboard your first student to see them listed here."
        emptyAction={
          isAdmin ? (
            <Button size="sm" leftIcon={<UserPlus size={14} aria-hidden="true" />} onClick={() => (window.location.href = "/students/register")}>
              Onboard Student
            </Button>
          ) : undefined
        }
        bulkActions={
          isAdmin
            ? (selectedRows) => (
                <Button
                  size="sm"
                  variant="danger"
                  leftIcon={<Trash2 size={13} aria-hidden="true" />}
                  onClick={() =>
                    setDeleteTarget({
                      ids: selectedRows.map((r) => r.id || r.studentId),
                      label: `${selectedRows.length} student${selectedRows.length === 1 ? "" : "s"}`,
                    })
                  }
                >
                  Delete selected
                </Button>
              )
            : undefined
        }
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete student record?"
        tone="danger"
        confirmLabel={deleteStudentMutation.isPending ? "Deleting..." : "Delete"}
        loading={deleteStudentMutation.isPending}
        description={
          <>
            You are about to permanently delete <strong className="text-text">{deleteTarget?.label}</strong>. Their
            record, room allocation and linked data will be removed.
          </>
        }
      />
    </div>
  );
}