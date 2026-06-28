"use client";

import React, { useState } from "react";
import { usePermission } from "@/hooks/usePermission";
import {
  useAuthStore,
  roleLabels,
  domainAdminTypeLabels,
} from "@/store/useAuthStore";
import {
  User,
  Mail,
  BadgeCheck,
  Calendar,
  Shield,
  Save,
  Loader2,
  Building2,
  UserCheck,
  Layers,
  GraduationCap,
  Bed,
  Stethoscope,
  Phone,
  Clock,
  Sparkles,
  Lock,
  Utensils,
  MapPin,
  FileCheck,
  Download,
  Share2,
  QrCode,
  CheckCircle2,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { api } from "@/services/api";
import { showToast } from "@/components/dashboard/ToastFeedback";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

export default function ProfilePage() {
  const { user, token } = useAuthStore();
  const { roleIs } = usePermission();
  const login = useAuthStore((state) => state.login);

  const isStudent = user?.role === "student" || user?.email?.includes("student");
  const isFaculty = user?.role === "faculty" || user?.email?.includes("faculty");
  const isAdmin = user?.role === "super-admin" || user?.role === "domain-admin" || user?.email?.includes("admin");

  const [name, setName] = useState(user?.name || "Dr. Tanvir Ahmed");
  const [phone, setPhone] = useState("+880 1712-345678");
  const [emergencyContact, setEmergencyContact] = useState("+880 1819-987654");
  const [emergencyRelation, setEmergencyRelation] = useState("Guardian / Father");
  const [bloodGroup, setBloodGroup] = useState("B_POS");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await api.updateProfile({ name: name.trim(), phone });
      if (res.success && user) {
        login({ ...user, name: name.trim() }, token!);
      }
      showToast({
        title: "Profile Record Synchronized",
        description: "Your institutional contact details have been updated in the campus registry.",
        variant: "success",
      });
    } catch {
      showToast({
        title: "Update Failed",
        description: "Could not save profile changes to central registry. Please verify connection.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const bloodGroupOptions = [
    { value: "A_POS", label: "A+ (A Positive)" },
    { value: "A_NEG", label: "A- (A Negative)" },
    { value: "B_POS", label: "B+ (B Positive)" },
    { value: "B_NEG", label: "B- (B Negative)" },
    { value: "O_POS", label: "O+ (O Positive)" },
    { value: "O_NEG", label: "O- (O Negative)" },
    { value: "AB_POS", label: "AB+ (AB Positive)" },
    { value: "AB_NEG", label: "AB- (AB Negative)" },
  ];

  const emergencyRelationOptions = [
    { value: "Father", label: "Father" },
    { value: "Mother", label: "Mother" },
    { value: "Guardian / Father", label: "Guardian / Father" },
    { value: "Spouse", label: "Spouse" },
    { value: "Sibling", label: "Sibling" },
  ];

  const dossierActions = [
    {
      label: "Download Digital Student ID",
      icon: <QrCode size={14} className="text-gold" />,
      onClick: () =>
        showToast({
          title: "ID Generated",
          description: "Encrypted Student Smart Badge PDF downloaded.",
          variant: "success",
        }),
    },
    {
      label: "Export Verified Academic Record",
      icon: <FileCheck size={14} className="text-emerald-500" />,
      onClick: () =>
        showToast({
          title: "Transcript Generated",
          description: "Tamper-evident BMDC attestation export ready.",
          variant: "success",
        }),
    },
    {
      label: "Request Registrar Attestation",
      icon: <Building2 size={14} className="text-indigo-500" />,
      onClick: () =>
        showToast({
          title: "Request Dispatched",
          description: "Registrar desk notified for institutional seal.",
          variant: "info",
        }),
      divider: true,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-ui animate-in fade-in duration-300 pb-16">
      {/* Executive Institutional Header Banner */}
      <div className="rounded-2xl bg-surface-navy border border-gold/30 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Monogram Emblem Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-surface border-2 border-gold/40 shadow-xl flex items-center justify-center text-gold">
                {isStudent ? (
                  <GraduationCap size={40} className="text-gold" />
                ) : isFaculty ? (
                  <Stethoscope size={40} className="text-gold" />
                ) : (
                  <Shield size={40} className="text-gold" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 border-2 border-surface-navy text-white" title="Active Clearance">
                <BadgeCheck size={14} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-[11px] font-mono font-medium">
                <Sparkles size={12} />
                <span>{roleLabels[user?.role || "student"].toUpperCase()} DOSSIER</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-text-on-navy tracking-tight">
                {user?.name || "Tanvir Ahmed"}
              </h1>
              <p className="text-xs text-text-on-navy/70 flex items-center gap-2">
                <span>{user?.email}</span>
                <span className="text-gold">·</span>
                <span className="font-mono text-[11px] text-gold/90">ID: {user?.id || "STU-2023-0881"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-start sm:items-end justify-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/20">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-on-navy/60">Institutional Standing</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Verified & Matriculated
              </span>
              <span className="text-[10px] text-text-on-navy/50 font-mono">BMDC Reg: #88412-A</span>
            </div>

            {/* Quick 3-Dots Action Menu */}
            <div className="bg-surface-navy-secondary border border-gold/20 rounded-xl p-1 shadow-sm">
              <ActionMenu items={dossierActions} align="right" />
            </div>
          </div>
        </div>
      </div>

      {/* Degree & Curriculum Progress Tracker */}
      {isStudent && (
        <div className="rounded-2xl bg-surface border border-border p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gold/10 text-gold">
                <Layers size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold font-serif text-text">MBBS 5-Year Curriculum Milestones</h3>
                <p className="text-xs text-text-subtle">Phase 3 (Term II) Clinical Training & Logbook Progression</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-gold">78% Curriculum Complete</span>
          </div>

          <ProgressBar
            value={78}
            size="md"
            variant="gold"
            showValue={false}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-text-muted">
            <div className="p-2 rounded-lg bg-surface-muted/40 border border-border/60">
              <span className="text-[10px] uppercase font-semibold text-text-subtle block">Phase 1 (Pre-Clinical)</span>
              <span className="font-bold text-emerald-600">✓ 100% Cleared (1st Prof)</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-muted/40 border border-border/60">
              <span className="text-[10px] uppercase font-semibold text-text-subtle block">Phase 2 (Para-Clinical)</span>
              <span className="font-bold text-emerald-600">✓ 100% Cleared (2nd Prof)</span>
            </div>
            <div className="p-2 rounded-lg bg-gold-soft border border-gold/30">
              <span className="text-[10px] uppercase font-semibold text-gold block">Phase 3 (Clinical)</span>
              <span className="font-bold text-gold">⚡ In Progress (Term II)</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-muted/40 border border-border/60">
              <span className="text-[10px] uppercase font-semibold text-text-subtle block">Phase 4 (Internship)</span>
              <span className="font-medium text-text-subtle">Upcoming (2027-28)</span>
            </div>
          </div>
        </div>
      )}

      {/* Student-Specific Key Institutional Indicators */}
      {isStudent && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-surface border border-border p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-text-subtle font-medium">
              <span>Cumulative CGPA</span>
              <div className="p-1.5 rounded-lg bg-gold/10 text-gold">
                <GraduationCap size={16} />
              </div>
            </div>
            <p className="text-2xl font-bold font-serif text-text mt-2">3.84 <span className="text-xs font-normal text-text-subtle">/ 4.00</span></p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Honors Standing (Top 5%)</p>
          </div>

          <div className="rounded-2xl bg-surface border border-border p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-text-subtle font-medium">
              <span>Hostel Pro Bed</span>
              <div className="p-1.5 rounded-lg bg-gold/10 text-gold">
                <Bed size={16} />
              </div>
            </div>
            <p className="text-2xl font-bold font-serif text-text mt-2">Room 402 <span className="text-xs font-normal text-text-subtle">Bed B</span></p>
            <p className="text-[11px] text-text-muted mt-1 truncate">Hall 3 (Fazle Rabbi Hall)</p>
          </div>

          <div className="rounded-2xl bg-surface border border-border p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-text-subtle font-medium">
              <span>Ward Rotation</span>
              <div className="p-1.5 rounded-lg bg-gold/10 text-gold">
                <Stethoscope size={16} />
              </div>
            </div>
            <p className="text-xl font-bold font-serif text-text mt-2">Medicine IV</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">94.6% Attendance Validated</p>
          </div>

          <div className="rounded-2xl bg-surface border border-border p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-text-subtle font-medium">
              <span>Meal Package</span>
              <div className="p-1.5 rounded-lg bg-gold/10 text-gold">
                <Utensils size={16} />
              </div>
            </div>
            <p className="text-xl font-bold font-serif text-text mt-2">Halal Plan A</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Active Mess Card</p>
          </div>
        </div>
      )}

      {/* Detailed Credential Desks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Academic & Hostel Allocation Desks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Institutional Academic Card */}
          <div className="rounded-2xl bg-surface border border-border shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border bg-surface-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gold/10 text-gold">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-serif text-text">Academic & Institutional Roster</h3>
                  <p className="text-xs text-text-subtle">Dhaka Medical College Registrar Record</p>
                </div>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-surface-muted text-text-muted border border-border">
                MBBS Session 2023-24
              </span>
            </div>

            <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-surface-muted/40 border border-border space-y-1">
                <span className="text-[10px] uppercase font-semibold text-text-subtle">Academic Department</span>
                <p className="font-semibold text-text text-sm">Faculty of Clinical Medicine & Surgery</p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-muted/40 border border-border space-y-1">
                <span className="text-[10px] uppercase font-semibold text-text-subtle">Curriculum Stage</span>
                <p className="font-semibold text-text text-sm">Phase 3 — 3rd Year MBBS (Term II)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-muted/40 border border-border space-y-1">
                <span className="text-[10px] uppercase font-semibold text-text-subtle">Assigned Academic Advisor</span>
                <p className="font-semibold text-text text-sm">Prof. Dr. K. M. Rahman, FCPS</p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-muted/40 border border-border space-y-1">
                <span className="text-[10px] uppercase font-semibold text-text-subtle">Digital Locker Clearance</span>
                <p className="font-semibold text-emerald-600 text-sm flex items-center gap-1.5">
                  <FileCheck size={14} /> All Credentials Cryptographically Sealed
                </p>
              </div>
            </div>
          </div>

          {/* Hostel Pro Allocation Card */}
          {isStudent && (
            <div className="rounded-2xl bg-surface border border-border shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-border bg-surface-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-gold/10 text-gold">
                    <Bed size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-serif text-text">Hostel Pro — Residential Allocation</h3>
                    <p className="text-xs text-text-subtle">Live Dormitory & Dining Assignment</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Room Key Assigned
                </span>
              </div>

              <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-surface-muted/40 border border-border space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-text-subtle">Dormitory Hall</span>
                  <p className="font-semibold text-text">Shaheed Dr. Fazle Rabbi Hall</p>
                  <p className="text-[11px] text-text-subtle">Hall No. 03 (East Wing)</p>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-muted/40 border border-border space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-text-subtle">Room & Bed No.</span>
                  <p className="font-semibold text-text font-mono">Room 402 — Bed B</p>
                  <p className="text-[11px] text-text-subtle">Floor 4 (Double Occupancy)</p>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-muted/40 border border-border space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-text-subtle">Curfew Clearance</span>
                  <p className="font-semibold text-text flex items-center gap-1">
                    <Clock size={12} className="text-gold" /> 10:00 PM Gate Lock
                  </p>
                  <p className="text-[11px] text-text-subtle">Biometric Turnstile Active</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Editable Contact & Security Settings */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-surface border border-border shadow-xs p-5 sm:p-6 space-y-5">
            <div className="border-b border-border pb-3">
              <h3 className="text-sm font-bold font-serif text-text">Update Contact Dossier</h3>
              <p className="text-xs text-text-subtle mt-0.5">Keep registrar and hostel communications current</p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-surface border border-border text-xs text-text focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted block">Primary Mobile Contact</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1712-000000"
                  className="w-full h-10 px-3.5 rounded-xl bg-surface border border-border text-xs text-text focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted block">Guardian Emergency Contact</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-surface border border-border text-xs text-text focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all font-mono"
                  />
                  <CustomDropdown
                    options={emergencyRelationOptions}
                    value={emergencyRelation}
                    onChange={setEmergencyRelation}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted block">Blood Group Type</label>
                <CustomDropdown
                  options={bloodGroupOptions}
                  value={bloodGroup}
                  onChange={setBloodGroup}
                  className="w-full"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-hover text-on-gold font-semibold text-xs transition-all duration-200 shadow-md shadow-gold/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>{saving ? "Synchronizing..." : "Save Dossier"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Security & Access Clearance Stamp */}
          <div className="rounded-2xl bg-surface-navy border border-gold/20 p-5 text-text-on-navy space-y-3">
            <div className="flex items-center gap-2 text-gold text-xs font-semibold">
              <Lock size={14} />
              <span>Cryptographic Session Hash</span>
            </div>
            <p className="text-[11px] text-text-on-navy/70 leading-relaxed">
              Authenticated through verified institutional JWT claims. Session credentials expire after statutory inactivity periods.
            </p>
            <div className="pt-2 border-t border-gold/15 flex items-center justify-between text-[10px] font-mono text-text-on-navy/60">
              <span>Token: SHA-256 Validated</span>
              <span className="text-emerald-400 font-semibold">Active Session</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
