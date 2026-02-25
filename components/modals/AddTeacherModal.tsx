import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { GRADES, SUBJECTS, Teacher } from '../../types';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
    onClose: () => void;
    teacher?: Teacher | null;
}

export default function AddTeacherModal({ onClose, teacher }: Props) {
    const { addTeacher, updateTeacher, activeGrades } = useSchool();
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        qualification: '',
        subjects: [] as string[],
        grades: [] as string[],
        maxLessonsDay: 8,
        maxLessonsWeek: 40,
    });

    useEffect(() => {
        if (teacher) {
            setForm({
                firstName: teacher.firstName,
                lastName: teacher.lastName,
                email: teacher.email,
                phone: teacher.phone,
                qualification: teacher.qualification,
                subjects: teacher.subjects,
                grades: teacher.grades,
                maxLessonsDay: teacher.maxLessonsDay || 8,
                maxLessonsWeek: teacher.maxLessonsWeek || 40,
            });
        }
    }, [teacher]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (teacher) {
            updateTeacher(teacher.id, form);
        } else {
            addTeacher({
                ...form,
                status: 'Active',
                joinDate: new Date().toISOString().split('T')[0],
            });
        }
        onClose();
    };

    const toggleSubject = (subject: string) => {
        setForm(prev => ({
            ...prev,
            subjects: prev.subjects.includes(subject)
                ? prev.subjects.filter(s => s !== subject)
                : [...prev.subjects, subject],
        }));
    };

    const toggleGrade = (grade: string) => {
        setForm(prev => ({
            ...prev,
            grades: prev.grades.includes(grade)
                ? prev.grades.filter(g => g !== grade)
                : [...prev.grades, grade],
        }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 700, width: '90%' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2 className="m-0">{teacher ? 'Update Faculty Profile' : 'Enroll New Faculty'}</h2>
                        <p className="fs-12 opacity-60 m-0">Institutional teaching staff management</p>
                    </div>
                    <button className="modal-close" onClick={onClose}><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body custom-scrollbar" style={{ maxHeight: '75vh' }}>
                        <div className="nav-section-label" style={{ paddingLeft: 0, marginBottom: 15 }}>Personal & Contact Statistics</div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="fs-12 fw-600 mb-6 block">Legal First Name *</label>
                                <input className="form-control" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="e.g. John" />
                            </div>
                            <div className="form-group">
                                <label className="fs-12 fw-600 mb-6 block">Legal Last Name *</label>
                                <input className="form-control" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="e.g. Doe" />
                            </div>
                        </div>
                        <div className="grid-2 mt-15">
                            <div className="form-group">
                                <label className="fs-12 fw-600 mb-6 block">Institutional Email *</label>
                                <input type="email" className="form-control" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="j.doe@elirama.edu" />
                            </div>
                            <div className="form-group">
                                <label className="fs-12 fw-600 mb-6 block">Mobile Connection *</label>
                                <input className="form-control" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+254 7XX XXX XXX" />
                            </div>
                        </div>

                        <div className="mt-24">
                            <div className="nav-section-label" style={{ paddingLeft: 0, marginBottom: 15 }}>Academic Background</div>
                            <div className="form-group">
                                <label className="fs-12 fw-600 mb-6 block">Primary Qualification / Degree</label>
                                <input className="form-control" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} placeholder="e.g. B.Ed (Science), TSC Certified" />
                            </div>
                            <div className="grid-2 mt-15">
                                <div className="form-group">
                                    <label className="fs-12 fw-600 mb-6 block">Max Lessons / Day</label>
                                    <input type="number" className="form-control" value={form.maxLessonsDay} onChange={e => setForm({ ...form, maxLessonsDay: parseInt(e.target.value) })} />
                                </div>
                                <div className="form-group">
                                    <label className="fs-12 fw-600 mb-6 block">Max Lessons / Week</label>
                                    <input type="number" className="form-control" value={form.maxLessonsWeek} onChange={e => setForm({ ...form, maxLessonsWeek: parseInt(e.target.value) })} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-24">
                            <div className="nav-section-label" style={{ paddingLeft: 0, marginBottom: 15 }}>Curriculum Assignment</div>
                            <div className="form-group">
                                <label className="fs-12 fw-600 mb-6 block">Specialized Subjects *</label>
                                <div className="flex-row" style={{ flexWrap: 'wrap', gap: 6 }}>
                                    {SUBJECTS.map(subject => (
                                        <button
                                            key={subject}
                                            type="button"
                                            className={`badge ${form.subjects.includes(subject) ? 'green active' : 'gray'}`}
                                            style={{ cursor: 'pointer', border: '1px solid var(--border-color)', height: 32, padding: '0 12px' }}
                                            onClick={() => toggleSubject(subject)}
                                        >
                                            {subject}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group mt-20">
                                <label className="fs-12 fw-600 mb-6 block">Assigned Grade Levels</label>
                                <div className="flex-row" style={{ flexWrap: 'wrap', gap: 6 }}>
                                    {activeGrades.map(grade => (
                                        <button
                                            key={grade}
                                            type="button"
                                            className={`badge ${form.grades.includes(grade) ? 'blue active' : 'gray'}`}
                                            style={{ cursor: 'pointer', border: '1px solid var(--border-color)', height: 32, padding: '0 12px' }}
                                            onClick={() => toggleGrade(grade)}
                                        >
                                            {grade}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                        <button type="button" className="btn-outline" onClick={onClose} style={{ height: 44 }}>Cancel Deployment</button>
                        <button type="submit" className="btn-primary" style={{ height: 44 }}>
                            {teacher ? 'Update Credentials' : 'Commit Faculty Registration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
