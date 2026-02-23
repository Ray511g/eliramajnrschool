import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SearchIcon from '@mui/icons-material/Search';

export default function CommercialPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('credit');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const endpoint = activeTab === 'credit' ? '/api/commercial/credit' : '/api/commercial/po';
        try {
            const res = await fetch(endpoint);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (activeTab === 'credit' || activeTab === 'procurement') {
            fetchData();
        }
    }, [activeTab]);

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Commercial & Credit Control</h1>
                    <p className="subtitle">Commitments, Credit Risk, and Procurement Management</p>
                </div>
            </div>

            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card blue">
                    <div className="stat-card-header">
                        <div className="stat-card-value">12</div>
                        <AccountBalanceWalletIcon style={{ color: 'var(--accent-blue)' }} />
                    </div>
                    <div className="stat-card-label">Active Credit Agreements</div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-card-header">
                        <div className="stat-card-value">5</div>
                        <AssignmentIcon style={{ color: 'var(--accent-orange)' }} />
                    </div>
                    <div className="stat-card-label">Pending Purchase Orders</div>
                </div>
                <div className="stat-card red">
                    <div className="stat-card-header">
                        <div className="stat-card-value">KSh 1.2M</div>
                        <ShoppingCartIcon style={{ color: 'var(--accent-red)' }} />
                    </div>
                    <div className="stat-card-label">Outstanding Commitment</div>
                </div>
            </div>

            <div className="tabs-container" style={{ marginBottom: 20 }}>
                <div className="tabs glass-overlay">
                    <button className={`tab-btn ${activeTab === 'credit' ? 'active' : ''}`} onClick={() => setActiveTab('credit')}>
                        <AccountBalanceWalletIcon style={{ fontSize: 18, marginRight: 8 }} /> Student Credit
                    </button>
                    <button className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
                        <ListAltIcon style={{ fontSize: 18, marginRight: 8 }} /> Promissory Notes
                    </button>
                    <button className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
                        <LocalShippingIcon style={{ fontSize: 18, marginRight: 8 }} /> Service Orders
                    </button>
                    <button className={`tab-btn ${activeTab === 'procurement' ? 'active' : ''}`} onClick={() => setActiveTab('procurement')}>
                        <ShoppingCartIcon style={{ fontSize: 18, marginRight: 8 }} /> Procurement
                    </button>
                </div>
            </div>

            <div className="commercial-content card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid var(--border-color)' }}>
                    <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-surface)', padding: '6px 15px', borderRadius: 8, width: 300 }}>
                        <SearchIcon style={{ fontSize: 18, color: 'var(--text-muted)', marginRight: 10 }} />
                        <input type="text" placeholder="Search entries..." style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none' }} />
                    </div>
                    <button className="btn-primary" onClick={() => alert('New Entry Form would open here')}>
                        <AddIcon style={{ fontSize: 18, marginRight: 8 }} /> Create {activeTab.toUpperCase()}
                    </button>
                </div>

                <div className="table-wrapper">
                    {loading ? (
                        <div className="loading-shimmer" style={{ height: 300 }}></div>
                    ) : (
                        <table className="data-table">
                            {activeTab === 'credit' && (
                                <>
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Guardian</th>
                                            <th>Commitment</th>
                                            <th>Installments</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.length === 0 ? (
                                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>No agreements found</td></tr>
                                        ) : data.map(item => (
                                            <tr key={item.id}>
                                                <td style={{ fontWeight: 600 }}>{item.studentName}</td>
                                                <td>{item.guardianName || 'N/A'}</td>
                                                <td>KSh {item.totalAmount.toLocaleString()}</td>
                                                <td>{item.installments?.length || 0} Scheduled</td>
                                                <td><span className={`status-pill ${item.status.toLowerCase()}`}>{item.status}</span></td>
                                                <td><button className="text-btn">View Schedule</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            )}
                            {activeTab === 'procurement' && (
                                <>
                                    <thead>
                                        <tr>
                                            <th>PO Number</th>
                                            <th>Supplier</th>
                                            <th>Total</th>
                                            <th>Department</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.length === 0 ? (
                                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>No purchase orders found</td></tr>
                                        ) : data.map(item => (
                                            <tr key={item.id}>
                                                <td style={{ fontWeight: 600 }}>{item.poNumber}</td>
                                                <td>{item.supplierName}</td>
                                                <td>KSh {item.totalAmount.toLocaleString()}</td>
                                                <td>{item.department}</td>
                                                <td><span className={`status-pill ${item.status.toLowerCase()}`}>{item.status}</span></td>
                                                <td><button className="text-btn">Details</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            )}
                            {['notes', 'services'].includes(activeTab) && (
                                <tbody>
                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 100, color: 'var(--text-muted)' }}>
                                        <div style={{ marginBottom: 15 }}>Module Under Active Development</div>
                                        <button className="btn-outline">Enable System Preview</button>
                                    </td></tr>
                                </tbody>
                            )}
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
