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
        if (form.allocatedAmount <= 0) {
            alert('Allocation amount must be greater than zero');
            return;
        }
        onUpdate(form);
        setShowForm(false);
    };

    return (
        <div className="budget-planner">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Budget Management</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>Allocate and track departmental financial limits</p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                    <AddIcon style={{ fontSize: 18, marginRight: 8 }} />
                    New Allocation
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: 24, border: '1px solid var(--accent-blue)', background: 'rgba(59, 130, 246, 0.02)' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Allocate Budget</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 20 }}>
                            <div className="form-group">
                                <label>Department</label>
                                <select className="form-control" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                                    <option>Academic</option>
                                    <option>Administration</option>
                                    <option>Operations</option>
                                    <option>Extracurricular</option>
                                    <option>Feeding</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                    <option>Utilities</option>
                                    <option>Maintenance</option>
                                    <option>Feeding</option>
                                    <option>Academic Materials</option>
                                    <option>Salaries</option>
                                    <option>Transport</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Allocation (KES)</label>
                                <input
                                    className="form-control"
                                    type="number"
                                    value={form.allocatedAmount}
                                    onChange={(e) => setForm({ ...form, allocatedAmount: parseFloat(e.target.value) })}
                                    required
                                    min="1"
                                />
                            </div>
                            <div className="form-group">
                                <label>Financial Year</label>
                                <input
                                    className="form-control"
                                    type="number"
                                    value={form.year}
                                    onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className="btn-primary">Save Allocation</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="stats-grid">
                {budgets.map((b, i) => (
                    <div key={i} className="card premium-card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h4 style={{ margin: 0, fontSize: 16 }}>{b.category}</h4>
                                <span className="badge blue" style={{ marginTop: 8 }}>{b.department} • {b.year}</span>
                            </div>
                            <div className={`badge ${b.utilization > 90 ? 'red' : b.utilization > 75 ? 'orange' : 'green'}`}>
                                {b.utilization > 90 && <WarningIcon style={{ fontSize: 14, marginRight: 4 }} />}
                                {Math.round(b.utilization)}% Utilized
                            </div>
                        </div>

                        <div className="progress-container" style={{ marginTop: 20 }}>
                            <div className="progress-fill" style={{
                                width: `${Math.min(b.utilization, 100)}%`,
                                background: b.utilization > 90 ? 'var(--accent-red)' : b.utilization > 80 ? 'var(--accent-orange)' : 'var(--accent-blue)'
                            }}></div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                            <div>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Spent</span>
                                <span style={{ fontWeight: 600 }}>KES {b.spentAmount.toLocaleString()}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Remaining</span>
                                <span style={{ fontWeight: 600, color: (b.allocatedAmount - b.spentAmount) < 0 ? 'var(--accent-red)' : 'inherit' }}>
                                    KES {(b.allocatedAmount - b.spentAmount).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {budgets.length === 0 && (
                <div className="card text-center" style={{ padding: 60 }}>
                    <PieChartIcon style={{ fontSize: 48, color: 'var(--border-color)', marginBottom: 16 }} />
                    <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>No budgets defined for the current period</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Click "New Allocation" to set up your first budget.</p>
                </div>
            )}
        </div>
    );
};

export default BudgetPlanner;
