"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePermission } from "@/hooks/usePermission";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Plus, Pencil, Trash2, CheckCircle2, X, Clock, AlertCircle, MapPin } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: "exam" | "holiday" | "event" | "deadline" | "meeting";
  description: string;
  location?: string;
  targetAudience: string;
}

const MOCK_EVENTS: CalendarEvent[] = [
  { id: "CE-001", title: "MBBS Year 1 - Anatomy Internal Exam", date: "2026-08-15", type: "exam", description: "Internal assessment for Anatomy - I", targetAudience: "MBBS Year 1" },
  { id: "CE-002", title: "Independence Day", date: "2026-08-15", type: "holiday", description: "National holiday - College closed", targetAudience: "All" },
  { id: "CE-003", title: "Faculty Meeting - Curriculum Review", date: "2026-08-20", type: "meeting", description: "Review of new curriculum changes", location: "Conference Hall A", targetAudience: "Faculty" },
  { id: "CE-004", title: "Semester Registration Deadline", date: "2026-08-25", type: "deadline", description: "Last date for Fall 2026 semester registration", targetAudience: "Students" },
  { id: "CE-005", title: "Annual Sports Day", date: "2026-09-01", endDate: "2026-09-02", type: "event", description: "Annual inter-department sports competition", location: "Sports Ground", targetAudience: "All" },
  { id: "CE-006", title: "MBBS Year 2 - Physiology Final Exam", date: "2026-09-10", endDate: "2026-09-15", type: "exam", description: "Final examination for Physiology - II", targetAudience: "MBBS Year 2" },
  { id: "CE-007", title: "Gandhi Jayanti", date: "2026-10-02", type: "holiday", description: "National holiday - College closed", targetAudience: "All" },
  { id: "CE-008", title: "Research Symposium", date: "2026-10-10", type: "event", description: "Annual research presentation symposium", location: "Auditorium", targetAudience: "Faculty, Students" },
];

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  exam: { label: "Exam", color: "text-red-700", bg: "bg-red-50", icon: AlertCircle },
  holiday: { label: "Holiday", color: "text-emerald-700", bg: "bg-emerald-50", icon: Calendar },
  event: { label: "Event", color: "text-purple-700", bg: "bg-purple-50", icon: Calendar },
  deadline: { label: "Deadline", color: "text-amber-700", bg: "bg-amber-50", icon: Clock },
  meeting: { label: "Meeting", color: "text-blue-700", bg: "bg-blue-50", icon: MapPin },
};

export default function AcademicCalendarPage() {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<CalendarEvent | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [filterType, setFilterType] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [form, setForm] = useState({
    title: "",
    date: "",
    endDate: "",
    type: "event",
    description: "",
    location: "",
    targetAudience: "All",
  });

  const isEditor = can("update", "academic-calendar");

  const { data: events = MOCK_EVENTS, isLoading } = useQuery({
    queryKey: ["academic-calendar"],
    queryFn: async () => MOCK_EVENTS,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return { success: true, data: { id: `CE-${Date.now()}`, ...payload } };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-calendar"] });
      closeModal();
      setSuccessMsg("Event added to calendar.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-calendar"] });
      closeModal();
      setSuccessMsg("Event updated successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-calendar"] });
      setSuccessMsg("Event removed from calendar.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setForm({ title: "", date: "", endDate: "", type: "event", description: "", location: "", targetAudience: "All" });
  };

  const openEdit = (item: CalendarEvent) => {
    setEditItem(item);
    setForm({
      title: item.title,
      date: item.date,
      endDate: item.endDate || "",
      type: item.type,
      description: item.description,
      location: item.location || "",
      targetAudience: item.targetAudience,
    });
    setShowModal(true);
  };

  const openCreate = () => {
    setForm({ title: "", date: "", endDate: "", type: "event", description: "", location: "", targetAudience: "All" });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) updateMutation.mutate({ id: editItem.id, data: form });
    else createMutation.mutate(form);
  };

  const filtered = events.filter((e: CalendarEvent) => {
    if (filterType && e.type !== filterType) return false;
    return true;
  });

  const upcomingEvents = filtered.filter((e) => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastEvents = filtered.filter((e) => new Date(e.date) < new Date()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const examCount = events.filter((e) => e.type === "exam").length;
  const holidayCount = events.filter((e) => e.type === "holiday").length;

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="text-[#2563EB]" />
            Academic Calendar
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Important dates, holidays, exams, and events.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-[#e1e2ed] rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${viewMode === "list" ? "bg-[#2563EB] text-white" : "text-slate-500 hover:bg-slate-50"}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${viewMode === "calendar" ? "bg-[#2563EB] text-white" : "text-slate-500 hover:bg-slate-50"}`}
            >
              Calendar
            </button>
          </div>
          {isEditor && (
            <button
              onClick={openCreate}
              className="h-9 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus size={14} /> Add Event
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
          <CheckCircle2 size={16} className="text-emerald-600" /> {successMsg}
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-[#e1e2ed] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Calendar size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{events.length}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Events</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#e1e2ed] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{examCount}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Exams</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#e1e2ed] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Calendar size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{holidayCount}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Holidays</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#e1e2ed] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Clock size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{upcomingEvents.length}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Upcoming</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border border-[#e1e2ed] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase">Filter:</span>
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setFilterType(filterType === key ? "" : key)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                filterType === key
                  ? `${cfg.bg} ${cfg.color} border border-current`
                  : "bg-slate-50 text-slate-400 border border-transparent hover:bg-slate-100"
              }`}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : viewMode === "list" ? (
        <div className="space-y-6">
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Upcoming Events ({upcomingEvents.length})
                </span>
              </div>
              <div className="divide-y divide-[#e1e2ed]">
                {upcomingEvents.map((event) => {
                  const cfg = TYPE_CONFIG[event.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={event.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                          <Icon size={18} className={cfg.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-slate-800">{event.title}</h3>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mb-1">{event.description}</p>
                          <div className="flex items-center gap-4 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(event.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                              {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={12} /> {event.location}
                              </span>
                            )}
                            <span>{event.targetAudience}</span>
                          </div>
                        </div>
                        {isEditor && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(event)}
                              className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-[#2563EB] transition-colors cursor-pointer"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => { if (confirm("Delete this event?")) deleteMutation.mutate(event.id); }}
                              className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm opacity-75">
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Past Events ({pastEvents.length})
                </span>
              </div>
              <div className="divide-y divide-[#e1e2ed]">
                {pastEvents.map((event) => {
                  const cfg = TYPE_CONFIG[event.type];
                  return (
                    <div key={event.id} className="p-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <h3 className="text-sm font-semibold text-slate-600">{event.title}</h3>
                        <span className="text-[10px] text-slate-400">
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Calendar View Placeholder */
        <div className="bg-white border border-[#e1e2ed] rounded-xl p-12 text-center">
          <Calendar size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-500">Calendar View</p>
          <p className="text-xs text-slate-400 mt-1">Full calendar integration coming soon.</p>
          <p className="text-[10px] text-slate-300 mt-2">Use List view to see all events.</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">{editItem ? "Edit Event" : "Add Event"}</span>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Event title"
                    required
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Start Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      required
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">End Date (optional)</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                    >
                      <option value="exam">Exam</option>
                      <option value="holiday">Holiday</option>
                      <option value="event">Event</option>
                      <option value="deadline">Deadline</option>
                      <option value="meeting">Meeting</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Target Audience</label>
                    <select
                      value={form.targetAudience}
                      onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                    >
                      <option value="All">All</option>
                      <option value="Students">Students</option>
                      <option value="Faculty">Faculty</option>
                      <option value="Staff">Staff</option>
                      <option value="MBBS Year 1">MBBS Year 1</option>
                      <option value="MBBS Year 2">MBBS Year 2</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Event description"
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Location (optional)</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Auditorium, Conference Hall, etc."
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {editItem ? "Update Event" : "Add Event"}
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
