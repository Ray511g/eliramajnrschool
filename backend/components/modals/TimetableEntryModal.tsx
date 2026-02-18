import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { DAYS, TIME_SLOTS, SUBJECTS } from '../../types';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
    grade: string;
    onClose: () => void;
}

export default function TimetableEntryModal({ grade, onClose }: Props) {
    const { teachers, addTimetableEntry } = useSchool();
    const [form, setForm] = useState({
        day: DAYS[0],
        timeSlot: TIME_SLOTS[0],
        subject: SUBJECTS[0],
        teacherId: '',
        teacherName: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const teacher = teachers.find(t => t.id === form.teacherId);
        addTimetableEntry({
            grade,
            day: form.day,
            timeSlot: form.timeSlot,
            subject: form.subject,
            teacherId: form.teacherId,
            teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : form.teacherName || 'TBA',
        });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add Timetable Entry</h2>
                    <button className="modal-close" onClick={onClose}><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Grade</label>
                            <input className="form-control" value={grade} disabled />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Day *</label>
                                <select className="form-control" value={form.day} onChange={e => setForm({ ...form, day: e.target.value })}>
                                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Time Slot *</label>
                                <select className="form-control" value={form.timeSlot} onChange={e => setForm({ ...form, timeSlot: e.target.value })}>
                                    {TIME_SLOTS.filter(s => s !== '10:00 - 10:30' && s !== '12:30 - 1:10').map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Subject *</label>
                            <select className="form-control" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Teacher</label>
                            {teachers.length > 0 ? (
                                <select className="form-control" value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}>
                                    <option value="">Select teacher</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                                    ))}
                                </select>
                            ) : (
                                <input className="form-control" placeholder="Enter teacher name" value={form.teacherName} onChange={e => setForm({ ...form, teacherName: e.target.value })} />
                            )}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">Add Entry</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
