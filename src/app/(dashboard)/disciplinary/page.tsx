"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import {
  Gavel,
  AlertTriangle,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Search,
  Filter,
  FileText,
  Lock,
  Unlock,
  Building2,
  Users,
  Eye,
  Download,
  Printer,
  Sparkles
} from "lucide-react";
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Tabs,
  Modal,
  FormField,
  Input,
  Select,
} from "@/components/ui";

type DisciplinaryTab = "infractions" | "hearings" | "active-holds" | "code-of-conduct";

export default function DisciplinaryPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<DisciplinaryTab>("infractions");
  const [isInfractionModalOpen, setIsInfractionModalOpen] = useState(false);
  const [isHearingModalOpen, setIsHearingModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Infraction Form state
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("HIGH");
  const [category, setCategory] = useState("EXAM_INTEGRITY");
  const [description, setDescription] = useState("");

  // Mock Infractions Dataset
  const [infractionsList, setInfractionsList] = useState([
    {
      id: "INF-2026-011",
      studentId: "STU-2026003",
      studentName: "Ethan Gallagher",
      department: "Dept of Biochemistry (Term 3.2)",
      category: "EXAM_INTEGRITY",
      title: "Possession of Unauthorized Electronic Formula Sheet in Midterm",
      severity: "CRITICAL",
      status: "HEARING_SCHEDULED",
      reportedBy: "Dr. Kazi Mahfuzur Rahman (Invigilator)",
      reportedAt: "2026-09-15 11:30 AM",
      description: "Confiscated programmable smart device containing pre-loaded examination solutions during Final Term exam.",
      holdActive: true
    },
    {
      id: "INF-2026-012",
      studentId: "STU-2024-0210",
      studentName: "Shariar Kabir",
      department: "Dept of CSE (Term 4.1)",
      category: "ACADEMIC_DISHONESTY",
      title: "Capstone Thesis Code Repository Plagiarism (> 35% Similarity)",
      severity: "HIGH",
      status: "UNDER_SCRUTINY",
      reportedBy: "Department Capstone Defense Jury",
      reportedAt: "2026-09-20 03:15 PM",
      description: "Automated Turnitin repository scan flagged 38.5% identical codebase from past GitHub repository without attribution.",
      holdActive: true
    },
    {
      id: "INF-2026-013",
      studentId: "STU-2026001",
      studentName: "Marcus Chen",
      department: "Dept of CSE (Term 4.2)",
      category: "CAMPUS_DISCIPLINE",
      title: "Hostel Curfew Protocol Non-Compliance",
      severity: "LOW",
      status: "WARNED_RESOLVED",
      reportedBy: "North Hall Resident Warden",
      reportedAt: "2026-09-18 11:15 PM",
      description: "Late campus perimeter entry past designated 22:30 curfew without warden gate pass. First minor offense.",
      holdActive: false
    }
  ]);

  // Mock Tribunal Hearings
  const [hearingsList, setHearingsList] = useState([
    {
      id: "HRG-2026-004",
      caseRef: "CASE-INF-2026-011",
      studentName: "Ethan Gallagher (STU-2026003)",
      tribunalBoard: "Proctorial Board of Academic Integrity",
      chairperson: "Prof. Dr. Jamal Uddin (Chief Proctor)",
      hearingDate: "2026-10-08 10:00 AM",
      venue: "Senate Chamber, Administrative Complex",
      status: "SCHEDULED",
      verdictRecommendation: "Pending Hearing Defense"
    },
    {
      id: "HRG-2026-005",
      caseRef: "CASE-INF-2026-012",
      studentName: "Shariar Kabir (STU-2024-0210)",
      tribunalBoard: "Department Academic Ethics Review Panel",
      chairperson: "Prof. Dr. Aris Thorne (Department Chair)",
      hearingDate: "2026-10-10 02:30 PM",
      venue: "Boardroom 402, Science Complex",
      status: "SCHEDULED",
      verdictRecommendation: "Mandate Thesis Rewrite & 1-Term Defense Deferral"
    }
  ]);

  const handleCreateInfraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !title) return;

    const newInf = {
      id: `INF-2026-${Math.floor(100 + Math.random() * 900)}`,
      studentId,
      studentName: studentName || "Student Scholar",
      department: "Academic Department",
      category,
      title,
      severity,
      status: "UNDER_REVIEW",
      reportedBy: user?.name || "Faculty Invigilator",
      reportedAt: new Date().toLocaleString(),
      description,
      holdActive: severity === "CRITICAL" || severity === "HIGH"
    };

    setInfractionsList([newInf, ...infractionsList]);
    setIsInfractionModalOpen(false);
    setSuccessMsg(`Incident ${newInf.id} recorded. Institutional proctorial hold activated.`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleLiftHold = (infId: string, stuName: string) => {
    setInfractionsList((prev) =>
      prev.map((i) => (i.id === infId ? { ...i, holdActive: false, status: "DISCIPLINARY_CLEARED" } : i))
    );
    setSuccessMsg(`Proctorial hold lifted and academic standing restored for ${stuName}.`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Proctorial Tribunal & Disciplinary Governance"
        subtitle="Academic integrity enforcement, examination hall irregularity logs, disciplinary tribunal hearings, and advising hold gateways."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setSuccessMsg("Disciplinary register exported for University Syndicate review.");
                setTimeout(() => setSuccessMsg(""), 3500);
              }}
            >
              <Printer size={14} /> Print Syndicate Dossier
            </Button>
            {roleIs("super-admin", "domain-admin", "faculty") && (
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5"
                onClick={() => setIsInfractionModalOpen(true)}
              >
                <Plus size={14} />
                Report Disciplinary Incident
              </Button>
            )}
          </div>
        }
      />

      {/* TABS NAVIGATION */}
      <Tabs
        value={activeTab}
        onChange={(val) => setActiveTab(val as DisciplinaryTab)}
        items={[
          {
            id: "infractions",
            label: "Incident Register & Evidence Vault",
            icon: <AlertTriangle size={14} />,
            count: infractionsList.length,
          },
          {
            id: "hearings",
            label: "Tribunal Hearings & Verdicts",
            icon: <Gavel size={14} />,
            count: hearingsList.length,
          },
          {
            id: "active-holds",
            label: "Active Disciplinary Advising Holds",
            icon: <ShieldAlert size={14} />,
            count: infractionsList.filter((i) => i.holdActive).length,
          },
          {
            id: "code-of-conduct",
            label: "Student Honor Code & Policy",
            icon: <ShieldCheck size={14} />,
          },
        ]}
      />

      {/* TAB 1: INCIDENT REGISTER & EVIDENCE VAULT */}
      {activeTab === "infractions" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card pad="md" className="border-border">
              <div className="text-xs text-text-muted">Total Recorded Incidents</div>
              <div className="text-xl font-bold font-display text-text mt-1">{infractionsList.length} Cases</div>
              <div className="text-[11px] text-primary font-medium mt-1">Academic Year 2026</div>
            </Card>
            <Card pad="md" className="border-border">
              <div className="text-xs text-text-muted">Active Advising Holds</div>
              <div className="text-xl font-bold font-display text-danger mt-1">
                {infractionsList.filter((i) => i.holdActive).length} Students Locked
              </div>
              <div className="text-[11px] text-danger font-medium mt-1">Registration & Transcripts Barred</div>
            </Card>
            <Card pad="md" className="border-border">
              <div className="text-xs text-text-muted">Scheduled Hearings</div>
              <div className="text-xl font-bold font-display text-gold mt-1">{hearingsList.length} Sessions</div>
              <div className="text-[11px] text-text-muted mt-1">Senate Chamber</div>
            </Card>
            <Card pad="md" className="border-border">
              <div className="text-xs text-text-muted">Honor Code Compliance</div>
              <div className="text-xl font-bold font-display text-success mt-1">99.2%</div>
              <div className="text-[11px] text-success font-medium mt-1">Institutional Integrity Rating</div>
            </Card>
          </div>

          {/* Search Bar */}
          <Card pad="md" className="border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search by student name, ID or incident number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-gold"
                />
              </div>

              <Badge tone="primary" className="text-xs font-mono">Chain of Custody Verified</Badge>
            </div>
          </Card>

          {/* Incidents Cards List */}
          <div className="space-y-4">
            {infractionsList
              .filter((i) =>
                i.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                i.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                i.id.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((inf) => (
                <Card
                  key={inf.id}
                  pad="md"
                  className={`border transition-all ${
                    inf.severity === "CRITICAL"
                      ? "border-danger/50 bg-danger-soft/5"
                      : inf.severity === "HIGH"
                      ? "border-warning/50 bg-warning-soft/5"
                      : "border-border hover:border-border/80"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 max-w-3xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          tone={inf.severity === "CRITICAL" ? "danger" : inf.severity === "HIGH" ? "warning" : "neutral"}
                          className="text-[10px] font-bold"
                        >
                          {inf.severity} SEVERITY
                        </Badge>
                        <span className="font-mono font-bold text-xs text-text">{inf.id}</span>
                        <span className="text-xs font-bold text-text font-display">• {inf.title}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-surface p-2.5 rounded-xl border border-border">
                        <div>
                          <span className="text-text-muted block text-[11px]">Accused Scholar</span>
                          <span className="font-semibold text-text">{inf.studentName} ({inf.studentId})</span>
                        </div>
                        <div>
                          <span className="text-text-muted block text-[11px]">Category</span>
                          <span className="font-mono text-primary">{inf.category}</span>
                        </div>
                        <div>
                          <span className="text-text-muted block text-[11px]">Reported By</span>
                          <span className="font-medium text-text">{inf.reportedBy}</span>
                        </div>
                      </div>

                      <p className="text-xs text-text leading-relaxed bg-surface-muted/30 p-2.5 rounded-lg border border-border/40">
                        {inf.description}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-text-muted">
                        <span>Reported: {inf.reportedAt}</span>
                        {inf.holdActive ? (
                          <span className="text-danger font-semibold flex items-center gap-1">
                            <Lock size={11} /> Active Advising & Transcript Hold Enforced
                          </span>
                        ) : (
                          <span className="text-success font-semibold flex items-center gap-1">
                            <Unlock size={11} /> Cleared (Zero Active Holds)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {inf.holdActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1.5"
                          onClick={() => handleLiftHold(inf.id, inf.studentName)}
                        >
                          <Unlock size={13} /> Lift Disciplinary Hold
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* TAB 2: TRIBUNAL HEARINGS & VERDICTS */}
      {activeTab === "hearings" && (
        <div className="space-y-6 animate-fade-in">
          <Card pad="lg" className="border-border bg-gradient-to-r from-surface to-surface-muted">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-primary-soft text-primary">
                  Statutory Due Process
                </span>
                <h3 className="text-lg font-bold font-display text-text mt-1">
                  Proctorial Tribunal Hearings & Syndicate Verdict Matrix
                </h3>
                <p className="text-xs text-text-muted mt-1 max-w-2xl">
                  Formal quasi-judicial student disciplinary hearings. Ensures legal due process, defense witness statements, and verifiable sanctions.
                </p>
              </div>

              <Badge tone="gold" className="text-xs font-mono font-bold">2 Hearings Docketed</Badge>
            </div>
          </Card>

          <div className="space-y-4">
            {hearingsList.map((hrg) => (
              <Card key={hrg.id} pad="md" className="border-border space-y-3 hover:border-gold/40 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge tone="primary" className="text-xs font-mono font-bold">{hrg.id}</Badge>
                      <span className="text-xs font-mono text-text-muted">{hrg.caseRef}</span>
                    </div>
                    <h4 className="text-sm font-bold text-text font-display mt-1.5">{hrg.tribunalBoard}</h4>
                    <p className="text-xs text-text-muted">Presiding: <span className="font-semibold text-text">{hrg.chairperson}</span></p>
                  </div>

                  <Badge tone="gold" className="text-xs font-bold font-mono">{hrg.status}</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-surface-muted/40 p-2.5 rounded-xl border border-border/60">
                  <div>
                    <span className="text-text-muted block text-[11px]">Respondent Student</span>
                    <span className="font-bold text-text">{hrg.studentName}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px]">Date & Time</span>
                    <span className="font-semibold text-gold">{hrg.hearingDate}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px]">Hearing Venue</span>
                    <span className="font-medium text-text">{hrg.venue}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-text-muted">
                    <span className="font-semibold text-text">Anticipated Sanction:</span> {hrg.verdictRecommendation}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 gap-1"
                    onClick={() => {
                      setSuccessMsg(`Hearing summons re-dispatched for ${hrg.id}`);
                      setTimeout(() => setSuccessMsg(""), 3500);
                    }}
                  >
                    <Calendar size={12} /> View Docket
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVE DISCIPLINARY ADVISING HOLDS */}
      {activeTab === "active-holds" && (
        <div className="space-y-6 animate-fade-in">
          <Card pad="lg" className="border-border bg-gradient-to-r from-surface to-surface-muted">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-danger-soft text-danger">
                  Automated Academic Intercepts
                </span>
                <h3 className="text-lg font-bold font-display text-text mt-1">
                  Active Disciplinary Registration & Transcript Holds
                </h3>
                <p className="text-xs text-text-muted mt-1 max-w-2xl">
                  Students listed below are actively barred from course registration, grade viewing, and transcript printing due to pending disciplinary proceedings.
                </p>
              </div>

              <div className="text-center px-4 py-2 rounded-xl bg-surface border border-border">
                <div className="text-xs text-text-muted">Total Locked</div>
                <div className="text-base font-bold text-danger font-display">
                  {infractionsList.filter((i) => i.holdActive).length} Scholars
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            {infractionsList
              .filter((i) => i.holdActive)
              .map((hold) => (
                <Card key={hold.id} pad="md" className="border-danger/40 bg-danger-soft/5 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge tone="danger" className="text-[10px] font-bold">ADVISING & TRANSCRIPTS LOCKED</Badge>
                        <span className="font-mono text-xs font-bold text-text">{hold.studentName} ({hold.studentId})</span>
                      </div>
                      <p className="text-xs text-text mt-1 font-medium">{hold.title}</p>
                      <span className="text-[11px] text-text-muted block">Case Reference: {hold.id} • Dept of {hold.department}</span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs gap-1.5"
                      onClick={() => handleLiftHold(hold.id, hold.studentName)}
                    >
                      <Unlock size={13} /> Clear Proctorial Hold
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: STUDENT HONOR CODE POLICY */}
      {activeTab === "code-of-conduct" && (
        <div className="space-y-6 animate-fade-in">
          <Card pad="lg" className="border-border space-y-4">
            <h3 className="text-base font-bold font-display text-text flex items-center gap-2">
              <ShieldCheck size={18} className="text-gold" />
              Institutional Academic Integrity & Student Conduct Charter
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              The University adheres to statutory UGC, ABET, and BAETE ethical codes. All enrolled scholars digitally sign the institutional honor code during initial matriculation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-3.5 rounded-xl bg-surface-muted/40 border border-border space-y-1.5">
                <h4 className="font-bold text-text">1. Examination Room Integrity</h4>
                <p className="text-text-muted text-[11px] leading-relaxed">
                  Strict prohibition of unauthorized electronic communication devices, smart wearables, and pre-written notes. Violations mandate immediate exam invalidation and tribunal docketing.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-muted/40 border border-border space-y-1.5">
                <h4 className="font-bold text-text">2. Capstone & Research Plagiarism</h4>
                <p className="text-text-muted text-[11px] leading-relaxed">
                  Maximum permitted Turnitin similarity ceiling is 10.0%. Any manuscript exhibiting source replication exceeding 3.0% from single source requires comprehensive defense panel review.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Report Infraction Modal */}
      {isInfractionModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <Card pad="lg" className="w-full max-w-lg bg-surface border-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold font-display text-text flex items-center gap-2">
                <AlertTriangle size={16} className="text-gold" />
                Report Disciplinary Infraction
              </h3>
              <button
                onClick={() => setIsInfractionModalOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface-muted"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInfraction} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Student Registration ID</label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. STU-2024-0089"
                    required
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg font-mono focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Student Full Name</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Ayesha Siddiqua"
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">Incident Title / Allegation</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Examination Room Unauthorized Note Possession"
                  required
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Incident Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-gold"
                  >
                    <option value="EXAM_INTEGRITY">Exam Hall Integrity</option>
                    <option value="ACADEMIC_DISHONESTY">Plagiarism / Dishonesty</option>
                    <option value="CAMPUS_DISCIPLINE">Campus / Hostel Conduct</option>
                    <option value="LAB_SAFETY">Laboratory Safety Breach</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Severity Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-gold"
                  >
                    <option value="CRITICAL">Critical (Immediate Lock)</option>
                    <option value="HIGH">High Severity</option>
                    <option value="MEDIUM">Medium Severity</option>
                    <option value="LOW">Low / Minor Infraction</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">Detailed Invigilator Incident Narrative</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Elaborate on confiscated physical evidence, time of incident, and signed witness testimonies..."
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-gold resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsInfractionModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Log Incident & Enforce Hold
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Success Notification */}
      {successMsg && (
        <div className="fixed bottom-6 left-6 z-50 bg-surface text-text px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium border border-border animate-fade-in">
          <CheckCircle2 size={16} className="text-success" />
          {successMsg}
        </div>
      )}
    </div>
  );
}
