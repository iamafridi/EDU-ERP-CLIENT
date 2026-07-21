"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Plus, CheckCircle2, X, Edit3, Trash2, Search } from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";

const CATEGORIES = ["Equipment", "Supplies", "Utilities", "Maintenance", "Salary", "Travel", "Other"];

export default function ExpensesPage() {
  const { user } = useAuthStore();
  const { roleIs, can } = usePermission();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Equipment");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paidBy, setPaidBy] = useState("");

  const isAccountantOrAdmin = roleIs("domain-admin", "super-admin") || user?.staffSubRole === "accountant";

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: api.getExpenses,
  });

  const { data: summary } = useQuery({
    queryKey: ["expense-summary"],
    queryFn: api.getExpenseSummary,
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.createExpense(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
      setSuccessMsg("Expense recorded successfully.");
      setShowCreateModal(false);
      resetForm();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateExpense(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
      setSuccessMsg("Expense updated successfully.");
      setEditingExpense(null);
      resetForm();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
      setSuccessMsg("Expense deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const resetForm = () => {
    setDescription("");
    setCategory("Equipment");
    setAmount(0);
    setDate(new Date().toISOString().split("T")[0]);
    setPaidBy("");
  };

  const openEdit = (expense: any) => {
    setEditingExpense(expense);
    setDescription(expense.description);
    setCategory(expense.category);
    setAmount(expense.amount);
    setDate(expense.date);
    setPaidBy(expense.paidBy || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    const payload = { description, category, amount: Number(amount), date, paidBy };
    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const totalExpenses = summary?.data?.total || expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

  const filtered = expenses.filter((e: any) =>
    !searchTerm || e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.paidBy || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="text-[#2563EB]" />
            Expense Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Track institutional spending and manage expense records.</p>
        </div>
        {isAccountantOrAdmin && (
          <button
            onClick={() => { resetForm(); setShowCreateModal(true); }}
            className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto shadow-sm shadow-blue-500/10"
          >
            <Plus size={16} />
            Add Expense
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#e1e2ed] p-6 rounded-xl shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Total Expenses</span>
          <span className="text-2xl font-bold text-slate-800 font-mono block">${totalExpenses.toLocaleString()}</span>
        </div>
        <div className="bg-white border border-[#e1e2ed] p-6 rounded-xl shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Total Records</span>
          <span className="text-2xl font-bold text-slate-800 font-mono block">{expenses.length}</span>
        </div>
        <div className="bg-white border border-[#e1e2ed] p-6 rounded-xl shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Categories</span>
          <span className="text-2xl font-bold text-slate-800 font-mono block">
            {summary?.data?.byCategory ? Object.keys(summary.data.byCategory).length : new Set(expenses.map((e: any) => e.category)).size}
          </span>
        </div>
      </div>

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expense Records</span>
          <div className="relative">
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-56 h-9 pl-9 pr-3 bg-white border border-[#c3c6d7] rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : filtered.length === 0 ? (
          <p className="p-12 text-center text-xs text-slate-400">No expenses recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Description</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Category</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Amount</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Date</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Paid By</th>
                  {isAccountantOrAdmin && <th className="p-3 text-xs font-bold text-slate-400 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e2ed]">
                {filtered.map((expense: any) => (
                  <tr key={expense.id} className="hover:bg-slate-50/50 text-xs">
                    <td className="p-3 font-semibold text-slate-700">{expense.description}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-semibold">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700">${expense.amount.toLocaleString()}</td>
                    <td className="p-3 text-slate-400 font-mono">{expense.date}</td>
                    <td className="p-3 text-slate-500">{expense.paidBy || "—"}</td>
                    {isAccountantOrAdmin && (
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEdit(expense)}
                            className="h-7 w-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() => { if (confirm("Delete this expense?")) deleteMutation.mutate(expense.id); }}
                            className="h-7 w-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Expense Modal */}
      <AnimatePresence>
        {(showCreateModal || editingExpense) && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">
                  {editingExpense ? "Edit Expense" : "Add New Expense"}
                </span>
                <button
                  onClick={() => { setShowCreateModal(false); setEditingExpense(null); resetForm(); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Laboratory equipment purchase"
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Amount ($)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      min={0}
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Paid By</label>
                    <input
                      type="text"
                      value={paidBy}
                      onChange={(e) => setPaidBy(e.target.value)}
                      placeholder="e.g. Accounts Dept"
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button
                    type="button"
                    onClick={() => { setShowCreateModal(false); setEditingExpense(null); resetForm(); }}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    {editingExpense ? "Update Expense" : "Add Expense"}
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
