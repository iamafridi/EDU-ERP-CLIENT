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
import {
  PageHeader,
  Card,
  FormField,
  Input,
  Select,
  Textarea,
  Button,
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

export default function NewMessEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as "menu" | "meal-plan" | "feedback" | "bill") || "menu";
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<"menu" | "meal-plan" | "feedback" | "bill">(initialType);
  const [successMsg, setSuccessMsg] = useState("");

  const canManage =
    roleIs("domain-admin", "super-admin") ||
    user?.staffSubRole === "mess-manager" ||
    user?.staffSubRole === "accountant";

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
    defaultValues: { studentName: "", studentId: "", amount: 3500, month: "", dueDate: "" },
  });

  const onSubmitMenu = (values: MenuFormValues) => createMenuMutation.mutate(values);
  const onSubmitMealPlan = (values: MealPlanFormValues) => createMealPlanMutation.mutate(values);
  const onSubmitFeedback = (values: FeedbackFormValues) => createFeedbackMutation.mutate(values);
  const onSubmitBill = (values: BillFormValues) => createBillMutation.mutate(values);

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      <PageHeader
        title="New Mess Record"
        subtitle="Create a new dining menu item, student meal subscription, review, or billing invoice."
        actions={
          <Link href="/mess">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>
              Back to Mess
            </Button>
          </Link>
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

      {/* Entry Type Selector Tabs */}
      <div className="flex gap-2 p-1.5 bg-surface-muted rounded-xl border border-border w-fit">
        {([
          { key: "menu" as const, label: "Daily Menu" },
          { key: "meal-plan" as const, label: "Meal Plan" },
          { key: "feedback" as const, label: "Feedback Entry" },
          { key: "bill" as const, label: "Billing Invoice" },
        ]).map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setSelectedType(opt.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedType === opt.key
                ? "bg-surface text-gold shadow-sm border border-border"
                : "text-text-muted hover:text-text"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <Card
        title={
          selectedType === "menu"
            ? "Create Daily Menu Entry"
            : selectedType === "meal-plan"
            ? "Enroll Student in Meal Plan"
            : selectedType === "feedback"
            ? "Dining Quality Feedback"
            : "Generate Mess Billing Record (BDT ৳)"
        }
        subtitle="Fill in all the required institutional dining parameters"
      >
        {selectedType === "menu" && (
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

            <FormField label="Menu Items (Comma-separated dishes)" error={menuErrors.items?.message} required>
              <Input
                {...registerMenu("items")}
                placeholder="e.g. Steamed Rice, Chicken Roast, Daal Butter, Fresh Salad"
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Link href="/mess">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                loading={createMenuMutation.isPending}
                leftIcon={<Plus size={14} />}
              >
                Add Menu Item
              </Button>
            </div>
          </form>
        )}

        {selectedType === "meal-plan" && (
          <form onSubmit={handleSubmitMealPlan(onSubmitMealPlan)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Student Full Name" error={mealPlanErrors.studentName?.message} required>
                <Input {...registerMealPlan("studentName")} placeholder="e.g. Rafiq Ahmed" />
              </FormField>
              <FormField label="Student ID" error={mealPlanErrors.studentId?.message} required>
                <Input {...registerMealPlan("studentId")} placeholder="e.g. STU-2026-081" className="font-mono" />
              </FormField>
            </div>

            <FormField label="Dietary Plan Type" error={mealPlanErrors.planType?.message} required>
              <Select {...registerMealPlan("planType")}>
                {["Vegetarian", "Non-Vegetarian", "Vegan", "Diabetic"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Subscription Start Date" error={mealPlanErrors.startDate?.message} required>
                <Input type="date" {...registerMealPlan("startDate")} className="font-mono" />
              </FormField>
              <FormField label="Subscription End Date" error={mealPlanErrors.endDate?.message} required>
                <Input type="date" {...registerMealPlan("endDate")} className="font-mono" />
              </FormField>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Link href="/mess">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                loading={createMealPlanMutation.isPending}
                leftIcon={<Plus size={14} />}
              >
                Create Plan
              </Button>
            </div>
          </form>
        )}

        {selectedType === "feedback" && (
          <form onSubmit={handleSubmitFeedback(onSubmitFeedback)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Student Full Name" error={feedbackErrors.studentName?.message} required>
                <Input {...registerFeedback("studentName")} placeholder="e.g. Nusrat Jahan" />
              </FormField>
              <FormField label="Rating (1 to 5 Stars)" error={feedbackErrors.rating?.message} required>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  {...registerFeedback("rating", { valueAsNumber: true })}
                  className="font-mono"
                />
              </FormField>
            </div>

            <FormField label="Comments & Dietary Suggestions" error={feedbackErrors.comments?.message} required>
              <Textarea
                {...registerFeedback("comments")}
                placeholder="Share your dining experience, meal hygiene, and taste feedback..."
                rows={4}
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Link href="/mess">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                loading={createFeedbackMutation.isPending}
                leftIcon={<Plus size={14} />}
              >
                Submit Feedback
              </Button>
            </div>
          </form>
        )}

        {selectedType === "bill" && (
          <form onSubmit={handleSubmitBill(onSubmitBill)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Student Full Name" error={billErrors.studentName?.message} required>
                <Input {...registerBill("studentName")} placeholder="e.g. Tanvir Hossain" />
              </FormField>
              <FormField label="Student ID" error={billErrors.studentId?.message} required>
                <Input {...registerBill("studentId")} placeholder="e.g. STU-2026-042" className="font-mono" />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Billed Amount (BDT ৳)" error={billErrors.amount?.message} required>
                <Input
                  type="number"
                  min={0}
                  {...registerBill("amount", { valueAsNumber: true })}
                  className="font-mono"
                  placeholder="3500"
                />
              </FormField>
              <FormField label="Billing Month & Year" error={billErrors.month?.message} required>
                <Input {...registerBill("month")} placeholder="e.g. October 2026" />
              </FormField>
            </div>

            <FormField label="Payment Due Date" error={billErrors.dueDate?.message} required>
              <Input type="date" {...registerBill("dueDate")} className="font-mono" />
            </FormField>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Link href="/mess">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                loading={createBillMutation.isPending}
                leftIcon={<Plus size={14} />}
              >
                Generate Bill
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
