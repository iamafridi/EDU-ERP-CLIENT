"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellRing, Send, CheckCheck, CheckCircle2, X, Megaphone, Info, AlertTriangle, CreditCard, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const queryClient = useQueryClient();
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
      setSuccessMsg("Notification sent successfully.");
      setShowSendModal(false);
      setSendTitle(""); setSendMessage(""); setSendType("general"); setSendRole("all");
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
      default: return <Bell size={16} className="text-slate-400" />;
    }
  };

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BellRing className="text-[#2563EB]" />
            Notifications
          </h1>
          <p className="text-xs text-slate-400 mt-1">View and manage system notifications and broadcasts.</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2"
            >
              <CheckCheck size={16} />
              Mark All Read
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setShowSendModal(true)}
              className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-sm shadow-blue-500/10"
            >
              <Send size={16} />
              Send Notification
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#e1e2ed] rounded-xl p-4 flex items-start gap-4">
              <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-[#e1e2ed] rounded-xl p-12 text-center">
          <Bell size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-semibold">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif: any) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white border rounded-xl p-4 flex items-start gap-4 transition-all ${
                notif.isRead ? "border-[#e1e2ed]" : "border-[#2563EB]/30 bg-[#2563EB]/[0.02]"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-[#e1e2ed] flex items-center justify-center shrink-0">
                {getTypeIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-sm ${notif.isRead ? "font-semibold text-slate-600" : "font-bold text-slate-800"}`}>
                    {notif.title}
                    {!notif.isRead && <span className="ml-2 w-2 h-2 bg-[#2563EB] rounded-full inline-block" />}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono font-semibold shrink-0">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[9px] font-bold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {notif.type}
                  </span>
                  {!notif.isRead && (
                    <button
                      onClick={() => markReadMutation.mutate(notif.id)}
                      className="text-[10px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showSendModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#e1e2ed] rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#e1e2ed] bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Send Notification</span>
                <button onClick={() => setShowSendModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSend} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Title</label>
                  <input type="text" value={sendTitle} onChange={(e) => setSendTitle(e.target.value)} placeholder="e.g. Fee Payment Reminder" className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Message</label>
                  <textarea value={sendMessage} onChange={(e) => setSendMessage(e.target.value)} placeholder="Type your notification message..." rows={3} className="w-full px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all resize-none" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Type</label>
                    <select value={sendType} onChange={(e) => setSendType(e.target.value)} className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                      <option value="general">General</option>
                      <option value="fee">Fee</option>
                      <option value="academic">Academic</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="security">Security</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Recipient Role</label>
                    <select value={sendRole} onChange={(e) => setSendRole(e.target.value)} className="w-full h-10 px-2 bg-white border border-[#c3c6d7] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all">
                      <option value="all">All</option>
                      <option value="student">Students</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2ed]">
                  <button type="button" onClick={() => setShowSendModal(false)} className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                  <button type="submit" className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5">
                    <Megaphone size={14} />
                    Send
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
