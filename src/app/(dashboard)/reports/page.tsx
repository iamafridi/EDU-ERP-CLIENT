"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Download, Eye, FileText, Printer, CheckCircle2, X,
  ClipboardList, Users, CreditCard, DollarSign, BookOpen, Stethoscope,
  GraduationCap, Building2, Calendar, Wallet, Receipt, PieChart,
  TrendingUp, TrendingDown
} from "lucide-react";

const REPORT_TYPES = [
  { id: "grade-sheet", label: "Grade Sheet", description: "Per course grade summary", icon: ClipboardList, color: "bg-blue-50 text-blue-600", roles: ["super-admin", "domain-admin", "faculty"] },
  { id: "transcript", label: "Transcript", description: "Per student academic record", icon: GraduationCap, color: "bg-purple-50 text-purple-600", roles: ["super-admin", "domain-admin", "faculty", "student"] },
  { id: "attendance-summary", label: "Attendance Summary", description: "Class-wise attendance report", icon: Users, color: "bg-emerald-50 text-emerald-600", roles: ["super-admin", "domain-admin", "faculty"] },
  { id: "fee-collection", label: "Fee Collection Report", description: "Fee payments and collections", icon: CreditCard, color: "bg-amber-50 text-amber-600", roles: ["super-admin", "domain-admin"] },
  { id: "student-fee-ledger", label: "Student Fee Ledger", description: "Individual student fee history", icon: DollarSign, color: "bg-red-50 text-red-600", roles: ["super-admin", "domain-admin", "staff"] },
  { id: "expense-summary", label: "Expense Report", description: "Expenses by category breakdown", icon: TrendingDown, color: "bg-rose-50 text-rose-600", roles: ["super-admin", "domain-admin"] },
  { id: "budget-vs-actual", label: "Budget vs Actual", description: "Budget allocation vs spending", icon: PieChart, color: "bg-violet-50 text-violet-600", roles: ["super-admin", "domain-admin"] },
  { id: "payroll-disbursement", label: "Payroll Disbursement", description: "Staff salary disbursement details", icon: Wallet, color: "bg-indigo-50 text-indigo-600", roles: ["super-admin", "domain-admin"] },
  { id: "receipts-collection", label: "Receipts Collection", description: "Receipts issued and amounts", icon: Receipt, color: "bg-teal-50 text-teal-600", roles: ["super-admin", "domain-admin", "staff"] },
  { id: "financial-overview", label: "Financial Overview", description: "Combined income vs expense summary", icon: TrendingUp, color: "bg-emerald-50 text-emerald-600", roles: ["super-admin", "domain-admin"] },
  { id: "payroll-summary", label: "Payroll Summary", description: "Staff salary disbursement", icon: DollarSign, color: "bg-indigo-50 text-indigo-600", roles: ["super-admin", "domain-admin"] },
  { id: "library-overdue", label: "Library Overdue List", description: "Overdue books and fines", icon: BookOpen, color: "bg-rose-50 text-rose-600", roles: ["super-admin", "domain-admin", "staff"] },
  { id: "opd-patient-list", label: "OPD Patient List", description: "Outpatient department visits", icon: Stethoscope, color: "bg-teal-50 text-teal-600", roles: ["super-admin", "domain-admin", "staff"] },
  { id: "admission-merit", label: "Admission Merit List", description: "Student admission rankings", icon: Users, color: "bg-cyan-50 text-cyan-600", roles: ["super-admin", "domain-admin"] },
  { id: "department-stats", label: "Department-wise Stats", description: "Analytics per department", icon: Building2, color: "bg-orange-50 text-orange-600", roles: ["super-admin", "domain-admin"] },
  { id: "semester-grade", label: "Semester Grade Report", description: "Semester-wide grade analysis", icon: BarChart3, color: "bg-violet-50 text-violet-600", roles: ["super-admin", "domain-admin", "faculty"] },
];

interface ReportRow {
  id: string;
  title: string;
  type: string;
  generatedDate: string;
  status: string;
  createdBy: string;
}

export default function ReportsPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [previewReport, setPreviewReport] = useState<ReportRow | null>(null);

  const [reportTitle, setReportTitle] = useState("");
  const [reportType, setReportType] = useState("attendance-summary");
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");
  const [department, setDepartment] = useState("");

  const isAdmin = roleIs("domain-admin", "super-admin");

  const { data: reports = [], isLoading } = useQuery<ReportRow[]>({
    queryKey: ["reports"],
    queryFn: api.getReports,
  });

  const { data: expenses } = useQuery({ queryKey: ["expenses"], queryFn: api.getExpenses, enabled: !!previewReport });
  const { data: expenseSummary } = useQuery({ queryKey: ["expense-summary"], queryFn: api.getExpenseSummary, enabled: !!previewReport });
  const { data: budgets } = useQuery({ queryKey: ["budgets"], queryFn: api.getBudgets, enabled: !!previewReport });
  const { data: budgetSummary } = useQuery({ queryKey: ["budget-summary"], queryFn: api.getBudgetSummary, enabled: !!previewReport });
  const { data: payrollRecords } = useQuery({ queryKey: ["payroll"], queryFn: api.getPayrollRecords, enabled: !!previewReport });
  const { data: receipts } = useQuery({ queryKey: ["receipts"], queryFn: api.getReceipts, enabled: !!previewReport });

  const generateMutation = useMutation({
    mutationFn: api.generateReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setSuccessMsg("Report generated successfully.");
      setShowGenerateModal(false);
      resetForm();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const resetForm = () => {
    setReportTitle("");
    setReportType("attendance-summary");
    setDateRangeStart("");
    setDateRangeEnd("");
    setDepartment("");
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const typeConfig = REPORT_TYPES.find((r) => r.id === reportType);
    generateMutation.mutate({
      title: reportTitle || typeConfig?.label || "Report",
      type: typeConfig?.label || reportType,
      dateRange: `${dateRangeStart || "N/A"} — ${dateRangeEnd || "N/A"}`,
      createdBy: user?.name || "System",
    });
  };

  const handleQuickGenerate = (typeId: string) => {
    const typeConfig = REPORT_TYPES.find((r) => r.id === typeId);
    if (typeConfig) {
      generateMutation.mutate({
        title: typeConfig.label,
        type: typeConfig.label,
        dateRange: "Last 30 days",
        createdBy: user?.name || "System",
      });
    }
  };

  const handlePreview = (typeId: string) => {
    const typeConfig = REPORT_TYPES.find((r) => r.id === typeId);
    if (!typeConfig) return;
    setPreviewReport({
      id: typeId,
      title: typeConfig.label,
      type: typeConfig.label,
      generatedDate: new Date().toLocaleDateString(),
      status: "completed",
      createdBy: user?.name || "System",
    });
  };

  const handlePrint = (title: string) => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ["Report Title", "Type", "Generated Date", "Status", "Created By"];
    const rows = reports.map((r) => [r.title, r.type, r.generatedDate, r.status, r.createdBy]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reports-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredTypes = REPORT_TYPES.filter((r) => r.roles.includes(user?.role || ""));

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  const renderPreviewContent = (typeId: string, ctx: {
    expenses: any; expenseSummary: any; budgets: any; budgetSummary: any;
    payrollRecords: any; receipts: any; formatCurrency: (n: number) => string;
  }) => {
    const expList = Array.isArray(ctx.expenses) ? ctx.expenses : [];
    const budList = Array.isArray(ctx.budgets) ? ctx.budgets : [];
    const payList = Array.isArray(ctx.payrollRecords) ? ctx.payrollRecords : [];
    const recList = Array.isArray(ctx.receipts) ? ctx.receipts : [];
    const expSum = ctx.expenseSummary?.data;
    const budSum = ctx.budgetSummary?.data?.totals;

    switch (typeId) {
      case "expense-summary": {
        const totalExp = expList.reduce((s: number, e: any) => s + e.amount, 0);
        const cats: Record<string, number> = {};
        expList.forEach((e: any) => { cats[e.category] = (cats[e.category] || 0) + e.amount; });
        return (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-center">
              <p className="text-xs text-slate-500">Total Expenses</p>
              <p className="text-2xl font-bold text-slate-800">{ctx.formatCurrency(totalExp)}</p>
            </div>
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-slate-50 border-b border-[#e1e2ed]"><th className="p-2 text-xs font-bold text-slate-400">Category</th><th className="p-2 text-xs font-bold text-slate-400 text-right">Amount</th></tr></thead>
              <tbody className="divide-y divide-[#e1e2ed]">
                {Object.entries(cats).map(([cat, amt]) => (
                  <tr key={cat} className="text-xs"><td className="p-2 text-slate-700">{cat}</td><td className="p-2 text-right font-semibold text-slate-700">{ctx.formatCurrency(amt)}</td></tr>
                ))}
                <tr className="text-xs font-bold bg-slate-50"><td className="p-2 text-slate-800">Total</td><td className="p-2 text-right text-slate-800">{ctx.formatCurrency(totalExp)}</td></tr>
              </tbody>
            </table>
          </div>
        );
      }
      case "budget-vs-actual": {
        return (
          <div className="space-y-4">
            {budSum && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                  <p className="text-xs text-slate-500">Total Allocated</p>
                  <p className="text-xl font-bold text-slate-800">{ctx.formatCurrency(budSum.totalAllocated || 0)}</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-center">
                  <p className="text-xs text-slate-500">Total Spent</p>
                  <p className="text-xl font-bold text-slate-800">{ctx.formatCurrency(budSum.totalSpent || 0)}</p>
                </div>
              </div>
            )}
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-slate-50 border-b border-[#e1e2ed]"><th className="p-2 text-xs font-bold text-slate-400">Head</th><th className="p-2 text-xs font-bold text-slate-400 text-right">Allocated</th><th className="p-2 text-xs font-bold text-slate-400 text-right">Spent</th><th className="p-2 text-xs font-bold text-slate-400 text-right">Remaining</th></tr></thead>
              <tbody className="divide-y divide-[#e1e2ed]">
                {budList.map((b: any) => (
                  <tr key={b.id} className="text-xs">
                    <td className="p-2 text-slate-700">{b.budgetHead || b.category}</td>
                    <td className="p-2 text-right text-slate-700">{ctx.formatCurrency(b.allocatedAmount)}</td>
                    <td className="p-2 text-right text-slate-700">{ctx.formatCurrency(b.spentAmount)}</td>
                    <td className={`p-2 text-right font-semibold ${b.allocatedAmount - b.spentAmount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {ctx.formatCurrency(b.allocatedAmount - b.spentAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      case "payroll-disbursement": {
        const totalSalary = payList.reduce((s: number, p: any) => s + (p.salary || 0), 0);
        const paidCount = payList.filter((p: any) => p.status === "paid").length;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-center">
                <p className="text-xs text-slate-500">Total Employees</p>
                <p className="text-xl font-bold text-slate-800">{payList.length}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-center">
                <p className="text-xs text-slate-500">Paid</p>
                <p className="text-xl font-bold text-slate-800">{paidCount}</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-center">
                <p className="text-xs text-slate-500">Total Disbursed</p>
                <p className="text-xl font-bold text-slate-800">{ctx.formatCurrency(totalSalary)}</p>
              </div>
            </div>
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-slate-50 border-b border-[#e1e2ed]"><th className="p-2 text-xs font-bold text-slate-400">Employee</th><th className="p-2 text-xs font-bold text-slate-400">Month</th><th className="p-2 text-xs font-bold text-slate-400 text-right">Salary</th><th className="p-2 text-xs font-bold text-slate-400">Status</th></tr></thead>
              <tbody className="divide-y divide-[#e1e2ed]">
                {payList.map((p: any) => (
                  <tr key={p.id} className="text-xs">
                    <td className="p-2 text-slate-700">{p.employeeName || p.employeeId}</td>
                    <td className="p-2 text-slate-500">{p.month}</td>
                    <td className="p-2 text-right font-semibold text-slate-700">{ctx.formatCurrency(p.salary)}</td>
                    <td className="p-2"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      case "receipts-collection": {
        const totalReceipts = recList.reduce((s: number, r: any) => s + (r.amount || 0), 0);
        return (
          <div className="space-y-4">
            <div className="bg-teal-50 border border-teal-100 rounded-lg p-4 text-center">
              <p className="text-xs text-slate-500">Total Receipts Collected</p>
              <p className="text-2xl font-bold text-slate-800">{ctx.formatCurrency(totalReceipts)}</p>
              <p className="text-xs text-slate-400 mt-1">{recList.length} receipts issued</p>
            </div>
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-slate-50 border-b border-[#e1e2ed]"><th className="p-2 text-xs font-bold text-slate-400">Receipt ID</th><th className="p-2 text-xs font-bold text-slate-400">Student</th><th className="p-2 text-xs font-bold text-slate-400 text-right">Amount</th><th className="p-2 text-xs font-bold text-slate-400">Date</th></tr></thead>
              <tbody className="divide-y divide-[#e1e2ed]">
                {recList.map((r: any) => (
                  <tr key={r.id} className="text-xs">
                    <td className="p-2 font-mono text-slate-600">{r.receiptNo || r.id}</td>
                    <td className="p-2 text-slate-700">{r.studentName || r.studentId}</td>
                    <td className="p-2 text-right font-semibold text-slate-700">{ctx.formatCurrency(r.amount)}</td>
                    <td className="p-2 text-slate-500">{r.date || r.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      case "financial-overview": {
        const totalExp = expList.reduce((s: number, e: any) => s + e.amount, 0);
        const totalRec = recList.reduce((s: number, r: any) => s + (r.amount || 0), 0);
        const totalSal = payList.reduce((s: number, p: any) => s + (p.salary || 0), 0);
        const totalOut = totalExp + totalSal;
        const net = totalRec - totalOut;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-center">
                <p className="text-xs text-slate-500">Total Income (Receipts)</p>
                <p className="text-xl font-bold text-emerald-700">{ctx.formatCurrency(totalRec)}</p>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
                <p className="text-xs text-slate-500">Total Outgoing</p>
                <p className="text-xl font-bold text-red-700">{ctx.formatCurrency(totalOut)}</p>
              </div>
            </div>
            <div className={`rounded-lg p-4 text-center border ${net >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
              <p className="text-xs text-slate-500">Net Position</p>
              <p className={`text-2xl font-bold ${net >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                {net >= 0 ? "+" : ""}{ctx.formatCurrency(net)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Expenses: {ctx.formatCurrency(totalExp)} | Payroll: {ctx.formatCurrency(totalSal)}
              </p>
            </div>
          </div>
        );
      }
      default: {
        const expSumData = expSum || { total: 0, byCategory: {}, count: 0 };
        return (
          <div className="bg-slate-50 border border-[#e1e2ed] rounded-lg p-8 text-center">
            <BarChart3 size={48} className="text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">{previewReport?.title}</h3>
            <p className="text-xs text-slate-400 mt-1">Generated: {previewReport?.generatedDate}</p>
            <p className="text-xs text-slate-400 mt-4">
              Expenses: {ctx.formatCurrency(expSumData.total || 0)} | Budget items: {budList.length} | Payroll records: {payList.length} | Receipts: {recList.length}
            </p>
          </div>
        );
      }
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="text-[#2563EB]" />
            Reports Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate, preview, and export institutional reports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={reports.length === 0}
            className="h-9 px-3 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Download size={14} /> Export CSV
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowGenerateModal(true)}
              className="h-9 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Generate Report
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
          <CheckCircle2 size={16} className="text-emerald-600" /> {successMsg}
        </motion.div>
      )}

      {/* Report Type Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTypes.map((type) => {
          const Icon = type.icon;
          return (
            <div
              key={type.id}
              className={`bg-white border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedType === type.id
                  ? "border-[#2563EB] ring-2 ring-[#2563EB]/10"
                  : "border-[#e1e2ed] hover:border-[#2563EB]/30"
              }`}
              onClick={() => setSelectedType(selectedType === type.id ? null : type.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${type.color} flex items-center justify-center shrink-0`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-800">{type.label}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{type.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#e1e2ed]">
                <button
                  onClick={(e) => { e.stopPropagation(); handleQuickGenerate(type.id); }}
                  className="flex-1 h-7 px-2 bg-[#2563EB]/10 text-[#2563EB] rounded text-[10px] font-semibold hover:bg-[#2563EB]/20 transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <FileText size={12} /> Generate
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePreview(type.id); }}
                  className="h-7 w-7 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                  title="Preview"
                >
                  <Eye size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePreview(type.id); }}
                  className="h-7 w-7 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                  title="Download PDF"
                >
                  <Download size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrint(type.label); }}
                  className="h-7 w-7 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                  title="Print"
                >
                  <Printer size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Generated Reports Table */}
      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Generated Reports ({reports.length})
          </span>
        </div>

        {isLoading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <BarChart3 size={32} className="text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400">No reports generated yet.</p>
            <p className="text-[10px] text-slate-300 mt-1">Click on a report type above to generate your first report.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#e1e2ed]">
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Report Title</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Type</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Generated</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e2ed]">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/50 text-xs">
                    <td className="p-3 font-semibold text-slate-700">{report.title}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-[#2563EB] border border-blue-100 rounded text-[10px] font-bold">
                        {report.type}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">{report.generatedDate}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${
                        report.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPreviewReport(report)}
                          className="h-7 px-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Eye size={12} /> View
                        </button>
                        {report.status === "completed" && (
                          <button
                            onClick={() => setSuccessMsg(`Downloading: ${report.title}`)}
                            className="h-7 px-2 bg-[#2563EB]/10 hover:bg-[#2563EB]/20 text-[#2563EB] rounded text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Download size={12} /> PDF
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Generate Report</span>
                <button
                  onClick={() => { setShowGenerateModal(false); resetForm(); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleGenerate} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Report Title</label>
                  <input
                    type="text"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="e.g., Fall 2026 Attendance Summary"
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Report Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                  >
                    {REPORT_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Start Date</label>
                    <input
                      type="date"
                      value={dateRangeStart}
                      onChange={(e) => setDateRangeStart(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">End Date</label>
                    <input
                      type="date"
                      value={dateRangeEnd}
                      onChange={(e) => setDateRangeEnd(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Department (Optional)</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                  >
                    <option value="">All Departments</option>
                    <option value="anatomy">Anatomy</option>
                    <option value="physiology">Physiology</option>
                    <option value="biochemistry">Biochemistry</option>
                    <option value="pharmacology">Pharmacology</option>
                    <option value="pathology">Pathology</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button
                    type="button"
                    onClick={() => { setShowGenerateModal(false); resetForm(); }}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generateMutation.isPending}
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {generateMutation.isPending ? "Generating..." : "Generate Report"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewReport && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-3xl overflow-hidden"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Report Preview — {previewReport.title}</span>
                <button
                  onClick={() => setPreviewReport(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto print-area">
                {renderPreviewContent(previewReport.id, {
                  expenses,
                  expenseSummary,
                  budgets,
                  budgetSummary,
                  payrollRecords,
                  receipts,
                  formatCurrency,
                })}
              </div>
              <div className="flex items-center justify-end gap-3 p-4 border-t border-[#e1e2ed] bg-slate-50">
                <button
                  onClick={() => handlePrint(previewReport.title)}
                  className="h-9 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-xs hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  onClick={() => { handlePrint(previewReport.title); }}
                  className="h-9 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Download size={14} /> Download PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
