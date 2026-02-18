import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import AttendancePage from './app/Attendance';

export default function Attendance() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    useEffect(() => { if (!isAuthenticated) router.replace('/login'); }, [isAuthenticated, router]);
    if (!isAuthenticated) return null;
    return <Layout><AttendancePage /></Layout>;
}
