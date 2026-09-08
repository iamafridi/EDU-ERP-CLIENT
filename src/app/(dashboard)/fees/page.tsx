"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import {
  CreditCard,
  Plus,
  CheckCircle2,
  Landmark,
  Users,
  Calendar,
  Edit3,
  Trash2,
  DollarSign,
  Receipt,
  FileText,
  Clock,
  Printer,
  QrCode,
  Percent,
  Download,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Building,
} from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import {
  PageHeader,
  Card,
  Modal,
  FormField,
  Input,
  Select,
  Button,
  IconButton,
  Badge,
  ActionMenu,
  ProgressBar,
} from "@/components/ui";
import { CashierCloseoutPanel } from "@/components/finance/CashierCloseoutPanel";
import { CautionRefundPanel } from "@/components/finance/CautionRefundPanel";

const feeSchema = zod.object({
  studentId: zod.string().min(3, "Student Registration ID is required"),
  studentName: zod.string().min(2, "Student Name is required"),
  semester: zod.string().min(2, "Semester is required"),
  type: zod.enum(["Tuition Fee", "Hostel Fee", "Mess Fee", "Lab & Tech Fee", "Admission Tranche 1", "Midterm Tranche 2", "Final Tranche 3", "Other"]),
  amount: zod.number().min(100, "Amount must be at least 100"),
  dueDate: zod.string().min(10, "Please provide a valid due date (YYYY-MM-DD)"),
});

type FeeFormValues = zod.infer<typeof feeSchema>;

interface FeeWaiver {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  cgpa: number;
  waiverCategory: "Merit (CGPA >= 3.85)" | "Freedom Fighter Quota" | "Sibling Subsidy" | "Financial Hardship";
  percentage: number;
  approvedAmount: number;
  status: "APPROVED" | "PENDING_DEAN_REVIEW" | "REJECTED";
}

const mockWaivers: FeeWaiver[] = [
  {
    id: "WAV-2026-001",
    studentId: "CSE-2023-0142",
    studentName: "Tahmid Hasan",
    department: "Computer Science & Engineering",
    cgpa: 3.96,
    waiverCategory: "Merit (CGPA >= 3.85)",
    percentage: 100,
    approvedAmount: 85000,
    status: "APPROVED",
  },
  {
    id: "WAV-2026-002",
    studentId: "BBA-2024-0089",
    studentName: "Nusrat Jahan",
    department: "School of Business",
    cgpa: 3.82,
    waiverCategory: "Sibling Subsidy",
    percentage: 25,
    approvedAmount: 18750,
    status: "APPROVED",
  },
  {
    id: "WAV-2026-003",
    studentId: "EEE-2022-0051",
    studentName: "Ariful Islam",
    department: "Electrical & Electronic Engineering",
    cgpa: 3.40,
    waiverCategory: "Financial Hardship",
    percentage: 50,
    approvedAmount: 42500,
    status: "PENDING_DEAN_REVIEW",
  },
];

export default function FeesPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "ledger" | "challan" | "installments" | "counter" | "waivers" | "cashier-closeout" | "caution-refund"
  >("ledger");
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [payingFee, setPayingFee] = useState<any>(null);
  const [payMethod, setPayMethod] = useState("bkash");
  const [transactionId, setTransactionId] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
  const [challanStudent, setChallanStudent] = useState<any>(null);
  const [bulkSemesterId, setBulkSemesterId] = useState("");
  const [bulkDueDate, setBulkDueDate] = useState("");
  const [editingFee, setEditingFee] = useState<any>(null);

  const isAccountantOrAdmin = roleIs("domain-admin", "super-admin") || user?.staffSubRole === "accountant";

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
      setSuccessMsg("Transaction cleared. Advising hold released and receipt generated.");
      setPayingFee(null);
      setTransactionId("");
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
    return daysOverdue * 100; // 100 BDT / day statutory late fine
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
      type: "Tuition Fee",
      amount: 75000,
      dueDate: "2026-10-15",
    },
  });

  const handleClearPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingFee) return;
    recordPaymentMutation.mutate({
      fee: payingFee.id,
      student: payingFee.studentId,
      amount: payingFee.amount + calcLateFee(payingFee),
      method: payMethod,
      transactionId: transactionId || `TXN-${Date.now().toString().slice(-6)}`,
    });
  };

  const totalOutstanding = fees
    .filter((f: any) => f.status === "pending")
    .reduce((sum: number, f: any) => sum + f.amount, 0);

  const totalCollected = fees
    .filter((f: any) => f.status === "paid")
    .reduce((sum: number, f: any) => sum + f.amount, 0);

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Tuition Ledger, Fees & Payment Gateway"
        subtitle="Manage student billing, real-time late fines, 3-part bank deposit challans, tranche installment agreements, and instant digital payment clearances."
        actions={
          isAccountantOrAdmin && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsInstallmentModalOpen(true)}
                icon={<DollarSign size={15} />}
              >
                3-Tranche Installment Plan
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsBulkModalOpen(true)}
                icon={<Users size={15} />}
              >
                Bulk Semester Billing
              </Button>
              <Button
                variant="gold"
                onClick={() => {
                  setEditingFee(null);
                  resetFeeForm();
                  setIsGenModalOpen(true);
                }}
                icon={<Plus size={15} />}
              >
                Issue Invoice
              </Button>
            </div>
          )
        }
      />

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl flex items-center gap-2"
        >
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Collection Cleared</span>
            <Badge variant="success" size="sm">
              {fees.length > 0 ? Math.round((fees.filter((f: any) => f.status === "paid").length / fees.length) * 100) : 0}% Cleared
            </Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">
            ৳{totalCollected.toLocaleString()}
          </div>
          <div className="mt-3">
            <ProgressBar
              value={totalCollected + totalOutstanding > 0 ? (totalCollected / (totalCollected + totalOutstanding)) * 100 : 0}
              variant="success"
              size="sm"
            />
          </div>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Outstanding Due</span>
            <Badge variant="warning" size="sm">Active Receivables</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-warning">
            ৳{totalOutstanding.toLocaleString()}
          </div>
          <span className="text-xs text-text-muted mt-1 block">Subject to ৳100/day late penalty</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Active Invoices</span>
            <Badge variant="gold" size="sm">Fall 2026</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-text">
            {fees.length} Accounts
          </div>
          <span className="text-xs text-text-muted mt-1 block">Full degree student billings</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Merit Waivers</span>
            <Badge variant="primary" size="sm">Scholarships</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-primary">
            ৳ 1,46,250
          </div>
          <span className="text-xs text-text-muted mt-1 block">Subsidized tuition waivers</span>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-px">
        {([
          { key: "ledger", label: "Accounts Receivable Ledger", icon: CreditCard },
          { key: "challan", label: "3-Part Bank Challan Generator", icon: Printer },
          { key: "installments", label: "3-Tranche Installments", icon: DollarSign },
          { key: "counter", label: "Fast Bursar Payment Counter", icon: Smartphone },
          { key: "waivers", label: "Scholarship & Waiver Registry", icon: Percent },
          { key: "cashier-closeout", label: "Daily Cashier Closeout & Bank Bag", icon: Landmark },
          { key: "caution-refund", label: "Caution Deposit Exit Settlement", icon: ShieldCheck },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.key
                ? "border-gold text-gold"
                : "border-transparent text-text-muted hover:text-text hover:border-border"
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Ledger */}
      {activeTab === "ledger" && (
        <Card noPadding>
          <div className="p-4 border-b border-border/80 bg-surface flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Student Accounts Receivable Ledger ({fees.length})
            </span>
            <Badge variant="gold" size="sm">BDT Currency</Badge>
          </div>

          {isLoadingFees ? (
            <TableSkeleton rows={5} cols={7} />
          ) : fees.length === 0 ? (
            <p className="p-12 text-center text-xs text-text-muted">No invoices recorded in the system.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-muted/50 border-b border-border">
                    <th className="p-3.5 text-xs font-bold text-text-muted uppercase">Student</th>
                    <th className="p-3.5 text-xs font-bold text-text-muted uppercase">Fee Category</th>
                    <th className="p-3.5 text-xs font-bold text-text-muted uppercase">Semester</th>
                    <th className="p-3.5 text-xs font-bold text-text-muted uppercase">Amount Due</th>
                    <th className="p-3.5 text-xs font-bold text-text-muted uppercase">Due Date & Late Fine</th>
                    <th className="p-3.5 text-xs font-bold text-text-muted uppercase">Status</th>
                    <th className="p-3.5 text-xs font-bold text-text-muted uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {fees.map((invoice: any) => {
                    const lateFee = calcLateFee(invoice);
                    const payment = getPaymentForFee(invoice.id);
                    return (
                      <tr key={invoice.id} className="hover:bg-surface-muted/30 text-xs transition-colors">
                        <td className="p-3.5">
                          <span className="font-bold text-text block">{invoice.studentName}</span>
                          <span className="text-[11px] text-text-muted font-mono block">{invoice.studentId}</span>
                        </td>
                        <td className="p-3.5 font-semibold text-text">{invoice.type}</td>
                        <td className="p-3.5 text-text-muted font-mono">{invoice.semester}</td>
                        <td className="p-3.5 font-mono font-bold text-gold">৳{invoice.amount.toLocaleString()}</td>
                        <td className="p-3.5">
                          <span className="text-text-muted font-mono block">{invoice.dueDate}</span>
                          {lateFee > 0 && (
                            <span className="text-[11px] text-danger font-semibold block mt-0.5">
                              +৳{lateFee} fine ({Math.floor(lateFee / 100)} days @ ৳100/d)
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <Badge
                            variant={invoice.status === "paid" ? "success" : "warning"}
                            size="sm"
                            className="uppercase"
                          >
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {invoice.status === "pending" && isAccountantOrAdmin ? (
                              <Button
                                variant="gold"
                                size="sm"
                                onClick={() => setPayingFee(invoice)}
                                className="text-xs h-7 px-2.5"
                              >
                                Receive Payment
                              </Button>
                            ) : payment ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setChallanStudent(invoice)}
                                className="text-xs h-7 px-2"
                                leftIcon={<Receipt size={12} />}
                              >
                                Money Receipt
                              </Button>
                            ) : null}

                            {isAccountantOrAdmin && (
                              <ActionMenu
                                items={[
                                  {
                                    label: "Generate 3-Part Challan",
                                    icon: <Printer size={13} />,
                                    onClick: () => setChallanStudent(invoice),
                                  },
                                  {
                                    label: "Edit Invoice",
                                    icon: <Edit3 size={13} />,
                                    onClick: () => openEditFee(invoice),
                                  },
                                  {
                                    label: "Delete Invoice",
                                    icon: <Trash2 size={13} />,
                                    variant: "danger",
                                    onClick: () => {
                                      if (confirm("Delete this invoice record?")) deleteFeeMutation.mutate(invoice.id);
                                    },
                                  },
                                ]}
                              />
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
        </Card>
      )}

      {/* Tab 2: 3-Part Bank Challan Generator */}
      {activeTab === "challan" && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <Printer size={16} className="text-gold" />
                3-Part Official Bank Deposit Challan & Money Receipt Engine
              </h3>
              <p className="text-xs text-text-muted">
                Statutory 3-copy deposit slip for Sonali Bank / Premier Bank / Dhaka Bank branches with optical routing barcode.
              </p>
            </div>
            <Button
              variant="gold"
              size="sm"
              leftIcon={<Download size={14} />}
              onClick={() => alert("Exporting printable 3-part bank deposit slips for current semester billing cohort...")}
            >
              Export Batch Slips (PDF)
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Student Copy */}
            <div className="p-5 bg-surface rounded-2xl border border-border space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-gold/10 text-gold font-bold text-[10px] rounded-bl-xl uppercase tracking-wider">
                Copy 1: Student Copy
              </div>
              <div className="border-b border-border pb-2.5 pt-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-text">UAS Central Bursar</h4>
                <p className="text-[10px] text-text-muted">Deposit Account: 02000-11928374</p>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-text-muted">Student:</span> <strong className="text-text">Tahmid Hasan</strong></div>
                <div className="flex justify-between"><span className="text-text-muted">Roll / ID:</span> <strong className="font-mono text-gold">CSE-2023-0142</strong></div>
                <div className="flex justify-between"><span className="text-text-muted">Semester:</span> <span>Fall 2026</span></div>
                <div className="flex justify-between border-t border-border pt-1.5 font-bold"><span className="text-text">Total Tuition:</span> <span className="font-mono text-gold">৳75,000</span></div>
              </div>
              <div className="pt-2 text-center border-t border-border">
                <QrCode size={70} className="mx-auto text-navy" />
                <span className="text-[9px] font-mono text-text-muted block mt-1">VERIFIED-UAS-FEE-881920</span>
              </div>
            </div>

            {/* Bank Copy */}
            <div className="p-5 bg-surface rounded-2xl border border-border space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-blue-500/10 text-blue-600 font-bold text-[10px] rounded-bl-xl uppercase tracking-wider">
                Copy 2: Bank Branch Copy
              </div>
              <div className="border-b border-border pb-2.5 pt-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-text">Sonali Bank PLC</h4>
                <p className="text-[10px] text-text-muted">Routing Code: 200261192</p>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-text-muted">Student:</span> <strong className="text-text">Tahmid Hasan</strong></div>
                <div className="flex justify-between"><span className="text-text-muted">Roll / ID:</span> <strong className="font-mono text-gold">CSE-2023-0142</strong></div>
                <div className="flex justify-between"><span className="text-text-muted">Branch:</span> <span>Dhaka Univ. Branch</span></div>
                <div className="flex justify-between border-t border-border pt-1.5 font-bold"><span className="text-text">Received Sum:</span> <span className="font-mono text-emerald-600">৳75,000</span></div>
              </div>
              <div className="pt-2 text-center border-t border-border">
                <div className="h-14 border border-dashed border-border rounded flex items-center justify-center text-[10px] text-text-muted">
                  Bank Teller Seal & Signature
                </div>
              </div>
            </div>

            {/* Accounts Copy */}
            <div className="p-5 bg-surface rounded-2xl border border-border space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500/10 text-emerald-600 font-bold text-[10px] rounded-bl-xl uppercase tracking-wider">
                Copy 3: Accounts Copy
              </div>
              <div className="border-b border-border pb-2.5 pt-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-text">Finance & Accounts</h4>
                <p className="text-[10px] text-text-muted">Sub-ledger: General Tuition Fund</p>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-text-muted">Student:</span> <strong className="text-text">Tahmid Hasan</strong></div>
                <div className="flex justify-between"><span className="text-text-muted">Roll / ID:</span> <strong className="font-mono text-gold">CSE-2023-0142</strong></div>
                <div className="flex justify-between"><span className="text-text-muted">Advising Hold:</span> <Badge variant="success" size="sm">Auto-Released</Badge></div>
                <div className="flex justify-between border-t border-border pt-1.5 font-bold"><span className="text-text">Credit Total:</span> <span className="font-mono text-gold">৳75,000</span></div>
              </div>
              <div className="pt-2 text-center border-t border-border">
                <div className="h-14 border border-dashed border-border rounded flex items-center justify-center text-[10px] text-text-muted">
                  Bursar Reconciliation Seal
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Installments */}
      {activeTab === "installments" && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <DollarSign size={16} className="text-gold" />
                3-Tranche Tuition Installment Policy & Automatic Exam Clearance Gates
              </h3>
              <p className="text-xs text-text-muted">
                Governs 40% (Advising/Enrollment), 30% (Midterm Exam Admit Clearance), and 30% (Final Exam Admit Clearance).
              </p>
            </div>
            <Button variant="gold" size="sm" onClick={() => setIsInstallmentModalOpen(true)}>
              View Promissory Agreement
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card orientation="vertical" padding="lg" className="border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-text">Tranche 1 (40%)</span>
                <Badge variant="success" size="sm">Enrollment Gate</Badge>
              </div>
              <div className="text-2xl font-mono font-bold text-emerald-600">৳ 34,000</div>
              <p className="text-xs text-text-muted leading-relaxed">
                Mandatory before class section enrollment and lab seat allocation. Releases academic registration hold.
              </p>
              <div className="pt-2 border-t border-border text-xs flex justify-between text-text-muted">
                <span>Due: Week 1</span>
                <span className="text-emerald-600 font-bold">✓ 94.2% Cleared</span>
              </div>
            </Card>

            <Card orientation="vertical" padding="lg" className="border-gold/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-text">Tranche 2 (30%)</span>
                <Badge variant="gold" size="sm">Midterm Gate</Badge>
              </div>
              <div className="text-2xl font-mono font-bold text-gold">৳ 25,500</div>
              <p className="text-xs text-text-muted leading-relaxed">
                Required for automatic optical Admit Card QR token generation for Midterm Examinations.
              </p>
              <div className="pt-2 border-t border-border text-xs flex justify-between text-text-muted">
                <span>Due: Week 7</span>
                <span className="text-gold font-bold">⏳ 81.0% Cleared</span>
              </div>
            </Card>

            <Card orientation="vertical" padding="lg" className="border-warning/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-text">Tranche 3 (30%)</span>
                <Badge variant="warning" size="sm">Final Exam Gate</Badge>
              </div>
              <div className="text-2xl font-mono font-bold text-warning">৳ 25,500</div>
              <p className="text-xs text-text-muted leading-relaxed">
                Mandatory before Semester Final Examination and final grade tabulation sheet release.
              </p>
              <div className="pt-2 border-t border-border text-xs flex justify-between text-text-muted">
                <span>Due: Week 14</span>
                <span className="text-warning font-bold">⏳ In Progress</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 4: Fast Bursar Payment Counter */}
      {activeTab === "counter" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card orientation="vertical" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Smartphone size={20} className="text-gold" />
                <h3 className="text-sm font-bold text-text">Instant Digital Clearance Counter</h3>
              </div>
              <Badge variant="success" size="sm">Live Gateway</Badge>
            </div>

            <div className="space-y-3">
              <FormField label="Search Student by ID / Roll" required>
                <Input placeholder="e.g. CSE-2023-0142" defaultValue="CSE-2023-0142" className="font-mono" />
              </FormField>

              <div className="p-4 bg-surface-muted rounded-xl border border-border space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-text-muted">Student:</span> <strong className="text-text">Tahmid Hasan</strong></div>
                <div className="flex justify-between"><span className="text-text-muted">Pending Balance:</span> <strong className="font-mono text-warning">৳ 25,500 (Tranche 3)</strong></div>
                <div className="flex justify-between"><span className="text-text-muted">Advising Status:</span> <Badge variant="warning" size="sm">Final Exam Hold</Badge></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Payment Method" required>
                  <Select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                    <option value="bkash">bKash Merchant (01711-xxxxxx)</option>
                    <option value="nagad">Nagad Direct Gateway</option>
                    <option value="card">Visa / Mastercard POS</option>
                    <option value="cash">Cash Treasury Counter</option>
                  </Select>
                </FormField>
                <FormField label="Transaction / TrxID">
                  <Input placeholder="e.g. 9J882K19A" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="font-mono" />
                </FormField>
              </div>

              <Button
                variant="gold"
                className="w-full"
                leftIcon={<CheckCircle2 size={15} />}
                onClick={() => {
                  setSuccessMsg("Payment of ৳25,500 recorded via bKash. Student Advising & Exam Hold lifted.");
                  setTimeout(() => setSuccessMsg(""), 4000);
                }}
              >
                Clear Dues & Lift All Holds
              </Button>
            </div>
          </Card>

          <Card orientation="vertical" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Building size={20} className="text-gold" />
                <h3 className="text-sm font-bold text-text">Bursar Channel Settlement Summary</h3>
              </div>
              <span className="text-xs font-mono text-text-muted">Today</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-surface-muted rounded-xl border border-border flex items-center justify-between">
                <span className="font-semibold text-text">bKash / Nagad API Auto-Settlements</span>
                <span className="font-mono font-bold text-emerald-600">৳ 8,42,000 (112 txns)</span>
              </div>
              <div className="p-3 bg-surface-muted rounded-xl border border-border flex items-center justify-between">
                <span className="font-semibold text-text">Sonali Bank Branch Deposit Scrolls</span>
                <span className="font-mono font-bold text-emerald-600">৳ 14,20,000 (45 slips)</span>
              </div>
              <div className="p-3 bg-surface-muted rounded-xl border border-border flex items-center justify-between">
                <span className="font-semibold text-text">Campus POS & Cash Counter</span>
                <span className="font-mono font-bold text-emerald-600">৳ 3,85,000 (28 receipts)</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 5: Waivers */}
      {activeTab === "waivers" && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <Percent size={16} className="text-gold" />
                Statutory Tuition Waivers & Merit Scholarship Approvals
              </h3>
              <p className="text-xs text-text-muted">
                Governs UGC-mandated Freedom Fighter 100% quotas, Sibling discounts (25%), and Board of Trustees Merit Scholarships (CGPA $\ge 3.85$).
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => alert("Opening new student waiver application form...")}
            >
              Apply for Waiver
            </Button>
          </div>

          <div className="divide-y divide-border bg-surface border border-border rounded-2xl overflow-hidden">
            {mockWaivers.map((w) => (
              <div key={w.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-muted/30 transition-colors">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-gold">{w.studentId}</span>
                    <Badge variant={w.status === "APPROVED" ? "success" : "warning"} size="sm">
                      {w.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-muted">
                    Candidate: <strong className="text-text">{w.studentName}</strong> • {w.department} • Current CGPA: <strong className="font-mono text-emerald-600">{w.cgpa.toFixed(2)}</strong>
                  </p>
                  <p className="text-xs text-text font-semibold">
                    Category: <span className="text-gold">{w.waiverCategory}</span> ({w.percentage}% Tuition Remission)
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-text-muted font-bold block">Approved Remission</span>
                    <span className="font-mono font-bold text-emerald-600 text-base">৳{w.approvedAmount.toLocaleString()}</span>
                  </div>
                  {w.status === "PENDING_DEAN_REVIEW" && (
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => {
                        w.status = "APPROVED";
                        setSuccessMsg(`Waiver for ${w.studentName} approved by Dean.`);
                        setTimeout(() => setSuccessMsg(""), 3500);
                      }}
                    >
                      Dean Approve
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Daily Cashier Drawer Closeout & Bank Bag Handover */}
      {activeTab === "cashier-closeout" && <CashierCloseoutPanel />}

      {/* Tab 7: Caution Deposit Refund & Exit Settlement */}
      {activeTab === "caution-refund" && <CautionRefundPanel />}

      {/* Invoice Generator Modal */}
      <Modal
        isOpen={isGenModalOpen}
        onClose={() => { setIsGenModalOpen(false); setEditingFee(null); resetFeeForm(); }}
        title={editingFee ? "Edit Dues Invoice" : "Generate Student Dues Invoice"}
        subtitle="Issue formal semester dues debit notice to student ledger"
        size="md"
      >
        <form onSubmit={handleSubmitFee(onSubmitFee)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Student ID Code" error={feeErrors.studentId?.message} required>
              <Input
                {...registerFee("studentId")}
                placeholder="e.g. CSE-2023-0142"
                className="font-mono"
              />
            </FormField>

            <FormField label="Student Full Name" error={feeErrors.studentName?.message} required>
              <Input
                {...registerFee("studentName")}
                placeholder="e.g. Tahmid Hasan"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Fee Category" required>
              <Select {...registerFee("type")}>
                <option value="Tuition Fee">Tuition Fee</option>
                <option value="Hostel Fee">Hostel Fee</option>
                <option value="Mess Fee">Mess Fee</option>
                <option value="Lab & Tech Fee">Lab & Technology Fee</option>
                <option value="Admission Tranche 1">Admission Tranche 1 (40%)</option>
                <option value="Midterm Tranche 2">Midterm Tranche 2 (30%)</option>
                <option value="Final Tranche 3">Final Tranche 3 (30%)</option>
                <option value="Other">Other Miscellaneous</option>
              </Select>
            </FormField>

            <FormField label="Billing Semester" required>
              <Input
                {...registerFee("semester")}
                placeholder="e.g. Fall 2026"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Invoice Sum (৳ BDT)" error={feeErrors.amount?.message} required>
              <Input
                type="number"
                {...registerFee("amount", { valueAsNumber: true })}
                className="font-mono"
              />
            </FormField>

            <FormField label="Due Date Limit (YYYY-MM-DD)" error={feeErrors.dueDate?.message} required>
              <Input
                {...registerFee("dueDate")}
                placeholder="YYYY-MM-DD"
                className="font-mono"
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setIsGenModalOpen(false); setEditingFee(null); resetFeeForm(); }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              disabled={generateFeeMutation.isPending || updateFeeMutation.isPending}
              leftIcon={<Plus size={14} />}
            >
              {editingFee ? "Update Invoice" : "Issue Invoice"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Dialog */}
      <Modal
        isOpen={!!payingFee}
        onClose={() => setPayingFee(null)}
        title="Clear Outstanding Invoice & Release Holds"
        subtitle="Verify settlement method and record bursar clearance"
        size="md"
      >
        {payingFee && (
          <div className="space-y-4">
            <div className="p-4 bg-surface-muted rounded-xl border border-border space-y-1.5">
              <div className="flex justify-between items-center text-[11px] text-text-muted">
                <span>Invoice: #{payingFee.id}</span>
                <span>Semester: {payingFee.semester}</span>
              </div>
              <h4 className="text-sm font-bold text-text">{payingFee.studentName} — {payingFee.type}</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-mono font-bold text-gold">৳{payingFee.amount.toLocaleString()}</span>
                {calcLateFee(payingFee) > 0 && (
                  <span className="text-xs text-danger font-semibold">
                    + ৳{calcLateFee(payingFee)} late fine
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleClearPayment} className="space-y-4">
              <FormField label="Settlement Method" required>
                <Select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                >
                  <option value="bkash">bKash Merchant Gateway</option>
                  <option value="nagad">Nagad Direct Gateway</option>
                  <option value="card">Visa / Mastercard POS Counter</option>
                  <option value="bank-transfer">Direct Bank Wire / Sonali Bank</option>
                  <option value="cash">Cash Treasury Counter</option>
                </Select>
              </FormField>

              <FormField label="Bank Scroll / Gateway Transaction ID (TrxID)">
                <Input
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. TXN-88392019"
                  className="font-mono"
                />
              </FormField>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPayingFee(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  disabled={recordPaymentMutation.isPending}
                  leftIcon={<Landmark size={14} />}
                >
                  {recordPaymentMutation.isPending ? "Clearing..." : "Commit Payment & Lift Holds"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* Bulk Generate Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Generate Fees for All Cohort Students"
        subtitle="Bulk generate dues invoices for all enrolled students in the target cohort"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-text-muted leading-relaxed">
            This operation will generate fee vouchers for all active student accounts matriculated in the selected academic semester using the standard institutional fee schedule.
          </p>

          <FormField label="Target Academic Semester" required>
            <Select
              value={bulkSemesterId}
              onChange={(e) => setBulkSemesterId(e.target.value)}
            >
              <option value="">Select semester...</option>
              {semesters.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Payment Due Date" required>
            <Input
              type="date"
              value={bulkDueDate}
              onChange={(e) => setBulkDueDate(e.target.value)}
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBulkModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="gold"
              onClick={() => {
                if (bulkSemesterId && bulkDueDate) {
                  bulkGenerateMutation.mutate({ academicSemester: bulkSemesterId, dueDate: bulkDueDate });
                }
              }}
              disabled={!bulkSemesterId || !bulkDueDate || bulkGenerateMutation.isPending}
              leftIcon={<Users size={14} />}
            >
              {bulkGenerateMutation.isPending ? "Generating..." : "Generate for All"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 3-Tranche Installment Agreement Modal */}
      <Modal
        isOpen={isInstallmentModalOpen}
        onClose={() => setIsInstallmentModalOpen(false)}
        title="3-Tranche Tuition Installment & Exam Clearance Agreement"
        subtitle="Splits semester tuition across registration, midterm, and final exam clearance milestones"
        size="lg"
      >
        <div className="space-y-4">
          <div className="p-4 bg-surface-muted/60 rounded-xl border border-border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-text-muted font-semibold uppercase">Candidate Account</span>
                <p className="text-sm font-bold text-text">Tahmid Hasan (CSE-2023-0142)</p>
                <span className="text-xs text-text-muted">Total Semester Tuition: <strong className="text-gold font-mono">৳85,000</strong></span>
              </div>
              <Badge variant="success" size="sm">Installment Active</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-surface rounded-xl border border-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text">Tranche 1 (40%)</span>
                  <Badge variant="success" size="sm">Cleared</Badge>
                </div>
                <span className="text-base font-bold font-mono text-emerald-600 block">৳34,000</span>
                <span className="text-[10px] text-text-muted block">Due: At Course Enrollment</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ Enrolled in Classes</span>
              </div>

              <div className="p-3 bg-surface rounded-xl border border-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text">Tranche 2 (30%)</span>
                  <Badge variant="success" size="sm">Cleared</Badge>
                </div>
                <span className="text-base font-bold font-mono text-emerald-600 block">৳25,500</span>
                <span className="text-[10px] text-text-muted block">Due: Prior to Midterm Exam</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ Midterm Admit Issued</span>
              </div>

              <div className="p-3 bg-surface rounded-xl border border-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text">Tranche 3 (30%)</span>
                  <Badge variant="warning" size="sm">Pending</Badge>
                </div>
                <span className="text-base font-bold font-mono text-warning block">৳25,500</span>
                <span className="text-[10px] text-text-muted block">Due: Prior to Final Exam</span>
                <span className="text-[10px] text-warning font-semibold block mt-1">⏳ Final Exam Hold</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-surface rounded-xl border border-border flex items-center justify-between text-xs">
            <span className="text-text-muted">Total Installment Paid: <strong className="text-emerald-600 font-mono">৳59,500 (70%)</strong></span>
            <span className="text-text-muted">Remaining Balance: <strong className="text-warning font-mono">৳25,500</strong></span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setIsInstallmentModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="gold"
              onClick={() => {
                setIsInstallmentModalOpen(false);
                setSuccessMsg("Installment agreement promissory note downloaded.");
                setTimeout(() => setSuccessMsg(""), 4000);
              }}
            >
              Export Agreement PDF
            </Button>
          </div>
        </div>
      </Modal>

      {/* Money Receipt Modal */}
      <Modal
        isOpen={!!challanStudent}
        onClose={() => setChallanStudent(null)}
        title="Official Bursar Money Receipt"
        subtitle={challanStudent ? `${challanStudent.studentName} (${challanStudent.studentId})` : ""}
        size="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" onClick={() => window.print()} leftIcon={<Printer size={14} />}>
              Print Receipt
            </Button>
            <Button variant="gold" onClick={() => setChallanStudent(null)}>
              Close
            </Button>
          </div>
        }
      >
        {challanStudent && (
          <div className="p-6 bg-surface-muted rounded-2xl border border-border space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h4 className="text-sm font-bold text-text">University Operating System</h4>
                <p className="text-[10px] text-text-muted">Office of the Comptroller & Bursar</p>
              </div>
              <Badge variant="success" size="sm">PAID & CLEARED</Badge>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between"><span className="text-text-muted">Student:</span> <strong className="text-text">{challanStudent.studentName}</strong></div>
              <div className="flex justify-between"><span className="text-text-muted">Registration ID:</span> <strong className="font-mono text-gold">{challanStudent.studentId}</strong></div>
              <div className="flex justify-between"><span className="text-text-muted">Category:</span> <span>{challanStudent.type}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Billing Semester:</span> <span>{challanStudent.semester}</span></div>
              <div className="flex justify-between border-t border-border pt-2 text-sm font-bold"><span className="text-text">Total Paid:</span> <span className="font-mono text-emerald-600">৳{challanStudent.amount?.toLocaleString()}</span></div>
            </div>

            <div className="pt-3 border-t border-border text-center">
              <QrCode size={90} className="mx-auto text-navy" />
              <span className="font-mono text-[10px] text-text-muted block mt-1">RECEIPT-VALID-AUTH-88910</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
