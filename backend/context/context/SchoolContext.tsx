import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Student, Teacher, AttendanceRecord, Exam, FeePayment, TimetableEntry, SchoolSettings } from '../types';
import { studentsApi, teachersApi, attendanceApi, examsApi, feesApi, timetableApi, settingsApi } from '../services/api';

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
    addTimetableEntry: (entry: Omit<TimetableEntry, 'id'>) => void;
    deleteTimetableEntry: (id: string) => void;
    updateSettings: (data: Partial<SchoolSettings>) => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    refreshData: () => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const defaultSettings: SchoolSettings = {
    schoolName: 'ELIRAMA SCHOOL',
    motto: 'Excellence in Education',
    phone: '+254 700 000 000',
    email: 'info@elirama.ac.ke',
    address: 'Nairobi, Kenya',
    currentTerm: 'Term 1',
    currentYear: 2026,
};

// ===== MOCK FALLBACK DATA =====
const mockStudents: Student[] = [
    { id: 's1', firstName: 'Amara', lastName: 'Ochieng', admissionNumber: 'ELR-001', gender: 'Female', grade: 'Grade 1', dateOfBirth: '2018-03-15', parentName: 'James Ochieng', parentPhone: '0712345678', parentEmail: 'james@gmail.com', address: 'Nairobi', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 15000, paidFees: 15000, feeBalance: 0 },
    { id: 's2', firstName: 'Brian', lastName: 'Kamau', admissionNumber: 'ELR-002', gender: 'Male', grade: 'Grade 2', dateOfBirth: '2017-07-22', parentName: 'Mary Kamau', parentPhone: '0723456789', parentEmail: 'mary@gmail.com', address: 'Westlands', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 15000, paidFees: 10000, feeBalance: 5000 },
    { id: 's3', firstName: 'Cynthia', lastName: 'Wanjiku', admissionNumber: 'ELR-003', gender: 'Female', grade: 'Grade 3', dateOfBirth: '2016-11-08', parentName: 'Peter Wanjiku', parentPhone: '0734567890', parentEmail: 'peter@gmail.com', address: 'Kilimani', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 15000, paidFees: 5000, feeBalance: 10000 },
    { id: 's4', firstName: 'David', lastName: 'Mwangi', admissionNumber: 'ELR-004', gender: 'Male', grade: 'Grade 4', dateOfBirth: '2015-05-30', parentName: 'Grace Mwangi', parentPhone: '0745678901', parentEmail: 'grace@gmail.com', address: 'Karen', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 18000, paidFees: 18000, feeBalance: 0 },
    { id: 's5', firstName: 'Esther', lastName: 'Njoroge', admissionNumber: 'ELR-005', gender: 'Female', grade: 'Grade 5', dateOfBirth: '2014-09-12', parentName: 'John Njoroge', parentPhone: '0756789012', parentEmail: 'john@gmail.com', address: 'Lavington', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 18000, paidFees: 9000, feeBalance: 9000 },
    { id: 's6', firstName: 'Felix', lastName: 'Otieno', admissionNumber: 'ELR-006', gender: 'Male', grade: 'Grade 6', dateOfBirth: '2013-02-18', parentName: 'Rose Otieno', parentPhone: '0767890123', parentEmail: 'rose@gmail.com', address: 'Parklands', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 18000, paidFees: 18000, feeBalance: 0 },
    { id: 's7', firstName: 'Grace', lastName: 'Achieng', admissionNumber: 'ELR-007', gender: 'Female', grade: 'Grade 7', dateOfBirth: '2012-06-25', parentName: 'Tom Achieng', parentPhone: '0778901234', parentEmail: 'tom@gmail.com', address: 'Runda', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 20000, paidFees: 12000, feeBalance: 8000 },
    { id: 's8', firstName: 'Henry', lastName: 'Kiprotich', admissionNumber: 'ELR-008', gender: 'Male', grade: 'Grade 8', dateOfBirth: '2011-10-03', parentName: 'Ann Kiprotich', parentPhone: '0789012345', parentEmail: 'ann@gmail.com', address: 'Muthaiga', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 20000, paidFees: 20000, feeBalance: 0 },
    { id: 's9', firstName: 'Irene', lastName: 'Wambua', admissionNumber: 'ELR-009', gender: 'Female', grade: 'Grade 1', dateOfBirth: '2018-01-14', parentName: 'Paul Wambua', parentPhone: '0790123456', parentEmail: 'paul@gmail.com', address: 'Embakasi', status: 'Active', enrollmentDate: '2024-01-10', totalFees: 15000, paidFees: 7500, feeBalance: 7500 },
    { id: 's10', firstName: 'James', lastName: 'Mutua', admissionNumber: 'ELR-010', gender: 'Male', grade: 'Grade 2', dateOfBirth: '2017-04-20', parentName: 'Lucy Mutua', parentPhone: '0701234567', parentEmail: 'lucy@gmail.com', address: 'Kasarani', status: 'Inactive', enrollmentDate: '2024-01-10', totalFees: 15000, paidFees: 0, feeBalance: 15000 },
];

const mockTeachers: Teacher[] = [
    { id: 't1', firstName: 'Alice', lastName: 'Kariuki', email: 'alice@elirama.ac.ke', phone: '0711111111', qualification: 'B.Ed Mathematics', subjects: ['Mathematics', 'Physics'], grades: ['Grade 7', 'Grade 8'], status: 'Active', joinDate: '2020-01-15' },
    { id: 't2', firstName: 'Bob', lastName: 'Omondi', email: 'bob@elirama.ac.ke', phone: '0722222222', qualification: 'B.Ed English', subjects: ['English', 'Literature'], grades: ['Grade 5', 'Grade 6'], status: 'Active', joinDate: '2019-03-01' },
    { id: 't3', firstName: 'Carol', lastName: 'Ndung\'u', email: 'carol@elirama.ac.ke', phone: '0733333333', qualification: 'B.Ed Science', subjects: ['Science', 'Biology'], grades: ['Grade 3', 'Grade 4'], status: 'Active', joinDate: '2021-08-20' },
    { id: 't4', firstName: 'Daniel', lastName: 'Cheruiyot', email: 'daniel@elirama.ac.ke', phone: '0744444444', qualification: 'B.Ed Social Studies', subjects: ['Social Studies', 'History'], grades: ['Grade 1', 'Grade 2'], status: 'Active', joinDate: '2022-01-10' },
];

const mockExams: Exam[] = [
    { id: 'e1', name: 'Term 1 Mid-Term Mathematics', subject: 'Mathematics', grade: 'Grade 7', date: '2026-03-15', type: 'Midterm', term: 'Term 1', status: 'Scheduled', totalMarks: 100 },
    { id: 'e2', name: 'Science Quiz - Grade 3', subject: 'Science', grade: 'Grade 3', date: '2026-02-20', type: 'Quiz', term: 'Term 1', status: 'Completed', totalMarks: 50 },
];

const mockTimetable: TimetableEntry[] = [
    { id: 'tt1', grade: 'Grade 7', day: 'Monday', timeSlot: '8:00 - 9:00', subject: 'Mathematics', teacherId: 't1', teacherName: 'Alice Kariuki' },
    { id: 'tt2', grade: 'Grade 7', day: 'Monday', timeSlot: '9:00 - 10:00', subject: 'English', teacherId: 't2', teacherName: 'Bob Omondi' },
    { id: 'tt3', grade: 'Grade 1', day: 'Monday', timeSlot: '8:00 - 9:00', subject: 'Social Studies', teacherId: 't4', teacherName: 'Daniel Cheruiyot' },
];

const mockPayments: FeePayment[] = [
    { id: 'p1', studentId: 's1', studentName: 'Amara Ochieng', grade: 'Grade 1', amount: 15000, method: 'M-Pesa', reference: 'QAB123456', date: '2026-01-15', term: 'Term 1', receiptNumber: 'RCT-001' },
    { id: 'p2', studentId: 's2', studentName: 'Brian Kamau', grade: 'Grade 2', amount: 10000, method: 'Cash', reference: '', date: '2026-02-01', term: 'Term 1', receiptNumber: 'RCT-002' },
];

export function SchoolProvider({ children }: { children: ReactNode }) {
    const [students, setStudents] = useState<Student[]>(mockStudents);
    const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [exams, setExams] = useState<Exam[]>(mockExams);
    const [payments, setPayments] = useState<FeePayment[]>(mockPayments);
    const [timetable, setTimetable] = useState<TimetableEntry[]>(mockTimetable);
    const [settings, setSettings] = useState<SchoolSettings>(defaultSettings);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [loading, setLoading] = useState(false);
    const [apiAvailable, setApiAvailable] = useState(false);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = generateId();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    // Load all data from backend on mount
    const loadFromApi = useCallback(async () => {
        setLoading(true);
        try {
            const [s, t, e, p, tt, cfg] = await Promise.all([
                studentsApi.getAll(),
                teachersApi.getAll(),
                examsApi.getAll(),
                feesApi.getAll(),
                timetableApi.getAll(),
                settingsApi.get(),
            ]);
            setStudents(s);
            setTeachers(t);
            setExams(e);
            setPayments(p);
            setTimetable(tt);
            setSettings(cfg);
            setApiAvailable(true);
        } catch {
            // Backend offline — keep mock data
            setApiAvailable(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFromApi();
    }, [loadFromApi]);

    const refreshData = () => loadFromApi();

    // ===== STUDENTS =====
    const addStudent = async (student: Omit<Student, 'id'>) => {
        if (apiAvailable) {
            try {
                const created = await studentsApi.create(student);
                setStudents(prev => [created, ...prev]);
                showToast('Student added successfully');
                return;
            } catch { }
        }
        setStudents(prev => [...prev, { ...student, id: generateId() }]);
        showToast('Student added successfully');
    };

    const updateStudent = async (id: string, data: Partial<Student>) => {
        if (apiAvailable) {
            try {
                const updated = await studentsApi.update(id, data);
                setStudents(prev => prev.map(s => s.id === id ? updated : s));
                showToast('Student updated');
                return;
            } catch { }
        }
        setStudents(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
        showToast('Student updated');
    };

    const deleteStudent = async (id: string) => {
        if (apiAvailable) {
            try { await studentsApi.delete(id); } catch { }
        }
        setStudents(prev => prev.filter(s => s.id !== id));
        showToast('Student deleted', 'info');
    };

    // ===== TEACHERS =====
    const addTeacher = async (teacher: Omit<Teacher, 'id'>) => {
        if (apiAvailable) {
            try {
                const created = await teachersApi.create(teacher);
                setTeachers(prev => [created, ...prev]);
                showToast('Teacher added successfully');
                return;
            } catch { }
        }
        setTeachers(prev => [...prev, { ...teacher, id: generateId() }]);
        showToast('Teacher added successfully');
    };

    const updateTeacher = async (id: string, data: Partial<Teacher>) => {
        if (apiAvailable) {
            try {
                const updated = await teachersApi.update(id, data);
                setTeachers(prev => prev.map(t => t.id === id ? updated : t));
                showToast('Teacher updated');
                return;
            } catch { }
        }
        setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
        showToast('Teacher updated');
    };

    const deleteTeacher = async (id: string) => {
        if (apiAvailable) {
            try { await teachersApi.delete(id); } catch { }
        }
        setTeachers(prev => prev.filter(t => t.id !== id));
        showToast('Teacher deleted', 'info');
    };

    // ===== ATTENDANCE =====
    const saveAttendance = async (records: AttendanceRecord[]) => {
        if (apiAvailable) {
            try { await attendanceApi.save(records); } catch { }
        }
        setAttendance(prev => {
            const dateStr = records[0]?.date;
            const filtered = prev.filter(r => r.date !== dateStr);
            return [...filtered, ...records];
        });
        showToast('Attendance saved successfully');
    };

    // ===== EXAMS =====
    const addExam = async (exam: Omit<Exam, 'id'>) => {
        if (apiAvailable) {
            try {
                const created = await examsApi.create(exam);
                setExams(prev => [created, ...prev]);
                showToast('Exam scheduled successfully');
                return;
            } catch { }
        }
        setExams(prev => [...prev, { ...exam, id: generateId() }]);
        showToast('Exam scheduled successfully');
    };

    const updateExam = async (id: string, data: Partial<Exam>) => {
        if (apiAvailable) {
            try {
                const updated = await examsApi.update(id, data);
                setExams(prev => prev.map(e => e.id === id ? updated : e));
                showToast('Exam updated');
                return;
            } catch { }
        }
        setExams(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
        showToast('Exam updated');
    };

    const deleteExam = async (id: string) => {
        if (apiAvailable) {
            try { await examsApi.delete(id); } catch { }
        }
        setExams(prev => prev.filter(e => e.id !== id));
        showToast('Exam deleted', 'info');
    };

    // ===== PAYMENTS =====
    const addPayment = async (payment: Omit<FeePayment, 'id' | 'receiptNumber'>) => {
        if (apiAvailable) {
            try {
                const created = await feesApi.recordPayment(payment);
                setPayments(prev => [created, ...prev]);
                // Refresh students to get updated fee balance
                const updatedStudents = await studentsApi.getAll();
                setStudents(updatedStudents);
                showToast(`Payment of KSh ${payment.amount.toLocaleString()} recorded`);
                return;
            } catch { }
        }
        const id = generateId();
        const receiptNumber = `RCT-${Date.now().toString().slice(-6)}`;
        setPayments(prev => [...prev, { ...payment, id, receiptNumber }]);
        setStudents(prev => prev.map(s => {
            if (s.id === payment.studentId) {
                const newPaid = s.paidFees + payment.amount;
                return { ...s, paidFees: newPaid, feeBalance: s.totalFees - newPaid };
            }
            return s;
        }));
        showToast(`Payment of KSh ${payment.amount.toLocaleString()} recorded`);
    };

    // ===== TIMETABLE =====
    const addTimetableEntry = async (entry: Omit<TimetableEntry, 'id'>) => {
        if (apiAvailable) {
            try {
                const created = await timetableApi.create(entry);
                setTimetable(prev => [...prev, created]);
                showToast('Timetable entry added');
                return;
            } catch { }
        }
        setTimetable(prev => [...prev, { ...entry, id: generateId() }]);
        showToast('Timetable entry added');
    };

    const deleteTimetableEntry = async (id: string) => {
        if (apiAvailable) {
            try { await timetableApi.delete(id); } catch { }
        }
        setTimetable(prev => prev.filter(t => t.id !== id));
    };

    // ===== SETTINGS =====
    const updateSettings = async (data: Partial<SchoolSettings>) => {
        if (apiAvailable) {
            try {
                const updated = await settingsApi.update(data);
                setSettings(updated);
                showToast('Settings updated');
                return;
            } catch { }
        }
        setSettings(prev => ({ ...prev, ...data }));
        showToast('Settings updated');
    };

    return (
        <SchoolContext.Provider value={{
            students, teachers, attendance, exams, payments, timetable, settings, toasts, loading,
            addStudent, updateStudent, deleteStudent,
            addTeacher, updateTeacher, deleteTeacher,
            saveAttendance,
            addExam, updateExam, deleteExam,
            addPayment,
            addTimetableEntry, deleteTimetableEntry,
            updateSettings, showToast, refreshData,
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
