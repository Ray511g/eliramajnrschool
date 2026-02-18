import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useSchool } from '../../context/SchoolContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toasts, isSyncing } = useSchool();

    return (
        <div className="app-layout">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <main className="main-content">
                <Outlet />
            </main>

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
                <div className={`sync-dot ${isSyncing ? 'syncing' : 'live'}`} />
                <span>{isSyncing ? 'Updating...' : 'Live Sync'}</span>
            </div>
        </div>
    );
}
