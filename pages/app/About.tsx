import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
    Info as InfoIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Person as PersonIcon,
    Code as CodeIcon,
    Verified as VerifiedIcon
} from '@mui/icons-material';

export default function About() {
    const { settings } = useSchool();

    return (
        <div style={{ padding: 20 }}>
            <div className="page-header" style={{ textAlign: 'center', marginBottom: 40 }}>
                <h1>{settings?.schoolName || 'School management system'}</h1>
                <p>Version 2.0.4 • Professional School Management solution designed for modern educational institutions.</p>
            </div>

            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <div className="dashboard-card" style={{ padding: 40, position: 'relative', overflow: 'hidden' }}>
                    <div style={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        opacity: 0.05,
                        transform: 'rotate(-15deg)'
                    }}>
                        <InfoIcon style={{ fontSize: 200 }} />
                    </div>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                            <div style={{
                                width: 64,
                                height: 64,
                                borderRadius: 16,
                                background: 'linear-gradient(135deg, var(--accent-blue), #6366f1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                            }}>
                                <VerifiedIcon style={{ fontSize: 32 }} />
                            </div>
                            <div>
                                <h2 style={{ margin: 0 }}>{settings?.schoolName || 'School Management System'}</h2>
                                <span className="badge blue">Version 1.5.0 Production</span>
                            </div>
                        </div>

                        <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-muted)', marginBottom: 40 }}>
                            A flagship product designed to digitize education. This Management System is a state-of-the-art platform built to streamline administrative workflows,
                            enhance academic tracking, and improve financial transparency in schools. Supporting both Traditional and
                            Competency-Based Curriculums (CBC), it provides teachers, administrators, and principals with the tools they
                            need to foster excellence in education.
                        </p>

                        <div className="section-title" style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <CodeIcon color="primary" /> Developed By
                        </div>

                        <div className="contact-card" style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: 16,
                            padding: 24,
                            border: '1px solid var(--border-color)',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: 20,
                            marginBottom: 40
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <PersonIcon color="action" />
                                <div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Lead Developer</div>
                                    <div style={{ fontWeight: 600 }}>Raymond Omondi</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <PhoneIcon color="action" />
                                <div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Hotline</div>
                                    <div style={{ fontWeight: 600 }}>0768841205</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <EmailIcon color="action" />
                                <div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Support Email</div>
                                    <div style={{ fontWeight: 600 }}>omondiraymond001@gmail.com</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                            <div className="feature-item" style={{ padding: 20, borderRadius: 12, backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                <h4 style={{ margin: '0 0 10px', color: 'var(--accent-blue)' }}>Comprehensive CBC Support</h4>
                                <p style={{ fontSize: 13, margin: 0, opacity: 0.8 }}>Full integration of Competency Based Curriculum features, assessment strands, and level descriptors.</p>
                            </div>
                            <div className="feature-item" style={{ padding: 20, borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                <h4 style={{ margin: '0 0 10px', color: 'var(--accent-green)' }}>Financial Integrity</h4>
                                <p style={{ fontSize: 13, margin: 0, opacity: 0.8 }}>Transparent fee tracking, automated receipting, and real-time financial reporting for stakeholders.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: 'var(--text-muted)' }}>
                    &copy; {new Date().getFullYear()} {settings?.schoolName || 'School Management System'}. All rights reserved.
                </div>
            </div>
        </div>
    );
}
