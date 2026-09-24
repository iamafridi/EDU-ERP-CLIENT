"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  ArrowLeft,
  Pencil,
  Trash2,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import Link from "next/link";
import {
  PageHeader,
  Card,
  FormField,
  Input,
  Select,
  Textarea,
  Button,
  Badge,
} from "@/components/ui";

const menuSchema = zod.object({
  day: zod.string().min(2, "Day is required"),
  mealType: zod.enum(["Breakfast", "Lunch", "Dinner", "Snacks"]),
  items: zod.string().min(3, "Items are required"),
});

type MenuFormValues = zod.infer<typeof menuSchema>;

const mealPlanSchema = zod.object({
  studentName: zod.string().min(2, "Student name is required"),
  studentId: zod.string().min(3, "Student ID is required"),
  planType: zod.enum(["Vegetarian", "Non-Vegetarian", "Vegan", "Diabetic"]),
  startDate: zod.string().min(10, "Start date is required"),
  endDate: zod.string().min(10, "End date is required"),
});

type MealPlanFormValues = zod.infer<typeof mealPlanSchema>;

const feedbackSchema = zod.object({
  studentName: zod.string().min(2, "Student name is required"),
  rating: zod.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comments: zod.string().min(3, "Comment is required"),
});

type FeedbackFormValues = zod.infer<typeof feedbackSchema>;

const billSchema = zod.object({
  studentName: zod.string().min(2, "Student name is required"),
  studentId: zod.string().min(3, "Student ID is required"),
  amount: zod.number().min(1, "Amount is required"),
  month: zod.string().min(3, "Month is required"),
  dueDate: zod.string().min(10, "Due date is required"),
});

type BillFormValues = zod.infer<typeof billSchema>;

export default function MessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as "menu" | "meal-plan" | "feedback" | "bill") || "menu";
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const canManage =
    roleIs("domain-admin", "super-admin") ||
    user?.staffSubRole === "mess-manager" ||
    user?.staffSubRole === "accountant";

  const { data: menus = [], isLoading: isLoadingMenus } = useQuery({ queryKey: ["menus"], queryFn: api.getMenus });
  const { data: mealPlans = [], isLoading: isLoadingMealPlans } = useQuery({ queryKey: ["mealPlans"], queryFn: api.getMealPlans });
  const { data: feedbackData = [], isLoading: isLoadingFeedback } = useQuery({ queryKey: ["messFeedback"], queryFn: api.getMessFeedback });
  const { data: bills = [], isLoading: isLoadingBills } = useQuery({ queryKey: ["messBills"], queryFn: api.getMessBills });

  const item =
    type === "menu"
      ? menus.find((m: any) => (m._id || m.id) === params.id)
      : type === "meal-plan"
      ? mealPlans.find((p: any) => (p._id || p.id) === params.id)
      : type === "feedback"
      ? feedbackData.find((f: any) => (f._id || f.id) === params.id)
      : bills.find((b: any) => (b._id || b.id) === params.id);

  const updateMenuMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateMenu(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setSuccessMsg("Menu item updated.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const updateMealPlanMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateMealPlan(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
      setSuccessMsg("Meal plan updated.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const updateBillMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateMessBill(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messBills"] });
      setSuccessMsg("Bill updated.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const toggleBillStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.updateMessBill(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messBills"] });
      setSuccessMsg("Bill status updated.");
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const deleteMenuMutation = useMutation({
    mutationFn: api.deleteMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      router.push("/mess");
    },
  });

  const deleteMealPlanMutation = useMutation({
    mutationFn: api.deleteMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
      router.push("/mess");
    },
  });

  const deleteFeedbackMutation = useMutation({
    mutationFn: api.deleteMessFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messFeedback"] });
      router.push("/mess");
    },
  });

  const deleteBillMutation = useMutation({
    mutationFn: api.deleteMessBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messBills"] });
      router.push("/mess");
    },
  });

  const {
    register: registerMenu,
    handleSubmit: handleSubmitMenu,
    reset: resetMenu,
    formState: { errors: menuErrors },
  } = useForm<MenuFormValues>({ resolver: zodResolver(menuSchema) });

  const {
    register: registerMealPlan,
    handleSubmit: handleSubmitMealPlan,
    reset: resetMealPlan,
    formState: { errors: mealPlanErrors },
  } = useForm<MealPlanFormValues>({ resolver: zodResolver(mealPlanSchema) });

  const {
    register: registerFeedback,
    handleSubmit: handleSubmitFeedback,
    reset: resetFeedback,
    formState: { errors: feedbackErrors },
  } = useForm<FeedbackFormValues>({ resolver: zodResolver(feedbackSchema) });

  const {
    register: registerBill,
    handleSubmit: handleSubmitBill,
    reset: resetBill,
    formState: { errors: billErrors },
  } = useForm<BillFormValues>({ resolver: zodResolver(billSchema) });

  useEffect(() => {
    if (!item) return;
    if (type === "menu") {
      resetMenu({ day: item.day || "Monday", mealType: item.mealType || "Lunch", items: item.items || "" });
    } else if (type === "meal-plan") {
      resetMealPlan({
        studentName: item.studentName || "",
        studentId: item.studentId || "",
        planType: item.planType || "Vegetarian",
        startDate: item.startDate || "",
        endDate: item.endDate || "",
      });
    } else if (type === "feedback") {
      resetFeedback({ studentName: item.studentName || "", rating: item.rating || 4, comments: item.comments || "" });
    } else {
      resetBill({
        studentName: item.studentName || "",
        studentId: item.studentId || "",
        amount: item.amount || 0,
        month: item.month || "",
        dueDate: item.dueDate || "",
      });
    }
  }, [item, type, resetMenu, resetMealPlan, resetFeedback, resetBill]);

  const onSubmitMenu = (values: MenuFormValues) => {
    if (!item) return;
    updateMenuMutation.mutate({ id: item._id || item.id, payload: values });
  };

  const onSubmitMealPlan = (values: MealPlanFormValues) => {
    if (!item) return;
    updateMealPlanMutation.mutate({ id: item._id || item.id, payload: values });
  };

  const onSubmitBill = (values: BillFormValues) => {
    if (!item) return;
    updateBillMutation.mutate({ id: item._id || item.id, payload: values });
  };

  const handleDelete = () => {
    if (!item) return;
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    const id = item._id || item.id;
    if (type === "menu") deleteMenuMutation.mutate(id);
    else if (type === "meal-plan") deleteMealPlanMutation.mutate(id);
    else if (type === "feedback") deleteFeedbackMutation.mutate(id);
    else deleteBillMutation.mutate(id);
  };

  const isPending =
    updateMenuMutation.isPending ||
    updateMealPlanMutation.isPending ||
    updateBillMutation.isPending ||
    deleteMenuMutation.isPending ||
    deleteMealPlanMutation.isPending ||
    deleteFeedbackMutation.isPending ||
    deleteBillMutation.isPending;

  if (isLoadingMenus || isLoadingMealPlans || isLoadingFeedback || isLoadingBills) {
    return (
      <div className="p-12 text-center text-text-muted">
        <p className="text-sm">Loading mess details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-sm text-text-muted">Record not found or has been removed.</p>
        <Link href="/mess">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>
            Back to Mess
          </Button>
        </Link>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    menu: "Daily Menu",
    "meal-plan": "Meal Plan Subscription",
    feedback: "Dining Feedback",
    bill: "Mess Billing Invoice",
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      <PageHeader
        title={typeLabels[type] || "Mess Entry Details"}
        subtitle={`Viewing details for ${typeLabels[type]?.toLowerCase()}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/mess">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>
                Mess Home
              </Button>
            </Link>
            {canManage && type !== "feedback" && (
              <>
                {!isEditing ? (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Pencil size={14} />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                )}
              </>
            )}
            {canManage && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 size={14} />}
                onClick={handleDelete}
                loading={isPending}
              >
                Delete
              </Button>
            )}
          </div>
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

      {/* Content Card */}
      <Card
        title={isEditing ? `Edit ${typeLabels[type]}` : `${typeLabels[type]} Specifications`}
        subtitle="Hostel dining parameters and student allocation"
      >
        {/* Menu View / Edit */}
        {type === "menu" && (
          isEditing ? (
            <form onSubmit={handleSubmitMenu(onSubmitMenu)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Day of Week" error={menuErrors.day?.message} required>
                  <Select {...registerMenu("day")}>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Meal Type" error={menuErrors.mealType?.message} required>
                  <Select {...registerMenu("mealType")}>
                    {["Breakfast", "Lunch", "Dinner", "Snacks"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </Select>
                </FormField>
              </div>

              <FormField label="Items Included" error={menuErrors.items?.message} required>
                <Input {...registerMenu("items")} />
              </FormField>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button type="submit" variant="primary" loading={isPending} leftIcon={<Pencil size={14} />}>
                  Save Menu
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-surface-muted rounded-xl border border-border">
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Day</span>
                  <span className="text-base font-bold text-text">{item.day}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Meal</span>
                  <Badge variant="gold" size="sm">{item.mealType}</Badge>
                </div>
              </div>
              <div className="p-4 bg-surface-muted rounded-xl border border-border">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">Dishes</span>
                <span className="text-sm font-medium text-text">{item.items}</span>
              </div>
            </div>
          )
        )}

        {/* Meal Plan View / Edit */}
        {type === "meal-plan" && (
          isEditing ? (
            <form onSubmit={handleSubmitMealPlan(onSubmitMealPlan)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Student Name" error={mealPlanErrors.studentName?.message} required>
                  <Input {...registerMealPlan("studentName")} />
                </FormField>
                <FormField label="Student ID" error={mealPlanErrors.studentId?.message} required>
                  <Input {...registerMealPlan("studentId")} className="font-mono" />
                </FormField>
              </div>

              <FormField label="Plan Type" error={mealPlanErrors.planType?.message} required>
                <Select {...registerMealPlan("planType")}>
                  {["Vegetarian", "Non-Vegetarian", "Vegan", "Diabetic"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Start Date" error={mealPlanErrors.startDate?.message} required>
                  <Input type="date" {...registerMealPlan("startDate")} className="font-mono" />
                </FormField>
                <FormField label="End Date" error={mealPlanErrors.endDate?.message} required>
                  <Input type="date" {...registerMealPlan("endDate")} className="font-mono" />
                </FormField>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button type="submit" variant="primary" loading={isPending} leftIcon={<Pencil size={14} />}>
                  Save Plan
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-surface-muted rounded-xl border border-border">
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Student</span>
                  <span className="text-base font-bold text-text">{item.studentName}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Student ID</span>
                  <span className="text-base font-mono text-text">{item.studentId}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Diet Plan</span>
                  <Badge variant="neutral" size="sm">{item.planType}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 bg-surface-muted rounded-xl border border-border">
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Start Date</span>
                  <span className="text-sm font-mono text-text">{item.startDate}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">End Date</span>
                  <span className="text-sm font-mono text-text">{item.endDate}</span>
                </div>
              </div>
            </div>
          )
        )}

        {/* Feedback View */}
        {type === "feedback" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-surface-muted rounded-xl border border-border">
              <div>
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Student</span>
                <span className="text-base font-bold text-text">{item.studentName}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Rating</span>
                <span className="text-amber-500 font-bold text-lg">
                  {"★".repeat(item.rating)}{"☆".repeat(Math.max(0, 5 - item.rating))}
                </span>
              </div>
            </div>
            <div className="p-4 bg-surface-muted rounded-xl border border-border">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">Feedback Remarks</span>
              <p className="text-sm text-text leading-relaxed">{item.comments}</p>
            </div>
          </div>
        )}

        {/* Bill View / Edit */}
        {type === "bill" && (
          isEditing ? (
            <form onSubmit={handleSubmitBill(onSubmitBill)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Student Name" error={billErrors.studentName?.message} required>
                  <Input {...registerBill("studentName")} />
                </FormField>
                <FormField label="Student ID" error={billErrors.studentId?.message} required>
                  <Input {...registerBill("studentId")} className="font-mono" />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Amount (BDT ৳)" error={billErrors.amount?.message} required>
                  <Input type="number" min={0} {...registerBill("amount", { valueAsNumber: true })} className="font-mono" />
                </FormField>
                <FormField label="Month" error={billErrors.month?.message} required>
                  <Input {...registerBill("month")} />
                </FormField>
              </div>

              <FormField label="Due Date" error={billErrors.dueDate?.message} required>
                <Input type="date" {...registerBill("dueDate")} className="font-mono" />
              </FormField>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button type="submit" variant="primary" loading={isPending} leftIcon={<Pencil size={14} />}>
                  Save Bill
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-surface-muted rounded-xl border border-border">
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Student</span>
                  <span className="text-base font-bold text-text">{item.studentName}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Student ID</span>
                  <span className="text-base font-mono text-text">{item.studentId}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Total Amount</span>
                  <span className="text-xl font-bold font-mono text-gold">
                    ৳{Number(item.amount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-surface-muted rounded-xl border border-border items-center">
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Month</span>
                  <span className="text-sm font-semibold text-text">{item.month}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Due Date</span>
                  <span className="text-sm font-mono text-text">{item.dueDate}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">Status</span>
                  <button
                    onClick={() => {
                      const newStatus = item.status === "paid" ? "unpaid" : "paid";
                      toggleBillStatusMutation.mutate({ id: item._id || item.id, status: newStatus });
                    }}
                    className="cursor-pointer"
                  >
                    <Badge variant={item.status === "paid" ? "success" : "danger"} size="sm">
                      {item.status === "paid" ? <ToggleRight size={13} className="inline mr-1" /> : <ToggleLeft size={13} className="inline mr-1" />}
                      {item.status}
                    </Badge>
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </Card>
    </div>
  );
}
