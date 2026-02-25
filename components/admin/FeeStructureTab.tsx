import React, { useState } from 'react';
import PaymentIcon from '@mui/icons-material/Payment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryIcon from '@mui/icons-material/History';
import { useSchool } from '../../context/SchoolContext';

export const FeeStructureTab: React.FC = () => {
    const { feeStructures, addFeeStructure, updateFeeStructure, deleteFeeStructure, applyFeeStructure, revertFeeStructure, activeGrades } = useSchool();
    const [showAddFee, setShowAddFee] = useState(false);
    const [editingFee, setEditingFee] = useState<any>(null);
    const [feeForm, setFeeForm] = useState({ name: '', amount: 0, grade: 'Grade 1', category: 'Tuition', type: 'Mandatory' as 'Mandatory' | 'Optional' });

    const handleSaveFee = () => {
        if (!feeForm.name || feeForm.amount <= 0) return;
        if (editingFee) {
            updateFeeStructure(editingFee.id, feeForm as any);
        } else {
            addFeeStructure(feeForm as any);
        }
        setFeeForm({ name: '', amount: 0, grade: 'Grade 1', category: 'Tuition', type: 'Mandatory' });
        setEditingFee(null);
        setShowAddFee(false);
    };

    const groupedFees = (feeStructures || []).reduce((acc: any, item) => {
        if (!acc[item.grade]) acc[item.grade] = [];
        acc[item.grade].push(item);
        return acc;
    }, {});

    const sortedGrades = Object.keys(groupedFees).sort();

    return (
        <div className="admin-section">
            <div className="flex-between" style={{ marginBottom: 20 }}>
                <h3 className="m-0"><PaymentIcon className="nav-icon" /> Fee Structure Management</h3>
                <div className="flex-row gap-10">
                    <button className="btn-outline" onClick={() => (applyFeeStructure as any)()}>
                        <CheckCircleIcon style={{ fontSize: 18, marginRight: 6 }} /> Publish All
                    </button>
                    <button className="btn-primary" onClick={() => { setEditingFee(null); setFeeForm({ name: '', amount: 0, grade: 'Grade 1', category: 'Tuition', type: 'Mandatory' }); setShowAddFee(true); }}>
                        <AddIcon style={{ fontSize: 18 }} /> Add Item
                    </button>
                </div>
            </div>

            {showAddFee && (
                <div className="card" style={{ marginBottom: 24, border: '1px solid var(--accent-blue)', background: 'rgba(59, 130, 246, 0.02)' }}>
                    <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <h4 className="m-0">{editingFee ? 'Modify Fee Item' : 'Create New Fee Requirement'}</h4>
                    </div>
                    <div className="card-body">
                        <div className="grid-3">
                            <div className="form-group">
                                <label>Target Grade / Level</label>
                                <select className="form-control" value={feeForm.grade} onChange={e => setFeeForm({ ...feeForm, grade: e.target.value })}>
                                    {activeGrades.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Fee Name</label>
                                <input type="text" className="form-control" value={feeForm.name} onChange={e => setFeeForm({ ...feeForm, name: e.target.value })} placeholder="e.g. Admission Fee" />
                            </div>
                            <div className="form-group">
                                <label>Amount (KSh)</label>
                                <input type="number" className="form-control" value={feeForm.amount} onChange={e => setFeeForm({ ...feeForm, amount: Number(e.target.value) })} />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select className="form-control" value={feeForm.category} onChange={e => setFeeForm({ ...feeForm, category: e.target.value })}>
                                    <option value="Tuition">Tuition</option>
                                    <option value="Transport">Transport</option>
                                    <option value="Boarding">Boarding</option>
                                    <option value="Exam">Examination</option>
                                    <option value="Activity">Activity & Sports</option>
                                    <option value="Other">Other / Miscellaneous</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Mandatory / Optional</label>
                                <select className="form-control" value={feeForm.type} onChange={e => setFeeForm({ ...feeForm, type: e.target.value as any })}>
                                    <option value="Mandatory">Required for all</option>
                                    <option value="Optional">Optional / Per Service</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex-row mt-20">
                            <button className="btn-primary" onClick={handleSaveFee}>{editingFee ? 'Update Item' : 'Add to Structure'}</button>
                            <button className="btn-outline" onClick={() => setShowAddFee(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="fee-grid">
                {sortedGrades.map(grade => {
                    const gradeFees = groupedFees[grade];
                    const total = gradeFees.reduce((sum: number, f: any) => sum + f.amount, 0);
                    const isDraft = gradeFees.some((f: any) => f.status === 'Draft');

                    return (
                        <div key={grade} className="card p-0">
                            <div className="card-header flex-between" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
                                <div>
                                    <h4 className="m-0">{grade}</h4>
                                    <div className="fs-11 opacity-60">{gradeFees.length} Items Configured</div>
                                </div>
                                <div className="text-right">
                                    <div className="fw-700 fs-16">KSh {total.toLocaleString()}</div>
                                    {isDraft && <span className="badge small orange">Contains Drafts</span>}
                                </div>
                            </div>
                            <div className="card-body p-0">
                                <table className="data-table small">
                                    <tbody>
                                        {gradeFees.map((f: any) => (
                                            <tr key={f.id}>
                                                <td>
                                                    <div className="fw-500">{f.name}</div>
                                                    <div className="fs-10 opacity-60">{f.category} • {f.type}</div>
                                                </td>
                                                <td className="text-right fw-600">{f.amount.toLocaleString()}</td>
                                                <td className="text-right">
                                                    <div className="flex-row gap-10 justify-end">
                                                        <button className="btn-icon xs" onClick={() => { setEditingFee(f); setFeeForm({ name: f.name, amount: f.amount, grade: f.grade, category: f.category, type: f.type }); setShowAddFee(true); }}><EditIcon fontSize="inherit" /></button>
                                                        <button className="btn-icon xs red" onClick={() => deleteFeeStructure(f.id)}><DeleteIcon fontSize="inherit" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="card-footer p-0 flex-row" style={{ padding: '8px 12px', gap: 8 }}>
                                <button className="btn-outline flex-1 fs-11" style={{ padding: '4px 8px' }} onClick={() => (applyFeeStructure as any)(grade)}>
                                    <CheckCircleIcon style={{ fontSize: 14, marginRight: 4 }} /> Publish
                                </button>
                                <button className="btn-outline flex-1 fs-11 red" style={{ padding: '4px 8px' }} onClick={() => revertFeeStructure(grade)}>
                                    <HistoryIcon style={{ fontSize: 14, marginRight: 4 }} /> Reset
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
