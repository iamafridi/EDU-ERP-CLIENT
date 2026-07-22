"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { FormField, Input, Select, Textarea } from "@/components/ui/Form";
import DataTable, { Column } from "@/components/ui/DataTable";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  Calendar,
  FileCheck
} from "lucide-react";

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

export default function LeaveManagementPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({
    employeeId: user?.id || "EMP-001",
    employeeName: user?.name || "Faculty Member",
    type: "casual",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const canApprove = roleIs("super-admin", "domain-admin");

  const { data: leaveRequests = [], isLoading } = useQuery<LeaveRequest[]>({
    queryKey: ["leaveRequests"],
    queryFn: async () => {
      try {
        const res = await api.getLeaveRequests();
        if (Array.isArray(res) && res.length > 0) return res;
      } catch {
        // fallback
      }
      return [
        { id: "LVE-2026-081", employeeId: "FAC-983", employeeName: "Dr. James Sterling", type: "academic", startDate: "2026-10-10", endDate: "2026-10-14", reason: "International Medical Informatics Conference attendance", status: "approved" },
        { id: "LVE-2026-082", employeeId: "FAC-984", employeeName: "Prof. Clara Oswald", type: "medical", startDate: "2026-10-02", endDate: "2026-10-04", reason: "Acute viral illness recovery and quarantine", status: "approved" },
        { id: "LVE-2026-083", employeeId: "FAC-985", employeeName: "Dr. Alistair Who", type: "casual", startDate: "2026-10-18", endDate: "2026-10-19", reason: "Family commitment and personal leave", status: "pending" },
      ];
    },
  });

  const createLeaveMutation = useMutation({
    mutationFn: api.createLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      setSuccessMsg("Leave request submitted for administrative review.");
      setIsApplyModalOpen(false);
      setNewLeave({ 
        employeeId: user?.id || "EMP-001", 
        employeeName: user?.name || "Faculty Member", 
        type: "casual", 
        startDate: "", 
        endDate: "", 
        reason: "" 
      });
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateLeaveRequestStatus({ id, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      setSuccessMsg("Leave request decision updated.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) return;
    createLeaveMutation.mutate({
      ...newLeave,
      employeeId: newLeave.employeeId || user?.id || "EMP-001",
      employeeName: newLeave.employeeName || user?.name || "Faculty Member",
    });
  };

  const handleStatusChange = (id: string, status: "approved" | "rejected") => {
    updateStatusMutation.mutate({ id, status });
  };

  const columns: Column<LeaveRequest>[] = [
    {
      header: "Employee",
      accessor: (row) => (
        <div>
          <span className="font-semibold text-text block">{row.employeeName}</span>
          <span className="text-xs text-text-muted font-mono">{row.employeeId}</span>
        </div>
      ),
      sortValue: (row) => row.employeeName,
    },
    {
      header: "Leave Category",
      accessor: (row) => (
        <Badge variant="outline" className="capitalize text-xs">
          {row.type}
        </Badge>
      ),
      sortValue: (row) => row.type,
    },
    {
      header: "Leave Duration",
      accessor: (row) => (
        <div className="flex items-center gap-2 text-xs font-mono text-text">
          <Calendar size={13} className="text-text-muted shrink-0" />
          <span>{row.startDate} — {row.endDate}</span>
        </div>
      ),
      sortValue: (row) => row.startDate,
    },
    {
      header: "Reason / Purpose",
      accessor: (row) => (
        <span className="text-text max-w-sm truncate block">{row.reason}</span>
      ),
      sortValue: (row) => row.reason,
    },
    {
      header: "Status",
      accessor: (row) => {
        const st = String(row.status || "").toLowerCase();
        if (st === "approved") {
          return (
            <Badge variant="success" icon={<CheckCircle2 size={12} />}>
              APPROVED
            </Badge>
          );
        }
        if (st === "rejected") {
          return (
            <Badge variant="danger" icon={<XCircle size={12} />}>
              REJECTED
            </Badge>
          );
        }
        return (
          <Badge variant="warning" icon={<Clock size={12} />}>
            PENDING
          </Badge>
        );
      },
      sortValue: (row) => row.status,
    },
    ...(canApprove
      ? [
          {
            header: "Actions",
            accessor: (row: LeaveRequest) =>
              row.status === "pending" ? (
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-success border-success/30 hover:bg-success/10"
                    icon={<FileCheck size={14} />}
                    onClick={() => handleStatusChange(row.id, "approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-danger border-danger/30 hover:bg-danger/10"
                    icon={<XCircle size={14} />}
                    onClick={() => handleStatusChange(row.id, "rejected")}
                  >
                    Reject
                  </Button>
                </div>
              ) : (
                <div className="text-right">
                  <span className="text-xs text-text-subtle font-mono">—</span>
                </div>
              ),
          } as Column<LeaveRequest>,
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Leave Management & Authorizations"
        description="Faculty and institutional staff leave requests, statutory quotas, and administrative approvals."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Staff", href: "/faculties" },
          { label: "Leave Requests" },
        ]}
        actions={
          <Button
            variant="gold"
            icon={<Plus size={16} />}
            onClick={() => setIsApplyModalOpen(true)}
          >
            Apply for Leave
          </Button>
        }
      />

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Data Table */}
      <Card noPadding>
        <DataTable
          columns={columns}
          data={leaveRequests}
          loading={isLoading}
          searchPlaceholder="Search leave requests by employee or reason..."
          emptyTitle="No leave requests recorded"
          emptyDescription="Staff and faculty leave applications will appear here."
        />
      </Card>

      {/* Apply for Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Submit Leave Request"
        description="Formal leave requisition submitted to department head and administration."
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              onClick={handleApply}
              loading={createLeaveMutation.isPending}
              icon={<Plus size={16} />}
            >
              Submit Request
            </Button>
          </div>
        }
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Employee ID" required>
              <Input
                value={newLeave.employeeId}
                onChange={(e) => setNewLeave((prev) => ({ ...prev, employeeId: e.target.value }))}
                placeholder="e.g. FAC-983"
                required
              />
            </FormField>

            <FormField label="Employee Name" required>
              <Input
                value={newLeave.employeeName}
                onChange={(e) => setNewLeave((prev) => ({ ...prev, employeeName: e.target.value }))}
                placeholder="Full Name"
                required
              />
            </FormField>
          </div>

          <FormField label="Leave Classification" required>
            <Select
              value={newLeave.type}
              onChange={(e) => setNewLeave((prev) => ({ ...prev, type: e.target.value }))}
            >
              <option value="casual">Casual Leave</option>
              <option value="medical">Medical / Sick Leave</option>
              <option value="academic">Academic / Sabbatical Leave</option>
              <option value="maternity">Maternity / Paternity Leave</option>
              <option value="unpaid">Leave Without Pay (LWP)</option>
            </Select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date" required>
              <Input
                type="date"
                value={newLeave.startDate}
                onChange={(e) => setNewLeave((prev) => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </FormField>

            <FormField label="End Date" required>
              <Input
                type="date"
                value={newLeave.endDate}
                onChange={(e) => setNewLeave((prev) => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </FormField>
          </div>

          <FormField label="Reason for Leave" required>
            <Textarea
              value={newLeave.reason}
              onChange={(e) => setNewLeave((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="State reason, coverage arrangements, and emergency contact details..."
              rows={3}
              required
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
