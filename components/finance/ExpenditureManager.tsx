import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PaymentsIcon from '@mui/icons-material/Payments';
import FilePresentIcon from '@mui/icons-material/FilePresent';

import AddExpenseRequestModal from '../modals/AddExpenseRequestModal';
import PurchaseOrderDetailsModal from '../modals/PurchaseOrderDetailsModal'; // Reusing PO details style or can be generic

const ExpenditureManager: React.FC = () => {
    const { user, hasPermission } = useAuth();
    const { expenses, actOnExpenditure } = useSchool();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExp, setSelectedExp] = useState<any>(null);

    const filteredExpenses = (expenses || []).filter(e =>
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const canApprove = hasPermission('finance', 'APPROVE');
    const canPay = hasPermission('finance', 'PAY');

    return (
        <div className="finance-content animate-in">
            <div className="finance-nav-row">
                <div className="search-box-container">
                    <SearchIcon className="search-box-icon" />
                    <input
                        type="text"
                        className="form-control search-input-pl"
                        placeholder="Search expenditures..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        title="Search within expenses"
                        aria-label="Search"
                    />
                </div>
                <div className="finance-toolbar-right">
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} title="Create a new fund request" aria-label="Raise Request">
                        <AddIcon className="mr-2" style={{ fontSize: 18 }} /> Raise Request
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Requested By</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th className="text-right">Amount</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses.length === 0 ? (
                            <tr><td colSpan={6} className="p-40 text-center text-muted">No expenditure requests found</td></tr>
                        ) : filteredExpenses.map(e => (
                            <tr key={e.id}>
                                <td>
                                    <div className="data-table-name">{e.requestedByName}</div>
                                    <div className="text-xs text-muted">{new Date(e.createdAt).toLocaleDateString()}</div>
                                </td>
                                <td>{e.description}</td>
                                <td><span className="badge blue">{e.category}</span></td>
                                <td className="text-right" style={{ fontWeight: 600 }}>KSh {e.amount.toLocaleString()}</td>
                                <td>
                                    <span className={`badge ${e.status === 'Paid' ? 'green' :
                                        e.status === 'Approved' ? 'blue' :
                                            e.status === 'Pending' ? 'orange' : 'red'
                                        }`}>
                                        {e.status}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <div className="action-buttons-flex" style={{ justifyContent: 'flex-end' }}>
                                        {e.status === 'Pending' && canApprove && (
                                            <button className="action-btn" style={{ color: '#10b981' }} onClick={() => actOnExpenditure(e.id, 'APPROVE')} title="Approve Request">
                                                <CheckCircleIcon style={{ fontSize: 20 }} />
                                            </button>
                                        )}
                                        {e.status === 'Approved' && canPay && (
                                            <button className="action-btn" style={{ color: '#3b82f6' }} onClick={() => actOnExpenditure(e.id, 'PAY')} title="Mark as Paid">
                                                <PaymentsIcon style={{ fontSize: 20 }} />
                                            </button>
                                        )}
                                        {e.status === 'Pending' && canApprove && (
                                            <button className="action-btn" style={{ color: '#ef4444' }} onClick={() => actOnExpenditure(e.id, 'REJECT')} title="Decline Request">
                                                <CancelIcon style={{ fontSize: 20 }} />
                                            </button>
                                        )}
                                        <button
                                            className="action-btn"
                                            title="View Details"
                                            onClick={() => setSelectedExp(e)}
                                        >
                                            <FilePresentIcon style={{ fontSize: 20 }} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AddExpenseRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            {selectedExp && (
                <PurchaseOrderDetailsModal
                    po={{
                        poNumber: `EXP-${selectedExp.id.slice(-6).toUpperCase()}`,
                        status: selectedExp.status,
                        createdAt: selectedExp.createdAt,
                        supplierName: selectedExp.requestedByName,
                        department: selectedExp.category,
                        totalAmount: selectedExp.amount,
                        items: [{ desc: selectedExp.description, qty: 1, unitPrice: selectedExp.amount, total: selectedExp.amount }]
                    }}
                    onClose={() => setSelectedExp(null)}
                />
            )}
        </div>
    );
};

export default ExpenditureManager;
