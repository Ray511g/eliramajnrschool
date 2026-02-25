import React, { useState, useEffect } from 'react';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import { useSchool } from '../../context/SchoolContext';

export const SystemAuditTab: React.FC = () => {
    const { auditLogs, fetchAuditLogs } = useSchool();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const filteredLogs = (auditLogs || []).filter(log =>
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-section" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0 }}><HistoryIcon style={{ fontSize: 22 }} /> System Audit Logs</h3>
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

            <div className="card" style={{ padding: 0 }}>
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
                        {filteredLogs.slice(0, 100).map((log, idx) => (
                            <tr key={idx}>
                                <td style={{ fontSize: 12 }}>{new Date(log.timestamp).toLocaleString()}</td>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{log.user}</div>
                                    <div style={{ fontSize: 10, color: '#64748b' }}>IP: {log.ipAddress || 'Internal'}</div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 500 }}>{log.action}</div>
                                    <div style={{ fontSize: 11, color: '#64748b' }}>{log.details}</div>
                                </td>
                                <td><span style={{ fontSize: 11, opacity: 0.7 }}>{log.userAgent?.split(' ')[0] || 'Web Interface'}</span></td>
                                <td><span className="badge green">SUCCESS</span></td>
                            </tr>
                        ))}
                        {filteredLogs.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
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
