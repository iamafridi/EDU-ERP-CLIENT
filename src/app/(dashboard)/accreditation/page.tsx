"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { motion } from "framer-motion";
import {
  Award,
  FileCheck2,
  CheckCircle2,
  RefreshCw,
  Download,
  Users,
  BookOpen,
  Building,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Layers,
  FileText,
  Printer,
  Search,
  Filter,
  Check,
  ExternalLink,
  GraduationCap
} from "lucide-react";
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Tabs,
} from "@/components/ui";
import { ProgressBar } from "@/components/ui/ProgressBar";

type AccreditationTab = "abet-evidence" | "ugc-benchmarks" | "accreditation-registry" | "cqi-matrix";

export default function AccreditationPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AccreditationTab>("abet-evidence");
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedCourseForEvidence, setSelectedCourseForEvidence] = useState("CSE-411");

  // Mock Harvested ABET Evidence Artifacts
  const abetArtifacts = [
    {
      id: "ART-01",
      tier: "BEST_WORK",
      tierLabel: "Top Student (99.5%)",
      studentName: "Fariha Tasnim (STU-2024-0231)",
      clo: "CLO-2 (WASM Raft Consensus)",
      score: "99.5 / 100",
      rubricMatch: "Exemplary (Level 6 Synthesis)",
      artifactFile: "CSE411_Midterm_Fariha_Tasnim_Script.pdf",
      facultyFeedback: "Faultless edge-case handling of network partitions with zero memory leaks."
    },
    {
      id: "ART-02",
      tier: "MEDIAN_WORK",
      tierLabel: "Median Student (86.0%)",
      studentName: "Nafisa Kamal (STU-2024-0188)",
      clo: "CLO-2 (WASM Raft Consensus)",
      score: "86.0 / 100",
      rubricMatch: "Proficient (Level 5 Evaluation)",
      artifactFile: "CSE411_Midterm_Nafisa_Kamal_Script.pdf",
      facultyFeedback: "Strong conceptual architecture with minor latency spikes during failover recovery."
    },
    {
      id: "ART-03",
      tier: "MARGINAL_PASS",
      tierLabel: "Marginal Pass (71.5%)",
      studentName: "Shariar Kabir (STU-2024-0210)",
      clo: "CLO-2 (WASM Raft Consensus)",
      score: "71.5 / 100",
      rubricMatch: "Satisfactory (Level 4 Analysis)",
      artifactFile: "CSE411_Midterm_Shariar_Kabir_Script.pdf",
      facultyFeedback: "Basic consensus protocol functional; needs optimization for high-concurrency throughput."
    }
  ];

  // CQI Action Matrix
  const cqiItems = [
    {
      id: "CQI-2026-01",
      courseCode: "CSE-411",
      cycleTerm: "Fall 2026 Cycle",
      flaggedDeficit: "Students scored 62% in Bloom's Level 6 distributed deadlock algorithms in 2025.",
      implementedIntervention: "Integrated interactive WASM Pyodide kernel in Classroom++ for real-time live coding lab practicums.",
      measuredOutcome: "Attainment rate improved from 62% to 91.2% in Fall 2026 cohort.",
      status: "TARGET_EXCEEDED"
    },
    {
      id: "CQI-2026-02",
      courseCode: "BMED-402",
      cycleTerm: "Fall 2026 Cycle",
      flaggedDeficit: "Clinical sensor noise filtration showed 64% threshold in Spring 2026.",
      implementedIntervention: "Added hardware simulation lab module with digital signal oscilloscope demos.",
      measuredOutcome: "Attainment rate elevated to 88.5% compliance.",
      status: "TARGET_EXCEEDED"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Accreditation & Institutional Quality Assurance (IQAC)"
        subtitle="Automated ABET / BAETE Self-Study Report (SSR) continuous evidence extractor, student artifact harvesting & UGC compliance audits."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setSuccessMsg("Continuous evidence vault synchronized across all 650+ active sections.");
                setTimeout(() => setSuccessMsg(""), 3500);
              }}
            >
              <RefreshCw size={14} /> Sync Evidence Vault
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setSuccessMsg("Compiled ABET Self-Study Report (SSR Volume II) Evidence Dossier.");
                setTimeout(() => setSuccessMsg(""), 4500);
              }}
            >
              <Download size={14} />
              Export ABET Dossier (PDF)
            </Button>
          </div>
        }
      />

      {/* CORE NAVIGATION TABS */}
      <Tabs
        value={activeTab}
        onChange={(val) => setActiveTab(val as AccreditationTab)}
        items={[
          {
            id: "abet-evidence",
            label: "ABET Continuous Evidence Dossier",
            icon: <Award size={14} />,
            count: abetArtifacts.length,
          },
          {
            id: "ugc-benchmarks",
            label: "UGC Statutory Benchmarks",
            icon: <Building size={14} />,
          },
          {
            id: "cqi-matrix",
            label: "Continuous Quality Improvement (CQI)",
            icon: <BarChart3 size={14} />,
            count: cqiItems.length,
          },
          {
            id: "accreditation-registry",
            label: "Accreditation Bodies Registry",
            icon: <ShieldCheck size={14} />,
          },
        ]}
      />

      {/* TAB 1: ABET CONTINUOUS EVIDENCE DOSSIER */}
      {activeTab === "abet-evidence" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card */}
          <Card pad="lg" className="border-border bg-gradient-to-r from-surface to-surface-muted">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-primary-soft text-primary">
                  Criterion 3 & 4 Student Outcomes Evidence
                </span>
                <h3 className="text-lg font-bold font-display text-text mt-1">
                  Automated Best / Median / Marginal Pass Artifact Extractor
                </h3>
                <p className="text-xs text-text-muted mt-1 max-w-2xl">
                  Harvests student assessment scripts, rubric score sheets, and faculty feedback directly from Classroom++ to fulfill ABET Self-Study Report (SSR) continuous documentation mandates.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-center px-4 py-2 rounded-xl bg-surface border border-border">
                  <div className="text-xs text-text-muted">Target Course</div>
                  <div className="text-base font-bold text-text font-display">CSE-411 Sec 01</div>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-surface border border-border">
                  <div className="text-xs text-text-muted">Evidence Status</div>
                  <div className="text-base font-bold text-success font-display">3/3 Harvested</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Artifacts Cards */}
          <div className="space-y-4">
            {abetArtifacts.map((art) => (
              <Card
                key={art.id}
                pad="md"
                className={`border transition-all ${
                  art.tier === "BEST_WORK"
                    ? "border-gold/50 bg-gold-soft/5"
                    : art.tier === "MEDIAN_WORK"
                    ? "border-primary/40 bg-surface"
                    : "border-border hover:border-border/80"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        tone={art.tier === "BEST_WORK" ? "gold" : art.tier === "MEDIAN_WORK" ? "primary" : "neutral"}
                        className="text-[10px] font-bold"
                      >
                        {art.tierLabel}
                      </Badge>
                      <span className="font-bold text-xs text-text">{art.studentName}</span>
                      <span className="text-xs font-mono text-primary font-semibold">• {art.clo}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-surface p-2.5 rounded-xl border border-border">
                      <div>
                        <span className="text-text-muted block text-[11px]">Assessment Score</span>
                        <span className="font-mono font-bold text-text">{art.score}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block text-[11px]">Bloom&apos;s Rubric Target</span>
                        <span className="font-medium text-text">{art.rubricMatch}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block text-[11px]">Harvested File</span>
                        <span className="font-mono text-primary truncate block">{art.artifactFile}</span>
                      </div>
                    </div>

                    <p className="text-xs text-text-muted italic bg-surface-muted/30 p-2 rounded-lg">
                      &quot;{art.facultyFeedback}&quot;
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5"
                      onClick={() => {
                        setSuccessMsg(`Extracted unedited script artifact for ${art.studentName}`);
                        setTimeout(() => setSuccessMsg(""), 3500);
                      }}
                    >
                      <Download size={13} /> Download Script PDF
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: UGC STATUTORY BENCHMARKS */}
      {activeTab === "ugc-benchmarks" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card pad="md" className="border-border">
              <div className="text-xs text-text-muted font-semibold uppercase">Faculty-to-Student Ratio</div>
              <div className="text-2xl font-bold font-mono text-text mt-2">1 : 12.5</div>
              <div className="text-xs text-success font-medium mt-1">Exceeds UGC standard (1:20)</div>
            </Card>
            <Card pad="md" className="border-border">
              <div className="text-xs text-text-muted font-semibold uppercase">Ph.D. Qualified Faculty</div>
              <div className="text-2xl font-bold font-mono text-gold mt-2">68.4%</div>
              <div className="text-xs text-text-muted mt-1">Benchmark: &ge; 40%</div>
            </Card>
            <Card pad="md" className="border-border">
              <div className="text-xs text-text-muted font-semibold uppercase">Smart Laboratory Compliance</div>
              <div className="text-2xl font-bold font-mono text-primary mt-2">100%</div>
              <div className="text-xs text-text-muted mt-1">All 42 labs certified</div>
            </Card>
            <Card pad="md" className="border-border">
              <div className="text-xs text-text-muted font-semibold uppercase">Institutional IQAC Rating</div>
              <div className="text-2xl font-bold font-mono text-success mt-2">Grade A+</div>
              <div className="text-xs text-success font-medium mt-1">Institutional Audit Cleared</div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: CQI ACTION MATRIX */}
      {activeTab === "cqi-matrix" && (
        <div className="space-y-6 animate-fade-in">
          <Card pad="lg" className="border-border bg-gradient-to-r from-surface to-surface-muted">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-gold-soft text-gold">
                  Continuous Quality Improvement (CQI)
                </span>
                <h3 className="text-lg font-bold font-display text-text mt-1">
                  Closed-Loop Curricular Remediation Matrix
                </h3>
                <p className="text-xs text-text-muted mt-1 max-w-2xl">
                  Tracks continuous assessment feedback loops: identifies learning deficits, mandates targeted interventions, and verifies measured attainment improvements in subsequent terms.
                </p>
              </div>

              <Badge tone="success" className="text-xs font-mono font-bold">2/2 Loops Closed</Badge>
            </div>
          </Card>

          <div className="space-y-4">
            {cqiItems.map((cqi) => (
              <Card key={cqi.id} pad="md" className="border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-primary">{cqi.courseCode}</span>
                    <Badge tone="success" className="text-[10px]">{cqi.cycleTerm}</Badge>
                  </div>
                  <Badge tone="success" className="text-[10px] font-bold">{cqi.status.replace(/_/g, " ")}</Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-danger-soft/10 border border-danger/20">
                    <span className="font-bold text-danger block text-[11px]">1. Historical Deficit Identified:</span>
                    <p className="text-text mt-0.5">{cqi.flaggedDeficit}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-primary-soft/10 border border-primary/20">
                    <span className="font-bold text-primary block text-[11px]">2. Implemented Interventions:</span>
                    <p className="text-text mt-0.5">{cqi.implementedIntervention}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-success-soft/10 border border-success/20">
                    <span className="font-bold text-success block text-[11px]">3. Measured Outcome & Attainment:</span>
                    <p className="text-text mt-0.5">{cqi.measuredOutcome}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ACCREDITATION BODIES REGISTRY */}
      {activeTab === "accreditation-registry" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card pad="md" className="border-border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold font-display">
                ABET
              </div>
              <h4 className="text-sm font-bold text-text font-display">ABET Computing Accreditation Commission (CAC)</h4>
              <p className="text-xs text-text-muted">International engineering and computing accreditation covering B.Sc. in CSE program.</p>
              <Badge tone="success" className="text-[10px]">Accredited (2024 - 2030)</Badge>
            </Card>

            <Card pad="md" className="border-border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gold-soft text-gold flex items-center justify-center font-bold font-display">
                BAETE
              </div>
              <h4 className="text-sm font-bold text-text font-display">Board of Accreditation for Engineering (BAETE)</h4>
              <p className="text-xs text-text-muted">Washington Accord signatory national accreditation body for engineering curricula.</p>
              <Badge tone="success" className="text-[10px]">Tier-1 Accredited</Badge>
            </Card>

            <Card pad="md" className="border-border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-surface-muted text-text flex items-center justify-center font-bold font-display">
                UGC
              </div>
              <h4 className="text-sm font-bold text-text font-display">University Grants Commission (UGC) IQAC</h4>
              <p className="text-xs text-text-muted">National statutory higher education regulatory oversight and quality assurance cell.</p>
              <Badge tone="success" className="text-[10px]">Full Statutory Approval</Badge>
            </Card>
          </div>
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
