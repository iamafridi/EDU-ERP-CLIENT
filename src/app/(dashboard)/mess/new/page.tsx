"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { UtensilsCrossed, Plus, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import Link from "next/link";

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

export default function NewMessEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as "menu" | "meal-plan" | "feedback" | "bill") || "menu";
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<"menu" | "meal-plan" | "feedback" | "bill">(initialType);
  const [successMsg, setSuccessMsg] = useState("");

  const canManage = roleIs("domain-admin", "super-admin") || user?.staffSubRole === "mess-manager" || user?.staffSubRole === "accountant";

  if (!canManage) {
    router.push("/mess");
    return null;
  }

  const createMenuMutation = useMutation({
    mutationFn: api.createMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setSuccessMsg("Menu item created successfully.");
      setTimeout(() => router.push("/mess"), 1500);
    },
  });

  const createMealPlanMutation = useMutation({
    mutationFn: api.createMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
      setSuccessMsg("Meal plan created successfully.");
      setTimeout(() => router.push("/mess"), 1500);
    },
  });

  const createFeedbackMutation = useMutation({
    mutationFn: api.createMessFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messFeedback"] });
      setSuccessMsg("Feedback submitted successfully.");
      setTimeout(() => router.push("/mess"), 1500);
    },
  });

  const createBillMutation = useMutation({
    mutationFn: api.createMessBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messBills"] });
      setSuccessMsg("Bill created successfully.");
      setTimeout(() => router.push("/mess"), 1500);
    },
  });

  const {
    register: registerMenu,
    handleSubmit: handleSubmitMenu,
    formState: { errors: menuErrors },
  } = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: { day: "Monday", mealType: "Breakfast", items: "" },
  });

  const {
    register: registerMealPlan,
    handleSubmit: handleSubmitMealPlan,
    formState: { errors: mealPlanErrors },
  } = useForm<MealPlanFormValues>({
    resolver: zodResolver(mealPlanSchema),
    defaultValues: { studentName: "", studentId: "", planType: "Vegetarian", startDate: "", endDate: "" },
  });

  const {
    register: registerFeedback,
    handleSubmit: handleSubmitFeedback,
    formState: { errors: feedbackErrors },
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { studentName: "", rating: 4, comments: "" },
  });

  const {
    register: registerBill,
    handleSubmit: handleSubmitBill,
    formState: { errors: billErrors },
  } = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: { studentName: "", studentId: "", amount: 0, month: "", dueDate: "" },
  });

  const onSubmitMenu = (values: MenuFormValues) => createMenuMutation.mutate(values);
  const onSubmitMealPlan = (values: MealPlanFormValues) => createMealPlanMutation.mutate(values);
  const onSubmitFeedback = (values: FeedbackFormValues) => createFeedbackMutation.mutate(values);
  const onSubmitBill = (values: BillFormValues) => createBillMutation.mutate(values);

  const inputClass = "w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all";
  const selectClass = "w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all";
  const labelClass = "text-xs font-semibold text-slate-500";
  const errorClass = "text-[10px] text-red-500 font-semibold block";

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/mess" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <UtensilsCrossed className="text-[#2563EB]" />
            New Mess Entry
          </h1>
          <p className="text-xs text-slate-400 mt-1">Create a new menu item, meal plan, feedback, or bill.</p>
        </div>
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm max-w-lg">
        <div className="p-4 border-b border-[#e1e2ed] bg-slate-50">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Entry Type</label>
          <div className="flex gap-2 flex-wrap">
            {([
              { key: "menu" as const, label: "Menu" },
              { key: "meal-plan" as const, label: "Meal Plan" },
              { key: "feedback" as const, label: "Feedback" },
              { key: "bill" as const, label: "Bill" },
            ]).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSelectedType(opt.key)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  selectedType === opt.key
                    ? "bg-[#2563EB] text-white"
                    : "bg-white border border-[#c3c6d7] text-slate-500 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {selectedType === "menu" && (
          <form onSubmit={handleSubmitMenu(onSubmitMenu)} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Day</label>
                <select {...registerMenu("day")} className={selectClass}>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Meal Type</label>
                <select {...registerMenu("mealType")} className={selectClass}>
                  {["Breakfast", "Lunch", "Dinner", "Snacks"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Menu Items</label>
              <input type="text" {...registerMenu("items")} placeholder="e.g. Biryani, Raita, Salad" className={inputClass} />
              {menuErrors.items && <span className={errorClass}>{menuErrors.items.message}</span>}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
              <Link href="/mess" className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors inline-flex items-center">Cancel</Link>
              <button type="submit" disabled={createMenuMutation.isPending} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <Plus size={14} /> Add Menu Item
              </button>
            </div>
          </form>
        )}

        {selectedType === "meal-plan" && (
          <form onSubmit={handleSubmitMealPlan(onSubmitMealPlan)} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Student Name</label>
                <input type="text" {...registerMealPlan("studentName")} placeholder="e.g. Ahmed Khan" className={inputClass} />
                {mealPlanErrors.studentName && <span className={errorClass}>{mealPlanErrors.studentName.message}</span>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Student ID</label>
                <input type="text" {...registerMealPlan("studentId")} placeholder="e.g. STU-001" className={`${inputClass} font-mono`} />
                {mealPlanErrors.studentId && <span className={errorClass}>{mealPlanErrors.studentId.message}</span>}
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Plan Type</label>
              <select {...registerMealPlan("planType")} className={selectClass}>
                {["Vegetarian", "Non-Vegetarian", "Vegan", "Diabetic"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Start Date</label>
                <input type="date" {...registerMealPlan("startDate")} className={`${inputClass} font-mono`} />
                {mealPlanErrors.startDate && <span className={errorClass}>{mealPlanErrors.startDate.message}</span>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>End Date</label>
                <input type="date" {...registerMealPlan("endDate")} className={`${inputClass} font-mono`} />
                {mealPlanErrors.endDate && <span className={errorClass}>{mealPlanErrors.endDate.message}</span>}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
              <Link href="/mess" className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors inline-flex items-center">Cancel</Link>
              <button type="submit" disabled={createMealPlanMutation.isPending} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <Plus size={14} /> Create Plan
              </button>
            </div>
          </form>
        )}

        {selectedType === "feedback" && (
          <form onSubmit={handleSubmitFeedback(onSubmitFeedback)} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Student Name</label>
                <input type="text" {...registerFeedback("studentName")} placeholder="e.g. Sara Malik" className={inputClass} />
                {feedbackErrors.studentName && <span className={errorClass}>{feedbackErrors.studentName.message}</span>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Rating (1-5)</label>
                <input type="number" min={1} max={5} {...registerFeedback("rating", { valueAsNumber: true })} placeholder="4" className={`${inputClass} font-mono`} />
                {feedbackErrors.rating && <span className={errorClass}>{feedbackErrors.rating.message}</span>}
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Comments</label>
              <textarea {...registerFeedback("comments")} placeholder="Share your feedback about the mess food..." className="w-full h-24 px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all resize-none" />
              {feedbackErrors.comments && <span className={errorClass}>{feedbackErrors.comments.message}</span>}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
              <Link href="/mess" className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors inline-flex items-center">Cancel</Link>
              <button type="submit" disabled={createFeedbackMutation.isPending} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <Plus size={14} /> Submit Feedback
              </button>
            </div>
          </form>
        )}

        {selectedType === "bill" && (
          <form onSubmit={handleSubmitBill(onSubmitBill)} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Student Name</label>
                <input type="text" {...registerBill("studentName")} placeholder="e.g. Ahmed Khan" className={inputClass} />
                {billErrors.studentName && <span className={errorClass}>{billErrors.studentName.message}</span>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Student ID</label>
                <input type="text" {...registerBill("studentId")} placeholder="e.g. STU-001" className={`${inputClass} font-mono`} />
                {billErrors.studentId && <span className={errorClass}>{billErrors.studentId.message}</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Amount (Rs.)</label>
                <input type="number" {...registerBill("amount", { valueAsNumber: true })} placeholder="2500" className={`${inputClass} font-mono`} />
                {billErrors.amount && <span className={errorClass}>{billErrors.amount.message}</span>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Month</label>
                <input type="text" {...registerBill("month")} placeholder="e.g. July 2026" className={inputClass} />
                {billErrors.month && <span className={errorClass}>{billErrors.month.message}</span>}
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Due Date</label>
              <input type="date" {...registerBill("dueDate")} className={`${inputClass} font-mono`} />
              {billErrors.dueDate && <span className={errorClass}>{billErrors.dueDate.message}</span>}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
              <Link href="/mess" className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors inline-flex items-center">Cancel</Link>
              <button type="submit" disabled={createBillMutation.isPending} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <Plus size={14} /> Generate Bill
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
