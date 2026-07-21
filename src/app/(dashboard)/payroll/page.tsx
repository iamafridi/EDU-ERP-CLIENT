"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Plus, CheckCircle2, DollarSign, FileText, X, Edit3, Trash2, Users } from "lucide-react";

interface PayrollRow {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  salary: number;
  month: string;
  status: string;
  paidDate: string | null;
}

interface SlipData {
  id: string;
  employee: any;
  month: number;
  year: number;
  basicSalary: number;
  allowances: { hra: number; da: number; travel: number; medical: number; special: number; total: number };
  deductions: { tax: number; providentFund: number; insurance: number; loan: number; other: number; total: number };
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  status: string;
  paymentDate?: string;
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function PayrollPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [slipData, setSlipData] = useState<SlipData | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<any>(null);

  const [employeeName, setEmployeeName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [salary, setSalary] = useState(50000);
  const [month, setMonth] = useState("June 2026");

  const isAccountantOrAdmin = roleIs("domain-admin", "super-admin") || user?.staffSubRole === "accountant";

  const { data: payroll = [], isLoading } = useQuery<PayrollRow[]>({
    queryKey: ["payroll"],
    queryFn: api.getPayrollRecords,
  });

  const createMutation = useMutation({
    mutationFn: api.createPayrollRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      setSuccessMsg("Payroll record created successfully.");
      setShowCreateModal(false);
      resetForm();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updatePayrollRecord(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      setSuccessMsg("Payroll record updated successfully.");
      setShowCreateModal(false);
      setEditingPayroll(null);
      resetForm();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deletePayrollRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      setSuccessMsg("Payroll record deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: string) => api.updatePayrollStatus({ id, status: "paid" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      setSuccessMsg("Payroll marked as paid.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const resetForm = () => {
    setEmployeeName(""); setEmployeeId(""); setDesignation(""); setDepartment("");
    setSalary(50000); setMonth("June 2026");
  };

  const openEdit = (row: PayrollRow) => {
    setEditingPayroll(row);
    setEmployeeName(row.employeeName);
    setEmployeeId(row.employeeId);
    setDesignation(row.designation);
    setDepartment(row.department);
    setSalary(row.salary);
    setMonth(row.month);
    setShowCreateModal(true);
  };

  const slipQuery = useQuery({
    queryKey: ["slip", slipData?.id],
    queryFn: () => (slipData?.id ? api.getSalarySlip(slipData.id) : null),
    enabled: false,
  });

  const handleViewSlip = async (row: PayrollRow) => {
    const data = await api.getSalarySlip(row.id);
    setSlipData(data);
    setShowSlipModal(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeName || !employeeId || !salary || !month) return;
    const payload = { employeeName, employeeId, designation, department, salary: Number(salary), month };
    if (editingPayroll) {
      updateMutation.mutate({ id: editingPayroll.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const totalPayroll = payroll.reduce((sum: number, r: any) => sum + r.salary, 0);
  const pendingAmount = payroll.filter((r: any) => r.status === "pending").reduce((sum: number, r: any) => sum + r.salary, 0);

  const columns: Column<PayrollRow>[] = [
    {
      header: "Employee",
      accessor: (row) => (
        <div>
          <span className="font-bold text-slate-700 block">{row.employeeName}</span>
          <span className="text-[10px] text-slate-400 font-mono block">{row.employeeId}</span>
        </div>
      ),
    },
    { header: "Designation", accessor: "designation" },
    { header: "Department", accessor: "department" },
    {
      header: "Salary",
      accessor: (row) => <span className="font-mono font-bold text-slate-700">${row.salary.toLocaleString()}</span>,
    },
    { header: "Month", accessor: "month" },
    {
      header: "Status",
      accessor: (row) => (
        <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${
          row.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleViewSlip(row)}
            className="h-7 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded text-[10px] transition-colors cursor-pointer flex items-center gap-1 border border-slate-200"
          >
            <FileText size={11} /> Slip
          </button>
          {row.status === "pending" ? (
            <button
              onClick={() => markPaidMutation.mutate(row.id)}
              className="h-7 px-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold rounded text-[10px] transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <CheckCircle2 size={12} /> Mark Paid
            </button>
          ) : (
            <span className="text-[10px] text-emerald-600 font-semibold">{row.paidDate}</span>
          )}
          {isAccountantOrAdmin && (
            <>
              <button
                onClick={() => openEdit(row)}
                className="h-7 w-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <Edit3 size={12} />
              </button>
              <button
                onClick={() => { if (confirm("Delete this payroll record?")) deleteMutation.mutate(row.id); }}
                className="h-7 w-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wallet className="text-[#2563EB]" />
            Payroll Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage employee salaries, process payroll, and track payment history.</p>
        </div>
        {isAccountantOrAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto shadow-sm shadow-blue-500/10"
          >
            <Plus size={16} />
            Create Payroll
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
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Total Payroll</span>
          <span className="text-2xl font-bold text-slate-800 font-mono block">${totalPayroll.toLocaleString()}</span>
        </div>
        <div className="bg-white border border-[#e1e2ed] p-6 rounded-xl shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Pending Amount</span>
          <span className="text-2xl font-bold text-amber-500 font-mono block">${pendingAmount.toLocaleString()}</span>
        </div>
        <div className="bg-white border border-[#e1e2ed] p-6 rounded-xl shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Employees on Payroll</span>
          <span className="text-2xl font-bold text-slate-800 font-mono block">{payroll.length}</span>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : (
        <DataTable<PayrollRow>
          data={payroll}
          columns={columns}
          searchPlaceholder="Search by employee name..."
          searchField="employeeName"
        />
      )}

      {/* Salary Slip Modal */}
      <AnimatePresence>
        {showSlipModal && slipData && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <FileText size={16} className="text-[#2563EB]" />
                  Salary Slip
                </span>
                <button onClick={() => setShowSlipModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="text-center border-b border-[#e1e2ed] pb-4">
                  <h3 className="text-lg font-bold text-slate-800">Medical College ERP</h3>
                  <p className="text-[10px] text-slate-400">Salary Slip — {MONTH_NAMES[slipData.month - 1] || ""} {slipData.year}</p>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div><span className="text-slate-400">Employee:</span> <span className="font-semibold text-slate-700">{(() => { const en = (slipData.employee as any)?.employeeName || (slipData.employee as any)?.name; return typeof en === 'string' ? en : `${en?.firstName ?? ''} ${en?.lastName ?? ''}`.trim() || ''; })()}</span></div>
                  <div><span className="text-slate-400">ID:</span> <span className="font-semibold text-slate-700 font-mono">{(slipData.employee as any)?.employeeId || (slipData.employee as any)?.id || ""}</span></div>
                  <div><span className="text-slate-400">Designation:</span> <span className="font-semibold text-slate-700">{(slipData.employee as any)?.designation || ""}</span></div>
                  <div><span className="text-slate-400">Department:</span> <span className="font-semibold text-slate-700">{(slipData.employee as any)?.department || ""}</span></div>
                  <div><span className="text-slate-400">Status:</span> <span className={`font-semibold uppercase ${slipData.status === "paid" ? "text-emerald-600" : "text-amber-600"}`}>{slipData.status}</span></div>
                  <div><span className="text-slate-400">Pay Date:</span> <span className="font-semibold text-slate-700">{slipData.paymentDate ? new Date(slipData.paymentDate).toLocaleDateString() : "—"}</span></div>
                </div>

                <div className="border-t border-[#e1e2ed] pt-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Earnings</h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Basic Salary</span><span className="font-mono font-semibold text-slate-700">${slipData.basicSalary.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">HRA</span><span className="font-mono font-semibold text-slate-700">${slipData.allowances.hra.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">DA</span><span className="font-mono font-semibold text-slate-700">${slipData.allowances.da.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Travel Allowance</span><span className="font-mono font-semibold text-slate-700">${(slipData.allowances.travel || 0).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Medical Allowance</span><span className="font-mono font-semibold text-slate-700">${(slipData.allowances.medical || 0).toLocaleString()}</span></div>
                    {(slipData.allowances.special || 0) > 0 && (
                      <div className="flex justify-between"><span className="text-slate-500">Special Allowance</span><span className="font-mono font-semibold text-slate-700">${slipData.allowances.special.toLocaleString()}</span></div>
                    )}
                  </div>
                </div>

                <div className="border-t border-[#e1e2ed] pt-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Deductions</h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Tax</span><span className="font-mono font-semibold text-slate-700">${slipData.deductions.tax.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Provident Fund</span><span className="font-mono font-semibold text-slate-700">${slipData.deductions.providentFund.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Insurance</span><span className="font-mono font-semibold text-slate-700">${(slipData.deductions.insurance || 0).toLocaleString()}</span></div>
                    {(slipData.deductions.loan || 0) > 0 && (
                      <div className="flex justify-between"><span className="text-slate-500">Loan Deduction</span><span className="font-mono font-semibold text-slate-700">${slipData.deductions.loan.toLocaleString()}</span></div>
                    )}
                  </div>
                </div>

                <div className="border-t-2 border-[#2563EB] pt-4 space-y-1.5 text-xs font-bold">
                  <div className="flex justify-between text-slate-600"><span>Gross Pay</span><span className="font-mono">${slipData.grossPay.toLocaleString()}</span></div>
                  <div className="flex justify-between text-slate-600"><span>Total Deductions</span><span className="font-mono">${slipData.totalDeductions.toLocaleString()}</span></div>
                  <div className="flex justify-between text-lg text-[#2563EB] pt-2 border-t border-[#e1e2ed]"><span>Net Pay</span><span className="font-mono">${slipData.netPay.toLocaleString()}</span></div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Payroll Modal */}
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
                <span className="text-sm font-bold text-slate-800">{editingPayroll ? "Edit Payroll Record" : "Create Payroll Record"}</span>
                <button onClick={() => { setShowCreateModal(false); setEditingPayroll(null); resetForm(); }} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Employee Name</label>
                    <input type="text" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="e.g. Dr. James Sterling" className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Employee ID</label>
                    <input type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="e.g. FAC-001" className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Designation</label>
                    <input type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. Professor" className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Department</label>
                    <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Computer Science" className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Salary ($)</label>
                    <input type="number" value={salary} onChange={(e) => setSalary(Number(e.target.value))} min={0} className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Month</label>
                    <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                      <option value="May 2026">May 2026</option>
                      <option value="June 2026">June 2026</option>
                      <option value="July 2026">July 2026</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button type="button" onClick={() => { setShowCreateModal(false); setEditingPayroll(null); resetForm(); }} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                  <button type="submit" className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5">
                    <DollarSign size={14} />
                    {editingPayroll ? "Update Payroll" : "Create Payroll"}
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
