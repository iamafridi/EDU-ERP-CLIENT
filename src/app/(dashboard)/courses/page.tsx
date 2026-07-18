"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { BookOpen, Plus, Sparkles, BookMarked } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";

interface CourseRow {
  _id: string;
  code: string;
  title: string;
  credits: number;
  description?: string;
}

export default function CourseRegistryPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCredits, setNewCredits] = useState(3);
  const [newDesc, setNewDesc] = useState("");

  const { data: courses = [], isLoading } = useQuery<CourseRow[]>({
    queryKey: ["courses"],
    queryFn: api.getCourses,
  });

  const createCourseMutation = useMutation({
    mutationFn: api.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setShowAddModal(false);
      // Reset form
      setNewCode("");
      setNewTitle("");
      setNewCredits(3);
      setNewDesc("");
    },
  });

  const handleAddCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newTitle || !newCredits) return;

    createCourseMutation.mutate({
      code: newCode,
      title: newTitle,
      credits: Number(newCredits),
      description: newDesc,
    });
  };

  const deleteCourseMutation = useMutation({
    mutationFn: api.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  const handleDeleteCourse = (id: string) => {
    if (confirm("Are you sure you want to delete this course record?")) {
      deleteCourseMutation.mutate(id);
    }
  };

  const columns: Column<CourseRow>[] = [
    {
      header: "Course Code",
      accessor: "code",
      className: "font-mono font-bold text-[#2563EB]",
    },
    {
      header: "Course Title",
      accessor: (row) => (
        <Link href={`/courses/${row.code}`} className="font-semibold text-slate-800 hover:text-[#2563EB] transition-colors">
          {row.title}
        </Link>
      ),
    },
    {
      header: "Credits",
      accessor: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-xs font-mono">
          {row.credits} Credits
        </span>
      ),
    },
    {
      header: "Description Summary",
      accessor: (row) => (
        <span className="text-xs text-slate-400 block max-w-sm truncate">
          {row.description || "No description provided."}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        roleIs("domain-admin", "super-admin") ? (
          <button
            onClick={() => handleDeleteCourse(row._id)}
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
            Course Catalog
            <BookOpen size={22} className="text-[#2563EB]" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Displaying institutional courses and credits registration details.
          </p>
        </div>

        {roleIs("domain-admin", "super-admin") && (
          <button
            onClick={() => setShowAddModal(true)}
            className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus size={16} />
            Create New Course
          </button>
        )}
      </div>

      {/* Main Table view */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : (
        <DataTable<CourseRow>
          data={courses}
          columns={columns}
          searchPlaceholder="Search courses by code or title..."
          searchField="title"
        />
      )}

      {/* Create Course Dialog (Framer Motion) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white border border-[#c3c6d7] shadow-xl rounded-xl p-6 relative font-sans"
            >
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BookMarked size={20} className="text-[#2563EB]" />
                Create New Course Profile
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">
                Establish curriculum parameters for student registration and mapping.
              </p>

              <form onSubmit={handleAddCourseSubmit} className="space-y-4 mt-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Course Code</label>
                    <input
                      type="text"
                      placeholder="e.g. CS-301"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all uppercase"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Credits</label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={newCredits}
                      onChange={(e) => setNewCredits(Number(e.target.value))}
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Course Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Advanced Database Systems"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Description Summary</label>
                  <textarea
                    placeholder="Course objectives, curriculum summary..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full h-20 px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e1e2ed] mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createCourseMutation.isPending}
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2"
                  >
                    {createCourseMutation.isPending ? "Creating..." : "Save Course"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
