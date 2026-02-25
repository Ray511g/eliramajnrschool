import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddExpenseRequestModal({ isOpen, onClose }: Props) {
    const { suppliers, requestExpenditure } = useSchool();
    const { user } = useAuth();
    const [form, setForm] = useState({
        category: '',
        amount: 0,
        description: '',
        supplierId: '',
        paymentMethod: 'Bank' as 'Bank' | 'Cash' | 'M-Pesa'
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const requestedByName = user?.name || 'Unknown';
        await requestExpenditure({
            ...form,
            requestedBy: user?.id || 'unknown',
            requestedByName: requestedByName
        });
        setForm({ category: '', amount: 0, description: '', supplierId: '', paymentMethod: 'Bank' });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="section-title">Raise Fund Request</h2>
                    <button className="modal-close" onClick={onClose}><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Category / Purpose *</label>
                                <select
                                    className="form-control"
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                    required
                                >
                                    <option value="">Select Category...</option>
                                    <option value="Operational">Operational</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Supplies">Supplies</option>
                                    <option value="Academic">Academic</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Amount (KES) *</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={form.amount || ''}
                                    onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                                    required
                                    placeholder="Enter amount"
                                />
                            </div>
                        </div>

                        <div className="grid-2" style={{ marginTop: 12 }}>
                            <div className="form-group">
                                <label className="form-label">Supplier (Optional)</label>
                                <select
                                    className="form-control"
                                    value={form.supplierId}
                                    onChange={e => setForm({ ...form, supplierId: e.target.value })}
                                >
                                    <option value="">N/A</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Preferred Method</label>
                                <select
                                    className="form-control"
                                    value={form.paymentMethod}
                                    onChange={e => setForm({ ...form, paymentMethod: e.target.value as any })}
                                >
                                    <option value="Bank">Bank Transfer</option>
                                    <option value="Cash">Petty Cash</option>
                                    <option value="M-Pesa">M-Pesa Business</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: 12 }}>
                            <label className="form-label">Detailed Description *</label>
                            <textarea
                                className="form-control"
                                rows={3}
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                required
                                placeholder="Explain the business need for this expenditure..."
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={onClose}>Discard</button>
                        <button type="submit" className="btn btn-primary">
                            <SendIcon className="mr-2" style={{ fontSize: 18 }} />
                            Submit for Approval
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
