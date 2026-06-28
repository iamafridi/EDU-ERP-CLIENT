"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Users, Pencil, Trash2, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import {
  PageHeader,
  Card,
  SearchInput,
  Select,
  FormField,
  Input,
  Badge,
  StatusBadge,
  Button,
  IconButton,
  Modal,
} from "@/components/ui";
import { showToast } from "@/components/dashboard/ToastFeedback";

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, search, roleFilter, statusFilter],
    queryFn: () =>
      api.getUsers({
        page,
        limit: 15,
        searchTerm: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      }),
  });

  const usersList: any[] = data?.users ?? [];
  const meta = data?.meta ?? { page: 1, limit: 15, total: 0, totalPages: 1 };

  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast({
        title: "User Profile Synchronized",
        description: "Institutional clearance and authorization updated.",
        variant: "success",
      });
      setEditingUser(null);
    },
    onError: () => {
      showToast({
        title: "Update Failed",
        description: "Could not update user record. Please try again.",
        variant: "error",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: api.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast({
        title: "Account Terminated",
        description: "User profile has been revoked from campus directory.",
        variant: "info",
      });
    },
    onError: () => {
      showToast({
        title: "Action Failed",
        description: "Could not delete user account.",
        variant: "error",
      });
    },
  });

  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editDomainType, setEditDomainType] = useState("");
  const [editStaffCategory, setEditStaffCategory] = useState("");
  const [editStaffSubRole, setEditStaffSubRole] = useState("");

  const openEditModal = (u: any) => {
    setEditingUser(u);
    setEditRole(u.role || "");
    setEditStatus(u.status || "active");
    setEditDomainType(u.domainAdminType || "");
    setEditStaffCategory(u.staffCategory || "");
    setEditStaffSubRole(u.staffSubRole || "");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const payload: any = { role: editRole, status: editStatus };
    if (editRole === "domain-admin") payload.domainAdminType = editDomainType;
    if (editRole === "staff") {
      payload.staffCategory = editStaffCategory;
      payload.staffSubRole = editStaffSubRole;
    }
    updateUserMutation.mutate({ id: editingUser.id || editingUser._id, payload });
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case "super-admin":
        return "primary";
      case "domain-admin":
        return "info";
      case "faculty":
        return "gold";
      case "student":
        return "success";
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-6 font-ui max-w-6xl animate-in fade-in duration-300">
      {/* Page Header */}
      <PageHeader
        title="User Governance & Directory"
        description="Manage campus-wide credentials, RBAC clearances, and institutional identity records."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Administration", href: "/admin" },
          { label: "Users" },
        ]}
      />

      {/* Filter & Table Container */}
      <Card pad="none" className="overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 border-b border-border bg-surface-muted/30">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 min-w-[240px]">
              <SearchInput
                size="sm"
                placeholder="Search users by email, identifier or designation..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                onClear={() => {
                  setSearch("");
                  setPage(1);
                }}
              />
            </div>

            <div className="flex items-center gap-2.5">
              <Select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 text-xs"
                wrapperClassName="w-40"
              >
                <option value="">All Clearances</option>
                <option value="super-admin">Super Admin</option>
                <option value="domain-admin">Domain Admin</option>
                <option value="faculty">Faculty</option>
                <option value="student">Student</option>
                <option value="staff">Staff</option>
              </Select>

              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 text-xs"
                wrapperClassName="w-36"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
                <option value="pending">Pending</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Content Table */}
        {isLoading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : usersList.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <Users size={36} className="text-text-subtle mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-semibold text-text">No user records found</h3>
            <p className="text-xs text-text-subtle">Try broadening your search term or adjusting role filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted/40 border-b border-border text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  <th className="py-3 px-4">User Identifier</th>
                  <th className="py-3 px-4">Clearance Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Domain / Sub-Role</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs">
                {usersList.map((u: any) => (
                  <tr key={u.id || u._id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-text">
                      <div className="flex flex-col">
                        <span>{u.name?.firstName ? `${u.name.firstName} ${u.name.lastName || ""}` : u.email}</span>
                        <span className="text-[11px] text-text-subtle font-mono font-normal">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={getRoleVariant(u.role)} size="sm">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={u.status || "active"} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-text-muted font-medium">
                      {u.domainAdminType || u.staffSubRole || "\u2014"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-text-subtle">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "Never"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <IconButton
                          label="Edit user authorization"
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(u)}
                        >
                          <Pencil size={13} />
                        </IconButton>
                        <IconButton
                          label="Revoke user account"
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            if (confirm(`Revoke and terminate account for ${u.email}?`)) {
                              deleteUserMutation.mutate(u.id || u._id);
                            }
                          }}
                        >
                          <Trash2 size={13} />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Unified Table Pagination Bar */}
        <div className="p-3.5 border-t border-border bg-surface-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-text-subtle font-mono">
            Total Records: <strong className="text-text font-bold">{meta.total}</strong>
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              leftIcon={<ChevronLeft size={13} />}
            >
              Prev
            </Button>
            <span className="font-mono text-text-muted px-2">
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
      </Card>

      {/* Shared Portal Modal for Editing User */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Update User Authorization"
        description={`Configure role clearance and institutional permissions for ${editingUser?.email}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={updateUserMutation.isPending}
              onClick={handleSaveEdit}
            >
              Save Credentials
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <FormField label="Security Clearance Role" htmlFor="role-select">
            <Select
              id="role-select"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
            >
              <option value="super-admin">Super Admin</option>
              <option value="domain-admin">Domain Admin</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
            </Select>
          </FormField>

          <FormField label="Account State" htmlFor="status-select">
            <Select
              id="status-select"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="pending">Pending</option>
            </Select>
          </FormField>

          {editRole === "domain-admin" && (
            <FormField label="Domain Administration Scope" htmlFor="domain-input">
              <Input
                id="domain-input"
                type="text"
                value={editDomainType}
                onChange={(e) => setEditDomainType(e.target.value)}
                placeholder="e.g. academic, finance, hostel"
              />
            </FormField>
          )}

          {editRole === "staff" && (
            <>
              <FormField label="Staff Category" htmlFor="staff-cat-input">
                <Input
                  id="staff-cat-input"
                  type="text"
                  value={editStaffCategory}
                  onChange={(e) => setEditStaffCategory(e.target.value)}
                  placeholder="e.g. administrative, medical-officer"
                />
              </FormField>

              <FormField label="Staff Sub-Role" htmlFor="staff-subrole-input">
                <Input
                  id="staff-subrole-input"
                  type="text"
                  value={editStaffSubRole}
                  onChange={(e) => setEditStaffSubRole(e.target.value)}
                  placeholder="e.g. warden, librarian, accountant"
                />
              </FormField>
            </>
          )}
        </form>
      </Modal>
    </div>
  );
}
