"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePermission } from "@/hooks/usePermission";
import {
  PageHeader,
  Card,
  Modal,
  FormField,
  Input,
  Select,
  Textarea,
  Button,
  IconButton,
  Badge,
  type Tone,
} from "@/components/ui";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion } from "framer-motion";
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Users,
} from "lucide-react";

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
  { id: "CE-002", title: "National Independence Day", date: "2026-08-15", type: "holiday", description: "National holiday - College offices & classes suspended", targetAudience: "All" },
  { id: "CE-003", title: "Faculty Meeting - Curriculum Review", date: "2026-08-20", type: "meeting", description: "Review of new curriculum changes & modular blocks", location: "Conference Hall A", targetAudience: "Faculty" },
  { id: "CE-004", title: "Semester Registration Deadline", date: "2026-08-25", type: "deadline", description: "Last date for Fall 2026 semester fee clearance & registration", targetAudience: "Students" },
  { id: "CE-005", title: "Annual Campus Sports & Cultural Week", date: "2026-09-01", endDate: "2026-09-02", type: "event", description: "Annual inter-batch football, cricket, and cultural evening", location: "Sports Pavilion", targetAudience: "All" },
  { id: "CE-006", title: "MBBS Year 2 - Physiology Final Exam", date: "2026-09-10", endDate: "2026-09-15", type: "exam", description: "Final assessment for Physiology - Block II", targetAudience: "MBBS Year 2" },
  { id: "CE-007", title: "Victory Day Observance", date: "2026-10-02", type: "holiday", description: "Official national holiday", targetAudience: "All" },
  { id: "CE-008", title: "Medical Research & Clinical Symposium", date: "2026-10-10", type: "event", description: "Faculty research presentation and keynote speeches", location: "Central Auditorium", targetAudience: "Faculty, Students" },
];

const TYPE_CONFIG: Record<
  string,
  { label: string; tone: Tone; icon: React.ElementType }
> = {
  exam: { label: "Exam", tone: "danger", icon: AlertCircle },
  holiday: { label: "Holiday", tone: "success", icon: Calendar },
  event: { label: "Event", tone: "info", icon: Calendar },
  deadline: { label: "Deadline", tone: "warning", icon: Clock },
  meeting: { label: "Meeting", tone: "outline", icon: MapPin },
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
    type: "event" as CalendarEvent["type"],
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
      setSuccessMsg("Event added to academic calendar.");
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
      setSuccessMsg("Event removed from academic calendar.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setForm({
      title: "",
      date: "",
      endDate: "",
      type: "event",
      description: "",
      location: "",
      targetAudience: "All",
    });
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
    setForm({
      title: "",
      date: "",
      endDate: "",
      type: "event",
      description: "",
      location: "",
      targetAudience: "All",
    });
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

  const upcomingEvents = filtered
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastEvents = filtered
    .filter((e) => new Date(e.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const examCount = events.filter((e) => e.type === "exam").length;
  const holidayCount = events.filter((e) => e.type === "holiday").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Calendar & Milestones"
        description="Important semester schedules, examination dates, institutional holidays, and campus events."
        badge={<Badge tone="gold">Academic Year 2026</Badge>}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex bg-surface-muted/50 p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-surface text-text shadow-sm"
                    : "text-text-muted hover:text-text"
                }`}
              >
                List View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  viewMode === "calendar"
                    ? "bg-surface text-text shadow-sm"
                    : "text-text-muted hover:text-text"
                }`}
              >
                Calendar View
              </button>
            </div>
            {isEditor && (
              <Button
                variant="gold"
                onClick={openCreate}
                className="flex items-center gap-2"
              >
                <Plus size={16} /> Add Event
              </Button>
            )}
          </div>
        }
      />

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Total Events</span>
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-text">{events.length}</div>
          <p className="text-[11px] text-text-muted">Academic year calendar entries</p>
        </Card>

        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Exams Scheduled</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-600 dark:text-red-400">
            {examCount}
          </div>
          <p className="text-[11px] text-text-muted">Formative &amp; summative assessments</p>
        </Card>

        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Holidays &amp; Recesses</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {holidayCount}
          </div>
          <p className="text-[11px] text-text-muted">National &amp; institutional closures</p>
        </Card>

        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Upcoming Milestones</span>
            <Clock className="w-4 h-4 text-gold" />
          </div>
          <div className="text-2xl font-bold font-mono text-text">
            {upcomingEvents.length}
          </div>
          <p className="text-[11px] text-text-muted">Imminent deadlines &amp; events</p>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card pad="sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider mr-2">
            Filter Type:
          </span>
          <Button
            size="sm"
            variant={filterType === "" ? "primary" : "outline"}
            onClick={() => setFilterType("")}
          >
            All ({events.length})
          </Button>
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
            const count = events.filter((e) => e.type === key).length;
            const active = filterType === key;
            return (
              <Button
                key={key}
                size="sm"
                variant={active ? "primary" : "outline"}
                onClick={() => setFilterType(active ? "" : key)}
              >
                {cfg.label} ({count})
              </Button>
            );
          })}
        </div>
      </Card>

      {isLoading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : viewMode === "list" ? (
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card pad="none" className="overflow-hidden">
            <div className="p-4 border-b border-border bg-surface-muted/30 flex items-center justify-between">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Upcoming Academic Events ({upcomingEvents.length})
              </span>
            </div>
            <div className="divide-y divide-border">
              {upcomingEvents.length === 0 ? (
                <div className="p-8 text-center text-text-muted text-xs">
                  No upcoming events for the selected criteria.
                </div>
              ) : (
                upcomingEvents.map((event) => {
                  const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG.event;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={event.id}
                      className="p-4 hover:bg-surface-muted/20 transition-colors flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-surface-muted border border-border flex items-center justify-center shrink-0">
                          <Icon size={18} className="text-primary" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-text">{event.title}</h3>
                            <Badge tone={cfg.tone}>{cfg.label}</Badge>
                          </div>
                          <p className="text-xs text-text-muted">{event.description}</p>
                          <div className="flex flex-wrap items-center gap-4 text-[11px] text-text-muted pt-1">
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar size={12} />
                              {new Date(event.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                              {event.endDate &&
                                ` – ${new Date(event.endDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}`}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={12} /> {event.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users size={12} /> Audience: {event.targetAudience}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isEditor && (
                        <div className="flex items-center gap-1 shrink-0">
                          <IconButton
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(event)}
                            title="Edit Event"
                          >
                            <Pencil size={13} />
                          </IconButton>
                          <IconButton
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              if (confirm("Delete this event?")) deleteMutation.mutate(event.id);
                            }}
                            title="Delete Event"
                          >
                            <Trash2 size={13} />
                          </IconButton>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <Card pad="none" className="overflow-hidden opacity-80">
              <div className="p-4 border-b border-border bg-surface-muted/30">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Past Academic Milestones ({pastEvents.length})
                </span>
              </div>
              <div className="divide-y divide-border">
                {pastEvents.map((event) => {
                  const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG.event;
                  return (
                    <div
                      key={event.id}
                      className="p-4 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <Badge tone={cfg.tone}>{cfg.label}</Badge>
                        <span className="font-semibold text-text">{event.title}</span>
                        <span className="text-[11px] font-mono text-text-muted">
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-[11px] text-text-muted">{event.targetAudience}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      ) : (
        /* Calendar View Preview */
        <Card pad="lg" className="text-center py-16 space-y-3">
          <Calendar size={48} className="text-text-muted/40 mx-auto" />
          <h3 className="text-base font-bold text-text">Calendar Grid View</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Calendar matrix synchronized with Google/Apple iCal feeds. Switch to List view to manage and filter events.
          </p>
          <Button variant="outline" size="sm" onClick={() => setViewMode("list")}>
            Return to List View
          </Button>
        </Card>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editItem ? "Edit Academic Event" : "Add Calendar Event"}
        subtitle="Schedule an assessment, institutional recess, holiday, or campus ceremony."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Event Title" required>
            <Input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Midterm Examination - Physiology Block"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Start Date" required>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </FormField>

            <FormField label="End Date (Optional)">
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Event Classification" required>
              <Select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as CalendarEvent["type"] })
                }
                options={[
                  { value: "exam", label: "Examination" },
                  { value: "holiday", label: "Holiday / Recess" },
                  { value: "event", label: "Campus Event" },
                  { value: "deadline", label: "Administrative Deadline" },
                  { value: "meeting", label: "Faculty / Academic Meeting" },
                ]}
              />
            </FormField>

            <FormField label="Target Audience">
              <Select
                value={form.targetAudience}
                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                options={[
                  { value: "All", label: "All Students & Faculty" },
                  { value: "Students", label: "All Students" },
                  { value: "Faculty", label: "Faculty Members" },
                  { value: "Staff", label: "Administrative Staff" },
                  { value: "MBBS Year 1", label: "MBBS Phase I" },
                  { value: "MBBS Year 2", label: "MBBS Phase II" },
                ]}
              />
            </FormField>
          </div>

          <FormField label="Location / Venue">
            <Input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Central Auditorium / Exam Hall A"
            />
          </FormField>

          <FormField label="Description">
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide event details, instructions, or prerequisites..."
              rows={2}
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editItem ? "Update Event" : "Add Event"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
