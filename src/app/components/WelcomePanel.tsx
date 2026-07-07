import { motion } from 'motion/react';
import { Heart, Droplet, Wind, Flame, MousePointerClick } from 'lucide-react';

const hints = [
  { name: 'Desmayo', icon: Heart, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  { name: 'Hemorragia', icon: Droplet, color: '#f43f5e', bg: 'rgba(244,63,94,0.1)' },
  { name: 'Asfixia', icon: Wind, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
  { name: 'Quemadura', icon: Flame, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
];

export function WelcomePanel() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex max-w-sm flex-col items-center text-center"
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

        {/* Chips de módulos */}
        <div className="flex flex-wrap justify-center gap-2">
          {hints.map((h, i) => (
            <motion.div
              key={h.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.07 }}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
              style={{ background: h.bg, color: h.color }}
            >
              <h.icon size={13} />
              {h.name}
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