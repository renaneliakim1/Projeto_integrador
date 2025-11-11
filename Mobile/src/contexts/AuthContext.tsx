import React, {createContext, useState, useContext, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
import apiClient from '@services/api';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        if (!refreshToken) {
          setLoading(false);
          return;
        }

        const verifyRefreshToken = async () => {
          try {
            const response = await apiClient.post('/auth/token/refresh/', {
              refresh: refreshToken,
            });
            const {access: newAccessToken} = response.data;
            await login(newAccessToken, refreshToken);
          } catch (error) {
            console.error('Refresh token failed', error);
            await logout();
          } finally {
            setLoading(false);
          }
        };

        await verifyRefreshToken();
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (accessToken: string, refreshToken: string) => {
    try {
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      const decoded: {user_id: string; email: string; username: string} =
        jwtDecode(accessToken);
      setUser({
        id: decoded.user_id,
        email: decoded.email,
        username: decoded.username,
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Invalid token on login', error);
      await logout();
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      delete apiClient.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{isAuthenticated, user, loading, login, logout}}>
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
