import React, { useState, useEffect } from 'react';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import { useSchool } from '../../context/SchoolContext';

export const SystemAuditTab: React.FC = () => {
    const { auditLogs, fetchAuditLogs } = useSchool();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAuditLogs();
    }, [fetchAuditLogs]);

    const filteredLogs = (auditLogs || []).filter(log =>
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-section">
            <div className="flex-between" style={{ marginBottom: 20 }}>
                <h3 className="m-0"><HistoryIcon className="nav-icon" /> System Audit Logs</h3>
                <div className="search-box">
                    <SearchIcon style={{ fontSize: 18, color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Filter by user or action..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="card p-0">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>User</th>
                            <th>Action & Resource</th>
                            <th>Device / Context</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.slice(0, 100).map((log) => (
                            <tr key={log.id}>
                                <td className="fs-12">{new Date(log.createdAt).toLocaleString()}</td>
                                <td>
                                    <div className="fw-600">{log.userName}</div>
                                    <div className="fs-10 opacity-60">IP: {log.ipAddress || 'Internal'}</div>
                                </td>
                                <td>
                                    <div className="fw-500">{log.action}</div>
                                    <div className="fs-11 opacity-80">{log.details}</div>
                                </td>
                                <td><span className="fs-11 opacity-60">{log.deviceInfo || 'Web Interface'}</span></td>
                                <td><span className="badge green">SUCCESS</span></td>
                            </tr>
                        ))}
                        {filteredLogs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center" style={{ padding: '60px 0', color: 'var(--text-secondary)' }}>
                                    <HistoryIcon style={{ fontSize: 48, opacity: 0.2, marginBottom: 12 }} />
                                    <p>No audit records found matching your criteria.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
