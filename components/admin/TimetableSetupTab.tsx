import React, { useState } from 'react';
import SchoolIcon from '@mui/icons-material/School';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useSchool, defaultTimeSlots } from '../../context/SchoolContext';

export const TimetableSetupTab: React.FC = () => {
    const { timeSlots, updateSettings, settings } = useSchool();
    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [localSlots, setLocalSlots] = useState<any[]>(timeSlots || defaultTimeSlots);

    const handleSave = async () => {
        const success = await updateSettings({ ...settings, timeSlots: localSlots });
        if (success) setEditingIdx(null);
    };

    const handleReset = async () => {
        if (confirm('Reset all timetable slots to system defaults?')) {
            await updateSettings({ ...settings, timeSlots: defaultTimeSlots });
            setLocalSlots(defaultTimeSlots);
        }
    };

    const updateSlotField = (idx: number, field: string, value: any) => {
        const updated = [...localSlots];
        updated[idx] = { ...updated[idx], [field]: value };
        setLocalSlots(updated);
    };

    const removeSlot = (idx: number) => {
        setLocalSlots(localSlots.filter((_, i) => i !== idx));
    };

    const addSlot = () => {
        setLocalSlots([...localSlots, { label: 'New Period', startTime: '08:00', endTime: '08:40', type: 'Lesson', order: localSlots.length + 1 }]);
        setEditingIdx(localSlots.length);
    };

    return (
        <div className="admin-section">
            <div className="flex-between m-0" style={{ marginBottom: 20 }}>
                <h3 className="m-0"><SchoolIcon className="nav-icon" /> Academic Timetable Lifecycle</h3>
                <div className="flex-row gap-10">
                    <button className="btn-outline" onClick={handleReset}><RestartAltIcon style={{ fontSize: 18 }} /> Reset Defaults</button>
                    <button className="btn-primary" onClick={addSlot}><AddIcon style={{ fontSize: 18 }} /> Add Slot</button>
                    {localSlots !== timeSlots && (
                        <button className="btn-primary green" onClick={handleSave}><SaveIcon style={{ fontSize: 18 }} /> Save Changes</button>
                    )}
                </div>
            </div>

            <div className="card">
                <p style={{ marginBottom: 20, color: 'var(--text-secondary)' }}>Configure global lesson periods and breaks. These reflect immediately across all classes.</p>
                <div className="card-grid">
                    {localSlots.map((slot, idx) => (
                        <div key={idx} className="card p-0" style={{ background: 'var(--bg-surface)', border: editingIdx === idx ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)' }}>
                            <div className="card-body" style={{ padding: 15 }}>
                                {editingIdx === idx ? (
                                    <div className="flex-column gap-10">
                                        <input
                                            className="form-control small"
                                            value={slot.label}
                                            onChange={e => updateSlotField(idx, 'label', e.target.value)}
                                            placeholder="Label"
                                        />
                                        <div className="flex-row gap-5">
                                            <input
                                                type="time"
                                                className="form-control small"
                                                value={slot.startTime}
                                                onChange={e => updateSlotField(idx, 'startTime', e.target.value)}
                                            />
                                            <input
                                                type="time"
                                                className="form-control small"
                                                value={slot.endTime}
                                                onChange={e => updateSlotField(idx, 'endTime', e.target.value)}
                                            />
                                        </div>
                                        <select
                                            className="form-control small"
                                            value={slot.type}
                                            onChange={e => updateSlotField(idx, 'type', e.target.value)}
                                        >
                                            <option value="Lesson">Lesson</option>
                                            <option value="Break">Short Break</option>
                                            <option value="Lunch">Lunch Break</option>
                                            <option value="Activity">Extra-Curricular</option>
                                        </select>
                                        <div className="flex-row gap-10 mt-5">
                                            <button className="btn-primary small" onClick={() => setEditingIdx(null)}>Done</button>
                                            <button className="btn-icon danger" onClick={() => removeSlot(idx)}><DeleteIcon fontSize="small" /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex-between" style={{ marginBottom: 8 }}>
                                            <span className={`badge small ${slot.type === 'Lesson' ? 'blue' : slot.type === 'Break' ? 'orange' : 'green'}`}>{slot.type}</span>
                                            <button className="btn-icon" onClick={() => setEditingIdx(idx)}><EditIcon fontSize="small" /></button>
                                        </div>
                                        <div className="fw-600 fs-15" style={{ marginBottom: 4 }}>{slot.label}</div>
                                        <div className="fs-13 opacity-70">{slot.startTime} — {slot.endTime}</div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
