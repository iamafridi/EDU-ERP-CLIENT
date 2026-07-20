"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Bus, MapPin, DollarSign, CheckCircle2, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import Link from "next/link";

const vehicleSchema = zod.object({
  vehicleNumber: zod.string().min(3, "Vehicle number is required"),
  type: zod.enum(["Bus", "Van", "Car", "Auto"]),
  capacity: zod.string().min(1, "Capacity must be at least 1"),
  driverName: zod.string().min(3, "Driver name is required"),
  status: zod.enum(["active", "maintenance", "retired"]),
});

const routeSchema = zod.object({
  routeName: zod.string().min(3, "Route name is required"),
  vehicleNumber: zod.string().min(3, "Vehicle number is required"),
  stops: zod.string().min(5, "Stops are required"),
  schedule: zod.string().min(3, "Schedule is required"),
});

const feeSchema = zod.object({
  routeName: zod.string().min(3, "Route name is required"),
  studentType: zod.enum(["Regular", "Staff", "Guest"]),
  amount: zod.string().min(1, "Amount is required"),
  semester: zod.string().min(3, "Semester is required"),
});

type CreateType = "vehicle" | "route" | "fee";

type FormValues = zod.infer<typeof vehicleSchema> | zod.infer<typeof routeSchema> | zod.infer<typeof feeSchema>;

const tabs = [
  { key: "vehicle" as CreateType, label: "Vehicle", icon: Bus },
  { key: "route" as CreateType, label: "Route", icon: MapPin },
  { key: "fee" as CreateType, label: "Fee", icon: DollarSign },
];

export default function NewTransportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");

  const [createType, setCreateType] = useState<CreateType>(
    (searchParams.get("type") as CreateType) || "vehicle"
  );

  useEffect(() => {
    const t = searchParams.get("type") as CreateType | null;
    if (t && ["vehicle", "route", "fee"].includes(t)) {
      setCreateType(t);
    }
  }, [searchParams]);

  const canManage = roleIs("domain-admin", "super-admin");

  if (!canManage) {
    router.push("/transport");
    return null;
  }

  const createVehicleMutation = useMutation({
    mutationFn: api.createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setSuccessMsg("Vehicle registered successfully.");
      setTimeout(() => router.push("/transport"), 1500);
    },
  });

  const createRouteMutation = useMutation({
    mutationFn: api.createTransportRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transportRoutes"] });
      setSuccessMsg("Route created successfully.");
      setTimeout(() => router.push("/transport"), 1500);
    },
  });

  const createFeeMutation = useMutation({
    mutationFn: api.createTransportFee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transportFees"] });
      setSuccessMsg("Transport fee created successfully.");
      setTimeout(() => router.push("/transport"), 1500);
    },
  });

  const schema = createType === "vehicle" ? vehicleSchema : createType === "route" ? routeSchema : feeSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: createType === "vehicle"
      ? { vehicleNumber: "", type: "Bus", capacity: "50", driverName: "", status: "active" }
      : createType === "route"
        ? { routeName: "", vehicleNumber: "", stops: "", schedule: "" }
        : { routeName: "", studentType: "Regular", amount: "5000", semester: "Fall 2026" },
  });

  const onSubmit = (values: FormValues) => {
    if (createType === "vehicle") {
      const v = values as zod.infer<typeof vehicleSchema>;
      createVehicleMutation.mutate({ ...v, capacity: parseInt(v.capacity) });
    } else if (createType === "route") {
      createRouteMutation.mutate(values);
    } else {
      const f = values as zod.infer<typeof feeSchema>;
      createFeeMutation.mutate({ ...f, amount: parseFloat(f.amount) });
    }
  };

  const isPending = createVehicleMutation.isPending || createRouteMutation.isPending || createFeeMutation.isPending;

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/transport" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Bus className="text-[#2563EB]" />
            Add New
          </h1>
          <p className="text-xs text-slate-400 mt-1">Create a new transport record.</p>
        </div>
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

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm max-w-lg">
        <div className="flex border-b border-[#e1e2ed]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCreateType(tab.key)}
              className={`flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                createType === tab.key
                  ? "border-[#2563EB] text-[#2563EB] bg-blue-50/30"
                  : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {createType === "vehicle" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Vehicle Number</label>
                  <input type="text" {...register("vehicleNumber")} placeholder="e.g. UP-14-AT-1234"
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono uppercase" />
                  {errors.vehicleNumber && <span className="text-[10px] text-red-500 font-semibold block">{(errors.vehicleNumber as any).message}</span>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Type</label>
                  <select {...register("type")}
                    className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                    <option value="Bus">Bus</option>
                    <option value="Van">Van</option>
                    <option value="Car">Car</option>
                    <option value="Auto">Auto</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Capacity (Seats)</label>
                  <input type="number" {...register("capacity")} placeholder="50"
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono" />
                  {errors.capacity && <span className="text-[10px] text-red-500 font-semibold block">{(errors.capacity as any).message}</span>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Driver Name</label>
                  <input type="text" {...register("driverName")} placeholder="e.g. Rajesh Kumar"
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
                  {errors.driverName && <span className="text-[10px] text-red-500 font-semibold block">{(errors.driverName as any).message}</span>}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Status</label>
                <select {...register("status")}
                  className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
            </>
          )}

          {createType === "route" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Route Name</label>
                  <input type="text" {...register("routeName")} placeholder="e.g. Route A - North Campus"
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
                  {errors.routeName && <span className="text-[10px] text-red-500 font-semibold block">{(errors.routeName as any).message}</span>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Vehicle Number</label>
                  <input type="text" {...register("vehicleNumber")} placeholder="e.g. UP-14-AT-1234"
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono uppercase" />
                  {errors.vehicleNumber && <span className="text-[10px] text-red-500 font-semibold block">{(errors.vehicleNumber as any).message}</span>}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Stops (comma separated)</label>
                <textarea {...register("stops")} placeholder="e.g. Main Gate, Library, Admin Block"
                  className="w-full h-20 px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all resize-none" />
                {errors.stops && <span className="text-[10px] text-red-500 font-semibold block">{(errors.stops as any).message}</span>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Schedule</label>
                <input type="text" {...register("schedule")} placeholder="e.g. 07:30 AM - 08:30 AM"
                  className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
                {errors.schedule && <span className="text-[10px] text-red-500 font-semibold block">{(errors.schedule as any).message}</span>}
              </div>
            </>
          )}

          {createType === "fee" && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Route Name</label>
                <input type="text" {...register("routeName")} placeholder="e.g. Route A - North Campus"
                  className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
                {errors.routeName && <span className="text-[10px] text-red-500 font-semibold block">{(errors.routeName as any).message}</span>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Student Type</label>
                  <select {...register("studentType")}
                    className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                    <option value="Regular">Regular</option>
                    <option value="Staff">Staff</option>
                    <option value="Guest">Guest</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Amount (Rs.)</label>
                  <input type="number" {...register("amount")} placeholder="5000"
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Semester</label>
                <input type="text" {...register("semester")} placeholder="e.g. Fall 2026"
                  className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
            <Link href="/transport"
              className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors inline-flex items-center">
              Cancel
            </Link>
            <button type="submit" disabled={isPending}
              className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
              {createType === "vehicle" ? <Bus size={14} /> : createType === "route" ? <MapPin size={14} /> : <DollarSign size={14} />}
              {createType === "vehicle" ? "Register Vehicle" : createType === "route" ? "Create Route" : "Set Fee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
