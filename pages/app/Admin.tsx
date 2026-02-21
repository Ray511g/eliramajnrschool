import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import SecurityIcon from '@mui/icons-material/Security';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import * as XLSX from 'xlsx';
import { PERMISSIONS } from '../../components/layout/Sidebar';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function Admin() {
    const {
        settings, updateSettings, uploadStudents, uploadTeachers, uploadExams,
        systemUsers, addSystemUser, updateSystemUser, deleteSystemUser, resetUserPassword, clearAllData,
        feeStructures, addFeeStructure, updateFeeStructure, deleteFeeStructure, applyFeeStructure, auditLogs, fetchAuditLogs
    } = useSchool();
    const { user } = useAuth();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(settings);
    const [activeTab, setActiveTab] = useState<'settings' | 'users' | 'fees' | 'audit'>('settings');

    // Fee Structure State
    const [feeForm, setFeeForm] = useState({ grade: 'Grade 1', name: '', amount: 0, term: 'Term 1' });
    const [editingFeeItem, setEditingFeeItem] = useState<string | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);

    // User Management State
    const [showAddUser, setShowAddUser] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [userForm, setUserForm] = useState({
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        name: '',
        email: '',
        role: 'Staff' as const,
        permissions: [] as string[]
    });

    useEffect(() => {
        if (activeTab === 'audit') fetchAuditLogs();
    }, [activeTab]);

    const handleAddUser = () => {
        if (!userForm.firstName || !userForm.lastName || !userForm.username || !userForm.email) return;

        const fullName = `${userForm.firstName} ${userForm.lastName}`;
        const submissionData = { ...userForm, name: fullName };

        if (editingUser) {
            updateSystemUser(editingUser.id, userForm);
        } else {
            addSystemUser(userForm);
        }

        setUserForm({ firstName: '', lastName: '', username: '', password: '', name: '', email: '', role: 'Staff', permissions: [] });
        setEditingUser(null);
        setShowAddUser(false);
    };

    const startEditUser = (u: any) => {
        setEditingUser(u);
        setUserForm({
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            username: u.username || '',
            password: u.password || '',
            name: u.name,
            email: u.email,
            role: u.role,
            permissions: u.permissions || []
        });
        setShowAddUser(true);
    };

    const handleDeleteUser = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete user ${name}? This action cannot be undone.`)) {
            deleteSystemUser(id);
        }
    };

    const handleAddFeeItem = () => {
        if (!feeForm.name || feeForm.amount <= 0) return;
        if (editingFeeItem) {
            updateFeeStructure(editingFeeItem, feeForm);
            setEditingFeeItem(null);
        } else {
            addFeeStructure(feeForm);
        }
        setFeeForm({ ...feeForm, name: '', amount: 0 });
    };

    const startEditFeeItem = (item: any) => {
        setEditingFeeItem(item.id);
        setFeeForm({
            grade: item.grade,
            name: item.name,
            amount: item.amount,
            term: item.term
        });
    };

    const handleApplyFees = async (grade?: string) => {
        if (confirm(`Are you sure you want to PUBLISH ${grade ? `fees for ${grade}` : 'all fees'}? This will update students' total fees and current balances for the selected grade(s).`)) {
            setIsPublishing(true);
            try {
                await applyFeeStructure(grade);
            } finally {
                setIsPublishing(false);
            }
        }
    };

    // Group fee structures by grade
    const groupedFees = feeStructures.reduce((acc: any, item) => {
        if (!acc[item.grade]) acc[item.grade] = [];
        acc[item.grade].push(item);
        return acc;
    }, {});

    const sortedGrades = Object.keys(groupedFees).sort();

    const downloadTemplate = (type: 'students' | 'teachers' | 'exams') => {
        let headers: string[] = [];
        if (type === 'students') headers = ['Admission No', 'First Name', 'Last Name', 'Gender', 'Grade', 'DOB', 'Parent Name', 'Phone', 'Email', 'Address', 'Total Fees'];
        if (type === 'teachers') headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Qualification', 'Subjects', 'Grades'];
        if (type === 'exams') headers = ['Exam Name', 'Subject', 'Grade', 'Date', 'Term', 'Type', 'Total Marks'];

        const ws = XLSX.utils.aoa_to_sheet([headers]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, `${type}_template.xlsx`);
    };

    const handleSave = () => {
        updateSettings(form);
        setEditing(false);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Admin Configuration</h1>
                    <p>Manage system settings, users, fees, and security</p>
                </div>
                <div className="page-header-right">
                    {!editing && activeTab === 'settings' ? (
                        <button className="btn-primary" onClick={() => setEditing(true)}>
                            <EditIcon style={{ fontSize: 18 }} /> Edit Settings
                        </button>
                    ) : (
                        editing && activeTab === 'settings' && (
                            <button className="btn-primary green" onClick={handleSave}>
                                <SaveIcon style={{ fontSize: 18 }} /> Save Changes
                            </button>
                        )
                    )}
                </div>
            </div>

            <div className="tabs" style={{ display: 'flex', gap: 20, borderBottom: '1px solid var(--border-color)', marginBottom: 20 }}>
                <div className={`tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')} style={{ padding: '10px 0', cursor: 'pointer', borderBottom: activeTab === 'settings' ? '2px solid var(--primary-color)' : 'none', fontWeight: 500 }}>Settings</div>
                <div className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')} style={{ padding: '10px 0', cursor: 'pointer', borderBottom: activeTab === 'users' ? '2px solid var(--primary-color)' : 'none', fontWeight: 500 }}>User Management</div>
                <div className={`tab ${activeTab === 'fees' ? 'active' : ''}`} onClick={() => setActiveTab('fees')} style={{ padding: '10px 0', cursor: 'pointer', borderBottom: activeTab === 'fees' ? '2px solid var(--primary-color)' : 'none', fontWeight: 500 }}>Fee Structure</div>
                <div className={`tab ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')} style={{ padding: '10px 0', cursor: 'pointer', borderBottom: activeTab === 'audit' ? '2px solid var(--primary-color)' : 'none', fontWeight: 500 }}>Audit Trail</div>
            </div>

            <div className="admin-grid">
                {activeTab === 'settings' && (
                    <>
                        <div className="admin-section">
                            <h3><SchoolIcon style={{ fontSize: 22 }} /> School Information</h3>
                            {editing ? (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="school-logo">School Logo</label>
                                        <div style={{ display: 'flex', gap: 15, alignItems: 'center', marginTop: 8 }}>
                                            {form.logo && (
                                                <img src={form.logo} style={{ height: 50, borderRadius: 4 }} alt="Logo Preview" />
                                            )}
                                            <input
                                                id="school-logo"
                                                type="file"
                                                accept="image/*"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setForm({ ...form, logo: reader.result as string });
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="school-name">School Name</label>
                                        <input id="school-name" className="form-control" value={form.schoolName} onChange={e => setForm({ ...form, schoolName: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="school-motto">Motto</label>
                                        <input id="school-motto" className="form-control" value={form.motto} onChange={e => setForm({ ...form, motto: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="school-phone">Phone</label>
                                        <input id="school-phone" className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="school-email">Email</label>
                                        <input id="school-email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="school-address">Address</label>
                                        <input id="school-address" className="form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="school-pobox">P.O. Box</label>
                                        <input id="school-pobox" className="form-control" value={form.poBox || ''} onChange={e => setForm({ ...form, poBox: e.target.value })} placeholder="e.g. P.O. Box 123-00100" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="school-telephone">Telephone Number</label>
                                        <input id="school-telephone" className="form-control" value={form.telephone || ''} onChange={e => setForm({ ...form, telephone: e.target.value })} placeholder="e.g. +254 20 1234567" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="paybill-number">Lipa na M-Pesa Paybill</label>
                                        <input id="paybill-number" className="form-control" value={form.paybillNumber} onChange={e => setForm({ ...form, paybillNumber: e.target.value })} placeholder="e.g. 123456" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="headteacher-signature">Digital Signature (Headteacher)</label>
                                        <div style={{ display: 'flex', gap: 15, alignItems: 'center', marginTop: 8 }}>
                                            {form.headteacherSignature && (
                                                <img src={form.headteacherSignature} style={{ height: 50, border: '1px solid var(--border-color)', borderRadius: 4 }} alt="Headteacher Signature Preview" />
                                            )}
                                            <input
                                                id="headteacher-signature"
                                                type="file"
                                                accept="image/*"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setForm({ ...form, headteacherSignature: reader.result as string });
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="finance-signature">Digital Signature / Stamp (Finance)</label>
                                        <div style={{ display: 'flex', gap: 15, alignItems: 'center', marginTop: 8 }}>
                                            {form.financeSignature && (
                                                <img src={form.financeSignature} style={{ height: 50, border: '1px solid var(--border-color)', borderRadius: 4 }} alt="Finance Signature Preview" />
                                            )}
                                            <input
                                                id="finance-signature"
                                                type="file"
                                                accept="image/*"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setForm({ ...form, financeSignature: reader.result as string });
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="setting-row">
                                        <span className="setting-label">Logo</span>
                                        <span className="setting-value">
                                            {settings.logo ? <img src={settings.logo} style={{ height: 40 }} alt="School Logo" /> : 'Not Set'}
                                        </span>
                                    </div>
                                    <div className="setting-row"><span className="setting-label">School Name</span><span className="setting-value">{settings.schoolName}</span></div>
                                    <div className="setting-row"><span className="setting-label">Motto</span><span className="setting-value">{settings.motto}</span></div>
                                    <div className="setting-row"><span className="setting-label">Phone</span><span className="setting-value">{settings.phone}</span></div>
                                    <div className="setting-row"><span className="setting-label">Email</span><span className="setting-value">{settings.email}</span></div>
                                    <div className="setting-row"><span className="setting-label">Address</span><span className="setting-value">{settings.address}</span></div>
                                    <div className="setting-row"><span className="setting-label">P.O. Box</span><span className="setting-value">{settings.poBox || 'Not Set'}</span></div>
                                    <div className="setting-row"><span className="setting-label">Telephone</span><span className="setting-value">{settings.telephone || 'Not Set'}</span></div>
                                    <div className="setting-row"><span className="setting-label">Paybill Number</span><span className="setting-value">{settings.paybillNumber || 'Not Set'}</span></div>
                                    <div className="setting-row">
                                        <span className="setting-label">Headteacher Signature</span>
                                        <span className="setting-value">
                                            {settings.headteacherSignature ? (
                                                <img src={settings.headteacherSignature} style={{ height: 30, verticalAlign: 'middle' }} alt="Headteacher Signature" />
                                            ) : <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Not Set</span>}
                                        </span>
                                    </div>
                                    <div className="setting-row">
                                        <span className="setting-label">Finance Signature / Stamp</span>
                                        <span className="setting-value">
                                            {settings.financeSignature ? (
                                                <img src={settings.financeSignature} style={{ height: 30, verticalAlign: 'middle' }} alt="Finance Signature" />
                                            ) : <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Not Set</span>}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="admin-section">
                            <h3><SettingsIcon style={{ fontSize: 22 }} /> Academic Settings</h3>
                            {editing ? (
                                <>
                                    <div className="form-group" style={{ marginBottom: 15 }}>
                                        <label htmlFor="current-term">Current Term</label>
                                        <select id="current-term" title="Select Current Term" className="form-control" value={form.currentTerm} onChange={e => setForm({ ...form, currentTerm: e.target.value })}>
                                            <option>Term 1</option>
                                            <option>Term 2</option>
                                            <option>Term 3</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 20 }}>
                                        <label htmlFor="current-year">Current Year</label>
                                        <input id="current-year" className="form-control" type="number" value={form.currentYear} onChange={e => setForm({ ...form, currentYear: parseInt(e.target.value) })} />
                                    </div>

                                    <div style={{ marginTop: 20, borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
                                        <h4 style={{ marginBottom: 15 }}>Timetable Slots & Breaks</h4>
                                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 15 }}>
                                            Configure the time intervals for your school. You can define lessons, breaks, lunch times, or other school activities.
                                        </p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {(form.timeSlots || []).map((slot: any, idx: number) => (
                                                <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--bg-card)', padding: 10, borderRadius: 8 }}>
                                                    <div style={{ flex: 1.5 }}>
                                                        <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>Time Interval</label>
                                                        <input
                                                            className="form-control"
                                                            value={slot.label}
                                                            placeholder="e.g. 8:00 - 8:40"
                                                            onChange={e => {
                                                                const newSlots = [...(form.timeSlots || [])];
                                                                newSlots[idx].label = e.target.value;
                                                                setForm({ ...form, timeSlots: newSlots });
                                                            }}
                                                        />
                                                    </div>
                                                    <div style={{ flex: 1.5 }}>
                                                        <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>Label/Name (Optional)</label>
                                                        <input
                                                            className="form-control"
                                                            value={slot.name || ''}
                                                            placeholder="e.g. Mathematics"
                                                            onChange={e => {
                                                                const newSlots = [...(form.timeSlots || [])];
                                                                newSlots[idx].name = e.target.value;
                                                                setForm({ ...form, timeSlots: newSlots });
                                                            }}
                                                        />
                                                    </div>
                                                    <div style={{ flex: 1.2 }}>
                                                        <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>Slot Type</label>
                                                        <select
                                                            title="Select Slot Type"
                                                            className="form-control"
                                                            value={slot.type}
                                                            onChange={e => {
                                                                const newSlots = [...(form.timeSlots || [])];
                                                                newSlots[idx].type = e.target.value as any;
                                                                setForm({ ...form, timeSlots: newSlots });
                                                            }}
                                                        >
                                                            <option value="Lesson">Lesson</option>
                                                            <option value="Break">Break</option>
                                                            <option value="Lunch">Lunch</option>
                                                            <option value="Other">Other (e.g. Assembly)</option>
                                                        </select>
                                                    </div>
                                                    <button
                                                        className="table-action-btn danger"
                                                        title="Remove Slot"
                                                        style={{ marginTop: 18 }}
                                                        onClick={() => {
                                                            const newSlots = (form.timeSlots || []).filter((_, i) => i !== idx);
                                                            setForm({ ...form, timeSlots: newSlots });
                                                        }}
                                                    >
                                                        <DeleteIcon style={{ fontSize: 18 }} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                className="btn-outline"
                                                style={{ marginTop: 10, alignSelf: 'flex-start' }}
                                                onClick={() => {
                                                    const newSlots = [...(form.timeSlots || []), { id: Date.now().toString(), label: '', type: 'Lesson' as any }];
                                                    setForm({ ...form, timeSlots: newSlots });
                                                }}
                                            >
                                                + Add New Time Slot
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="setting-row"><span className="setting-label">Current Term</span><span className="setting-value">{settings.currentTerm}</span></div>
                                    <div className="setting-row"><span className="setting-label">Current Year</span><span className="setting-value">{settings.currentYear}</span></div>
                                    <div className="setting-row">
                                        <span className="setting-label">Timetable Slots</span>
                                        <span className="setting-value">
                                            {settings.timeSlots?.length || 0} Slots configured
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="admin-section" style={{ gridColumn: 'span 2' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <h3 style={{ margin: 0 }}><SchoolIcon style={{ fontSize: 22 }} /> Bulk Data Components</h3>
                            </div>
                            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', padding: 0 }}>
                                <div className="card" style={{ background: 'var(--bg-surface)' }}>
                                    <h4 style={{ margin: '0 0 12px' }}>Students</h4>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <input type="file" id="upload-students" hidden accept=".xlsx, .xls, .csv" onChange={e => e.target.files?.[0] && uploadStudents(e.target.files[0])} />
                                        <button className="btn-primary" style={{ flex: 1 }} onClick={() => document.getElementById('upload-students')?.click()}>Upload File</button>
                                        <button className="btn-outline" onClick={() => downloadTemplate('students')}>Template</button>
                                    </div>
                                </div>
                                <div className="card" style={{ background: 'var(--bg-surface)' }}>
                                    <h4 style={{ margin: '0 0 12px' }}>Teachers</h4>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <input type="file" id="upload-teachers" hidden accept=".xlsx, .xls, .csv" onChange={e => e.target.files?.[0] && uploadTeachers(e.target.files[0])} />
                                        <button className="btn-primary" style={{ flex: 1 }} onClick={() => document.getElementById('upload-teachers')?.click()}>Upload File</button>
                                        <button className="btn-outline" onClick={() => downloadTemplate('teachers')}>Template</button>
                                    </div>
                                </div>
                                <div className="card" style={{ background: 'var(--bg-surface)' }}>
                                    <h4 style={{ margin: '0 0 12px' }}>Exams</h4>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <input type="file" id="upload-exams" hidden accept=".xlsx, .xls, .csv" onChange={e => e.target.files?.[0] && uploadExams(e.target.files[0])} />
                                        <button className="btn-primary" style={{ flex: 1 }} onClick={() => document.getElementById('upload-exams')?.click()}>Upload File</button>
                                        <button className="btn-outline" onClick={() => downloadTemplate('exams')}>Template</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="admin-section" style={{ gridColumn: 'span 2', background: '#fff5f5' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: '#c53030' }}><SecurityIcon style={{ fontSize: 22 }} /> Danger Zone</h3>
                                    <p style={{ margin: '4px 0 0', fontSize: 13, color: '#742a2a' }}>Caution: These actions are permanent and cannot be undone.</p>
                                </div>
                                <button className="btn-primary" style={{ background: '#c53030', borderColor: '#c53030' }} onClick={() => { if (window.confirm('CRITICAL WARNING: Clear everything?')) clearAllData(); }}>
                                    Clear All System Data
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'users' && (
                    <div className="admin-section" style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ margin: 0 }}><PersonIcon style={{ fontSize: 22 }} /> User Management</h3>
                            {selectedUserId && (
                                <button className="btn-primary" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }} onClick={() => {
                                    const u = systemUsers.find(u => u.id === selectedUserId);
                                    if (u) startEditUser(u);
                                }}>
                                    View/Assign Roles
                                </button>
                            )}
                        </div>

                        {/* Toolbar - Screenshot Style */}
                        <div className="user-toolbar">
                            <button className="toolbar-btn" onClick={() => {
                                setShowAddUser(!showAddUser);
                                if (!showAddUser) {
                                    setUserForm({ firstName: '', lastName: '', username: '', password: '', name: '', email: '', role: 'Staff', permissions: [] });
                                }
                            }}>
                                <AddIcon style={{ fontSize: 18, color: '#27ae60' }} /> Add
                            </button>
                            <button
                                className={`toolbar-btn ${!selectedUserId ? 'disabled' : ''}`}
                                disabled={!selectedUserId}
                                onClick={() => {
                                    const u = systemUsers.find(u => u.id === selectedUserId);
                                    if (u) startEditUser(u);
                                }}
                            >
                                <EditIcon style={{ fontSize: 18, color: '#2980b9' }} /> Edit
                            </button>
                            <button
                                className={`toolbar-btn ${!selectedUserId ? 'disabled' : ''}`}
                                disabled={!selectedUserId}
                                onClick={() => {
                                    const u = systemUsers.find(u => u.id === selectedUserId);
                                    if (u) handleDeleteUser(u.id, u.name);
                                }}
                            >
                                <DeleteIcon style={{ fontSize: 18, color: '#e74c3c' }} /> Delete
                            </button>
                            <div className="toolbar-divider"></div>
                            <div className="search-input-wrapper" style={{ maxWidth: 300 }}>
                                <SearchIcon className="search-icon" />
                                <input
                                    className="search-input"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {showAddUser && (
                            <div className="card" style={{ background: 'var(--bg-surface)', marginBottom: 0, borderRadius: 0, borderTop: 'none', border: '1px solid var(--border-color)' }}>
                                <h4 style={{ margin: '0 0 16px' }}>{editingUser ? 'Edit User' : 'Add New System User'}</h4>
                                <div className="form-row">
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>First Name</label>
                                        <input className="form-control" value={userForm.firstName} onChange={e => setUserForm({ ...userForm, firstName: e.target.value })} placeholder="ANN" />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Last Name</label>
                                        <input className="form-control" value={userForm.lastName} onChange={e => setUserForm({ ...userForm, lastName: e.target.value })} placeholder="NKIROTE" />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Username</label>
                                        <input className="form-control" value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} placeholder="ANKIROTE" />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>System Password</label>
                                        <input className="form-control" type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} placeholder="••••••••" />
                                    </div>
                                </div>
                                <div className="form-row" style={{ marginTop: 15 }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Email Address</label>
                                        <input className="form-control" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} placeholder="ann@spa-limited.com" />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Role</label>
                                        <select title="Select User Role" className="form-control" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value as any })}>
                                            <option value="Admin">Admin</option>
                                            <option value="Teacher">Teacher</option>
                                            <option value="Staff">Staff</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginTop: 15 }}>
                                    <label style={{ fontWeight: 600, display: 'block', marginBottom: 10 }}>Permissions & Access Rights</label>
                                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                        {PERMISSIONS.map(perm => (
                                            <label key={perm.code} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                fontSize: 12,
                                                cursor: 'pointer',
                                                padding: '6px 12px',
                                                background: userForm.permissions.includes(perm.code) ? 'rgba(52, 152, 219, 0.1)' : 'var(--bg-body)',
                                                borderRadius: '4px',
                                                border: userForm.permissions.includes(perm.code) ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={userForm.permissions.includes(perm.code)}
                                                    onChange={e => {
                                                        if (e.target.checked) setUserForm({ ...userForm, permissions: [...userForm.permissions, perm.code] });
                                                        else setUserForm({ ...userForm, permissions: userForm.permissions.filter(p => p !== perm.code) });
                                                    }}
                                                />
                                                {perm.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button className="btn-outline" onClick={() => setShowAddUser(false)}>Cancel</button>
                                        <button className="btn-primary green" onClick={handleAddUser}>{editingUser ? 'Save Changes' : 'Create User'}</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="user-management-table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '18%' }}>First Name</th>
                                        <th style={{ width: '18%' }}>Last Name</th>
                                        <th style={{ width: '18%' }}>Username</th>
                                        <th style={{ width: '25%' }}>Email</th>
                                        <th style={{ width: '21%' }}>User updated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {systemUsers.filter(u =>
                                        u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        u.email.toLowerCase().includes(searchTerm.toLowerCase())
                                    ).map(u => (
                                        <tr
                                            key={u.id}
                                            className={selectedUserId === u.id ? 'selected-row' : ''}
                                            onClick={() => setSelectedUserId(u.id === selectedUserId ? null : u.id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td style={{ fontWeight: 600, textTransform: 'uppercase' }}>{u.firstName || u.name.split(' ')[0]}</td>
                                            <td style={{ fontWeight: 600, textTransform: 'uppercase' }}>{u.lastName || u.name.split(' ').slice(1).join(' ')}</td>
                                            <td style={{ color: selectedUserId === u.id ? 'white' : 'var(--accent-blue)', textTransform: 'uppercase' }}>{u.username}</td>
                                            <td>{u.email}</td>
                                            <td>{u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : '01/01/2026'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'fees' && (
                    <div className="admin-section" style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div>
                                <h3 style={{ margin: 0 }}>Fee Structure Breakdown</h3>
                                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                                    Changes are saved as <strong>drafts</strong>. Use the "Publish" button under each grade to apply them.
                                </p>
                            </div>
                        </div>
                        <div className="card" style={{ background: 'var(--bg-surface)', marginBottom: 20 }}>
                            <h4 style={{ margin: '0 0 10px' }}>Add Fee Item</h4>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Grade</label>
                                    <select
                                        title="Select Grade for Fee Item"
                                        className="form-control"
                                        value={feeForm.grade}
                                        onChange={e => setFeeForm({ ...feeForm, grade: e.target.value })}
                                    >
                                        {['Play Group', 'PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].map(g => <option key={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Item Name (e.g. Tuition, Lunch)</label>
                                    <input className="form-control" value={feeForm.name} onChange={e => setFeeForm({ ...feeForm, name: e.target.value })} placeholder="e.g. Transport" />
                                </div>
                                <div className="form-group" style={{ width: 120 }}>
                                    <label>Amount (KSh)</label>
                                    <input className="form-control" type="number" value={feeForm.amount} onChange={e => setFeeForm({ ...feeForm, amount: parseInt(e.target.value) })} />
                                </div>
                                <div className="form-group">
                                    <label>Term</label>
                                    <select
                                        title="Select Term for Fee Item"
                                        className="form-control"
                                        value={feeForm.term}
                                        onChange={e => setFeeForm({ ...feeForm, term: e.target.value })}
                                    >
                                        <option>Term 1</option>
                                        <option>Term 2</option>
                                        <option>Term 3</option>
                                    </select>
                                </div>
                                <div style={{ alignSelf: 'flex-end', paddingBottom: 10, display: 'flex', gap: 10 }}>
                                    {editingFeeItem && (
                                        <button className="btn-outline" onClick={() => { setEditingFeeItem(null); setFeeForm({ ...feeForm, name: '', amount: 0 }); }}>Cancel</button>
                                    )}
                                    <button className="btn-primary" onClick={handleAddFeeItem}>
                                        {editingFeeItem ? 'Update Item' : 'Add Item'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {sortedGrades.map(grade => {
                            const gradeItems = groupedFees[grade];
                            const total = gradeItems.reduce((sum: number, item: any) => sum + item.amount, 0);
                            return (
                                <div key={grade} className="card" style={{ marginBottom: 20, background: 'var(--bg-surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                        <h4 style={{ margin: 0 }}>{grade} Structure</h4>
                                        <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                                            <span style={{ fontWeight: 'bold', color: 'var(--accent-blue)' }}>Total: KES {total.toLocaleString()}</span>
                                            <button
                                                className="btn-primary"
                                                style={{ fontSize: 12, padding: '6px 12px' }}
                                                onClick={() => handleApplyFees(grade as string)}
                                                disabled={isPublishing}
                                            >
                                                Publish {grade} Fees
                                            </button>
                                        </div>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Term</th>
                                                    <th>Item Name</th>
                                                    <th>Amount</th>
                                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {gradeItems.map((item: any) => (
                                                    <tr key={item.id}>
                                                        <td>{item.term}</td>
                                                        <td>{item.name}</td>
                                                        <td>KES {item.amount.toLocaleString()}</td>
                                                        <td style={{ textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                            <button className="table-action-btn primary" onClick={() => startEditFeeItem(item)}><EditIcon style={{ fontSize: 16 }} /></button>
                                                            <button className="table-action-btn danger" onClick={() => deleteFeeStructure(item.id)}><DeleteIcon style={{ fontSize: 16 }} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}

                        {feeStructures.length === 0 && (
                            <div className="empty-state">
                                <p>No fee items added yet. Use the form above to build the structure.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div className="admin-section" style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ margin: 0 }}><SecurityIcon style={{ fontSize: 22 }} /> System Audit Trail</h3>
                            <button className="btn-outline" onClick={fetchAuditLogs}>Refresh Logs</button>
                        </div>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Timestamp</th>
                                        <th>User</th>
                                        <th>Action</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditLogs.length > 0 ? auditLogs.map(log => (
                                        <tr key={log.id}>
                                            <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{new Date(log.createdAt).toLocaleString()}</td>
                                            <td style={{ fontWeight: 500 }}>{log.userName}</td>
                                            <td><span className="badge blue">{log.action}</span></td>
                                            <td style={{ fontSize: 13 }}>{log.details}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20, color: 'var(--text-secondary)' }}>No audit logs found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
