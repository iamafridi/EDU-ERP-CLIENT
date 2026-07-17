"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, X, CheckCircle2, Trash2, Pencil } from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";

const ROLE_BADGES: Record<string, string> = {
  "super-admin": "bg-purple-50 text-purple-700 border-purple-100",
  "domain-admin": "bg-blue-50 text-blue-700 border-blue-100",
  faculty: "bg-amber-50 text-amber-700 border-amber-100",
  student: "bg-emerald-50 text-emerald-700 border-emerald-100",
  staff: "bg-slate-50 text-slate-600 border-slate-200",
};

const STATUS_BADGES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  blocked: "bg-red-50 text-red-700 border-red-100",
  pending: "bg-amber-50 text-amber-700 border-amber-100",
};

export default function UserManagementPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, search, roleFilter, statusFilter],
    queryFn: () => api.getUsers({ page, limit: 15, searchTerm: search || undefined, role: roleFilter || undefined, status: statusFilter || undefined }),
  });

  const usersList: any[] = data?.users ?? [];
  const meta = data?.meta ?? { page: 1, limit: 15, total: 0, totalPages: 1 };

  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSuccessMsg("User updated successfully.");
      setEditingUser(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: api.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSuccessMsg("User deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
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

  const handleSaveEdit = () => {
    if (!editingUser) return;
    const payload: any = { role: editRole, status: editStatus };
    if (editRole === "domain-admin") payload.domainAdminType = editDomainType;
    if (editRole === "staff") { payload.staffCategory = editStaffCategory; payload.staffSubRole = editStaffSubRole; }
    updateUserMutation.mutate({ id: editingUser.id || editingUser._id, payload });
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-[#2563EB]" />
            User Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage system users, roles, and account status.</p>
        </div>
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" /> <span>{successMsg}</span>
        </motion.div>
      )}

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search by email or name..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full h-9 pl-8 pr-3 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] font-mono" />
            </div>
            <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="h-9 px-3 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]">
              <option value="">All Roles</option>
              <option value="super-admin">Super Admin</option>
              <option value="domain-admin">Domain Admin</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
            </select>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 px-3 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : usersList.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={32} className="text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Email</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Role</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Staff Sub Role</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Last Login</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e2ed]">
                {usersList.map((u: any) => (
                  <tr key={u.id || u._id} className="hover:bg-slate-50/50 text-xs">
                    <td className="p-3 font-semibold text-slate-800">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${ROLE_BADGES[u.role] || ""}`}>{u.role}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${STATUS_BADGES[u.status] || ""}`}>{u.status}</span>
                    </td>
                    <td className="p-3 text-slate-500">{u.staffSubRole || "\u2014"}</td>
                    <td className="p-3 font-mono text-slate-400">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "Never"}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditModal(u)}
                          className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-[#2563EB] transition-colors cursor-pointer" title="Edit user">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => { if (confirm("Delete this user?")) deleteUserMutation.mutate(u.id || u._id); }}
                          className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors cursor-pointer" title="Delete user">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-3 border-t border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-400">Total: {meta.total} users</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
              className="h-7 px-2 bg-white border border-[#c3c6d7] rounded text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40">Prev</button>
            <span className="text-xs font-semibold text-slate-500">Page {meta.page} of {meta.totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages}
              className="h-7 px-2 bg-white border border-[#c3c6d7] rounded text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Edit User</span>
                <button onClick={() => setEditingUser(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="text-xs text-slate-500 mb-2">Editing: <span className="font-semibold text-slate-800">{editingUser.email}</span></div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Role</label>
                  <select value={editRole} onChange={(e) => setEditRole(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]">
                    <option value="super-admin">Super Admin</option>
                    <option value="domain-admin">Domain Admin</option>
                    <option value="faculty">Faculty</option>
                    <option value="student">Student</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Status</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]">
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                {editRole === "domain-admin" && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Domain Admin Type</label>
                    <input type="text" value={editDomainType} onChange={(e) => setEditDomainType(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
                  </div>
                )}
                {editRole === "staff" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Staff Category</label>
                      <input type="text" value={editStaffCategory} onChange={(e) => setEditStaffCategory(e.target.value)}
                        className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Staff Sub Role</label>
                      <input type="text" value={editStaffSubRole} onChange={(e) => setEditStaffSubRole(e.target.value)}
                        className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
                    </div>
                  </>
                )}
                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button onClick={() => setEditingUser(null)}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer">Cancel</button>
                  <button onClick={handleSaveEdit} disabled={updateUserMutation.isPending}
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer">
                    <Pencil size={14} /> Save
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
