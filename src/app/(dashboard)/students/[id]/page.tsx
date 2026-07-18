"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { ChevronLeft, User, BookOpen, Home, CreditCard, AlertCircle, Edit, Save } from "lucide-react";
import { ProfileSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermission } from "@/hooks/usePermission";

type TabType = "profile" | "academics" | "room";

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const studentId = params.id as string;
  const { user } = useAuthStore();
  const { roleIs } = usePermission();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isEditing, setIsEditing] = useState(false);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: api.getStudents,
  });

  const student = students.find((s: any) => s.studentId === studentId);

  // Form states
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editGender, setEditGender] = useState("Male");

  // Initialize edit fields
  React.useEffect(() => {
    if (student) {
      setEditName(typeof student.name === 'string' ? student.name : `${student.name?.firstName ?? ''} ${student.name?.lastName ?? ''}`.trim());
      setEditEmail(student.email);
      setEditContact(student.contactNo);
      setEditGender(student.gender);
    }
  }, [student]);

  const updateStudentMutation = useMutation({
    mutationFn: (payload: any) => api.updateStudent(student?.id || studentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsEditing(false);
    },
  });

  const handleSaveProfile = () => {
    if (!editName || !editEmail || !editContact) return;
    updateStudentMutation.mutate({
      name: editName,
      email: editEmail,
      contactNo: editContact,
      gender: editGender,
    });
  };

  const deallocateRoomMutation = useMutation({
    mutationFn: () => {
      if (!studentRoom || !student) return Promise.resolve(null);
      return api.removeStudentFromRoom(studentRoom.id, [student.id || student.studentId]);
    },
    onSuccess: () => {
      updateStudentMutation.mutate({
        roomNumber: "",
      });
    },
  });

  const handleDeallocateRoom = () => {
    const studentNameStr = typeof student?.name === 'string' ? student.name : `${student?.name?.firstName ?? ''} ${student?.name?.lastName ?? ''}`.trim() || student?.studentId;
    if (confirm(`Are you sure you want to de-allocate ${studentNameStr} from room ${student?.roomNumber}?`)) {
      deallocateRoomMutation.mutate();
    }
  };

  // Load rooms to associate room facilities if possible
  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: api.getRooms,
    enabled: !!student,
  });

  const studentRoom = rooms.find((r: any) => r.roomNumber === student?.roomNumber);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!student) {
    return (
      <div className="bg-white border border-[#e1e2ed] p-8 rounded-xl text-center space-y-4 max-w-md mx-auto font-sans mt-12">
        <AlertCircle size={48} className="text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Student Record Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested student ID <strong className="font-mono text-slate-600">{studentId}</strong> does not exist in the institutional ERP database.
        </p>
        <Link href="/students">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-[#2563EB] hover:underline cursor-pointer">
            <ChevronLeft size={16} /> Return to Directory
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link href="/students">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <ChevronLeft size={16} /> Back to Directory
          </span>
        </Link>
        {activeTab === "profile" && roleIs("domain-admin", "super-admin") && (
          <button
            onClick={() => {
              if (isEditing) {
                handleSaveProfile();
              } else {
                setIsEditing(true);
              }
            }}
            className="h-9 px-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            {isEditing ? <Save size={14} /> : <Edit size={14} />}
            {isEditing ? "Save Profile" : "Edit Profile"}
          </button>
        )}
      </div>

      {/* Profile Header Card */}
      <div className="bg-white border border-[#e1e2ed] rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-bold text-3xl">
          {(typeof student.name === 'string' ? student.name : student.name?.firstName ?? '').charAt(0) || '?'}
        </div>
        <div className="flex-1 text-center sm:text-left space-y-1.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#2563EB]/10 text-[#2563EB] font-bold text-xs font-mono">
            {student.studentId}
          </span>
          <h1 className="text-2xl font-bold text-slate-800">{(typeof student.name === 'string' ? student.name : `${student.name?.firstName ?? ''} ${student.name?.lastName ?? ''}`.trim()) || ''}</h1>
          <p className="text-xs text-slate-400">
            Registered: {student.academicDepartment} &bull; Semester {student.academicSemester}
          </p>
        </div>
      </div>

      {/* Tabs Switcher Panel */}
      <div className="border-b border-[#e1e2ed] flex items-center gap-6">
        {(["profile", "academics", "room"] as TabType[]).map((tab) => {
          const isActive = activeTab === tab;
          const label = tab.charAt(0).toUpperCase() + tab.slice(1);
          
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setIsEditing(false);
              }}
              className={`pb-3 text-sm font-semibold relative transition-colors cursor-pointer ${
                isActive ? "text-[#2563EB]" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {label === "Room" ? "Room Allocation" : label === "Academics" ? "Academic Details" : "Personal Profile"}
              
              {isActive && (
                <motion.div
                  layoutId="active-student-tab-bar"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Contents Panel */}
      <div className="bg-white border border-[#e1e2ed] rounded-xl p-6 shadow-sm min-h-[260px]">
        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Contact Information
                </h3>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Full Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full h-9 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Email Address</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full h-9 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Mobile Phone</label>
                      <input
                        type="text"
                        value={editContact}
                        onChange={(e) => setEditContact(e.target.value)}
                        className="w-full h-9 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Gender Identity</label>
                      <select
                        value={editGender}
                        onChange={(e) => setEditGender(e.target.value)}
                        className="w-full h-9 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm py-1 border-b border-slate-50">
                      <span className="text-slate-400">Email Address</span>
                      <span className="font-semibold text-slate-700">{student.email}</span>
                    </div>
                    <div className="flex justify-between text-sm py-1 border-b border-slate-50">
                      <span className="text-slate-400">Mobile Phone</span>
                      <span className="font-semibold text-slate-700">{student.contactNo}</span>
                    </div>
                    <div className="flex justify-between text-sm py-1">
                      <span className="text-slate-400">Gender Identity</span>
                      <span className="font-semibold text-slate-700">{student.gender}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Emergency Contacts
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm py-1 border-b border-slate-50">
                    <span className="text-slate-400">Primary Guardian</span>
                    <span className="font-semibold text-slate-700">Richard Chen</span>
                  </div>
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-slate-400">Relationship / Tel</span>
                    <span className="font-semibold text-slate-700">Father / +1 555-0100</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "academics" && (
            <motion.div
              key="academics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Academic Curriculum
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm py-1 border-b border-slate-50">
                      <span className="text-slate-400">Major Major Department</span>
                      <span className="font-semibold text-slate-700">{student.academicDepartment}</span>
                    </div>
                    <div className="flex justify-between text-sm py-1 border-b border-slate-50">
                      <span className="text-slate-400">Registration Semester</span>
                      <span className="font-semibold text-slate-700">{student.academicSemester}</span>
                    </div>
                    <div className="flex justify-between text-sm py-1">
                      <span className="text-slate-400">Student Status</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-xs">
                        Active Enrolled
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "room" && (
            <motion.div
              key="room"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Dormitory Specifics
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm py-1 border-b border-slate-50">
                      <span className="text-slate-400">Assigned Dorm Room</span>
                      <span className="font-bold text-[#2563EB] font-mono">{student.roomNumber || "Unallocated"}</span>
                    </div>
                    <div className="flex justify-between text-sm py-1 border-b border-slate-50">
                      <span className="text-slate-400">Building Block</span>
                      <span className="font-semibold text-slate-700">{studentRoom?.building || "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-sm py-1 border-b border-slate-50">
                      <span className="text-slate-400">Floor Level</span>
                      <span className="font-semibold text-slate-700">Floor {studentRoom?.floor || "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-sm py-1">
                      <span className="text-slate-400">Room Capacity Limit</span>
                      <span className="font-semibold text-slate-700">{studentRoom?.capacity || "N/A"} Beds</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Room Conveniences & Facilities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {studentRoom?.roomFacilities && studentRoom.roomFacilities.length > 0 ? (
                      studentRoom.roomFacilities.map((fac: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
                        >
                          {fac}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">No facilities registered.</span>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-between text-sm">
                    <span className="text-slate-400">Monthly Rent Fee</span>
                    <span className="font-bold text-slate-800 font-mono">
                      Rs. {studentRoom?.monthlyRent || "N/A"}
                    </span>
                  </div>
                  {student?.roomNumber && (roleIs("domain-admin", "super-admin") || user?.staffSubRole === "warden") && (
                    <div className="pt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={handleDeallocateRoom}
                        disabled={deallocateRoomMutation.isPending}
                        className="h-9 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        {deallocateRoomMutation.isPending ? "De-allocating..." : "De-allocate Bed"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
