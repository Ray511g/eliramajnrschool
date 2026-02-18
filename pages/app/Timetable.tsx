import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { GRADES, DAYS, TIME_SLOTS, TimetableEntry } from '../../types';
import AddIcon from '@mui/icons-material/Add';
import TimetableEntryModal from '../../components/modals/TimetableEntryModal';

export default function Timetable() {
    const { timetable } = useSchool();
    const [selectedGrade, setSelectedGrade] = useState<string>('Grade 1');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);

    const gradeEntries = timetable.filter(e => e.grade === selectedGrade);

    const getEntry = (day: string, slot: string) => {
        return gradeEntries.find(e => e.day === day && e.timeSlot === slot);
    };

    const isBreak = (slot: string) => slot === '10:00 - 10:30' || slot === '12:30 - 1:10';

    const handleEdit = (entry: TimetableEntry) => {
        setEditingEntry(entry);
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingEntry(null);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Timetable</h1>
                    <p>Weekly class schedule</p>
                </div>
                <div className="page-header-right">
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

            <div className="timetable-wrapper">
                <div className="timetable-grid">
                    {/* Header row */}
                    <div className="timetable-cell header">Time</div>
                    {DAYS.map(day => (
                        <div key={day} className="timetable-cell header">{day}</div>
                    ))}

                    {/* Body rows */}
                    {TIME_SLOTS.map(slot => {
                        if (isBreak(slot)) {
                            return (
                                <div key={slot} className="timetable-cell break-row">
                                    {slot === '10:00 - 10:30' ? '☕ BREAK' : '🍽️ LUNCH BREAK'}
                                </div>
                            );
                        }
                        return (
                            <React.Fragment key={slot}>
                                <div className="timetable-cell time-slot">{slot}</div>
                                {DAYS.map(day => {
                                    const entry = getEntry(day, slot);
                                    return (
                                        <div key={`${day}-${slot}`} className="timetable-cell">
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
        </div>
    );
}
