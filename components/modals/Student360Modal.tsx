import React from 'react';
import { Student, FeePayment, AttendanceRecord, StudentResult } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

interface Student360ModalProps {
    student: Student;
    onClose: () => void;
}

export default function Student360Modal({ student, onClose }: Student360ModalProps) {
    const { payments, attendance, results, exams } = useSchool();

    const studentPayments = payments.filter(p => p.studentId === student.id);
    const studentAttendance = attendance.filter(a => a.studentId === student.id);
    const studentResults = results.filter(r => r.studentId === student.id);

    const performanceData = studentResults.map(r => {
        const exam = exams.find(e => e.id === r.examId);
        return {
            name: exam ? `${exam.name.substring(0, 10)}...` : 'N/A',
            score: r.marks,
            fullDate: exam?.date || ''
        };
    }).sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

    const attendanceStats = [
        { name: 'Present', value: studentAttendance.filter(a => a.status === 'Present').length, color: '#10b981' },
        { name: 'Absent', value: studentAttendance.filter(a => a.status === 'Absent').length, color: '#ef4444' },
        { name: 'Late', value: studentAttendance.filter(a => a.status === 'Late').length, color: '#f59e0b' },
    ];

    const paymentData = studentPayments.map(p => ({
        date: new Date(p.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
        amount: p.amount
    })).slice(-5);

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-overlay" style={{ width: '900px', maxWidth: '95vw', height: '85vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                <header className="modal-header" style={{ padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <PersonIcon fontSize="large" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{student.firstName} {student.lastName}</h2>
                            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>ADM: {student.admissionNumber} | Grade: {student.grade}</p>
                        </div>
                    </div>
                    <button className="icon-btn" onClick={onClose}><CloseIcon /></button>
                </header>

                <div className="modal-body custom-scrollbar" style={{ flex: 1, padding: 30, overflowY: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        {/* PERFORMANCE TREND */}
                        <div className="card glass-card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                <TrendingUpIcon style={{ color: 'var(--accent-blue)' }} />
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Academic Growth Timeline</h3>
                            </div>
                            <div style={{ height: 200 }}>
                                {performanceData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={performanceData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                            <XAxis dataKey="name" fontSize={10} />
                                            <YAxis domain={[0, 100]} fontSize={10} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="score" stroke="var(--accent-blue)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No exam data available</div>
                                )}
                            </div>
                        </div>

                        {/* ATTENDANCE PIE */}
                        <div className="card glass-card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                <EventAvailableIcon style={{ color: 'var(--accent-green)' }} />
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Attendance Reliability</h3>
                            </div>
                            <div style={{ height: 200, display: 'flex', alignItems: 'center' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={attendanceStats} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {attendanceStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ width: '120px' }}>
                                    {attendanceStats.map((stat, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, fontSize: '0.8rem' }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: stat.color }}></div>
                                            <span>{stat.name}: {stat.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* PAYMENT HISTORY */}
                        <div className="card glass-card" style={{ padding: 20, gridColumn: 'span 2' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                <PaymentIcon style={{ color: 'var(--accent-purple)' }} />
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Recent Fee Payments</h3>
                            </div>
                            <div style={{ height: 150 }}>
                                {paymentData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={paymentData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                            <XAxis dataKey="date" fontSize={10} />
                                            <YAxis fontSize={10} />
                                            <Tooltip />
                                            <Bar dataKey="amount" fill="var(--accent-purple)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No payment records found</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 30, paddingTop: 20, borderTop: '1px solid #eee', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                        <div className="info-block">
                            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Current Balance</label>
                            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: student.feeBalance > 0 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                                KSh {student.feeBalance.toLocaleString()}
                            </span>
                        </div>
                        <div className="info-block">
                            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Parent/Guardian</label>
                            <span style={{ fontSize: '1rem', fontWeight: 600 }}>{student.parentName}</span>
                            <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>{student.parentPhone}</div>
                        </div>
                        <div className="info-block">
                            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Residence</label>
                            <span style={{ fontSize: '1rem', fontWeight: 600 }}>{student.address || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
