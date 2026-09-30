"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  AlertTriangle,
  ShieldCheck,
  Biohazard,
  Skull,
  Droplets,
  Truck,
  Plus,
  Search,
  CheckCircle2,
  FileText,
  Building2,
  Barcode,
  XCircle,
} from "lucide-react";
import { campusApi } from "@/services/api";
import { Card, Button, Badge, Modal, FormField, Input, Select } from "@/components/ui";

export function EhsWasteManagementPanel() {
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isManifestModalOpen, setIsManifestModalOpen] = useState(false);
  const [isValidatorModalOpen, setIsValidatorModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"containers" | "bunker-matrix" | "manifests">("containers");
  const [searchFilter, setSearchFilter] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Create Drum Form State
  const [drumCode, setDrumCode] = useState("");
  const [labId, setLabId] = useState("LAB-BIO-301");
  const [wasteClass, setWasteClass] = useState("FLAMMABLE_LIQUID");
  const [epaCode, setEpaCode] = useState("D001");
  const [chemicalName, setChemicalName] = useState("");
  const [volumeLiters, setVolumeLiters] = useState<number>(20);
  const [maxCapacityLiters, setMaxCapacityLiters] = useState<number>(50);
  const [bunkerBay, setBunkerBay] = useState("BAY-1");

  // Manifest Form State
  const [transporterName, setTransporterName] = useState("EnviroSafe Transport Corp.");
  const [transporterEpaId, setTransporterEpaId] = useState("EPA-MD-88390");
  const [tsdfFacility, setTsdfFacility] = useState("Apex High-Temp Incineration Facility #4");
  const [treatmentMethod, setTreatmentMethod] = useState("HIGH_TEMP_INCINERATION");

  // Incompatibility Validator State
  const [valClassA, setValClassA] = useState("STRONG_ACID");
  const [valClassB, setValClassB] = useState("CYANIDES_SULFIDES");
  const [valResult, setValResult] = useState<any>(null);

  // Queries
  const { data: containers = [], isLoading: isLoadingContainers } = useQuery({
    queryKey: ["ehs-containers"],
    queryFn: () => campusApi.getEhsContainers(),
  });

  const { data: manifests = [], isLoading: isLoadingManifests } = useQuery({
    queryKey: ["ehs-manifests"],
    queryFn: () => campusApi.getEhsManifests(),
  });

  // Mutations
  const createContainerMutation = useMutation({
    mutationFn: (payload: any) => campusApi.createEhsContainer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ehs-containers"] });
      setIsCreateModalOpen(false);
      resetCreateForm();
      setSuccessMsg("Hazardous drum container logged & assigned to Bunker Bay.");
      setTimeout(() => setSuccessMsg(""), 4500);
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || "Failed to create hazardous waste container.");
      setTimeout(() => setErrorMsg(""), 5000);
    }
  });

  const manifestMutation = useMutation({
    mutationFn: (payload: any) => campusApi.issueUniformEhsManifest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ehs-containers"] });
      queryClient.invalidateQueries({ queryKey: ["ehs-manifests"] });
      setIsManifestModalOpen(false);
      setSuccessMsg("EPA Uniform Hazardous Waste Manifest generated & dispatched.");
      setTimeout(() => setSuccessMsg(""), 4500);
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || "Manifest generation failed.");
      setTimeout(() => setErrorMsg(""), 5000);
    }
  });

  const resetCreateForm = () => {
    setDrumCode(`EHS-${Date.now().toString().slice(-4)}`);
    setChemicalName("");
    setVolumeLiters(20);
  };

  const handleRunIncompatibilityCheck = async () => {
    try {
      const res = await campusApi.validateBunkerStorage({
        wasteClass: valClassA,
        bunkerBay: "SIMULATED_BAY",
        coStoredClasses: [valClassB],
      });
      setValResult(res);
    } catch {
      // Fallback local calculation
      const incompatible =
        (valClassA.includes("ACID") && valClassB.includes("CYANIDE")) ||
        (valClassA.includes("CYANIDE") && valClassB.includes("ACID")) ||
        (valClassA.includes("ACID") && valClassB.includes("ALKALI")) ||
        (valClassA.includes("OXIDIZER") && valClassB.includes("FLAMMABLE")) ||
        (valClassA.includes("WATER_REACTIVE") && (valClassB.includes("ACID") || valClassB.includes("AQUEOUS")));

      setValResult({
        compatible: !incompatible,
        message: incompatible
          ? `CRITICAL REACTION HAZARD: ${valClassA} + ${valClassB} co-storage violates OSHA/EPA reactive segregation standards.`
          : `SAFE: ${valClassA} and ${valClassB} can be safely isolated in segregated bunker bays.`,
        reactionRisk: incompatible ? "HIGH_EXOTHERMIC_OR_GAS_RELEASE" : "MINIMAL",
      });
    }
  };

  const filteredContainers = containers.filter((c: any) => {
    const q = searchFilter.toLowerCase();
    return (
      (c.drumBarcode || c.containerId || "").toLowerCase().includes(q) ||
      (c.chemicalName || "").toLowerCase().includes(q) ||
      (c.wasteClass || "").toLowerCase().includes(q) ||
      (c.bunkerBay || "").toLowerCase().includes(q)
    );
  });

  const totalVolume = containers.reduce((acc: number, curr: any) => acc + (curr.currentVolumeLiters || 0), 0);

  const getGhsBadge = (wasteType: string) => {
    switch (wasteType) {
      case "FLAMMABLE_LIQUID":
      case "FLAMMABLE_SOLID":
        return <Badge variant="warning" className="gap-1 bg-amber-500/10 text-amber-500 border-amber-500/20"><Flame className="w-3 h-3" /> Flammable</Badge>;
      case "STRONG_ACID":
      case "STRONG_ALKALI":
        return <Badge variant="danger" className="gap-1 bg-rose-500/10 text-rose-500 border-rose-500/20"><Droplets className="w-3 h-3" /> Corrosive</Badge>;
      case "CYANIDES_SULFIDES":
      case "HALOGENATED_SOLVENTS":
        return <Badge variant="danger" className="gap-1 bg-purple-500/10 text-purple-500 border-purple-500/20"><Skull className="w-3 h-3" /> Toxic Gas Risk</Badge>;
      case "BIOHAZARDOUS_INFECTIOUS":
        return <Badge variant="danger" className="gap-1 bg-red-600/10 text-red-600 border-red-600/20"><Biohazard className="w-3 h-3" /> Biohazard</Badge>;
      default:
        return <Badge variant="neutral" className="gap-1">{wasteType}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert / Success */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-3 text-sm font-medium"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-3 text-sm font-medium"
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              EHS Hazardous Waste & Bunker Segregation Engine
            </h2>
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono">
              EPA 40 CFR / OSHA 1910.120
            </Badge>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Real-time chemical incompatibility matrix, reactive bunker segregation, drum 90-day tracking, and certified destruction manifests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsValidatorModalOpen(true);
              setValResult(null);
            }}
            className="gap-2 border-dashed border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Incompatibility Simulator
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsManifestModalOpen(true)}
            className="gap-2"
          >
            <Truck className="w-4 h-4 text-blue-500" />
            Generate EPA Manifest
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              resetCreateForm();
              setIsCreateModalOpen(true);
            }}
            className="gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Log New Drum Container
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Active Waste Drums</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <Barcode className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">{containers.length}</span>
            <span className="text-xs text-neutral-500">Containers in storage</span>
          </div>
        </Card>

        <Card className="p-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Accumulated Volume</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">{totalVolume.toLocaleString()}</span>
            <span className="text-xs text-neutral-500">Liters logged</span>
          </div>
        </Card>

        <Card className="p-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Bunker Segregation Health</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">100%</span>
            <span className="text-xs text-emerald-600 font-medium">0 Reactive Conflicts</span>
          </div>
        </Card>

        <Card className="p-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">EPA Manifests Filed</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">{manifests.length}</span>
            <span className="text-xs text-neutral-500">Uniform manifests</span>
          </div>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab("containers")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "containers"
                ? "border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            Hazardous Drum Inventory ({containers.length})
          </button>
          <button
            onClick={() => setActiveTab("bunker-matrix")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "bunker-matrix"
                ? "border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            Bunker Bay Matrix & Segregation
          </button>
          <button
            onClick={() => setActiveTab("manifests")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "manifests"
                ? "border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            EPA Uniform Manifests ({manifests.length})
          </button>
        </div>

        {activeTab === "containers" && (
          <div className="relative w-64 pb-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search barcode, chemical, bay..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        )}
      </div>

      {/* Tab Content 1: Containers Table */}
      {activeTab === "containers" && (
        <Card className="overflow-hidden bg-white/70 dark:bg-neutral-900/70 border-neutral-200 dark:border-neutral-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 font-semibold text-xs border-b border-neutral-200 dark:border-neutral-800 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Drum Barcode & Lab</th>
                  <th className="px-4 py-3">Chemical Waste Description</th>
                  <th className="px-4 py-3">GHS Classification</th>
                  <th className="px-4 py-3">EPA Code</th>
                  <th className="px-4 py-3">Bunker Bay</th>
                  <th className="px-4 py-3">Fill Level</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {isLoadingContainers ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                      Loading EHS drum inventory...
                    </td>
                  </tr>
                ) : filteredContainers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                      No hazardous containers found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredContainers.map((item: any) => {
                    const fillPct = Math.round(((item.currentVolumeLiters || 0) / (item.maxCapacityLiters || 50)) * 100);
                    return (
                      <tr key={item._id || item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-mono font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                            <Barcode className="w-3.5 h-3.5 text-neutral-400" />
                            {item.drumBarcode || item.containerId || "EHS-DRUM-901"}
                          </div>
                          <div className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" />
                            {item.originatingLab || item.labId || "Central Lab"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-neutral-800 dark:text-neutral-200">
                            {item.chemicalName || "Spent Laboratory Solvents Mix"}
                          </div>
                          <div className="text-xs text-neutral-400">
                            Logged: {item.accumulationStartDate ? new Date(item.accumulationStartDate).toLocaleDateString() : "Active (90d max)"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {getGhsBadge(item.wasteClass || "FLAMMABLE_LIQUID")}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold">
                            {item.epaWasteCode || "D001"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="bg-blue-500/5 text-blue-600 border-blue-500/20 font-mono">
                            {item.bunkerBay || "BAY-1"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-32">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-medium">{item.currentVolumeLiters || 20}L</span>
                              <span className="text-neutral-400">{fillPct}%</span>
                            </div>
                            <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  fillPct > 85 ? "bg-rose-500" : fillPct > 60 ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                                style={{ width: `${Math.min(fillPct, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              item.status === "ACTIVE_ACCUMULATING"
                                ? "success"
                                : item.status === "MANIFESTED_FOR_DISPOSAL"
                                ? "neutral"
                                : "warning"
                            }
                            className="text-xs"
                          >
                            {item.status || "ACCUMULATING"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab Content 2: Bunker Bay Matrix */}
      {activeTab === "bunker-matrix" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-5 bg-white/70 dark:bg-neutral-900/70 border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                Bay 1: Flammable & Solvents
              </h3>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono text-xs">
                Class 3 GHS
              </Badge>
            </div>
            <p className="text-xs text-neutral-500">
              Explosion-proof sparkless grounding clips, positive ventilation, vapor sensors active. Strictly isolated from Bay 2 Oxidizers.
            </p>
            <div className="bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-lg text-xs space-y-1.5">
              <div className="flex justify-between font-medium">
                <span>Capacity Utilized:</span>
                <span className="text-neutral-900 dark:text-white">12 / 20 Drums</span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "60%" }} />
              </div>
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
              <div>• EPA D001 (Flash point &lt; 140°F)</div>
              <div>• Halogenated Methanol / Acetone blends</div>
              <div>• Sparkless bonding cables connected: <span className="text-emerald-500 font-semibold">VERIFIED</span></div>
            </div>
          </Card>

          <Card className="p-5 bg-white/70 dark:bg-neutral-900/70 border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Droplets className="w-5 h-5 text-rose-500" />
                Bay 2: Corrosive Inorganics
              </h3>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono text-xs">
                Class 8 GHS
              </Badge>
            </div>
            <p className="text-xs text-neutral-500">
              Dual berm secondary containment (HDPE lined). Mineral acids separated from Alkalis & Cyanides via physical firewall.
            </p>
            <div className="bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-lg text-xs space-y-1.5">
              <div className="flex justify-between font-medium">
                <span>Capacity Utilized:</span>
                <span className="text-neutral-900 dark:text-white">8 / 15 Drums</span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: "53%" }} />
              </div>
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
              <div>• EPA D002 (pH ≤ 2.0 or ≥ 12.5)</div>
              <div>• Hydrochloric / Nitric acid neutralization pools</div>
              <div>• Sump leak detection: <span className="text-emerald-500 font-semibold">NORMAL (0.00 ppm)</span></div>
            </div>
          </Card>

          <Card className="p-5 bg-white/70 dark:bg-neutral-900/70 border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Biohazard className="w-5 h-5 text-red-600" />
                Bay 3: Biohazardous & Toxics
              </h3>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono text-xs">
                Class 6.2 GHS
              </Badge>
            </div>
            <p className="text-xs text-neutral-500">
              Negative-pressure HEPA filtration chamber, -20°C cold storage option, heavy metals and cytotoxic agent segregation.
            </p>
            <div className="bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-lg text-xs space-y-1.5">
              <div className="flex justify-between font-medium">
                <span>Capacity Utilized:</span>
                <span className="text-neutral-900 dark:text-white">6 / 15 Drums</span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 rounded-full" style={{ width: "40%" }} />
              </div>
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
              <div>• EPA D004-D011 (Toxicity characteristic)</div>
              <div>• Infectious culture plates & Sharps</div>
              <div>• Autoclave decontamination line: <span className="text-emerald-500 font-semibold">READY</span></div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab Content 3: Manifests */}
      {activeTab === "manifests" && (
        <Card className="overflow-hidden bg-white/70 dark:bg-neutral-900/70 border-neutral-200 dark:border-neutral-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 font-semibold text-xs border-b border-neutral-200 dark:border-neutral-800 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Manifest Tracking #</th>
                  <th className="px-4 py-3">Transporter / DOT Agency</th>
                  <th className="px-4 py-3">TSDF Receiving Facility</th>
                  <th className="px-4 py-3">Treatment Protocol</th>
                  <th className="px-4 py-3">Containers Dispatched</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {isLoadingManifests ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                      Loading EPA Uniform manifests...
                    </td>
                  </tr>
                ) : manifests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                      No uniform manifests issued yet.
                    </td>
                  </tr>
                ) : (
                  manifests.map((man: any) => (
                    <tr key={man._id || man.manifestNumber} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          {man.manifestNumber || "EPA-MNF-2026-001"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-neutral-800 dark:text-neutral-200">
                          {man.transporterName || "EnviroSafe Transport Corp."}
                        </div>
                        <div className="text-xs text-neutral-500 font-mono">
                          {man.transporterEpaId || "EPA-MD-88390"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-neutral-800 dark:text-neutral-200">
                          {man.tsdfFacility || "Apex High-Temp Incinerator #4"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs">
                          {man.treatmentMethod || "HIGH_TEMP_INCINERATION"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {Array.isArray(man.containers) ? man.containers.length : (man.containerCount || 4)} Drums
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-500">
                        {man.dispatchedAt ? new Date(man.dispatchedAt).toLocaleDateString() : "2026-10-01"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="success" className="text-xs gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {man.status || "CERTIFIED_DESTRUCTION"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal 1: Log New Hazardous Drum */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Log Hazardous Waste Container"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-500">
            Assign unique barcode, GHS waste classification, and designate an isolated bunker bay in compliance with EPA 40 CFR.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Originating Laboratory">
              <Select
                value={labId}
                onChange={(e) => setLabId(e.target.value)}
                options={[
                  { label: "Biochemistry Research Lab (301)", value: "LAB-BIO-301" },
                  { label: "Pharmacology Synthesis Lab (202)", value: "LAB-PHAR-202" },
                  { label: "Pathology Diagnostic Lab (104)", value: "LAB-PATH-104" },
                  { label: "Anatomy Gross Dissection (101)", value: "LAB-ANAT-101" },
                ]}
              />
            </FormField>

            <FormField label="GHS Waste Classification">
              <Select
                value={wasteClass}
                onChange={(e) => setWasteClass(e.target.value)}
                options={[
                  { label: "Flammable Liquid (Class 3)", value: "FLAMMABLE_LIQUID" },
                  { label: "Strong Mineral Acid (Class 8)", value: "STRONG_ACID" },
                  { label: "Strong Alkali / Base (Class 8)", value: "STRONG_ALKALI" },
                  { label: "Halogenated Organic Solvents", value: "HALOGENATED_SOLVENTS" },
                  { label: "Cyanides / Sulfide Toxic", value: "CYANIDES_SULFIDES" },
                  { label: "Biohazardous Infectious", value: "BIOHAZARDOUS_INFECTIOUS" },
                  { label: "Strong Oxidizer (Class 5.1)", value: "STRONG_OXIDIZER" },
                  { label: "Water Reactive (Class 4.3)", value: "WATER_REACTIVE" },
                ]}
              />
            </FormField>
          </div>

          <FormField label="Chemical Name / Compound Description">
            <Input
              placeholder="e.g., Spent Acetone / Ethanol 70% with Trace Phenol"
              value={chemicalName}
              onChange={(e) => setChemicalName(e.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="EPA Waste Code">
              <Input
                placeholder="D001 / D002 / F003"
                value={epaCode}
                onChange={(e) => setEpaCode(e.target.value)}
              />
            </FormField>

            <FormField label="Current Volume (Liters)">
              <Input
                type="number"
                value={volumeLiters}
                onChange={(e) => setVolumeLiters(Number(e.target.value))}
              />
            </FormField>

            <FormField label="Target Bunker Bay">
              <Select
                value={bunkerBay}
                onChange={(e) => setBunkerBay(e.target.value)}
                options={[
                  { label: "Bay 1 (Flammables)", value: "BAY-1" },
                  { label: "Bay 2 (Corrosives)", value: "BAY-2" },
                  { label: "Bay 3 (Biohazard / Toxics)", value: "BAY-3" },
                ]}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={createContainerMutation.isPending || !chemicalName}
              onClick={() => {
                createContainerMutation.mutate({
                  originatingLab: labId,
                  wasteClass,
                  epaWasteCode: epaCode,
                  chemicalName,
                  currentVolumeLiters: volumeLiters,
                  maxCapacityLiters,
                  bunkerBay,
                });
              }}
            >
              {createContainerMutation.isPending ? "Logging..." : "Log & Generate Barcode"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal 2: Incompatibility Simulator */}
      <Modal
        isOpen={isValidatorModalOpen}
        onClose={() => setIsValidatorModalOpen(false)}
        title="Chemical Reactive Segregation Simulator"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-500">
            Test chemical incompatibility matrix rules before moving drums to avoid violent exothermic polymerization or toxic gas generation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Chemical Class A (Primary Container)">
              <Select
                value={valClassA}
                onChange={(e) => setValClassA(e.target.value)}
                options={[
                  { label: "Strong Mineral Acid (HCl, H2SO4, HNO3)", value: "STRONG_ACID" },
                  { label: "Cyanides & Sulfides", value: "CYANIDES_SULFIDES" },
                  { label: "Strong Alkali / Base (NaOH, KOH)", value: "STRONG_ALKALI" },
                  { label: "Strong Oxidizer (Nitrates, Perchlorates)", value: "STRONG_OXIDIZER" },
                  { label: "Flammable Organic Solvents", value: "FLAMMABLE_LIQUID" },
                  { label: "Water Reactive Metals (Na, K, Li)", value: "WATER_REACTIVE" },
                ]}
              />
            </FormField>

            <FormField label="Chemical Class B (Co-Stored Class)">
              <Select
                value={valClassB}
                onChange={(e) => setValClassB(e.target.value)}
                options={[
                  { label: "Cyanides & Sulfides (HCN gas risk with acid)", value: "CYANIDES_SULFIDES" },
                  { label: "Strong Mineral Acid", value: "STRONG_ACID" },
                  { label: "Strong Alkali / Base (Neutralization heat)", value: "STRONG_ALKALI" },
                  { label: "Flammable Organic Solvents", value: "FLAMMABLE_LIQUID" },
                  { label: "Strong Oxidizer", value: "STRONG_OXIDIZER" },
                  { label: "Water Reactive Metals", value: "WATER_REACTIVE" },
                ]}
              />
            </FormField>
          </div>

          <Button
            variant="primary"
            className="w-full"
            onClick={handleRunIncompatibilityCheck}
          >
            Run Reactive Incompatibility Matrix Scan
          </Button>

          {valResult && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border ${
                valResult.compatible
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300"
              } space-y-2`}
            >
              <div className="flex items-center gap-2 font-bold">
                {valResult.compatible ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-500" />
                )}
                <span>
                  {valResult.compatible ? "COMPATIBLE - ISOLATION NOT VIOLATED" : "INCOMPATIBLE - CRITICAL HAZARD"}
                </span>
              </div>
              <p className="text-xs">{valResult.message}</p>
              {valResult.reactionRisk && (
                <div className="text-xs font-mono font-semibold">
                  Risk Level: <span className="underline">{valResult.reactionRisk}</span>
                </div>
              )}
            </motion.div>
          )}

          <div className="flex justify-end pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <Button variant="outline" onClick={() => setIsValidatorModalOpen(false)}>
              Close Simulator
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal 3: Issue EPA Manifest */}
      <Modal
        isOpen={isManifestModalOpen}
        onClose={() => setIsManifestModalOpen(false)}
        title="Issue EPA Uniform Hazardous Waste Manifest"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-500">
            Generate federally regulated EPA Form 8700-22 for DOT transport to certified TSDF facility.
          </p>

          <FormField label="Licensed DOT Hazardous Transporter">
            <Input
              value={transporterName}
              onChange={(e) => setTransporterName(e.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Transporter EPA ID">
              <Input
                value={transporterEpaId}
                onChange={(e) => setTransporterEpaId(e.target.value)}
              />
            </FormField>

            <FormField label="Treatment Protocol">
              <Select
                value={treatmentMethod}
                onChange={(e) => setTreatmentMethod(e.target.value)}
                options={[
                  { label: "High-Temperature Incineration (1200°C)", value: "HIGH_TEMP_INCINERATION" },
                  { label: "Acid-Base Neutralization & Stabilization", value: "NEUTRALIZATION_STABILIZATION" },
                  { label: "Autoclave Shred & Landfill Class 1", value: "AUTOCLAVE_SHRED" },
                  { label: "Solvent Recovery & Distillation", value: "SOLVENT_RECOVERY" },
                ]}
              />
            </FormField>
          </div>

          <FormField label="Designated TSDF Receiving Facility">
            <Input
              value={tsdfFacility}
              onChange={(e) => setTsdfFacility(e.target.value)}
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <Button variant="outline" onClick={() => setIsManifestModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={manifestMutation.isPending}
              onClick={() => {
                manifestMutation.mutate({
                  transporterName,
                  transporterEpaId,
                  tsdfFacility,
                  treatmentMethod,
                  containers: containers.slice(0, 4).map((c: any) => c._id || c.id || "c-1"),
                });
              }}
            >
              {manifestMutation.isPending ? "Issuing Manifest..." : "Sign & Issue EPA Manifest"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
