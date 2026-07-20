"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { Bus, MapPin, DollarSign, ArrowLeft, Pencil, Trash2, CheckCircle2 } from "lucide-react";
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

export default function TransportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const canManage = roleIs("domain-admin", "super-admin");

  const { data: vehicles = [] } = useQuery<any[]>({
    queryKey: ["vehicles"],
    queryFn: api.getVehicles,
  });

  const { data: routes = [] } = useQuery<any[]>({
    queryKey: ["transportRoutes"],
    queryFn: api.getTransportRoutes,
  });

  const { data: fees = [] } = useQuery<any[]>({
    queryKey: ["transportFees"],
    queryFn: api.getTransportFees,
  });

  const vehicle = vehicles.find((v: any) => v.id === params.id);
  const route = routes.find((r: any) => r.id === params.id);
  const fee = fees.find((f: any) => f.id === params.id);

  const entryType = vehicle ? "vehicle" : route ? "route" : fee ? "fee" : null;
  const entry = vehicle || route || fee || null;

  const schema = entryType === "vehicle" ? vehicleSchema : entryType === "route" ? routeSchema : feeSchema;

  const updateVehicleMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateVehicle(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setSuccessMsg("Vehicle updated successfully.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateRouteMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateTransportRoute(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transportRoutes"] });
      setSuccessMsg("Route updated successfully.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateFeeMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateTransportFee(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transportFees"] });
      setSuccessMsg("Fee updated successfully.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 4000);
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
    if (entryType === "vehicle") {
      updateVehicleMutation.mutate({ id: entry.id, payload: { ...values, capacity: parseInt(values.capacity) } });
    } else if (entryType === "route") {
      updateRouteMutation.mutate({ id: entry.id, payload: values });
    } else {
      updateFeeMutation.mutate({ id: entry.id, payload: { ...values, amount: parseFloat(values.amount) } });
    }
  };

  const handleDelete = () => {
    if (!entry || !entryType) return;
    if (confirm("Are you sure you want to delete this record?")) {
      if (entryType === "vehicle") deleteVehicleMutation.mutate(entry.id);
      else if (entryType === "route") deleteRouteMutation.mutate(entry.id);
      else deleteFeeMutation.mutate(entry.id);
    }
  };

  const renderDetails = () => {
    if (!entry) return null;
    if (entryType === "vehicle") {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Vehicle Number</label>
            <p className="text-sm font-mono font-bold text-slate-800">{entry.vehicleNumber}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Type</label>
            <p className="text-sm font-semibold text-slate-800">{entry.type}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Capacity</label>
            <p className="text-sm font-mono text-slate-600">{entry.capacity} seats</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Driver</label>
            <p className="text-sm font-semibold text-slate-800">{entry.driverName}</p>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Status</label>
            <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${
              entry.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
              entry.status === "maintenance" ? "bg-amber-50 text-amber-700 border-amber-100" :
              "bg-slate-50 text-slate-600 border-slate-200"
            }`}>{entry.status}</span>
          </div>
        </div>
      );
    }
    if (entryType === "route") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Route Name</label>
              <p className="text-sm font-bold text-slate-800">{entry.routeName}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Vehicle</label>
              <p className="text-sm font-mono text-slate-600">{entry.vehicleNumber}</p>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Stops</label>
            <p className="text-sm text-slate-600">{entry.stops}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Schedule</label>
            <p className="text-sm text-slate-600">{entry.schedule}</p>
          </div>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Route Name</label>
          <p className="text-sm font-bold text-slate-800">{entry.routeName}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Student Type</label>
          <p className="text-sm font-semibold text-slate-800">{entry.studentType}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Amount</label>
          <p className="text-sm font-mono font-bold text-slate-800">Rs. {entry.amount?.toLocaleString()}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Semester</label>
          <p className="text-sm text-slate-600">{entry.semester}</p>
        </div>
      </div>
    );
  };

  const renderEditForm = () => {
    if (!entry || !entryType) return null;
    if (entryType === "vehicle") {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Vehicle Number</label>
            <input type="text" {...register("vehicleNumber")}
              className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all uppercase" />
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
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Capacity</label>
            <input type="number" {...register("capacity")}
              className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
            {errors.capacity && <span className="text-[10px] text-red-500 font-semibold block">{(errors.capacity as any).message}</span>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Driver Name</label>
            <input type="text" {...register("driverName")}
              className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
            {errors.driverName && <span className="text-[10px] text-red-500 font-semibold block">{(errors.driverName as any).message}</span>}
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-semibold text-slate-500">Status</label>
            <select {...register("status")}
              className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>
          </div>
        </div>
      );
    }
    if (entryType === "route") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Route Name</label>
              <input type="text" {...register("routeName")}
                className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
              {errors.routeName && <span className="text-[10px] text-red-500 font-semibold block">{(errors.routeName as any).message}</span>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Vehicle Number</label>
              <input type="text" {...register("vehicleNumber")}
                className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] uppercase" />
              {errors.vehicleNumber && <span className="text-[10px] text-red-500 font-semibold block">{(errors.vehicleNumber as any).message}</span>}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Stops</label>
            <textarea {...register("stops")}
              className="w-full h-20 px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] resize-none" />
            {errors.stops && <span className="text-[10px] text-red-500 font-semibold block">{(errors.stops as any).message}</span>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Schedule</label>
            <input type="text" {...register("schedule")}
              className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
            {errors.schedule && <span className="text-[10px] text-red-500 font-semibold block">{(errors.schedule as any).message}</span>}
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500">Route Name</label>
          <input type="text" {...register("routeName")}
            className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
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
            <input type="number" {...register("amount")}
              className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500">Semester</label>
          <input type="text" {...register("semester")}
            className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]" />
        </div>
      </div>
    );
  };

  const getIcon = () => {
    if (entryType === "vehicle") return <Bus className="text-[#2563EB]" />;
    if (entryType === "route") return <MapPin className="text-[#2563EB]" />;
    return <DollarSign className="text-[#2563EB]" />;
  };

  const getTitle = () => {
    if (!entry) return "Not Found";
    if (entryType === "vehicle") return entry.vehicleNumber;
    if (entryType === "route") return entry.routeName;
    return `${entry.routeName} - ${entry.studentType}`;
  };

  const getTypeLabel = () => {
    if (entryType === "vehicle") return "Vehicle Details";
    if (entryType === "route") return "Route Details";
    return "Fee Details";
  };

  const isPending =
    updateVehicleMutation.isPending ||
    updateRouteMutation.isPending ||
    updateFeeMutation.isPending;

  if (!entry || !entryType) {
    return (
      <div className="p-12 text-center">
        <p className="text-xs text-slate-400">Record not found.</p>
        <Link href="/transport" className="text-xs text-[#2563EB] hover:underline mt-2 inline-block">Back to Transport</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/transport" className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </h1>
        </div>
        {canManage && (
          <div className="flex gap-2">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)}
                className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer">
                <Pencil size={14} /> Edit
              </button>
            ) : (
              <button onClick={() => { setIsEditing(false); reset(); }}
                className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer">
                Cancel
              </button>
            )}
            <button onClick={handleDelete}
              className="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer">
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
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{getTypeLabel()}</span>
        </div>
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {renderEditForm()}
            <div className="flex justify-end pt-4 border-t border-[#e1e2ed]">
              <button type="submit" disabled={isPending}
                className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50">
                <Pencil size={14} /> Update
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6">
            {renderDetails()}
          </div>
        )}
      </div>
    </div>
  );
}
