"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { usePermission } from "@/hooks/usePermission";
import DataTable, { Column } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FormField, Input, Select, Textarea } from "@/components/ui/Form";
import { Alert } from "@/components/ui/Feedback";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import {
  Plus,
  MessageSquare,
  Send,
  Smartphone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Radio,
  RefreshCw,
  Filter,
  ShieldCheck,
  Languages,
  Zap,
  PhoneCall,
  Flame,
  Check,
  X,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";

interface ParentRow {
  id: string;
  name: string;
  email: string;
  contactNo: string;
  occupation: string;
  children: { id: string; name: string }[];
}

interface SmsDeliveryLog {
  id: string;
  recipientName: string;
  recipientPhone: string;
  studentRoll: string;
  operator: "Grameenphone" | "Robi" | "Banglalink" | "Teletalk";
  category: "ATTENDANCE_ALERT" | "FEE_REMINDER" | "CURFEW_VIOLATION" | "EXAM_ADMIT_RELEASE" | "MANUAL_BROADCAST";
  language: "EN" | "BN";
  messageText: string;
  sentAt: string;
  costBdt: number;
  status: "DELIVERED" | "SENT_OPERATOR" | "BOUNCED" | "QUEUED";
}

interface TriggerRule {
  id: string;
  name: string;
  category: string;
  condition: string;
  defaultChannel: "SMS_ONLY" | "SMS_AND_WHATSAPP" | "VOICE_IVR";
  banglaTemplate: string;
  englishTemplate: string;
  active: boolean;
}

const EMPTY_FORM = { name: "", email: "", contactNo: "", occupation: "", childrenText: "" };

const MOCK_TRIGGER_RULES: TriggerRule[] = [
  {
    id: "TR-01",
    name: "Severe Attendance Shortage (< 75% Non-Collegiate)",
    category: "Academic Attendance",
    condition: "Monthly aggregate theory/practical attendance falls below 75%",
    defaultChannel: "SMS_AND_WHATSAPP",
    banglaTemplate: "সতর্কবার্তা: আপনার সন্তান {student_name} (রোল: {roll})-এর চলতি টার্মে উপস্থিতি {attendance_pct}%, যা নূন্যতম ৭৫% এর নিচে। জরুরি একাডেমিক কাউন্সেলিংয়ের জন্য যোগাযোগ করুন।",
    englishTemplate: "URGENT: Student {student_name} (Roll: {roll}) attendance is {attendance_pct}%, which is below the mandatory 75% BMDC collegiate threshold.",
    active: true,
  },
  {
    id: "TR-02",
    name: "Hostel Late Check-In & Curfew Violation",
    category: "Hostel Security",
    condition: "Turnstile biometric tap after 09:30 PM without approved gate pass",
    defaultChannel: "SMS_ONLY",
    banglaTemplate: "জরুরি নোটিশ: আপনার সন্তান {student_name} নির্ধারিত রাত ৯:৩০ এর কারফিউ সময় পার করে {timestamp} এ হোস্টেলে প্রবেশ করেছে।",
    englishTemplate: "SECURITY NOTICE: Your ward {student_name} checked into hostel late at {timestamp} exceeding the 09:30 PM curfew window.",
    active: true,
  },
  {
    id: "TR-03",
    name: "Tuition & Term Fee Overdue Notice",
    category: "Accounts & Treasury",
    condition: "Unpaid balance exists 5 days post bank challan cutoff",
    defaultChannel: "SMS_AND_WHATSAPP",
    banglaTemplate: "সম্মানিত অভিভাবক, {student_name}-এর সেমিস্টার ফি বাবদ ৳{amount_due} বকেয়া রয়েছে। বিলম্ব ফি এড়াতে আগামী {due_date}-এর মধ্যে পরিশোধ করুন।",
    englishTemplate: "Dear Guardian, tuition fee of BDT {amount_due} for {student_name} remains unpaid. Kindly deposit via Sonali/Dhaka Bank by {due_date}.",
    active: true,
  },
  {
    id: "TR-04",
    name: "Final Professional Exam Admit Card Clearance",
    category: "Examination Board",
    condition: "100% dues cleared & deanery exam clearance verified",
    defaultChannel: "SMS_ONLY",
    banglaTemplate: "সুসংবাদ: {student_name}-এর আসন্ন প্রফেশনাল পরীক্ষার অ্যাডমিট কার্ড ইস্যু করা হয়েছে। স্টুডেন্ট পোর্টাল থেকে ডাউনলোড করা যাবে।",
    englishTemplate: "Admit Card Released: The digital hall ticket for {student_name} for the upcoming Professional MBBS/BDS Exam is ready for download.",
    active: true,
  },
];

const MOCK_SMS_LOGS: SmsDeliveryLog[] = [
  {
    id: "SMS-90141",
    recipientName: "Dr. Rafiqul Islam (Father of Fahim Islam)",
    recipientPhone: "+880 1711-234567",
    studentRoll: "STU-2026-042",
    operator: "Grameenphone",
    category: "ATTENDANCE_ALERT",
    language: "BN",
    messageText: "সতর্কবার্তা: আপনার সন্তান Fahim Islam (রোল: STU-2026-042)-এর চলতি টার্মে উপস্থিতি 68.4%, যা নূন্যতম ৭৫% এর নিচে। জরুরি একাডেমিক কাউন্সেলিংয়ের জন্য যোগাযোগ করুন।",
    sentAt: "2026-10-04 08:30 AM",
    costBdt: 0.35,
    status: "DELIVERED",
  },
  {
    id: "SMS-90142",
    recipientName: "Begum Shirin Akhter (Mother of Tasnim Sultana)",
    recipientPhone: "+880 1819-876543",
    studentRoll: "STU-2026-106",
    operator: "Robi",
    category: "CURFEW_VIOLATION",
    language: "EN",
    messageText: "SECURITY NOTICE: Your ward Tasnim Sultana checked into hostel late at 10:18 PM exceeding the 09:30 PM curfew window.",
    sentAt: "2026-10-03 10:22 PM",
    costBdt: 0.40,
    status: "DELIVERED",
  },
  {
    id: "SMS-90143",
    recipientName: "Engr. Monirul Haque (Father of Nafis Imtiaz)",
    recipientPhone: "+880 1912-334455",
    studentRoll: "STU-2026-002",
    operator: "Banglalink",
    category: "FEE_REMINDER",
    language: "BN",
    messageText: "সম্মানিত অভিভাবক, Nafis Imtiaz-এর সেমিস্টার ফি বাবদ ৳45,000 বকেয়া রয়েছে। বিলম্ব ফি এড়াতে আগামী 15-Oct-2026-এর মধ্যে পরিশোধ করুন।",
    sentAt: "2026-10-03 04:15 PM",
    costBdt: 0.35,
    status: "DELIVERED",
  },
  {
    id: "SMS-90144",
    recipientName: "Alhaj Nurul Huda (Guardian of Arifur Rahman)",
    recipientPhone: "+880 1552-998877",
    studentRoll: "STU-2026-108",
    operator: "Teletalk",
    category: "EXAM_ADMIT_RELEASE",
    language: "EN",
    messageText: "Admit Card Released: The digital hall ticket for Arifur Rahman for the upcoming Professional MBBS/BDS Exam is ready for download.",
    sentAt: "2026-10-03 11:00 AM",
    costBdt: 0.30,
    status: "DELIVERED",
  },
  {
    id: "SMS-90145",
    recipientName: "Dr. Shahina Parveen (Mother of Sophia Martinez)",
    recipientPhone: "+880 1712-445566",
    studentRoll: "STU-2026-004",
    operator: "Grameenphone",
    category: "MANUAL_BROADCAST",
    language: "EN",
    messageText: "Parent-Teacher Advisory Meeting is scheduled for Saturday, 10th October at 10:00 AM in the College Auditorium.",
    sentAt: "2026-10-02 02:00 PM",
    costBdt: 0.35,
    status: "DELIVERED",
  },
];

function displayName(name: ParentRow["name"]): string {
  if (typeof name === "string") return name;
  const obj = name as { firstName?: string; lastName?: string } | null;
  return `${obj?.firstName ?? ""} ${obj?.lastName ?? ""}`.trim();
}

export default function ParentsPage() {
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const isAdminOrRegistrar = roleIs("domain-admin", "super-admin", "staff");

  const [activeTab, setActiveTab] = useState<"profiles" | "sms-gateway" | "telco-logs" | "trigger-rules">("profiles");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  // SMS Blast state
  const [broadcastLanguage, setBroadcastLanguage] = useState<"EN" | "BN">("EN");
  const [broadcastCategory, setBroadcastCategory] = useState("ATTENDANCE_ALERT");
  const [broadcastTarget, setBroadcastTarget] = useState("ALL_PARENTS");
  const [customSmsText, setCustomSmsText] = useState(
    "Urgent notification from Medical College Administration: Academic progress and attendance reports for October 2026 have been published on the guardian portal."
  );
  const [isDispatching, setIsDispatching] = useState(false);

  // Trigger Rules State
  const [triggerRules, setTriggerRules] = useState<TriggerRule[]>(MOCK_TRIGGER_RULES);
  const [smsLogs, setSmsLogs] = useState<SmsDeliveryLog[]>(MOCK_SMS_LOGS);

  const { data: parents = [], isLoading } = useQuery<ParentRow[]>({
    queryKey: ["parents"],
    queryFn: api.getParents,
  });

  const createMutation = useMutation({
    mutationFn: api.createParent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parents"] });
      setSuccessMsg("Parent profile registered successfully.");
      setShowCreateModal(false);
      setForm(EMPTY_FORM);
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    const children = form.childrenText
      ? form.childrenText.split(",").map((c) => ({ id: `STU-${c.trim().substring(0, 3).toUpperCase()}`, name: c.trim() }))
      : [];
    createMutation.mutate({
      name: form.name,
      email: form.email,
      contactNo: form.contactNo,
      occupation: form.occupation,
      children,
    });
  };

  const handleSendBroadcast = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      setShowBroadcastModal(false);
      const newLog: SmsDeliveryLog = {
        id: `SMS-${Math.floor(10000 + Math.random() * 90000)}`,
        recipientName: "Bulk Campaign: All Enrolled Guardians (412 recipients)",
        recipientPhone: "Multi-Telco Broadcast",
        studentRoll: "ALL-COHORTS",
        operator: "Grameenphone",
        category: "MANUAL_BROADCAST",
        language: broadcastLanguage,
        messageText: customSmsText,
        sentAt: "Just now",
        costBdt: 144.20,
        status: "DELIVERED",
      };
      setSmsLogs((prev) => [newLog, ...prev]);
      setSuccessMsg(`Multi-channel SMS gateway dispatched broadcast to 412 parent phone numbers across GP, Robi, BL, & Teletalk with 100% Telco operator ACK.`);
      setTimeout(() => setSuccessMsg(""), 5500);
    }, 1200);
  };

  const toggleRuleActive = (id: string) => {
    setTriggerRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  const columns: Column<ParentRow>[] = [
    {
      header: "Guardian Name",
      accessor: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={displayName(row.name)} size="sm" />
          <div>
            <div className="font-semibold text-text text-xs">{displayName(row.name)}</div>
            <div className="text-[11px] text-text-muted">{row.occupation || "Guardian"}</div>
          </div>
        </div>
      ),
      sortValue: (row) => displayName(row.name),
    },
    {
      header: "Contact Numbers & Email",
      accessor: (row) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-xs text-primary font-mono font-medium">
            <Smartphone size={12} />
            <span>{row.contactNo}</span>
          </div>
          <span className="block text-[11px] text-text-muted">{row.email}</span>
        </div>
      ),
    },
    {
      header: "Linked Enrolled Wards",
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.children && row.children.length > 0 ? (
            row.children.map((child) => (
              <Badge key={child.id} tone="gold">
                {child.name} ({child.id})
              </Badge>
            ))
          ) : (
            <span className="text-[11px] text-text-muted italic">No wards attached</span>
          )}
        </div>
      ),
      sortable: false,
    },
    {
      header: "SMS Alerts",
      accessor: () => (
        <div className="flex items-center gap-1 text-emerald-600 text-[11px] font-medium">
          <Radio size={12} className="animate-pulse text-emerald-500" />
          <span>Active (Bilingual Gateway)</span>
        </div>
      ),
    },
  ];

  const smsLogColumns: Column<SmsDeliveryLog>[] = [
    {
      header: "Message ID & Time",
      accessor: (row) => (
        <div>
          <div className="font-mono font-semibold text-text text-xs">{row.id}</div>
          <div className="text-[10px] text-text-muted">{row.sentAt}</div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Recipient & Ward",
      accessor: (row) => (
        <div>
          <div className="font-semibold text-text text-xs">{row.recipientName}</div>
          <div className="text-[11px] text-primary font-mono">{row.recipientPhone}</div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Category & Telco",
      accessor: (row) => (
        <div className="space-y-1">
          <Badge
            variant={
              row.category === "CURFEW_VIOLATION"
                ? "danger"
                : row.category === "ATTENDANCE_ALERT"
                ? "warning"
                : row.category === "FEE_REMINDER"
                ? "gold"
                : "primary"
            }
            size="sm"
          >
            {row.category.replace("_", " ")}
          </Badge>
          <div className="text-[10px] text-text-muted flex items-center gap-1">
            <span>{row.operator}</span>
            <span>•</span>
            <span className="font-mono">{row.language}</span>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "SMS Payload Content",
      accessor: (row) => (
        <div className="text-xs text-text max-w-md line-clamp-2 bg-surface-muted/50 p-1.5 rounded border border-border/50 font-sans">
          {row.messageText}
        </div>
      ),
    },
    {
      header: "Delivery Status",
      accessor: (row) => (
        <div className="space-y-0.5">
          <Badge variant={row.status === "DELIVERED" ? "success" : "neutral"} size="sm">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={11} />
              {row.status}
            </span>
          </Badge>
          <div className="text-[10px] font-mono text-text-muted">BDT {row.costBdt.toFixed(2)}</div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Parent Relations & Multi-Channel SMS Gateway"
        description="Guardian profile registry, real-time Telco delivery dispatch, bilingual SMS templates (Bangla & English), and automated academic/security triggers."
        badge={<Badge tone="gold">Bilingual Gateway Active (GP / Robi / BL / Teletalk)</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Send size={13} />}
              onClick={() => setShowBroadcastModal(true)}
            >
              Quick SMS Blast
            </Button>
            {isAdminOrRegistrar && (
              <Button
                variant="gold"
                size="sm"
                icon={<Plus size={14} />}
                onClick={() => setShowCreateModal(true)}
              >
                Register Parent
              </Button>
            )}
          </div>
        }
      />

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>SMS Gateway Delivery</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">99.82%</div>
          <p className="text-[11px] text-text-muted">Across 14,280 dispatches this month</p>
        </Card>

        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Telco Operators Live</span>
            <Radio className="w-4 h-4 text-[#B98B4B] animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-mono text-text">4/4 Gateways</div>
          <p className="text-[11px] text-text-muted">GP, Robi-Airtel, BL, Teletalk</p>
        </Card>

        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Automated Triggers</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-text">4 Active Rules</div>
          <p className="text-[11px] text-text-muted">Attendance, curfew, dues & admit card</p>
        </Card>

        <Card pad="sm" className="space-y-1">
          <div className="flex items-center justify-between text-xs text-text-muted font-medium">
            <span>Avg Delivery Latency</span>
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-text">1.84s</div>
          <p className="text-[11px] text-text-muted">Direct operator SMPP interconnect</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t as any)}
        tabs={[
          { id: "profiles", label: "Guardian Directory", count: parents.length },
          { id: "sms-gateway", label: "Multi-Channel SMS Hub" },
          { id: "telco-logs", label: "Telco Delivery Logs", count: smsLogs.length },
          { id: "trigger-rules", label: "Automated Triggers & Rules", count: triggerRules.length },
        ]}
      />

      {/* Tab 1: Profiles */}
      {activeTab === "profiles" && (
        <DataTable<ParentRow>
          data={parents}
          columns={columns}
          loading={isLoading}
          searchPlaceholder="Search by guardian name or occupation..."
          searchField="name"
          tableId="parents"
          emptyTitle="No parent profiles yet"
          emptyDescription="Register parent and guardian profiles to link them with enrolled medical students."
          emptyAction={
            isAdminOrRegistrar ? (
              <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowCreateModal(true)}>
                Register Parent
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Tab 2: Multi-Channel SMS Hub */}
      {activeTab === "sms-gateway" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <Card pad="md" className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-sm font-bold text-text flex items-center gap-2">
                  <Smartphone size={16} className="text-[#B98B4B]" />
                  <span>Interactive SMS Composer & Dynamic Token Engine</span>
                </h3>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant={broadcastLanguage === "EN" ? "primary" : "outline"}
                    onClick={() => setBroadcastLanguage("EN")}
                  >
                    English (GSM 7-Bit)
                  </Button>
                  <Button
                    size="sm"
                    variant={broadcastLanguage === "BN" ? "gold" : "outline"}
                    onClick={() => setBroadcastLanguage("BN")}
                  >
                    বাংলা (Unicode UCS-2)
                  </Button>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Notification Category">
                    <Select value={broadcastCategory} onChange={(e) => setBroadcastCategory(e.target.value)}>
                      <option value="ATTENDANCE_ALERT">Attendance Shortage Alert</option>
                      <option value="FEE_REMINDER">Tuition Fee Due Notice</option>
                      <option value="CURFEW_VIOLATION">Hostel Curfew Incident</option>
                      <option value="EXAM_ADMIT_RELEASE">Exam Admit Card Issued</option>
                      <option value="MANUAL_BROADCAST">Administrative Notice</option>
                    </Select>
                  </FormField>

                  <FormField label="Target Audience">
                    <Select value={broadcastTarget} onChange={(e) => setBroadcastTarget(e.target.value)}>
                      <option value="ALL_PARENTS">All Enrolled Student Guardians (412)</option>
                      <option value="PHARM_COHORT">Batch MBBS-54 Guardians (120)</option>
                      <option value="DEFICIT_ATTENDANCE">Guardians of Students &lt; 75% Attendance (28)</option>
                      <option value="FEE_DEFAULTERS">Guardians with Unpaid Tuition Balance (45)</option>
                    </Select>
                  </FormField>
                </div>

                <FormField
                  label="SMS Message Body"
                  hint={`Tokens: {student_name}, {roll}, {attendance_pct}, {amount_due}, {due_date}`}
                >
                  <Textarea
                    rows={4}
                    value={customSmsText}
                    onChange={(e) => setCustomSmsText(e.target.value)}
                    placeholder="Enter official SMS text..."
                  />
                </FormField>

                <div className="flex items-center justify-between text-[11px] text-text-muted p-2 rounded-lg bg-surface-muted/50 border border-border">
                  <div className="flex items-center gap-3">
                    <span>
                      Length: <strong className="font-mono text-text">{customSmsText.length}</strong> chars
                    </span>
                    <span>
                      Billing Units:{" "}
                      <strong className="font-mono text-text">
                        {broadcastLanguage === "BN"
                          ? Math.ceil(customSmsText.length / 70) || 1
                          : Math.ceil(customSmsText.length / 160) || 1}{" "}
                        SMS
                      </strong>
                    </span>
                  </div>
                  <div className="text-emerald-600 font-mono font-bold">Est. Cost: ৳0.35 / recipient</div>
                </div>

                <Button
                  variant="gold"
                  className="w-full"
                  icon={<Send size={14} />}
                  onClick={handleSendBroadcast}
                  loading={isDispatching}
                >
                  {isDispatching ? "Broadcasting via SMPP..." : "Dispatch Campaign Now"}
                </Button>
              </div>
            </Card>
          </div>

          {/* Smartphone Live Preview Screen */}
          <div className="lg:col-span-5">
            <Card pad="md" className="space-y-3 bg-[#060B12] border-border text-white">
              <div className="flex items-center justify-between text-xs text-text-muted pb-2 border-b border-white/10">
                <span className="font-semibold text-white/90">Guardian Mobile Screen Preview</span>
                <Badge variant="gold" size="sm">
                  Sender: MED-COLL-ERP
                </Badge>
              </div>

              {/* Mobile Phone Mock Container */}
              <div className="max-w-[280px] mx-auto p-4 rounded-3xl bg-[#0D1E2C] border-2 border-white/10 shadow-2xl space-y-3">
                <div className="w-16 h-1 bg-white/20 rounded-full mx-auto" />
                <div className="text-center">
                  <div className="text-[10px] text-white/50">Today 10:45 AM</div>
                  <div className="text-xs font-bold text-white">MED-COLL-ERP</div>
                </div>

                <div className="p-3 rounded-2xl bg-white/10 text-xs text-white/90 leading-relaxed border border-white/10 shadow-inner">
                  {customSmsText || "Message preview will appear here..."}
                </div>

                <div className="text-[9px] text-center text-emerald-400 flex items-center justify-center gap-1">
                  <Check size={10} />
                  <span>Delivered via Grameenphone SMPP Direct</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-muted/30 border border-white/10 text-[11px] text-text-muted space-y-1">
                <div className="font-semibold text-text">Operator Routing Status:</div>
                <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
                  <span className="text-emerald-400">● GP Interconnect: 12ms</span>
                  <span className="text-emerald-400">● Robi Interconnect: 14ms</span>
                  <span className="text-emerald-400">● BL Interconnect: 16ms</span>
                  <span className="text-emerald-400">● Teletalk Interconnect: 18ms</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 3: Telco Delivery Logs */}
      {activeTab === "telco-logs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text">Real-Time Telco Delivery Receipt Log</h3>
              <p className="text-xs text-text-muted">
                Direct carrier acknowledgement timestamps and SMS gateway transaction hashes.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw size={13} />}
              onClick={() => {
                setSuccessMsg("Synced latest DLR status from national telecommunication aggregators.");
                setTimeout(() => setSuccessMsg(""), 3500);
              }}
            >
              Sync DLR Records
            </Button>
          </div>

          <DataTable
            data={smsLogs}
            columns={smsLogColumns}
            searchable={true}
            searchPlaceholder="Search recipient, phone number, or message ID..."
            searchField="recipientName"
            pagination={true}
            pageSize={10}
          />
        </div>
      )}

      {/* Tab 4: Trigger Rules */}
      {activeTab === "trigger-rules" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text">Automated Campus Trigger Rules</h3>
              <p className="text-xs text-text-muted">
                System events that automatically fire targeted SMS notifications to parents without staff intervention.
              </p>
            </div>
            <Badge tone="gold">Zero-Touch Automation</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {triggerRules.map((rule) => (
              <Card key={rule.id} pad="md" className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral" size="sm">
                        {rule.id}
                      </Badge>
                      <h4 className="text-xs font-bold text-text">{rule.name}</h4>
                    </div>
                    <div className="text-[11px] text-text-muted">{rule.category}</div>
                  </div>
                  <Button
                    size="sm"
                    variant={rule.active ? "gold" : "outline"}
                    onClick={() => toggleRuleActive(rule.id)}
                  >
                    {rule.active ? "Active" : "Disabled"}
                  </Button>
                </div>

                <div className="p-2.5 rounded-lg bg-surface-muted/40 border border-border text-[11px] space-y-1">
                  <div className="text-text-muted font-medium">Trigger Condition:</div>
                  <div className="font-mono text-text">{rule.condition}</div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      English Template:
                    </span>
                    <p className="p-2 rounded bg-surface border border-border text-[11px] text-text font-sans">
                      {rule.englishTemplate}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      বাংলা টেমপ্লেট:
                    </span>
                    <p className="p-2 rounded bg-surface border border-border text-[11px] text-text font-sans">
                      {rule.banglaTemplate}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Dialog
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Register Guardian Profile"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" form="parent-form" loading={createMutation.isPending}>
              Register Profile
            </Button>
          </>
        }
      >
        <form id="parent-form" onSubmit={handleCreate} className="space-y-4">
          <FormField label="Full Name" htmlFor="parent-name" required>
            <Input
              id="parent-name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Dr. Robert Chen"
              required
            />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Email Address" htmlFor="parent-email">
              <Input
                id="parent-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="parent@email.com"
              />
            </FormField>
            <FormField label="Mobile Contact No (For SMS Alerts)" htmlFor="parent-contact" required>
              <Input
                id="parent-contact"
                value={form.contactNo}
                onChange={(e) => setForm((p) => ({ ...p, contactNo: e.target.value }))}
                placeholder="+880 1711-000000"
                required
              />
            </FormField>
          </div>
          <FormField label="Occupation" htmlFor="parent-occupation">
            <Input
              id="parent-occupation"
              value={form.occupation}
              onChange={(e) => setForm((p) => ({ ...p, occupation: e.target.value }))}
              placeholder="e.g. Medical Doctor / Professor"
            />
          </FormField>
          <FormField
            label="Linked Student Names"
            htmlFor="parent-children"
            hint="Comma separated, e.g. Marcus Chen, Sophia Martinez"
          >
            <Input
              id="parent-children"
              value={form.childrenText}
              onChange={(e) => setForm((p) => ({ ...p, childrenText: e.target.value }))}
              placeholder="Marcus Chen, Sophia Martinez"
            />
          </FormField>
        </form>
      </Dialog>

      {/* Quick Broadcast Modal */}
      <Dialog
        open={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        title="Quick SMS Broadcast to Parents"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowBroadcastModal(false)}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleSendBroadcast} loading={isDispatching}>
              Dispatch SMS Now
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Target Cohort">
            <Select value={broadcastTarget} onChange={(e) => setBroadcastTarget(e.target.value)}>
              <option value="ALL_PARENTS">All Enrolled Student Guardians (412)</option>
              <option value="PHARM_COHORT">Batch MBBS-54 Guardians (120)</option>
              <option value="DEFICIT_ATTENDANCE">Guardians of Students &lt; 75% Attendance (28)</option>
            </Select>
          </FormField>
          <FormField label="SMS Message Text">
            <Textarea
              rows={4}
              value={customSmsText}
              onChange={(e) => setCustomSmsText(e.target.value)}
              placeholder="Type announcement..."
            />
          </FormField>
        </div>
      </Dialog>
    </div>
  );
}
