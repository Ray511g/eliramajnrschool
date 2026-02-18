import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import SecurityIcon from '@mui/icons-material/Security';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import * as XLSX from 'xlsx';

export default function Admin() {
    const { settings, updateSettings, uploadStudents, uploadTeachers, uploadExams, systemUsers, addSystemUser, resetUserPassword, clearAllData } = useSchool();
    const { user } = useAuth();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(settings);

    // User Management State
    const [showAddUser, setShowAddUser] = useState(false);
    const [userForm, setUserForm] = useState({ name: '', email: '', role: 'Staff' as const });

    const handleAddUser = () => {
        if (!userForm.name || !userForm.email) return;
        addSystemUser(userForm);
        setUserForm({ name: '', email: '', role: 'Staff' });
        setShowAddUser(false);
    };

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
                    <h1>Admin Settings</h1>
                    <p>System configuration and management</p>
                </div>
                <div className="page-header-right">
                    {!editing ? (
                        <button className="btn-primary" onClick={() => setEditing(true)}>
                            <EditIcon style={{ fontSize: 18 }} /> Edit Settings
                        </button>
                    ) : (
                        <button className="btn-primary green" onClick={handleSave}>
                            <SaveIcon style={{ fontSize: 18 }} /> Save Changes
                        </button>
                    )}
                </div>
            </div>

            <div className="admin-grid">
                <div className="admin-section">
                    <h3><SchoolIcon style={{ fontSize: 22 }} /> School Information</h3>
                    {editing ? (
                        <>
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
                            <div className="setting-row"><span className="setting-label">School Name</span><span className="setting-value">{settings.schoolName}</span></div>
                            <div className="setting-row"><span className="setting-label">Motto</span><span className="setting-value">{settings.motto}</span></div>
                            <div className="setting-row"><span className="setting-label">Phone</span><span className="setting-value">{settings.phone}</span></div>
                            <div className="setting-row"><span className="setting-label">Email</span><span className="setting-value">{settings.email}</span></div>
                            <div className="setting-row"><span className="setting-label">Address</span><span className="setting-value">{settings.address}</span></div>
                            <div className="setting-row"><span className="setting-label">Paybill Number</span><span className="setting-value">{settings.paybillNumber || 'Not Set'}</span></div>
                            <div className="setting-row">
                                <span className="setting-label">Headteacher Signature</span>
                                <span className="setting-value">
                                    {settings.headteacherSignature ? (
                                        <img src={settings.headteacherSignature} style={{ height: 30, verticalAlign: 'middle' }} alt="Headteacher Signature" />
                                    ) : (
                                        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Not Set</span>
                                    )}
                                </span>
                            </div>
                            <div className="setting-row">
                                <span className="setting-label">Finance Signature / Stamp</span>
                                <span className="setting-value">
                                    {settings.financeSignature ? (
                                        <img src={settings.financeSignature} style={{ height: 30, verticalAlign: 'middle' }} alt="Finance Signature" />
                                    ) : (
                                        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Not Set</span>
                                    )}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                <div className="admin-section">
                    <h3><SettingsIcon style={{ fontSize: 22 }} /> Academic Settings</h3>
                    {editing ? (
                        <>
                            <div className="form-group">
                                <label htmlFor="current-term">Current Term</label>
                                <select id="current-term" title="Select Current Term" className="form-control" value={form.currentTerm} onChange={e => setForm({ ...form, currentTerm: e.target.value })}>
                                    <option>Term 1</option>
                                    <option>Term 2</option>
                                    <option>Term 3</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="current-year">Current Year</label>
                                <input id="current-year" className="form-control" type="number" value={form.currentYear} onChange={e => setForm({ ...form, currentYear: parseInt(e.target.value) })} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="setting-row"><span className="setting-label">Current Term</span><span className="setting-value">{settings.currentTerm}</span></div>
                            <div className="setting-row"><span className="setting-label">Current Year</span><span className="setting-value">{settings.currentYear}</span></div>
                        </>
                    )}
                </div>

                <div className="admin-section" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 style={{ margin: 0 }}><PersonIcon style={{ fontSize: 22 }} /> User Management</h3>
                        <button className="btn-primary" onClick={() => setShowAddUser(!showAddUser)}>
                            {showAddUser ? 'Cancel' : 'Add New User'}
                        </button>
                    </div>

                    {showAddUser && (
                        <div className="card" style={{ background: 'var(--bg-surface)', marginBottom: 20, border: '1px solid var(--accent-blue)' }}>
                            <h4 style={{ margin: '0 0 16px' }}>Add New System User</h4>
                            <div className="form-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label htmlFor="user-name">Full Name</label>
                                    <input id="user-name" className="form-control" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} placeholder="e.g. John Doe" />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label htmlFor="user-email">Email Address</label>
                                    <input id="user-email" className="form-control" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} placeholder="email@elirama.ac.ke" />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label htmlFor="user-role">Role</label>
                                    <select id="user-role" title="Select User Role" className="form-control" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value as any })}>
                                        <option value="Admin">Admin</option>
                                        <option value="Teacher">Teacher</option>
                                        <option value="Staff">Staff</option>
                                    </select>
                                </div>
                                <div style={{ alignSelf: 'flex-end', paddingBottom: 12 }}>
                                    <button className="btn-primary green" onClick={handleAddUser}>Create User</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Last Login</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {systemUsers.map(u => (
                                    <tr key={u.id}>
                                        <td style={{ fontWeight: 500 }}>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td><span className={`badge ${u.role === 'Super Admin' ? 'purple' : 'blue'}`}>{u.role}</span></td>
                                        <td><span className="badge green">{u.status}</span></td>
                                        <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.lastLogin}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="btn-outline" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => resetUserPassword(u.id)}>
                                                Reset Password
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="admin-section" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 style={{ margin: 0 }}><SchoolIcon style={{ fontSize: 22 }} /> Bulk Data Management</h3>
                    </div>

                    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', padding: 0 }}>
                        <div className="card" style={{ background: 'var(--bg-surface)' }}>
                            <h4 style={{ margin: '0 0 12px' }}>Students</h4>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Import student data from Excel or CSV files.</p>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <input type="file" id="upload-students" hidden accept=".xlsx, .xls, .csv" onChange={e => e.target.files?.[0] && uploadStudents(e.target.files[0])} />
                                <button className="btn-primary" style={{ flex: 1 }} onClick={() => document.getElementById('upload-students')?.click()}>Upload File</button>
                                <button className="btn-outline" onClick={() => downloadTemplate('students')}>Template</button>
                            </div>
                        </div>

                        <div className="card" style={{ background: 'var(--bg-surface)' }}>
                            <h4 style={{ margin: '0 0 12px' }}>Teachers</h4>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Import teacher data from Excel or CSV files.</p>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <input type="file" id="upload-teachers" hidden accept=".xlsx, .xls, .csv" onChange={e => e.target.files?.[0] && uploadTeachers(e.target.files[0])} />
                                <button className="btn-primary" style={{ flex: 1 }} onClick={() => document.getElementById('upload-teachers')?.click()}>Upload File</button>
                                <button className="btn-outline" onClick={() => downloadTemplate('teachers')}>Template</button>
                            </div>
                        </div>

                        <div className="card" style={{ background: 'var(--bg-surface)' }}>
                            <h4 style={{ margin: '0 0 12px' }}>Exams</h4>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Import exam schedules and details from Excel.</p>
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
                        <button
                            className="btn-primary"
                            style={{ background: '#c53030', borderColor: '#c53030' }}
                            onClick={() => {
                                if (window.confirm('CRITICAL WARNING: This will permanently delete ALL students, teachers, results, and payments. The school settings will reset to default. Are you absolutely sure you want to clear EVERYTHING?')) {
                                    clearAllData();
                                }
                            }}
                        >
                            Clear All System Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
