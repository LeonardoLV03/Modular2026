import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

const STORAGE_KEY = 'modular_terms_accepted';

export function TermsModal() {
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Fondo oscuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">

              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                  <ShieldCheck size={26} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Aviso Importante</h2>
                  <p className="text-sm text-white/80">Antes de continuar, lee esto</p>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  {[
                    '⚠️ Esta aplicación es solo una herramienta de apoyo en primeros auxilios.',
                    '🚨 En caso de emergencia real, llama al 911 de inmediato.',
                    '🩺 No sustituye el diagnóstico ni la atención de un profesional médico.',
                    '📱 El uso de esta app es bajo tu propia responsabilidad.',
                  ].map((text, i) => (
                    <p key={i} className="text-sm text-gray-700 leading-relaxed">
                      {text}
                    </p>
                  ))}
                </div>

                {/* Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer select-none pt-2">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={e => setChecked(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                        checked
                          ? 'bg-red-500 border-red-500'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {checked && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">
                    Entiendo que esta app es solo orientativa y que en emergencias debo llamar al 911.
                  </span>
                </label>

                {/* Botón */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAccept}
                  disabled={!checked}
                  className={`w-full py-4 rounded-2xl text-base font-semibold transition-all ${
                    checked
                      ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Aceptar y continuar
                </motion.button>

                <p className="text-center text-xs text-gray-400">
                  No volveremos a mostrarte este aviso en este dispositivo.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}