import React, { useState, ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useSchool } from '../../context/SchoolContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toasts, isSyncing } = useSchool();

    return (
        <div className="app-layout">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <main className="main-content">
                {children}
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

            </div>
        </div>
    );
}
