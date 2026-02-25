import React, { useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import AssignmentIcon from '@mui/icons-material/Assignment';

interface Props {
    note: any;
    onClose: () => void;
}

export default function PromissoryNoteDetailsModal({ note, onClose }: Props) {
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
                        <title>Promissory Note - ${note.noteNumber}</title>
                        <style>
                            body { font-family: 'Inter', sans-serif; padding: 60px; color: #111; line-height: 1.6; }
                            .legal-header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
                            .legal-title { font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
                            .content-body { margin-bottom: 40px; text-align: justify; }
                            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-top: 80px; }
                            .sig-box { border-top: 1px solid #000; padding-top: 10px; text-align: center; }
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
            <div className="modal-container animate-in" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="stat-icon" style={{ padding: 8, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                            <AssignmentIcon />
                        </div>
                        <div>
                            <h2 className="modal-title">Promissory Note Document</h2>
                            <p className="text-muted text-xs">Legal Binding Commitment</p>
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
                    <div className="legal-header">
                        <div className="legal-title">Promissory Note</div>
                        <p style={{ margin: '10px 0 0 0' }}>Ref: {note.noteNumber}</p>
                    </div>

                    <div className="content-body">
                        <p><strong>DATE:</strong> {new Date(note.issueDate).toLocaleDateString()}</p>
                        <p><strong>FOR VALUE RECEIVED</strong>, the undersigned <strong>{note.guardianName}</strong> (the "Maker"), promises to pay to the order of <strong>Elirama School</strong> (the "Holder"), the principal sum of <strong>KSh {note.amount.toLocaleString()}</strong> (Kenya Shillings).</p>

                        <p>This principal sum shall be due and payable in full on or before <strong>{new Date(note.maturityDate).toLocaleDateString()}</strong> (the "Maturity Date").</p>

                        <p>All payments shall be made in lawful money of Kenya at the business office of the Holder or at such other place as the Holder may designate in writing. Maker may prepay this Note in whole or in part at any time without penalty.</p>

                        <p>If any payment under this Note is not paid when due, the entire remaining unpaid principal balance shall, at the option of the Holder, become immediately due and payable. maker agrees to pay all costs of collection, including reasonable attorney fees, in case this Note is referred to an attorney for collection.</p>
                    </div>

                    <div className="signatures">
                        <div className="sig-box">
                            <p style={{ margin: 0, fontWeight: 'bold' }}>{note.guardianName}</p>
                            <p style={{ margin: 0, fontSize: 11 }}>Maker / Guardian</p>
                        </div>
                        <div className="sig-box">
                            <p style={{ margin: 0, fontWeight: 'bold' }}>Authorized Official</p>
                            <p style={{ margin: 0, fontSize: 11 }}>For Elirama School</p>
                        </div>
                    </div>
                </div>

                <div className="modal-footer no-print">
                    <button type="button" className="btn btn-outline" onClick={onClose}>Close</button>
                    <button type="button" className="btn btn-primary" onClick={handlePrint}>Print Document</button>
                </div>
            </div>
        </div>
    );
}
