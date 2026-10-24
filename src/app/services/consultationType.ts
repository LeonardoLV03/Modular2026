import { useSyncExternalStore } from 'react';

// ── Tipo de consulta (switch del chat) ───────────────────────
// 'training' = práctica / entrenamiento
// 'real'     = la emergencia está ocurriendo ahora
export type ConsultationType = 'training' | 'real';

// Valor por defecto: una consulta real mal marcada como práctica solo pierde
// un dato de estadística (la guía de primeros auxilios es idéntica), mientras
// que una práctica marcada como real ensucia las estadísticas "limpias".
export const DEFAULT_CONSULTATION_TYPE: ConsultationType = 'training';

export const CONSULTATION_TYPE_LABELS: Record<ConsultationType, string> = {
  training: 'Entrenamiento',
  real: 'Real',
};

const STORAGE_KEY = 'modular_consultation_type';

function readInitial(): ConsultationType {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === 'training' || stored === 'real') return stored;
  } catch {
    // sessionStorage no disponible: se usa el valor por defecto
  }
  return DEFAULT_CONSULTATION_TYPE;
}

// El valor vive fuera de React para que:
//  - sobreviva al salir y volver a entrar a un chat (se desmonta ChatInterface),
//  - siempre se lea el valor MÁS RECIENTE al guardar una consulta (sin closures viejos).
// Se guarda en sessionStorage: dura lo que dure la sesión, y cada sesión nueva
// vuelve a empezar en el valor por defecto.
let current: ConsultationType = readInitial();
const listeners = new Set<() => void>();

export function getConsultationType(): ConsultationType {
  return current;
}

export function setConsultationType(value: ConsultationType): void {
  if (value === current) return;
  current = value;
  try {
    sessionStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignorar
  }
  listeners.forEach(l => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function useConsultationType(): ConsultationType {
  return useSyncExternalStore(subscribe, getConsultationType, getConsultationType);
}
