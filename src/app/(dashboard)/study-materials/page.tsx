"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePermission } from "@/hooks/usePermission";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion } from "framer-motion";
import {
  FolderOpen,
  Pencil,
  Trash2,
  CheckCircle2,
  Download,
  Upload,
  FileText,
  Video,
  FileCode,
  BookMarked,
  Layers,
} from "lucide-react";
import {
  PageHeader,
  Card,
  Modal,
  FormField,
  Input,
  Select,
  SearchInput,
  Button,
  IconButton,
  Badge,
  EmptyState,
} from "@/components/ui";

interface StudyMaterial {
  id: string;
  title: string;
  course: string;
  department: string;
  type: "notes" | "presentation" | "video" | "assignment" | "reference";
  uploadedBy: string;
  uploadDate: string;
  fileSize: string;
  downloads: number;
}

const MOCK_MATERIALS: StudyMaterial[] = [
  {
    id: "SM-001",
    title: "Anatomy Upper Limb Lecture Notes & Clinical Correlations",
    course: "MBBS-101",
    department: "Anatomy",
    type: "notes",
    uploadedBy: "Dr. Harrison",
    uploadDate: "2026-06-10",
    fileSize: "2.4 MB",
    downloads: 156,
  },
  {
    id: "SM-002",
    title: "Physiology Blood Components & Coagulation Cascade PPT",
    course: "MBBS-102",
    department: "Physiology",
    type: "presentation",
    uploadedBy: "Dr. Drake",
    uploadDate: "2026-06-08",
    fileSize: "5.1 MB",
    downloads: 89,
  },
  {
    id: "SM-003",
    title: "Biochemistry Enzyme Kinetics & Michaelis-Menten Video Lecture",
    course: "MBBS-103",
    department: "Biochemistry",
    type: "video",
    uploadedBy: "Prof. Lee",
    uploadDate: "2026-06-05",
    fileSize: "124 MB",
    downloads: 234,
  },
  {
    id: "SM-004",
    title: "Anatomy Lower Limb Osteology Dissection Assignment",
    course: "MBBS-101",
    department: "Anatomy",
    type: "assignment",
    uploadedBy: "Dr. Harrison",
    uploadDate: "2026-06-12",
    fileSize: "0.5 MB",
    downloads: 67,
  },
  {
    id: "SM-005",
    title: "Physiology CNS & Neurotransmission Reference Guide",
    course: "MBBS-102",
    department: "Physiology",
    type: "reference",
    uploadedBy: "Dr. Drake",
    uploadDate: "2026-05-20",
    fileSize: "8.3 MB",
    downloads: 312,
  },
];

const TYPE_CONFIG: Record<
  string,
  { label: string; badgeVariant: "neutral" | "success" | "warning" | "danger" | "info" | "primary" | "gold"; icon: React.ReactNode }
> = {
  notes: { label: "Notes", badgeVariant: "primary", icon: <FileText size={13} /> },
  presentation: { label: "Presentation", badgeVariant: "info", icon: <Layers size={13} /> },
  video: { label: "Video", badgeVariant: "danger", icon: <Video size={13} /> },
  assignment: { label: "Assignment", badgeVariant: "warning", icon: <FileCode size={13} /> },
  reference: { label: "Reference", badgeVariant: "neutral", icon: <BookMarked size={13} /> },
};

export default function StudyMaterialsPage() {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<StudyMaterial | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [filterType, setFilterType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    title: "",
    course: "",
    department: "",
    type: "notes",
    fileSize: "2.5 MB",
  });

  const isEditor = can("update", "study-materials");

  const { data: materials = MOCK_MATERIALS, isLoading } = useQuery({
    queryKey: ["study-materials"],
    queryFn: async () => MOCK_MATERIALS,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return {
        success: true,
        data: {
          id: `SM-${Date.now()}`,
          ...payload,
          uploadedBy: "Current Faculty",
          uploadDate: new Date().toISOString().split("T")[0],
          downloads: 0,
        },
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-materials"] });
      closeModal();
      setSuccessMsg("Study material uploaded successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-materials"] });
      closeModal();
      setSuccessMsg("Study material updated successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-materials"] });
      setSuccessMsg("Material deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setForm({ title: "", course: "", department: "", type: "notes", fileSize: "2.5 MB" });
  };

  const openEdit = (item: StudyMaterial) => {
    setEditItem(item);
    setForm({
      title: item.title,
      course: item.course,
      department: item.department,
      type: item.type,
      fileSize: item.fileSize,
    });
    setShowModal(true);
  };

  const openCreate = () => {
    setForm({ title: "", course: "", department: "", type: "notes", fileSize: "2.5 MB" });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) updateMutation.mutate({ id: editItem.id, data: form });
    else createMutation.mutate(form);
  };

  const filtered = materials.filter((m: StudyMaterial) => {
    if (filterType && m.type !== filterType) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (
        !m.title.toLowerCase().includes(q) &&
        !m.course.toLowerCase().includes(q) &&
        !m.department.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Materials"
        subtitle="Upload, categorize, and distribute academic learning resources and course notes."
        actions={
          isEditor ? (
            <Button
              variant="gold"
              size="md"
              onClick={openCreate}
              icon={<Upload size={15} />}
            >
              Upload Material
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

      {/* Filter Toolbar */}
      <Card noPadding className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <SearchInput
              value={searchTerm}
              onValueChange={setSearchTerm}
              placeholder="Search materials by title, course, or department..."
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Material Types</option>
              <option value="notes">Notes</option>
              <option value="presentation">Presentation</option>
              <option value="video">Video</option>
              <option value="assignment">Assignment</option>
              <option value="reference">Reference Guide</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Materials Grid */}
      {isLoading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            title="No Study Materials Found"
            description={
              searchTerm || filterType
                ? "No materials match your current filter criteria."
                : "No learning resources uploaded yet."
            }
            icon={<FolderOpen size={28} className="text-gold" />}
            action={
              isEditor ? (
                <Button variant="gold" onClick={openCreate} icon={<Upload size={15} />}>
                  Upload First Resource
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item: StudyMaterial) => {
            const typeCfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.notes;
            return (
              <Card key={item.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={typeCfg.badgeVariant} size="sm" className="flex items-center gap-1">
                      {typeCfg.icon}
                      {typeCfg.label}
                    </Badge>
                    {isEditor && (
                      <div className="flex items-center gap-1">
                        <IconButton
                          variant="ghost"
                          size="sm"
                          label="Edit Material"
                          icon={<Pencil size={13} />}
                          onClick={() => openEdit(item)}
                        />
                        <IconButton
                          variant="ghost"
                          size="sm"
                          label="Delete Material"
                          icon={<Trash2 size={13} className="text-rose-500" />}
                          onClick={() => {
                            if (confirm("Delete this study material resource?")) {
                              deleteMutation.mutate(item.id);
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-text mb-1.5 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
                    <span className="font-mono font-medium text-primary">{item.course}</span>
                    <span>&bull;</span>
                    <span>{item.department}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-text-subtle pt-3 border-t border-border mb-3">
                    <span>By {item.uploadedBy}</span>
                    <span className="font-mono">{item.fileSize}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">{item.downloads} downloads</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert(`Downloading "${item.title}" (${item.fileSize})...`)}
                      icon={<Download size={13} />}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editItem ? "Edit Study Material" : "Upload Study Material"}
        subtitle="Distribute learning handouts, slides, and syllabus references"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Document Title" required>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Upper Limb Gross Anatomy Dissection Notes"
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Course Code" required>
              <Input
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                placeholder="MBBS-101"
                className="font-mono"
                required
              />
            </FormField>
            <FormField label="Department" required>
              <Input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="Anatomy"
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Resource Type" required>
              <Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="notes">Lecture Notes</option>
                <option value="presentation">Presentation Slides</option>
                <option value="video">Video Recording</option>
                <option value="assignment">Assignment / Worksheet</option>
                <option value="reference">Reference Guide</option>
              </Select>
            </FormField>
            <FormField label="Approx. File Size">
              <Input
                value={form.fileSize}
                onChange={(e) => setForm({ ...form, fileSize: e.target.value })}
                placeholder="e.g. 2.5 MB"
              />
            </FormField>
          </div>

          {!editItem && (
            <FormField label="File Upload">
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-surface-muted/20">
                <Upload size={24} className="text-text-subtle mx-auto mb-2" />
                <p className="text-xs font-semibold text-text">Click to choose file or drag and drop</p>
                <p className="text-[11px] text-text-subtle mt-1">PDF, PPTX, MP4, DOCX up to 500 MB</p>
              </div>
            </FormField>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createMutation.isPending || updateMutation.isPending}
              icon={<Upload size={14} />}
            >
              {editItem ? "Update Material" : "Publish Material"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
