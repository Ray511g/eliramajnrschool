import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import SecurityIcon from '@mui/icons-material/Security';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

export default function Admin() {
    const { settings, updateSettings } = useSchool();
    const { user } = useAuth();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(settings);

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
                                <label>School Name</label>
                                <input className="form-control" value={form.schoolName} onChange={e => setForm({ ...form, schoolName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Motto</label>
                                <input className="form-control" value={form.motto} onChange={e => setForm({ ...form, motto: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <input className="form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="setting-row"><span className="setting-label">School Name</span><span className="setting-value">{settings.schoolName}</span></div>
                            <div className="setting-row"><span className="setting-label">Motto</span><span className="setting-value">{settings.motto}</span></div>
                            <div className="setting-row"><span className="setting-label">Phone</span><span className="setting-value">{settings.phone}</span></div>
                            <div className="setting-row"><span className="setting-label">Email</span><span className="setting-value">{settings.email}</span></div>
                            <div className="setting-row"><span className="setting-label">Address</span><span className="setting-value">{settings.address}</span></div>
                        </>
                    )}
                </div>

                <div className="admin-section">
                    <h3><SettingsIcon style={{ fontSize: 22 }} /> Academic Settings</h3>
                    {editing ? (
                        <>
                            <div className="form-group">
                                <label>Current Term</label>
                                <select className="form-control" value={form.currentTerm} onChange={e => setForm({ ...form, currentTerm: e.target.value })}>
                                    <option>Term 1</option>
                                    <option>Term 2</option>
                                    <option>Term 3</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Current Year</label>
                                <input className="form-control" type="number" value={form.currentYear} onChange={e => setForm({ ...form, currentYear: parseInt(e.target.value) })} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="setting-row"><span className="setting-label">Current Term</span><span className="setting-value">{settings.currentTerm}</span></div>
                            <div className="setting-row"><span className="setting-label">Current Year</span><span className="setting-value">{settings.currentYear}</span></div>
                        </>
                    )}
                </div>

                <div className="admin-section">
                    <h3><PersonIcon style={{ fontSize: 22 }} /> Current User</h3>
                    <div className="setting-row"><span className="setting-label">Name</span><span className="setting-value">{user?.name || 'N/A'}</span></div>
                    <div className="setting-row"><span className="setting-label">Email</span><span className="setting-value">{user?.email || 'N/A'}</span></div>
                    <div className="setting-row"><span className="setting-label">Role</span><span className="setting-value"><span className="badge purple">{user?.role || 'N/A'}</span></span></div>
                </div>

                <div className="admin-section">
                    <h3><SecurityIcon style={{ fontSize: 22 }} /> System Info</h3>
                    <div className="setting-row"><span className="setting-label">Version</span><span className="setting-value">1.0.0</span></div>
                    <div className="setting-row"><span className="setting-label">Last Updated</span><span className="setting-value">{new Date().toLocaleDateString()}</span></div>
                    <div className="setting-row"><span className="setting-label">Database</span><span className="setting-value"><span className="badge green">Connected</span></span></div>
                </div>
            </div>
        </div>
    );
}
