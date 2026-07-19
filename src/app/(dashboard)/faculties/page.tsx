"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Plus, Pencil, Trash2, Mail, Phone, Building, CheckCircle2, X } from "lucide-react";

interface FacultyRow {
  id?: string;
  facultyId: string;
  name: string;
  email: string;
  contactNo: string;
  designation: string;
  academicDepartment: string;
}

export default function FacultyDirectoryPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");

  const canModify = roleIs("super-admin", "domain-admin");

  // Create modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newDesignation, setNewDesignation] = useState("Professor");
  const [newDept, setNewDept] = useState("Computer Science");

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [editDept, setEditDept] = useState("");

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FacultyRow | null>(null);

  const { data: faculties = [], isLoading } = useQuery<FacultyRow[]>({
    queryKey: ["faculties"],
    queryFn: api.getFaculties,
  });

  const { data: departments = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["departments"],
    queryFn: api.getAcademicDepartments,
  });

  const deptOptions = departments.length > 0
    ? departments.map((d) => d.name)
    : ["Computer Science", "Microbiology", "Cardiology", "Neurology"];

  const createFacultyMutation = useMutation({
    mutationFn: api.createFaculty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
      setShowAddModal(false);
      setNewName("");
      setNewEmail("");
      setNewContact("");
      setSuccessMsg("Faculty created successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: Record<string, unknown> }) =>
      api.updateFaculty(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
      setSuccessMsg("Faculty updated successfully.");
      setIsEditOpen(false);
      setSelectedFaculty(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteFaculty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
      setSuccessMsg("Faculty deleted successfully.");
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleAddFacultySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newContact) return;
    createFacultyMutation.mutate({
      password: "facultypassword123",
      faculty: {
        name: newName,
        email: newEmail,
        contactNo: newContact,
        designation: newDesignation,
        academicDepartment: newDept,
      },
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFaculty) return;
    updateMutation.mutate({
      id: selectedFaculty.id || selectedFaculty.facultyId,
      data: {
        name: editName,
        email: editEmail,
        contactNo: editContact,
        designation: editDesignation,
        academicDepartment: editDept,
      },
    });
  };

  const openEdit = (fac: FacultyRow) => {
    setSelectedFaculty(fac);
    setEditName(fac.name);
    setEditEmail(fac.email);
    setEditContact(fac.contactNo);
    setEditDesignation(fac.designation);
    setEditDept(fac.academicDepartment);
    setIsEditOpen(true);
  };

  const openDelete = (fac: FacultyRow) => {
    setDeleteTarget(fac);
    setIsDeleteOpen(true);
  };

  const columns: Column<FacultyRow>[] = [
    {
      header: "Faculty Name",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
            {(typeof row.name === 'string' ? row.name : (row.name as any)?.firstName ?? '').charAt(0) || '?'}
          </div>
          <Link href={`/faculties/${row.facultyId}`} className="font-semibold text-slate-800 hover:text-[#2563EB] transition-colors">
            {(typeof row.name === 'string' ? row.name : `${(row.name as any)?.firstName ?? ''} ${(row.name as any)?.lastName ?? ''}`.trim()) || ''}
          </Link>
        </div>
      ),
    },
    {
      header: "Faculty ID",
      accessor: "facultyId",
      className: "font-mono text-slate-500",
    },
    { header: "Designation", accessor: "designation" },
    { header: "Department", accessor: "academicDepartment" },
    { header: "Email Address", accessor: "email" },
    { header: "Contact Number", accessor: "contactNo" },
    ...(canModify
      ? [
          {
            header: "Actions",
            accessor: (row: FacultyRow) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(row)}
                  className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => openDelete(row)}
                  className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ),
          } as Column<FacultyRow>,
        ]
      : []),
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Faculty Directory
            <GraduationCap size={22} className="text-emerald-600" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Displaying all registered academic professors and department leads.
          </p>
        </div>

        {canModify && (
          <button
            onClick={() => setShowAddModal(true)}
            className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus size={16} />
            Onboard Faculty
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
        <DataTable<FacultyRow>
          data={faculties}
          columns={columns}
          searchPlaceholder="Search faculty by name..."
          searchField="name"
        />
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white border border-[#c3c6d7] shadow-xl rounded-xl p-6 relative font-sans"
            >
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <GraduationCap size={20} className="text-[#2563EB]" />
                Onboard New Faculty Member
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">
                Enter details to register an academic staff and generate profile records.
              </p>

              <form onSubmit={handleAddFacultySubmit} className="space-y-4 mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Full Name</label>
                    <input
                      type="text"
                      placeholder="Dr. Evelyn Parker"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Academic Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="e.parker@college.edu"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                        required
                      />
                      <Mail size={14} className="absolute left-3 top-3 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Contact Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="+1 555-4831"
                        value={newContact}
                        onChange={(e) => setNewContact(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                        required
                      />
                      <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Designation</label>
                    <select
                      value={newDesignation}
                      onChange={(e) => setNewDesignation(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all cursor-pointer"
                    >
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Lecturer">Lecturer</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Building size={14} /> Assigned Department
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all cursor-pointer"
                  >
                    {deptOptions.map((d: string) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e1e2ed] mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createFacultyMutation.isPending}
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2"
                  >
                    {createFacultyMutation.isPending ? "Creating..." : "Save Record"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditOpen && selectedFaculty && (
          <ModalShell title="Edit Faculty" onClose={() => setIsEditOpen(false)}>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Contact Number</label>
                  <input
                    type="text"
                    value={editContact}
                    onChange={(e) => setEditContact(e.target.value)}
                    required
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Designation</label>
                  <select
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all cursor-pointer"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Building size={14} /> Department
                </label>
                <select
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all cursor-pointer"
                >
                  {deptOptions.map((d: string) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                <button type="button" onClick={() => setIsEditOpen(false)} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"><Pencil size={14} /> Update</button>
              </div>
            </form>
          </ModalShell>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {isDeleteOpen && deleteTarget && (
          <ModalShell title="Delete Faculty" onClose={() => setIsDeleteOpen(false)}>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                <button type="button" onClick={() => setIsDeleteOpen(false)} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button
                  onClick={() => deleteMutation.mutate(deleteTarget.id || deleteTarget.facultyId)}
                  className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-800">{title}</span>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
