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
  UserCheck,
  AlertCircle
} from "lucide-react";
import { PageHeader, Card, FormField, Input, Select, Button, Badge } from "@/components/ui";

type StepType = 1 | 2 | 3 | 4;

export default function StudentOnboardingWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<StepType>(1);
  const [direction, setDirection] = useState(0);

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
        password: password || "Student@123",
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
      
      if (selectedRoomId && res.success) {
        await api.assignStudentToRoom(selectedRoomId, [res.data?.id || "STU-NEW"]);
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

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 250 : -250,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 250 : -250,
      opacity: 0
    })
  };

  const steps = [
    { step: 1, label: "Personal Details", icon: User },
    { step: 2, label: "Academics", icon: BookOpen },
    { step: 3, label: "Hostel Room", icon: Home },
    { step: 4, label: "Confirmation", icon: CheckCircle2 }
  ];

  return (
    <div className="space-y-6 font-sans max-w-3xl mx-auto">
      <PageHeader
        title="Student Admission Wizard"
        subtitle="Step-by-step onboarding pipeline for newly admitted collegiate candidates"
        badge="Admissions Desk"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/students")}
            icon={<ChevronLeft size={16} />}
          >
            Cancel & Exit
          </Button>
        }
      />

      {/* Progress Wizard Bar */}
      <Card orientation="vertical" padding="md" variant="default">
        <div className="flex items-center justify-between">
          {steps.map((item) => {
            const isCompleted = currentStep > item.step;
            const isActive = currentStep === item.step;
            const Icon = item.icon;

            return (
              <div key={item.step} className="flex items-center gap-2.5">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted 
                      ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500/20" 
                      : isActive 
                        ? "bg-gold text-white shadow-md shadow-gold/20" 
                        : "bg-surface-elevated text-text-tertiary"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={16} /> : item.step}
                </div>
                <div className="hidden sm:block">
                  <span className={`text-xs font-semibold block ${
                    isActive ? "text-text font-bold" : isCompleted ? "text-emerald-700" : "text-text-tertiary"
                  }`}>
                    {item.label}
                  </span>
                  <span className="text-[10px] text-text-tertiary block">
                    {item.step === 4 ? "Review" : `Step 0${item.step}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Form Error alert */}
      {formError && (
        <div className="p-3.5 bg-danger-bg border border-danger-border rounded-xl text-danger text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Dynamic Slide Container Wrapper */}
      <Card orientation="vertical" padding="lg" variant="default" className="min-h-[400px] overflow-hidden relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="border-b border-border/80 pb-3">
                <h2 className="text-base font-bold text-text flex items-center gap-2">
                  <User size={18} className="text-gold" /> Personal Identification
                </h2>
                <p className="text-xs text-text-tertiary mt-0.5">Enter core registration contact and identity details.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <FormField label="Full Name" required>
                  <Input
                    placeholder="e.g. Marcus Chen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </FormField>
                <FormField label="Academic Email" required>
                  <Input
                    type="email"
                    placeholder="marcus.chen@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Contact Number" required>
                  <Input
                    placeholder="+880 1712-345678"
                    value={contactNo}
                    onChange={(e) => setContactNo(e.target.value)}
                    required
                  />
                </FormField>
                <FormField label="Gender Identity">
                  <Select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormField>
              </div>

              <FormField label="Initial Password (Optional)" hint="Defaults to Student@123 if left blank">
                <Input
                  type="password"
                  placeholder="Set initial password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormField>
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
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="border-b border-border/80 pb-3">
                <h2 className="text-base font-bold text-text flex items-center gap-2">
                  <BookOpen size={18} className="text-gold" /> Academic Enrollment
                </h2>
                <p className="text-xs text-text-tertiary mt-0.5">Assign academic semester division and department matriculation.</p>
              </div>

              <div className="space-y-4 pt-1">
                <FormField label="Admission Semester" required>
                  <Select
                    value={semesterCode}
                    onChange={(e) => setSemesterCode(e.target.value)}
                  >
                    {semesters.map((sem: any) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.name}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Assigned Department" required>
                  <Select
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                  >
                    {departments.map((dept: any) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </Select>
                </FormField>
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
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="border-b border-border/80 pb-3">
                <h2 className="text-base font-bold text-text flex items-center gap-2">
                  <Home size={18} className="text-gold" /> Hostel Room Allocation
                </h2>
                <p className="text-xs text-text-tertiary mt-0.5">Select an active room vacancy in the campus hostel (optional).</p>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-secondary">Available Vacancies</label>
                  {selectedRoomNumber && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => { setSelectedRoomNumber(""); setSelectedRoomId(""); }}
                      className="text-xs text-danger h-6 px-2"
                    >
                      Clear Selection
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-1">
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
                        className={`p-3.5 border rounded-xl text-left transition-all flex justify-between items-center cursor-pointer ${
                          isFull 
                            ? "bg-surface-elevated/40 border-border opacity-50 cursor-not-allowed" 
                            : isSelected 
                              ? "bg-gold/5 border-gold ring-1 ring-gold shadow-xs" 
                              : "bg-surface border-border hover:border-border-hover hover:bg-surface-elevated/40"
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold text-text block font-mono">
                            Room {room.roomNumber}
                          </span>
                          <span className="text-[10px] text-text-tertiary block mt-0.5">
                            {room.building} &bull; Floor {room.floor}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-gold block font-mono">
                            ৳{room.monthlyRent?.toLocaleString() || "0"}/mo
                          </span>
                          <span className="text-[10px] text-text-tertiary block mt-0.5">
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
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {createStudentMutation.isSuccess ? (
                <div className="space-y-4 text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text">Registration Complete!</h2>
                    <p className="text-xs text-text-tertiary mt-1.5 max-w-sm mx-auto">
                      Student record file for <strong className="text-text">{name}</strong> has been successfully registered and room <strong className="font-mono text-text">{selectedRoomNumber || "Unassigned"}</strong> allocated.
                    </p>
                  </div>
                  <div className="pt-4">
                    <Button
                      variant="gold"
                      onClick={() => router.push("/students")}
                    >
                      Return to Directory
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  <div className="border-b border-border/80 pb-3">
                    <h2 className="text-base font-bold text-text flex items-center gap-2">
                      <UserCheck size={18} className="text-gold" /> Review Student Specifications
                    </h2>
                    <p className="text-xs text-text-tertiary mt-0.5">Verify details before committing document entries.</p>
                  </div>

                  <div className="bg-surface-elevated/60 rounded-xl p-4 border border-border space-y-2.5 text-xs">
                    <div className="flex justify-between border-b border-border/60 pb-2">
                      <span className="text-text-tertiary">Full Name</span>
                      <span className="font-semibold text-text">{name}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 pb-2">
                      <span className="text-text-tertiary">Email Address</span>
                      <span className="font-semibold text-text">{email}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 pb-2">
                      <span className="text-text-tertiary">Contact Number</span>
                      <span className="font-semibold text-text font-mono">{contactNo}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 pb-2">
                      <span className="text-text-tertiary">Assigned Department</span>
                      <span className="font-semibold text-text">{deptName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Hostel Dorm Allocated</span>
                      <span className="font-bold text-gold font-mono">{selectedRoomNumber || "None"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={handlePrevStep}
                    >
                      Back
                    </Button>
                    <Button
                      variant="gold"
                      onClick={handleFormFinishSubmit}
                      disabled={createStudentMutation.isPending}
                      icon={<Save size={16} />}
                    >
                      {createStudentMutation.isPending ? "Submitting..." : "Confirm & Onboard"}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Control buttons */}
        {currentStep < 4 && (
          <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
            <Button
              variant="outline"
              disabled={currentStep === 1}
              onClick={handlePrevStep}
              icon={<ChevronLeft size={16} />}
            >
              Back
            </Button>
            
            <Button
              variant="primary"
              onClick={handleNextStep}
            >
              Next Step
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

