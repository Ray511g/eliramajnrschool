import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
    Student, Teacher, AttendanceRecord, Exam, StudentResult, FeePayment, TimetableEntry,
    SchoolSettings, GradeLevel, GRADES, SUBJECTS, TERMS, PerformanceLevel, User
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
    addResult: (result: Omit<StudentResult, 'id'>) => void;
    saveBulkResults: (results: Omit<StudentResult, 'id'>[]) => void;
    addTimetableEntry: (entry: Omit<TimetableEntry, 'id'>) => void;
    deleteTimetableEntry: (id: string) => void;
    updateSettings: (data: Partial<SchoolSettings>) => void;
    updateGradeFees: (grade: string, amount: number) => void;
    uploadStudents: (file: File) => Promise<void>;
    uploadTeachers: (file: File) => Promise<void>;
    uploadExams: (file: File) => Promise<void>;
    systemUsers: User[];
    addSystemUser: (user: Omit<User, 'id' | 'lastLogin' | 'status'>) => void;
    resetUserPassword: (userId: string) => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    refreshData: () => void;
    clearAllData: () => void;
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
    paybillNumber: '123456',
};

const initialStudents: Student[] = [
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

const initialTeachers: Teacher[] = [
    { id: 't1', firstName: 'Alice', lastName: 'Kariuki', email: 'alice@elirama.ac.ke', phone: '0711111111', qualification: 'B.Ed Mathematics', subjects: ['Mathematics', 'Physics'], grades: ['Grade 5', 'Grade 6'], status: 'Active', joinDate: '2020-01-15' },
    { id: 't2', firstName: 'Bob', lastName: 'Omondi', email: 'bob@elirama.ac.ke', phone: '0722222222', qualification: 'B.Ed English', subjects: ['English', 'Literature'], grades: ['Grade 3', 'Grade 4'], status: 'Active', joinDate: '2019-03-01' },
    { id: 't3', firstName: 'Carol', lastName: "Ndung'u", email: 'carol@elirama.ac.ke', phone: '0733333333', qualification: 'B.Ed Science', subjects: ['Science', 'Biology'], grades: ['PP1', 'PP2'], status: 'Active', joinDate: '2021-08-20' },
    { id: 't4', firstName: 'Daniel', lastName: 'Cheruiyot', email: 'daniel@elirama.ac.ke', phone: '0744444444', qualification: 'B.Ed Social Studies', subjects: ['Social Studies', 'History'], grades: ['Play Group', 'Grade 1'], status: 'Active', joinDate: '2022-01-10' },
    { id: 't5', firstName: 'Eunice', lastName: 'Waweru', email: 'eunice@elirama.ac.ke', phone: '0755555555', qualification: 'B.Ed Kiswahili', subjects: ['Kiswahili', 'CRE'], grades: ['Grade 2', 'Grade 6'], status: 'Active', joinDate: '2021-05-15' },
];

const initialExams: Exam[] = [
    { id: 'e1', name: 'Term 1 Mid-Term Mathematics', subject: 'Mathematics', grade: 'Grade 6', date: '2026-03-15', type: 'Midterm', term: 'Term 1', status: 'Scheduled', totalMarks: 100 },
    { id: 'e2', name: 'Science Quiz - Grade 3', subject: 'Science', grade: 'Grade 3', date: '2026-02-20', type: 'Quiz', term: 'Term 1', status: 'Completed', totalMarks: 50 },
    { id: 'e3', name: 'English Final - Grade 5', subject: 'English', grade: 'Grade 5', date: '2026-04-10', type: 'Final', term: 'Term 1', status: 'Scheduled', totalMarks: 100 },
    { id: 'e4', name: 'KPSEA Mock Assessment', subject: 'Mathematics', grade: 'Grade 6', date: '2026-06-28', type: 'Final', term: 'Term 2', status: 'Scheduled', totalMarks: 50 },
];

const initialTimetable: TimetableEntry[] = [
    { id: 'tt1', grade: 'Grade 6', day: 'Monday', timeSlot: '8:00 - 8:40', subject: 'Mathematics', teacherId: 't1', teacherName: 'Alice Kariuki' },
    { id: 'tt2', grade: 'Grade 6', day: 'Monday', timeSlot: '8:40 - 9:20', subject: 'English', teacherId: 't2', teacherName: 'Bob Omondi' },
    { id: 'tt3', grade: 'Grade 6', day: 'Tuesday', timeSlot: '8:00 - 8:40', subject: 'Science', teacherId: 't3', teacherName: 'Carol Ndungu' },
    { id: 'tt4', grade: 'Grade 1', day: 'Monday', timeSlot: '8:00 - 8:40', subject: 'Social Studies', teacherId: 't4', teacherName: 'Daniel Cheruiyot' },
    { id: 'tt5', grade: 'PP1', day: 'Wednesday', timeSlot: '10:00 - 10:30', subject: 'Creative Arts', teacherId: 't3', teacherName: 'Carol Ndungu' },
];

const initialPayments: FeePayment[] = [
    { id: 'p1', studentId: 's1', studentName: 'Amara Ochieng', grade: 'Grade 1', amount: 15000, method: 'M-Pesa', reference: 'QAB123456', date: '2026-01-15', term: 'Term 1', receiptNumber: 'RCT-001' },
    { id: 'p2', studentId: 's2', studentName: 'Brian Kamau', grade: 'Grade 2', amount: 10000, method: 'Cash', reference: '', date: '2026-02-01', term: 'Term 1', receiptNumber: 'RCT-002' },
    { id: 'p3', studentId: 's4', studentName: 'David Mwangi', grade: 'Grade 4', amount: 18000, method: 'Bank Transfer', reference: 'TRF789012', date: '2026-01-20', term: 'Term 1', receiptNumber: 'RCT-003' },
    { id: 'p4', studentId: 's6', studentName: 'Felix Otieno', grade: 'Grade 6', amount: 18000, method: 'M-Pesa', reference: 'QCD345678', date: '2026-01-25', term: 'Term 1', receiptNumber: 'RCT-004' },
    { id: 'p5', studentId: 's01', studentName: 'Serah Njeri', grade: 'PP1', amount: 12500, method: 'M-Pesa', reference: 'TRF999888', date: '2026-02-05', term: 'Term 1', receiptNumber: 'RCT-005' },
];

export function SchoolProvider({ children }: { children: ReactNode }) {
    const [students, setStudents] = useState<Student[]>(initialStudents);
    const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [exams, setExams] = useState<Exam[]>(initialExams);
    const [payments, setPayments] = useState<FeePayment[]>(initialPayments);
    const [timetable, setTimetable] = useState<TimetableEntry[]>(initialTimetable);
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
    const [systemUsers, setSystemUsers] = useState<User[]>([
        { id: '1', name: 'Admin User', email: 'admin@elirama.ac.ke', role: 'Super Admin', status: 'Active', lastLogin: '2026-02-15 10:30' },
        { id: '2', name: 'Teacher User', email: 'teacher@elirama.ac.ke', role: 'Teacher', status: 'Active', lastLogin: '2026-02-16 09:15' },
        { id: '3', name: 'Zion Elirama', email: 'zion@elirama.ac.ke', role: 'Admin', status: 'Active', lastLogin: '2026-02-17 11:00' },
    ]);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const loading = false;

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = generateId();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    }, []);

    const refreshData = () => { };

    // STUDENTS
    const addStudent = (student: Omit<Student, 'id'>) => {
        setStudents(prev => [...prev, { ...student, id: generateId() }]);
        showToast('Student added successfully');
    };
    const updateStudent = (id: string, data: Partial<Student>) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
        showToast('Student updated');
    };
    const deleteStudent = (id: string) => {
        setStudents(prev => prev.filter(s => s.id !== id));
        showToast('Student deleted', 'info');
    };

    // TEACHERS
    const addTeacher = (teacher: Omit<Teacher, 'id'>) => {
        setTeachers(prev => [...prev, { ...teacher, id: generateId() }]);
        showToast('Teacher added successfully');
    };
    const updateTeacher = (id: string, data: Partial<Teacher>) => {
        setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
        showToast('Teacher updated');
    };
    const deleteTeacher = (id: string) => {
        setTeachers(prev => prev.filter(t => t.id !== id));
        showToast('Teacher deleted', 'info');
    };

    // ATTENDANCE
    const saveAttendance = (records: AttendanceRecord[]) => {
        const dateStr = records[0]?.date;
        setAttendance(prev => [...prev.filter(r => r.date !== dateStr), ...records]);
        showToast('Attendance saved successfully');
    };

    // EXAMS
    const addExam = (exam: Omit<Exam, 'id'>) => {
        setExams(prev => [...prev, { ...exam, id: generateId() }]);
        showToast('Exam scheduled successfully');
    };
    const updateExam = (id: string, data: Partial<Exam>) => {
        setExams(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
        showToast('Exam updated');
    };
    const deleteExam = (id: string) => {
        setExams(prev => prev.filter(e => e.id !== id));
        showToast('Exam deleted', 'info');
    };

    // PAYMENTS
    const addPayment = (payment: Omit<FeePayment, 'id' | 'receiptNumber'>) => {
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

    // RESULTS
    const addResult = (result: Omit<StudentResult, 'id'>) => {
        setResults(prev => [...prev.filter(r => !(r.studentId === result.studentId && r.examId === result.examId)), { ...result, id: generateId() }]);
    };

    const saveBulkResults = (newResults: Omit<StudentResult, 'id'>[]) => {
        setResults(prev => {
            const filtered = prev.filter(r => !newResults.some(nr => nr.studentId === r.studentId && nr.examId === r.examId));
            return [...filtered, ...newResults.map(r => ({ ...r, id: generateId() }))];
        });
        showToast(`Saved ${newResults.length} results`);
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
            const newStudents = data.map((row: any) => ({
                id: generateId(),
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
            setStudents(prev => [...prev, ...newStudents]);
            showToast(`Imported ${newStudents.length} students`);
        } catch (err) { showToast('Failed to import students', 'error'); }
    };

    const uploadTeachers = async (file: File) => {
        try {
            const data = await readFile(file);
            const newTeachers = data.map((row: any) => ({
                id: generateId(),
                firstName: row['First Name'] || row['FirstName'] || '',
                lastName: row['Last Name'] || row['LastName'] || '',
                email: row['Email'] || '',
                phone: row['Phone'] || '',
                subjects: (row['Subjects'] || '').split(',').map((s: string) => s.trim()),
                grades: (row['Grades'] || '').split(',').map((g: string) => g.trim()),
                status: 'Active' as any,
                joinDate: new Date().toISOString().split('T')[0],
                qualification: row['Qualification'] || '',
            }));
            setTeachers(prev => [...prev, ...newTeachers]);
            showToast(`Imported ${newTeachers.length} teachers`);
        } catch (err) { showToast('Failed to import teachers', 'error'); }
    };

    const uploadExams = async (file: File) => {
        try {
            const data = await readFile(file);
            const newExams = data.map((row: any) => ({
                id: generateId(),
                name: row['Exam Name'] || row['Name'] || '',
                subject: row['Subject'] || '',
                grade: row['Grade'] || '',
                date: row['Date'] || '',
                term: row['Term'] || settings.currentTerm,
                type: (row['Type'] || 'Final') as any,
                status: 'Scheduled' as any,
                totalMarks: Number(row['Total Marks']) || 100,
            }));
            setExams(prev => [...prev, ...newExams]);
            showToast(`Imported ${newExams.length} exams`);
        } catch (err) { showToast('Failed to import exams', 'error'); }
    };

    // USERS
    const addSystemUser = (user: Omit<User, 'id' | 'lastLogin' | 'status'>) => {
        const newUser: User = {
            ...user,
            id: generateId(),
            status: 'Active',
            lastLogin: 'Never',
        };
        setSystemUsers(prev => [...prev, newUser]);
        showToast(`User ${user.name} added successfully`);
    };

    const resetUserPassword = (userId: string) => {
        // In a real app, this would send an email or set a temp password
        const user = systemUsers.find(u => u.id === userId);
        if (user) {
            showToast(`Password reset link sent to ${user.email}`);
        }
    };

    // TIMETABLE
    const addTimetableEntry = (entry: Omit<TimetableEntry, 'id'>) => {
        setTimetable(prev => [...prev, { ...entry, id: generateId() }]);
        showToast('Timetable entry added');
    };
    const deleteTimetableEntry = (id: string) => {
        setTimetable(prev => prev.filter(t => t.id !== id));
    };

    // SETTINGS
    const updateSettings = (data: Partial<SchoolSettings>) => {
        setSettings(prev => ({ ...prev, ...data }));
        showToast('Settings updated');
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

    const clearAllData = () => {
        setStudents([]);
        setTeachers([]);
        setAttendance([]);
        setExams([]);
        setPayments([]);
        setTimetable([]);
        setResults([]);
        setSystemUsers([{ id: '1', name: 'Admin User', email: 'admin@elirama.ac.ke', role: 'Super Admin', status: 'Active', lastLogin: 'Never' }]);
        setSettings(defaultSettings);
        showToast('All system data has been cleared', 'info');
    };

    return (
        <SchoolContext.Provider value={{
            students, teachers, attendance, exams, payments, timetable, settings, gradeFees, results, toasts, loading,
            addStudent, updateStudent, deleteStudent,
            addTeacher, updateTeacher, deleteTeacher,
            saveAttendance,
            addExam, updateExam, deleteExam,
            addPayment, addResult, saveBulkResults,
            addTimetableEntry, deleteTimetableEntry,
            updateSettings, updateGradeFees,
            uploadStudents, uploadTeachers, uploadExams,
            systemUsers, addSystemUser, resetUserPassword,
            showToast, refreshData, clearAllData,
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
