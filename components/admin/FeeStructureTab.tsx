import React, { useState } from 'react';
import PaymentIcon from '@mui/icons-material/Payment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FilePresentIcon from '@mui/icons-material/FilePresent';
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
        <div className="admin-section" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0 }}><PaymentIcon style={{ fontSize: 22 }} /> Fee Structure Management</h3>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-outline" onClick={() => (applyFeeStructure as any)()} style={{ color: 'var(--accent-blue)', borderColor: 'var(--accent-blue)' }}>
                        <CheckCircleIcon style={{ fontSize: 18 }} /> Publish All Drafts
                    </button>
                    <button className="btn-primary" onClick={() => { setEditingFee(null); setFeeForm({ name: '', amount: 0, grade: 'Grade 1', category: 'Tuition', type: 'Mandatory' }); setShowAddFee(true); }}>
                        <AddIcon style={{ fontSize: 18 }} /> Add Fee Item
                    </button>
                </div>
            </div>

            {showAddFee && (
                <div className="card" style={{ marginBottom: 24, border: '1px solid var(--accent-blue)' }}>
                    <div className="card-header">
                        <h4>{editingFee ? 'Modify Fee Item' : 'Create New Fee Requirement'}</h4>
                    </div>
                    <div className="card-body">
                        <div className="grid-3" style={{ gap: 15 }}>
                            <div className="form-group">
                                <label>Target Grade / Level</label>
                                <select className="form-control" value={feeForm.grade} onChange={e => setFeeForm({ ...feeForm, grade: e.target.value })}>
                                    {activeGrades.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Fee Name</label>
                                <input type="text" className="form-control" value={feeForm.name} onChange={e => setFeeForm({ ...feeForm, name: e.target.value })} placeholder="e.g. Admission Fee, Activity Fee" />
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
                                    <option value="Uniform">Uniform</option>
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
                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
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
                        <div key={grade} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)' }}>
                                <div>
                                    <h4 style={{ margin: 0 }}>{grade}</h4>
                                    <div style={{ fontSize: 11, color: '#64748b' }}>{gradeFees.length} Items Configured</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 700, fontSize: 16 }}>KSh {total.toLocaleString()}</div>
                                    {isDraft && <span className="badge small orange">Contains Drafts</span>}
                                </div>
                            </div>
                            <div className="card-body" style={{ padding: 0 }}>
                                <table className="data-table small">
                                    <tbody>
                                        {gradeFees.map((f: any) => (
                                            <tr key={f.id}>
                                                <td>
                                                    <div style={{ fontWeight: 500 }}>{f.name}</div>
                                                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{f.category} • {f.type}</div>
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: 600 }}>{f.amount.toLocaleString()}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                                        <button className="btn-icon xs" onClick={() => { setEditingFee(f); setFeeForm({ name: f.name, amount: f.amount, grade: f.grade, category: f.category, type: f.type }); setShowAddFee(true); }}><EditIcon fontSize="inherit" /></button>
                                                        <button className="btn-icon xs red" onClick={() => deleteFeeStructure(f.id)}><DeleteIcon fontSize="inherit" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="card-footer" style={{ padding: 12, display: 'flex', gap: 8 }}>
                                <button className="btn-outline-sm" style={{ flex: 1, fontSize: 11 }} onClick={() => (applyFeeStructure as any)(grade)}>
                                    <CheckCircleIcon style={{ fontSize: 14 }} /> Publish
                                </button>
                                <button className="btn-outline-sm" style={{ flex: 1, fontSize: 11, color: '#ef4444', borderColor: '#ef4444' }} onClick={() => revertFeeStructure(grade)}>
                                    <HistoryIcon style={{ fontSize: 14 }} /> Reset
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
