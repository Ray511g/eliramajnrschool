import React, { useState } from 'react';
import GroupIcon from '@mui/icons-material/Group';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useSchool } from '../../context/SchoolContext';

export const UserManagementTab: React.FC = () => {
    const { systemUsers, addSystemUser, updateSystemUser, deleteSystemUser, resetUserPassword, roles } = useSchool();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddUser, setShowAddUser] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [userForm, setUserForm] = useState({
        firstName: '', lastName: '', username: '', password: '', name: '', email: '', role: 'Teacher', roleId: '', permissions: [] as string[]
    });

    const handleAddUser = () => {
        if (!userForm.firstName || !userForm.lastName || !userForm.username || !userForm.email) return;
        const fullName = `${userForm.firstName} ${userForm.lastName}`;
        const submissionData = { ...userForm, name: fullName };
        if (editingUser) {
            updateSystemUser(editingUser.id, submissionData as any);
        } else {
            addSystemUser(submissionData as any);
        }
        setUserForm({ firstName: '', lastName: '', username: '', password: '', name: '', email: '', role: 'Teacher', roleId: '', permissions: [] });
        setEditingUser(null);
        setShowAddUser(false);
    };

    const startEditUser = (u: any) => {
        setEditingUser(u);
        const [firstName = '', lastName = ''] = (u.name || '').split(' ');
        setUserForm({
            firstName: u.firstName || firstName,
            lastName: u.lastName || lastName,
            username: u.username || '',
            password: '',
            name: u.name,
            email: u.email,
            role: u.role,
            roleId: u.roleId || '',
            permissions: u.permissions || []
        });
        setShowAddUser(true);
    };

    const filteredUsers = (systemUsers || []).filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-section">
            <div className="flex-between m-0" style={{ marginBottom: 20 }}>
                <h3 className="m-0"><GroupIcon className="nav-icon" /> User Directory</h3>
                <div className="flex-row gap-10">
                    <div className="search-box">
                        <SearchIcon style={{ fontSize: 18, color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn-primary" onClick={() => { setEditingUser(null); setUserForm({ firstName: '', lastName: '', username: '', password: '', name: '', email: '', role: 'Teacher', roleId: '', permissions: [] }); setShowAddUser(true); }}>
                        <AddIcon style={{ fontSize: 18 }} /> New User
                    </button>
                </div>
            </div>

            {showAddUser && (
                <div className="card" style={{ marginBottom: 24, border: '1px solid var(--accent-blue)', background: 'rgba(59, 130, 246, 0.02)' }}>
                    <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <h4 className="m-0">{editingUser ? 'Update User Account' : 'Register New System User'}</h4>
                    </div>
                    <div className="card-body">
                        <div className="grid-3">
                            <div className="form-group">
                                <label>First Name</label>
                                <input type="text" className="form-control" value={userForm.firstName} onChange={e => setUserForm({ ...userForm, firstName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input type="text" className="form-control" value={userForm.lastName} onChange={e => setUserForm({ ...userForm, lastName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" className="form-control" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Username</label>
                                <input type="text" className="form-control" value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} />
                            </div>
                            {!editingUser && (
                                <div className="form-group">
                                    <label>Initial Password</label>
                                    <input type="password" placeholder="Min 6 characters" className="form-control" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} />
                                </div>
                            )}
                            <div className="form-group">
                                <label>Primary Role</label>
                                <select className="form-control" value={userForm.roleId} onChange={e => {
                                    const role = roles.find(r => r.id === e.target.value);
                                    setUserForm({ ...userForm, roleId: e.target.value, role: role?.name || 'Teacher', permissions: Array.isArray(role?.permissions) ? role.permissions : [] });
                                }}>
                                    <option value="">Select Role</option>
                                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex-row mt-20">
                            <button className="btn-primary" onClick={handleAddUser}>{editingUser ? 'Update Account' : 'Create User'}</button>
                            <button className="btn-outline" onClick={() => setShowAddUser(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="card p-0">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>Username</th>
                            <th>System Role</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(u => (
                            <tr key={u.id}>
                                <td>
                                    <div className="fw-600">{u.name}</div>
                                    <div className="fs-12 opacity-60">{u.email}</div>
                                </td>
                                <td>{u.username}</td>
                                <td><span className="badge blue">{u.role}</span></td>
                                <td><span className={`badge ${u.status === 'Active' ? 'green' : 'gray'}`}>{u.status || 'Active'}</span></td>
                                <td className="text-right">
                                    <div className="flex-row justify-end gap-10">
                                        <button className="btn-icon" onClick={() => startEditUser(u)} title="Edit User"><EditIcon fontSize="small" /></button>
                                        <button className="btn-icon" onClick={() => (resetUserPassword as any)(u.id)} title="Reset Password" style={{ color: '#f59e0b' }}><LockIcon fontSize="small" /></button>
                                        <button className="btn-icon" onClick={() => (deleteSystemUser as any)(u.id, u.name)} title="Delete User" style={{ color: '#ef4444' }}><DeleteIcon fontSize="small" /></button>
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
