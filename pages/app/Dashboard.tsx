import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useRouter } from 'next/router';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import GridViewIcon from '@mui/icons-material/GridView';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WidgetsIcon from '@mui/icons-material/Widgets';
import AddStudentModal from '../../components/modals/AddStudentModal';

export default function Dashboard() {
    const { students, teachers, attendance, payments, settings } = useSchool();
    const router = useRouter();
    const [showAddStudent, setShowAddStudent] = useState(false);

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const todayStr = today.toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => a.date === todayStr);
    const presentCount = todayAttendance.filter(a => a.status === 'Present').length;
    const attendanceRate = todayAttendance.length > 0 ? Math.round((presentCount / todayAttendance.length) * 100) : 0;
    const absentCount = todayAttendance.filter(a => a.status === 'Absent').length;

    const totalFees = students.reduce((sum, s) => sum + s.totalFees, 0);
    const collectedFees = students.reduce((sum, s) => sum + s.paidFees, 0);
    const pendingFees = totalFees - collectedFees;
    const collectionRate = totalFees > 0 ? Math.round((collectedFees / totalFees) * 100) : 0;

    const activeStudents = students.filter(s => s.status === 'Active').length;
    const newThisWeek = students.filter(s => {
        const d = new Date(s.enrollmentDate);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return d >= weekAgo;
    }).length;

    const activeTeachers = teachers.filter(t => t.status === 'Active').length;
    const assignedClasses = new Set(teachers.flatMap(t => t.grades)).size;

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Dashboard Overview</h1>
                    <p>Welcome back! Here's what's happening today.</p>
                </div>
                <div className="date-display">
                    <p className="date-label">Today's Date</p>
                    <p className="date-value">{dateStr}</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card dash-blue">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Total Students</span>
                        <PeopleIcon className="stat-card-icon" />
                    </div>
                    <div className="stat-card-value">{students.length}</div>
                    <div className="stat-card-sub green">+{newThisWeek} new this week</div>
                </div>

                <div className="stat-card dash-green">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Total Teachers</span>
                        <SchoolIcon className="stat-card-icon" />
                    </div>
                    <div className="stat-card-value">{teachers.length}</div>
                    <div className="stat-card-sub">{assignedClasses} classes assigned</div>
                </div>

                <div className="stat-card dash-purple" style={{ gridColumn: 'span 2' }}>
                    <div className="stat-card-header">
                        <span className="stat-card-label">Today's Attendance</span>
                        <CheckCircleIcon className="stat-card-icon" />
                    </div>
                    <div className="stat-card-value">{attendanceRate}%</div>
                    <div className="stat-card-sub">{presentCount} present, {absentCount} absent</div>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <div className="dashboard-card-title">
                        <GridViewIcon style={{ fontSize: 20 }} /> Students by Grade
                    </div>
                    {students.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No students enrolled yet</p>
                    ) : (
                        <div>
                            {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'].map(grade => {
                                const count = students.filter(s => s.grade === grade).length;
                                if (count === 0) return null;
                                return (
                                    <div key={grade} className="fee-status-row">
                                        <span>{grade}</span>
                                        <span style={{ fontWeight: 600 }}>{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>

            {/* Quick Actions */}
            <div className="quick-actions-title">
                <WidgetsIcon style={{ fontSize: 20 }} /> Quick Actions
            </div>
            <div className="quick-actions-grid">
                <div className="quick-action-card" onClick={() => setShowAddStudent(true)}>
                    <div className="qa-icon blue"><PersonAddIcon /></div>
                    <h3>Add New Student</h3>
                    <p>Register a new student</p>
                </div>
                <div className="quick-action-card" onClick={() => router.push('/attendance')}>
                    <div className="qa-icon green"><EventAvailableIcon /></div>
                    <h3>Mark Attendance</h3>
                    <p>Record today's attendance</p>
                </div>
                <div className="quick-action-card" onClick={() => router.push('/fees')}>
                    <div className="qa-icon orange"><AttachMoneyIcon /></div>
                    <h3>Finance & Payments</h3>
                    <p>Manage fees and school accounts</p>
                </div>
            </div>

            {showAddStudent && <AddStudentModal onClose={() => setShowAddStudent(false)} />}
        </div>
    );
}
