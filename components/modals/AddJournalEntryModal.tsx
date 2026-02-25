import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import PostAddIcon from '@mui/icons-material/PostAdd';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddJournalEntryModal({ isOpen, onClose }: Props) {
    const { accounts, addJournalEntry } = useSchool();
    const { user } = useAuth();
    const [form, setForm] = useState({
        description: '',
        accountId: '',
        debit: 0,
        credit: 0,
        date: new Date().toISOString().split('T')[0]
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.debit === 0 && form.credit === 0) {
            alert('Must have either a debit or credit amount');
            return;
        }
        await addJournalEntry({ ...form, requestedBy: user?.name || 'System' });
        onClose();
        setForm({
            description: '',
            accountId: '',
            debit: 0,
            credit: 0,
            date: new Date().toISOString().split('T')[0]
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="section-title">Manual Journal Posting</h2>
                    <button className="modal-close" onClick={onClose}><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Target Account *</label>
                            <select
                                className="form-control"
                                value={form.accountId}
                                onChange={e => setForm({ ...form, accountId: e.target.value })}
                                required
                            >
                                <option value="">Select Account...</option>
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Date *</label>
                            <input
                                type="date"
                                className="form-control"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description *</label>
                            <textarea
                                className="form-control"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="Purpose of entry..."
                                required
                                rows={2}
                            />
                        </div>

                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Debit (KES)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={form.debit || ''}
                                    onChange={e => setForm({ ...form, debit: parseFloat(e.target.value) || 0, credit: 0 })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Credit (KES)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={form.credit || ''}
                                    onChange={e => setForm({ ...form, credit: parseFloat(e.target.value) || 0, debit: 0 })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">
                            <PostAddIcon className="mr-2" style={{ fontSize: 18 }} />
                            Post Ledger Entry
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
