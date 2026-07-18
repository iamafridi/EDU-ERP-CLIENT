'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Modal,
  FormField,
  Input,
  Select,
} from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  BookOpen,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  Building2,
  DollarSign,
  ArrowRightLeft,
  Trash2,
  FileText,
  ShieldAlert,
  Search,
  Check,
  UserCheck,
  GraduationCap,
  Sparkles,
  Printer,
  Bell,
  Sliders,
  Split,
  QrCode,
  Download,
  AlertCircle,
  TrendingUp,
  Activity,
  ListOrdered,
  Lock,
  Eye,
  BarChart3,
  History,
  ShieldCheck,
  Scale,
  Wallet,
  RefreshCw,
  Timer,
  Cpu,
  TriangleAlert,
} from 'lucide-react';

interface Section {
  id: string;
  sectionName: string;
  instructor: string;
  room: string;
  schedule: string;
  examRoutine: string;
  totalSeats: number;
  enrolledCount: number;
  availableSeats: number;
  status: 'AVAILABLE' | 'FULL';
  waitlistCount?: number;
}

interface Course {
  id: string;
  code: string;
  title: string;
  department: string;
  credits: number;
  tuitionPerCredit: number;
  hasLab: boolean;
  labFee: number;
  sections: Section[];
}

export default function AdvisingPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Operational Modes
  const [activeMode, setActiveMode] = useState<
    'STUDENT_ADVISING' | 'WAITLIST_ENGINE' | 'PREREQUISITES_SIMULATOR' | 'FACULTY_MANAGEMENT' | 'WINDOWS_FINES' | 'NOTIFICATIONS' | 'AUDIT_TRAIL' | 'REFUND_ENGINE' | 'SEAT_LOCKS' | 'OVERRIDE_APPROVALS' | 'RECONCILIATION' | 'DUAL_MAJOR_MATRIX'
  >('STUDENT_ADVISING');

  // Active Advising Cohort and Filters
  const [selectedSemester, setSelectedSemester] = useState('Fall 2026');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Section for Cart: { [courseId]: Section }
  const [selectedSections, setSelectedSections] = useState<Record<string, Section>>({});
  
  // Dynamic Penalties & Surcharges (Configurable & Dynamic)
  const [lateAdvisingActive, setLateAdvisingActive] = useState(true);
  const [lateAdvisingFineRate, setLateAdvisingFineRate] = useState<number>(1000);
  const [lateTuitionActive, setLateTuitionActive] = useState(false);
  const [lateTuitionFineRate, setLateTuitionFineRate] = useState<number>(10000);

  // Time-Window Dates (Configurable by Registrar/Dean)
  const [advisingStartDate, setAdvisingStartDate] = useState('2026-09-01');
  const [advisingEndDate, setAdvisingEndDate] = useState('2026-09-15');
  const [dropDeadline, setDropDeadline] = useState('2026-09-22');
  const [lateDropDeadline, setLateDropDeadline] = useState('2026-09-30');
  const [withdrawDeadline, setWithdrawDeadline] = useState('2026-10-31');

  // Retake Simulator target grade
  const [retakeTargetCourse, setRetakeTargetCourse] = useState('CHEM-100');
  const [simulatedGrade, setSimulatedGrade] = useState<'A' | 'A-' | 'B+' | 'B'>('A');

  // Modals
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);
  const [isInstructorReassignModalOpen, setIsInstructorReassignModalOpen] = useState(false);
  const [isSplitSectionModalOpen, setIsSplitSectionModalOpen] = useState(false);

  // Selected targets for modals
  const [swapTargetCourse, setSwapTargetCourse] = useState<Course | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState('');
  const [newSectionId, setNewSectionId] = useState('');
  const [reassignCourse, setReassignCourse] = useState<Course | null>(null);
  const [reassignSection, setReassignSection] = useState<Section | null>(null);
  const [newInstructorName, setNewInstructorName] = useState('');
  const [splitCourse, setSplitCourse] = useState<Course | null>(null);
  const [splitSectionTarget, setSplitSectionTarget] = useState<Section | null>(null);
  const [newSplitSectionName, setNewSplitSectionName] = useState('Section C');
  const [newSplitSeats, setNewSplitSeats] = useState('25');

  // Refund Engine State
  const [refundTargetCourseId, setRefundTargetCourseId] = useState('CRS-MED-103');
  const [isRefundPreviewOpen, setIsRefundPreviewOpen] = useState(false);

  // Override Approval State
  const [isOverrideDetailOpen, setIsOverrideDetailOpen] = useState(false);
  const [selectedOverride, setSelectedOverride] = useState<any>(null);
  const [overrideNotes, setOverrideNotes] = useState('');

  // Audit Trail Filter
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');

  // Feedback Toasts
  const [successToast, setSuccessToast] = useState('');
  const [errorToast, setErrorToast] = useState('');

  // 10-Minute Reservation Hold Timer State
  const [holdSecondsRemaining, setHoldSecondsRemaining] = useState(599);

  // Fetch Available Advising Courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ['advisingCourses', selectedSemester],
    queryFn: async () => {
      const res = await api.getAdvisingCourses();
      return (Array.isArray(res) ? res : (res as any)?.data) || [];
    },
  });

  // Fetch Current Student Advising Record
  const studentId = user?.id || 'STU-2026001';
  const { data: advisingRecord, isLoading: isLoadingRecord } = useQuery({
    queryKey: ['studentAdvisingRecord', studentId],
    queryFn: async () => {
      const res = await api.getStudentAdvisingRecord(studentId);
      return res?.data || res;
    },
  });

  // Fetch Prerequisites Audit
  const { data: prereqData } = useQuery({
    queryKey: ['prerequisitesAudit', studentId],
    queryFn: async () => {
      const res = await api.getPrerequisitesAudit(studentId);
      return res?.data || res;
    },
  });

  // Fetch Virtual Queue Status
  const { data: queueStatus } = useQuery({
    queryKey: ['virtualQueueStatus'],
    queryFn: async () => {
      const res = await api.getVirtualQueueStatus();
      return res?.data || res;
    },
  });

  // Fetch Advising Notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['advisingNotifications', studentId],
    queryFn: async () => {
      const res = await api.getAdvisingNotifications(studentId);
      return (Array.isArray(res) ? res : (res as any)?.data) || [];
    },
  });

  // Fetch Audit Trail
  const { data: auditTrail = [] } = useQuery({
    queryKey: ['advisingAuditTrail', studentId],
    queryFn: async () => {
      const res = await api.getAdvisingAuditTrail(studentId);
      return (Array.isArray(res) ? res : (res as any)?.data) || [];
    },
  });

  // Fetch Tiered Refund Preview
  const { data: refundPreview } = useQuery({
    queryKey: ['tieredRefund', studentId, refundTargetCourseId],
    queryFn: async () => {
      const res = await api.calculateTieredRefund({ studentId, courseId: refundTargetCourseId });
      return res?.data || res;
    },
    enabled: !!refundTargetCourseId,
  });

  // Fetch Section Lock Heartbeat
  const { data: sectionLocks = [] } = useQuery({
    queryKey: ['sectionLockStatus'],
    queryFn: async () => {
      const res = await api.getSectionLockStatus();
      return (Array.isArray(res) ? res : (res as any)?.data) || [];
    },
    refetchInterval: 15000,
  });

  // Fetch Override Requests
  const { data: overrideRequests = [] } = useQuery({
    queryKey: ['overrideRequests'],
    queryFn: async () => {
      const res = await api.getPendingOverrideRequests();
      return (Array.isArray(res) ? res : (res as any)?.data) || [];
    },
  });

  // Fetch Financial Reconciliation
  const { data: reconciliation } = useQuery({
    queryKey: ['advisingReconciliation', selectedSemester],
    queryFn: async () => {
      const res = await api.getAdvisingFinancialReconciliation(selectedSemester);
      return res?.data || res;
    },
  });

  // Fetch Analytics
  const { data: analytics } = useQuery({
    queryKey: ['advisingAnalytics', selectedSemester],
    queryFn: async () => {
      const res = await api.getAdvisingAnalytics(selectedSemester);
      return res?.data || res;
    },
  });

  // Override Mutations
  const approveOverrideMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      api.approveOverrideRequest(id, { approvedBy: user?.id || 'DEAN-001', notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overrideRequests'] });
      setIsOverrideDetailOpen(false);
      setSuccessToast('Override approved. Student can now register for the course.');
      setTimeout(() => setSuccessToast(''), 4000);
    },
  });

  const rejectOverrideMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.rejectOverrideRequest(id, { rejectedBy: user?.id || 'DEAN-001', reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overrideRequests'] });
      setIsOverrideDetailOpen(false);
      setSuccessToast('Override request rejected. Student has been notified.');
      setTimeout(() => setSuccessToast(''), 4000);
    },
  });

  // Departments List
  const departments = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => set.add(c.department));
    return ['ALL', ...Array.from(set)];
  }, [courses]);

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesDept = selectedDepartment === 'ALL' || c.department === selectedDepartment;
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.department.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [courses, selectedDepartment, searchQuery]);

  // Advised course IDs already in record
  const advisedCourseIds = useMemo(() => {
    return new Set(advisingRecord?.advisedCourses?.map((c: any) => c.courseId) || []);
  }, [advisingRecord]);

  // All selected courses in current cart
  const cartCourses = useMemo(() => {
    return Object.keys(selectedSections)
      .map((courseId) => courses.find((c) => c.id === courseId))
      .filter(Boolean) as Course[];
  }, [selectedSections, courses]);

  // Conflict Checking Engine
  const scheduleConflicts = useMemo(() => {
    const list: { courseA: string; courseB: string; type: 'LECTURE' | 'EXAM'; details: string }[] = [];
    const chosen = Object.entries(selectedSections).map(([courseId, sec]) => {
      const c = courses.find((x) => x.id === courseId);
      return { code: c?.code || courseId, section: sec };
    });

    for (let i = 0; i < chosen.length; i++) {
      for (let j = i + 1; j < chosen.length; j++) {
        const a = chosen[i];
        const b = chosen[j];
        if (a.section.schedule === b.section.schedule) {
          list.push({
            courseA: a.code,
            courseB: b.code,
            type: 'LECTURE',
            details: `Identical lecture time: ${a.section.schedule}`,
          });
        }
        if (a.section.examRoutine === b.section.examRoutine) {
          list.push({
            courseA: a.code,
            courseB: b.code,
            type: 'EXAM',
            details: `Final examination collision: ${a.section.examRoutine}`,
          });
        }
      }
    }
    return list;
  }, [selectedSections, courses]);

  // Real-time Orbound Financial Computation
  const financialComputation = useMemo(() => {
    const totalCredits = cartCourses.reduce((sum, c) => sum + c.credits, 0);
    const grossTuition = cartCourses.reduce((sum, c) => sum + c.credits * c.tuitionPerCredit, 0);
    const waiverPct = advisingRecord?.scholarshipWaiverPct || 20;
    const scholarshipDeduction = Math.round(grossTuition * (waiverPct / 100));
    const netTuition = grossTuition - scholarshipDeduction;

    const advisingFee = 2500;
    const labFee = cartCourses.reduce((sum, c) => sum + (c.hasLab ? c.labFee : 0), 0);
    const developmentFee = 2000;
    const medicalCoverageFee = 1000;

    const lateAdvisingFine = lateAdvisingActive ? lateAdvisingFineRate : 0;
    const lateTuitionFine = lateTuitionActive ? lateTuitionFineRate : 0;

    const institutionalTotal = advisingFee + labFee + developmentFee + medicalCoverageFee;
    const grandTotal = netTuition + institutionalTotal + lateAdvisingFine + lateTuitionFine;

    return {
      totalCredits,
      grossTuition,
      waiverPct,
      scholarshipDeduction,
      netTuition,
      advisingFee,
      labFee,
      developmentFee,
      medicalCoverageFee,
      lateAdvisingFine,
      lateTuitionFine,
      institutionalTotal,
      grandTotal,
    };
  }, [cartCourses, advisingRecord, lateAdvisingActive, lateAdvisingFineRate, lateTuitionActive, lateTuitionFineRate]);

  // Section Selector Toggle
  const handleSelectSection = (course: Course, section: Section) => {
    if (section.availableSeats <= 0) {
      setErrorToast(`Section ${section.sectionName} is completely full. Use the Auto-Waitlist Engine to hold a position.`);
      setTimeout(() => setErrorToast(''), 4000);
      return;
    }
    setSelectedSections((prev) => {
      const copy = { ...prev };
      if (copy[course.id]?.id === section.id) {
        delete copy[course.id];
      } else {
        copy[course.id] = section;
      }
      return copy;
    });
  };

  // Step 1: Submit Provisional Advising Lock
  const provisionalMutation = useMutation({
    mutationFn: () =>
      api.submitProvisionalAdvising({
        studentId,
        semester: selectedSemester,
        courses: Object.entries(selectedSections).map(([courseId, sec]) => ({
          courseId,
          sectionId: sec.id,
        })),
        totalCredits: financialComputation.totalCredits,
        computedBill: financialComputation.grandTotal,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentAdvisingRecord'] });
      setSuccessToast('Step 1 Complete: Course seats provisionally locked. Proceed to Step 2 Settlement.');
      setIsSettlementModalOpen(true);
      setTimeout(() => setSuccessToast(''), 5000);
    },
    onError: () => {
      setErrorToast('Failed to lock provisional advising. Check schedule conflicts.');
      setTimeout(() => setErrorToast(''), 4000);
    },
  });

  // Step 2: Final Settlement & Double-Entry Ledger Posting
  const settleMutation = useMutation({
    mutationFn: (paymentMethod: string) =>
      api.settleAdvisingPayment({
        studentId,
        semester: selectedSemester,
        amount: financialComputation.grandTotal,
        paymentMethod,
        timestamp: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentAdvisingRecord'] });
      setIsSettlementModalOpen(false);
      setSuccessToast('Step 2 Complete: Tuition cleared & GAAP General Ledger Journal posted!');
      setTimeout(() => setSuccessToast(''), 5000);
    },
  });

  // Course Drop (100% Refund within period)
  const dropMutation = useMutation({
    mutationFn: (courseId: string) =>
      api.dropAdvisedCourse({
        studentId,
        courseId,
        reason: 'Student elective drop within window',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentAdvisingRecord'] });
      setSuccessToast('Course dropped successfully. 100% tuition credited to student ledger.');
      setTimeout(() => setSuccessToast(''), 4000);
    },
  });

  // Course Withdrawal ('W' Grade)
  const withdrawMutation = useMutation({
    mutationFn: (courseId: string) =>
      api.withdrawAdvisedCourse({
        studentId,
        courseId,
        reason: 'Term withdrawal with W grade',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentAdvisingRecord'] });
      setSuccessToast("Course withdrawn. Grade 'W' appended to official transcript.");
      setTimeout(() => setSuccessToast(''), 4000);
    },
  });

  // Section Swap Action
  const swapMutation = useMutation({
    mutationFn: () =>
      api.swapCourseSection({
        studentId,
        courseId: swapTargetCourse?.id,
        fromSectionId: currentSectionId,
        toSectionId: newSectionId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentAdvisingRecord'] });
      setIsSwapModalOpen(false);
      setSuccessToast('Section swapped successfully without dropping the course slot.');
      setTimeout(() => setSuccessToast(''), 4000);
    },
  });

  // Auto-Waitlist Join Mutation
  const waitlistMutation = useMutation({
    mutationFn: ({ courseId, sectionId }: { courseId: string; sectionId: string }) =>
      api.joinSectionWaitlist({
        studentId,
        courseId,
        sectionId,
      }),
    onSuccess: () => {
      setSuccessToast('Added to Waitlist! You will receive an SMS and a 60-minute claim lease when a seat drops.');
      setTimeout(() => setSuccessToast(''), 5000);
    },
  });

  // Dean Actions: Reassign Section Instructor
  const reassignMutation = useMutation({
    mutationFn: () =>
      api.reassignSectionInstructor({
        courseId: reassignCourse?.id,
        sectionId: reassignSection?.id,
        newInstructor: newInstructorName,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advisingCourses'] });
      setIsInstructorReassignModalOpen(false);
      setSuccessToast(`Instructor for ${reassignSection?.sectionName} reassigned to ${newInstructorName}.`);
      setTimeout(() => setSuccessToast(''), 4000);
    },
  });

  // Dean Actions: Split Section
  const splitMutation = useMutation({
    mutationFn: () =>
      api.splitSection({
        courseId: splitCourse?.id,
        fromSectionId: splitSectionTarget?.id,
        newSectionName: newSplitSectionName,
        allocatedSeats: Number(newSplitSeats) || 25,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advisingCourses'] });
      setIsSplitSectionModalOpen(false);
      setSuccessToast(`Section split successfully! Created ${newSplitSectionName} with ${newSplitSeats} seats.`);
      setTimeout(() => setSuccessToast(''), 4000);
    },
  });

  const openSwapModal = (advisedCourse: any) => {
    const c = courses.find((x) => x.id === advisedCourse.courseId);
    if (c) {
      setSwapTargetCourse(c);
      setCurrentSectionId(advisedCourse.sectionId);
      setNewSectionId('');
      setIsSwapModalOpen(true);
    }
  };

  const openReassignModal = (c: Course, sec: Section) => {
    setReassignCourse(c);
    setReassignSection(sec);
    setNewInstructorName(sec.instructor);
    setIsInstructorReassignModalOpen(true);
  };

  const openSplitModal = (c: Course, sec: Section) => {
    setSplitCourse(c);
    setSplitSectionTarget(sec);
    setNewSplitSectionName(`${sec.sectionName} - Sub 2`);
    setNewSplitSeats('20');
    setIsSplitSectionModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Page Header */}
      <PageHeader
        title="High-Concurrence Advising Desk"
        subtitle="Dynamic credit-hour advising, real-time quota holds, conflict resolution & 2-step financial ledger settlement."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChallanModalOpen(true)}
              className="flex items-center gap-1.5 text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Demand Challan</span>
            </Button>
          </div>
        }
      />

      {/* Operational Mode Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
        {[
          { id: 'STUDENT_ADVISING', label: 'Course Advising Matrix', icon: BookOpen },
          { id: 'WAITLIST_ENGINE', label: 'Auto-Waitlist & Cascades', icon: ListOrdered },
          { id: 'PREREQUISITES_SIMULATOR', label: 'Prerequisites & CGPA Retake', icon: TrendingUp },
          { id: 'FACULTY_MANAGEMENT', label: 'Dean Section Control', icon: Users },
          { id: 'WINDOWS_FINES', label: 'Time Windows & Fines', icon: Sliders },
          { id: 'NOTIFICATIONS', label: 'Push & SMS Stream', icon: Bell },
          { id: 'AUDIT_TRAIL', label: 'Immutable Audit Trail', icon: History },
          { id: 'REFUND_ENGINE', label: 'Tiered Refund Engine', icon: Scale },
          { id: 'SEAT_LOCKS', label: 'Live Seat Lock Monitor', icon: Cpu },
          { id: 'OVERRIDE_APPROVALS', label: 'Override Approvals', icon: ShieldCheck },
          { id: 'RECONCILIATION', label: 'Financial Reconciliation', icon: BarChart3 },
          { id: 'DUAL_MAJOR_MATRIX', label: 'Dual-Major & Catalog Equivalence', icon: Split },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveMode(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'bg-surface hover:bg-surface/80 text-text-muted hover:text-text border border-border/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Toast Feedback */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center justify-between text-sm shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast('')} className="text-emerald-400/60 hover:text-emerald-400">
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}
        {errorToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-center justify-between text-sm shadow-lg"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorToast}</span>
            </div>
            <button onClick={() => setErrorToast('')} className="text-red-400/60 hover:text-red-400">
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner: Student Status & Quota Hold Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card pad="md" className="border-primary/30 bg-primary/5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-primary">Student Persona</span>
              <h2 className="text-lg font-bold text-text mt-0.5">{advisingRecord?.studentName || 'Marcus Chen'}</h2>
              <p className="text-xs text-text-muted font-mono">{advisingRecord?.rollNumber || 'STU-2026001'} • CGPA {advisingRecord?.cgpa || '3.88'}</p>
            </div>
            <Badge tone="primary" className="text-xs">MBBS Dept</Badge>
          </div>
          <div className="pt-3 border-t border-border/40 mt-3 flex items-center justify-between text-xs text-text-muted">
            <span>Scholarship Waiver:</span>
            <span className="font-bold text-emerald-500">{advisingRecord?.scholarshipWaiverPct || 20}% Merit</span>
          </div>
        </Card>

        <Card pad="md" className="flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-text-muted">Credit Load Limits</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black font-mono text-text">
                {financialComputation.totalCredits} / {advisingRecord?.maxCreditLimit || 18}
              </span>
              <span className="text-xs text-text-muted">Credits Advised</span>
            </div>
          </div>
          <div className="w-full bg-border/50 h-2 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full transition-all ${
                financialComputation.totalCredits > 18 ? 'bg-red-500' : 'bg-primary'
              }`}
              style={{
                width: `${Math.min(100, (financialComputation.totalCredits / (advisingRecord?.maxCreditLimit || 18)) * 100)}%`,
              }}
            />
          </div>
        </Card>

        <Card pad="md" className="flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-text-muted">Seat Hold Lease</span>
            <div className="flex items-center gap-2 mt-1 text-amber-500">
              <Clock className="w-5 h-5 animate-spin" />
              <span className="text-2xl font-black font-mono">
                0{Math.floor(holdSecondsRemaining / 60)}:{String(holdSecondsRemaining % 60).padStart(2, '0')}
              </span>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-2">
            Temporary cache lease. Complete Step 1 before timeout to preserve selected slots.
          </p>
        </Card>

        <Card pad="md" className="flex flex-col justify-between border-emerald-500/20 bg-emerald-500/5">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">Advising Status</span>
            <div className="mt-1">
              <Badge tone={advisingRecord?.status === 'OFFICIALLY_ENROLLED' ? 'success' : 'warning'} className="text-xs">
                {advisingRecord?.status || 'PROVISIONALLY_ADVISED'}
              </Badge>
            </div>
          </div>
          <div className="pt-2 text-xs text-text-muted flex items-center justify-between">
            <span>Concurrent Traffic:</span>
            <span className="font-mono font-bold text-emerald-400">
              {queueStatus?.activeConcurrentAdvisors || 1420} Live Users
            </span>
          </div>
        </Card>
      </div>

      {/* Conflict Warning Strip */}
      {scheduleConflicts.length > 0 && (
        <div className="p-4 bg-red-500/10 border-2 border-red-500/40 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <ShieldAlert className="w-5 h-5" />
            <span>CRITICAL SCHEDULE CONFLICTS DETECTED ({scheduleConflicts.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {scheduleConflicts.map((conf, idx) => (
              <div key={idx} className="p-2 bg-background/60 rounded border border-red-500/20 text-red-300">
                <span className="font-bold uppercase tracking-wider text-[10px] bg-red-500/20 px-1 py-0.5 rounded mr-1.5">
                  {conf.type} COLLISION
                </span>
                <span className="font-bold">{conf.courseA}</span> & <span className="font-bold">{conf.courseB}</span>: {conf.details}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE 1: STUDENT ADVISING & ORBOUND MATRIX */}
      {activeMode === 'STUDENT_ADVISING' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column: Course Selection & Section Directory (7 Cols) */}
          <div className="xl:col-span-7 space-y-6">
            <Card pad="md" className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search code, title, instructor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-border rounded-lg text-text focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-text-muted">Dept:</span>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="text-xs py-2 px-3 bg-surface border border-border rounded-lg text-text focus:outline-none focus:border-primary"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Courses & Sections List */}
            <div className="space-y-4">
              {filteredCourses.map((course) => {
                const isSelected = !!selectedSections[course.id];
                const isAlreadyAdvised = advisedCourseIds.has(course.id);
                const selectedSec = selectedSections[course.id];

                return (
                  <Card
                    key={course.id}
                    pad="md"
                    className={`transition-all ${
                      isSelected ? 'border-primary ring-1 ring-primary/40 bg-primary/5' : 'hover:border-border/80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-primary">{course.code}</span>
                          <h3 className="font-bold text-base text-text">{course.title}</h3>
                          {course.hasLab && (
                            <Badge tone="warning" className="text-[10px] py-0 px-1.5">
                              Lab +৳{course.labFee.toLocaleString()}
                            </Badge>
                          )}
                          {isAlreadyAdvised && (
                            <Badge tone="success" className="text-[10px] py-0 px-1.5">
                              Advised In Record
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">
                          {course.department} • <span className="font-semibold text-text">{course.credits} Credits</span> • ৳{course.tuitionPerCredit.toLocaleString()} / Credit
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-text bg-surface px-2.5 py-1 rounded border border-border">
                        ৳{(course.credits * course.tuitionPerCredit).toLocaleString()}
                      </span>
                    </div>

                    {/* Sections Selector */}
                    <div className="pt-3 space-y-2">
                      <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                        Available Sections & Schedules:
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {course.sections.map((sec) => {
                          const isThisSecChosen = selectedSec?.id === sec.id;
                          const isFull = sec.availableSeats <= 0;

                          return (
                            <div
                              key={sec.id}
                              className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between text-xs space-y-2 ${
                                isThisSecChosen
                                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                  : isFull
                                  ? 'bg-surface/60 border-border/60'
                                  : 'bg-surface hover:border-primary/50 border-border'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="font-bold text-text">{sec.sectionName}</span>
                                <Badge tone={isFull ? 'danger' : sec.availableSeats < 5 ? 'warning' : 'success'}>
                                  {sec.availableSeats > 0 ? `${sec.availableSeats} Seats Left` : 'FULL (45/45)'}
                                </Badge>
                              </div>
                              <div className="space-y-1 text-text-muted">
                                <div className="flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">{sec.instructor}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 shrink-0" />
                                  <span>{sec.schedule}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-amber-500">
                                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                                  <span>Exam: {sec.examRoutine}</span>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-border/30 flex items-center justify-between">
                                {!isFull ? (
                                  <Button
                                    variant={isThisSecChosen ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => handleSelectSection(course, sec)}
                                    className="w-full text-xs py-1 h-auto"
                                  >
                                    {isThisSecChosen ? 'Deselect Section' : 'Select Section'}
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => waitlistMutation.mutate({ courseId: course.id, sectionId: sec.id })}
                                    loading={waitlistMutation.isPending}
                                    className="w-full text-xs py-1 h-auto text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
                                  >
                                    <ListOrdered className="w-3 h-3 mr-1" /> Join Waitlist (#3 in line)
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Right Column: Orbound Financial Ledger & 2-Step Settlement (5 Cols) */}
          <div className="xl:col-span-5 space-y-6">
            {/* Active Advised Courses in Student Record */}
            <Card pad="md" className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-base text-text">Officially Advised Courses</h3>
                </div>
                <Badge tone="primary">
                  {advisingRecord?.advisedCourses?.length || 0} Registered
                </Badge>
              </div>

              <div className="space-y-3">
                {advisingRecord?.advisedCourses?.map((recCourse: any) => (
                  <div
                    key={recCourse.courseId}
                    className="p-3 bg-surface border border-border rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-primary">{recCourse.code}</span>
                          <span className="font-semibold text-text">{recCourse.title}</span>
                        </div>
                        <p className="text-text-muted mt-0.5">
                          {recCourse.sectionName} • {recCourse.instructor}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-text">৳{recCourse.tuition.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-text-muted">
                      <Clock className="w-3 h-3" />
                      <span>{recCourse.schedule}</span>
                    </div>

                    <div className="pt-2 border-t border-border/30 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => openSwapModal(recCourse)}
                        className="text-primary hover:underline flex items-center gap-1 text-xs"
                      >
                        <ArrowRightLeft className="w-3 h-3" /> Swap Section
                      </button>

                      <div className="flex items-center gap-2">
                        {recCourse.isDropAllowed && (
                          <button
                            type="button"
                            onClick={() => dropMutation.mutate(recCourse.courseId)}
                            disabled={dropMutation.isPending}
                            className="text-red-400 hover:text-red-300 flex items-center gap-1 text-xs"
                          >
                            <Trash2 className="w-3 h-3" /> Drop (100% Refund)
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => withdrawMutation.mutate(recCourse.courseId)}
                          disabled={withdrawMutation.isPending}
                          className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-xs"
                        >
                          <XCircle className="w-3 h-3" /> Withdraw (W)
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Dynamic Financial Orbound Bill Calculator */}
            <Card pad="md" className="space-y-4 border-primary/30">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-base text-text">Orbound Fee Calculator</h3>
                </div>
                <Badge tone="default">BDT (৳) Currency</Badge>
              </div>

              {/* Bill Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-text-muted">
                  <span>Gross Tuition ({financialComputation.totalCredits} credits):</span>
                  <span className="font-mono">৳{financialComputation.grossTuition.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-400">
                  <span>Merit Scholarship Deduction ({financialComputation.waiverPct}%):</span>
                  <span className="font-mono">-৳{financialComputation.scholarshipDeduction.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-text">
                  <span>Net Tuition Payable:</span>
                  <span className="font-mono">৳{financialComputation.netTuition.toLocaleString()}</span>
                </div>

                <div className="pt-2 border-t border-border/40 space-y-1 text-text-muted">
                  <div className="flex items-center justify-between">
                    <span>Advising & Registration Fee:</span>
                    <span className="font-mono">৳{financialComputation.advisingFee.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Laboratory & Consumables Fee:</span>
                    <span className="font-mono">৳{financialComputation.labFee.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Development & Infrastructure Levy:</span>
                    <span className="font-mono">৳{financialComputation.developmentFee.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Student Healthcare & Insurance:</span>
                    <span className="font-mono">৳{financialComputation.medicalCoverageFee.toLocaleString()}</span>
                  </div>

                  {financialComputation.lateAdvisingFine > 0 && (
                    <div className="flex items-center justify-between text-amber-500 font-medium">
                      <span>Late Advising Fine Surcharge:</span>
                      <span className="font-mono">+৳{financialComputation.lateAdvisingFine.toLocaleString()}</span>
                    </div>
                  )}
                  {financialComputation.lateTuitionFine > 0 && (
                    <div className="flex items-center justify-between text-red-400 font-medium">
                      <span>Late Payment Penalty:</span>
                      <span className="font-mono">+৳{financialComputation.lateTuitionFine.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t-2 border-border flex items-center justify-between text-sm font-bold text-text">
                  <span>Total Billed Amount:</span>
                  <span className="text-xl font-mono text-emerald-400">
                    ৳{financialComputation.grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons: 2-Step Settlement */}
              <div className="space-y-2 pt-2">
                <Button
                  variant="primary"
                  onClick={() => provisionalMutation.mutate()}
                  loading={provisionalMutation.isPending}
                  disabled={cartCourses.length === 0 || scheduleConflicts.length > 0}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Step 1: Lock Provisional Advising ({cartCourses.length} Courses)</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setIsSettlementModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 text-xs"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Step 2: Settle Tuition & Post to GAAP General Ledger</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* MODE 2: AUTO-WAITLIST & FIFO SEAT CASCADE ENGINE */}
      {activeMode === 'WAITLIST_ENGINE' && (
        <Card pad="md" className="space-y-6">
          <div className="border-b border-border/40 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-text">Dynamic Waitlist & Automated FIFO Cascades</h3>
              <p className="text-xs text-text-muted mt-0.5">
                When sections reach capacity (45/45), students enter a real-time FIFO queue. If an enrolled student drops, the engine dispatches a 60-minute claim lease.
              </p>
            </div>
            <Badge tone="warning">Automated Cascade</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-surface border border-border rounded-xl space-y-2">
              <span className="text-xs uppercase font-bold text-text-muted">Waitlisted Students in Queue</span>
              <div className="text-2xl font-black font-mono text-amber-400">42 Students</div>
              <p className="text-[11px] text-text-muted">Queued across 6 oversubscribed sections</p>
            </div>
            <div className="p-4 bg-surface border border-border rounded-xl space-y-2">
              <span className="text-xs uppercase font-bold text-text-muted">Cascaded Seats Claimed</span>
              <div className="text-2xl font-black font-mono text-emerald-400">18 Claims</div>
              <p className="text-[11px] text-text-muted">Promoted without manual advisor intervention</p>
            </div>
            <div className="p-4 bg-surface border border-border rounded-xl space-y-2">
              <span className="text-xs uppercase font-bold text-text-muted">Claim Lease Duration</span>
              <div className="text-2xl font-black font-mono text-sky-400">60 Minutes</div>
              <p className="text-[11px] text-text-muted">TTL before seat cascades to the next position</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-sm text-text">Active Section Queues:</h4>
            {[
              { code: 'ANAT-101', section: 'Section B (West Annex)', instructor: 'Dr. Alistair Who', waitlistLen: 5, yourPosition: 2, status: 'QUEUE_ACTIVE' },
              { code: 'PHYS-102', section: 'Section A (Auditorium 2)', instructor: 'Dr. James Sterling', waitlistLen: 3, yourPosition: 1, status: 'CLAIM_LEASE_ACTIVE' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-surface border border-border rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{item.code}</span>
                    <span className="font-bold text-text">{item.section}</span>
                    <Badge tone={item.status === 'CLAIM_LEASE_ACTIVE' ? 'success' : 'warning'}>
                      {item.status === 'CLAIM_LEASE_ACTIVE' ? 'Claim Window Open (48m left)' : 'Queued'}
                    </Badge>
                  </div>
                  <p className="text-text-muted mt-0.5">Instructor: {item.instructor} • Total in line: {item.waitlistLen}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold font-mono text-text">Your Position: #{item.yourPosition}</span>
                  {item.status === 'CLAIM_LEASE_ACTIVE' ? (
                    <Button variant="primary" size="sm" className="text-xs">
                      Claim Seat Now
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="text-xs text-red-400">
                      Leave Waitlist
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* MODE 3: PREREQUISITE CHAINS & CGPA RETAKE SIMULATOR */}
      {activeMode === 'PREREQUISITES_SIMULATOR' && (
        <Card pad="md" className="space-y-6">
          <div className="border-b border-border/40 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-text">Prerequisite Validation & Grade Improvement Simulator</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Verifies historical academic completion chains before registration and previews cumulative CGPA lift under grade replacement policies.
              </p>
            </div>
            <Badge tone="primary">Academic Audit</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cleared Prerequisites */}
            <div className="p-4 bg-surface border border-border rounded-xl space-y-3">
              <h4 className="font-bold text-sm text-text flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Cleared Prerequisite Chain ({prereqData?.clearedCourses?.length || 3})</span>
              </h4>
              <div className="space-y-2 text-xs">
                {prereqData?.clearedCourses?.map((c: any) => (
                  <div key={c.code} className="p-2.5 bg-background border border-border/60 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-primary mr-1.5">{c.code}</span>
                      <span className="text-text">{c.title}</span>
                    </div>
                    <Badge tone="success">Grade {c.grade}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Retake CGPA Simulator */}
            <div className="p-4 bg-surface border border-border rounded-xl space-y-4">
              <h4 className="font-bold text-sm text-text flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>CGPA Retake Lift Simulator</span>
              </h4>

              <div className="space-y-3 text-xs">
                <FormField label="Select Course for Grade Replacement">
                  <select
                    value={retakeTargetCourse}
                    onChange={(e) => setRetakeTargetCourse(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text text-xs focus:outline-none focus:border-primary"
                  >
                    <option value="CHEM-100">CHEM-100: Foundations of Organic Chemistry (Current: B+)</option>
                    <option value="COMM-104">COMM-104: Community Medicine & Epidemiology (Current: C+)</option>
                  </select>
                </FormField>

                <FormField label="Simulated Target Grade in Retake Exam">
                  <select
                    value={simulatedGrade}
                    onChange={(e) => setSimulatedGrade(e.target.value as any)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text text-xs focus:outline-none focus:border-primary"
                  >
                    <option value="A">Grade A (4.00) — Outstanding</option>
                    <option value="A-">Grade A- (3.70) — Excellent</option>
                    <option value="B+">Grade B+ (3.30) — Very Good</option>
                    <option value="B">Grade B (3.00) — Satisfactory</option>
                  </select>
                </FormField>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-bold text-text block">Current CGPA: 3.88</span>
                    <span className="text-emerald-400 font-bold block mt-0.5">
                      Simulated Projected CGPA: {retakeTargetCourse === 'COMM-104' ? '3.96' : '3.92'}
                    </span>
                  </div>
                  <Badge tone="success">+0.08 Lift</Badge>
                </div>
                <p className="text-[10px] text-text-muted italic">
                  Note: Under the retake billing policy, only course tuition per credit is assessed; institutional campus fees are not duplicated.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* MODE 4: DEAN & FACULTY SECTION CONTROL */}
      {activeMode === 'FACULTY_MANAGEMENT' && (
        <Card pad="md" className="space-y-4">
          <div className="border-b border-border/40 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-text">Dean & Department Section Management Console</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Reassign section faculty instructors, split over-subscribed sections, and adjust seat quotas without dropping enrolled student rosters.
              </p>
            </div>
            <Badge tone="primary">Academic Operations</Badge>
          </div>

          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="p-4 bg-surface border border-border rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{course.code}</span>
                    <span className="font-bold text-text">{course.title}</span>
                    <span className="text-xs text-text-muted">({course.department})</span>
                  </div>
                  <Badge tone="default">{course.sections.length} Sections Active</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.sections.map((sec) => (
                    <div key={sec.id} className="p-3 bg-background border border-border/60 rounded-lg space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-text">{sec.sectionName}</span>
                        <span className="font-mono text-text-muted">{sec.enrolledCount} / {sec.totalSeats} Enrolled</span>
                      </div>
                      <div className="text-text-muted">
                        <p>Instructor: <span className="font-semibold text-text">{sec.instructor}</span></p>
                        <p>{sec.schedule} • {sec.room}</p>
                      </div>
                      <div className="pt-2 border-t border-border/30 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReassignModal(course, sec)}
                          className="text-xs py-1 px-2 h-auto"
                        >
                          <Users className="w-3 h-3 mr-1" /> Reassign Teacher
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSplitModal(course, sec)}
                          className="text-xs py-1 px-2 h-auto"
                        >
                          <Split className="w-3 h-3 mr-1" /> Split Section
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* MODE 5: TIME WINDOWS & DYNAMIC FINES CONTROL */}
      {activeMode === 'WINDOWS_FINES' && (
        <Card pad="md" className="space-y-6">
          <div className="border-b border-border/40 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-text">Advising Time Windows & Surcharge Policy</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Configure institution-wide advising timeframes, course drop refund deadlines, and automatic fine triggers.
              </p>
            </div>
            <Badge tone="warning">Policy Enforcer</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dynamic Fine Rates */}
            <div className="p-4 bg-surface border border-border rounded-xl space-y-4">
              <h4 className="font-bold text-sm text-text flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Dynamic Penalty Assessments</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-background border border-border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-text">Late Advising Surcharge</span>
                      <p className="text-[11px] text-text-muted">Default: ৳1,000</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={lateAdvisingActive}
                      onChange={(e) => setLateAdvisingActive(e.target.checked)}
                      className="w-4 h-4 text-primary rounded"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted">Rate (৳):</span>
                    <Input
                      type="number"
                      value={lateAdvisingFineRate}
                      onChange={(e) => setLateAdvisingFineRate(Number(e.target.value) || 0)}
                      className="w-32 font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-background border border-border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-text">Late Tuition Payment Fine</span>
                      <p className="text-[11px] text-text-muted">Default: ৳10,000</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={lateTuitionActive}
                      onChange={(e) => setLateTuitionActive(e.target.checked)}
                      className="w-4 h-4 text-primary rounded"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted">Rate (৳):</span>
                    <Input
                      type="number"
                      value={lateTuitionFineRate}
                      onChange={(e) => setLateTuitionFineRate(Number(e.target.value) || 0)}
                      className="w-32 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Time Window Deadlines */}
            <div className="p-4 bg-surface border border-border rounded-xl space-y-4">
              <h4 className="font-bold text-sm text-text flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Statutory Time Window Deadlines</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <FormField label="Regular Advising Start">
                    <Input
                      type="date"
                      value={advisingStartDate}
                      onChange={(e) => setAdvisingStartDate(e.target.value)}
                    />
                  </FormField>
                  <FormField label="Regular Advising End">
                    <Input
                      type="date"
                      value={advisingEndDate}
                      onChange={(e) => setAdvisingEndDate(e.target.value)}
                    />
                  </FormField>
                </div>

                <FormField label="Course Drop Deadline (100% Refund)">
                  <Input
                    type="date"
                    value={dropDeadline}
                    onChange={(e) => setDropDeadline(e.target.value)}
                  />
                </FormField>

                <FormField label="Late Course Drop Deadline (50% Refund)">
                  <Input
                    type="date"
                    value={lateDropDeadline}
                    onChange={(e) => setLateDropDeadline(e.target.value)}
                  />
                </FormField>

                <FormField label="Course Withdrawal Deadline ('W' Grade / No Refund)">
                  <Input
                    type="date"
                    value={withdrawDeadline}
                    onChange={(e) => setWithdrawDeadline(e.target.value)}
                  />
                </FormField>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* MODE 6: PUSH & SMS DISPATCH STREAM */}
      {activeMode === 'NOTIFICATIONS' && (
        <Card pad="md" className="space-y-4">
          <div className="border-b border-border/40 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-text">Advising Push Notification & SMS Dispatch Log</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Audit trail of automated alerts dispatched to students before advising, during seat holds, and post-settlement.
              </p>
            </div>
            <Badge tone="success">Gateway Operational</Badge>
          </div>

          <div className="space-y-3">
            {notifications.map((notif: any) => (
              <div key={notif.id} className="p-3 bg-surface border border-border rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge tone={notif.type === 'PUSH_ALERT' ? 'primary' : notif.type === 'FINANCE_WARNING' ? 'warning' : 'success'}>
                      {notif.type}
                    </Badge>
                    <span className="font-bold text-text">{notif.title}</span>
                  </div>
                  <span className="text-[11px] text-text-muted font-mono">{notif.channel}</span>
                </div>
                <p className="text-text-muted">{notif.message}</p>
                <div className="text-[10px] text-text-muted/60 pt-1 border-t border-border/30">
                  Dispatched at: {notif.timestamp} • Status: {notif.status}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* MODE 7: IMMUTABLE AUDIT TRAIL */}
      {activeMode === 'AUDIT_TRAIL' && (
        <Card pad="md" className="space-y-6">
          <div className="border-b border-border/40 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-text">Immutable Advising Audit Trail</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Complete forensic log of every advising state mutation: seat holds, locks, settlements, drops, swaps, waitlist cascades, and administrative overrides.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="text-xs py-1.5 px-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:border-primary"
              >
                <option value="ALL">All Actions</option>
                <option value="SECTION_SELECTED">Section Selected</option>
                <option value="PROVISIONAL_LOCK_SUBMITTED">Provisional Lock</option>
                <option value="TUITION_SETTLEMENT_STEP2">Settlement</option>
                <option value="COURSE_DROPPED">Course Dropped</option>
                <option value="WAITLIST_SEAT_CASCADE">Waitlist Cascade</option>
                <option value="SECTION_INSTRUCTOR_REASSIGNED">Instructor Change</option>
                <option value="LATE_ADVISING_FINE_ASSESSED">Fine Assessed</option>
              </select>
              <Badge tone="primary">{auditTrail.length} Events</Badge>
            </div>
          </div>

          {/* Audit Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-surface border border-border rounded-xl">
              <span className="text-[11px] uppercase font-bold text-text-muted">Total Mutations</span>
              <div className="text-xl font-black font-mono text-text mt-1">{auditTrail.length}</div>
            </div>
            <div className="p-3 bg-surface border border-border rounded-xl">
              <span className="text-[11px] uppercase font-bold text-text-muted">Financial Events</span>
              <div className="text-xl font-black font-mono text-emerald-400 mt-1">
                {auditTrail.filter((a: any) => a.financialImpact).length}
              </div>
            </div>
            <div className="p-3 bg-surface border border-border rounded-xl">
              <span className="text-[11px] uppercase font-bold text-text-muted">System Actions</span>
              <div className="text-xl font-black font-mono text-amber-400 mt-1">
                {auditTrail.filter((a: any) => a.actor?.startsWith('SYSTEM') || a.actor?.startsWith('WAITLIST') || a.actor?.startsWith('DEAN')).length}
              </div>
            </div>
            <div className="p-3 bg-surface border border-border rounded-xl">
              <span className="text-[11px] uppercase font-bold text-text-muted">Unique Sessions</span>
              <div className="text-xl font-black font-mono text-sky-400 mt-1">
                {new Set(auditTrail.map((a: any) => a.sessionId)).size}
              </div>
            </div>
          </div>

          {/* Audit Event Stream */}
          <div className="space-y-2">
            {auditTrail
              .filter((evt: any) => auditActionFilter === 'ALL' || evt.action === auditActionFilter)
              .map((evt: any) => {
                const actionColors: Record<string, string> = {
                  SECTION_SELECTED: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
                  PROVISIONAL_LOCK_SUBMITTED: 'text-primary bg-primary/10 border-primary/30',
                  TUITION_SETTLEMENT_STEP2: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                  COURSE_DROPPED: 'text-red-400 bg-red-500/10 border-red-500/30',
                  LATE_ADVISING_FINE_ASSESSED: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                  SECTION_INSTRUCTOR_REASSIGNED: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
                  WAITLIST_SEAT_CASCADE: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
                };
                const colorClass = actionColors[evt.action] || 'text-text-muted bg-surface border-border';

                return (
                  <div key={evt.id} className={`p-3 rounded-xl border ${colorClass} space-y-2 text-xs`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-background/60">
                          {evt.action.replace(/_/g, ' ')}
                        </span>
                        <span className="font-bold">{evt.target}</span>
                      </div>
                      <span className="font-mono text-[10px] text-text-muted">{new Date(evt.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-text-muted leading-relaxed">{evt.details}</p>
                    <div className="flex items-center justify-between pt-1.5 border-t border-border/30">
                      <div className="flex items-center gap-3 text-[10px] text-text-muted">
                        <span>Actor: <span className="font-semibold text-text">{evt.actor}</span></span>
                        <span>IP: <span className="font-mono">{evt.ipAddress}</span></span>
                        <span>Session: <span className="font-mono">{evt.sessionId}</span></span>
                      </div>
                      {evt.financialImpact && (
                        <Badge tone="success" className="text-[10px]">
                          <DollarSign className="w-3 h-3 mr-0.5" />
                          Financial Impact
                        </Badge>
                      )}
                    </div>
                    {evt.financialImpact && (
                      <div className="p-2 bg-background/60 rounded-lg text-[10px] text-text-muted space-y-0.5">
                        {evt.financialImpact.amount && <span>Amount: <span className="font-mono font-bold text-emerald-400">৳{evt.financialImpact.amount.toLocaleString()}</span></span>}
                        {evt.financialImpact.refundAmount && <span> • Refund: <span className="font-mono font-bold text-emerald-400">৳{evt.financialImpact.refundAmount.toLocaleString()}</span> ({evt.financialImpact.refundPct}%)</span>}
                        {evt.financialImpact.fineAmount && <span> • Fine: <span className="font-mono font-bold text-amber-400">৳{evt.financialImpact.fineAmount.toLocaleString()}</span> ({evt.financialImpact.fineType})</span>}
                        {evt.financialImpact.journalId && <span> • Journal: <span className="font-mono">{evt.financialImpact.journalId}</span></span>}
                        {evt.financialImpact.creditMemoId && <span> • Credit Memo: <span className="font-mono">{evt.financialImpact.creditMemoId}</span></span>}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {/* MODE 8: TIERED REFUND ENGINE */}
      {activeMode === 'REFUND_ENGINE' && (
        <div className="space-y-6">
          <Card pad="md" className="space-y-6">
            <div className="border-b border-border/40 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-text">Tiered Refund Calculation Engine</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Dynamically computes refund percentages based on the current date relative to institutional deadline windows. Generates credit memos and reversal journal entries.
                </p>
              </div>
              <Badge tone="warning">Fiscal Policy Engine</Badge>
            </div>

            {/* Refund Window Timeline */}
            {refundPreview && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-text">Refund Window Timeline:</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {refundPreview.windows?.map((win: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs space-y-2 ${
                        win.status === 'ACTIVE'
                          ? 'border-emerald-500/40 bg-emerald-500/10'
                          : win.status === 'EXPIRED'
                          ? 'border-border/40 bg-surface/60 opacity-60'
                          : win.status === 'UPCOMING'
                          ? 'border-amber-500/30 bg-amber-500/5'
                          : 'border-red-500/20 bg-red-500/5 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Badge tone={win.status === 'ACTIVE' ? 'success' : win.status === 'EXPIRED' ? 'default' : win.status === 'UPCOMING' ? 'warning' : 'danger'}>
                          {win.status}
                        </Badge>
                        <span className="font-black font-mono text-lg">{win.refundPct}%</span>
                      </div>
                      <p className="font-bold text-text">{win.label}</p>
                      {win.deadline && (
                        <p className="text-text-muted font-mono text-[10px]">Deadline: {new Date(win.deadline).toLocaleDateString()}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Selector for Refund Calculation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-surface border border-border rounded-xl space-y-4">
                <h4 className="font-bold text-sm text-text flex items-center gap-2">
                  <Scale className="w-4 h-4 text-primary" />
                  Select Course for Refund Preview
                </h4>
                <div className="space-y-2">
                  {advisingRecord?.advisedCourses?.map((c: any) => (
                    <button
                      key={c.courseId}
                      type="button"
                      onClick={() => setRefundTargetCourseId(c.courseId)}
                      className={`w-full p-3 rounded-lg border text-left text-xs flex items-center justify-between transition-all ${
                        refundTargetCourseId === c.courseId
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background hover:border-primary/40 text-text'
                      }`}
                    >
                      <div>
                        <span className="font-mono font-bold">{c.code}</span>
                        <span className="ml-1.5">{c.title}</span>
                        <p className="text-text-muted mt-0.5">{c.credits} Credits • {c.sectionName}</p>
                      </div>
                      <span className="font-mono font-bold">৳{c.tuition.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Refund Calculation Result */}
              {refundPreview && (
                <div className="p-4 bg-surface border border-emerald-500/20 rounded-xl space-y-4">
                  <h4 className="font-bold text-sm text-text flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    Refund Computation Result
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-text-muted">
                      <span>Course:</span>
                      <span className="font-bold text-text">{refundPreview.courseCode} — {refundPreview.courseTitle}</span>
                    </div>
                    <div className="flex justify-between text-text-muted">
                      <span>Original Tuition Charged:</span>
                      <span className="font-mono">৳{refundPreview.originalTuition?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-primary">
                      <span>Active Refund Window:</span>
                      <span>{refundPreview.currentWindowLabel}</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-400">
                      <span>Refund Percentage:</span>
                      <span className="text-lg font-mono">{refundPreview.currentRefundPct}%</span>
                    </div>
                    <div className="pt-2 border-t border-border/40 space-y-1">
                      <div className="flex justify-between">
                        <span>Gross Refund Amount:</span>
                        <span className="font-mono">৳{refundPreview.calculatedRefundAmount?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-amber-400">
                        <span>Administrative Processing Fee:</span>
                        <span className="font-mono">-৳{refundPreview.administrativeFee?.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t-2 border-border flex justify-between text-sm font-black">
                      <span>Net Refund to Student Ledger:</span>
                      <span className="font-mono text-emerald-400 text-lg">৳{refundPreview.netRefundToStudent?.toLocaleString()}</span>
                    </div>
                    <div className="p-2 bg-background rounded-lg text-[10px] text-text-muted mt-2">
                      <span className="font-bold">Journal Entry: </span>
                      DR {refundPreview.journalEntry?.debit} / CR {refundPreview.journalEntry?.credit} — ৳{refundPreview.journalEntry?.amount?.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        dropMutation.mutate(refundTargetCourseId);
                      }}
                      disabled={dropMutation.isPending}
                      loading={dropMutation.isPending}
                    >
                      Execute Drop & Generate Credit Memo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* MODE 9: LIVE SEAT LOCK MONITOR */}
      {activeMode === 'SEAT_LOCKS' && (
        <Card pad="md" className="space-y-6">
          <div className="border-b border-border/40 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-text">Real-Time Concurrent Seat Lock Monitor</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Live heartbeat dashboard showing every active seat reservation across all sections. Tracks confirmed enrollments, provisional locks, and expiring cache holds.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="success" className="animate-pulse">Live — Auto-refresh 15s</Badge>
            </div>
          </div>

          {/* Aggregate Lock Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 bg-surface border border-border rounded-xl">
              <span className="text-[11px] uppercase font-bold text-text-muted">Total Sections Tracked</span>
              <div className="text-xl font-black font-mono text-text mt-1">{sectionLocks.length}</div>
            </div>
            <div className="p-3 bg-surface border border-emerald-500/20 rounded-xl">
              <span className="text-[11px] uppercase font-bold text-emerald-400">Confirmed Enrolled</span>
              <div className="text-xl font-black font-mono text-emerald-400 mt-1">
                {sectionLocks.reduce((s: number, l: any) => s + (l.confirmedEnrolled || 0), 0)}
              </div>
            </div>
            <div className="p-3 bg-surface border border-primary/20 rounded-xl">
              <span className="text-[11px] uppercase font-bold text-primary">Provisional Locks</span>
              <div className="text-xl font-black font-mono text-primary mt-1">
                {sectionLocks.reduce((s: number, l: any) => s + (l.provisionallyLocked || 0), 0)}
              </div>
            </div>
            <div className="p-3 bg-surface border border-amber-500/20 rounded-xl">
              <span className="text-[11px] uppercase font-bold text-amber-400">Cache Holds (Expiring)</span>
              <div className="text-xl font-black font-mono text-amber-400 mt-1">
                {sectionLocks.reduce((s: number, l: any) => s + (l.cacheHeldExpiring || 0), 0)}
              </div>
            </div>
            <div className="p-3 bg-surface border border-sky-500/20 rounded-xl">
              <span className="text-[11px] uppercase font-bold text-sky-400">True Available</span>
              <div className="text-xl font-black font-mono text-sky-400 mt-1">
                {sectionLocks.reduce((s: number, l: any) => s + (l.trueAvailable || 0), 0)}
              </div>
            </div>
          </div>

          {/* Per-Section Lock Details */}
          <div className="space-y-4">
            {sectionLocks.map((lock: any) => {
              const utilizationPct = ((lock.confirmedEnrolled + lock.provisionallyLocked + lock.cacheHeldExpiring) / lock.totalSeats) * 100;
              return (
                <div key={`${lock.sectionId}-${lock.courseCode}`} className="p-4 bg-surface border border-border rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-primary text-sm">{lock.courseCode}</span>
                      <span className="font-bold text-text text-sm">{lock.sectionName}</span>
                      <Badge tone={lock.trueAvailable > 0 ? 'success' : 'danger'}>
                        {lock.trueAvailable > 0 ? `${lock.trueAvailable} True Available` : 'FULLY LOCKED'}
                      </Badge>
                    </div>
                    <span className="font-mono text-xs text-text-muted">
                      {lock.confirmedEnrolled + lock.provisionallyLocked + lock.cacheHeldExpiring} / {lock.totalSeats} Occupied
                    </span>
                  </div>

                  {/* Stacked Utilization Bar */}
                  <div className="w-full h-4 rounded-full overflow-hidden bg-border/50 flex">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${(lock.confirmedEnrolled / lock.totalSeats) * 100}%` }}
                      title={`Confirmed: ${lock.confirmedEnrolled}`}
                    />
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(lock.provisionallyLocked / lock.totalSeats) * 100}%` }}
                      title={`Provisional: ${lock.provisionallyLocked}`}
                    />
                    <div
                      className="h-full bg-amber-500 animate-pulse transition-all"
                      style={{ width: `${(lock.cacheHeldExpiring / lock.totalSeats) * 100}%` }}
                      title={`Cache Hold: ${lock.cacheHeldExpiring}`}
                    />
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-text-muted">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Confirmed ({lock.confirmedEnrolled})</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Provisional ({lock.provisionallyLocked})</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Cache Hold ({lock.cacheHeldExpiring})</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-border" /> Available ({lock.trueAvailable})</span>
                  </div>

                  {/* Lock Holders Table */}
                  {lock.lockHolders?.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Active Lock Holders:</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                        {lock.lockHolders.map((holder: any, idx: number) => (
                          <div key={idx} className="p-2 bg-background border border-border/50 rounded-lg flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-text">{holder.studentId}</span>
                              <Badge tone={holder.holdType === 'PROVISIONAL' ? 'primary' : 'warning'} className="text-[9px] py-0">
                                {holder.holdType}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-text-muted">
                              <Timer className="w-3 h-3" />
                              <span className="font-mono">{new Date(holder.expiresAt).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* MODE 10: OVERRIDE APPROVALS */}
      {activeMode === 'OVERRIDE_APPROVALS' && (
        <Card pad="md" className="space-y-6">
          <div className="border-b border-border/40 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-text">Faculty & Dean Override Approval Queue</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Students exceeding credit limits, missing prerequisites, or having time conflicts can request advisor overrides. Approvals are logged to audit trail.
              </p>
            </div>
            <Badge tone="warning">{overrideRequests.length} Pending</Badge>
          </div>

          {/* Override Type Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { type: 'CREDIT_OVERLOAD', label: 'Credit Overload Requests', icon: TrendingUp, color: 'text-amber-400', count: overrideRequests.filter((r: any) => r.overrideType === 'CREDIT_OVERLOAD').length },
              { type: 'PREREQUISITE_WAIVER', label: 'Prerequisite Waiver Requests', icon: ShieldCheck, color: 'text-violet-400', count: overrideRequests.filter((r: any) => r.overrideType === 'PREREQUISITE_WAIVER').length },
              { type: 'TIME_CONFLICT_EXCEPTION', label: 'Time Conflict Exceptions', icon: Clock, color: 'text-sky-400', count: overrideRequests.filter((r: any) => r.overrideType === 'TIME_CONFLICT_EXCEPTION').length },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.type} className="p-4 bg-surface border border-border rounded-xl flex items-center gap-3">
                  <Icon className={`w-8 h-8 ${item.color}`} />
                  <div>
                    <div className="text-2xl font-black font-mono text-text">{item.count}</div>
                    <span className="text-xs text-text-muted">{item.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Override Request Cards */}
          <div className="space-y-3">
            {overrideRequests.map((req: any) => (
              <div key={req.id} className="p-4 bg-surface border border-border rounded-xl space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      tone={req.overrideType === 'CREDIT_OVERLOAD' ? 'warning' : req.overrideType === 'PREREQUISITE_WAIVER' ? 'primary' : 'default'}
                    >
                      {req.overrideType.replace(/_/g, ' ')}
                    </Badge>
                    <span className="font-bold text-text">{req.studentName}</span>
                    <span className="font-mono text-text-muted">({req.studentId})</span>
                  </div>
                  <Badge tone={req.status === 'PENDING_ADVISOR' ? 'warning' : 'primary'}>
                    {req.status.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="p-3 bg-background border border-border/60 rounded-lg space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{req.courseCode}</span>
                    <span className="text-text">{req.courseTitle}</span>
                  </div>
                  {req.requestedCredits && (
                    <p className="text-text-muted">Requested Credits: <span className="font-bold text-red-400">{req.requestedCredits}</span> / Max Allowed: <span className="font-bold text-text">{req.maxAllowed}</span></p>
                  )}
                  {req.missingPrereq && (
                    <p className="text-text-muted">Missing Prerequisite: <span className="font-bold text-amber-400">{req.missingPrereq}</span></p>
                  )}
                  {req.conflictWith && (
                    <p className="text-text-muted">Conflicts With: <span className="font-bold text-amber-400">{req.conflictWith}</span></p>
                  )}
                </div>

                <div className="p-3 bg-background/50 rounded-lg">
                  <span className="font-bold text-text-muted">Justification:</span>
                  <p className="text-text mt-0.5 leading-relaxed">{req.justification}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-[10px] text-text-muted font-mono">Submitted: {new Date(req.requestedAt).toLocaleString()}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-red-400 border-red-500/30 hover:bg-red-500/10"
                      onClick={() => rejectOverrideMutation.mutate({ id: req.id, reason: 'Insufficient justification' })}
                      loading={rejectOverrideMutation.isPending}
                    >
                      <XCircle className="w-3 h-3 mr-1" /> Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs"
                      onClick={() => approveOverrideMutation.mutate({ id: req.id, notes: 'Approved by Dean review' })}
                      loading={approveOverrideMutation.isPending}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Approve Override
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* MODE 11: FINANCIAL RECONCILIATION & ANALYTICS */}
      {activeMode === 'RECONCILIATION' && reconciliation && (
        <div className="space-y-6">
          <Card pad="md" className="space-y-6">
            <div className="border-b border-border/40 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-text">Advising ↔ Finance Reconciliation Dashboard</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Cross-module financial summary bridging advising enrollment data with the GAAP general ledger. Tracks billing, settlements, refunds, and variance analysis.
                </p>
              </div>
              <Badge tone={reconciliation.reconciliationStatus === 'VARIANCE_WITHIN_TOLERANCE' ? 'success' : 'danger'}>
                {reconciliation.reconciliationStatus?.replace(/_/g, ' ')}
              </Badge>
            </div>

            {/* Top-Level Financial KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-surface border border-border rounded-xl">
                <span className="text-[11px] uppercase font-bold text-text-muted">Cohort Size</span>
                <div className="text-xl font-black font-mono text-text mt-1">{reconciliation.cohortSize?.toLocaleString()}</div>
                <span className="text-[10px] text-text-muted">Students Advised</span>
              </div>
              <div className="p-3 bg-surface border border-emerald-500/20 rounded-xl">
                <span className="text-[11px] uppercase font-bold text-emerald-400">Grand Total Billed</span>
                <div className="text-xl font-black font-mono text-emerald-400 mt-1">৳{(reconciliation.grandTotalBilled / 1000000).toFixed(1)}M</div>
                <span className="text-[10px] text-text-muted">৳{reconciliation.grandTotalBilled?.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-surface border border-primary/20 rounded-xl">
                <span className="text-[11px] uppercase font-bold text-primary">Total Settled</span>
                <div className="text-xl font-black font-mono text-primary mt-1">৳{(reconciliation.totalSettled / 1000000).toFixed(1)}M</div>
                <span className="text-[10px] text-text-muted">{reconciliation.settlementRate}% Rate</span>
              </div>
              <div className="p-3 bg-surface border border-red-500/20 rounded-xl">
                <span className="text-[11px] uppercase font-bold text-red-400">Outstanding</span>
                <div className="text-xl font-black font-mono text-red-400 mt-1">৳{(reconciliation.totalOutstanding / 1000000).toFixed(1)}M</div>
                <span className="text-[10px] text-text-muted">{reconciliation.creditMemosIssued} Credit Memos</span>
              </div>
            </div>

            {/* Detailed Billing Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-surface border border-border rounded-xl space-y-3">
                <h4 className="font-bold text-sm text-text flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Billing Decomposition
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-text-muted">
                    <span>Gross Tuition Billed:</span>
                    <span className="font-mono">৳{reconciliation.totalGrossTuitionBilled?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Scholarship Deductions:</span>
                    <span className="font-mono">-৳{reconciliation.totalScholarshipDeductions?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-text border-t border-border/40 pt-1">
                    <span>Net Tuition Billed:</span>
                    <span className="font-mono">৳{reconciliation.totalNetTuitionBilled?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>Institutional Fees:</span>
                    <span className="font-mono">৳{reconciliation.totalInstitutionalFees?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-amber-400">
                    <span>Late Fines Collected:</span>
                    <span className="font-mono">৳{reconciliation.totalLateFines?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-red-400">
                    <span>Refunds Processed:</span>
                    <span className="font-mono">-৳{reconciliation.refundsProcessed?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-text border-t-2 border-border pt-2">
                    <span>Variance Amount:</span>
                    <span className={`font-mono ${reconciliation.variancePct < 0.1 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ৳{reconciliation.varianceAmount?.toLocaleString()} ({reconciliation.variancePct}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method Distribution */}
              <div className="p-4 bg-surface border border-border rounded-xl space-y-3">
                <h4 className="font-bold text-sm text-text flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-primary" />
                  Settlement Gateway Distribution
                </h4>
                <div className="space-y-2">
                  {reconciliation.breakdown?.byPaymentMethod?.map((pm: any) => (
                    <div key={pm.method} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text">{pm.method}</span>
                        <span className="font-mono text-text-muted">{pm.count} txns • ৳{(pm.amount / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-border/50 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(pm.amount / reconciliation.totalSettled) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Department-wise Breakdown Table */}
            <div className="p-4 bg-surface border border-border rounded-xl space-y-3">
              <h4 className="font-bold text-sm text-text flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Department-wise Collection Report
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-text-muted text-left">
                      <th className="pb-2 pr-4 font-bold">Department</th>
                      <th className="pb-2 pr-4 font-bold text-right">Students</th>
                      <th className="pb-2 pr-4 font-bold text-right">Billed (৳)</th>
                      <th className="pb-2 pr-4 font-bold text-right">Settled (৳)</th>
                      <th className="pb-2 pr-4 font-bold text-right">Outstanding (৳)</th>
                      <th className="pb-2 font-bold text-right">Collection %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reconciliation.breakdown?.byDepartment?.map((dept: any) => (
                      <tr key={dept.department} className="border-b border-border/30">
                        <td className="py-2 pr-4 font-bold text-text">{dept.department}</td>
                        <td className="py-2 pr-4 text-right font-mono">{dept.students}</td>
                        <td className="py-2 pr-4 text-right font-mono">৳{dept.billed.toLocaleString()}</td>
                        <td className="py-2 pr-4 text-right font-mono text-emerald-400">৳{dept.settled.toLocaleString()}</td>
                        <td className="py-2 pr-4 text-right font-mono text-red-400">৳{dept.outstanding.toLocaleString()}</td>
                        <td className="py-2 text-right">
                          <Badge tone={((dept.settled / dept.billed) * 100) > 85 ? 'success' : 'warning'}>
                            {((dept.settled / dept.billed) * 100).toFixed(1)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Analytics Sub-section */}
          {analytics && (
            <Card pad="md" className="space-y-6">
              <div className="border-b border-border/40 pb-3">
                <h3 className="font-bold text-base text-text">Semester Advising Analytics</h3>
                <p className="text-xs text-text-muted mt-0.5">Operational intelligence for registrar and academic planning.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-surface border border-border rounded-xl">
                  <span className="text-[11px] uppercase font-bold text-text-muted">Avg Credits/Student</span>
                  <div className="text-xl font-black font-mono text-text mt-1">{analytics.averageCreditsPerStudent}</div>
                </div>
                <div className="p-3 bg-surface border border-border rounded-xl">
                  <span className="text-[11px] uppercase font-bold text-text-muted">Section Swaps</span>
                  <div className="text-xl font-black font-mono text-primary mt-1">{analytics.sectionSwapCount}</div>
                </div>
                <div className="p-3 bg-surface border border-border rounded-xl">
                  <span className="text-[11px] uppercase font-bold text-text-muted">Peak Concurrent Users</span>
                  <div className="text-xl font-black font-mono text-amber-400 mt-1">{analytics.peakConcurrentUsers?.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-surface border border-border rounded-xl">
                  <span className="text-[11px] uppercase font-bold text-text-muted">Avg Advising Time</span>
                  <div className="text-xl font-black font-mono text-sky-400 mt-1">{analytics.averageAdvisingTimeMinutes} min</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-surface border border-border rounded-xl space-y-3">
                  <h4 className="font-bold text-sm text-text">Drop Rate by Window</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Regular Drop (100%):</span>
                      <span className="font-mono text-text">{analytics.dropRateByWindow?.regularDrop100Pct?.count} drops • ৳{analytics.dropRateByWindow?.regularDrop100Pct?.totalRefunded?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Late Drop (50%):</span>
                      <span className="font-mono text-text">{analytics.dropRateByWindow?.lateDrop50Pct?.count} drops • ৳{analytics.dropRateByWindow?.lateDrop50Pct?.totalRefunded?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Withdrawal (W):</span>
                      <span className="font-mono text-text">{analytics.dropRateByWindow?.withdrawalWGrade?.count} withdrawals • ৳0</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-surface border border-border rounded-xl space-y-3">
                  <h4 className="font-bold text-sm text-text">Fine Collection</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Late Advising Fines:</span>
                      <span className="font-mono text-amber-400">{analytics.fineCollection?.lateAdvisingFines?.count} × ৳{analytics.fineCollection?.lateAdvisingFines?.totalCollected?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Late Tuition Fines:</span>
                      <span className="font-mono text-red-400">{analytics.fineCollection?.lateTuitionFines?.count} × ৳{analytics.fineCollection?.lateTuitionFines?.totalCollected?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-surface border border-border rounded-xl space-y-3">
                  <h4 className="font-bold text-sm text-text">Most Oversubscribed</h4>
                  <div className="space-y-2 text-xs">
                    {analytics.mostOversubscribedSections?.map((sec: any, idx: number) => (
                      <div key={idx} className="flex justify-between">
                        <span className="font-mono text-primary">{sec.courseCode} {sec.section}</span>
                        <Badge tone="danger">{sec.waitlistLength} Waitlisted</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Operational Mode: Dual-Major & Multi-Curricular Equivalence Matrix */}
      {activeMode === 'DUAL_MAJOR_MATRIX' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-surface to-surface-muted border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-primary-soft text-primary">
                      Inter-School Academic Framework
                    </span>
                    <Badge tone="gold" className="text-[10px]">Dual-Degree Enrolled (280 Cr Track)</Badge>
                  </div>
                  <h3 className="text-lg font-bold font-display text-text">
                    Multi-Major Split-Tuition & Curricular Catalog Equivalence Matrix
                  </h3>
                  <p className="text-xs text-text-muted mt-1 max-w-2xl">
                    Dynamic split-tier tuition computation across School of Engineering & School of Business. Handles cross-credited GenEd deduplication and legacy catalog bridging.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-center px-4 py-2 rounded-xl bg-surface border border-border">
                    <div className="text-xs text-text-muted">Primary Major (CSE)</div>
                    <div className="text-sm font-bold text-text font-display">112 / 140 Cr</div>
                  </div>
                  <div className="text-center px-4 py-2 rounded-xl bg-surface border border-border">
                    <div className="text-xs text-text-muted">Secondary Major (BBA)</div>
                    <div className="text-sm font-bold text-gold font-display">98 / 120 Cr</div>
                  </div>
                </div>
              </div>

              {/* Grid Layout: Split-Tuition & Dual Advisors */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Split-Tuition Ledger Computation */}
                <Card pad="md" className="border-border space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <h4 className="text-sm font-bold text-text font-display flex items-center gap-2">
                      <Split size={16} className="text-gold" />
                      Split-Tier Tuition Ledger (Fall 2026)
                    </h4>
                    <span className="text-[11px] font-mono text-primary font-semibold">15.0 Total Credits</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-surface-muted/50 border border-border/80 space-y-2">
                      <div className="flex items-center justify-between font-semibold text-text">
                        <span>School of Engineering (B.Sc CSE)</span>
                        <span className="font-mono text-primary">9.0 Credits @ ৳6,500/cr</span>
                      </div>
                      <div className="flex items-center justify-between text-text-muted text-[11px] pl-2 border-l-2 border-primary/40">
                        <span>• CSE-411 (3 Cr) + CSE-423 (3 Cr) + CSE-423L (3 Cr)</span>
                        <span className="font-mono font-bold text-text">৳58,500</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-muted/50 border border-border/80 space-y-2">
                      <div className="flex items-center justify-between font-semibold text-text">
                        <span>School of Business Administration (BBA Finance)</span>
                        <span className="font-mono text-gold">6.0 Credits @ ৳5,500/cr</span>
                      </div>
                      <div className="flex items-center justify-between text-text-muted text-[11px] pl-2 border-l-2 border-gold/40">
                        <span>• FIN-401 (3 Cr) + MKT-301 (3 Cr)</span>
                        <span className="font-mono font-bold text-text">৳33,000</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                      <div className="flex items-center justify-between font-semibold text-emerald-400">
                        <span>Common GenEd Deduplication Waiver</span>
                        <span className="font-mono">-৳19,500</span>
                      </div>
                      <p className="text-[10px] text-text-muted">
                        ENG-101 (3 Cr) and HUM-103 (3 Cr) credited to both degrees with single billing.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between font-bold text-sm">
                      <span>Net Semester Payable (BDT):</span>
                      <span className="font-mono text-primary text-base">৳72,000</span>
                    </div>
                  </div>
                </Card>

                {/* 2. Dual-Advisor Concurrency Authorization Queue */}
                <Card pad="md" className="border-border space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <h4 className="text-sm font-bold text-text font-display flex items-center gap-2">
                      <ShieldCheck size={16} className="text-primary" />
                      Dual-Advisor Concurrency Authorization
                    </h4>
                    <Badge tone="warning" className="text-[10px]">1 of 2 Signed</Badge>
                  </div>

                  <div className="space-y-3">
                    {/* Advisor 1 */}
                    <div className="p-3 rounded-xl bg-surface border border-border space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-text">Prof. Dr. Aris Thorne</span>
                            <Badge tone="success" className="text-[10px]">Engineering Lead</Badge>
                          </div>
                          <p className="text-[11px] text-text-muted">Dept. of Computer Science & Engineering</p>
                        </div>
                        <Badge tone="success" className="text-[10px] font-mono">AUTHORIZED</Badge>
                      </div>
                      <div className="text-[10px] font-mono text-text-muted bg-surface-muted/60 p-2 rounded-lg">
                        Signature Digest: SHA256:8f9a2e4c... (Signed 2026-10-03 09:14 AM)
                      </div>
                    </div>

                    {/* Advisor 2 */}
                    <div className="p-3 rounded-xl bg-surface border border-border space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-text">Assoc. Prof. Dr. Farzana Rahman</span>
                            <Badge tone="primary" className="text-[10px]">Business Co-Lead</Badge>
                          </div>
                          <p className="text-[11px] text-text-muted">School of Business Administration</p>
                        </div>
                        <Badge tone="warning" className="text-[10px] font-mono">PENDING SIGN-OFF</Badge>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-xs h-7 gap-1"
                          onClick={() => {
                            setSuccessToast('Digital signature verified for School of Business.');
                            setTimeout(() => setSuccessToast(''), 4000);
                          }}
                        >
                          <Check size={12} /> Sign Secondary Major
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* 3. Multi-Curricular Catalog Equivalence Matrix */}
              <Card pad="lg" className="border-border space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h4 className="text-base font-bold font-display text-text flex items-center gap-2">
                      <BookOpen size={18} className="text-gold" />
                      Multi-Curricular Catalog Equivalence Matrix (Legacy 2020 vs 2026 OBE Catalog)
                    </h4>
                    <p className="text-xs text-text-muted">
                      Automated equivalence bridge translating legacy student credits into modern 140-credit OBE standards.
                    </p>
                  </div>
                  <Badge tone="primary" className="text-xs font-mono">OBE ABET Translation</Badge>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-surface-muted/60 text-text-muted uppercase text-[10px] tracking-wider font-semibold">
                        <th className="py-2.5 px-3">Legacy 2020 Catalog Course</th>
                        <th className="py-2.5 px-3">Student Grade & Term</th>
                        <th className="py-2.5 px-3">2026 OBE Replacement Course</th>
                        <th className="py-2.5 px-3">Credit Translation</th>
                        <th className="py-2.5 px-3 text-right">Equivalence Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr className="hover:bg-surface-muted/30 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-text">CSE-201 (Data Structures, 3 Cr)</span>
                          <span className="text-[10px] text-text-muted block">+ CSE-202 (DS Lab, 1 Cr)</span>
                        </td>
                        <td className="py-3 px-3">
                          <Badge tone="gold" className="text-[10px]">A (GPA 3.75) • Spring 2024</Badge>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-primary">CSE-215 (Advanced Data Structures, 4 Cr)</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-success text-[11px]">4.0 / 4.0 Cr Cleared (Full Match)</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Badge tone="success" className="text-[10px]">EQUIVALENCE GRANTED</Badge>
                        </td>
                      </tr>
                      <tr className="hover:bg-surface-muted/30 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-text">HUM-101 (English Prose & Composition, 3 Cr)</span>
                        </td>
                        <td className="py-3 px-3">
                          <Badge tone="primary" className="text-[10px]">A- (GPA 3.50) • Fall 2023</Badge>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-primary">HUM-110 (Technical Writing, 2 Cr)</span>
                          <span className="text-[10px] text-text-muted block">+ HUM-111 (Oral Comm Lab, 1 Cr)</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-warning text-[11px]">2.0 Cr Cleared (1 Cr Bridge Pending)</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[11px] h-7 px-2"
                            onClick={() => {
                              setSuccessToast('1-Credit Oral Comm bridge waiver granted by Equivalence Committee.');
                              setTimeout(() => setSuccessToast(''), 4000);
                            }}
                          >
                            Grant Bridge Waiver
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

      {/* Step 2 Settlement Modal */}
      <Modal
        isOpen={isSettlementModalOpen}
        onClose={() => setIsSettlementModalOpen(false)}
        title="2-Step Settlement & Fiscal Clearance"
      >
        <div className="space-y-4">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">Ledger Bill Clearance</span>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-text">Total Payable BDT:</span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                ৳{financialComputation.grandTotal.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Authorizes Double-Entry Journal: Debit Student Receivable STU-2026001 / Credit Operating Revenue.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-text">Select Settlement Gateway / Payment Channel:</label>
            <div className="grid grid-cols-2 gap-2">
              {['bKash Campus Gateway', 'Nagad Direct', 'City Bank Escrow Deposit', 'Student Excess Balance'].map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => settleMutation.mutate(ch)}
                  disabled={settleMutation.isPending}
                  className="p-3 bg-surface hover:border-primary border border-border rounded-xl text-left text-xs font-semibold text-text transition-all hover:bg-primary/5 flex items-center justify-between"
                >
                  <span>{ch}</span>
                  <Check className="w-4 h-4 text-emerald-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Section Swap Modal */}
      <Modal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        title={`Swap Section: ${swapTargetCourse?.title || ''}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-muted">
            Swapping sections preserves your enrolled course slot without dropping. The system validates seating quotas in the target section before finalizing.
          </p>

          <div className="space-y-2">
            <label className="font-semibold text-text">Available Target Sections:</label>
            <div className="space-y-2">
              {swapTargetCourse?.sections
                ?.filter((s) => s.id !== currentSectionId)
                ?.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setNewSectionId(sec.id)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      newSectionId === sec.id
                        ? 'border-primary bg-primary/10 text-primary font-bold'
                        : 'border-border bg-surface text-text hover:border-primary/40'
                    }`}
                  >
                    <div>
                      <span className="font-bold">{sec.sectionName}</span> — {sec.instructor}
                      <p className="text-[11px] text-text-muted font-normal">{sec.schedule} • {sec.room}</p>
                    </div>
                    <Badge tone={sec.availableSeats > 0 ? 'success' : 'danger'}>
                      {sec.availableSeats} Available
                    </Badge>
                  </button>
                ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsSwapModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!newSectionId || swapMutation.isPending}
              loading={swapMutation.isPending}
              onClick={() => swapMutation.mutate()}
            >
              Confirm Section Swap
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reassign Teacher Modal */}
      <Modal
        isOpen={isInstructorReassignModalOpen}
        onClose={() => setIsInstructorReassignModalOpen(false)}
        title={`Reassign Instructor: ${reassignSection?.sectionName}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-muted">
            Course: <span className="font-bold text-text">{reassignCourse?.code} — {reassignCourse?.title}</span>
          </p>
          <FormField label="Assigned Faculty Instructor Name">
            <Input
              value={newInstructorName}
              onChange={(e) => setNewInstructorName(e.target.value)}
              placeholder="e.g. Prof. Dr. Sarah Connor"
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsInstructorReassignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!newInstructorName || reassignMutation.isPending}
              loading={reassignMutation.isPending}
              onClick={() => reassignMutation.mutate()}
            >
              Save Reassignment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Split Section Modal */}
      <Modal
        isOpen={isSplitSectionModalOpen}
        onClose={() => setIsSplitSectionModalOpen(false)}
        title={`Split Section: ${splitSectionTarget?.sectionName}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-muted">
            Splits an oversubscribed section to create an additional subsection with dedicated seat quota.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="New Section Designation">
              <Input
                value={newSplitSectionName}
                onChange={(e) => setNewSplitSectionName(e.target.value)}
              />
            </FormField>
            <FormField label="Allocated Seat Quota">
              <Input
                type="number"
                value={newSplitSeats}
                onChange={(e) => setNewSplitSeats(e.target.value)}
              />
            </FormField>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsSplitSectionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!newSplitSectionName || splitMutation.isPending}
              loading={splitMutation.isPending}
              onClick={() => splitMutation.mutate()}
            >
              Execute Section Split
            </Button>
          </div>
        </div>
      </Modal>

      {/* Printable Barcoded Fee Demand Slip Modal */}
      <Modal
        isOpen={isChallanModalOpen}
        onClose={() => setIsChallanModalOpen(false)}
        title="Official Advising Demand Note & Bank Challan"
      >
        <div className="space-y-4 p-4 bg-white text-zinc-900 rounded-xl print:m-0 print:p-0">
          <div className="border-b-2 border-zinc-900 pb-3 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-black tracking-tight uppercase">Hostel Pro-ERP University System</h2>
              <p className="text-xs text-zinc-600">Office of the Registrar & Financial Comptroller</p>
              <p className="text-[11px] font-mono text-zinc-500 mt-1">SEMESTER: Fall 2026 • ADVISING CHALLAN</p>
            </div>
            <div className="text-right">
              <div className="w-12 h-12 bg-zinc-900 text-white rounded flex items-center justify-center font-bold text-xs">
                QR CODE
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs border-b border-zinc-200 pb-3">
            <div>
              <p className="text-zinc-500">Student Name:</p>
              <p className="font-bold">{advisingRecord?.studentName || 'Marcus Chen'}</p>
              <p className="text-zinc-500 mt-1">Roll / ID:</p>
              <p className="font-mono font-bold">{advisingRecord?.rollNumber || 'STU-2026001'}</p>
            </div>
            <div>
              <p className="text-zinc-500">Degree Program:</p>
              <p className="font-bold">MBBS (Batch 2026)</p>
              <p className="text-zinc-500 mt-1">Challan Ref:</p>
              <p className="font-mono font-bold">CHL-2026-F-{advisingRecord?.rollNumber?.slice(-4) || '1001'}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between font-bold border-b border-zinc-300 pb-1">
              <span>Billing Head</span>
              <span>Amount (BDT ৳)</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span>Net Course Tuition ({financialComputation.totalCredits} Credits):</span>
              <span className="font-mono">৳{financialComputation.netTuition.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span>Institutional Advising Fee:</span>
              <span className="font-mono">৳{financialComputation.advisingFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span>Laboratory & Clinical Practicum Fee:</span>
              <span className="font-mono">৳{financialComputation.labFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span>Campus Infrastructure Levy:</span>
              <span className="font-mono">৳{financialComputation.developmentFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span>Healthcare & Infirmary Coverage:</span>
              <span className="font-mono">৳{financialComputation.medicalCoverageFee.toLocaleString()}</span>
            </div>
            {financialComputation.lateAdvisingFine > 0 && (
              <div className="flex justify-between py-0.5 text-amber-700 font-semibold">
                <span>Late Advising Penalty:</span>
                <span className="font-mono">+৳{financialComputation.lateAdvisingFine.toLocaleString()}</span>
              </div>
            )}
            {financialComputation.lateTuitionFine > 0 && (
              <div className="flex justify-between py-0.5 text-red-700 font-semibold">
                <span>Late Payment Surcharge:</span>
                <span className="font-mono">+৳{financialComputation.lateTuitionFine.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-sm border-t-2 border-zinc-900 pt-2 mt-2">
              <span>Total Payable Amount:</span>
              <span className="font-mono">৳{financialComputation.grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-dashed border-zinc-400 flex items-center justify-between text-[10px] text-zinc-500">
            <span>Authorized Signature: Bursar Office</span>
            <span>Bank Copy / Student Copy Dual Ledger</span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsChallanModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={() => window.print()} className="flex items-center gap-1.5">
              <Printer className="w-3.5 h-3.5" /> Print Challan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
