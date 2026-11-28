import { apiRequest, ensureCsrfCookie } from '../../../shared/api/client';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'mahasiswa' | 'dosen' | 'staff';
  nim_nip: string | null;
  phone: string | null;
  is_active: boolean;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  await ensureCsrfCookie();
  const res = await apiRequest<{ data: AuthUser }>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return res.data;
}

export async function fetchMe(): Promise<AuthUser> {
  const res = await apiRequest<{ data: AuthUser }>('/api/v1/auth/me');
  return res.data;
}

export async function logout(): Promise<void> {
  await apiRequest<void>('/api/v1/auth/logout', { method: 'POST' });
}
