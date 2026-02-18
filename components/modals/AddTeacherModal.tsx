import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { GRADES, SUBJECTS, Teacher } from '../../types';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
    onClose: () => void;
    teacher?: Teacher | null;
}

export default function AddTeacherModal({ onClose, teacher }: Props) {
    const { addTeacher, updateTeacher } = useSchool();
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        qualification: '',
        subjects: [] as string[],
        grades: [] as string[],
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
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{teacher ? 'Edit Teacher' : 'Add New Teacher'}</h2>
                    <button className="modal-close" onClick={onClose}><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name *</label>
                                <input className="form-control" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Last Name *</label>
                                <input className="form-control" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Email *</label>
                                <input type="email" className="form-control" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Phone *</label>
                                <input className="form-control" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Qualification</label>
                            <input className="form-control" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Subjects *</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                                {SUBJECTS.map(subject => (
                                    <button
                                        key={subject}
                                        type="button"
                                        className={`attendance-status-btn ${form.subjects.includes(subject) ? 'present active' : ''}`}
                                        onClick={() => toggleSubject(subject)}
                                    >
                                        {subject}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Assigned Grades</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                                {GRADES.map(grade => (
                                    <button
                                        key={grade}
                                        type="button"
                                        className={`attendance-status-btn ${form.grades.includes(grade) ? 'present active' : ''}`}
                                        onClick={() => toggleGrade(grade)}
                                    >
                                        {grade}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary purple">{teacher ? 'Save Changes' : 'Add Teacher'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
