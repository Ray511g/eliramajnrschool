import React, { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import CancelIcon from '@mui/icons-material/Cancel';
import FilePresentIcon from '@mui/icons-material/FilePresent';

interface ExpenditureManagerProps {
    expenses: any[];
    onAction: (id: string, action: string) => void;
    onRequest: (data: any) => void;
    user: any;
}

const ExpenditureManager: React.FC<ExpenditureManagerProps> = ({ expenses, onAction, onRequest, user }) => {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        category: 'Utilities',
        description: '',
        amount: 0,
        department: ''
    });

    const isPrincipalOrAdmin = user?.role === 'Super Admin' || user?.role === 'Principal';
    const isAccountantOrAdmin = user?.role === 'Super Admin' || user?.role === 'Accountant' || user?.role === 'Finance Officer';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onRequest(form);
        setShowForm(false);
        setForm({ category: 'Utilities', description: '', amount: 0, department: '' });
    };

    return (
        <div className="expenditure-manager">
            <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
                <div className="toolbar-left">
                    <h2 style={{ fontSize: 18, fontWeight: 600 }}>Expenditure Requests</h2>
                </div>
                {isAccountantOrAdmin && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <AddIcon /> Raise Request
                    </button>
                )}
            </div>

            {showForm && (
                <div className="admin-section" style={{ marginBottom: 24 }}>
                    <h3 className="section-title">New Expense Request</h3>
                    <form onSubmit={handleSubmit} className="premium-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                >
                                    <option>Utilities</option>
                                    <option>Maintenance</option>
                                    <option>Feeding</option>
                                    <option>Academic Materials</option>
                                    <option>Administration</option>
                                    <option>Transport</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Amount (KES)</label>
                                <input
                                    type="number"
                                    value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <input
                                type="text"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="e.g. Electricity bill for Feb 2026"
                                required
                            />
                        </div>
                        <div className="form-actions" style={{ marginTop: 20 }}>
                            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Submit Request</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Requested By</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.length > 0 ? expenses.map((exp) => (
                            <tr key={exp.id}>
                                <td>{new Date(exp.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div style={{ fontWeight: 500 }}>{exp.description}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{exp.department}</div>
                                </td>
                                <td><span className="badge">{exp.category}</span></td>
                                <td style={{ fontWeight: 600 }}>KES {exp.amount.toLocaleString()}</td>
                                <td>
                                    <span className={`status-tag ${exp.status.toLowerCase()}`}>
                                        {exp.status}
                                    </span>
                                </td>
                                <td>{exp.requestedByName}</td>
                                <td>
                                    <div className="action-buttons">
                                        {exp.status === 'Pending' && isPrincipalOrAdmin && (
                                            <>
                                                <button className="action-btn approve" onClick={() => onAction(exp.id, 'APPROVE')} title="Approve">
                                                    <CheckCircleIcon fontSize="small" />
                                                </button>
                                                <button className="action-btn delete" onClick={() => onAction(exp.id, 'REJECT')} title="Reject">
                                                    <CancelIcon fontSize="small" />
                                                </button>
                                            </>
                                        )}
                                        {exp.status === 'Approved' && isAccountantOrAdmin && (
                                            <button className="btn btn-sm btn-primary" onClick={() => onAction(exp.id, 'PAY')}>
                                                <PaymentIcon fontSize="small" /> Pay
                                            </button>
                                        )}
                                        {exp.status === 'Paid' && (
                                            <span style={{ fontSize: 11, color: '#10b981' }}>
                                                Posted <FilePresentIcon style={{ fontSize: 14 }} />
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                                    No expenditure requests found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExpenditureManager;
