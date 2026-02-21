import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { GRADES, Student } from '../../types';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
    onClose: () => void;
    student?: Student | null;
}

export default function AddStudentModal({ onClose, student }: Props) {
    const { addStudent, updateStudent, gradeFees, activeGrades } = useSchool();
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        admissionNumber: '',
        gender: 'Male' as 'Male' | 'Female',
        grade: 'Grade 1',
        dateOfBirth: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        address: '',
        totalFees: gradeFees['Grade 1'] || 15000,
    });

    useEffect(() => {
        if (student) {
            setForm({
                firstName: student.firstName,
                lastName: student.lastName,
                admissionNumber: student.admissionNumber,
                gender: student.gender,
                grade: student.grade,
                dateOfBirth: student.dateOfBirth,
                parentName: student.parentName,
                parentPhone: student.parentPhone,
                parentEmail: student.parentEmail || '',
                address: student.address || '',
                totalFees: student.totalFees,
            });
        }
    }, [student]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (student) {
            updateStudent(student.id, {
                ...form,
                feeBalance: form.totalFees - student.paidFees, // Recalculate balance based on new total
            });
        } else {
            addStudent({
                ...form,
                status: 'Active',
                enrollmentDate: new Date().toISOString().split('T')[0],
                paidFees: 0,
                feeBalance: form.totalFees,
            });
        }
        onClose();
    };

    const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{student ? 'Edit Student' : 'Add New Student'}</h2>
                    <button className="modal-close" onClick={onClose}><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name *</label>
                                <input className="form-control" required value={form.firstName} onChange={e => update('firstName', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Last Name *</label>
                                <input className="form-control" required value={form.lastName} onChange={e => update('lastName', e.target.value)} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Admission Number *</label>
                                <input className="form-control" required value={form.admissionNumber} onChange={e => update('admissionNumber', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Gender *</label>
                                <select className="form-control" value={form.gender} onChange={e => update('gender', e.target.value)}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Grade *</label>
                                <select className="form-control" value={form.grade} onChange={e => {
                                    const grade = e.target.value;
                                    // Only update fees if it's a new student or explicitly changing grade
                                    setForm(prev => ({ ...prev, grade, totalFees: gradeFees[grade] || prev.totalFees }));
                                }}>
                                    {activeGrades.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input type="date" className="form-control" value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Parent/Guardian Name *</label>
                            <input className="form-control" required value={form.parentName} onChange={e => update('parentName', e.target.value)} />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Parent Phone *</label>
                                <input className="form-control" required value={form.parentPhone} onChange={e => update('parentPhone', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Parent Email</label>
                                <input type="email" className="form-control" value={form.parentEmail} onChange={e => update('parentEmail', e.target.value)} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <input className="form-control" value={form.address} onChange={e => update('address', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Total Fees (KSh)</label>
                            <input type="number" className="form-control" value={form.totalFees} onChange={e => update('totalFees', Number(e.target.value))} />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">{student ? 'Save Changes' : 'Add Student'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
