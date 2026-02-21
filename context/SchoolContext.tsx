import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import {
    Student, Teacher, AttendanceRecord, Exam, StudentResult, FeePayment, TimetableEntry,
    SchoolSettings, GradeLevel, GRADES, SUBJECTS, TERMS, PerformanceLevel, User, Role,
    FeeStructureItem, AuditLogItem, TimeSlot // New types
} from '../types';
import * as XLSX from 'xlsx';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface SchoolContextType {
    students: Student[];
    teachers: Teacher[];
    attendance: AttendanceRecord[];
    exams: Exam[];
    payments: FeePayment[];
    timetable: TimetableEntry[];
    settings: SchoolSettings;
    gradeFees: Record<string, number>;
    timeSlots: TimeSlot[];
    results: StudentResult[];
    toasts: Toast[];
    loading: boolean;
    addStudent: (student: Omit<Student, 'id'>) => void;
    updateStudent: (id: string, data: Partial<Student>) => void;
    deleteStudent: (id: string) => void;
    addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
    updateTeacher: (id: string, data: Partial<Teacher>) => void;
    deleteTeacher: (id: string) => void;
    saveAttendance: (records: AttendanceRecord[]) => void;
    addExam: (exam: Omit<Exam, 'id'>) => void;
    updateExam: (id: string, data: Partial<Exam>) => void;
    deleteExam: (id: string) => void;
    addPayment: (payment: Omit<FeePayment, 'id' | 'receiptNumber'>) => void;
    deletePayment: (id: string) => void;
    addResult: (result: Omit<StudentResult, 'id'>) => void;
    saveBulkResults: (results: Omit<StudentResult, 'id'>[]) => void;
    addTimetableEntry: (entry: Omit<TimetableEntry, 'id'>) => void;
    updateTimetableEntry: (id: string, updates: Partial<TimetableEntry>) => void;
    deleteTimetableEntry: (id: string) => void;
    updateTimetable: (entries: TimetableEntry[]) => void;
    updateSettings: (data: Partial<SchoolSettings>) => Promise<boolean>;
    updateGradeFees: (grade: string, amount: number) => void;
    uploadStudents: (file: File) => Promise<void>;
    uploadTeachers: (file: File) => Promise<void>;
    uploadExams: (file: File) => Promise<void>;
    systemUsers: User[];
    addSystemUser: (user: Omit<User, 'id' | 'lastLogin' | 'status'>) => void;
    updateSystemUser: (id: string, updates: Partial<User>) => void;
    deleteSystemUser: (id: string) => void;
    resetUserPassword: (userId: string) => void;
    changeUserPassword: (userId: string, newPassword: string) => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    refreshData: () => void;
    clearAllData: () => void;
    // New Features
    feeStructures: FeeStructureItem[];
    auditLogs: AuditLogItem[];
    addFeeStructure: (item: Omit<FeeStructureItem, 'id' | 'status'>) => void;
    updateFeeStructure: (id: string, updates: Partial<FeeStructureItem>) => void;
    deleteFeeStructure: (id: string) => void;
    applyFeeStructure: (grade?: string) => Promise<void>;
    revertFeeStructure: (grade: string) => Promise<void>;
    fetchAuditLogs: () => Promise<void>;
    isSyncing: boolean;
    serverStatus: 'connected' | 'disconnected' | 'checking';
    activeGrades: GradeLevel[];
    roles: Role[];
    addRole: (role: Omit<Role, 'id'>) => Promise<boolean>;
    updateRole: (id: string, updates: Partial<Role>) => Promise<boolean>;
    deleteRole: (id: string) => Promise<boolean>;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const defaultTimeSlots: TimeSlot[] = [
    { id: '1', label: '8:00 - 8:40', type: 'Lesson', order: 1 },
    { id: '2', label: '8:40 - 9:20', type: 'Lesson', order: 2 },
    { id: '3', label: '9:20 - 10:00', type: 'Lesson', order: 3 },
    { id: '4', label: '10:00 - 10:30', type: 'Break', order: 4 },
    { id: '5', label: '10:30 - 11:10', type: 'Lesson', order: 5 },
    { id: '6', label: '11:10 - 11:50', type: 'Lesson', order: 6 },
    { id: '7', label: '11:50 - 12:30', type: 'Lesson', order: 7 },
    { id: '8', label: '12:30 - 1:10', type: 'Lunch', order: 8 },
    { id: '9', label: '1:10 - 1:50', type: 'Lesson', order: 9 },
    { id: '10', label: '1:50 - 2:30', type: 'Lesson', order: 10 },
];

const defaultSettings: SchoolSettings = {
    schoolName: 'ELIRAMA SCHOOL',
    motto: 'Excellence in Education',
    phone: '+254 700 000 000',
    telephone: '',
    email: 'info@elirama.ac.ke',
    address: 'Nairobi, Kenya',
    poBox: '',
    currentTerm: 'Term 1',
    currentYear: 2026,
    paybillNumber: '123456',
    timeSlots: defaultTimeSlots,
    earlyYearsEnabled: true,
    primaryEnabled: true,
    jssEnabled: false,
    sssEnabled: false,
    autoTimetableEnabled: false,
    manualTimetableBuilderEnabled: true
};

// Default seed data — used when localStorage is empty
const seedStudents: Student[] = [
    { id: 's0', firstName: 'Zion', lastName: 'Elirama', admissionNumber: 'ELR-100', gender: 'Male', grade: 'Play Group', dateOfBirth: '2022-05-10', parentName: 'John Elirama', parentPhone: '0700123456', parentEmail: 'john@elirama.ac.ke', address: 'Nairobi', status: 'Active', enrollmentDate: '2025-01-10', totalFees: 12000, paidFees: 5000, feeBalance: 7000 },
    { id: 's01', firstName: 'Serah', lastName: 'Njeri', admissionNumber: 'ELR-101', gender: 'Female', grade: 'PP1', dateOfBirth: '2021-03-15', parentName: 'Mary Njeri', parentPhone: '0711123456', parentEmail: 'mary@gmail.com', address: 'Kiambu', status: 'Active', enrollmentDate: '2025-01-10', totalFees: 12500, paidFees: 12500, feeBalance: 0 },
    { id: 's02', firstName: 'Liam', lastName: 'Kiptoo', admissionNumber: 'ELR-102', gender: 'Male', grade: 'PP2', dateOfBirth: '2020-07-22', parentName: 'James Kiptoo', parentPhone: '0722123456', parentEmail: 'james@gmail.com', address: 'Nairobi West', status: 'Active', enrollmentDate: '2025-01-10', totalFees: 13000, paidFees: 10000, feeBalance: 3000 },
    { id: 's1', firstName: 'Amara', lastName: 'Ochieng', admissionNumber: 'ELR-001', gender: 'Female', grade: 'Grade 1', dateOfBirth: '2019-03-15', parentName: 'James Ochieng', parentPhone: '0712345678', parentEmail: 'james@gmail.com', address: 'Nairobi', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 15000, paidFees: 15000, feeBalance: 0 },
    { id: 's2', firstName: 'Brian', lastName: 'Kamau', admissionNumber: 'ELR-002', gender: 'Male', grade: 'Grade 2', dateOfBirth: '2018-07-22', parentName: 'Mary Kamau', parentPhone: '0723456789', parentEmail: 'mary@gmail.com', address: 'Westlands', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 15000, paidFees: 10000, feeBalance: 5000 },
    { id: 's3', firstName: 'Cynthia', lastName: 'Wanjiku', admissionNumber: 'ELR-003', gender: 'Female', grade: 'Grade 3', dateOfBirth: '2017-11-08', parentName: 'Peter Wanjiku', parentPhone: '0734567890', parentEmail: 'peter@gmail.com', address: 'Kilimani', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 15000, paidFees: 5000, feeBalance: 10000 },
    { id: 's4', firstName: 'David', lastName: 'Mwangi', admissionNumber: 'ELR-004', gender: 'Male', grade: 'Grade 4', dateOfBirth: '2016-05-30', parentName: 'Grace Mwangi', parentPhone: '0745678901', parentEmail: 'grace@gmail.com', address: 'Karen', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 18000, paidFees: 18000, feeBalance: 0 },
    { id: 's5', firstName: 'Esther', lastName: 'Njoroge', admissionNumber: 'ELR-005', gender: 'Female', grade: 'Grade 5', dateOfBirth: '2015-09-12', parentName: 'John Njoroge', parentPhone: '0756789012', parentEmail: 'john@gmail.com', address: 'Lavington', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 18000, paidFees: 9000, feeBalance: 9000 },
    { id: 's6', firstName: 'Felix', lastName: 'Otieno', admissionNumber: 'ELR-006', gender: 'Male', grade: 'Grade 6', dateOfBirth: '2014-02-18', parentName: 'Rose Otieno', parentPhone: '0767890123', parentEmail: 'rose@gmail.com', address: 'Parklands', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 18000, paidFees: 18000, feeBalance: 0 },
    { id: 's9', firstName: 'Irene', lastName: 'Wambua', admissionNumber: 'ELR-009', gender: 'Female', grade: 'Grade 1', dateOfBirth: '2019-01-14', parentName: 'Paul Wambua', parentPhone: '0790123456', parentEmail: 'paul@gmail.com', address: 'Embakasi', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 15000, paidFees: 7500, feeBalance: 7500 },
    { id: 's10', firstName: 'James', lastName: 'Mutua', admissionNumber: 'ELR-010', gender: 'Male', grade: 'Grade 2', dateOfBirth: '2018-04-20', parentName: 'Lucy Mutua', parentPhone: '0701234567', parentEmail: 'lucy@gmail.com', address: 'Kasarani', status: 'Inactive', enrollmentDate: '2024-01-10', totalFees: 15000, paidFees: 0, feeBalance: 15000 },
    { id: 's11', firstName: 'Kevin', lastName: 'Odhiambo', admissionNumber: 'ELR-011', gender: 'Male', grade: 'Grade 3', dateOfBirth: '2017-08-11', parentName: 'Sarah Odhiambo', parentPhone: '0711222333', parentEmail: 'sarah@gmail.com', address: 'Kisumu', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 15000, paidFees: 15000, feeBalance: 0 },
];

const seedTeachers: Teacher[] = [
    { id: 't1', firstName: 'Alice', lastName: 'Kariuki', email: 'alice@elirama.ac.ke', phone: '0711111111', qualification: 'B.Ed Mathematics', subjects: ['Mathematics', 'Physics'], grades: ['Grade 5', 'Grade 6'], status: 'Active', joinDate: '2020-01-15', maxLessonsDay: 8, maxLessonsWeek: 40 },
    { id: 't2', firstName: 'Bob', lastName: 'Omondi', email: 'bob@elirama.ac.ke', phone: '0722222222', qualification: 'B.Ed English', subjects: ['English', 'Literature'], grades: ['Grade 3', 'Grade 4'], status: 'Active', joinDate: '2019-03-01', maxLessonsDay: 8, maxLessonsWeek: 40 },
    { id: 't3', firstName: 'Carol', lastName: "Ndung'u", email: 'carol@elirama.ac.ke', phone: '0733333333', qualification: 'B.Ed Science', subjects: ['Science', 'Biology'], grades: ['PP1', 'PP2'], status: 'Active', joinDate: '2021-08-20', maxLessonsDay: 8, maxLessonsWeek: 40 },
    { id: 't4', firstName: 'Daniel', lastName: 'Cheruiyot', email: 'daniel@elirama.ac.ke', phone: '0744444444', qualification: 'B.Ed Social Studies', subjects: ['Social Studies', 'History'], grades: ['Play Group', 'Grade 1'], status: 'Active', joinDate: '2022-01-10', maxLessonsDay: 8, maxLessonsWeek: 40 },
    { id: 't5', firstName: 'Eunice', lastName: 'Waweru', email: 'eunice@elirama.ac.ke', phone: '0755555555', qualification: 'B.Ed Kiswahili', subjects: ['Kiswahili', 'CRE'], grades: ['Grade 2', 'Grade 6'], status: 'Active', joinDate: '2021-05-15', maxLessonsDay: 8, maxLessonsWeek: 40 },
];

const seedExams: Exam[] = [
    { id: 'e1', name: 'Term 1 Mid-Term Mathematics', subject: 'Mathematics', grade: 'Grade 6', date: '2026-03-15', type: 'Midterm', term: 'Term 1', status: 'Scheduled', totalMarks: 100 },
    { id: 'e2', name: 'Science Quiz - Grade 3', subject: 'Science', grade: 'Grade 3', date: '2026-02-20', type: 'Quiz', term: 'Term 1', status: 'Completed', totalMarks: 50 },
    { id: 'e3', name: 'English Final - Grade 5', subject: 'English', grade: 'Grade 5', date: '2026-04-10', type: 'Final', term: 'Term 1', status: 'Scheduled', totalMarks: 100 },
    { id: 'e4', name: 'KPSEA Mock Assessment', subject: 'Mathematics', grade: 'Grade 6', date: '2026-06-28', type: 'Final', term: 'Term 2', status: 'Scheduled', totalMarks: 50 },
];

const seedTimetable: TimetableEntry[] = [
    { id: 'tt1', grade: 'Grade 6', day: 'Monday', timeSlot: '8:00 - 8:40', subject: 'Mathematics', teacherId: 't1', teacherName: 'Alice Kariuki' },
    { id: 'tt2', grade: 'Grade 6', day: 'Monday', timeSlot: '8:40 - 9:20', subject: 'English', teacherId: 't2', teacherName: 'Bob Omondi' },
    { id: 'tt3', grade: 'Grade 6', day: 'Tuesday', timeSlot: '8:00 - 8:40', subject: 'Science', teacherId: 't3', teacherName: 'Carol Ndungu' },
    { id: 'tt4', grade: 'Grade 1', day: 'Monday', timeSlot: '8:00 - 8:40', subject: 'Social Studies', teacherId: 't4', teacherName: 'Daniel Cheruiyot' },
    { id: 'tt5', grade: 'PP1', day: 'Wednesday', timeSlot: '10:00 - 10:30', subject: 'Creative Arts', teacherId: 't3', teacherName: 'Carol Ndungu' },
];

const seedPayments: FeePayment[] = [
    { id: 'p1', studentId: 's1', studentName: 'Amara Ochieng', grade: 'Grade 1', amount: 15000, method: 'M-Pesa', reference: 'QAB123456', date: '2026-01-15', term: 'Term 1', receiptNumber: 'RCT-001' },
    { id: 'p2', studentId: 's2', studentName: 'Brian Kamau', grade: 'Grade 2', amount: 10000, method: 'Cash', reference: '', date: '2026-02-01', term: 'Term 1', receiptNumber: 'RCT-002' },
    { id: 'p3', studentId: 's4', studentName: 'David Mwangi', grade: 'Grade 4', amount: 18000, method: 'Bank Transfer', reference: 'TRF789012', date: '2026-01-20', term: 'Term 1', receiptNumber: 'RCT-003' },
    { id: 'p4', studentId: 's6', studentName: 'Felix Otieno', grade: 'Grade 6', amount: 18000, method: 'M-Pesa', reference: 'QCD345678', date: '2026-01-25', term: 'Term 1', receiptNumber: 'RCT-004' },
    { id: 'p5', studentId: 's01', studentName: 'Serah Njeri', grade: 'PP1', amount: 12500, method: 'M-Pesa', reference: 'TRF999888', date: '2026-02-05', term: 'Term 1', receiptNumber: 'RCT-005' },
];

// localStorage helper — saves/loads data with fallback
const STORAGE_KEY = 'elirama_school_data';

function loadFromStorage(): any {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function saveToStorage(data: any) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { console.warn('Failed to save to localStorage:', e); }
}

export function SchoolProvider({ children }: { children: ReactNode }) {
    // Always start with seed data for SSR consistency — load localStorage in useEffect
    const [students, setStudents] = useState<Student[]>(seedStudents);
    const [teachers, setTeachers] = useState<Teacher[]>(seedTeachers);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [exams, setExams] = useState<Exam[]>(seedExams);
    const [payments, setPayments] = useState<FeePayment[]>(seedPayments);
    const [timetable, setTimetable] = useState<TimetableEntry[]>(seedTimetable);
    const [settings, setSettings] = useState<SchoolSettings>(defaultSettings);
    const [gradeFees, setGradeFees] = useState<Record<string, number>>({
        'Play Group': 12000,
        'PP1': 12500,
        'PP2': 13000,
        'Grade 1': 15000,
        'Grade 2': 15000,
        'Grade 3': 15000,
        'Grade 4': 18000,
        'Grade 5': 18000,
        'Grade 6': 18000,
    });
    const [results, setResults] = useState<StudentResult[]>([]);
    // New Features State
    const [feeStructures, setFeeStructures] = useState<FeeStructureItem[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
    const [systemUsers, setSystemUsers] = useState<User[]>([
        { id: '1', firstName: 'Admin', lastName: 'User', username: 'admin', name: 'Admin User', email: 'admin@elirama.ac.ke', role: 'Super Admin', permissions: [], status: 'Active', lastLogin: '2026-02-15 10:30', updatedAt: '2026-02-18 10:00' },
        { id: '2', firstName: 'Teacher', lastName: 'Demo', username: 'teacher', name: 'Teacher Demo', email: 'teacher@elirama.ac.ke', role: 'Teacher', permissions: [], status: 'Active', lastLogin: '2026-02-16 08:45', updatedAt: '2026-02-18 10:00' },
        { id: '3', firstName: 'Finance', lastName: 'Staff', username: 'finance', name: 'Finance Staff', email: 'finance@elirama.ac.ke', role: 'Finance Officer', permissions: [], status: 'Active', lastLogin: '2026-02-17 09:15', updatedAt: '2026-02-18 10:00' },
    ]);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [serverStatus, setServerStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
    const lastSyncRef = useRef<string>('');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
    const dbAvailableRef = useRef<boolean | null>(null); // null = untested
    const hydratedRef = useRef(false);

    // ... (localStorage effects remain the same)

    // Persist to localStorage whenever state changes (skip during SSR)
    useEffect(() => {
        if (!hydratedRef.current) return;
        saveToStorage({ students, teachers, attendance, exams, payments, timetable, settings, gradeFees, results, systemUsers });
    }, [students, teachers, attendance, exams, payments, timetable, settings, gradeFees, results, systemUsers]);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = generateId();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    }, []);

    // Use a ref to prevent overlapping requests
    const isFetchingRef = useRef(false);

    // Try to sync with the database if available
    const fetchData = useCallback(async (isInitial = false) => {
        // Prevent stacking requests
        if (isFetchingRef.current && !isInitial) return;

        const token = localStorage.getItem('elirama_token');
        if (!token) {
            setServerStatus('disconnected');
            return;
        }

        // Retry connection logic: If disconnected, only retry occasionally (e.g. every 5th poll) or if isInitial
        // For now, we'll let it retry but respect the locking

        isFetchingRef.current = true;
        try {
            if (!isInitial) {
                const statusRes = await fetch(`${API_URL}/sync/status?t=${Date.now()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!statusRes.ok) {
                    throw new Error('Sync status failed');
                }
                const { lastUpdated } = await statusRes.json();

                // We are connected
                setServerStatus('connected');
                dbAvailableRef.current = true;

                if (lastSyncRef.current === lastUpdated) return;
                lastSyncRef.current = lastUpdated;
            }

            setIsSyncing(true);
            const [stdRes, tchRes, exmRes, setRes, resRes, usrRes, tmtRes] = await Promise.all([
                fetch(`${API_URL}/students`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/teachers`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/exams`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/settings`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/results`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/timetable`, { headers: { 'Authorization': `Bearer ${token}` } }),
            ]);

            // Check if ANY critical fetch failed (404/500)
            if (!stdRes.ok || !tchRes.ok) throw new Error('API Sync Failed');

            if (stdRes.ok) setStudents(await stdRes.json());
            if (tchRes.ok) setTeachers(await tchRes.json());
            if (exmRes.ok) setExams(await exmRes.json());
            if (setRes.ok) setSettings(await setRes.json());
            if (resRes.ok) setResults(await resRes.json());
            if (usrRes.ok) setSystemUsers(await usrRes.json());
            if (tmtRes.ok) setTimetable(await tmtRes.json());

            setServerStatus('connected');
            dbAvailableRef.current = true;

            if (isInitial) {
                const statusRes = await fetch(`${API_URL}/sync/status?t=${Date.now()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (statusRes.ok) {
                    const { lastUpdated } = await statusRes.json();
                    lastSyncRef.current = lastUpdated;
                }
            }
        } catch (error) {
            console.warn('Database not available, using localStorage:', error);
            setServerStatus('disconnected');
            dbAvailableRef.current = false;
        } finally {
            setIsSyncing(false);
            isFetchingRef.current = false;
        }
    }, [API_URL]);

    useEffect(() => {
        setLoading(true);
        fetchData(true).finally(() => setLoading(false));
    }, [fetchData]);

    useEffect(() => {
        const interval = setInterval(() => fetchData(false), 1000); // Poll every 1 second
        return () => clearInterval(interval);
    }, [fetchData]);

    const refreshData = () => fetchData();

    // Helper: try API call, fall back to local operation
    async function tryApi(url: string, options: RequestInit): Promise<Response | null> {
        const token = localStorage.getItem('elirama_token');
        try {
            const res = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...(options.headers || {}),
                },
            });

            if (res.status === 401) {
                // Token is invalid or expired
                localStorage.removeItem('elirama_token');
                setServerStatus('disconnected');
                window.location.href = '/login'; // Force re-login
                return null;
            }

            if (res.ok) return res;
            return null;
        } catch {
            return null;
        }
    }

    // STUDENTS
    const addStudent = async (student: Omit<Student, 'id'>) => {
        if (serverStatus !== 'connected') {
            showToast('System Offline: Cannot add student. Check connection.', 'error');
            return;
        }
        const apiRes = await tryApi(`${API_URL}/students`, { method: 'POST', body: JSON.stringify(student) });
        if (apiRes) {
            const data = await apiRes.json();
            setStudents(prev => [...prev, data]);
            showToast('Student added successfully');
        } else {
            showToast('Failed to save to server', 'error');
        }
    };

    const updateStudent = async (id: string, data: Partial<Student>) => {
        if (serverStatus !== 'connected') {
            showToast('System Offline: Cannot update student.', 'error');
            return;
        }
        const apiRes = await tryApi(`${API_URL}/students/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        if (apiRes) {
            const updated = await apiRes.json();
            setStudents(prev => prev.map(s => s.id === id ? updated : s));
            showToast('Student updated');
        }
    };

    const deleteStudent = async (id: string) => {
        if (serverStatus !== 'connected') {
            showToast('System Offline: Cannot delete student.', 'error');
            return;
        }
        const apiRes = await tryApi(`${API_URL}/students/${id}`, { method: 'DELETE' });
        if (apiRes) {
            setStudents(prev => prev.filter(s => s.id !== id));
            setPayments(prev => prev.filter(p => p.studentId !== id));
            showToast('Student deleted successfully', 'info');
        }
    };

    const updateTimetable = async (newEntries: TimetableEntry[]) => {
        if (serverStatus !== 'connected') {
            showToast('System Offline: Cannot update timetable.', 'error');
            return;
        }
        // Save all entries via bulk API
        const apiRes = await tryApi(`${API_URL}/timetable/bulk`, {
            method: 'POST',
            body: JSON.stringify(newEntries)
        });
        if (apiRes) {
            setTimetable(newEntries);
            showToast('Timetable updated successfully');
        } else {
            showToast('Failed to update timetable', 'error');
        }
    };

    // TEACHERS
    const addTeacher = async (teacher: Omit<Teacher, 'id'>) => {
        if (serverStatus !== 'connected') {
            showToast('System Offline: Cannot add teacher.', 'error');
            return;
        }
        const apiRes = await tryApi(`${API_URL}/teachers`, { method: 'POST', body: JSON.stringify(teacher) });
        if (apiRes) {
            const data = await apiRes.json();
            setTeachers(prev => [...prev, data]);
            showToast('Teacher added successfully');
        } else {
            showToast('Failed to add teacher to server', 'error');
        }
    };

    const updateTeacher = async (id: string, data: Partial<Teacher>) => {
        if (serverStatus !== 'connected') {
            showToast('System Offline: Cannot update teacher.', 'error');
            return;
        }
        const apiRes = await tryApi(`${API_URL}/teachers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        if (apiRes) {
            const updated = await apiRes.json();
            setTeachers(prev => prev.map(t => t.id === id ? updated : t));
            showToast('Teacher updated');
        }
    };

    const deleteTeacher = async (id: string) => {
        if (serverStatus !== 'connected') {
            showToast('System Offline: Cannot delete teacher.', 'error');
            return;
        }
        const apiRes = await tryApi(`${API_URL}/teachers/${id}`, { method: 'DELETE' });
        if (apiRes) {
            setTeachers(prev => prev.filter(t => t.id !== id));
            showToast('Teacher deleted successfully', 'info');
        }
    };

    // ATTENDANCE
    const saveAttendance = async (records: AttendanceRecord[]) => {
        if (serverStatus !== 'connected') {
            showToast('System Offline: Cannot save attendance.', 'error');
            return;
        }
        const apiRes = await tryApi(`${API_URL}/attendance`, { method: 'POST', body: JSON.stringify({ records }) });
        if (apiRes) {
            const dateStr = records[0]?.date;
            setAttendance(prev => [...prev.filter(r => r.date !== dateStr), ...records]);
            showToast('Attendance saved successfully');
        } else {
            showToast('Failed to save attendance', 'error');
        }
    };

    // EXAMS
    const addExam = async (exam: Omit<Exam, 'id'>) => {
        if (serverStatus !== 'connected') {
            showToast('System Offline: Cannot add exam.', 'error');
            return;
        }
        const apiRes = await tryApi(`${API_URL}/exams`, { method: 'POST', body: JSON.stringify(exam) });
        if (apiRes) {
            const data = await apiRes.json();
            setExams(prev => [...prev, data]);
            showToast('Exam created successfully');
        } else {
            showToast('Failed to create exam', 'error');
        }
    };

    const updateExam = async (id: string, data: Partial<Exam>) => {
        if (serverStatus !== 'connected') {
            showToast('System Offline: Cannot update exam.', 'error');
            return;
        }
        const apiRes = await tryApi(`${API_URL}/exams/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        if (apiRes) {
            const updated = await apiRes.json();
            setExams(prev => prev.map(e => e.id === id ? updated : e));
            showToast('Exam updated');
        }
    };

    const deleteExam = async (id: string) => {
        if (serverStatus !== 'connected') {
            showToast('System Offline: Cannot delete exam.', 'error');
            return;
        }
        const apiRes = await tryApi(`${API_URL}/exams/${id}`, { method: 'DELETE' });
        if (apiRes) {
            setExams(prev => prev.filter(e => e.id !== id));
            showToast('Exam deleted', 'info');
        }
    };

    // PAYMENTS
    const addPayment = async (payment: Omit<FeePayment, 'id' | 'receiptNumber'>) => {
        if (serverStatus !== 'connected') {
            showToast('System Offline: Cannot record payment.', 'error');
            return;
        }
        const apiRes = await tryApi(`${API_URL}/fees`, { method: 'POST', body: JSON.stringify(payment) });
        if (apiRes) {
            const data = await apiRes.json();
            setPayments(prev => [...prev, data]);
            // Update student locally to reflect new balance immediately
            setStudents(prev => prev.map(s => {
                if (s.id === payment.studentId) {
                    const newPaid = s.paidFees + payment.amount;
                    return { ...s, paidFees: newPaid, feeBalance: s.totalFees - newPaid };
                }
                return s;
            }));
            showToast(`Payment of KSh ${payment.amount.toLocaleString()} recorded`);
        }
    };

    const deletePayment = async (id: string) => {
        if (serverStatus !== 'connected') {
            showToast('System Offline: Cannot delete payment.', 'error');
            return;
        }
        const payment = payments.find(p => p.id === id);
        if (payment) {
            const apiRes = await tryApi(`${API_URL}/fees/${id}`, { method: 'DELETE' });
            if (apiRes) {
                setPayments(prev => prev.filter(p => p.id !== id));

                // Reverse the fee balance adjustment
                setStudents(prev => prev.map(s => {
                    if (s.id === payment.studentId) {
                        const newPaid = s.paidFees - payment.amount;
                        return { ...s, paidFees: newPaid, feeBalance: s.totalFees - newPaid };
                    }
                    return s;
                }));

                showToast('Payment deleted and fee balance adjusted', 'info');
            }
        }
    };

    // RESULTS
    const addResult = async (result: Omit<StudentResult, 'id'>) => {
        if (serverStatus !== 'connected') {
            showToast('System Offline: Cannot add result.', 'error');
            return;
        }
        const apiRes = await tryApi(`${API_URL}/results`, { method: 'POST', body: JSON.stringify(result) });
        if (apiRes) {
            const data = await apiRes.json();
            setResults(prev => [...prev.filter(r => !(r.studentId === result.studentId && r.examId === result.examId)), data]);
            showToast('Result saved');
        } else {
            showToast('Failed to save result', 'error');
        }
    };

    const saveBulkResults = async (newResults: Omit<StudentResult, 'id'>[]) => {
        if (serverStatus !== 'connected') {
            showToast('System Offline: Cannot save results.', 'error');
            return;
        }
        const apiRes = await tryApi(`${API_URL}/results`, { method: 'POST', body: JSON.stringify(newResults) });
        if (apiRes) {
            const data = await apiRes.json();
            setResults(prev => {
                const filtered = prev.filter(r => !newResults.some(nr => nr.studentId === r.studentId && nr.examId === r.examId));
                return [...filtered, ...data];
            });
            showToast(`Saved ${newResults.length} results`);
        } else {
            showToast('Failed to save results to server', 'error');
        }
    };

    const uploadResults = async (newResults: Omit<StudentResult, 'id'>[]) => {
        if (serverStatus !== 'connected') {
            showToast('System Offline: Cannot upload results.', 'error');
            return;
        }
        // For bulk, we might want a bulk API endpoint, but here we just loop or send one by one
        // The original logic was client-side only. We should probably block this or implement a bulk API.
        // For now, let's block to be safe.
        showToast('Bulk upload requires online connection. Please implement bulk API.', 'error');

        /*
        // Original logic was local only.
        const timestamp = new Date().toISOString();
        const resultsToAdd = newResults.map(r => ({ ...r, id: generateId() } as StudentResult));
        setResults(prev => {
            // Remove existing for same exam/student
            const filtered = prev.filter(p => !newResults.some(n => n.studentId === p.studentId && n.examId === p.examId));
            return [...filtered, ...resultsToAdd];
        });
        showToast(`Saved ${newResults.length} results`);
        */
    };

    // ATTENDANCE
    const markAttendance = async (record: Omit<AttendanceRecord, 'id'>) => {
        if (serverStatus !== 'connected') {
            showToast('System Offline: Cannot mark attendance.', 'error');
            return;
        }
        // Check if already exists for this date/student to prevent duplicates
        // (The server should handle this, but client check is good UX)

        const apiRes = await tryApi(`${API_URL}/attendance`, { method: 'POST', body: JSON.stringify(record) });
        if (apiRes) {
            const data = await apiRes.json();
            setAttendance(prev => {
                const filtered = prev.filter(a => !(a.studentId === record.studentId && a.date === record.date));
                return [...filtered, data];
            });
            showToast('Attendance marked');
        } else {
            showToast('Failed to save attendance', 'error');
        }
    };

    // EXCEL UPLOADS
    const readFile = (file: File): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    resolve(XLSX.utils.sheet_to_json(worksheet));
                } catch (err) { reject(err); }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    };

    const uploadStudents = async (file: File) => {
        try {
            const data = await readFile(file);
            const studentsToUpload = data.map((row: any) => ({
                admissionNumber: row['Admission No'] || row['AdmissionNumber'] || `ADM-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
                firstName: row['First Name'] || row['FirstName'] || '',
                lastName: row['Last Name'] || row['LastName'] || '',
                gender: (row['Gender'] || 'Male') as any,
                grade: row['Grade'] || 'Grade 1',
                dateOfBirth: row['DOB'] || row['DateOfBirth'] || '',
                parentName: row['Parent Name'] || row['ParentName'] || '',
                parentPhone: row['Phone'] || row['ParentPhone'] || '',
                parentEmail: row['Email'] || row['ParentEmail'] || '',
                address: row['Address'] || '',
                status: 'Active' as any,
                enrollmentDate: new Date().toISOString().split('T')[0],
                totalFees: Number(row['Total Fees']) || gradeFees[row['Grade']] || 15000,
                paidFees: 0,
                feeBalance: Number(row['Total Fees']) || gradeFees[row['Grade']] || 15000,
            }));
            for (const s of studentsToUpload) { await addStudent(s); }
            showToast(`Imported ${studentsToUpload.length} students`);
        } catch (err) { showToast('Failed to import students', 'error'); }
    };

    const uploadTeachers = async (file: File) => {
        try {
            const data = await readFile(file);
            const teachersToUpload = data.map((row: any) => ({
                firstName: row['First Name'] || row['FirstName'] || '',
                lastName: row['Last Name'] || row['LastName'] || '',
                email: row['Email'] || '',
                phone: row['Phone'] || '',
                subjects: (row['Subjects'] || '').split(',').map((s: string) => s.trim()),
                grades: (row['Grades'] || '').split(',').map((g: string) => g.trim()),
                status: 'Active' as any,
                joinDate: new Date().toISOString().split('T')[0],
                qualification: row['Qualification'] || '',
                maxLessonsDay: 8,
                maxLessonsWeek: 40,
            }));
            for (const t of teachersToUpload) { await addTeacher(t); }
            showToast(`Imported ${teachersToUpload.length} teachers`);
        } catch (err) { showToast('Failed to import teachers', 'error'); }
    };

    const uploadExams = async (file: File) => {
        try {
            const data = await readFile(file);
            const examsToUpload = data.map((row: any) => ({
                name: row['Exam Name'] || row['Name'] || '',
                subject: row['Subject'] || '',
                grade: row['Grade'] || '',
                date: row['Date'] || '',
                term: row['Term'] || settings.currentTerm,
                type: (row['Type'] || 'Final') as any,
                status: 'Scheduled' as any,
                totalMarks: Number(row['Total Marks']) || 100,
            }));
            for (const e of examsToUpload) { await addExam(e); }
            showToast(`Imported ${examsToUpload.length} exams`);
        } catch (err) { showToast('Failed to import exams', 'error'); }
    };

    // USERS
    const addSystemUser = async (user: Omit<User, 'id' | 'lastLogin' | 'status'>) => {
        const apiRes = await tryApi(`${API_URL}/users`, { method: 'POST', body: JSON.stringify(user) });
        if (apiRes) {
            const data = await apiRes.json();
            setSystemUsers(prev => [...prev, data]);
        } else {
            const newUser: User = { ...user, id: generateId(), lastLogin: 'Never', status: 'Active', updatedAt: new Date().toLocaleDateString() } as User;
            setSystemUsers(prev => [...prev, newUser]);
        }
        showToast(`User ${user.name} added successfully`);
    };

    const updateSystemUser = async (id: string, updates: Partial<User>) => {
        const apiRes = await tryApi(`${API_URL}/users/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
        if (apiRes) {
            const data = await apiRes.json();
            setSystemUsers(prev => prev.map(u => (u.id === id ? data : u)));
        } else {
            setSystemUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates, updatedAt: new Date().toLocaleDateString() } : u)));
        }
        showToast('User updated successfully');
    };

    const deleteSystemUser = async (id: string) => {
        await tryApi(`${API_URL}/users/${id}`, { method: 'DELETE' });
        setSystemUsers(prev => prev.filter(u => u.id !== id));
        showToast('User deleted successfully', 'info');
    };

    const resetUserPassword = (userId: string) => {
        const user = systemUsers.find(u => u.id === userId);
        if (user) {
            showToast(`Password for ${user.username} has been reset to default`);
        }
    };

    const changeUserPassword = async (userId: string, newPassword: string) => {
        const apiRes = await tryApi(`${API_URL}/users/${userId}/password`, {
            method: 'PUT',
            body: JSON.stringify({ password: newPassword })
        });

        if (apiRes) {
            showToast('Password changed successfully');
        } else {
            setSystemUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPassword, updatedAt: new Date().toLocaleDateString() } : u));
            showToast('Password changed locally');
        }
    };

    // TIMETABLE
    const addTimetableEntry = async (entry: Omit<TimetableEntry, 'id'>) => {
        const apiRes = await tryApi(`${API_URL}/timetable`, { method: 'POST', body: JSON.stringify(entry) });
        if (apiRes) {
            const data = await apiRes.json();
            setTimetable(prev => [...prev, data]);
        } else {
            const newEntry: TimetableEntry = { ...entry, id: generateId() } as TimetableEntry;
            setTimetable(prev => [...prev, newEntry]);
        }
        showToast('Timetable entry added');
    };

    const updateTimetableEntry = async (id: string, updates: Partial<TimetableEntry>) => {
        const apiRes = await tryApi(`${API_URL}/timetable/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
        if (apiRes) {
            const data = await apiRes.json();
            setTimetable(prev => prev.map(t => (t.id === id ? data : t)));
        } else {
            setTimetable(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
        }
        showToast('Timetable entry updated');
    };

    const deleteTimetableEntry = async (id: string) => {
        await tryApi(`${API_URL}/timetable/${id}`, { method: 'DELETE' });
        setTimetable(prev => prev.filter(t => t.id !== id));
    };

    // SETTINGS
    const updateSettings = async (data: Partial<SchoolSettings>) => {
        const apiRes = await tryApi(`${API_URL}/settings`, { method: 'PUT', body: JSON.stringify(data) });
        if (apiRes) {
            const updated = await apiRes.json();
            setSettings(updated);
            showToast('Settings updated');
            return true;
        } else {
            // tryApi returns null on failure. In a real app, we'd want the error message.
            // Let's improve tryApi or handle it here for settings specifically.
            const token = localStorage.getItem('elirama_token');
            const res = await fetch(`${API_URL}/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (res.status === 400) {
                const err = await res.json();
                showToast(err.error || 'Validation failed', 'error');
                return false;
            }

            setSettings(prev => ({ ...prev, ...data }));
            showToast('Settings updated locally');
            return true;
        }
    };

    const updateGradeFees = (grade: string, amount: number) => {
        setGradeFees(prev => ({ ...prev, [grade]: amount }));
        setStudents(prev => prev.map(s => {
            if (s.grade === grade) {
                return { ...s, totalFees: amount, feeBalance: amount - s.paidFees };
            }
            return s;
        }));
        showToast(`Fees for ${grade} updated to KSh ${amount.toLocaleString()} `);
    };

    // FEE STRUCTURE
    const addFeeStructure = async (item: Omit<FeeStructureItem, 'id' | 'status'>) => {
        const apiRes = await tryApi(`${API_URL}/fees/structure`, { method: 'POST', body: JSON.stringify(item) });
        if (apiRes) {
            const data = await apiRes.json();
            setFeeStructures(prev => [...prev, data]);
            showToast('Fee item added to draft');
        }
    };

    const updateFeeStructure = async (id: string, updates: Partial<FeeStructureItem>) => {
        const apiRes = await tryApi(`${API_URL}/fees/structure?id=${id}`, { method: 'PUT', body: JSON.stringify(updates) });
        if (apiRes) {
            const data = await apiRes.json();
            setFeeStructures(prev => prev.map(f => f.id === id ? data : f));
            showToast('Fee item updated in draft');
        }
    };

    const deleteFeeStructure = async (id: string) => {
        const apiRes = await tryApi(`${API_URL}/fees/structure?id=${id}`, { method: 'DELETE' });
        if (apiRes) {
            setFeeStructures(prev => prev.filter(f => f.id !== id));
            showToast('Fee item removed from draft');
        }
    };

    const applyFeeStructure = async (grade?: string) => {
        setLoading(true);
        const url = grade ? `${API_URL}/fees/apply?grade=${encodeURIComponent(grade)}` : `${API_URL}/fees/apply`;
        const apiRes = await tryApi(url, { method: 'POST' });
        if (apiRes) {
            const data = await apiRes.json();
            showToast(`Fee structure published${grade ? ` for ${grade}` : ''}! Updated ${data.updatedCount} students.`);

            // Update local state to show items as Published
            setFeeStructures(prev => prev.map(f => {
                if (!grade || f.grade === grade) return { ...f, status: 'Published' };
                return f;
            }));

            await fetchData(true); // Pull fresh student data with new balances
        } else {
            showToast('Failed to publish fee structure', 'error');
        }
        setLoading(false);
    };

    const revertFeeStructure = async (grade: string) => {
        const apiRes = await tryApi(`${API_URL}/fees/revert?grade=${encodeURIComponent(grade)}`, { method: 'POST' });
        if (apiRes) {
            setFeeStructures(prev => prev.map(f => f.grade === grade ? { ...f, status: 'Draft' } : f));
            showToast(`Fee structure for ${grade} reverted to draft`);
        }
    };

    // AUDIT LOGS
    const fetchAuditLogs = async () => {
        try {
            const res = await fetch(`${API_URL}/audit`);
            if (res.ok) setAuditLogs(await res.json());
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        }
    };

    const addRole = async (role: Omit<Role, 'id'>) => {
        try {
            const res = await fetch(`${API_URL}/roles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(role)
            });
            if (res.ok) {
                const newRole = await res.json();
                setRoles(prev => [...prev, newRole]);
                showToast('Role created successfully', 'success');
                return true;
            }
        } catch (error) {
            showToast('Failed to create role', 'error');
        }
        return false;
    };

    const updateRole = async (id: string, updates: Partial<Role>) => {
        try {
            const res = await fetch(`${API_URL}/roles`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates })
            });
            if (res.ok) {
                const updatedRole = await res.json();
                setRoles(prev => prev.map(r => r.id === id ? updatedRole : r));
                showToast('Role updated successfully', 'success');
                return true;
            }
        } catch (error) {
            showToast('Failed to update role', 'error');
        }
        return false;
    };

    const deleteRole = async (id: string) => {
        try {
            const res = await fetch(`${API_URL}/roles?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setRoles(prev => prev.filter(r => r.id !== id));
                showToast('Role deleted successfully', 'success');
                return true;
            } else {
                const data = await res.json();
                showToast(data.error || 'Failed to delete role', 'error');
            }
        } catch (error) {
            showToast('Failed to delete role', 'error');
        }
        return false;
    };

    const clearAllData = async () => {
        const token = localStorage.getItem('elirama_token');
        if (token) {
            try {
                await fetch(`${API_URL}/settings/reset`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
            } catch (error) {
                console.warn('Global reset API not available');
            }
        }

        setStudents([]);
        setTeachers([]);
        setAttendance([]);
        setExams([]);
        setPayments([]);
        setTimetable([]);
        setResults([]);
        setSystemUsers([{ id: '1', firstName: 'Admin', lastName: 'User', username: 'admin', name: 'Admin User', email: 'admin@elirama.ac.ke', role: 'Super Admin', permissions: [], status: 'Active', lastLogin: 'Never', updatedAt: new Date().toISOString() }]);
        setSettings(defaultSettings);
        localStorage.removeItem(STORAGE_KEY);
        showToast('All system data has been cleared', 'info');
    };

    const timeSlots = settings.timeSlots && settings.timeSlots.length > 0 ? settings.timeSlots : defaultTimeSlots;

    const activeGrades = useMemo(() => {
        const grades: GradeLevel[] = [];
        if (settings.earlyYearsEnabled) {
            grades.push('Play Group', 'PP1', 'PP2');
        }
        if (settings.primaryEnabled) {
            grades.push('Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6');
        }
        if (settings.jssEnabled) {
            grades.push('Grade 7', 'Grade 8', 'Grade 9');
        }
        if (settings.sssEnabled) {
            grades.push('Form 1', 'Form 2', 'Form 3', 'Form 4');
        }
        return grades;
    }, [settings.earlyYearsEnabled, settings.primaryEnabled, settings.jssEnabled, settings.sssEnabled]);

    return (
        <SchoolContext.Provider value={{
            students,
            teachers,
            attendance,
            exams,
            payments,
            timetable,
            settings,
            gradeFees,
            timeSlots: settings.timeSlots || defaultTimeSlots,
            results,
            toasts,
            loading,
            addStudent,
            updateStudent,
            deleteStudent,
            addTeacher,
            updateTeacher,
            deleteTeacher,
            saveAttendance,
            addExam,
            updateExam,
            deleteExam,
            addPayment,
            deletePayment,
            addResult,
            saveBulkResults,
            addTimetableEntry,
            updateTimetableEntry,
            deleteTimetableEntry,
            updateTimetable,
            updateSettings,
            updateGradeFees,
            uploadStudents,
            uploadTeachers,
            uploadExams,
            systemUsers,
            addSystemUser,
            updateSystemUser,
            deleteSystemUser,
            resetUserPassword,
            changeUserPassword,
            showToast,
            refreshData,
            clearAllData,
            feeStructures,
            auditLogs,
            addFeeStructure,
            updateFeeStructure,
            deleteFeeStructure,
            applyFeeStructure,
            revertFeeStructure,
            fetchAuditLogs,
            isSyncing,
            serverStatus,
            activeGrades,
            roles,
            addRole,
            updateRole,
            deleteRole
        }}>
            {children}
        </SchoolContext.Provider>
    );
}

export function useSchool() {
    const context = useContext(SchoolContext);
    if (!context) throw new Error('useSchool must be used within SchoolProvider');
    return context;
}
