import { getToken, clearToken, UnauthorizedError } from './statsApi';

const STATS_URL = import.meta.env.VITE_STATS_URL ?? 'http://localhost:3001';

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  isVerified: boolean;
  xp: number;
  level: number;
  streak: {
    current: number;
    longest: number;
    lastActivityDate: string | null;
  };
  completedLessonsCount: number;
  inactivityDays: number | null;
  neverActive: boolean;
}

export async function getUsers(): Promise<AdminUser[]> {
  const res = await fetch(`${STATS_URL}/api/admin/users`, {
    headers: authHeaders(),
    signal: AbortSignal.timeout(8000),
  });
  if (res.status === 401 || res.status === 403) {
    clearToken();
    throw new UnauthorizedError();
  }
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${STATS_URL}/api/admin/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
    signal: AbortSignal.timeout(8000),
  });
  if (res.status === 401 || res.status === 403) {
    clearToken();
    throw new UnauthorizedError();
  }
  if (!res.ok) throw new Error(`Error ${res.status}`);
}
