import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { GRADES, StudentResult, PerformanceLevel, Exam } from '../../types';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ReportFormModal from '../../components/modals/ReportFormModal';

const calculateLevel = (marks: number): PerformanceLevel => {
    if (marks >= 80) return 'EE';
    if (marks >= 50) return 'ME';
    if (marks >= 30) return 'AE';
    return 'BE';
};

const getLevelColor = (level: PerformanceLevel) => {
    switch (level) {
        case 'EE': return 'var(--accent-green)';
        case 'ME': return 'var(--accent-blue)';
        case 'AE': return 'var(--accent-orange)';
        case 'BE': return 'var(--accent-red)';
        default: return 'inherit';
    }
};

export default function Results() {
    const { students, exams, results, saveBulkResults, showToast } = useSchool();
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedExamId, setSelectedExamId] = useState('');
    const [localResults, setLocalResults] = useState<Record<string, { marks: number, remarks: string }>>({});
    const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);

    const filteredExams = exams.filter(e => e.grade === selectedGrade);
    const gradeStudents = students.filter(s => s.grade === selectedGrade);
    const selectedExam = exams.find(e => e.id === selectedExamId);

    const handleLoadResults = () => {
        if (!selectedExamId) return;
        const existing = results.filter(r => r.examId === selectedExamId);
        const newLocal: Record<string, { marks: number, remarks: string }> = {};
        existing.forEach(r => {
            newLocal[r.studentId] = { marks: r.marks, remarks: r.remarks };
        });
        setLocalResults(newLocal);
    };

    const handleUpdateMark = (studentId: string, marks: number) => {
        setLocalResults(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], marks }
        }));
    };

    const handleUpdateRemark = (studentId: string, remarks: string) => {
        setLocalResults(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], remarks }
        }));
    };

    const handleSave = () => {
        if (!selectedExam) return;
        const toSave = gradeStudents.map(s => ({
            studentId: s.id,
            studentName: `${s.firstName} ${s.lastName}`,
            examId: selectedExam.id,
            subject: selectedExam.subject,
            marks: localResults[s.id]?.marks || 0,
            level: calculateLevel(localResults[s.id]?.marks || 0),
            remarks: localResults[s.id]?.remarks || '',
        }));
        saveBulkResults(toSave as any);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">CBC Results Management</h1>
                    <p className="page-subtitle">Track student competencies and learning outcomes</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn-primary" onClick={handleSave} disabled={!selectedExamId}>
                        <SaveIcon style={{ fontSize: 18, marginRight: 8 }} />
                        Save All Results
                    </button>
                </div>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                <div className="stat-card">
                    <h3 style={{ marginBottom: 16 }}>Class Selection</h3>
                    <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                            <label htmlFor="results-grade">Select Grade</label>
                            <select id="results-grade" title="Select grade to manage results" className="form-control" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)}>
                                <option value="">Select Grade</option>
                                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label htmlFor="results-exam">Select Exam/Assessment</label>
                            <select id="results-exam" title="Select assessment to manage marks" className="form-control" value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} disabled={!selectedGrade}>
                                <option value="">Select Assessment</option>
                                {filteredExams.map(e => <option key={e.id} value={e.id}>{e.name} ({e.subject})</option>)}
                            </select>
                        </div>
                        <div style={{ alignSelf: 'flex-end', paddingBottom: 12 }}>
                            <button className="btn-outline" onClick={handleLoadResults} disabled={!selectedExamId}>Load</button>
                        </div>
                    </div>
                </div>
            </div>

            {selectedExam && (
                <div className="card" style={{ marginTop: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h2 style={{ fontSize: 18 }}>Mark Entry: {selectedExam.name}</h2>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            EE (80-100) | ME (50-79) | AE (30-49) | BE (0-29)
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th style={{ width: 120 }}>Marks / {selectedExam.totalMarks}</th>
                                    <th style={{ width: 150 }}>CBC Level</th>
                                    <th>Teacher's Remarks</th>
                                    <th style={{ width: 100 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gradeStudents.map(student => {
                                    const res = localResults[student.id] || { marks: 0, remarks: '' };
                                    const level = calculateLevel(res.marks);
                                    return (
                                        <tr key={student.id}>
                                            <td style={{ fontWeight: 500 }}>{student.firstName} {student.lastName}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    title={`Marks for ${student.firstName}`}
                                                    aria-label={`Marks for ${student.firstName}`}
                                                    className="form-control"
                                                    style={{ width: 80 }}
                                                    max={selectedExam.totalMarks}
                                                    min={0}
                                                    value={res.marks || ''}
                                                    onChange={e => handleUpdateMark(student.id, Number(e.target.value))}
                                                />
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: 4,
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    backgroundColor: `${getLevelColor(level)}22`,
                                                    color: getLevelColor(level),
                                                    border: `1px solid ${getLevelColor(level)}44`
                                                }}>
                                                    {level === 'EE' && 'Exceeding Expectations (EE)'}
                                                    {level === 'ME' && 'Meeting Expectations (ME)'}
                                                    {level === 'AE' && 'Approaching Expectations (AE)'}
                                                    {level === 'BE' && 'Below Expectations (BE)'}
                                                </span>
                                            </td>
                                            <td>
                                                <input
                                                    className="form-control"
                                                    placeholder="Teacher's comments..."
                                                    value={res.remarks}
                                                    onChange={e => handleUpdateRemark(student.id, e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <button
                                                    className="table-action-btn"
                                                    onClick={() => setViewingStudentId(student.id)}
                                                    title="View Report Form"
                                                >
                                                    <FileDownloadIcon style={{ fontSize: 16 }} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!selectedExam && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                    <SearchIcon style={{ fontSize: 48, opacity: 0.2, marginBottom: 16 }} />
                    <p>Select a Grade and Assessment to start entering results</p>
                </div>
            )}

            {viewingStudentId && (
                <ReportFormModal
                    studentId={viewingStudentId}
                    onClose={() => setViewingStudentId(null)}
                />
            )}
        </div>
    );
}
