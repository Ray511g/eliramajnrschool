import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { SchoolProvider } from '../context/SchoolContext';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider>
            <SchoolProvider>
                <Component {...pageProps} />
            </SchoolProvider>
        </AuthProvider>
    );
}
