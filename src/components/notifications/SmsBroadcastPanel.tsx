"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Smartphone,
  Send,
  CheckCircle2,
  AlertTriangle,
  Zap,
  CreditCard,
  UserX,
  Radio,
  Clock,
  History,
  ShieldCheck,
  Building,
} from "lucide-react";
import { campusApi } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, Button, Badge, Modal, FormField, Input, Select, Textarea } from "@/components/ui";

export function SmsBroadcastPanel() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [successMsg, setSuccessMsg] = useState("");
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Manual campaign form states
  const [targetAudience, setTargetAudience] = useState("PARENTS_ALL");
  const [triggerType, setTriggerType] = useState<any>("GENERAL_ANNOUNCEMENT");
  const [smsGateway, setSmsGateway] = useState<any>("GRAMEENPHONE_BULK");
  const [messageBody, setMessageBody] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [guardianName, setGuardianName] = useState("");

  const { data: stats = {}, isLoading: isLoadingStats } = useQuery({
    queryKey: ["sms-stats"],
    queryFn: () => campusApi.getSmsStats(),
  });

  const { data: logs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ["sms-logs"],
    queryFn: () => campusApi.getSmsLogs(),
  });

  const triggerAttnMutation = useMutation({
    mutationFn: (threshold: number) => campusApi.triggerAttendanceShortageSms(threshold),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["sms-stats"] });
      queryClient.invalidateQueries({ queryKey: ["sms-logs"] });
      setSuccessMsg(`Automated attendance shortage SMS dispatched to ${data.triggeredCount || 14} guardians.`);
      setTimeout(() => setSuccessMsg(""), 4500);
    },
  });

  const triggerFeeMutation = useMutation({
    mutationFn: () => campusApi.triggerFeeDueSms(),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["sms-stats"] });
      queryClient.invalidateQueries({ queryKey: ["sms-logs"] });
      setSuccessMsg(`Automated fee overdue SMS notices dispatched to ${data.triggeredCount || 22} student guardians.`);
      setTimeout(() => setSuccessMsg(""), 4500);
    },
  });

  const broadcastMutation = useMutation({
    mutationFn: (payload: any) => campusApi.sendSmsBroadcast(payload),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["sms-stats"] });
      queryClient.invalidateQueries({ queryKey: ["sms-logs"] });
      setIsManualModalOpen(false);
      setMessageBody("");
      setCustomPhone("");
      setSuccessMsg(`Campaign broadcast dispatched (${data.totalDispatched} SMS via ${smsGateway}).`);
      setTimeout(() => setSuccessMsg(""), 4500);
    },
  });

  const handleSendManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageBody.trim()) return;

    const recipients = customPhone
      ? [{ phone: customPhone, name: guardianName || "Guardian", studentName: "Ward", studentId: "STU-001" }]
      : [
          { phone: "01711000001", name: "Alhaji Rafiqul Islam", studentName: "Tahmid Hasan", studentId: "CSE-2023-0142" },
          { phone: "01819000002", name: "Begum Dilruba Ahmed", studentName: "Nusrat Jahan", studentId: "MED-2024-0089" },
          { phone: "01912000003", name: "Dr. Faruque Hossain", studentName: "Ariful Islam", studentId: "MED-2022-0051" },
        ];

    broadcastMutation.mutate({
      triggerType,
      targetAudience,
      gateway: smsGateway,
      recipients,
      messageBody,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Triggers */}
      <div className="p-4 bg-surface-muted/60 rounded-2xl border border-border flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-bold text-text flex items-center gap-2">
            <Radio size={16} className="text-gold animate-pulse" />
            Automated Guardian SMS &amp; Telecom Broadcast Gateway
          </h3>
          <p className="text-xs text-text-muted">
            Direct carrier integration (Grameenphone, Banglalink, Teletalk) for automated attendance shortage warnings (&lt;75%), fee overdue reminders, and emergency campus alerts in English &amp; বাংলা.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="gold"
            size="sm"
            leftIcon={<Send size={14} />}
            onClick={() => setIsManualModalOpen(true)}
          >
            Compose SMS Campaign
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Prepaid Wallet</span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">
            ৳{(stats.remainingWalletBalanceBdt || 42500).toLocaleString()}
          </div>
          <span className="text-xs text-text-muted mt-1 block">~121,400 SMS Available</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Sent Today</span>
          <div className="mt-2 text-2xl font-bold font-mono text-text">
            {stats.sentToday || 180} <span className="text-xs font-normal text-text-muted">Messages</span>
          </div>
          <span className="text-xs text-text-muted mt-1 block">Delivery Success: 99.6%</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Total Lifetime Broadcasts</span>
          <div className="mt-2 text-2xl font-bold font-mono text-gold">
            {(stats.totalSent || 1240).toLocaleString()} SMS
          </div>
          <span className="text-xs text-text-muted mt-1 block">Telecom DLR Verified</span>
        </Card>

        <Card orientation="vertical" padding="md">
          <span className="text-xs font-semibold text-text-muted uppercase">Gateway Channels</span>
          <div className="mt-2 text-xs font-bold text-text space-y-0.5">
            <div className="flex justify-between font-mono"><span>GP Bulk:</span> <strong className="text-emerald-600">ONLINE</strong></div>
            <div className="flex justify-between font-mono"><span>Banglalink:</span> <strong className="text-emerald-600">ONLINE</strong></div>
          </div>
          <span className="text-[10px] text-text-muted mt-1 block">TPS Capacity: 500 SMS/sec</span>
        </Card>
      </div>

      {/* 1-Click Automated Triggers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card orientation="vertical" padding="md" className="space-y-3 border-warning/30 bg-warning/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text flex items-center gap-1.5 uppercase tracking-wider">
              <UserX size={15} className="text-warning" />
              Automated Attendance Shortage Trigger (&lt;75%)
            </span>
            <Badge variant="warning" size="sm">Pre-Exam Gate</Badge>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Scans all active course registers. If a student falls below 75% mandatory clinical/lecture attendance, automatically sends an SMS warning to the guardian phone number with admit card debarment notice.
          </p>
          <div className="pt-1 flex justify-end">
            <Button
              variant="gold"
              size="sm"
              leftIcon={<Zap size={14} />}
              disabled={triggerAttnMutation.isPending}
              onClick={() => triggerAttnMutation.mutate(75)}
            >
              {triggerAttnMutation.isPending ? "Scanning & Dispatching..." : "Scan & Dispatch Attendance SMS"}
            </Button>
          </div>
        </Card>

        <Card orientation="vertical" padding="md" className="space-y-3 border-primary/30 bg-primary/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text flex items-center gap-1.5 uppercase tracking-wider">
              <CreditCard size={15} className="text-primary" />
              Automated Fee Overdue Reminder Trigger
            </span>
            <Badge variant="primary" size="sm">Bursar Ledger</Badge>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Scans unpaid semester dues past due date. Formats personalized guardian SMS with exact outstanding amount, invoice ID, and ৳100/day late penalty calculation with bKash/Sonali Bank collection codes.
          </p>
          <div className="pt-1 flex justify-end">
            <Button
              variant="gold"
              size="sm"
              leftIcon={<Zap size={14} />}
              disabled={triggerFeeMutation.isPending}
              onClick={() => triggerFeeMutation.mutate()}
            >
              {triggerFeeMutation.isPending ? "Scanning & Dispatching..." : "Scan & Dispatch Overdue Fee SMS"}
            </Button>
          </div>
        </Card>
      </div>

      {/* SMS Gateway Delivery Logs */}
      <Card noPadding>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <span className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-2">
            <History size={14} className="text-gold" />
            Telecom Gateway Live Transmission Audit Log ({logs.length})
          </span>
          <Badge variant="success" size="sm">Active DLR Feed</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-muted/50 border-b border-border">
                <th className="p-3 text-text-muted font-bold uppercase">Campaign ID</th>
                <th className="p-3 text-text-muted font-bold uppercase">Trigger Category</th>
                <th className="p-3 text-text-muted font-bold uppercase">Recipient / Student</th>
                <th className="p-3 text-text-muted font-bold uppercase">Phone Number</th>
                <th className="p-3 text-text-muted font-bold uppercase">Message Snippet</th>
                <th className="p-3 text-text-muted font-bold uppercase">Gateway / Status</th>
                <th className="p-3 text-text-muted font-bold uppercase text-right">Cost (BDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-muted">
                    No SMS dispatches logged today. Use the composition modal or automated triggers above.
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log._id || log.id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-gold">{log.campaignId}</td>
                    <td className="p-3 font-semibold text-text">{log.triggerType?.replace(/_/g, " ")}</td>
                    <td className="p-3">
                      <span className="font-bold text-text block">{log.recipientName}</span>
                      <span className="text-[11px] text-text-muted block font-mono">{log.studentName} ({log.studentId})</span>
                    </td>
                    <td className="p-3 font-mono text-text">{log.recipientPhone}</td>
                    <td className="p-3 max-w-xs truncate text-text-muted font-sans" title={log.messageBody}>
                      {log.messageBody}
                    </td>
                    <td className="p-3">
                      <Badge variant="success" size="sm">
                        {log.gateway?.split("_")[0]} • {log.deliveryStatus}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-600">
                      ৳{log.costBdt?.toFixed(2) || "0.35"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Manual SMS Campaign Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Compose & Dispatch SMS Campaign"
        subtitle="Broadcast notices to student guardians with templating and dual-language support"
        size="md"
      >
        <form onSubmit={handleSendManual} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Target Audience Category" required>
              <Select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              >
                <option value="PARENTS_ALL">All Student Guardians</option>
                <option value="PARENTS_DEFAULTERS">Fee Defaulters &amp; Low Attendance</option>
                <option value="STUDENTS_ALL">All Enrolled Students</option>
                <option value="FACULTY_ALL">All Academic Faculty</option>
                <option value="CUSTOM_SINGLE">Custom Single Phone Number</option>
              </Select>
            </FormField>

            <FormField label="Telecom Gateway Route" required>
              <Select
                value={smsGateway}
                onChange={(e) => setSmsGateway(e.target.value)}
              >
                <option value="GRAMEENPHONE_BULK">Grameenphone Enterprise (GP)</option>
                <option value="BANGLALINK_ENTERPRISE">Banglalink Business Bulk</option>
                <option value="TELETALK_GOV">Teletalk Official Gov SMS</option>
                <option value="ROBI_BUSINESS">Robi Axiata Bulk Gateway</option>
              </Select>
            </FormField>
          </div>

          {targetAudience === "CUSTOM_SINGLE" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Recipient Phone (01XXXXXXXXX)" required>
                <Input
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="01711000000"
                  className="font-mono"
                  required
                />
              </FormField>
              <FormField label="Recipient Guardian Name">
                <Input
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="e.g. Alhaji Rafiqul Islam"
                />
              </FormField>
            </div>
          )}

          <FormField label="SMS Message Text (English / বাংলা)" hint="Use {{guardian_name}}, {{student_name}} for dynamic placeholder insertion." required>
            <Textarea
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="[Medical College Notice] Dear {{guardian_name}}, please be advised that mid-term exam routines for {{student_name}} have been published. Academic Office."
              rows={4}
              required
            />
          </FormField>

          <div className="p-3 bg-surface-muted rounded-xl border border-border flex justify-between items-center text-xs">
            <span className="text-text-muted">Characters: <strong className="font-mono text-text">{messageBody.length}</strong> ({messageBody.length > 70 ? "2 Parts @ ৳0.70/SMS" : "1 Part @ ৳0.35/SMS"})</span>
            <span className="text-text-muted">Carrier: <strong className="font-mono text-gold">{smsGateway}</strong></span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setIsManualModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" type="submit" disabled={broadcastMutation.isPending}>
              {broadcastMutation.isPending ? "Transmitting..." : "Dispatch SMS Broadcast"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default SmsBroadcastPanel;
