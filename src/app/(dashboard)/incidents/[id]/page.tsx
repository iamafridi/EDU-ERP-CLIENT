"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Wrench, ArrowLeft, Trash2, CheckCircle2, ShieldAlert, MapPin, Tag, UserCheck, Calendar } from "lucide-react";
import Link from "next/link";
import { PageHeader, Card, FormField, Input, Select, Textarea, Button, IconButton, Badge } from "@/components/ui";

const severityTones: Record<string, "danger" | "warning" | "info" | "neutral"> = {
  critical: "danger",
  high: "warning",
  medium: "info",
  low: "neutral",
};

const statusTones: Record<string, "info" | "warning" | "success" | "neutral"> = {
  reported: "info",
  investigating: "warning",
  resolved: "success",
  closed: "neutral",
};

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");
  const [statusVal, setStatusVal] = useState("reported");
  const [resolutionText, setResolutionText] = useState("");
  const [technicianVal, setTechnicianVal] = useState("");

  const isStaff = roleIs("domain-admin") || user?.staffSubRole === "warden" || user?.staffSubRole === "guard";

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ["incidents"],
    queryFn: api.getIncidents,
  });

  const incident = incidents.find((inc: any) => inc.id === params.id);

  const updateIncidentMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      return api.updateIncident(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      setSuccessMsg("Incident ticket updated successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteIncidentMutation = useMutation({
    mutationFn: api.deleteIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      router.push("/incidents");
    },
  });

  useEffect(() => {
    if (incident) {
      setStatusVal(incident.status);
      setResolutionText(incident.resolution || "");
      setTechnicianVal(incident.technician || "");
    }
  }, [incident]);

  const handleStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident) return;
    updateIncidentMutation.mutate({
      id: incident.id,
      payload: {
        status: statusVal,
        resolution: resolutionText || undefined,
        technician: technicianVal || undefined,
      },
    });
  };

  const handleDelete = () => {
    if (confirm("Delete this incident ticket permanently?")) {
      deleteIncidentMutation.mutate(incident?.id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <p className="text-xs text-text-tertiary">Loading incident details...</p>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-sm font-semibold text-text">Incident record not found.</p>
        <Link href="/incidents">
          <Button variant="outline" size="sm">
            Back to Incidents
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-5xl">
      <PageHeader
        title={`Incident: ${incident.title}`}
        subtitle={`Reference #${incident.id} • Registered on ${incident.date}`}
        badge="Estate Ticket"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/incidents">
              <Button variant="outline" size="sm" icon={<ArrowLeft size={16} />}>
                Back to List
              </Button>
            </Link>
            {isStaff && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                icon={<Trash2 size={14} />}
              >
                Delete Ticket
              </Button>
            )}
          </div>
        }
      />

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card orientation="vertical" padding="lg" variant="default" className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusTones[incident.status] || "neutral"}>
                  Status: {incident.status}
                </Badge>
                <Badge variant={severityTones[incident.severity] || "neutral"}>
                  Severity: {incident.severity}
                </Badge>
              </div>
              <span className="text-xs text-text-tertiary font-mono flex items-center gap-1">
                <Calendar size={13} /> {incident.date}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-text mb-2">Description</h3>
              <p className="text-sm text-text-secondary leading-relaxed bg-surface-elevated/40 p-4 rounded-xl border border-border">
                {incident.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-surface-elevated/40 border border-border rounded-xl">
                <span className="text-[11px] font-semibold text-text-tertiary uppercase flex items-center gap-1.5 mb-1">
                  <MapPin size={12} className="text-gold" /> Facility Location
                </span>
                <p className="text-sm font-bold font-mono text-text">{incident.location}</p>
              </div>
              <div className="p-3.5 bg-surface-elevated/40 border border-border rounded-xl">
                <span className="text-[11px] font-semibold text-text-tertiary uppercase flex items-center gap-1.5 mb-1">
                  <Tag size={12} className="text-gold" /> Category
                </span>
                <p className="text-sm font-semibold text-text">{incident.category || "—"}</p>
              </div>
            </div>

            {incident.technician && (
              <div className="p-3.5 bg-info-bg/40 border border-info-border/60 rounded-xl">
                <span className="text-[11px] font-semibold text-info-text uppercase flex items-center gap-1.5 mb-1">
                  <UserCheck size={12} /> Assigned Technician
                </span>
                <p className="text-sm font-bold font-mono text-info-text">{incident.technician}</p>
              </div>
            )}

            {incident.resolution && (
              <div className="p-4 bg-emerald-50/60 border border-emerald-200/60 rounded-xl space-y-1">
                <span className="text-xs font-bold text-emerald-800 block">Resolution Feedback:</span>
                <p className="text-xs text-emerald-950 leading-relaxed">{incident.resolution}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Admin Dispatch Form */}
        <div className="lg:col-span-1">
          {isStaff ? (
            <Card orientation="vertical" padding="lg" variant="default" className="space-y-4">
              <div className="border-b border-border/80 pb-3">
                <h3 className="text-sm font-bold text-text flex items-center gap-2">
                  <ShieldAlert size={16} className="text-gold" /> Dispatch & Update
                </h3>
                <p className="text-[11px] text-text-tertiary mt-0.5">Assign technician and update status</p>
              </div>

              <form onSubmit={handleStatusUpdate} className="space-y-4">
                <FormField label="Dispatch Status">
                  <Select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value)}
                  >
                    <option value="reported">Reported</option>
                    <option value="investigating">Investigating / Dispatched</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </Select>
                </FormField>

                <FormField label="Assigned Technician">
                  <Input
                    type="text"
                    value={technicianVal}
                    onChange={(e) => setTechnicianVal(e.target.value)}
                    placeholder="e.g. John Doe (Plumbing)"
                  />
                </FormField>

                <FormField label="Resolution Summary / Repair Log">
                  <Textarea
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    rows={4}
                    placeholder="Log parts replaced, technician notes, or completion status..."
                  />
                </FormField>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={updateIncidentMutation.isPending}
                    icon={<ShieldAlert size={14} />}
                  >
                    {updateIncidentMutation.isPending ? "Updating..." : "Commit Dispatch Changes"}
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card orientation="vertical" padding="md" variant="default" className="text-center py-8">
              <ShieldAlert size={32} className="text-text-tertiary/40 mx-auto mb-2" />
              <p className="text-xs text-text-tertiary">Only wardens and administrative staff can update maintenance tickets.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

