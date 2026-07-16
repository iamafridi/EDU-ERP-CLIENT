"use client";

import React from "react";
import { User, BadgeCheck } from "lucide-react";

type ProfileField = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
};

type ProfileSection = {
  title: string;
  fields: ProfileField[];
};

type ProfileDetailPageProps = {
  roleIcon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
  profile: {
    name: string;
    subtitle: string;
  };
  sections: ProfileSection[];
};

export default function ProfileDetailPage({
  roleIcon: RoleIcon,
  title,
  subtitle,
  profile,
  sections,
}: ProfileDetailPageProps) {
  return (
    <div className="space-y-6 font-sans max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <RoleIcon className="text-[#2563EB]" />
          {title}
        </h1>
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      </div>

      <div className="bg-white border border-[#e1e2ed] rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 bg-gradient-to-r from-[#2563EB]/5 to-transparent border-b border-[#e1e2ed] flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB]">
            <User size={28} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{profile.name}</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <BadgeCheck size={12} className="text-emerald-500" />
              {profile.subtitle}
            </p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-3">
                {section.fields.map((field) => (
                  <div key={field.label} className="flex items-center gap-3 text-sm">
                    <field.icon size={16} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold">{field.label}</p>
                      <p className={`text-slate-700 ${field.mono ? "font-mono" : ""}`}>
                        {field.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
