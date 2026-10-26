import type { ConsultationType } from './consultationType';
import { getClientId } from './clientId';

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
  // Opcional solo para registros viejos que quedaron en la cola local antes del switch
  consultationType?: ConsultationType;
}

// Tipos que puede tener una consulta guardada. 'unclassified' = anteriores al switch.
export type StoredConsultationType = ConsultationType | 'unclassified';

// Estadísticas de un conjunto de consultas
export interface StatsBlock {
  total: number;
  byModule: Record<string, number>;
  bySeverity: Record<string, number>;
  emergencies: number;
  byDate: Record<string, number>;
  recentConsultations: any[];
}

// La raíz trae las estadísticas de TODAS las consultas; `byType` las trae separadas.
// 'excluded' = consultas apartadas de las estadísticas por una penalización
export type StatsViewKey = StoredConsultationType | 'excluded';

export interface StatsData extends StatsBlock {
  byType?: Record<StatsViewKey, StatsBlock>;
}

// Resultado de intentar guardar una consulta
export type SaveResult =
  | { status: 'saved' | 'queued' | 'rate_limited' }
  | { status: 'penalized'; until: string | null };

type SendOutcome =
  | { kind: 'ok' }
  | { kind: 'penalized'; until: string | null }
  | { kind: 'rate_limited' }
  | { kind: 'failed' };

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

async function trySendRecord(record: ConsultationRecord): Promise<SendOutcome> {
  try {
    const res = await fetch(`${STATS_URL}/api/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // El ID de sesión se agrega aquí para que también lo lleven los registros de la cola
      body: JSON.stringify({ ...record, clientId: getClientId() }),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) return { kind: 'ok' };
    if (res.status === 403) {
      const data = await res.json().catch(() => ({}));
      if (data && data.error === 'penalized') {
        return { kind: 'penalized', until: data.until ?? null };
      }
    }
    if (res.status === 429) {
      const data = await res.json().catch(() => ({}));
      if (data && data.error === 'rate_limited') return { kind: 'rate_limited' };
    }
    return { kind: 'failed' };
  } catch {
    return { kind: 'failed' };
  }
}

// Intenta enviar registros pendientes en cola
export async function flushQueue(): Promise<void> {
  const queue = getQueue();
  if (queue.length === 0) return;

  const failed: ConsultationRecord[] = [];
  for (let i = 0; i < queue.length; i++) {
    const outcome = await trySendRecord(queue[i]);
    if (outcome.kind === 'ok') continue;
    // Sesión penalizada: el servidor los rechazaría todos, se descartan
    if (outcome.kind === 'penalized') {
      clearQueue();
      return;
    }
    failed.push(queue[i]);
    // Límite por minuto: se conserva el resto y se reintenta más tarde
    if (outcome.kind === 'rate_limited') {
      failed.push(...queue.slice(i + 1));
      break;
    }
  }

  if (failed.length === 0) {
    clearQueue();
  } else {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(failed));
    } catch {}
  }
}

export async function saveConsultation(record: ConsultationRecord): Promise<SaveResult> {
  // Primero intenta vaciar la cola pendiente
  await flushQueue().catch(() => {});

  const outcome = await trySendRecord(record);
  if (outcome.kind === 'ok') return { status: 'saved' };
  if (outcome.kind === 'penalized') return { status: 'penalized', until: outcome.until };
  if (outcome.kind === 'rate_limited') return { status: 'rate_limited' }; // no se reintenta
  // Si falla la conexión, guarda en cola local para reintentar después
  addToQueue(record);
  return { status: 'queued' };
}

// ¿Esta sesión está penalizada? null = no se pudo saber (sin conexión)
export async function fetchPenaltyStatus(): Promise<{ blocked: boolean; until: string | null } | null> {
  try {
    const res = await fetch(
      `${STATS_URL}/api/penalties/status?clientId=${encodeURIComponent(getClientId())}`,
      { signal: AbortSignal.timeout(4000) },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return { blocked: !!data.blocked, until: data.until ?? null };
  } catch {
    return null;
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