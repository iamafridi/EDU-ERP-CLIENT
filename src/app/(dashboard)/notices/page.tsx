"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Plus, CheckCircle2, Search, X, AlertTriangle, Users, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";

const AUDIENCE_OPTIONS = ["all", "students", "faculty", "staff"];
const PRIORITY_OPTIONS = ["low", "normal", "high", "urgent"];
const ROLE_OPTIONS = ["student", "faculty", "hod", "guard", "warden", "accountant", "librarian", "doctor", "counselor", "maintenance"];

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

const priorityColors: Record<string, string> = {
  low: "bg-slate-50 text-slate-600 border-slate-200",
  normal: "bg-blue-50 text-blue-700 border-blue-200",
  high: "bg-amber-50 text-amber-700 border-amber-200",
  urgent: "bg-red-50 text-red-700 border-red-200",
};

export default function NoticesPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [expiryFilter, setExpiryFilter] = useState<"all" | "active" | "expired">("all");
  const [audienceFilter, setAudienceFilter] = useState("all");

  const canCreate = roleIs("super-admin", "domain-admin");

  const { data: notices = [] } = useQuery<Notice[]>({
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
      setSuccessMsg("Notice created successfully.");
      setIsCreateModalOpen(false);
      resetNoticeForm();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: "published" | "draft" }) => {
      const prev = queryClient.getQueryData<Notice[]>(["notices"]) || [];
      queryClient.setQueryData(["notices"], prev.map((n) =>
        n.id === id ? { ...n, status: newStatus } as Notice : n
      ));
      return { success: true };
    },
    onSuccess: () => {
      setSuccessMsg("Notice status updated.");
      setTimeout(() => setSuccessMsg(""), 4000);
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

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Bell className="text-[#2563EB]" />
            Notice Board
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official notices, announcements, and circulars from administration.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto shadow-sm shadow-blue-500/10"
          >
            <Plus size={16} />
            Create Notice
          </button>
        )}
      </div>

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Search & Filters */}
      <div className="bg-white border border-[#e1e2ed] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search notices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white border border-[#c3c6d7] rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
          />
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "published", "draft"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setStatusFilter(opt)}
              className={`h-8 px-3 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === opt
                  ? "bg-[#2563EB]/10 border-[#2563EB] text-[#2563EB]"
                  : "bg-white border-[#c3c6d7] text-slate-500 hover:bg-slate-50"
              }`}
            >
              {opt}
            </button>
          ))}
          <div className="w-px h-6 bg-[#e1e2ed] mx-1" />
          {(["all", "active", "expired"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setExpiryFilter(opt)}
              className={`h-8 px-3 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                expiryFilter === opt
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                  : "bg-white border-[#c3c6d7] text-slate-500 hover:bg-slate-50"
              }`}
            >
              {opt}
            </button>
          ))}
          <div className="w-px h-6 bg-[#e1e2ed] mx-1" />
          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="h-8 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
          >
            <option value="all">All Audiences</option>
            {AUDIENCE_OPTIONS.filter((a) => a !== "all").map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notice Cards */}
      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <div className="bg-white border border-[#e1e2ed] rounded-xl p-12 text-center shadow-sm">
            <Bell size={48} className="text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No notices found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          filteredNotices.map((notice: Notice) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow ${
                notice.expired ? "border-red-100 opacity-70" : "border-[#e1e2ed]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${
                      notice.status === "published"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-amber-50 text-amber-700 border-amber-100"
                    }`}>
                      {notice.status}
                    </span>
                    <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${priorityColors[notice.priority] || priorityColors.normal}`}>
                      {notice.priority}
                    </span>
                    {notice.audience && notice.audience !== "all" && (
                      <span className="px-2 py-0.5 border rounded text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border-purple-200">
                        <Users size={10} className="inline mr-0.5" />
                        {notice.audience}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">{notice.date}</span>
                    {notice.expired && (
                      <span className="px-2 py-0.5 border rounded text-[10px] font-bold uppercase bg-red-50 text-red-700 border-red-200">
                        <AlertTriangle size={10} className="inline mr-0.5" />
                        Expired
                      </span>
                    )}
                    {canCreate && notice.status === "draft" && (
                      <button
                        onClick={() =>
                          toggleStatusMutation.mutate({ id: notice.id, newStatus: "published" })
                        }
                        className="text-[10px] text-[#2563EB] hover:text-[#1d4ed8] font-bold underline cursor-pointer"
                      >
                        Publish
                      </button>
                    )}
                    {canCreate && notice.status === "published" && (
                      <button
                        onClick={() =>
                          toggleStatusMutation.mutate({ id: notice.id, newStatus: "draft" })
                        }
                        className="text-[10px] text-amber-600 hover:text-amber-700 font-bold underline cursor-pointer"
                      >
                        Unpublish
                      </button>
                    )}
                  </div>

                  <h3 className={`text-sm font-bold text-slate-800 ${notice.expired ? "line-through text-slate-400" : ""}`}>
                    {notice.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{notice.content}</p>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-semibold">Posted by:</span>
                      <span className="text-[10px] font-bold text-slate-600">{notice.author}</span>
                    </div>
                    {notice.validFrom && (
                      <div className="flex items-center gap-1">
                        <Clock size={10} className="text-slate-400" />
                        <span className="text-[10px] text-slate-400">
                          {notice.validTo
                            ? `${notice.validFrom} — ${notice.validTo}`
                            : `From ${notice.validFrom}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {notice.targetRoles && notice.targetRoles.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-semibold">Target:</span>
                      {notice.targetRoles.map((role) => (
                        <span key={role} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-semibold uppercase">
                          {role}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Notice Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between shrink-0">
                <span className="text-sm font-bold text-slate-800">Create New Notice</span>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmitNotice)} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Title</label>
                  <input
                    type="text"
                    {...register("title")}
                    placeholder="Notice title"
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  />
                  {errors.title && (
                    <span className="text-[10px] text-red-500 font-semibold block">{errors.title.message}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Content</label>
                  <textarea
                    {...register("content")}
                    placeholder="Write the full notice content..."
                    className="w-full h-32 px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all resize-none"
                  />
                  {errors.content && (
                    <span className="text-[10px] text-red-500 font-semibold block">{errors.content.message}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Valid From</label>
                    <input
                      type="date"
                      {...register("validFrom")}
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Valid To (optional)</label>
                    <input
                      type="date"
                      {...register("validTo")}
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Priority</label>
                    <select
                      {...register("priority")}
                      className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    >
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Audience</label>
                    <select
                      {...register("audience")}
                      className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    >
                      {AUDIENCE_OPTIONS.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Target Roles (optional)</label>
                  <div className="flex flex-wrap gap-1.5 p-2 border border-[#c3c6d7] rounded-lg">
                    {ROLE_OPTIONS.map((role) => {
                      const isSelected = (selectedRoles || []).includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => toggleRole(role)}
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase border transition-all ${
                            isSelected
                              ? "bg-[#2563EB]/10 border-[#2563EB] text-[#2563EB]"
                              : "bg-white border-[#c3c6d7] text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Status</label>
                    <select
                      {...register("status")}
                      className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    >
                      <option value="published">Published (visible to all)</option>
                      <option value="draft">Draft (hidden from view)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"
                  >
                    <Bell size={14} />
                    Post Notice
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
