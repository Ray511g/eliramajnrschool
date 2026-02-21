import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { SUBJECTS } from '../../types';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PaymentIcon from '@mui/icons-material/Payment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CBCProgressReportModal from '../../components/modals/CBCProgressReportModal';

export default function Reports() {
    const { students, teachers, attendance, exams, payments, results, settings, gradeFees } = useSchool();
    const [selectedReport, setSelectedReport] = useState<string>('dashboard');
    const [viewingCBCStudentId, setViewingCBCStudentId] = useState<string | null>(null);
    const [reportFilter, setReportFilter] = useState({
        studentId: '',
        term: settings.currentTerm,
    });
    const [studentSearch, setStudentSearch] = useState('');

    const filteredStudents = students.filter(s =>
        `${s.firstName} ${s.lastName} ${s.admissionNumber}`.toLowerCase().includes(studentSearch.toLowerCase())
    );

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

    const handlePrintAssessment = () => {
        const student = students.find(s => s.id === reportFilter.studentId);
        if (!student) return;

        const termResults = results.filter(r => {
            const exam = exams.find(e => e.id === r.examId);
            return r.studentId === student.id && exam?.term === reportFilter.term;
        });

        const totalMarks = termResults.reduce((sum, r) => sum + r.marks, 0);
        const averageMarks = termResults.length > 0 ? (totalMarks / termResults.length).toFixed(1) : '0.0';

        const reportHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Inter', sans-serif; padding: 0; margin: 0; color: #1a1a1a; line-height: 1.6; }
                    .page { 
                        width: 210mm; 
                        min-height: 297mm; 
                        padding: 20mm; 
                        margin: 0 auto; 
                        background: white;
                        box-sizing: border-box;
                        position: relative;
                    }
                    .header { 
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 3px solid #2c3e50;
                        padding-bottom: 15px;
                        margin-bottom: 25px;
                    }
                    .school-info-header { text-align: right; }
                    .school-name { font-size: 32px; font-weight: bold; color: #2c3e50; text-transform: uppercase; margin: 0; }
                    .school-motto { font-style: italic; color: #7f8c8d; margin-top: 2px; font-size: 14px; }
                    .contact-info { font-size: 11px; color: #4a5568; margin-top: 5px; }
                    
                    .report-title { 
                        text-align: center; 
                        font-size: 22px; 
                        font-weight: 800; 
                        margin: 20px 0; 
                        color: #1a365d;
                        letter-spacing: 1px;
                        text-decoration: underline;
                    }
                    
                    .info-bar { 
                        display: grid; 
                        grid-template-columns: repeat(3, 1fr); 
                        gap: 15px; 
                        background: #f8fafc; 
                        padding: 20px; 
                        margin-bottom: 30px; 
                        border-radius: 8px; 
                        font-size: 13px;
                        border: 1px solid #e2e8f0;
                    }
                    .section-title { 
                        font-size: 16px; 
                        font-weight: 700; 
                        margin: 25px 0 12px; 
                        text-transform: uppercase; 
                        color: #1e293b;
                        border-bottom: 2px solid #e2e8f0;
                        padding-bottom: 5px;
                    }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th { background: #f1f5f9; color: #475569; text-align: left; padding: 12px; font-size: 12px; border: 1px solid #cbd5e1; }
                    td { border: 1px solid #cbd5e1; padding: 12px; font-size: 13px; }
                    
                    .summary-box { 
                        background: #1e293b; 
                        color: white; 
                        padding: 20px; 
                        border-radius: 8px; 
                        display: flex; 
                        justify-content: space-around; 
                        margin: 30px 0; 
                    }
                    .summary-item { text-align: center; }
                    .summary-label { font-size: 11px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.5px; }
                    .summary-value { font-size: 22px; font-weight: bold; }
                    
                    .signature-area { 
                        margin-top: 50px; 
                        display: grid; 
                        grid-template-columns: 1fr 1fr;
                        gap: 50px;
                    }
                    .signature-box { text-align: center; }
                    .signature-img { max-width: 140px; max-height: 70px; object-fit: contain; display: block; margin: 0 auto -10px; }
                    .signature-line { border-top: 1px solid #1e293b; padding-top: 8px; font-weight: bold; font-size: 13px; color: #1e293b; }
                    
                    .fee-page { page-break-before: always; }
                    .kpsea-badge { background: #e11d48; color: white; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 800; vertical-align: middle; margin-left: 10px; }
                    
                    .footer-note { 
                        margin-top: 40px; 
                        text-align: center; 
                        font-size: 10px; 
                        color: #94a3b8;
                        border-top: 1px solid #e2e8f0;
                        padding-top: 15px;
                    }
                    
                    @media print {
                        body { background: none; }
                        .page { padding: 15mm; margin: 0; width: 100%; border: none; }
                    }
                </style>
            </head>
            <body>
                <div class="page">
                    <div class="header">
                        <div style="flex: 1">
                             <h1 class="school-name">${settings.schoolName}</h1>
                             <p class="school-motto">${settings.motto}</p>
                        </div>
                        <div class="school-info-header">
                            <div class="contact-info">
                                ${settings.address}<br/>
                                Tel: ${settings.phone}<br/>
                                Email: ${settings.email}
                            </div>
                        </div>
                    </div>

                    <div class="report-title">
                        LEARNER'S ASSESSMENT REPORT ${student.grade === 'Grade 6' ? '<span class="kpsea-badge">KPSEA</span>' : ''}
                    </div>

                    <div class="info-bar">
                        <div><span style="color:#64748b">NAME:</span> <strong>${student.firstName} ${student.lastName}</strong></div>
                        <div><span style="color:#64748b">ADM NO:</span> <strong>${student.admissionNumber}</strong></div>
                        <div><span style="color:#64748b">GRADE:</span> <strong>${student.grade}</strong></div>
                        <div><span style="color:#64748b">TERM:</span> <strong>${reportFilter.term}</strong></div>
                        <div><span style="color:#64748b">YEAR:</span> <strong>${settings.currentYear}</strong></div>
                        <div><span style="color:#64748b">GENDER:</span> <strong>${student.gender}</strong></div>
                    </div>

                    <div class="section-title">Academic Competencies</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Learning Area (Subject)</th>
                                <th style="text-align:center">Marks (%)</th>
                                <th style="text-align:center">Performance Level</th>
                                <th>Teacher's Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${termResults.map(r => `
                                <tr>
                                    <td><strong>${r.subject}</strong></td>
                                    <td style="text-align:center">${r.marks}%</td>
                                    <td style="text-align:center; font-weight:600">${r.level}</td>
                                    <td>${r.remarks || 'Commendable progress'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="summary-box">
                        <div class="summary-item">
                            <div class="summary-label">Aggregate Marks</div>
                            <div class="summary-value">${totalMarks}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Percentage Score</div>
                            <div class="summary-value">${averageMarks}%</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Assessed Areas</div>
                            <div class="summary-value">${termResults.length} / ${SUBJECTS.length}</div>
                        </div>
                    </div>

                    <div class="signature-area">
                        <div class="signature-box">
                            ${settings.headteacherSignature ? `<img src="${settings.headteacherSignature}" class="signature-img" />` : '<div style="height:60px"></div>'}
                            <div class="signature-line">Headteacher's Signature & Stamp</div>
                        </div>
                        <div class="signature-box" style="visibility: hidden">
                            <div style="height:60px"></div>
                            <div class="signature-line">Class Teacher</div>
                        </div>
                    </div>

                    <div class="footer-note">
                        This is a computer-generated assessment report. For authentication, a valid school stamp is required.<br/>
                        Generated on ${new Date().toLocaleString()} | ${settings.schoolName}
                    </div>
                </div>

                <div class="page fee-page">
                    <div class="header">
                        <div style="flex: 1">
                             <h1 class="school-name">${settings.schoolName}</h1>
                             <p class="school-motto">${settings.motto}</p>
                        </div>
                        <div class="school-info-header">
                            <div class="contact-info">
                                ${settings.address}<br/>
                                Tel: ${settings.phone}
                            </div>
                        </div>
                    </div>
                    
                    <div class="report-title">TERM ${settings.currentTerm} FEE STRUCTURE</div>
                    
                    <div class="section-title">Fee Breakdown for ${student.grade}</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Description of Charges</th>
                                <th style="text-align:right">Amount (KSh)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Tuition & Learning Materials</td>
                                <td style="text-align:right">${(gradeFees[student.grade] * 0.6).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td>Activity & Co-curricular Funds</td>
                                <td style="text-align:right">${(gradeFees[student.grade] * 0.2).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td>Development Levy (Fixed)</td>
                                <td style="text-align:right">${(gradeFees[student.grade] * 0.1).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td>Infrastructure Maintenance</td>
                                <td style="text-align:right">${(gradeFees[student.grade] * 0.1).toLocaleString()}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr style="background:#f1f5f9; font-weight:800">
                                <td>TOTAL PAYABLE FOR TERM</td>
                                <td style="text-align:right">KSh ${gradeFees[student.grade].toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div style="background:#fffbeb; padding:25px; border-radius:8px; border:1px solid #fcd34d; margin-top:30px">
                        <h4 style="margin:0 0 10px; color:#92400e; display:flex; align-items:center; gap:10px">
                           <span style="font-size:20px">⚠️</span> Balance Notification
                        </h4>
                        <p style="margin:0; font-size:14px">Total Outstanding Balance for ${student.firstName} ${student.lastName}: <strong style="font-size:18px">KSh ${student.feeBalance.toLocaleString()}</strong></p>
                        <p style="margin:12px 0 0; font-size:12px; color:#92400e; font-style:italic">
                            Kindly ensure all balances are settled to avoid any disruption in the learner's academic program.
                        </p>
                    </div>

                    <div class="signature-area" style="margin-top:40px">
                        <div class="signature-box">
                            ${settings.financeSignature ? `<img src="${settings.financeSignature}" class="signature-img" />` : '<div style="height:60px"></div>'}
                            <div class="signature-line">Bursar / Finance Officer</div>
                        </div>
                        <div class="signature-box">
                            ${settings.headteacherSignature ? `<img src="${settings.headteacherSignature}" class="signature-img" />` : '<div style="height:60px"></div>'}
                            <div class="signature-line">Headteacher's Endorsement</div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        const win = window.open('', '_blank');
        if (win) {
            win.document.write(reportHTML);
            win.document.close();
            win.focus();
            setTimeout(() => { win.print(); }, 1000);
        }
    };

    const reportsDashboard = [
        {
            id: 'assessment',
            title: 'Learner Assessment',
            description: 'Generate detailed performance reports with averages, KPSEA designations, and signatures.',
            icon: <DescriptionIcon />,
            color: 'var(--accent-pink)',
            bg: 'var(--accent-pink-bg)',
            count: results.length,
            onAction: () => setSelectedReport('assessment'),
        },
        {
            id: 'students',
            title: 'Student Data',
            description: 'Export student lists, contact information, and enrollment history.',
            icon: <PeopleIcon />,
            color: 'var(--accent-blue)',
            bg: 'rgba(59,130,246,0.15)',
            count: students.length,
            onAction: () => exportCSV(students.map(s => ({
                'Admission No': s.admissionNumber,
                'Name': `${s.firstName} ${s.lastName} `,
                'Grade': s.grade,
                'Balance': s.feeBalance,
            })), 'students_report'),
        },
        {
            id: 'fees',
            title: 'Fee Collection',
            description: 'Financial summaries, termly collection reports, and arrears analysis.',
            icon: <PaymentIcon />,
            color: 'var(--accent-orange)',
            bg: 'var(--accent-orange-bg)',
            count: payments.length,
            onAction: () => exportCSV(payments.map(p => ({
                'Student': p.studentName,
                'Amount': p.amount,
                'Receipt': p.receiptNumber,
            })), 'fees_report'),
        },
        {
            id: 'cbc',
            title: 'CBC Progress Report',
            description: 'Competency-based reporting showing learning areas, strands, and performance levels.',
            icon: <AssignmentIcon />,
            color: 'var(--accent-cyan)',
            bg: 'rgba(6,182,212,0.15)',
            count: 0, // We could count assessment scores
            onAction: () => setSelectedReport('cbc-assessment'),
        },
    ];

    if (selectedReport === 'assessment') {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div className="page-header-left">
                        <button className="btn-outline" style={{ marginBottom: 15 }} onClick={() => setSelectedReport('dashboard')}>
                            ← Back to Reports
                        </button>
                        <h1>Learner Assessment Report</h1>
                        <p>Generate termly assessment reports with fee structure attachment</p>
                    </div>
                </div>

                <div className="stat-cards-grid" style={{ marginBottom: 30 }}>
                    <div className="stat-card" style={{ padding: 25 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 20, alignItems: 'end' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label htmlFor="student-select">Select Student</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search student..."
                                    value={studentSearch}
                                    onChange={e => setStudentSearch(e.target.value)}
                                    style={{ marginBottom: 8 }}
                                />
                                <select
                                    id="student-select"
                                    title="Student selection"
                                    className="form-control"
                                    value={reportFilter.studentId}
                                    onChange={(e) => setReportFilter({ ...reportFilter, studentId: e.target.value })}
                                >
                                    <option value="">Choose a student ({filteredStudents.length} matches)</option>
                                    {filteredStudents.map(s => (
                                        <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNumber})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label htmlFor="term-select">Select Term</label>
                                <select
                                    id="term-select"
                                    title="Term selection"
                                    className="form-control"
                                    value={reportFilter.term}
                                    onChange={(e) => setReportFilter({ ...reportFilter, term: e.target.value })}
                                >
                                    <option value="Term 1">Term 1</option>
                                    <option value="Term 2">Term 2</option>
                                    <option value="Term 3">Term 3</option>
                                </select>
                            </div>
                            <button
                                className="btn-primary"
                                disabled={!reportFilter.studentId}
                                onClick={handlePrintAssessment}
                            >
                                <PrintIcon style={{ fontSize: 18, marginRight: 8 }} />
                                Preview & Print Report
                            </button>
                        </div>
                    </div>
                </div>

                {reportFilter.studentId && (
                    <div className="card">
                        <div className="card-header">
                            <h3>Performance Summary</h3>
                        </div>
                        <div className="card-body">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Subject</th>
                                        <th>Level</th>
                                        <th>Marks</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.filter(r => {
                                        const exam = exams.find(e => e.id === r.examId);
                                        return r.studentId === reportFilter.studentId && exam?.term === reportFilter.term;
                                    }).map(r => (
                                        <tr key={r.id}>
                                            <td><strong>{r.subject}</strong></td>
                                            <td>{r.level}</td>
                                            <td>{r.marks}%</td>
                                            <td>{r.remarks || '-'}</td>
                                        </tr>
                                    ))}
                                    {results.filter(r => {
                                        const exam = exams.find(e => e.id === r.examId);
                                        return r.studentId === reportFilter.studentId && exam?.term === reportFilter.term;
                                    }).length === 0 && (
                                            <tr>
                                                <td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                                                    No results found for the selected student and term.
                                                </td>
                                            </tr>
                                        )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (selectedReport === 'cbc-assessment') {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div className="page-header-left">
                        <button className="btn-outline" style={{ marginBottom: 15 }} onClick={() => setSelectedReport('dashboard')}>
                            ← Back to Reports
                        </button>
                        <h1>CBC Progress Report</h1>
                        <p>Generate detailed competency reports for the CBC curriculum</p>
                    </div>
                </div>

                <div className="card glass-card" style={{ padding: 25 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'end' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Search and Select Learner</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Start typing name or admission number..."
                                value={studentSearch}
                                onChange={e => setStudentSearch(e.target.value)}
                                style={{ marginBottom: 12 }}
                            />
                            <select
                                title="Learner selection"
                                className="form-control"
                                value={reportFilter.studentId}
                                onChange={(e) => setReportFilter({ ...reportFilter, studentId: e.target.value })}
                            >
                                <option value="">Choose a student...</option>
                                {filteredStudents.map(s => (
                                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNumber})</option>
                                ))}
                            </select>
                        </div>
                        <button
                            className="btn-primary"
                            disabled={!reportFilter.studentId}
                            onClick={() => setViewingCBCStudentId(reportFilter.studentId)}
                        >
                            <DescriptionIcon style={{ fontSize: 18, marginRight: 8 }} />
                            View Competency Report
                        </button>
                    </div>
                </div>

                {viewingCBCStudentId && (
                    <CBCProgressReportModal
                        studentId={viewingCBCStudentId}
                        onClose={() => setViewingCBCStudentId(null)}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>School Reports</h1>
                    <p>Academic performance, financial records, and institutional data</p>
                </div>
            </div>

            <div className="report-cards-grid">
                {reportsDashboard.map(report => (
                    <div key={report.id} className="report-card" onClick={report.onAction}>
                        <div className="report-card-icon" style={{ background: report.bg, color: report.color }}>
                            {report.icon}
                        </div>
                        <h3>{report.title}</h3>
                        <p>{report.description}</p>
                        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="badge blue">{report.count} records</span>
                            <button className="btn-outline" style={{ padding: '6px 12px', fontSize: 13 }} onClick={(e) => { e.stopPropagation(); report.onAction(); }}>
                                Open
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
