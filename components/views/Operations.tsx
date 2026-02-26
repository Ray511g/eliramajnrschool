import React, { useState, useEffect, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import InventoryIcon from '@mui/icons-material/Inventory';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddOperationModal from '../modals/AddOperationModal';

type OpTab = 'inventory' | 'library' | 'transport';

export default function OperationsPage() {
    const { tryApi, showToast } = useSchool();
    const [activeTab, setActiveTab] = useState<OpTab>('inventory');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [data, setData] = useState({
        inventory: [] as any[],
        library: [] as any[],
        transport: [] as any[]
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [invRes, libRes, transRes] = await Promise.all([
                tryApi('/api/inventory'),
                tryApi('/api/library'),
                tryApi('/api/transport')
            ]);
            setData({
                inventory: invRes?.ok ? await invRes.json() : [],
                library: libRes?.ok ? await libRes.json() : [],
                transport: transRes?.ok ? await transRes.json() : []
            });
        } catch (e) {}
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const filteredData = useMemo(() => {
        const activeData = data[activeTab] || [];
        const s = searchTerm.toLowerCase();
        return activeData.filter((item: any) => 
            (item.name || item.title || item.plateNumber || '').toLowerCase().includes(s)
        );
    }, [data, activeTab, searchTerm]);

    const handleSave = async (formData: any) => {
        try {
            const isEditing = !!editingItem;
            const res = await tryApi(`/api/${activeTab}`, {
                method: isEditing ? 'PUT' : 'POST',
                body: JSON.stringify(formData)
            });
            if (res?.ok) {
                showToast(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} record ${isEditing ? 'updated' : 'added'} successfully`, 'success');
                setIsAddModalOpen(false);
                setEditingItem(null);
                fetchData();
            } else {
                showToast(`Failed to save ${activeTab} record`, 'error');
            }
        } catch (e) {
            showToast(`An error occurred while saving`, 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(`Are you sure you want to delete this ${activeTab} record?`)) return;
        try {
            const res = await tryApi(`/api/${activeTab}?id=${id}`, { method: 'DELETE' });
            if (res?.ok) {
                showToast('Record deleted successfully', 'success');
                fetchData();
            }
        } catch (e) {
            showToast('Failed to delete record', 'error');
        }
    };

    const openEdit = (item: any) => {
        setEditingItem(item);
        setIsAddModalOpen(true);
    };

    return (
        <div className="operations-view animate-in">
            <AddOperationModal 
                isOpen={isAddModalOpen} 
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingItem(null);
                }} 
                type={activeTab}
                onAdd={handleSave}
                initialData={editingItem}
            />

            <div className="view-header">
                <div className="header-meta">
                    <h1 className="view-title">Institutional Operations</h1>
                    <p className="view-subtitle">Manage school assets, logistics, and resource circulation</p>
                </div>
                <div className="view-actions">
                    <button className="btn btn-primary premium-shadow" onClick={() => {
                        setEditingItem(null);
                        setIsAddModalOpen(true);
                    }}>
                        <AddIcon className="mr-2" style={{ fontSize: 18 }} />
                        {activeTab === 'inventory' ? 'Add Item' : activeTab === 'library' ? 'Add Book' : 'Register Vehicle'}
                    </button>
                    <button className="btn btn-outline" onClick={fetchData} title="Refresh Data">
                        <AutorenewIcon style={{ fontSize: 18 }} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="ops-stats-grid">
                <div className="ops-stat-card glass-card">
                    <div className="stat-label">Total Inventory Value</div>
                    <div className="stat-value">KES {(data.inventory.reduce((sum, item) => sum + ((item.unitPrice || 0) * (item.quantity || 0)), 0)).toLocaleString()}</div>
                    <div className="stat-delta up"><TrendingUpIcon /> {data.inventory.length} active categories</div>
                </div>
                <div className="ops-stat-card glass-card">
                    <div className="stat-label">Libary Stock</div>
                    <div className="stat-value">{(data.library.reduce((sum, item) => sum + (item.totalCopies || 0), 0)).toLocaleString()}</div>
                    <div className="stat-footer">{data.library.length} titles available</div>
                </div>
                <div className="ops-stat-card glass-card">
                    <div className="stat-label">Fleet Status</div>
                    <div className="stat-value">{data.transport.length}</div>
                    <div className="stat-footer">{data.transport.filter(b => b.status === 'Active').length} operational vehicles</div>
                </div>
            </div>

            <div className="tab-nav-wrapper">
                <div className="tab-nav">
                    <button className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
                        <InventoryIcon className="mr-2" /> Inventory
                    </button>
                    <button className={`tab-btn ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>
                        <MenuBookIcon className="mr-2" /> Library
                    </button>
                    <button className={`tab-btn ${activeTab === 'transport' ? 'active' : ''}`} onClick={() => setActiveTab('transport')}>
                        <LocalShippingIcon className="mr-2" /> Transport
                    </button>
                    <div className={`tab-highlight ${activeTab}`}></div>
                </div>
                
                <div className="search-bar-mini glass-card">
                    <SearchIcon style={{ position: 'absolute', left: 12, top: 10, fontSize: 18, color: '#94a3b8' }} />
                    <input 
                        type="text" 
                        placeholder={`Search ${activeTab}...`} 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="ops-table-container card">
                {loading && data[activeTab].length === 0 ? (
                    <div className="p-40 text-center"><AutorenewIcon className="animate-spin text-blue-500" style={{fontSize: 40}} /> <p className="mt-4 text-muted">Loading assets...</p></div>
                ) : (
                    <table className="ops-table">
                        <thead>
                            {activeTab === 'inventory' && (
                                <tr>
                                    <th>Item Name</th>
                                    <th>Category</th>
                                    <th>Stock Level</th>
                                    <th>Status</th>
                                    <th>Unit Price</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            )}
                            {activeTab === 'library' && (
                                <tr>
                                    <th>Book Title</th>
                                    <th>Author</th>
                                    <th>ISBN</th>
                                    <th>Units</th>
                                    <th>Category</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            )}
                            {activeTab === 'transport' && (
                                <tr>
                                    <th>Plate Number</th>
                                    <th>Driver Details</th>
                                    <th>Model</th>
                                    <th>Capacity</th>
                                    <th>Condition</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? filteredData.map((item: any) => (
                                <tr key={item.id} className="animate-slide-up">
                                    {activeTab === 'inventory' && (
                                        <>
                                            <td className="font-bold">{item.name}</td>
                                            <td><span className="pill pill-plain">{item.category}</span></td>
                                            <td>
                                                <div className="stock-info">
                                                    <span className={`pill ${item.quantity < (item.reorderLevel || 5) ? 'pill-danger' : 'pill-success'}`}>
                                                        {item.quantity} in stock
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                {item.quantity < (item.reorderLevel || 5) ? 
                                                    <span className="text-red-500 font-bold text-xs flex items-center gap-1">⚠️ Restock Soon</span> 
                                                    : <span className="text-green-500 text-xs">Healthy</span>
                                                }
                                            </td>
                                            <td>KES {item.unitPrice?.toLocaleString()}</td>
                                        </>
                                    )}
                                    {activeTab === 'library' && (
                                        <>
                                            <td className="font-bold">{item.title}</td>
                                            <td>{item.author}</td>
                                            <td className="text-xs font-mono">{item.isbn || 'N/A'}</td>
                                            <td>{item.availableCopies} / {item.totalCopies}</td>
                                            <td>{item.category || 'General'}</td>
                                        </>
                                    )}
                                    {activeTab === 'transport' && (
                                        <>
                                            <td className="font-bold">{item.plateNumber}</td>
                                            <td>
                                                <div className="text-sm font-bold">{item.driverName || 'Unassigned'}</div>
                                                <div className="text-xs text-muted">{item.driverPhone || 'No Contacts'}</div>
                                            </td>
                                            <td>{item.model || 'N/A'}</td>
                                            <td>{item.capacity} seats</td>
                                            <td><span className={`pill ${item.status === 'Active' ? 'pill-success' : 'pill-danger'}`}>{item.status}</span></td>
                                        </>
                                    )}
                                    <td className="text-right">
                                        <div className="action-row">
                                            <button className="btn-icon" onClick={() => openEdit(item)} title="Edit"><EditIcon style={{ fontSize: 18 }} /></button>
                                            <button className="btn-icon text-red-500" onClick={() => handleDelete(item.id)} title="Delete"><DeleteIcon style={{ fontSize: 18 }} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '100px 0' }}>
                                        <div className="empty-state">
                                            <div className="empty-icon-ring">
                                                {activeTab === 'inventory' && <InventoryIcon style={{ fontSize: 40 }} />}
                                                {activeTab === 'library' && <MenuBookIcon style={{ fontSize: 40 }} />}
                                                {activeTab === 'transport' && <LocalShippingIcon style={{ fontSize: 40 }} />}
                                            </div>
                                            <h3>No {activeTab} records found</h3>
                                            <p>Start tracking school assets and logistics by adding your first record.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <style jsx>{`
                .operations-view { padding: 40px; }
                .view-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 32px; }
                .ops-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px; }
                .ops-stat-card { padding: 24px; border-radius: 24px; border: 1px solid var(--border-color); background: var(--card-bg); }
                .stat-label { font-size: 11px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.7; }
                .stat-value { font-size: 36px; font-weight: 900; margin: 12px 0; color: var(--text-primary); letter-spacing: -1px; }
                .stat-footer { font-size: 13px; color: var(--text-muted); font-weight: 500; }
                .stat-delta { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; }
                .stat-delta.up { color: #10b981; }

                .tab-nav-wrapper { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; position: relative; }
                .tab-nav { display: flex; gap: 8px; background: rgba(0,0,0,0.05); padding: 4px; border-radius: 12px; position: relative; }
                .tab-btn { padding: 10px 20px; border-radius: 10px; font-weight: 600; color: var(--text-secondary); transition: all 0.2s; z-index: 2; position: relative; }
                .tab-btn.active { color: white; }
                .tab-highlight { position: absolute; height: calc(100% - 8px); background: #3b82f6; border-radius: 8px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); z-index: 1; top: 4px;}
                .tab-highlight.inventory { left: 4px; width: 135px; }
                .tab-highlight.library { left: 145px; width: 115px; }
                .tab-highlight.transport { left: 265px; width: 135px; }

                .search-bar-mini { position: relative; width: 320px; border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden; }
                .search-bar-mini input { width: 100%; border: none; background: transparent; padding: 10px 16px 10px 40px; color: var(--text-primary); outline: none; font-size: 14px; }
                
                .ops-table-container { overflow-x: auto; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 20px; }
                .ops-table { width: 100%; border-collapse: collapse; }
                .ops-table th { text-align: left; padding: 16px 20px; background: rgba(0,0,0,0.02); font-size: 12px; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; border-bottom: 1px solid var(--border-color); opacity: 0.6; }
                .ops-table td { padding: 18px 20px; border-bottom: 1px solid var(--border-color); font-size: 14px; color: var(--text-primary); }
                .ops-table tr:last-child td { border-bottom: none; }
                .ops-table tr:hover td { background: rgba(59, 130, 246, 0.05); }

                .action-row { display: flex; justify-content: flex-end; gap: 8px; }
                .btn-icon:hover { background: rgba(59, 130, 246, 0.1); }
                .pill { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
                .pill-success { background: #ecfdf5; color: #10b981; }
                .pill-danger { background: #fee2e2; color: #ef4444; }
                .pill-plain { background: rgba(0,0,0,0.05); color: var(--text-secondary); }

                .empty-state { padding: 60px 0; }
                .empty-icon-ring { width: 100px; height: 100px; border: 4px solid rgba(0,0,0,0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: #94a3b8; }
                .empty-state h3 { font-size: 20px; font-weight: 800; margin: 0 0 8px; }
                .empty-state p { font-size: 14px; color: var(--text-muted); max-width: 300px; margin: 0 auto; }
                
                .premium-shadow { box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39); }
                
                @media (max-width: 1024px) {
                    .ops-stats-grid { grid-template-columns: 1fr; }
                    .tab-nav-wrapper { flex-direction: column; align-items: flex-start; gap: 20px; }
                    .search-bar-mini { width: 100%; }
                }
            `}</style>
        </div>
    );
}
