"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, Plus, X, CheckCircle2 } from "lucide-react";
import { generateReceiptPDF } from "@/components/receipt/ReceiptPDF";

function mapReceipt(r: any) {
  const pm = r.paymentMethod?.toLowerCase?.() || "";
  const paymentMethod =
    pm === "online" ? "Online" :
    pm === "bank-transfer" || pm === "bank_transfer" ? "Bank Transfer" :
    pm === "cheque" ? "Cheque" :
    r.paymentMethod || "Online";
  return {
    ...r,
    studentId: r.studentId ?? r.student ?? "",
    semester: r.semester ?? "",
    transactionId: r.transactionId ?? `TXN-${Math.floor(Math.random() * 900000) + 100000}`,
    paymentMethod,
    items: r.items ?? [{ description: r.feeType ?? "Fee Payment", amount: r.amount }],
  };
}

export default function ReceiptsPage() {
  const { user } = useAuthStore();
  const { roleIs, can } = usePermission();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [semester, setSemester] = useState("");
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [feeType, setFeeType] = useState("Fee Payment");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadPDF = (receipt: any) => {
    setDownloadingId(receipt.id);
    try {
      const doc = generateReceiptPDF({
        receiptNo: receipt.receiptNo,
        date: receipt.date,
        studentName: receipt.studentName,
        studentId: receipt.studentId,
        semester: receipt.semester,
        paymentMethod: receipt.paymentMethod,
        transactionId: receipt.transactionId,
        items: receipt.items,
      });
      doc.save(`receipt-${receipt.receiptNo}.pdf`);
    } finally {
      setDownloadingId(null);
    }
  };

  const isAccountantOrAdmin = roleIs("domain-admin", "super-admin") || user?.staffSubRole === "accountant";

  const { data: receipts = [] } = useQuery({
    queryKey: ["receipts"],
    queryFn: async () => {
      const raw = await api.getReceipts();
      return raw.map(mapReceipt);
    },
  });

  const createReceiptMutation = useMutation({
    mutationFn: (payload: any) => api.createReceipt(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      setSuccessMsg("Receipt created successfully.");
      setShowCreateModal(false);
      setStudentName(""); setStudentId(""); setSemester(""); setAmount(0);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleCreateReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !amount) return;
    createReceiptMutation.mutate({
      studentName, studentId, semester,
      amount: Number(amount), paymentMethod, feeType,
    });
  };

  const filtered = receipts.filter((r: any) =>
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.studentId || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Payment Receipts
          </h1>
          <p className="text-xs text-slate-400 mt-1">View and download payment receipts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search receipts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 h-10 pl-10 pr-4 bg-white border border-[#c3c6d7] rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
            />
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          </div>
          {isAccountantOrAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-sm shadow-blue-500/10"
            >
              <Plus size={16} />
              Create Receipt
            </button>
          )}
        </div>
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

      <div className="bg-white border border-[#e1e2ed] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-[#e1e2ed]">
                <th className="h-11 px-4 text-xs font-semibold text-[#434655] uppercase tracking-wider">Receipt No</th>
                <th className="h-11 px-4 text-xs font-semibold text-[#434655] uppercase tracking-wider">Student</th>
                <th className="h-11 px-4 text-xs font-semibold text-[#434655] uppercase tracking-wider">Semester</th>
                <th className="h-11 px-4 text-xs font-semibold text-[#434655] uppercase tracking-wider">Amount</th>
                <th className="h-11 px-4 text-xs font-semibold text-[#434655] uppercase tracking-wider">Payment Method</th>
                <th className="h-11 px-4 text-xs font-semibold text-[#434655] uppercase tracking-wider">Date</th>
                <th className="h-11 px-4 text-xs font-semibold text-[#434655] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((receipt: any) => (
                <tr key={receipt.id} className="h-14 border-b border-[#e1e2ed]/80 hover:bg-slate-50/40 transition-colors">
                  <td className="px-4 text-sm font-semibold text-[#2563EB]">{receipt.receiptNo}</td>
                  <td className="px-4">
                    <div className="text-sm font-semibold text-slate-700">{receipt.studentName}</div>
                    <div className="text-[10px] text-slate-400">{receipt.studentId}</div>
                  </td>
                  <td className="px-4 text-sm text-slate-600">{receipt.semester}</td>
                  <td className="px-4 text-sm font-semibold text-slate-700">₹{receipt.amount.toLocaleString()}</td>
                  <td className="px-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      receipt.paymentMethod === "Online" ? "bg-blue-50 text-blue-700" :
                      receipt.paymentMethod === "Bank Transfer" ? "bg-purple-50 text-purple-700" :
                      "bg-amber-50 text-amber-700"
                    }`}>
                      {receipt.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 text-sm text-slate-600">{receipt.date}</td>
                  <td className="px-4">
                    <button
                      onClick={() => handleDownloadPDF(receipt)}
                      disabled={downloadingId === receipt.id}
                      className="h-8 px-3 rounded-lg bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#2563EB]/20 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {downloadingId === receipt.id ? (
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-[#2563EB]/30 border-t-[#2563EB] animate-spin" />
                      ) : (
                        <Download size={14} />
                      )}
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">
                    No receipts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Receipt Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Create New Receipt</span>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreateReceipt} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Student Name</label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Marcus Chen"
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Student ID</label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. STU-001"
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Semester</label>
                    <input
                      type="text"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      placeholder="e.g. Fall 2026"
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    />
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
                    <label className="text-xs font-semibold text-slate-500">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    >
                      <option value="cash">Cash</option>
                      <option value="online">Online</option>
                      <option value="bank-transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Fee Type</label>
                    <select
                      value={feeType}
                      onChange={(e) => setFeeType(e.target.value)}
                      className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    >
                      <option value="Fee Payment">Fee Payment</option>
                      <option value="Tuition Fee">Tuition Fee</option>
                      <option value="Hostel Fee">Hostel Fee</option>
                      <option value="Mess Fee">Mess Fee</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createReceiptMutation.isPending}
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {createReceiptMutation.isPending ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
                    ) : (
                      <Plus size={14} />
                    )}
                    Generate Receipt
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
