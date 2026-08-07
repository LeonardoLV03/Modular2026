const STATS_URL = import.meta.env.VITE_STATS_URL ?? 'http://localhost:3001';
const QUEUE_KEY = 'modular_stats_queue';
const TOKEN_KEY = 'modular_admin_token';

export class UnauthorizedError extends Error {
  constructor() {
    super('No autorizado');
    this.name = 'UnauthorizedError';
  }
}

// ── Token de administrador ──────────────────────────────────
export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function loginAdmin(user: string, password: string): Promise<void> {
  const res = await fetch(`${STATS_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, password }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  const { token } = await res.json();
  sessionStorage.setItem(TOKEN_KEY, token);
}

export interface ConsultationRecord {
  module: string;
  severity: string;
  isEmergency: boolean;
  answers: string[];
  recommendations: string[];
  sessionId: string;
}

export interface StatsData {
  total: number;
  byModule: Record<string, number>;
  bySeverity: Record<string, number>;
  emergencies: number;
  byDate: Record<string, number>;
  recentConsultations: any[];
}

// ── Cola local para reintentos ────────────────────────────────
function getQueue(): ConsultationRecord[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function addToQueue(record: ConsultationRecord): void {
  try {
    const queue = getQueue();
    queue.push(record);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-50)));
  } catch {
    // localStorage lleno o no disponible
  }
}

function clearQueue(): void {
  try { localStorage.removeItem(QUEUE_KEY); } catch {}
}

async function trySendRecord(record: ConsultationRecord): Promise<boolean> {
  try {
    const res = await fetch(`${STATS_URL}/api/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Intenta enviar registros pendientes en cola
export async function flushQueue(): Promise<void> {
  const queue = getQueue();
  if (queue.length === 0) return;

  const failed: ConsultationRecord[] = [];
  for (const record of queue) {
    const success = await trySendRecord(record);
    if (!success) failed.push(record);
  }

  if (failed.length === 0) {
    clearQueue();
  } else {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(failed));
    } catch {}
  }
}

export async function saveConsultation(record: ConsultationRecord): Promise<void> {
  // Primero intenta vaciar la cola pendiente
  await flushQueue().catch(() => {});

  const success = await trySendRecord(record);
  if (!success) {
    // Si falla, guarda en cola local para reintentar después
    addToQueue(record);
  }
}

export async function getStats(): Promise<StatsData> {
  const res = await fetch(`${STATS_URL}/api/stats`, {
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

export async function getAllConsultations() {
  const res = await fetch(`${STATS_URL}/api/consultations`, {
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