import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { GRADES, DAYS, TIME_SLOTS, SUBJECTS } from '../types';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import TimetableEntryModal from '../components/modals/TimetableEntryModal';

export default function Timetable() {
    const { timetable, deleteTimetableEntry } = useSchool();
    const [selectedGrade, setSelectedGrade] = useState<string>('Grade 1');
    const [showAddModal, setShowAddModal] = useState(false);

    const gradeEntries = timetable.filter(e => e.grade === selectedGrade);

    const getEntry = (day: string, slot: string) => {
        return gradeEntries.find(e => e.day === day && e.timeSlot === slot);
    };

    const isBreak = (slot: string) => slot === '10:00 - 10:30' || slot === '12:30 - 1:10';

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Timetable</h1>
                    <p>Weekly class schedule</p>
                </div>
                <div className="page-header-right">
                    <select className="filter-select" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)}>
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
                                                <div className="timetable-entry" onClick={() => deleteTimetableEntry(entry.id)}>
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

            {showAddModal && <TimetableEntryModal grade={selectedGrade} onClose={() => setShowAddModal(false)} />}
        </div>
    );
}
