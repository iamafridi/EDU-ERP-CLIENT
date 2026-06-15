"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion } from "framer-motion";
import { 
  Bell, 
  BellRing, 
  Send, 
  CheckCheck, 
  CheckCircle2, 
  Megaphone, 
  Info, 
  AlertTriangle, 
  CreditCard, 
  Shield 
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { 
  PageHeader, 
  Card, 
  Modal, 
  FormField, 
  Input, 
  Select, 
  Textarea, 
  Button, 
  Badge 
} from "@/components/ui";

import { SmsBroadcastPanel } from "@/components/notifications/SmsBroadcastPanel";

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"in-app" | "sms-broadcast">("in-app");
  const [showSendModal, setShowSendModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [sendTitle, setSendTitle] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [sendType, setSendType] = useState("general");
  const [sendRole, setSendRole] = useState("all");

  const isAdmin = roleIs("domain-admin", "super-admin");

  const { data: notifications = [], isLoading } = useQuery<any[]>({
    queryKey: ["notifications"],
    queryFn: api.getNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: api.markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: api.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setSuccessMsg("All notifications marked as read.");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const sendMutation = useMutation({
    mutationFn: api.sendNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setSuccessMsg("Notification broadcast sent successfully.");
      setShowSendModal(false);
      setSendTitle(""); 
      setSendMessage(""); 
      setSendType("general"); 
      setSendRole("all");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendTitle || !sendMessage) return;
    sendMutation.mutate({
      title: sendTitle,
      message: sendMessage,
      type: sendType,
      recipientRole: sendRole,
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "fee": return <CreditCard size={16} className="text-amber-500" />;
      case "maintenance": return <AlertTriangle size={16} className="text-orange-500" />;
      case "academic": return <Info size={16} className="text-blue-500" />;
      case "security": return <Shield size={16} className="text-red-500" />;
      default: return <Bell size={16} className="text-gold" />;
    }
  };

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      <PageHeader
        title="Institutional Notifications"
        subtitle="Campus circulars, automated system advisories, and targeted cohort broadcasts"
        badge={unreadCount > 0 ? `${unreadCount} Unread` : undefined}
        actions={
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllReadMutation.mutate()}
                icon={<CheckCheck size={16} />}
              >
                Mark All Read
              </Button>
            )}
            {isAdmin && (
              <Button
                variant="gold"
                size="sm"
                onClick={() => setShowSendModal(true)}
                icon={<Send size={16} />}
              >
                Send Broadcast
              </Button>
            )}
          </div>
        }
      />

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-px text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('in-app')}
          className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'in-app'
              ? 'border-gold text-gold'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <Bell size={15} />
          In-App Circulars &amp; Advisories ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('sms-broadcast')}
          className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'sms-broadcast'
              ? 'border-gold text-gold'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <Megaphone size={15} />
          Automated Guardian SMS &amp; Telecom Gateway
        </button>
      </div>

      {activeTab === 'sms-broadcast' && <SmsBroadcastPanel />}

      {activeTab === 'in-app' && (
        <>
          {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} orientation="vertical" padding="md" variant="default" className="flex items-start gap-4">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card orientation="vertical" padding="lg" variant="default" className="text-center py-12">
          <Bell size={36} className="text-text-tertiary/40 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-text">No Notifications</h3>
          <p className="text-xs text-text-tertiary mt-1">You are completely up to date with all campus announcements.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif: any) => (
            <Card
              key={notif.id}
              orientation="vertical"
              padding="md"
              variant="default"
              className={`transition-all ${
                notif.isRead 
                  ? "bg-surface" 
                  : "border-gold/30 bg-gold/[0.02] shadow-xs"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-border flex items-center justify-center shrink-0">
                  {getTypeIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-sm flex items-center gap-2 ${notif.isRead ? "font-semibold text-text-secondary" : "font-bold text-text"}`}>
                      {notif.title}
                      {!notif.isRead && (
                        <span className="w-2 h-2 bg-gold rounded-full inline-block" />
                      )}
                    </h3>
                    <span className="text-[11px] text-text-tertiary font-mono shrink-0">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">{notif.message}</p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                    <Badge variant="neutral" size="sm" className="uppercase text-[10px]">
                      {notif.type}
                    </Badge>
                    {!notif.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markReadMutation.mutate(notif.id)}
                        className="text-xs text-gold h-7 px-2"
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      </>
      )}

      {/* Broadcast Modal */}
      <Modal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        title="Dispatch Campus Broadcast"
        description="Deliver real-time notifications to targeted student, faculty, or institutional roles"
        size="md"
      >
        <form onSubmit={handleSend} className="space-y-4">
          <FormField label="Notification Title" required>
            <Input
              type="text"
              value={sendTitle}
              onChange={(e) => setSendTitle(e.target.value)}
              placeholder="e.g. Campus Spring Festival / Fee Due Date"
              required
            />
          </FormField>

          <FormField label="Message Content" required>
            <Textarea
              value={sendMessage}
              onChange={(e) => setSendMessage(e.target.value)}
              placeholder="Write the full broadcast advisory..."
              rows={4}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Broadcast Type">
              <Select
                value={sendType}
                onChange={(e) => setSendType(e.target.value)}
              >
                <option value="general">General Advisory</option>
                <option value="fee">Fee & Bursar Notice</option>
                <option value="academic">Academic & Exams</option>
                <option value="maintenance">Facility Maintenance</option>
                <option value="security">Campus Security</option>
              </Select>
            </FormField>

            <FormField label="Target Cohort">
              <Select
                value={sendRole}
                onChange={(e) => setSendRole(e.target.value)}
              >
                <option value="all">Entire Campus (All)</option>
                <option value="student">Students Only</option>
                <option value="faculty">Faculty Members Only</option>
                <option value="admin">Administrators Only</option>
              </Select>
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSendModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              disabled={sendMutation.isPending}
              icon={<Megaphone size={14} />}
            >
              {sendMutation.isPending ? "Sending..." : "Dispatch Broadcast"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

