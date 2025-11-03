import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import apiClient from '@/api/axios';
import { jwtDecode } from "jwt-decode";

interface User {
    id: string;
    email: string;
    username: string;
    // Adicione outros campos do usuário que você espera do backend
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean; // Adicionado para saber quando a verificação inicial está ocorrendo
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true); // Começa como true

    useEffect(() => {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
            setLoading(false);
            return;
        }

        const verifyRefreshToken = async () => {
            try {
                const response = await apiClient.post('/auth/token/refresh/', { refresh: refreshToken });
                const { access: newAccessToken } = response.data;
                login(newAccessToken, refreshToken); // Reutiliza a função de login
            } catch (error) {
                console.error("Refresh token failed", error);
                logout(); // Se o refresh token falhar, desloga o usuário
            } finally {
                setLoading(false);
            }
        };

        verifyRefreshToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = (accessToken: string, refreshToken: string) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        try {
            const decoded: { user_id: string; email: string; username: string; } = jwtDecode(accessToken);
            setUser({ id: decoded.user_id, email: decoded.email, username: decoded.username });
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Invalid token on login", error);
            logout();
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        delete apiClient.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
            {!loading && children} 
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
