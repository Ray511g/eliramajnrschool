import React from 'react';
import SchoolIcon from '@mui/icons-material/School';
import { useSchool, defaultTimeSlots } from '../../context/SchoolContext';

export const TimetableSetupTab: React.FC = () => {
    const { timeSlots, updateSettings, settings } = useSchool();

    const handleUpdateSlots = async (slots: any[]) => {
        await updateSettings({ ...settings, timeSlots: slots });
    };

    return (
        <div className="admin-section">
            <div className="flex-between" style={{ marginBottom: 20 }}>
                <h3 className="m-0"><SchoolIcon className="nav-icon" /> Academic Timetable Lifecycle</h3>
                <div className="flex-row gap-10">
                    <button className="btn-outline" onClick={() => handleUpdateSlots(defaultTimeSlots)}>Reset to Defaults</button>
                    <button className="btn-primary" onClick={() => alert('New slot feature coming soon')}>Add Custom Slot</button>
                </div>
            </div>

            <div className="card">
                <p style={{ marginBottom: 20, color: 'var(--text-secondary)' }}>Global time configuration for periods, breaks, and extra-curricular activities.</p>
                <div className="card-grid">
                    {(timeSlots || defaultTimeSlots).map((slot, idx) => (
                        <div key={idx} className="card p-0" style={{ background: 'var(--bg-surface)' }}>
                            <div className="card-body" style={{ padding: 12 }}>
                                <div className="flex-between" style={{ marginBottom: 8 }}>
                                    <span className="badge blue small">{slot.type}</span>
                                    <span className="fs-11 opacity-60">#{idx + 1}</span>
                                </div>
                                <div className="fw-600" style={{ marginBottom: 4 }}>{slot.label}</div>
                                <div className="fs-13 opacity-80">{slot.startTime} — {slot.endTime}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
