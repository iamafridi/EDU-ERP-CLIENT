"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import {
  AlertOctagon,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  Calendar,
  User,
} from "lucide-react";
import Link from "next/link";
import {
  PageHeader,
  Card,
  FormField,
  Select,
  Textarea,
  Button,
  Badge,
} from "@/components/ui";

export default function GrievanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const [resolutionText, setResolutionText] = useState("");

  const isAdmin =
    roleIs("domain-admin", "super-admin") || user?.staffSubRole === "warden";

  const { data: grievances = [], isLoading } = useQuery({
    queryKey: ["grievances"],
    queryFn: api.getGrievances,
  });

  const grievance = grievances.find((g: any) => g.id === params.id);

  const updateGrievanceMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      return api.updateGrievance(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grievances"] });
      setSuccessMsg("Grievance status and resolution updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const deleteGrievanceMutation = useMutation({
    mutationFn: api.deleteGrievance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grievances"] });
      router.push("/grievances");
    },
  });

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievance) return;
    updateGrievanceMutation.mutate({
      id: grievance.id,
      payload: {
        status: updateStatus || grievance.status,
        resolution: resolutionText || undefined,
      },
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this grievance? This action cannot be undone.")) {
      deleteGrievanceMutation.mutate(grievance.id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-text-muted">
        <p className="text-sm">Loading grievance details...</p>
      </div>
    );
  }

  if (!grievance) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-sm text-text-muted">Grievance report not found or has been purged.</p>
        <Link href="/grievances">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>
            Back to Grievances
          </Button>
        </Link>
      </div>
    );
  }

  const statusVariantMap: Record<string, "warning" | "primary" | "success" | "neutral"> = {
    submitted: "primary",
    "under-review": "warning",
    resolved: "success",
    closed: "neutral",
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      <PageHeader
        title={grievance.subject}
        subtitle={`Grievance Ref #${grievance.id?.substring(0, 8) || "REF"} • Filed by ${grievance.studentName || "Anonymous"}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/grievances">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>
                Grievances
              </Button>
            </Link>
            {isAdmin && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 size={14} />}
                onClick={handleDelete}
                loading={deleteGrievanceMutation.isPending}
              >
                Delete
              </Button>
            )}
          </div>
        }
      />

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl flex items-center gap-2"
        >
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Complaint Report Card */}
      <Card title="Grievance Record" subtitle="Submitted statement and metadata">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariantMap[grievance.status] || "neutral"}>
              {grievance.status}
            </Badge>
            <Badge variant="neutral">
              Category: {grievance.category}
            </Badge>
            {grievance.priority && (
              <Badge variant={grievance.priority === "urgent" || grievance.priority === "high" ? "danger" : "neutral"}>
                Priority: {grievance.priority}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-surface-muted rounded-xl border border-border">
            <div>
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                Complainant
              </span>
              <span className="text-base font-bold text-text flex items-center gap-1.5 mt-0.5">
                <User size={14} className="text-gold" />
                {grievance.studentName || "Confidential Anonymous"}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                Submission Date
              </span>
              <span className="text-sm font-mono text-text flex items-center gap-1.5 mt-0.5">
                <Calendar size={14} className="text-text-muted" />
                {grievance.date || "Recent"}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
              Incident Description
            </h4>
            <div className="p-4 bg-surface-muted rounded-xl border border-border">
              <p className="text-sm text-text leading-relaxed whitespace-pre-line">
                {grievance.description}
              </p>
            </div>
          </div>

          {grievance.resolution && (
            <div>
              <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1.5">
                Proctorial Resolution
              </h4>
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-1">
                <p className="text-text leading-relaxed font-medium">
                  {grievance.resolution}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Proctor / Warden Action Form */}
      {isAdmin && (
        <Card
          title="Administrative Action & Resolution"
          subtitle="Update formal investigation status and provide committee notes to complainant"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <FormField label="Investigation Status" required>
              <Select
                value={updateStatus || grievance.status}
                onChange={(e) => setUpdateStatus(e.target.value)}
              >
                <option value="submitted">Submitted (Under assessment)</option>
                <option value="under-review">Under Active Review</option>
                <option value="resolved">Resolved & Action Taken</option>
                <option value="closed">Closed / Case Dismissed</option>
              </Select>
            </FormField>

            <FormField label="Resolution Notes & Committee Findings">
              <Textarea
                value={resolutionText || grievance.resolution || ""}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Outline specific disciplinary or facility maintenance actions taken to resolve this concern..."
                rows={4}
              />
            </FormField>

            <div className="flex justify-end pt-4 border-t border-border">
              <Button
                type="submit"
                variant="primary"
                loading={updateGrievanceMutation.isPending}
                leftIcon={<ShieldCheck size={14} />}
              >
                Commit Resolution
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
