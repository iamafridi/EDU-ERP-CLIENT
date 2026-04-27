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
    <div className="space-y-6 font-ui max-w-4xl animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold font-serif text-text flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gold/10 text-gold">
            <RoleIcon size={22} />
          </div>
          {title}
        </h1>
        <p className="text-xs text-text-subtle mt-1">{subtitle}</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="p-6 bg-surface-muted/50 border-b border-border flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold shadow-sm">
            <User size={28} />
          </div>
          <div>
            <h2 className="text-lg font-bold font-serif text-text">{profile.name}</h2>
            <p className="text-xs text-text-muted flex items-center gap-1.5 mt-0.5">
              <BadgeCheck size={14} className="text-emerald-500" />
              <span>{profile.subtitle}</span>
            </p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-xs font-bold font-mono text-gold uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-3">
                {section.fields.map((field) => (
                  <div key={field.label} className="flex items-center gap-3 text-sm p-3 rounded-xl bg-surface-muted/40 border border-border/60">
                    <field.icon size={16} className="text-text-subtle shrink-0" />
                    <div>
                      <p className="text-[10px] text-text-subtle font-semibold uppercase">{field.label}</p>
                      <p className={`text-text font-medium text-xs mt-0.5 ${field.mono ? "font-mono" : ""}`}>
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
