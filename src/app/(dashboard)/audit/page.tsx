"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Shield, Download, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import {
  PageHeader,
  Card,
  SearchInput,
  Select,
  Input,
  Button,
  IconButton,
  Badge,
  EmptyState,
} from "@/components/ui";

const ACTION_TONE: Record<
  string,
  "neutral" | "success" | "warning" | "danger" | "info" | "primary" | "gold"
> = {
  CREATE: "success",
  UPDATE: "primary",
  DELETE: "danger",
};

export default function AuditTrailPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [action, setAction] = useState("");
  const [resource, setResource] = useState("");
  const [userId, setUserId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const queryParams: Record<string, any> = { page, limit };
  if (action) queryParams.action = action;
  if (resource) queryParams.resource = resource;
  if (userId) queryParams.userId = userId;
  if (startDate) queryParams.startDate = startDate;
  if (endDate) queryParams.endDate = endDate;
  if (searchTerm) queryParams.searchTerm = searchTerm;

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page, limit, action, resource, userId, startDate, endDate, searchTerm],
    queryFn: () => api.getAuditLogs(queryParams),
  });

  const logs: any[] = data?.logs ?? [];
  const meta = data?.meta ?? { page: 1, limit: 15, total: 0, totalPages: 1 };

  const clearFilters = () => {
    setAction("");
    setResource("");
    setUserId("");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
    setPage(1);
  };

  const exportCSV = () => {
    const headers = [
      "Timestamp",
      "Action",
      "Resource",
      "Resource ID",
      "User ID",
      "User Role",
      "IP Address",
      "Details",
    ];
    const rows = logs.map((log: any) => [
      log.timestamp || "",
      log.action || "",
      log.resource || "",
      log.resourceId || "",
      log.userId || "",
      log.userRole || "",
      log.ip || "",
      log.diff ? JSON.stringify(log.diff).slice(0, 200) : "",
    ]);
    const csv = [
      headers.join(","),
      ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasFilters = action || resource || userId || startDate || endDate || searchTerm;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Trail"
        subtitle="Immutable ledger tracking system changes, security authentication, and administrative actions."
        actions={
          <Button
            variant="outline"
            size="md"
            onClick={exportCSV}
            disabled={logs.length === 0}
            icon={<Download size={14} />}
          >
            Export CSV
          </Button>
        }
      />

      {/* Filter Toolbar */}
      <Card noPadding className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Filter size={14} /> Filter Audit Records
          </span>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} icon={<X size={12} />}>
              Clear Filters
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </Select>

          <Input
            placeholder="Resource..."
            value={resource}
            onChange={(e) => {
              setResource(e.target.value);
              setPage(1);
            }}
            className="font-mono text-xs"
          />

          <Input
            placeholder="User ID..."
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              setPage(1);
            }}
            className="font-mono text-xs"
          />

          <Input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="text-xs"
          />

          <Input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="text-xs"
          />

          <SearchInput
            placeholder="Search diffs..."
            value={searchTerm}
            onValueChange={(val) => {
              setSearchTerm(val);
              setPage(1);
            }}
          />
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card noPadding>
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={8} cols={7} />
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            title="No Audit Records Found"
            description={
              hasFilters
                ? "No audit records match your selected filter parameters."
                : "No system changes have been recorded in this log partition."
            }
            icon={<Shield size={28} className="text-gold" />}
            action={
              hasFilters ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Reset Filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-muted/50 border-b border-border">
                    <th className="p-3 text-[11px] font-semibold text-text-muted uppercase">Timestamp</th>
                    <th className="p-3 text-[11px] font-semibold text-text-muted uppercase">Action</th>
                    <th className="p-3 text-[11px] font-semibold text-text-muted uppercase">Resource</th>
                    <th className="p-3 text-[11px] font-semibold text-text-muted uppercase">Entity ID</th>
                    <th className="p-3 text-[11px] font-semibold text-text-muted uppercase">Operator ID</th>
                    <th className="p-3 text-[11px] font-semibold text-text-muted uppercase">Role</th>
                    <th className="p-3 text-[11px] font-semibold text-text-muted uppercase">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log: any, i: number) => (
                    <tr key={log._id || log.id || i} className="hover:bg-surface-hover text-xs">
                      <td className="p-3 font-mono text-text-muted text-[11px]">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
                      </td>
                      <td className="p-3">
                        <Badge variant={ACTION_TONE[log.action] || "neutral"} size="sm">
                          {log.action}
                        </Badge>
                      </td>
                      <td className="p-3 font-semibold text-text">{log.resource}</td>
                      <td className="p-3 font-mono text-text-subtle text-[11px]">{log.resourceId || "—"}</td>
                      <td className="p-3 font-mono text-text font-medium text-[11px]">{log.userId || "—"}</td>
                      <td className="p-3 text-text-muted capitalize">{log.userRole || "—"}</td>
                      <td className="p-3 font-mono text-text-subtle text-[11px]">{log.ip || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-text-muted">
                Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of{" "}
                {meta.total} records
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  icon={<ChevronLeft size={13} />}
                >
                  Prev
                </Button>
                <span className="text-xs font-semibold text-text px-1">
                  Page {meta.page} of {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page >= meta.totalPages}
                  rightIcon={<ChevronRight size={13} />}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
