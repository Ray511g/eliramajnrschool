import React, { useState, useCallback, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { FeePayment } from '../../types';
import AddIcon from '@mui/icons-material/Add';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import RecordPaymentModal from '../../components/modals/RecordPaymentModal';
import ReceiptModal from '../../components/modals/ReceiptModal';
import FeeStructureModal from '../../components/modals/FeeStructureModal';
import Pagination from '../../components/common/Pagination';

export default function Fees() {
    const { students, payments, settings, gradeFees, updateGradeFees, deletePayment } = useSchool();
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<FeePayment | null>(null);
    const [editingGrade, setEditingGrade] = useState<string | null>(null);
    const [tempAmount, setTempAmount] = useState<number>(0);
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

    // Generate fee statement HTML (reusable for print and download)
    const generateStatementHTML = useCallback(() => {
        const schoolName = settings?.schoolName || 'ELIRAMA SCHOOL';
        const schoolPhone = settings?.phone || '+254 700 000 000';
        const schoolEmail = settings?.email || 'info@elirama.ac.ke';
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
        @media print {
            body { padding: 15px; }
            .summary-grid { gap: 8px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${schoolName}</h1>
        <p>${schoolPhone} | ${schoolEmail}</p>
        <p style="margin-top: 8px; font-size: 14px; font-weight: 600;">Fee Collection Statement - ${currentTerm} ${currentYear}</p>
        <p style="margin-top: 4px;">Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>

    <div class="summary-grid">
        <div class="summary-card blue"><div class="value">KSh ${totalFees.toLocaleString()}</div><div class="label">Total Expected</div></div>
        <div class="summary-card green"><div class="value">KSh ${collected.toLocaleString()}</div><div class="label">Collected</div></div>
        <div class="summary-card red"><div class="value">KSh ${pending.toLocaleString()}</div><div class="label">Pending</div></div>
        <div class="summary-card purple"><div class="value">${collectionRate}%</div><div class="label">Collection Rate</div></div>
    </div>

    <h2>Student Fee Balances</h2>
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Admission No.</th>
                <th>Student Name</th>
                <th>Grade</th>
                <th>Total Fees</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${students.map((s, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td>${s.admissionNumber}</td>
                    <td>${s.firstName} ${s.lastName}</td>
                    <td>${s.grade}</td>
                    <td>KSh ${s.totalFees.toLocaleString()}</td>
                    <td class="paid">KSh ${s.paidFees.toLocaleString()}</td>
                    <td class="${s.feeBalance > 0 ? 'pending' : 'paid'}">KSh ${s.feeBalance.toLocaleString()}</td>
                    <td>${s.feeBalance === 0 ? '✅ Paid' : '⏳ Pending'}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    ${payments.length > 0 ? `
    <h2>Recent Payments (Last 20)</h2>
    <table>
        <thead>
            <tr><th>Receipt #</th><th>Student</th><th>Grade</th><th>Amount</th><th>Method</th><th>Date</th></tr>
        </thead>
        <tbody>
            ${[...payments].reverse().slice(0, 20).map(p => `
                <tr>
                    <td>${p.receiptNumber}</td>
                    <td>${p.studentName}</td>
                    <td>${p.grade}</td>
                    <td class="paid">KSh ${p.amount.toLocaleString()}</td>
                    <td>${p.method}</td>
                    <td>${new Date(p.date).toLocaleDateString()}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    ` : ''}

    <div class="footer">
        <p>${schoolName} - ${currentTerm} ${currentYear} Fee Statement</p>
        <p>This is a computer-generated document. No signature required.</p>
    </div>
</body>
</html>`;
    }, [students, payments, settings, totalFees, collected, pending, collectionRate]);

    // Download fee statement as HTML file
    const handleDownload = useCallback(() => {
        const html = generateStatementHTML();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Fee_Statement_${settings?.currentTerm || 'Term1'}_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [generateStatementHTML, settings]);

    // Download fee statement as CSV
    const handleDownloadCSV = useCallback(() => {
        const headers = ['Admission No', 'Student Name', 'Grade', 'Total Fees', 'Paid', 'Balance', 'Status'];
        const rows = students.map(s => [
            s.admissionNumber,
            `${s.firstName} ${s.lastName}`,
            s.grade,
            s.totalFees,
            s.paidFees,
            s.feeBalance,
            s.feeBalance === 0 ? 'Paid' : 'Pending'
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Fee_Balances_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [students]);

    // Print (optimized — preloads content, waits for render, then prints)
    const handlePrint = useCallback(() => {
        const html = generateStatementHTML();
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            // Wait for content to fully render before triggering print
            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
            };
            // Fallback if onload doesn't fire (some browsers)
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
            }, 500);
        }
    }, [generateStatementHTML]);

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Fee Management</h1>
                    <p>Track and manage student fee payments</p>
                </div>
                <div className="page-header-right" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn-outline" onClick={() => setShowStructure(true)}>
                        <LocalAtmIcon style={{ fontSize: 18 }} /> View Fee Structure
                    </button>
                    <button className="btn-outline" onClick={handleDownloadCSV} title="Download CSV spreadsheet">
                        <DownloadIcon style={{ fontSize: 18 }} /> CSV
                    </button>
                    <button className="btn-outline" onClick={handleDownload} title="Download full fee statement">
                        <DownloadIcon style={{ fontSize: 18 }} /> Statement
                    </button>
                    <button className="btn-outline" onClick={handlePrint} title="Print fee statement">
                        <PrintIcon style={{ fontSize: 18 }} /> Print
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
                                                <div className="table-actions">
                                                    <button className="table-action-btn" title="View/Print Receipt" onClick={() => setSelectedReceipt(payment)}>
                                                        <ReceiptIcon style={{ fontSize: 16 }} />
                                                    </button>
                                                    <button className="table-action-btn danger" title="Delete Payment" onClick={() => { if (confirm('Are you sure you want to delete this payment?')) deletePayment(payment.id) }}>
                                                        <DeleteIcon style={{ fontSize: 16 }} />
                                                    </button>
                                                </div>
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
                <>
                    <div className="toolbar" style={{ marginTop: 20 }}>
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search student or receipt..."
                                className="form-control"
                                value={searchQuery}
                                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                    </div>

                    <div className="section" style={{ marginTop: 24 }}>
                        <div className="section-header">
                            <h3><PaymentIcon style={{ fontSize: 18, marginRight: 8, color: 'var(--accent-blue)' }} />Recent Payments</h3>
                        </div>
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Receipt No</th>
                                        <th>Student</th>
                                        <th>Term</th>
                                        <th>Amount</th>
                                        <th>Method</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>No payments found matching your search.</td>
                                        </tr>
                                    ) : (
                                        paginatedPayments.map(payment => (
                                            <tr key={payment.id}>
                                                <td>{new Date(payment.date).toLocaleDateString()}</td>
                                                <td style={{ fontWeight: 600 }}>{payment.receiptNumber}</td>
                                                <td>{payment.studentName}</td>
                                                <td>{payment.term}</td>
                                                <td style={{ fontWeight: 600 }}>KSh {payment.amount.toLocaleString()}</td>
                                                <td><span className="badge blue">{payment.method}</span></td>
                                                <td>
                                                    <div className="actions">
                                                        <button className="action-btn" title="View/Print Receipt" onClick={() => setSelectedReceipt(payment)}><ReceiptIcon style={{ fontSize: 16 }} /></button>
                                                        <button className="action-btn delete" title="Delete Entry" onClick={() => { if (window.confirm('Are you sure you want to delete this payment?')) deletePayment(payment.id) }}><DeleteIcon style={{ fontSize: 16 }} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <Pagination
                            totalItems={filteredPayments.length}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </>
            )}

            {/* Student Fee Balances Table (moved outside dashboard-grid) */}
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
