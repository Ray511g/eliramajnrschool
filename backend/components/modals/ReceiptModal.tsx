import React from 'react';
import { FeePayment } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';

interface Props {
    payment: FeePayment;
    onClose: () => void;
}

export default function ReceiptModal({ payment, onClose }: Props) {
    const { settings } = useSchool();

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="modal-overlay receipt-modal" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Payment Receipt</h2>
                    <button className="modal-close" onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="modal-body">
                    <div className="receipt-content">
                        <h3>{settings.schoolName}</h3>
                        <p className="receipt-subtitle">{settings.address} | {settings.phone}</p>

                        <hr className="receipt-divider" />

                        <div className="receipt-row">
                            <span className="label">Receipt No:</span>
                            <span>{payment.receiptNumber}</span>
                        </div>
                        <div className="receipt-row">
                            <span className="label">Date:</span>
                            <span>{new Date(payment.date).toLocaleDateString()}</span>
                        </div>

                        <hr className="receipt-divider" />

                        <div className="receipt-row">
                            <span className="label">Student:</span>
                            <span>{payment.studentName}</span>
                        </div>
                        <div className="receipt-row">
                            <span className="label">Grade:</span>
                            <span>{payment.grade}</span>
                        </div>
                        <div className="receipt-row">
                            <span className="label">Term:</span>
                            <span>{payment.term}</span>
                        </div>

                        <hr className="receipt-divider" />

                        <div className="receipt-row">
                            <span className="label">Payment Method:</span>
                            <span>{payment.method}</span>
                        </div>
                        {payment.reference && (
                            <div className="receipt-row">
                                <span className="label">Reference:</span>
                                <span>{payment.reference}</span>
                            </div>
                        )}

                        <hr className="receipt-divider" />

                        <p className="receipt-total">KSh {payment.amount.toLocaleString()}</p>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-outline" onClick={onClose}>Close</button>
                    <button className="btn-primary" onClick={handlePrint}>
                        <PrintIcon style={{ fontSize: 18 }} /> Print Receipt
                    </button>
                </div>
            </div>
        </div>
    );
}
