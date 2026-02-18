import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import AddIcon from '@mui/icons-material/Add';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';
import PrintIcon from '@mui/icons-material/Print';
import LocalAtmIcon from '@mui/icons-material/LocalAtm'; // Added import
import RecordPaymentModal from '../../components/modals/RecordPaymentModal';
import ReceiptModal from '../../components/modals/ReceiptModal';
import FeeStructureModal from '../../components/modals/FeeStructureModal'; // Added import
import { FeePayment } from '../../types';

export default function Fees() {
    const { students, payments, gradeFees, updateGradeFees } = useSchool();
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<FeePayment | null>(null);
    const [editingGrade, setEditingGrade] = useState<string | null>(null);
    const [tempAmount, setTempAmount] = useState<number>(0);
    const [showStructure, setShowStructure] = useState(false);

    const totalFees = students.reduce((sum, s) => sum + s.totalFees, 0);
    const collected = students.reduce((sum, s) => sum + s.paidFees, 0);
    const pending = totalFees - collected;
    const collectionRate = totalFees > 0 ? Math.round((collected / totalFees) * 100) : 0;

    const startEdit = (grade: string, amount: number) => {
        setEditingGrade(grade);
        setTempAmount(amount);
    };

    const handleSaveFees = () => {
        if (editingGrade) {
            updateGradeFees(editingGrade, tempAmount);
            setEditingGrade(null);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Fee Management</h1>
                    <p>Track and manage student fee payments</p>
                </div>
                <div className="page-header-right" style={{ display: 'flex', gap: 12 }}>
                    <button className="btn-outline" onClick={() => setShowStructure(true)}> {/* Added button */}
                        <LocalAtmIcon style={{ fontSize: 18 }} /> View Fee Structure
                    </button>
                    <button className="btn-outline" onClick={() => {
                        const win = window.open('', '_blank');
                        if (win) {
                            win.document.write(`
                                <html>
                                <head><title>Fee Collection Report</title><style>body{font-family:sans-serif;padding:30px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:10px;text-align:left}th{background:#f8fafc}</style></head>
                                <body>
                                    <h1>Fee Collection Summary - ${new Date().toLocaleDateString()}</h1>
                                    <table>
                                        <tr><th>Total Expected</th><td>KSh ${totalFees.toLocaleString()}</td></tr>
                                        <tr><th>Collected</th><td>KSh ${collected.toLocaleString()}</td></tr>
                                        <tr><th>Pending Balance</th><td>KSh ${pending.toLocaleString()}</td></tr>
                                        <tr><th>Collection Rate</th><td>${collectionRate}%</td></tr>
                                    </table>
                                    <h2 style="margin-top:20px">Recent Payments</h2>
                                    <table>
                                        <thead><tr><th>Receipt</th><th>Student</th><th>Grade</th><th>Amount</th><th>Date</th></tr></thead>
                                        <tbody>
                                            ${payments.slice(-20).reverse().map(p => `
                                                <tr>
                                                    <td>${p.receiptNumber}</td>
                                                    <td>${p.studentName}</td>
                                                    <td>${p.grade}</td>
                                                    <td>KSh ${p.amount.toLocaleString()}</td>
                                                    <td>${new Date(p.date).toLocaleDateString()}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </body>
                                </html>
                            `);
                            win.document.close();
                            win.print();
                        }
                    }}>
                        <PrintIcon style={{ fontSize: 18 }} /> Export Summary
                    </button>
                    <button className="btn-primary green" onClick={() => setShowPayModal(true)}>
                        <AddIcon style={{ fontSize: 18 }} /> Record Payment
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card blue">
                    <div className="stat-card-value">KSh {totalFees.toLocaleString()}</div>
                    <div className="stat-card-label">Total Expected Fees</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-card-value">KSh {collected.toLocaleString()}</div>
                    <div className="stat-card-label">Collected</div>
                </div>
                <div className="stat-card red">
                    <div className="stat-card-value">KSh {pending.toLocaleString()}</div>
                    <div className="stat-card-label">Pending</div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-card-value">{collectionRate}%</div>
                    <div className="stat-card-label">Collection Rate</div>
                </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: 24, marginTop: 24 }}>
                <div className="dashboard-card">
                    <div className="dashboard-card-title">
                        <PaymentIcon style={{ fontSize: 20 }} /> Recent Payments
                    </div>
                    <div className="data-table-wrapper" style={{ marginTop: 16 }}>
                        {payments.length === 0 ? (
                            <div className="empty-state">
                                <PaymentIcon className="empty-state-icon" />
                                <p>No payments recorded yet</p>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Receipt #</th>
                                        <th>Student</th>
                                        <th>Amount</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...payments].reverse().slice(0, 10).map(payment => (
                                        <tr key={payment.id}>
                                            <td>{payment.receiptNumber}</td>
                                            <td>{payment.studentName}</td>
                                            <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>KSh {payment.amount.toLocaleString()}</td>
                                            <td>{new Date(payment.date).toLocaleDateString()}</td>
                                            <td>
                                                <button className="table-action-btn" title="View/Print Receipt" onClick={() => setSelectedReceipt(payment)}>
                                                    <ReceiptIcon style={{ fontSize: 16 }} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="dashboard-card-title">
                        <SettingsIcon style={{ fontSize: 20 }} /> Grade Fee Structure
                    </div>
                    <div style={{ marginTop: 16 }}>
                        {Object.entries(gradeFees).map(([grade, amount]) => (
                            <div key={grade} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 0',
                                borderBottom: '1px solid var(--border-color)'
                            }}>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 500 }}>{grade}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Per Term</div>
                                </div>
                                {editingGrade === grade ? (
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={{ width: 100, padding: '4px 8px' }}
                                            value={tempAmount}
                                            onChange={e => setTempAmount(Number(e.target.value))}
                                            autoFocus
                                        />
                                        <button className="table-action-btn green" onClick={handleSaveFees}>✓</button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontWeight: 600 }}>KSh {amount.toLocaleString()}</span>
                                        <button className="table-action-btn" onClick={() => startEdit(grade, amount)}>
                                            <SettingsIcon style={{ fontSize: 14 }} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Fee Balance by Student */}
            {students.length > 0 && (
                <div className="dashboard-card" style={{ marginTop: 24 }}>
                    <div className="dashboard-card-title">
                        <ReceiptIcon style={{ fontSize: 20 }} /> Student Fee Balances
                    </div>
                    <div className="data-table-wrapper" style={{ marginTop: 16 }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Grade</th>
                                    <th>Total Fees</th>
                                    <th>Paid</th>
                                    <th>Balance</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(s => (
                                    <tr key={s.id}>
                                        <td>{s.firstName} {s.lastName}</td>
                                        <td>{s.grade}</td>
                                        <td>KSh {s.totalFees.toLocaleString()}</td>
                                        <td style={{ color: 'var(--accent-green)' }}>KSh {s.paidFees.toLocaleString()}</td>
                                        <td style={{ color: s.feeBalance > 0 ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 600 }}>
                                            KSh {s.feeBalance.toLocaleString()}
                                        </td>
                                        <td>
                                            <span className={`badge ${s.feeBalance === 0 ? 'green' : s.feeBalance < s.totalFees / 2 ? 'orange' : 'red'}`}>
                                                {s.feeBalance === 0 ? 'Paid' : 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showPayModal && <RecordPaymentModal onClose={() => setShowPayModal(false)} />}
            {selectedReceipt && <ReceiptModal payment={selectedReceipt} onClose={() => setSelectedReceipt(null)} />}
            {showStructure && <FeeStructureModal onClose={() => setShowStructure(false)} />}
        </div>
    );
}
