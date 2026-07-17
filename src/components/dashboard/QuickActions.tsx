"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore, UserRole } from "@/store/useAuthStore";
import {
  Plus,
  Users,
  UserPlus,
  BookOpen,
  CreditCard,
  AlertOctagon,
  UserCheck,
  FileText,
  Home,
  Shield,
  Calendar,
  MessageSquare,
  Heart,
  Wrench,
  Megaphone,
  X,
} from "lucide-react";

interface QuickAction {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const allActions: QuickAction[] = [
  { label: "Register Student", href: "/students/register", icon: UserPlus, roles: ["super-admin", "domain-admin"] },
  { label: "Mark Attendance", href: "/attendance", icon: UserCheck, roles: ["super-admin", "domain-admin", "faculty"] },
  { label: "Add Fee Record", href: "/fees", icon: CreditCard, roles: ["super-admin", "domain-admin", "staff"] },
  { label: "Create Notice", href: "/notices", icon: Megaphone, roles: ["super-admin", "domain-admin"] },
  { label: "File Complaint", href: "/grievances", icon: AlertOctagon, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
  { label: "Report Incident", href: "/incidents", icon: Wrench, roles: ["super-admin", "domain-admin", "staff", "faculty", "student"] },
  { label: "Apply Leave", href: "/leave", icon: Calendar, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
  { label: "Send Message", href: "/chat", icon: MessageSquare, roles: ["super-admin", "domain-admin", "faculty", "student", "staff"] },
  { label: "View Reports", href: "/reports", icon: FileText, roles: ["super-admin", "domain-admin", "staff"] },
  { label: "Manage Courses", href: "/courses", icon: BookOpen, roles: ["super-admin", "domain-admin"] },
  { label: "Room Assignment", href: "/rooms", icon: Home, roles: ["super-admin", "domain-admin", "staff"] },
  { label: "Gate Entry Log", href: "/security", icon: Shield, roles: ["super-admin", "domain-admin", "staff"] },
  { label: "Health Center", href: "/health-center", icon: Heart, roles: ["super-admin", "domain-admin", "staff"] },
  { label: "Student Directory", href: "/students", icon: Users, roles: ["super-admin", "domain-admin", "faculty"] },
];

const fabColors = [
  "bg-[#2563EB] hover:bg-[#1d4ed8]",
  "bg-emerald-500 hover:bg-emerald-600",
  "bg-amber-500 hover:bg-amber-600",
  "bg-purple-500 hover:bg-purple-600",
  "bg-rose-500 hover:bg-rose-600",
  "bg-cyan-500 hover:bg-cyan-600",
];

export default function QuickActions() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const visibleActions = allActions.filter(
    (a) => user?.role && a.roles.includes(user.role),
  ).slice(0, 6);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen &&
          visibleActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.href}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => {
                  setIsOpen(false);
                  router.push(action.href);
                }}
                className={`flex items-center gap-2.5 h-11 pl-3 pr-4 ${fabColors[idx % fabColors.length]} text-white font-semibold rounded-full shadow-lg shadow-slate-900/10 hover:shadow-xl transition-all cursor-pointer`}
              >
                <Icon size={16} />
                <span className="text-xs whitespace-nowrap">{action.label}</span>
              </motion.button>
            );
          })}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center transition-colors cursor-pointer"
      >
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </motion.button>
    </div>
  );
}
