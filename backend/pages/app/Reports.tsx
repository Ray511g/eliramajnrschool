import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PaymentIcon from '@mui/icons-material/Payment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';

export default function Reports() {
    const { students, teachers, attendance, exams, payments } = useSchool();
    const [selectedReport, setSelectedReport] = useState<string | null>(null);

    const exportCSV = (data: Record<string, any>[], filename: string) => {
        if (data.length === 0) return;
        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const reports = [
        {
            id: 'students',
            title: 'Student Report',
            description: 'Complete list of all enrolled students with their details, grade levels, and fee status.',
            icon: <PeopleIcon />,
            color: 'var(--accent-blue)',
            bg: 'rgba(59,130,246,0.15)',
            count: students.length,
            onExport: () => exportCSV(students.map(s => ({
                'Admission No': s.admissionNumber,
                'Name': `${s.firstName} ${s.lastName}`,
                'Grade': s.grade,
                'Gender': s.gender,
                'Parent': s.parentName,
                'Phone': s.parentPhone,
                'Status': s.status,
                'Total Fees': s.totalFees,
                'Paid': s.paidFees,
                'Balance': s.feeBalance,
            })), 'students_report'),
        },
        {
            id: 'teachers',
            title: 'Teacher Report',
            description: 'Staff information including subjects taught, assigned grades, and contact details.',
            icon: <AssessmentIcon />,
            color: 'var(--accent-green)',
            bg: 'var(--accent-green-bg)',
            count: teachers.length,
            onExport: () => exportCSV(teachers.map(t => ({
                'Name': `${t.firstName} ${t.lastName}`,
                'Email': t.email,
                'Phone': t.phone,
                'Subjects': t.subjects.join('; '),
                'Grades': t.grades.join('; '),
                'Status': t.status,
            })), 'teachers_report'),
        },
        {
            id: 'attendance',
            title: 'Attendance Report',
            description: 'Daily attendance records showing present, absent, late, and excused students.',
            icon: <EventNoteIcon />,
            color: 'var(--accent-purple)',
            bg: 'var(--accent-purple-bg)',
            count: attendance.length,
            onExport: () => exportCSV(attendance.map(a => ({
                'Student': a.studentName,
                'Grade': a.grade,
                'Date': a.date,
                'Status': a.status,
            })), 'attendance_report'),
        },
        {
            id: 'fees',
            title: 'Fee Collection Report',
            description: 'Payment records including amounts, methods, receipt numbers, and outstanding balances.',
            icon: <PaymentIcon />,
            color: 'var(--accent-orange)',
            bg: 'var(--accent-orange-bg)',
            count: payments.length,
            onExport: () => exportCSV(payments.map(p => ({
                'Receipt': p.receiptNumber,
                'Student': p.studentName,
                'Grade': p.grade,
                'Amount (KSh)': p.amount,
                'Method': p.method,
                'Reference': p.reference,
                'Date': p.date,
                'Term': p.term,
            })), 'fees_report'),
        },
        {
            id: 'exams',
            title: 'Exam Report',
            description: 'Examination schedules, results, and performance analytics per grade and subject.',
            icon: <AssignmentIcon />,
            color: 'var(--accent-pink)',
            bg: 'var(--accent-pink-bg)',
            count: exams.length,
            onExport: () => exportCSV(exams.map(e => ({
                'Exam': e.name,
                'Subject': e.subject,
                'Grade': e.grade,
                'Date': e.date,
                'Type': e.type,
                'Term': e.term,
                'Status': e.status,
                'Total Marks': e.totalMarks,
            })), 'exams_report'),
        },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Reports</h1>
                    <p>Generate and export school reports</p>
                </div>
            </div>

            <div className="report-cards-grid">
                {reports.map(report => (
                    <div key={report.id} className="report-card" onClick={() => setSelectedReport(report.id)}>
                        <div className="report-card-icon" style={{ background: report.bg, color: report.color }}>
                            {report.icon}
                        </div>
                        <h3>{report.title}</h3>
                        <p>{report.description}</p>
                        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="badge blue">{report.count} records</span>
                            <button className="btn-outline" style={{ padding: '6px 12px', fontSize: 13 }} onClick={(e) => { e.stopPropagation(); report.onExport(); }}>
                                <DownloadIcon style={{ fontSize: 16 }} /> Export CSV
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
