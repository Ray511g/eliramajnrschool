import React, { useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useSchool } from '../../context/SchoolContext';

interface Props {
    po: any;
    onClose: () => void;
}

export default function PurchaseOrderDetailsModal({ po, onClose }: Props) {
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
                        <title>Purchase Order - ${po.poNumber}</title>
                        <style>
                            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
                            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
                            .po-info { margin-bottom: 30px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { padding: 12px; border: 1px solid #eee; text-align: left; }
                            th { background: #f9fafb; color: #666; font-size: 12px; text-transform: uppercase; }
                            .total-row { font-weight: bold; background: #f9fafb; }
                            .footer { margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #666; }
                            @media print {
                                .no-print { display: none; }
                            }
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

    const items = Array.isArray(po.items) ? po.items : [];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container animate-in" style={{ maxWidth: 800 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="stat-icon" style={{ padding: 8, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                            <ReceiptLongIcon />
                        </div>
                        <div>
                            <h2 className="modal-title">Purchase Order Details</h2>
                            <p className="text-muted text-xs">{po.poNumber} • {po.status}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-outline" onClick={handlePrint}>
                            <PrintIcon style={{ fontSize: 18, marginRight: 6 }} /> Print PO
                        </button>
                        <button className="action-btn" onClick={onClose} aria-label="Close modal" title="Close"><CloseIcon /></button>
                    </div>
                </div>

                <div className="modal-body" ref={printRef}>
                    <div className="header">
                        <div>
                            {settings.logo ? (
                                <img src={settings.logo} alt="Logo" style={{ height: 60 }} />
                            ) : (
                                <h1 style={{ margin: 0, color: 'var(--primary)' }}>{settings.schoolName}</h1>
                            )}
                            <p style={{ margin: '4px 0', fontSize: 13, color: '#666' }}>{settings.motto}</p>
                            <h2 style={{ margin: '15px 0 0 0', color: '#ef4444', fontSize: 24 }}>PURCHASE ORDER</h2>
                            <p style={{ margin: '4px 0', fontSize: 14 }}>Ref: {po.poNumber}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h3 style={{ margin: 0 }}>{settings.schoolName}</h3>
                            <p style={{ margin: 0, fontSize: 12, color: '#666' }}>{settings.address}</p>
                            <p style={{ margin: 0, fontSize: 12, color: '#666' }}>{settings.phone} | {settings.email}</p>
                            {settings.poBox && <p style={{ margin: 0, fontSize: 12, color: '#666' }}>P.O Box {settings.poBox}</p>}
                        </div>
                    </div>

                    <div className="po-info" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
                        <div>
                            <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: 12, textTransform: 'uppercase' }}>Vendor</h4>
                            <p style={{ margin: 0, fontWeight: 'bold' }}>{po.supplierName}</p>
                            <p style={{ margin: '4px 0', fontSize: 14, color: '#666' }}>ID: {po.supplierId}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: 12, textTransform: 'uppercase' }}>Ship To / Dept</h4>
                            <p style={{ margin: 0, fontWeight: 'bold' }}>{po.department} Department</p>
                            <p style={{ margin: '4px 0', fontSize: 14, color: '#666' }}>Date: {new Date(po.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th style={{ textAlign: 'right' }}>Qty</th>
                                <th style={{ textAlign: 'right' }}>Unit Price</th>
                                <th style={{ textAlign: 'right' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item: any, idx: number) => (
                                <tr key={idx}>
                                    <td>{item.desc}</td>
                                    <td style={{ textAlign: 'right' }}>{item.qty}</td>
                                    <td style={{ textAlign: 'right' }}>KSh {(item.unitPrice || 0).toLocaleString()}</td>
                                    <td style={{ textAlign: 'right' }}>KSh {(item.total || 0).toLocaleString()}</td>
                                </tr>
                            ))}
                            <tr className="total-row">
                                <td colSpan={3} style={{ textAlign: 'right' }}>GRAND TOTAL</td>
                                <td style={{ textAlign: 'right' }}>KSh {(po.totalAmount || 0).toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="footer">
                        <p><strong>Note:</strong> This is a computer-generated document. No signature is required unless otherwise stated.</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30 }}>
                            <div style={{ borderTop: '1px solid #ddd', width: 200, paddingTop: 8, textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: 10 }}>Prepared By</p>
                            </div>
                            <div style={{ borderTop: '1px solid #ddd', width: 200, paddingTop: 8, textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: 10 }}>Authorized Signature</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer no-print">
                    <button type="button" className="btn btn-outline" onClick={onClose}>Close</button>
                    {po.status === 'PENDING' && (
                        <span className="text-muted text-xs">Awaiting Approval</span>
                    )}
                </div>
            </div>
        </div>
    );
}
