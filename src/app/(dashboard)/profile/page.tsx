"use client";

import React, { useState } from "react";
import { usePermission } from "@/hooks/usePermission";
import {
  useAuthStore,
  roleLabels,
  domainAdminTypeLabels,
  staffSubRoleLabels,
  staffCategoryLabels,
} from "@/store/useAuthStore";
import { User, Mail, BadgeCheck, Calendar, Shield, Save, Loader2, Building2, UserCheck, Layers } from "lucide-react";
import { api } from "@/services/api";
import { useToastStore } from "@/store/useToastStore";

export default function ProfilePage() {
  const { user, token } = useAuthStore();
  const { roleIs } = usePermission();
  const login = useAuthStore((state) => state.login);
  const showToast = useToastStore((state) => state.showToast);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await api.updateProfile({ name: name.trim(), phone });
      if (res.success && user) {
        login({ ...user, name: name.trim() }, token!);
      }
      showToast({ type: "success", message: "Profile updated successfully" });
    } catch {
      showToast({ type: "error", message: "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      <div className="bg-white border border-[#e1e2ed] rounded-xl shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[#2563EB] to-[#1d4ed8]" />
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-12 mb-4">
            <div className="w-20 h-20 rounded-xl bg-white border-4 border-white shadow-md flex items-center justify-center">
              <User size={32} className="text-[#2563EB]" />
            </div>
            <div className="ml-4 pb-1">
              <h2 className="text-lg font-bold text-slate-800">{user?.name || "User"}</h2>
              <p className="text-xs text-slate-400">{roleLabels[user?.role || "student"]}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-lg">
              <Mail size={16} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Email</p>
                <p className="text-xs font-medium text-slate-700">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-lg">
              <Shield size={16} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Role</p>
                <p className="text-xs font-medium text-slate-700">{roleLabels[user?.role || "student"]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-lg">
              <BadgeCheck size={16} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">User ID</p>
                <p className="text-xs font-medium text-slate-700">{user?.id || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-lg">
              <Calendar size={16} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Auth Provider</p>
                <p className="text-xs font-medium text-slate-700">{user?.firebaseUid ? "Firebase" : "Local"}</p>
              </div>
            </div>
          </div>

          {roleIs("domain-admin") && user?.domainAdminType && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex items-center gap-2.5">
                <Building2 size={16} className="text-blue-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-blue-500 font-semibold uppercase">Domain Admin Type</p>
                  <p className="text-xs font-medium text-blue-700">
                    {domainAdminTypeLabels[user.domainAdminType]}
                  </p>
                </div>
              </div>
            </div>
          )}

          {roleIs("staff") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {user?.staffSubRole && (
                <div className="flex items-center gap-2.5 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                  <UserCheck size={16} className="text-purple-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-purple-500 font-semibold uppercase">Staff Sub-Role</p>
                    <p className="text-xs font-medium text-purple-700">
                      {staffSubRoleLabels[user.staffSubRole]}
                    </p>
                  </div>
                </div>
              )}
              {user?.staffCategory && (
                <div className="flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <Layers size={16} className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-emerald-500 font-semibold uppercase">Staff Category</p>
                    <p className="text-xs font-medium text-emerald-700">
                      {staffCategoryLabels[user.staffCategory]}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-4 bg-white border border-[#c3c6d7] rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1.5">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0000"
                className="w-full h-11 px-4 bg-white border border-[#c3c6d7] rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="h-11 px-6 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm shadow-md shadow-blue-500/10 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
