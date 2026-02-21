import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: Record<string, string[]>;
}

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    hasPermission: (module: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USERS = [
    {
        id: '1', name: 'Admin User', email: 'admin@elirama.ac.ke', password: 'admin123',
        role: 'Super Admin',
        permissions: {
            users: ['VIEW', 'CREATE', 'EDIT', 'DELETE'],
            settings: ['VIEW', 'EDIT'],
            fees: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'PUBLISH', 'APPROVE', 'REVERT'],
            academic: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'PUBLISH'],
            students: ['VIEW', 'CREATE', 'EDIT', 'DELETE'],
            teachers: ['VIEW', 'CREATE', 'EDIT', 'DELETE'],
            audit: ['VIEW']
        }
    },
    {
        id: '2', name: 'Teacher User', email: 'teacher@elirama.ac.ke', password: 'teacher123',
        role: 'Teacher',
        permissions: {
            academic: ['VIEW', 'CREATE', 'EDIT'],
            students: ['VIEW']
        }
    },
];

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Restore session from localStorage AFTER hydration
    useEffect(() => {
        try {
            const saved = localStorage.getItem('elirama_user');
            if (saved) setUser(JSON.parse(saved));
        } catch { /* ignore */ }
        setLoading(false);
    }, []);

    const isAuthenticated = !!user;

    const hasPermission = (module: string, action: string) => {
        if (!user) return false;
        if (user.role === 'Super Admin') return true;

        const modulePermissions = user.permissions[module];
        if (!modulePermissions) return false;

        return modulePermissions.includes(action.toUpperCase());
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
            const response = await fetch(`${API_URL}/auth/login`, {
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

        // Fallback to mock login when API is unavailable
        const found = MOCK_USERS.find(u => u.email === email && u.password === password);
        if (found) {
            const authUser: AuthUser = {
                id: found.id,
                name: found.name,
                email: found.email,
                role: found.role,
                permissions: found.permissions
            };
            setUser(authUser);
            localStorage.setItem('elirama_user', JSON.stringify(authUser));
            localStorage.setItem('elirama_token', 'local_' + Date.now()); // Fake token for local mode
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
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading: loading, login, logout, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
