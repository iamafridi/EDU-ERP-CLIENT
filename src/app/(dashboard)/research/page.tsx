"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { usePermission } from "@/hooks/usePermission";
import {
  PageHeader,
  Card,
  DataTable,
  Column,
  Modal,
  FormField,
  Input,
  Select,
  Button,
  IconButton,
  Badge,
} from "@/components/ui";
import { Tabs } from "@/components/ui/Tabs";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Beaker,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Award,
  DollarSign,
  BookOpen,
  ShieldCheck,
  Sparkles,
  Users,
  FileCheck,
  Clock,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { showToast } from "@/components/dashboard/ToastFeedback";

interface ResearchProject {
  id: string;
  title: string;
  leadResearcher: string;
  department: string;
  startDate: string;
  endDate: string;
  fundingAmount: number | string;
  status: "active" | "completed" | "under-review" | "approved";
  grantSource?: string;
  citationCount?: number;
}

interface ThesisDefenseItem {
  id: string;
  studentId: string;
  studentName: string;
  degree: "M.Sc. Thesis" | "Ph.D. Dissertation" | "B.Sc. Capstone";
  thesisTitle: string;
  supervisor: string;
  coSupervisor?: string;
  turnitinSimilarity: number;
  defenseDate: string;
  defenseVenue: string;
  status: "Scheduled" | "Passed" | "Minor Revision" | "Major Revision" | "Pending Review";
  defenseScore?: number;
}

const MOCK_THESIS_DEFENSES: ThesisDefenseItem[] = [
  {
    id: "THS-2026-001",
    studentId: "STU-2026001",
    studentName: "Marcus Chen",
    degree: "B.Sc. Capstone",
    thesisTitle: "Distributed Consensus Algorithms for High-Throughput Edge IoT Gateways",
    supervisor: "Dr. Evelyn Parker",
    turnitinSimilarity: 6.2,
    defenseDate: "2026-10-15 • 10:00 AM",
    defenseVenue: "Auditorium Lab 402",
    status: "Passed",
    defenseScore: 94,
  },
  {
    id: "THS-2026-002",
    studentId: "STU-2026002",
    studentName: "Sophia Martinez",
    degree: "M.Sc. Thesis",
    thesisTitle: "CRISPR-Cas9 Gene Editing Targeting Antimicrobial Resistant Biofilms",
    supervisor: "Dr. Tariq Rahman",
    turnitinSimilarity: 4.8,
    defenseDate: "2026-10-18 • 02:30 PM",
    defenseVenue: "Conference Hall B",
    status: "Scheduled",
    defenseScore: 88,
  },
  {
    id: "THS-2026-003",
    studentId: "STU-2026003",
    studentName: "Ethan Gallagher",
    degree: "B.Sc. Capstone",
    thesisTitle: "Synthetic Biology Approaches to Enzymatic Plastic Degradation",
    supervisor: "Dr. Ananya Sen",
    turnitinSimilarity: 14.5,
    defenseDate: "2026-10-22 • 11:00 AM",
    defenseVenue: "Bioinformatics Suite",
    status: "Minor Revision",
    defenseScore: 82,
  },
  {
    id: "THS-2026-004",
    studentId: "STU-2026004",
    studentName: "Aria Takahashi",
    degree: "Ph.D. Dissertation",
    thesisTitle: "Neural Decoding Models for Closed-Loop Deep Brain Stimulation",
    supervisor: "Dr. Marcus Vance",
    turnitinSimilarity: 3.4,
    defenseDate: "2026-11-05 • 03:00 PM",
    defenseVenue: "Executive Senate Room",
    status: "Scheduled",
    defenseScore: 96,
  },
];

type ResearchTab = "projects" | "thesis_defense" | "publications" | "ethics";

export default function ResearchPage() {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ResearchTab>("projects");
  const [showModal, setShowModal] = useState(false);
  const [showDefenseModal, setShowDefenseModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    title: "",
    leadResearcher: "",
    department: "",
    startDate: "",
    endDate: "",
    fundingAmount: "",
    status: "active",
  });

  const isEditor = can("update", "research");

  const { data: rawProjects = [], isLoading } = useQuery<ResearchProject[]>({
    queryKey: ["researchProjects"],
    queryFn: async () => {
      try {
        const res = await api.getResearchProjects();
        if (Array.isArray(res) && res.length > 0) return res;
      } catch {
        // fallback
      }
      return [
        {
          id: "RES-2026-001",
          title: "AI-Assisted Genomics for Rapid Dengue Serotype Classification",
          leadResearcher: "Dr. Evelyn Parker",
          department: "Computer Science & Engineering",
          startDate: "2026-01-10",
          endDate: "2026-12-31",
          fundingAmount: 2500000,
          status: "active",
          grantSource: "UGC / National Science Foundation",
          citationCount: 34,
        },
        {
          id: "RES-2026-002",
          title: "Phytochemical Analysis of Indigenous Medicinal Flora Against MDR Microbes",
          leadResearcher: "Dr. Tariq Rahman",
          department: "Microbiology & Immunology",
          startDate: "2026-03-01",
          endDate: "2027-02-28",
          fundingAmount: 1800000,
          status: "active",
          grantSource: "WHO / DGHS Research Endowment",
          citationCount: 19,
        },
        {
          id: "RES-2026-003",
          title: "Neural Plasticity Biomarkers in Early Post-Stroke Rehabilitation",
          leadResearcher: "Dr. Marcus Vance",
          department: "Physiology & Neuroscience",
          startDate: "2025-09-01",
          endDate: "2026-08-31",
          fundingAmount: 3200000,
          status: "completed",
          grantSource: "ICMR Bilateral Research Grant",
          citationCount: 48,
        },
      ];
    },
  });

  const projects = rawProjects;

  const createMutation = useMutation({
    mutationFn: api.createResearchProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["researchProjects"] });
      closeModal();
      setSuccessMsg("Research project registered successfully.");
      showToast({ title: "Grant Registered", description: "New research project added to registry.", variant: "success" });
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteResearchProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["researchProjects"] });
      setSuccessMsg("Research project archived.");
      showToast({ title: "Project Archived", description: "Record moved to research archives.", variant: "success" });
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setForm({
      title: "",
      leadResearcher: "",
      department: "",
      startDate: "",
      endDate: "",
      fundingAmount: "",
      status: "active",
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      fundingAmount: Number(form.fundingAmount) || 1000000,
    });
  };

  const totalGrants = projects.reduce((sum, p) => sum + Number(p.fundingAmount || 0), 0);

  const columns: Column<ResearchProject>[] = [
    {
      header: "Research Project Title",
      accessor: (row) => (
        <div className="max-w-md">
          <span className="font-bold text-text block truncate">{row.title}</span>
          <span className="text-[11px] text-text-muted font-mono">{row.id}</span>
        </div>
      ),
      sortValue: (row) => row.title,
    },
    { header: "Principal Investigator", accessor: "leadResearcher", className: "font-medium text-text-secondary" },
    { header: "Department", accessor: "department", className: "text-xs text-text-muted" },
    {
      header: "Grant Allocation (BDT)",
      accessor: (row) => (
        <span className="font-mono font-bold text-gold">
          ৳{Number(row.fundingAmount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => (
        <Badge variant={row.status === "completed" ? "success" : "gold"} size="sm">
          {row.status === "completed" ? "Completed" : "Active Research"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          <ActionMenu
            items={[
              {
                label: "View Research Dossier",
                icon: <BookOpen size={13} />,
                onClick: () => showToast({ title: "Dossier Opened", description: "Loading research publications.", variant: "info" }),
              },
              ...(isEditor
                ? [
                    {
                      label: "Delete Project",
                      icon: <Trash2 size={13} />,
                      variant: "danger" as const,
                      onClick: () => {
                        if (confirm("Archive this research project?")) deleteMutation.mutate(row.id);
                      },
                    },
                  ]
                : []),
            ]}
          />
        </div>
      ),
    },
  ];

  const thesisColumns: Column<ThesisDefenseItem>[] = [
    {
      header: "Candidate & Degree",
      accessor: (row) => (
        <div>
          <span className="font-bold text-text block">{row.studentName}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge variant="gold" size="sm">{row.degree}</Badge>
            <span className="text-[10px] text-text-muted font-mono">{row.studentId}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Thesis / Capstone Title",
      accessor: (row) => (
        <div className="max-w-md">
          <span className="font-semibold text-text text-xs leading-snug block line-clamp-2">{row.thesisTitle}</span>
          <span className="text-[11px] text-text-muted mt-0.5 block">Supervisor: {row.supervisor}</span>
        </div>
      ),
    },
    {
      header: "Turnitin Plagiarism",
      accessor: (row) => {
        const isSafe = row.turnitinSimilarity <= 10;
        return (
          <div className="space-y-1 w-24">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-mono font-bold">{row.turnitinSimilarity}%</span>
              <span className={isSafe ? "text-emerald-600" : "text-danger font-semibold"}>
                {isSafe ? "Pass (<10%)" : "Flagged"}
              </span>
            </div>
            <ProgressBar value={Math.min(100, row.turnitinSimilarity * 5)} variant={isSafe ? "success" : "danger"} size="xs" />
          </div>
        );
      },
    },
    {
      header: "Defense Schedule & Venue",
      accessor: (row) => (
        <div className="space-y-0.5">
          <span className="text-xs font-medium text-text flex items-center gap-1">
            <Clock size={11} className="text-gold" />
            {row.defenseDate}
          </span>
          <span className="text-[11px] text-text-muted block">{row.defenseVenue}</span>
        </div>
      ),
    },
    {
      header: "Verdict",
      accessor: (row) => (
        <Badge
          variant={
            row.status === "Passed"
              ? "success"
              : row.status === "Scheduled"
              ? "gold"
              : row.status === "Minor Revision"
              ? "warning"
              : "danger"
          }
          size="sm"
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <ActionMenu
            items={[
              {
                label: "Open Defense Rubric Sheet",
                icon: <FileCheck size={13} />,
                onClick: () => showToast({ title: "Defense Rubric", description: "Jury scoring rubric opened.", variant: "info" }),
              },
              {
                label: "Download Turnitin Report",
                icon: <BookOpen size={13} />,
                onClick: () => showToast({ title: "Plagiarism Report", description: "Turnitin similarity PDF downloaded.", variant: "success" }),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      <PageHeader
        title="University Research, Endowments & Thesis Defense Board"
        subtitle="Institutional research grants in BDT (৳), Scopus peer-reviewed publications, postgraduate thesis supervision, and defense jury evaluations."
        actions={
          isEditor && (
            <Button variant="gold" leftIcon={<Plus size={15} />} onClick={() => setShowModal(true)}>
              Register Research Grant
            </Button>
          )
        }
      />

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card orientation="vertical" padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase">Active Research Grants</span>
            <Badge variant="gold" size="sm">{projects.length} Grants</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">
            ৳{(totalGrants / 1000000).toFixed(1)}M
          </div>
          <span className="text-xs text-text-muted mt-1 block">Total institutional endowments in BDT</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Defended Theses</span>
          <div className="mt-2 text-2xl font-bold font-mono text-text">{MOCK_THESIS_DEFENSES.length} Scholars</div>
          <span className="text-xs text-text-muted mt-1 block">Undergraduate & postgraduate candidates</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Avg Plagiarism Index</span>
          <div className="mt-2 text-2xl font-bold font-mono text-gold">7.2%</div>
          <span className="text-xs text-text-muted mt-1 block">Turnitin benchmark threshold &lt; 10%</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Indexed Citations</span>
          <div className="mt-2 text-2xl font-bold font-mono text-primary">101 Citations</div>
          <span className="text-xs text-text-muted mt-1 block">Scopus & Web of Science citations</span>
        </Card>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as ResearchTab)}
        tabs={[
          { id: "projects", label: "Funded Research Projects", count: projects.length },
          { id: "thesis_defense", label: "Capstone & Thesis Defense Board", count: MOCK_THESIS_DEFENSES.length },
          { id: "publications", label: "Peer-Reviewed Scopus Papers" },
          { id: "ethics", label: "Institutional Ethics Review Board (IRB)" },
        ]}
      />

      {/* Tab 1: Funded Research Projects */}
      {activeTab === "projects" && (
        <Card noPadding>
          <div className="p-4 border-b border-border bg-surface-elevated/40 flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Institutional Research Grants & Endowments ({projects.length})
            </span>
            <Badge variant="gold" size="sm">BDT Currency</Badge>
          </div>

          <DataTable<ResearchProject>
            data={projects}
            columns={columns}
            loading={isLoading}
            searchPlaceholder="Search projects by title or lead researcher..."
            searchField="title"
          />
        </Card>
      )}

      {/* Tab 2: Capstone & Thesis Defense Board */}
      {activeTab === "thesis_defense" && (
        <Card noPadding>
          <div className="p-4 border-b border-border bg-surface-elevated/40 flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Undergraduate Capstone & Postgraduate Thesis Defense Jury ({MOCK_THESIS_DEFENSES.length})
            </span>
            <Badge variant="gold" size="sm">Turnitin Verified</Badge>
          </div>

          <DataTable<ThesisDefenseItem>
            data={MOCK_THESIS_DEFENSES}
            columns={thesisColumns}
            searchPlaceholder="Search candidate, supervisor, or thesis title..."
            searchField="thesisTitle"
          />
        </Card>
      )}

      {/* Tab 3: Peer-Reviewed Scopus Papers */}
      {activeTab === "publications" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p, idx) => (
            <Card key={idx} orientation="vertical" padding="lg" className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="gold" size="sm">Q1 Scopus Journal</Badge>
                <span className="text-xs font-mono text-emerald-600 font-bold">★ {p.citationCount || 20} Citations</span>
              </div>
              <h4 className="text-sm font-bold text-text leading-snug">{p.title}</h4>
              <p className="text-xs text-text-muted">Lead Author: <strong className="text-text">{p.leadResearcher}</strong> • {p.department}</p>
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-text-subtle">DOI: 10.1016/j.jbi.2026.04</span>
                <span className="text-gold font-bold hover:underline cursor-pointer flex items-center gap-1">
                  <span>View Paper</span>
                  <ExternalLink size={12} />
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 4: Institutional Ethics Review Board (IRB) */}
      {activeTab === "ethics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card orientation="vertical" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-gold" />
                <h3 className="text-sm font-bold text-text">Human & Clinical Trials IRB Cell</h3>
              </div>
              <Badge variant="success" size="sm">Active Board</Badge>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Vets all university biomedical research protocols for Helsinki Declaration compliance and patient consent standards.
            </p>
            <div className="space-y-2">
              <span className="text-xs font-bold text-text uppercase">Committee Chair:</span>
              <Badge variant="neutral" size="sm">Dr. Evelyn Parker, PhD</Badge>
            </div>
          </Card>

          <Card orientation="vertical" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Beaker size={18} className="text-primary" />
                <h3 className="text-sm font-bold text-text">Bio-Safety & Animal Research Cell</h3>
              </div>
              <Badge variant="gold" size="sm">Biosafety Level 3</Badge>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Regulates microbial pathogen storage, recombinant DNA protocols, and vivarium animal welfare guidelines.
            </p>
            <div className="space-y-2">
              <span className="text-xs font-bold text-text uppercase">Committee Chair:</span>
              <Badge variant="neutral" size="sm">Dr. Tariq Rahman, FRCPath</Badge>
            </div>
          </Card>
        </div>
      )}

      {/* Grant Registration Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title="Register New Research Grant"
        subtitle="Log an institutional research endowment or external funding grant"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Research Project Title" required>
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. AI-Assisted Genomics for Disease Classification"
              required
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Lead Researcher / PI" required>
              <Input
                value={form.leadResearcher}
                onChange={(e) => setForm((p) => ({ ...p, leadResearcher: e.target.value }))}
                placeholder="Dr. Evelyn Parker"
                required
              />
            </FormField>
            <FormField label="Academic Department" required>
              <Input
                value={form.department}
                onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                placeholder="Computer Science & Engineering"
                required
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Funding Grant in BDT (৳)" required>
              <Input
                type="number"
                value={form.fundingAmount}
                onChange={(e) => setForm((p) => ({ ...p, fundingAmount: e.target.value }))}
                placeholder="2500000"
                required
              />
            </FormField>
            <FormField label="Target End Date" required>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                required
              />
            </FormField>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="gold" type="submit" loading={createMutation.isPending}>
              Register Grant
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
