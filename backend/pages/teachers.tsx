import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import TeachersPage from './app/Teachers';

export default function Teachers() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    useEffect(() => { if (!isAuthenticated) router.replace('/login'); }, [isAuthenticated, router]);
    if (!isAuthenticated) return null;
    return <Layout><TeachersPage /></Layout>;
}
