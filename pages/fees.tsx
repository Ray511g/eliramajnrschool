import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import FeesPage from './app/Fees';

export default function Fees() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    useEffect(() => { if (!isAuthenticated) router.replace('/login'); }, [isAuthenticated, router]);
    if (!isAuthenticated) return null;
    return <Layout><FeesPage /></Layout>;
}
