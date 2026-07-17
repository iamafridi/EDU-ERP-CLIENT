"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { motion } from "framer-motion";
import { Settings, User, Building2, Bell, Sun, CheckCircle2, Eye, EyeOff } from "lucide-react";

type TabKey = "profile" | "institution" | "notifications" | "appearance";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "profile", label: "Profile", icon: User },
  { key: "institution", label: "Institution", icon: Building2 },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "appearance", label: "Appearance", icon: Sun },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [successMsg, setSuccessMsg] = useState("");

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const [instName, setInstName] = useState("Medical College");
  const [instCode, setInstCode] = useState("MC-001");
  const [instAddress, setInstAddress] = useState("123 Medical Campus Drive");
  const [instPhone, setInstPhone] = useState("+1-555-0123");
  const [instEmail, setInstEmail] = useState("admin@medicalcollege.edu");

  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleProfileSave = () => {
    showSuccess("Profile updated successfully.");
  };

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) return;
    showSuccess("Password changed successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleInstSave = () => {
    showSuccess("Institution settings saved.");
  };

  const handleNotifSave = () => {
    showSuccess("Notification preferences saved.");
  };

  const btnClass = "h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50 cursor-pointer";
  const inputClass = "w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all";
  const labelClass = "text-xs font-semibold text-slate-500";

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      <div className="flex items-center gap-3">
        <Settings className="text-[#2563EB]" size={24} />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-xs text-slate-400 mt-1">Manage your profile, institution, and preferences.</p>
        </div>
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" /> <span>{successMsg}</span>
        </motion.div>
      )}

      <div className="flex gap-2 flex-wrap">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
                isActive ? "bg-[#2563EB] text-white" : "bg-white border border-[#e1e2ed] text-slate-500 hover:bg-slate-50"
              }`}>
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm max-w-2xl">
        {activeTab === "profile" && (
          <div className="p-6 space-y-5">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2"><User size={16} className="text-[#2563EB]" /> Profile Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </div>
            </div>
            <button onClick={handleProfileSave} className={btnClass}>Save Profile</button>

            <hr className="border-[#e1e2ed]" />
            <h2 className="text-sm font-bold text-slate-800">Change Password</h2>
            <div className="space-y-4">
              <div className="relative space-y-1">
                <label className={labelClass}>Current Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={`${inputClass} pr-10`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
                </div>
              </div>
              <button onClick={handlePasswordChange} disabled={!currentPassword || !newPassword || !confirmPassword} className={btnClass}>Change Password</button>
            </div>
          </div>
        )}

        {activeTab === "institution" && (
          <div className="p-6 space-y-5">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Building2 size={16} className="text-[#2563EB]" /> Institution Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Institution Name</label>
                <input type="text" value={instName} onChange={(e) => setInstName(e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Institution Code</label>
                <input type="text" value={instCode} onChange={(e) => setInstCode(e.target.value)} className={`${inputClass} font-mono`} />
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Address</label>
              <textarea value={instAddress} onChange={(e) => setInstAddress(e.target.value)}
                className="w-full h-20 px-3 py-2 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Phone</label>
                <input type="text" value={instPhone} onChange={(e) => setInstPhone(e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Email</label>
                <input type="email" value={instEmail} onChange={(e) => setInstEmail(e.target.value)} className={inputClass} />
              </div>
            </div>
            <button onClick={handleInstSave} className={btnClass}>Save Settings</button>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="p-6 space-y-5">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Bell size={16} className="text-[#2563EB]" /> Notification Preferences</h2>
            {[
              { label: "Email Notifications", value: emailNotif, set: setEmailNotif },
              { label: "SMS Alerts", value: smsNotif, set: setSmsNotif },
              { label: "Push Notifications", value: pushNotif, set: setPushNotif },
              { label: "Weekly Digest", value: weeklyDigest, set: setWeeklyDigest },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-700">{item.label}</span>
                <button onClick={() => item.set(!item.value)}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${item.value ? "bg-[#2563EB]" : "bg-slate-200"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.value ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            ))}
            <button onClick={handleNotifSave} className={btnClass}>Save Preferences</button>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="p-6 space-y-5">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sun size={16} className="text-[#2563EB]" /> Appearance
            </h2>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-[#e1e2ed]">
              <div>
                <p className="text-sm font-semibold text-slate-700">Light Mode</p>
                <p className="text-xs text-slate-400">Light theme is active</p>
              </div>
              <div className="w-14 h-7 rounded-full bg-slate-200 relative">
                <span className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center">
                  <Sun size={10} className="text-amber-500" />
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400">This application uses a fixed light theme.</p>
          </div>
        )}
      </div>
    </div>
  );
}
