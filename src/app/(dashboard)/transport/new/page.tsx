"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Bus, MapPin, DollarSign, CheckCircle2, ArrowLeft, Plus } from "lucide-react";
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

type FormValues =
  | zod.infer<typeof vehicleSchema>
  | zod.infer<typeof routeSchema>
  | zod.infer<typeof feeSchema>;

const tabs = [
  { key: "vehicle" as CreateType, label: "Fleet Vehicle", icon: Bus },
  { key: "route" as CreateType, label: "Transit Route", icon: MapPin },
  { key: "fee" as CreateType, label: "Semester Fee (BDT ৳)", icon: DollarSign },
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
      setSuccessMsg("Transport fee structure created successfully.");
      setTimeout(() => router.push("/transport"), 1500);
    },
  });

  const schema = createType === "vehicle" ? vehicleSchema : createType === "route" ? routeSchema : feeSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues:
      createType === "vehicle"
        ? { vehicleNumber: "", type: "Bus", capacity: "50", driverName: "", status: "active" }
        : createType === "route"
        ? { routeName: "", vehicleNumber: "", stops: "", schedule: "" }
        : { routeName: "", studentType: "Regular", amount: "4500", semester: "Fall 2026" },
  });

  const onSubmit = (values: FormValues) => {
    if (createType === "vehicle") {
      const v = values as zod.infer<typeof vehicleSchema>;
      createVehicleMutation.mutate({ ...v, capacity: parseInt(v.capacity, 10) });
    } else if (createType === "route") {
      createRouteMutation.mutate(values);
    } else {
      const f = values as zod.infer<typeof feeSchema>;
      createFeeMutation.mutate({ ...f, amount: parseFloat(f.amount) });
    }
  };

  const isPending =
    createVehicleMutation.isPending ||
    createRouteMutation.isPending ||
    createFeeMutation.isPending;

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      <PageHeader
        title="Add Transit Record"
        subtitle="Register campus shuttles, configure commuter routes, or set semester transport fee tariffs in BDT (৳)."
        actions={
          <Link href="/transport">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>
              Back to Transit
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

      {/* Switcher Tabs */}
      <div className="flex gap-2 p-1.5 bg-surface-muted rounded-xl border border-border w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setCreateType(tab.key);
              reset();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              createType === tab.key
                ? "bg-surface text-gold shadow-sm border border-border"
                : "text-text-muted hover:text-text"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <Card
        title={
          createType === "vehicle"
            ? "Register New Campus Vehicle"
            : createType === "route"
            ? "Create Bus Route & Stops"
            : "Define Semester Transit Tariff (BDT ৳)"
        }
        subtitle="Institutional fleet operational parameters"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {createType === "vehicle" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Vehicle Number" error={(errors.vehicleNumber as any)?.message} required>
                  <Input
                    {...register("vehicleNumber")}
                    placeholder="e.g. DHAKA-METRO-GA-11-2233"
                    className="font-mono uppercase"
                  />
                </FormField>
                <FormField label="Vehicle Type" required>
                  <Select {...register("type")}>
                    <option value="Bus">Commuter Bus</option>
                    <option value="Van">Microbus / Van</option>
                    <option value="Car">Staff Car</option>
                    <option value="Auto">Shuttle Auto</option>
                  </Select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Passenger Capacity" error={(errors.capacity as any)?.message} required>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    {...register("capacity")}
                    placeholder="50"
                    className="font-mono"
                  />
                </FormField>
                <FormField label="Driver Full Name" error={(errors.driverName as any)?.message} required>
                  <Input {...register("driverName")} placeholder="e.g. Mofizul Islam" />
                </FormField>
              </div>

              <FormField label="Initial Status" required>
                <Select {...register("status")}>
                  <option value="active">Active & Operational</option>
                  <option value="maintenance">Under Maintenance</option>
                  <option value="retired">Standby / Retired</option>
                </Select>
              </FormField>
            </>
          )}

          {createType === "route" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Route Name" error={(errors.routeName as any)?.message} required>
                  <Input {...register("routeName")} placeholder="e.g. Route A — Mirpur to Campus" />
                </FormField>
                <FormField label="Assigned Vehicle Number" error={(errors.vehicleNumber as any)?.message} required>
                  <Input
                    {...register("vehicleNumber")}
                    placeholder="e.g. DHAKA-METRO-GA-11-2233"
                    className="font-mono uppercase"
                  />
                </FormField>
              </div>

              <FormField label="Transit Stops (Comma-separated)" error={(errors.stops as any)?.message} required>
                <Textarea
                  {...register("stops")}
                  placeholder="e.g. Mirpur 10, Kazipara, Farmgate, Shahbagh, Campus Gate 1"
                  rows={3}
                />
              </FormField>

              <FormField label="Schedule Timetable" error={(errors.schedule as any)?.message} required>
                <Input {...register("schedule")} placeholder="e.g. 07:15 AM departure, 04:30 PM return" />
              </FormField>
            </>
          )}

          {createType === "fee" && (
            <>
              <FormField label="Route Name" error={(errors.routeName as any)?.message} required>
                <Input {...register("routeName")} placeholder="e.g. Route A — Mirpur to Campus" />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Passenger Category" required>
                  <Select {...register("studentType")}>
                    <option value="Regular">Regular Student</option>
                    <option value="Staff">Faculty / Staff</option>
                    <option value="Guest">Guest / Intern</option>
                  </Select>
                </FormField>

                <FormField label="Semester Fee (BDT ৳)" error={(errors.amount as any)?.message} required>
                  <Input
                    type="number"
                    min={0}
                    step="50"
                    {...register("amount")}
                    placeholder="4500"
                    className="font-mono"
                  />
                </FormField>
              </div>

              <FormField label="Academic Semester" error={(errors.semester as any)?.message} required>
                <Input {...register("semester")} placeholder="e.g. Fall 2026" />
              </FormField>
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-border">
            <Link href="/transport">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              loading={isPending}
              leftIcon={<Plus size={15} />}
            >
              Create Record
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
