import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';

interface Props {
    onClose: () => void;
}

export default function FeeStructureModal({ onClose }: Props) {
    const { gradeFees, settings } = useSchool();

    const structureHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Fee Structure - ${settings.schoolName}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                .header { text-align: center; border-bottom: 2px solid #2c3e50; padding-bottom: 20px; margin-bottom: 30px; }
                .school-name { font-size: 28px; font-weight: bold; color: #2c3e50; text-transform: uppercase; margin: 0; }
                .school-motto { font-style: italic; color: #7f8c8d; margin: 5px 0; }
                .doc-title { font-size: 22px; font-weight: bold; margin-top: 15px; background: #f8f9fa; padding: 10px; text-decoration: underline; }
                
                .info-section { margin-bottom: 30px; line-height: 1.6; }
                
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th { background: #2c3e50; color: white; text-align: left; padding: 12px; }
                td { border: 1px solid #eee; padding: 12px; }
                .grade-col { font-weight: bold; width: 40%; }
                .amount-col { text-align: right; width: 30%; font-family: monospace; font-size: 16px; }
                .term-col { text-align: center; color: #7f8c8d; }

                .footer-notice { margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; font-size: 14px; color: #666; }
                .payment-info { background: #fdfefe; border: 1px dashed #ccc; padding: 15px; margin-top: 20px; }
                
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1 class="school-name">${settings.schoolName}</h1>
                <p class="school-motto">${settings.motto}</p>
                <div class="doc-title">OFFICIAL FEE STRUCTURE - ${settings.currentYear}</div>
            </div>

            <div class="info-section">
                <p>Dear Parent/Guardian,</p>
                <p>Following the school board's latest review, please find below the termly fee requirements for the current academic year. These fees are inclusive of tuition, learning materials, and basic extracurricular activities.</p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>GRADE LEVEL</th>
                        <th class="term-col">PERIOD</th>
                        <th style="text-align: right;">AMOUNT (KSh)</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(gradeFees).map(([grade, amount]) => `
                        <tr>
                            <td class="grade-col">${grade}</td>
                            <td class="term-col">Per Term</td>
                            <td class="amount-col">${amount.toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="payment-info">
                <strong>PAYMENT CHANNELS:</strong><br>
                1. M-PESA Paybill: <strong>247247</strong> | Account: <strong>0748...</strong><br>
                2. Bank Deposit: <strong>Elirama Academy</strong> | Equity Bank | Branch: <strong>Nairobi</strong><br>
                <em>* Please use student Admission Number as payment reference.</em>
            </div>

            <div class="footer-notice">
                <p>Note: Fees once paid are non-refundable. For any queries regarding fee adjustments or scholarships, please visit the bursar's office.</p>
                <p style="text-align: right; font-weight: bold; margin-top: 40px;">
                    Kind Regards,<br><br>
                    ___________________________<br>
                    School Headteacher / Director
                </p>
            </div>
            
            <div style="margin-top: 40px; font-size: 10px; color: #bdc3c7; text-align: center;">
                Printed on ${new Date().toLocaleDateString()} via Elirama Portal
            </div>
        </body>
        </html>
    `;

    const handlePrint = () => {
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(structureHTML);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); }, 500);
    };

    const handleDownload = () => {
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(structureHTML);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); }, 500);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Fee Structure Overview</h2>
                    <button className="modal-close" onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="modal-body">
                    <div style={{ textAlign: 'center', paddingBottom: 20 }}>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Generate an official fee structure document for parents and guardians.
                        </p>
                    </div>

                    <div style={{
                        border: '1px solid var(--border-color)',
                        borderRadius: 8,
                        overflow: 'hidden',
                        marginBottom: 24,
                        maxHeight: '50vh',
                        overflowY: 'auto'
                    }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Grade</th>
                                    <th>Period</th>
                                    <th style={{ textAlign: 'right' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(gradeFees).map(([grade, amount]) => (
                                    <tr key={grade}>
                                        <td style={{ fontWeight: 500 }}>{grade}</td>
                                        <td>Per Term</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>KSh {amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <button className="btn-outline" onClick={handleDownload} style={{ height: 48 }}>
                            <DownloadIcon style={{ marginRight: 8 }} />
                            Download PDF
                        </button>
                        <button className="btn-primary" onClick={handlePrint} style={{ height: 48 }}>
                            <PrintIcon style={{ marginRight: 8 }} />
                            Print Official Copy
                        </button>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-outline" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}
