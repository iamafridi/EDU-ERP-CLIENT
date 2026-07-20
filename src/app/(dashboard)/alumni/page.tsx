"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Calendar, HeartHandshake, Plus, CheckCircle2, X, Users, MapPin, DollarSign } from "lucide-react";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";

interface AlumniRow {
  id: string;
  name: string;
  email: string;
  graduationYear: number;
  department: string;
  currentPosition: string;
  phone: string;
}

interface EventRow {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  registeredCount: number;
  createdAt: string;
}

interface DonationRow {
  id: string;
  alumniName: string;
  amount: number;
  purpose: string;
  date: string;
  paymentMethod: string;
}

export default function AlumniPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"directory" | "events" | "donations">("directory");
  const [successMsg, setSuccessMsg] = useState("");
  const [isAlumniModalOpen, setIsAlumniModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [alumniForm, setAlumniForm] = useState({ name: "", email: "", graduationYear: "", department: "", currentPosition: "", phone: "" });
  const [eventForm, setEventForm] = useState({ title: "", description: "", date: "", location: "" });
  const [donationForm, setDonationForm] = useState({ alumniName: "", amount: 0, purpose: "", paymentMethod: "online" });

  const isAdminOrRegistrar = roleIs("domain-admin");

  const { data: alumni = [], isLoading: loadingAlumni } = useQuery<AlumniRow[]>({
    queryKey: ["alumni"],
    queryFn: api.getAlumni,
  });

  const { data: events = [], isLoading: loadingEvents } = useQuery<EventRow[]>({
    queryKey: ["alumniEvents"],
    queryFn: api.getAlumniEvents,
  });

  const { data: donations = [], isLoading: loadingDonations } = useQuery<DonationRow[]>({
    queryKey: ["alumniDonations"],
    queryFn: api.getAlumniDonations,
  });

  const createAlumniMutation = useMutation({
    mutationFn: api.createAlumni,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni"] });
      setSuccessMsg("Alumni profile created successfully.");
      setIsAlumniModalOpen(false);
      setAlumniForm({ name: "", email: "", graduationYear: "", department: "", currentPosition: "", phone: "" });
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const createEventMutation = useMutation({
    mutationFn: api.createAlumniEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumniEvents"] });
      setSuccessMsg("Event created successfully.");
      setIsEventModalOpen(false);
      setEventForm({ title: "", description: "", date: "", location: "" });
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const registerEventMutation = useMutation({
    mutationFn: ({ eventId, alumniId }: { eventId: string; alumniId: string }) => api.registerForEvent(eventId, alumniId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumniEvents"] });
      setSuccessMsg("Registered for event.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const createDonationMutation = useMutation({
    mutationFn: api.createDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumniDonations"] });
      setSuccessMsg("Donation recorded successfully.");
      setIsDonationModalOpen(false);
      setDonationForm({ alumniName: "", amount: 0, purpose: "", paymentMethod: "online" });
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleCreateAlumni = (e: React.FormEvent) => {
    e.preventDefault();
    createAlumniMutation.mutate({ ...alumniForm, graduationYear: parseInt(alumniForm.graduationYear) });
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    createEventMutation.mutate(eventForm);
  };

  const handleCreateDonation = (e: React.FormEvent) => {
    e.preventDefault();
    createDonationMutation.mutate(donationForm);
  };

  const totalDonations = donations.reduce((sum: number, d: DonationRow) => sum + d.amount, 0);

  const alumniColumns: Column<AlumniRow>[] = [
    {
      header: "Name",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-bold text-xs">
            {(typeof row.name === 'string' ? row.name : (row.name as any)?.firstName ?? '').charAt(0) || '?'}
          </div>
          <span className="font-semibold text-slate-800">{(typeof row.name === 'string' ? row.name : `${(row.name as any)?.firstName ?? ''} ${(row.name as any)?.lastName ?? ''}`.trim()) || ''}</span>
        </div>
      ),
    },
    { header: "Email", accessor: "email" },
    { header: "Graduation Year", accessor: (row) => <span className="font-mono font-semibold">{row.graduationYear}</span> },
    { header: "Department", accessor: "department" },
    { header: "Current Position", accessor: "currentPosition", className: "text-slate-500" },
    { header: "Phone", accessor: "phone", className: "font-mono text-slate-400" },
  ];

  const eventColumns: Column<EventRow>[] = [
    { header: "Event Title", accessor: "title", className: "font-semibold text-slate-700" },
    {
      header: "Date",
      accessor: (row) => (
        <span className="font-mono text-slate-600 flex items-center gap-1">
          <Calendar size={12} className="text-slate-400" />
          {row.date}
        </span>
      ),
    },
    {
      header: "Location",
      accessor: (row) => (
        <span className="flex items-center gap-1">
          <MapPin size={12} className="text-slate-400" />
          {row.location}
        </span>
      ),
    },
    {
      header: "Registered",
      accessor: (row) => (
        <span className="font-mono font-bold text-[#2563EB]">{row.registeredCount}</span>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <button
          onClick={() => registerEventMutation.mutate({ eventId: row.id, alumniId: "ALM-001" })}
          className="h-7 px-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold rounded text-[10px] transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
        >
          <Users size={12} /> Register
        </button>
      ),
    },
  ];

  const donationColumns: Column<DonationRow>[] = [
    { header: "Alumni Name", accessor: "alumniName", className: "font-semibold text-slate-700" },
    {
      header: "Amount",
      accessor: (row) => (
        <span className="font-mono font-bold text-emerald-600">${row.amount.toLocaleString()}</span>
      ),
    },
    { header: "Purpose", accessor: "purpose" },
    { header: "Date", accessor: "date", className: "font-mono text-slate-400" },
    { header: "Method", accessor: "paymentMethod", className: "capitalize text-slate-500" },
  ];

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="text-[#2563EB]" />
            Alumni Relations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage alumni directory, coordinate events, and track donations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "directory" && isAdminOrRegistrar && (
            <button
              onClick={() => setIsAlumniModalOpen(true)}
              className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-sm shadow-blue-500/10"
            >
              <Plus size={16} />
              Add Alumni
            </button>
          )}
          {activeTab === "events" && isAdminOrRegistrar && (
            <button
              onClick={() => setIsEventModalOpen(true)}
              className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-sm shadow-blue-500/10"
            >
              <Plus size={16} />
              Create Event
            </button>
          )}
          {activeTab === "donations" && (
            <button
              onClick={() => setIsDonationModalOpen(true)}
              className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-sm shadow-blue-500/10"
            >
              <Plus size={16} />
              Record Donation
            </button>
          )}
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

      <div className="flex border-b border-[#e1e2ed] gap-2">
        <button
          onClick={() => setActiveTab("directory")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "directory"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Users size={14} className="inline mr-1" />
          Alumni Directory
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "events"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Calendar size={14} className="inline mr-1" />
          Events
        </button>
        <button
          onClick={() => setActiveTab("donations")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "donations"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <HeartHandshake size={14} className="inline mr-1" />
          Donations
        </button>
      </div>

      {activeTab === "directory" ? (
        loadingAlumni ? (
          <TableSkeleton rows={5} cols={6} />
        ) : (
          <DataTable<AlumniRow>
            data={alumni}
            columns={alumniColumns}
            searchPlaceholder="Search alumni by name..."
            searchField="name"
          />
        )
      ) : activeTab === "events" ? (
        loadingEvents ? (
          <TableSkeleton rows={5} cols={6} />
        ) : (
          <DataTable<EventRow>
            data={events}
            columns={eventColumns}
            searchPlaceholder="Search events..."
            searchField="title"
          />
        )
      ) : (
        loadingDonations ? (
          <TableSkeleton rows={5} cols={6} />
        ) : (
          <div className="space-y-6">
            <div className="bg-white border border-[#e1e2ed] p-6 rounded-xl shadow-sm space-y-2">
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign size={14} className="text-emerald-500" />
                Total Donations Collected
              </span>
              <span className="text-3xl font-bold text-emerald-600 font-mono block">
                ${totalDonations.toLocaleString()}
              </span>
            </div>

            <DataTable<DonationRow>
              data={donations}
              columns={donationColumns}
              searchPlaceholder="Search donations..."
              searchField="alumniName"
            />
          </div>
        )
      )}

      <AnimatePresence>
        {isAlumniModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Add Alumni Profile</span>
                <button
                  onClick={() => setIsAlumniModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateAlumni} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Full Name</label>
                    <input
                      type="text"
                      value={alumniForm.name}
                      onChange={(e) => setAlumniForm({ ...alumniForm, name: e.target.value })}
                      placeholder="Full name"
                      required
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Email</label>
                    <input
                      type="email"
                      value={alumniForm.email}
                      onChange={(e) => setAlumniForm({ ...alumniForm, email: e.target.value })}
                      placeholder="email@alumni.edu"
                      required
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Graduation Year</label>
                    <input
                      type="number"
                      min="1900"
                      max="2030"
                      value={alumniForm.graduationYear}
                      onChange={(e) => setAlumniForm({ ...alumniForm, graduationYear: e.target.value })}
                      required
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Department</label>
                    <input
                      type="text"
                      value={alumniForm.department}
                      onChange={(e) => setAlumniForm({ ...alumniForm, department: e.target.value })}
                      placeholder="e.g. MBBS"
                      required
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Current Position</label>
                    <input
                      type="text"
                      value={alumniForm.currentPosition}
                      onChange={(e) => setAlumniForm({ ...alumniForm, currentPosition: e.target.value })}
                      placeholder="e.g. Senior Resident"
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Phone</label>
                    <input
                      type="text"
                      value={alumniForm.phone}
                      onChange={(e) => setAlumniForm({ ...alumniForm, phone: e.target.value })}
                      placeholder="+1 555-xxxx"
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button
                    type="button"
                    onClick={() => setIsAlumniModalOpen(false)}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"
                  >
                    <GraduationCap size={14} />
                    Add Alumni
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEventModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Create Alumni Event</span>
                <button
                  onClick={() => setIsEventModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Event Title</label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    placeholder="e.g. Annual Medical Symposium"
                    required
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Description</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    placeholder="Brief description of the event..."
                    className="w-full h-20 px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Date</label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      required
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Location</label>
                    <input
                      type="text"
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      placeholder="e.g. Main Auditorium"
                      required
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button
                    type="button"
                    onClick={() => setIsEventModalOpen(false)}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"
                  >
                    <Calendar size={14} />
                    Create Event
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDonationModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Record Donation</span>
                <button
                  onClick={() => setIsDonationModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateDonation} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Alumni Name</label>
                  <input
                    type="text"
                    value={donationForm.alumniName}
                    onChange={(e) => setDonationForm({ ...donationForm, alumniName: e.target.value })}
                    placeholder="Full name"
                    required
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Amount ($)</label>
                  <input
                    type="number"
                    min="1"
                    value={donationForm.amount}
                    onChange={(e) => setDonationForm({ ...donationForm, amount: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Purpose</label>
                  <input
                    type="text"
                    value={donationForm.purpose}
                    onChange={(e) => setDonationForm({ ...donationForm, purpose: e.target.value })}
                    placeholder="e.g. Scholarship Fund"
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Payment Method</label>
                  <select
                    value={donationForm.paymentMethod}
                    onChange={(e) => setDonationForm({ ...donationForm, paymentMethod: e.target.value })}
                    className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                  >
                    <option value="online">Online Payment</option>
                    <option value="bank-transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button
                    type="button"
                    onClick={() => setIsDonationModalOpen(false)}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"
                  >
                    <HeartHandshake size={14} />
                    Record Donation
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
