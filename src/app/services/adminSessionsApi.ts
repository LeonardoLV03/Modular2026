import { getToken, clearToken, UnauthorizedError } from './statsApi';

const STATS_URL = import.meta.env.VITE_STATS_URL ?? 'http://localhost:3001';

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface SessionPenalty {
  id: string;
  until: string;
  hours: number;
  reason: string;
  excludeStats: boolean;
  active: boolean; // false = ya venció, pero sus consultas siguen apartadas hasta que se levante
}

export interface SessionSummary {
  clientId: string;
  total: number;
  real: number;
  training: number;
  lastHour: number;
  flagged: number;
  excluded: number;
  firstAt: string;
  lastAt: string;
  sameIpSessions: number; // otras sesiones con la misma IP (pista de que alguien cambió de sesión)
  penalty: SessionPenalty | null;
}

export interface SessionsResponse {
  sessions: SessionSummary[];
  flagLimit: number;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${STATS_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    signal: AbortSignal.timeout(8000),
  });
  if (res.status === 401) {
    clearToken();
    throw new UnauthorizedError();
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Mensaje del servidor (por ejemplo "Esta sesión ya tiene una penalización activa")
    throw new Error(typeof data.error === 'string' ? data.error : `Error ${res.status}`);
  }
  return data as T;
}

export function getSessions(): Promise<SessionsResponse> {
  return request<SessionsResponse>('/api/admin/sessions');
}

export function createPenalty(params: {
  clientId: string;
  hours: number;
  reason: string;
  excludeStats: boolean;
}): Promise<{ success: boolean; until: string; excludedCount: number }> {
  return request('/api/admin/penalties', { method: 'POST', body: JSON.stringify(params) });
}

export function liftPenalty(
  id: string,
  restore: boolean,
): Promise<{ success: boolean; restoredCount: number }> {
  return request(`/api/admin/penalties/${encodeURIComponent(id)}/lift`, {
    method: 'POST',
    body: JSON.stringify({ restore }),
  });
}
