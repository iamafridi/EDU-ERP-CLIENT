"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Bell, Plus, Users, Clock, AlertTriangle, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import {
  PageHeader,
  Card,
  SearchInput,
  Select,
  FormField,
  Input,
  Textarea,
  Badge,
  StatusBadge,
  Button,
  Modal,
} from "@/components/ui";
import { showToast } from "@/components/dashboard/ToastFeedback";

const AUDIENCE_OPTIONS = ["all", "students", "faculty", "staff"];
const PRIORITY_OPTIONS = ["low", "normal", "high", "urgent"];
const ROLE_OPTIONS = [
  "student",
  "faculty",
  "hod",
  "guard",
  "warden",
  "accountant",
  "librarian",
  "doctor",
  "counselor",
  "maintenance",
];

const noticeSchema = zod.object({
  title: zod.string().min(5, "Title must be at least 5 characters"),
  content: zod.string().min(20, "Content must be at least 20 characters"),
  status: zod.enum(["published", "draft"]),
  audience: zod.string(),
  priority: zod.string(),
  validFrom: zod.string(),
  validTo: zod.string().optional(),
  targetRoles: zod.array(zod.string()),
});

interface Notice {
  id: string;
  title: string;
  content: string;
  audience: string;
  priority: string;
  status: string;
  postedBy?: string;
  postedDate?: string;
  author?: string;
  date?: string;
  validFrom?: string;
  validTo?: string | null;
  targetRoles?: string[];
  expired?: boolean;
}

type NoticeFormValues = zod.infer<typeof noticeSchema>;

const isExpired = (notice: Notice) => {
  if (!notice.validTo) return false;
  return new Date(notice.validTo) < new Date(new Date().toDateString());
};

export default function NoticesPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [expiryFilter, setExpiryFilter] = useState<"all" | "active" | "expired">("all");
  const [audienceFilter, setAudienceFilter] = useState("all");

  const canCreate = roleIs("super-admin", "domain-admin");

  const { data: notices = [], isLoading } = useQuery<Notice[]>({
    queryKey: ["notices"],
    queryFn: async () => {
      const raw = await api.getNotices();
      return raw.map((n: Notice) => ({
        ...n,
        author: n.postedBy ?? n.author,
        date: n.postedDate ?? n.date,
        expired: isExpired(n),
      }));
    },
  });

  const createNoticeMutation = useMutation({
    mutationFn: (payload: NoticeFormValues) =>
      api.createNotice({
        title: payload.title,
        content: payload.content,
        postedBy: user?.name || "Administrator",
        audience: payload.audience,
        priority: payload.priority,
        validFrom: payload.validFrom,
        validTo: payload.validTo || null,
        targetRoles: payload.targetRoles,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      showToast({
        title: "Circular Promulgated",
        description: "Official institutional notice has been dispatched to target audience.",
        variant: "success",
      });
      setIsCreateModalOpen(false);
      resetNoticeForm();
    },
    onError: () => {
      showToast({
        title: "Dispatch Failed",
        description: "Could not create notice. Please verify network status.",
        variant: "error",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: "published" | "draft" }) => {
      const prev = queryClient.getQueryData<Notice[]>(["notices"]) || [];
      queryClient.setQueryData(
        ["notices"],
        prev.map((n) => (n.id === id ? ({ ...n, status: newStatus } as Notice) : n))
      );
      return { success: true };
    },
    onSuccess: () => {
      showToast({
        title: "Notice Updated",
        description: "Notice publication status updated successfully.",
        variant: "info",
      });
    },
  });

  const {
    register,
    handleSubmit,
    reset: resetNoticeForm,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      title: "",
      content: "",
      status: "published",
      audience: "all",
      priority: "normal",
      validFrom: new Date().toISOString().split("T")[0],
      validTo: "",
      targetRoles: [],
    },
  });

  const selectedRoles = watch("targetRoles");

  const toggleRole = (role: string) => {
    const current = selectedRoles || [];
    if (current.includes(role)) {
      setValue("targetRoles", current.filter((r) => r !== role));
    } else {
      setValue("targetRoles", [...current, role]);
    }
  };

  const onSubmitNotice = (values: NoticeFormValues) => {
    createNoticeMutation.mutate(values);
  };

  const filteredNotices = notices.filter((n: Notice) => {
    const matchesSearch =
      !searchTerm ||
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.author || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || n.status === statusFilter;
    const matchesExpiry =
      expiryFilter === "all" ||
      (expiryFilter === "active" && !n.expired) ||
      (expiryFilter === "expired" && n.expired);
    const matchesAudience =
      audienceFilter === "all" || n.audience === audienceFilter;
    return matchesSearch && matchesStatus && matchesExpiry && matchesAudience;
  });

  const getPriorityTone = (priority: string): "neutral" | "info" | "warning" | "danger" => {
    switch (priority) {
      case "urgent":
        return "danger";
      case "high":
        return "warning";
      case "normal":
        return "info";
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-6 font-ui max-w-5xl animate-in fade-in duration-300">
      {/* Top Header */}
      <PageHeader
        title="Notice Board & Circulars"
        description="Official institutional announcements, statutory guidelines, and collegiate circulars."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Administration", href: "/admin" },
          { label: "Notices" },
        ]}
        actions={
          canCreate ? (
            <Button
              variant="gold"
              size="sm"
              leftIcon={<Plus size={15} />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Promulgate Notice
            </Button>
          ) : undefined
        }
      />

      {/* Search & Filters */}
      <Card pad="sm" className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1">
            <SearchInput
              size="sm"
              placeholder="Search circulars by title, keyword or signatory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm("")}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status pills */}
            <div className="flex items-center bg-surface-muted/60 p-0.5 rounded-lg border border-border">
              {(["all", "published", "draft"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setStatusFilter(opt)}
                  className={`h-7 px-2.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    statusFilter === opt
                      ? "bg-surface text-text shadow-xs font-bold"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Expiry filter */}
            <div className="flex items-center bg-surface-muted/60 p-0.5 rounded-lg border border-border">
              {(["all", "active", "expired"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setExpiryFilter(opt)}
                  className={`h-7 px-2.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    expiryFilter === opt
                      ? "bg-surface text-text shadow-xs font-bold"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Audience select */}
            <Select
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
              className="h-8 text-xs"
              wrapperClassName="w-36"
            >
              <option value="all">All Audiences</option>
              {AUDIENCE_OPTIONS.filter((a) => a !== "all").map((a) => (
                <option key={a} value={a}>
                  {a.toUpperCase()}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Notice Cards Stack */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-text-subtle font-ui">Loading circulars...</div>
        ) : filteredNotices.length === 0 ? (
          <Card pad="lg" className="text-center py-16 space-y-2">
            <Bell size={40} className="text-text-subtle mx-auto mb-2 opacity-40" />
            <h3 className="text-sm font-bold text-text">No circulars matching filter</h3>
            <p className="text-xs text-text-subtle">
              Adjust search keywords or reset filter pills to view archived notices.
            </p>
          </Card>
        ) : (
          filteredNotices.map((notice: Notice) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                pad="md"
                className={`space-y-3 transition-all ${
                  notice.expired ? "border-danger/30 opacity-75" : "hover:border-border-strong"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={notice.status} size="sm" />
                      <Badge tone={getPriorityTone(notice.priority)} size="sm">
                        {notice.priority.toUpperCase()}
                      </Badge>
                      {notice.audience && notice.audience !== "all" && (
                        <Badge tone="info" size="sm" icon={<Users size={10} />}>
                          {notice.audience}
                        </Badge>
                      )}
                      <span className="text-[10px] text-text-subtle font-mono">{notice.date}</span>

                      {notice.expired && (
                        <Badge tone="danger" size="sm" icon={<AlertTriangle size={10} />}>
                          Expired
                        </Badge>
                      )}

                      {canCreate && notice.status === "draft" && (
                        <button
                          type="button"
                          onClick={() =>
                            toggleStatusMutation.mutate({ id: notice.id, newStatus: "published" })
                          }
                          className="text-[11px] text-gold hover:underline font-semibold cursor-pointer"
                        >
                          Promulgate
                        </button>
                      )}

                      {canCreate && notice.status === "published" && (
                        <button
                          type="button"
                          onClick={() =>
                            toggleStatusMutation.mutate({ id: notice.id, newStatus: "draft" })
                          }
                          className="text-[11px] text-text-subtle hover:text-warning hover:underline font-semibold cursor-pointer"
                        >
                          Revoke to Draft
                        </button>
                      )}
                    </div>

                    <h3
                      className={`text-base font-bold font-serif text-text ${
                        notice.expired ? "line-through text-text-muted" : ""
                      }`}
                    >
                      {notice.title}
                    </h3>
                    <p className="text-xs text-text-muted leading-relaxed font-ui whitespace-pre-line">
                      {notice.content}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-text-subtle">
                      <div className="flex items-center gap-1 font-medium">
                        <span>Signatory:</span>
                        <strong className="text-text font-bold">{notice.author}</strong>
                      </div>
                      {notice.validFrom && (
                        <div className="flex items-center gap-1 font-mono">
                          <Clock size={12} className="text-gold" />
                          <span>
                            {notice.validTo
                              ? `${notice.validFrom} — ${notice.validTo}`
                              : `Promulgated on ${notice.validFrom}`}
                          </span>
                        </div>
                      )}
                    </div>

                    {notice.targetRoles && notice.targetRoles.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-text-subtle font-semibold uppercase">
                          Scope:
                        </span>
                        {notice.targetRoles.map((role) => (
                          <span
                            key={role}
                            className="px-2 py-0.5 bg-surface-muted text-text-muted rounded-md text-[10px] font-mono font-medium"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Shared Portal Modal for Creating Notice */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Promulgate Institutional Circular"
        description="Publish formal announcement to students, faculty, or operational departments."
        maxWidth="lg"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={createNoticeMutation.isPending}
              onClick={handleSubmit(onSubmitNotice)}
              rightIcon={<Send size={13} />}
            >
              Dispatch Circular
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmitNotice)} className="space-y-4">
          <FormField
            label="Notice Headline"
            htmlFor="notice-title"
            required
            error={errors.title?.message}
          >
            <Input
              id="notice-title"
              placeholder="e.g. Clinical Ward Schedule Revision — Phase 3 MBBS"
              {...register("title")}
            />
          </FormField>

          <FormField
            label="Full Circular Text & Directives"
            htmlFor="notice-content"
            required
            error={errors.content?.message}
          >
            <Textarea
              id="notice-content"
              placeholder="Detail the institutional directives, affected batches, and administrative contacts..."
              {...register("content")}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Valid From" htmlFor="valid-from">
              <Input id="valid-from" type="date" {...register("validFrom")} />
            </FormField>
            <FormField label="Valid To (Expiry optional)" htmlFor="valid-to">
              <Input id="valid-to" type="date" {...register("validTo")} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Priority Standing" htmlFor="priority-select">
              <Select id="priority-select" {...register("priority")}>
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p.toUpperCase()}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Target Audience" htmlFor="audience-select">
              <Select id="audience-select" {...register("audience")}>
                {AUDIENCE_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a.toUpperCase()}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Target Departmental Roles (Optional)">
            <div className="flex flex-wrap gap-1.5 p-2 bg-surface border border-border rounded-xl">
              {ROLE_OPTIONS.map((role) => {
                const isSelected = (selectedRoles || []).includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold uppercase border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary text-on-primary border-primary shadow-xs"
                        : "bg-surface-muted/50 border-border text-text-muted hover:text-text hover:bg-surface-muted"
                    }`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </FormField>

          <FormField label="Publication Lifecycle" htmlFor="status-select">
            <Select id="status-select" {...register("status")}>
              <option value="published">Immediate Promulgation (Published)</option>
              <option value="draft">Internal Draft (Restricted to Admins)</option>
            </Select>
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
