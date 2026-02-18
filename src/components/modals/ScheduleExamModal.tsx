import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { GRADES, SUBJECTS, TERMS } from '../../types';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
    onClose: () => void;
}

export default function ScheduleExamModal({ onClose }: Props) {
    const { addExam } = useSchool();
    const [form, setForm] = useState({
        name: '',
        subject: SUBJECTS[0],
        grade: GRADES[0],
        date: '',
        term: TERMS[0],
        type: 'Midterm' as 'Midterm' | 'Final' | 'Quiz' | 'Assignment',
        totalMarks: 100,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addExam({ ...form, status: 'Scheduled' });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Schedule Exam</h2>
                    <button className="modal-close" onClick={onClose}><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Exam Name *</label>
                            <input className="form-control" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mid-Term Mathematics" />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Subject *</label>
                                <select className="form-control" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Grade *</label>
                                <select className="form-control" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}>
                                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Date *</label>
                                <input type="date" className="form-control" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <select className="form-control" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })}>
                                    <option value="Midterm">Midterm</option>
                                    <option value="Final">Final</option>
                                    <option value="Quiz">Quiz</option>
                                    <option value="Assignment">Assignment</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Term</label>
                                <select className="form-control" value={form.term} onChange={e => setForm({ ...form, term: e.target.value })}>
                                    {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Total Marks</label>
                                <input type="number" className="form-control" value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: Number(e.target.value) })} />
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary green">Schedule Exam</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
