import React from 'react';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PieChartIcon from '@mui/icons-material/PieChart';

interface FinanceDashboardProps {
    stats: any;
}

const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ stats }) => {
    if (!stats) return <div>Loading Stats...</div>;

    const cards = [
        { label: 'Total Income', value: stats.stats.totalIncome, icon: <TrendingUpIcon />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
        { label: 'Total Expenses', value: stats.stats.totalExpenses, icon: <TrendingDownIcon />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
        { label: 'Payroll Total', value: stats.stats.payrollTotal, icon: <GroupIcon />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
        { label: 'Net Balance', value: stats.stats.netBalance, icon: <AccountBalanceWalletIcon />, color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.1)' },
        { label: 'Outstanding Fees', value: stats.stats.outstandingFees, icon: <ReceiptLongIcon />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
        { label: 'Budget Utilized', value: `${Math.round(stats.stats.budgetUtilization)}%`, icon: <PieChartIcon />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    ];

    return (
        <div className="finance-dashboard">
            <div className="stats-grid">
                {cards.map((card, i) => (
                    <div key={i} className="stat-card premium-card">
                        <div className="stat-icon" style={{ backgroundColor: card.bg, color: card.color }}>
                            {card.icon}
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">{card.label}</span>
                            <span className="stat-value">KES {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="admin-grid" style={{ marginTop: 24 }}>
                <div className="admin-section">
                    <h3 className="section-title">Monthly Cash Flow</h3>
                    <div className="chart-placeholder" style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 12, paddingBottom: 20 }}>
                        {stats.cashFlow.map((d: any, i: number) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: '100%', display: 'flex', gap: 4, height: 150, alignItems: 'flex-end' }}>
                                    <div style={{ flex: 1, background: '#10b981', height: `${(d.income / stats.stats.totalIncome) * 100}%`, borderRadius: '4px 4px 0 0' }}></div>
                                    <div style={{ flex: 1, background: '#ef4444', height: `${(d.expense / stats.stats.totalExpenses) * 100}%`, borderRadius: '4px 4px 0 0' }}></div>
                                </div>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.month}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 12, height: 12, background: '#10b981', borderRadius: 2 }}></div>
                            <span>Income</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 12, height: 12, background: '#ef4444', borderRadius: 2 }}></div>
                            <span>Expenses</span>
                        </div>
                    </div>
                </div>

                <div className="admin-section">
                    <h3 className="section-title">Budget Utilization</h3>
                    <div className="budget-list" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {stats.budgets.length > 0 ? stats.budgets.map((b: any, i: number) => (
                            <div key={i} className="budget-item">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                                    <span>{b.category} ({b.department})</span>
                                    <span style={{ fontWeight: 600 }}>{Math.round(b.utilization)}%</span>
                                </div>
                                <div className="progress-bg" style={{ height: 8, background: 'var(--bg-surface)', borderRadius: 4, overflow: 'hidden' }}>
                                    <div className="progress-fill" style={{
                                        height: '100%',
                                        width: `${Math.min(b.utilization, 100)}%`,
                                        background: b.utilization > 90 ? '#ef4444' : b.utilization > 70 ? '#f59e0b' : '#10b981'
                                    }}></div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                                    <span>Spent: KES {b.spentAmount.toLocaleString()}</span>
                                    <span>Limit: KES {b.allocatedAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                                No budgets defined for the current period.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceDashboard;
