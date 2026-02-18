import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import { PerformanceLevel } from '../../types';

interface Props {
    studentId: string;
    onClose: () => void;
}

const getLevelName = (level: PerformanceLevel) => {
    switch (level) {
        case 'EE': return 'Exceeding Expectations';
        case 'ME': return 'Meeting Expectations';
        case 'AE': return 'Approaching Expectations';
        case 'BE': return 'Below Expectations';
        default: return '-';
    }
};

export default function ReportFormModal({ studentId, onClose }: Props) {
    const { students, results, settings } = useSchool();
    const student = students.find(s => s.id === studentId);
    const studentResults = results.filter(r => r.studentId === studentId);

    if (!student) return null;

    const reportHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Report Form - ${student.firstName} ${student.lastName}</title>
            <style>
                body { font-family: 'Inter', sans-serif; padding: 0; margin: 0; color: #1e293b; line-height: 1.6; }
                .page { padding: 15mm; background: white; }
                .header { 
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 3px solid #2c3e50;
                    padding-bottom: 15px;
                    margin-bottom: 25px;
                }
                .school-info-header { text-align: right; }
                .school-name { font-size: 28px; font-weight: bold; color: #2c3e50; text-transform: uppercase; margin: 0; }
                .school-motto { font-style: italic; color: #7f8c8d; margin-top: 2px; font-size: 13px; }
                .contact-info { font-size: 10px; color: #64748b; margin-top: 5px; }
                
                .report-title { 
                    text-align: center; 
                    font-size: 20px; 
                    font-weight: 800; 
                    margin: 20px 0; 
                    color: #1e3a8a;
                    letter-spacing: 0.5px;
                    text-decoration: underline;
                }
                
                .info-bar { 
                    display: grid; 
                    grid-template-columns: repeat(2, 1fr); 
                    gap: 15px; 
                    background: #f8fafc; 
                    padding: 15px; 
                    margin-bottom: 25px; 
                    border-radius: 8px; 
                    font-size: 12px;
                    border: 1px solid #e2e8f0;
                }
                
                table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
                th { background: #f1f5f9; color: #475569; text-align: left; padding: 10px; font-size: 11px; border: 1px solid #cbd5e1; text-transform: uppercase; }
                td { border: 1px solid #cbd5e1; padding: 10px; font-size: 12px; }
                .level-badge { font-weight: bold; font-size: 11px; }

                .remarks-section { margin-top: 30px; font-size: 13px; }
                .remarks-row { margin-bottom: 15px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 5px; }

                .signature-grid { 
                    margin-top: 40px; 
                    display: grid; 
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                }
                .signature-box { text-align: center; }
                .signature-img { max-width: 120px; max-height: 60px; object-fit: contain; display: block; margin: 0 auto -8px; }
                .signature-line { border-top: 1px solid #1e293b; padding-top: 6px; font-weight: bold; font-size: 12px; color: #1e293b; }
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
                    CBC LEARNER'S PERFORMANCE REPORT 
                    ${student.grade === 'Grade 6' ? '<span style="background:#e11d48; color:white; padding:3px 8px; border-radius:99px; font-size:10px; margin-left:10px">KPSEA</span>' : ''}
                </div>

                <div class="info-bar">
                    <div>
                        <div style="margin-bottom:5px"><span style="color:#64748b">Name:</span> <strong>${student.firstName} ${student.lastName}</strong></div>
                        <div style="margin-bottom:5px"><span style="color:#64748b">Adm No:</span> <strong>${student.admissionNumber}</strong></div>
                        <div><span style="color:#64748b">Grade:</span> <strong>${student.grade}</strong></div>
                    </div>
                    <div>
                        <div style="margin-bottom:5px"><span style="color:#64748b">Year:</span> <strong>${settings.currentYear}</strong></div>
                        <div style="margin-bottom:5px"><span style="color:#64748b">Term:</span> <strong>${settings.currentTerm}</strong></div>
                        <div><span style="color:#64748b">Gender:</span> <strong>${student.gender}</strong></div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Learning Area</th>
                            <th style="text-align:center">Marks</th>
                            <th style="text-align:center">Performance Level</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${studentResults.map(r => `
                            <tr>
                                <td style="font-weight: 600;">${r.subject}</td>
                                <td style="text-align:center">${r.marks}%</td>
                                <td style="text-align:center"><span class="level-badge">${r.level} - ${getLevelName(r.level)}</span></td>
                                <td style="font-size: 11px;">${r.remarks || 'Commendable performance.'}</td>
                            </tr>
                        `).join('')}
                        ${studentResults.length === 0 ? '<tr><td colspan="4" style="text-align: center; padding: 40px; color: #64748b;">No results recorded for this assessment period.</td></tr>' : ''}
                    </tbody>
                </table>

                <div class="remarks-section">
                    <div class="remarks-row"><strong>CLASS TEACHER'S REMARKS:</strong> _________________________________________________________________</div>
                    <div class="remarks-row"><strong>HEADTEACHER'S REMARKS:</strong> __________________________________________________________________</div>
                </div>

                <div class="signature-grid">
                    <div class="signature-box">
                        <div style="height:60px"></div>
                        <div class="signature-line">Class Teacher Signature</div>
                    </div>
                    <div class="signature-box">
                        ${settings.headteacherSignature ? `<img src="${settings.headteacherSignature}" class="signature-img" alt="Headteacher Signature" />` : '<div style="height:60px"></div>'}
                        <div class="signature-line">Headteacher / School Stamp</div>
                    </div>
                </div>
                
                <div style="margin-top: 30px; font-size: 9px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 10px;">
                    This is an official document generated by ${settings.schoolName} Management System.
                </div>
            </div>
        </body>
        </html>
    `;

    const handlePrint = () => {
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(reportHTML);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); }, 500);
    };

    const handleDownload = () => {
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(reportHTML);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); }, 500);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 800 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Learner Performance Report</h2>
                    <button className="modal-close" onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="modal-body">
                    <div style={{ background: 'var(--bg-surface)', padding: 20, borderRadius: 8, marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>{student.firstName} {student.lastName}</h3>
                                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>
                                    {student.grade} • {student.admissionNumber}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button className="btn-outline" onClick={handleDownload} title="Save as PDF">
                                    <DownloadIcon style={{ fontSize: 18, marginRight: 8 }} />
                                    PDF
                                </button>
                                <button className="btn-primary" onClick={handlePrint}>
                                    <PrintIcon style={{ fontSize: 18, marginRight: 8 }} />
                                    Print Report
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={{ maxHeight: '60vh', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 8 }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Level</th>
                                    <th>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentResults.map(r => (
                                    <tr key={r.id}>
                                        <td style={{ fontWeight: 500 }}>{r.subject}</td>
                                        <td>
                                            <span style={{ fontWeight: 600 }}>{r.level}</span>
                                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 8 }}>
                                                ({getLevelName(r.level)})
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 13 }}>{r.remarks || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-outline" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}
