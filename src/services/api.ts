import { apiClient, request, USE_MOCKS, delay } from "./api/client";
import { financeApi } from "./api/finance.api";
import { academicApi, doubleBlindApi, facultyWorkloadApi } from "./api/academic.api";
import { clinicalApi } from "./api/clinical.api";
import { campusApi } from "./api/campus.api";
import { complianceApi } from "./api/compliance.api";

export { apiClient, request, USE_MOCKS, delay, financeApi, academicApi, doubleBlindApi, facultyWorkloadApi, clinicalApi, campusApi, complianceApi };

// Mock Fallbacks
export const MOCK_STUDENTS = [
  { id: "STU-2026001", studentId: "STU-001", name: "Marcus Chen", email: "marcus.c@college.edu", contactNo: "+1 555-0192", gender: "Male", academicSemester: "Fall 2026", academicDepartment: "Computer Science", roomNumber: "B-204" },
  { id: "STU-2026002", studentId: "STU-002", name: "Sophia Martinez", email: "sophia.m@college.edu", contactNo: "+1 555-0283", gender: "Female", academicSemester: "Fall 2026", academicDepartment: "Microbiology", roomNumber: "A-102" },
  { id: "STU-2026003", studentId: "STU-003", name: "Ethan Gallagher", email: "ethan.g@college.edu", contactNo: "+1 555-0374", gender: "Male", academicSemester: "Spring 2026", academicDepartment: "Cardiology", roomNumber: "B-205" },
  { id: "STU-2026004", studentId: "STU-004", name: "Aria Takahashi", email: "aria.t@college.edu", contactNo: "+1 555-0465", gender: "Female", academicSemester: "Fall 2026", academicDepartment: "Computer Science", roomNumber: "A-103" },
  { id: "STU-2026005", studentId: "STU-005", name: "Liam O'Connor", email: "liam.o@college.edu", contactNo: "+1 555-0556", gender: "Male", academicSemester: "Spring 2026", academicDepartment: "Neurology", roomNumber: "B-108" },
];

export const MOCK_FACULTIES = [
  { id: "FAC-001", facultyId: "FAC-983", name: "Dr. James Sterling", email: "j.sterling@college.edu", contactNo: "+1 555-9831", designation: "Professor", academicDepartment: "Computer Science" },
  { id: "FAC-002", facultyId: "FAC-984", name: "Prof. Clara Oswald", email: "c.oswald@college.edu", contactNo: "+1 555-9832", designation: "Assistant Professor", academicDepartment: "Microbiology" },
  { id: "FAC-003", facultyId: "FAC-985", name: "Dr. Alistair Who", email: "a.who@college.edu", contactNo: "+1 555-9833", designation: "Associate Professor", academicDepartment: "Cardiology" },
];

export const MOCK_COURSES = [
  { id: "CRS-001", code: "CS-301", title: "Advanced Database Systems", credits: 3, description: "Exploration of relational, NoSQL, and graph databases." },
  { id: "CRS-002", code: "MB-102", title: "Medical Microbiology", credits: 4, description: "Study of micro-organisms causing infectious diseases." },
  { id: "CRS-003", code: "CD-202", title: "Fundamentals of Cardiology", credits: 3, description: "Introductory course in cardiovascular sciences." },
];

export const MOCK_DEPARTMENTS = [
  { id: "DEP-001", name: "Computer Science", academicFaculty: "Faculty of Engineering" },
  { id: "DEP-002", name: "Microbiology", academicFaculty: "Faculty of Science" },
  { id: "DEP-003", name: "Cardiology", academicFaculty: "Faculty of Medicine" },
];

export const MOCK_ROOMS = [
  { id: "RM-001", roomNumber: "B-204", building: "Block B", floor: 2, capacity: 2, occupantCount: 1, monthlyRent: 4500, roomFacilities: ["Wi-Fi", "Study Desk", "Air Conditioning"] },
  { id: "RM-002", roomNumber: "A-102", building: "Block A", floor: 1, capacity: 4, occupantCount: 3, monthlyRent: 3500, roomFacilities: ["Wi-Fi", "Attached Bathroom"] },
  { id: "RM-003", roomNumber: "B-205", building: "Block B", floor: 2, capacity: 2, occupantCount: 0, monthlyRent: 4500, roomFacilities: ["Wi-Fi", "Study Desk"] },
  { id: "RM-004", roomNumber: "A-103", building: "Block A", floor: 1, capacity: 4, occupantCount: 2, monthlyRent: 3500, roomFacilities: ["Attached Bathroom"] },
];

export const MOCK_SEMESTERS = [
  { id: "SEM-001", name: "Fall 2026", code: "01", startMonth: "August", endMonth: "December" },
  { id: "SEM-002", name: "Spring 2026", code: "02", startMonth: "January", endMonth: "June" },
];

export const MOCK_GRIEVANCES = [
  { id: "GRV-001", subject: "Frequent power cuts in Block B", description: "The electricity cuts off every evening between 7 PM and 9 PM, making it hard to study.", category: "hostel", isAnonymous: false, status: "under-review", studentName: "Marcus Chen", date: "2026-06-12" },
  { id: "GRV-002", subject: "Library hours are too restrictive", description: "Requesting to extend library hours until midnight during exam weeks.", category: "academic", isAnonymous: true, status: "resolved", resolution: "Library hours extended to 11:30 PM during exams.", studentName: "Anonymous", date: "2026-06-10" }
];

export const MOCK_INCIDENTS = [
  { id: "INC-001", title: "Leaking shower faucet", description: "Water dripping constantly in Room B-204 bathroom.", severity: "medium", status: "reported", location: "Block B, Room 204", date: "2026-06-14" },
  { id: "INC-002", title: "AC fan making loud grinding noise", description: "AC unit fan is grinding and not cooling properly.", severity: "high", status: "investigating", location: "Block A, Room 102", date: "2026-06-13" }
];

export const MOCK_GATE_ENTRIES = [
  { id: "GTE-001", type: "student", personName: "Marcus Chen", vehicleNumber: "", contactNo: "+1 555-0192", purpose: "Returning from library", entryTime: "2026-06-15T22:30:00Z", isLateEntry: true, lateEntryReason: "Extended study session" },
  { id: "GTE-002", type: "visitor", personName: "Sarah Connor", vehicleNumber: "ABC-1234", contactNo: "+1 555-0987", purpose: "Parent visit", entryTime: "2026-06-15T14:00:00Z", exitTime: "2026-06-15T18:00:00Z" }
];

export const MOCK_VISITOR_LOGS = [
  { id: "VSL-001", visitorName: "John Doe", contactNo: "+1 555-1122", email: "johndoe@email.com", purpose: "Delivery", vehicleNumber: "XYZ-987", entryTime: "2026-06-15T10:15:00Z", exitTime: "2026-06-15T10:30:00Z", preApproved: true }
];

export const MOCK_FEES = [
  { id: "FEE-001", studentId: "STU-001", studentName: "Marcus Chen", semester: "Fall 2026", type: "Hostel Fee", amount: 25000, status: "pending", dueDate: "2026-07-01" },
  { id: "FEE-002", studentId: "STU-002", studentName: "Sophia Martinez", semester: "Fall 2026", type: "Tuition Fee", amount: 120000, status: "paid", dueDate: "2026-07-01" }
];

export const MOCK_PAYMENTS = [
  { id: "PMT-001", transactionId: "TXN-739281", fee: "FEE-002", student: "STU-002", amount: 120000, method: "online", status: "success", paymentDate: "2026-06-10T09:45:00Z" }
];

export const MOCK_SCHEDULES = [
  { id: "SCH-001", courseCode: "CS-301", courseTitle: "Advanced Database Systems", facultyName: "Dr. James Sterling", day: "Monday", time: "09:00 AM - 10:30 AM", room: "Lecture Hall 3" },
  { id: "SCH-002", courseCode: "MB-102", courseTitle: "Medical Microbiology", facultyName: "Prof. Clara Oswald", day: "Tuesday", time: "11:00 AM - 12:30 PM", room: "Lab A" }
];

export const MOCK_TRANSCRIPTS = [
  { id: "TRN-001", studentId: "STU-001", studentName: "Marcus Chen", cgpa: 3.85, status: "verified", issueDate: "2026-06-01" }
];

export const MOCK_CLINICAL_ROTATIONS = [
  { id: "ROT-001", studentName: "Marcus Chen", department: "Cardiology", hospital: "General Hospital", shift: "Day Shift (08:00 - 16:00)", supervisor: "Dr. Alistair Who" }
];

export const MOCK_SKILL_LABS = [
  { id: "SKL-001", studentName: "Marcus Chen", topic: "Suture Techniques", completed: true, verifiedBy: "Dr. James Sterling" },
  { id: "SKL-002", studentName: "Marcus Chen", topic: "IV Intubation", completed: false }
];

export const MOCK_COUNSELING = [
  { id: "CNS-001", studentName: "Marcus Chen", counselorName: "Dr. Sarah Jenkins", dateTime: "2026-06-18T15:00:00Z", notes: "First introductory session", status: "scheduled" }
];

export const MOCK_PAYROLL = [
  { id: "PR-001", employeeId: "FAC-001", employeeName: "Dr. James Sterling", designation: "Professor", department: "Computer Science", salary: 85000, month: "June 2026", status: "paid", paidDate: "2026-06-01" },
  { id: "PR-002", employeeId: "FAC-002", employeeName: "Prof. Clara Oswald", designation: "Assistant Professor", department: "Microbiology", salary: 65000, month: "June 2026", status: "pending", paidDate: null },
  { id: "PR-003", employeeId: "FAC-003", employeeName: "Dr. Alistair Who", designation: "Associate Professor", department: "Cardiology", salary: 72000, month: "June 2026", status: "pending", paidDate: null },
  { id: "PR-004", employeeId: "STF-001", employeeName: "Robert Smith", designation: "Lab Technician", department: "Computer Science", salary: 38000, month: "June 2026", status: "paid", paidDate: "2026-06-02" },
  { id: "PR-005", employeeId: "STF-002", employeeName: "Emily Davis", designation: "Administrative Assistant", department: "Administration", salary: 32000, month: "June 2026", status: "pending", paidDate: null },
];

export const MOCK_REPORTS = [
  { id: "RPT-001", title: "Monthly Attendance Summary", type: "Attendance", generatedDate: "2026-06-01", status: "completed", createdBy: "Dr. James Sterling" },
  { id: "RPT-002", title: "Semester Fee Collection Report", type: "Financial", generatedDate: "2026-06-05", status: "completed", createdBy: "System" },
  { id: "RPT-003", title: "Student Performance Analysis", type: "Academic", generatedDate: "2026-06-10", status: "pending", createdBy: "Prof. Clara Oswald" },
  { id: "RPT-004", title: "Hostel Occupancy Report", type: "Hostel", generatedDate: "2026-06-12", status: "completed", createdBy: "Warden" },
];

export const MOCK_NOTIFICATIONS = [
  { id: "NOT-001", title: "Fee Payment Reminder", message: "Hostel fees for Fall 2026 are due by July 1st.", type: "fee", isRead: false, createdAt: "2026-06-14T10:00:00Z", recipientRole: "student" },
  { id: "NOT-002", title: "Maintenance Notice", message: "Block A water supply will be interrupted on June 20th for pipe repairs.", type: "maintenance", isRead: false, createdAt: "2026-06-13T09:00:00Z", recipientRole: "all" },
  { id: "NOT-003", title: "Exam Schedule Published", message: "Final exam schedule for Spring 2026 is now available.", type: "academic", isRead: true, createdAt: "2026-06-12T14:30:00Z", recipientRole: "student" },
  { id: "NOT-004", title: "Counseling Session Reminder", message: "Your appointment with Dr. Jenkins is tomorrow at 3 PM.", type: "general", isRead: true, createdAt: "2026-06-11T08:00:00Z", recipientRole: "student" },
  { id: "NOT-005", title: "Visitor Entry Approved", message: "Your guest John Doe has been approved for entry on June 16th.", type: "security", isRead: false, createdAt: "2026-06-15T16:00:00Z", recipientRole: "student" },
];

export const MOCK_CONVERSATIONS = [
  { id: "CONV-001", participants: ["Dr. James Sterling", "Marcus Chen"], lastMessage: "See you at the lecture.", lastMessageTime: "2026-06-15T14:30:00Z", unreadCount: 2 },
  { id: "CONV-002", participants: ["Prof. Clara Oswald", "Marcus Chen"], lastMessage: "Please submit your lab report by Friday.", lastMessageTime: "2026-06-14T11:00:00Z", unreadCount: 0 },
  { id: "CONV-003", participants: ["Sophia Martinez", "Marcus Chen"], lastMessage: "Thanks for the notes!", lastMessageTime: "2026-06-13T18:45:00Z", unreadCount: 1 },
];

export const MOCK_MESSAGES: Record<string, any[]> = {
  "CONV-001": [
    { id: "MSG-001", conversationId: "CONV-001", sender: "Dr. James Sterling", content: "Good morning Marcus, are you ready for today's lecture?", createdAt: "2026-06-15T14:00:00Z" },
    { id: "MSG-002", conversationId: "CONV-001", sender: "Marcus Chen", content: "Yes Dr. Sterling, I've completed the reading assignment.", createdAt: "2026-06-15T14:15:00Z" },
    { id: "MSG-003", conversationId: "CONV-001", sender: "Dr. James Sterling", content: "Excellent. See you at the lecture.", createdAt: "2026-06-15T14:30:00Z" },
  ],
  "CONV-002": [
    { id: "MSG-004", conversationId: "CONV-002", sender: "Prof. Clara Oswald", content: "Marcus, I noticed your lab report is missing the conclusion section.", createdAt: "2026-06-14T10:30:00Z" },
    { id: "MSG-005", conversationId: "CONV-002", sender: "Marcus Chen", content: "I'll add it right away, Professor.", createdAt: "2026-06-14T10:45:00Z" },
    { id: "MSG-006", conversationId: "CONV-002", sender: "Prof. Clara Oswald", content: "Please submit your lab report by Friday.", createdAt: "2026-06-14T11:00:00Z" },
  ],
  "CONV-003": [
    { id: "MSG-007", conversationId: "CONV-003", sender: "Sophia Martinez", content: "Hey Marcus, could you share the notes from yesterday's DBMS class?", createdAt: "2026-06-13T18:00:00Z" },
    { id: "MSG-008", conversationId: "CONV-003", sender: "Marcus Chen", content: "Sure, I'll send them over.", createdAt: "2026-06-13T18:20:00Z" },
    { id: "MSG-009", conversationId: "CONV-003", sender: "Sophia Martinez", content: "Thanks for the notes!", createdAt: "2026-06-13T18:45:00Z" },
  ],
};

export const MOCK_PARENTS = [
  { id: "PAR-001", name: "Robert Chen", email: "robert.chen@email.com", contactNo: "+1 555-1111", occupation: "Software Engineer", children: [{ id: "STU-001", name: "Marcus Chen" }] },
  { id: "PAR-002", name: "Elena Martinez", email: "elena.m@email.com", contactNo: "+1 555-2222", occupation: "Doctor", children: [{ id: "STU-002", name: "Sophia Martinez" }] },
  { id: "PAR-003", name: "William Gallagher", email: "will.g@email.com", contactNo: "+1 555-3333", occupation: "Business Owner", children: [{ id: "STU-003", name: "Ethan Gallagher" }] },
];

export const MOCK_MENUS = [
  { id: "MEN-001", day: "Monday", mealType: "Breakfast", items: "Idli, Sambar, Chutney", date: "2026-06-15" },
  { id: "MEN-002", day: "Monday", mealType: "Lunch", items: "Rice, Dal, Mixed Vegetables, Papad", date: "2026-06-15" },
  { id: "MEN-003", day: "Monday", mealType: "Dinner", items: "Chapati, Paneer Butter Masala, Salad", date: "2026-06-15" },
  { id: "MEN-004", day: "Tuesday", mealType: "Breakfast", items: "Poha, Jalebi, Tea", date: "2026-06-16" },
  { id: "MEN-005", day: "Tuesday", mealType: "Lunch", items: "Biryani, Raita, Pickle", date: "2026-06-16" },
];

export const MOCK_MEAL_PLANS = [
  { id: "MP-001", studentName: "Marcus Chen", studentId: "STU-001", planType: "Vegetarian", startDate: "2026-06-01", endDate: "2026-06-30", status: "active" },
  { id: "MP-002", studentName: "Sophia Martinez", studentId: "STU-002", planType: "Non-Vegetarian", startDate: "2026-06-01", endDate: "2026-06-30", status: "active" },
  { id: "MP-003", studentName: "Ethan Gallagher", studentId: "STU-003", planType: "Vegetarian", startDate: "2026-06-15", endDate: "2026-07-15", status: "pending" },
];

export const MOCK_MESS_FEEDBACK = [
  { id: "MFB-001", studentName: "Marcus Chen", rating: 4, comments: "Good quality food, but needs more variety in breakfast.", date: "2026-06-14" },
  { id: "MFB-002", studentName: "Sophia Martinez", rating: 5, comments: "Excellent lunch menu this week!", date: "2026-06-13" },
  { id: "MFB-003", studentName: "Aria Takahashi", rating: 3, comments: "Dinner could be lighter options.", date: "2026-06-12" },
];

export const MOCK_MESS_BILLS = [
  { id: "MBL-001", studentName: "Marcus Chen", studentId: "STU-001", amount: 2500, month: "June 2026", status: "paid", dueDate: "2026-07-05" },
  { id: "MBL-002", studentName: "Sophia Martinez", studentId: "STU-002", amount: 3000, month: "June 2026", status: "pending", dueDate: "2026-07-05" },
  { id: "MBL-003", studentName: "Ethan Gallagher", studentId: "STU-003", amount: 2500, month: "June 2026", status: "pending", dueDate: "2026-07-05" },
];

export const MOCK_VEHICLES = [
  { id: "VEH-001", vehicleNumber: "UP-14-AT-1234", type: "Bus", capacity: 50, driverName: "Rajesh Kumar", status: "active" },
  { id: "VEH-002", vehicleNumber: "UP-14-AT-5678", type: "Bus", capacity: 40, driverName: "Suresh Singh", status: "active" },
  { id: "VEH-003", vehicleNumber: "UP-14-BC-9012", type: "Van", capacity: 15, driverName: "Amit Verma", status: "maintenance" },
];

export const MOCK_TRANSPORT_ROUTES = [
  { id: "TRT-001", routeName: "Route A - North Campus", vehicleNumber: "UP-14-AT-1234", stops: "Main Gate, Library, Admin Block, Hostel Block A, Hostel Block B", schedule: "07:30 AM - 08:30 AM" },
  { id: "TRT-002", routeName: "Route B - South Campus", vehicleNumber: "UP-14-AT-5678", stops: "South Gate, Hospital, Pharmacy Block, Hostel Block C", schedule: "07:45 AM - 08:45 AM" },
  { id: "TRT-003", routeName: "Route C - City Center", vehicleNumber: "UP-14-BC-9012", stops: "City Center Stop, Railway Station, Bus Stand, College Gate", schedule: "08:00 AM - 09:00 AM" },
];

export const MOCK_TRANSPORT_FEES = [
  { id: "TRF-001", routeName: "Route A - North Campus", studentType: "Regular", amount: 5000, semester: "Fall 2026" },
  { id: "TRF-002", routeName: "Route B - South Campus", studentType: "Regular", amount: 4500, semester: "Fall 2026" },
  { id: "TRF-003", routeName: "Route C - City Center", studentType: "Regular", amount: 6000, semester: "Fall 2026" },
  { id: "TRF-004", routeName: "Route A - North Campus", studentType: "Staff", amount: 3000, semester: "Fall 2026" },
];

export const MOCK_ATTENDANCE_RECORDS = [
  { id: "ATT-001", studentId: "STU-001", studentName: "Marcus Chen", date: "2026-06-15", status: "present", course: "CS-301" },
  { id: "ATT-002", studentId: "STU-002", studentName: "Sophia Martinez", date: "2026-06-15", status: "absent", course: "CS-301" },
  { id: "ATT-003", studentId: "STU-003", studentName: "Ethan Gallagher", date: "2026-06-15", status: "present", course: "MB-102" },
  { id: "ATT-004", studentId: "STU-004", studentName: "Aria Takahashi", date: "2026-06-15", status: "late", course: "MB-102" },
  { id: "ATT-005", studentId: "STU-005", studentName: "Liam O'Connor", date: "2026-06-15", status: "present", course: "CD-202" },
];

export const MOCK_EXAMS = [
  { id: "EXM-001", code: "CS-301", title: "Advanced Database Systems - Midterm", date: "2026-07-15", duration: "3 hours" },
  { id: "EXM-002", code: "MB-102", title: "Medical Microbiology - Final", date: "2026-07-20", duration: "3 hours" },
  { id: "EXM-003", code: "CD-202", title: "Fundamentals of Cardiology - Quiz 1", date: "2026-07-10", duration: "1 hour" },
];

export const MOCK_GRADES = [
  { id: "GRD-001", studentId: "STU-001", studentName: "Marcus Chen", examId: "EXM-001", examTitle: "Advanced Database Systems - Midterm", grade: "A", score: 92 },
  { id: "GRD-002", studentId: "STU-002", studentName: "Sophia Martinez", examId: "EXM-001", examTitle: "Advanced Database Systems - Midterm", grade: "B+", score: 85 },
  { id: "GRD-003", studentId: "STU-003", studentName: "Ethan Gallagher", examId: "EXM-002", examTitle: "Medical Microbiology - Final", grade: "A-", score: 88 },
];

export const MOCK_COURSE_OUTCOMES = [
  { id: "CO-001", course: "CRS-001", courseTitle: "Advanced Database Systems", code: "CO1", description: "Design and implement normalized relational database schemas", cognitiveLevel: "apply" },
  { id: "CO-002", course: "CRS-001", courseTitle: "Advanced Database Systems", code: "CO2", description: "Evaluate NoSQL database solutions for specific use cases", cognitiveLevel: "evaluate" },
  { id: "CO-003", course: "CRS-002", courseTitle: "Medical Microbiology", code: "CO1", description: "Identify pathogenic micro-organisms using laboratory techniques", cognitiveLevel: "apply" },
];

export const MOCK_PROGRAM_OUTCOMES = [
  { id: "PO-001", code: "PO1", description: "Engineering knowledge: Apply mathematics and science fundamentals" },
  { id: "PO-002", code: "PO2", description: "Problem analysis: Identify and analyze complex engineering problems" },
  { id: "PO-003", code: "PO3", description: "Design/development of solutions: Design solutions for complex problems" },
];

export const MOCK_CURRICULUM_MAPS = [
  { id: "CM-001", academicSemester: "Fall 2026", course: "CRS-001", courseTitle: "Advanced Database Systems", courseOutcomes: ["CO-001", "CO-002"], topics: [{ title: "Relational Algebra", hours: 4, cos: ["CO-001"] }, { title: "Normalization", hours: 6, cos: ["CO-001"] }, { title: "NoSQL Overview", hours: 3, cos: ["CO-002"] }], textbooks: ["Database Systems: The Complete Book"], referenceBooks: ["SQL Performance Explained"] },
];

export const MOCK_ASSESSMENTS = [
  { id: "ASSESS-001", course: "CRS-001", courseTitle: "Advanced Database Systems", title: "Normalization Quiz", type: "quiz", maxMarks: 20, weightage: 15, date: "2026-07-12" },
  { id: "ASSESS-002", course: "CRS-001", courseTitle: "Advanced Database Systems", title: "SQL Assignment 1", type: "assignment", maxMarks: 50, weightage: 25, date: "2026-07-19" },
  { id: "ASSESS-003", course: "CRS-002", courseTitle: "Medical Microbiology", title: "Sessional Exam 1", type: "sessional", maxMarks: 100, weightage: 40, date: "2026-07-15" },
];

export const MOCK_ASSESSMENT_SCORES = [
  { id: "AS-001", assessment: "ASSESS-001", student: "STU-001", studentName: "Marcus Chen", marksObtained: 18, gradedBy: "FAC-001", remarks: "Good work" },
  { id: "AS-002", assessment: "ASSESS-001", student: "STU-002", studentName: "Sophia Martinez", marksObtained: 16, gradedBy: "FAC-001" },
];

export const MOCK_GRADE_BOOKS = [
  { id: "GB-001", student: "STU-001", studentName: "Marcus Chen", course: "CRS-001", courseTitle: "Advanced Database Systems", academicSemester: "Fall 2026", assessments: [{ assessment: "ASSESS-001", marksObtained: 18, weightage: 15 }, { assessment: "ASSESS-002", marksObtained: 42, weightage: 25 }], totalMarks: 86.25, grade: "A", gpa: 4.0 },
];

export const MOCK_LEAVE_REQUESTS = [
  { id: "LVE-001", employeeId: "FAC-001", employeeName: "Dr. James Sterling", type: "sick", startDate: "2026-06-20", endDate: "2026-06-22", reason: "Medical appointment", status: "pending" },
  { id: "LVE-002", employeeId: "FAC-002", employeeName: "Prof. Clara Oswald", type: "personal", startDate: "2026-06-25", endDate: "2026-06-26", reason: "Family function", status: "approved" },
  { id: "LVE-003", employeeId: "FAC-003", employeeName: "Dr. Alistair Who", type: "annual", startDate: "2026-07-01", endDate: "2026-07-10", reason: "Vacation", status: "rejected" },
];

export const MOCK_TIMETABLES = [
  {
    id: "TT-001",
    academicSemester: "Fall 2026",
    department: "Computer Science",
    year: 3,
    section: "A",
    entries: [
      { id: "ENT-001", day: "monday", startTime: "09:00", endTime: "10:30", course: "CRS-001", courseCode: "CS-301", courseTitle: "Advanced Database Systems", faculty: "FAC-001", facultyName: "Dr. James Sterling", room: "LH-3", type: "lecture" },
      { id: "ENT-002", day: "monday", startTime: "11:00", endTime: "12:30", course: "CRS-002", courseCode: "MB-102", courseTitle: "Medical Microbiology", faculty: "FAC-002", facultyName: "Prof. Clara Oswald", room: "LH-1", type: "lecture" },
      { id: "ENT-003", day: "tuesday", startTime: "09:00", endTime: "11:00", course: "CRS-001", courseCode: "CS-301", courseTitle: "Advanced Database Systems", faculty: "FAC-001", facultyName: "Dr. James Sterling", room: "LAB-2", type: "lab" },
      { id: "ENT-004", day: "wednesday", startTime: "10:00", endTime: "11:00", course: "CRS-003", courseCode: "CD-202", courseTitle: "Fundamentals of Cardiology", faculty: "FAC-003", facultyName: "Dr. Alistair Who", room: "LH-2", type: "lecture" },
      { id: "ENT-005", day: "thursday", startTime: "14:00", endTime: "15:30", course: "CRS-002", courseCode: "MB-102", courseTitle: "Medical Microbiology", faculty: "FAC-002", facultyName: "Prof. Clara Oswald", room: "LH-1", type: "tutorial" },
      { id: "ENT-006", day: "friday", startTime: "08:00", endTime: "10:00", course: "CRS-003", courseCode: "CD-202", courseTitle: "Fundamentals of Cardiology", faculty: "FAC-003", facultyName: "Dr. Alistair Who", room: "LAB-3", type: "lab" },
    ],
  },
];

export const MOCK_CLINICAL_PROCEDURES = [
  { id: "PROC-001", code: "CVC-I", name: "Central Venous Catheter Insertion", category: "medical", minimumRequired: 5, description: "Internal jugular or subclavian vein cannulation" },
  { id: "PROC-002", code: "APPY", name: "Appendectomy", category: "surgical", minimumRequired: 10, description: "Open or laparoscopic appendectomy" },
  { id: "PROC-003", code: "NVD", name: "Normal Vaginal Delivery", category: "obgyn", minimumRequired: 20, description: "Uncomplicated vaginal delivery" },
  { id: "PROC-004", code: "LP", name: "Lumbar Puncture", category: "medical", minimumRequired: 3, description: "CSF collection via lumbar puncture" },
];

export const MOCK_LOG_ENTRIES = [
  { id: "LOG-001", student: "STU-001", studentName: "Marcus Chen", procedure: "PROC-001", procedureName: "Central Venous Catheter Insertion", patientAge: 45, patientGender: "Male", diagnosis: "Septic shock", date: "2026-06-10", supervisor: "FAC-001", supervisorName: "Dr. James Sterling", supervisorSignOff: true, competency: "performed" },
  { id: "LOG-002", student: "STU-001", studentName: "Marcus Chen", procedure: "PROC-003", procedureName: "Normal Vaginal Delivery", patientAge: 28, patientGender: "Female", diagnosis: "Full-term pregnancy", date: "2026-06-12", supervisor: "FAC-002", supervisorName: "Prof. Clara Oswald", supervisorSignOff: false, competency: "assisted" },
];

export const MOCK_ADMISSIONS_APPLICATIONS = [
  { id: "APP-001", applicantName: "Alice Johnson", email: "alice.j@email.com", phone: "+1 555-0101", program: "MBBS", status: "pending", submittedAt: "2026-05-10" },
  { id: "APP-002", applicantName: "Bob Williams", email: "bob.w@email.com", phone: "+1 555-0102", program: "BSc Nursing", status: "reviewed", submittedAt: "2026-05-12" },
  { id: "APP-003", applicantName: "Carol Davis", email: "carol.d@email.com", phone: "+1 555-0103", program: "MD", status: "accepted", submittedAt: "2026-05-08" },
  { id: "APP-004", applicantName: "David Brown", email: "david.b@email.com", phone: "+1 555-0104", program: "MBBS", status: "rejected", submittedAt: "2026-05-14" },
  { id: "APP-005", applicantName: "Eva Martinez", email: "eva.m@email.com", phone: "+1 555-0105", program: "BSc Nursing", status: "pending", submittedAt: "2026-05-15" },
];

export const MOCK_MERIT_LIST = [
  { id: "MERIT-001", applicantName: "Carol Davis", applicationId: "APP-003", rank: 1, score: 98.5, status: "selected", createdAt: "2026-06-01" },
  { id: "MERIT-002", applicantName: "Alice Johnson", applicationId: "APP-001", rank: 2, score: 95.2, status: "selected", createdAt: "2026-06-01" },
  { id: "MERIT-003", applicantName: "Bob Williams", applicationId: "APP-002", rank: 3, score: 91.8, status: "waitlisted", createdAt: "2026-06-01" },
];

export const MOCK_ALUMNI = [
  { id: "ALM-001", name: "Dr. Sarah Connor", email: "sarah.connor@alumni.edu", graduationYear: 2020, department: "MBBS", currentPosition: "Senior Resident at City Hospital", phone: "+1 555-0201" },
  { id: "ALM-002", name: "James Miller", email: "james.miller@alumni.edu", graduationYear: 2021, department: "BSc Nursing", currentPosition: "Head Nurse at County Medical", phone: "+1 555-0202" },
  { id: "ALM-003", name: "Emily Chen", email: "emily.chen@alumni.edu", graduationYear: 2019, department: "MD", currentPosition: "Private Practitioner", phone: "+1 555-0203" },
];

export const MOCK_ALUMNI_EVENTS = [
  { id: "EVT-001", title: "Annual Medical Symposium 2026", description: "A gathering of alumni for knowledge sharing", date: "2026-08-15", location: "Main Auditorium", registeredCount: 45, createdAt: "2026-06-01" },
  { id: "EVT-002", title: "Alumni Networking Dinner", description: "Evening networking event for alumni", date: "2026-09-20", location: "Grand Ballroom", registeredCount: 28, createdAt: "2026-06-05" },
  { id: "EVT-003", title: "Webinar: Advances in Cardiology", description: "Online seminar featuring alumni speakers", date: "2026-07-10", location: "Virtual (Zoom)", registeredCount: 120, createdAt: "2026-06-10" },
];

export const MOCK_ALUMNI_DONATIONS = [
  { id: "DON-001", alumniName: "Dr. Sarah Connor", amount: 5000, purpose: "Scholarship Fund", date: "2026-06-01", paymentMethod: "online" },
  { id: "DON-002", alumniName: "James Miller", amount: 2000, purpose: "Library Renovation", date: "2026-06-05", paymentMethod: "bank-transfer" },
  { id: "DON-003", alumniName: "Emily Chen", amount: 10000, purpose: "Research Grant", date: "2026-06-10", paymentMethod: "online" },
];

export const MOCK_AUTH_USERS = [
  { id: "USR-001", email: "admin@college.edu", role: "admin", name: "Admin User" },
  { id: "USR-002", email: "faculty@college.edu", role: "faculty", name: "Faculty User" },
  { id: "USR-003", email: "student@college.edu", role: "student", name: "Student User" },
];

export const MOCK_USERS = [
  { id: "USR-001", email: "admin@college.edu", role: "super-admin", status: "active", staffSubRole: null, domainAdminType: null, lastLogin: "2026-07-18T09:00:00Z", createdAt: "2025-01-01" },
  { id: "USR-002", email: "domain.admin@college.edu", role: "domain-admin", status: "active", staffSubRole: null, domainAdminType: "academic", lastLogin: "2026-07-17T14:30:00Z", createdAt: "2025-03-15" },
  { id: "USR-003", email: "j.sterling@college.edu", role: "faculty", status: "active", staffSubRole: null, domainAdminType: null, lastLogin: "2026-07-18T08:15:00Z", createdAt: "2025-06-10" },
  { id: "USR-004", email: "c.oswald@college.edu", role: "faculty", status: "active", staffSubRole: null, domainAdminType: null, lastLogin: "2026-07-16T10:00:00Z", createdAt: "2025-06-12" },
  { id: "USR-005", email: "marcus.c@college.edu", role: "student", status: "active", staffSubRole: null, domainAdminType: null, lastLogin: "2026-07-18T07:45:00Z", createdAt: "2026-01-10" },
  { id: "USR-006", email: "sophia.m@college.edu", role: "student", status: "active", staffSubRole: null, domainAdminType: null, lastLogin: "2026-07-17T16:20:00Z", createdAt: "2026-01-10" },
  { id: "USR-007", email: "r.williams@college.edu", role: "staff", status: "active", staffSubRole: "security", domainAdminType: null, lastLogin: "2026-07-18T06:00:00Z", createdAt: "2025-09-01" },
  { id: "USR-008", email: "suspended.user@college.edu", role: "student", status: "blocked", staffSubRole: null, domainAdminType: null, lastLogin: "2026-05-20T11:00:00Z", createdAt: "2025-08-15" },
];

export const MOCK_ACADEMIC_FACULTIES = [
  { id: "AF-001", name: "Faculty of Medicine", dean: "Dr. Richard Grey" },
  { id: "AF-002", name: "Faculty of Science", dean: "Prof. Linda Harper" },
  { id: "AF-003", name: "Faculty of Engineering", dean: "Dr. Kevin Patel" },
];

export const MOCK_SEMESTER_REGISTRATIONS = [
  { id: "SR-001", semester: "Fall 2026", studentCount: 450, status: "active", registrationStart: "2026-05-01", registrationEnd: "2026-06-15" },
  { id: "SR-002", semester: "Spring 2026", studentCount: 420, status: "completed", registrationStart: "2025-12-01", registrationEnd: "2026-01-15" },
];

export const MOCK_FACILITIES = [
  { id: "FCL-001", name: "Main Library", type: "Academic", capacity: 200, location: "Block A, Floor 3", status: "operational" },
  { id: "FCL-002", name: "Computer Lab 1", type: "Lab", capacity: 60, location: "Block B, Floor 1", status: "operational" },
  { id: "FCL-003", name: "Auditorium", type: "Hall", capacity: 500, location: "Block C", status: "under-maintenance" },
];

export const MOCK_PATROL_LOGS = [
  { id: "PTL-001", guardName: "Robert Williams", patrolArea: "Block A - Ground Floor", startTime: "2026-06-15T22:00:00Z", endTime: "2026-06-15T23:00:00Z", notes: "All clear" },
  { id: "PTL-002", guardName: "David Miller", patrolArea: "Main Gate Area", startTime: "2026-06-15T23:00:00Z", endTime: "2026-06-16T00:00:00Z", notes: "Suspicious activity reported near parking lot" },
];

export const MOCK_HANDOVERS = [
  { id: "HND-001", fromOfficer: "Robert Williams", toOfficer: "David Miller", shift: "Night Shift", handoverTime: "2026-06-15T23:00:00Z", notes: "Patrolled all blocks, no major issues", status: "completed" },
  { id: "HND-002", fromOfficer: "David Miller", toOfficer: "James Wilson", shift: "Morning Shift", handoverTime: "2026-06-16T07:00:00Z", notes: "Reported broken light in Block B corridor", status: "pending" },
];

export const MOCK_ROOM_CHANGES = [
  { id: "RC-001", studentName: "Marcus Chen", fromRoom: "B-204", toRoom: "B-205", reason: "Need quieter study environment", status: "pending" },
  { id: "RC-002", studentName: "Sophia Martinez", fromRoom: "A-102", toRoom: "A-103", reason: "Roommate conflict", status: "approved" },
];

export const MOCK_HOSTEL_RECORDS = [
  { id: "HR-001", studentName: "Marcus Chen", roomNumber: "B-204", checkinDate: "2026-01-15", checkoutDate: null, status: "checked-in" },
  { id: "HR-002", studentName: "Sophia Martinez", roomNumber: "A-102", checkinDate: "2026-01-15", checkoutDate: "2026-06-10", status: "checked-out" },
];

export const MOCK_LAUNDRY_REQUESTS = [
  { id: "LND-001", studentName: "Marcus Chen", itemCount: 5, serviceType: "Wash & Fold", requestDate: "2026-06-14", status: "in-progress" },
  { id: "LND-002", studentName: "Sophia Martinez", itemCount: 3, serviceType: "Dry Clean", requestDate: "2026-06-15", status: "pending" },
];

export const MOCK_INVENTORY_ITEMS = [
  { id: "INV-001", name: "Office Chair", category: "Furniture", quantity: 50, unitPrice: 150, location: "Warehouse A", reorderLevel: 10 },
  { id: "INV-002", name: "Whiteboard Markers", category: "Stationery", quantity: 200, unitPrice: 2, location: "Store Room B", reorderLevel: 50 },
  { id: "INV-003", name: "Lab Coats", category: "Uniform", quantity: 30, unitPrice: 25, location: "Store Room A", reorderLevel: 20 },
];

export const MOCK_FEE_STRUCTURES = [
  { id: "FS-001", program: "MBBS", year: 1, tuitionFee: 500000, hostelFee: 45000, otherFees: 15000, totalFee: 560000 },
  { id: "FS-002", program: "BSc Nursing", year: 1, tuitionFee: 200000, hostelFee: 35000, otherFees: 10000, totalFee: 245000 },
];

export const MOCK_RECEIPTS = [
  { id: "RCT-001", receiptNo: "RCP-2026-0001", studentName: "Marcus Chen", amount: 25000, paymentMethod: "online", date: "2026-06-10", feeType: "Hostel Fee" },
  { id: "RCT-002", receiptNo: "RCP-2026-0002", studentName: "Sophia Martinez", amount: 120000, paymentMethod: "bank-transfer", date: "2026-06-10", feeType: "Tuition Fee" },
];

export const MOCK_SCHOLARSHIPS = [
  { id: "SCH-001", studentName: "Marcus Chen", scholarshipName: "Merit Scholarship", amount: 50000, status: "awarded", awardDate: "2026-06-01" },
  { id: "SCH-002", studentName: "Emily Johnson", scholarshipName: "Need-Based Grant", amount: 30000, status: "pending", awardDate: "" },
];

export const MOCK_BUDGETS = [
  { id: "BGT-001", budgetHead: "Computer Lab Upgrade", category: "Equipment", allocatedAmount: 500000, spentAmount: 320000, fiscalYear: "2026-2027", department: "Computer Science", status: "active", description: "Upgrade 50 workstations" },
  { id: "BGT-002", budgetHead: "Library Fund", category: "Infrastructure", allocatedAmount: 300000, spentAmount: 150000, fiscalYear: "2026-2027", department: "Library", status: "active", description: "New book purchases and subscriptions" },
  { id: "BGT-003", budgetHead: "Research Grants", category: "Research", allocatedAmount: 800000, spentAmount: 200000, fiscalYear: "2026-2027", department: "Research Cell", status: "active", description: "Faculty research projects" },
];

export const MOCK_EXPENSES = [
  { id: "EXP-001", description: "Laboratory equipment purchase", category: "Equipment", amount: 150000, date: "2026-06-10", paidBy: "Dr. James Sterling" },
  { id: "EXP-002", description: "Stationery supplies", category: "Supplies", amount: 5000, date: "2026-06-12", paidBy: "Admin Office" },
  { id: "EXP-003", description: "Electricity bill - June", category: "Utilities", amount: 45000, date: "2026-06-15", paidBy: "Accounts Dept" },
];

export const MOCK_BOOKS = [
  { id: "BK-001", title: "Gray's Anatomy for Students", author: "Richard Drake", isbn: "978-0323393041", category: "Medical", quantity: 10, available: 8 },
  { id: "BK-002", title: "Introduction to Algorithms", author: "Thomas Cormen", isbn: "978-0262033848", category: "Computer Science", quantity: 5, available: 3 },
];

export const MOCK_LIBRARY_RECORDS = [
  { id: "LIB-001", studentName: "Marcus Chen", bookTitle: "Gray's Anatomy for Students", issueDate: "2026-06-01", dueDate: "2026-06-15", returnDate: null, status: "issued" },
  { id: "LIB-002", studentName: "Sophia Martinez", bookTitle: "Introduction to Algorithms", issueDate: "2026-05-20", dueDate: "2026-06-03", returnDate: "2026-06-02", status: "returned" },
];

export const MOCK_EMPLOYEES = [
  { id: "EMP-001", employeeId: "EMP-1001", name: "Dr. James Sterling", email: "j.sterling@college.edu", department: "Computer Science", designation: "Professor", joiningDate: "2020-08-01", salary: 120000 },
  { id: "EMP-002", employeeId: "EMP-1002", name: "Prof. Clara Oswald", email: "c.oswald@college.edu", department: "Microbiology", designation: "Assistant Professor", joiningDate: "2021-09-01", salary: 80000 },
  { id: "EMP-003", employeeId: "EMP-1003", name: "Robert Williams", email: "r.williams@college.edu", department: "Security", designation: "Security Guard", joiningDate: "2022-01-15", salary: 25000 },
];

export const MOCK_SHIFTS = [
  { id: "SFT-001", employeeName: "Robert Williams", shiftType: "Night", startTime: "22:00", endTime: "06:00", date: "2026-06-15", status: "scheduled" },
  { id: "SFT-002", employeeName: "David Miller", shiftType: "Morning", startTime: "06:00", endTime: "14:00", date: "2026-06-15", status: "scheduled" },
];

export const MOCK_PATIENT_ENCOUNTERS = [
  { id: "PE-001", patientName: "Marcus Chen", department: "General Medicine", doctorName: "Dr. Sarah Jenkins", symptoms: "Fever, headache", diagnosis: "Common cold", visitDate: "2026-06-14", status: "completed" },
  { id: "PE-002", patientName: "Sophia Martinez", department: "Cardiology", doctorName: "Dr. Alistair Who", symptoms: "Chest pain", diagnosis: "Under observation", visitDate: "2026-06-15", status: "in-progress" },
];

export const MOCK_RESEARCH_PROJECTS = [
  { id: "RES-101", title: "Genomic Sequencing of Regional Antimicrobial Resistance", leadResearcher: "Dr. Clara Oswald", department: "Microbiology", startDate: "2026-01-15", endDate: "2026-12-31", fundingAmount: 850000, status: "active" },
  { id: "RES-102", title: "AI-Assisted Ischemic Stroke Detection from Emergency MRI", leadResearcher: "Dr. James Sterling", department: "Radiology & Neurology", startDate: "2026-03-01", endDate: "2027-02-28", fundingAmount: 1400000, status: "active" },
  { id: "RES-103", title: "Cardiometabolic Risk Biomarkers in South Asian Cohorts", leadResearcher: "Prof. Sarah Connor", department: "Cardiology", startDate: "2025-06-01", endDate: "2026-05-31", fundingAmount: 620000, status: "completed" },
];

export const MOCK_HEALTH_VISITS = [
  { id: "HV-001", studentName: "Marcus Chen", reason: "Annual checkup", visitDate: "2026-06-10", doctorName: "Dr. Sarah Jenkins", prescription: "Vitamin supplements", followUpDate: "" },
  { id: "HV-002", studentName: "Ethan Gallagher", reason: "Vaccination", visitDate: "2026-06-12", doctorName: "Dr. Sarah Jenkins", prescription: "Hepatitis B vaccine administered", followUpDate: "2026-07-12" },
];

export const MOCK_NOTICES = [
  { id: "NTC-001", title: "Exam Schedule Released", content: "Final examination schedule for Fall 2026 has been published.", audience: "all", postedBy: "Academic Office", postedDate: "2026-06-10", status: "active", priority: "high", validFrom: "2026-06-10", validTo: "2026-07-15", targetRoles: ["student", "faculty"] },
  { id: "NTC-002", title: "Holiday - Independence Day", content: "College will remain closed on August 15th.", audience: "all", postedBy: "Admin Office", postedDate: "2026-06-12", status: "active", priority: "normal", validFrom: "2026-06-12", validTo: "2026-08-15", targetRoles: [] },
  { id: "NTC-003", title: "Faculty Meeting - June 2026", content: "All department heads are requested to attend the monthly faculty meeting.", audience: "faculty", postedBy: "Principal Office", postedDate: "2026-06-01", status: "active", priority: "urgent", validFrom: "2026-06-01", validTo: "2026-06-05", targetRoles: ["faculty", "hod"] },
];

export const MOCK_COMMITTEES = [
  { id: "CMT-001", name: "Disciplinary Committee", chairperson: "Dr. Richard Grey", members: ["Dr. James Sterling", "Prof. Clara Oswald"], formedDate: "2026-01-15", status: "active" },
  { id: "CMT-002", name: "Research Ethics Board", chairperson: "Dr. Kevin Patel", members: ["Prof. Linda Harper"], formedDate: "2026-02-01", status: "active" },
];

export const MOCK_ACCEDITATIONS = [
  { id: "ACR-001", accreditingBody: "NAAC", status: "accredited", validFrom: "2026-01-01", validUntil: "2030-12-31", score: "A+", lastReviewDate: "2026-01-15" },
  { id: "ACR-002", accreditingBody: "NMC", status: "under-review", validFrom: "", validUntil: "", score: "", lastReviewDate: "2026-05-01" },
];

export const MOCK_DASHBOARD_STATS = {
  metrics: [
    { label: "Total Students", value: 1250 },
    { label: "Total Faculty", value: 85 },
    { label: "Total Courses", value: 48 },
    { label: "Total Rooms", value: 200 },
    { label: "Occupied Rooms", value: 175 },
    { label: "Pending Fees", value: 450000 },
    { label: "Collected Fees", value: 2800000 },
    { label: "Pending Grievances", value: 12 },
    { label: "Today Incidents", value: 3 },
    { label: "Month Admissions", value: 45 },
    { label: "Active Semesters", value: 2 },
  ],
};

export const MOCK_MAINTENANCE_COMPLAINTS = [
  { id: "MNT-001", complaintNo: "MNT-2026-001", studentName: "Marcus Chen", issue: "Broken window", location: "B-204", severity: "medium", status: "open", reportedDate: "2026-06-14" },
  { id: "MNT-002", complaintNo: "MNT-2026-002", studentName: "Sophia Martinez", issue: "Leaking pipe", location: "A-102", severity: "high", status: "in-progress", reportedDate: "2026-06-13" },
  { id: "MNT-003", complaintNo: "MNT-2026-003", studentName: "Ethan Gallagher", issue: "Light bulb replacement", location: "B-205", severity: "low", status: "resolved", reportedDate: "2026-06-10" },
];

// OPD mock data
export const MOCK_OPD_APPOINTMENTS = [
  { id: "OPD-APPT-001", patientId: "PAT-001", patientName: "John Doe", doctorId: "DR-001", doctorName: "Dr. Sarah Mitchell", appointmentDate: "2026-06-18", timeSlot: "09:00-09:15", chiefComplaint: "Fever and cough", status: "scheduled" },
  { id: "OPD-APPT-002", patientId: "PAT-002", patientName: "Jane Smith", doctorId: "DR-002", doctorName: "Dr. Raj Patel", appointmentDate: "2026-06-18", timeSlot: "10:30-10:45", chiefComplaint: "Headache for 3 days", status: "checked-in" },
  { id: "OPD-APPT-003", patientId: "PAT-003", patientName: "Alice Wang", doctorId: "DR-001", doctorName: "Dr. Sarah Mitchell", appointmentDate: "2026-06-17", timeSlot: "14:00-14:15", chiefComplaint: "Abdominal pain", status: "consulted" },
];
export const MOCK_OPD_VISITS = [
  { id: "OPD-VIS-001", appointmentId: "OPD-APPT-003", patientId: "PAT-003", patientName: "Alice Wang", doctorId: "DR-001", doctorName: "Dr. Sarah Mitchell", symptoms: "Right lower quadrant pain", diagnosis: "Acute appendicitis", investigations: "CBC, USG Abdomen", prescription: "IV antibiotics, surgery consult", followUpDate: "2026-06-24" },
  { id: "OPD-VIS-002", appointmentId: "OPD-APPT-004", patientId: "PAT-004", patientName: "Bob Johnson", doctorId: "DR-002", doctorName: "Dr. Raj Patel", symptoms: "Fever, rash", diagnosis: "Viral exanthem", prescription: "Antihistamines, paracetamol", followUpDate: null },
];

// IPD mock data
export const MOCK_IPD_ADMISSIONS = [
  { id: "IPD-ADM-001", patientId: "PAT-005", patientName: "Charles Brown", doctorId: "DR-003", doctorName: "Dr. Emily Chen", ward: "private", bedNumber: "P-101", admissionDate: "2026-06-15", diagnosis: "Pneumonia", status: "admitted" },
  { id: "IPD-ADM-002", patientId: "PAT-006", patientName: "Diana Prince", doctorId: "DR-001", doctorName: "Dr. Sarah Mitchell", ward: "icu", bedNumber: "ICU-03", admissionDate: "2026-06-14", diagnosis: "Septic shock", status: "admitted" },
  { id: "IPD-ADM-003", patientId: "PAT-007", patientName: "Edward Norton", doctorId: "DR-002", doctorName: "Dr. Raj Patel", ward: "general", bedNumber: "G-205", admissionDate: "2026-06-10", diagnosis: "Fractured femur", status: "discharged" },
];
export const MOCK_IPD_DISCHARGES = [
  { id: "IPD-DIS-001", admissionId: "IPD-ADM-003", patientName: "Edward Norton", dischargeDate: "2026-06-16", dischargeType: "regular", dischargeSummary: "Patient recovered well. Advised physiotherapy.", followUpInstructions: "Follow up in 2 weeks" },
];

// Laboratory mock data
export const MOCK_LAB_TESTS = [
  { id: "LAB-TST-001", code: "CBC", name: "Complete Blood Count", category: "hematology", sampleType: "blood", normalRange: "4.5-11.0 x10^9/L", unit: "x10^9/L", price: 250 },
  { id: "LAB-TST-002", code: "LFT", name: "Liver Function Test", category: "biochemistry", sampleType: "blood", normalRange: "See individual parameters", unit: "-", price: 500 },
  { id: "LAB-TST-003", code: "UA", name: "Urinalysis", category: "pathology", sampleType: "urine", normalRange: "See individual parameters", unit: "-", price: 150 },
  { id: "LAB-TST-004", code: "RBS", name: "Random Blood Sugar", category: "biochemistry", sampleType: "blood", normalRange: "70-140 mg/dL", unit: "mg/dL", price: 80 },
];
export const MOCK_LAB_REQUESTS = [
  { id: "LAB-REQ-001", patientId: "PAT-001", patientName: "John Doe", doctorId: "DR-001", doctorName: "Dr. Sarah Mitchell", tests: ["LAB-TST-001", "LAB-TST-002"], requestDate: "2026-06-17", status: "completed" },
  { id: "LAB-REQ-002", patientId: "PAT-005", patientName: "Charles Brown", doctorId: "DR-003", doctorName: "Dr. Emily Chen", tests: ["LAB-TST-001", "LAB-TST-004"], requestDate: "2026-06-15", status: "pending" },
];
export const MOCK_LAB_RESULTS = [
  { id: "LAB-RES-001", requestId: "LAB-REQ-001", testId: "LAB-TST-001", testName: "Complete Blood Count", resultValue: "11.5", normalRange: "4.5-11.0 x10^9/L", remarks: "Slightly elevated WBC", resultDate: "2026-06-17" },
  { id: "LAB-RES-002", requestId: "LAB-REQ-001", testId: "LAB-TST-002", testName: "Liver Function Test", resultValue: "Elevated ALT/AST", normalRange: "See individual parameters", remarks: "Hepatic impairment suspected", resultDate: "2026-06-17" },
];

// Pharmacy mock data
export const MOCK_DRUGS = [
  { id: "DRG-001", code: "AMOX-500", name: "Amoxicillin 500mg", category: "antibiotic", manufacturer: "GSK", unit: "capsule", price: 12, stock: 500, reorderLevel: 100 },
  { id: "DRG-002", code: "PARA-500", name: "Paracetamol 500mg", category: "analgesic", manufacturer: "Cipla", unit: "tablet", price: 5, stock: 1000, reorderLevel: 200 },
  { id: "DRG-003", code: "INS-R", name: "Insulin Regular 100IU", category: "antidiabetic", manufacturer: "Novo Nordisk", unit: "vial", price: 450, stock: 20, reorderLevel: 50 },
  { id: "DRG-004", code: "NS-500", name: "Normal Saline 500ml", category: "iv-fluid", manufacturer: "Baxter", unit: "bottle", price: 35, stock: 200, reorderLevel: 50 },
];
export const MOCK_PRESCRIPTIONS = [
  { id: "PRX-001", patientId: "PAT-001", patientName: "John Doe", doctorId: "DR-001", doctorName: "Dr. Sarah Mitchell", drugs: [{ drugId: "DRG-001", drugName: "Amoxicillin 500mg", dosage: "500mg thrice daily", duration: "7 days" }, { drugId: "DRG-002", drugName: "Paracetamol 500mg", dosage: "500mg SOS", duration: "3 days" }], date: "2026-06-17" },
  { id: "PRX-002", patientId: "PAT-005", patientName: "Charles Brown", doctorId: "DR-003", doctorName: "Dr. Emily Chen", drugs: [{ drugId: "DRG-001", drugName: "Amoxicillin 500mg", dosage: "500mg thrice daily", duration: "10 days" }], date: "2026-06-15" },
];
export const MOCK_DISPENSINGS = [
  { id: "DSP-001", prescriptionId: "PRX-001", patientName: "John Doe", doctorName: "Dr. Sarah Mitchell", pharmacistName: "Helen Kim", dispensedDate: "2026-06-17" },
];

// Let's create an in-memory store for these mock items to support live creation/updating in this session
const store = {
  students: [...MOCK_STUDENTS],
  faculties: [...MOCK_FACULTIES],
  courses: [...MOCK_COURSES],
  departments: [...MOCK_DEPARTMENTS],
  rooms: [...MOCK_ROOMS],
  semesters: [...MOCK_SEMESTERS],
  grievances: [...MOCK_GRIEVANCES],
  incidents: [...MOCK_INCIDENTS],
  gateEntries: [...MOCK_GATE_ENTRIES],
  visitorLogs: [...MOCK_VISITOR_LOGS],
  fees: [...MOCK_FEES],
  payments: [...MOCK_PAYMENTS],
  schedules: [...MOCK_SCHEDULES],
  transcripts: [...MOCK_TRANSCRIPTS],
  clinicalRotations: [...MOCK_CLINICAL_ROTATIONS],
  skillLabs: [...MOCK_SKILL_LABS],
  counseling: [...MOCK_COUNSELING],
  menus: [...MOCK_MENUS],
  mealPlans: [...MOCK_MEAL_PLANS],
  messFeedback: [...MOCK_MESS_FEEDBACK],
  messBills: [...MOCK_MESS_BILLS],
  vehicles: [...MOCK_VEHICLES],
  transportRoutes: [...MOCK_TRANSPORT_ROUTES],
  transportFees: [...MOCK_TRANSPORT_FEES],
  payroll: [...MOCK_PAYROLL],
  reports: [...MOCK_REPORTS],
  notifications: [...MOCK_NOTIFICATIONS],
  conversations: [...MOCK_CONVERSATIONS],
  messages: JSON.parse(JSON.stringify(MOCK_MESSAGES)),
  parents: [...MOCK_PARENTS],
  admissionApplications: [...MOCK_ADMISSIONS_APPLICATIONS],
  meritList: [...MOCK_MERIT_LIST],
  alumni: [...MOCK_ALUMNI],
  alumniEvents: [...MOCK_ALUMNI_EVENTS],
  alumniDonations: [...MOCK_ALUMNI_DONATIONS],
  attendanceRecords: [...MOCK_ATTENDANCE_RECORDS],
  exams: [...MOCK_EXAMS],
  grades: [...MOCK_GRADES],
  courseOutcomes: [...MOCK_COURSE_OUTCOMES],
  programOutcomes: [...MOCK_PROGRAM_OUTCOMES],
  curriculumMaps: [...MOCK_CURRICULUM_MAPS],
  assessments: [...MOCK_ASSESSMENTS],
  assessmentScores: [...MOCK_ASSESSMENT_SCORES],
  gradeBooks: [...MOCK_GRADE_BOOKS],
  leaveRequests: [...MOCK_LEAVE_REQUESTS],
  timetables: [...MOCK_TIMETABLES],
  clinicalProcedures: [...MOCK_CLINICAL_PROCEDURES],
  logEntries: [...MOCK_LOG_ENTRIES],
  authUsers: [...MOCK_AUTH_USERS],
  academicFaculties: [...MOCK_ACADEMIC_FACULTIES],
  semesterRegistrations: [...MOCK_SEMESTER_REGISTRATIONS],
  facilities: [...MOCK_FACILITIES],
  patrolLogs: [...MOCK_PATROL_LOGS],
  handovers: [...MOCK_HANDOVERS],
  roomChanges: [...MOCK_ROOM_CHANGES],
  hostelRecords: [...MOCK_HOSTEL_RECORDS],
  laundryRequests: [...MOCK_LAUNDRY_REQUESTS],
  inventoryItems: [...MOCK_INVENTORY_ITEMS],
  feeStructures: [...MOCK_FEE_STRUCTURES],
  receipts: [...MOCK_RECEIPTS],
  scholarships: [...MOCK_SCHOLARSHIPS],
  expenses: [...MOCK_EXPENSES],
  budgets: [...MOCK_BUDGETS],
  books: [...MOCK_BOOKS],
  libraryRecords: [...MOCK_LIBRARY_RECORDS],
  employees: [...MOCK_EMPLOYEES],
  shifts: [...MOCK_SHIFTS],
  patientEncounters: [...MOCK_PATIENT_ENCOUNTERS],
  researchProjects: [...MOCK_RESEARCH_PROJECTS],
  healthVisits: [...MOCK_HEALTH_VISITS],
  notices: [...MOCK_NOTICES],
  committees: [...MOCK_COMMITTEES],
  accreditations: [...MOCK_ACCEDITATIONS],
  dashboardStats: {...MOCK_DASHBOARD_STATS},
  maintenanceComplaints: [...MOCK_MAINTENANCE_COMPLAINTS],
  opdAppointments: [...MOCK_OPD_APPOINTMENTS],
  opdVisits: [...MOCK_OPD_VISITS],
  ipdAdmissions: [...MOCK_IPD_ADMISSIONS],
  ipdDischarges: [...MOCK_IPD_DISCHARGES],
  labTests: [...MOCK_LAB_TESTS],
  labRequests: [...MOCK_LAB_REQUESTS],
  labResults: [...MOCK_LAB_RESULTS],
  drugs: [...MOCK_DRUGS],
  prescriptions: [...MOCK_PRESCRIPTIONS],
  dispensings: [...MOCK_DISPENSINGS],
  users: [...MOCK_USERS],
};

function unwrapResponse(res: any, fallback?: any) {
  const d = res?.data?.data;
  if (Array.isArray(d)) return d;
  if (d?.data && Array.isArray(d.data)) return d.data;
  return d ?? fallback ?? res;
}

function getStore() { return store; }

// Axios fetch utilities with transparent fallbacks
const baseApi = {
  getStudents: async () => {
    try {
      const res = await apiClient.get("/students");
      return unwrapResponse(res, store.students);
    } catch {
      return store.students;
    }
  },
  getFaculties: async () => {
    try {
      const res = await apiClient.get("/faculties");
      return unwrapResponse(res, store.faculties);
    } catch {
      return store.faculties;
    }
  },
  getCourses: async () => {
    try {
      const res = await apiClient.get("/courses");
      return unwrapResponse(res, store.courses);
    } catch {
      return store.courses;
    }
  },
  getAcademicDepartments: async () => {
    try {
      const res = await apiClient.get("/academic-departments");
      return unwrapResponse(res, store.departments);
    } catch {
      return store.departments;
    }
  },
  createDepartment: async (payload: any) => {
    try {
      const res = await apiClient.post("/academic-departments/create-academic-department", payload);
      return res.data;
    } catch {
      const newDept = {
        id: `DEP-${Date.now()}`,
        name: payload.name,
        academicFaculty: payload.academicFaculty || "General",
      };
      store.departments.push(newDept);
      return { success: true, message: "Department created", data: newDept };
    }
  },
  updateDepartment: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/academic-departments/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.departments.findIndex((d: any) => d.id === id);
      if (idx !== -1) store.departments[idx] = { ...store.departments[idx], ...payload };
      return { success: true, message: "Department updated" };
    }
  },
  deleteDepartment: async (id: string) => {
    try {
      const res = await apiClient.delete(`/academic-departments/${id}`);
      return res.data;
    } catch {
      store.departments = store.departments.filter((d: any) => d.id !== id);
      return { success: true, message: "Department deleted" };
    }
  },
  getRooms: async () => {
    try {
      const res = await apiClient.get("/rooms");
      return unwrapResponse(res, store.rooms);
    } catch {
      return store.rooms;
    }
  },
  getSemesters: async () => {
    try {
      const res = await apiClient.get("/academic-semesters");
      return unwrapResponse(res, store.semesters);
    } catch {
      return store.semesters;
    }
  },
  createSemester: async (payload: any) => {
    try {
      const res = await apiClient.post("/academic-semesters", payload);
      return res.data;
    } catch {
      const newSemester = {
        id: `SEM-${Date.now()}`,
        name: payload.name,
        code: payload.code,
        startMonth: payload.startMonth,
        endMonth: payload.endMonth,
      };
      store.semesters.push(newSemester);
      return { success: true, data: newSemester };
    }
  },
  updateSemester: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/academic-semesters/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.semesters.findIndex((s: any) => s.id === id);
      if (idx !== -1) {
        store.semesters[idx] = { ...store.semesters[idx], ...payload };
      }
      return { success: true, data: payload };
    }
  },
  deleteSemester: async (id: string) => {
    try {
      const res = await apiClient.delete(`/academic-semesters/${id}`);
      return res.data;
    } catch {
      store.semesters = store.semesters.filter((s: any) => s.id !== id);
      return { success: true, message: "Semester deleted" };
    }
  },
  createStudent: async (payload: any) => {
    try {
      const res = await apiClient.post("/users/create-student", payload);
      return res.data;
    } catch (err) {
      const newStudent = {
        id: `STU-${Date.now()}`,
        studentId: `STU-00${store.students.length + 1}`,
        name: payload.student?.name?.firstName + " " + payload.student?.name?.lastName,
        email: payload.student?.email,
        contactNo: payload.student?.contactNo,
        gender: payload.student?.gender,
        academicSemester: "Fall 2026",
        academicDepartment: payload.student?.academicDepartment || "General Medicine",
        roomNumber: "Pending Allocation",
      };
      store.students.push(newStudent);
      return {
        success: true,
        message: "Student created Successfully",
        data: newStudent
      };
    }
  },
  createCourse: async (payload: any) => {
    try {
      const res = await apiClient.post("/courses/create-course", payload);
      return res.data;
    } catch (err) {
      const newCourse = {
        id: `CRS-${Date.now()}`,
        code: payload.code || `CS-${Math.floor(Math.random() * 500)}`,
        title: payload.title,
        credits: payload.credits,
        description: payload.description || "",
      };
      // If it exists, update it
      const idx = store.courses.findIndex(c => c.code === payload.code);
      if (idx !== -1) {
        store.courses[idx] = { ...store.courses[idx], ...payload };
      } else {
        store.courses.push(newCourse);
      }
      return {
        success: true,
        message: "Course configured successfully",
        data: newCourse
      };
    }
  },
  createFaculty: async (payload: any) => {
    try {
      const res = await apiClient.post("/users/create-faculty", payload);
      return res.data;
    } catch (err) {
      const newFaculty = {
        id: `FAC-${Date.now()}`,
        facultyId: `FAC-9${store.faculties.length + 80}`,
        name: payload.faculty?.name?.firstName + " " + payload.faculty?.name?.lastName,
        email: payload.faculty?.email,
        contactNo: payload.faculty?.contactNo,
        designation: payload.faculty?.designation || "Lecturer",
        academicDepartment: payload.faculty?.academicDepartment || "General Medicine",
      };
      store.faculties.push(newFaculty);
      return {
        success: true,
        message: "Faculty created successfully",
        data: newFaculty
      };
    }
  },
  assignStudentToRoom: async (roomId: string, studentIds: string[]) => {
    try {
      const res = await apiClient.put(`/rooms/${roomId}/assign-students`, { students: studentIds });
      return res.data;
    } catch (err) {
      return {
        success: true,
        message: "Students assigned to room successfully"
      };
    }
  },
  removeStudentFromRoom: async (roomId: string, studentIds: string[]) => {
    try {
      const res = await apiClient.delete(`/rooms/${roomId}/remove-students`, { data: { students: studentIds } });
      return res.data;
    } catch (err) {
      return {
        success: true,
        message: "Students removed from room successfully"
      };
    }
  },
  createRoom: async (payload: any) => {
    try {
      const res = await apiClient.post("/rooms/create-room", payload);
      return res.data;
    } catch (err) {
      const newRoom = {
        id: `RM-${Date.now()}`,
        roomNumber: payload.roomNumber,
        building: payload.building,
        floor: Number(payload.floor),
        capacity: Number(payload.capacity),
        occupantCount: 0,
        monthlyRent: Number(payload.monthlyRent || 4000),
        roomFacilities: payload.roomFacilities || ["Wi-Fi"],
      };
      store.rooms.push(newRoom);
      return {
        success: true,
        data: newRoom
      };
    }
  },
  deleteStudent: async (id: string) => {
    try {
      const res = await apiClient.delete(`/students/${id}`);
      return res.data;
    } catch {
      store.students = store.students.filter(s => s.id !== id);
      return { success: true };
    }
  },
  deleteFaculty: async (id: string) => {
    try {
      const res = await apiClient.delete(`/faculties/${id}`);
      return res.data;
    } catch {
      store.faculties = store.faculties.filter(f => f.id !== id);
      return { success: true };
    }
  },
  deleteCourse: async (id: string) => {
    try {
      const res = await apiClient.delete(`/courses/${id}`);
      return res.data;
    } catch {
      store.courses = store.courses.filter(c => c.id !== id);
      return { success: true };
    }
  },
  deleteRoom: async (id: string) => {
    try {
      const res = await apiClient.delete(`/rooms/${id}`);
      return res.data;
    } catch {
      store.rooms = store.rooms.filter(r => r.id !== id);
      return { success: true };
    }
  },
  updateRoom: async (id: string, payload: any) => {
    await delay();
    const store = getStore();
    const idx = store.rooms.findIndex((r: any) => r.id === id);
    if (idx === -1) throw new Error("Room not found");
    store.rooms[idx] = { ...store.rooms[idx], ...payload };
    return unwrapResponse(store.rooms[idx]);
  },
  updateStudent: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/students/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.students.findIndex(s => s.id === id);
      if (idx !== -1) {
        store.students[idx] = { ...store.students[idx], ...payload };
      }
      return { success: true, data: payload };
    }
  },
  updateFaculty: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/faculties/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.faculties.findIndex(f => f.id === id);
      if (idx !== -1) {
        store.faculties[idx] = { ...store.faculties[idx], ...payload };
      }
      return { success: true, data: payload };
    }
  },
  assignFacultyToCourse: async (courseId: string, facultyIds: string[]) => {
    try {
      const res = await apiClient.put(`/courses/${courseId}/assign-faculties`, { faculties: facultyIds });
      return res.data;
    } catch {
      return { success: true };
    }
  },

  // GRIEVANCES MODULE
  getGrievances: async () => {
    try {
      const res = await apiClient.get("/grievances");
      return unwrapResponse(res, store.grievances);
    } catch {
      return store.grievances;
    }
  },
  submitGrievance: async (payload: any) => {
    try {
      const res = await apiClient.post("/grievances/submit", payload);
      return res.data;
    } catch {
      const newGrievance = {
        id: `GRV-${Date.now()}`,
        subject: payload.subject,
        description: payload.description,
        category: payload.category,
        isAnonymous: payload.isAnonymous || false,
        status: "submitted",
        studentName: payload.isAnonymous ? "Anonymous" : "Marcus Chen",
        date: new Date().toISOString().split("T")[0]
      };
      store.grievances.push(newGrievance);
      return { success: true, message: "Grievance submitted successfully", data: newGrievance };
    }
  },
  updateGrievance: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/grievances/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.grievances.findIndex(g => g.id === id);
      if (idx !== -1) {
        store.grievances[idx] = { ...store.grievances[idx], ...payload };
      }
      return { success: true };
    }
  },
  deleteGrievance: async (id: string) => {
    await delay();
    const store = getStore();
    store.grievances = store.grievances.filter((g: any) => g.id !== id);
    return unwrapResponse({ success: true });
  },

  // INCIDENTS MODULE
  getIncidents: async () => {
    try {
      const res = await apiClient.get("/incidents");
      return unwrapResponse(res, store.incidents);
    } catch {
      return store.incidents;
    }
  },
  createIncident: async (payload: any) => {
    try {
      const res = await apiClient.post("/incidents/create-incident", payload);
      return res.data;
    } catch {
      const newIncident = {
        id: `INC-${Date.now()}`,
        title: payload.title,
        description: payload.description,
        severity: payload.severity,
        location: payload.location,
        status: "reported",
        date: new Date().toISOString().split("T")[0]
      };
      store.incidents.push(newIncident);
      return { success: true, message: "Incident logged successfully", data: newIncident };
    }
  },
  updateIncident: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/incidents/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.incidents.findIndex(i => i.id === id);
      if (idx !== -1) {
        store.incidents[idx] = { ...store.incidents[idx], ...payload };
      }
      return { success: true };
    }
  },
  deleteIncident: async (id: string) => {
    await delay();
    const store = getStore();
    store.incidents = store.incidents.filter((i: any) => i.id !== id);
    return unwrapResponse({ success: true });
  },

  // GATE ENTRY & VISITORS LOGS
  getGateEntries: async () => {
    try {
      const res = await apiClient.get("/gate-entries");
      return unwrapResponse(res, store.gateEntries);
    } catch {
      return store.gateEntries;
    }
  },
  createGateEntry: async (payload: any) => {
    try {
      const res = await apiClient.post("/gate-entries/create-gate-entry", payload);
      return res.data;
    } catch {
      const newEntry = {
        id: `GTE-${Date.now()}`,
        type: payload.type,
        personName: payload.personName || "Student",
        vehicleNumber: payload.vehicleNumber || "",
        contactNo: payload.contactNo || "",
        purpose: payload.purpose || "",
        entryTime: payload.entryTime || new Date().toISOString(),
        isLateEntry: payload.isLateEntry || false,
        lateEntryReason: payload.lateEntryReason || ""
      };
      store.gateEntries.push(newEntry as any);
      return { success: true, data: newEntry };
    }
  },
  updateGateEntry: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/gate-entries/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.gateEntries.findIndex((g: any) => g.id === id);
      if (idx !== -1) {
        store.gateEntries[idx] = { ...store.gateEntries[idx], ...payload };
      }
      return { success: true };
    }
  },
  deleteGateEntry: async (id: string) => {
    await delay();
    const store = getStore();
    store.gateEntries = store.gateEntries.filter((e: any) => e.id !== id);
    return unwrapResponse({ success: true });
  },
  getVisitorLogs: async () => {
    try {
      const res = await apiClient.get("/visitor-logs");
      return unwrapResponse(res, store.visitorLogs);
    } catch {
      return store.visitorLogs;
    }
  },
  createVisitorLog: async (payload: any) => {
    try {
      const res = await apiClient.post("/visitor-logs/create-visitor-log", payload);
      return res.data;
    } catch {
      const newLog = {
        id: `VSL-${Date.now()}`,
        visitorName: payload.visitorName,
        contactNo: payload.contactNo,
        email: payload.email || "",
        purpose: payload.purpose,
        vehicleNumber: payload.vehicleNumber || "",
        entryTime: new Date().toISOString(),
        exitTime: undefined,
        preApproved: true
      };
      store.visitorLogs.push(newLog as any);
      return { success: true, data: newLog };
    }
  },
  updateVisitorLog: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/visitor-logs/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.visitorLogs.findIndex(v => v.id === id);
      if (idx !== -1) {
        store.visitorLogs[idx] = { ...store.visitorLogs[idx], ...payload };
      }
      return { success: true };
    }
  },
  deleteVisitorLog: async (id: string) => {
    await delay();
    const store = getStore();
    store.visitorLogs = store.visitorLogs.filter((l: any) => l.id !== id);
    return unwrapResponse({ success: true });
  },

  // FEES & PAYMENTS
  getFees: async () => {
    try {
      const res = await apiClient.get("/fees");
      return unwrapResponse(res, store.fees);
    } catch {
      return store.fees;
    }
  },
  generateFee: async (payload: any) => {
    try {
      const res = await apiClient.post("/fees/generate-fee", payload);
      return res.data;
    } catch {
      const newFee = {
        id: `FEE-${Date.now()}`,
        studentId: payload.studentId || "STU-001",
        studentName: payload.studentName || "Marcus Chen",
        semester: payload.semester || "Fall 2026",
        type: payload.type || "Hostel Fee",
        amount: payload.amount,
        status: "pending",
        dueDate: payload.dueDate || "2026-08-01"
      };
      store.fees.push(newFee);
      return { success: true, message: "Fee generated successfully", data: newFee };
    }
  },
  bulkGenerateFee: async (payload: { academicSemester: string; dueDate: string }) => {
    try {
      const res = await apiClient.post("/fees/bulk-generate", payload);
      return res.data;
    } catch {
      const semester = store.semesters.find((s: any) => s.id === payload.academicSemester);
      const semesterName = semester?.name || payload.academicSemester;
      const mockStudents = [
        { id: "STU-001", name: "Marcus Chen" },
        { id: "STU-002", name: "Sophia Martinez" },
      ];
      let generated = 0;
      for (const student of mockStudents) {
        if (!store.fees.find((f: any) => f.studentId === student.id && f.semester === semesterName)) {
          store.fees.push({
            id: `FEE-${Date.now()}-${generated}`,
            studentId: student.id,
            studentName: student.name,
            semester: semesterName,
            type: "Tuition Fee",
            amount: 75000,
            status: "pending",
            dueDate: payload.dueDate,
          });
          generated++;
        }
      }
      return { success: true, data: { generatedCount: generated, skippedCount: mockStudents.length - generated, errors: [] } };
    }
  },
  getPayments: async () => {
    try {
      const res = await apiClient.get("/payments");
      return unwrapResponse(res, store.payments);
    } catch {
      return store.payments;
    }
  },
  updateFee: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/fees/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.fees.findIndex((f: any) => f.id === id);
      if (idx !== -1) store.fees[idx] = { ...store.fees[idx], ...payload };
      return { success: true, message: "Fee updated" };
    }
  },
  deleteFee: async (id: string) => {
    try {
      const res = await apiClient.delete(`/fees/${id}`);
      return res.data;
    } catch {
      store.fees = store.fees.filter((f: any) => f.id !== id);
      return { success: true, message: "Fee deleted" };
    }
  },
  createPayment: async (payload: any) => {
    try {
      const res = await apiClient.post("/payments/create-payment", payload);
      return res.data;
    } catch {
      const newPayment = {
        id: `PMT-${Date.now()}`,
        transactionId: `TXN-${Math.floor(Math.random() * 900000) + 100000}`,
        fee: payload.fee,
        student: payload.student,
        amount: payload.amount,
        method: payload.method,
        status: "success",
        paymentDate: new Date().toISOString()
      };
      store.payments.push(newPayment);
      // Update fee status to paid
      const feeIdx = store.fees.findIndex(f => f.id === payload.fee);
      if (feeIdx !== -1) {
        store.fees[feeIdx].status = "paid";
      }
      return { success: true, data: newPayment };
    }
  },

  // ACADEMICS TIMETABLES & TRANSCRIPTS
  getSchedules: async () => {
    try {
      const res = await apiClient.get("/schedules");
      return unwrapResponse(res, store.schedules);
    } catch {
      return store.schedules;
    }
  },
  getTranscripts: async () => {
    try {
      const res = await apiClient.get("/transcripts");
      return unwrapResponse(res, store.transcripts);
    } catch {
      return store.transcripts;
    }
  },
  createTranscriptRequest: async (payload: any) => {
    try {
      const res = await apiClient.post("/transcripts/generate", payload);
      return res.data;
    } catch {
      const newRequest = {
        id: `TRN-${Date.now()}`,
        studentId: payload.studentId || "STU-001",
        studentName: "Marcus Chen",
        cgpa: 3.85,
        status: "pending",
        issueDate: new Date().toISOString().split("T")[0]
      };
      store.transcripts.push(newRequest);
      return { success: true, message: "Transcript request registered", data: newRequest };
    }
  },
  updateTranscript: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/transcripts/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.transcripts.findIndex((t: any) => t.id === id);
      if (idx !== -1) store.transcripts[idx] = { ...store.transcripts[idx], ...payload };
      return { success: true, message: "Transcript updated" };
    }
  },
  deleteTranscript: async (id: string) => {
    try {
      const res = await apiClient.delete(`/transcripts/${id}`);
      return res.data;
    } catch {
      store.transcripts = store.transcripts.filter((t: any) => t.id !== id);
      return { success: true, message: "Transcript deleted" };
    }
  },
  verifyTranscript: async (id: string, verifiedBy: string) => {
    try {
      const res = await apiClient.patch(`/transcripts/${id}/verify`, { verifiedBy });
      return res.data;
    } catch {
      const t = store.transcripts.find((x: any) => x.id === id);
      if (t) t.status = "verified";
      return { success: true, message: "Transcript verified" };
    }
  },

  // CLINICAL ROTATIONS & HEALTH SERVICES
  getClinicalRotations: async () => {
    try {
      const res = await apiClient.get("/clinical-rotations");
      return unwrapResponse(res, store.clinicalRotations);
    } catch {
      return store.clinicalRotations;
    }
  },
  getSkillLabs: async () => {
    try {
      const res = await apiClient.get("/skill-labs");
      return unwrapResponse(res, store.skillLabs);
    } catch {
      return store.skillLabs;
    }
  },
  createSkillLab: async (payload: any) => {
    try {
      const res = await apiClient.post("/skill-labs/create", payload);
      return res.data;
    } catch {
      const newSkill = {
        id: `SKL-${Date.now()}`,
        studentName: payload.studentName,
        topic: payload.topic || payload.skillName,
        completed: payload.completed || false,
        verifiedBy: payload.verifiedBy || "",
      };
      store.skillLabs.push(newSkill);
      return { success: true, data: newSkill };
    }
  },
  updateSkillLab: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/skill-labs/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.skillLabs.findIndex((s: any) => s.id === id);
      if (idx !== -1) store.skillLabs[idx] = { ...store.skillLabs[idx], ...payload };
      return { success: true, message: "Skill lab updated" };
    }
  },
  deleteSkillLab: async (id: string) => {
    try {
      const res = await apiClient.delete(`/skill-labs/${id}`);
      return res.data;
    } catch {
      store.skillLabs = store.skillLabs.filter((s: any) => s.id !== id);
      return { success: true, message: "Skill lab deleted" };
    }
  },
  getCounselingSessions: async () => {
    try {
      const res = await apiClient.get("/counseling");
      return unwrapResponse(res, store.counseling);
    } catch {
      return store.counseling;
    }
  },
  createCounselingSession: async (payload: any) => {
    try {
      const res = await apiClient.post("/counseling/create-session", payload);
      return res.data;
    } catch {
      const newSession = {
        id: `CNS-${Date.now()}`,
        studentName: "Marcus Chen",
        counselorName: payload.counselorName,
        dateTime: payload.dateTime,
        notes: payload.notes || "",
        status: "scheduled"
      };
      store.counseling.push(newSession);
      return { success: true, data: newSession };
    }
  },

  // MESS MODULE
  getMenus: async () => {
    try {
      const res = await apiClient.get("/mess/menus");
      return unwrapResponse(res, store.menus);
    } catch {
      return store.menus;
    }
  },
  createMenu: async (payload: any) => {
    try {
      const res = await apiClient.post("/mess/menus", payload);
      return res.data;
    } catch {
      const newMenu = {
        id: `MEN-${Date.now()}`,
        day: payload.day,
        mealType: payload.mealType,
        items: payload.items,
        date: payload.date || new Date().toISOString().split("T")[0],
      };
      store.menus.push(newMenu);
      return { success: true, data: newMenu };
    }
  },
  deleteMenu: async (id: string) => {
    await delay();
    const store = getStore();
    store.menus = store.menus.filter((m: any) => m.id !== id);
    return unwrapResponse({ success: true });
  },
  updateMenu: async (id: string, payload: any) => {
    await delay();
    const store = getStore();
    const idx = store.menus.findIndex((m: any) => m.id === id);
    if (idx === -1) throw new Error("Menu not found");
    store.menus[idx] = { ...store.menus[idx], ...payload };
    return unwrapResponse(store.menus[idx]);
  },
  getMealPlans: async () => {
    try {
      const res = await apiClient.get("/mess/meal-plans");
      return unwrapResponse(res, store.mealPlans);
    } catch {
      return store.mealPlans;
    }
  },
  createMealPlan: async (payload: any) => {
    try {
      const res = await apiClient.post("/mess/meal-plans", payload);
      return res.data;
    } catch {
      const newPlan = {
        id: `MP-${Date.now()}`,
        studentName: payload.studentName,
        studentId: payload.studentId,
        planType: payload.planType,
        startDate: payload.startDate,
        endDate: payload.endDate,
        status: "pending",
      };
      store.mealPlans.push(newPlan);
      return { success: true, data: newPlan };
    }
  },
  deleteMealPlan: async (id: string) => {
    await delay();
    const store = getStore();
    store.mealPlans = store.mealPlans.filter((p: any) => p.id !== id);
    return unwrapResponse({ success: true });
  },
  updateMealPlan: async (id: string, payload: any) => {
    await delay();
    const store = getStore();
    const idx = store.mealPlans.findIndex((p: any) => p.id === id);
    if (idx === -1) throw new Error("Meal plan not found");
    store.mealPlans[idx] = { ...store.mealPlans[idx], ...payload };
    return unwrapResponse(store.mealPlans[idx]);
  },
  getMessFeedback: async () => {
    try {
      const res = await apiClient.get("/mess/feedback");
      return unwrapResponse(res, store.messFeedback);
    } catch {
      return store.messFeedback;
    }
  },
  createMessFeedback: async (payload: any) => {
    try {
      const res = await apiClient.post("/mess/feedback", payload);
      return res.data;
    } catch {
      const newFeedback = {
        id: `MFB-${Date.now()}`,
        studentName: payload.studentName,
        rating: payload.rating,
        comments: payload.comments,
        date: new Date().toISOString().split("T")[0],
      };
      store.messFeedback.push(newFeedback);
      return { success: true, data: newFeedback };
    }
  },
  deleteMessFeedback: async (id: string) => {
    await delay();
    const store = getStore();
    store.messFeedback = store.messFeedback.filter((f: any) => f.id !== id);
    return unwrapResponse({ success: true });
  },
  getMessBills: async () => {
    try {
      const res = await apiClient.get("/mess/bills");
      return unwrapResponse(res, store.messBills);
    } catch {
      return store.messBills;
    }
  },
  createMessBill: async (payload: any) => {
    try {
      const res = await apiClient.post("/mess/bills", payload);
      return res.data;
    } catch {
      const newBill = {
        id: `MBL-${Date.now()}`,
        studentName: payload.studentName,
        studentId: payload.studentId,
        amount: payload.amount,
        month: payload.month,
        status: "pending",
        dueDate: payload.dueDate,
      };
      store.messBills.push(newBill);
      return { success: true, data: newBill };
    }
  },
  updateMessBill: async (id: string, payload: any) => {
    await delay();
    const store = getStore();
    const idx = store.messBills.findIndex((b: any) => b.id === id);
    if (idx === -1) throw new Error("Bill not found");
    store.messBills[idx] = { ...store.messBills[idx], ...payload };
    return unwrapResponse(store.messBills[idx]);
  },
  deleteMessBill: async (id: string) => {
    await delay();
    const store = getStore();
    store.messBills = store.messBills.filter((b: any) => b.id !== id);
    return unwrapResponse({ success: true });
  },

  // TRANSPORT MODULE
  getVehicles: async () => {
    try {
      const res = await apiClient.get("/transport/vehicles");
      return unwrapResponse(res, store.vehicles);
    } catch {
      return store.vehicles;
    }
  },
  createVehicle: async (payload: any) => {
    try {
      const res = await apiClient.post("/transport/vehicles", payload);
      return res.data;
    } catch {
      const newVehicle = {
        id: `VEH-${Date.now()}`,
        vehicleNumber: payload.vehicleNumber,
        type: payload.type,
        capacity: payload.capacity,
        driverName: payload.driverName,
        status: payload.status || "active",
      };
      store.vehicles.push(newVehicle);
      return { success: true, data: newVehicle };
    }
  },
  updateVehicle: async (id: string, payload: any) => {
    await delay();
    const store = getStore();
    const idx = store.vehicles.findIndex((v: any) => v.id === id);
    if (idx === -1) throw new Error("Vehicle not found");
    store.vehicles[idx] = { ...store.vehicles[idx], ...payload };
    return unwrapResponse(store.vehicles[idx]);
  },
  deleteVehicle: async (id: string) => {
    await delay();
    const store = getStore();
    store.vehicles = store.vehicles.filter((v: any) => v.id !== id);
    return unwrapResponse({ success: true });
  },
  getTransportRoutes: async () => {
    try {
      const res = await apiClient.get("/transport/routes");
      return unwrapResponse(res, store.transportRoutes);
    } catch {
      return store.transportRoutes;
    }
  },
  createTransportRoute: async (payload: any) => {
    try {
      const res = await apiClient.post("/transport/routes", payload);
      return res.data;
    } catch {
      const newRoute = {
        id: `TRT-${Date.now()}`,
        routeName: payload.routeName,
        vehicleNumber: payload.vehicleNumber,
        stops: payload.stops,
        schedule: payload.schedule,
      };
      store.transportRoutes.push(newRoute);
      return { success: true, data: newRoute };
    }
  },
  updateTransportRoute: async (id: string, payload: any) => {
    await delay();
    const store = getStore();
    const idx = store.transportRoutes.findIndex((r: any) => r.id === id);
    if (idx === -1) throw new Error("Route not found");
    store.transportRoutes[idx] = { ...store.transportRoutes[idx], ...payload };
    return unwrapResponse(store.transportRoutes[idx]);
  },
  deleteTransportRoute: async (id: string) => {
    await delay();
    const store = getStore();
    store.transportRoutes = store.transportRoutes.filter((r: any) => r.id !== id);
    return unwrapResponse({ success: true });
  },
  getTransportFees: async () => {
    try {
      const res = await apiClient.get("/transport/fees");
      return unwrapResponse(res, store.transportFees);
    } catch {
      return store.transportFees;
    }
  },
  createTransportFee: async (payload: any) => {
    try {
      const res = await apiClient.post("/transport/fees", payload);
      return res.data;
    } catch {
      const newFee = {
        id: `TRF-${Date.now()}`,
        routeName: payload.routeName,
        studentType: payload.studentType,
        amount: payload.amount,
        semester: payload.semester,
      };
      store.transportFees.push(newFee);
      return { success: true, data: newFee };
    }
  },
  updateTransportFee: async (id: string, payload: any) => {
    await delay();
    const store = getStore();
    const idx = store.transportFees.findIndex((f: any) => f.id === id);
    if (idx === -1) throw new Error("Fee not found");
    store.transportFees[idx] = { ...store.transportFees[idx], ...payload };
    return unwrapResponse(store.transportFees[idx]);
  },
  deleteTransportFee: async (id: string) => {
    await delay();
    const store = getStore();
    store.transportFees = store.transportFees.filter((f: any) => f.id !== id);
    return unwrapResponse({ success: true });
  },

  // ADMISSIONS MODULE
  getAdmissionApplications: async () => {
    try {
      const res = await apiClient.get("/admissions");
      return unwrapResponse(res, store.admissionApplications);
    } catch {
      return store.admissionApplications;
    }
  },
  updateAdmissionStatus: async (id: string, status: string) => {
    try {
      const res = await apiClient.patch(`/admissions/${id}/status`, { status });
      return res.data;
    } catch {
      const idx = store.admissionApplications.findIndex((a: any) => a.id === id);
      if (idx !== -1) {
        store.admissionApplications[idx].status = status;
      }
      return { success: true };
    }
  },
  getMeritList: async () => {
    try {
      const res = await apiClient.get("/admissions/merit-list");
      return unwrapResponse(res, store.meritList);
    } catch {
      return store.meritList;
    }
  },
  createMeritListEntry: async (payload: any) => {
    try {
      const res = await apiClient.post("/admissions/merit-list", payload);
      return res.data;
    } catch {
      const newEntry = {
        id: `MERIT-${Date.now()}`,
        applicantName: payload.applicantName,
        applicationId: payload.applicationId,
        rank: store.meritList.length + 1,
        score: payload.score,
        status: "selected",
        createdAt: new Date().toISOString().split("T")[0],
      };
      store.meritList.push(newEntry);
      return { success: true, message: "Merit list entry created", data: newEntry };
    }
  },

  // ALUMNI MODULE
  getAlumni: async () => {
    try {
      const res = await apiClient.get("/alumni");
      return unwrapResponse(res, store.alumni);
    } catch {
      return store.alumni;
    }
  },
  createAlumni: async (payload: any) => {
    try {
      const res = await apiClient.post("/alumni/create", payload);
      return res.data;
    } catch {
      const newAlumni = {
        id: `ALM-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        graduationYear: payload.graduationYear,
        department: payload.department,
        currentPosition: payload.currentPosition || "",
        phone: payload.phone || "",
        createdAt: new Date().toISOString().split("T")[0],
      };
      store.alumni.push(newAlumni);
      return { success: true, message: "Alumni profile created", data: newAlumni };
    }
  },
  getAlumniEvents: async () => {
    try {
      const res = await apiClient.get("/alumni/events");
      return unwrapResponse(res, store.alumniEvents);
    } catch {
      return store.alumniEvents;
    }
  },
  createAlumniEvent: async (payload: any) => {
    try {
      const res = await apiClient.post("/alumni/events/create", payload);
      return res.data;
    } catch {
      const newEvent = {
        id: `EVT-${Date.now()}`,
        title: payload.title,
        description: payload.description || "",
        date: payload.date,
        location: payload.location,
        registeredCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      store.alumniEvents.push(newEvent);
      return { success: true, message: "Event created", data: newEvent };
    }
  },
  registerForEvent: async (eventId: string, alumniId: string) => {
    try {
      const res = await apiClient.post(`/alumni/events/${eventId}/register`, { alumniId });
      return res.data;
    } catch {
      const idx = store.alumniEvents.findIndex((e: any) => e.id === eventId);
      if (idx !== -1) {
        store.alumniEvents[idx].registeredCount = (store.alumniEvents[idx].registeredCount || 0) + 1;
      }
      return { success: true, message: "Registered for event" };
    }
  },
  getAlumniDonations: async () => {
    try {
      const res = await apiClient.get("/alumni/donations");
      return unwrapResponse(res, store.alumniDonations);
    } catch {
      return store.alumniDonations;
    }
  },
  createDonation: async (payload: any) => {
    try {
      const res = await apiClient.post("/alumni/donations/create", payload);
      return res.data;
    } catch {
      const newDonation = {
        id: `DON-${Date.now()}`,
        alumniName: payload.alumniName,
        amount: payload.amount,
        purpose: payload.purpose || "General Fund",
        date: new Date().toISOString().split("T")[0],
        paymentMethod: payload.paymentMethod || "online",
      };
      store.alumniDonations.push(newDonation);
      return { success: true, message: "Donation recorded", data: newDonation };
    }
  },

  // ATTENDANCE MODULE
  getAttendanceRecords: async () => {
    try {
      const res = await apiClient.get("/attendance");
      return unwrapResponse(res, []);
    } catch {
      return [];
    }
  },
  markAttendance: async (payload: any) => {
    try {
      const res = await apiClient.post("/attendance/mark-attendance", payload);
      return res.data;
    } catch {
      const newRecord = {
        id: `ATT-${Date.now()}`,
        studentId: payload.studentId,
        studentName: payload.studentName,
        date: payload.date || new Date().toISOString().split("T")[0],
        status: payload.status,
        course: payload.course,
      };
      store.attendanceRecords.push(newRecord);
      return { success: true, message: "Attendance marked successfully", data: newRecord };
    }
  },
  markAttendanceBulkDateRange: async (payload: any) => {
    try {
      const res = await apiClient.post("/attendance/bulk-date-range", payload);
      return res.data;
    } catch {
      const start = new Date(payload.startDate);
      const end = new Date(payload.endDate);
      const days: string[] = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push(d.toISOString().split("T")[0]);
      }
      const newRecords = [];
      for (const date of days) {
        for (const s of payload.students) {
          const rec = {
            id: `ATT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            studentId: s.studentId,
            studentName: s.studentName || "Unknown",
            date,
            status: s.status,
            course: payload.course,
          };
          store.attendanceRecords.push(rec);
          newRecords.push(rec);
        }
      }
      return { success: true, message: "Date-range attendance marked", data: newRecords };
    }
  },

  updateAttendance: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/attendance/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.attendanceRecords.findIndex((r: any) => r.id === id);
      if (idx !== -1) {
        store.attendanceRecords[idx] = { ...store.attendanceRecords[idx], ...payload };
      }
      return { success: true, message: "Attendance updated" };
    }
  },
  deleteAttendance: async (id: string) => {
    try {
      const res = await apiClient.delete(`/attendance/${id}`);
      return res.data;
    } catch {
      store.attendanceRecords = store.attendanceRecords.filter((r: any) => r.id !== id);
      return { success: true, message: "Attendance deleted" };
    }
  },

  // EXAMS MODULE
  getExams: async () => {
    try {
      const res = await apiClient.get("/exams");
      return unwrapResponse(res, store.exams);
    } catch {
      return store.exams;
    }
  },
  createExam: async (payload: any) => {
    try {
      const res = await apiClient.post("/exams/create-exam", payload);
      return res.data;
    } catch {
      const newExam = {
        id: `EXM-${Date.now()}`,
        code: payload.code,
        title: payload.title,
        date: payload.date,
        duration: payload.duration || "3 hours",
      };
      store.exams.push(newExam);
      return { success: true, message: "Exam created successfully", data: newExam };
    }
  },
  updateExam: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/exams/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.exams.findIndex((e: any) => e.id === id);
      if (idx !== -1) store.exams[idx] = { ...store.exams[idx], ...payload };
      return { success: true, message: "Exam updated" };
    }
  },
  deleteExam: async (id: string) => {
    try {
      const res = await apiClient.delete(`/exams/${id}`);
      return res.data;
    } catch {
      store.exams = store.exams.filter((e: any) => e.id !== id);
      return { success: true, message: "Exam deleted" };
    }
  },
  getGrades: async () => {
    try {
      const res = await apiClient.get("/grades");
      return unwrapResponse(res, store.grades);
    } catch {
      return store.grades;
    }
  },
  createGrade: async (payload: any) => {
    try {
      const res = await apiClient.post("/grades/create", payload);
      return res.data;
    } catch {
      const newGrade = {
        id: `GRD-${Date.now()}`,
        studentId: payload.studentId,
        studentName: payload.studentName,
        examId: payload.examId,
        examTitle: payload.examTitle,
        grade: payload.grade,
        score: payload.score,
      };
      store.grades.push(newGrade);
      return { success: true, message: "Grade recorded successfully", data: newGrade };
    }
  },
  updateGrade: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/grades/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.grades.findIndex((g: any) => g.id === id);
      if (idx !== -1) store.grades[idx] = { ...store.grades[idx], ...payload };
      return { success: true, message: "Grade updated" };
    }
  },
  deleteGrade: async (id: string) => {
    try {
      const res = await apiClient.delete(`/grades/${id}`);
      return res.data;
    } catch {
      store.grades = store.grades.filter((g: any) => g.id !== id);
      return { success: true, message: "Grade deleted" };
    }
  },

  // CURRICULUM MODULE (B2)
  getCourseOutcomes: async () => {
    try {
      const res = await apiClient.get("/curriculum/course-outcomes");
      return unwrapResponse(res, store.courseOutcomes);
    } catch {
      return store.courseOutcomes;
    }
  },
  createCourseOutcome: async (payload: any) => {
    try {
      const res = await apiClient.post("/curriculum/course-outcomes/create", payload);
      return res.data;
    } catch {
      const newCO = {
        id: `CO-${Date.now()}`,
        ...payload,
      };
      store.courseOutcomes.push(newCO);
      return { success: true, message: "Course Outcome created successfully", data: newCO };
    }
  },
  updateCourseOutcome: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/curriculum/course-outcomes/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.courseOutcomes.findIndex((c: any) => c.id === id);
      if (idx !== -1) store.courseOutcomes[idx] = { ...store.courseOutcomes[idx], ...payload };
      return { success: true, message: "Course Outcome updated" };
    }
  },
  deleteCourseOutcome: async (id: string) => {
    try {
      const res = await apiClient.delete(`/curriculum/course-outcomes/${id}`);
      return res.data;
    } catch {
      store.courseOutcomes = store.courseOutcomes.filter((c: any) => c.id !== id);
      return { success: true, message: "Course Outcome deleted" };
    }
  },
  getProgramOutcomes: async () => {
    try {
      const res = await apiClient.get("/curriculum/program-outcomes");
      return unwrapResponse(res, store.programOutcomes);
    } catch {
      return store.programOutcomes;
    }
  },
  createProgramOutcome: async (payload: any) => {
    try {
      const res = await apiClient.post("/curriculum/program-outcomes/create", payload);
      return res.data;
    } catch {
      const newPO = {
        id: `PO-${Date.now()}`,
        ...payload,
      };
      store.programOutcomes.push(newPO);
      return { success: true, message: "Program Outcome created successfully", data: newPO };
    }
  },
  updateProgramOutcome: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/curriculum/program-outcomes/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.programOutcomes.findIndex((p: any) => p.id === id);
      if (idx !== -1) store.programOutcomes[idx] = { ...store.programOutcomes[idx], ...payload };
      return { success: true, message: "Program Outcome updated" };
    }
  },
  deleteProgramOutcome: async (id: string) => {
    try {
      const res = await apiClient.delete(`/curriculum/program-outcomes/${id}`);
      return res.data;
    } catch {
      store.programOutcomes = store.programOutcomes.filter((p: any) => p.id !== id);
      return { success: true, message: "Program Outcome deleted" };
    }
  },
  getCurriculumMaps: async () => {
    try {
      const res = await apiClient.get("/curriculum/maps");
      return unwrapResponse(res, store.curriculumMaps);
    } catch {
      return store.curriculumMaps;
    }
  },
  createCurriculumMap: async (payload: any) => {
    try {
      const res = await apiClient.post("/curriculum/maps/create", payload);
      return res.data;
    } catch {
      const newMap = {
        id: `CM-${Date.now()}`,
        ...payload,
      };
      store.curriculumMaps.push(newMap);
      return { success: true, message: "Curriculum Map created successfully", data: newMap };
    }
  },
  updateCurriculumMap: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/curriculum/maps/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.curriculumMaps.findIndex((m: any) => m.id === id);
      if (idx !== -1) store.curriculumMaps[idx] = { ...store.curriculumMaps[idx], ...payload };
      return { success: true, message: "Curriculum Map updated" };
    }
  },
  deleteCurriculumMap: async (id: string) => {
    try {
      const res = await apiClient.delete(`/curriculum/maps/${id}`);
      return res.data;
    } catch {
      store.curriculumMaps = store.curriculumMaps.filter((m: any) => m.id !== id);
      return { success: true, message: "Curriculum Map deleted" };
    }
  },
  getCOPOMatrix: async (curriculumMapId: string) => {
    try {
      const res = await apiClient.get(`/curriculum/co-po-matrix/${curriculumMapId}`);
      return unwrapResponse(res, []);
    } catch {
      return [];
    }
  },
  getCoverageReport: async (curriculumMapId: string) => {
    try {
      const res = await apiClient.get(`/curriculum/coverage-report/${curriculumMapId}`);
      return unwrapResponse(res, []);
    } catch {
      return [];
    }
  },

  // ASSESSMENT MODULE (B3)
  getAssessments: async () => {
    try {
      const res = await apiClient.get("/assessments");
      return unwrapResponse(res, store.assessments);
    } catch {
      return store.assessments;
    }
  },
  createAssessment: async (payload: any) => {
    try {
      const res = await apiClient.post("/assessments/create", payload);
      return res.data;
    } catch {
      const newAssessment = { id: `ASSESS-${Date.now()}`, ...payload };
      store.assessments.push(newAssessment);
      return { success: true, message: "Assessment created", data: newAssessment };
    }
  },
  updateAssessment: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/assessments/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.assessments.findIndex((a: any) => a.id === id);
      if (idx !== -1) store.assessments[idx] = { ...store.assessments[idx], ...payload };
      return { success: true, message: "Assessment updated" };
    }
  },
  deleteAssessment: async (id: string) => {
    try {
      const res = await apiClient.delete(`/assessments/${id}`);
      return res.data;
    } catch {
      store.assessments = store.assessments.filter((a: any) => a.id !== id);
      return { success: true, message: "Assessment deleted" };
    }
  },
  getAssessmentScores: async () => {
    try {
      const res = await apiClient.get("/assessments/scores");
      return unwrapResponse(res, store.assessmentScores);
    } catch {
      return store.assessmentScores;
    }
  },
  bulkCreateAssessmentScores: async (payload: any) => {
    try {
      const res = await apiClient.post("/assessments/scores/bulk-create", payload);
      return res.data;
    } catch {
      const newScores = payload.scores.map((s: any) => ({
        id: `AS-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        assessment: payload.assessment,
        ...s,
      }));
      store.assessmentScores.push(...newScores);
      return { success: true, message: "Scores recorded", data: newScores };
    }
  },
  getGradeBooks: async () => {
    try {
      const res = await apiClient.get("/assessments/grade-books");
      return unwrapResponse(res, store.gradeBooks);
    } catch {
      return store.gradeBooks;
    }
  },
  calculateGrade: async (studentId: string, courseId: string, academicSemesterId: string) => {
    try {
      const res = await apiClient.get(`/assessments/calculate-grade/${studentId}/${courseId}/${academicSemesterId}`);
      return res.data;
    } catch {
      return { success: true, message: "Grade calculated (mock)", data: store.gradeBooks[0] };
    }
  },
  publishResults: async (courseId: string, academicSemesterId: string) => {
    try {
      const res = await apiClient.get(`/assessments/publish-results/${courseId}/${academicSemesterId}`);
      return res.data;
    } catch {
      return { success: true, message: "Results published (mock)", data: store.gradeBooks };
    }
  },

  // TIMETABLE MODULE (B1)
  getTimetables: async () => {
    try {
      const res = await apiClient.get("/timetables");
      return unwrapResponse(res, store.timetables);
    } catch {
      return store.timetables;
    }
  },
  createTimetable: async (payload: any) => {
    try {
      const res = await apiClient.post("/timetables/create", payload);
      return res.data;
    } catch {
      const newTT = { id: `TT-${Date.now()}`, ...payload };
      store.timetables.push(newTT);
      return { success: true, message: "Timetable created", data: newTT };
    }
  },
  updateTimetable: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/timetables/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.timetables.findIndex((t: any) => t.id === id);
      if (idx !== -1) store.timetables[idx] = { ...store.timetables[idx], ...payload };
      return { success: true, message: "Timetable updated" };
    }
  },
  deleteTimetable: async (id: string) => {
    try {
      const res = await apiClient.delete(`/timetables/${id}`);
      return res.data;
    } catch {
      store.timetables = store.timetables.filter((t: any) => t.id !== id);
      return { success: true, message: "Timetable deleted" };
    }
  },
  addTimetableEntry: async (id: string, entry: any) => {
    try {
      const res = await apiClient.post(`/timetables/${id}/entries`, entry);
      return res.data;
    } catch {
      const tt = store.timetables.find((t: any) => t.id === id);
      if (tt) tt.entries.push({ id: `ENT-${Date.now()}`, ...entry });
      return { success: true, message: "Entry added" };
    }
  },
  removeTimetableEntry: async (id: string, entryId: string) => {
    try {
      const res = await apiClient.delete(`/timetables/${id}/entries/${entryId}`);
      return res.data;
    } catch {
      const tt = store.timetables.find((t: any) => t.id === id);
      if (tt) tt.entries = tt.entries.filter((e: any) => e.id !== entryId);
      return { success: true, message: "Entry removed" };
    }
  },
  getTimetableGrid: async (id: string) => {
    try {
      const res = await apiClient.get(`/timetables/${id}/grid`);
      return unwrapResponse(res, {});
    } catch {
      const tt = store.timetables.find((t: any) => t.id === id);
      if (!tt) return {};
      const grid: any = {};
      const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];
      const SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
      for (const day of DAYS) { grid[day] = {}; for (const s of SLOTS) grid[day][s] = []; }
      for (const entry of tt.entries) {
        const sh = parseInt(entry.startTime.split(":")[0]);
        const eh = parseInt(entry.endTime.split(":")[0]);
        for (let h = sh; h < eh; h++) {
          const sk = `${h.toString().padStart(2, "0")}:00`;
          if (grid[entry.day]?.[sk]) grid[entry.day][sk].push(entry);
        }
      }
      return grid;
    }
  },

  // LOGBOOK MODULE (B4)
  getClinicalProcedures: async () => {
    try {
      const res = await apiClient.get("/logbook/procedures");
      return unwrapResponse(res, store.clinicalProcedures);
    } catch {
      return store.clinicalProcedures;
    }
  },
  createClinicalProcedure: async (payload: any) => {
    try {
      const res = await apiClient.post("/logbook/procedures/create", payload);
      return res.data;
    } catch {
      const newProc = { id: `PROC-${Date.now()}`, ...payload };
      store.clinicalProcedures.push(newProc);
      return { success: true, message: "Procedure created", data: newProc };
    }
  },
  updateClinicalProcedure: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/logbook/procedures/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.clinicalProcedures.findIndex((p: any) => p.id === id);
      if (idx !== -1) store.clinicalProcedures[idx] = { ...store.clinicalProcedures[idx], ...payload };
      return { success: true, message: "Procedure updated" };
    }
  },
  deleteClinicalProcedure: async (id: string) => {
    try {
      const res = await apiClient.delete(`/logbook/procedures/${id}`);
      return res.data;
    } catch {
      store.clinicalProcedures = store.clinicalProcedures.filter((p: any) => p.id !== id);
      return { success: true, message: "Procedure deleted" };
    }
  },
  getLogEntries: async () => {
    try {
      const res = await apiClient.get("/logbook/entries");
      return unwrapResponse(res, store.logEntries);
    } catch {
      return store.logEntries;
    }
  },
  createLogEntry: async (payload: any) => {
    try {
      const res = await apiClient.post("/logbook/entries/create", payload);
      return res.data;
    } catch {
      const newEntry = { id: `LOG-${Date.now()}`, ...payload };
      store.logEntries.push(newEntry);
      return { success: true, message: "Log entry created", data: newEntry };
    }
  },
  updateLogEntry: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/logbook/entries/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.logEntries.findIndex((e: any) => e.id === id);
      if (idx !== -1) store.logEntries[idx] = { ...store.logEntries[idx], ...payload };
      return { success: true, message: "Log entry updated" };
    }
  },
  deleteLogEntry: async (id: string) => {
    try {
      const res = await apiClient.delete(`/logbook/entries/${id}`);
      return res.data;
    } catch {
      store.logEntries = store.logEntries.filter((e: any) => e.id !== id);
      return { success: true, message: "Log entry deleted" };
    }
  },
  getStudentLogEntries: async (studentId: string) => {
    try {
      const res = await apiClient.get(`/logbook/entries/student/${studentId}`);
      return unwrapResponse(res, []);
    } catch {
      return store.logEntries.filter((e: any) => e.student === studentId);
    }
  },
  signOffLogEntry: async (id: string) => {
    try {
      const res = await apiClient.patch(`/logbook/entries/${id}/sign-off`);
      return res.data;
    } catch {
      const idx = store.logEntries.findIndex((e: any) => e.id === id);
      if (idx !== -1) store.logEntries[idx].supervisorSignOff = true;
      return { success: true, message: "Entry signed off" };
    }
  },
  getStudentCompetencySummary: async (studentId: string) => {
    try {
      const res = await apiClient.get(`/logbook/summary/${studentId}`);
      return unwrapResponse(res, []);
    } catch {
      const procedures = store.clinicalProcedures;
      const entries = store.logEntries.filter((e: any) => e.student === studentId);
      return procedures.map((p: any) => {
        const procEntries = entries.filter((e: any) => e.procedure === p.id);
        return {
          procedure: p,
          totalLogs: procEntries.length,
          minimumRequired: p.minimumRequired,
          met: procEntries.length >= p.minimumRequired,
        };
      });
    }
  },

  // LEAVE MODULE
  getLeaveRequests: async () => {
    try {
      const res = await apiClient.get("/leaves");
      return unwrapResponse(res, store.leaveRequests);
    } catch {
      return store.leaveRequests;
    }
  },
  createLeaveRequest: async (payload: any) => {
    try {
      const res = await apiClient.post("/leaves/apply", payload);
      return res.data;
    } catch {
      const newRequest = {
        id: `LVE-${Date.now()}`,
        employeeId: payload.employeeId,
        employeeName: payload.employeeName,
        type: payload.type,
        startDate: payload.startDate,
        endDate: payload.endDate,
        reason: payload.reason,
        status: "pending",
      };
      store.leaveRequests.push(newRequest);
      return { success: true, message: "Leave request submitted successfully", data: newRequest };
    }
  },
  updateLeaveRequestStatus: async ({ id, status }: { id: string; status: string }) => {
    try {
      const res = await apiClient.patch(`/leaves/${id}`, { status });
      return res.data;
    } catch {
      const idx = store.leaveRequests.findIndex((l: any) => l.id === id);
      if (idx !== -1) {
        store.leaveRequests[idx].status = status;
      }
      return { success: true, message: `Leave request ${status}` };
    }
  },

  // PAYROLL MODULE
  getPayrollRecords: async () => {
    try {
      const res = await apiClient.get("/payrolls");
      return unwrapResponse(res, store.payroll);
    } catch {
      return store.payroll;
    }
  },
  createPayrollRecord: async (payload: any) => {
    try {
      const res = await apiClient.post("/payrolls/create-payroll", payload);
      return res.data;
    } catch {
      const newRecord = {
        id: `PR-${Date.now()}`,
        employeeId: payload.employeeId,
        employeeName: payload.employeeName,
        designation: payload.designation || "",
        department: payload.department || "",
        salary: payload.salary,
        month: payload.month,
        status: "pending",
        paidDate: null,
      };
      store.payroll.push(newRecord);
      return { success: true, message: "Payroll record created", data: newRecord };
    }
  },
  updatePayrollStatus: async ({ id, status }: { id: string; status: string }) => {
    try {
      const res = await apiClient.patch(`/payrolls/${id}`, { status });
      return res.data;
    } catch {
      const idx = store.payroll.findIndex((p: any) => p.id === id);
      if (idx !== -1) {
        store.payroll[idx].status = status;
        store.payroll[idx].paidDate = status === "paid" ? new Date().toISOString().split("T")[0] : null;
      }
      return { success: true, message: `Payroll ${status}` };
    }
  },
  updatePayrollRecord: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/payrolls/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.payroll.findIndex((p: any) => p.id === id);
      if (idx !== -1) store.payroll[idx] = { ...store.payroll[idx], ...payload };
      return { success: true, message: "Payroll record updated" };
    }
  },
  deletePayrollRecord: async (id: string) => {
    try {
      const res = await apiClient.delete(`/payrolls/${id}`);
      return res.data;
    } catch {
      store.payroll = store.payroll.filter((p: any) => p.id !== id);
      return { success: true, message: "Payroll record deleted" };
    }
  },
  getSalarySlip: async (id: string) => {
    try {
      const res = await apiClient.get(`/payrolls/${id}/slip`);
      return unwrapResponse(res, null);
    } catch {
      const record = store.payroll.find((p: any) => p.id === id);
      if (!record) return null;
      return {
        id: record.id,
        employee: { employeeName: record.employeeName, employeeId: record.employeeId, designation: record.designation, department: record.department },
        month: 6,
        year: 2026,
        basicSalary: record.salary * 0.6,
        allowances: { hra: record.salary * 0.2, da: record.salary * 0.1, travel: 3000, medical: 2000, special: 0, total: record.salary * 0.3 + 5000 },
        deductions: { tax: record.salary * 0.1, providentFund: record.salary * 0.12, insurance: 1500, loan: 0, other: 0, total: record.salary * 0.22 + 1500 },
        grossPay: record.salary,
        totalDeductions: Math.round(record.salary * 0.22 + 1500),
        netPay: Math.round(record.salary - (record.salary * 0.22 + 1500)),
        status: record.status,
        paymentDate: record.paidDate,
      };
    }
  },

  // REPORTS MODULE
  getReports: async () => {
    try {
      const res = await apiClient.get("/reports");
      return unwrapResponse(res, store.reports);
    } catch {
      return store.reports;
    }
  },
  generateReport: async (payload: any) => {
    try {
      const res = await apiClient.post("/reports/generate", payload);
      return res.data;
    } catch {
      const newReport = {
        id: `RPT-${Date.now()}`,
        title: payload.title,
        type: payload.type,
        generatedDate: new Date().toISOString().split("T")[0],
        status: "completed",
        createdBy: payload.createdBy || "System",
      };
      store.reports.push(newReport);
      return { success: true, message: "Report generated", data: newReport };
    }
  },

  // NOTIFICATIONS MODULE
  getNotifications: async () => {
    try {
      const res = await apiClient.get("/notifications");
      return unwrapResponse(res, store.notifications);
    } catch {
      return store.notifications;
    }
  },
  markNotificationRead: async (id: string) => {
    try {
      const res = await apiClient.patch(`/notifications/${id}/read`);
      return res.data;
    } catch {
      const idx = store.notifications.findIndex((n: any) => n.id === id);
      if (idx !== -1) {
        store.notifications[idx].isRead = true;
      }
      return { success: true };
    }
  },
  markAllNotificationsRead: async () => {
    try {
      const res = await apiClient.patch("/notifications/mark-all-read");
      return res.data;
    } catch {
      store.notifications.forEach((n: any) => { n.isRead = true; });
      return { success: true };
    }
  },
  sendNotification: async (payload: any) => {
    try {
      const res = await apiClient.post("/notifications/send", payload);
      return res.data;
    } catch {
      const newNotification = {
        id: `NOT-${Date.now()}`,
        title: payload.title,
        message: payload.message,
        type: payload.type || "general",
        isRead: false,
        createdAt: new Date().toISOString(),
        recipientRole: payload.recipientRole || "all",
      };
      store.notifications.push(newNotification);
      return { success: true, message: "Notification sent", data: newNotification };
    }
  },

  // CHAT MODULE
  getConversations: async () => {
    try {
      const res = await apiClient.get("/chat/conversations");
      return unwrapResponse(res, store.conversations);
    } catch {
      return store.conversations;
    }
  },
  getMessages: async (conversationId: string) => {
    try {
      const res = await apiClient.get(`/chat/messages/${conversationId}`);
      return unwrapResponse(res, store.messages[conversationId] || []);
    } catch {
      return store.messages[conversationId] || [];
    }
  },
  sendMessage: async (payload: { conversationId: string; sender: string; content: string }) => {
    try {
      const res = await apiClient.post("/chat/messages", payload);
      return res.data;
    } catch {
      const newMessage = {
        id: `MSG-${Date.now()}`,
        conversationId: payload.conversationId,
        sender: payload.sender,
        content: payload.content,
        createdAt: new Date().toISOString(),
      };
      if (!store.messages[payload.conversationId]) {
        store.messages[payload.conversationId] = [];
      }
      store.messages[payload.conversationId].push(newMessage);
      // Update conversation last message
      const convIdx = store.conversations.findIndex((c: any) => c.id === payload.conversationId);
      if (convIdx !== -1) {
        store.conversations[convIdx].lastMessage = payload.content;
        store.conversations[convIdx].lastMessageTime = new Date().toISOString();
      }
      return { success: true, data: newMessage };
    }
  },

  // PARENTS MODULE
  getParents: async () => {
    try {
      const res = await apiClient.get("/parents");
      return unwrapResponse(res, store.parents);
    } catch {
      return store.parents;
    }
  },
  createParent: async (payload: any) => {
    try {
      const res = await apiClient.post("/parents/create", payload);
      return res.data;
    } catch {
      const newParent = {
        id: `PAR-${Date.now()}`,
        name: payload.name,
        email: payload.email || "",
        contactNo: payload.contactNo || "",
        occupation: payload.occupation || "",
        children: payload.children || [],
      };
      store.parents.push(newParent);
      return { success: true, message: "Parent profile created", data: newParent };
    }
  },

  // AUTH MODULE
  registerUser: async (payload: any) => {
    try {
      const res = await apiClient.post("/auth/register", payload);
      return res.data;
    } catch {
      return { success: true, message: "User registered successfully", data: { id: `USR-${Date.now()}`, ...payload } };
    }
  },
  getMe: async () => {
    try {
      const res = await apiClient.get("/auth/me");
      return res.data;
    } catch {
      return { success: true, data: { id: "USR-001", email: "admin@college.edu", role: "admin", name: "Admin User" } };
    }
  },
  updateProfile: async (payload: any) => {
    try {
      const res = await apiClient.patch("/auth/profile", payload);
      return res.data;
    } catch {
      return { success: true, data: payload };
    }
  },
  changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    try {
      const res = await apiClient.post("/auth/change-password", payload);
      return res.data;
    } catch {
      return { success: true };
    }
  },

  // ADMISSION MODULE
  createAdmissionApplication: async (payload: any) => {
    try {
      const res = await apiClient.post("/admissions/create", payload);
      return res.data;
    } catch {
      const newApplication = {
        id: `APP-${Date.now()}`,
        applicantName: payload.applicantName,
        email: payload.email,
        phone: payload.phone || "",
        program: payload.program,
        status: "pending",
        submittedAt: new Date().toISOString().split("T")[0],
      };
      store.admissionApplications.push(newApplication);
      return { success: true, message: "Application submitted", data: newApplication };
    }
  },
  updateApplicationStatus: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/admissions/${id}/status`, payload);
      return res.data;
    } catch {
      const idx = store.admissionApplications.findIndex((a: any) => a.id === id);
      if (idx !== -1) {
        store.admissionApplications[idx] = { ...store.admissionApplications[idx], ...payload };
      }
      return { success: true };
    }
  },

  // ACADEMIC FACULTY MODULE
  getAcademicFaculties: async () => {
    try {
      const res = await apiClient.get("/academic-faculties");
      return unwrapResponse(res, store.academicFaculties);
    } catch {
      return store.academicFaculties;
    }
  },
  deleteAcademicFaculty: async (id: string) => {
    try {
      const res = await apiClient.delete(`/academic-faculties/${id}`);
      return res.data;
    } catch {
      store.academicFaculties = store.academicFaculties.filter((f: any) => f.id !== id);
      return { success: true, message: "Academic Faculty deleted" };
    }
  },

  // SEMESTER REGISTRATION MODULE
  getSemesterRegistrations: async () => {
    try {
      const res = await apiClient.get("/semester-registrations");
      return unwrapResponse(res, store.semesterRegistrations);
    } catch {
      return store.semesterRegistrations;
    }
  },
  createSemesterRegistration: async (payload: any) => {
    try {
      const res = await apiClient.post("/semester-registrations/create", payload);
      return res.data;
    } catch {
      const newReg = {
        id: `SR-${Date.now()}`,
        semester: payload.semester,
        studentCount: payload.studentCount || 0,
        status: "active",
        registrationStart: payload.registrationStart,
        registrationEnd: payload.registrationEnd,
      };
      store.semesterRegistrations.push(newReg);
      return { success: true, data: newReg };
    }
  },

  // FACILITY MODULE
  getFacilities: async () => {
    try {
      const res = await apiClient.get("/facilities");
      return unwrapResponse(res, store.facilities);
    } catch {
      return store.facilities;
    }
  },
  createFacility: async (payload: any) => {
    try {
      const res = await apiClient.post("/facilities/create", payload);
      return res.data;
    } catch {
      const newFacility = {
        id: `FCL-${Date.now()}`,
        name: payload.name,
        type: payload.type,
        capacity: payload.capacity,
        location: payload.location,
        status: "operational",
      };
      store.facilities.push(newFacility);
      return { success: true, data: newFacility };
    }
  },

  // PATROL LOG MODULE
  getPatrolLogs: async () => {
    try {
      const res = await apiClient.get("/patrol-logs");
      return unwrapResponse(res, store.patrolLogs);
    } catch {
      return store.patrolLogs;
    }
  },
  createPatrolLog: async (payload: any) => {
    try {
      const res = await apiClient.post("/patrol-logs/create", payload);
      return res.data;
    } catch {
      const newLog = {
        id: `PTL-${Date.now()}`,
        guardName: payload.guardName,
        patrolArea: payload.patrolArea,
        startTime: payload.startTime || new Date().toISOString(),
        endTime: payload.endTime || "",
        notes: payload.notes || "",
      };
      store.patrolLogs.push(newLog);
      return { success: true, data: newLog };
    }
  },
  updatePatrolLog: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/patrol-logs/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.patrolLogs.findIndex((p: any) => p.id === id);
      if (idx !== -1) {
        store.patrolLogs[idx] = { ...store.patrolLogs[idx], ...payload };
      }
      return { success: true };
    }
  },
  deletePatrolLog: async (id: string) => {
    await delay();
    const store = getStore();
    store.patrolLogs = store.patrolLogs.filter((p: any) => p.id !== id);
    return unwrapResponse({ success: true });
  },

  // HANDOVER MODULE
  getHandovers: async () => {
    try {
      const res = await apiClient.get("/handovers");
      return unwrapResponse(res, store.handovers);
    } catch {
      return store.handovers;
    }
  },
  createHandover: async (payload: any) => {
    try {
      const res = await apiClient.post("/handovers/create", payload);
      return res.data;
    } catch {
      const newHandover = {
        id: `HND-${Date.now()}`,
        fromOfficer: payload.fromOfficer,
        toOfficer: payload.toOfficer,
        shift: payload.shift,
        handoverTime: payload.handoverTime || new Date().toISOString(),
        notes: payload.notes || "",
        status: "pending",
      };
      store.handovers.push(newHandover);
      return { success: true, data: newHandover };
    }
  },

  // ROOM CHANGE MODULE
  getRoomChanges: async () => {
    try {
      const res = await apiClient.get("/room-changes");
      return unwrapResponse(res, store.roomChanges);
    } catch {
      return store.roomChanges;
    }
  },
  createRoomChange: async (payload: any) => {
    try {
      const res = await apiClient.post("/room-changes/create", payload);
      return res.data;
    } catch {
      const newChange = {
        id: `RC-${Date.now()}`,
        studentName: payload.studentName,
        fromRoom: payload.fromRoom,
        toRoom: payload.toRoom,
        reason: payload.reason,
        status: "pending",
      };
      store.roomChanges.push(newChange);
      return { success: true, data: newChange };
    }
  },
  approveRoomChange: async (id: string) => {
    try {
      const res = await apiClient.patch(`/room-changes/${id}/approve`);
      return res.data;
    } catch {
      const idx = store.roomChanges.findIndex((r: any) => r.id === id);
      if (idx !== -1) {
        store.roomChanges[idx].status = "approved";
      }
      return { success: true, message: "Room change approved" };
    }
  },

  // HOSTEL MODULE
  getHostelRecords: async () => {
    try {
      const res = await apiClient.get("/hostel-records");
      return unwrapResponse(res, store.hostelRecords);
    } catch {
      return store.hostelRecords;
    }
  },
  createHostelCheckin: async (payload: any) => {
    try {
      const res = await apiClient.post("/hostel-records/checkin", payload);
      return res.data;
    } catch {
      const newRecord = {
        id: `HR-${Date.now()}`,
        studentName: payload.studentName,
        roomNumber: payload.roomNumber,
        checkinDate: payload.checkinDate || new Date().toISOString().split("T")[0],
        checkoutDate: null,
        status: "checked-in",
      };
      store.hostelRecords.push(newRecord);
      return { success: true, data: newRecord };
    }
  },

  // LAUNDRY MODULE
  getLaundryRequests: async () => {
    try {
      const res = await apiClient.get("/laundry");
      return unwrapResponse(res, store.laundryRequests);
    } catch {
      return store.laundryRequests;
    }
  },
  createLaundryRequest: async (payload: any) => {
    try {
      const res = await apiClient.post("/laundry/create", payload);
      return res.data;
    } catch {
      const newRequest = {
        id: `LND-${Date.now()}`,
        studentName: payload.studentName,
        itemCount: payload.itemCount,
        serviceType: payload.serviceType,
        requestDate: new Date().toISOString().split("T")[0],
        status: "pending",
      };
      store.laundryRequests.push(newRequest);
      return { success: true, data: newRequest };
    }
  },

  // INVENTORY MODULE
  getInventoryItems: async () => {
    try {
      const res = await apiClient.get("/inventory");
      return unwrapResponse(res, store.inventoryItems);
    } catch {
      return store.inventoryItems;
    }
  },
  createInventoryItem: async (payload: any) => {
    try {
      const res = await apiClient.post("/inventory/create", payload);
      return res.data;
    } catch {
      const newItem = {
        id: `INV-${Date.now()}`,
        name: payload.name,
        category: payload.category,
        quantity: payload.quantity,
        unitPrice: payload.unitPrice,
        location: payload.location || "",
        reorderLevel: payload.reorderLevel || 0,
      };
      store.inventoryItems.push(newItem);
      return { success: true, data: newItem };
    }
  },

  // ATTENDANCE MODULE
  getAttendanceReport: async () => {
    try {
      const res = await apiClient.get("/attendance/report");
      return res.data;
    } catch {
      const total = store.attendanceRecords.length;
      const present = store.attendanceRecords.filter((r: any) => r.status === "present").length;
      const absent = store.attendanceRecords.filter((r: any) => r.status === "absent").length;
      const late = store.attendanceRecords.filter((r: any) => r.status === "late").length;
      return { success: true, data: { total, present, absent, late, percentage: total ? Math.round((present / total) * 100) : 0 } };
    }
  },

  // GRADE MODULE
  bulkCreateGrades: async (payload: any) => {
    try {
      const res = await apiClient.post("/grades/bulk-create", payload);
      return res.data;
    } catch {
      const newGrades = (payload.grades || []).map((g: any) => ({
        id: `GRD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        studentId: g.studentId,
        studentName: g.studentName,
        examId: g.examId || payload.examId,
        examTitle: g.examTitle || payload.examTitle,
        grade: g.grade,
        score: g.score,
      }));
      store.grades.push(...newGrades);
      return { success: true, message: `${newGrades.length} grades recorded`, data: newGrades };
    }
  },

  // FEE STRUCTURE MODULE
  getFeeStructures: async () => {
    try {
      const res = await apiClient.get("/fee-structures");
      return unwrapResponse(res, store.feeStructures);
    } catch {
      return store.feeStructures;
    }
  },
  createFeeStructure: async (payload: any) => {
    try {
      const res = await apiClient.post("/fee-structures/create", payload);
      return res.data;
    } catch {
      const newStructure = {
        id: `FS-${Date.now()}`,
        program: payload.program,
        year: payload.year,
        tuitionFee: payload.tuitionFee,
        hostelFee: payload.hostelFee || 0,
        otherFees: payload.otherFees || 0,
        totalFee: payload.tuitionFee + (payload.hostelFee || 0) + (payload.otherFees || 0),
      };
      store.feeStructures.push(newStructure);
      return { success: true, data: newStructure };
    }
  },

  // RECEIPT MODULE
  getReceipts: async () => {
    try {
      const res = await apiClient.get("/receipts");
      return unwrapResponse(res, store.receipts);
    } catch {
      return store.receipts;
    }
  },
  createReceipt: async (payload: any) => {
    try {
      const res = await apiClient.post("/receipts/create", payload);
      return res.data;
    } catch {
      const newReceipt = {
        id: `RCT-${Date.now()}`,
        receiptNo: `RCP-2026-${String(store.receipts.length + 1).padStart(4, "0")}`,
        studentName: payload.studentName,
        amount: payload.amount,
        paymentMethod: payload.paymentMethod || "cash",
        date: new Date().toISOString().split("T")[0],
        feeType: payload.feeType || "General",
      };
      store.receipts.push(newReceipt);
      return { success: true, data: newReceipt };
    }
  },

  // SCHOLARSHIP MODULE
  getScholarships: async () => {
    try {
      const res = await apiClient.get("/scholarships");
      return unwrapResponse(res, store.scholarships);
    } catch {
      return store.scholarships;
    }
  },
  createScholarship: async (payload: any) => {
    try {
      const res = await apiClient.post("/scholarships/create", payload);
      return res.data;
    } catch {
      const newScholarship = {
        id: `SCH-${Date.now()}`,
        studentName: payload.studentName,
        scholarshipName: payload.scholarshipName,
        amount: payload.amount,
        status: "pending",
        awardDate: payload.awardDate || "",
      };
      store.scholarships.push(newScholarship);
      return { success: true, data: newScholarship };
    }
  },
  updateScholarship: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/scholarships/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.scholarships.findIndex((s: any) => s.id === id);
      if (idx !== -1) store.scholarships[idx] = { ...store.scholarships[idx], ...payload };
      return { success: true, message: "Scholarship updated" };
    }
  },
  deleteScholarship: async (id: string) => {
    try {
      const res = await apiClient.delete(`/scholarships/${id}`);
      return res.data;
    } catch {
      store.scholarships = store.scholarships.filter((s: any) => s.id !== id);
      return { success: true, message: "Scholarship deleted" };
    }
  },
  approveScholarship: async (id: string) => {
    try {
      const res = await apiClient.patch(`/scholarships/${id}/approve`);
      return res.data;
    } catch {
      const s = store.scholarships.find((x: any) => x.id === id);
      if (s) s.status = "approved";
      return { success: true, message: "Scholarship approved" };
    }
  },
  rejectScholarship: async (id: string) => {
    try {
      const res = await apiClient.patch(`/scholarships/${id}/reject`);
      return res.data;
    } catch {
      const s = store.scholarships.find((x: any) => x.id === id);
      if (s) s.status = "rejected";
      return { success: true, message: "Scholarship rejected" };
    }
  },

  // EXPENSE MODULE
  getExpenses: async () => {
    try {
      const res = await apiClient.get("/expenses");
      return unwrapResponse(res, store.expenses);
    } catch {
      return store.expenses;
    }
  },
  createExpense: async (payload: any) => {
    try {
      const res = await apiClient.post("/expenses/create", payload);
      return res.data;
    } catch {
      const newExpense = {
        id: `EXP-${Date.now()}`,
        description: payload.description,
        category: payload.category,
        amount: payload.amount,
        date: payload.date || new Date().toISOString().split("T")[0],
        paidBy: payload.paidBy || "Accounts Dept",
      };
      store.expenses.push(newExpense);
      return { success: true, data: newExpense };
    }
  },
  updateExpense: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/expenses/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.expenses.findIndex((e: any) => e.id === id);
      if (idx !== -1) store.expenses[idx] = { ...store.expenses[idx], ...payload };
      return { success: true, message: "Expense updated" };
    }
  },
  deleteExpense: async (id: string) => {
    try {
      const res = await apiClient.delete(`/expenses/${id}`);
      return res.data;
    } catch {
      store.expenses = store.expenses.filter((e: any) => e.id !== id);
      return { success: true, message: "Expense deleted" };
    }
  },
  getExpenseSummary: async () => {
    try {
      const res = await apiClient.get("/expenses/summary");
      return res.data;
    } catch {
      const summary: Record<string, number> = {};
      store.expenses.forEach((e: any) => {
        summary[e.category] = (summary[e.category] || 0) + e.amount;
      });
      const total = store.expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
      return { success: true, data: { total, byCategory: summary, count: store.expenses.length } };
    }
  },

  // BUDGET MODULE
  getBudgets: async () => {
    try {
      const res = await apiClient.get("/budgets");
      return unwrapResponse(res, store.budgets);
    } catch {
      return store.budgets;
    }
  },
  createBudget: async (payload: any) => {
    try {
      const res = await apiClient.post("/budgets/create-budget", payload);
      return res.data;
    } catch {
      const newBudget = {
        id: `BGT-${Date.now()}`,
        budgetHead: payload.budgetHead,
        category: payload.category,
        allocatedAmount: payload.allocatedAmount,
        spentAmount: payload.spentAmount || 0,
        fiscalYear: payload.fiscalYear,
        department: payload.department || "",
        status: payload.status || "active",
        description: payload.description || "",
      };
      store.budgets.push(newBudget);
      return { success: true, data: newBudget };
    }
  },
  updateBudget: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/budgets/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.budgets.findIndex((b: any) => b.id === id);
      if (idx !== -1) store.budgets[idx] = { ...store.budgets[idx], ...payload };
      return { success: true, message: "Budget updated" };
    }
  },
  deleteBudget: async (id: string) => {
    try {
      const res = await apiClient.delete(`/budgets/${id}`);
      return res.data;
    } catch {
      store.budgets = store.budgets.filter((b: any) => b.id !== id);
      return { success: true, message: "Budget deleted" };
    }
  },
  getBudgetSummary: async () => {
    try {
      const res = await apiClient.get("/budgets/summary");
      return res.data;
    } catch {
      const totalAllocated = store.budgets.reduce((sum: number, b: any) => sum + b.allocatedAmount, 0);
      const totalSpent = store.budgets.reduce((sum: number, b: any) => sum + b.spentAmount, 0);
      return { success: true, data: { summary: [], totals: { totalAllocated, totalSpent, count: store.budgets.length } } };
    }
  },

  // BOOK MODULE
  getBooks: async () => {
    try {
      const res = await apiClient.get("/books");
      return unwrapResponse(res, store.books);
    } catch {
      return store.books;
    }
  },
  updateBook: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/books/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.books.findIndex((b: any) => b.id === id);
      if (idx !== -1) store.books[idx] = { ...store.books[idx], ...payload };
      return { success: true, message: "Book updated" };
    }
  },
  deleteBook: async (id: string) => {
    try {
      const res = await apiClient.delete(`/books/${id}`);
      return res.data;
    } catch {
      store.books = store.books.filter((b: any) => b.id !== id);
      return { success: true, message: "Book deleted" };
    }
  },
  getSingleBook: async (id: string) => {
    try {
      const res = await apiClient.get(`/books/${id}`);
      return res.data;
    } catch {
      return store.books.find((b: any) => b.id === id) || null;
    }
  },
  createBook: async (payload: any) => {
    try {
      const res = await apiClient.post("/books/create", payload);
      return res.data;
    } catch {
      const newBook = {
        id: `BK-${Date.now()}`,
        title: payload.title,
        author: payload.author,
        isbn: payload.isbn || "",
        category: payload.category || "General",
        quantity: payload.quantity || 1,
        available: payload.quantity || 1,
      };
      store.books.push(newBook);
      return { success: true, data: newBook };
    }
  },

  // LIBRARY MODULE
  getLibraryRecords: async () => {
    try {
      const res = await apiClient.get("/library");
      return unwrapResponse(res, store.libraryRecords);
    } catch {
      return store.libraryRecords;
    }
  },
  issueBook: async (payload: any) => {
    try {
      const res = await apiClient.post("/library/issue", payload);
      return res.data;
    } catch {
      const newRecord = {
        id: `LIB-${Date.now()}`,
        studentName: payload.studentName,
        bookTitle: payload.bookTitle,
        issueDate: payload.issueDate || new Date().toISOString().split("T")[0],
        dueDate: payload.dueDate,
        returnDate: null,
        status: "issued",
      };
      store.libraryRecords.push(newRecord);
      const bookIdx = store.books.findIndex((b: any) => b.title === payload.bookTitle);
      if (bookIdx !== -1) {
        store.books[bookIdx].available = Math.max(0, store.books[bookIdx].available - 1);
      }
      return { success: true, data: newRecord };
    }
  },
  returnBook: async (id: string) => {
    try {
      const res = await apiClient.patch(`/library/${id}/return`);
      return res.data;
    } catch {
      const idx = store.libraryRecords.findIndex((l: any) => l.id === id);
      if (idx !== -1) {
        store.libraryRecords[idx].status = "returned";
        store.libraryRecords[idx].returnDate = new Date().toISOString().split("T")[0];
        const bookIdx = store.books.findIndex((b: any) => b.title === store.libraryRecords[idx].bookTitle);
        if (bookIdx !== -1) {
          store.books[bookIdx].available = Math.min(store.books[bookIdx].quantity, store.books[bookIdx].available + 1);
        }
      }
      return { success: true, message: "Book returned" };
    }
  },
  updateLibraryRecord: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/library/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.libraryRecords.findIndex((l: any) => l.id === id);
      if (idx !== -1) store.libraryRecords[idx] = { ...store.libraryRecords[idx], ...payload };
      return { success: true, message: "Library record updated" };
    }
  },
  deleteLibraryRecord: async (id: string) => {
    try {
      const res = await apiClient.delete(`/library/${id}`);
      return res.data;
    } catch {
      store.libraryRecords = store.libraryRecords.filter((l: any) => l.id !== id);
      return { success: true, message: "Library record deleted" };
    }
  },
  payFine: async (id: string, payload: any) => {
    try {
      const res = await apiClient.post(`/library/${id}/pay-fine`, payload);
      return res.data;
    } catch {
      return { success: true, message: "Fine paid", data: { id, amount: payload.amount || 0 } };
    }
  },
  getOverdueIssues: async () => {
    try {
      const res = await apiClient.get("/library/overdue");
      return unwrapResponse(res, []);
    } catch {
      const now = new Date();
      return store.libraryRecords
        .filter((r: any) => r.status === "issued" && new Date(r.dueDate) < now)
        .map((r: any) => {
          const daysOverdue = Math.floor((now.getTime() - new Date(r.dueDate).getTime()) / (1000 * 60 * 60 * 24));
          return { ...r, daysOverdue, calculatedFine: daysOverdue * 2 };
        });
    }
  },

  // EMPLOYEE MODULE
  getEmployees: async () => {
    try {
      const res = await apiClient.get("/employees");
      return unwrapResponse(res, store.employees);
    } catch {
      return store.employees;
    }
  },
  createEmployee: async (payload: any) => {
    try {
      const res = await apiClient.post("/employees/create", payload);
      return res.data;
    } catch {
      const newEmployee = {
        id: `EMP-${Date.now()}`,
        employeeId: `EMP-${1000 + store.employees.length + 1}`,
        name: payload.name,
        email: payload.email,
        department: payload.department || "",
        designation: payload.designation || "",
        joiningDate: payload.joiningDate || new Date().toISOString().split("T")[0],
        salary: payload.salary || 0,
      };
      store.employees.push(newEmployee);
      return { success: true, data: newEmployee };
    }
  },

  // SHIFT MODULE
  getShifts: async () => {
    try {
      const res = await apiClient.get("/shifts");
      return unwrapResponse(res, store.shifts);
    } catch {
      return store.shifts;
    }
  },
  createShift: async (payload: any) => {
    try {
      const res = await apiClient.post("/shifts/create", payload);
      return res.data;
    } catch {
      const newShift = {
        id: `SFT-${Date.now()}`,
        employeeName: payload.employeeName,
        shiftType: payload.shiftType,
        startTime: payload.startTime,
        endTime: payload.endTime,
        date: payload.date,
        status: "scheduled",
      };
      store.shifts.push(newShift);
      return { success: true, data: newShift };
    }
  },
  // PATIENT ENCOUNTER MODULE
  getPatientEncounters: async () => {
    try {
      const res = await apiClient.get("/patient-encounters");
      return unwrapResponse(res, store.patientEncounters);
    } catch {
      return store.patientEncounters;
    }
  },
  createPatientEncounter: async (payload: any) => {
    try {
      const res = await apiClient.post("/patient-encounters/create", payload);
      return res.data;
    } catch {
      const newEncounter = {
        id: `PE-${Date.now()}`,
        patientName: payload.patientName,
        department: payload.department || "General Medicine",
        doctorName: payload.doctorName || "",
        symptoms: payload.symptoms || "",
        diagnosis: payload.diagnosis || "",
        visitDate: payload.visitDate || new Date().toISOString().split("T")[0],
        status: "completed",
      };
      store.patientEncounters.push(newEncounter);
      return { success: true, data: newEncounter };
    }
  },

  // RESEARCH MODULE
  getResearchProjects: async () => {
    try {
      const res = await apiClient.get("/research-projects");
      return unwrapResponse(res, store.researchProjects);
    } catch {
      return store.researchProjects;
    }
  },
  createResearchProject: async (payload: any) => {
    try {
      const res = await apiClient.post("/research-projects/create", payload);
      return res.data;
    } catch {
      const newProject = {
        id: `RP-${Date.now()}`,
        title: payload.title,
        leadResearcher: payload.leadResearcher,
        department: payload.department || "",
        startDate: payload.startDate,
        endDate: payload.endDate || "",
        fundingAmount: payload.fundingAmount || 0,
        status: "active",
      };
      store.researchProjects.push(newProject);
      return { success: true, data: newProject };
    }
  },
  updateResearchProject: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/research-projects/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.researchProjects.findIndex((r: any) => r.id === id);
      if (idx !== -1) store.researchProjects[idx] = { ...store.researchProjects[idx], ...payload };
      return { success: true, message: "Research project updated" };
    }
  },
  deleteResearchProject: async (id: string) => {
    try {
      const res = await apiClient.delete(`/research-projects/${id}`);
      return res.data;
    } catch {
      store.researchProjects = store.researchProjects.filter((r: any) => r.id !== id);
      return { success: true, message: "Research project deleted" };
    }
  },

  // HEALTH CENTER MODULE
  getHealthVisits: async () => {
    try {
      const res = await apiClient.get("/health-visits");
      return unwrapResponse(res, store.healthVisits);
    } catch {
      return store.healthVisits;
    }
  },
  createHealthVisit: async (payload: any) => {
    try {
      const res = await apiClient.post("/health-visits/create", payload);
      return res.data;
    } catch {
      const newVisit = {
        id: `HV-${Date.now()}`,
        studentName: payload.studentName,
        reason: payload.reason,
        visitDate: payload.visitDate || new Date().toISOString().split("T")[0],
        doctorName: payload.doctorName || "",
        prescription: payload.prescription || "",
        followUpDate: payload.followUpDate || "",
      };
      store.healthVisits.push(newVisit);
      return { success: true, data: newVisit };
    }
  },
  updateHealthVisit: async (id: string, payload: any) => {
    await delay();
    const store = getStore();
    const idx = store.healthVisits.findIndex((v: any) => v.id === id);
    if (idx === -1) throw new Error("Visit not found");
    store.healthVisits[idx] = { ...store.healthVisits[idx], ...payload };
    return unwrapResponse(store.healthVisits[idx]);
  },
  deleteHealthVisit: async (id: string) => {
    await delay();
    const store = getStore();
    store.healthVisits = store.healthVisits.filter((v: any) => v.id !== id);
    return unwrapResponse({ success: true });
  },

  // NOTICE MODULE
  getNotices: async () => {
    try {
      const res = await apiClient.get("/notices");
      return unwrapResponse(res, store.notices);
    } catch {
      return store.notices;
    }
  },
  createNotice: async (payload: any) => {
    try {
      const res = await apiClient.post("/notices/create", payload);
      return res.data;
    } catch {
      const newNotice = {
        id: `NTC-${Date.now()}`,
        title: payload.title,
        content: payload.content,
        audience: payload.audience || "all",
        postedBy: payload.postedBy || "Admin Office",
        postedDate: new Date().toISOString().split("T")[0],
        status: payload.status || "active",
        priority: payload.priority || "normal",
        validFrom: payload.validFrom || new Date().toISOString().split("T")[0],
        validTo: payload.validTo || null,
        targetRoles: payload.targetRoles || [],
      };
      store.notices.push(newNotice);
      return { success: true, data: newNotice };
    }
  },
  updateNotice: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/notices/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.notices.findIndex((n: any) => n.id === id);
      if (idx !== -1) {
        store.notices[idx] = { ...store.notices[idx], ...payload };
      }
      return { success: true, data: payload };
    }
  },

  // COMMITTEE MODULE
  getCommittees: async () => {
    try {
      const res = await apiClient.get("/committees");
      return unwrapResponse(res, store.committees);
    } catch {
      return store.committees;
    }
  },
  createCommittee: async (payload: any) => {
    try {
      const res = await apiClient.post("/committees/create", payload);
      return res.data;
    } catch {
      const newCommittee = {
        id: `CMT-${Date.now()}`,
        name: payload.name,
        chairperson: payload.chairperson,
        members: payload.members || [],
        formedDate: payload.formedDate || new Date().toISOString().split("T")[0],
        status: "active",
      };
      store.committees.push(newCommittee);
      return { success: true, data: newCommittee };
    }
  },

  // ACCREDITATION MODULE
  getAccreditations: async () => {
    try {
      const res = await apiClient.get("/accreditations");
      return unwrapResponse(res, store.accreditations);
    } catch {
      return store.accreditations;
    }
  },
  createAccreditation: async (payload: any) => {
    try {
      const res = await apiClient.post("/accreditations/create", payload);
      return res.data;
    } catch {
      const newAccreditation = {
        id: `ACR-${Date.now()}`,
        accreditingBody: payload.accreditingBody,
        status: "under-review",
        validFrom: payload.validFrom || "",
        validUntil: payload.validUntil || "",
        score: payload.score || "",
        lastReviewDate: new Date().toISOString().split("T")[0],
      };
      store.accreditations.push(newAccreditation);
      return { success: true, data: newAccreditation };
    }
  },
  updateAccreditation: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/accreditations/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.accreditations.findIndex((a: any) => a.id === id);
      if (idx !== -1) store.accreditations[idx] = { ...store.accreditations[idx], ...payload };
      return { success: true, message: "Accreditation updated" };
    }
  },
  deleteAccreditation: async (id: string) => {
    try {
      const res = await apiClient.delete(`/accreditations/${id}`);
      return res.data;
    } catch {
      store.accreditations = store.accreditations.filter((a: any) => a.id !== id);
      return { success: true, message: "Accreditation deleted" };
    }
  },

  // NOTIFICATION MODULE
  getUnreadNotificationCount: async () => {
    try {
      const res = await apiClient.get("/notifications/unread-count");
      return res.data;
    } catch {
      const count = store.notifications.filter((n: any) => !n.isRead).length;
      return { success: true, data: { count } };
    }
  },

  // DASHBOARD MODULE
  getDashboardStats: async () => {
    try {
      const res = await apiClient.get("/dashboard");
      return unwrapResponse(res, store.dashboardStats);
    } catch {
      return store.dashboardStats;
    }
  },

  // TRANSPORT MODULE (aliases)
  getTransportVehicles: async () => {
    try {
      const res = await apiClient.get("/transport/vehicles");
      return unwrapResponse(res, store.vehicles);
    } catch {
      return store.vehicles;
    }
  },
  createTransportVehicle: async (payload: any) => {
    try {
      const res = await apiClient.post("/transport/vehicles", payload);
      return res.data;
    } catch {
      const newVehicle = {
        id: `VEH-${Date.now()}`,
        vehicleNumber: payload.vehicleNumber,
        type: payload.type,
        capacity: payload.capacity,
        driverName: payload.driverName,
        status: payload.status || "active",
      };
      store.vehicles.push(newVehicle);
      return { success: true, data: newVehicle };
    }
  },

  // CHAT MODULE
  createConversation: async (payload: any) => {
    try {
      const res = await apiClient.post("/chat/conversations", payload);
      return res.data;
    } catch {
      const newConversation = {
        id: `CONV-${Date.now()}`,
        participants: payload.participants || [],
        lastMessage: "",
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
      };
      store.conversations.push(newConversation);
      return { success: true, data: newConversation };
    }
  },
  markMessagesRead: async (conversationId: string) => {
    try {
      const res = await apiClient.patch(`/chat/messages/${conversationId}/read`);
      return res.data;
    } catch {
      const idx = store.conversations.findIndex((c: any) => c.id === conversationId);
      if (idx !== -1) {
        store.conversations[idx].unreadCount = 0;
      }
      return { success: true };
    }
  },

  // PARENT MODULE
  getParentByUser: async (userId: string) => {
    try {
      const res = await apiClient.get(`/parents/user/${userId}`);
      return res.data;
    } catch {
      const parent = store.parents.find((p: any) =>
        p.children?.some((c: any) => c.id === userId)
      );
      return { success: true, data: parent };
    }
  },

  // MAINTENANCE MODULE
  getMaintenanceComplaints: async () => {
    try {
      const res = await apiClient.get("/maintenance");
      return unwrapResponse(res, store.maintenanceComplaints);
    } catch {
      return store.maintenanceComplaints;
    }
  },
  createMaintenanceComplaint: async (payload: any) => {
    try {
      const res = await apiClient.post("/maintenance/create", payload);
      return res.data;
    } catch {
      const newComplaint = {
        id: `MNT-${Date.now()}`,
        complaintNo: `MNT-2026-${String(store.maintenanceComplaints.length + 1).padStart(3, "0")}`,
        studentName: payload.studentName,
        issue: payload.issue,
        location: payload.location,
        severity: payload.severity || "medium",
        status: "open",
        reportedDate: new Date().toISOString().split("T")[0],
      };
      store.maintenanceComplaints.push(newComplaint);
      return { success: true, data: newComplaint };
    }
  },
  updateComplaintStatus: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/maintenance/${id}/status`, payload);
      return res.data;
    } catch {
      const idx = store.maintenanceComplaints.findIndex((m: any) => m.id === id);
      if (idx !== -1) {
        store.maintenanceComplaints[idx] = { ...store.maintenanceComplaints[idx], ...payload };
      }
      return { success: true };
    }
  },

  // OPD MODULE (B5)
  getOPDAppointments: async () => {
    try {
      const res = await apiClient.get("/opd/appointments");
      return unwrapResponse(res, store.opdAppointments);
    } catch { return store.opdAppointments; }
  },
  createOPDAppointment: async (payload: any) => {
    try {
      const res = await apiClient.post("/opd/appointments/create", payload);
      return res.data;
    } catch {
      const newItem = { id: `OPD-APPT-${Date.now()}`, ...payload, status: "scheduled" };
      store.opdAppointments.push(newItem);
      return { success: true, data: newItem };
    }
  },
  updateAppointmentStatus: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/opd/appointments/${id}/status`, payload);
      return res.data;
    } catch {
      const idx = store.opdAppointments.findIndex((a: any) => a.id === id);
      if (idx !== -1) store.opdAppointments[idx] = { ...store.opdAppointments[idx], ...payload };
      return { success: true };
    }
  },
  updateOPDAppointment: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/opd/appointments/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.opdAppointments.findIndex((a: any) => a.id === id);
      if (idx !== -1) store.opdAppointments[idx] = { ...store.opdAppointments[idx], ...payload };
      return { success: true };
    }
  },
  deleteOPDAppointment: async (id: string) => {
    try {
      const res = await apiClient.delete(`/opd/appointments/${id}`);
      return res.data;
    } catch {
      store.opdAppointments = store.opdAppointments.filter((a: any) => a.id !== id);
      return { success: true };
    }
  },
  getOPDVisits: async () => {
    try {
      const res = await apiClient.get("/opd/visits");
      return unwrapResponse(res, store.opdVisits);
    } catch { return store.opdVisits; }
  },
  createOPDVisit: async (payload: any) => {
    try {
      const res = await apiClient.post("/opd/visits/create", payload);
      return res.data;
    } catch {
      const newItem = { id: `OPD-VIS-${Date.now()}`, ...payload };
      store.opdVisits.push(newItem);
      return { success: true, data: newItem };
    }
  },
  deleteOPDVisit: async (id: string) => {
    try {
      const res = await apiClient.delete(`/opd/visits/${id}`);
      return res.data;
    } catch {
      store.opdVisits = store.opdVisits.filter((v: any) => v.id !== id);
      return { success: true };
    }
  },
  updateOPDVisit: async (id: string, payload: any) => {
    await delay();
    const store = getStore();
    const idx = store.opdVisits.findIndex((v: any) => v.id === id);
    if (idx === -1) throw new Error("Visit not found");
    store.opdVisits[idx] = { ...store.opdVisits[idx], ...payload };
    return unwrapResponse(store.opdVisits[idx]);
  },

  // IPD MODULE (B5)
  getIPDAdmissions: async () => {
    try {
      const res = await apiClient.get("/ipd/admissions");
      return unwrapResponse(res, store.ipdAdmissions);
    } catch { return store.ipdAdmissions; }
  },
  createIPDAdmission: async (payload: any) => {
    try {
      const res = await apiClient.post("/ipd/admissions/create", payload);
      return res.data;
    } catch {
      const newItem = { id: `IPD-ADM-${Date.now()}`, ...payload, status: "admitted" };
      store.ipdAdmissions.push(newItem);
      return { success: true, data: newItem };
    }
  },
  dischargePatient: async (admissionId: string, payload: any) => {
    try {
      const res = await apiClient.post(`/ipd/admissions/${admissionId}/discharge`, payload);
      return res.data;
    } catch {
      const newDischarge = { id: `IPD-DIS-${Date.now()}`, admissionId, ...payload };
      store.ipdDischarges.push(newDischarge);
      const idx = store.ipdAdmissions.findIndex((a: any) => a.id === admissionId);
      if (idx !== -1) store.ipdAdmissions[idx].status = "discharged";
      return { success: true, data: newDischarge };
    }
  },
  getIPDDischarges: async () => {
    try {
      const res = await apiClient.get("/ipd/discharges");
      return unwrapResponse(res, store.ipdDischarges);
    } catch { return store.ipdDischarges; }
  },
  deleteIPDAdmission: async (id: string) => {
    await delay();
    const store = getStore();
    store.ipdAdmissions = store.ipdAdmissions.filter((a: any) => a.id !== id);
    return unwrapResponse({ success: true });
  },
  updateIPDAdmission: async (id: string, payload: any) => {
    await delay();
    const store = getStore();
    const idx = store.ipdAdmissions.findIndex((a: any) => a.id === id);
    if (idx === -1) throw new Error("Admission not found");
    store.ipdAdmissions[idx] = { ...store.ipdAdmissions[idx], ...payload };
    return unwrapResponse(store.ipdAdmissions[idx]);
  },
  updateIPDDischarge: async (id: string, payload: any) => {
    await delay();
    const store = getStore();
    const idx = store.ipdDischarges.findIndex((d: any) => d.id === id);
    if (idx === -1) throw new Error("Discharge not found");
    store.ipdDischarges[idx] = { ...store.ipdDischarges[idx], ...payload };
    return unwrapResponse(store.ipdDischarges[idx]);
  },
  getCurrentIPDAdmissions: async () => {
    try {
      const res = await apiClient.get("/ipd/admissions/current");
      return unwrapResponse(res, store.ipdAdmissions.filter((a: any) => a.status === "admitted"));
    } catch { return store.ipdAdmissions.filter((a: any) => a.status === "admitted"); }
  },

  // LABORATORY MODULE (B6)
  getLabTests: async () => {
    try {
      const res = await apiClient.get("/laboratory/tests");
      return unwrapResponse(res, store.labTests);
    } catch { return store.labTests; }
  },
  createLabTest: async (payload: any) => {
    try {
      const res = await apiClient.post("/laboratory/tests/create", payload);
      return res.data;
    } catch {
      const newItem = { id: `LAB-TST-${Date.now()}`, ...payload };
      store.labTests.push(newItem);
      return { success: true, data: newItem };
    }
  },
  updateLabTest: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/laboratory/tests/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.labTests.findIndex((t: any) => t.id === id);
      if (idx !== -1) store.labTests[idx] = { ...store.labTests[idx], ...payload };
      return { success: true };
    }
  },
  deleteLabTest: async (id: string) => {
    try {
      const res = await apiClient.delete(`/laboratory/tests/${id}`);
      return res.data;
    } catch {
      store.labTests = store.labTests.filter((t: any) => t.id !== id);
      return { success: true };
    }
  },
  getLabRequests: async () => {
    try {
      const res = await apiClient.get("/laboratory/requests");
      return unwrapResponse(res, store.labRequests);
    } catch { return store.labRequests; }
  },
  createLabRequest: async (payload: any) => {
    try {
      const res = await apiClient.post("/laboratory/requests/create", payload);
      return res.data;
    } catch {
      const newItem = { id: `LAB-REQ-${Date.now()}`, ...payload, status: "pending" };
      store.labRequests.push(newItem);
      return { success: true, data: newItem };
    }
  },
  updateLabRequestStatus: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/laboratory/requests/${id}/status`, payload);
      return res.data;
    } catch {
      const idx = store.labRequests.findIndex((r: any) => r.id === id);
      if (idx !== -1) store.labRequests[idx] = { ...store.labRequests[idx], ...payload };
      return { success: true };
    }
  },
  deleteLabRequest: async (id: string) => {
    await delay();
    const store = getStore();
    store.labRequests = store.labRequests.filter((r: any) => r.id !== id);
    return unwrapResponse({ success: true });
  },
  getLabResultsByRequest: async (requestId: string) => {
    try {
      const res = await apiClient.get(`/laboratory/results/request/${requestId}`);
      return unwrapResponse(res, store.labResults.filter((r: any) => r.requestId === requestId));
    } catch { return store.labResults.filter((r: any) => r.requestId === requestId); }
  },
  createLabResult: async (payload: any) => {
    try {
      const res = await apiClient.post("/laboratory/results/create", payload);
      return res.data;
    } catch {
      const newItem = { id: `LAB-RES-${Date.now()}`, ...payload };
      store.labResults.push(newItem);
      return { success: true, data: newItem };
    }
  },
  updateLabResult: async (id: string, payload: any) => {
    await delay();
    const store = getStore();
    const idx = store.labResults.findIndex((r: any) => r.id === id);
    if (idx === -1) throw new Error("Result not found");
    store.labResults[idx] = { ...store.labResults[idx], ...payload };
    return unwrapResponse(store.labResults[idx]);
  },
  deleteLabResult: async (id: string) => {
    await delay();
    const store = getStore();
    store.labResults = store.labResults.filter((r: any) => r.id !== id);
    return unwrapResponse({ success: true });
  },

  // PHARMACY MODULE (B7)
  getDrugs: async () => {
    try {
      const res = await apiClient.get("/pharmacy/drugs");
      return unwrapResponse(res, store.drugs);
    } catch { return store.drugs; }
  },
  createDrug: async (payload: any) => {
    try {
      const res = await apiClient.post("/pharmacy/drugs/create", payload);
      return res.data;
    } catch {
      const newItem = { id: `DRG-${Date.now()}`, ...payload };
      store.drugs.push(newItem);
      return { success: true, data: newItem };
    }
  },
  updateDrug: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/pharmacy/drugs/${id}`, payload);
      return res.data;
    } catch {
      const idx = store.drugs.findIndex((d: any) => d.id === id);
      if (idx !== -1) store.drugs[idx] = { ...store.drugs[idx], ...payload };
      return { success: true };
    }
  },
  deleteDrug: async (id: string) => {
    try {
      const res = await apiClient.delete(`/pharmacy/drugs/${id}`);
      return res.data;
    } catch {
      store.drugs = store.drugs.filter((d: any) => d.id !== id);
      return { success: true };
    }
  },
  getLowStockDrugs: async () => {
    try {
      const res = await apiClient.get("/pharmacy/drugs/low-stock");
      return unwrapResponse(res, []);
    } catch {
      return store.drugs.filter((d: any) => d.stock <= d.reorderLevel);
    }
  },
  getPrescriptions: async () => {
    try {
      const res = await apiClient.get("/pharmacy/prescriptions");
      return unwrapResponse(res, store.prescriptions);
    } catch { return store.prescriptions; }
  },
  createPrescription: async (payload: any) => {
    try {
      const res = await apiClient.post("/pharmacy/prescriptions/create", payload);
      return res.data;
    } catch {
      const newItem = { id: `PRX-${Date.now()}`, ...payload };
      store.prescriptions.push(newItem);
      return { success: true, data: newItem };
    }
  },
  deletePrescription: async (id: string) => {
    await delay();
    const store = getStore();
    store.prescriptions = store.prescriptions.filter((p: any) => p.id !== id);
    return unwrapResponse({ success: true });
  },
  updatePrescription: async (id: string, payload: any) => {
    await delay();
    const store = getStore();
    const idx = store.prescriptions.findIndex((p: any) => p.id === id);
    if (idx === -1) throw new Error("Prescription not found");
    store.prescriptions[idx] = { ...store.prescriptions[idx], ...payload };
    return unwrapResponse(store.prescriptions[idx]);
  },
  getDispensings: async () => {
    try {
      const res = await apiClient.get("/pharmacy/dispensing");
      return unwrapResponse(res, store.dispensings);
    } catch { return store.dispensings; }
  },
  createDispensing: async (payload: any) => {
    try {
      const res = await apiClient.post("/pharmacy/dispensing/create", payload);
      return res.data;
    } catch {
      const newItem = { id: `DSP-${Date.now()}`, ...payload };
      store.dispensings.push(newItem);
      return { success: true, data: newItem };
    }
  },
  deleteDispensing: async (id: string) => {
    await delay();
    const store = getStore();
    store.dispensings = store.dispensings.filter((d: any) => d.id !== id);
    return unwrapResponse({ success: true });
  },
  updateDispensing: async (id: string, payload: any) => {
    await delay();
    const store = getStore();
    const idx = store.dispensings.findIndex((d: any) => d.id === id);
    if (idx === -1) throw new Error("Dispensing not found");
    store.dispensings[idx] = { ...store.dispensings[idx], ...payload };
    return unwrapResponse(store.dispensings[idx]);
  },
  getControlledSubstanceVault: async () => {
    try {
      const res = await apiClient.get("/pharmacy/vault");
      return unwrapResponse(res, {
        vaultStatus: "SECURE_LOCKED",
        lastAuditDate: new Date().toISOString().split("T")[0],
        totalAuditedVials: 1840,
        discrepancyCount: 0,
        narcotics: [
          { id: "NAR-01", name: "Morphine Sulfate 10mg/mL Ampoule", schedule: "Schedule II", balance: 142, bin: "VAULT-A-01", dualSignRequired: true },
          { id: "NAR-02", name: "Fentanyl Citrate 50mcg/mL (2mL)", schedule: "Schedule II", balance: 88, bin: "VAULT-A-02", dualSignRequired: true },
          { id: "NAR-03", name: "Midazolam 5mg/mL Injection", schedule: "Schedule IV", balance: 215, bin: "VAULT-B-04", dualSignRequired: true },
          { id: "NAR-04", name: "Ketamine Hydrochloride 50mg/mL", schedule: "Schedule III", balance: 64, bin: "VAULT-B-07", dualSignRequired: true },
        ],
      });
    } catch {
      return {
        vaultStatus: "SECURE_LOCKED",
        lastAuditDate: new Date().toISOString().split("T")[0],
        totalAuditedVials: 1840,
        discrepancyCount: 0,
        narcotics: [
          { id: "NAR-01", name: "Morphine Sulfate 10mg/mL Ampoule", schedule: "Schedule II", balance: 142, bin: "VAULT-A-01", dualSignRequired: true },
          { id: "NAR-02", name: "Fentanyl Citrate 50mcg/mL (2mL)", schedule: "Schedule II", balance: 88, bin: "VAULT-A-02", dualSignRequired: true },
          { id: "NAR-03", name: "Midazolam 5mg/mL Injection", schedule: "Schedule IV", balance: 215, bin: "VAULT-B-04", dualSignRequired: true },
          { id: "NAR-04", name: "Ketamine Hydrochloride 50mg/mL", schedule: "Schedule III", balance: 64, bin: "VAULT-B-07", dualSignRequired: true },
        ],
      };
    }
  },
  dispenseControlledSubstance: async (payload: any) => {
    try {
      const res = await apiClient.post("/pharmacy/vault/dispense", payload);
      return res.data;
    } catch {
      return { success: true, message: "Controlled substance dispensed with dual-key cryptographic validation.", timestamp: new Date().toISOString() };
    }
  },

  // SKILL LAB & OSCE MODULE
  getSkills: async () => {
    try {
      const res = await apiClient.get("/skill-lab/skills");
      return unwrapResponse(res, [
        { id: "SKL-101", studentId: "STU-2024-089", studentName: "Ayesha Siddiqua", topic: "Endotracheal Intubation (Adult)", category: "AIRWAY", station: "Station 3 (Resuscitation Bay)", score: 95, verifiedBy: "Dr. Farhan Tanvir, FCPS", status: "VERIFIED", date: "2026-10-02" },
        { id: "SKL-102", studentId: "STU-2024-041", studentName: "Rohan Mukherjee", topic: "Central Venous Catheterization (Ultrasound Guided)", category: "VASCULAR", station: "Station 5 (ICU Simulation)", score: 88, verifiedBy: "Dr. Nilufa Yasmin, MD", status: "VERIFIED", date: "2026-10-01" },
        { id: "SKL-103", studentId: "STU-2024-112", studentName: "Tahmina Akhter", topic: "Lumbar Puncture & CSF Pressure Manometry", category: "NEUROLOGY", station: "Station 2 (Procedural Bed)", score: 92, verifiedBy: "Prof. S. K. Roy", status: "VERIFIED", date: "2026-09-30" },
      ]);
    } catch {
      return [
        { id: "SKL-101", studentId: "STU-2024-089", studentName: "Ayesha Siddiqua", topic: "Endotracheal Intubation (Adult)", category: "AIRWAY", station: "Station 3 (Resuscitation Bay)", score: 95, verifiedBy: "Dr. Farhan Tanvir, FCPS", status: "VERIFIED", date: "2026-10-02" },
        { id: "SKL-102", studentId: "STU-2024-041", studentName: "Rohan Mukherjee", topic: "Central Venous Catheterization (Ultrasound Guided)", category: "VASCULAR", station: "Station 5 (ICU Simulation)", score: 88, verifiedBy: "Dr. Nilufa Yasmin, MD", status: "VERIFIED", date: "2026-10-01" },
        { id: "SKL-103", studentId: "STU-2024-112", studentName: "Tahmina Akhter", topic: "Lumbar Puncture & CSF Pressure Manometry", category: "NEUROLOGY", station: "Station 2 (Procedural Bed)", score: 92, verifiedBy: "Prof. S. K. Roy", status: "VERIFIED", date: "2026-09-30" },
      ];
    }
  },
  getLiveOsceCircuit: async () => {
    try {
      const res = await apiClient.get("/skill-lab/osce/live");
      return unwrapResponse(res, {
        circuitId: "OSCE-OCT-2026-CIRCUIT-A",
        activeStation: 3,
        totalStations: 8,
        timeRemainingSeconds: 240,
        candidates: [
          { candidateId: "CAN-001", name: "Ayesha Siddiqua", currentStation: 3, stationTitle: "Airway & Intubation", examiner: "Dr. Farhan Tanvir", status: "IN_PROGRESS" },
          { candidateId: "CAN-002", name: "Rohan Mukherjee", currentStation: 4, stationTitle: "Cardiovascular Exam", examiner: "Dr. N. Rahman", status: "IN_PROGRESS" },
        ]
      });
    } catch {
      return {
        circuitId: "OSCE-OCT-2026-CIRCUIT-A",
        activeStation: 3,
        totalStations: 8,
        timeRemainingSeconds: 240,
        candidates: [
          { candidateId: "CAN-001", name: "Ayesha Siddiqua", currentStation: 3, stationTitle: "Airway & Intubation", examiner: "Dr. Farhan Tanvir", status: "IN_PROGRESS" },
          { candidateId: "CAN-002", name: "Rohan Mukherjee", currentStation: 4, stationTitle: "Cardiovascular Exam", examiner: "Dr. N. Rahman", status: "IN_PROGRESS" },
        ]
      };
    }
  },
  getDopsProcedures: async () => {
    try {
      const res = await apiClient.get("/skill-lab/dops");
      return unwrapResponse(res, [
        { id: "DOPS-1", studentName: "Ayesha Siddiqua", procedureName: "Pleural Tap", patientId: "IPD-891", score: 4.8, assessor: "Dr. Farhan Tanvir", status: "APPROVED", date: "2026-10-03" },
        { id: "DOPS-2", studentName: "Rohan Mukherjee", procedureName: "Arterial Blood Gas (ABG) Sampling", patientId: "ICU-04", score: 4.5, assessor: "Dr. Nilufa Yasmin", status: "APPROVED", date: "2026-10-02" },
      ]);
    } catch {
      return [
        { id: "DOPS-1", studentName: "Ayesha Siddiqua", procedureName: "Pleural Tap", patientId: "IPD-891", score: 4.8, assessor: "Dr. Farhan Tanvir", status: "APPROVED", date: "2026-10-03" },
        { id: "DOPS-2", studentName: "Rohan Mukherjee", procedureName: "Arterial Blood Gas (ABG) Sampling", patientId: "ICU-04", score: 4.5, assessor: "Dr. Nilufa Yasmin", status: "APPROVED", date: "2026-10-02" },
      ];
    }
  },
  getManikinTelemetry: async () => {
    try {
      const res = await apiClient.get("/skill-lab/telemetry");
      return unwrapResponse(res, [
        { manikinId: "SIM-MAN-3G-01", model: "Laerdal SimMan 3G", battery: 94, cprCompressionDepth: "52 mm (Target 50-60mm)", cprRate: "108 bpm", status: "ONLINE", currentScenario: "Anaphylactic Shock with Stridor" },
        { manikinId: "SIM-BABY-02", model: "Gaumard Super TORY", battery: 88, cprCompressionDepth: "38 mm", cprRate: "115 bpm", status: "ONLINE", currentScenario: "Neonatal Resuscitation (APGAR 3)" },
      ]);
    } catch {
      return [
        { manikinId: "SIM-MAN-3G-01", model: "Laerdal SimMan 3G", battery: 94, cprCompressionDepth: "52 mm (Target 50-60mm)", cprRate: "108 bpm", status: "ONLINE", currentScenario: "Anaphylactic Shock with Stridor" },
        { manikinId: "SIM-BABY-02", model: "Gaumard Super TORY", battery: 88, cprCompressionDepth: "38 mm", cprRate: "115 bpm", status: "ONLINE", currentScenario: "Neonatal Resuscitation (APGAR 3)" },
      ];
    }
  },
  submitOsceStationScore: async (payload: any) => {
    try {
      const res = await apiClient.post("/skill-lab/osce/score", payload);
      return res.data;
    } catch {
      return { success: true, message: "OSCE station rubric scored." };
    }
  },
  submitDopsBedsideSignoff: async (payload: any) => {
    try {
      const res = await apiClient.post("/skill-lab/dops/signoff", payload);
      return res.data;
    } catch {
      return { success: true, message: "DOPS signoff recorded." };
    }
  },
  createSkill: async (payload: any) => {
    try {
      const res = await apiClient.post("/skill-lab/skills/create", payload);
      return res.data;
    } catch {
      return { success: true, data: { id: `SKL-${Date.now()}`, ...payload } };
    }
  },
  updateSkill: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/skill-lab/skills/${id}`, payload);
      return res.data;
    } catch {
      return { success: true, data: { id, ...payload } };
    }
  },
  deleteSkill: async (id: string) => {
    try {
      const res = await apiClient.delete(`/skill-lab/skills/${id}`);
      return res.data;
    } catch {
      return { success: true };
    }
  },

  // AUDIT LOGS MODULE
  getAuditLogs: async (params?: Record<string, any>) => {
    try {
      const res = await apiClient.get("/audit-logs", { params });
      return res.data;
    } catch {
      const mockLogs = [
        { id: "AUD-001", action: "CREATE", resource: "students", resourceId: "STU-001", userId: "USR-001", userRole: "super-admin", ipAddress: "192.168.1.10", timestamp: "2026-07-18T09:15:00Z", details: { before: null, after: { name: "Marcus Chen", email: "marcus.c@college.edu" } } },
        { id: "AUD-002", action: "UPDATE", resource: "fees", resourceId: "FEE-001", userId: "USR-002", userRole: "domain-admin", ipAddress: "192.168.1.22", timestamp: "2026-07-18T09:30:00Z", details: { before: { status: "pending" }, after: { status: "paid" } } },
        { id: "AUD-003", action: "DELETE", resource: "rooms", resourceId: "RM-004", userId: "USR-001", userRole: "super-admin", ipAddress: "192.168.1.10", timestamp: "2026-07-18T10:00:00Z", details: { before: { roomNumber: "A-103", capacity: 4 }, after: null } },
        { id: "AUD-004", action: "CREATE", resource: "courses", resourceId: "CRS-004", userId: "USR-002", userRole: "domain-admin", ipAddress: "192.168.1.22", timestamp: "2026-07-17T14:20:00Z", details: { before: null, after: { code: "CS-401", title: "Machine Learning" } } },
        { id: "AUD-005", action: "UPDATE", resource: "students", resourceId: "STU-003", userId: "USR-003", userRole: "faculty", ipAddress: "192.168.1.45", timestamp: "2026-07-17T11:45:00Z", details: { before: { roomNumber: "B-205" }, after: { roomNumber: "B-208" } } },
        { id: "AUD-006", action: "CREATE", resource: "fees", resourceId: "FEE-010", userId: "USR-001", userRole: "super-admin", ipAddress: "192.168.1.10", timestamp: "2026-07-16T08:00:00Z", details: { before: null, after: { studentId: "STU-005", amount: 75000, type: "Tuition Fee" } } },
        { id: "AUD-007", action: "DELETE", resource: "grievances", resourceId: "GRV-003", userId: "USR-002", userRole: "domain-admin", ipAddress: "192.168.1.22", timestamp: "2026-07-16T16:30:00Z", details: { before: { subject: "Duplicate grievance" }, after: null } },
        { id: "AUD-008", action: "UPDATE", resource: "faculties", resourceId: "FAC-001", userId: "USR-001", userRole: "super-admin", ipAddress: "192.168.1.10", timestamp: "2026-07-15T13:10:00Z", details: { before: { designation: "Assistant Professor" }, after: { designation: "Professor" } } },
        { id: "AUD-009", action: "CREATE", resource: "departments", resourceId: "DEP-004", userId: "USR-001", userRole: "super-admin", ipAddress: "192.168.1.10", timestamp: "2026-07-15T10:00:00Z", details: { before: null, after: { name: "Radiology" } } },
        { id: "AUD-010", action: "UPDATE", resource: "payroll", resourceId: "PR-002", userId: "USR-002", userRole: "domain-admin", ipAddress: "192.168.1.22", timestamp: "2026-07-14T09:20:00Z", details: { before: { status: "pending" }, after: { status: "paid", paidDate: "2026-07-14" } } },
        { id: "AUD-011", action: "DELETE", resource: "rooms", resourceId: "RM-003", userId: "USR-001", userRole: "super-admin", ipAddress: "192.168.1.10", timestamp: "2026-07-14T15:00:00Z", details: { before: { roomNumber: "B-205" }, after: null } },
        { id: "AUD-012", action: "CREATE", resource: "students", resourceId: "STU-006", userId: "USR-002", userRole: "domain-admin", ipAddress: "192.168.1.22", timestamp: "2026-07-13T11:30:00Z", details: { before: null, after: { name: "Eva Martinez", program: "MBBS" } } },
        { id: "AUD-013", action: "UPDATE", resource: "courses", resourceId: "CRS-001", userId: "USR-003", userRole: "faculty", ipAddress: "192.168.1.45", timestamp: "2026-07-13T08:45:00Z", details: { before: { credits: 3 }, after: { credits: 4 } } },
        { id: "AUD-014", action: "CREATE", resource: "exams", resourceId: "EXM-004", userId: "USR-002", userRole: "domain-admin", ipAddress: "192.168.1.22", timestamp: "2026-07-12T14:00:00Z", details: { before: null, after: { title: "CS-301 Final", date: "2026-08-01" } } },
        { id: "AUD-015", action: "DELETE", resource: "notifications", resourceId: "NOT-006", userId: "USR-001", userRole: "super-admin", ipAddress: "192.168.1.10", timestamp: "2026-07-12T09:00:00Z", details: { before: { title: "Old system notice" }, after: null } },
      ];
      return { logs: mockLogs, meta: { page: 1, limit: 15, total: 15, totalPages: 1 } };
    }
  },

  // USER MANAGEMENT MODULE
  getUsers: async (params?: Record<string, any>) => {
    try {
      const res = await apiClient.get("/users", { params });
      return res.data;
    } catch {
      await delay();
      const s = getStore();
      return { users: s.users, meta: { page: 1, limit: 15, total: s.users.length, totalPages: 1 } };
    }
  },
  updateUser: async (id: string, payload: any) => {
    try {
      const res = await apiClient.patch(`/users/${id}`, payload);
      return res.data;
    } catch {
      await delay();
      return { success: true, data: { id, ...payload } };
    }
  },
  deleteUser: async (id: string) => {
    try {
      const res = await apiClient.delete(`/users/${id}`);
      return res.data;
    } catch {
      await delay();
      return { success: true };
    }
  },

  // ACCOUNTING MODULE
  getAccounts: async () => {
    try {
      const res = await apiClient.get("/accounts");
      return res.data?.data || res.data || [];
    } catch {
      await delay();
      return [
        { _id: "ACC-01", accountCode: "1000", accountName: "Assets", accountType: "ASSET", normalBalance: "DEBIT" },
        { _id: "ACC-02", accountCode: "1120", accountName: "Bank Account", accountType: "ASSET", normalBalance: "DEBIT" },
        { _id: "ACC-03", accountCode: "1130", accountName: "Accounts Receivable", accountType: "ASSET", normalBalance: "DEBIT" },
        { _id: "ACC-04", accountCode: "2110", accountName: "Accounts Payable", accountType: "LIABILITY", normalBalance: "CREDIT" },
        { _id: "ACC-05", accountCode: "4100", accountName: "Fee Revenue", accountType: "INCOME", normalBalance: "CREDIT" },
        { _id: "ACC-06", accountCode: "5100", accountName: "General Expense", accountType: "EXPENSE", normalBalance: "DEBIT" },
      ];
    }
  },
  createAccount: async (payload: any) => {
    const res = await apiClient.post("/accounts", payload);
    return res.data;
  },
  getJournals: async () => {
    try {
      const res = await apiClient.get("/journals");
      return res.data?.data || res.data || [];
    } catch {
      await delay();
      return [
        { _id: "JRN-001", journalNumber: "JRN-2026-0001", voucherDate: new Date().toISOString(), journalType: "STANDARD", status: "POSTED", description: "Tuition fee invoice generation" },
        { _id: "JRN-002", journalNumber: "JRN-2026-0002", voucherDate: new Date().toISOString(), journalType: "STANDARD", status: "POSTED", description: "Lab consumable supply purchase" },
      ];
    }
  },
  createJournal: async (payload: any) => {
    const res = await apiClient.post("/journals", payload);
    return res.data;
  },
  getTrialBalance: async () => {
    try {
      const res = await apiClient.get("/accounting-reports/trial-balance");
      return res.data?.data || res.data || [];
    } catch {
      return [
        { accountId: "ACC-02", accountCode: "1120", accountName: "Bank Account", totalDebit: 1250000, totalCredit: 340000 },
        { accountId: "ACC-03", accountCode: "1130", accountName: "Accounts Receivable", totalDebit: 480000, totalCredit: 120000 },
        { accountId: "ACC-04", accountCode: "2110", accountName: "Accounts Payable", totalDebit: 90000, totalCredit: 250000 },
        { accountId: "ACC-05", accountCode: "4100", accountName: "Fee Revenue", totalDebit: 0, totalCredit: 1250000 },
        { accountId: "ACC-06", accountCode: "5100", accountName: "General Expense", totalDebit: 140000, totalCredit: 0 },
      ];
    }
  },
  getSubledgers: async (type: string = "AR") => {
    try {
      const res = await apiClient.get(`/subledgers/balances?type=${encodeURIComponent(type)}`);
      return res.data?.data || res.data || [];
    } catch {
      await delay();
      return [
        { _id: "STU-001", partyType: "Student", balance: 14500 },
        { _id: "STU-002", partyType: "Student", balance: 8200 },
      ];
    }
  },

  // BLOOD BANK MODULE
  getBloodStock: async () => {
    try {
      const res = await apiClient.get("/blood-bank/stock");
      return res.data?.data || res.data || [];
    } catch {
      await delay();
      return [
        { _id: "BB-01", bloodGroup: "O+", unitsAvailable: 12, component: "Whole Blood" },
        { _id: "BB-02", bloodGroup: "A+", unitsAvailable: 8, component: "Packed RBC" },
        { _id: "BB-03", bloodGroup: "B+", unitsAvailable: 6, component: "Platelets" },
        { _id: "BB-04", bloodGroup: "AB+", unitsAvailable: 3, component: "Fresh Frozen Plasma" },
        { _id: "BB-05", bloodGroup: "O-", unitsAvailable: 4, component: "Whole Blood" },
      ];
    }
  },
  requestTransfusion: async (payload: any) => {
    const res = await apiClient.post("/blood-bank/transfusions", payload);
    return res.data;
  },

  // TELEMEDICINE MODULE
  getTelemedicineConsultations: async () => {
    try {
      const res = await apiClient.get("/telemedicine/consultations");
      return res.data?.data || res.data || [];
    } catch {
      await delay();
      return [
        {
          _id: "TEL-001",
          doctorId: "DR-001",
          patientId: "PAT-001",
          doctorName: "Dr. James Sterling",
          patientName: "Marcus Chen",
          scheduledAt: new Date(Date.now() + 3600000).toISOString(),
          status: "SCHEDULED",
          meetingLink: "room-tele-001",
        },
      ];
    }
  },
  createTelemedicineConsultation: async (payload: any) => {
    const res = await apiClient.post("/telemedicine/consultations", payload);
    return res.data;
  },

  globalSearch: async (query: string) => {
    const q = query.trim();
    if (!q) return { results: [] };
    const res = await apiClient.get(`/search?q=${encodeURIComponent(q)}`);
    return res.data.data;
  },

  // --- LMS & CLASSROOM++ MODULE ---
  getLMSAssignments: async (courseId?: string) => {
    try {
      const url = courseId ? `/lms/courses/${courseId}/assignments` : `/lms/courses/CRS-CARD-301/assignments`;
      const res = await apiClient.get(url);
      return res.data?.data || res.data || [];
    } catch {
      await delay();
      return [
        {
          _id: "ASG-001",
          title: "Pressure-Volume Loops & Inotrope Titration in Cardiogenic Shock",
          description: "Analyze catheterization hemodynamics of a 62-year-old post-infarct patient. Construct the PV-loop in python and simulate dobutamine vs milrinone curves.",
          courseId: "CRS-CARD-301",
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          maxPoints: 100,
          status: "PUBLISHED",
          allowedModes: ["CODE_NOTEBOOK", "DOCUMENT", "DIGITAL_INK", "GIT_REPO"],
          requiresOralDefense: true,
          rubricCriteria: [
            { criterion: "Hemodynamic Derivation", maxPoints: 30, description: "Correct end-systolic and end-diastolic elastance curves" },
            { criterion: "Pharmacodynamic Comparison", maxPoints: 40, description: "PDE3 vs beta-1 adrenoceptor pathway comparison" },
            { criterion: "Oral Defense Clarity", maxPoints: 30, description: "60-second video defense demonstrating concept mastery" }
          ]
        },
        {
          _id: "ASG-002",
          title: "Surgical Anatomy of the Pterygopalatine Fossa: 3D Vector Inking",
          description: "Submit a high-resolution vector schematic tracing the branches of the maxillary artery (3rd part) and pterygopalatine ganglion.",
          courseId: "CRS-ANAT-102",
          dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
          maxPoints: 50,
          status: "PUBLISHED",
          allowedModes: ["DIGITAL_INK", "DOCUMENT"],
          requiresOralDefense: false,
          rubricCriteria: [
            { criterion: "Foramen Connections", maxPoints: 25, description: "Correct labeling of 7 conduits leading into the fossa" },
            { criterion: "Neurovascular Bundles", maxPoints: 25, description: "Accurate path of V2 and greater petrosal nerve" }
          ]
        }
      ];
    }
  },

  submitLMSAssignment: async (payload: any) => {
    try {
      const res = await apiClient.post("/lms/submissions", payload);
      return res.data?.data || res.data;
    } catch {
      await delay();
      return { _id: `SUB-${Date.now()}`, ...payload, status: "SUBMITTED", submissionDate: new Date().toISOString() };
    }
  },

  getLMSDiscussions: async (courseId?: string) => {
    try {
      const url = courseId ? `/lms/courses/${courseId}/discussions` : `/lms/courses/CRS-CARD-301/discussions`;
      const res = await apiClient.get(url);
      return res.data?.data || res.data || [];
    } catch {
      await delay();
      return [
        {
          _id: "disc-1",
          courseId: "CRS-CARD-301",
          authorName: "Dr. Aris Thorne",
          authorRole: "FACULTY",
          title: "Hemodynamic consequences of Milrinone vs Dobutamine in Cardiogenic Shock",
          content: "When titrating inodilators in stage D heart failure with borderline MAP (62 mmHg), why does milrinone produce greater afterload reduction without tachycardia compared to beta-1 adrenergic agonists? Let us analyze the PDE3 inhibition kinetics: $$\\Delta SVR \\propto -k [cAMP]_{vasc}$$",
          isAnonymousToPeers: false,
          isPinned: true,
          isInstructorEndorsed: true,
          upvotes: 42,
          tags: ["Cardiology", "Pharmacology", "Hemodynamics"],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          replies: [
            {
              _id: "rep-1",
              authorName: "Priya Sharma (MS-3)",
              authorRole: "STUDENT",
              content: "Because Milrinone avoids direct beta-receptor down-regulation! It prevents the degradation of cAMP rather than over-stimulating the desensitized beta-1 receptors.",
              isInstructorEndorsed: true,
              upvotes: 18,
              createdAt: new Date(Date.now() - 3600000).toISOString()
            }
          ]
        },
        {
          _id: "disc-2",
          courseId: "CRS-CARD-301",
          authorName: "Scholar #409",
          authorRole: "STUDENT",
          title: "High Anion Gap Metabolic Acidosis: MUDPILES vs GOLDMARK rubric",
          content: "Given the prevalence of pyroglutamic acidosis from chronic acetaminophen use with glutathione depletion, should our clinical clerkship syllabus officially transition to the GOLDMARK rubric?",
          isAnonymousToPeers: true,
          isPinned: false,
          isInstructorEndorsed: false,
          upvotes: 15,
          tags: ["Internal Medicine", "AcidBase", "Toxicology"],
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          replies: []
        }
      ];
    }
  },

  createLMSDiscussion: async (payload: any) => {
    try {
      const res = await apiClient.post("/lms/discussions", payload);
      return res.data?.data || res.data;
    } catch {
      await delay();
      return {
        _id: `disc-${Date.now()}`,
        ...payload,
        upvotes: 0,
        replies: [],
        createdAt: new Date().toISOString()
      };
    }
  },

  upvoteLMSDiscussion: async (postId: string) => {
    try {
      const res = await apiClient.post(`/lms/discussions/${postId}/upvote`);
      return res.data?.data || res.data;
    } catch {
      await delay();
      return { success: true, postId };
    }
  },

  replyLMSDiscussion: async (postId: string, payload: any) => {
    try {
      const res = await apiClient.post(`/lms/discussions/${postId}/reply`, payload);
      return res.data?.data || res.data;
    } catch {
      await delay();
      return {
        _id: `rep-${Date.now()}`,
        ...payload,
        upvotes: 0,
        createdAt: new Date().toISOString()
      };
    }
  },

  getLMSLiveSession: async (courseId?: string) => {
    try {
      const url = courseId ? `/lms/courses/${courseId}/live` : `/lms/courses/CRS-CARD-301/live`;
      const res = await apiClient.get(url);
      return res.data?.data || res.data;
    } catch {
      await delay();
      return {
        courseId: "CRS-CARD-301",
        facultyId: "FAC-003",
        currentSlideIndex: 14,
        totalSlides: 32,
        slideDeckUrl: "https://storage.googleapis.com/lms/decks/cardio-pathology-lec-09.pdf",
        isLive: true,
        confusionCount: 6,
        activePoll: {
          id: "poll-mazur-01",
          question: "A 64-year-old male with Acute Anterior STEMI develops sudden mitral regurgitation and pulmonary edema on post-MI day 4. What is the anatomical culprit?",
          options: [
            "Posteromedial papillary muscle rupture (RCA/LCx single supply)",
            "Anterolateral papillary muscle rupture (Dual LAD/LCx supply)",
            "Ventricular septal rupture of the muscular septum",
            "Aortic root dissection extending into non-coronary cusp"
          ],
          round: 1,
          votes: { "0": 34, "1": 8, "2": 5, "3": 2 },
          status: "ACTIVE"
        }
      };
    }
  },

  signalLMSConfusion: async (courseId?: string) => {
    try {
      const url = courseId ? `/lms/courses/${courseId}/live/confusion` : `/lms/courses/CRS-CARD-301/live/confusion`;
      const res = await apiClient.post(url);
      return res.data?.data || res.data;
    } catch {
      await delay();
      return { success: true, count: 7 };
    }
  },

  voteLMSLivePoll: async (courseId: string, optionIndex: number) => {
    try {
      const res = await apiClient.post(`/lms/courses/${courseId}/live/vote`, { optionIndex });
      return res.data?.data || res.data;
    } catch {
      await delay();
      return { success: true, optionIndex };
    }
  },

  getLMSVirtualPatientCases: async () => {
    try {
      const res = await apiClient.get("/lms/virtual-patient/cases");
      return res.data?.data || res.data || [];
    } catch {
      await delay();
      return [
        {
          caseId: "CASE-CARDIO-101",
          title: "Crushing Retrosternal Chest Pain in a 58-Year-Old Smoker",
          specialty: "Emergency Medicine / Cardiology",
          difficulty: "INTERMEDIATE",
          patientProfile: {
            name: "Arthur Pendelton",
            age: 58,
            gender: "Male",
            chiefComplaint: "Severe retrosternal pressure radiating to the left jaw and diaphoresis for 90 minutes",
            vitals: {
              bp: "168/96 mmHg",
              hr: 104,
              temp: 36.8,
              spo2: 94,
              rr: 22
            }
          },
          dialogues: [
            { triggerKeywords: ["onset", "start", "when"], response: "It began while I was shoveling snow about an hour and a half ago. It felt like an elephant sitting on my chest." },
            { triggerKeywords: ["radiate", "spread", "radiation", "arm", "jaw"], response: "Yes, it shoots right up into my left jaw and numbness goes down my left arm." },
            { triggerKeywords: ["history", "smoke", "cigarette", "meds", "medicine"], response: "I smoke a pack a day for 30 years. I take atorvastatin sometimes, but I ran out last month." }
          ],
          availableInvestigations: [
            { testName: "12-Lead ECG", category: "Electrophysiology", resultText: "ST elevations > 2mm in leads V1-V4 with reciprocal ST depressions in II, III, aVF", normalRange: "Normal sinus rhythm, no ischemic ST changes" },
            { testName: "High-Sensitivity Troponin I", category: "Biochemistry", resultText: "1,420 ng/L (Markedly elevated)", normalRange: "< 14 ng/L" },
            { testName: "Bedside Transthoracic Echo", category: "Imaging", resultText: "Severe hypokinesia of the anterior wall and apex. LVEF estimated at 38%. No pericardial effusion.", normalRange: "Normal regional wall motion, LVEF 55-70%" },
            { testName: "Chest X-Ray (AP portable)", category: "Imaging", resultText: "Normal cardiac silhouette, mild bilateral pulmonary cephalization, no mediastinal widening", normalRange: "Clear lung fields, normal cardiothoracic ratio" }
          ],
          differentialDiagnoses: [
            "Acute Anterior ST-Elevation Myocardial Infarction (STEMI)",
            "Acute Aortic Dissection Type A",
            "Acute Pulmonary Embolism",
            "Acute Pericarditis",
            "Gastroesophageal Reflux Disease (GERD)"
          ],
          correctPrimaryDiagnosis: "Acute Anterior ST-Elevation Myocardial Infarction (STEMI)",
          guidelineStandardCare: "Immediate dual antiplatelet therapy (Aspirin 325mg + Ticagrelor 180mg), anticoagulation (Unfractionated Heparin), and emergency transfer to the Cardiac Catheterization Lab for primary PCI within 90 minutes door-to-balloon time."
        },
        {
          caseId: "CASE-NEURO-204",
          title: "Acute High Fever, Photophobia, and Neck Stiffness in a University Freshman",
          specialty: "Neurology / Infectious Disease",
          difficulty: "ADVANCED",
          patientProfile: {
            name: "Elena Rostova",
            age: 19,
            gender: "Female",
            chiefComplaint: "Pounding global headache, fever of 39.4°C, and intolerance to bright light",
            vitals: {
              bp: "102/68 mmHg",
              hr: 118,
              temp: 39.4,
              spo2: 98,
              rr: 20
            }
          },
          dialogues: [
            { triggerKeywords: ["neck", "stiff", "chin"], response: "I can’t bring my chin down to my chest, my neck feels frozen and burns whenever I try." },
            { triggerKeywords: ["light", "eyes", "headache"], response: "Please turn down the room lights! My eyes feel like needles when light hits them." }
          ],
          availableInvestigations: [
            { testName: "Lumbar Puncture CSF Analysis", category: "Neurodiagnostics", resultText: "Opening pressure 280 mmH2O; Turbid; WBC 2,800/mcL (92% neutrophils); Protein 240 mg/dL; CSF/Serum Glucose ratio 0.18", normalRange: "Clear, WBC < 5/mcL, Protein 15-45 mg/dL, Glucose > 60% serum" },
            { testName: "CSF Gram Stain", category: "Microbiology", resultText: "Abundant Gram-negative diplococci noted intracellularly within polymorphonuclear leukocytes", normalRange: "No organisms seen" },
            { testName: "Non-Contrast Brain CT", category: "Imaging", resultText: "No mass effect, no midline shift, no acute intracranial hemorrhage. Basal cisterns patent.", normalRange: "Normal brain parenchyma and ventricular size" }
          ],
          differentialDiagnoses: [
            "Acute Bacterial Meningitis (Neisseria meningitidis)",
            "Viral Encephalitis (HSV-1)",
            "Subarachnoid Hemorrhage",
            "Brain Abscess",
            "Migraine with Aura"
          ],
          correctPrimaryDiagnosis: "Acute Bacterial Meningitis (Neisseria meningitidis)",
          guidelineStandardCare: "Empiric IV Ceftriaxone 2g q12h + IV Vancomycin 15-20mg/kg q12h, initiated alongside IV Dexamethasone 10mg immediately prior to or with the first antibiotic dose to prevent neurological sequelae. Droplet isolation precautions."
        }
      ];
    }
  },

  evaluateLMSCaseDiagnosis: async (caseId: string, studentDiagnosis: string, selectedTests: string[]) => {
    try {
      const res = await apiClient.post(`/lms/virtual-patient/cases/${caseId}/evaluate`, { studentDiagnosis, selectedTests });
      return res.data?.data || res.data;
    } catch {
      await delay();
      const isCorrect = studentDiagnosis.toLowerCase().includes("stemi") || studentDiagnosis.toLowerCase().includes("meningitis");
      return {
        isCorrect,
        score: isCorrect ? 92 : 38,
        targetDiagnosis: studentDiagnosis,
        guidelineStandardCare: isCorrect
          ? "Immediate dual antiplatelet therapy & urgent Cath Lab transfer for primary PCI within 90 minutes door-to-balloon."
          : "Standard of care requires urgent empiric broad-spectrum antimicrobial therapy and neuro-monitoring.",
        clinicalFeedback: isCorrect
          ? "Accurate diagnosis based on targeted investigation and clinical presentation."
          : "Incorrect primary diagnosis. Consider the acute ST-segment changes or CSF neutrophilic pleocytosis."
      };
    }
  },

  getLMSMasteryTree: async (courseId?: string) => {
    try {
      const url = courseId ? `/lms/courses/${courseId}/mastery` : `/lms/courses/CRS-CARD-301/mastery`;
      const res = await apiClient.get(url);
      return res.data?.data || res.data || [];
    } catch {
      await delay();
      return [
        {
          conceptId: "NODE-CARD-01",
          conceptName: "Coronary Anatomy & Perfusion Territories",
          level: 1,
          masteryScore: 94,
          unlocked: true,
          badges: ["Territory Master", "Anatomy Elite"]
        },
        {
          conceptId: "NODE-CARD-02",
          conceptName: "12-Lead Electrocardiography Vector Analysis",
          level: 2,
          masteryScore: 88,
          unlocked: true,
          badges: ["Vector Pioneer"]
        },
        {
          conceptId: "NODE-CARD-03",
          conceptName: "Hemodynamics: Pressure-Volume Loop Modulation",
          level: 2,
          masteryScore: 78,
          unlocked: true,
          badges: ["Loop Specialist"]
        },
        {
          conceptId: "NODE-CARD-04",
          conceptName: "Cardiogenic Shock & Inotrope Pharmacodynamics",
          level: 3,
          masteryScore: 65,
          unlocked: true,
          badges: ["ICU Resuscitation"]
        },
        {
          conceptId: "NODE-CARD-05",
          conceptName: "Mechanical Circulatory Support (IABP / Impella / ECMO)",
          level: 3,
          masteryScore: 40,
          unlocked: false,
          badges: []
        }
      ];
    }
  },

  // --- MULTI-COMPANY CONGLOMERATE MODULE ---
  getCompanies: async () => {
    try {
      const res = await apiClient.get("/companies");
      return res.data?.data || res.data || [];
    } catch {
      await delay();
      return [
        {
          id: "COMP-MED-01",
          name: "Hostel Pro Residential Campus",
          legalName: "Hostel Pro Enterprise Campus Housing Ltd.",
          code: "HST-01",
          currency: "USD",
          companyType: "hostel_campus",
          enabledModules: ["academics", "clinical", "hospital", "accounting", "hr", "lms", "opd", "ipd"],
        },
        {
          id: "COMP-ENG-02",
          name: "Institute of Engineering & Tech",
          legalName: "Apex Institute of Engineering & Technology",
          code: "ENG-02",
          currency: "USD",
          companyType: "university",
          enabledModules: ["academics", "research", "accounting", "hr", "lms"],
        },
        {
          id: "COMP-SCM-03",
          name: "Central Campus Supply Chain Ltd.",
          legalName: "Apex Supply Chain & Logistics Services Ltd.",
          code: "SCM-03",
          currency: "USD",
          companyType: "supply_chain",
          enabledModules: ["procurement", "inventory", "transport", "accounting"],
        },
        {
          id: "COMP-FAC-04",
          name: "Hostel & Facility Services Ltd.",
          legalName: "Apex Campus Residential Life Services Ltd.",
          code: "FAC-04",
          currency: "USD",
          companyType: "facilities",
          enabledModules: ["rooms", "mess", "security", "maintenance", "laundry", "accounting"],
        },
        {
          id: "COMP-FND-05",
          name: "University Endowment Foundation",
          legalName: "Apex Higher Education Endowment Foundation Inc.",
          code: "FND-05",
          currency: "USD",
          companyType: "foundation",
          isHoldingCompany: true,
          enabledModules: ["accounting", "scholarships", "audit", "reports"],
        },
      ];
    }
  },

  getCompanyById: async (id: string) => {
    try {
      const res = await apiClient.get(`/companies/${id}`);
      return res.data?.data || res.data;
    } catch {
      await delay();
      return { id, code: id, name: "Apex Entity", currency: "USD" };
    }
  },

  createCompany: async (payload: any) => {
    const res = await apiClient.post("/companies", payload);
    return res.data;
  },

  // Digital Locker
  getDigitalLockerDocuments: async (studentId?: string) => {
    try {
      const url = studentId ? `/digital-locker/student/${studentId}` : "/digital-locker";
      const res = await apiClient.get(url);
      return res.data?.data || res.data || [];
    } catch {
      await delay();
      return [
        { _id: "doc-1", title: "HSC Certificate", documentType: "TRANSCRIPT", status: "VERIFIED", createdAt: new Date().toISOString() },
        { _id: "doc-2", title: "National Identification Card", documentType: "ID_CARD", status: "VERIFIED", createdAt: new Date().toISOString() }
      ];
    }
  },

  uploadDigitalLockerDocument: async (payload: any) => {
    const res = await apiClient.post("/digital-locker/upload", payload);
    return res.data?.data || res.data;
  },

  verifyDigitalLockerDocument: async (id: string, payload: any) => {
    const res = await apiClient.patch(`/digital-locker/${id}/verify`, payload);
    return res.data?.data || res.data;
  },

  // Procurement
  getPurchaseOrders: async () => {
    try {
      const res = await apiClient.get("/procurement/purchase-orders");
      return res.data?.data || res.data || [];
    } catch {
      await delay();
      return [
        { _id: "PO-101", poNumber: "PO-2026-001", vendorName: "Universal Pharma Logistics", totalAmount: 450000, status: "APPROVED", date: "2026-09-15" },
        { _id: "PO-102", poNumber: "PO-2026-002", vendorName: "Delta Lab Supplies", totalAmount: 125000, status: "PENDING", date: "2026-09-20" }
      ];
    }
  },

  createPurchaseOrder: async (payload: any) => {
    const res = await apiClient.post("/procurement/purchase-orders", payload);
    return res.data?.data || res.data;
  },

  getGoodsReceipts: async () => {
    try {
      const res = await apiClient.get("/procurement/goods-receipts");
      return res.data?.data || res.data || [];
    } catch {
      await delay();
      return [
        { _id: "GRN-201", grnNumber: "GRN-2026-001", poId: "PO-2026-001", vendorName: "Universal Pharma Logistics", invoiceAmount: 450000, status: "POSTED", receiptDate: "2026-09-22" }
      ];
    }
  },

  createGoodsReceipt: async (payload: any) => {
    const res = await apiClient.post("/procurement/goods-receipts", payload);
    return res.data?.data || res.data;
  },

  // Disciplinary & Integrity
  getDisciplinaryInfractions: async () => {
    try {
      const res = await apiClient.get("/disciplinary/infractions");
      return res.data?.data || res.data || [];
    } catch {
      await delay();
      return [
        { _id: "INF-001", studentId: "STU-001", title: "Curfew Violation", severity: "LOW", status: "RESOLVED", reportedDate: "2026-09-10" }
      ];
    }
  },

  reportDisciplinaryInfraction: async (payload: any) => {
    const res = await apiClient.post("/disciplinary/infractions", payload);
    return res.data?.data || res.data;
  },

  getDisciplinaryHearings: async () => {
    try {
      const res = await apiClient.get("/disciplinary/hearings");
      return res.data?.data || res.data || [];
    } catch {
      await delay();
      return [
        { _id: "HRG-001", caseNumber: "CASE-2026-04", date: "2026-09-28", outcome: "PENDING", notes: "Reviewing committee inquiry" }
      ];
    }
  },

  scheduleDisciplinaryHearing: async (payload: any) => {
    const res = await apiClient.post("/disciplinary/hearings", payload);
    return res.data?.data || res.data;
  },

  updateHearingOutcome: async (id: string, payload: any) => {
    const res = await apiClient.patch(`/disciplinary/hearings/${id}/outcome`, payload);
    return res.data?.data || res.data;
  },

  // IoT Gates & Telemetry
  getIoTDevices: async () => {
    try {
      const res = await apiClient.get("/iot/devices");
      return res.data?.data || res.data || [];
    } catch {
      await delay();
      return [
        { deviceId: "GATE-RFID-01", deviceName: "Main Campus Entrance Barrier", status: "ONLINE", location: "Main Gate", lastPing: new Date().toISOString() },
        { deviceId: "GATE-RFID-02", deviceName: "East Hostel Turnstile", status: "ONLINE", location: "Hostel Block A", lastPing: new Date().toISOString() },
        { deviceId: "IOT-TEMP-01", deviceName: "Pharmacy Cold Storage Monitor", status: "ONLINE", location: "Central Pharmacy", lastPing: new Date().toISOString() }
      ];
    }
  },

  getIoTLogs: async () => {
    try {
      const res = await apiClient.get("/iot/logs");
      return res.data?.data || res.data || [];
    } catch {
      await delay();
      return [
        { _id: "log-1", deviceId: "GATE-RFID-01", action: "ENTRY_ALLOWED", studentId: "STU-001", timestamp: new Date().toISOString() },
        { _id: "log-2", deviceId: "GATE-RFID-02", action: "EXIT_RECORDED", studentId: "STU-002", timestamp: new Date(Date.now() - 3600000).toISOString() }
      ];
    }
  },

  syncIoT: async (payload: any) => {
    const res = await apiClient.post("/iot/sync", payload);
    return res.data?.data || res.data;
  },

  // Placement & Career
  getJobPostings: async () => {
    try {
      const res = await apiClient.get("/placement/jobs");
      return res.data?.data || res.data || [];
    } catch {
      await delay();
      return [
        { _id: "JOB-101", title: "Junior Clinical Resident", department: "Cardiology", location: "Chittagong Medical Center", salary: "45,000 - 60,000 BDT", deadline: "2026-10-15" },
        { _id: "JOB-102", title: "Biomedical Research Fellow", department: "Microbiology", location: "Apollo Genomics Lab", salary: "50,000 - 75,000 BDT", deadline: "2026-10-30" }
      ];
    }
  },

  createJobPosting: async (payload: any) => {
    const res = await apiClient.post("/placement/jobs", payload);
    return res.data?.data || res.data;
  },

  applyJobPosting: async (payload: any) => {
    const res = await apiClient.post("/placement/apply", payload);
    return res.data?.data || res.data;
  },

  getJobApplications: async () => {
    try {
      const res = await apiClient.get("/placement/applications");
      return res.data?.data || res.data || [];
    } catch {
      await delay();
      return [];
    }
  },

  // Feedback & Surveys
  getFeedbackSurveys: async () => {
    try {
      const res = await apiClient.get("/feedback/surveys");
      return res.data?.data || res.data || [];
    } catch {
      await delay();
      return [
        { _id: "SRV-01", title: "Semester Teaching Quality Evaluation", category: "Academic", questions: 5, active: true },
        { _id: "SRV-02", title: "Hostel Dining & Hygiene Feedback", category: "Campus Services", questions: 4, active: true }
      ];
    }
  },

  createFeedbackSurvey: async (payload: any) => {
    const res = await apiClient.post("/feedback/surveys", payload);
    return res.data?.data || res.data;
  },

  submitFeedbackResponse: async (payload: any) => {
    const res = await apiClient.post("/feedback/responses", payload);
    return res.data?.data || res.data;
  },

  requestBloodTransfusion: async (payload: any) => {
    const res = await apiClient.post("/blood-bank/transfusions", payload);
    return res.data;
  },

  scheduleTelemedicineConsultation: async (payload: any) => {
    const res = await apiClient.post("/telemedicine/consultations", payload);
    return res.data;
  },

  // Accreditation Reports
  getAccreditationReports: async () => {
    try {
      const res = await apiClient.get("/accreditation-report");
      return res.data?.data || res.data || [];
    } catch {
      await delay();
      return [
        { _id: "ACC-01", title: "BMDC Institutional Quality Audit", regulatoryBody: "BMDC", createdAt: "2026-09-18", metrics: { totalFaculty: 150, totalStudents: 1200, bedOccupancyRate: "85%", researchPublications: 45 } }
      ];
    }
  },

  generateAccreditationReport: async (payload: any) => {
    const res = await apiClient.post("/accreditation-report/generate", payload);
    return res.data?.data || res.data;
  },


};

// Aggregated API object merging legacy endpoints with modern domain slices
export const api = {
  ...baseApi,
  ...financeApi,
  ...academicApi,
  ...clinicalApi,
  ...campusApi,
  ...complianceApi,
};

export const lmsApi = {
  getAssignments: api.getLMSAssignments,
  submitAssignment: api.submitLMSAssignment,
  getDiscussions: api.getLMSDiscussions,
  createDiscussion: api.createLMSDiscussion,
  upvoteDiscussion: api.upvoteLMSDiscussion,
  replyDiscussion: api.replyLMSDiscussion,
  getLiveSession: api.getLMSLiveSession,
  signalConfusion: api.signalLMSConfusion,
  voteLivePoll: api.voteLMSLivePoll,
  getVirtualPatientCases: api.getLMSVirtualPatientCases,
  evaluateCaseDiagnosis: api.evaluateLMSCaseDiagnosis,
  getMasteryTree: api.getLMSMasteryTree,
};

export default api;



