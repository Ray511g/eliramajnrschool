import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
import DescriptionIcon from '@mui/icons-material/Description';
import EmailIcon from '@mui/icons-material/Email';
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
    { path: '/results', icon: <AssessmentIcon />, label: 'Results' },
    { path: '/reports', icon: <DescriptionIcon />, label: 'Reports' },
    { path: '/communication', icon: <EmailIcon />, label: 'Communication' },
    { path: '/admin', icon: <SettingsIcon />, label: 'Admin' },
];

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
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
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
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
