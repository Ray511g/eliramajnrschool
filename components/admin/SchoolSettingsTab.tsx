import React, { useState } from 'react';
import SchoolIcon from '@mui/icons-material/School';
import SecurityIcon from '@mui/icons-material/Security';
import { useSchool } from '../../context/SchoolContext';
import { SchoolSettings } from '../../types';

interface Props {
    editing: boolean;
    setEditing: (editing: boolean) => void;
}

export const SchoolSettingsTab: React.FC<Props> = ({ editing, setEditing }) => {
    const { settings, updateSettings, uploadStudents, uploadTeachers, uploadExams, clearAllData, downloadTemplate } = useSchool();
    const [form, setForm] = useState<SchoolSettings>(settings);

    const handleSave = async () => {
        const success = await updateSettings(form);
        if (success) setEditing(false);
    };

    return (
        <div className="admin-grid-2">
            <div className="admin-section">
                <h3><SchoolIcon className="nav-icon" /> School Information</h3>
                <div className="card">
                    <div className="settings-form">
                        {editing ? (
                            <>
                                <div className="form-group">
                                    <label htmlFor="school-logo">School Logo</label>
                                    <div className="flex-row mt-8">
                                        {form.logo && (
                                            <img src={form.logo} className="preview-img" alt="Logo Preview" />
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
                                    <input
                                        id="school-name"
                                        type="text"
                                        className="form-control"
                                        value={form.schoolName}
                                        onChange={e => setForm({ ...form, schoolName: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="school-motto">School Motto</label>
                                    <input
                                        id="school-motto"
                                        type="text"
                                        className="form-control"
                                        value={form.motto}
                                        onChange={e => setForm({ ...form, motto: e.target.value })}
                                    />
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label htmlFor="school-phone">Official Phone</label>
                                        <input
                                            id="school-phone"
                                            type="text"
                                            className="form-control"
                                            value={form.phone}
                                            onChange={e => setForm({ ...form, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="school-email">Official Email</label>
                                        <input
                                            id="school-email"
                                            type="email"
                                            className="form-control"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="school-address">Physical Address</label>
                                    <textarea
                                        id="school-address"
                                        className="form-control"
                                        rows={2}
                                        value={form.address}
                                        onChange={e => setForm({ ...form, address: e.target.value })}
                                    />
                                </div>
                                <div className="grid-3">
                                    <div className="form-group">
                                        <label htmlFor="po-box">P.O. Box</label>
                                        <input id="po-box" type="text" className="form-control" value={form.poBox || ''} onChange={e => setForm({ ...form, poBox: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="telephone">Telephone</label>
                                        <input id="telephone" type="text" className="form-control" value={form.telephone || ''} onChange={e => setForm({ ...form, telephone: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="paybill">Paybill Number</label>
                                        <input id="paybill" type="text" className="form-control" value={form.paybillNumber || ''} onChange={e => setForm({ ...form, paybillNumber: e.target.value })} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Academic Levels Enabled</label>
                                    <div className="flex-row mt-8" style={{ flexWrap: 'wrap' }}>
                                        <label className="flex-row pointer">
                                            <input type="checkbox" checked={form.earlyYearsEnabled} onChange={e => setForm({ ...form, earlyYearsEnabled: e.target.checked })} />
                                            <span className="fs-13">Early Years</span>
                                        </label>
                                        <label className="flex-row pointer">
                                            <input type="checkbox" checked={form.primaryEnabled} onChange={e => setForm({ ...form, primaryEnabled: e.target.checked })} />
                                            <span className="fs-13">Primary</span>
                                        </label>
                                        <label className="flex-row pointer">
                                            <input type="checkbox" checked={form.jssEnabled} onChange={e => setForm({ ...form, jssEnabled: e.target.checked })} />
                                            <span className="fs-13">Junior Secondary</span>
                                        </label>
                                        <label className="flex-row pointer">
                                            <input type="checkbox" checked={form.sssEnabled} onChange={e => setForm({ ...form, sssEnabled: e.target.checked })} />
                                            <span className="fs-13">Senior Secondary</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid-2">
                                    <div className="form-group">
                                        <label htmlFor="headteacher-signature">Digital Signature ({form.headOfSchoolTitle || 'Headteacher'})</label>
                                        <div className="flex-row mt-8">
                                            {form.headteacherSignature && (
                                                <img src={form.headteacherSignature} className="preview-img" alt="Headteacher Signature Preview" />
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
                                        <label htmlFor="school-stamp">Official School Stamp</label>
                                        <div className="flex-row mt-8">
                                            {form.schoolStamp && (
                                                <img src={form.schoolStamp} className="preview-img circular" alt="School Stamp Preview" />
                                            )}
                                            <input
                                                id="school-stamp"
                                                type="file"
                                                accept="image/*"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setForm({ ...form, schoolStamp: reader.result as string });
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-row mt-20">
                                    <button className="btn-primary" onClick={handleSave}>Save Changes</button>
                                    <button className="btn-outline" onClick={() => setEditing(false)}>Cancel</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="setting-row">
                                    <span className="setting-label">Logo</span>
                                    <span className="setting-value">
                                        {settings.logo ? <img src={settings.logo} className="preview-img-sm" alt="School Logo" /> : 'Not Set'}
                                    </span>
                                </div>
                                <div className="setting-row">
                                    <span className="setting-label">Official Stamp</span>
                                    <span className="setting-value">
                                        {settings.schoolStamp ? <img src={settings.schoolStamp} className="preview-img-sm circular" alt="School Stamp" /> : 'Not Set'}
                                    </span>
                                </div>
                                <div className="setting-row"><span className="setting-label">School Name</span><span className="setting-value">{settings.schoolName}</span></div>
                                <div className="setting-row"><span className="setting-label">Motto</span><span className="setting-value">{settings.motto}</span></div>
                                <div className="setting-row"><span className="setting-label">Phone</span><span className="setting-value">{settings.phone}</span></div>
                                <div className="setting-row"><span className="setting-label">Email</span><span className="setting-value">{settings.email}</span></div>
                                <div className="setting-row">
                                    <span className="setting-label">{settings.headOfSchoolTitle || 'Headteacher'} Signature</span>
                                    <span className="setting-value">
                                        {settings.headteacherSignature ? (
                                            <img src={settings.headteacherSignature} className="preview-img-xs" alt="Signature" />
                                        ) : <span className="fs-12 opacity-60">Not Set</span>}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="admin-section">
                <h3><SecurityIcon className="nav-icon" /> Data & Maintenance</h3>
                <div className="card-grid">
                    <div className="card p-0" style={{ background: 'var(--bg-surface)' }}>
                        <div className="card-header"><h4 className="m-0">Students</h4></div>
                        <div className="card-body">
                            <div className="flex-row gap-10">
                                <input type="file" id="upload-students" hidden accept=".xlsx, .xls, .csv" onChange={e => e.target.files?.[0] && uploadStudents(e.target.files[0])} />
                                <button className="btn-primary flex-1" onClick={() => (document.getElementById('upload-students') as any)?.click()}>Upload</button>
                                <button className="btn-outline flex-1" onClick={() => (downloadTemplate('students'))}>Template</button>
                            </div>
                        </div>
                    </div>
                    <div className="card p-0" style={{ background: 'var(--bg-surface)' }}>
                        <div className="card-header"><h4 className="m-0">Teachers</h4></div>
                        <div className="card-body">
                            <div className="flex-row gap-10">
                                <input type="file" id="upload-teachers" hidden accept=".xlsx, .xls, .csv" onChange={e => e.target.files?.[0] && uploadTeachers(e.target.files[0])} />
                                <button className="btn-primary flex-1" onClick={() => (document.getElementById('upload-teachers') as any)?.click()}>Upload</button>
                                <button className="btn-outline flex-1" onClick={() => (downloadTemplate('teachers'))}>Template</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="danger-zone mt-24">
                    <div>
                        <h3 className="danger-zone-title">Danger Zone</h3>
                        <p>Caution: These actions are permanent and cannot be undone.</p>
                    </div>
                    <button className="btn-primary" style={{ background: '#c53030' }} onClick={() => { if (window.confirm('Delete all data?')) clearAllData(); }}>
                        Clear All Data
                    </button>
                </div>
            </div>
        </div>
    );
};
