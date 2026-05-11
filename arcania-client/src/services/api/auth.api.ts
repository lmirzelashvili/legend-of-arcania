import { api } from './client';
import { AuthResponse, User } from '@/types/game.types';

export const authAPI = {
  register: (email: string, username: string, password: string): Promise<AuthResponse> =>
    api.post('/auth/register', { email, username, password }).then(r => r.data),

  login: (email: string, password: string): Promise<AuthResponse> =>
    api.post('/auth/login', { email, password }).then(r => r.data),

  getProfile: (): Promise<User> =>
    api.get('/auth/profile').then(r => r.data),

  logout: async (): Promise<void> => {
    await api.post('/auth/logout').catch(() => {}); // Best-effort server call
    localStorage.removeItem('token');
  },
};
