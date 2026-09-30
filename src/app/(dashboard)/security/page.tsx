"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  UserCheck,
  LogOut,
  Trash2,
  MapPin,
  ClipboardList,
  Pencil,
  AlertTriangle,
} from "lucide-react";
import DataTable from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import {
  PageHeader,
  Card,
  Button,
  IconButton,
  Badge,
} from "@/components/ui";
import Link from "next/link";

export default function SecurityDashboardPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"gate" | "visitor" | "patrol">("gate");
  const [successMsg, setSuccessMsg] = useState("");

  const isGuardOrAdmin =
    roleIs("domain-admin", "super-admin") ||
    user?.staffSubRole === "warden" ||
    user?.staffSubRole === "guard";

  const { data: gateEntries = [], isLoading: isLoadingGate } = useQuery({
    queryKey: ["gateEntries"],
    queryFn: api.getGateEntries,
  });

  const { data: visitorLogs = [], isLoading: isLoadingVisitor } = useQuery({
    queryKey: ["visitorLogs"],
    queryFn: api.getVisitorLogs,
  });

  const { data: patrolLogs = [], isLoading: isLoadingPatrol } = useQuery({
    queryKey: ["patrolLogs"],
    queryFn: api.getPatrolLogs,
  });

  const deleteGateEntryMutation = useMutation({
    mutationFn: api.deleteGateEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gateEntries"] });
      setSuccessMsg("Gate entry deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const deleteVisitorLogMutation = useMutation({
    mutationFn: api.deleteVisitorLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitorLogs"] });
      setSuccessMsg("Visitor log deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const checkoutVisitorMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.updateVisitorLog(id, { exitTime: new Date().toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitorLogs"] });
      setSuccessMsg("Visitor checkout logged successfully.");
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const gateColumns = [
    {
      header: "Category",
      accessor: (row: any) => (
        <Badge
          variant={
            row.type === "student" ? "neutral" : row.type === "visitor" ? "gold" : "primary"
          }
          size="sm"
        >
          {row.type}
        </Badge>
      ),
    },
    {
      header: "Person / Student",
      accessor: (row: any) => (
        <Link
          href={`/security/${row.id}?type=gate`}
          className="font-semibold text-text hover:text-gold hover:underline"
        >
          {row.personName}
        </Link>
      ),
    },
    {
      header: "Contact No",
      accessor: (row: any) => <span className="font-mono text-xs text-text-muted">{row.contactNo || "—"}</span>,
    },
    { header: "Purpose", accessor: "purpose" as const },
    {
      header: "Vehicle / Plate",
      accessor: (row: any) => <span className="font-mono text-xs text-text font-bold">{row.vehicleNumber || "Walk-in"}</span>,
    },
    {
      header: "Entry Timestamp",
      accessor: (row: any) => (
        <span className="font-mono text-xs text-text-muted">
          {new Date(row.entryTime).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </span>
      ),
    },
    {
      header: "Curfew & Compliance",
      accessor: (row: any) =>
        row.isLateEntry ? (
          <Badge variant="danger" size="sm">
            <AlertTriangle size={12} className="inline mr-1" />
            Late: {row.lateEntryReason || "Overdue"}
          </Badge>
        ) : (
          <Badge variant="success" size="sm">
            <UserCheck size={12} className="inline mr-1" />
            Ontime Check-in
          </Badge>
        ),
    },
    ...(isGuardOrAdmin
      ? [
          {
            header: "Actions",
            accessor: (row: any) => (
              <div className="flex items-center gap-1">
                <Link href={`/security/${row.id}?type=gate`}>
                  <IconButton label="Edit gate entry" variant="ghost" size="sm">
                    <Pencil size={14} />
                  </IconButton>
                </Link>
                <IconButton
                  label="Delete gate entry"
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this gate entry?")) {
                      deleteGateEntryMutation.mutate(row.id);
                    }
                  }}
                >
                  <Trash2 size={14} />
                </IconButton>
              </div>
            ),
          },
        ]
      : []),
  ];

  const visitorColumns = [
    {
      header: "Visitor Name",
      accessor: (row: any) => (
        <Link
          href={`/security/${row.id}?type=visitor`}
          className="font-semibold text-text hover:text-gold hover:underline"
        >
          {row.visitorName}
        </Link>
      ),
    },
    {
      header: "Contact No",
      accessor: (row: any) => <span className="font-mono text-xs text-text-muted">{row.contactNo}</span>,
    },
    { header: "Purpose of Visit", accessor: "purpose" as const },
    {
      header: "Vehicle Plate",
      accessor: (row: any) => <span className="font-mono text-xs text-text font-bold">{row.vehicleNumber || "Walk-in"}</span>,
    },
    {
      header: "Entry Time",
      accessor: (row: any) => (
        <span className="font-mono text-xs text-text-muted">
          {new Date(row.entryTime).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </span>
      ),
    },
    {
      header: "Exit Status",
      accessor: (row: any) =>
        row.exitTime ? (
          <Badge variant="success" size="sm">
            <CheckCircle2 size={12} className="inline mr-1" />
            Exited {new Date(row.exitTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Badge>
        ) : (
          <Badge variant="warning" size="sm">
            Inside Campus
          </Badge>
        ),
    },
    ...(isGuardOrAdmin
      ? [
          {
            header: "Actions",
            accessor: (row: any) => (
              <div className="flex items-center gap-1.5">
                {!row.exitTime && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<LogOut size={13} />}
                    onClick={() => checkoutVisitorMutation.mutate(row.id)}
                  >
                    Log Exit
                  </Button>
                )}
                <Link href={`/security/${row.id}?type=visitor`}>
                  <IconButton label="Edit visitor record" variant="ghost" size="sm">
                    <Pencil size={14} />
                  </IconButton>
                </Link>
                <IconButton
                  label="Delete record"
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this visitor log?")) {
                      deleteVisitorLogMutation.mutate(row.id);
                    }
                  }}
                >
                  <Trash2 size={14} />
                </IconButton>
              </div>
            ),
          },
        ]
      : []),
  ];

  const patrolColumns = [
    {
      header: "Sector / Location",
      accessor: (row: any) => (
        <div className="flex items-center gap-1.5">
          <MapPin size={14} className="text-gold" />
          <Link
            href={`/security/${row.id}?type=patrol`}
            className="font-semibold text-text hover:text-gold hover:underline"
          >
            {row.location}
          </Link>
        </div>
      ),
    },
    {
      header: "Patrol Status",
      accessor: (row: any) => (
        <Badge variant={row.status === "completed" ? "success" : "warning"} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Timestamp",
      accessor: (row: any) => (
        <span className="font-mono text-xs text-text-muted">
          {new Date(row.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </span>
      ),
    },
    { header: "Field Notes", accessor: (row: any) => <span className="text-text text-xs">{row.notes || "Routine inspection clear"}</span> },
    {
      header: "Actions",
      accessor: (row: any) => (
        <Link href={`/security/${row.id}?type=patrol`}>
          <IconButton label="View patrol log" variant="ghost" size="sm">
            <Pencil size={14} />
          </IconButton>
        </Link>
      ),
    },
  ];

  const newLinkMap: Record<string, string> = {
    gate: "/security/new?type=gate",
    visitor: "/security/new?type=visitor",
    patrol: "/security/new?type=patrol",
  };

  const newLabelMap: Record<string, string> = {
    gate: "New Gate Check-in",
    visitor: "Generate Visitor Pass",
    patrol: "Log Security Patrol",
  };

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Security & Curfew Command"
        subtitle="Campus perimeter control, curfew check-ins, visitor authorization passes, and warden patrol audits."
        actions={
          isGuardOrAdmin && (
            <Link href={newLinkMap[activeTab]}>
              <Button variant="gold" leftIcon={<Plus size={15} />}>
                {newLabelMap[activeTab]}
              </Button>
            </Link>
          )
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

      {/* Tabs */}
      <div className="flex border-b border-border gap-2">
        {([
          { key: "gate", label: "Gate & Curfew Logs", icon: FileSpreadsheet },
          { key: "visitor", label: "Visitor Passes", icon: Lock },
          { key: "patrol", label: "Patrol Activity", icon: ClipboardList },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.key
                ? "border-gold text-gold"
                : "border-transparent text-text-muted hover:text-text hover:border-border"
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      <Card noPadding>
        {activeTab === "gate" &&
          (isLoadingGate ? (
            <TableSkeleton rows={5} cols={7} />
          ) : (
            <DataTable
              data={gateEntries}
              columns={gateColumns}
              searchPlaceholder="Search gate logs by name or vehicle..."
              searchField="personName"
            />
          ))}

        {activeTab === "visitor" &&
          (isLoadingVisitor ? (
            <TableSkeleton rows={5} cols={7} />
          ) : (
            <DataTable
              data={visitorLogs}
              columns={visitorColumns}
              searchPlaceholder="Search visitors by name..."
              searchField="visitorName"
            />
          ))}

        {activeTab === "patrol" &&
          (isLoadingPatrol ? (
            <TableSkeleton rows={5} cols={5} />
          ) : (
            <DataTable
              data={patrolLogs}
              columns={patrolColumns}
              searchPlaceholder="Search patrol logs by sector..."
              searchField="location"
            />
          ))}
      </Card>
    </div>
  );
}
