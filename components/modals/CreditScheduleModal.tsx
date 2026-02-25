import React, { useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useSchool } from '../../context/SchoolContext';

interface Props {
    agreement: any;
    onClose: () => void;
}

export default function CreditScheduleModal({ agreement, onClose }: Props) {
    const { settings } = useSchool();
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = printRef.current;
        const windowUrl = 'about:blank';
        const uniqueName = new Date();
        const windowName = 'Print' + uniqueName.getTime();
        const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

        if (printWindow && printContent) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Credit Schedule - ${agreement.studentName}</title>
                        <style>
                            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
                            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
                            .logo { height: 60px; }
                            .school-info { text-align: right; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { padding: 12px; border: 1px solid #eee; text-align: left; }
                            th { background: #f9fafb; color: #666; font-size: 12px; text-transform: uppercase; }
                            .footer { margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #666; }
                            @media print { .no-print { display: none; } }
                        </style>
                    </head>
                    <body>
                        ${printContent.innerHTML}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        }
    };

    const installments = agreement.installments || [];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container animate-in" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="stat-icon" style={{ padding: 8, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            <AccountBalanceWalletIcon />
                        </div>
                        <div>
                            <h2 className="modal-title">Repayment Schedule</h2>
                            <p className="text-muted text-xs">{agreement.studentName} • KSh {agreement.totalAmount?.toLocaleString()}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-outline" onClick={handlePrint}>
                            <PrintIcon style={{ fontSize: 18, marginRight: 6 }} /> Print Schedule
                        </button>
                        <button className="action-btn" onClick={onClose} aria-label="Close modal" title="Close"><CloseIcon /></button>
                    </div>
                </div>

                <div className="modal-body" ref={printRef}>
                    <div className="header">
                        <div>
                            {settings.logo ? (
                                <img src={settings.logo} alt="Logo" className="logo" />
                            ) : (
                                <h2 style={{ margin: 0, color: 'var(--primary)' }}>{settings.schoolName}</h2>
                            )}
                            <p style={{ margin: '4px 0', fontSize: 14 }}>{settings.motto}</p>
                        </div>
                        <div className="school-info">
                            <h3 style={{ margin: 0 }}>{settings.schoolName}</h3>
                            <p style={{ margin: 0, fontSize: 12, color: '#666' }}>{settings.address}</p>
                            <p style={{ margin: 0, fontSize: 12, color: '#666' }}>{settings.phone} | {settings.email}</p>
                        </div>
                    </div>

                    <div style={{ marginBottom: 30 }}>
                        <h4 style={{ margin: '0 0 10px 0', textTransform: 'uppercase', fontSize: 12, color: '#666' }}>Agreement Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div>
                                <p style={{ margin: 0, fontSize: 14 }}><strong>Student:</strong> {agreement.studentName}</p>
                                <p style={{ margin: '4px 0', fontSize: 14 }}><strong>Guardian:</strong> {agreement.guardianName}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0, fontSize: 14 }}><strong>Total Amount:</strong> KSh {agreement.totalAmount?.toLocaleString()}</p>
                                <p style={{ margin: '4px 0', fontSize: 14 }}><strong>Status:</strong> {agreement.status}</p>
                            </div>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Installment</th>
                                <th>Due Date</th>
                                <th style={{ textAlign: 'right' }}>Amount Due</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {installments.map((inst: any, idx: number) => (
                                <tr key={idx}>
                                    <td>Installment {idx + 1}</td>
                                    <td>{new Date(inst.dueDate).toLocaleDateString()}</td>
                                    <td style={{ textAlign: 'right' }}>KSh {(inst.amount || 0).toLocaleString()}</td>
                                    <td>{agreement.status === 'Completed' ? 'Paid' : 'Upcoming'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="footer">
                        <p><strong>Note:</strong> This schedule is part of the credit agreement signed on {new Date(agreement.createdAt).toLocaleDateString()}. Please ensure payments are made on or before the due dates.</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
                            <div style={{ borderTop: '1px solid #ddd', width: 200, paddingTop: 8, textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: 10 }}>Accounts Department</p>
                            </div>
                            <div style={{ borderTop: '1px solid #ddd', width: 200, paddingTop: 8, textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: 10 }}>Stamp & Signature</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer no-print">
                    <button type="button" className="btn btn-outline" onClick={onClose}>Close</button>
                    <button type="button" className="btn btn-primary" onClick={handlePrint}>Print Schedule</button>
                </div>
            </div>
        </div>
    );
}
