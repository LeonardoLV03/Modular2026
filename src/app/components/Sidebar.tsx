import { motion } from 'motion/react';
import { Heart, Droplet, Wind, Flame, AlertTriangle } from 'lucide-react';
import { Module } from '../App';

interface SidebarProps {
  selectedModule: Module;
  onModuleSelect: (module: Module) => void;
}

const modules = [
  {
    id: 'desmayo' as Module,
    name: 'Desmayo',
    description: 'Pérdida de consciencia',
    icon: Heart,
    color: '#8b5cf6',
    bgTint: 'rgba(139,92,246,0.13)',
  },
  {
    id: 'hemorragia' as Module,
    name: 'Hemorragia',
    description: 'Sangrado abundante',
    icon: Droplet,
    color: '#f43f5e',
    bgTint: 'rgba(244,63,94,0.13)',
  },
  {
    id: 'asfixia' as Module,
    name: 'Asfixia',
    description: 'Dificultad respiratoria',
    icon: Wind,
    color: '#06b6d4',
    bgTint: 'rgba(6,182,212,0.13)',
  },
  {
    id: 'quemadura' as Module,
    name: 'Quemadura',
    description: 'Daño por calor',
    icon: Flame,
    color: '#f59e0b',
    bgTint: 'rgba(245,158,11,0.13)',
  },
];

export function Sidebar({ selectedModule, onModuleSelect }: SidebarProps) {
  return (
    <div
      className="flex h-full w-full flex-col"
      style={{ background: '#0f0f1a' }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-600 shadow-lg">
          <div className="relative h-5 w-5">
            <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-sm bg-white" />
            <div className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 rounded-sm bg-white" />
          </div>
        </div>
        <div>
          <p
            className="text-[10px] uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            Asistente de
          </p>
          <p className="text-sm font-semibold leading-tight text-white">
            Primeros Auxilios
          </p>
        </div>
      </div>

      {/* Label de sección */}
      <div className="px-5 pb-2 pt-5">
        <p
          className="text-[10px] uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          Emergencias
        </p>
      </div>

      {/* Lista de módulos */}
      <nav className="flex flex-col gap-1 px-3">
        {modules.map((mod) => {
          const isActive = selectedModule === mod.id;
          return (
            <motion.button
              key={mod.id}
              onClick={() => onModuleSelect(mod.id)}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              className="relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200"
              style={{ background: isActive ? mod.bgTint : 'transparent' }}
            >
              {/* Barra indicadora activa */}
              {isActive && (
                <motion.div
                  layoutId="sidebarIndicator"
                  className="absolute left-0 h-8 w-[3px] rounded-r-full"
                  style={{ background: mod.color }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              {/* Ícono */}
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200"
                style={{
                  background: isActive ? mod.color : 'rgba(255,255,255,0.07)',
                }}
              >
                <mod.icon
                  size={18}
                  strokeWidth={2}
                  style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.4)' }}
                />
              </div>

              {/* Texto */}
              <div className="min-w-0">
                <p
                  className="text-sm font-medium leading-tight transition-colors duration-200"
                  style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.6)' }}
                >
                  {mod.name}
                </p>
                <p
                  className="truncate text-xs transition-colors duration-200"
                  style={{
                    color: isActive
                      ? 'rgba(255,255,255,0.5)'
                      : 'rgba(255,255,255,0.25)',
                  }}
                >
                  {mod.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </nav>

      {/* Espacio vacío */}
      <div className="flex-1" />

      {/* Disclaimer */}
      <div
        className="px-5 py-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-start gap-2">
          <AlertTriangle
            size={13}
            className="mt-0.5 flex-shrink-0"
            style={{ color: 'rgba(245,158,11,0.6)' }}
          />
          <p
            className="text-[10px] leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            Sistema basado en reglas (Prolog). No sustituye la atención médica
            profesional.
          </p>
        </div>
      </div>
    </div>
  );
}