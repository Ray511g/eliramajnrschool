import React, { useState } from 'react';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';

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

    const isAdminOrPrincipal = user?.role === 'Super Admin' || user?.role === 'Principal';

    return (
        <div className="payroll-manager">
            <div className="tabs" style={{ marginBottom: 20 }}>
                <button
                    className={`tab ${activeTab === 'payroll' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payroll')}
                >
                    Monthly Payroll
                </button>
                <button
                    className={`tab ${activeTab === 'staff' ? 'active' : ''}`}
                    onClick={() => setActiveTab('staff')}
                >
                    Staff Salaries config
                </button>
            </div>

            {activeTab === 'payroll' ? (
                <div className="payroll-entries">
                    <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
                        <div className="toolbar-left" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <select
                                value={generateConfig.month}
                                onChange={(e) => setGenerateConfig({ ...generateConfig, month: parseInt(e.target.value) })}
                                style={{ width: 120 }}
                            >
                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                                    <option key={i} value={i + 1}>{m}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                value={generateConfig.year}
                                onChange={(e) => setGenerateConfig({ ...generateConfig, year: parseInt(e.target.value) })}
                                style={{ width: 100 }}
                            />
                            <button className="btn btn-primary" onClick={() => onGenerate(generateConfig.month, generateConfig.year)}>
                                Generate Payroll
                            </button>
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Staff Name</th>
                                    <th>Basic Salary</th>
                                    <th>Allowances</th>
                                    <th>Deductions</th>
                                    <th>Net Pay</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payrollEntries.length > 0 ? payrollEntries.filter(e => e.month === generateConfig.month && e.year === generateConfig.year).map((entry) => (
                                    <tr key={entry.id}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{entry.staff.firstName} {entry.staff.lastName}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{entry.staff.role}</div>
                                        </td>
                                        <td>KES {entry.basicSalary.toLocaleString()}</td>
                                        <td style={{ color: '#10b981' }}>+ KES {entry.totalAllowances.toLocaleString()}</td>
                                        <td style={{ color: '#ef4444' }}>- KES {entry.totalDeductions.toLocaleString()}</td>
                                        <td style={{ fontWeight: 600 }}>KES {entry.netPay.toLocaleString()}</td>
                                        <td>
                                            <span className={`status-tag ${entry.status.toLowerCase()}`}>
                                                {entry.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                {entry.status === 'Draft' && (
                                                    <button className="btn btn-sm btn-ghost" onClick={() => onUpdateStatus(entry.id, 'Reviewed')}>
                                                        Mark Reviewed
                                                    </button>
                                                )}
                                                {entry.status === 'Reviewed' && isAdminOrPrincipal && (
                                                    <button className="btn btn-sm btn-primary" onClick={() => onUpdateStatus(entry.id, 'Approved')}>
                                                        <SaveIcon fontSize="small" /> Approve
                                                    </button>
                                                )}
                                                {entry.status === 'Approved' && isAdminOrPrincipal && (
                                                    <button className="btn btn-sm btn-danger" onClick={() => onUpdateStatus(entry.id, 'Locked')}>
                                                        <LockIcon fontSize="small" /> Lock & Post
                                                    </button>
                                                )}
                                                {entry.status === 'Locked' && (
                                                    <button className="action-btn" title="View Payslip">
                                                        <ReceiptIcon fontSize="small" />
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
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Role</th>
                                    <th>Basic Salary</th>
                                    <th>Bank Account</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.map((s) => (
                                    <tr key={s.id}>
                                        <td>{s.firstName} {s.lastName}</td>
                                        <td><span className="badge">{s.type.replace('_', ' ')}</span></td>
                                        <td>{s.role}</td>
                                        <td style={{ fontWeight: 600 }}>KES {s.basicSalary.toLocaleString()}</td>
                                        <td>{s.bankName || 'Not Set'}</td>
                                        <td>
                                            <span className={`status-tag ${s.status === 'Active' ? 'active' : 'inactive'}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="action-btn">
                                                <VisibilityIcon fontSize="small" />
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
