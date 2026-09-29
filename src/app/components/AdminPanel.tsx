import { useState } from 'react';
import { ArrowLeft, BarChart3, Users, TrendingUp, Wifi, WifiOff, type LucideIcon } from 'lucide-react';
import { StatsContent } from './StatsPanel';
import { UsersContent } from './UsersPanel';
import { CourseProgressContent } from './CourseProgressPanel';

type AdminTab = 'stats' | 'users' | 'progress';

const TABS: { id: AdminTab; label: string; title: string; subtitle: string; icon: LucideIcon }[] = [
  { id: 'stats',    label: 'Estadísticas', title: 'Estadísticas de Uso', subtitle: 'Panel de análisis del sistema', icon: BarChart3  },
  { id: 'users',    label: 'Usuarios',     title: 'Gestión de Usuarios', subtitle: 'Cuentas registradas en Cursos', icon: Users      },
  { id: 'progress', label: 'Progreso',     title: 'Progreso en Cursos',  subtitle: 'Avance de cada usuario',        icon: TrendingUp },
];

interface AdminPanelProps {
  onUnauthorized: () => void;
  onBack: () => void;
}

export function AdminPanel({ onUnauthorized, onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');
  // Estado del socket de StatsContent, elevado aquí para mostrarlo junto a las pestañas
  const [connected, setConnected] = useState(false);
  const current = TABS.find(t => t.id === activeTab)!;

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-gray-50">

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 md:hidden"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hidden md:flex">
            <current.icon size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl text-white">{current.title}</h2>
            <p className="text-sm text-white/60">{current.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Pestañas */}
      <div className="flex-shrink-0 px-6 pt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex gap-1 bg-gray-100 rounded-full p-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeTab === tab.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'stats' && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            connected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'
          }`}>
            {connected
              ? <><Wifi size={12} /> En vivo</>
              : <><WifiOff size={12} /> Desconectado</>
            }
          </div>
        )}
      </div>

      {/* Contenido de la pestaña activa */}
      {activeTab === 'stats' ? (
        <StatsContent onUnauthorized={onUnauthorized} onConnectionChange={setConnected} />
      ) : activeTab === 'users' ? (
        <UsersContent onUnauthorized={onUnauthorized} />
      ) : (
        <CourseProgressContent onUnauthorized={onUnauthorized} />
      )}
    </div>
  );
}