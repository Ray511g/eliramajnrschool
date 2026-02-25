import React, { useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

interface Props {
    order: any;
    student: any;
    onClose: () => void;
}

export default function ServiceOrderDetailsModal({ order, student, onClose }: Props) {
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
                        <title>Service Order - ${order.id}</title>
                        <style>
                            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
                            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
                            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
                            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5; }
                            .label { color: #666; font-size: 13px; }
                            .value { font-weight: bold; }
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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container animate-in" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="stat-icon" style={{ padding: 8, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            <LocalShippingIcon />
                        </div>
                        <div>
                            <h2 className="modal-title">Service Enrollment Details</h2>
                            <p className="text-muted text-xs">Review or Print Enrollment Data</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-outline" onClick={handlePrint}>
                            <PrintIcon style={{ fontSize: 18, marginRight: 6 }} /> Print
                        </button>
                        <button className="action-btn" onClick={onClose} aria-label="Close modal" title="Close"><CloseIcon /></button>
                    </div>
                </div>

                <div className="modal-body" ref={printRef}>
                    <div className="header">
                        <div>
                            <h1 style={{ margin: 0, color: '#3b82f6' }}>SERVICE ENROLLMENT</h1>
                            <p style={{ margin: '4px 0', fontSize: 14 }}>Ref: {order.id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h3 style={{ margin: 0 }}>Elirama School</h3>
                            <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Commercial Records</p>
                        </div>
                    </div>

                    <div className="info-grid">
                        <div>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: 12, color: '#666', textTransform: 'uppercase' }}>Student Information</h4>
                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: 16 }}>{student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}</p>
                            <p style={{ margin: '4px 0', color: '#666' }}>Adm: {student?.admissionNumber || 'N/A'}</p>
                            <p style={{ margin: 0, color: '#666' }}>Grade: {student?.grade || 'N/A'}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: 12, color: '#666', textTransform: 'uppercase' }}>Enrollment Info</h4>
                            <p style={{ margin: 0, fontWeight: 'bold' }}>Status: {order.status}</p>
                            <p style={{ margin: '4px 0', color: '#666' }}>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div style={{ background: '#f9fafb', padding: 20, borderRadius: 8 }}>
                        <div className="detail-row">
                            <span className="label">Service Type</span>
                            <span className="value">{order.serviceType}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Billing Amount</span>
                            <span className="value">KSh {order.amount.toLocaleString()}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Recurring Billing</span>
                            <span className="value">{order.recurring ? 'Enabled' : 'Disabled'}</span>
                        </div>
                        {order.recurring && (
                            <div className="detail-row">
                                <span className="label">Billing Cycle</span>
                                <span className="value">{order.frequency}</span>
                            </div>
                        )}
                        <div className="detail-row" style={{ borderBottom: 'none' }}>
                            <span className="label">Next Billing Date</span>
                            <span className="value">{order.nextBillingDate ? new Date(order.nextBillingDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>

                    <div className="footer">
                        <p>This enrollment confirms authorization for billing related to the services mentioned above.</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30 }}>
                            <div style={{ borderTop: '1px solid #ddd', width: 200, paddingTop: 8, textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: 10 }}>Accounts Dept</p>
                            </div>
                            <div style={{ borderTop: '1px solid #ddd', width: 200, paddingTop: 8, textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: 10 }}>Guardian Signature</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer no-print">
                    <button type="button" className="btn btn-outline" onClick={onClose}>Close</button>
                    <button type="button" className="btn btn-primary" onClick={handlePrint}>Print Record</button>
                </div>
            </div>
        </div>
    );
}
