"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePermission } from "@/hooks/usePermission";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion } from "framer-motion";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  FileText,
  Clock,
  Award,
} from "lucide-react";
import {
  PageHeader,
  Card,
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

interface Syllabus {
  id: string;
  courseCode: string;
  courseName: string;
  department: string;
  semester: number;
  credits: number;
  objectives: string;
  topics: string;
  textbooks: string;
  evaluation: string;
  status: "draft" | "approved" | "published";
}

const MOCK_SYLLABUS: Syllabus[] = [
  {
    id: "SYL-001",
    courseCode: "MBBS-101",
    courseName: "Anatomy - I",
    department: "Anatomy",
    semester: 1,
    credits: 4,
    objectives: "Understand gross anatomy of human body and clinical correlations.",
    topics: "General anatomy, Upper limb, Lower limb, Thorax",
    textbooks: "Gray's Anatomy, BDC Vol 1",
    evaluation: "Internal 40 + External 60",
    status: "published",
  },
  {
    id: "SYL-002",
    courseCode: "MBBS-102",
    courseName: "Physiology - I",
    department: "Physiology",
    semester: 1,
    credits: 4,
    objectives: "Understand fundamental human physiological mechanisms.",
    topics: "General physiology, Blood, Nerve-Muscle, CNS",
    textbooks: "Guyton & Hall, Sembulingam",
    evaluation: "Internal 40 + External 60",
    status: "published",
  },
  {
    id: "SYL-003",
    courseCode: "MBBS-103",
    courseName: "Biochemistry - I",
    department: "Biochemistry",
    semester: 1,
    credits: 4,
    objectives: "Understand molecular pathways, enzymatic kinetics, and bioenergetics.",
    topics: "Cell biology, Enzymes, Carbohydrates, Lipids",
    textbooks: "Harper's Illustrated Biochemistry, Satyanarayana",
    evaluation: "Internal 40 + External 60",
    status: "approved",
  },
  {
    id: "SYL-004",
    courseCode: "MBBS-201",
    courseName: "Anatomy - II",
    department: "Anatomy",
    semester: 2,
    credits: 4,
    objectives: "Understand abdomen, pelvis, neuroanatomy, and embryology.",
    topics: "Abdomen, Pelvis, Head & Neck, Brain",
    textbooks: "Gray's Anatomy, BDC Vol 2",
    evaluation: "Internal 40 + External 60",
    status: "draft",
  },
];

export default function SyllabusPage() {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Syllabus | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState({
    courseCode: "",
    courseName: "",
    department: "",
    semester: "1",
    credits: "4",
    objectives: "",
    topics: "",
    textbooks: "",
    evaluation: "",
    status: "draft",
  });

  const isEditor = can("update", "syllabus");

  const { data: syllabusList = MOCK_SYLLABUS, isLoading } = useQuery({
    queryKey: ["syllabus"],
    queryFn: async () => MOCK_SYLLABUS,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return { success: true, data: { id: `SYL-${Date.now()}`, ...payload } };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syllabus"] });
      closeModal();
      setSuccessMsg("Course syllabus created successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syllabus"] });
      closeModal();
      setSuccessMsg("Course syllabus updated successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syllabus"] });
      setSuccessMsg("Syllabus deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setForm({
      courseCode: "",
      courseName: "",
      department: "",
      semester: "1",
      credits: "4",
      objectives: "",
      topics: "",
      textbooks: "",
      evaluation: "",
      status: "draft",
    });
  };

  const openEdit = (item: Syllabus) => {
    setEditItem(item);
    setForm({
      courseCode: item.courseCode,
      courseName: item.courseName,
      department: item.department,
      semester: String(item.semester),
      credits: String(item.credits),
      objectives: item.objectives,
      topics: item.topics,
      textbooks: item.textbooks,
      evaluation: item.evaluation,
      status: item.status,
    });
    setShowModal(true);
  };

  const openCreate = () => {
    setForm({
      courseCode: "",
      courseName: "",
      department: "",
      semester: "1",
      credits: "4",
      objectives: "",
      topics: "",
      textbooks: "",
      evaluation: "",
      status: "draft",
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, semester: Number(form.semester), credits: Number(form.credits) };
    if (editItem) updateMutation.mutate({ id: editItem.id, data: payload });
    else createMutation.mutate(payload);
  };

  const publishedCount = syllabusList.filter((s: Syllabus) => s.status === "published").length;
  const draftCount = syllabusList.filter((s: Syllabus) => s.status === "draft").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Syllabus"
        subtitle="Manage academic curriculum, credit distributions, learning objectives, and prescribed textbooks."
        actions={
          isEditor ? (
            <Button
              variant="gold"
              size="md"
              onClick={openCreate}
              icon={<Plus size={15} />}
            >
              Add Syllabus
            </Button>
          ) : undefined
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

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-text">{syllabusList.length}</p>
            <p className="text-xs text-text-muted font-medium">Total Curriculum Syllabi</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-success-soft text-success flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-text">{publishedCount}</p>
            <p className="text-xs text-text-muted font-medium">Published & Active</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-warning-soft text-warning flex items-center justify-center">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-text">{draftCount}</p>
            <p className="text-xs text-text-muted font-medium">Under Review / Drafts</p>
          </div>
        </Card>
      </div>

      {/* Syllabus Table */}
      <Card noPadding>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Approved Curriculum Outlines
          </span>
          <Badge variant="neutral">{syllabusList.length} courses</Badge>
        </div>

        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={4} cols={6} />
          </div>
        ) : syllabusList.length === 0 ? (
          <EmptyState
            title="No Syllabi Registered"
            description="Add course syllabi to outline credit hours and learning objectives."
            icon={<BookOpen size={28} className="text-gold" />}
            action={
              isEditor ? (
                <Button variant="gold" onClick={openCreate} icon={<Plus size={15} />}>
                  Add First Syllabus
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted/50 border-b border-border">
                  <th className="p-3 text-[11px] font-semibold text-text-muted uppercase">Course</th>
                  <th className="p-3 text-[11px] font-semibold text-text-muted uppercase">Department</th>
                  <th className="p-3 text-[11px] font-semibold text-text-muted uppercase">Semester</th>
                  <th className="p-3 text-[11px] font-semibold text-text-muted uppercase">Credits</th>
                  <th className="p-3 text-[11px] font-semibold text-text-muted uppercase">Status</th>
                  {isEditor && (
                    <th className="p-3 text-[11px] font-semibold text-text-muted uppercase text-right">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {syllabusList.map((item: Syllabus) => (
                  <tr key={item.id} className="hover:bg-surface-hover text-xs">
                    <td className="p-3">
                      <div>
                        <p className="font-semibold text-text">{item.courseName}</p>
                        <p className="text-[11px] text-text-subtle font-mono">{item.courseCode}</p>
                      </div>
                    </td>
                    <td className="p-3 text-text-muted">{item.department}</td>
                    <td className="p-3 font-medium text-text">Term {item.semester}</td>
                    <td className="p-3 font-mono font-medium text-text">{item.credits} Cr</td>
                    <td className="p-3">
                      <Badge
                        variant={
                          item.status === "published"
                            ? "success"
                            : item.status === "approved"
                            ? "primary"
                            : "warning"
                        }
                        size="sm"
                      >
                        {item.status.toUpperCase()}
                      </Badge>
                    </td>
                    {isEditor && (
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <IconButton
                            variant="ghost"
                            size="sm"
                            label="Edit Syllabus"
                            icon={<Pencil size={13} />}
                            onClick={() => openEdit(item)}
                          />
                          <IconButton
                            variant="ghost"
                            size="sm"
                            label="Delete Syllabus"
                            icon={<Trash2 size={13} className="text-rose-500" />}
                            onClick={() => {
                              if (confirm(`Delete syllabus for ${item.courseName}?`)) {
                                deleteMutation.mutate(item.id);
                              }
                            }}
                          />
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

      {/* Modal for Create/Edit */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editItem ? "Edit Course Syllabus" : "New Course Syllabus"}
        subtitle="Specify academic credits, syllabus topics, and reference books"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Course Code" required>
              <Input
                value={form.courseCode}
                onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
                placeholder="MBBS-101"
                className="font-mono"
                required
              />
            </FormField>
            <FormField label="Course Title" required>
              <Input
                value={form.courseName}
                onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                placeholder="Gross Anatomy - I"
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Department" required>
              <Input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="Anatomy"
                required
              />
            </FormField>
            <FormField label="Semester / Term" required>
              <Input
                type="number"
                min={1}
                max={12}
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Credits" required>
              <Input
                type="number"
                min={1}
                max={10}
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: e.target.value })}
                required
              />
            </FormField>
          </div>

          <FormField label="Course Learning Objectives" required>
            <Textarea
              value={form.objectives}
              onChange={(e) => setForm({ ...form, objectives: e.target.value })}
              rows={2}
              placeholder="Primary academic objectives and cognitive outcomes..."
              required
            />
          </FormField>

          <FormField label="Core Topics & Curriculum Outline" required>
            <Textarea
              value={form.topics}
              onChange={(e) => setForm({ ...form, topics: e.target.value })}
              rows={2}
              placeholder="List syllabus chapters and modular topics..."
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Prescribed Textbooks">
              <Input
                value={form.textbooks}
                onChange={(e) => setForm({ ...form, textbooks: e.target.value })}
                placeholder="e.g. Gray's Anatomy, Guyton & Hall"
              />
            </FormField>
            <FormField label="Evaluation Schema">
              <Input
                value={form.evaluation}
                onChange={(e) => setForm({ ...form, evaluation: e.target.value })}
                placeholder="e.g. Internal 40 + Final Exam 60"
              />
            </FormField>
          </div>

          <FormField label="Publication Status" required>
            <Select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="draft">Draft (Under Faculty Review)</option>
              <option value="approved">Approved (Department Head Signed)</option>
              <option value="published">Published (Visible to Students)</option>
            </Select>
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createMutation.isPending || updateMutation.isPending}
              icon={<Award size={14} />}
            >
              {editItem ? "Update Syllabus" : "Create Syllabus"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
