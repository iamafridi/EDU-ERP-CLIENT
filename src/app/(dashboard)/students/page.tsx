"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { UserPlus, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";

interface StudentRow {
  id?: string;
  studentId: string;
  name: string;
  email: string;
  academicDepartment: string;
  roomNumber?: string;
  gender: string;
}

export default function StudentDirectoryPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();

  const { data: students = [], isLoading } = useQuery<StudentRow[]>({
    queryKey: ["students"],
    queryFn: api.getStudents,
  });

  const deleteStudentMutation = useMutation({
    mutationFn: api.deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const handleDeleteStudent = (id: string) => {
    if (confirm("Are you sure you want to delete this student record?")) {
      deleteStudentMutation.mutate(id);
    }
  };

  const columns: Column<StudentRow>[] = [
    {
      header: "Student Name",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-bold text-xs">
            {(typeof row.name === 'string' ? row.name : (row.name as any)?.firstName ?? '').charAt(0) || '?'}
          </div>
          <Link href={`/students/${row.studentId}`} className="font-semibold text-slate-800 hover:text-[#2563EB] transition-colors">
            {(typeof row.name === 'string' ? row.name : `${(row.name as any)?.firstName ?? ''} ${(row.name as any)?.lastName ?? ''}`.trim()) || ''}
          </Link>
        </div>
      ),
    },
    {
      header: "Student ID",
      accessor: "studentId",
      className: "font-mono text-slate-500",
    },
    { header: "Email Address", accessor: "email" },
    { header: "Department", accessor: "academicDepartment" },
    {
      header: "Dorm Room",
      accessor: (row) => (
        <span className="inline-flex items-center px-2 py-1 rounded bg-[#d0e1fb]/40 text-[#2563EB] font-semibold text-xs font-mono">
          {row.roomNumber || "Unallocated"}
        </span>
      ),
    },
    { header: "Gender", accessor: "gender" },
    {
      header: "Actions",
      accessor: (row) => (
        roleIs("domain-admin", "super-admin") ? (
          <button
            onClick={() => handleDeleteStudent(row.id || row.studentId)}
            className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
          >
            Delete
          </button>
        ) : null
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Student Management
            <Sparkles size={18} className="text-[#2563EB]" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Displaying all registered student records and room allocations.
          </p>
        </div>

        {roleIs("domain-admin", "super-admin") && (
          <Link href="/students/register">
            <span className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow flex items-center gap-2 transition-all cursor-pointer">
              <UserPlus size={16} />
              Onboard Student
            </span>
          </Link>
        )}
      </div>

      {/* Main Table view */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : (
        <DataTable<StudentRow>
          data={students}
          columns={columns}
          searchPlaceholder="Search students by name or ID..."
          searchField="name"
        />
      )}
    </div>
  );
}
