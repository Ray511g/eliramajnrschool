import React from 'react';
import SchoolIcon from '@mui/icons-material/School';
import { useSchool, defaultTimeSlots } from '../../context/SchoolContext';

export const TimetableSetupTab: React.FC = () => {
    const { timeSlots, updateSettings, settings } = useSchool();

    const handleUpdateSlots = async (slots: any[]) => {
        await updateSettings({ ...settings, timeSlots: slots });
    };

    return (
        <div className="admin-section" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0 }}><SchoolIcon style={{ fontSize: 22 }} /> Academic Timetable Lifecycle</h3>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-outline" onClick={() => handleUpdateSlots(defaultTimeSlots)}>Reset to Defaults</button>
                    <button className="btn-primary" onClick={() => alert('New slot feature coming soon')}>Add Custom Slot</button>
                </div>
            </div>

            <div className="card">
                <p className="text-muted" style={{ marginBottom: 20 }}>Global time configuration for periods, breaks, and extra-curricular activities.</p>
                <div className="grid-4" style={{ gap: 12 }}>
                    {(timeSlots || defaultTimeSlots).map((slot, idx) => (
                        <div key={idx} className="card-compact" style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12, background: 'var(--bg-surface)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <span className="badge blue small">{slot.type}</span>
                                <span style={{ fontSize: 11, color: '#94a3b8' }}>#{idx + 1}</span>
                            </div>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>{slot.label}</div>
                            <div style={{ fontSize: 13, opacity: 0.8 }}>{slot.start} — {slot.end}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
