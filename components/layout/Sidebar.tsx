import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import EventNoteIcon from '@mui/icons-material/EventNote';
import GradeIcon from '@mui/icons-material/Grade';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PaymentIcon from '@mui/icons-material/Payment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DescriptionIcon from '@mui/icons-material/Description';
import EmailIcon from '@mui/icons-material/Email';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

export const PERMISSIONS = [
    { code: 'MANAGE_STUDENTS', label: 'Students Module' },
    { code: 'MANAGE_TEACHERS', label: 'Teachers Module' },
    { code: 'MANAGE_FEES', label: 'Finance/Fees' },
    { code: 'MANAGE_ATTENDANCE', label: 'Attendance' },
    { code: 'MANAGE_EXAMS', label: 'Exams/Grades' },
    { code: 'MANAGE_REPORTS', label: 'Reports' },
    { code: 'MANAGE_COMMUNICATION', label: 'Communication' },
    { code: 'MANAGE_TIMETABLE', label: 'Timetable' },
    { code: 'MANAGE_ADMIN', label: 'Admin Settings' },
];

const navItems = [
    { path: '/', icon: <DashboardIcon />, label: 'Dashboard' },
    { path: '/students', icon: <PeopleIcon />, label: 'Students', permission: 'MANAGE_STUDENTS' },
    { path: '/teachers', icon: <SchoolIcon />, label: 'Teachers', permission: 'MANAGE_TEACHERS' },
    { path: '/attendance', icon: <EventNoteIcon />, label: 'Attendance', permission: 'MANAGE_ATTENDANCE' },
    { path: '/grades', icon: <GradeIcon />, label: 'Grades', permission: 'MANAGE_EXAMS' },
    { path: '/exams', icon: <AssignmentIcon />, label: 'Exams', permission: 'MANAGE_EXAMS' },
    { path: '/timetable', icon: <ScheduleIcon />, label: 'Timetable', permission: 'MANAGE_TIMETABLE' },
    { path: '/fees', icon: <PaymentIcon />, label: 'Fees', permission: 'MANAGE_FEES' },
    { path: '/results', icon: <AssessmentIcon />, label: 'Results', permission: 'MANAGE_REPORTS' },
    { path: '/reports', icon: <DescriptionIcon />, label: 'Reports', permission: 'MANAGE_REPORTS' },
    { path: '/communication', icon: <EmailIcon />, label: 'Communication', permission: 'MANAGE_COMMUNICATION' },
    { path: '/admin', icon: <SettingsIcon />, label: 'Admin', permission: 'MANAGE_ADMIN' },
];

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const { logout, user } = useAuth();
    const { serverStatus, settings } = useSchool();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const isActive = (path: string) => {
        if (path === '/') return router.pathname === '/';
        return router.pathname.startsWith(path);
    };

    // Robust RBAC filtering
    const filteredNavItems = navItems.filter(item => {
        // Dashboard is always visible to everyone
        if (item.path === '/') return true;

        const role = user?.role;
        if (!role) return false;

        const upperRole = role.toUpperCase();

        // Force full access for any Admin role (case-insensitive)
        if (upperRole.includes('ADMIN')) return true;

        // Specific rights/permissions
        if (item.permission && user?.permissions?.includes(item.permission)) return true;

        // Role-based defaults (if no specific permissions defined)
        if (upperRole === 'TEACHER') {
            return ['/students', '/attendance', '/grades', '/exams', '/timetable', '/results', '/reports'].includes(item.path);
        }

        if (upperRole === 'STAFF') {
            return ['/students', '/fees', '/communication'].includes(item.path);
        }

        return false;
    });

    return (
        <>
            <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Sidebar">
                {isOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            {isOpen && <div className="sidebar-overlay open" onClick={() => setIsOpen(false)} />}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        {settings?.logo ? (
                            <img src={settings.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
                        ) : 'E'}
                    </div>
                    <div className="sidebar-brand">
                        <h2>{settings?.schoolName || 'ELIRAMA'}</h2>
                        <p>School Management</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {filteredNavItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="logout-section">
                    <div style={{ padding: '0 24px 10px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>v1.3.2 (RBAC+)</span>
                        <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: serverStatus === 'connected' ? '#00c853' : serverStatus === 'checking' ? '#ffb300' : '#ff3d00',
                            boxShadow: serverStatus === 'connected' ? '0 0 5px #00c853' : 'none',
                            transition: 'background-color 0.3s'
                        }} title={serverStatus === 'connected' ? 'Online' : 'Offline (Local Mode)'} />
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogoutIcon />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
