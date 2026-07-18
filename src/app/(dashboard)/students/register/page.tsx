"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  BookOpen, 
  Home, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Sparkles,
  UserCheck
} from "lucide-react";

type StepType = 1 | 2 | 3 | 4;

export default function StudentOnboardingWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<StepType>(1);
  const [direction, setDirection] = useState(0); // -1 for back, 1 for next

  // Form Fields State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [gender, setGender] = useState("Male");

  const [semesterCode, setSemesterCode] = useState("SEM-001");
  const [deptName, setDeptName] = useState("Computer Science");

  const [selectedRoomNumber, setSelectedRoomNumber] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");

  const [formError, setFormError] = useState("");

  // Queries
  const { data: semesters = [] } = useQuery({ queryKey: ["semesters"], queryFn: api.getSemesters });
  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: api.getAcademicDepartments });
  const { data: rooms = [] } = useQuery({ queryKey: ["rooms"], queryFn: api.getRooms });

  const createStudentMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        password,
        student: {
          name,
          email,
          contactNo,
          gender,
          academicSemester: semesters.find((s: any) => s.id === semesterCode)?.name || "Fall 2026",
          academicDepartment: deptName,
          roomNumber: selectedRoomNumber || undefined,
        }
      };
      
      const res = await api.createStudent(payload);
      
      // If a room is selected, update room student allocation in backend
      if (selectedRoomId && res.success) {
        await api.assignStudentToRoom(selectedRoomId, [res.data.id || "STU-NEW"]);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setCurrentStep(4);
    }
  });

  const handleNextStep = () => {
    setFormError("");
    
    if (currentStep === 1) {
      if (!name || !email || !contactNo) {
        setFormError("Please enter all personal details fields.");
        return;
      }
      if (!email.includes("@")) {
        setFormError("Please enter a valid email address.");
        return;
      }
    }
    
    if (currentStep === 2) {
      if (!semesterCode || !deptName) {
        setFormError("Please select academic parameters.");
        return;
      }
    }

    if (currentStep === 3) {
      // Room allocation is optional, but if they proceeded we check
    }

    setDirection(1);
    setCurrentStep((s) => (s + 1) as StepType);
  };

  const handlePrevStep = () => {
    setFormError("");
    setDirection(-1);
    setCurrentStep((s) => (s - 1) as StepType);
  };

  const handleFormFinishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStudentMutation.mutate();
  };

  // Slide animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <div className="space-y-6 font-sans max-w-2xl mx-auto">
      {/* Back to directory */}
      <div>
        <span 
          onClick={() => router.push("/students")}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} /> Cancel and Exit
        </span>
      </div>

      {/* Progress Wizard Bar */}
      <div className="bg-white border border-[#e1e2ed] p-4 rounded-xl shadow-sm flex items-center justify-between">
        {[
          { step: 1, label: "Personal Details", icon: User },
          { step: 2, label: "Academics", icon: BookOpen },
          { step: 3, label: "Hostel Room", icon: Home },
          { step: 4, label: "Finish Onboarding", icon: CheckCircle2 }
        ].map((item) => {
          const isCompleted = currentStep > item.step;
          const isActive = currentStep === item.step;
          const Icon = item.icon;

          return (
            <div key={item.step} className="flex items-center gap-2">
              <div 
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  isCompleted 
                    ? "bg-emerald-100 text-emerald-700" 
                    : isActive 
                      ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/10" 
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {isCompleted ? <CheckCircle2 size={14} /> : item.step}
              </div>
              <span className={`text-[10px] font-semibold hidden md:block ${
                isActive ? "text-slate-800" : isCompleted ? "text-emerald-700" : "text-slate-400"
              }`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Form Error alert */}
      {formError && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-semibold">
          {formError}
        </div>
      )}

      {/* Dynamic Slide Container Wrapper */}
      <div className="bg-white border border-[#e1e2ed] rounded-xl p-6 shadow-sm min-h-[360px] overflow-hidden relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                  <User size={18} className="text-[#2563EB]" /> Personal Identification
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Enter core registration contact and identity details.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Full Name</label>
                  <input
                    type="text"
                    placeholder="Marcus Chen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Academic Email</label>
                  <input
                    type="email"
                    placeholder="marcus.c@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Contact Number</label>
                  <input
                    type="text"
                    placeholder="+1 555-0192"
                    value={contactNo}
                    onChange={(e) => setContactNo(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Gender Identity</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                  <BookOpen size={18} className="text-[#2563EB]" /> Academic Enrollment
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Assign academic semester division and department matriculation.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Admission Semester</label>
                  <select
                    value={semesterCode}
                    onChange={(e) => setSemesterCode(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all cursor-pointer"
                  >
                    {semesters.map((sem: any) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Assigned Department</label>
                  <select
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#c3c6d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] transition-all cursor-pointer"
                  >
                    {departments.map((dept: any) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                  <Home size={18} className="text-[#2563EB]" /> Dorm Room Allocation
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Select an active room vacancy inside the hostel catalog.</p>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs font-semibold text-slate-500">Available vacancies</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                  {rooms.map((room: any) => {
                    const isSelected = selectedRoomNumber === room.roomNumber;
                    const isFull = room.occupantCount >= room.capacity;
                    
                    return (
                      <button
                        key={room.id}
                        type="button"
                        disabled={isFull}
                        onClick={() => {
                          setSelectedRoomNumber(room.roomNumber);
                          setSelectedRoomId(room.id);
                        }}
                        className={`p-3 border rounded-lg text-left transition-all flex justify-between items-center ${
                          isFull 
                            ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed" 
                            : isSelected 
                              ? "bg-[#2563EB]/5 border-[#2563EB] shadow-sm" 
                              : "bg-white border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold text-slate-800 block font-mono">
                            Room {room.roomNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {room.building} &bull; Floor {room.floor}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-semibold text-[#2563EB] block font-mono">
                            Rs. {room.monthlyRent}/mo
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">
                            {room.occupantCount}/{room.capacity} Vacancies
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4 text-center py-6"
            >
              {createStudentMutation.isSuccess ? (
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Registration Complete!</h2>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
                      Student record file for <strong className="text-slate-600">{name}</strong> has been successfully registered and room <strong className="font-mono text-slate-600">{selectedRoomNumber || "N/A"}</strong> allocated.
                    </p>
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={() => router.push("/students")}
                      className="h-10 px-6 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm shadow transition-colors cursor-pointer"
                    >
                      Return to Directory
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  <div>
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                      <UserCheck size={18} className="text-[#2563EB]" /> Review Student Specifications
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-sans">Verify details before committing document entries.</p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-400">Full Name</span>
                      <span className="font-semibold text-slate-700">{name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-400">Email Address</span>
                      <span className="font-semibold text-slate-700">{email}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-400">Assigned Department</span>
                      <span className="font-semibold text-slate-700">{deptName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hostel Dorm Allocated</span>
                      <span className="font-bold text-[#2563EB] font-mono">{selectedRoomNumber || "Unallocated"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#e1e2ed]">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleFormFinishSubmit}
                      disabled={createStudentMutation.isPending}
                      className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Save size={16} />
                      {createStudentMutation.isPending ? "Submitting..." : "Confirm & Onboard"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Control buttons */}
        {currentStep < 4 && (
          <div className="flex items-center justify-between pt-6 border-t border-[#e1e2ed] mt-6">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={handlePrevStep}
              className="h-10 px-4 bg-white border border-[#c3c6d7] text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            
            <button
              type="button"
              onClick={handleNextStep}
              className="h-10 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex items-center gap-1"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
