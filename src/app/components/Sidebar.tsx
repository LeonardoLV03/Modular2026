import { motion } from 'motion/react';
import {
  Heart, Droplet, Wind, Flame, Bone, FlaskConical,
  Bug, Zap, Sun, Brain, AlertTriangle, BarChart3
} from 'lucide-react';
import { Module } from '../App';

interface SidebarProps {
  selectedModule: Module;
  onModuleSelect: (module: Module) => void;
  showStats: boolean;
  onShowStats: () => void;
}

const modules = [
  { id: 'desmayo'      as Module, name: 'Desmayo',         description: 'Pérdida de consciencia',   icon: Heart,        color: '#8b5cf6', bgTint: 'rgba(139,92,246,0.13)'  },
  { id: 'hemorragia'   as Module, name: 'Hemorragia',      description: 'Sangrado abundante',        icon: Droplet,      color: '#f43f5e', bgTint: 'rgba(244,63,94,0.13)'   },
  { id: 'asfixia'      as Module, name: 'Asfixia',         description: 'Dificultad respiratoria',   icon: Wind,         color: '#06b6d4', bgTint: 'rgba(6,182,212,0.13)'   },
  { id: 'quemadura'    as Module, name: 'Quemadura',       description: 'Daño por calor',            icon: Flame,        color: '#f59e0b', bgTint: 'rgba(245,158,11,0.13)'  },
  { id: 'fractura'     as Module, name: 'Fractura',        description: 'Hueso roto o lesionado',    icon: Bone,         color: '#0ea5e9', bgTint: 'rgba(14,165,233,0.13)'  },
  { id: 'intoxicacion' as Module, name: 'Intoxicación',    description: 'Veneno o sustancia tóxica', icon: FlaskConical, color: '#10b981', bgTint: 'rgba(16,185,129,0.13)'  },
  { id: 'picadura'     as Module, name: 'Picadura',        description: 'Mordedura o picadura',      icon: Bug,          color: '#0d9488', bgTint: 'rgba(13,148,136,0.13)'  },
  { id: 'descarga'     as Module, name: 'Desc. Eléctrica', description: 'Choque eléctrico o rayo',   icon: Zap,          color: '#eab308', bgTint: 'rgba(234,179,8,0.13)'   },
  { id: 'insolacion'   as Module, name: 'Insolación',      description: 'Golpe de calor solar',      icon: Sun,          color: '#ef4444', bgTint: 'rgba(239,68,68,0.13)'   },
  { id: 'convulsion'   as Module, name: 'Convulsión',      description: 'Episodio convulsivo',       icon: Brain,        color: '#6366f1', bgTint: 'rgba(99,102,241,0.13)'  },
];

export function Sidebar({ selectedModule, onModuleSelect, showStats, onShowStats }: SidebarProps) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden" style={{ background: '#0f0f1a' }}>
      {/* Logo */}
      <div className="flex flex-shrink-0 items-center gap-3 px-5 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-600 shadow-lg">
          <div className="relative h-5 w-5">
            <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-sm bg-white" />
            <div className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 rounded-sm bg-white" />
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Asistente de
          </p>
          <p className="text-sm font-semibold leading-tight text-white">Primeros Auxilios</p>
        </div>
      </div>

      {/* Label */}
      <div className="flex-shrink-0 px-5 pb-2 pt-4">
        <p className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Emergencias
        </p>
      </div>

      {/* Módulos */}
      <nav className="flex flex-col gap-0.5 overflow-y-auto px-3 pb-3" style={{ scrollbarWidth: 'none' }}>
        {modules.map((mod) => {
          const isActive = selectedModule === mod.id;
          return (
            <motion.button
              key={mod.id}
              onClick={() => onModuleSelect(mod.id)}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              className="relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150"
              style={{ background: isActive ? mod.bgTint : 'transparent' }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarIndicator"
                  className="absolute left-0 h-7 w-[3px] rounded-r-full"
                  style={{ background: mod.color }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-150"
                style={{ background: isActive ? mod.color : 'rgba(255,255,255,0.07)' }}
              >
                <mod.icon size={16} strokeWidth={2}
                  style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.4)' }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight transition-colors duration-150"
                  style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.65)' }}>
                  {mod.name}
                </p>
                <p className="truncate text-[11px] transition-colors duration-150"
                  style={{ color: isActive ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)' }}>
                  {mod.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* Botón Estadísticas */}
      <div className="flex-shrink-0 px-3 pb-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '12px' }}>
        <motion.button
          onClick={onShowStats}
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.97 }}
          className="relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150"
          style={{ background: showStats ? 'rgba(99,102,241,0.15)' : 'transparent' }}
        >
          {showStats && (
            <motion.div
              layoutId="sidebarIndicator"
              className="absolute left-0 h-7 w-[3px] rounded-r-full"
              style={{ background: '#6366f1' }}
            />
          )}
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-150"
            style={{ background: showStats ? '#6366f1' : 'rgba(255,255,255,0.07)' }}
          >
            <BarChart3 size={16} strokeWidth={2}
              style={{ color: showStats ? 'white' : 'rgba(255,255,255,0.4)' }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-tight"
              style={{ color: showStats ? 'white' : 'rgba(255,255,255,0.65)' }}>
              Estadísticas
            </p>
            <p className="truncate text-[11px]"
              style={{ color: showStats ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)' }}>
              Análisis de uso
            </p>
          </div>
        </motion.button>
      </div>

      {/* Disclaimer */}
      <div className="flex-shrink-0 px-5 py-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-start gap-2">
          <AlertTriangle size={13} className="mt-0.5 flex-shrink-0"
            style={{ color: 'rgba(245,158,11,0.6)' }} />
          <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Sistema basado en reglas (Prolog). No sustituye la atención médica profesional.
          </p>
        </div>
      </div>
    </div>
  );
}