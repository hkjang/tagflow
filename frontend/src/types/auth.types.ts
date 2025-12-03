// Re-export shared types
export type { User, LoginRequest, LoginResponse, TokenPayload } from '@shared/user';
export { UserRole } from '@shared/user';

// Frontend-specific auth state
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
}
