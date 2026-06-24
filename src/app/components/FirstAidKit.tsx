import { motion } from 'motion/react';
import { Heart, Droplet, Wind, Flame } from 'lucide-react';
import { Module } from '../App';

interface FirstAidKitProps {
  onModuleSelect: (module: Module) => void;
}

export function FirstAidKit({ onModuleSelect }: FirstAidKitProps) {
  const modules = [
    {
      id: 'desmayo' as Module,
      name: 'Desmayo',
      icon: Heart,
      color: 'bg-gradient-to-br from-violet-300 to-violet-400',
      hoverColor: 'hover:from-violet-400 hover:to-violet-500',
      description: 'Pérdida de consciencia'
    },
    {
      id: 'hemorragia' as Module,
      name: 'Hemorragia',
      icon: Droplet,
      color: 'bg-gradient-to-br from-rose-400 to-rose-500',
      hoverColor: 'hover:from-rose-500 hover:to-rose-600',
      description: 'Sangrado abundante'
    },
    {
      id: 'asfixia' as Module,
      name: 'Asfixia',
      icon: Wind,
      color: 'bg-gradient-to-br from-cyan-400 to-cyan-500',
      hoverColor: 'hover:from-cyan-500 hover:to-cyan-600',
      description: 'Dificultad para respirar'
    },
    {
      id: 'quemadura' as Module,
      name: 'Quemadura',
      icon: Flame,
      color: 'bg-gradient-to-br from-amber-400 to-amber-500',
      hoverColor: 'hover:from-amber-500 hover:to-amber-600',
      description: 'Daño por calor'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center"
    >
      {/* Hero */}
      <div className="mb-10 max-w-2xl text-center md:mb-14">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring' }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl md:h-24 md:w-24"
        >
          <div className="relative h-12 w-12 md:h-14 md:w-14">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full w-[30%] rounded-sm bg-red-600" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-[30%] w-full rounded-sm bg-red-600" />
            </div>
          </div>
        </motion.div>

        <h1 className="font-display text-3xl text-gray-900 md:text-4xl">Primeros Auxilios</h1>
        <p className="mt-3 text-gray-500 md:text-lg">
          Selecciona el tipo de emergencia. Te guiamos con preguntas rápidas para saber qué hacer.
        </p>
      </div>

      {/* Module Grid */}
      <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {modules.map((module, index) => (
          <motion.button
            key={module.id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 + index * 0.08 }}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onModuleSelect(module.id)}
            className={`${module.color} ${module.hoverColor} flex flex-col items-center gap-3 rounded-3xl p-6 text-white shadow-lg transition-all duration-200 md:gap-4 md:p-8`}
          >
            <module.icon size={40} strokeWidth={2} className="md:hidden" />
            <module.icon size={52} strokeWidth={1.75} className="hidden md:block" />
            <div className="text-center">
              <div className="mb-1 text-base md:text-lg">{module.name}</div>
              <div className="text-xs opacity-90 md:text-sm">{module.description}</div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Bottom Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-10 max-w-md border-t border-gray-200 pt-6 text-center md:mt-14"
      >
        <p className="text-sm text-gray-500">
          Responde unas preguntas rápidas para obtener ayuda inmediata
        </p>
      </motion.div>
    </motion.div>
  );
}