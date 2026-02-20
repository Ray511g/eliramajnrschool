import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { GRADES, DAYS, TIME_SLOTS, TimetableEntry } from '../../types';
import AddIcon from '@mui/icons-material/Add';
import TimetableEntryModal from '../../components/modals/TimetableEntryModal';

export default function Timetable() {
    const { timetable, settings } = useSchool();
    const [selectedGrade, setSelectedGrade] = useState<string>('Grade 1');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);

    const gradeEntries = timetable.filter(e => e.grade === selectedGrade);
    const slots: any[] = settings.timetableSlots && settings.timetableSlots.length > 0
        ? settings.timetableSlots
        : TIME_SLOTS.map((s, i) => ({ id: String(i), label: s, type: (s === '10:00 - 10:30' ? 'Break' : (s === '12:30 - 1:10' ? 'Lunch' : 'Lesson')) }));

    const getEntry = (day: string, slotLabel: string) => {
        return gradeEntries.find(e => e.day === day && e.timeSlot === slotLabel);
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
                        if (slot.type === 'Break' || slot.type === 'Lunch' || slot.type === 'Other') {
                            const icon = slot.type === 'Break' ? '☕' : (slot.type === 'Lunch' ? '🍽️' : '🔔');
                            const displayName = slot.name || (slot.type.toUpperCase());
                            return (
                                <div key={slot.id} className="timetable-cell break-row">
                                    {icon} {displayName} ({slot.label})
                                </div>
                            );
                        }
                        return (
                            <React.Fragment key={slot.id}>
                                <div className="timetable-cell time-slot">{slot.label}</div>
                                {DAYS.map(day => {
                                    const entry = getEntry(day, slot.label);
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
                    .no-print { display: none !important; }
                    .sidebar, .sidebar-overlay, .mobile-header { display: none !important; }
                    .main-content { margin: 0 !important; padding: 0 !important; }
                    .page-container { padding: 0 !important; background: white !important; }
                    .page-header { display: none !important; }
                    .timetable-wrapper { margin: 0 !important; border: none !important; box-shadow: none !important; }
                    .timetable-grid { border: 1px solid #000 !important; }
                    .timetable-cell { border: 1px solid #000 !important; color: #000 !important; }
                    .timetable-cell.header { background: #eee !important; font-weight: bold !important; }
                    .timetable-entry { background: none !important; border: none !important; box-shadow: none !important; padding: 2px !important; }
                    .subject { font-weight: bold !important; color: #000 !important; }
                    .teacher { color: #333 !important; }
                    .break-row { background: #f9f9f9 !important; font-weight: bold !important; border: 1px solid #000 !important; }
                }
            `}</style>
        </div>
    );
}
