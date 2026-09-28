import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import * as StatsAPI from '../services/statsApi';
import { MODULE_LABELS, MODULE_COLORS } from './StatsPanel';

const SEVERITY_COLORS: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
};

const SEVERITY_LABELS: Record<string, string> = {
  high: 'Alta',
  medium: 'Moderada',
  low: 'Leve',
};

function parseEsMxDate(dateStr: string): number {
  const [day, month, year] = dateStr.split('/').map(Number);
  if (!day || !month || !year) return 0;
  return new Date(year, month - 1, day).getTime();
}

interface StatsChartsProps {
  stats: StatsAPI.StatsData;
}

export function StatsCharts({ stats }: StatsChartsProps) {
  const moduleData = Object.entries(stats.byModule)
    .sort((a, b) => b[1] - a[1])
    .map(([module, count]) => ({
      module: MODULE_LABELS[module] ?? module,
      count,
      color: MODULE_COLORS[module] ?? '#888',
    }));

  const severityData = (['high', 'medium', 'low'] as const).map(key => ({
    name: SEVERITY_LABELS[key],
    value: stats.bySeverity[key] || 0,
    color: SEVERITY_COLORS[key],
  }));

  const emergencyData = [
    { name: 'Emergencias', value: stats.emergencies, color: '#ef4444' },
    { name: 'No emergencias', value: stats.total - stats.emergencies, color: '#10b981' },
  ];

  const trendData = Object.entries(stats.byDate)
    .map(([date, count]) => ({ date, count, sortKey: parseEsMxDate(date) }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ date, count }) => ({ date, count }));

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

      {/* Línea de tendencia — la más usada para predicción/forecasting de series de tiempo */}
      <div className="bg-gray-50 rounded-xl p-4 lg:col-span-2">
        <h4 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
          Tendencia de Consultas (útil para predecir demanda)
        </h4>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
            <Line type="monotone" dataKey="count" name="Consultas" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Barras horizontales por módulo */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
          Consultas por Módulo
        </h4>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={moduleData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis type="category" dataKey="module" width={90} tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {moduleData.map(entry => (
                <Cell key={entry.module} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Dona por severidad */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
          Distribución por Severidad
        </h4>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={severityData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={3}
            >
              {severityData.map(entry => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Dona emergencias vs no emergencias */}
      <div className="bg-gray-50 rounded-xl p-4 lg:col-span-2">
        <h4 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
          Emergencias vs No Emergencias
        </h4>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={emergencyData}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
            >
              {emergencyData.map(entry => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}