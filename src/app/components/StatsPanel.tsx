import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Table2, TrendingUp } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import * as StatsAPI from '../services/statsApi';
import { StatsCharts } from './StatsCharts';

const STATS_URL = import.meta.env.VITE_STATS_URL ?? 'http://localhost:3001';

export const MODULE_LABELS: Record<string, string> = {
  desmayo: 'Desmayo', hemorragia: 'Hemorragia', asfixia: 'Asfixia',
  quemadura: 'Quemadura', fractura: 'Fractura', intoxicacion: 'Intoxicación',
  picadura: 'Picadura', descarga: 'Desc. Eléctrica', insolacion: 'Insolación',
  convulsion: 'Convulsión',
};

export const MODULE_COLORS: Record<string, string> = {
  desmayo: '#8b5cf6', hemorragia: '#f43f5e', asfixia: '#06b6d4',
  quemadura: '#f59e0b', fractura: '#0ea5e9', intoxicacion: '#10b981',
  picadura: '#0d9488', descarga: '#eab308', insolacion: '#ef4444',
  convulsion: '#6366f1',
};

interface Notification {
  id: number;
  module: string;
  severity: string;
  isEmergency: boolean;
  consultationType?: string;
  flagged?: boolean;
}

type TypeFilter = StatsAPI.StatsViewKey | 'all';

const TYPE_LABELS: Record<StatsAPI.StoredConsultationType, string> = {
  real:         'Real',
  training:     'Entrenamiento',
  unclassified: 'Sin clasificar',
};

const TYPE_BADGE_CLASSES: Record<StatsAPI.StoredConsultationType, string> = {
  real:         'bg-red-100 text-red-700',
  training:     'bg-indigo-100 text-indigo-700',
  unclassified: 'bg-gray-100 text-gray-500',
};

// Cualquier valor ausente o desconocido se muestra como "Sin clasificar"
function normalizeType(value: unknown): StatsAPI.StoredConsultationType {
  return value === 'real' || value === 'training' ? value : 'unclassified';
}

const FILTER_DESCRIPTIONS: Record<TypeFilter, string> = {
  real:         'Solo emergencias que estaban ocurriendo de verdad. Es la base para estadísticas y predicciones.',
  training:     'Consultas hechas como práctica o entrenamiento.',
  unclassified: 'Consultas guardadas antes de que existiera el switch; no se sabe si eran reales o de práctica.',
  excluded:     'Consultas de sesiones penalizadas: se conservan, pero no cuentan en las estadísticas.',
  all:          'Todas las consultas juntas, incluidas las excluidas por penalización.',
};

interface StatsContentProps {
  onUnauthorized: () => void;
  onConnectionChange?: (connected: boolean) => void;
}

// Contenido de la pestaña "Estadísticas" del AdminPanel (sin header propio)
export function StatsContent({ onUnauthorized, onConnectionChange }: StatsContentProps) {
  const [stats, setStats]               = useState<StatsAPI.StatsData | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentView, setRecentView]     = useState<'table' | 'charts'>('table');
  const [typeFilter, setTypeFilter]     = useState<TypeFilter>('real');
  const socketRef = useRef<Socket | null>(null);
  const notifId   = useRef(0);

  // Carga inicial de stats
  useEffect(() => {
    StatsAPI.getStats()
      .then(setStats)
      .catch(err => {
        if (err instanceof StatsAPI.UnauthorizedError) {
          onUnauthorized();
        } else {
          setError(true);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Conexión Socket.io
  useEffect(() => {
    const socket = io(STATS_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      onConnectionChange?.(true);
    });

    socket.on('disconnect', () => {
      onConnectionChange?.(false);
    });

    // Actualización de stats en tiempo real
    socket.on('stats_updated', (updatedStats: StatsAPI.StatsData) => {
      setStats(updatedStats);
    });

    // Notificación de nueva consulta
    socket.on('new_consultation', (data: any) => {
      notifId.current += 1;
      const id = notifId.current;

      setNotifications(prev => [...prev, {
        id,
        module:      data.module,
        severity:    data.severity,
        isEmergency: data.isEmergency,
        consultationType: data.consultationType,
        flagged: data.flagged,
      }]);

      // Eliminar notificación después de 4 segundos
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 4000);
    });

    return () => {
      socket.disconnect();
      // Al desmontar (cambio de pestaña), el indicador no debe quedarse en "En vivo"
      onConnectionChange?.(false);
    };
  }, []);

  if (loading) return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-gray-400">Cargando estadísticas...</p>
    </div>
  );

  if (error || !stats) return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-gray-400">Error al cargar estadísticas. Verifica la conexión.</p>
    </div>
  );

  // Estadísticas que se muestran según el filtro. Si el servidor aún no envía
  // `byType` (versión anterior), se muestran todas las consultas.
  const view: StatsAPI.StatsBlock =
    typeFilter === 'all' || !stats.byType ? stats : stats.byType[typeFilter];

  const typeCount = (t: StatsAPI.StatsViewKey) => stats.byType?.[t]?.total ?? 0;

  const filterTabs: { id: TypeFilter; label: string; count: number }[] = [
    { id: 'real',         label: 'Reales',        count: typeCount('real') },
    { id: 'training',     label: 'Entrenamiento', count: typeCount('training') },
    // "Sin clasificar" solo aparece si hay consultas anteriores al switch
    ...(typeCount('unclassified') > 0 || typeFilter === 'unclassified'
      ? [{ id: 'unclassified' as const, label: 'Sin clasificar', count: typeCount('unclassified') }]
      : []),
    // "Excluidas" solo aparece si alguna sesión fue penalizada con exclusión de estadísticas
    ...(typeCount('excluded') > 0 || typeFilter === 'excluded'
      ? [{ id: 'excluded' as const, label: 'Excluidas', count: typeCount('excluded') }]
      : []),
    { id: 'all',          label: 'Todas',         count: stats.total },
  ];

  const maxModule = Math.max(...Object.values(view.byModule), 1);

  // Sin `relative`: las notificaciones se posicionan respecto al AdminPanel
  return (
    <div className="flex flex-1 flex-col overflow-hidden">

      {/* Notificaciones en tiempo real */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 w-64">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              className="bg-white rounded-2xl shadow-lg p-3 border-l-4 flex items-start gap-2"
              style={{ borderLeftColor: n.isEmergency ? '#ef4444' : '#10b981' }}
            >
              <span className="text-lg">{n.isEmergency ? '🚨' : '✅'}</span>
              <div>
                <p className="text-xs font-semibold text-gray-800">Nueva consulta</p>
                <p className="text-xs text-gray-500">
                  {MODULE_LABELS[n.module] ?? n.module} —{' '}
                  {n.severity === 'high' ? 'Severa' : n.severity === 'medium' ? 'Moderada' : 'Leve'}
                  {' · '}{TYPE_LABELS[normalizeType(n.consultationType)]}
                  {n.flagged ? ' · ⚠ Sospechosa' : ''}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Filtro por tipo de consulta */}
        <div className="space-y-2">
          <div className="inline-flex flex-wrap gap-1 bg-gray-100 rounded-2xl p-1">
            {filterTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  typeFilter === tab.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                }`}
              >
                {tab.label}
                <span className={`rounded-full px-1.5 text-[10px] ${
                  typeFilter === tab.id ? 'bg-gray-100 text-gray-600' : 'bg-gray-200/70 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400">{FILTER_DESCRIPTIONS[typeFilter]}</p>
          {view.total === 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
              Todavía no hay consultas en esta vista.
            </p>
          )}
        </div>

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: 'Total Consultas', value: view.total,                          color: 'text-gray-900'    },
            { label: 'Emergencias',     value: view.emergencies,                    color: 'text-red-600'     },
            { label: 'Severidad Alta',  value: view.bySeverity.high   || 0,         color: 'text-orange-500'  },
            { label: 'Casos Leves',     value: view.bySeverity.low    || 0,         color: 'text-emerald-500' },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{card.label}</p>
              <motion.p
                key={card.value}
                initial={{ scale: 1.2, color: '#6366f1' }}
                animate={{ scale: 1,   color: '#111827' }}
                transition={{ duration: 0.3 }}
                className={`text-3xl font-bold ${card.color}`}
              >
                {card.value}
              </motion.p>
            </motion.div>
          ))}
        </div>

        {/* Por módulo */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-wider">
            Consultas por Módulo
          </h3>
          <div className="space-y-3">
            {Object.entries(view.byModule)
              .sort((a, b) => b[1] - a[1])
              .map(([module, count]) => (
                <div key={module} className="flex items-center gap-3">
                  <span className="w-28 text-sm text-gray-600 shrink-0 truncate">
                    {MODULE_LABELS[module] ?? module}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxModule) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-2 rounded-full"
                      style={{ background: MODULE_COLORS[module] ?? '#888' }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-5 text-right">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Severidad y emergencias */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-wider">
              Por Severidad
            </h3>
            <div className="space-y-3">
              {[
                { key: 'high',   label: 'Alta',     color: '#ef4444' },
                { key: 'medium', label: 'Moderada', color: '#f59e0b' },
                { key: 'low',    label: 'Leve',     color: '#10b981' },
              ].map(({ key, label, color }) => {
                const count = view.bySeverity[key] || 0;
                const pct = view.total ? (count / view.total) * 100 : 0;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-20 text-sm text-gray-600">{label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <motion.div
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.4 }}
                        className="h-2 rounded-full"
                        style={{ background: color }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-5 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-wider">
              Emergencias vs No Emergencias
            </h3>
            <div className="flex items-center justify-center gap-10 py-3">
              <div className="text-center">
                <motion.p
                  key={view.emergencies}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-4xl font-bold text-red-500"
                >
                  {view.emergencies}
                </motion.p>
                <p className="text-xs text-gray-400 mt-1">Emergencias</p>
              </div>
              <div className="h-12 w-px bg-gray-200" />
              <div className="text-center">
                <motion.p
                  key={view.total - view.emergencies}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-4xl font-bold text-emerald-500"
                >
                  {view.total - view.emergencies}
                </motion.p>
                <p className="text-xs text-gray-400 mt-1">No emergencias</p>
              </div>
            </div>
          </div>
        </div>

        {/* Consultas recientes: tabla o gráficas */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Consultas Recientes ({view.recentConsultations.length})
            </h3>
            <div className="flex gap-1 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setRecentView('table')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  recentView === 'table' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                }`}
              >
                <Table2 size={14} /> Tabla
              </button>
              <button
                onClick={() => setRecentView('charts')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  recentView === 'charts' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                }`}
              >
                <TrendingUp size={14} /> Gráficas
              </button>
            </div>
          </div>

          {recentView === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="pb-2 pr-4">#</th>
                    <th className="pb-2 pr-4">Módulo</th>
                    <th className="pb-2 pr-4">Severidad</th>
                    <th className="pb-2 pr-4">Emergencia</th>
                    <th className="pb-2 pr-4">Tipo de consulta</th>
                    <th className="pb-2 pr-4">ID de sesión</th>
                    <th className="pb-2">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <AnimatePresence>
                    {view.recentConsultations.map((c, i) => (
                      <motion.tr
                        key={c._id ?? i}
                        initial={{ opacity: 0, backgroundColor: '#eef2ff' }}
                        animate={{ opacity: 1, backgroundColor: '#ffffff' }}
                        transition={{ duration: 0.5 }}
                        className="text-gray-700"
                      >
                        <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                        <td className="py-2 pr-4">{MODULE_LABELS[c.module] ?? c.module}</td>
                        <td className="py-2 pr-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            c.severity === 'high'   ? 'bg-red-100 text-red-700'     :
                            c.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                      'bg-emerald-100 text-emerald-700'
                          }`}>
                            {c.severity === 'high' ? 'Alta' : c.severity === 'medium' ? 'Moderada' : 'Leve'}
                          </span>
                        </td>
                        <td className="py-2 pr-4">{c.isEmergency ? '🔴 Sí' : '🟢 No'}</td>
                        <td className="py-2 pr-4">
                          <span className={`whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE_CLASSES[normalizeType(c.consultationType)]}`}>
                            {TYPE_LABELS[normalizeType(c.consultationType)]}
                          </span>
                        </td>
                        <td className="py-2 pr-4 font-mono text-xs text-gray-500 whitespace-nowrap" title={c.clientId || 'Sin ID de sesión'}>
                          {c.clientId ? c.clientId.slice(0, 8) : '—'}
                          {c.flagged && <span className="ml-1 not-italic" title={c.flagReason || 'Consulta sospechosa'}>⚠</span>}
                        </td>
                        <td className="py-2 text-gray-400 text-xs">
                          {new Date(c.timestamp).toLocaleDateString('es-MX')}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          ) : (
            <StatsCharts stats={view} />
          )}
        </div>
      </div>
    </div>
  );
}