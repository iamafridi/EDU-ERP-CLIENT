"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import {
  Bus,
  MapPin,
  DollarSign,
  Plus,
  CheckCircle2,
  Pencil,
  Trash2,
  QrCode,
  Wrench,
  Navigation,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Fuel,
  Users,
  Search,
  Download,
  Calendar,
  Sparkles,
} from "lucide-react";
import DataTable from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
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
  IconButton,
  Badge,
  Modal,
  ProgressBar,
} from "@/components/ui";

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

interface StudentDigitalPass {
  id: string;
  studentName: string;
  studentId: string;
  department: string;
  routeName: string;
  assignedVehicle: string;
  boardingPoint: string;
  semester: string;
  validUntil: string;
  qrHash: string;
  rfidCardNo: string;
  status: "ACTIVE" | "PENDING" | "EXPIRED";
}

const mockDigitalPasses: StudentDigitalPass[] = [
  {
    id: "PASS-2026-001",
    studentName: "Tahmid Hasan",
    studentId: "CSE-2023-0142",
    department: "Computer Science & Engineering",
    routeName: "Route A — Mirpur-10 Express",
    assignedVehicle: "DHAKA-METRO-GA-11-2233",
    boardingPoint: "Kazipara Footover Bridge",
    semester: "Fall 2026",
    validUntil: "31 Dec 2026",
    qrHash: "VERIFIED-UAS-BUS-88392-VALID",
    rfidCardNo: "RFID-88392019",
    status: "ACTIVE",
  },
  {
    id: "PASS-2026-002",
    studentName: "Nusrat Jahan",
    studentId: "BBA-2024-0089",
    department: "School of Business",
    routeName: "Route B — Uttara Sector 7 Shuttle",
    assignedVehicle: "DHAKA-METRO-GA-14-5566",
    boardingPoint: "House Building Bus Stand",
    semester: "Fall 2026",
    validUntil: "31 Dec 2026",
    qrHash: "VERIFIED-UAS-BUS-44910-VALID",
    rfidCardNo: "RFID-44910321",
    status: "ACTIVE",
  },
  {
    id: "PASS-2026-003",
    studentName: "Ariful Islam",
    studentId: "EEE-2022-0051",
    department: "Electrical & Electronic Engineering",
    routeName: "Route C — Old Dhaka / Motijheel",
    assignedVehicle: "DHAKA-METRO-GA-12-7788",
    boardingPoint: "Doyel Chattar",
    semester: "Fall 2026",
    validUntil: "31 Dec 2026",
    qrHash: "VERIFIED-UAS-BUS-12093-VALID",
    rfidCardNo: "RFID-12093844",
    status: "ACTIVE",
  },
];

interface FleetMaintenanceLog {
  id: string;
  vehicleNumber: string;
  driverName: string;
  fitnessCertExpiry: string;
  roadTaxValidity: string;
  mileageKm: number;
  lastOilChange: string;
  fuelEfficiencyKmPerL: number;
  maintenanceAlert: "OK" | "DUE_SOON" | "OVERDUE";
}

const mockMaintenanceLogs: FleetMaintenanceLog[] = [
  {
    id: "MAINT-01",
    vehicleNumber: "DHAKA-METRO-GA-11-2233",
    driverName: "Mofizul Islam",
    fitnessCertExpiry: "15 Nov 2026",
    roadTaxValidity: "28 Feb 2027",
    mileageKm: 42150,
    lastOilChange: "10 Sep 2026",
    fuelEfficiencyKmPerL: 4.8,
    maintenanceAlert: "OK",
  },
  {
    id: "MAINT-02",
    vehicleNumber: "DHAKA-METRO-GA-14-5566",
    driverName: "Abul Kalam",
    fitnessCertExpiry: "12 Oct 2026",
    roadTaxValidity: "15 Jan 2027",
    mileageKm: 58900,
    lastOilChange: "01 Aug 2026",
    fuelEfficiencyKmPerL: 4.5,
    maintenanceAlert: "DUE_SOON",
  },
  {
    id: "MAINT-03",
    vehicleNumber: "DHAKA-METRO-GA-12-7788",
    driverName: "Rahim Badsha",
    fitnessCertExpiry: "30 Sep 2026",
    roadTaxValidity: "10 Dec 2026",
    mileageKm: 71200,
    lastOilChange: "15 Jul 2026",
    fuelEfficiencyKmPerL: 4.2,
    maintenanceAlert: "OVERDUE",
  },
];

export default function TransportPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"vehicles" | "routes" | "passes" | "fees" | "maintenance">("vehicles");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPassForModal, setSelectedPassForModal] = useState<StudentDigitalPass | null>(null);
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
      setTimeout(() => setSuccessMsg(""), 3500);
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
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: api.deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setSuccessMsg("Vehicle deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const createRouteMutation = useMutation({
    mutationFn: api.createTransportRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transportRoutes"] });
      setSuccessMsg("Route created successfully.");
      setIsCreateModalOpen(false);
      resetForm();
      setTimeout(() => setSuccessMsg(""), 3500);
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
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const deleteRouteMutation = useMutation({
    mutationFn: api.deleteTransportRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transportRoutes"] });
      setSuccessMsg("Route deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const createFeeMutation = useMutation({
    mutationFn: api.createTransportFee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transportFees"] });
      setSuccessMsg("Transport fee structure created successfully.");
      setIsCreateModalOpen(false);
      resetForm();
      setTimeout(() => setSuccessMsg(""), 3500);
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
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const deleteFeeMutation = useMutation({
    mutationFn: api.deleteTransportFee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transportFees"] });
      setSuccessMsg("Transport fee deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 3500);
    },
  });

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(
      activeTab === "vehicles" ? vehicleSchema : activeTab === "routes" ? routeSchema : transportFeeSchema
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
        updateVehicleMutation.mutate({ id: editingVehicle._id || editingVehicle.id, payload: values });
      } else {
        createVehicleMutation.mutate(values);
      }
    } else if (activeTab === "routes") {
      if (editingRoute) {
        updateRouteMutation.mutate({ id: editingRoute._id || editingRoute.id, payload: values });
      } else {
        createRouteMutation.mutate(values);
      }
    } else {
      if (editingFee) {
        updateFeeMutation.mutate({ id: editingFee._id || editingFee.id, payload: values });
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
      case "fees": return "Set Transport Fee (BDT ৳)";
      default: return "";
    }
  };

  const vehicleColumns = [
    {
      header: "Vehicle Number",
      accessor: (row: any) => (
        <Link href={`/transport/${row.id}`} className="font-mono font-bold text-gold hover:underline">
          {row.vehicleNumber}
        </Link>
      ),
    },
    { header: "Type", accessor: (row: any) => <Badge variant="neutral" size="sm">{row.type}</Badge> },
    {
      header: "Capacity",
      accessor: (row: any) => <span className="font-mono font-bold text-text">{row.capacity} Seats</span>,
    },
    { header: "Driver Name", accessor: (row: any) => <span className="font-medium text-text">{row.driverName}</span> },
    {
      header: "Status",
      accessor: (row: any) => (
        <Badge
          variant={
            row.status === "active" ? "success" : row.status === "maintenance" ? "warning" : "neutral"
          }
          size="sm"
        >
          {row.status}
        </Badge>
      ),
    },
    ...(canManage
      ? [
          {
            header: "Actions",
            accessor: (row: any) => (
              <div className="flex items-center gap-1">
                <IconButton label="Edit vehicle" variant="ghost" size="sm" onClick={() => openEditVehicleModal(row)}>
                  <Pencil size={14} />
                </IconButton>
                <IconButton
                  label="Delete vehicle"
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this vehicle?")) {
                      deleteVehicleMutation.mutate(row._id || row.id);
                    }
                  }}
                >
                  <Trash2 size={14} />
                </IconButton>
              </div>
            ),
          },
        ]
      : []),
  ];

  const routeColumns = [
    {
      header: "Route Name",
      accessor: (row: any) => (
        <Link href={`/transport/${row.id}`} className="font-bold text-gold hover:underline">
          {row.routeName}
        </Link>
      ),
    },
    { header: "Assigned Vehicle", accessor: (row: any) => <span className="font-mono font-semibold text-text">{row.vehicleNumber}</span> },
    { header: "Stops Covered", accessor: "stops" as const },
    { header: "Daily Schedule", accessor: (row: any) => <span className="font-mono text-xs text-text-muted">{row.schedule}</span> },
    ...(canManage
      ? [
          {
            header: "Actions",
            accessor: (row: any) => (
              <div className="flex items-center gap-1">
                <IconButton label="Edit route" variant="ghost" size="sm" onClick={() => openEditRouteModal(row)}>
                  <Pencil size={14} />
                </IconButton>
                <IconButton
                  label="Delete route"
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this route?")) {
                      deleteRouteMutation.mutate(row._id || row.id);
                    }
                  }}
                >
                  <Trash2 size={14} />
                </IconButton>
              </div>
            ),
          },
        ]
      : []),
  ];

  const feeColumns = [
    {
      header: "Route Name",
      accessor: (row: any) => (
        <Link href={`/transport/${row.id}`} className="font-bold text-gold hover:underline">
          {row.routeName}
        </Link>
      ),
    },
    { header: "Passenger Type", accessor: (row: any) => <Badge variant="neutral" size="sm">{row.studentType}</Badge> },
    {
      header: "Fee (BDT)",
      accessor: (row: any) => (
        <span className="font-mono font-bold text-gold">
          ৳{Number(row.amount || 0).toLocaleString()}
        </span>
      ),
    },
    { header: "Academic Semester", accessor: "semester" as const },
    ...(canManage
      ? [
          {
            header: "Actions",
            accessor: (row: any) => (
              <div className="flex items-center gap-1">
                <IconButton label="Edit fee" variant="ghost" size="sm" onClick={() => openEditFeeModal(row)}>
                  <Pencil size={14} />
                </IconButton>
                <IconButton
                  label="Delete fee"
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this transport fee?")) {
                      deleteFeeMutation.mutate(row._id || row.id);
                    }
                  }}
                >
                  <Trash2 size={14} />
                </IconButton>
              </div>
            ),
          },
        ]
      : []),
  ];

  const isPending =
    createVehicleMutation.isPending ||
    updateVehicleMutation.isPending ||
    createRouteMutation.isPending ||
    updateRouteMutation.isPending ||
    createFeeMutation.isPending ||
    updateFeeMutation.isPending;

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Transport Fleet & Shuttle Logistics"
        subtitle="Manage university commuter buses, route timings, digital RFID transport passes, semester transit fees, and vehicle fitness compliance."
        actions={
          canManage && (
            <div className="flex items-center gap-2">
              <Button variant="gold" leftIcon={<Plus size={15} />} onClick={openCreateModal}>
                {activeTab === "vehicles" ? "Register Vehicle" : activeTab === "routes" ? "Add Route" : "Set Fee"}
              </Button>
            </div>
          )
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

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Active Fleet</span>
            <Badge variant="success" size="sm">100% Operational</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-text">
            {vehicles.length || 18} <span className="text-xs font-normal text-text-muted">Buses & Vans</span>
          </div>
          <span className="text-xs text-text-muted mt-1 block">950 Daily Student Commuters</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Daily Transit Routes</span>
            <Badge variant="gold" size="sm">8 Master Lines</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-gold">
            {routes.length || 8} <span className="text-xs font-normal text-text-muted">Active Corridors</span>
          </div>
          <span className="text-xs text-text-muted mt-1 block">Covering Mirpur, Uttara, Dhanmondi, Motijheel</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Active Digital Passes</span>
            <Badge variant="primary" size="sm">Fall 2026</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-text">
            1,240 <span className="text-xs font-normal text-text-muted">Subscribers</span>
          </div>
          <span className="text-xs text-text-muted mt-1 block">QR & RFID Automated Boarding</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">BRTA Compliance</span>
            <Badge variant="success" size="sm">Verified</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">
            94.4% <span className="text-xs font-normal text-text-muted">Fitness Score</span>
          </div>
          <span className="text-xs text-text-muted mt-1 block">Zero statutory penalties</span>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-px">
        {([
          { key: "vehicles", label: "Fleet Vehicles & GPS", icon: Bus },
          { key: "routes", label: "Transit Routes & Grid", icon: MapPin },
          { key: "passes", label: "Digital Smart Passes", icon: QrCode },
          { key: "fees", label: "Semester Pass Billing", icon: DollarSign },
          { key: "maintenance", label: "Fitness & Maintenance", icon: Wrench },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              resetForm();
            }}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.key
                ? "border-gold text-gold"
                : "border-transparent text-text-muted hover:text-text hover:border-border"
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vehicles Tab */}
      {activeTab === "vehicles" && (
        <Card noPadding>
          {isLoadingVehicles ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <DataTable
              data={vehicles}
              columns={vehicleColumns}
              searchPlaceholder="Search vehicles by number..."
              searchField="vehicleNumber"
            />
          )}
        </Card>
      )}

      {/* Routes Tab */}
      {activeTab === "routes" && (
        <Card noPadding>
          {isLoadingRoutes ? (
            <TableSkeleton rows={5} cols={5} />
          ) : (
            <DataTable
              data={routes}
              columns={routeColumns}
              searchPlaceholder="Search routes by name..."
              searchField="routeName"
            />
          )}
        </Card>
      )}

      {/* Passes Tab */}
      {activeTab === "passes" && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <QrCode size={16} className="text-gold" />
                Digital Student RFID & QR Transport Passes
              </h3>
              <p className="text-xs text-text-muted">
                Contactless optical QR and RFID token verification for express bus boarding. Real-time route clearance token.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download size={14} />}
              onClick={() => alert("Exporting all active Fall 2026 digital transport passes as printable PDF batch...")}
            >
              Export Pass Batch
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {mockDigitalPasses.map((pass) => (
              <Card key={pass.id} orientation="vertical" padding="md" className="border-gold/30 hover:border-gold transition-all">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Bus size={18} className="text-gold" />
                    <span className="font-bold text-xs uppercase tracking-wider text-text">Campus Bus Pass</span>
                  </div>
                  <Badge variant="success" size="sm">{pass.status}</Badge>
                </div>

                <div className="py-4 space-y-2.5">
                  <div>
                    <span className="text-[10px] uppercase text-text-muted font-bold tracking-wider">Student Name</span>
                    <p className="text-sm font-bold text-text">{pass.studentName}</p>
                    <span className="text-xs font-mono text-gold">{pass.studentId} • {pass.department}</span>
                  </div>

                  <div className="p-3 bg-surface-muted rounded-xl border border-border space-y-1">
                    <span className="text-[10px] uppercase text-text-muted font-bold tracking-wider">Assigned Corridor</span>
                    <p className="text-xs font-bold text-text">{pass.routeName}</p>
                    <div className="flex items-center justify-between text-[11px] text-text-muted pt-1">
                      <span>Boarding: <strong>{pass.boardingPoint}</strong></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-surface-muted rounded-lg border border-border">
                      <span className="text-[10px] text-text-muted uppercase block">Vehicle</span>
                      <span className="font-mono font-bold text-text text-[11px]">{pass.assignedVehicle.split("-")[2]}-{pass.assignedVehicle.split("-")[3]}</span>
                    </div>
                    <div className="p-2 bg-surface-muted rounded-lg border border-border">
                      <span className="text-[10px] text-text-muted uppercase block">Valid Until</span>
                      <span className="font-semibold text-text text-[11px]">{pass.validUntil}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="font-mono text-[10px] text-text-muted">{pass.rfidCardNo}</span>
                  <Button
                    variant="gold"
                    size="sm"
                    className="text-xs h-7 px-2.5"
                    leftIcon={<QrCode size={13} />}
                    onClick={() => setSelectedPassForModal(pass)}
                  >
                    View QR Token
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Fees Tab */}
      {activeTab === "fees" && (
        <Card noPadding>
          {isLoadingFees ? (
            <TableSkeleton rows={5} cols={5} />
          ) : (
            <DataTable
              data={transportFees}
              columns={feeColumns}
              searchPlaceholder="Search fees by route..."
              searchField="routeName"
            />
          )}
        </Card>
      )}

      {/* Maintenance & Fitness Tab */}
      {activeTab === "maintenance" && (
        <div className="space-y-6">
          <div className="p-4 bg-surface-muted/50 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <Wrench size={16} className="text-gold" />
                BRTA Fitness Certifications & Fleet Maintenance Log
              </h3>
              <p className="text-xs text-text-muted">
                Statutory roadworthiness certificates, scheduled engine overhauls, oil replacement milestones, and driver health logs.
              </p>
            </div>
            <Badge variant="gold" size="sm">
              Next BRTA Audit: Nov 2026
            </Badge>
          </div>

          <div className="divide-y divide-border bg-surface border border-border rounded-2xl overflow-hidden">
            {mockMaintenanceLogs.map((log) => (
              <div key={log.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-muted/30 transition-colors">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-gold">{log.vehicleNumber}</span>
                    <Badge
                      variant={
                        log.maintenanceAlert === "OK" ? "success" : log.maintenanceAlert === "DUE_SOON" ? "warning" : "danger"
                      }
                      size="sm"
                    >
                      {log.maintenanceAlert === "OK" ? "BRTA Compliant" : log.maintenanceAlert === "DUE_SOON" ? "Service Due in 14 Days" : "Inspection Overdue"}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-muted">
                    Assigned Driver: <strong className="text-text">{log.driverName}</strong> • Current Odometer: <strong className="font-mono text-text">{log.mileageKm.toLocaleString()} KM</strong>
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-1">
                    <span className="flex items-center gap-1"><FileCheck size={12} className="text-emerald-600" /> Fitness Valid: <strong>{log.fitnessCertExpiry}</strong></span>
                    <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-blue-600" /> Tax Token: <strong>{log.roadTaxValidity}</strong></span>
                    <span className="flex items-center gap-1"><Fuel size={12} className="text-amber-600" /> Efficiency: <strong>{log.fuelEfficiencyKmPerL} km/L</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Pencil size={13} />}
                    onClick={() => alert(`Opening maintenance log entry for vehicle ${log.vehicleNumber}`)}
                  >
                    Log Service
                  </Button>
                  <Button
                    variant="gold"
                    size="sm"
                    leftIcon={<FileCheck size={13} />}
                    onClick={() => alert(`Renewing BRTA fitness certificate for ${log.vehicleNumber}`)}
                  >
                    Renew Fitness
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unified Create/Edit Modal Component */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeModal}
        title={getModalTitle()}
        subtitle="Provide transit details and operational specifications"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {activeTab === "vehicles" && (
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
                    <option value="Bus">Bus</option>
                    <option value="Van">Microbus / Van</option>
                    <option value="Car">Staff Car</option>
                    <option value="Auto">Shuttle Auto</option>
                  </Select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Seating Capacity" error={(errors.capacity as any)?.message} required>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    {...register("capacity", { valueAsNumber: true })}
                    className="font-mono"
                  />
                </FormField>
                <FormField label="Driver Full Name" error={(errors.driverName as any)?.message} required>
                  <Input {...register("driverName")} placeholder="e.g. Mofizul Islam" />
                </FormField>
              </div>

              <FormField label="Operational Status" required>
                <Select {...register("status")}>
                  <option value="active">Active & On Route</option>
                  <option value="maintenance">Under Maintenance</option>
                  <option value="retired">Retired / Spare</option>
                </Select>
              </FormField>
            </>
          )}

          {activeTab === "routes" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Route Name" error={(errors.routeName as any)?.message} required>
                  <Input {...register("routeName")} placeholder="e.g. Route A — Mirpur to Campus" />
                </FormField>
                <FormField label="Assigned Vehicle Number" error={(errors.vehicleNumber as any)?.message} required>
                  <Input {...register("vehicleNumber")} placeholder="e.g. DHAKA-METRO-GA-11-2233" className="font-mono uppercase" />
                </FormField>
              </div>

              <FormField label="Transit Stops (Comma-separated)" error={(errors.stops as any)?.message} required>
                <Textarea
                  {...register("stops")}
                  placeholder="e.g. Mirpur 10, Kazipara, Farmgate, Shahbagh, Campus Gate 1"
                  rows={3}
                />
              </FormField>

              <FormField label="Daily Timetable Schedule" error={(errors.schedule as any)?.message} required>
                <Input {...register("schedule")} placeholder="e.g. Morning 07:15 AM — Return 04:30 PM" />
              </FormField>
            </>
          )}

          {activeTab === "fees" && (
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
                    {...register("amount", { valueAsNumber: true })}
                    className="font-mono"
                    placeholder="4500"
                  />
                </FormField>
              </div>

              <FormField label="Academic Semester" error={(errors.semester as any)?.message} required>
                <Input {...register("semester")} placeholder="e.g. Fall 2026" />
              </FormField>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isPending}
              leftIcon={editingVehicle || editingRoute || editingFee ? <Pencil size={14} /> : <Plus size={14} />}
            >
              {editingVehicle || editingRoute || editingFee ? "Save Changes" : "Confirm & Save"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Digital Pass Modal */}
      <Modal
        isOpen={!!selectedPassForModal}
        onClose={() => setSelectedPassForModal(null)}
        title="Digital Smart Transit Pass"
        subtitle={selectedPassForModal ? `${selectedPassForModal.studentName} • ${selectedPassForModal.studentId}` : ""}
        size="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="font-mono text-xs text-text-muted">{selectedPassForModal?.qrHash}</span>
            <Button variant="gold" onClick={() => setSelectedPassForModal(null)}>
              Done
            </Button>
          </div>
        }
      >
        {selectedPassForModal && (
          <div className="space-y-4 text-center py-2">
            <div className="p-6 bg-gradient-to-br from-navy via-navy to-surface-muted text-surface border border-gold/40 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-3">
                <div className="flex items-center gap-2">
                  <Bus size={20} className="text-gold" />
                  <span className="font-bold text-xs uppercase tracking-widest text-gold">UAS Campus Express</span>
                </div>
                <Badge variant="gold" size="sm">{selectedPassForModal.semester}</Badge>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-surface text-text rounded-xl border border-border shadow-inner my-2">
                <QrCode size={140} className="text-navy" />
                <span className="font-mono text-[10px] text-text-muted mt-2 font-bold tracking-widest">
                  {selectedPassForModal.qrHash}
                </span>
              </div>

              <div className="text-left space-y-1">
                <h4 className="text-base font-bold text-white">{selectedPassForModal.studentName}</h4>
                <p className="text-xs text-gold/90 font-mono">{selectedPassForModal.studentId} • {selectedPassForModal.department}</p>
                <div className="pt-2 text-xs text-surface/80 flex items-center justify-between">
                  <span>Route: <strong>{selectedPassForModal.routeName}</strong></span>
                  <span>Vehicle: <strong className="font-mono">{selectedPassForModal.assignedVehicle.split("-")[2]}-{selectedPassForModal.assignedVehicle.split("-")[3]}</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
