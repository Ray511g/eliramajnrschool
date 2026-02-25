import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

export default function AddBudgetAllocationModal({ isOpen, onClose, onSave }: Props) {
    const [form, setForm] = useState({
        year: new Date().getFullYear(),
        department: 'Academic',
        category: 'Utilities',
        allocatedAmount: 0
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (form.allocatedAmount <= 0) {
            alert('Allocation amount must be greater than zero');
            return;
        }
        onSave(form);
        onClose();
        setForm({
            year: new Date().getFullYear(),
            department: 'Academic',
            category: 'Utilities',
            allocatedAmount: 0
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="section-title">Allocate New Budget</h2>
                    <button className="modal-close" onClick={onClose}><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Department *</label>
                                <select
                                    className="form-control"
                                    value={form.department}
                                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                                    required
                                >
                                    <option>Academic</option>
                                    <option>Administration</option>
                                    <option>Operations</option>
                                    <option>Extracurricular</option>
                                    <option>Feeding</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category *</label>
                                <select
                                    className="form-control"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    required
                                >
                                    <option>Utilities</option>
                                    <option>Maintenance</option>
                                    <option>Feeding</option>
                                    <option>Academic Materials</option>
                                    <option>Salaries</option>
                                    <option>Transport</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid-2" style={{ marginTop: 12 }}>
                            <div className="form-group">
                                <label className="form-label">Amount (KES) *</label>
                                <input
                                    className="form-control"
                                    type="number"
                                    value={form.allocatedAmount || ''}
                                    onChange={(e) => setForm({ ...form, allocatedAmount: parseFloat(e.target.value) || 0 })}
                                    required
                                    min="1"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Financial Year *</label>
                                <input
                                    className="form-control"
                                    type="number"
                                    value={form.year || ''}
                                    onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || new Date().getFullYear() })}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">
                            <SaveIcon className="mr-2" style={{ fontSize: 18 }} />
                            Save Allocation
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
