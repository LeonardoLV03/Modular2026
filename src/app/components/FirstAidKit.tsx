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
      className="flex flex-col items-center py-8"
    >
      {/* Medical Cross Icon - Top */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="mb-8"
      >
        <div className="relative">
          {/* White circle background */}
          <div className="w-28 h-28 bg-white rounded-full shadow-2xl flex items-center justify-center">
            {/* Red Cross */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-16 bg-red-600 rounded-sm"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-5 bg-red-600 rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* First Aid Kit Container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full bg-white shadow-2xl overflow-hidden relative"
        style={{
          borderRadius: '2rem 2rem 1.5rem 1.5rem',
          border: '6px solid #DC2626'
        }}
      >
        {/* Handle */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-red-600 rounded-t-xl border-4 border-red-700"></div>

        {/* Header inside kit */}
        <div className="bg-red-600 pt-6 pb-4 px-6">
          <h1 className="text-2xl text-center text-white mb-1">Primeros Auxilios</h1>
          <p className="text-center text-white/90 text-sm">Selecciona el tipo de emergencia</p>
        </div>

        {/* Body */}
        <div className="p-6">

          {/* Module Grid */}
          <div className="grid grid-cols-2 gap-4">
            {modules.map((module, index) => (
              <motion.button
                key={module.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onModuleSelect(module.id)}
                className={`${module.color} ${module.hoverColor} rounded-2xl p-6 text-white shadow-lg transition-all duration-200 flex flex-col items-center gap-3`}
              >
                <module.icon size={48} strokeWidth={2} />
                <div className="text-center">
                  <div className="text-lg mb-1">{module.name}</div>
                  <div className="text-xs opacity-90">{module.description}</div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Bottom Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 pt-6 border-t border-gray-200 text-center"
          >
            <p className="text-sm text-gray-600">
              Responde unas preguntas rápidas para obtener ayuda inmediata
            </p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
