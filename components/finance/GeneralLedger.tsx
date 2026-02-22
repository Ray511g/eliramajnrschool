import React, { useState } from 'react';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SearchIcon from '@mui/icons-material/Search';

interface GeneralLedgerProps {
    accounts: any[];
    journalEntries: any[];
}

const GeneralLedger: React.FC<GeneralLedgerProps> = ({ accounts, journalEntries }) => {
    const [activeTab, setActiveTab] = useState<'accounts' | 'journal'>('journal');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEntries = journalEntries.filter(e =>
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="general-ledger">
            <div className="tabs" style={{ marginBottom: 20 }}>
                <button
                    className={`tab ${activeTab === 'journal' ? 'active' : ''}`}
                    onClick={() => setActiveTab('journal')}
                >
                    Journal Entries
                </button>
                <button
                    className={`tab ${activeTab === 'accounts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('accounts')}
                >
                    Chart of Accounts
                </button>
            </div>

            <div className="toolbar" style={{ marginBottom: 20 }}>
                <div className="search-box">
                    <SearchIcon />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab === 'journal' ? 'entries' : 'accounts'}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {activeTab === 'journal' ? (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Transaction ID</th>
                                <th>Account</th>
                                <th>Description</th>
                                <th>Debit</th>
                                <th>Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEntries.length > 0 ? filteredEntries.map((entry, i) => (
                                <tr key={entry.id || i}>
                                    <td>{new Date(entry.date).toLocaleDateString()}</td>
                                    <td><code style={{ fontSize: 11 }}>{entry.transactionId}</code></td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{entry.account?.name || 'Account'}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{entry.account?.code}</div>
                                    </td>
                                    <td>{entry.description}</td>
                                    <td style={{ color: entry.debit > 0 ? '#10b981' : 'inherit' }}>
                                        {entry.debit > 0 ? `KES ${entry.debit.toLocaleString()}` : '-'}
                                    </td>
                                    <td style={{ color: entry.credit > 0 ? '#ef4444' : 'inherit' }}>
                                        {entry.credit > 0 ? `KES ${entry.credit.toLocaleString()}` : '-'}
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
                </div>
            ) : (
                <div className="table-container">
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
                            {accounts.map((acc) => (
                                <tr key={acc.id}>
                                    <td><code>{acc.code}</code></td>
                                    <td style={{ fontWeight: 500 }}>{acc.name}</td>
                                    <td><span className={`badge ${acc.type.toLowerCase()}`}>{acc.type}</span></td>
                                    <td>{acc.category}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                        KES {acc.balance.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default GeneralLedger;
