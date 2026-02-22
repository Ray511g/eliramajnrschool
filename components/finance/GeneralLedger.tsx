import React, { useState } from 'react';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

interface GeneralLedgerProps {
    accounts: any[];
    journalEntries: any[];
}

const GeneralLedger: React.FC<GeneralLedgerProps> = ({ accounts, journalEntries }) => {
    const [activeTab, setActiveTab] = useState<'accounts' | 'journal'>('journal');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEntries = journalEntries.filter(e =>
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.account?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredAccounts = accounts.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportCSV = () => {
        const data = activeTab === 'journal' ? filteredEntries : filteredAccounts;
        if (data.length === 0) return;

        let headers: string[] = [];
        let rows: any[] = [];

        if (activeTab === 'journal') {
            headers = ['Date', 'Transaction ID', 'Account', 'Code', 'Description', 'Debit', 'Credit'];
            rows = filteredEntries.map(e => [
                new Date(e.date).toLocaleDateString(),
                e.transactionId,
                e.account?.name,
                e.account?.code,
                e.description,
                e.debit,
                e.credit
            ]);
        } else {
            headers = ['Code', 'Account Name', 'Type', 'Category', 'Balance'];
            rows = filteredAccounts.map(a => [
                a.code,
                a.name,
                a.type,
                a.category,
                a.balance
            ]);
        }

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map((v: any) => `"${v ?? ''}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="general-ledger">
            <div className="tab-nav">
                <button
                    className={`tab-btn ${activeTab === 'journal' ? 'active' : ''}`}
                    onClick={() => setActiveTab('journal')}
                >
                    <ReceiptLongIcon style={{ fontSize: 20 }} /> Journal Entries
                </button>
                <button
                    className={`tab-btn ${activeTab === 'accounts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('accounts')}
                >
                    <AccountTreeIcon style={{ fontSize: 20 }} /> Chart of Accounts
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16 }}>
                <div className="search-box" style={{ flex: 1, maxWidth: 400 }}>
                    <SearchIcon />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab === 'journal' ? 'entries' : 'accounts'}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn-outline" onClick={exportCSV}>
                    <FileDownloadIcon style={{ fontSize: 18, marginRight: 8 }} />
                    Export CSV
                </button>
            </div>

            <div className="table-container card" style={{ padding: 0 }}>
                {activeTab === 'journal' ? (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Transaction ID</th>
                                <th>Account</th>
                                <th>Description</th>
                                <th style={{ textAlign: 'right' }}>Debit</th>
                                <th style={{ textAlign: 'right' }}>Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEntries.length > 0 ? filteredEntries.map((entry, i) => (
                                <tr key={entry.id || i}>
                                    <td>{new Date(entry.date).toLocaleDateString()}</td>
                                    <td><code style={{ fontSize: 11 }}>{entry.transactionId}</code></td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{entry.account?.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{entry.account?.code}</div>
                                    </td>
                                    <td>{entry.description}</td>
                                    <td style={{ textAlign: 'right', color: entry.debit > 0 ? 'var(--accent-green)' : 'inherit', fontWeight: entry.debit > 0 ? 600 : 400 }}>
                                        {entry.debit > 0 ? entry.debit.toLocaleString() : '-'}
                                    </td>
                                    <td style={{ textAlign: 'right', color: entry.credit > 0 ? 'var(--accent-red)' : 'inherit', fontWeight: entry.credit > 0 ? 600 : 400 }}>
                                        {entry.credit > 0 ? entry.credit.toLocaleString() : '-'}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                                        No journal entries found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Account Name</th>
                                <th>Type</th>
                                <th>Category</th>
                                <th style={{ textAlign: 'right' }}>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAccounts.map((acc) => (
                                <tr key={acc.id}>
                                    <td><code>{acc.code}</code></td>
                                    <td style={{ fontWeight: 500 }}>{acc.name}</td>
                                    <td><span className={`badge ${acc.type.toLowerCase()} blue`}>{acc.type}</span></td>
                                    <td>{acc.category}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                        {acc.balance.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default GeneralLedger;
