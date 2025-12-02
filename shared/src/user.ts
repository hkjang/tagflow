export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
}

export interface User {
  id: number;
  username: string;
  password_hash?: string;
  role: UserRole;
  created_at: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: Omit<User, 'password_hash'>;
}

export interface TokenPayload {
  sub: number;
  username: string;
  role: UserRole;
}
