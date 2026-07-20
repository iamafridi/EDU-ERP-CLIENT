"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { UtensilsCrossed, ClipboardList, Star, Receipt, Plus, CheckCircle2, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import DataTable from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

export default function MessPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"menus" | "meal-plans" | "feedback" | "bills">("menus");
  const [successMsg, setSuccessMsg] = useState("");

  const canManage = roleIs("domain-admin", "super-admin") || user?.staffSubRole === "mess-manager" || user?.staffSubRole === "accountant";

  const { data: menus = [], isLoading: isLoadingMenus } = useQuery({ queryKey: ["menus"], queryFn: api.getMenus });
  const { data: mealPlans = [], isLoading: isLoadingMealPlans } = useQuery({ queryKey: ["mealPlans"], queryFn: api.getMealPlans });
  const { data: feedback = [], isLoading: isLoadingFeedback } = useQuery({ queryKey: ["messFeedback"], queryFn: api.getMessFeedback });
  const { data: bills = [], isLoading: isLoadingBills } = useQuery({ queryKey: ["messBills"], queryFn: api.getMessBills });

  const deleteMenuMutation = useMutation({
    mutationFn: (id: string) => api.deleteMenu(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setSuccessMsg("Menu item deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteMealPlanMutation = useMutation({
    mutationFn: (id: string) => api.deleteMealPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
      setSuccessMsg("Meal plan deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteFeedbackMutation = useMutation({
    mutationFn: (id: string) => api.deleteMessFeedback(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messFeedback"] });
      setSuccessMsg("Feedback deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteBillMutation = useMutation({
    mutationFn: (id: string) => api.deleteMessBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messBills"] });
      setSuccessMsg("Bill deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const toggleBillStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.updateMessBill(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messBills"] });
      setSuccessMsg("Bill status updated successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const newLinkMap: Record<string, string> = {
    menus: "/mess/new?type=menu",
    "meal-plans": "/mess/new?type=meal-plan",
    feedback: "/mess/new?type=feedback",
    bills: "/mess/new?type=bill",
  };

  const newLabelMap: Record<string, string> = {
    menus: "Add Menu Item",
    "meal-plans": "Create Meal Plan",
    feedback: "Submit Feedback",
    bills: "Generate Bill",
  };

  const menuColumns = [
    { header: "Day", accessor: "day" as const },
    { header: "Meal Type", accessor: "mealType" as const },
    { header: "Items", accessor: "items" as const },
    { header: "Date", accessor: "date" as const },
    ...(canManage
      ? [
          {
            header: "Actions",
            accessor: (row: any) => (
              <div className="flex items-center gap-1">
                <Link
                  href={`/mess/${row._id || row.id}?type=menu`}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Edit menu"
                >
                  <Pencil size={14} />
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this menu item?")) {
                      deleteMenuMutation.mutate(row._id || row.id);
                    }
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete menu"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  const mealPlanColumns = [
    { header: "Student Name", accessor: "studentName" as const },
    { header: "Student ID", accessor: "studentId" as const },
    { header: "Plan Type", accessor: "planType" as const },
    { header: "Start Date", accessor: "startDate" as const },
    { header: "End Date", accessor: "endDate" as const },
    {
      header: "Status",
      accessor: (row: any) => (
        <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${
          row.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
        }`}>
          {row.status}
        </span>
      ),
    },
    ...(canManage
      ? [
          {
            header: "Actions",
            accessor: (row: any) => (
              <div className="flex items-center gap-1">
                <Link
                  href={`/mess/${row._id || row.id}?type=meal-plan`}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Edit meal plan"
                >
                  <Pencil size={14} />
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this meal plan?")) {
                      deleteMealPlanMutation.mutate(row._id || row.id);
                    }
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete meal plan"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  const feedbackColumns = [
    { header: "Student Name", accessor: "studentName" as const },
    {
      header: "Rating",
      accessor: (row: any) => (
        <span className="font-bold text-amber-500">{"★".repeat(row.rating)}{"☆".repeat(5 - row.rating)}</span>
      ),
    },
    { header: "Comments", accessor: "comments" as const },
    { header: "Date", accessor: "date" as const },
    ...(canManage
      ? [
          {
            header: "Actions",
            accessor: (row: any) => (
              <div className="flex items-center gap-1">
                <Link
                  href={`/mess/${row._id || row.id}?type=feedback`}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Edit feedback"
                >
                  <Pencil size={14} />
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this feedback?")) {
                      deleteFeedbackMutation.mutate(row._id || row.id);
                    }
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete feedback"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  const billColumns = [
    { header: "Student Name", accessor: "studentName" as const },
    { header: "Student ID", accessor: "studentId" as const },
    {
      header: "Amount",
      accessor: (row: any) => <span className="font-mono font-bold">Rs. {row.amount.toLocaleString()}</span>,
    },
    { header: "Month", accessor: "month" as const },
    { header: "Due Date", accessor: "dueDate" as const },
    {
      header: "Status",
      accessor: (row: any) => (
        <button
          onClick={() => {
            const newStatus = row.status === "paid" ? "unpaid" : "paid";
            toggleBillStatusMutation.mutate({ id: row._id || row.id, status: newStatus });
          }}
          className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase cursor-pointer transition-colors hover:opacity-80 ${
            row.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
          }`}
          title={`Click to mark as ${row.status === "paid" ? "unpaid" : "paid"}`}
        >
          {row.status === "paid" ? <ToggleRight size={12} className="inline -mt-0.5" /> : <ToggleLeft size={12} className="inline -mt-0.5" />}
          {" "}{row.status}
        </button>
      ),
    },
    ...(canManage
      ? [
          {
            header: "Actions",
            accessor: (row: any) => (
              <div className="flex items-center gap-1">
                <Link
                  href={`/mess/${row._id || row.id}?type=bill`}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Edit bill"
                >
                  <Pencil size={14} />
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this bill?")) {
                      deleteBillMutation.mutate(row._id || row.id);
                    }
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete bill"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <UtensilsCrossed className="text-[#2563EB]" />
            Mess Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage mess menus, meal plans, feedback, and billing.
          </p>
        </div>

        {canManage && (
          <Link
            href={newLinkMap[activeTab]}
            className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto shadow-sm shadow-blue-500/10"
          >
            <Plus size={16} />
            {newLabelMap[activeTab]}
          </Link>
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

      <div className="flex border-b border-[#e1e2ed] gap-2">
        {([
          { key: "menus", label: "Menus", icon: ClipboardList },
          { key: "meal-plans", label: "Meal Plans", icon: UtensilsCrossed },
          { key: "feedback", label: "Feedback", icon: Star },
          { key: "bills", label: "Bills", icon: Receipt },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.key
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        {activeTab === "menus" && (
          isLoadingMenus ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <DataTable data={menus} columns={menuColumns} searchPlaceholder="Search menu items..." searchField="items" />
          )
        )}

        {activeTab === "meal-plans" && (
          isLoadingMealPlans ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <DataTable data={mealPlans} columns={mealPlanColumns} searchPlaceholder="Search meal plans..." searchField="studentName" />
          )
        )}

        {activeTab === "feedback" && (
          isLoadingFeedback ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <DataTable data={feedback} columns={feedbackColumns} searchPlaceholder="Search feedback..." searchField="studentName" />
          )
        )}

        {activeTab === "bills" && (
          isLoadingBills ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <DataTable data={bills} columns={billColumns} searchPlaceholder="Search bills..." searchField="studentName" />
          )
        )}
      </div>
    </div>
  );
}
