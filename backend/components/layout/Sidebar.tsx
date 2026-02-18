import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import EventNoteIcon from '@mui/icons-material/EventNote';
import GradeIcon from '@mui/icons-material/Grade';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PaymentIcon from '@mui/icons-material/Payment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const navItems = [
    { path: '/', icon: <DashboardIcon />, label: 'Dashboard' },
    { path: '/students', icon: <PeopleIcon />, label: 'Students' },
    { path: '/teachers', icon: <SchoolIcon />, label: 'Teachers' },
    { path: '/attendance', icon: <EventNoteIcon />, label: 'Attendance' },
    { path: '/grades', icon: <GradeIcon />, label: 'Grades' },
    { path: '/exams', icon: <AssignmentIcon />, label: 'Exams' },
    { path: '/timetable', icon: <ScheduleIcon />, label: 'Timetable' },
    { path: '/fees', icon: <PaymentIcon />, label: 'Fees' },
    { path: '/reports', icon: <AssessmentIcon />, label: 'Reports' },
    { path: '/admin', icon: <SettingsIcon />, label: 'Admin' },
];

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const isActive = (path: string) => {
        if (path === '/') return router.pathname === '/';
        return router.pathname.startsWith(path);
    };

    return (
        <>
            <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            {isOpen && <div className="sidebar-overlay open" onClick={() => setIsOpen(false)} />}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">E</div>
                    <div className="sidebar-brand">
                        <h2>ELIRAMA</h2>
                        <p>School Management</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
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

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogoutIcon />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
