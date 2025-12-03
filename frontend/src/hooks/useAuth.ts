'use client';

import { create } from 'zustand';
import { authService } from '../services/auth.service';
import type { User, AuthState, AuthActions } from '../types/auth.types';

type AuthStore = AuthState & AuthActions;

export const useAuth = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  // Actions
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    set({ accessToken, refreshToken, isAuthenticated: true });
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  login: async (username: string, password: string) => {
    try {
      set({ isLoading: true });
      const response = await authService.login({ username, password });
      
      // Store tokens
      get().setTokens(response.access_token, response.refresh_token);
      
      // Store user
      set({ user: response.user, isAuthenticated: true });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  refreshUser: async () => {
    try {
      set({ isLoading: true });
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: true });
    } catch (error) {
      console.error('Failed to refresh user:', error);
      get().logout();
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Initialize auth state from localStorage on app load
if (typeof window !== 'undefined') {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');

  if (accessToken && refreshToken) {
    useAuth.setState({
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isLoading: true,
    });

    // Fetch user data
    useAuth.getState().refreshUser();
  } else {
    useAuth.setState({ isLoading: false });
  }
}
