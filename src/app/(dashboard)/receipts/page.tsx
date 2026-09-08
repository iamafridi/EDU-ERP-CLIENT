"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Download, Plus, CheckCircle2, Receipt, ArrowUpDown } from "lucide-react";
import { generateReceiptPDF } from "@/components/receipt/ReceiptPDF";
import { 
  PageHeader, 
  Card, 
  DataTable, 
  Column, 
  Modal, 
  FormField, 
  Input, 
  Select, 
  Button, 
  Badge 
} from "@/components/ui";

function mapReceipt(r: any) {
  const pm = r.paymentMethod?.toLowerCase?.() || "";
  const paymentMethod =
    pm === "online" ? "Online" :
    pm === "bank-transfer" || pm === "bank_transfer" ? "Bank Transfer" :
    pm === "cheque" ? "Cheque" :
    r.paymentMethod || "Cash";
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
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [semester, setSemester] = useState("");
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [feeType, setFeeType] = useState("Fee Payment");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const isAccountantOrAdmin = roleIs("domain-admin", "super-admin") || user?.staffSubRole === "accountant";

  const { data: receipts = [], isLoading } = useQuery({
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
      setSuccessMsg("Payment receipt generated and archived successfully.");
      setShowCreateModal(false);
      setStudentName(""); 
      setStudentId(""); 
      setSemester(""); 
      setAmount(0);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

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

  const handleCreateReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !amount) return;
    createReceiptMutation.mutate({
      studentName, 
      studentId, 
      semester,
      amount: Number(amount), 
      paymentMethod, 
      feeType,
    });
  };

  const methodTones: Record<string, "info" | "warning" | "success" | "neutral"> = {
    Online: "info",
    "Bank Transfer": "warning",
    Cash: "success",
    Cheque: "neutral",
  };

  const columns: Column<any>[] = [
    {
      header: "Receipt No",
      accessor: (row) => (
        <span className="font-mono font-bold text-gold text-xs">
          {row.receiptNo}
        </span>
      ),
      sortable: true,
    },
    {
      header: "Student Beneficiary",
      accessor: (row) => (
        <div>
          <span className="font-semibold text-text block text-xs">{row.studentName}</span>
          <span className="text-[10px] text-text-tertiary font-mono">{row.studentId || "—"}</span>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Semester",
      accessor: (row) => (
        <span className="text-xs text-text-secondary">{row.semester || "General"}</span>
      ),
    },
    {
      header: "Amount Paid",
      accessor: (row) => (
        <span className="font-mono font-bold text-text text-xs">
          ৳{Number(row.amount || 0).toLocaleString()}
        </span>
      ),
      sortable: true,
    },
    {
      header: "Method",
      accessor: (row) => (
        <Badge variant={methodTones[row.paymentMethod] || "neutral"} size="sm">
          {row.paymentMethod}
        </Badge>
      ),
    },
    {
      header: "Date Issued",
      accessor: (row) => (
        <span className="text-xs text-text-tertiary font-mono">{row.date}</span>
      ),
      sortable: true,
    },
    {
      header: "Actions",
      accessor: (row) => (
        <Button
          variant="outline"
          size="sm"
          disabled={downloadingId === row.id}
          onClick={() => handleDownloadPDF(row)}
          icon={<Download size={13} />}
          className="text-xs h-7 px-2.5"
        >
          {downloadingId === row.id ? "PDF..." : "PDF Voucher"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <PageHeader
        title="Payment Receipts Desk"
        subtitle="Official voucher repository, clearance ledger, and statutory PDF download desk"
        badge="Bursar Clearance"
        actions={
          isAccountantOrAdmin && (
            <Button
              variant="gold"
              onClick={() => setShowCreateModal(true)}
              icon={<Plus size={16} />}
            >
              Create Receipt
            </Button>
          )
        }
      />

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      <Card orientation="vertical" padding="none" variant="default" className="overflow-hidden">
        <DataTable
          columns={columns}
          data={receipts}
          isLoading={isLoading}
          searchable={true}
          searchPlaceholder="Search receipts by student name, ID, or receipt number..."
          pagination={true}
          pageSize={10}
        />
      </Card>

      {/* Create Receipt Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Issue New Payment Receipt"
        description="Record financial clearing and generate official bursar voucher"
        size="md"
      >
        <form onSubmit={handleCreateReceipt} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Student Full Name" required>
              <Input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Marcus Chen"
                required
              />
            </FormField>
            <FormField label="Student Registration ID">
              <Input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. STU-001"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Academic Semester">
              <Input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="e.g. Fall 2026"
              />
            </FormField>
            <FormField label="Amount Paid (৳ BDT)" required>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={0}
                placeholder="0"
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Payment Clearing Method">
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Cash Counter</option>
                <option value="online">Online Payment Gateway</option>
                <option value="bank-transfer">Direct Bank Transfer</option>
                <option value="cheque">Bank Demand Draft / Cheque</option>
              </Select>
            </FormField>

            <FormField label="Fee Allocation Type">
              <Select
                value={feeType}
                onChange={(e) => setFeeType(e.target.value)}
              >
                <option value="Fee Payment">General Fee Payment</option>
                <option value="Tuition Fee">Tuition Fee</option>
                <option value="Hostel Fee">Hostel Dorm Fee</option>
                <option value="Mess Fee">Mess & Dining Fee</option>
              </Select>
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              disabled={createReceiptMutation.isPending}
              icon={<Receipt size={14} />}
            >
              {createReceiptMutation.isPending ? "Generating..." : "Generate Receipt"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

