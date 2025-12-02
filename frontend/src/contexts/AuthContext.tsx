'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginRequest, UserRole } from '@shared/user';
import api from '@/lib/api';
import { setToken, setRefreshToken, setUser, getUser, clearAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isOperator: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = getUser();
    if (storedUser) {
      setUserState(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { access_token, refresh_token, user: userData } = response.data;

      setToken(access_token);
      setRefreshToken(refresh_token);
      setUser(userData);
      setUserState(userData);

      router.push('/dashboard');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    clearAuth();
    setUserState(null);
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === UserRole.ADMIN,
    isOperator: user?.role === UserRole.OPERATOR,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
