"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { UtensilsCrossed, ArrowLeft, Pencil, Trash2, CheckCircle2 } from "lucide-react";
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

  const canManage = roleIs("domain-admin", "super-admin") || user?.staffSubRole === "mess-manager" || user?.staffSubRole === "accountant";

  const { data: menus = [] } = useQuery({ queryKey: ["menus"], queryFn: api.getMenus });
  const { data: mealPlans = [] } = useQuery({ queryKey: ["mealPlans"], queryFn: api.getMealPlans });
  const { data: feedbackData = [] } = useQuery({ queryKey: ["messFeedback"], queryFn: api.getMessFeedback });
  const { data: bills = [] } = useQuery({ queryKey: ["messBills"], queryFn: api.getMessBills });

  const item = type === "menu"
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
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateMealPlanMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateMealPlan(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
      setSuccessMsg("Meal plan updated.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateBillMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateMessBill(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messBills"] });
      setSuccessMsg("Bill updated.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const toggleBillStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.updateMessBill(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messBills"] });
      setSuccessMsg("Bill status updated.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteMenuMutation = useMutation({
    mutationFn: api.deleteMenu,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["menus"] }); router.push("/mess"); },
  });

  const deleteMealPlanMutation = useMutation({
    mutationFn: api.deleteMealPlan,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["mealPlans"] }); router.push("/mess"); },
  });

  const deleteFeedbackMutation = useMutation({
    mutationFn: api.deleteMessFeedback,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["messFeedback"] }); router.push("/mess"); },
  });

  const deleteBillMutation = useMutation({
    mutationFn: api.deleteMessBill,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["messBills"] }); router.push("/mess"); },
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
    if (!item || !confirm("Delete this record?")) return;
    const id = item._id || item.id;
    if (type === "menu") deleteMenuMutation.mutate(id);
    else if (type === "meal-plan") deleteMealPlanMutation.mutate(id);
    else if (type === "feedback") deleteFeedbackMutation.mutate(id);
    else deleteBillMutation.mutate(id);
  };

  const inputClass = "w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all";
  const selectClass = "w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all";
  const labelClass = "text-xs font-semibold text-slate-500";
  const errorClass = "text-[10px] text-red-500 font-semibold block";
  const detailLabelClass = "text-xs font-semibold text-slate-400 uppercase block mb-1";

  const titleMap: Record<string, string> = {
    menu: "Menu Item Details",
    "meal-plan": "Meal Plan Details",
    feedback: "Feedback Details",
    bill: "Mess Bill Details",
  };

  if (!item) {
    return (
      <div className="p-12 text-center">
        <p className="text-xs text-slate-400">Record not found.</p>
        <Link href="/mess" className="text-xs text-[#2563EB] hover:underline mt-2 inline-block">Back to Mess</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/mess" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <UtensilsCrossed className="text-[#2563EB]" />
            {titleMap[type]}
          </h1>
        </div>
        {canManage && type !== "feedback" && (
          <div className="flex gap-2">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer">
                <Pencil size={14} /> Edit
              </button>
            ) : (
              <button onClick={() => { setIsEditing(false); if (type === "menu") resetMenu(); else if (type === "meal-plan") resetMealPlan(); else if (type === "bill") resetBill(); }}
                className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer">
                Cancel
              </button>
            )}
            <button onClick={handleDelete} className="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
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
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{titleMap[type]}</span>
        </div>

        {type === "menu" && isEditing && (
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
              <label className={labelClass}>Items</label>
              <input type="text" {...registerMenu("items")} className={inputClass} />
              {menuErrors.items && <span className={errorClass}>{menuErrors.items.message}</span>}
            </div>
            <div className="flex justify-end pt-4 border-t border-[#e1e2ed]">
              <button type="submit" disabled={updateMenuMutation.isPending} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <Pencil size={14} /> Update Menu
              </button>
            </div>
          </form>
        )}

        {type === "menu" && !isEditing && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className={detailLabelClass}>Day</label><p className="text-sm font-semibold text-slate-800">{item.day}</p></div>
              <div><label className={detailLabelClass}>Meal Type</label><p className="text-sm font-semibold text-slate-800">{item.mealType}</p></div>
              <div className="col-span-2"><label className={detailLabelClass}>Items</label><p className="text-sm text-slate-600">{item.items}</p></div>
              {item.date && <div><label className={detailLabelClass}>Date</label><p className="text-sm font-mono text-slate-600">{item.date}</p></div>}
            </div>
          </div>
        )}

        {type === "meal-plan" && isEditing && (
          <form onSubmit={handleSubmitMealPlan(onSubmitMealPlan)} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Student Name</label>
                <input type="text" {...registerMealPlan("studentName")} className={inputClass} />
                {mealPlanErrors.studentName && <span className={errorClass}>{mealPlanErrors.studentName.message}</span>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Student ID</label>
                <input type="text" {...registerMealPlan("studentId")} className={`${inputClass} font-mono`} />
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
            <div className="flex justify-end pt-4 border-t border-[#e1e2ed]">
              <button type="submit" disabled={updateMealPlanMutation.isPending} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <Pencil size={14} /> Update Plan
              </button>
            </div>
          </form>
        )}

        {type === "meal-plan" && !isEditing && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className={detailLabelClass}>Student Name</label><p className="text-sm font-semibold text-slate-800">{item.studentName}</p></div>
              <div><label className={detailLabelClass}>Student ID</label><p className="text-sm font-mono text-slate-600">{item.studentId}</p></div>
              <div><label className={detailLabelClass}>Plan Type</label><p className="text-sm text-slate-600">{item.planType}</p></div>
              <div><label className={detailLabelClass}>Status</label>
                <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${
                  item.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                }`}>{item.status || "active"}</span>
              </div>
              <div><label className={detailLabelClass}>Start Date</label><p className="text-sm font-mono text-slate-600">{item.startDate}</p></div>
              <div><label className={detailLabelClass}>End Date</label><p className="text-sm font-mono text-slate-600">{item.endDate}</p></div>
            </div>
          </div>
        )}

        {type === "feedback" && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className={detailLabelClass}>Student Name</label><p className="text-sm font-semibold text-slate-800">{item.studentName}</p></div>
              <div><label className={detailLabelClass}>Rating</label><p className="font-bold text-amber-500 text-lg">{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</p></div>
              <div className="col-span-2"><label className={detailLabelClass}>Comments</label><p className="text-sm text-slate-600">{item.comments}</p></div>
              {item.date && <div><label className={detailLabelClass}>Date</label><p className="text-sm font-mono text-slate-600">{item.date}</p></div>}
            </div>
          </div>
        )}

        {type === "bill" && isEditing && (
          <form onSubmit={handleSubmitBill(onSubmitBill)} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Student Name</label>
                <input type="text" {...registerBill("studentName")} className={inputClass} />
                {billErrors.studentName && <span className={errorClass}>{billErrors.studentName.message}</span>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Student ID</label>
                <input type="text" {...registerBill("studentId")} className={`${inputClass} font-mono`} />
                {billErrors.studentId && <span className={errorClass}>{billErrors.studentId.message}</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Amount (Rs.)</label>
                <input type="number" {...registerBill("amount", { valueAsNumber: true })} className={`${inputClass} font-mono`} />
                {billErrors.amount && <span className={errorClass}>{billErrors.amount.message}</span>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Month</label>
                <input type="text" {...registerBill("month")} className={inputClass} />
                {billErrors.month && <span className={errorClass}>{billErrors.month.message}</span>}
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Due Date</label>
              <input type="date" {...registerBill("dueDate")} className={`${inputClass} font-mono`} />
              {billErrors.dueDate && <span className={errorClass}>{billErrors.dueDate.message}</span>}
            </div>
            <div className="flex justify-end pt-4 border-t border-[#e1e2ed]">
              <button type="submit" disabled={updateBillMutation.isPending} className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <Pencil size={14} /> Update Bill
              </button>
            </div>
          </form>
        )}

        {type === "bill" && !isEditing && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className={detailLabelClass}>Student Name</label><p className="text-sm font-semibold text-slate-800">{item.studentName}</p></div>
              <div><label className={detailLabelClass}>Student ID</label><p className="text-sm font-mono text-slate-600">{item.studentId}</p></div>
              <div><label className={detailLabelClass}>Amount</label><p className="text-sm font-mono font-bold text-slate-800">Rs. {item.amount?.toLocaleString()}</p></div>
              <div><label className={detailLabelClass}>Month</label><p className="text-sm text-slate-600">{item.month}</p></div>
              <div><label className={detailLabelClass}>Due Date</label><p className="text-sm font-mono text-slate-600">{item.dueDate}</p></div>
              <div>
                <label className={detailLabelClass}>Status</label>
                <button
                  onClick={() => {
                    const newStatus = item.status === "paid" ? "unpaid" : "paid";
                    toggleBillStatusMutation.mutate({ id: item._id || item.id, status: newStatus });
                  }}
                  className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase cursor-pointer transition-colors hover:opacity-80 ${
                    item.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                  }`}
                >
                  {item.status === "paid" ? "Paid" : "Unpaid"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
