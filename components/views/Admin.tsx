import React, { useState, useTransition } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';

// Icons
import SettingsIcon from '@mui/icons-material/Settings';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import SecurityIcon from '@mui/icons-material/Security';
import PaymentIcon from '@mui/icons-material/Payment';
import HistoryIcon from '@mui/icons-material/History';
import RuleIcon from '@mui/icons-material/Rule';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

// Sub-components
import {
    SchoolSettingsTab,
    UserManagementTab,
    AccessControlTab,
    FeeStructureTab,
    SystemAuditTab,
    TimetableSetupTab
} from '../admin';
import ApprovalCenterPage from './ApprovalCenter';

type AdminTab = 'settings' | 'users' | 'roles' | 'fees' | 'audit' | 'timetable' | 'approvals';

export default function Admin() {
    const { settings, updateSettings, expenses, payrollEntries } = useSchool();
    const { user } = useAuth();

    const [activeTab, setActiveTabRaw] = useState<AdminTab>('settings');
    const [editing, setEditing] = useState(false);
    const [isPending, startTransition] = useTransition();

    const setActiveTab = (tab: AdminTab) => {
        startTransition(() => {
            setActiveTabRaw(tab);
            setEditing(false); // Reset editing mode when switching tabs
        });
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'settings':
                return <SchoolSettingsTab editing={editing} setEditing={setEditing} />;
            case 'users':
                return <UserManagementTab />;
            case 'roles':
                return <AccessControlTab />;
            case 'fees':
                return <FeeStructureTab />;
            case 'audit':
                return <SystemAuditTab />;
            case 'timetable':
                return <TimetableSetupTab />;
            case 'approvals':
                return <ApprovalCenterPage />;
            default:
                return <SchoolSettingsTab editing={editing} setEditing={setEditing} />;
        }
    };

    const pendingApprovalsCount = (expenses?.filter(e => e.status === 'Pending').length || 0) +
        (payrollEntries?.filter(p => p.status === 'Reviewed').length || 0);

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Admin Configuration</h1>
                    <p>Manage system settings, users, fees, and security</p>
                </div>
                <div className="page-header-right">
                    {activeTab === 'settings' && (
                        <button className={`btn-primary ${editing ? 'green' : ''}`} onClick={() => setEditing(!editing)}>
                            {editing ? <><SaveIcon style={{ fontSize: 18 }} /> Save Changes</> : <><EditIcon style={{ fontSize: 18 }} /> Edit Configuration</>}
                        </button>
                    )}
                </div>
            </div>

            <div className="admin-layout-container">
                <div className="admin-nav-container">
                    <div className="admin-horizontal-nav">
                        <nav className="admin-nav-tabs">
                            {[
                                { id: 'settings', label: 'School Settings', icon: <SettingsIcon className="nav-icon" /> },
                                { id: 'timetable', label: 'Timetable Setup', icon: <SchoolIcon className="nav-icon" /> },
                                { id: 'users', label: 'User Management', icon: <GroupIcon className="nav-icon" /> },
                                { id: 'roles', label: 'Access Control', icon: <SecurityIcon className="nav-icon" /> },
                                { id: 'fees', label: 'Fee Structure', icon: <PaymentIcon className="nav-icon" /> },
                                { id: 'audit', label: 'System Audit', icon: <HistoryIcon className="nav-icon" /> },
                            ].map(module => (
                                <button
                                    key={module.id}
                                    className={`admin-nav-tab ${activeTab === module.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(module.id as AdminTab)}
                                >
                                    {module.icon}
                                    <span className="nav-label">{module.label}</span>
                                    {activeTab === module.id && <div className="active-indicator" />}
                                </button>
                            ))}
                            {(user?.role === 'Principal' || user?.role === 'Super Admin') && (
                                <button
                                    className={`admin-nav-tab ${activeTab === 'approvals' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('approvals')}
                                >
                                    <RuleIcon className="nav-icon" />
                                    <span className="nav-label">Approvals</span>
                                    {pendingApprovalsCount > 0 && (
                                        <span className="badge">{pendingApprovalsCount}</span>
                                    )}
                                    {activeTab === 'approvals' && <div className="active-indicator" />}
                                </button>
                            )}
                        </nav>
                        <div className="admin-nav-header-mini">
                            <h4>Admin Panel</h4>
                            {isPending && <div className="spinner-small" style={{ marginLeft: 8 }}></div>}
                        </div>
                    </div>
                </div>

                <div className="admin-main">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
}
