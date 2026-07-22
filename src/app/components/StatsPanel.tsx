import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart3 } from 'lucide-react';
import * as StatsAPI from '../services/statsApi';

const MODULE_LABELS: Record<string, string> = {
  desmayo: 'Desmayo', hemorragia: 'Hemorragia', asfixia: 'Asfixia',
  quemadura: 'Quemadura', fractura: 'Fractura', intoxicacion: 'Intoxicación',
  picadura: 'Picadura', descarga: 'Desc. Eléctrica', insolacion: 'Insolación',
  convulsion: 'Convulsión',
};

const MODULE_COLORS: Record<string, string> = {
  desmayo: '#8b5cf6', hemorragia: '#f43f5e', asfixia: '#06b6d4',
  quemadura: '#f59e0b', fractura: '#0ea5e9', intoxicacion: '#10b981',
  picadura: '#0d9488', descarga: '#eab308', insolacion: '#ef4444',
  convulsion: '#6366f1',
};

export function StatsPanel() {
  const [stats, setStats] = useState<StatsAPI.StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    StatsAPI.getStats()
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-1 items-center justify-center bg-gray-50">
      <p className="text-gray-400">Cargando estadísticas...</p>
    </div>
  );

  if (error || !stats) return (
    <div className="flex flex-1 items-center justify-center bg-gray-50">
      <p className="text-gray-400">Error al cargar estadísticas. Verifica la conexión.</p>
    </div>
  );

  const maxModule = Math.max(...Object.values(stats.byModule), 1);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <BarChart3 size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl text-white">Estadísticas de Uso</h2>
            <p className="text-sm text-white/60">Panel de análisis del sistema</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Tarjetas resumen */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: 'Total Consultas', value: stats.total, color: 'text-gray-900' },
            { label: 'Emergencias', value: stats.emergencies, color: 'text-red-600' },
            { label: 'Severidad Alta', value: stats.bySeverity.high || 0, color: 'text-orange-500' },
            { label: 'Casos Leves', value: stats.bySeverity.low || 0, color: 'text-emerald-500' },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{card.label}</p>
              <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Por módulo */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-wider">
            Consultas por Módulo
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byModule)
              .sort((a, b) => b[1] - a[1])
              .map(([module, count], i) => (
                <div key={module} className="flex items-center gap-3">
                  <span className="w-28 text-sm text-gray-600 shrink-0 truncate">
                    {MODULE_LABELS[module] ?? module}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxModule) * 100}%` }}
                      transition={{ delay: 0.2 + i * 0.05, duration: 0.5 }}
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
                const count = stats.bySeverity[key] || 0;
                const pct = stats.total ? (count / stats.total) * 100 : 0;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-20 text-sm text-gray-600">{label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.3, duration: 0.5 }}
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
                <p className="text-4xl font-bold text-red-500">{stats.emergencies}</p>
                <p className="text-xs text-gray-400 mt-1">Emergencias</p>
              </div>
              <div className="h-12 w-px bg-gray-200" />
              <div className="text-center">
                <p className="text-4xl font-bold text-emerald-500">
                  {stats.total - stats.emergencies}
                </p>
                <p className="text-xs text-gray-400 mt-1">No emergencias</p>
              </div>
            </div>
          </div>
        </div>

        {/* Consultas recientes */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-wider">
            Consultas Recientes ({stats.recentConsultations.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="pb-2 pr-4">#</th>
                  <th className="pb-2 pr-4">Módulo</th>
                  <th className="pb-2 pr-4">Severidad</th>
                  <th className="pb-2 pr-4">Emergencia</th>
                  <th className="pb-2">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentConsultations.map((c, i) => (
                  <tr key={i} className="text-gray-700">
                    <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                    <td className="py-2 pr-4">{MODULE_LABELS[c.module] ?? c.module}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.severity === 'high'   ? 'bg-red-100 text-red-700' :
                        c.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                  'bg-emerald-100 text-emerald-700'
                      }`}>
                        {c.severity === 'high' ? 'Alta' : c.severity === 'medium' ? 'Moderada' : 'Leve'}
                      </span>
                    </td>
                    <td className="py-2 pr-4">{c.isEmergency ? '🔴 Sí' : '🟢 No'}</td>
                    <td className="py-2 text-gray-400 text-xs">
                      {new Date(c.timestamp).toLocaleDateString('es-MX')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}