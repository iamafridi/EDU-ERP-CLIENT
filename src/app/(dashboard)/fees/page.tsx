"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, DollarSign, Plus, CheckCircle2, AlertCircle, FileText, Download, Landmark, Users, Calendar, X, Edit3, Trash2 } from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";

const feeSchema = zod.object({
  studentId: zod.string().min(3, "Student Registration ID is required"),
  studentName: zod.string().min(2, "Student Name is required"),
  semester: zod.string().min(2, "Semester is required"),
  type: zod.enum(["Tuition Fee", "Hostel Fee", "Mess Fee", "Laundry Fee", "Other"]),
  amount: zod.number().min(100, "Amount must be at least 100"),
  dueDate: zod.string().min(10, "Please provide a valid due date (YYYY-MM-DD)"),
});

type FeeFormValues = zod.infer<typeof feeSchema>;

export default function FeesPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [payingFee, setPayingFee] = useState<any>(null);
  const [payMethod, setPayMethod] = useState("cash");
  const [successMsg, setSuccessMsg] = useState("");
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkSemesterId, setBulkSemesterId] = useState("");
  const [bulkDueDate, setBulkDueDate] = useState("");

  const isAccountantOrAdmin = roleIs("domain-admin") || user?.staffSubRole === "accountant";

  const { data: fees = [], isLoading: isLoadingFees } = useQuery({
    queryKey: ["fees"],
    queryFn: api.getFees,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["payments"],
    queryFn: api.getPayments,
  });

  const generateFeeMutation = useMutation({
    mutationFn: api.generateFee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      setSuccessMsg("Semester dues invoice generated successfully.");
      setIsGenModalOpen(false);
      resetFeeForm();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const recordPaymentMutation = useMutation({
    mutationFn: api.createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setSuccessMsg("Transaction cleared. Invoice marked as PAID.");
      setPayingFee(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateFeeMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateFee(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      setSuccessMsg("Invoice updated successfully.");
      setEditingFee(null);
      setIsGenModalOpen(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteFeeMutation = useMutation({
    mutationFn: (id: string) => api.deleteFee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      setSuccessMsg("Invoice deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const { data: semesters = [] } = useQuery({
    queryKey: ["semesters"],
    queryFn: api.getSemesters,
  });

  const bulkGenerateMutation = useMutation({
    mutationFn: api.bulkGenerateFee,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      const msg = res?.data
        ? `${res.data.generatedCount} generated, ${res.data.skippedCount} skipped.`
        : "Bulk fee generation completed.";
      setSuccessMsg(`Bulk fee generation: ${msg}`);
      setIsBulkModalOpen(false);
      setBulkSemesterId("");
      setBulkDueDate("");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const [editingFee, setEditingFee] = useState<any>(null);

  const openEditFee = (fee: any) => {
    setEditingFee(fee);
    resetFeeForm({
      studentId: fee.studentId,
      studentName: fee.studentName,
      semester: fee.semester,
      type: fee.type,
      amount: fee.amount,
      dueDate: fee.dueDate,
    });
    setIsGenModalOpen(true);
  };

  const onSubmitFee = (values: FeeFormValues) => {
    if (editingFee) {
      updateFeeMutation.mutate({ id: editingFee.id, payload: values });
    } else {
      generateFeeMutation.mutate(values);
    }
  };

  const calcLateFee = (fee: any) => {
    if (fee.status === "paid" || !fee.dueDate) return 0;
    const due = new Date(fee.dueDate).getTime();
    const now = Date.now();
    if (now <= due) return 0;
    const daysOverdue = Math.floor((now - due) / (1000 * 60 * 60 * 24));
    return daysOverdue * 5;
  };

  const getPaymentForFee = (feeId: string) => {
    return payments.find((p: any) => p.fee === feeId);
  };

  const {
    register: registerFee,
    handleSubmit: handleSubmitFee,
    reset: resetFeeForm,
    formState: { errors: feeErrors },
  } = useForm<FeeFormValues>({
    resolver: zodResolver(feeSchema),
    defaultValues: {
      studentId: "",
      studentName: "",
      semester: "Fall 2026",
      type: "Hostel Fee",
      amount: 25000,
      dueDate: "2026-08-01",
    },
  });

  const handleClearPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingFee) return;
    recordPaymentMutation.mutate({
      fee: payingFee.id,
      student: payingFee.studentId,
      amount: payingFee.amount,
      method: payMethod,
    });
  };

  // Math totals
  const totalOutstanding = fees
    .filter((f: any) => f.status === "pending")
    .reduce((sum: number, f: any) => sum + f.amount, 0);

  const totalCollected = fees
    .filter((f: any) => f.status === "paid")
    .reduce((sum: number, f: any) => sum + f.amount, 0);

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="text-[#2563EB]" />
            Fee Ledger & Payment Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track student financial statements, generate tuition/hostel fee structures, and record receipts.
          </p>
        </div>

        {isAccountantOrAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto shadow-sm shadow-emerald-500/10"
            >
              <Users size={16} />
              Generate for All
            </button>
            <button
              onClick={() => setIsGenModalOpen(true)}
              className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto shadow-sm shadow-blue-500/10"
            >
              <Plus size={16} />
              Generate Dues Invoice
            </button>
          </div>
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

      {/* Finance KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#e1e2ed] p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 space-y-2">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
            Total Dues Collected
          </span>
          <span className="text-2xl font-bold text-emerald-600 font-mono block">
            ${totalCollected.toLocaleString()}
          </span>
        </div>

        <div className="bg-white border border-[#e1e2ed] p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 space-y-2">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
            Total Outstanding Balance
          </span>
          <span className="text-2xl font-bold text-amber-500 font-mono block">
            ${totalOutstanding.toLocaleString()}
          </span>
        </div>

        <div className="bg-white border border-[#e1e2ed] p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 space-y-2">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
            Active Accounts
          </span>
          <span className="text-2xl font-bold text-slate-800 font-mono block">
            {fees.length} Students
          </span>
        </div>
      </div>

      {/* Main Ledger List */}
      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            Accounts Receivable Ledger
          </span>
        </div>

        {isLoadingFees ? (
          <TableSkeleton rows={5} cols={6} />
        ) : fees.length === 0 ? (
          <p className="p-12 text-center text-xs text-slate-400">No invoices recorded in the system.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Student Name</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Fee Type</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Billing Semester</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Amount Due</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Due Date</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Receipts Status</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e2ed]">
                {fees.map((invoice: any) => {
                  const lateFee = calcLateFee(invoice);
                  const payment = getPaymentForFee(invoice.id);
                  return (
                  <tr key={invoice.id} className="hover:bg-slate-50/50 text-xs">
                    <td className="p-3">
                      <span className="font-bold text-slate-700 block">{invoice.studentName}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{invoice.studentId}</span>
                    </td>
                    <td className="p-3 font-semibold text-slate-600">{invoice.type}</td>
                    <td className="p-3 text-slate-500">{invoice.semester}</td>
                    <td className="p-3 font-mono font-bold text-slate-700">${invoice.amount.toLocaleString()}</td>
                    <td className="p-3">
                      <span className="text-slate-400 font-mono block">{invoice.dueDate}</span>
                      {lateFee > 0 && (
                        <span className="text-[10px] text-red-500 font-semibold block mt-0.5">
                          +${lateFee} late fee
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${
                        invoice.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        {invoice.status === "pending" && isAccountantOrAdmin ? (
                          <button
                            onClick={() => setPayingFee(invoice)}
                            className="h-7 px-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold rounded text-[10px] transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                          >
                            <DollarSign size={12} /> Pay
                          </button>
                        ) : payment ? (
                          <span className="text-[10px] text-emerald-600 font-semibold">
                            {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "Paid"}
                          </span>
                        ) : null}
                        {isAccountantOrAdmin && (
                          <>
                            <button
                              onClick={() => openEditFee(invoice)}
                              className="h-7 w-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => { if (confirm("Delete this invoice?")) deleteFeeMutation.mutate(invoice.id); }}
                              className="h-7 w-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Generator Modal */}
      <AnimatePresence>
        {isGenModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">{editingFee ? "Edit Invoice" : "Generate Student Dues Invoice"}</span>
                <button
                  onClick={() => { setIsGenModalOpen(false); setEditingFee(null); resetFeeForm(); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitFee(onSubmitFee)} className="p-6 space-y-4 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Student ID Code</label>
                    <input
                      type="text"
                      {...registerFee("studentId")}
                      placeholder="e.g. STU-001"
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono"
                    />
                    {feeErrors.studentId && (
                      <span className="text-[10px] text-red-500 font-semibold block">{feeErrors.studentId.message}</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Student Full Name</label>
                    <input
                      type="text"
                      {...registerFee("studentName")}
                      placeholder="e.g. Marcus Chen"
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    />
                    {feeErrors.studentName && (
                      <span className="text-[10px] text-red-500 font-semibold block">{feeErrors.studentName.message}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Fee Category</label>
                    <select
                      {...registerFee("type")}
                      className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    >
                      <option value="Tuition Fee">Tuition Fee</option>
                      <option value="Hostel Fee">Hostel Fee</option>
                      <option value="Mess Fee">Mess Fee</option>
                      <option value="Laundry Fee">Laundry Fee</option>
                      <option value="Other">Other Miscellaneous</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Billing Semester</label>
                    <input
                      type="text"
                      {...registerFee("semester")}
                      placeholder="e.g. Fall 2026"
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Invoice Sum ($)</label>
                    <input
                      type="number"
                      {...registerFee("amount", { valueAsNumber: true })}
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono"
                    />
                    {feeErrors.amount && (
                      <span className="text-[10px] text-red-500 font-semibold block">{feeErrors.amount.message}</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Due Date Limit</label>
                    <input
                      type="text"
                      {...registerFee("dueDate")}
                      placeholder="YYYY-MM-DD"
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono"
                    />
                    {feeErrors.dueDate && (
                      <span className="text-[10px] text-red-500 font-semibold block">{feeErrors.dueDate.message}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button
                    type="button"
                    onClick={() => { setIsGenModalOpen(false); setEditingFee(null); resetFeeForm(); }}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    {editingFee ? "Update Invoice" : "Issue Invoice"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Record Payment Dialog */}
      <AnimatePresence>
        {payingFee && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Clear Outstanding Invoice</span>
                <button
                  onClick={() => setPayingFee(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 bg-slate-50 border-b border-[#e1e2ed] space-y-2">
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Invoice Reference: {payingFee.id}</span>
                  <span>Semester: {payingFee.semester}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-700">{payingFee.studentName} — {payingFee.type}</h4>
                <div className="text-lg font-mono font-bold text-[#2563EB]">${payingFee.amount.toLocaleString()}</div>
              </div>

              <form onSubmit={handleClearPayment} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Settlement Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  >
                    <option value="cash">Cash Counter Receipt</option>
                    <option value="online">Online Payment Gateway Hook</option>
                    <option value="bank-transfer">Direct Bank Transfer Clear</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button
                    type="button"
                    onClick={() => setPayingFee(null)}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"
                  >
                    <Landmark size={14} />
                    Commit Transaction
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Generate Modal */}
      <AnimatePresence>
        {isBulkModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Users size={16} className="text-emerald-600" />
                  Generate Fees for All Students
                </span>
                <button
                  onClick={() => setIsBulkModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-500">
                  This will generate fee invoices for all students enrolled in the selected semester using the current fee structure.
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Academic Semester</label>
                  <select
                    value={bulkSemesterId}
                    onChange={(e) => setBulkSemesterId(e.target.value)}
                    className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  >
                    <option value="">Select semester...</option>
                    {semesters.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Calendar size={13} /> Due Date
                  </label>
                  <input
                    type="date"
                    value={bulkDueDate}
                    onChange={(e) => setBulkDueDate(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button
                    type="button"
                    onClick={() => setIsBulkModalOpen(false)}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (bulkSemesterId && bulkDueDate) {
                        bulkGenerateMutation.mutate({ academicSemester: bulkSemesterId, dueDate: bulkDueDate });
                      }
                    }}
                    disabled={!bulkSemesterId || !bulkDueDate || bulkGenerateMutation.isPending}
                    className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bulkGenerateMutation.isPending ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
                    ) : (
                      <Users size={14} />
                    )}
                    Generate for All
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
