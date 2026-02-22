import React, { useState } from 'react';
import PieChartIcon from '@mui/icons-material/PieChart';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';

interface BudgetPlannerProps {
    budgets: any[];
    onUpdate: (data: any) => void;
}

const BudgetPlanner: React.FC<BudgetPlannerProps> = ({ budgets, onUpdate }) => {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        year: new Date().getFullYear(),
        department: 'Academic',
        category: 'Utilities',
        allocatedAmount: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(form);
        setShowForm(false);
    };

    return (
        <div className="budget-planner">
            <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
                <div className="toolbar-left">
                    <h2 style={{ fontSize: 18, fontWeight: 600 }}>Budget Allocation</h2>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <AddIcon /> New Allocation
                </button>
            </div>

            {showForm && (
                <div className="admin-section" style={{ marginBottom: 24 }}>
                    <h3 className="section-title">Allocate Budget</h3>
                    <form onSubmit={handleSubmit} className="premium-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Department</label>
                                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                                    <option>Academic</option>
                                    <option>Administration</option>
                                    <option>Operations</option>
                                    <option>Extracurricular</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                    <option>Utilities</option>
                                    <option>Maintenance</option>
                                    <option>Feeding</option>
                                    <option>Academic Materials</option>
                                    <option>Salaries</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Allocation Amount (KES)</label>
                                <input
                                    type="number"
                                    value={form.allocatedAmount}
                                    onChange={(e) => setForm({ ...form, allocatedAmount: parseFloat(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Year</label>
                                <input
                                    type="number"
                                    value={form.year}
                                    onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Save Allocation</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="admin-grid">
                {budgets.map((b, i) => (
                    <div key={i} className="admin-section budget-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h4 style={{ margin: 0 }}>{b.category}</h4>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.department} • {b.year}</span>
                            </div>
                            <div style={{
                                padding: '4px 8px',
                                borderRadius: 4,
                                fontSize: 12,
                                background: b.utilization > 90 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                color: b.utilization > 90 ? '#ef4444' : '#10b981'
                            }}>
                                {b.utilization > 90 && <WarningIcon style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }} />}
                                {Math.round(b.utilization)}% Used
                            </div>
                        </div>

                        <div style={{ marginTop: 16 }}>
                            <div className="progress-bg" style={{ height: 10, background: 'var(--bg-surface)', borderRadius: 5, overflow: 'hidden' }}>
                                <div className="progress-fill" style={{
                                    height: '100%',
                                    width: `${Math.min(b.utilization, 100)}%`,
                                    background: b.utilization > 90 ? '#ef4444' : b.utilization > 80 ? '#f59e0b' : 'var(--accent-blue)'
                                }}></div>
                            </div>
                        </div>

                        <div className="budget-details" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                            <div className="detail-item">
                                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Spent</span>
                                <span style={{ fontWeight: 600 }}>KES {b.spentAmount.toLocaleString()}</span>
                            </div>
                            <div className="detail-item">
                                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Remaining</span>
                                <span style={{ fontWeight: 600 }}>KES {(b.allocatedAmount - b.spentAmount).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BudgetPlanner;
