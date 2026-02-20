export interface Student {
    id: string;
    admissionNumber: string;
    firstName: string;
    lastName: string;
    gender: 'Male' | 'Female';
    grade: string;
    dateOfBirth: string;
    parentName: string;
    parentPhone: string;
    parentEmail: string;
    address: string;
    status: 'Active' | 'Inactive';
    enrollmentDate: string;
    feeBalance: number;
    totalFees: number;
    paidFees: number;
}

export interface Teacher {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    subjects: string[];
    grades: string[];
    status: 'Active' | 'Inactive';
    joinDate: string;
    qualification: string;
}

export interface AttendanceRecord {
    id: string;
    studentId: string;
    studentName: string;
    grade: string;
    date: string;
    status: 'Present' | 'Absent' | 'Late' | 'Excused';
}

export interface Exam {
    id: string;
    name: string;
    subject: string;
    grade: string;
    date: string;
    term: string;
    type: 'Midterm' | 'Final' | 'Quiz' | 'Assignment';
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    totalMarks: number;
}

export type PerformanceLevel = 'EE' | 'ME' | 'AE' | 'BE';

export interface StudentResult {
    id: string;
    studentId: string;
    studentName: string;
    examId: string;
    subject: string;
    marks: number;
    level: PerformanceLevel;
    remarks: string;
}

export interface FeePayment {
    id: string;
    studentId: string;
    studentName: string;
    grade: string;
    amount: number;
    method: 'Cash' | 'M-Pesa' | 'Bank Transfer' | 'Cheque';
    reference: string;
    date: string;
    term: string;
    receiptNumber: string;
}

export interface TimetableEntry {
    id: string;
    grade: string;
    day: string;
    timeSlot: string;
    subject: string;
    teacherId: string;
    teacherName: string;
}

export interface TimeSlot {
    id: string;
    label: string; // The time range, e.g. "8:00 - 8:40"
    name?: string;  // Optional custom name, e.g. "Tea Break", "Assembly"
    type: 'Lesson' | 'Break' | 'Lunch' | 'Other';
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'Super Admin' | 'Admin' | 'Teacher' | 'Staff';
    permissions?: string[];
    status: 'Active' | 'Inactive';
    lastLogin: string;
}

export interface SchoolSettings {
    schoolName: string;
    motto: string;
    phone: string;
    telephone?: string;
    email: string;
    address: string;
    poBox?: string;
    currentTerm: string;
    currentYear: number;
    headteacherSignature?: string; // Base64 or URL
    financeSignature?: string;     // Base64 or URL
    paybillNumber?: string;
    logo?: string;
    timetableSlots?: TimeSlot[];
}

export type GradeLevel = 'Play Group' | 'PP1' | 'PP2' | 'Grade 1' | 'Grade 2' | 'Grade 3' | 'Grade 4' | 'Grade 5' | 'Grade 6';

export const GRADES: GradeLevel[] = ['Play Group', 'PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const TIME_SLOTS = [
    '8:00 - 8:40',
    '8:40 - 9:20',
    '9:20 - 10:00',
    '10:00 - 10:30',
    '10:30 - 11:10',
    '11:10 - 11:50',
    '11:50 - 12:30',
    '12:30 - 1:10',
    '1:10 - 1:50',
    '1:50 - 2:30',
];

export const SUBJECTS = [
    'Mathematics', 'English', 'Kiswahili', 'Science', 'Social Studies',
    'CRE', 'Creative Arts', 'Physical Education', 'Music', 'Agriculture',
];

export const TERMS = ['Term 1', 'Term 2', 'Term 3'];

export interface AuditLogItem {
    id: string;
    userId: string;
    userName: string;
    action: string;
    details: string;
    ipAddress?: string;
    createdAt: string;
}

export interface FeeStructureItem {
    id: string;
    grade: string;
    name: string;
    amount: number;
    term: string;
}
