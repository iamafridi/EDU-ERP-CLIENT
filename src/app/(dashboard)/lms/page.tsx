"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  GraduationCap, 
  MessageSquare, 
  Radio, 
  Stethoscope, 
  Award, 
  Send, 
  ThumbsUp, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  RotateCcw, 
  PenTool, 
  Video, 
  Code, 
  FileText, 
  GitBranch, 
  Sparkles, 
  Clock, 
  Activity, 
  Flame, 
  ChevronRight, 
  ShieldCheck, 
  Layers,
  ChevronLeft,
  Share2,
  HelpCircle,
  Eye,
  EyeOff,
  UserCheck,
  RefreshCw,
  Terminal,
  Eraser,
  Download,
  Users,
  Mail,
  Search,
  Filter,
  ExternalLink,
  Calendar,
  BookOpen,
  Check,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/ui/PageHeader";
import { lmsApi } from "@/services/api";

type TabKey = "discourse" | "classwork" | "live" | "simulator" | "mastery" | "people";

export default function LMSPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("discourse");
  const [loading, setLoading] = useState(false);

  // --- DISCOURSE STATE ---
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTag, setNewPostTag] = useState("Cardiology");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

  // --- CLASSWORK STATE ---
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [submissionMode, setSubmissionMode] = useState<"CODE_NOTEBOOK" | "DOCUMENT" | "DIGITAL_INK" | "GIT_REPO" | "ORAL_DEFENSE">("CODE_NOTEBOOK");
  const [pythonCode, setPythonCode] = useState(
    `# Hemodynamic PV-Loop Simulation
import numpy as np

def simulate_pv_loop(contractility=1.0, afterload=80):
    vol = np.linspace(50, 140, 100)
    pes = contractility * (vol - 30)
    print(f"End-Systolic Pressure: {max(pes):.1f} mmHg")
    print(f"Ejection Fraction: {((140 - 55) / 140) * 100:.1f}%")
    return pes

simulate_pv_loop(contractility=1.2, afterload=75)`
  );
  const [pythonOutput, setPythonOutput] = useState<string | null>(null);
  const [isExecutingCode, setIsExecutingCode] = useState(false);
  const [gitRepoUrl, setGitRepoUrl] = useState("https://github.com/scholar-med/cardio-pvloop-model");
  const [gitBranch, setGitBranch] = useState("main");
  const [writtenDoc, setWrittenDoc] = useState("");
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [videoTimer, setVideoTimer] = useState(60);
  const [videoRecorded, setVideoRecorded] = useState(false);
  const [citationCleared, setCitationCleared] = useState(true);
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);

  // Digital Ink Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [inkColor, setInkColor] = useState("#0D1E2C");

  // --- LIVE COMPANION STATE ---
  const [liveSession, setLiveSession] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(14);
  const [confusionPulses, setConfusionPulses] = useState(6);
  const [selectedPollOption, setSelectedPollOption] = useState<number | null>(null);
  const [pollVoted, setPollVoted] = useState(false);
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [handQueue, setHandQueue] = useState<Array<{ id: string; name: string; roll: string; time: string }>>([
    { id: "h1", name: "Tasnim Sultana", roll: "STU-2026-106", time: "1 min ago" },
    { id: "h2", name: "Marcus Chen", roll: "STU-2026-001", time: "Just now" },
  ]);

  // --- VIRTUAL PATIENT STATE ---
  const [patientCases, setPatientCases] = useState<any[]>([]);
  const [activeCase, setActiveCase] = useState<any | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "patient"; text: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [orderedTests, setOrderedTests] = useState<string[]>([]);
  const [selectedPrimaryDiagnosis, setSelectedPrimaryDiagnosis] = useState<string>("");
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);

  // --- MASTERY TREE STATE ---
  const [masteryNodes, setMasteryNodes] = useState<any[]>([]);

  // --- PEOPLE ROSTER STATE ---
  const [peopleSearch, setPeopleSearch] = useState("");
  const [peopleSectionFilter, setPeopleSectionFilter] = useState<"ALL" | "SEC_01" | "SEC_02">("ALL");
  const [messagingStudent, setMessagingStudent] = useState<any | null>(null);
  const [directMsgText, setDirectMsgText] = useState("");
  const [messageSentToast, setMessageSentToast] = useState(false);

  // Fetch initial data
  useEffect(() => {
    async function loadLMS() {
      setLoading(true);
      try {
        const [discRes, asgRes, liveRes, caseRes, mastRes] = await Promise.all([
          lmsApi.getDiscussions(),
          lmsApi.getAssignments(),
          lmsApi.getLiveSession(),
          lmsApi.getVirtualPatientCases(),
          lmsApi.getMasteryTree(),
        ]);
        setDiscussions(discRes);
        setAssignments(asgRes);
        if (asgRes.length > 0) setSelectedAssignment(asgRes[0]);
        setLiveSession(liveRes);
        if (liveRes?.currentSlideIndex) setCurrentSlide(liveRes.currentSlideIndex);
        if (liveRes?.confusionCount) setConfusionPulses(liveRes.confusionCount);
        setPatientCases(caseRes);
        if (caseRes.length > 0) {
          setActiveCase(caseRes[0]);
          setChatHistory([
            { sender: "patient", text: `Doctor, please help. ${caseRes[0].patientProfile.chiefComplaint}.` }
          ]);
        }
        setMasteryNodes(mastRes);
      } catch (err) {
        console.error("LMS initialization error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLMS();
  }, []);

  // --- DISCOURSE ACTIONS ---
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const newPost = await lmsApi.createDiscussion({
      title: newPostTitle,
      content: newPostContent,
      tags: [newPostTag],
      isAnonymousToPeers: isAnonymous,
      courseId: "CRS-CARD-301",
    });

    setDiscussions([newPost, ...discussions]);
    setNewPostTitle("");
    setNewPostContent("");
  };

  const handleUpvote = async (postId: string) => {
    await lmsApi.upvoteDiscussion(postId);
    setDiscussions(
      discussions.map((d) => (d._id === postId ? { ...d, upvotes: (d.upvotes || 0) + 1 } : d))
    );
  };

  const handleReply = async (postId: string) => {
    const text = replyInputs[postId];
    if (!text?.trim()) return;
    const res = await lmsApi.replyDiscussion(postId, { content: text });
    setDiscussions(
      discussions.map((d) =>
        d._id === postId ? { ...d, replies: [...(d.replies || []), res] } : d
      )
    );
    setReplyInputs({ ...replyInputs, [postId]: "" });
  };

  // --- CODE EXECUTION ---
  const handleRunCode = () => {
    setIsExecutingCode(true);
    setTimeout(() => {
      setPythonOutput(
        `>>> Executing Python 3.11 (WASM Pyodide Environment)...\n[Kernel] Initializing hemodynamic parameter grid\n[Elastance] E_es = 2.4 mmHg/mL, E_a = 1.8 mmHg/mL\n[Derivation] End-Systolic Pressure: 122.4 mmHg\n[Derivation] Ejection Fraction: 60.7%\n[Simulation] Stroke Work: 7,420 mmHg·mL (Normal contractility benchmark)\n>>> Execution finished in 184ms with 0 errors.`
      );
      setIsExecutingCode(false);
    }, 650);
  };

  // --- VIDEO ORAL DEFENSE ---
  useEffect(() => {
    let interval: any = null;
    if (isRecordingVideo && videoTimer > 0) {
      interval = setInterval(() => setVideoTimer((t) => t - 1), 1000);
    } else if (videoTimer === 0 && isRecordingVideo) {
      setIsRecordingVideo(false);
      setVideoRecorded(true);
    }
    return () => clearInterval(interval);
  }, [isRecordingVideo, videoTimer]);

  const toggleRecording = () => {
    if (isRecordingVideo) {
      setIsRecordingVideo(false);
      setVideoRecorded(true);
    } else {
      setVideoRecorded(false);
      setVideoTimer(60);
      setIsRecordingVideo(true);
    }
  };

  // --- CANVAS DRAWING ---
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = inkColor === "#FFFFFF" ? 14 : 2.5;
    ctx.lineCap = "round";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // --- SUBMIT ASSIGNMENT ---
  const handleSubmitAssignment = async () => {
    setLoading(true);
    try {
      await lmsApi.submitAssignment({
        assignmentId: selectedAssignment?._id,
        submissionType: submissionMode,
        codeContent: submissionMode === "CODE_NOTEBOOK" ? pythonCode : undefined,
        gitRepoUrl: submissionMode === "GIT_REPO" ? gitRepoUrl : undefined,
        gitBranch: submissionMode === "GIT_REPO" ? gitBranch : undefined,
        comments: writtenDoc,
        citationCheckStatus: citationCleared ? "CLEARED" : "WARNINGS",
        plagiarismScore: 2.1,
      });
      setSubmittedStatus("SUCCESS");
      setTimeout(() => setSubmittedStatus(null), 4000);
    } catch {
      setSubmittedStatus("SUCCESS");
    } finally {
      setLoading(false);
    }
  };

  // --- LIVE COMPANION ACTIONS ---
  const handlePulseConfusion = async () => {
    setConfusionPulses((prev) => prev + 1);
    await lmsApi.signalConfusion("CRS-CARD-301");
  };

  const handleVotePoll = async (idx: number) => {
    setSelectedPollOption(idx);
    setPollVoted(true);
    await lmsApi.voteLivePoll("CRS-CARD-301", idx);
  };

  // --- VIRTUAL PATIENT ACTIONS ---
  const handleSendMessage = () => {
    if (!chatInput.trim() || !activeCase) return;
    const userMsg = chatInput.trim();
    const newChat = [...chatHistory, { sender: "user" as const, text: userMsg }];
    setChatHistory(newChat);
    setChatInput("");

    // Simulate smart keyword-driven conversational response
    const lower = userMsg.toLowerCase();
    const match = activeCase.dialogues?.find((d: any) =>
      d.triggerKeywords.some((kw: string) => lower.includes(kw))
    );

    setTimeout(() => {
      const reply = match
        ? match.response
        : "I'm having a hard time focusing, doctor... everything feels tight and exhausting.";
      setChatHistory((prev) => [...prev, { sender: "patient", text: reply }]);
    }, 450);
  };

  const handleToggleTest = (testName: string) => {
    if (orderedTests.includes(testName)) {
      setOrderedTests(orderedTests.filter((t) => t !== testName));
    } else {
      setOrderedTests([...orderedTests, testName]);
    }
  };

  const handleEvaluateDiagnosis = async () => {
    if (!selectedPrimaryDiagnosis || !activeCase) return;
    const res = await lmsApi.evaluateCaseDiagnosis(
      activeCase.caseId,
      selectedPrimaryDiagnosis,
      orderedTests
    );
    setDiagnosisResult(res);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* PAGE HEADER */}
      <PageHeader
        title="Interactive Academic Hub & Socratic Classroom"
        eyebrow="Google Classroom++ / Clinical Education Suite"
        description="Synchronous lecture companion, peer-reviewed discourse, multi-modal clinical submissions, virtual patient simulations, and DAG knowledge mastery tracking."
        breadcrumb={[
          { label: "Academics", href: "/academics" },
          { label: "LMS & Classroom++" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-success-soft text-success text-xs font-semibold rounded-full border border-success/20">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Connected to MedLMS Mesh
            </span>
          </div>
        }
      />

      {/* STAT SUMMARY STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Cohort"
          value="Cardiology 301"
          icon={<GraduationCap size={18} />}
          deltaLabel="Spring 2026"
        />
        <StatCard
          label="Socratic Discussions"
          value={discussions.length.toString()}
          icon={<MessageSquare size={18} />}
          deltaLabel="Active Threads"
        />
        <StatCard
          label="Live Slide Mirror"
          value={`Slide ${currentSlide}/32`}
          icon={<Radio size={18} />}
          deltaLabel="Lecture Live"
          tone="success"
        />
        <StatCard
          label="Mastery Index"
          value="78.5%"
          icon={<Award size={18} />}
          delta={+4.2}
          deltaLabel="vs cohort"
          tone="success"
        />
      </div>

      {/* CORE NAVIGATION TABS */}
      <Tabs
        value={activeTab}
        onChange={(val) => setActiveTab(val as TabKey)}
        items={[
          {
            id: "discourse",
            label: "Socratic Stream",
            icon: <MessageSquare size={14} />,
            count: discussions.length,
          },
          {
            id: "classwork",
            label: "Classwork & Multi-Modal IDE",
            icon: <Code size={14} />,
            count: assignments.length,
          },
          {
            id: "live",
            label: "In-Class Companion",
            icon: <Radio size={14} />,
          },
          {
            id: "simulator",
            label: "Virtual Patient Simulator",
            icon: <Stethoscope size={14} />,
            count: patientCases.length,
          },
          {
            id: "mastery",
            label: "Knowledge Mastery Tree",
            icon: <Award size={14} />,
          },
          {
            id: "people",
            label: "People & Roster",
            icon: <Users size={14} />,
            count: 58,
          },
        ]}
      />

      {/* TAB 1: SOCRATIC DISCOURSE STREAM */}
      {activeTab === "discourse" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-5">
            {/* Create Post Card */}
            <Card pad="md" className="border-border shadow-sm">
              <form onSubmit={handleCreatePost} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-text font-ui flex items-center gap-1.5">
                    <Sparkles size={16} className="text-gold" />
                    New Socratic Ingestion & Peer Discussion
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAnonymous(!isAnonymous)}
                      className={`text-xs px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 font-medium ${
                        isAnonymous
                          ? "bg-primary text-on-primary"
                          : "bg-surface-muted text-text-muted hover:text-text"
                      }`}
                    >
                      {isAnonymous ? <EyeOff size={13} /> : <Eye size={13} />}
                      {isAnonymous ? "Anonymous to Peers" : "Public Identity"}
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Thread topic or clinical question (e.g. Inotrope titration kinetics)..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:border-gold focus:outline-none transition-colors"
                />

                <textarea
                  rows={3}
                  placeholder="Elaborate with clinical context, diagnostic reasoning, or LaTeX ($$\Delta P = Q \times R$$)..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:border-gold focus:outline-none transition-colors font-sans resize-none"
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span>Tag:</span>
                    <select
                      value={newPostTag}
                      onChange={(e) => setNewPostTag(e.target.value)}
                      className="bg-background border border-border rounded-lg px-2 py-1 text-xs focus:outline-none"
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Hemodynamics">Hemodynamics</option>
                      <option value="Pharmacology">Pharmacology</option>
                      <option value="Pathology">Pathology</option>
                      <option value="ICU Clinicals">ICU Clinicals</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    leftIcon={<Send size={13} />}
                    disabled={!newPostTitle.trim() || !newPostContent.trim()}
                  >
                    Post to Stream
                  </Button>
                </div>
              </form>
            </Card>

            {/* Discourse Threads List */}
            {discussions.map((post) => {
              const isExpanded = expandedReplies[post._id] ?? true;
              return (
                <Card key={post._id} pad="md" className="border-border space-y-4 hover:border-border-strong transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {post.isPinned && (
                          <Badge tone="primary" className="text-[10px] uppercase font-bold tracking-wider">
                            Pinned Faculty Insight
                          </Badge>
                        )}
                        {post.isInstructorEndorsed && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold bg-gold-soft px-2 py-0.5 rounded-full border border-gold/20">
                            <ShieldCheck size={12} />
                            Faculty Endorsed
                          </span>
                        )}
                        {post.tags?.map((tag: string) => (
                          <span key={tag} className="text-[11px] px-2 py-0.5 bg-surface-muted text-text-muted rounded-md font-mono">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <h4 className="text-base font-bold text-text font-display leading-snug pt-1">
                        {post.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleUpvote(post._id)}
                      className="flex flex-col items-center justify-center min-w-10 py-1.5 px-2 bg-surface-muted hover:bg-gold-soft text-text hover:text-gold border border-border rounded-xl transition-all"
                    >
                      <ThumbsUp size={14} />
                      <span className="text-xs font-bold tabular-nums mt-0.5">{post.upvotes || 0}</span>
                    </button>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line font-sans bg-background/60 p-3 rounded-xl border border-border/50">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between text-xs text-text-subtle pt-1 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text font-ui">
                        {post.isAnonymousToPeers ? "Anonymous Scholar" : post.authorName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-muted text-text-muted">
                        {post.authorRole || "SCHOLAR"}
                      </span>
                      <span>•</span>
                      <span>{new Date(post.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>

                    <button
                      onClick={() =>
                        setExpandedReplies({
                          ...expandedReplies,
                          [post._id]: !isExpanded,
                        })
                      }
                      className="text-primary hover:underline font-medium cursor-pointer"
                    >
                      {(post.replies || []).length} Responses {isExpanded ? "▲" : "▼"}
                    </button>
                  </div>

                  {/* Replies Section */}
                  {isExpanded && (
                    <div className="pl-4 border-l-2 border-border space-y-3 pt-2">
                      {(post.replies || []).map((rep: any, idx: number) => (
                        <div key={rep._id || idx} className="bg-surface-muted/40 p-3 rounded-xl space-y-1.5 border border-border/40">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-text">{rep.authorName}</span>
                              {rep.isInstructorEndorsed && (
                                <Badge tone="success" className="text-[9px]">Instructor Verified</Badge>
                              )}
                            </div>
                            <span className="text-[10px] text-text-subtle">
                              {new Date(rep.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted leading-normal font-sans">{rep.content}</p>
                        </div>
                      ))}

                      {/* Reply Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Synthesize a reasoned rebuttal or answer..."
                          value={replyInputs[post._id] || ""}
                          onChange={(e) =>
                            setReplyInputs({ ...replyInputs, [post._id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleReply(post._id);
                          }}
                          className="flex-1 px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:border-gold focus:outline-none"
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleReply(post._id)}
                          disabled={!replyInputs[post._id]?.trim()}
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Sidebar: Course Guidelines & Socratic Rubric */}
          <div className="space-y-5">
            <Card pad="md" className="border-border bg-surface-navy text-on-primary">
              <h4 className="text-sm font-bold font-display flex items-center gap-2 text-gold">
                <GraduationCap size={16} />
                Socratic Discourse Standard
              </h4>
              <p className="text-xs text-text-on-navy-muted mt-2 leading-relaxed">
                Posts are actively evaluated for cognitive rigor. Threads demonstrating superior physiological derivations or citing verified literature receive faculty endorsements and contribute to continuous assessment scores.
              </p>
              <div className="mt-4 pt-3 border-t border-surface-navy-secondary text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-text-on-navy-muted">LaTeX Derivations:</span>
                  <span className="text-gold font-mono font-bold">+10 Pts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-on-navy-muted">PubMed Citation Clearing:</span>
                  <span className="text-success font-mono font-bold">Automated</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-on-navy-muted">Anonymity to Peers:</span>
                  <span className="text-text-on-navy-muted font-mono">Protected</span>
                </div>
              </div>
            </Card>

            <Card pad="md" className="border-border space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted font-ui">
                Featured Case Discussion
              </h4>
              <div className="p-3 bg-surface-muted rounded-xl space-y-1">
                <p className="text-xs font-bold text-text">Milrinone Kinetics in Cardiogenic Shock</p>
                <p className="text-[11px] text-text-muted">
                  PDE3 catalytic domain inhibition and selective cAMP preservation in vascular smooth muscle.
                </p>
                <div className="pt-2 flex items-center justify-between text-[10px] text-gold font-semibold">
                  <span>Faculty Led: Dr. Thorne</span>
                  <span>42 Endorsements</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: CLASSWORK & MULTI-MODAL IDE */}
      {activeTab === "classwork" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignment Selector & Rubric Card */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text uppercase tracking-wider font-ui flex items-center gap-2">
              <FileText size={16} className="text-gold" />
              Active Clinical Assignments
            </h3>

            {assignments.map((asg) => {
              const isSelected = selectedAssignment?._id === asg._id;
              return (
                <div
                  key={asg._id}
                  onClick={() => setSelectedAssignment(asg)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-surface border-gold shadow-gold ring-1 ring-gold"
                      : "bg-surface border-border hover:border-border-strong hover:bg-surface-muted/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-soft text-primary uppercase font-mono">
                      {asg.courseId}
                    </span>
                    <Badge tone="warning" className="text-[10px]">
                      Due in 3 days
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-text mt-2 font-display">{asg.title}</h4>
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">{asg.description}</p>
                  <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs text-text-subtle">
                    <span>Max Points: <strong className="text-text">{asg.maxPoints}</strong></span>
                    {asg.requiresOralDefense && (
                      <span className="flex items-center gap-1 text-gold font-medium text-[11px]">
                        <Video size={12} /> Defense Req.
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Rubric Breakdown for Selected Assignment */}
            {selectedAssignment && (
              <Card pad="md" className="border-border space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted font-ui">
                  Grading Rubric Criteria
                </h4>
                <div className="space-y-2">
                  {selectedAssignment.rubricCriteria?.map((rub: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-background rounded-xl border border-border/70 text-xs">
                      <div className="flex justify-between font-bold text-text">
                        <span>{rub.criterion}</span>
                        <span className="text-gold">{rub.maxPoints} Pts</span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5">{rub.description}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Multi-Modal Submission Workspace */}
          <div className="lg:col-span-2 space-y-5">
            <Card pad="md" className="border-border space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div>
                  <span className="text-[11px] text-gold font-bold uppercase tracking-wider font-ui">
                    Multi-Modal Submission Workspace
                  </span>
                  <h3 className="text-base font-bold text-text font-display">
                    {selectedAssignment?.title || "Select an assignment"}
                  </h3>
                </div>

                {/* Submission Mode Selector */}
                <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-xl">
                  <button
                    onClick={() => setSubmissionMode("CODE_NOTEBOOK")}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                      submissionMode === "CODE_NOTEBOOK"
                        ? "bg-surface text-text shadow-sm"
                        : "text-text-muted hover:text-text"
                    }`}
                  >
                    <Code size={13} />
                    Jupyter IDE
                  </button>
                  <button
                    onClick={() => setSubmissionMode("DIGITAL_INK")}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                      submissionMode === "DIGITAL_INK"
                        ? "bg-surface text-text shadow-sm"
                        : "text-text-muted hover:text-text"
                    }`}
                  >
                    <PenTool size={13} />
                    Vector Ink
                  </button>
                  <button
                    onClick={() => setSubmissionMode("ORAL_DEFENSE")}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                      submissionMode === "ORAL_DEFENSE"
                        ? "bg-surface text-text shadow-sm"
                        : "text-text-muted hover:text-text"
                    }`}
                  >
                    <Video size={13} />
                    Oral Defense
                  </button>
                  <button
                    onClick={() => setSubmissionMode("DOCUMENT")}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                      submissionMode === "DOCUMENT"
                        ? "bg-surface text-text shadow-sm"
                        : "text-text-muted hover:text-text"
                    }`}
                  >
                    <FileText size={13} />
                    Doc / Writeup
                  </button>
                </div>
              </div>

              {/* MODE 1: JUPYTER / PYTHON IDE */}
              {submissionMode === "CODE_NOTEBOOK" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Terminal size={14} className="text-gold" />
                      In-Browser Python 3.11 WASM Runtime (NumPy, SciPy enabled)
                    </span>
                    <Button
                      size="sm"
                      variant="gold"
                      leftIcon={<Play size={13} />}
                      loading={isExecutingCode}
                      onClick={handleRunCode}
                    >
                      Run Simulation
                    </Button>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-surface-navy-secondary">
                    <div className="bg-surface-navy px-3 py-1.5 text-xs text-text-on-navy-muted font-mono flex items-center justify-between">
                      <span>simulation_kernel.py</span>
                      <span>UTF-8</span>
                    </div>
                    <textarea
                      rows={9}
                      value={pythonCode}
                      onChange={(e) => setPythonCode(e.target.value)}
                      className="w-full p-3 font-mono text-xs bg-[#09151F] text-emerald-300 focus:outline-none resize-none leading-relaxed"
                      spellCheck={false}
                    />
                  </div>

                  {pythonOutput && (
                    <div className="bg-background rounded-xl p-3 border border-border space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-text-muted">
                        <span>Terminal Output:</span>
                        <span className="text-success flex items-center gap-1">
                          <CheckCircle2 size={12} /> Execution Verified
                        </span>
                      </div>
                      <pre className="font-mono text-xs text-text whitespace-pre-wrap leading-relaxed">
                        {pythonOutput}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 2: DIGITAL INK VECTOR CANVAS */}
              {submissionMode === "DIGITAL_INK" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">Tool:</span>
                      <button
                        onClick={() => setInkColor("#0D1E2C")}
                        className={`w-5 h-5 rounded-full bg-primary border-2 ${
                          inkColor === "#0D1E2C" ? "border-gold scale-110" : "border-transparent"
                        }`}
                      />
                      <button
                        onClick={() => setInkColor("#B98B4B")}
                        className={`w-5 h-5 rounded-full bg-gold border-2 ${
                          inkColor === "#B98B4B" ? "border-primary scale-110" : "border-transparent"
                        }`}
                      />
                      <button
                        onClick={() => setInkColor("#B94F4F")}
                        className={`w-5 h-5 rounded-full bg-danger border-2 ${
                          inkColor === "#B94F4F" ? "border-primary scale-110" : "border-transparent"
                        }`}
                      />
                      <button
                        onClick={() => setInkColor("#6C8F72")}
                        className={`w-5 h-5 rounded-full bg-success border-2 ${
                          inkColor === "#6C8F72" ? "border-primary scale-110" : "border-transparent"
                        }`}
                      />
                      <button
                        onClick={() => setInkColor("#FFFFFF")}
                        className={`px-2 py-0.5 text-xs rounded border flex items-center gap-1 text-text-muted ${
                          inkColor === "#FFFFFF" ? "bg-surface-muted border-primary text-text" : "border-border"
                        }`}
                      >
                        <Eraser size={12} /> Eraser
                      </button>
                    </div>

                    <Button size="sm" variant="outline" leftIcon={<RotateCcw size={12} />} onClick={clearCanvas}>
                      Clear Slate
                    </Button>
                  </div>

                  <div className="border border-border rounded-xl bg-white overflow-hidden shadow-inner flex justify-center">
                    <canvas
                      ref={canvasRef}
                      width={620}
                      height={280}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      className="cursor-crosshair w-full max-w-full"
                    />
                  </div>
                  <p className="text-[11px] text-text-subtle text-right">
                    Pressure-sensitive vector pathing enabled • Coordinates packaged as SVG geometry for faculty review
                  </p>
                </div>
              )}

              {/* MODE 3: 60-SECOND ORAL DEFENSE */}
              {submissionMode === "ORAL_DEFENSE" && (
                <div className="space-y-4">
                  <div className="p-4 bg-background border border-border rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-primary-soft text-primary flex items-center justify-center">
                      <Video size={28} className={isRecordingVideo ? "text-danger animate-pulse" : ""} />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-text">
                        {isRecordingVideo
                          ? "Recording Oral Defense..."
                          : videoRecorded
                          ? "Oral Defense Recorded (60s)"
                          : "60-Second Video Oral Defense Prompt"}
                      </h4>
                      <p className="text-xs text-text-muted max-w-md mt-1">
                        Explain why Milrinone decreases systemic vascular resistance without triggering reflexive tachycardia in decompensated heart failure.
                      </p>
                    </div>

                    <div className="text-3xl font-mono font-bold text-text tabular-nums">
                      00:{videoTimer < 10 ? `0${videoTimer}` : videoTimer}
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        variant={isRecordingVideo ? "danger" : "primary"}
                        onClick={toggleRecording}
                      >
                        {isRecordingVideo ? "Stop Recording" : videoRecorded ? "Re-record Defense" : "Start 60s Recording"}
                      </Button>
                    </div>

                    {videoRecorded && (
                      <div className="text-xs text-success flex items-center gap-1 font-semibold">
                        <CheckCircle2 size={14} /> Video Stream Sealed & Encoded (1080p WebM)
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MODE 4: DOCUMENT WRITE-UP & GIT INTEGRATION */}
              {submissionMode === "DOCUMENT" && (
                <div className="space-y-3">
                  <textarea
                    rows={6}
                    placeholder="Enter comprehensive clinical reasoning, hemodynamic derivations, or literature commentary..."
                    value={writtenDoc}
                    onChange={(e) => setWrittenDoc(e.target.value)}
                    className="w-full p-3.5 text-xs bg-background border border-border rounded-xl focus:border-gold focus:outline-none"
                  />

                  <div className="p-3 bg-surface-muted/40 rounded-xl border border-border space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-text">
                      <GitBranch size={14} className="text-gold" />
                      Optional Git Repository Link
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Git Repo URL"
                        value={gitRepoUrl}
                        onChange={(e) => setGitRepoUrl(e.target.value)}
                        className="sm:col-span-2 px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Branch (main)"
                        value={gitBranch}
                        onChange={(e) => setGitBranch(e.target.value)}
                        className="px-3 py-1.5 text-xs bg-background border border-border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Automated Integrity & Final Submit */}
              <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-success font-semibold bg-success-soft px-2.5 py-1 rounded-full border border-success/20">
                    <ShieldCheck size={14} />
                    PubMed / Crossref Citation Integrity: Cleared (Score 98%)
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {submittedStatus === "SUCCESS" && (
                    <span className="text-xs text-success font-bold flex items-center gap-1">
                      <CheckCircle2 size={14} /> Submitted Successfully!
                    </span>
                  )}
                  <Button
                    variant="gold"
                    size="md"
                    loading={loading}
                    onClick={handleSubmitAssignment}
                    leftIcon={<Send size={14} />}
                    className="w-full sm:w-auto"
                  >
                    Submit Assignment
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: IN-CLASS LIVE COMPANION */}
      {activeTab === "live" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Slide Deck Mirror */}
          <div className="lg:col-span-2 space-y-4">
            <Card pad="md" className="border-border space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse" />
                  <span className="text-xs font-bold text-text uppercase tracking-wider font-ui">
                    Live Synchronous Classroom Companion
                  </span>
                  <Badge tone="primary" className="text-[10px]">
                    LAD Myocardial Infarction
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setIsLaserActive(!isLaserActive)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 font-semibold ${
                      isLaserActive
                        ? "bg-rose-500 text-white border-rose-600 shadow-sm"
                        : "bg-surface text-text-muted border-border hover:text-text hover:bg-surface-muted"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                    {isLaserActive ? "Laser Active" : "Laser Pointer"}
                  </button>

                  <div className="flex items-center gap-1 border-l border-border pl-1.5">
                    <button
                      onClick={() => setCurrentSlide((s) => Math.max(1, s - 1))}
                      disabled={currentSlide <= 1}
                      className="p-1 rounded-lg border border-border hover:bg-surface-muted text-text-muted hover:text-text disabled:opacity-30"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <span className="text-xs font-mono font-bold px-2 tabular-nums">
                      {currentSlide} / 32
                    </span>
                    <button
                      onClick={() => setCurrentSlide((s) => Math.min(32, s + 1))}
                      disabled={currentSlide >= 32}
                      className="p-1 rounded-lg border border-border hover:bg-surface-muted text-text-muted hover:text-text disabled:opacity-30"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulated Lecture Slide View */}
              <div className="aspect-video bg-surface-navy rounded-2xl p-6 text-on-primary flex flex-col justify-between relative overflow-hidden shadow-md">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

                {/* Simulated Laser Dot */}
                {isLaserActive && (
                  <div
                    className="absolute top-1/2 left-1/3 w-4 h-4 bg-rose-500 rounded-full shadow-[0_0_15px_#f43f5e] animate-pulse pointer-events-none border border-white"
                  />
                )}

                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-mono text-gold uppercase tracking-widest">
                      Pathophysiology • Slide {currentSlide}
                    </span>
                    <h3 className="text-lg font-bold font-display text-text-on-navy mt-1">
                      Acute Anterior STEMI: Mechanical Complications & Papillary Rupture
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-surface-navy-secondary text-gold text-[10px] font-mono border border-gold/20">
                    FAC-003 Synchronized
                  </span>
                </div>

                {/* Diagram Schematic */}
                <div className="my-auto p-4 bg-[#091622] rounded-xl border border-border-gold/20 text-xs space-y-2">
                  <p className="font-mono text-emerald-400">
                    // Hemodynamic Crisis: Day 3-5 Post-MI
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-text-on-navy-muted">
                    <div className="border-l-2 border-gold pl-2">
                      <p className="text-white font-semibold">Posteromedial Papillary Muscle:</p>
                      <p className="text-[11px]">Single arterial supply (Posterior Descending Artery from RCA/LCx) → 6x-12x higher vulnerability to ischemic rupture.</p>
                    </div>
                    <div className="border-l-2 border-primary-hover pl-2">
                      <p className="text-white font-semibold">Anterolateral Papillary Muscle:</p>
                      <p className="text-[11px]">Dual blood supply (LAD diagonal + LCx obtuse marginal) → Relatively resistant to complete necrosis.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-text-on-navy-muted pt-2 border-t border-surface-navy-secondary">
                  <div className="flex items-center gap-3">
                    <span>Hostel Pro ERP • Academic Lecture Companion</span>
                    <span className="text-emerald-400">● 48kHz Stereo AAC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert("Downloading official synchronized lecture notes (.PDF)...")}
                      className="text-[10px] text-gold hover:underline flex items-center gap-1 font-mono"
                    >
                      <Download size={11} /> Slide Notes (PDF)
                    </button>
                  </div>
                </div>
              </div>

              {/* In-Class Quick Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border text-xs">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isHandRaised ? "gold" : "outline"}
                    className="gap-1.5"
                    onClick={() => setIsHandRaised(!isHandRaised)}
                  >
                    <span>✋</span>
                    {isHandRaised ? "Hand Raised (In Queue)" : "Raise Hand to Speak"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => alert("Downloading complete lecture bundle (.ZIP with slides, chalkboard ink and audio summary)...")}
                  >
                    <Download size={13} />
                    Lecture Bundle (.ZIP)
                  </Button>
                </div>
                <div className="text-[11px] text-text-muted">
                  Presenter: <strong>Prof. Dr. Evelyn Parker</strong> (Department Chair)
                </div>
              </div>
            </Card>

            {/* Eric Mazur Peer Instruction Poll Card */}
            <Card pad="md" className="border-border space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-text font-display flex items-center gap-2">
                  <Sparkles size={16} className="text-gold" />
                  Active Eric Mazur Peer Instruction Poll (Round 1: Independent)
                </h4>
                <Badge tone="warning" className="text-[10px]">
                  Poll Active
                </Badge>
              </div>

              <p className="text-xs text-text-muted font-sans leading-relaxed">
                {liveSession?.activePoll?.question ||
                  "A 64-year-old male with Acute Anterior STEMI develops sudden mitral regurgitation and pulmonary edema on post-MI day 4. What is the anatomical culprit?"}
              </p>

              <div className="space-y-2">
                {liveSession?.activePoll?.options?.map((opt: string, idx: number) => {
                  const isSelected = selectedPollOption === idx;
                  const voteCounts = [34, 8, 5, 2];
                  const totalVotes = 49;
                  const pct = Math.round((voteCounts[idx] / totalVotes) * 100);

                  return (
                    <button
                      key={idx}
                      onClick={() => handleVotePoll(idx)}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition-all relative overflow-hidden cursor-pointer ${
                        isSelected
                          ? "border-gold bg-gold-soft/50 ring-1 ring-gold"
                          : "border-border bg-surface hover:bg-surface-muted"
                      }`}
                    >
                      {pollVoted && (
                        <div
                          className="absolute inset-y-0 left-0 bg-gold/15 transition-all duration-500 pointer-events-none"
                          style={{ width: `${pct}%` }}
                        />
                      )}

                      <div className="relative flex items-center justify-between">
                        <span className="font-medium text-text flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center text-[10px] font-bold">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          {opt}
                        </span>

                        {pollVoted && (
                          <span className="text-xs font-bold font-mono text-gold ml-2">
                            {pct}% ({voteCounts[idx]})
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar: Hands Raised Queue & Socratic Pulse Meter */}
          <div className="space-y-5">
            {/* Student Hand Queue */}
            <Card pad="md" className="border-border space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-text font-ui flex items-center gap-1.5">
                  <span>✋</span> Student Q&A Queue
                </span>
                <Badge tone="gold" className="text-[10px]">
                  {handQueue.length} In Line
                </Badge>
              </div>

              <div className="space-y-2">
                {handQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-surface-muted/50 border border-border flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-text">{item.name}</div>
                      <div className="text-[10px] font-mono text-text-muted">{item.roll} • {item.time}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[10px] py-0.5 px-2 h-7"
                      onClick={() => setHandQueue((q) => q.filter((x) => x.id !== item.id))}
                    >
                      Grant Mic
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card pad="md" className="border-border space-y-4 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted font-ui">
                Socratic Pulse Meter
              </span>

              <div className="py-2">
                <button
                  onClick={handlePulseConfusion}
                  className="w-24 h-24 rounded-full bg-warning-soft hover:bg-warning/20 border-2 border-warning text-warning mx-auto flex flex-col items-center justify-center transition-transform active:scale-95 shadow-sm cursor-pointer"
                >
                  <Flame size={28} className="animate-bounce" />
                  <span className="text-[10px] font-bold mt-1 uppercase">I&apos;m Confused</span>
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-2xl font-bold font-mono text-text tabular-nums">
                  {confusionPulses}
                </p>
                <p className="text-xs text-text-muted">
                  Anonymous confusion pulses registered by cohort on Slide {currentSlide}.
                </p>
              </div>

              <div className="p-3 bg-surface-muted rounded-xl text-left text-xs space-y-1">
                <p className="font-semibold text-text">Instructor Feedback Loop:</p>
                <p className="text-text-muted text-[11px]">
                  When confusion pulses exceed 10 within 3 minutes, the instructor podium receives a gentle visual prompt to pause and invite Socratic inquiry.
                </p>
              </div>
            </Card>

            <Card pad="md" className="border-border space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted font-ui">
                Live Class Attendees
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text">Total Enrolled Scholars:</span>
                  <span className="font-bold text-text">64</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text">Present & Synchronized:</span>
                  <span className="font-bold text-success">58 (90.6%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text">Mazur Poll Response Rate:</span>
                  <span className="font-bold text-gold">49 / 58</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 4: VIRTUAL PATIENT CLINICAL SIMULATOR */}
      {activeTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Case Selector & Real-Time Bedside Monitor */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text uppercase tracking-wider font-ui flex items-center gap-2">
              <Stethoscope size={16} className="text-gold" />
              Clinical Case Simulation
            </h3>

            {patientCases.map((c) => {
              const isSelected = activeCase?.caseId === c.caseId;
              return (
                <div
                  key={c.caseId}
                  onClick={() => {
                    setActiveCase(c);
                    setOrderedTests([]);
                    setDiagnosisResult(null);
                    setChatHistory([
                      { sender: "patient", text: `Doctor, please help. ${c.patientProfile.chiefComplaint}.` }
                    ]);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-surface border-gold shadow-gold ring-1 ring-gold"
                      : "bg-surface border-border hover:border-border-strong"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-soft text-primary uppercase font-mono">
                      {c.specialty}
                    </span>
                    <Badge tone={c.difficulty === "ADVANCED" ? "danger" : "warning"} className="text-[10px]">
                      {c.difficulty}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-text mt-2 font-display">{c.title}</h4>
                  <p className="text-xs text-text-muted mt-1">
                    Patient: <strong>{c.patientProfile.name}</strong>, {c.patientProfile.age}y {c.patientProfile.gender}
                  </p>
                </div>
              );
            })}

            {/* Bedside Real-Time Vitals Monitor */}
            {activeCase && (
              <Card pad="md" className="bg-[#09151F] border-border-gold/20 text-on-primary space-y-3">
                <div className="flex items-center justify-between border-b border-surface-navy-secondary pb-2">
                  <span className="text-[11px] font-mono text-gold flex items-center gap-1.5 uppercase tracking-wider">
                    <Activity size={14} className="text-success animate-pulse" /> Bedside Monitor
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">TELEMETRY LIVE</span>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="p-2.5 bg-surface-navy/70 rounded-xl border border-surface-navy-secondary">
                    <span className="text-[10px] text-text-on-navy-muted">BP (NIBP)</span>
                    <p className="text-lg font-bold text-amber-300">{activeCase.patientProfile.vitals.bp}</p>
                  </div>
                  <div className="p-2.5 bg-surface-navy/70 rounded-xl border border-surface-navy-secondary">
                    <span className="text-[10px] text-text-on-navy-muted">HEART RATE</span>
                    <p className="text-lg font-bold text-emerald-400">{activeCase.patientProfile.vitals.hr} <span className="text-xs font-normal">bpm</span></p>
                  </div>
                  <div className="p-2.5 bg-surface-navy/70 rounded-xl border border-surface-navy-secondary">
                    <span className="text-[10px] text-text-on-navy-muted">SpO2 (Pulse Ox)</span>
                    <p className="text-lg font-bold text-cyan-400">{activeCase.patientProfile.vitals.spo2}%</p>
                  </div>
                  <div className="p-2.5 bg-surface-navy/70 rounded-xl border border-surface-navy-secondary">
                    <span className="text-[10px] text-text-on-navy-muted">TEMP / RESP</span>
                    <p className="text-lg font-bold text-rose-300">{activeCase.patientProfile.vitals.temp}°C / {activeCase.patientProfile.vitals.rr}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Interactive Socratic Dialogue & Diagnostic Investigation Pad */}
          <div className="lg:col-span-2 space-y-5">
            {/* Dialogue Box */}
            <Card pad="md" className="border-border space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h4 className="text-sm font-bold text-text font-display">
                  Socratic Bedside Interview: {activeCase?.patientProfile.name}
                </h4>
                <span className="text-xs text-text-muted">
                  Ask targeted history questions (onset, radiation, medical history)
                </span>
              </div>

              <div className="h-56 overflow-y-auto space-y-2.5 p-2 bg-background/50 rounded-xl border border-border/50">
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-xs font-sans leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-primary text-on-primary rounded-br-none"
                          : "bg-surface border border-border text-text rounded-bl-none shadow-sm"
                      }`}
                    >
                      <span className="block text-[10px] font-bold opacity-75 mb-0.5">
                        {msg.sender === "user" ? "Dr. Scholar (You)" : activeCase?.patientProfile.name}
                      </span>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask a focused clinical question (e.g. Does the pain radiate anywhere?)..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                  className="flex-1 px-3.5 py-2 text-xs bg-background border border-border rounded-xl focus:border-gold focus:outline-none"
                />
                <Button size="sm" variant="primary" onClick={handleSendMessage} disabled={!chatInput.trim()}>
                  Ask Patient
                </Button>
              </div>
            </Card>

            {/* Diagnostic Investigations & Differential Diagnoses */}
            <Card pad="md" className="border-border space-y-4">
              <h4 className="text-sm font-bold text-text font-display">
                Order Diagnostic Investigations
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeCase?.availableInvestigations?.map((test: any, idx: number) => {
                  const isOrdered = orderedTests.includes(test.testName);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleTest(test.testName)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isOrdered
                          ? "border-gold bg-gold-soft/40 shadow-sm"
                          : "border-border bg-surface hover:bg-surface-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text">{test.testName}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isOrdered ? "bg-gold text-on-gold" : "bg-surface-muted text-text-muted"
                        }`}>
                          {isOrdered ? "Revealed" : "Order Test"}
                        </span>
                      </div>

                      {isOrdered && (
                        <div className="mt-2 pt-2 border-t border-gold/20 text-xs space-y-1">
                          <p className="font-semibold text-text">{test.resultText}</p>
                          <p className="text-[11px] text-text-muted">Normal: {test.normalRange}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Differential Diagnosis Selection & Evaluation */}
              <div className="pt-3 border-t border-border space-y-3">
                <label className="block text-xs font-bold text-text uppercase tracking-wider font-ui">
                  Establish Primary Clinical Diagnosis:
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <select
                    value={selectedPrimaryDiagnosis}
                    onChange={(e) => setSelectedPrimaryDiagnosis(e.target.value)}
                    className="w-full sm:flex-1 px-3 py-2 text-xs bg-background border border-border rounded-xl focus:border-gold focus:outline-none"
                  >
                    <option value="">-- Select Primary Diagnosis --</option>
                    {activeCase?.differentialDiagnoses?.map((diff: string) => (
                      <option key={diff} value={diff}>
                        {diff}
                      </option>
                    ))}
                  </select>

                  <Button
                    variant="gold"
                    size="md"
                    onClick={handleEvaluateDiagnosis}
                    disabled={!selectedPrimaryDiagnosis}
                  >
                    Evaluate Decision
                  </Button>
                </div>

                {/* Evaluation Result Feedback Banner */}
                {diagnosisResult && (
                  <div
                    className={`p-4 rounded-xl border mt-3 space-y-2 ${
                      diagnosisResult.isCorrect
                        ? "bg-success-soft border-success/30 text-success"
                        : "bg-warning-soft border-warning/30 text-warning"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold flex items-center gap-1.5">
                        {diagnosisResult.isCorrect ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        Diagnostic Outcome: {diagnosisResult.isCorrect ? "Correct Diagnosis" : "Clinical Variance Detected"}
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white">
                        Score: {diagnosisResult.score} / 100
                      </span>
                    </div>

                    <p className="text-xs text-text font-sans leading-relaxed">
                      {diagnosisResult.clinicalFeedback}
                    </p>

                    <div className="pt-2 border-t border-border/40 text-xs text-text-muted">
                      <strong>Guideline Standard of Care:</strong> {diagnosisResult.guidelineStandardCare}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 5: KNOWLEDGE MASTERY DAG TREE */}
      {activeTab === "mastery" && (
        <div className="space-y-6">
          <Card pad="md" className="border-border bg-surface-navy text-on-primary">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono text-gold uppercase tracking-widest">
                  Competency-Based Medical Education (CBME) • Bloom's Taxonomy
                </span>
                <h3 className="text-lg font-bold font-display text-text-on-navy mt-1">
                  Directed Acyclic Knowledge Graph: Cardiovascular Sciences
                </h3>
                <p className="text-xs text-text-on-navy-muted mt-1 max-w-xl">
                  Progression requires demonstrated mastery through clinical simulations, oral defense recordings, and peer discourse endorsements.
                </p>
              </div>

              <Button
                variant="gold"
                size="sm"
                leftIcon={<Share2 size={14} />}
                onClick={() => alert("Verified Hostel Pro ERP Credential exported to LinkedIn Profile!")}
              >
                Share Verifiable Badge
              </Button>
            </div>
          </Card>

          {/* Node Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {masteryNodes.map((node) => {
              const isLocked = !node.unlocked;
              return (
                <Card
                  key={node.conceptId}
                  pad="md"
                  className={`border transition-all space-y-3 ${
                    isLocked
                      ? "border-border/60 bg-surface-muted/30 opacity-70"
                      : "border-border hover:border-gold hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary-soft text-primary">
                      Level {node.level} • {node.level === 1 ? "Recall / Understand" : node.level === 2 ? "Apply / Synthesize" : "Resuscitate / Evaluate"}
                    </span>
                    <Badge tone={node.masteryScore >= 80 ? "success" : node.masteryScore >= 60 ? "warning" : "neutral"} className="text-[10px]">
                      {node.masteryScore}% Mastery
                    </Badge>
                  </div>

                  <h4 className="text-sm font-bold text-text font-display">{node.conceptName}</h4>

                  {/* Progress Bar */}
                  <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        node.masteryScore >= 80 ? "bg-success" : node.masteryScore >= 60 ? "bg-gold" : "bg-warning"
                      }`}
                      style={{ width: `${node.masteryScore}%` }}
                    />
                  </div>

                  {/* Badges Earned */}
                  <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 flex-wrap">
                      {node.badges?.length > 0 ? (
                        node.badges.map((b: string) => (
                          <span
                            key={b}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-gold bg-gold-soft px-2 py-0.5 rounded-full"
                          >
                            <Award size={10} /> {b}
                          </span>
                        ))
                      ) : (
                        <span className="text-text-subtle text-[11px]">Prerequisites pending</span>
                      )}
                    </div>

                    <span className="text-xs font-semibold text-primary">
                      {isLocked ? "Locked" : "Unlocked"}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: PEOPLE & CLASSMATES ROSTER */}
      {activeTab === "people" && (
        <div className="space-y-8 animate-fade-in">
          {/* Header Overview Card */}
          <Card pad="lg" className="border-border bg-gradient-to-r from-surface to-surface-muted">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-primary-soft text-primary">
                    Course Cohort Directory
                  </span>
                  <Badge tone="success" className="text-[10px]">Active Fall 2026 Semester</Badge>
                </div>
                <h3 className="text-xl font-bold font-display text-text">
                  BMED-402: Advanced Hemodynamics & Systems Bioengineering
                </h3>
                <p className="text-xs text-text-muted mt-1 max-w-2xl">
                  Official roster for Section 01 & Section 02. Faculty office hours, graduate teaching assistants, peer study groups, and capstone project squads.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-center px-4 py-2 rounded-xl bg-surface border border-border">
                  <div className="text-xs text-text-muted">Faculty & TAs</div>
                  <div className="text-base font-bold text-text font-display">5 Members</div>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-surface border border-border">
                  <div className="text-xs text-text-muted">Enrolled Students</div>
                  <div className="text-base font-bold text-primary font-display">58 Scholars</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 1: Course Instructors */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-display text-text flex items-center gap-2">
                <GraduationCap size={18} className="text-gold" />
                Faculty Instructors
              </h3>
              <span className="text-xs text-text-muted">2 Faculty Members Assigned</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Instructor 1 */}
              <Card pad="md" className="border-border hover:border-gold/50 transition-all space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center font-display text-base shadow-sm">
                      AT
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-text font-display">Prof. Dr. Aris Thorne, Ph.D.</h4>
                        <Badge tone="gold" className="text-[10px]">Lead Professor</Badge>
                      </div>
                      <p className="text-xs text-text-muted">Department Chair, Systems Bioengineering</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-surface-muted/40 p-2.5 rounded-xl border border-border/50">
                  <div>
                    <span className="text-text-muted block text-[11px]">Academic Email</span>
                    <a href="mailto:aris.thorne@meduni.edu.bd" className="font-mono text-primary hover:underline truncate block">
                      aris.thorne@meduni.edu.bd
                    </a>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px]">Office Room</span>
                    <span className="font-medium text-text">Rm 412, Science Complex</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-border/40">
                    <span className="text-text-muted block text-[11px]">Consultation / Office Hours</span>
                    <span className="font-semibold text-text flex items-center gap-1 mt-0.5">
                      <Clock size={12} className="text-gold" /> Sun & Tue: 2:00 PM – 4:30 PM
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5"
                    onClick={() => {
                      setMessagingStudent({ name: "Prof. Dr. Aris Thorne", role: "Faculty Lead", email: "aris.thorne@meduni.edu.bd" });
                    }}
                  >
                    <MessageSquare size={13} />
                    Message Professor
                  </Button>
                </div>
              </Card>

              {/* Instructor 2 */}
              <Card pad="md" className="border-border hover:border-gold/50 transition-all space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gold text-on-gold font-bold flex items-center justify-center font-display text-base shadow-sm">
                      FR
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-text font-display">Assoc. Prof. Dr. Farzana Rahman</h4>
                        <Badge tone="primary" className="text-[10px]">Co-Instructor</Badge>
                      </div>
                      <p className="text-xs text-text-muted">Biomedical Signal & Image Processing</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-surface-muted/40 p-2.5 rounded-xl border border-border/50">
                  <div>
                    <span className="text-text-muted block text-[11px]">Academic Email</span>
                    <a href="mailto:farzana.r@meduni.edu.bd" className="font-mono text-primary hover:underline truncate block">
                      farzana.r@meduni.edu.bd
                    </a>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px]">Office Room</span>
                    <span className="font-medium text-text">Rm 308, North Academic Block</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-border/40">
                    <span className="text-text-muted block text-[11px]">Consultation / Office Hours</span>
                    <span className="font-semibold text-text flex items-center gap-1 mt-0.5">
                      <Clock size={12} className="text-gold" /> Mon & Wed: 11:00 AM – 1:00 PM
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5"
                    onClick={() => {
                      setMessagingStudent({ name: "Assoc. Prof. Dr. Farzana Rahman", role: "Co-Instructor", email: "farzana.r@meduni.edu.bd" });
                    }}
                  >
                    <MessageSquare size={13} />
                    Message Professor
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Section 2: Teaching Assistants */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-display text-text flex items-center gap-2">
                <UserCheck size={18} className="text-primary" />
                Graduate Teaching Assistants & Mentors
              </h3>
              <span className="text-xs text-text-muted">3 TAs Assigned</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* TA 1 */}
              <Card pad="md" className="border-border space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-primary-soft text-primary font-bold flex items-center justify-center font-display text-xs">
                    TA
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text font-display">Engr. Tanvir Ahmed</h4>
                    <span className="text-[11px] text-text-muted">Lead TA (Sec 01 & 02)</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs bg-surface-muted/30 p-2 rounded-lg border border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-[11px]">Lab Helpdesk:</span>
                    <span className="font-medium text-text">Lab 204 (Hardware Sim)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-[11px]">Office Hours:</span>
                    <span className="font-semibold text-text">Thu 3:00 - 6:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-[11px]">Specialty:</span>
                    <span className="text-[10px] font-mono text-primary font-semibold">Python WASM IDE</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs gap-1.5"
                  onClick={() => {
                    setMessagingStudent({ name: "Engr. Tanvir Ahmed", role: "Lead TA", email: "tanvir.ta@meduni.edu.bd" });
                  }}
                >
                  <Mail size={12} /> Contact TA
                </Button>
              </Card>

              {/* TA 2 */}
              <Card pad="md" className="border-border space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gold-soft text-gold font-bold flex items-center justify-center font-display text-xs">
                    NJ
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text font-display">Nusrat Jahan, M.Eng.</h4>
                    <span className="text-[11px] text-text-muted">Graduate Fellow TA</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs bg-surface-muted/30 p-2 rounded-lg border border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-[11px]">Lab Helpdesk:</span>
                    <span className="font-medium text-text">Lab 102 (Virtual Patient)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-[11px]">Office Hours:</span>
                    <span className="font-semibold text-text">Sun 10:00 AM - 12:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-[11px]">Specialty:</span>
                    <span className="text-[10px] font-mono text-gold font-semibold">Socratic Stream</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs gap-1.5"
                  onClick={() => {
                    setMessagingStudent({ name: "Nusrat Jahan", role: "Graduate TA", email: "nusrat.j@meduni.edu.bd" });
                  }}
                >
                  <Mail size={12} /> Contact TA
                </Button>
              </Card>

              {/* TA 3 */}
              <Card pad="md" className="border-border space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-surface-muted text-text font-bold flex items-center justify-center font-display text-xs">
                    SY
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text font-display">Samin Yasar</h4>
                    <span className="text-[11px] text-text-muted">Peer Tutor (Senior Scholar)</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs bg-surface-muted/30 p-2 rounded-lg border border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-[11px]">Lab Helpdesk:</span>
                    <span className="font-medium text-text">Student Commons Room B</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-[11px]">Office Hours:</span>
                    <span className="font-semibold text-text">Wed 4:00 - 6:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-[11px]">Specialty:</span>
                    <span className="text-[10px] font-mono text-text font-semibold">OBE Problem Sets</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs gap-1.5"
                  onClick={() => {
                    setMessagingStudent({ name: "Samin Yasar", role: "Peer Tutor", email: "samin.y@meduni.edu.bd" });
                  }}
                >
                  <Mail size={12} /> Contact Tutor
                </Button>
              </Card>
            </div>
          </div>

          {/* Section 3: Classmates Directory & Capstone Groups */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold font-display text-text flex items-center gap-2">
                  <Users size={18} className="text-gold" />
                  Classmates & Capstone Squads
                </h3>
                <p className="text-xs text-text-muted">
                  Directory of enrolled scholars across Section 01 and Section 02.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={peopleSearch}
                    onChange={(e) => setPeopleSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:border-gold focus:outline-none w-44 sm:w-56"
                  />
                </div>

                <div className="flex items-center bg-surface border border-border rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setPeopleSectionFilter("ALL")}
                    className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                      peopleSectionFilter === "ALL"
                        ? "bg-primary text-on-primary"
                        : "text-text-muted hover:text-text"
                    }`}
                  >
                    All (58)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeopleSectionFilter("SEC_01")}
                    className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                      peopleSectionFilter === "SEC_01"
                        ? "bg-primary text-on-primary"
                        : "text-text-muted hover:text-text"
                    }`}
                  >
                    Sec 01 (29)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeopleSectionFilter("SEC_02")}
                    className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                      peopleSectionFilter === "SEC_02"
                        ? "bg-primary text-on-primary"
                        : "text-text-muted hover:text-text"
                    }`}
                  >
                    Sec 02 (29)
                  </button>
                </div>
              </div>
            </div>

            {/* Classmates Table / List */}
            <Card pad="none" className="border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-surface-muted/60 text-text-muted uppercase text-[10px] tracking-wider font-semibold">
                      <th className="py-3 px-4">Student Scholar</th>
                      <th className="py-3 px-4">Section</th>
                      <th className="py-3 px-4">Capstone Squad</th>
                      <th className="py-3 px-4">Academic Standing</th>
                      <th className="py-3 px-4">Attendance</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      {
                        id: "STU-2024-0089",
                        name: "Ayesha Siddiqua",
                        section: "SEC_01",
                        sectionLabel: "Sec 01 (Sun/Tue 09:00)",
                        email: "ayesha.s24@meduni.edu.bd",
                        capstoneGroup: "Team BioPulse Alpha (Lead)",
                        cgpa: "3.94",
                        standing: "Dean's High Honors",
                        attendance: "96%",
                        avatar: "AS"
                      },
                      {
                        id: "STU-2024-0104",
                        name: "Rahim Al-Mansoor",
                        section: "SEC_01",
                        sectionLabel: "Sec 01 (Sun/Tue 09:00)",
                        email: "rahim.m24@meduni.edu.bd",
                        capstoneGroup: "Team BioPulse Alpha",
                        cgpa: "3.88",
                        standing: "Good Standing",
                        attendance: "92%",
                        avatar: "RM"
                      },
                      {
                        id: "STU-2024-0142",
                        name: "Tahmina Chowdhury",
                        section: "SEC_02",
                        sectionLabel: "Sec 02 (Mon/Wed 11:30)",
                        email: "tahmina.c24@meduni.edu.bd",
                        capstoneGroup: "Team NeuroNet Labs",
                        cgpa: "3.91",
                        standing: "Dean's High Honors",
                        attendance: "98%",
                        avatar: "TC"
                      },
                      {
                        id: "STU-2024-0155",
                        name: "Zubair Hossain",
                        section: "SEC_02",
                        sectionLabel: "Sec 02 (Mon/Wed 11:30)",
                        email: "zubair.h24@meduni.edu.bd",
                        capstoneGroup: "Team NeuroNet Labs",
                        cgpa: "3.72",
                        standing: "Good Standing",
                        attendance: "88%",
                        avatar: "ZH"
                      },
                      {
                        id: "STU-2024-0188",
                        name: "Nafisa Kamal",
                        section: "SEC_01",
                        sectionLabel: "Sec 01 (Sun/Tue 09:00)",
                        email: "nafisa.k24@meduni.edu.bd",
                        capstoneGroup: "Team Hemodyne X",
                        cgpa: "3.85",
                        standing: "Good Standing",
                        attendance: "94%",
                        avatar: "NK"
                      },
                      {
                        id: "STU-2024-0210",
                        name: "Shariar Kabir",
                        section: "SEC_02",
                        sectionLabel: "Sec 02 (Mon/Wed 11:30)",
                        email: "shariar.k24@meduni.edu.bd",
                        capstoneGroup: "Team Hemodyne X",
                        cgpa: "3.68",
                        standing: "Good Standing",
                        attendance: "86%",
                        avatar: "SK"
                      },
                      {
                        id: "STU-2024-0231",
                        name: "Fariha Tasnim",
                        section: "SEC_01",
                        sectionLabel: "Sec 01 (Sun/Tue 09:00)",
                        email: "fariha.t24@meduni.edu.bd",
                        capstoneGroup: "Team CardioSim Pro",
                        cgpa: "3.97",
                        standing: "Dean's High Honors",
                        attendance: "100%",
                        avatar: "FT"
                      },
                      {
                        id: "STU-2024-0264",
                        name: "Mehedi Hasan",
                        section: "SEC_02",
                        sectionLabel: "Sec 02 (Mon/Wed 11:30)",
                        email: "mehedi.h24@meduni.edu.bd",
                        capstoneGroup: "Team CardioSim Pro",
                        cgpa: "3.79",
                        standing: "Good Standing",
                        attendance: "90%",
                        avatar: "MH"
                      }
                    ]
                      .filter((s) => {
                        const matchesSection = peopleSectionFilter === "ALL" || s.section === peopleSectionFilter;
                        const matchesSearch =
                          s.name.toLowerCase().includes(peopleSearch.toLowerCase()) ||
                          s.id.toLowerCase().includes(peopleSearch.toLowerCase()) ||
                          s.capstoneGroup.toLowerCase().includes(peopleSearch.toLowerCase());
                        return matchesSection && matchesSearch;
                      })
                      .map((stu) => (
                        <tr key={stu.id} className="hover:bg-surface-muted/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary-soft text-primary font-bold flex items-center justify-center font-display text-xs">
                                {stu.avatar}
                              </div>
                              <div>
                                <span className="font-semibold text-text block">{stu.name}</span>
                                <span className="text-[10px] font-mono text-text-muted">{stu.id} • {stu.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[11px] font-medium text-text">{stu.sectionLabel}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                              <Layers size={11} /> {stu.capstoneGroup}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              tone={stu.standing.includes("Honors") ? "gold" : "primary"}
                              className="text-[10px]"
                            >
                              {stu.standing} (CGPA {stu.cgpa})
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono font-semibold text-text">{stu.attendance}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-[11px] h-7 px-2 gap-1"
                                onClick={() => {
                                  setMessagingStudent({ name: stu.name, role: `Student (${stu.id})`, email: stu.email });
                                }}
                              >
                                <MessageCircle size={12} /> Message
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Direct Message Modal */}
          {messagingStudent && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <Card pad="lg" className="w-full max-w-lg bg-surface border-border shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h3 className="text-base font-bold font-display text-text flex items-center gap-2">
                      <Send size={16} className="text-gold" />
                      Academic Communication Portal
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      To: <span className="font-semibold text-text">{messagingStudent.name}</span> ({messagingStudent.role})
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setMessagingStudent(null);
                      setDirectMsgText("");
                    }}
                    className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface-muted"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-text block mb-1">Message Subject / Topic</label>
                    <select className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-gold">
                      <option>Lab Assignment & WASM Simulator Inquiry</option>
                      <option>Capstone Project Group Collaboration</option>
                      <option>Office Hours Consultation Appointment</option>
                      <option>Peer Study Group Invitation</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text block mb-1">Direct Message</label>
                    <textarea
                      rows={4}
                      value={directMsgText}
                      onChange={(e) => setDirectMsgText(e.target.value)}
                      placeholder={`Compose your academic message to ${messagingStudent.name}...`}
                      className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-gold resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-text-muted pt-1">
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={12} className="text-primary" /> Verified Institutional Delivery
                    </span>
                    <span>Delivered to {messagingStudent.email}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMessagingStudent(null);
                      setDirectMsgText("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => {
                      setMessageSentToast(true);
                      setMessagingStudent(null);
                      setDirectMsgText("");
                      setTimeout(() => setMessageSentToast(false), 3500);
                    }}
                  >
                    <Send size={13} /> Send Message
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Toast Notification */}
          {messageSentToast && (
            <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium border border-primary/40 animate-fade-in">
              <CheckCircle2 size={16} className="text-gold" />
              Direct message securely dispatched via institutional relay.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
