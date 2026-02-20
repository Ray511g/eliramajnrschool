import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
    onClose: () => void;
}

export default function RecordPaymentModal({ onClose }: Props) {
    const { students, addPayment, settings } = useSchool();
    const [form, setForm] = useState({
        studentId: '',
        amount: 0,
        method: 'Cash' as 'Cash' | 'M-Pesa' | 'Bank Transfer' | 'Cheque',
        reference: '',
    });
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStudents = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedStudent = students.find(s => s.id === form.studentId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;
        addPayment({
            ...form,
            studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
            grade: selectedStudent.grade,
            date: new Date().toISOString().split('T')[0],
            term: settings.currentTerm,
        });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Record Fee Payment</h2>
                    <button className="modal-close" onClick={onClose}><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Student *</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ marginBottom: 8 }}
                            />
                            <select className="form-control" required value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}>
                                <option value="">Select a student ({filteredStudents.length} matches)</option>
                                {filteredStudents.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.firstName} {s.lastName} ({s.grade}) - Balance: KSh {s.feeBalance.toLocaleString()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedStudent && (
                            <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Total Fees:</span>
                                    <span>KSh {selectedStudent.totalFees.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Paid:</span>
                                    <span style={{ color: 'var(--accent-green)' }}>KSh {selectedStudent.paidFees.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Balance:</span>
                                    <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>KSh {selectedStudent.feeBalance.toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        <div className="form-row">
                            <div className="form-group">
                                <label>Amount (KSh) *</label>
                                <input type="number" className="form-control" required min={1} value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} placeholder="Enter amount" />
                            </div>
                            <div className="form-group">
                                <label>Payment Method *</label>
                                <select className="form-control" value={form.method} onChange={e => setForm({ ...form, method: e.target.value as any })}>
                                    <option value="Cash">Cash</option>
                                    <option value="M-Pesa">M-Pesa</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cheque">Cheque</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Reference / Transaction ID</label>
                            <input className="form-control" value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="e.g. MPESA transaction code" />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary green">Record Payment</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
