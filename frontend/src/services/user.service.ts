import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'operator';
  created_at: string;
}

export interface CreateUserDto {
  username: string;
  password: string;
  role: 'admin' | 'operator';
}

export const userService = {
  async getAllUsers(): Promise<User[]> {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async createUser(data: CreateUserDto): Promise<User> {
    const token = localStorage.getItem('access_token');
    const response = await axios.post(`${API_URL}/users`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async updateUser(id: number, data: Partial<CreateUserDto>): Promise<User> {
    const token = localStorage.getItem('access_token');
    const response = await axios.put(`${API_URL}/users/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    const token = localStorage.getItem('access_token');
    await axios.delete(`${API_URL}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
