import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

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

const MOCK_USERS = [
    { id: '1', name: 'Admin User', email: 'admin@elirama.ac.ke', password: 'admin123', role: 'Super Admin' as const },
    { id: '2', name: 'Teacher User', email: 'teacher@elirama.ac.ke', password: 'teacher123', role: 'Teacher' as const },
];

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(() => {
        try {
            const saved = localStorage.getItem('elirama_user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const isAuthenticated = !!user;

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                localStorage.setItem('elirama_user', JSON.stringify(data.user));
                localStorage.setItem('elirama_token', data.token);
                return true;
            }
        } catch (error) {
            console.error('Backend login failed, falling back to mock:', error);
        }

        // Fallback to mock login
        const found = MOCK_USERS.find(u => u.email === email && u.password === password);
        if (found) {
            const authUser: AuthUser = { id: found.id, name: found.name, email: found.email, role: found.role };
            setUser(authUser);
            localStorage.setItem('elirama_user', JSON.stringify(authUser));
            return true;
        }
        return false;
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
