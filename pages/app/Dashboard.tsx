import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useRouter } from 'next/router';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentIcon from '@mui/icons-material/Payment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GridViewIcon from '@mui/icons-material/GridView';
import WidgetsIcon from '@mui/icons-material/Widgets';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AddStudentModal from '../../components/modals/AddStudentModal';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
    const { students, teachers, attendance, exams, serverStatus } = useSchool();
    const { hasPermission: hasAuthPermission, user } = useAuth();
    const router = useRouter();
    const [showAddStudent, setShowAddStudent] = useState(false);

    const stats = [
        { label: 'Total Students', value: students.length, icon: <PeopleIcon />, color: 'blue', sub: `${students.filter(s => s.status === 'Active').length} Active` },
        { label: 'Staff Members', value: teachers.length, icon: <SchoolIcon />, color: 'purple', sub: 'Teaching & Admin' },
        { label: 'Academic Year', value: '2025/26', icon: <EventNoteIcon />, color: 'green', sub: 'Term 1 Active' },
        { label: 'Exams Active', value: exams.filter(e => (e as any).status === 'Active' || (e as any).status === 'Scheduled').length, icon: <AssignmentIcon />, color: 'orange', sub: 'Ongoing Assessments' },
    ];

    const quickActions = [
        { label: 'Add Student', icon: <PeopleIcon />, path: '/students?action=add', color: 'var(--accent-blue)', desc: 'Register a new learner', permission: { module: 'students', action: 'CREATE' } },
        { label: 'Record Fees', icon: <PaymentIcon />, path: '/fees?action=record', color: 'var(--accent-green)', desc: 'Process payment', permission: { module: 'fees', action: 'CREATE' } },
        { label: 'Mark Attendance', icon: <EventNoteIcon />, path: '/attendance', color: 'var(--accent-purple)', desc: 'Daily roll call', permission: { module: 'academic', action: 'EDIT' } },
        { label: 'Enter Results', icon: <AssessmentIcon />, path: '/results', color: 'var(--accent-orange)', desc: 'CBC Assessment', permission: { module: 'academic', action: 'EDIT' } },
    ];

    return (
        <div className="page-container glass-overlay">
            <header className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">School Insights</h1>
                    <p className="page-subtitle">Welcome back, {user?.name || 'User'}! Monitor your school's performance at a glance.</p>
                </div>
            </header>

            <div className="stats-sections-grid">
                <div className="stats-cluster">
                    <h5 className="cluster-label">Academic Overview</h5>
                    <div className="stats-mini-grid">
                        {stats.slice(0, 2).map((stat, i) => (
                            <div key={i} className={`stat-card dash-${stat.color}`}>
                                <div className="stat-card-header">
                                    <span className="stat-card-label">{stat.label}</span>
                                    <div className="stat-card-icon">{stat.icon}</div>
                                </div>
                                <div className="stat-card-value">{stat.value}</div>
                                <div className="stat-card-sub">{stat.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="stats-cluster">
                    <h5 className="cluster-label">Current Session</h5>
                    <div className="stats-mini-grid">
                        {stats.slice(2, 4).map((stat, i) => (
                            <div key={i} className={`stat-card dash-${stat.color}`}>
                                <div className="stat-card-header">
                                    <span className="stat-card-label">{stat.label}</span>
                                    <div className="stat-card-icon">{stat.icon}</div>
                                </div>
                                <div className="stat-card-value">{stat.value}</div>
                                <div className="stat-card-sub">{stat.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <section className="dashboard-section" style={{ marginTop: '40px' }}>
                <div className="section-header">
                    <h2 className="section-title">Quick Operations</h2>
                    <p className="section-desc">Commonly used academic and administrative actions</p>
                </div>
                <div className="quick-actions-grid">
                    {quickActions.map((action, i) => {
                        if (action.permission && !hasAuthPermission(action.permission.module, action.permission.action)) return null;
                        return (
                            <div key={i} className="quick-action-card-modern" onClick={() => router.push(action.path)}>
                                <div className="action-icon-wrapper" style={{ boxShadow: `0 8px 16px ${action.color}30` }}>
                                    {React.cloneElement(action.icon as React.ReactElement, { style: { color: action.color, fontSize: 24 } })}
                                </div>
                                <div className="action-info">
                                    <h3>{action.label}</h3>
                                    <p>{action.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <div className="dashboard-main-grid" style={{ marginTop: '40px' }}>
                <div className="card glass-card span-2">
                    <div className="flex-between section-header-horizontal">
                        <div className="title-group">
                            <h3 className="card-title">Recent Audit Activities</h3>
                            <p className="card-subtitle">Latest administrative actions across the system</p>
                        </div>
                        <button className="btn-outline-sm" onClick={() => router.push('/admin?tab=audit')}>Detailed Logs</button>
                    </div>
                    <div className="activity-feed-container custom-scrollbar">
                        <p className="empty-state-text">Synchronizing audit data...</p>
                    </div>
                </div>

                <div className="card glass-card">
                    <div className="flex-between section-header-horizontal">
                        <div className="title-group">
                            <h3 className="card-title">Fee Collection Progress</h3>
                            <p className="card-subtitle">Termly revenue tracking</p>
                        </div>
                        <div className="status-indicator-positive">+12%</div>
                    </div>
                    <div className="chart-placeholder">
                        <div className="revenue-stat">
                            <span className="revenue-label">Total Collected</span>
                            <span className="revenue-value">KES 1.2M</span>
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: '65%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {showAddStudent && <AddStudentModal onClose={() => setShowAddStudent(false)} />}
        </div>
    );
}
