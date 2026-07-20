"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion, AnimatePresence } from "framer-motion";
import { Bus, MapPin, DollarSign, Plus, CheckCircle2, X, Pencil, Trash2 } from "lucide-react";
import DataTable from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import Link from "next/link";

const vehicleSchema = zod.object({
  vehicleNumber: zod.string().min(3, "Vehicle number is required"),
  type: zod.enum(["Bus", "Van", "Car", "Auto"]),
  capacity: zod.coerce.number().min(1, "Capacity must be at least 1"),
  driverName: zod.string().min(3, "Driver name is required"),
  status: zod.enum(["active", "maintenance", "retired"]),
});

const routeSchema = zod.object({
  routeName: zod.string().min(3, "Route name is required"),
  vehicleNumber: zod.string().min(3, "Vehicle number is required"),
  stops: zod.string().min(5, "Stops are required"),
  schedule: zod.string().min(3, "Schedule is required"),
});

const transportFeeSchema = zod.object({
  routeName: zod.string().min(3, "Route name is required"),
  studentType: zod.enum(["Regular", "Staff", "Guest"]),
  amount: zod.coerce.number().min(1, "Amount is required"),
  semester: zod.string().min(3, "Semester is required"),
});

export default function TransportPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"vehicles" | "routes" | "fees">("vehicles");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [editingRoute, setEditingRoute] = useState<any>(null);
  const [editingFee, setEditingFee] = useState<any>(null);

  const canManage = roleIs("domain-admin", "super-admin");

  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ["vehicles"],
    queryFn: api.getVehicles,
  });

  const { data: routes = [], isLoading: isLoadingRoutes } = useQuery({
    queryKey: ["transportRoutes"],
    queryFn: api.getTransportRoutes,
  });

  const { data: transportFees = [], isLoading: isLoadingFees } = useQuery({
    queryKey: ["transportFees"],
    queryFn: api.getTransportFees,
  });

  const createVehicleMutation = useMutation({
    mutationFn: api.createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setSuccessMsg("Vehicle registered successfully.");
      setIsCreateModalOpen(false);
      resetForm();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateVehicle(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setSuccessMsg("Vehicle updated successfully.");
      setIsCreateModalOpen(false);
      setEditingVehicle(null);
      resetForm();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: api.deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setSuccessMsg("Vehicle deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const createRouteMutation = useMutation({
    mutationFn: api.createTransportRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transportRoutes"] });
      setSuccessMsg("Route created successfully.");
      setIsCreateModalOpen(false);
      resetForm();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateRouteMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateTransportRoute(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transportRoutes"] });
      setSuccessMsg("Route updated successfully.");
      setIsCreateModalOpen(false);
      setEditingRoute(null);
      resetForm();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteRouteMutation = useMutation({
    mutationFn: api.deleteTransportRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transportRoutes"] });
      setSuccessMsg("Route deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const createFeeMutation = useMutation({
    mutationFn: api.createTransportFee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transportFees"] });
      setSuccessMsg("Transport fee structure created successfully.");
      setIsCreateModalOpen(false);
      resetForm();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateFeeMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateTransportFee(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transportFees"] });
      setSuccessMsg("Transport fee updated successfully.");
      setIsCreateModalOpen(false);
      setEditingFee(null);
      resetForm();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteFeeMutation = useMutation({
    mutationFn: api.deleteTransportFee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transportFees"] });
      setSuccessMsg("Transport fee deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(
      activeTab === "vehicles" ? vehicleSchema :
      activeTab === "routes" ? routeSchema :
      transportFeeSchema
    ),
  });

  const openCreateModal = () => {
    setEditingVehicle(null);
    setEditingRoute(null);
    setEditingFee(null);
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditVehicleModal = (vehicle: any) => {
    setEditingVehicle(vehicle);
    setEditingRoute(null);
    setEditingFee(null);
    setIsCreateModalOpen(true);
    resetForm({
      vehicleNumber: vehicle.vehicleNumber,
      type: vehicle.type,
      capacity: vehicle.capacity,
      driverName: vehicle.driverName,
      status: vehicle.status,
    });
  };

  const openEditRouteModal = (route: any) => {
    setEditingRoute(route);
    setEditingVehicle(null);
    setEditingFee(null);
    setIsCreateModalOpen(true);
    resetForm({
      routeName: route.routeName,
      vehicleNumber: route.vehicleNumber,
      stops: route.stops,
      schedule: route.schedule,
    });
  };

  const openEditFeeModal = (fee: any) => {
    setEditingFee(fee);
    setEditingVehicle(null);
    setEditingRoute(null);
    setIsCreateModalOpen(true);
    resetForm({
      routeName: fee.routeName,
      studentType: fee.studentType,
      amount: fee.amount,
      semester: fee.semester,
    });
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingVehicle(null);
    setEditingRoute(null);
    setEditingFee(null);
    resetForm();
  };

  const onSubmit = (values: any) => {
    if (activeTab === "vehicles") {
      if (editingVehicle) {
        updateVehicleMutation.mutate({ id: editingVehicle._id, payload: values });
      } else {
        createVehicleMutation.mutate(values);
      }
    } else if (activeTab === "routes") {
      if (editingRoute) {
        updateRouteMutation.mutate({ id: editingRoute._id, payload: values });
      } else {
        createRouteMutation.mutate(values);
      }
    } else {
      if (editingFee) {
        updateFeeMutation.mutate({ id: editingFee._id, payload: values });
      } else {
        createFeeMutation.mutate(values);
      }
    }
  };

  const getModalTitle = () => {
    if (editingVehicle) return "Edit Vehicle";
    if (editingRoute) return "Edit Transport Route";
    if (editingFee) return "Edit Transport Fee";
    switch (activeTab) {
      case "vehicles": return "Register New Vehicle";
      case "routes": return "Create Transport Route";
      case "fees": return "Set Transport Fee";
      default: return "";
    }
  };

  const getSubmitLabel = () => {
    if (editingVehicle) return "Update Vehicle";
    if (editingRoute) return "Update Route";
    if (editingFee) return "Update Fee";
    switch (activeTab) {
      case "vehicles": return "Register Vehicle";
      case "routes": return "Create Route";
      case "fees": return "Set Fee";
      default: return "";
    }
  };

  const vehicleColumns = [
    {
      header: "Vehicle Number",
      accessor: (row: any) => (
        <Link href={`/transport/${row.id}`} className="font-bold text-[#2563EB] hover:underline">
          {row.vehicleNumber}
        </Link>
      ),
    },
    { header: "Type", accessor: "type" as const },
    {
      header: "Capacity",
      accessor: (row: any) => <span className="font-mono font-bold">{row.capacity}</span>,
    },
    { header: "Driver Name", accessor: "driverName" as const },
    {
      header: "Status",
      accessor: (row: any) => (
        <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${
          row.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
          row.status === "maintenance" ? "bg-amber-50 text-amber-700 border-amber-100" :
          "bg-slate-50 text-slate-600 border-slate-200"
        }`}>
          {row.status}
        </span>
      ),
    },
    ...(canManage ? [{
      header: "Actions",
      accessor: (row: any) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEditVehicleModal(row)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#2563EB] hover:bg-[#2563EB]/10 transition-colors cursor-pointer"
            title="Edit vehicle"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this vehicle?")) {
                deleteVehicleMutation.mutate(row._id);
              }
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            title="Delete vehicle"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    }] : []),
  ];

  const routeColumns = [
    {
      header: "Route Name",
      accessor: (row: any) => (
        <Link href={`/transport/${row.id}`} className="font-bold text-[#2563EB] hover:underline">
          {row.routeName}
        </Link>
      ),
    },
    { header: "Vehicle Number", accessor: "vehicleNumber" as const },
    { header: "Stops", accessor: "stops" as const },
    { header: "Schedule", accessor: "schedule" as const },
    ...(canManage ? [{
      header: "Actions",
      accessor: (row: any) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEditRouteModal(row)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#2563EB] hover:bg-[#2563EB]/10 transition-colors cursor-pointer"
            title="Edit route"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this route?")) {
                deleteRouteMutation.mutate(row._id);
              }
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            title="Delete route"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    }] : []),
  ];

  const feeColumns = [
    {
      header: "Route Name",
      accessor: (row: any) => (
        <Link href={`/transport/${row.id}`} className="font-bold text-[#2563EB] hover:underline">
          {row.routeName}
        </Link>
      ),
    },
    { header: "Student Type", accessor: "studentType" as const },
    {
      header: "Amount",
      accessor: (row: any) => <span className="font-mono font-bold">Rs. {row.amount.toLocaleString()}</span>,
    },
    { header: "Semester", accessor: "semester" as const },
    ...(canManage ? [{
      header: "Actions",
      accessor: (row: any) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEditFeeModal(row)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#2563EB] hover:bg-[#2563EB]/10 transition-colors cursor-pointer"
            title="Edit fee"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this transport fee?")) {
                deleteFeeMutation.mutate(row._id);
              }
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            title="Delete fee"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Bus className="text-[#2563EB]" />
            Transport Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage fleet vehicles, route schedules, and transport fee structures.
          </p>
        </div>

        {canManage && (
          <div className="flex gap-2">
            <Link
              href="/transport/new?type=vehicle"
              className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto shadow-sm shadow-blue-500/10"
            >
              <Plus size={16} />
              Add Vehicle
            </Link>
            <Link
              href="/transport/new?type=route"
              className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus size={16} />
              Route
            </Link>
            <Link
              href="/transport/new?type=fee"
              className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus size={16} />
              Fee
            </Link>
          </div>
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
          { key: "vehicles", label: "Vehicles", icon: Bus },
          { key: "routes", label: "Routes", icon: MapPin },
          { key: "fees", label: "Fees", icon: DollarSign },
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
        {activeTab === "vehicles" && (
          isLoadingVehicles ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <DataTable
              data={vehicles}
              columns={vehicleColumns}
              searchPlaceholder="Search vehicles..."
              searchField="vehicleNumber"
            />
          )
        )}

        {activeTab === "routes" && (
          isLoadingRoutes ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <DataTable
              data={routes}
              columns={routeColumns}
              searchPlaceholder="Search routes..."
              searchField="routeName"
            />
          )
        )}

        {activeTab === "fees" && (
          isLoadingFees ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <DataTable
              data={transportFees}
              columns={feeColumns}
              searchPlaceholder="Search fees..."
              searchField="routeName"
            />
          )
        )}
      </div>

      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">{getModalTitle()}</span>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 flex-1 overflow-y-auto">
                {activeTab === "vehicles" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Vehicle Number</label>
                        <input
                          type="text"
                          {...register("vehicleNumber")}
                          placeholder="e.g. UP-14-AT-1234"
                          className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono uppercase"
                        />
                        {errors.vehicleNumber && (
                          <span className="text-[10px] text-red-500 font-semibold block">{(errors.vehicleNumber as any).message}</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Type</label>
                        <select
                          {...register("type")}
                          className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                        >
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
                        <input
                          type="number"
                          {...register("capacity", { valueAsNumber: true })}
                          placeholder="50"
                          className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono"
                        />
                        {errors.capacity && (
                          <span className="text-[10px] text-red-500 font-semibold block">{(errors.capacity as any).message}</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Driver Name</label>
                        <input
                          type="text"
                          {...register("driverName")}
                          placeholder="e.g. Rajesh Kumar"
                          className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                        />
                        {errors.driverName && (
                          <span className="text-[10px] text-red-500 font-semibold block">{(errors.driverName as any).message}</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Status</label>
                      <select
                        {...register("status")}
                        className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                      >
                        <option value="active">Active</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="retired">Retired</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === "routes" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Route Name</label>
                        <input
                          type="text"
                          {...register("routeName")}
                          placeholder="e.g. Route A - North Campus"
                          className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                        />
                        {errors.routeName && (
                          <span className="text-[10px] text-red-500 font-semibold block">{(errors.routeName as any).message}</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Vehicle Number</label>
                        <input
                          type="text"
                          {...register("vehicleNumber")}
                          placeholder="e.g. UP-14-AT-1234"
                          className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono uppercase"
                        />
                        {errors.vehicleNumber && (
                          <span className="text-[10px] text-red-500 font-semibold block">{(errors.vehicleNumber as any).message}</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Stops (comma separated)</label>
                      <textarea
                        {...register("stops")}
                        placeholder="e.g. Main Gate, Library, Admin Block, Hostel Block A"
                        className="w-full h-20 px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all resize-none"
                      />
                      {errors.stops && (
                        <span className="text-[10px] text-red-500 font-semibold block">{(errors.stops as any).message}</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Schedule</label>
                      <input
                        type="text"
                        {...register("schedule")}
                        placeholder="e.g. 07:30 AM - 08:30 AM"
                        className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                      />
                      {errors.schedule && (
                        <span className="text-[10px] text-red-500 font-semibold block">{(errors.schedule as any).message}</span>
                      )}
                    </div>
                  </>
                )}

                {activeTab === "fees" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Route Name</label>
                      <input
                        type="text"
                        {...register("routeName")}
                        placeholder="e.g. Route A - North Campus"
                        className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                      />
                      {errors.routeName && (
                        <span className="text-[10px] text-red-500 font-semibold block">{(errors.routeName as any).message}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Student Type</label>
                        <select
                          {...register("studentType")}
                          className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                        >
                          <option value="Regular">Regular</option>
                          <option value="Staff">Staff</option>
                          <option value="Guest">Guest</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Amount (Rs.)</label>
                        <input
                          type="number"
                          {...register("amount", { valueAsNumber: true })}
                          placeholder="5000"
                          className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Semester</label>
                      <input
                        type="text"
                        {...register("semester")}
                        placeholder="e.g. Fall 2026"
                        className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"
                  >
                    {editingVehicle || editingRoute || editingFee ? (
                      <Pencil size={14} />
                    ) : (
                      <Plus size={14} />
                    )}
                    {getSubmitLabel()}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
