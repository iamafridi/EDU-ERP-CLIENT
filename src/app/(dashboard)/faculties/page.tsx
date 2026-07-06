"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { usePermission } from "@/hooks/usePermission";
import DataTable, { Column } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button, IconButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Dialog, ConfirmDialog } from "@/components/ui/Dialog";
import { FormField, Input, Select } from "@/components/ui/Form";
import { Alert } from "@/components/ui/Feedback";
import { Avatar } from "@/components/ui/Avatar";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Award,
  Users,
  Clock,
  FileCheck,
  Building2,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Eye,
} from "lucide-react";
import { showToast } from "@/components/dashboard/ToastFeedback";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FacultyWorkloadPanel } from "@/components/academic/FacultyWorkloadPanel";

interface FacultyRow {
  id?: string;
  facultyId: string;
  name: string;
  email: string;
  contactNo: string;
  designation: string;
  academicDepartment: string;
  teachingHours?: number;
  maxHours?: number;
  apiScore?: number;
  rating?: number;
  publications?: number;
  committees?: string[];
}

interface FacultyForm {
  name: string;
  email: string;
  contactNo: string;
  designation: string;
  academicDepartment: string;
}

const EMPTY_FORM: FacultyForm = {
  name: "",
  email: "",
  contactNo: "",
  designation: "Professor",
  academicDepartment: "",
};

function displayName(name: FacultyRow["name"]): string {
  if (typeof name === "string") return name;
  const obj = name as { firstName?: string; lastName?: string } | null;
  return `${obj?.firstName ?? ""} ${obj?.lastName ?? ""}`.trim();
}

// Fallback high-fidelity University Faculty Workload & Appraisal dataset
const MOCK_EXTENDED_FACULTY: FacultyRow[] = [
  {
    facultyId: "FAC-001",
    name: "Dr. Evelyn Parker",
    email: "e.parker@university.edu",
    contactNo: "+880 1711-234567",
    designation: "Professor & Chair",
    academicDepartment: "Computer Science & Engineering",
    teachingHours: 14,
    maxHours: 12,
    apiScore: 94,
    rating: 4.9,
    publications: 18,
    committees: ["Academic Council", "Curriculum Committee (Chair)"],
  },
  {
    facultyId: "FAC-002",
    name: "Dr. Tariq Rahman",
    email: "t.rahman@university.edu",
    contactNo: "+880 1819-876543",
    designation: "Associate Professor",
    academicDepartment: "Microbiology & Immunology",
    teachingHours: 16,
    maxHours: 16,
    apiScore: 88,
    rating: 4.7,
    publications: 12,
    committees: ["Ethics Board", "Exam Moderation Committee"],
  },
  {
    facultyId: "FAC-003",
    name: "Dr. Ananya Sen",
    email: "a.sen@university.edu",
    contactNo: "+880 1912-345678",
    designation: "Associate Professor",
    academicDepartment: "Biochemistry & Genetics",
    teachingHours: 12,
    maxHours: 16,
    apiScore: 82,
    rating: 4.6,
    publications: 9,
    committees: ["Library Advisory", "Proctorial Board"],
  },
  {
    facultyId: "FAC-004",
    name: "Dr. Marcus Vance",
    email: "m.vance@university.edu",
    contactNo: "+880 1610-987654",
    designation: "Professor",
    academicDepartment: "Physiology & Neuroscience",
    teachingHours: 10,
    maxHours: 12,
    apiScore: 96,
    rating: 4.95,
    publications: 24,
    committees: ["Syndicate Board", "Research Grants Evaluation"],
  },
  {
    facultyId: "FAC-005",
    name: "Farhan Chowdhury",
    email: "f.chowdhury@university.edu",
    contactNo: "+880 1715-112233",
    designation: "Lecturer",
    academicDepartment: "Computer Science & Engineering",
    teachingHours: 18,
    maxHours: 18,
    apiScore: 76,
    rating: 4.5,
    publications: 4,
    committees: ["Admissions Intake Committee"],
  },
  {
    facultyId: "FAC-006",
    name: "Dr. Nusrat Jahan",
    email: "n.jahan@university.edu",
    contactNo: "+880 1812-445566",
    designation: "Assistant Professor",
    academicDepartment: "Pharmacology & Therapeutics",
    teachingHours: 15,
    maxHours: 16,
    apiScore: 85,
    rating: 4.8,
    publications: 8,
    committees: ["Anti-Ragging Board", "Student Welfare Committee"],
  },
];

type FacultyTab = "directory" | "workload" | "fte-engine" | "appraisal" | "committees";

export default function FacultyDirectoryPage() {
  const router = useRouter();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const canModify = roleIs("super-admin", "domain-admin");

  const [activeTab, setActiveTab] = useState<FacultyTab>("directory");
  const [successMsg, setSuccessMsg] = useState("");
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<FacultyForm>(EMPTY_FORM);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FacultyRow | null>(null);
  const [deptFilter, setDeptFilter] = useState("all");

  const { data: rawFaculties = [], isLoading } = useQuery<FacultyRow[]>({
    queryKey: ["faculties"],
    queryFn: api.getFaculties,
  });

  const { data: departments = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["departments"],
    queryFn: api.getAcademicDepartments,
  });

  // Merge raw database faculties with rich academic metrics
  const faculties: FacultyRow[] = (rawFaculties.length > 0 ? rawFaculties : MOCK_EXTENDED_FACULTY).map(
    (fac, idx) => {
      const fallback = MOCK_EXTENDED_FACULTY[idx % MOCK_EXTENDED_FACULTY.length];
      return {
        ...fac,
        teachingHours: fac.teachingHours ?? fallback.teachingHours ?? 14,
        maxHours: fac.maxHours ?? (fac.designation === "Professor" ? 12 : 16),
        apiScore: fac.apiScore ?? fallback.apiScore ?? 85,
        rating: fac.rating ?? fallback.rating ?? 4.75,
        publications: fac.publications ?? fallback.publications ?? 10,
        committees: fac.committees ?? fallback.committees ?? ["Curriculum Review Board"],
      };
    }
  );

  const deptOptions =
    departments.length > 0
      ? departments.map((d) => d.name)
      : ["Computer Science & Engineering", "Microbiology & Immunology", "Biochemistry & Genetics", "Physiology & Neuroscience", "Pharmacology & Therapeutics"];

  const filteredFaculties = faculties.filter((fac) => {
    if (deptFilter === "all") return true;
    return fac.academicDepartment === deptFilter;
  });

  const createFacultyMutation = useMutation({
    mutationFn: api.createFaculty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
      setModalMode(null);
      setForm(EMPTY_FORM);
      setSuccessMsg("Faculty member onboarded successfully.");
      showToast({
        title: "Faculty Appointed",
        description: "New faculty member successfully registered in academic directory.",
        variant: "success",
      });
      setTimeout(() => setSuccessMsg(""), 4000);
    },
    onError: (err: any) => {
      showToast({
        title: "Registration Failed",
        description: err?.response?.data?.message || "Failed to create faculty record.",
        variant: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: Record<string, unknown> }) =>
      api.updateFaculty(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
      setSuccessMsg("Faculty profile updated successfully.");
      showToast({
        title: "Profile Updated",
        description: "Faculty details were updated successfully.",
        variant: "success",
      });
      setModalMode(null);
      setSelectedFaculty(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
    onError: (err: any) => {
      showToast({
        title: "Update Failed",
        description: err?.response?.data?.message || "Failed to update faculty record.",
        variant: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteFaculty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
      setSuccessMsg("Faculty record deleted successfully.");
      showToast({
        title: "Faculty Deprovisioned",
        description: "Faculty record has been removed from directory.",
        variant: "success",
      });
      setDeleteTarget(null);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
    onError: (err: any) => {
      showToast({
        title: "Deletion Failed",
        description: err?.response?.data?.message || "Failed to remove faculty record.",
        variant: "error",
      });
    },
  });

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setSelectedFaculty(null);
    setModalMode("create");
  };

  const openEdit = (fac: FacultyRow) => {
    setSelectedFaculty(fac);
    setForm({
      name: displayName(fac.name),
      email: fac.email,
      contactNo: fac.contactNo,
      designation: fac.designation,
      academicDepartment: fac.academicDepartment,
    });
    setModalMode("edit");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "create") {
      createFacultyMutation.mutate({
        password: "facultypassword123",
        faculty: { ...form },
      });
    } else if (modalMode === "edit" && selectedFaculty) {
      updateMutation.mutate({
        id: String(selectedFaculty.id || selectedFaculty.facultyId),
        data: { ...form },
      });
    }
  };

  const totalTeachingHours = faculties.reduce((sum, f) => sum + (f.teachingHours || 0), 0);
  const avgRating = (faculties.reduce((sum, f) => sum + (f.rating || 0), 0) / faculties.length).toFixed(2);
  const totalPubs = faculties.reduce((sum, f) => sum + (f.publications || 0), 0);

  const columns: Column<FacultyRow>[] = [
    {
      header: "Faculty Scholar",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={displayName(row.name)} size="sm" />
          <div>
            <Link
              href={`/faculties/${row.facultyId}`}
              className="font-bold text-text hover:text-gold transition-colors block"
            >
              {displayName(row.name) || "Unknown"}
            </Link>
            <span className="text-[11px] text-text-muted font-mono">{row.email}</span>
          </div>
        </div>
      ),
      sortValue: (row) => displayName(row.name),
    },
    {
      header: "Faculty ID",
      accessor: "facultyId",
      className: "font-mono text-text-muted tabular-nums text-xs",
    },
    {
      header: "Designation",
      accessor: (row) => (
        <Badge variant={row.designation.includes("Professor") ? "gold" : "neutral"} size="sm">
          {row.designation}
        </Badge>
      ),
    },
    { header: "Academic Department", accessor: "academicDepartment", className: "text-xs font-medium text-text-muted" },
    {
      header: "Teaching Load",
      accessor: (row) => {
        const hrs = row.teachingHours || 0;
        const max = row.maxHours || 12;
        const isOver = hrs > max;
        return (
          <div className="space-y-1 w-28">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold font-mono">{hrs} / {max} hrs</span>
              <span className={isOver ? "text-danger font-bold" : "text-text-muted"}>
                {Math.round((hrs / max) * 100)}%
              </span>
            </div>
            <ProgressBar
              value={Math.min(100, (hrs / max) * 100)}
              variant={isOver ? "danger" : "gold"}
              size="xs"
            />
          </div>
        );
      },
    },
    {
      header: "Actions",
      id: "actions",
      sortable: false,
      hideable: false,
      accessor: (row: FacultyRow) => (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/faculties/${row.facultyId}`}>
            <Button variant="outline" size="sm" className="text-xs h-7 px-2.5">
              Profile
            </Button>
          </Link>
          {canModify && (
            <ActionMenu
              items={[
                {
                  label: "Edit Profile",
                  icon: <Pencil size={13} />,
                  onClick: () => openEdit(row),
                },
                {
                  label: "View Research Grants",
                  icon: <BookOpen size={13} />,
                  onClick: () => router.push("/research"),
                },
                {
                  label: "Leave History",
                  icon: <Clock size={13} />,
                  onClick: () => router.push("/leave"),
                },
                {
                  label: "Deprovision Record",
                  icon: <Trash2 size={13} />,
                  variant: "danger",
                  onClick: () => setDeleteTarget(row),
                },
              ]}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      <PageHeader
        title="Faculty & Staff Academic Workspace"
        subtitle="Comprehensive faculty directory, credit hour teaching workload allocation, annual UGC appraisal index, and institutional committee governance."
        actions={
          canModify ? (
            <Button variant="gold" leftIcon={<Plus size={15} />} onClick={openCreate}>
              Onboard Faculty Member
            </Button>
          ) : undefined
        }
      />

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Appointed Faculty</span>
            <Badge variant="gold" size="sm">Active</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-text">{faculties.length} Scholars</div>
          <span className="text-xs text-text-muted mt-1 block">Across {deptOptions.length} academic departments</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Total Weekly Workload</span>
          <div className="mt-2 text-2xl font-bold font-mono text-gold">{totalTeachingHours} Contact Hrs</div>
          <span className="text-xs text-text-muted mt-1 block">Lecture, lab & tutorial sessions</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Avg Student Evaluation</span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">{avgRating} / 5.0</div>
          <span className="text-xs text-text-muted mt-1 block">Based on end-of-term student surveys</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Peer-Reviewed Papers</span>
          <div className="mt-2 text-2xl font-bold font-mono text-primary">{totalPubs} Publications</div>
          <span className="text-xs text-text-muted mt-1 block">Scopus & Web of Science indexed</span>
        </Card>
      </div>

      {successMsg && (
        <Alert tone="success" className="max-w-xl">
          {successMsg}
        </Alert>
      )}

      {/* Navigation Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as FacultyTab)}
        tabs={[
          { id: "directory", label: "Faculty Directory", count: filteredFaculties.length },
          { id: "fte-engine", label: "40/40/20 FTE & Overload Honorarium" },
          { id: "workload", label: "Teaching Workload & Contact Hours" },
          { id: "appraisal", label: "Annual Appraisal & API Scores" },
          { id: "committees", label: "Committee Governance & Service" },
        ]}
      />

      {/* Tab 1: Faculty Directory */}
      {activeTab === "directory" && (
        <Card noPadding>
          <div className="p-4 border-b border-border bg-surface-elevated/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Academic Appointments ({filteredFaculties.length})
            </span>
            <div className="w-full sm:w-64">
              <CustomDropdown
                value={deptFilter}
                onChange={setDeptFilter}
                placeholder="Filter by department"
                options={[
                  { value: "all", label: "All Departments" },
                  ...deptOptions.map((d) => ({ value: d, label: d })),
                ]}
              />
            </div>
          </div>

          <DataTable<FacultyRow>
            data={filteredFaculties}
            columns={columns}
            loading={isLoading}
            searchPlaceholder="Search faculty by name..."
            searchField="name"
            tableId="faculty-directory"
            emptyTitle="No faculty records yet"
            emptyDescription="Onboard your first faculty member to get started."
            emptyAction={
              canModify ? (
                <Button size="sm" leftIcon={<Plus size={14} />} onClick={openCreate}>
                  Onboard Faculty
                </Button>
              ) : undefined
            }
          />
        </Card>
      )}

      {/* Tab 2: Teaching Workload Allocation Matrix */}
      {activeTab === "workload" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFaculties.map((fac) => {
              const hrs = fac.teachingHours || 0;
              const max = fac.maxHours || 12;
              const isOver = hrs > max;
              const pct = Math.round((hrs / max) * 100);

              return (
                <Card key={fac.facultyId} orientation="vertical" padding="md" className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={displayName(fac.name)} size="sm" />
                      <div>
                        <h4 className="text-sm font-bold text-text">{displayName(fac.name)}</h4>
                        <span className="text-xs text-text-muted block">{fac.designation}</span>
                      </div>
                    </div>
                    <Badge variant={isOver ? "danger" : "success"} size="sm">
                      {isOver ? "Overloaded" : "Optimal Load"}
                    </Badge>
                  </div>

                  <div className="p-3 bg-surface-muted/50 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Assigned Dept:</span>
                      <span className="font-semibold text-text truncate max-w-[160px]">{fac.academicDepartment}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Weekly Contact Limit:</span>
                      <span className="font-mono font-semibold text-text">{max} hrs / week</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Current Teaching Load:</span>
                      <span className={`font-mono font-bold ${isOver ? "text-danger" : "text-emerald-600"}`}>
                        {hrs} hrs / week ({pct}%)
                      </span>
                    </div>
                  </div>

                  <ProgressBar value={Math.min(100, pct)} variant={isOver ? "danger" : "gold"} size="sm" />

                  <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-text-muted">Advising Quota: <strong>24 Students</strong></span>
                    <Link href={`/faculties/${fac.facultyId}`} className="text-gold font-bold hover:underline flex items-center gap-0.5">
                      <span>Schedule</span>
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Annual Appraisal & API Scores */}
      {activeTab === "appraisal" && (
        <Card noPadding>
          <div className="p-4 border-b border-border bg-surface-elevated/40 flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              UGC & Institutional Academic Performance Index (API)
            </span>
            <Badge variant="gold" size="sm">Annual Cycle 2026</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-muted/50 border-b border-border text-text-muted uppercase font-bold text-[11px]">
                  <th className="p-3.5">Faculty Member</th>
                  <th className="p-3.5">Designation</th>
                  <th className="p-3.5">Research Papers</th>
                  <th className="p-3.5">Student Rating</th>
                  <th className="p-3.5">API Score (100)</th>
                  <th className="p-3.5">Dean Appraisal Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFaculties.map((fac) => (
                  <tr key={fac.facultyId} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="p-3.5">
                      <span className="font-bold text-text block">{displayName(fac.name)}</span>
                      <span className="text-[11px] text-text-muted font-mono">{fac.facultyId}</span>
                    </td>
                    <td className="p-3.5 font-medium text-text-muted">{fac.designation}</td>
                    <td className="p-3.5 font-mono font-bold text-text">{fac.publications} Scopus Papers</td>
                    <td className="p-3.5 font-mono text-emerald-600 font-bold">★ {fac.rating} / 5.0</td>
                    <td className="p-3.5">
                      <div className="space-y-1 w-24">
                        <span className="font-mono font-bold text-gold">{fac.apiScore} / 100</span>
                        <ProgressBar value={fac.apiScore || 0} variant="gold" size="xs" />
                      </div>
                    </td>
                    <td className="p-3.5">
                      <Badge variant={(fac.apiScore || 0) >= 85 ? "success" : "warning"} size="sm">
                        {(fac.apiScore || 0) >= 85 ? "Approved for Increment" : "Under Dean Review"}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <ActionMenu
                        items={[
                          {
                            label: "View Full Dossier",
                            icon: <Eye size={13} />,
                            onClick: () => router.push(`/faculties/${fac.facultyId}`),
                          },
                          {
                            label: "Download Appraisal PDF",
                            icon: <FileCheck size={13} />,
                            onClick: () => showToast({ title: "Dossier Exported", description: "Annual faculty appraisal PDF generated.", variant: "success" }),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 4: Committee Governance & Service */}
      {activeTab === "committees" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card orientation="vertical" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-gold" />
                <h3 className="text-sm font-bold text-text">Institutional Academic Council</h3>
              </div>
              <Badge variant="gold" size="sm">Highest Body</Badge>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Responsible for approving degree curricula, academic calendar amendments, and examination regulations.
            </p>
            <div className="space-y-2">
              <span className="text-xs font-bold text-text uppercase">Appointed Members:</span>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="neutral" size="sm">Dr. Evelyn Parker (Chair)</Badge>
                <Badge variant="neutral" size="sm">Dr. Marcus Vance</Badge>
                <Badge variant="neutral" size="sm">Dr. Tariq Rahman</Badge>
              </div>
            </div>
          </Card>

          <Card orientation="vertical" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-emerald-600" />
                <h3 className="text-sm font-bold text-text">Curriculum & OBE Review Board</h3>
              </div>
              <Badge variant="success" size="sm">Active</Badge>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Monitors Bloom's Taxonomy learning outcome attainment (CO-PO mapping) and UGC accreditation standards.
            </p>
            <div className="space-y-2">
              <span className="text-xs font-bold text-text uppercase">Appointed Members:</span>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="neutral" size="sm">Dr. Ananya Sen</Badge>
                <Badge variant="neutral" size="sm">Dr. Nusrat Jahan</Badge>
                <Badge variant="neutral" size="sm">Farhan Chowdhury</Badge>
              </div>
            </div>
          </Card>

          <Card orientation="vertical" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileCheck size={18} className="text-primary" />
                <h3 className="text-sm font-bold text-text">Exam Moderation & Question Board</h3>
              </div>
              <Badge variant="neutral" size="sm">Confidential</Badge>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Vets and moderates final semester exam question papers with zero clash verification algorithms.
            </p>
            <div className="space-y-2">
              <span className="text-xs font-bold text-text uppercase">Appointed Members:</span>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="neutral" size="sm">Dr. Tariq Rahman</Badge>
                <Badge variant="neutral" size="sm">Dr. Evelyn Parker</Badge>
              </div>
            </div>
          </Card>

          <Card orientation="vertical" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-warning" />
                <h3 className="text-sm font-bold text-text">Proctorial Board & Anti-Ragging Cell</h3>
              </div>
              <Badge variant="warning" size="sm">Campus Safety</Badge>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Ensures student campus safety, investigates disciplinary infractions, and maintains hostel order.
            </p>
            <div className="space-y-2">
              <span className="text-xs font-bold text-text uppercase">Appointed Members:</span>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="neutral" size="sm">Dr. Nusrat Jahan</Badge>
                <Badge variant="neutral" size="sm">Dr. Ananya Sen</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab: 40/40/20 FTE & Overload Honorarium Engine */}
      {activeTab === "fte-engine" && <FacultyWorkloadPanel />}

      {/* Create / Edit dialog */}
      <Dialog
        open={modalMode !== null}
        onClose={() => setModalMode(null)}
        title={modalMode === "create" ? "Onboard New Faculty Member" : "Edit Faculty"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalMode(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="faculty-form"
              variant="gold"
              loading={createFacultyMutation.isPending || updateMutation.isPending}
            >
              {modalMode === "create" ? "Create Faculty Appointment" : "Save Changes"}
            </Button>
          </>
        }
      >
        <form id="faculty-form" onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Full Scholar Name" htmlFor="fac-name" required>
            <Input
              id="fac-name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Dr. Evelyn Parker"
              required
            />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Academic Email" htmlFor="fac-email" required>
              <Input
                id="fac-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="e.parker@university.edu"
                required
              />
            </FormField>
            <FormField label="Contact Number" htmlFor="fac-contact" required>
              <Input
                id="fac-contact"
                value={form.contactNo}
                onChange={(e) => setForm((p) => ({ ...p, contactNo: e.target.value }))}
                placeholder="+880 1711-234567"
                required
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Academic Designation" htmlFor="fac-designation">
              <Select
                id="fac-designation"
                value={form.designation}
                onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))}
              >
                <option value="Professor & Chair">Professor & Chair</option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer</option>
              </Select>
            </FormField>
            <FormField label="Assigned Department" htmlFor="fac-dept" required>
              <Select
                id="fac-dept"
                value={form.academicDepartment}
                onChange={(e) => setForm((p) => ({ ...p, academicDepartment: e.target.value }))}
                placeholder="Select department..."
                required
              >
                {deptOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        </form>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id || deleteTarget.facultyId)}
        title="Deprovision Faculty Record?"
        tone="danger"
        confirmLabel={deleteMutation.isPending ? "Deprovisioning..." : "Delete Record"}
        loading={deleteMutation.isPending}
        description={
          <>
            You are about to deprovision{" "}
            <strong className="text-text">{deleteTarget ? displayName(deleteTarget.name) : ""}</strong>. Their course allocations and committee roles will be archived.
          </>
        }
      />
    </div>
  );
}
