import React, { useState, ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LockIcon from '@mui/icons-material/Lock';
import LogoutIcon from '@mui/icons-material/Logout';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toasts, isSyncing, settings, changeUserPassword } = useSchool();
    const { user, logout } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChangePassword = () => {
        if (!newPassword || newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        if (user) {
            changeUserPassword(user.id, newPassword);
            setShowChangePassword(false);
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <div className="app-layout">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <main className="main-content">
                <header className="top-bar">
                    <div className="top-bar-left">
                        <div className="school-breadcrumb">
                            {settings?.schoolName} • <span style={{ color: 'var(--accent-blue)' }}>Dashboard</span>
                        </div>
                    </div>
                    <div className="top-bar-right">
                        <div className="top-bar-actions">
                            <div className="icon-badge-wrapper">
                                <NotificationsIcon className="top-bar-icon" />
                                <span className="icon-badge"></span>
                            </div>
                        </div>

                        <div className="user-profile-trigger" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                            <div className="user-avatar-wrapper">
                                <div className="user-avatar">
                                    {user?.name.charAt(0) || <AccountCircleIcon />}
                                </div>
                                <div className="status-dot online"></div>
                            </div>
                            <div className="user-info-text">
                                <span className="user-name">{user?.name || 'User'}</span>
                                <span className="user-role">{user?.role || 'Staff'}</span>
                            </div>
                        </div>

                        {showProfileMenu && (
                            <div className="profile-dropdown glass-overlay">
                                <div className="dropdown-header">
                                    <p className="dropdown-user-email">{user?.email}</p>
                                </div>
                                <div className="dropdown-divider"></div>
                                <div className="dropdown-item" onClick={() => { setShowChangePassword(true); setShowProfileMenu(false); }}>
                                    <LockIcon style={{ fontSize: 18 }} /> Security Settings
                                </div>
                                <div className="dropdown-divider"></div>
                                <div className="dropdown-item logout-accent" onClick={logout}>
                                    <LogoutIcon style={{ fontSize: 18 }} /> Sign Out
                                </div>
                            </div>
                        )}
                    </div>
                </header>
                <div className="page-wrapper">
                    {children}
                </div>
            </main>

            {showChangePassword && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: 400 }}>
                        <h3>Change Password</h3>
                        <div className="form-group" style={{ marginTop: 20 }}>
                            <label>New Password</label>
                            <input
                                className="form-control"
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                        </div>
                        <div className="form-group" style={{ marginTop: 15 }}>
                            <label>Confirm Password</label>
                            <input
                                className="form-control"
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                            />
                        </div>
                        {/* The instruction included a line setUserForm(...) here.
                            It's placed here to fulfill the instruction's placement,
                            but commented out as it's a JavaScript statement and cannot
                            be directly rendered in JSX. Its purpose is also unclear in this context. */}
                        {/* setUserForm({ firstName: '', lastName: '', username: '', password: '', name: '', email: '', role: 'Staff', permissions: [] }); */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 25 }}>
                            <button className="btn-outline" onClick={() => setShowChangePassword(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleChangePassword}>Update Password</button>
                        </div>
                    </div>
                </div>
            )}

            {toasts.length > 0 && (
                <div className="toast-container">
                    {toasts.map(toast => (
                        <div key={toast.id} className={`toast ${toast.type}`}>
                            {toast.type === 'success' && <CheckCircleIcon style={{ color: 'var(--accent-green)', fontSize: 20 }} />}
                            {toast.type === 'error' && <ErrorIcon style={{ color: 'var(--accent-red)', fontSize: 20 }} />}
                            {toast.type === 'info' && <InfoIcon style={{ color: 'var(--accent-blue)', fontSize: 20 }} />}
                            <p>{toast.message}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="sync-indicator">
                {isSyncing && <span className="syncing">Syncing...</span>}
            </div>
        </div>
    );
}
