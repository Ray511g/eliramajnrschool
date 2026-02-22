import React, { useState, useCallback, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { FeePayment } from '../../types';
import AddIcon from '@mui/icons-material/Add';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import RecordPaymentModal from '../modals/RecordPaymentModal';
import ReceiptModal from '../modals/ReceiptModal';
import FeeStructureModal from '../modals/FeeStructureModal';
import Pagination from '../common/Pagination';

const FeeManager: React.FC = () => {
    const { students, payments, settings, updateGradeFees, deletePayment } = useSchool();
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<FeePayment | null>(null);
    const [showStructure, setShowStructure] = useState(false);

    // Filtering & Pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const totalFees = students.reduce((sum, s) => sum + s.totalFees, 0);
    const collected = students.reduce((sum, s) => sum + s.paidFees, 0);
    const pending = totalFees - collected;
    const collectionRate = totalFees > 0 ? Math.round((collected / totalFees) * 100) : 0;

    const filteredPayments = useMemo(() => {
        return payments.filter(p =>
            p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [payments, searchQuery]);

    const paginatedPayments = useMemo(() => {
        return filteredPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [filteredPayments, currentPage, itemsPerPage]);

    const generateStatementHTML = useCallback(() => {
        const schoolName = settings?.schoolName || 'School management system';
        const schoolPhone = settings?.phone || '+254 700 000 000';
        const schoolEmail = settings?.email || 'info@schoolsystem.ac.ke';
        const currentTerm = settings?.currentTerm || 'Term 1';
        const currentYear = settings?.currentYear || new Date().getFullYear();

        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Fee Statement - ${schoolName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #333; background: #fff; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #1a56db; }
        .header h1 { font-size: 24px; color: #1a56db; margin-bottom: 4px; }
        .header p { font-size: 12px; color: #666; }
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
        .summary-card { padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center; }
        .summary-card .value { font-size: 18px; font-weight: 700; }
        .summary-card .label { font-size: 11px; color: #666; margin-top: 4px; }
        .blue .value { color: #1a56db; }
        .green .value { color: #16a34a; }
        .red .value { color: #dc2626; }
        .purple .value { color: #7c3aed; }
        h2 { font-size: 16px; margin: 24px 0 12px; color: #1a56db; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-weight: 600; border: 1px solid #e2e8f0; }
        td { padding: 8px 10px; border: 1px solid #e2e8f0; }
        tr:nth-child(even) { background: #f8fafc; }
        .paid { color: #16a34a; font-weight: 600; }
        .pending { color: #dc2626; font-weight: 600; }
        .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #999; padding-top: 15px; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${schoolName}</h1>
        <p>${schoolPhone} | ${schoolEmail}</p>
        <p style="margin-top: 8px; font-size: 14px; font-weight: 600;">Fee Collection Statement - ${currentTerm} ${currentYear}</p>
    </div>
    <div class="summary-grid">
        <div class="summary-card blue"><div class="value">KSh ${totalFees.toLocaleString()}</div><div class="label">Total Expected</div></div>
        <div class="summary-card green"><div class="value">KSh ${collected.toLocaleString()}</div><div class="label">Collected</div></div>
        <div class="summary-card red"><div class="value">KSh ${pending.toLocaleString()}</div><div class="label">Pending</div></div>
        <div class="summary-card purple"><div class="value">${collectionRate}%</div><div class="label">Collection Rate</div></div>
    </div>
    <table>
        <thead>
            <tr><th>Student Name</th><th>Grade</th><th>Total Fees</th><th>Paid</th><th>Balance</th></tr>
        </thead>
        <tbody>
            ${students.map(s => `
                <tr>
                    <td>${s.firstName} ${s.lastName}</td>
                    <td>${s.grade}</td>
                    <td>KSh ${s.totalFees.toLocaleString()}</td>
                    <td class="paid">KSh ${s.paidFees.toLocaleString()}</td>
                    <td class="${s.feeBalance > 0 ? 'pending' : 'paid'}">KSh ${s.feeBalance.toLocaleString()}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;
    }, [students, settings, totalFees, collected, pending, collectionRate]);

    const handlePrint = () => {
        const html = generateStatementHTML();
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.onload = () => printWindow.print();
        }
    };

    return (
        <div className="fee-manager">
            <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
                <div className="toolbar-left">
                    <h2 style={{ fontSize: 18, fontWeight: 600 }}>Student Fee Management</h2>
                </div>
                <div className="toolbar-right" style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline" onClick={() => setShowStructure(true)}>
                        <LocalAtmIcon style={{ fontSize: 18 }} /> Fee Structure
                    </button>
                    <button className="btn btn-outline" onClick={handlePrint}>
                        <PrintIcon style={{ fontSize: 18 }} /> Print List
                    </button>
                    <button className="btn btn-primary green" onClick={() => setShowPayModal(true)}>
                        <AddIcon style={{ fontSize: 18 }} /> Record Payment
                    </button>
                </div>
            </div>

            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card blue">
                    <div className="stat-card-value">KSh {totalFees.toLocaleString()}</div>
                    <div className="stat-card-label">Total Expected</div>
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
                    <div className="stat-card-label">Rate</div>
                </div>
            </div>

            <div className="admin-grid">
                <div className="admin-section">
                    <h3 className="section-title">Recent Fee Payments</h3>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Receipt</th>
                                    <th>Student</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedPayments.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.receiptNumber}</td>
                                        <td>{p.studentName}</td>
                                        <td style={{ fontWeight: 600, color: '#10b981' }}>KSh {p.amount.toLocaleString()}</td>
                                        <td>{new Date(p.date).toLocaleDateString()}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="action-btn" onClick={() => setSelectedReceipt(p)}><ReceiptIcon fontSize="small" /></button>
                                                <button className="action-btn delete" onClick={() => deletePayment(p.id)}><DeleteIcon fontSize="small" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Pagination
                            totalItems={filteredPayments.length}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>

                <div className="admin-section">
                    <h3 className="section-title">Student Balances</h3>
                    <div className="table-container" style={{ maxHeight: 400, overflowY: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Balance</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(s => (
                                    <tr key={s.id}>
                                        <td>{s.firstName} {s.lastName}</td>
                                        <td style={{ fontWeight: 600, color: s.feeBalance > 0 ? '#ef4444' : '#10b981' }}>
                                            KES {s.feeBalance.toLocaleString()}
                                        </td>
                                        <td>
                                            <span className={`status-tag ${s.feeBalance === 0 ? 'active' : 'pending'}`}>
                                                {s.feeBalance === 0 ? 'Paid' : 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showPayModal && <RecordPaymentModal onClose={() => setShowPayModal(false)} />}
            {selectedReceipt && <ReceiptModal payment={selectedReceipt} onClose={() => setSelectedReceipt(null)} />}
            {showStructure && <FeeStructureModal onClose={() => setShowStructure(false)} />}
        </div>
    );
};

export default FeeManager;
