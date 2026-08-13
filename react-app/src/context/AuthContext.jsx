import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('fc_token'));
    const [loading, setLoading] = useState(true);

    // Restore session from localStorage on mount
    useEffect(() => {
        const restoreSession = async () => {
            const savedToken = localStorage.getItem('fc_token');
            if (savedToken) {
                try {
                    const res = await fetch(`${API_URL}/auth/me`, {
                        headers: { Authorization: `Bearer ${savedToken}` },
                    });
                    if (res.ok) {
                        const userData = await res.json();
                        setUser(userData);
                        setToken(savedToken);
                    } else {
                        localStorage.removeItem('fc_token');
                        setToken(null);
                    }
                } catch {
                    localStorage.removeItem('fc_token');
                    setToken(null);
                }
            }
            setLoading(false);
        };
        restoreSession();
    }, []);

    const login = async (email, password) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        localStorage.setItem('fc_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
    };

    const signup = async (name, email, password) => {
        const res = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        localStorage.setItem('fc_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem('fc_token');
        setToken(null);
        setUser(null);
    };

    const isAdmin = user?.role === 'admin';
    const isDelivery = user?.role === 'delivery';

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout, isAdmin, isDelivery }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
