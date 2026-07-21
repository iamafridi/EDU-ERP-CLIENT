"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Plus, CheckCircle2, X, Edit3, Trash2, Search, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";

const CATEGORIES = ["Salary", "Infrastructure", "Equipment", "Research", "Scholarship", "Travel", "Supplies", "Maintenance", "Other"];
const STATUSES = ["active", "closed", "cancelled"];

export default function BudgetPage() {
  const { user } = useAuthStore();
  const { roleIs, can } = usePermission();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const [budgetHead, setBudgetHead] = useState("");
  const [category, setCategory] = useState("Equipment");
  const [allocatedAmount, setAllocatedAmount] = useState(0);
  const [spentAmount, setSpentAmount] = useState(0);
  const [fiscalYear, setFiscalYear] = useState("2026-2027");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("active");
  const [description, setDescription] = useState("");

  const isFinanceOrAdmin = roleIs("domain-admin", "super-admin") || user?.staffSubRole === "accountant";

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: api.getBudgets,
  });

  const { data: summary } = useQuery({
    queryKey: ["budget-summary"],
    queryFn: api.getBudgetSummary,
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.createBudget(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-summary"] });
      setSuccessMsg("Budget created successfully.");
      setShowCreateModal(false);
      resetForm();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateBudget(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-summary"] });
      setSuccessMsg("Budget updated successfully.");
      setEditingBudget(null);
      resetForm();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-summary"] });
      setSuccessMsg("Budget deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const resetForm = () => {
    setBudgetHead("");
    setCategory("Equipment");
    setAllocatedAmount(0);
    setSpentAmount(0);
    setFiscalYear("2026-2027");
    setDepartment("");
    setStatus("active");
    setDescription("");
  };

  const openEdit = (budget: any) => {
    setEditingBudget(budget);
    setBudgetHead(budget.budgetHead);
    setCategory(budget.category);
    setAllocatedAmount(budget.allocatedAmount);
    setSpentAmount(budget.spentAmount || 0);
    setFiscalYear(budget.fiscalYear);
    setDepartment(budget.department || "");
    setStatus(budget.status);
    setDescription(budget.description || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetHead || !allocatedAmount) return;
    const payload = { budgetHead, category, allocatedAmount: Number(allocatedAmount), spentAmount: Number(spentAmount), fiscalYear, department, status, description };
    if (editingBudget) {
      updateMutation.mutate({ id: editingBudget.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const totals = summary?.data?.totals || { totalAllocated: 0, totalSpent: 0, count: 0 };
  const remaining = totals.totalAllocated - totals.totalSpent;

  const filtered = budgets.filter((b: any) =>
    !searchTerm || b.budgetHead.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.department || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.fiscalYear.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wallet className="text-[#2563EB]" />
            Budget Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage departmental budgets, allocations, and spending.</p>
        </div>
        {isFinanceOrAdmin && (
          <button
            onClick={() => { resetForm(); setShowCreateModal(true); }}
            className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto shadow-sm shadow-blue-500/10"
          >
            <Plus size={16} />
            Add Budget
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-[#e1e2ed] p-6 rounded-xl shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Total Allocated</span>
          <span className="text-2xl font-bold text-slate-800 font-mono block">${totals.totalAllocated.toLocaleString()}</span>
        </div>
        <div className="bg-white border border-[#e1e2ed] p-6 rounded-xl shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Total Spent</span>
          <span className="text-2xl font-bold text-slate-800 font-mono block">${totals.totalSpent.toLocaleString()}</span>
        </div>
        <div className="bg-white border border-[#e1e2ed] p-6 rounded-xl shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Remaining</span>
          <span className={`text-2xl font-bold font-mono block ${remaining >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            ${remaining.toLocaleString()}
          </span>
        </div>
        <div className="bg-white border border-[#e1e2ed] p-6 rounded-xl shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Budget Lines</span>
          <span className="text-2xl font-bold text-slate-800 font-mono block">{totals.count}</span>
        </div>
      </div>

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Budget Records</span>
          <div className="relative">
            <input
              type="text"
              placeholder="Search budgets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-56 h-9 pl-9 pr-3 bg-white border border-[#c3c6d7] rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : filtered.length === 0 ? (
          <p className="p-12 text-center text-xs text-slate-400">No budgets recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Budget Head</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Category</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Allocated</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Spent</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Remaining</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Fiscal Year</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                  {isFinanceOrAdmin && <th className="p-3 text-xs font-bold text-slate-400 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e2ed]">
                {filtered.map((budget: any) => {
                  const rem = budget.allocatedAmount - budget.spentAmount;
                  return (
                    <tr key={budget.id} className="hover:bg-slate-50/50 text-xs">
                      <td className="p-3 font-semibold text-slate-700">{budget.budgetHead}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-semibold">
                          {budget.category}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700">${budget.allocatedAmount.toLocaleString()}</td>
                      <td className="p-3 font-mono text-slate-600">${budget.spentAmount.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`font-mono font-bold ${rem >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          ${rem.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono">{budget.fiscalYear}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          budget.status === "active" ? "bg-green-50 text-green-700" :
                          budget.status === "closed" ? "bg-slate-100 text-slate-600" :
                          "bg-red-50 text-red-700"
                        }`}>
                          {budget.status}
                        </span>
                      </td>
                      {isFinanceOrAdmin && (
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEdit(budget)}
                              className="h-7 w-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => { if (confirm("Delete this budget?")) deleteMutation.mutate(budget.id); }}
                              className="h-7 w-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Budget Modal */}
      <AnimatePresence>
        {(showCreateModal || editingBudget) && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">
                  {editingBudget ? "Edit Budget" : "Add New Budget"}
                </span>
                <button
                  onClick={() => { setShowCreateModal(false); setEditingBudget(null); resetForm(); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 block">Budget Head</label>
                  <input
                    type="text"
                    value={budgetHead}
                    onChange={(e) => setBudgetHead(e.target.value)}
                    placeholder="e.g. Computer Lab Upgrade"
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all text-slate-700"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 block">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all text-slate-700"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 block">Fiscal Year</label>
                    <input
                      type="text"
                      value={fiscalYear}
                      onChange={(e) => setFiscalYear(e.target.value)}
                      placeholder="e.g. 2026-2027"
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all text-slate-700"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 block">Allocated Amount ($)</label>
                    <input
                      type="number"
                      value={allocatedAmount}
                      onChange={(e) => setAllocatedAmount(Number(e.target.value))}
                      min={0}
                       className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all text-slate-700"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 block">Spent Amount ($)</label>
                    <input
                      type="number"
                      value={spentAmount}
                      onChange={(e) => setSpentAmount(Number(e.target.value))}
                      min={0}
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all text-slate-700"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 block">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 block">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all text-slate-700"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 block">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description..."
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all resize-none text-slate-700"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button
                    type="button"
                    onClick={() => { setShowCreateModal(false); setEditingBudget(null); resetForm(); }}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    {editingBudget ? "Update Budget" : "Add Budget"}
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
