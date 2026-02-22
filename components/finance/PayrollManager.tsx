import React, { useState } from 'react';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface PayrollManagerProps {
    staff: any[];
    payrollEntries: any[];
    onGenerate: (month: number, year: number) => void;
    onUpdateStatus: (id: string, status: string) => void;
    user: any;
}

const PayrollManager: React.FC<PayrollManagerProps> = ({ staff, payrollEntries, onGenerate, onUpdateStatus, user }) => {
    const [activeTab, setActiveTab] = useState<'staff' | 'payroll'>('payroll');
    const [generateConfig, setGenerateConfig] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });

    const isAdminOrPrincipal = user?.role === 'Super Admin' || user?.role === 'Principal' || user?.role === 'Admin';

    return (
        <div className="payroll-manager">
            <div className="tab-nav">
                <button
                    className={`tab-btn ${activeTab === 'payroll' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payroll')}
                >
                    <ReceiptIcon style={{ fontSize: 20 }} /> Monthly Payroll
                </button>
                <button
                    className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
                    onClick={() => setActiveTab('staff')}
                >
                    <GroupIcon style={{ fontSize: 20 }} /> Staff Salary Configuration
                </button>
            </div>

            {activeTab === 'payroll' ? (
                <div className="payroll-entries">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Payroll Processing</h2>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>Review and approve monthly staff payments</p>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <select
                                className="form-control"
                                value={generateConfig.month}
                                onChange={(e) => setGenerateConfig({ ...generateConfig, month: parseInt(e.target.value) })}
                                style={{ width: 140 }}
                                title="Select Month"
                            >
                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                                    <option key={i} value={i + 1}>{m}</option>
                                ))}
                            </select>
                            <input
                                className="form-control"
                                type="number"
                                value={generateConfig.year}
                                onChange={(e) => setGenerateConfig({ ...generateConfig, year: parseInt(e.target.value) })}
                                style={{ width: 100 }}
                                title="Select Year"
                            />
                            <button className="btn-primary" onClick={() => onGenerate(generateConfig.month, generateConfig.year)}>
                                <PlayArrowIcon style={{ fontSize: 18, marginRight: 4 }} /> Generate
                            </button>
                        </div>
                    </div>

                    <div className="table-container card" style={{ padding: 0 }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Staff Name</th>
                                    <th style={{ textAlign: 'right' }}>Basic Salary</th>
                                    <th style={{ textAlign: 'right' }}>Allowances</th>
                                    <th style={{ textAlign: 'right' }}>Deductions</th>
                                    <th style={{ textAlign: 'right' }}>Net Pay</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payrollEntries.length > 0 ? payrollEntries.filter(e => e.month === generateConfig.month && e.year === generateConfig.year).map((entry) => (
                                    <tr key={entry.id}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{entry.staff.firstName} {entry.staff.lastName}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{entry.staff.role}</div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>{entry.basicSalary.toLocaleString()}</td>
                                        <td style={{ textAlign: 'right', color: 'var(--accent-green)' }}>+ {entry.totalAllowances.toLocaleString()}</td>
                                        <td style={{ textAlign: 'right', color: 'var(--accent-red)' }}>- {entry.totalDeductions.toLocaleString()}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{entry.netPay.toLocaleString()}</td>
                                        <td>
                                            <span className={`badge ${entry.status === 'Locked' ? 'green' : entry.status === 'Approved' ? 'blue' : entry.status === 'Draft' ? 'neutral' : 'blue'}`}>
                                                {entry.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                {entry.status === 'Draft' && (
                                                    <button className="btn-outline" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => onUpdateStatus(entry.id, 'Reviewed')}>
                                                        Mark Reviewed
                                                    </button>
                                                )}
                                                {entry.status === 'Reviewed' && isAdminOrPrincipal && (
                                                    <button className="btn-primary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => onUpdateStatus(entry.id, 'Approved')}>
                                                        <SaveIcon style={{ fontSize: 14, marginRight: 4 }} /> Approve
                                                    </button>
                                                )}
                                                {entry.status === 'Approved' && isAdminOrPrincipal && (
                                                    <button className="btn-primary" style={{ padding: '4px 12px', fontSize: 12, background: 'var(--accent-red)' }} onClick={() => onUpdateStatus(entry.id, 'Locked')}>
                                                        <LockIcon style={{ fontSize: 14, marginRight: 4 }} /> Lock & Post
                                                    </button>
                                                )}
                                                {entry.status === 'Locked' && (
                                                    <button className="btn-outline" style={{ padding: '4px 8px' }} title="View Payslip">
                                                        <VisibilityIcon style={{ fontSize: 16 }} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                                            No payroll entries for this period. Click Generate to start.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="staff-config">
                    <div style={{ marginBottom: 20 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Staff Remuneration</h2>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>Configure basic salaries and payment methods for employees</p>
                    </div>
                    <div className="table-container card" style={{ padding: 0 }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Role</th>
                                    <th style={{ textAlign: 'right' }}>Basic Salary</th>
                                    <th>Bank Account</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.map((s) => (
                                    <tr key={s.id}>
                                        <td style={{ fontWeight: 500 }}>{s.firstName} {s.lastName}</td>
                                        <td><span className="badge blue">{s.type.replace('_', ' ')}</span></td>
                                        <td>{s.role}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{s.basicSalary.toLocaleString()}</td>
                                        <td>
                                            <div style={{ fontSize: 13 }}>{s.bankName || 'Not Set'}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.bankAccountNumber}</div>
                                        </td>
                                        <td>
                                            <span className={`badge ${s.status === 'Active' ? 'green' : 'neutral'}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="btn-outline" style={{ padding: '4px 8px' }}>
                                                <VisibilityIcon style={{ fontSize: 16 }} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayrollManager;
