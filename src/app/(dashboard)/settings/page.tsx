"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { motion } from "framer-motion";
import {
  User,
  Building2,
  Bell,
  Sun,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Save,
  KeyRound,
} from "lucide-react";
import {
  PageHeader,
  Card,
  Tabs,
  FormField,
  Input,
  Textarea,
  Checkbox,
  Button,
  IconButton,
  Badge,
} from "@/components/ui";

type TabKey = "profile" | "institution" | "notifications" | "appearance";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [successMsg, setSuccessMsg] = useState("");

  const [name, setName] = useState(user?.name || "Dr. Administrator");
  const [email, setEmail] = useState(user?.email || "admin@medicalcollege.edu");

  const [instName, setInstName] = useState("Dhaka Central Medical College & Hospital");
  const [instCode, setInstCode] = useState("DCMC-001");
  const [instAddress, setInstAddress] = useState(
    "Plot 14, Sector 7, Uttara Model Town, Dhaka 1230, Bangladesh"
  );
  const [instPhone, setInstPhone] = useState("+880 2 895 1234");
  const [instEmail, setInstEmail] = useState("info@dcmc.edu.bd");

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

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess("Personal profile updated successfully.");
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }
    showSuccess("Security password changed successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleInstSave = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess("Institutional parameters and contact directory saved.");
  };

  const handleNotifSave = () => {
    showSuccess("Notification delivery preferences updated.");
  };

  const tabItems = [
    { id: "profile", label: "Personal Profile", icon: <User size={14} /> },
    { id: "institution", label: "Campus & Institution", icon: <Building2 size={14} /> },
    { id: "notifications", label: "Notifications & Alerts", icon: <Bell size={14} /> },
    { id: "appearance", label: "Design & Appearance", icon: <Sun size={14} /> },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="System & Account Settings"
        subtitle="Manage administrator profile, institutional statutory parameters, alerts, and security credentials."
      />

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs items={tabItems} value={activeTab} onChange={(id) => setActiveTab(id)} />

      {/* Tab Panels */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <Card>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-text flex items-center gap-2">
                    <User size={16} className="text-primary" /> Profile Credentials
                  </h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Your authenticated system identity and correspondence email
                  </p>
                </div>
                <Badge variant="primary" size="sm">
                  {user?.role || "super-admin"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Full Legal Name" required>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </FormField>
                <FormField label="Official Email Address" required>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </FormField>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" icon={<Save size={14} />}>
                  Save Profile
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="border-b border-border pb-3">
                <h2 className="text-sm font-semibold text-text flex items-center gap-2">
                  <Lock size={16} className="text-gold" /> Security & Password
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Update your authentication credentials for institutional security
                </p>
              </div>

              <FormField label="Current Password" required>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password..."
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="New Password" required>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                  />
                </FormField>
                <FormField label="Confirm New Password" required>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                  />
                </FormField>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!currentPassword || !newPassword || !confirmPassword}
                  icon={<KeyRound size={14} />}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {activeTab === "institution" && (
        <Card>
          <form onSubmit={handleInstSave} className="space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm font-semibold text-text flex items-center gap-2">
                <Building2 size={16} className="text-primary" /> Campus Statutory Information
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Official accreditation identity appearing on transcripts, invoices, and certificates
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Institution Name" required>
                <Input
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                  required
                />
              </FormField>
              <FormField label="Statutory Registry Code" required>
                <Input
                  value={instCode}
                  onChange={(e) => setInstCode(e.target.value)}
                  className="font-mono"
                  required
                />
              </FormField>
            </div>

            <FormField label="Campus Address" required>
              <Textarea
                value={instAddress}
                onChange={(e) => setInstAddress(e.target.value)}
                rows={2}
                required
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Official Contact Phone" required>
                <Input
                  value={instPhone}
                  onChange={(e) => setInstPhone(e.target.value)}
                  required
                />
              </FormField>
              <FormField label="Administrative Registrar Email" required>
                <Input
                  type="email"
                  value={instEmail}
                  onChange={(e) => setInstEmail(e.target.value)}
                  required
                />
              </FormField>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" icon={<Save size={14} />}>
                Save Institution Settings
              </Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === "notifications" && (
        <Card>
          <div className="space-y-5">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm font-semibold text-text flex items-center gap-2">
                <Bell size={16} className="text-primary" /> Notification Dispatch Channels
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Control which channels receive fee receipts, incident reports, and grade publications
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <div>
                  <p className="text-sm font-semibold text-text">Email Notifications</p>
                  <p className="text-xs text-text-muted">Receive official academic notices and financial invoices</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailNotif(!emailNotif)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    emailNotif ? "bg-primary" : "bg-surface-muted border border-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-xs transition-transform ${
                      emailNotif ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <div>
                  <p className="text-sm font-semibold text-text">SMS Gateway Alerts</p>
                  <p className="text-xs text-text-muted">Urgent campus emergency alerts and hostel gate security OTPs</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsNotif(!smsNotif)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    smsNotif ? "bg-primary" : "bg-surface-muted border border-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-xs transition-transform ${
                      smsNotif ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <div>
                  <p className="text-sm font-semibold text-text">In-App Push Notifications</p>
                  <p className="text-xs text-text-muted">Real-time alerts in the top portal notification center</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPushNotif(!pushNotif)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    pushNotif ? "bg-primary" : "bg-surface-muted border border-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-xs transition-transform ${
                      pushNotif ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-text">Weekly Governance Digest</p>
                  <p className="text-xs text-text-muted">Summary digest of student admissions, hostel census, and fee collections</p>
                </div>
                <button
                  type="button"
                  onClick={() => setWeeklyDigest(!weeklyDigest)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    weeklyDigest ? "bg-primary" : "bg-surface-muted border border-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-xs transition-transform ${
                      weeklyDigest ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <Button variant="primary" onClick={handleNotifSave} icon={<Save size={14} />}>
                Save Preferences
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "appearance" && (
        <Card>
          <div className="space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm font-semibold text-text flex items-center gap-2">
                <Sun size={16} className="text-gold" /> System Theme & Typography
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Current visual theme token contract and accessible color palette
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-muted/40 rounded-xl border border-border">
              <div>
                <p className="text-sm font-semibold text-text">Standard Academic Theme</p>
                <p className="text-xs text-text-muted">
                  High-contrast accessible theme with deep navy brand accents and warm gold highlights.
                </p>
              </div>
              <Badge variant="gold" size="md">
                Active Theme
              </Badge>
            </div>

            <div className="p-4 rounded-xl border border-border space-y-2">
              <p className="text-xs font-semibold text-text">Currency & Localization</p>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>Default Financial Currency:</span>
                <span className="font-mono font-bold text-text">Bangladeshi Taka (৳ BDT)</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
