"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { 
  Wrench, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Trash2, 
  Pencil, 
  MapPin, 
  UserCheck, 
  Calendar,
  ShieldAlert,
  Wrench as WrenchIcon
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { PageHeader, Card, Button, IconButton, Badge } from "@/components/ui";
import { ClinicalAuditPanel } from "@/components/clinical/ClinicalAuditPanel";

const severityOrder: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

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

export default function MaintenanceIncidentsPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [incidentTab, setIncidentTab] = useState<"FACILITIES" | "CLINICAL_MM">("CLINICAL_MM");
  const [successMsg, setSuccessMsg] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const isStaff = roleIs("domain-admin") || user?.staffSubRole === "warden" || user?.staffSubRole === "guard";

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ["incidents"],
    queryFn: api.getIncidents,
  });

  const filteredIncidents = useMemo(() => {
    let list = [...incidents];

    if (severityFilter !== "all") {
      list = list.filter((inc: any) => inc.severity === severityFilter);
    }

    if (statusFilter !== "all") {
      list = list.filter((inc: any) => inc.status === statusFilter);
    }

    list.sort((a: any, b: any) => {
      return (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4);
    });

    return list;
  }, [incidents, severityFilter, statusFilter]);

  const deleteIncidentMutation = useMutation({
    mutationFn: api.deleteIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      setSuccessMsg("Incident ticket deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <PageHeader
        title="Clinical Governance, M&M & Facility Incident Center"
        subtitle="Morbidity & Mortality (M&M) clinical root-cause audits, SAC-1 sentinel reviews, and campus infrastructure dispatch tickets."
        badge="Safety & Clinical Governance"
        actions={
          <Link href="/incidents/new">
            <Button
              variant="gold"
              icon={<Plus size={16} />}
            >
              Log Ticket / Incident
            </Button>
          </Link>
        }
      />

      {/* Main Tab Navigation */}
      <div className="flex border-b border-border gap-2">
        <Button
          variant={incidentTab === "CLINICAL_MM" ? "gold" : "outline"}
          size="sm"
          onClick={() => setIncidentTab("CLINICAL_MM")}
        >
          <ShieldAlert size={14} className="inline mr-1" /> Hospital M&amp;M &amp; Sentinel Clinical Audits
        </Button>
        <Button
          variant={incidentTab === "FACILITIES" ? "gold" : "outline"}
          size="sm"
          onClick={() => setIncidentTab("FACILITIES")}
        >
          <WrenchIcon size={14} className="inline mr-1" /> Campus Facilities &amp; Maintenance ({incidents.length})
        </Button>
      </div>

      {incidentTab === "CLINICAL_MM" && (
        <ClinicalAuditPanel />
      )}

      {incidentTab === "FACILITIES" && (
        <div className="space-y-6">

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

      {/* Filter Toolbar */}
      <Card orientation="vertical" padding="md" variant="default">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-tertiary">Severity:</span>
              <div className="flex gap-1.5">
                {["all", "critical", "high", "medium", "low"].map((s) => (
                  <Button
                    key={s}
                    variant={severityFilter === s ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setSeverityFilter(s)}
                    className="capitalize text-xs h-7 px-2.5"
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>

            <div className="h-4 w-px bg-border hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-tertiary">Status:</span>
              <div className="flex gap-1.5">
                {["all", "reported", "investigating", "resolved", "closed"].map((s) => (
                  <Button
                    key={s}
                    variant={statusFilter === s ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setStatusFilter(s)}
                    className="capitalize text-xs h-7 px-2.5"
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Badge variant="gold" size="sm">
            {filteredIncidents.length} of {incidents.length} Tickets
          </Badge>
        </div>
      </Card>

      {/* Main List */}
      <Card orientation="vertical" padding="none" variant="default" className="overflow-hidden">
        <div className="p-4 border-b border-border/80 bg-surface-elevated/40 flex items-center justify-between">
          <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
            All Incident & Dispatch Records
          </span>
        </div>

        {isLoading ? (
          <div className="divide-y divide-border/60">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded" />
                  <Skeleton className="h-5 w-20 rounded" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="p-12 text-center max-w-sm mx-auto space-y-3">
            <Info size={40} className="text-text-tertiary/40 mx-auto" />
            <h3 className="text-sm font-bold text-text">
              {incidents.length === 0 ? "No Active Tickets" : "No Matching Tickets"}
            </h3>
            <p className="text-xs text-text-tertiary">
              {incidents.length === 0
                ? "There are no active maintenance tickets logged at the moment."
                : "No tickets match the selected filters. Try adjusting your criteria."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredIncidents.map((inc: any) => {
              return (
                <div key={inc.id} className="p-5 hover:bg-surface-elevated/30 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={statusTones[inc.status] || "neutral"} size="sm">
                        Status: {inc.status}
                      </Badge>
                      <Badge variant={severityTones[inc.severity] || "neutral"} size="sm">
                        Severity: {inc.severity}
                      </Badge>
                      <span className="text-[11px] text-text-tertiary font-mono flex items-center gap-1 ml-1">
                        <Calendar size={12} /> {inc.date}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-text flex items-center gap-2">
                      {inc.title}
                      {inc.severity === "critical" && (
                        <AlertTriangle size={16} className="text-danger animate-pulse" />
                      )}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{inc.description}</p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] font-semibold text-text-secondary bg-surface-elevated border border-border px-2.5 py-1 rounded-md inline-flex items-center gap-1.5">
                        <MapPin size={12} className="text-gold" />
                        <strong className="text-text font-mono">{inc.location}</strong>
                      </span>

                      {inc.technician && (
                        <span className="text-[11px] font-semibold text-info-text bg-info-bg border border-info-border px-2.5 py-1 rounded-md inline-flex items-center gap-1.5">
                          <UserCheck size={12} />
                          Tech: <strong className="font-mono">{inc.technician}</strong>
                        </span>
                      )}
                    </div>

                    {inc.resolution && (
                      <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl text-xs space-y-1">
                        <span className="font-bold text-emerald-800 block">Resolution Feedback:</span>
                        <p className="text-emerald-950">{inc.resolution}</p>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 self-start md:self-auto flex items-center gap-2">
                    <Link href={`/incidents/${inc.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Pencil size={12} />}
                      >
                        Dispatch / Edit
                      </Button>
                    </Link>
                    {isStaff && (
                      <IconButton
                        variant="danger"
                        size="sm"
                        label="Delete incident ticket"
                        onClick={() => {
                          if (window.confirm("Delete this incident ticket permanently?")) {
                            deleteIncidentMutation.mutate(inc.id);
                          }
                        }}
                        icon={<Trash2 size={13} />}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
        </div>
      )}
    </div>
  );
}

