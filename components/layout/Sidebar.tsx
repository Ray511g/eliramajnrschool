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

const navItems = [
    { path: '/', icon: <DashboardIcon />, label: 'Dashboard' },
    { path: '/students', icon: <PeopleIcon />, label: 'Students', permission: 'MANAGE_STUDENTS' },
    { path: '/teachers', icon: <SchoolIcon />, label: 'Teachers', permission: 'MANAGE_TEACHERS' },
    { path: '/attendance', icon: <EventNoteIcon />, label: 'Attendance' },
    { path: '/grades', icon: <GradeIcon />, label: 'Grades' },
    { path: '/exams', icon: <AssignmentIcon />, label: 'Exams', permission: 'MANAGE_EXAMS' },
    { path: '/timetable', icon: <ScheduleIcon />, label: 'Timetable' },
    { path: '/fees', icon: <PaymentIcon />, label: 'Fees', permission: 'MANAGE_FEES' },
    { path: '/results', icon: <AssessmentIcon />, label: 'Results' },
    { path: '/reports', icon: <DescriptionIcon />, label: 'Reports', permission: 'VIEW_REPORTS' },
    { path: '/communication', icon: <EmailIcon />, label: 'Communication' },
    { path: '/admin', icon: <SettingsIcon />, label: 'Admin' },
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

    // Filter nav items based on RBAC (Role + Permissions)
    const filteredNavItems = navItems.filter(item => {
        // Super Admin & Admin see everything
        if (user?.role === 'Super Admin' || user?.role === 'Admin') return true;

        // Check explicit permissions if set
        if (item.permission && user?.permissions?.includes(item.permission)) {
            return true;
        }

        // Role-based defaults (if no explicit permission check required or if permission check failed)
        if (user?.role === 'Teacher') {
            return ['/', '/students', '/attendance', '/grades', '/exams', '/timetable', '/results', '/reports'].includes(item.path);
        }

        if (user?.role === 'Staff') {
            return ['/', '/students', '/fees', '/communication'].includes(item.path);
        }

        return false;
    });

    return (
        <>
            <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            {isOpen && <div className="sidebar-overlay open" onClick={() => setIsOpen(false)} />}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        {settings.logo ? (
                            <img src={settings.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
                        ) : 'E'}
                    </div>
                    <div className="sidebar-brand">
                        <h2>{settings.schoolName || 'ELIRAMA'}</h2>
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
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="logout-section">
                    <div style={{ padding: '0 24px 10px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>v1.3.0 (RBAC)</span>
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
