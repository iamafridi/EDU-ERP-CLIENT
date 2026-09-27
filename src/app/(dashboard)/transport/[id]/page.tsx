"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import {
  Bus,
  MapPin,
  DollarSign,
  ArrowLeft,
  Pencil,
  Trash2,
  CheckCircle2,
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

export default function TransportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const canManage = roleIs("domain-admin", "super-admin");

  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery<any[]>({
    queryKey: ["vehicles"],
    queryFn: api.getVehicles,
  });

  const { data: routes = [], isLoading: isLoadingRoutes } = useQuery<any[]>({
    queryKey: ["transportRoutes"],
    queryFn: api.getTransportRoutes,
  });

  const { data: fees = [], isLoading: isLoadingFees } = useQuery<any[]>({
    queryKey: ["transportFees"],
    queryFn: api.getTransportFees,
  });

  const vehicle = vehicles.find((v: any) => v.id === params.id || v._id === params.id);
  const route = routes.find((r: any) => r.id === params.id || r._id === params.id);
  const fee = fees.find((f: any) => f.id === params.id || f._id === params.id);

  const entryType = vehicle ? "vehicle" : route ? "route" : fee ? "fee" : null;
  const entry = vehicle || route || fee || null;

  const schema = entryType === "vehicle" ? vehicleSchema : entryType === "route" ? routeSchema : feeSchema;

  const updateVehicleMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateVehicle(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setSuccessMsg("Vehicle updated successfully.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const updateRouteMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateTransportRoute(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transportRoutes"] });
      setSuccessMsg("Route updated successfully.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const updateFeeMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateTransportFee(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transportFees"] });
      setSuccessMsg("Fee updated successfully.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: api.deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      router.push("/transport");
    },
  });

  const deleteRouteMutation = useMutation({
    mutationFn: api.deleteTransportRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transportRoutes"] });
      router.push("/transport");
    },
  });

  const deleteFeeMutation = useMutation({
    mutationFn: api.deleteTransportFee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transportFees"] });
      router.push("/transport");
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (entry && entryType) {
      if (entryType === "vehicle") {
        reset({
          vehicleNumber: entry.vehicleNumber || "",
          type: entry.type || "Bus",
          capacity: String(entry.capacity || 0),
          driverName: entry.driverName || "",
          status: entry.status || "active",
        });
      } else if (entryType === "route") {
        reset({
          routeName: entry.routeName || "",
          vehicleNumber: entry.vehicleNumber || "",
          stops: entry.stops || "",
          schedule: entry.schedule || "",
        });
      } else {
        reset({
          routeName: entry.routeName || "",
          studentType: entry.studentType || "Regular",
          amount: String(entry.amount || 0),
          semester: entry.semester || "",
        });
      }
    }
  }, [entry, entryType, reset]);

  const onSubmit = (values: any) => {
    if (!entry || !entryType) return;
    const targetId = entry._id || entry.id;
    if (entryType === "vehicle") {
      updateVehicleMutation.mutate({ id: targetId, payload: { ...values, capacity: parseInt(values.capacity, 10) } });
    } else if (entryType === "route") {
      updateRouteMutation.mutate({ id: targetId, payload: values });
    } else {
      updateFeeMutation.mutate({ id: targetId, payload: { ...values, amount: parseFloat(values.amount) } });
    }
  };

  const handleDelete = () => {
    if (!entry || !entryType) return;
    if (confirm("Are you sure you want to delete this record? This action cannot be undone.")) {
      const targetId = entry._id || entry.id;
      if (entryType === "vehicle") deleteVehicleMutation.mutate(targetId);
      else if (entryType === "route") deleteRouteMutation.mutate(targetId);
      else deleteFeeMutation.mutate(targetId);
    }
  };

  const isPending =
    updateVehicleMutation.isPending ||
    updateRouteMutation.isPending ||
    updateFeeMutation.isPending ||
    deleteVehicleMutation.isPending ||
    deleteRouteMutation.isPending ||
    deleteFeeMutation.isPending;

  if (isLoadingVehicles || isLoadingRoutes || isLoadingFees) {
    return (
      <div className="p-12 text-center text-text-muted">
        <p className="text-sm">Loading transit record details...</p>
      </div>
    );
  }

  if (!entry || !entryType) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-sm text-text-muted">Transit record not found or has been removed.</p>
        <Link href="/transport">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>
            Back to Transit
          </Button>
        </Link>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    vehicle: "Fleet Vehicle",
    route: "Transit Route",
    fee: "Transport Fee Tariff",
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      <PageHeader
        title={
          entryType === "vehicle"
            ? `Vehicle ${entry.vehicleNumber}`
            : entryType === "route"
            ? entry.routeName
            : `${entry.routeName} (${entry.studentType})`
        }
        subtitle={`${typeLabels[entryType]} specifications and configuration`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/transport">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>
                Transit
              </Button>
            </Link>
            {canManage && (
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
                    onClick={() => {
                      setIsEditing(false);
                      reset();
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Trash2 size={14} />}
                  onClick={handleDelete}
                  loading={isPending}
                >
                  Delete
                </Button>
              </>
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

      <Card
        title={isEditing ? `Edit ${typeLabels[entryType]}` : `${typeLabels[entryType]} Information`}
        subtitle="Manage fleet configuration and route schedules"
      >
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {entryType === "vehicle" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Vehicle Number" error={(errors.vehicleNumber as any)?.message} required>
                    <Input {...register("vehicleNumber")} className="font-mono uppercase" />
                  </FormField>
                  <FormField label="Type" required>
                    <Select {...register("type")}>
                      <option value="Bus">Bus</option>
                      <option value="Van">Van</option>
                      <option value="Car">Car</option>
                      <option value="Auto">Auto</option>
                    </Select>
                  </FormField>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Capacity (Seats)" error={(errors.capacity as any)?.message} required>
                    <Input type="number" min={1} {...register("capacity")} className="font-mono" />
                  </FormField>
                  <FormField label="Driver Full Name" error={(errors.driverName as any)?.message} required>
                    <Input {...register("driverName")} />
                  </FormField>
                </div>
                <FormField label="Operational Status" required>
                  <Select {...register("status")}>
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                  </Select>
                </FormField>
              </>
            )}

            {entryType === "route" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Route Name" error={(errors.routeName as any)?.message} required>
                    <Input {...register("routeName")} />
                  </FormField>
                  <FormField label="Vehicle Number" error={(errors.vehicleNumber as any)?.message} required>
                    <Input {...register("vehicleNumber")} className="font-mono uppercase" />
                  </FormField>
                </div>
                <FormField label="Stops (Comma-separated)" error={(errors.stops as any)?.message} required>
                  <Textarea {...register("stops")} rows={3} />
                </FormField>
                <FormField label="Schedule" error={(errors.schedule as any)?.message} required>
                  <Input {...register("schedule")} />
                </FormField>
              </>
            )}

            {entryType === "fee" && (
              <>
                <FormField label="Route Name" error={(errors.routeName as any)?.message} required>
                  <Input {...register("routeName")} />
                </FormField>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Student Type" required>
                    <Select {...register("studentType")}>
                      <option value="Regular">Regular</option>
                      <option value="Staff">Staff</option>
                      <option value="Guest">Guest</option>
                    </Select>
                  </FormField>
                  <FormField label="Amount (BDT ৳)" error={(errors.amount as any)?.message} required>
                    <Input type="number" min={0} {...register("amount")} className="font-mono" />
                  </FormField>
                </div>
                <FormField label="Semester" error={(errors.semester as any)?.message} required>
                  <Input {...register("semester")} />
                </FormField>
              </>
            )}

            <div className="flex justify-end pt-4 border-t border-border">
              <Button type="submit" variant="primary" loading={isPending} leftIcon={<Pencil size={14} />}>
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {entryType === "vehicle" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface-muted rounded-xl border border-border">
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Vehicle</span>
                  <span className="text-base font-bold font-mono text-text">{entry.vehicleNumber}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Type</span>
                  <Badge variant="neutral" size="sm">{entry.type}</Badge>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Capacity</span>
                  <span className="text-base font-mono font-bold text-text">{entry.capacity} Seats</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Status</span>
                  <Badge
                    variant={entry.status === "active" ? "success" : entry.status === "maintenance" ? "warning" : "neutral"}
                    size="sm"
                  >
                    {entry.status}
                  </Badge>
                </div>
              </div>
            )}

            {entryType === "route" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-surface-muted rounded-xl border border-border">
                  <div>
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Route</span>
                    <span className="text-base font-bold text-text">{entry.routeName}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Vehicle Assigned</span>
                    <span className="text-base font-mono font-bold text-gold">{entry.vehicleNumber}</span>
                  </div>
                </div>
                <div className="p-4 bg-surface-muted rounded-xl border border-border">
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">Stops</span>
                  <p className="text-sm font-medium text-text">{entry.stops}</p>
                </div>
                <div className="p-4 bg-surface-muted rounded-xl border border-border">
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">Schedule</span>
                  <p className="text-sm font-mono text-text">{entry.schedule}</p>
                </div>
              </div>
            )}

            {entryType === "fee" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-surface-muted rounded-xl border border-border">
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Route</span>
                  <span className="text-base font-bold text-text">{entry.routeName}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Passenger</span>
                  <Badge variant="neutral" size="sm">{entry.studentType}</Badge>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Fee Amount</span>
                  <span className="text-xl font-bold font-mono text-gold">
                    ৳{Number(entry.amount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
