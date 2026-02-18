import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import StudentsPage from './app/Students';

export default function Students() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    useEffect(() => { if (!isAuthenticated) router.replace('/login'); }, [isAuthenticated, router]);
    if (!isAuthenticated) return null;
    return <Layout><StudentsPage /></Layout>;
}
