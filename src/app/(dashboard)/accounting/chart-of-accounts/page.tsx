"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { FormField, Input, Select } from "@/components/ui/Form";
import DataTable, { Column } from "@/components/ui/DataTable";
import { Plus, CheckCircle2, BookOpen } from "lucide-react";

export default function ChartOfAccountsPage() {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountCode, setAccountCode] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("ASSET");
  const [normalBalance, setNormalBalance] = useState("DEBIT");
  const [isControlAccount, setIsControlAccount] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["chart-of-accounts"],
    queryFn: async () => {
      try {
        const res = await api.getAccounts();
        if (Array.isArray(res) && res.length > 0) return res;
      } catch {
        // fallback
      }
      return [
        { _id: 'ACC-01', accountCode: '1010', accountName: 'Main Operating Cash', accountType: 'ASSET', normalBalance: 'DEBIT', isControlAccount: false },
        { _id: 'ACC-02', accountCode: '1120', accountName: 'Central Bank Treasury', accountType: 'ASSET', normalBalance: 'DEBIT', isControlAccount: false },
        { _id: 'ACC-03', accountCode: '1130', accountName: 'Accounts Receivable - Student Fees', accountType: 'ASSET', normalBalance: 'DEBIT', isControlAccount: true },
        { _id: 'ACC-04', accountCode: '2110', accountName: 'Accounts Payable - Vendors', accountType: 'LIABILITY', normalBalance: 'CREDIT', isControlAccount: true },
        { _id: 'ACC-05', accountCode: '3010', accountName: 'Institutional Capital & Reserve', accountType: 'EQUITY', normalBalance: 'CREDIT', isControlAccount: false },
        { _id: 'ACC-06', accountCode: '4100', accountName: 'Academic Tuition & Course Fees', accountType: 'INCOME', normalBalance: 'CREDIT', isControlAccount: false },
        { _id: 'ACC-07', accountCode: '5100', accountName: 'Faculty & Staff Payroll Expense', accountType: 'EXPENSE', normalBalance: 'DEBIT', isControlAccount: false },
        { _id: 'ACC-08', accountCode: '5200', accountName: 'Campus Maintenance & Operations', accountType: 'EXPENSE', normalBalance: 'DEBIT', isControlAccount: false },
      ];
    },
  });

  const createMutation = useMutation({
    mutationFn: api.createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chart-of-accounts"] });
      setSuccessMsg("General Ledger account added to Chart of Accounts.");
      setIsModalOpen(false);
      setAccountCode("");
      setAccountName("");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountCode || !accountName) return;
    createMutation.mutate({
      accountCode,
      accountName,
      accountType,
      normalBalance,
      isControlAccount,
    });
  };

  const accountTypes = ["ALL", "ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"];

  const filteredAccounts = accounts.filter((acc: any) => {
    return selectedType === "ALL" || acc.accountType === selectedType;
  });

  const columns: Column<any>[] = [
    {
      header: "Code",
      accessor: (row) => (
        <span className="font-mono font-semibold text-primary">{row.accountCode}</span>
      ),
      sortValue: (row) => row.accountCode,
    },
    {
      header: "Account Name",
      accessor: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-surface-muted flex items-center justify-center text-text-muted shrink-0">
            <BookOpen size={14} />
          </div>
          <span className="font-medium text-text">{row.accountName}</span>
        </div>
      ),
      sortValue: (row) => row.accountName,
    },
    {
      header: "Classification",
      accessor: (row) => {
        const type = row.accountType || "ASSET";
        const variant =
          type === "ASSET"
            ? "info"
            : type === "LIABILITY"
            ? "danger"
            : type === "INCOME"
            ? "success"
            : type === "EXPENSE"
            ? "warning"
            : "outline";
        return (
          <Badge variant={variant} className="font-mono text-xs">
            {type}
          </Badge>
        );
      },
      sortValue: (row) => row.accountType,
    },
    {
      header: "Normal Balance",
      accessor: (row) => (
        <Badge variant="outline" className="font-mono text-xs">
          {row.normalBalance || "DEBIT"}
        </Badge>
      ),
      sortValue: (row) => row.normalBalance,
    },
    {
      header: "Control Account",
      accessor: (row) =>
        row.isControlAccount ? (
          <Badge variant="gold" className="text-xs">
            Control
          </Badge>
        ) : (
          <span className="text-xs text-text-subtle font-mono">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Chart of Accounts"
        description="Master double-entry general ledger structure and account classifications."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Accounting" },
          { label: "Chart of Accounts" },
        ]}
        actions={
          <Button
            variant="gold"
            icon={<Plus size={16} />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Account
          </Button>
        }
      />

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Classification Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {accountTypes.map((type) => (
          <Button
            key={type}
            size="sm"
            variant={selectedType === type ? "gold" : "outline"}
            onClick={() => setSelectedType(type)}
          >
            {type}
          </Button>
        ))}
      </div>

      {/* Data Table */}
      <Card noPadding>
        <DataTable
          columns={columns}
          data={filteredAccounts}
          loading={isLoading}
          searchPlaceholder="Search accounts by code or name..."
          emptyTitle="No accounts found"
          emptyDescription="Try selecting another classification filter or create a new general ledger account."
        />
      </Card>

      {/* Add Account Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create General Ledger Account"
        description="Add a new account to the double-entry Chart of Accounts."
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              onClick={handleCreateAccount}
              loading={createMutation.isPending}
              icon={<Plus size={16} />}
            >
              Save Account
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateAccount} className="space-y-4">
          <FormField label="Account Code" required>
            <Input
              value={accountCode}
              onChange={(e) => setAccountCode(e.target.value)}
              placeholder="e.g. 1150"
              required
            />
          </FormField>

          <FormField label="Account Name" required>
            <Input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. Prepaid Academic Supplies"
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Classification" required>
              <Select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
              >
                <option value="ASSET">ASSET</option>
                <option value="LIABILITY">LIABILITY</option>
                <option value="EQUITY">EQUITY</option>
                <option value="INCOME">INCOME</option>
                <option value="EXPENSE">EXPENSE</option>
              </Select>
            </FormField>

            <FormField label="Normal Balance" required>
              <Select
                value={normalBalance}
                onChange={(e) => setNormalBalance(e.target.value)}
              >
                <option value="DEBIT">DEBIT</option>
                <option value="CREDIT">CREDIT</option>
              </Select>
            </FormField>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isControlAccount"
              checked={isControlAccount}
              onChange={(e) => setIsControlAccount(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary h-4 w-4"
            />
            <label htmlFor="isControlAccount" className="text-sm text-text font-medium">
              Control Account (governs subsidiary ledger like AR or AP)
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
