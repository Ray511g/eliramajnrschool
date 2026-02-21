import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { GRADES, DAYS, TIME_SLOTS, TimetableEntry, TimeSlot } from '../../types';
import AddIcon from '@mui/icons-material/Add';
import TimetableEntryModal from '../../components/modals/TimetableEntryModal';

export default function Timetable() {
    const { timetable, settings } = useSchool();
    const [selectedGrade, setSelectedGrade] = useState<string>('Grade 1');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);

    const gradeEntries = timetable.filter(e => e.grade === selectedGrade);

    // Sort and filter active slots
    const slots: TimeSlot[] = (settings.timeSlots || [])
        .filter(s => s.isActive !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    const getEntry = (day: string, slotId: string, slotLabel: string) => {
        // Try finding by slotId first (new system), fallback to timeSlot label (legacy)
        return gradeEntries.find(e =>
            e.day === day &&
            ((e.slotId === slotId) || (!e.slotId && e.timeSlot === slotLabel))
        );
    };

    const handleEdit = (entry: TimetableEntry) => {
        setEditingEntry(entry);
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingEntry(null);
    };

    const handlePrint = () => {
        window.print();
    };

    if (slots.length === 0) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <h1>Timetable</h1>
                    <p>Structure not configured</p>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                    <h3>Timetable Structure Not Set</h3>
                    <p>Please go to Admin &rarr; Timetable Structure to define your school's periods and breaks.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header no-print">
                <div className="page-header-left">
                    <h1>Timetable</h1>
                    <p>Weekly class schedule</p>
                </div>
                <div className="page-header-right">
                    <button className="btn-outline" onClick={handlePrint} style={{ marginRight: 10 }}>
                        Print Timetable
                    </button>
                    <select
                        title="Select grade for timetable view"
                        className="filter-select"
                        value={selectedGrade}
                        onChange={e => setSelectedGrade(e.target.value)}
                    >
                        {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                        <AddIcon style={{ fontSize: 18 }} /> Add Entry
                    </button>
                </div>
            </div>

            <div className="print-only">
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    {settings.logo && <img src={settings.logo} style={{ height: 60, marginBottom: 10 }} alt="School Logo" />}
                    <h1 style={{ margin: 0 }}>{settings.schoolName}</h1>
                    <p style={{ margin: 5 }}>{settings.motto}</p>
                    <h2 style={{ marginTop: 20 }}>{selectedGrade} Timetable</h2>
                </div>
            </div>

            <div className="timetable-wrapper">
                <div className="timetable-grid">
                    {/* Header row */}
                    <div className="timetable-cell header">Time</div>
                    {DAYS.map(day => (
                        <div key={day} className="timetable-cell header">{day}</div>
                    ))}

                    {/* Body rows */}
                    {slots.map(slot => {
                        const isBreak = slot.type === 'Break' || slot.type === 'Lunch' || slot.type === 'Assembly';
                        const timeDisplay = slot.startTime && slot.endTime ? `${slot.startTime} - ${slot.endTime}` : slot.label;

                        if (isBreak) {
                            const icon = slot.type === 'Break' ? '☕' : (slot.type === 'Lunch' ? '🍽️' : (slot.type === 'Assembly' ? '📢' : '🔔'));
                            const displayName = slot.name || slot.label;
                            return (
                                <React.Fragment key={slot.id}>
                                    <div className="timetable-cell time-slot">{timeDisplay}</div>
                                    <div className="timetable-cell break-row" style={{ gridColumn: 'span 5' }}>
                                        {icon} {displayName}
                                    </div>
                                </React.Fragment>
                            );
                        }

                        return (
                            <React.Fragment key={slot.id}>
                                <div className="timetable-cell time-slot">{timeDisplay}</div>
                                {DAYS.map(day => {
                                    const entry = getEntry(day, slot.id, slot.label);
                                    return (
                                        <div key={`${day}-${slot.id}`} className="timetable-cell">
                                            {entry ? (
                                                <div className="timetable-entry" onClick={() => handleEdit(entry)} style={{ cursor: 'pointer' }} title="Click to edit">
                                                    <div className="subject">{entry.subject}</div>
                                                    <div className="teacher">{entry.teacherName}</div>
                                                </div>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {showAddModal && <TimetableEntryModal grade={selectedGrade} entry={editingEntry} onClose={handleCloseModal} />}

            <style jsx>{`
                @media print {
                    @page { 
                        size: landscape;
                        margin: 10mm;
                    }
                    .no-print { display: none !important; }
                    .sidebar, .sidebar-overlay, .mobile-header { display: none !important; }
                    .main-content { margin: 0 !important; padding: 0 !important; width: 100% !important; height: auto !important; overflow: visible !important; }
                    .page-container { padding: 0 !important; background: white !important; width: 100% !important; }
                    .page-header { display: none !important; }
                    .timetable-wrapper { margin: 0 !important; border: none !important; box-shadow: none !important; width: 100% !important; }
                    .timetable-grid { 
                        border: 1px solid #000 !important; 
                        grid-template-columns: 120px repeat(5, 1fr) !important;
                        width: 100% !important;
                    }
                    .timetable-cell { 
                        border: 1px solid #000 !important; 
                        color: #000 !important; 
                        padding: 8px 4px !important;
                        min-height: 50px !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: center !important;
                    }
                    .timetable-cell.header { background: #eee !important; font-weight: bold !important; text-align: center !important; }
                    .timetable-entry { background: none !important; border: none !important; box-shadow: none !important; padding: 2px !important; text-align: center !important; }
                    .subject { font-weight: bold !important; color: #000 !important; font-size: 14px !important; }
                    .teacher { color: #333 !important; font-size: 12px !important; }
                    .break-row { 
                        background: #f9f9f9 !important; 
                        font-weight: bold !important; 
                        border: 1px solid #000 !important;
                        text-align: center !important;
                    }
                }
            `}</style>
        </div>
    );
}
