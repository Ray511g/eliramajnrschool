import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';

const SupplierManager: React.FC = () => {
    const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSchool();
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: '',
        kraPin: '',
        contactPerson: '',
        phone: '',
        email: '',
        bankName: '',
        accountNumber: '',
        paymentTerms: 'Net 30',
        status: 'Active' as const
    });

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.kraPin.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            await updateSupplier(editingId, form);
        } else {
            await addSupplier(form);
        }
        setShowForm(false);
        setEditingId(null);
        setForm({
            name: '', kraPin: '', contactPerson: '', phone: '', email: '',
            bankName: '', accountNumber: '', paymentTerms: 'Net 30', status: 'Active'
        });
    };

    const handleEdit = (s: any) => {
        setForm({
            name: s.name, kraPin: s.kraPin, contactPerson: s.contactPerson,
            phone: s.phone, email: s.email, bankName: s.bankName,
            accountNumber: s.accountNumber, paymentTerms: s.paymentTerms, status: s.status
        });
        setEditingId(s.id);
        setShowForm(true);
    };

    return (
        <div className="supplier-manager animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700 }}>Supplier Registry</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Manage material providers and service vendors</p>
                </div>
                {!showForm && (
                    <button className="btn-primary" onClick={() => setShowForm(true)}>
                        <AddIcon style={{ fontSize: 18, marginRight: 8 }} />
                        Add Supplier
                    </button>
                )}
            </div>

            {showForm && (
                <div className="card glass-panel" style={{ marginBottom: 24, border: '1px solid var(--accent-blue)' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
                        {editingId ? 'Edit Supplier' : 'Register New Supplier'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid-2">
                            <div className="form-group">
                                <label>Company Name</label>
                                <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>KRA PIN</label>
                                <input className="form-control" value={form.kraPin} onChange={e => setForm({ ...form, kraPin: e.target.value })} required />
                            </div>
                        </div>
                        <div className="grid-3" style={{ marginTop: 16 }}>
                            <div className="form-group">
                                <label>Contact Person</label>
                                <input className="form-control" value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid-2" style={{ marginTop: 16 }}>
                            <div className="form-group">
                                <label>Bank Name</label>
                                <input className="form-control" value={form.bankName} onChange={e => setForm({ ...form, bankName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Account Number</label>
                                <input className="form-control" value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                            <button type="button" className="btn-outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
                            <button type="submit" className="btn-primary">
                                <SaveIcon style={{ fontSize: 18, marginRight: 8 }} />
                                {editingId ? 'Update Supplier' : 'Save Supplier'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!showForm && (
                <>
                    <div className="search-box" style={{ marginBottom: 20, maxWidth: 400 }}>
                        <SearchIcon />
                        <input type="text" placeholder="Search by name or PIN..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="search-input" />
                    </div>

                    <div className="table-container card" style={{ padding: 0 }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Supplier Name</th>
                                    <th>KRA PIN</th>
                                    <th>Contact</th>
                                    <th>Payment Terms</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSuppliers.length > 0 ? filteredSuppliers.map(s => (
                                    <tr key={s.id}>
                                        <td>
                                            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <BusinessIcon style={{ fontSize: 16, color: 'var(--accent-blue)' }} />
                                                {s.name}
                                            </div>
                                        </td>
                                        <td><code>{s.kraPin}</code></td>
                                        <td>
                                            <div style={{ fontSize: 13 }}>{s.contactPerson}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <PhoneIcon style={{ fontSize: 10 }} /> {s.phone}
                                            </div>
                                        </td>
                                        <td>{s.paymentTerms}</td>
                                        <td><span className={`badge ${s.status === 'Active' ? 'green' : 'red'}`}>{s.status}</span></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                <button className="table-action-btn" onClick={() => handleEdit(s)} title="Edit"><EditIcon style={{ fontSize: 16 }} /></button>
                                                <button className="table-action-btn danger" onClick={() => { if (confirm('Delete this supplier?')) deleteSupplier(s.id); }} title="Delete"><DeleteIcon style={{ fontSize: 16 }} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                                            No suppliers found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default SupplierManager;
