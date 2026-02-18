import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { GRADES, AttendanceRecord } from '../types';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export default function Attendance() {
    const { students, attendance, saveAttendance } = useSchool();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedGrade, setSelectedGrade] = useState('');
    const [records, setRecords] = useState<Map<string, string>>(new Map());

    const filteredStudents = useMemo(() => {
        return students.filter(s => s.status === 'Active' && (!selectedGrade || s.grade === selectedGrade));
    }, [students, selectedGrade]);

    // Initialize from existing attendance
    useMemo(() => {
        const existing = attendance.filter(a => a.date === selectedDate);
        const newMap = new Map<string, string>();
        existing.forEach(a => newMap.set(a.studentId, a.status));
        setRecords(newMap);
    }, [selectedDate, attendance]);

    const setStatus = (studentId: string, status: string) => {
        setRecords(prev => {
            const next = new Map(prev);
            next.set(studentId, status);
            return next;
        });
    };

    const markAll = (status: string) => {
        const next = new Map(records);
        filteredStudents.forEach(s => next.set(s.id, status));
        setRecords(next);
    };

    const handleSave = () => {
        const attendanceRecords: AttendanceRecord[] = filteredStudents
            .filter(s => records.has(s.id))
            .map(s => ({
                id: `${s.id}-${selectedDate}`,
                studentId: s.id,
                studentName: `${s.firstName} ${s.lastName}`,
                grade: s.grade,
                date: selectedDate,
                status: records.get(s.id) as AttendanceRecord['status'],
            }));
        saveAttendance(attendanceRecords);
    };

    const presentCount = Array.from(records.values()).filter(v => v === 'Present').length;
    const absentCount = Array.from(records.values()).filter(v => v === 'Absent').length;
    const lateCount = Array.from(records.values()).filter(v => v === 'Late').length;
    const excusedCount = Array.from(records.values()).filter(v => v === 'Excused').length;

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Attendance</h1>
                    <p>Track daily student attendance</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card green">
                    <div className="stat-card-header">
                        <div className="stat-card-value">{presentCount}</div>
                        <CheckCircleIcon style={{ color: 'var(--accent-green)', fontSize: 28 }} />
                    </div>
                    <div className="stat-card-label">Present</div>
                </div>
                <div className="stat-card red">
                    <div className="stat-card-header">
                        <div className="stat-card-value">{absentCount}</div>
                        <CancelIcon style={{ color: 'var(--accent-red)', fontSize: 28 }} />
                    </div>
                    <div className="stat-card-label">Absent</div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-card-header">
                        <div className="stat-card-value">{lateCount}</div>
                        <AccessTimeIcon style={{ color: 'var(--accent-orange)', fontSize: 28 }} />
                    </div>
                    <div className="stat-card-label">Late</div>
                </div>
                <div className="stat-card cyan">
                    <div className="stat-card-header">
                        <div className="stat-card-value">{excusedCount}</div>
                        <InfoIcon style={{ color: 'var(--accent-cyan)', fontSize: 28 }} />
                    </div>
                    <div className="stat-card-label">Excused</div>
                </div>
            </div>

            <div className="attendance-filters">
                <div className="form-group">
                    <label htmlFor="attendance-date">Date</label>
                    <input id="attendance-date" type="date" className="form-control" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="attendance-grade">Grade</label>
                    <select id="attendance-grade" title="Select grade for attendance" className="filter-select" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)}>
                        <option value="">All Grades</option>
                        {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                <div className="attendance-actions">
                    <button className="btn-primary green" onClick={() => markAll('Present')}>Mark All Present</button>
                    <button className="btn-primary red" onClick={() => markAll('Absent')}>Mark All Absent</button>
                </div>
            </div>

            <div className="attendance-list-header">
                <h3><CalendarTodayIcon style={{ fontSize: 18, marginRight: 8 }} />Mark Attendance - {filteredStudents.length} Students</h3>
                <button className="btn-primary" onClick={handleSave}>
                    <SaveIcon style={{ fontSize: 18 }} /> Save Attendance
                </button>
            </div>

            {filteredStudents.length === 0 ? (
                <div className="empty-state">
                    <p>No students found. Add students first to mark attendance.</p>
                </div>
            ) : (
                filteredStudents.map(student => (
                    <div key={student.id} className="attendance-student-row">
                        <div className="attendance-student-info">
                            <span style={{ fontWeight: 500 }}>{student.firstName} {student.lastName}</span>
                            <span className="badge blue">{student.grade}</span>
                        </div>
                        <div className="attendance-status-btns">
                            {['Present', 'Absent', 'Late', 'Excused'].map(status => (
                                <button
                                    key={status}
                                    className={`attendance-status-btn ${status.toLowerCase()} ${records.get(student.id) === status ? 'active' : ''}`}
                                    onClick={() => setStatus(student.id, status)}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
