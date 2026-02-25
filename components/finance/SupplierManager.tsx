import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';

import AddSupplierModal from '../modals/AddSupplierModal';

const SupplierManager: React.FC = () => {
    const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSchool();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

    const filteredSuppliers = (suppliers || []).filter(s =>
        (s?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s?.kraPin || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = async (data: any) => {
        if (selectedSupplier) {
            await updateSupplier(selectedSupplier.id, data);
        } else {
            await addSupplier(data);
        }
        setIsModalOpen(false);
        setSelectedSupplier(null);
    };

    const handleEdit = (s: any) => {
        setSelectedSupplier(s);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedSupplier(null);
        setIsModalOpen(true);
    };

    return (
        <div className="supplier-manager animate-in">
            <div className="finance-toolbar">
                <div>
                    <h2 className="section-title">Supplier Registry</h2>
                    <p className="text-muted text-xs">Manage material providers and service vendors</p>
                </div>
                <button className="btn btn-primary" onClick={handleAdd} title="Register a new vendor" aria-label="Add Supplier">
                    <AddIcon className="mr-2" style={{ fontSize: 18 }} />
                    Add Supplier
                </button>
            </div>

            <div className="finance-nav-row">
                <div className="search-box-container">
                    <SearchIcon className="search-box-icon" />
                    <input
                        type="text"
                        className="form-control search-input-pl"
                        placeholder="Search by name or PIN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        title="Search through registered suppliers"
                        aria-label="Search Suppliers"
                    />
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Supplier Name</th>
                            <th>KRA PIN</th>
                            <th>Contact</th>
                            <th>Payment Terms</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSuppliers.length > 0 ? filteredSuppliers.map(s => (
                            <tr key={s.id}>
                                <td>
                                    <div className="data-table-name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <BusinessIcon style={{ fontSize: 16, color: '#3b82f6' }} />
                                        {s.name}
                                    </div>
                                </td>
                                <td><code>{s.kraPin}</code></td>
                                <td>
                                    <div className="text-sm">{s.contactPerson}</div>
                                    <div className="text-muted text-xs" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <PhoneIcon style={{ fontSize: 10 }} /> {s.phone}
                                    </div>
                                </td>
                                <td>{s.paymentTerms}</td>
                                <td><span className={`badge ${s.status === 'Active' ? 'green' : 'red'}`}>{s.status}</span></td>
                                <td className="text-right">
                                    <div className="action-buttons-flex" style={{ justifyContent: 'flex-end' }}>
                                        <button className="action-btn" onClick={() => handleEdit(s)} title="Edit supplier details" aria-label="Edit">
                                            <EditIcon style={{ fontSize: 18 }} />
                                        </button>
                                        <button className="action-btn" onClick={() => { if (window.confirm('Delete this supplier?')) deleteSupplier(s.id); }} title="Remove from registry" aria-label="Delete">
                                            <DeleteIcon style={{ fontSize: 18, color: '#ef4444' }} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="p-20 text-center text-muted">
                                    No suppliers found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <AddSupplierModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedSupplier(null); }}
                onSave={handleSave}
                initialData={selectedSupplier}
            />
        </div>
    );
};

export default SupplierManager;
