"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion } from "framer-motion";
import { 
  Wallet, 
  Plus, 
  CheckCircle2, 
  FileText, 
  Edit3, 
  Trash2 
} from "lucide-react";
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
  IconButton, 
  Badge 
} from "@/components/ui";

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
    setEmployeeName(""); 
    setEmployeeId(""); 
    setDesignation(""); 
    setDepartment("");
    setSalary(50000); 
    setMonth("June 2026");
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
      header: "Employee Staff",
      accessor: (row) => (
        <div>
          <span className="font-bold text-text block text-xs">{row.employeeName}</span>
          <span className="text-[10px] text-text-tertiary font-mono block">{row.employeeId}</span>
        </div>
      ),
      sortable: true,
    },
    { 
      header: "Designation", 
      accessor: "designation",
      className: "text-text-secondary text-xs",
      sortable: true,
    },
    { 
      header: "Department", 
      accessor: "department",
      className: "text-text-secondary text-xs",
      sortable: true,
    },
    {
      header: "Monthly Salary",
      accessor: (row) => (
        <span className="font-mono font-bold text-text text-xs">
          ৳{row.salary.toLocaleString()}
        </span>
      ),
      sortable: true,
    },
    { 
      header: "Pay Cycle", 
      accessor: "month",
      className: "text-text-tertiary text-xs",
      sortable: true,
    },
    {
      header: "Disbursement",
      accessor: (row) => (
        <Badge
          variant={row.status === "paid" ? "success" : "warning"}
          size="sm"
          className="uppercase"
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewSlip(row)}
            icon={<FileText size={12} />}
            className="text-xs h-7 px-2"
          >
            Slip
          </Button>
          {row.status === "pending" ? (
            <Button
              variant="gold"
              size="sm"
              onClick={() => markPaidMutation.mutate(row.id)}
              icon={<CheckCircle2 size={12} />}
              className="text-xs h-7 px-2"
            >
              Pay
            </Button>
          ) : (
            <span className="text-[10px] text-emerald-600 font-mono font-semibold px-1">
              {row.paidDate}
            </span>
          )}
          {isAccountantOrAdmin && (
            <>
              <IconButton
                variant="ghost"
                size="sm"
                label="Edit payroll record"
                onClick={() => openEdit(row)}
                icon={<Edit3 size={12} />}
              />
              <IconButton
                variant="danger"
                size="sm"
                label="Delete payroll record"
                onClick={() => { if (confirm("Delete this payroll record?")) deleteMutation.mutate(row.id); }}
                icon={<Trash2 size={12} />}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <PageHeader
        title="Payroll & Salary Disbursement"
        subtitle="Manage academic faculty and administrative staff salary structures, pay slips, and disbursement runs"
        badge="Institutional Payroll"
        actions={
          isAccountantOrAdmin && (
            <Button
              variant="gold"
              onClick={() => { setEditingPayroll(null); resetForm(); setShowCreateModal(true); }}
              icon={<Plus size={16} />}
            >
              Create Payroll
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card orientation="vertical" padding="lg" variant="default" className="space-y-2">
          <span className="text-xs font-semibold text-text-tertiary block uppercase tracking-wider">Total Monthly Payroll</span>
          <span className="text-2xl font-bold text-text font-mono block">৳{totalPayroll.toLocaleString()}</span>
        </Card>
        <Card orientation="vertical" padding="lg" variant="default" className="space-y-2">
          <span className="text-xs font-semibold text-text-tertiary block uppercase tracking-wider">Pending Disbursement</span>
          <span className="text-2xl font-bold text-warning font-mono block">৳{pendingAmount.toLocaleString()}</span>
        </Card>
        <Card orientation="vertical" padding="lg" variant="default" className="space-y-2">
          <span className="text-xs font-semibold text-text-tertiary block uppercase tracking-wider">Staff on Payroll</span>
          <span className="text-2xl font-bold text-text font-mono block">{payroll.length} Employees</span>
        </Card>
      </div>

      <Card orientation="vertical" padding="none" variant="default" className="overflow-hidden">
        <DataTable<PayrollRow>
          data={payroll}
          columns={columns}
          isLoading={isLoading}
          searchable={true}
          searchPlaceholder="Search by employee name, ID, or department..."
          searchField="employeeName"
          pagination={true}
          pageSize={10}
        />
      </Card>

      {/* Salary Slip Modal */}
      <Modal
        isOpen={showSlipModal && !!slipData}
        onClose={() => setShowSlipModal(false)}
        title="Official Salary Pay Slip"
        description={`Period: ${slipData ? MONTH_NAMES[slipData.month - 1] : ""} ${slipData?.year || 2026}`}
        size="md"
      >
        {slipData && (
          <div className="space-y-5">
            <div className="p-4 bg-surface-elevated/60 border border-border rounded-xl">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <span className="text-text-tertiary">Employee:</span>{" "}
                  <span className="font-semibold text-text">
                    {(() => { 
                      const en = (slipData.employee as any)?.employeeName || (slipData.employee as any)?.name; 
                      return typeof en === 'string' ? en : `${en?.firstName ?? ''} ${en?.lastName ?? ''}`.trim() || ''; 
                    })()}
                  </span>
                </div>
                <div>
                  <span className="text-text-tertiary">Staff ID:</span>{" "}
                  <span className="font-semibold text-text font-mono">
                    {(slipData.employee as any)?.employeeId || (slipData.employee as any)?.id || ""}
                  </span>
                </div>
                <div>
                  <span className="text-text-tertiary">Designation:</span>{" "}
                  <span className="font-semibold text-text">
                    {(slipData.employee as any)?.designation || "Faculty"}
                  </span>
                </div>
                <div>
                  <span className="text-text-tertiary">Department:</span>{" "}
                  <span className="font-semibold text-text">
                    {(slipData.employee as any)?.department || "Academics"}
                  </span>
                </div>
                <div>
                  <span className="text-text-tertiary">Status:</span>{" "}
                  <Badge variant={slipData.status === "paid" ? "success" : "warning"} size="sm" className="uppercase">
                    {slipData.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-text-tertiary">Pay Date:</span>{" "}
                  <span className="font-semibold text-text font-mono">
                    {slipData.paymentDate ? new Date(slipData.paymentDate).toLocaleDateString() : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Earnings</h4>
              <div className="space-y-1.5 text-xs bg-surface-elevated/30 p-3 rounded-lg border border-border">
                <div className="flex justify-between"><span className="text-text-secondary">Basic Salary</span><span className="font-mono font-semibold text-text">৳{slipData.basicSalary.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">HRA</span><span className="font-mono font-semibold text-text">৳{slipData.allowances.hra.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">DA</span><span className="font-mono font-semibold text-text">৳{slipData.allowances.da.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Travel Allowance</span><span className="font-mono font-semibold text-text">৳{(slipData.allowances.travel || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Medical Allowance</span><span className="font-mono font-semibold text-text">৳{(slipData.allowances.medical || 0).toLocaleString()}</span></div>
                {(slipData.allowances.special || 0) > 0 && (
                  <div className="flex justify-between"><span className="text-text-secondary">Special Allowance</span><span className="font-mono font-semibold text-text">৳{slipData.allowances.special.toLocaleString()}</span></div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Deductions</h4>
              <div className="space-y-1.5 text-xs bg-surface-elevated/30 p-3 rounded-lg border border-border">
                <div className="flex justify-between"><span className="text-text-secondary">Income Tax Withholding</span><span className="font-mono font-semibold text-text">৳{slipData.deductions.tax.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Provident Fund (PF)</span><span className="font-mono font-semibold text-text">৳{slipData.deductions.providentFund.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Health Insurance</span><span className="font-mono font-semibold text-text">৳{(slipData.deductions.insurance || 0).toLocaleString()}</span></div>
                {(slipData.deductions.loan || 0) > 0 && (
                  <div className="flex justify-between"><span className="text-text-secondary">Loan Deduction</span><span className="font-mono font-semibold text-text">৳{slipData.deductions.loan.toLocaleString()}</span></div>
                )}
              </div>
            </div>

            <div className="p-3.5 bg-gold/5 border border-gold/30 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between text-text-secondary"><span>Gross Pay</span><span className="font-mono">৳{slipData.grossPay.toLocaleString()}</span></div>
              <div className="flex justify-between text-text-secondary"><span>Total Deductions</span><span className="font-mono">৳{slipData.totalDeductions.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm font-bold text-gold pt-2 border-t border-gold/20"><span>Net Take-home Pay</span><span className="font-mono">৳{slipData.netPay.toLocaleString()}</span></div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setShowSlipModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create / Edit Payroll Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setEditingPayroll(null); resetForm(); }}
        title={editingPayroll ? "Edit Payroll Entry" : "Create Payroll Entry"}
        description="Configure staff salary disbursement parameters"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Employee Full Name" required>
              <Input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="e.g. Dr. James Sterling"
                required
              />
            </FormField>
            <FormField label="Employee ID" required>
              <Input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. FAC-001"
                required
                className="font-mono"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Designation">
              <Input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Professor & Head"
              />
            </FormField>
            <FormField label="Department">
              <Input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Pathology"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Monthly Salary (৳ BDT)" required>
              <Input
                type="number"
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value))}
                min={0}
                required
                className="font-mono"
              />
            </FormField>

            <FormField label="Disbursement Month" required>
              <Select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="May 2026">May 2026</option>
                <option value="June 2026">June 2026</option>
                <option value="July 2026">July 2026</option>
                <option value="August 2026">August 2026</option>
                <option value="September 2026">September 2026</option>
              </Select>
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setShowCreateModal(false); setEditingPayroll(null); resetForm(); }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingPayroll ? "Update Record" : "Create Record"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

