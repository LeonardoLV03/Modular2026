import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';
import * as SessionsAPI from '../services/adminSessionsApi';
import { UnauthorizedError } from '../services/statsApi';

type SessionFilter = 'all' | 'suspicious' | 'penalized';

type Dialog =
  | { kind: 'penalize'; session: SessionsAPI.SessionSummary }
  | { kind: 'lift'; session: SessionsAPI.SessionSummary }
  | null;

const QUICK_HOURS = [24, 72, 168];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
}

interface SessionsContentProps {
  onUnauthorized: () => void;
}

// Contenido de la pestaña "Sesiones" del AdminPanel (sin header propio)
export function SessionsContent({ onUnauthorized }: SessionsContentProps) {
  const [data, setData]           = useState<SessionsAPI.SessionsResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const [filter, setFilter]       = useState<SessionFilter>('all');
  const [dialog, setDialog]       = useState<Dialog>(null);

  // Campos del formulario de penalización / levantamiento
  const [hours, setHours]               = useState(72);
  const [reason, setReason]             = useState('');
  const [excludeStats, setExcludeStats] = useState(true);
  const [restore, setRestore]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [dialogError, setDialogError]   = useState<string | null>(null);
  const [notice, setNotice]             = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setData(await SessionsAPI.getSessions());
    } catch (err) {
      if (err instanceof UnauthorizedError) onUnauthorized();
      else setError(true);
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => { load(); }, [load]);

  const flagLimit = data?.flagLimit ?? 10;
  const isSuspicious = (s: SessionsAPI.SessionSummary) => s.flagged > 0 || s.lastHour >= flagLimit;
  const isPenalized  = (s: SessionsAPI.SessionSummary) => !!s.penalty;

  const sessions = (data?.sessions ?? []).filter(s =>
    filter === 'suspicious' ? isSuspicious(s) : filter === 'penalized' ? isPenalized(s) : true,
  );

  const openPenalize = (session: SessionsAPI.SessionSummary) => {
    setHours(72);
    setReason('');
    setExcludeStats(true);
    setDialogError(null);
    setDialog({ kind: 'penalize', session });
  };

  const openLift = (session: SessionsAPI.SessionSummary) => {
    setRestore(true);
    setDialogError(null);
    setDialog({ kind: 'lift', session });
  };

  const closeDialog = () => {
    if (saving) return;
    setDialog(null);
  };

  const confirm = async () => {
    if (!dialog) return;
    setSaving(true);
    setDialogError(null);
    try {
      if (dialog.kind === 'penalize') {
        if (!Number.isInteger(hours) || hours < 1) {
          setDialogError('Ingrese una duración válida en horas (número entero, mínimo 1).');
          setSaving(false);
          return;
        }
        const r = await SessionsAPI.createPenalty({
          clientId: dialog.session.clientId,
          hours,
          reason: reason.trim(),
          excludeStats,
        });
        setNotice(
          `Sesión penalizada por ${hours} h.` +
          (excludeStats ? ` Se apartaron ${r.excludedCount} consultas de las estadísticas.` : ''),
        );
      } else {
        const penalty = dialog.session.penalty;
        if (!penalty) return;
        const r = await SessionsAPI.liftPenalty(penalty.id, restore);
        setNotice(
          'Penalización levantada.' +
          (restore ? ` Se devolvieron ${r.restoredCount} consultas a las estadísticas.` : ''),
        );
      }
      setDialog(null);
      await load();
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        onUnauthorized();
        return;
      }
      setDialogError(err instanceof Error ? err.message : 'No se pudo completar la acción. Intente de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const filters: { id: SessionFilter; label: string; count: number }[] = [
    { id: 'all',        label: 'Todas',       count: data?.sessions.length ?? 0 },
    { id: 'suspicious', label: 'Sospechosas', count: (data?.sessions ?? []).filter(isSuspicious).length },
    { id: 'penalized',  label: 'Penalizadas', count: (data?.sessions ?? []).filter(isPenalized).length },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex flex-wrap gap-1 bg-gray-100 rounded-2xl p-1">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                filter === f.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              {f.label}
              <span className="rounded-full bg-gray-200/70 px-1.5 text-[10px] text-gray-500">{f.count}</span>
            </button>
          ))}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      <p className="text-xs text-gray-400">
        Cada fila es un navegador. Se marca como sospechosa si tiene consultas señaladas o{' '}
        {flagLimit} o más en la última hora. Penalizar bloquea el asistente en ese navegador y,
        si lo desea, aparta sus consultas de las estadísticas (se conservan, no se borran).
      </p>

      {notice && (
        <div className="flex items-start justify-between gap-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="font-semibold">Cerrar</button>
        </div>
      )}

      {loading && !data ? (
        <p className="py-10 text-center text-sm text-gray-400">Cargando sesiones…</p>
      ) : error ? (
        <p className="py-10 text-center text-sm text-red-500">No se pudieron cargar las sesiones.</p>
      ) : sessions.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">No hay sesiones en esta vista.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400">
                <th className="px-4 py-3">ID de sesión</th>
                <th className="px-2 py-3">Consultas</th>
                <th className="px-2 py-3">Reales</th>
                <th className="px-2 py-3">Entren.</th>
                <th className="px-2 py-3">Última hora</th>
                <th className="px-2 py-3">Marcadas</th>
                <th className="px-2 py-3">Misma IP</th>
                <th className="px-2 py-3">Última actividad</th>
                <th className="px-2 py-3">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.clientId} className={`border-t border-gray-100 ${isSuspicious(s) ? 'bg-amber-50/60' : ''}`}>
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-600" title={s.clientId}>
                    {s.clientId.slice(0, 8)}
                  </td>
                  <td className="px-2 py-2.5 font-semibold text-gray-900">{s.total}</td>
                  <td className="px-2 py-2.5">{s.real}</td>
                  <td className="px-2 py-2.5">{s.training}</td>
                  <td className={`px-2 py-2.5 ${s.lastHour >= flagLimit ? 'font-semibold text-red-600' : ''}`}>
                    {s.lastHour}
                  </td>
                  <td className="px-2 py-2.5">{s.flagged > 0 ? `⚠ ${s.flagged}` : '—'}</td>
                  <td className="px-2 py-2.5" title="Otras sesiones que usaron la misma red">
                    {s.sameIpSessions > 0 ? `+${s.sameIpSessions}` : '—'}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5 text-xs text-gray-500">{formatDate(s.lastAt)}</td>
                  <td className="px-2 py-2.5 text-xs">
                    {s.penalty ? (
                      s.penalty.active ? (
                        <span className="whitespace-nowrap rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700">
                          Bloqueada hasta {formatDate(s.penalty.until)}
                        </span>
                      ) : (
                        <span className="whitespace-nowrap rounded-full bg-gray-100 px-2 py-0.5 text-gray-500">
                          Vencida (consultas apartadas)
                        </span>
                      )
                    ) : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right">
                    {s.penalty ? (
                      <button
                        onClick={() => openLift(s)}
                        className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"
                      >
                        Levantar
                      </button>
                    ) : (
                      <button
                        onClick={() => openPenalize(s)}
                        className="rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                      >
                        Penalizar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Diálogo de confirmación */}
      {dialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[92dvh] w-full max-w-md space-y-4 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                <ShieldAlert size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {dialog.kind === 'penalize' ? 'Penalizar sesión' : 'Levantar penalización'}
                </h3>
                <p className="font-mono text-xs text-gray-400" title={dialog.session.clientId}>
                  {dialog.session.clientId.slice(0, 8)} · {dialog.session.total} consultas
                </p>
              </div>
            </div>

            {dialog.kind === 'penalize' ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600" htmlFor="penalty-hours">
                    Duración del bloqueo (horas)
                  </label>
                  <input
                    id="penalty-hours"
                    type="number"
                    min={1}
                    value={hours}
                    onChange={e => setHours(Math.floor(Number(e.target.value)))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    {QUICK_HOURS.map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHours(h)}
                        className={`rounded-lg px-2.5 py-1 text-xs ${
                          hours === h ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {h === 168 ? '7 días' : h === 72 ? '72 h (por defecto)' : `${h} h`}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600" htmlFor="penalty-reason">
                    Motivo (solo lo ve el administrador)
                  </label>
                  <input
                    id="penalty-reason"
                    type="text"
                    maxLength={200}
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Ej. 40 consultas seguidas marcadas como reales"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <label className="flex items-start gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={excludeStats}
                    onChange={e => setExcludeStats(e.target.checked)}
                    className="mt-0.5"
                  />
                  Apartar las consultas de esta sesión de las estadísticas (se conservan y se pueden
                  restaurar).
                </label>
              </>
            ) : (
              <label className="flex items-start gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={restore}
                  onChange={e => setRestore(e.target.checked)}
                  className="mt-0.5"
                />
                Devolver las consultas de esta sesión a las estadísticas. Déjelo sin marcar si el
                bloqueo fue justificado.
              </label>
            )}

            {dialogError && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{dialogError}</p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={closeDialog}
                disabled={saving}
                className="flex-1 rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-700 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirm}
                disabled={saving}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${
                  dialog.kind === 'penalize' ? 'bg-red-600' : 'bg-emerald-600'
                }`}
              >
                {saving ? 'Guardando…' : dialog.kind === 'penalize' ? 'Penalizar' : 'Levantar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
