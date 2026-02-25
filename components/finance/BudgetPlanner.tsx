import React, { useState } from 'react';
import PieChartIcon from '@mui/icons-material/PieChart';
import AddIcon from '@mui/icons-material/Add';
import WarningIcon from '@mui/icons-material/Warning';
import { useSchool } from '../../context/SchoolContext';
import AddBudgetAllocationModal from '../modals/AddBudgetAllocationModal';

interface BudgetPlannerProps {
    budgets?: any[];
    onUpdate?: (data: any) => void;
}

const BudgetPlanner: React.FC<BudgetPlannerProps> = (props) => {
    const context = useSchool();
    const budgets = props.budgets || context.budgets || [];
    const onUpdate = props.onUpdate || (async (data: any) => {
        const res = await context.tryApi('/api/finance/budgets', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        if (res) {
            context.showToast('Budget allocated', 'success');
            context.refreshData();
        }
    });

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="budget-planner animate-in">
            <div className="finance-toolbar">
                <div>
                    <h2 className="section-title">Budget Management</h2>
                    <p className="text-muted text-xs">Allocate and track departmental financial limits</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} title="Add new budget allocation" aria-label="New Allocation">
                    <AddIcon className="mr-2" style={{ fontSize: 18 }} />
                    New Allocation
                </button>
            </div>

            <div className="finance-stats-container">
                {budgets.length > 0 ? budgets.map((b, i) => (
                    <div key={i} className="stat-card blue" style={{ height: 'auto', textAlign: 'left', display: 'block' }}>
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
                                background: b.utilization > 90 ? '#ef4444' : b.utilization > 80 ? '#f59e0b' : '#3b82f6'
                            }}></div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                            <div>
                                <span className="text-muted text-xs uppercase block">Spent</span>
                                <span style={{ fontWeight: 600 }}>KES {b.spentAmount.toLocaleString()}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-muted text-xs uppercase block">Remaining</span>
                                <span style={{ fontWeight: 600, color: (b.allocatedAmount - b.spentAmount) < 0 ? '#ef4444' : 'inherit' }}>
                                    KES {(b.allocatedAmount - b.spentAmount).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="p-20 text-center text-muted" style={{ gridColumn: '1 / -1', background: 'var(--bg-secondary)', borderRadius: 12, width: '100%' }}>
                        <PieChartIcon style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }} />
                        <h3 style={{ margin: 0 }}>No budgets defined for the current period</h3>
                        <p style={{ fontSize: 14 }}>Click "New Allocation" to set up your first budget.</p>
                    </div>
                )}
            </div>

            <AddBudgetAllocationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={onUpdate}
            />
        </div>
    );
};

export default BudgetPlanner;
