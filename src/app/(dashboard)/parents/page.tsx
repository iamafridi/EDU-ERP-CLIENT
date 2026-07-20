"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Eye, CheckCircle2, X, Mail, Phone } from "lucide-react";

interface ParentRow {
  id: string;
  name: string;
  email: string;
  contactNo: string;
  occupation: string;
  children: { id: string; name: string }[];
}

export default function ParentsPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [occupation, setOccupation] = useState("");
  const [childrenText, setChildrenText] = useState("");

  const isAdminOrRegistrar = roleIs("domain-admin", "super-admin");

  const { data: parents = [], isLoading } = useQuery<ParentRow[]>({
    queryKey: ["parents"],
    queryFn: api.getParents,
  });

  const createMutation = useMutation({
    mutationFn: api.createParent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parents"] });
      setSuccessMsg("Parent profile created successfully.");
      setShowCreateModal(false);
      setName(""); setEmail(""); setContactNo(""); setOccupation(""); setChildrenText("");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const children = childrenText
      ? childrenText.split(",").map((c) => ({ id: `STU-${c.trim().substring(0, 3).toUpperCase()}`, name: c.trim() }))
      : [];
    createMutation.mutate({ name, email, contactNo, occupation, children });
  };

  const columns: Column<ParentRow>[] = [
    { header: "Name", accessor: (row) => <span className="font-bold text-slate-700">{(typeof row.name === 'string' ? row.name : `${(row.name as any)?.firstName ?? ''} ${(row.name as any)?.lastName ?? ''}`.trim()) || ''}</span> },
    {
      header: "Contact",
      accessor: (row) => (
        <div className="space-y-0.5">
          <span className="text-xs text-slate-600 flex items-center gap-1"><Mail size={10} />{row.email}</span>
          <span className="text-xs text-slate-500 font-mono flex items-center gap-1"><Phone size={10} />{row.contactNo}</span>
        </div>
      ),
    },
    {
      header: "Children",
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.children.map((child) => (
            <span key={child.id} className="px-1.5 py-0.5 bg-blue-50 text-[#2563EB] rounded text-[10px] font-semibold">
              {child.name}
            </span>
          ))}
        </div>
      ),
    },
    { header: "Occupation", accessor: "occupation" },
    {
      header: "Actions",
      accessor: (row) => (
        <button
          onClick={() => alert(`Viewing details for ${typeof row.name === 'string' ? row.name : `${(row.name as any)?.firstName ?? ''} ${(row.name as any)?.lastName ?? ''}`.trim() || row.id}`)}
          className="h-7 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded text-[10px] transition-colors cursor-pointer flex items-center gap-1 border border-slate-200"
        >
          <Eye size={12} /> View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-[#2563EB]" />
            Parent Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">View and manage parent/guardian profiles linked to students.</p>
        </div>
        {isAdminOrRegistrar && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto shadow-sm shadow-blue-500/10"
          >
            <Plus size={16} />
            Create Parent
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

      {isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : (
        <DataTable<ParentRow>
          data={parents}
          columns={columns}
          searchPlaceholder="Search by parent name..."
          searchField="name"
        />
      )}

      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Create Parent Profile</span>
                <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Robert Chen" className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="parent@email.com" className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Contact No</label>
                    <input type="text" value={contactNo} onChange={(e) => setContactNo(e.target.value)} placeholder="+1 555-1111" className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Occupation</label>
                  <input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="e.g. Software Engineer" className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Children Names (comma separated)</label>
                  <input type="text" value={childrenText} onChange={(e) => setChildrenText(e.target.value)} placeholder="e.g. Marcus Chen, Sophia Martinez" className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                  <button type="submit" className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5">
                    <Users size={14} />
                    Create Parent
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
