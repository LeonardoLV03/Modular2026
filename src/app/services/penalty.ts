import { useSyncExternalStore } from 'react';
import { fetchPenaltyStatus } from './statsApi';

// Estado de penalización de ESTE navegador. La decisión real la toma el servidor;
// aquí solo se guarda lo que él respondió para poder mostrar el aviso.
interface PenaltyState {
  until: string | null; // fecha ISO hasta la que dura el bloqueo
}

let state: PenaltyState = { until: null };
const listeners = new Set<() => void>();

function setState(next: PenaltyState) {
  if (next.until === state.until) return;
  state = next;
  listeners.forEach(l => l());
}

export function isPenalized(): boolean {
  return !!state.until && new Date(state.until).getTime() > Date.now();
}

export function getPenaltyUntil(): string | null {
  return state.until;
}

export function markPenalized(until: string | null): void {
  // Si el servidor no manda fecha, se asume un bloqueo corto para no quedar sin aviso
  setState({ until: until ?? new Date(Date.now() + 60 * 60 * 1000).toISOString() });
}

// Consulta al servidor. Si no hay conexión NO se bloquea (es una app de emergencias).
export async function refreshPenaltyStatus(): Promise<void> {
  const status = await fetchPenaltyStatus();
  if (!status) return;
  setState({ until: status.blocked ? status.until : null });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function usePenalty(): PenaltyState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
