import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UndoIcon from '@mui/icons-material/Undo';
import LockIcon from '@mui/icons-material/Lock';

const GeneralLedger: React.FC = () => {
    const { user } = useAuth();
    const {
        accounts, journalEntries,
        addChartOfAccount, updateChartOfAccount,
        addJournalEntry, approveJournalEntry, reverseJournalEntry
    } = useSchool();

    const [activeTab, setActiveTab] = useState<'accounts' | 'journal'>('journal');
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [journalForm, setJournalForm] = useState({
        description: '',
        accountId: '',
        debit: 0,
        credit: 0,
        date: new Date().toISOString().split('T')[0]
    });

    const filteredEntries = (journalEntries || []).filter(e =>
        (e?.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e?.transactionId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e?.account?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredAccounts = (accounts || []).filter(a =>
        (a?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a?.code || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleJournalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { user } = useAuth(); // Import useAuth
        if (journalForm.debit === 0 && journalForm.credit === 0) {
            alert('Must have either a debit or credit amount');
            return;
        }
        await addJournalEntry({ ...journalForm, requestedBy: user?.name || 'System' });
        setShowForm(false);
    };

    const exportCSV = () => {
        const data = activeTab === 'journal' ? filteredEntries : filteredAccounts;
        if (data.length === 0) return;

        let headers: string[] = [];
        let rows: any[] = [];

        if (activeTab === 'journal') {
            headers = ['Date', 'Transaction ID', 'Account', 'Code', 'Description', 'Debit', 'Credit', 'Status'];
            rows = filteredEntries.map(e => [
                new Date(e.date).toLocaleDateString(),
                e.transactionId,
                e.account?.name,
                e.account?.code,
                e.description,
                e.debit,
                e.credit,
                e.status
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
        <div className="general-ledger animate-in">
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
                <div style={{ display: 'flex', gap: 12 }}>
                    {activeTab === 'journal' && (
                        <button className="btn-primary" onClick={() => setShowForm(true)}>
                            <AddIcon style={{ fontSize: 18, marginRight: 8 }} />
                            New Posting
                        </button>
                    )}
                    <button className="btn-outline" onClick={exportCSV}>
                        <FileDownloadIcon style={{ fontSize: 18, marginRight: 8 }} />
                        Export Audit Log
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="card glass-panel" style={{ marginBottom: 24, padding: 24 }}>
                    <h3 style={{ marginBottom: 16 }}>Manual Journal Posting</h3>
                    <form onSubmit={handleJournalSubmit}>
                        <div className="grid-3">
                            <div className="form-group">
                                <label>Target Account</label>
                                <select className="form-control" value={journalForm.accountId} onChange={e => setJournalForm({ ...journalForm, accountId: e.target.value })} required>
                                    <option value="">Select Account...</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <input type="date" className="form-control" value={journalForm.date} onChange={e => setJournalForm({ ...journalForm, date: e.target.value })} required />
                            </div>
                        </div>
                        <div className="grid-3" style={{ marginTop: 16 }}>
                            <div className="form-group">
                                <label>Description</label>
                                <input className="form-control" value={journalForm.description} onChange={e => setJournalForm({ ...journalForm, description: e.target.value })} placeholder="Purpose of entry..." required />
                            </div>
                            <div className="form-group">
                                <label>Debit (KES)</label>
                                <input type="number" className="form-control" value={journalForm.debit} onChange={e => setJournalForm({ ...journalForm, debit: parseFloat(e.target.value), credit: 0 })} />
                            </div>
                            <div className="form-group">
                                <label>Credit (KES)</label>
                                <input type="number" className="form-control" value={journalForm.credit} onChange={e => setJournalForm({ ...journalForm, credit: parseFloat(e.target.value), debit: 0 })} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                            <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className="btn-primary">Post Entry</button>
                        </div>
                    </form>
                </div>
            )}

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
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
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
                                    <td>
                                        <span className={`badge ${entry.status === 'Approved' ? 'green' : entry.status === 'Pending' ? 'orange' : 'red'}`}>
                                            {entry.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                            {entry.status === 'Pending' && (
                                                <button className="table-action-btn" onClick={() => approveJournalEntry(entry.id)} title="Approve & Post">
                                                    <CheckCircleIcon style={{ fontSize: 16, color: 'var(--accent-green)' }} />
                                                </button>
                                            )}
                                            {entry.status === 'Approved' && (
                                                <button className="table-action-btn" onClick={() => { if (confirm('Reverse this transaction? This will create an offsetting entry.')) reverseJournalEntry(entry.id); }} title="Reverse Entry">
                                                    <UndoIcon style={{ fontSize: 16, color: 'var(--accent-red)' }} />
                                                </button>
                                            )}
                                            {entry.status === 'Reversed' && <LockIcon style={{ fontSize: 16, opacity: 0.3 }} />}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
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
