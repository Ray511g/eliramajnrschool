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
import {
    AreaChart, Area, ResponsiveContainer, BarChart, Bar,
    PieChart, Pie, Cell, Tooltip, XAxis, YAxis
} from 'recharts';

function Sparkline({ data, color }: { data: any[], color: string }) {
    return (
        <div style={{ height: 40, width: 80 }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <Area type="monotone" dataKey="val" stroke={color} fill={color} fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export default function Dashboard() {
    const { students, teachers, attendance, exams, serverStatus, settings } = useSchool();
    const { hasPermission: hasAuthPermission, user } = useAuth();
    const router = useRouter();
    const [showAddStudent, setShowAddStudent] = useState(false);

    const stats = [
        {
            label: 'Total Students',
            value: students.length,
            color: '#3b82f6',
            sub: `${students.filter(s => s.status === 'Active').length} Active`,
            spark: Array.from({ length: 6 }, (_, i) => ({ val: 10 + Math.random() * 20 }))
        },
        {
            label: 'Staff Members',
            value: teachers.length,
            color: '#a855f7',
            sub: 'Teaching & Admin',
            spark: Array.from({ length: 6 }, (_, i) => ({ val: 15 + Math.random() * 10 }))
        },
        {
            label: 'Academic Year',
            value: settings.currentYear,
            color: '#10b981',
            sub: `${settings.currentTerm} Active`,
            spark: Array.from({ length: 6 }, (_, i) => ({ val: 5 + Math.random() * 5 }))
        },
        {
            label: 'Exams Active',
            value: exams.filter(e => (e as any).status === 'Active' || (e as any).status === 'Scheduled').length,
            color: '#f59e0b',
            sub: 'Ongoing Assessments',
            spark: Array.from({ length: 6 }, (_, i) => ({ val: 2 + Math.random() * 8 }))
        },
    ];

    const performanceData = [
        { name: 'Jan', val: 65 }, { name: 'Feb', val: 72 }, { name: 'Mar', val: 68 },
        { name: 'Apr', val: 85 }, { name: 'May', val: 82 }, { name: 'Jun', val: 90 }
    ];

    const quickActions = [
        { label: 'Add Student', path: '/students?action=add', color: 'var(--accent-blue)', desc: 'Register a new learner', permission: { module: 'students', action: 'CREATE' } },
        { label: 'Record Fees', path: '/fees?action=record', color: 'var(--accent-green)', desc: 'Process payment', permission: { module: 'fees', action: 'CREATE' } },
        { label: 'Mark Attendance', path: '/attendance', color: 'var(--accent-purple)', desc: 'Daily roll call', permission: { module: 'academic', action: 'EDIT' } },
        { label: 'Enter Results', path: '/results', color: 'var(--accent-orange)', desc: 'CBC Assessment', permission: { module: 'academic', action: 'EDIT' } },
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
                <div className="stats-cluster" style={{ gridColumn: 'span 2' }}>
                    <div className="stats-mini-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        {stats.map((stat, i) => (
                            <div key={i} className="stat-card glass-card" style={{ borderLeft: `4px solid ${stat.color}`, padding: '20px' }}>
                                <div className="stat-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                                    <span className="stat-card-label" style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)' }}>{stat.label}</span>
                                    <Sparkline data={stat.spark} color={stat.color} />
                                </div>
                                <div className="stat-card-value" style={{ fontSize: 28, fontWeight: 800, margin: '8px 0' }}>{stat.value}</div>
                                <div className="stat-card-sub" style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: stat.color }}></span>
                                    {stat.sub}
                                </div>
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
                                <div className="action-info">
                                    <h3 style={{ borderLeft: `3px solid ${action.color}`, paddingLeft: 10 }}>{action.label}</h3>
                                    <p>{action.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <div className="dashboard-main-grid" style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
                <div className="card glass-card" style={{ padding: 24 }}>
                    <div className="section-header-horizontal">
                        <div className="title-group">
                            <h3 className="card-title">Performance Recap</h3>
                            <p className="card-subtitle">Growth trend across all grades</p>
                        </div>
                    </div>
                    <div style={{ height: 250, marginTop: 20 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                                <defs>
                                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip />
                                <Area type="monotone" dataKey="val" stroke="var(--accent-blue)" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card glass-card" style={{ padding: 24 }}>
                    <div className="flex-between section-header-horizontal" style={{ marginBottom: 20 }}>
                        <div className="title-group">
                            <h3 className="card-title">Recent Audit Activities</h3>
                            <p className="card-subtitle">Latest administrative actions</p>
                        </div>
                        <button className="btn-outline-sm" onClick={() => router.push('/admin?tab=audit')}>Logs</button>
                    </div>
                    <div className="activity-feed-container custom-scrollbar" style={{ maxHeight: 250, overflowY: 'auto' }}>
                        <p className="empty-state-text">Synchronizing audit data...</p>
                    </div>
                </div>
            </div>

            {showAddStudent && <AddStudentModal onClose={() => setShowAddStudent(false)} />}
        </div>
    );
}
