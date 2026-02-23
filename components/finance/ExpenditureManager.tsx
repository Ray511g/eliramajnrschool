import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PaymentsIcon from '@mui/icons-material/Payments';
import FilePresentIcon from '@mui/icons-material/FilePresent';

const ExpenditureManager: React.FC = () => {
    const { user, hasPermission } = useAuth();
    const { expenses, suppliers, requestExpenditure, actOnExpenditure } = useSchool();

    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        category: '',
        amount: 0,
        description: '',
        supplierId: '',
        paymentMethod: 'Bank' as 'Bank' | 'Cash' | 'M-Pesa'
    });

    const filteredExpenses = (expenses || []).filter(e =>
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const requestedByName = user?.name || 'Unknown';
        await requestExpenditure({
            ...form,
            requestedBy: user?.id || 'unknown',
            requestedByName: requestedByName
        });
        setForm({ category: '', amount: 0, description: '', supplierId: '', paymentMethod: 'Bank' });
    };

    const canApprove = hasPermission('finance', 'APPROVE');
    const canPay = hasPermission('finance', 'PAY');

    return (
        <div className="expenditure-manager animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700 }}>Expenditure Controls</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Request and approve school expenses</p>
                </div>
                {!showForm && (
                    <button className="btn-primary" onClick={() => setShowForm(true)}>
                        <AddIcon style={{ fontSize: 18, marginRight: 8 }} />
                        Raise Request
                    </button>
                )}
            </div>

            {showForm && (
                <div className="card glass-panel" style={{ marginBottom: 24, padding: 24 }}>
                    <h3 style={{ marginBottom: 20 }}>New Expense Request</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid-3">
                            <div className="form-group">
                                <label>Category / Purpose</label>
                                <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} title="Category" required>
                                    <option value="">Select...</option>
                                    <option value="Operational">Operational</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Supplies">Supplies</option>
                                    <option value="Academic">Academic</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Amount (KES)</label>
                                <input type="number" className="form-control" value={form.amount || ''} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} title="Amount" required />
                            </div>
                            <div className="form-group">
                                <label>Supplier (Optional)</label>
                                <select className="form-control" value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })} title="Supplier">
                                    <option value="">N/A / Walk-in</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: 16 }}>
                            <label>Detailed Description</label>
                            <textarea className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What the funds will be used for..." title="Description" required rows={3}></textarea>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                            <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className="btn-primary">Submit for Approval</button>
                        </div>
                    </form>
                </div>
            )}

            {!showForm && (
                <>
                    <div className="search-box" style={{ marginBottom: 20, maxWidth: 400 }}>
                        <SearchIcon />
                        <input type="text" placeholder="Search requests..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} title="Search" />
                    </div>

                    <div className="table-container card" style={{ padding: 0 }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Requestor</th>
                                    <th style={{ textAlign: 'right' }}>Amount</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.length > 0 ? filteredExpenses.map(exp => (
                                    <tr key={exp.id}>
                                        <td>{new Date(exp.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{exp.category}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{exp.description}</div>
                                            {exp.supplierId && (
                                                <div style={{ fontSize: 10, color: 'var(--accent-blue)' }}>
                                                    Supplier: {suppliers.find(s => s.id === exp.supplierId)?.name || 'Unknown'}
                                                </div>
                                            )}
                                        </td>
                                        <td>{exp.requestedBy}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 700 }}>KES {exp.amount.toLocaleString()}</td>
                                        <td>
                                            <span className={`badge ${exp.status === 'Paid' ? 'green' : exp.status === 'Approved' ? 'blue' : exp.status === 'Pending' ? 'orange' : 'red'}`}>
                                                {exp.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                {exp.status === 'Pending' && canApprove && (
                                                    <>
                                                        <button className="table-action-btn" onClick={() => actOnExpenditure(exp.id, 'APPROVE')} title="Approve Request">
                                                            <CheckCircleIcon style={{ fontSize: 16, color: 'var(--accent-green)' }} />
                                                        </button>
                                                        <button className="table-action-btn danger" onClick={() => actOnExpenditure(exp.id, 'REJECT')} title="Reject Request">
                                                            <CancelIcon style={{ fontSize: 16 }} />
                                                        </button>
                                                    </>
                                                )}
                                                {exp.status === 'Approved' && canPay && (
                                                    <button className="table-action-btn" onClick={() => actOnExpenditure(exp.id, 'PAY')} title="Process Payment">
                                                        <PaymentsIcon style={{ fontSize: 16, color: 'var(--accent-blue)' }} />
                                                    </button>
                                                )}
                                                {exp.status === 'Paid' && <FilePresentIcon style={{ fontSize: 16, opacity: 0.3 }} />}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No expense requests found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default ExpenditureManager;
