// ── ID de sesión del navegador ───────────────────────────────
// UUID que se genera la primera vez y se conserva en localStorage.
// Es distinto del sessionId de Prolog (ese cambia en cada consulta).
// Se envía con cada consulta guardada y permite agrupar todo lo que hace un
// mismo navegador, aunque cierre y vuelva a abrir la app.
const STORAGE_KEY = 'modular_client_id';

function generateId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // se usa el respaldo de abajo
  }
  // Respaldo para navegadores sin randomUUID (solo caracteres válidos para el servidor)
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

let cached: string | null = null;

export function getClientId(): string {
  if (cached) return cached;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && /^[A-Za-z0-9_-]{16,64}$/.test(stored)) {
      cached = stored;
      return stored;
    }
  } catch {
    // localStorage no disponible: el ID dura solo mientras la página esté abierta
  }
  const fresh = generateId();
  cached = fresh;
  try { localStorage.setItem(STORAGE_KEY, fresh); } catch {}
  return fresh;
}
