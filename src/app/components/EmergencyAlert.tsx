
import { useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Phone, X } from 'lucide-react';

export function EmergencyAlert() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="mx-4 mb-4"
    >
      <motion.div
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(220, 38, 38, 0.7)',
            '0 0 0 20px rgba(220, 38, 38, 0)',
            '0 0 0 0 rgba(220, 38, 38, 0)'
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeOut'
        }}
        className="bg-red-600 rounded-3xl shadow-2xl overflow-hidden relative"
      >
        {/* Botón de cerrar (X) */}
        <button
          aria-label="Cerrar alerta"
          onClick={() => setVisible(false)}
          className="absolute top-4 right-4 z-10 bg-white/70 hover:bg-white text-red-600 rounded-full p-1 transition-colors shadow-md"
        >
          <X size={24} />
        </button>
        {/* Animated Background */}
        <motion.div
          animate={{
            background: [
              'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
              'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)'
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="p-6"
        >
          {/* Icon */}
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 1
            }}
            className="flex justify-center mb-4"
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <AlertTriangle size={48} className="text-red-600" />
            </div>
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl text-center text-white mb-3">
            ¡EMERGENCIA DETECTADA!
          </h2>

          {/* Message */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
            <p className="text-white text-center text-lg leading-relaxed">
              Esta situación requiere atención médica <span className="underline">INMEDIATA</span>
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-3 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-3 text-white"
            >
              <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                1
              </div>
              <p className="text-base">Llama al 911 de inmediato</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-start gap-3 text-white"
            >
              <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                2
              </div>
              <p className="text-base">Mantén la calma y sigue las instrucciones del operador</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-start gap-3 text-white"
            >
              <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                3
              </div>
              <p className="text-base">No dejes sola a la persona afectada</p>
            </motion.div>
          </div>

          {/* Call Button */}
          <motion.a
            href="tel:911"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-3 bg-white text-red-600 py-4 rounded-full shadow-lg text-xl hover:bg-gray-50 transition-colors"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <Phone size={28} />
            </motion.div>
            LLAMAR AL 911 AHORA
          </motion.a>

          {/* Emergency Number Display */}
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="mt-4 text-center"
          >
            <div className="text-white text-5xl tracking-wider">
              911
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
