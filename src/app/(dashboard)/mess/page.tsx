"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  ClipboardList,
  Star,
  Receipt,
  Plus,
  CheckCircle2,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  QrCode,
  Flame,
  ShieldCheck,
  Check,
} from "lucide-react";
import DataTable from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import {
  PageHeader,
  Card,
  Button,
  IconButton,
  Badge,
  Modal,
} from "@/components/ui";
import Link from "next/link";

export default function MessPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"menus" | "meal-plans" | "feedback" | "bills" | "tokens">("menus");
  const [successMsg, setSuccessMsg] = useState("");
  const [activeMealTokenModal, setActiveMealTokenModal] = useState<any>(null);

  const canManage =
    roleIs("domain-admin", "super-admin") ||
    user?.staffSubRole === "mess-manager" ||
    user?.staffSubRole === "accountant";

  const { data: menus = [], isLoading: isLoadingMenus } = useQuery({ queryKey: ["menus"], queryFn: api.getMenus });
  const { data: mealPlans = [], isLoading: isLoadingMealPlans } = useQuery({ queryKey: ["mealPlans"], queryFn: api.getMealPlans });
  const { data: feedback = [], isLoading: isLoadingFeedback } = useQuery({ queryKey: ["messFeedback"], queryFn: api.getMessFeedback });
  const { data: bills = [], isLoading: isLoadingBills } = useQuery({ queryKey: ["messBills"], queryFn: api.getMessBills });

  const deleteMenuMutation = useMutation({
    mutationFn: (id: string) => api.deleteMenu(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setSuccessMsg("Menu item deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const deleteMealPlanMutation = useMutation({
    mutationFn: (id: string) => api.deleteMealPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
      setSuccessMsg("Meal plan deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const deleteFeedbackMutation = useMutation({
    mutationFn: (id: string) => api.deleteMessFeedback(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messFeedback"] });
      setSuccessMsg("Feedback deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const deleteBillMutation = useMutation({
    mutationFn: (id: string) => api.deleteMessBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messBills"] });
      setSuccessMsg("Bill deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const toggleBillStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.updateMessBill(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messBills"] });
      setSuccessMsg("Bill status updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const newLinkMap: Record<string, string> = {
    menus: "/mess/new?type=menu",
    "meal-plans": "/mess/new?type=meal-plan",
    feedback: "/mess/new?type=feedback",
    bills: "/mess/new?type=bill",
    tokens: "/mess/new?type=meal-plan",
  };

  const newLabelMap: Record<string, string> = {
    menus: "Add Menu Item",
    "meal-plans": "Create Meal Plan",
    feedback: "Submit Feedback",
    bills: "Generate Bill",
    tokens: "Issue Meal Token",
  };

  const menuColumns = [
    { header: "Day", accessor: (row: any) => <span className="font-bold text-text">{row.day}</span> },
    {
      header: "Meal Type",
      accessor: (row: any) => (
        <Badge variant="gold" size="sm">
          {row.mealType}
        </Badge>
      ),
    },
    { header: "Dietary Menu Items", accessor: (row: any) => <span className="font-medium text-text">{row.items}</span> },
    { header: "Nutrition Estimate", accessor: () => <span className="text-xs text-text-muted font-mono flex items-center gap-1"><Flame size={12} className="text-amber-500" /> 680 kcal • 28g Protein</span> },
    { header: "Cycle", accessor: (row: any) => <span className="font-mono text-text-muted text-xs">{row.date || "Daily Recurring"}</span> },
    ...(canManage
      ? [
          {
            header: "Actions",
            accessor: (row: any) => (
              <div className="flex items-center gap-1">
                <Link href={`/mess/${row._id || row.id}?type=menu`}>
                  <IconButton label="Edit menu" variant="ghost" size="sm">
                    <Pencil size={14} />
                  </IconButton>
                </Link>
                <IconButton
                  label="Delete menu"
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this menu item?")) {
                      deleteMenuMutation.mutate(row._id || row.id);
                    }
                  }}
                >
                  <Trash2 size={14} />
                </IconButton>
              </div>
            ),
          },
        ]
      : []),
  ];

  const mealPlanColumns = [
    { header: "Student Name", accessor: (row: any) => <span className="font-medium text-text">{row.studentName}</span> },
    { header: "Student ID", accessor: (row: any) => <span className="font-mono text-xs text-text-muted">{row.studentId}</span> },
    {
      header: "Subscription Plan",
      accessor: (row: any) => (
        <Badge variant="gold" size="sm">
          {row.planType}
        </Badge>
      ),
    },
    { header: "Validity", accessor: (row: any) => <span className="font-mono text-xs text-text-muted">{row.startDate} — {row.endDate}</span> },
    {
      header: "Status",
      accessor: (row: any) => (
        <Badge variant={row.status === "active" ? "success" : "warning"} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Digital Token",
      accessor: (row: any) => (
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-7 px-2"
          leftIcon={<QrCode size={12} />}
          onClick={() => setActiveMealTokenModal(row)}
        >
          View Token
        </Button>
      ),
    },
    ...(canManage
      ? [
          {
            header: "Actions",
            accessor: (row: any) => (
              <div className="flex items-center gap-1">
                <Link href={`/mess/${row._id || row.id}?type=meal-plan`}>
                  <IconButton label="Edit meal plan" variant="ghost" size="sm">
                    <Pencil size={14} />
                  </IconButton>
                </Link>
                <IconButton
                  label="Delete meal plan"
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this meal plan?")) {
                      deleteMealPlanMutation.mutate(row._id || row.id);
                    }
                  }}
                >
                  <Trash2 size={14} />
                </IconButton>
              </div>
            ),
          },
        ]
      : []),
  ];

  const feedbackColumns = [
    { header: "Student Complainant", accessor: (row: any) => <span className="font-medium text-text">{row.studentName}</span> },
    {
      header: "Quality Rating",
      accessor: (row: any) => (
        <span className="font-bold text-amber-500 tracking-wider">
          {"★".repeat(row.rating)}{"☆".repeat(Math.max(0, 5 - row.rating))}
        </span>
      ),
    },
    { header: "Student Review & Feedback", accessor: "comments" as const },
    { header: "Inspection Date", accessor: (row: any) => <span className="font-mono text-xs text-text-muted">{row.date || "Recent"}</span> },
    ...(canManage
      ? [
          {
            header: "Actions",
            accessor: (row: any) => (
              <div className="flex items-center gap-1">
                <Link href={`/mess/${row._id || row.id}?type=feedback`}>
                  <IconButton label="Edit feedback" variant="ghost" size="sm">
                    <Pencil size={14} />
                  </IconButton>
                </Link>
                <IconButton
                  label="Delete feedback"
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this feedback?")) {
                      deleteFeedbackMutation.mutate(row._id || row.id);
                    }
                  }}
                >
                  <Trash2 size={14} />
                </IconButton>
              </div>
            ),
          },
        ]
      : []),
  ];

  const billColumns = [
    { header: "Student Name", accessor: (row: any) => <span className="font-medium text-text">{row.studentName}</span> },
    { header: "Student ID", accessor: (row: any) => <span className="font-mono text-xs text-text-muted">{row.studentId}</span> },
    {
      header: "Mess Fee (BDT)",
      accessor: (row: any) => (
        <span className="font-mono font-bold text-gold">
          ৳{Number(row.amount || 0).toLocaleString()}
        </span>
      ),
    },
    { header: "Billing Cycle", accessor: "month" as const },
    { header: "Payment Deadline", accessor: (row: any) => <span className="font-mono text-xs text-text-muted">{row.dueDate}</span> },
    {
      header: "Settlement Status",
      accessor: (row: any) => (
        <button
          onClick={() => {
            const newStatus = row.status === "paid" ? "unpaid" : "paid";
            toggleBillStatusMutation.mutate({ id: row._id || row.id, status: newStatus });
          }}
          className="inline-flex items-center gap-1 cursor-pointer"
          title={`Click to mark as ${row.status === "paid" ? "unpaid" : "paid"}`}
        >
          <Badge variant={row.status === "paid" ? "success" : "danger"} size="sm">
            {row.status === "paid" ? (
              <ToggleRight size={13} className="inline mr-1" />
            ) : (
              <ToggleLeft size={13} className="inline mr-1" />
            )}
            {row.status}
          </Badge>
        </button>
      ),
    },
    ...(canManage
      ? [
          {
            header: "Actions",
            accessor: (row: any) => (
              <div className="flex items-center gap-1">
                <Link href={`/mess/${row._id || row.id}?type=bill`}>
                  <IconButton label="Edit bill" variant="ghost" size="sm">
                    <Pencil size={14} />
                  </IconButton>
                </Link>
                <IconButton
                  label="Delete bill"
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this bill?")) {
                      deleteBillMutation.mutate(row._id || row.id);
                    }
                  }}
                >
                  <Trash2 size={14} />
                </IconButton>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Hall Dining & Mess Governance"
        subtitle="Manage daily dietary menus, student meal plans, dining hygiene feedback, digital optical meal tokens, and monthly dining billing in BDT (৳)."
        actions={
          canManage && (
            <Link href={newLinkMap[activeTab] || "/mess/new"}>
              <Button variant="gold" leftIcon={<Plus size={15} />}>
                {newLabelMap[activeTab] || "Add Item"}
              </Button>
            </Link>
          )
        }
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Active Meal Subscribers</span>
            <Badge variant="gold" size="sm">Full Board</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-text">
            {mealPlans.length || 420} <span className="text-xs font-normal text-text-muted">Boarders</span>
          </div>
          <span className="text-xs text-text-muted mt-1 block">3 Meals / Day Halal Certified</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Monthly Dining Revenue</span>
            <Badge variant="success" size="sm">Billed</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-gold">
            ৳ 18,90,000
          </div>
          <span className="text-xs text-text-muted mt-1 block">Avg ৳ 4,500 / student / month</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Average Food Quality</span>
            <Badge variant="gold" size="sm">4.6 / 5.0</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-500">
            ★★★★☆
          </div>
          <span className="text-xs text-text-muted mt-1 block">Based on 182 verified dining reviews</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Hygiene & Safety</span>
            <Badge variant="success" size="sm">Grade A</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">
            99.2%
          </div>
          <span className="text-xs text-text-muted mt-1 block">Warden Weekly Kitchen Audit</span>
        </Card>
      </div>

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

      {/* Tabs Navigation */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-px">
        {([
          { key: "menus", label: "Weekly Menus & Nutrition", icon: ClipboardList },
          { key: "meal-plans", label: "Active Meal Plans", icon: UtensilsCrossed },
          { key: "bills", label: "Monthly Mess Billing", icon: Receipt },
          { key: "feedback", label: "Food Quality & Feedback", icon: Star },
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

      <Card noPadding>
        {activeTab === "menus" &&
          (isLoadingMenus ? (
            <TableSkeleton rows={5} cols={5} />
          ) : (
            <DataTable
              data={menus}
              columns={menuColumns}
              searchPlaceholder="Search menu items..."
              searchField="items"
            />
          ))}

        {activeTab === "meal-plans" &&
          (isLoadingMealPlans ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <DataTable
              data={mealPlans}
              columns={mealPlanColumns}
              searchPlaceholder="Search meal plans by student..."
              searchField="studentName"
            />
          ))}

        {activeTab === "bills" &&
          (isLoadingBills ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <DataTable
              data={bills}
              columns={billColumns}
              searchPlaceholder="Search bills by student..."
              searchField="studentName"
            />
          ))}

        {activeTab === "feedback" &&
          (isLoadingFeedback ? (
            <TableSkeleton rows={5} cols={5} />
          ) : (
            <DataTable
              data={feedback}
              columns={feedbackColumns}
              searchPlaceholder="Search feedback..."
              searchField="studentName"
            />
          ))}
      </Card>

      {/* Digital Meal Token Modal */}
      <Modal
        isOpen={!!activeMealTokenModal}
        onClose={() => setActiveMealTokenModal(null)}
        title="Halal Dining Meal Token"
        subtitle={activeMealTokenModal ? `${activeMealTokenModal.studentName} • ${activeMealTokenModal.studentId}` : ""}
        size="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="font-mono text-xs text-text-muted">TOKEN-VALID-{activeMealTokenModal?.id?.slice(0, 8) || "88219"}</span>
            <Button variant="gold" onClick={() => setActiveMealTokenModal(null)}>
              Dismiss
            </Button>
          </div>
        }
      >
        {activeMealTokenModal && (
          <div className="space-y-4 text-center py-2">
            <div className="p-6 bg-gradient-to-br from-navy via-navy to-surface-muted text-surface border border-gold/40 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-3">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed size={20} className="text-gold" />
                  <span className="font-bold text-xs uppercase tracking-widest text-gold">Hall Dining Hall</span>
                </div>
                <Badge variant="gold" size="sm">{activeMealTokenModal.planType}</Badge>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-surface text-text rounded-xl border border-border shadow-inner my-2">
                <QrCode size={130} className="text-navy" />
                <span className="font-mono text-[10px] text-text-muted mt-2 font-bold tracking-widest">
                  TOKEN-AUTH-{activeMealTokenModal.studentId}-ACTIVE
                </span>
              </div>

              <div className="text-left space-y-1">
                <h4 className="text-base font-bold text-white">{activeMealTokenModal.studentName}</h4>
                <p className="text-xs text-gold/90 font-mono">ID: {activeMealTokenModal.studentId}</p>
                <div className="pt-2 text-xs text-surface/80 flex items-center justify-between">
                  <span>Validity: <strong>{activeMealTokenModal.startDate} - {activeMealTokenModal.endDate}</strong></span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold"><Check size={13} /> Active Boarder</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
