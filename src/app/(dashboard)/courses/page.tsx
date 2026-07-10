"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { BookOpen, Plus, Trash2, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import {
  PageHeader,
  Card,
  FormField,
  Input,
  Textarea,
  Button,
  IconButton,
  Badge,
  Modal,
} from "@/components/ui";

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

  const canManage = roleIs("domain-admin", "super-admin");

  const { data: courses = [], isLoading } = useQuery<CourseRow[]>({
    queryKey: ["courses"],
    queryFn: api.getCourses,
  });

  const createCourseMutation = useMutation({
    mutationFn: api.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setShowAddModal(false);
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
      code: newCode.toUpperCase(),
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
      accessor: (row) => (
        <Link
          href={`/courses/${row.code}`}
          className="font-mono font-bold text-gold hover:underline"
        >
          {row.code}
        </Link>
      ),
    },
    {
      header: "Course Title",
      accessor: (row) => (
        <Link
          href={`/courses/${row.code}`}
          className="font-semibold text-text hover:text-gold transition-colors"
        >
          {row.title}
        </Link>
      ),
    },
    {
      header: "Credit Weight",
      accessor: (row) => (
        <Badge variant="neutral" size="sm">
          {row.credits} Credits
        </Badge>
      ),
    },
    {
      header: "Curriculum Description",
      accessor: (row) => (
        <span className="text-xs text-text-muted block max-w-sm truncate">
          {row.description || "Standard syllabus outline"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <Link href={`/courses/${row.code}`}>
            <Button variant="outline" size="sm" rightIcon={<ArrowRight size={12} />}>
              Curriculum
            </Button>
          </Link>
          {canManage && (
            <IconButton
              label="Delete course"
              variant="danger"
              size="sm"
              onClick={() => handleDeleteCourse(row._id)}
            >
              <Trash2 size={13} />
            </IconButton>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Course Registry & Curriculum"
        description="Institutional academic syllabus, credit weight allocation, and faculty course assignments."
        breadcrumb={[{ label: "Academics" }, { label: "Courses" }]}
        actions={
          canManage && (
            <Button
              variant="gold"
              leftIcon={<Plus size={15} />}
              onClick={() => setShowAddModal(true)}
            >
              Create Course
            </Button>
          )
        }
      />

      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : (
        <Card noPadding>
          <DataTable<CourseRow>
            data={courses}
            columns={columns}
            searchPlaceholder="Search courses by code or title..."
            searchField="title"
          />
        </Card>
      )}

      {/* Unified Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register New Academic Course"
        subtitle="Configure code identifier, credit hours, and syllabus summary"
        size="md"
      >
        <form onSubmit={handleAddCourseSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <FormField label="Course Code" required>
                <Input
                  type="text"
                  placeholder="e.g. ANAT-101"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="uppercase font-mono"
                  required
                />
              </FormField>
            </div>
            <div>
              <FormField label="Credits" required>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={newCredits}
                  onChange={(e) => setNewCredits(Number(e.target.value))}
                  className="font-mono"
                  required
                />
              </FormField>
            </div>
          </div>

          <FormField label="Course Title" required>
            <Input
              type="text"
              placeholder="e.g. Human Gross Anatomy & Histology"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Curriculum Description & Objectives">
            <Textarea
              placeholder="Provide course learning objectives, syllabus modules, or clinical competencies..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={3}
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createCourseMutation.isPending}
              leftIcon={<Plus size={14} />}
            >
              Save Course
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
