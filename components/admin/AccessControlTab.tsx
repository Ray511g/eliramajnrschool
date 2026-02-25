import React, { useState } from 'react';
import SecurityIcon from '@mui/icons-material/Security';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useSchool } from '../../context/SchoolContext';
import { PERMISSIONS } from '../../components/layout/Sidebar';
import { Role } from '../../types';

export const AccessControlTab: React.FC = () => {
    const { roles, addRole, updateRole, deleteRole } = useSchool();
    const [showAddRole, setShowAddRole] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [roleForm, setRoleForm] = useState({ name: '', description: '', permissions: [] as string[] });

    const handleSaveRole = () => {
        if (!roleForm.name) return;
        if (editingRole) {
            updateRole(editingRole.id, roleForm as any);
        } else {
            addRole(roleForm as any);
        }
        setRoleForm({ name: '', description: '', permissions: [] });
        setEditingRole(null);
        setShowAddRole(false);
    };

    const togglePermission = (code: string) => {
        setRoleForm(prev => ({
            ...prev,
            permissions: prev.permissions.includes(code)
                ? prev.permissions.filter(p => p !== code)
                : [...prev.permissions, code]
        }));
    };

    return (
        <div className="admin-section">
            <div className="flex-between" style={{ marginBottom: 20 }}>
                <h3 className="m-0"><SecurityIcon className="nav-icon" /> Role-Based Access Control</h3>
                <button className="btn-primary" onClick={() => { setEditingRole(null); setRoleForm({ name: '', description: '', permissions: [] }); setShowAddRole(true); }}>
                    <AddIcon style={{ fontSize: 18 }} /> Create New Role
                </button>
            </div>

            {showAddRole && (
                <div className="card" style={{ marginBottom: 24, border: '1px solid var(--accent-blue)', background: 'rgba(59, 130, 246, 0.02)' }}>
                    <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <h4 className="m-0">{editingRole ? `Editing Role: ${editingRole.name}` : 'Define New System Role'}</h4>
                    </div>
                    <div className="card-body">
                        <div className="grid-2">
                            <div className="form-group">
                                <label>Role Name</label>
                                <input type="text" className="form-control" value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })} placeholder="e.g. Finance Head, Registrar" />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <input type="text" className="form-control" value={roleForm.description} onChange={e => setRoleForm({ ...roleForm, description: e.target.value })} placeholder="Briefly describe purpose" />
                            </div>
                        </div>

                        <div className="mt-20">
                            <label className="fw-600" style={{ display: 'block', marginBottom: 12 }}>Grant Permissions</label>
                            <div className="grid-4">
                                {PERMISSIONS.map(pref => (
                                    <label key={pref.code} className="flex-row pointer" style={{ padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                                        <input type="checkbox" checked={roleForm.permissions.includes(pref.code)} onChange={() => togglePermission(pref.code)} />
                                        <span className="fs-13">{pref.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex-row mt-24">
                            <button className="btn-primary" onClick={handleSaveRole}>Save Role Definition</button>
                            <button className="btn-outline" onClick={() => setShowAddRole(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="card p-0">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Role Name</th>
                            <th>Description</th>
                            <th>Permissions Granted</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map(r => (
                            <tr key={r.id}>
                                <td className="fw-600">{r.name}</td>
                                <td>{r.description || 'No description provided'}</td>
                                <td>
                                    <div className="flex-row" style={{ flexWrap: 'wrap', gap: 4 }}>
                                        {(Array.isArray(r.permissions) ? r.permissions : []).map(p => (
                                            <span key={p} className="badge small gray" style={{ fontSize: 10 }}>{p}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="text-right">
                                    <div className="flex-row gap-10" style={{ justifyContent: 'flex-end' }}>
                                        <button className="btn-icon" title="Edit" onClick={() => { setEditingRole(r); setRoleForm({ name: r.name, description: r.description || '', permissions: Array.isArray(r.permissions) ? r.permissions : [] }); setShowAddRole(true); }}><EditIcon fontSize="small" /></button>
                                        <button className="btn-icon" title="Delete" onClick={() => deleteRole(r.id)} style={{ color: '#ef4444' }}><DeleteIcon fontSize="small" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
