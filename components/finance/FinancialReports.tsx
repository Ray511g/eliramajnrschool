import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

type ReportType = 'P&L' | 'BalanceSheet' | 'TrialBalance' | 'Aging';

const FinancialReports: React.FC = () => {
    const { settings, accounts, expenses, payments, suppliers } = useSchool();
    const [reportType, setReportType] = useState<ReportType>('P&L');
    const [period, setPeriod] = useState(new Date().getFullYear().toString());

    const generatePL = () => {
        // Simple logic for demonstration
        const revenue = accounts.filter(a => a.type === 'Revenue').reduce((sum, a) => sum + a.balance, 0);
        const expensesTotal = accounts.filter(a => a.type === 'Expense').reduce((sum, a) => sum + a.balance, 0);
        return { revenue, expenses: expensesTotal, net: revenue - expensesTotal };
    };

    const pl = generatePL();

    return (
        <div className="financial-reports animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700 }}>Financial Reporting</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Audit-ready financial statements and analysis</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn-outline">
                        <PrintIcon style={{ fontSize: 18, marginRight: 8 }} /> Print
                    </button>
                    <button className="btn-primary">
                        <FileDownloadIcon style={{ fontSize: 18, marginRight: 8 }} /> Export PDF
                    </button>
                </div>
            </div>

            <div className="tab-nav small" style={{ marginBottom: 24 }}>
                {(['P&L', 'BalanceSheet', 'TrialBalance', 'Aging'] as ReportType[]).map(r => (
                    <button
                        key={r}
                        className={`tab-btn ${reportType === r ? 'active' : ''}`}
                        onClick={() => setReportType(r)}
                    >
                        {r === 'P&L' && 'Profit & Loss'}
                        {r === 'BalanceSheet' && 'Balance Sheet'}
                        {r === 'TrialBalance' && 'Trial Balance'}
                        {r === 'Aging' && 'Aging Report'}
                    </button>
                ))}
            </div>

            <div className="report-content card glass-panel">
                <div className="report-header" style={{ textAlign: 'center', marginBottom: 40, borderBottom: '1px solid var(--border-color)', paddingBottom: 20 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 800 }}>{settings.schoolName}</h1>
                    <h2 style={{ fontSize: 18, color: 'var(--text-secondary)' }}>
                        {reportType === 'P&L' ? 'Statement of Comprehensive Income' :
                            reportType === 'BalanceSheet' ? 'Statement of Financial Position' :
                                reportType === 'TrialBalance' ? 'Trial Balance' : 'Accounts Aging Summary'}
                    </h2>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>For the Year Ended 31st December {period}</p>
                </div>

                {reportType === 'P&L' && (
                    <div className="pl-report">
                        <div className="report-row header">
                            <span>Description</span>
                            <span style={{ textAlign: 'right' }}>Amount (KES)</span>
                        </div>

                        <div className="report-section">
                            <h3 className="section-title">REVENUE</h3>
                            {accounts.filter(a => a.type === 'Revenue').map(acc => (
                                <div key={acc.id} className="report-row">
                                    <span>{acc.name}</span>
                                    <span style={{ textAlign: 'right' }}>{acc.balance.toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="report-row total">
                                <span>TOTAL REVENUE</span>
                                <span style={{ textAlign: 'right' }}>{pl.revenue.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="report-section" style={{ marginTop: 24 }}>
                            <h3 className="section-title">EXPENSES</h3>
                            {accounts.filter(a => a.type === 'Expense').map(acc => (
                                <div key={acc.id} className="report-row">
                                    <span>{acc.name}</span>
                                    <span style={{ textAlign: 'right' }}>({acc.balance.toLocaleString()})</span>
                                </div>
                            ))}
                            <div className="report-row total">
                                <span>TOTAL EXPENSES</span>
                                <span style={{ textAlign: 'right' }}>({pl.expenses.toLocaleString()})</span>
                            </div>
                        </div>

                        <div className="report-row net-income" style={{ marginTop: 40, paddingTop: 20, borderTop: '2px double var(--border-color)' }}>
                            <span style={{ fontWeight: 800, fontSize: 18 }}>NET PROFIT / (LOSS)</span>
                            <span style={{ textAlign: 'right', fontWeight: 800, fontSize: 18, color: pl.net >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                KES {pl.net.toLocaleString()}
                            </span>
                        </div>
                    </div>
                )}

                {reportType === 'BalanceSheet' && (
                    <div className="bs-report">
                        <div className="report-section">
                            <h3 className="section-title">ASSETS</h3>
                            {accounts.filter(a => a.type === 'Asset').map(acc => (
                                <div key={acc.id} className="report-row">
                                    <span>{acc.name}</span>
                                    <span style={{ textAlign: 'right' }}>{acc.balance.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        <div className="report-section" style={{ marginTop: 24 }}>
                            <h3 className="section-title">LIABILITIES & EQUITY</h3>
                            {accounts.filter(a => a.type === 'Liability' || a.type === 'Equity').map(acc => (
                                <div key={acc.id} className="report-row">
                                    <span>{acc.name}</span>
                                    <span style={{ textAlign: 'right' }}>{acc.balance.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(reportType === 'TrialBalance' || reportType === 'Aging') && (
                    <div style={{ textAlign: 'center', padding: 80 }}>
                        <AssessmentIcon style={{ fontSize: 64, color: 'var(--text-muted)', opacity: 0.3 }} />
                        <h3 style={{ marginTop: 16 }}>Advanced Report Module</h3>
                        <p style={{ color: 'var(--text-muted)' }}>This enterprise report is being synthesized based on real-time ledger data.</p>
                        <button className="btn-primary" style={{ marginTop: 20 }}>Process Real-time Data</button>
                    </div>
                )}
            </div>

            <style jsx>{`
                .report-content {
                    padding: 60px;
                    max-width: 900px;
                    margin: 0 auto;
                    background: white !important;
                    color: #1a1a1a !important;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.1);
                }
                .report-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid #f0f0f0;
                }
                .section-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: #666;
                    margin-bottom: 12px;
                    margin-top: 24px;
                    letter-spacing: 1px;
                }
                .total {
                    font-weight: 700;
                    border-bottom: 1px solid #333;
                    border-top: 1px solid #333;
                    margin-top: 8px;
                }
            `}</style>
        </div>
    );
};

export default FinancialReports;
