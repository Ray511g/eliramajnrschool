import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import AddIcon from '@mui/icons-material/Add';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import RecordPaymentModal from '../components/modals/RecordPaymentModal';
import ReceiptModal from '../components/modals/ReceiptModal';
import { FeePayment } from '../types';

export default function Fees() {
    const { students, payments } = useSchool();
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<FeePayment | null>(null);

    const totalFees = students.reduce((sum, s) => sum + s.totalFees, 0);
    const collected = students.reduce((sum, s) => sum + s.paidFees, 0);
    const pending = totalFees - collected;
    const collectionRate = totalFees > 0 ? Math.round((collected / totalFees) * 100) : 0;

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Fee Management</h1>
                    <p>Track and manage student fee payments</p>
                </div>
                <div className="page-header-right">
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

            <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <PaymentIcon style={{ fontSize: 20 }} /> Recent Payments
            </h3>

            <div className="data-table-wrapper">
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
                                <th>Grade</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...payments].reverse().map(payment => (
                                <tr key={payment.id}>
                                    <td>{payment.receiptNumber}</td>
                                    <td>{payment.studentName}</td>
                                    <td>{payment.grade}</td>
                                    <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>KSh {payment.amount.toLocaleString()}</td>
                                    <td><span className="badge blue">{payment.method}</span></td>
                                    <td>{new Date(payment.date).toLocaleDateString()}</td>
                                    <td>
                                        <button className="table-action-btn" title="View Receipt" onClick={() => setSelectedReceipt(payment)}>
                                            <ReceiptIcon style={{ fontSize: 16 }} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Fee Balance by Student */}
            {students.length > 0 && (
                <>
                    <h3 style={{ margin: '24px 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ReceiptIcon style={{ fontSize: 20 }} /> Student Fee Balances
                    </h3>
                    <div className="data-table-wrapper">
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
                </>
            )}

            {showPayModal && <RecordPaymentModal onClose={() => setShowPayModal(false)} />}
            {selectedReceipt && <ReceiptModal payment={selectedReceipt} onClose={() => setSelectedReceipt(null)} />}
        </div>
    );
}
