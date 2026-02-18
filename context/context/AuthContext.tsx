import React, { createContext, useContext, useState, ReactNode } from 'react';
import { authApi } from '../services/api';

interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: 'Super Admin' | 'Admin' | 'Teacher' | 'Staff';
}

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fallback mock users (used if backend is offline)
const MOCK_USERS = [
    { id: '1', name: 'Admin User', email: 'admin@elirama.ac.ke', password: 'admin123', role: 'Super Admin' as const },
    { id: '2', name: 'Teacher User', email: 'teacher@elirama.ac.ke', password: 'teacher123', role: 'Teacher' as const },
];

function mapRole(role: string): AuthUser['role'] {
    if (role === 'admin') return 'Super Admin';
    if (role === 'teacher') return 'Teacher';
    if (role === 'staff') return 'Staff';
    return 'Admin';
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(() => {
        const saved = localStorage.getItem('elirama_user');
        return saved ? JSON.parse(saved) : null;
    });

    const isAuthenticated = !!user;

    const login = async (email: string, password: string): Promise<boolean> => {
        // Try live API first
        try {
            const res = await authApi.login(email, password);
            const authUser: AuthUser = {
                id: res.user.id,
                name: res.user.name,
                email: res.user.email,
                role: mapRole(res.user.role),
            };
            setUser(authUser);
            localStorage.setItem('elirama_user', JSON.stringify(authUser));
            localStorage.setItem('elirama_token', res.token);
            return true;
        } catch {
            // Fallback to mock users if backend is offline
            const found = MOCK_USERS.find(u => u.email === email && u.password === password);
            if (found) {
                const authUser: AuthUser = { id: found.id, name: found.name, email: found.email, role: found.role };
                setUser(authUser);
                localStorage.setItem('elirama_user', JSON.stringify(authUser));
                return true;
            }
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('elirama_user');
        localStorage.removeItem('elirama_token');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
