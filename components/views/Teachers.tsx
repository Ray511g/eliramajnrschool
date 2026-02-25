import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Teacher } from '../../types';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClassIcon from '@mui/icons-material/Class';
import AddTeacherModal from '../../components/modals/AddTeacherModal';
import Pagination from '../../components/common/Pagination';

export default function Teachers() {
    const { teachers, deleteTeacher } = useSchool();
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filtered = (teachers || []).filter(t =>
        `${t.firstName} ${t.lastName} ${(t.subjects || []).join(' ')}`.toLowerCase().includes(search.toLowerCase())
    );

    const paginatedTeachers = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const active = (teachers || []).filter(t => t.status === 'Active').length;
    const totalSubjects = new Set((teachers || []).flatMap(t => t.subjects || [])).size;

    const handleEdit = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingTeacher(null);
    };

    return (
        <div className="page-container glass-overlay" style={{ padding: '24px 32px' }}>
            <div className="page-header animate-up">
                <div className="page-header-left">
                    <h1 className="page-title text-gradient" style={{ fontSize: '2.5rem', marginBottom: '4px' }}>Teaching Faculty</h1>
                    <p className="page-subtitle" style={{ opacity: 0.7, fontWeight: 500 }}>Manage pedagogical staff, subject assignments, and operational status</p>
                </div>
                <div className="page-header-right">
                    <button className="btn-premium" onClick={() => setShowAddModal(true)}>
                        <AddIcon style={{ fontSize: 18 }} /> Register New Teacher
                    </button>
                </div>
            </div>

            <div className="stats-grid animate-up" style={{ gap: '20px', marginBottom: '32px' }}>
                <div className="premium-card" style={{ padding: '24px' }}>
                    <div className="stat-card-header" style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Faculty</div>
                        <div className="stat-card-icon" style={{ color: 'var(--accent-purple)' }}><GroupIcon /></div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{teachers?.length || 0}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Registered Staff</div>
                </div>
                <div className="premium-card" style={{ padding: '24px' }}>
                    <div className="stat-card-header" style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Active Duty</div>
                        <div className="stat-card-icon" style={{ color: '#10b981' }}><CheckCircleIcon /></div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginBottom: '4px' }}>{active}</div>
                    <div style={{ fontSize: '0.85rem', color: '#10b981' }}>Verified & Active</div>
                </div>
                <div className="premium-card" style={{ padding: '24px' }}>
                    <div className="stat-card-header" style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Curriculum Scope</div>
                        <div className="stat-card-icon" style={{ color: 'var(--accent-blue)' }}><ClassIcon /></div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{totalSubjects}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Unique Subjects Taught</div>
                </div>
            </div>

            <div className="search-filter-bar">
                <div className="search-input-wrapper">
                    <SearchIcon className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by name, subject or email..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>

            <div className="data-table-wrapper">
                {filtered.length === 0 ? (
                    <div className="empty-state" style={{ padding: '80px 0' }}>
                        <SchoolIcon className="empty-state-icon" style={{ fontSize: 64, color: 'var(--text-muted)' }} />
                        <p className="fs-16 fw-500">No faculty members match your criteria</p>
                        <button className="btn-outline mt-15" onClick={() => setSearch('')}>Clear Search</button>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Faculty Member</th>
                                <th>Contact Details</th>
                                <th>Qualification</th>
                                <th>Curriculum Focus</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedTeachers.map(teacher => (
                                <tr key={teacher.id}>
                                    <td>
                                        <div className="flex-row">
                                            <div className="avatar-circle" style={{ background: 'var(--accent-purple-bg)', color: 'var(--accent-purple)' }}>
                                                {(teacher.firstName?.[0] || '') + (teacher.lastName?.[0] || '')}
                                            </div>
                                            <div style={{ marginLeft: 12 }}>
                                                <div className="fw-600 fs-14">{teacher.firstName} {teacher.lastName}</div>
                                                <div className="fs-11 opacity-60 uppercase tracking-widest">{teacher.id.slice(-6)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="fs-13">{teacher.email}</div>
                                        <div className="fs-11 opacity-60">{teacher.phone}</div>
                                    </td>
                                    <td>
                                        <div className="badge blue-light fs-11" style={{ borderRadius: 6 }}>{teacher.qualification || 'K.C.P.E/K.C.S.E'}</div>
                                    </td>
                                    <td>
                                        <div className="flex-row" style={{ flexWrap: 'wrap', gap: 4 }}>
                                            {(teacher.subjects || []).slice(0, 2).map(s => (
                                                <span key={s} className="fs-10 fw-600 px-8 py-2 bg-surface rounded-sm border-1 border-color">{s}</span>
                                            ))}
                                            {(teacher.subjects || []).length > 2 && <span className="fs-10 opacity-60">+{teacher.subjects.length - 2} more</span>}
                                        </div>
                                        <div className="fs-10 mt-4 opacity-50">Grades: {(teacher.grades || []).join(', ')}</div>
                                    </td>
                                    <td>
                                        <span className={`status-tag ${teacher.status?.toLowerCase() === 'active' ? 'active' : 'error'}`}>
                                            {teacher.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <div className="table-actions justify-end">
                                            <button className="table-action-btn" title="Edit Profile" onClick={() => handleEdit(teacher)}>
                                                <EditIcon style={{ fontSize: 16 }} />
                                            </button>
                                            <button className="table-action-btn danger" title="Remove Record" onClick={() => {
                                                if (window.confirm(`Are you sure you want to remove ${teacher.firstName} ${teacher.lastName}?`)) {
                                                    deleteTeacher(teacher.id);
                                                }
                                            }}>
                                                <DeleteIcon style={{ fontSize: 16 }} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="flex-between mt-24">
                <div className="fs-13 opacity-60">
                    Showing {Math.min(filtered.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filtered.length, currentPage * itemsPerPage)} of {filtered.length} faculty members
                </div>
                <Pagination
                    totalItems={filtered.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />
            </div>

            {showAddModal && <AddTeacherModal teacher={editingTeacher} onClose={handleCloseModal} />}
        </div>
    );
}
