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

    const isPrincipalOrAdmin = user?.role === 'Super Admin' || user?.role === 'Principal' || user?.role === 'Admin';
    const isAccountantOrAdmin = user?.role === 'Super Admin' || user?.role === 'Accountant' || user?.role === 'Finance Officer' || user?.role === 'Admin';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (form.amount <= 0) {
            alert('Amount must be greater than zero');
            return;
        }
        onRequest(form);
        setShowForm(false);
        setForm({ category: 'Utilities', description: '', amount: 0, department: '' });
    };

    return (
        <div className="expenditure-manager">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Expenditure Requests</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>Manage school expense requests and approvals</p>
                </div>
                {isAccountantOrAdmin && (
                    <button className="btn-primary" onClick={() => setShowForm(true)}>
                        <AddIcon style={{ fontSize: 18, marginRight: 8 }} />
                        Raise Request
                    </button>
                )}
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: 24, border: '1px solid var(--accent-blue)', background: 'rgba(59, 130, 246, 0.02)' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>New Expense Request</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    className="form-control"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                >
                                    <option>Utilities</option>
                                    <option>Maintenance</option>
                                    <option>Feeding</option>
                                    <option>Academic Materials</option>
                                    <option>Administration</option>
                                    <option>Transport</option>
                                    <option>Salaries</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Amount (KES)</label>
                                <input
                                    className="form-control"
                                    type="number"
                                    value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
                                    required
                                    min="0.01"
                                    step="0.01"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Description / Particulars</label>
                            <input
                                className="form-control"
                                type="text"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="e.g. Electricity bill for Feb 2026"
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                            <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className="btn-primary">Submit for Approval</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-container card" style={{ padding: 0 }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th style={{ textAlign: 'right' }}>Amount</th>
                            <th>Status</th>
                            <th>Requested By</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
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
                                <td><span className="badge blue">{exp.category}</span></td>
                                <td style={{ textAlign: 'right', fontWeight: 600 }}>{exp.amount.toLocaleString()}</td>
                                <td>
                                    <span className={`badge ${exp.status === 'Paid' ? 'green' : exp.status === 'Approved' ? 'blue' : exp.status === 'Rejected' ? 'red' : ''}`}>
                                        {exp.status}
                                    </span>
                                </td>
                                <td>{exp.requestedByName}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                        {exp.status === 'Pending' && isPrincipalOrAdmin && (
                                            <>
                                                <button className="btn-outline" style={{ color: 'var(--accent-green)', borderColor: 'var(--accent-green)', padding: '4px 8px' }} onClick={() => onAction(exp.id, 'APPROVE')} title="Approve">
                                                    <CheckCircleIcon fontSize="small" />
                                                </button>
                                                <button className="btn-outline" style={{ color: 'var(--accent-red)', borderColor: 'var(--accent-red)', padding: '4px 8px' }} onClick={() => onAction(exp.id, 'REJECT')} title="Reject">
                                                    <CancelIcon fontSize="small" />
                                                </button>
                                            </>
                                        )}
                                        {exp.status === 'Approved' && isAccountantOrAdmin && (
                                            <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => onAction(exp.id, 'PAY')}>
                                                <PaymentIcon style={{ fontSize: 16, marginRight: 4 }} /> Pay
                                            </button>
                                        )}
                                        {exp.status === 'Paid' && (
                                            <span style={{ fontSize: 12, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <FilePresentIcon style={{ fontSize: 16 }} /> Posted
                                            </span>
                                        )}
                                        {exp.status === 'Rejected' && (
                                            <span style={{ fontSize: 12, color: 'var(--accent-red)' }}>Rejected</span>
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
