import { motion } from 'motion/react';
import { Heart, Droplet, Wind, Flame, MousePointerClick, Bone, FlaskConical, Bug, Zap, Sun, Brain } from 'lucide-react';

const hints = [
  { name: 'Desmayo', icon: Heart, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  { name: 'Hemorragia', icon: Droplet, color: '#f43f5e', bg: 'rgba(244,63,94,0.1)' },
  { name: 'Asfixia', icon: Wind, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
  { name: 'Quemadura', icon: Flame, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { name: 'Fractura', icon: Bone, color: '#0ea5e9', bg: 'rgba(14,165,233,0.13)'},
  { name: 'Intoxicacion', icon: FlaskConical, color: '#10b981', bg: 'rgba(16,185,129,0.13)'},
  { name: 'Picadura', icon: Bug, color: '#3b0764', bg: 'rgba(59, 7, 100, 0.13)'},
  { name: 'Desc. Eléctrica', icon: Zap, color: '#eab308', bg: 'rgba(234,179,8,0.13)'},
  { name: 'Insolacion', icon: Sun, color: '#ef4444', bg: 'rgba(239,68,68,0.13)'},
  { name: 'Convulsion', icon: Brain, color: '#6366f1', bg: 'rgba(99,102,241,0.13)'},
];

export function WelcomePanel() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex max-w-xl flex-col items-center text-center"
      >
        {/* Cruz médica */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 260 }}
          className="mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl"
        >
          <div className="relative h-10 w-10">
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-red-500" />
            <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 rounded-full bg-red-500" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-2 text-2xl font-bold text-gray-900"
        >
          Selecciona una emergencia
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mb-8 leading-relaxed text-gray-500"
        >
          Elige el tipo de emergencia en el panel izquierdo para comenzar la
          consulta guiada paso a paso.
        </motion.p>

        {/* Chips de módulos en Grid de 3 columnas */}
        <div className="grid w-full grid-cols-3 gap-3 px-4">
          {hints.map((h, i) => (
            <motion.div
              key={h.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.07 }}
              className="flex w-full items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium"
              style={{ background: h.bg, color: h.color }}
            >
              <h.icon size={13} className="flex-shrink-0" />
              <span className="truncate">{h.name}</span>
            </motion.div>
          ))}
        </div>

        {/* Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex items-center gap-2 text-xs text-gray-400"
        >
          <MousePointerClick size={13} />
          <span>Selecciona en el menú lateral</span>
        </motion.div>
      </motion.div>
    </div>
  );
}