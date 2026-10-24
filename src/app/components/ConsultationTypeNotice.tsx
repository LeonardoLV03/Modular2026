import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap } from 'lucide-react';
import { setConsultationType, type ConsultationType } from '../services/consultationType';

// Igual que TermsModal, pero con sessionStorage: se muestra UNA VEZ POR SESIÓN
// (al cerrar la pestaña/app y volver a abrirla, vuelve a aparecer).
// Si prefieres que salga una sola vez por dispositivo, cambia `sessionStorage`
// por `localStorage` en las 2 líneas marcadas abajo.
const STORAGE_KEY = 'modular_consultation_notice_seen';

function alreadySeen(): boolean {
  try {
    return !!sessionStorage.getItem(STORAGE_KEY); // ← localStorage para "una vez por dispositivo"
  } catch {
    return false;
  }
}

function markSeen(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, 'true'); // ← localStorage para "una vez por dispositivo"
  } catch {
    // ignorar
  }
}

const ITEMS: { icon: string; content: React.ReactNode }[] = [
  {
    icon: '🎓',
    content: (
      <>
        <strong>Entrenamiento:</strong> para practicar o aprender. Se guarda como práctica.
      </>
    ),
  },
  {
    icon: '🚨',
    content: (
      <>
        <strong>Real (esta consulta está pasando):</strong> solo si la emergencia ocurre ahora.
        En ese caso, llame primero al 911.
      </>
    ),
  },
  {
    icon: '🔁',
    content: (
      <>
        Puede cambiarlo en cualquier momento desde la parte superior del chat; el cambio aplica
        solo a las consultas siguientes.
      </>
    ),
  },
  {
    icon: '📊',
    content: (
      <>
        Solo las consultas <strong>reales</strong> cuentan para las estadísticas, para que las
        predicciones futuras se hagan con datos limpios y confiables. ¡Gracias por usarlo
        correctamente!
      </>
    ),
  },
];

export function ConsultationTypeNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!alreadySeen()) setVisible(true);
  }, []);

  // Sin casilla de confirmación a propósito: en una emergencia real no debe
  // retrasar al usuario. Un toque elige el tipo y cierra el aviso.
  const choose = (type: ConsultationType) => {
    setConsultationType(type);
    markSeen();
    setVisible(false);
  };

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="consultation-notice-title"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20">
                <GraduationCap size={22} className="text-white" />
              </div>
              <div>
                <h2 id="consultation-notice-title" className="text-xl font-bold text-white">
                  Lea detenidamente
                </h2>
                <p className="text-sm text-white/80">Antes de iniciar su consulta</p>
              </div>
            </div>

            {/* Contenido */}
            <div className="space-y-3 p-5">
              <div className="space-y-2.5">
                {ITEMS.map((item, i) => (
                  <p key={i} className="text-sm leading-relaxed text-gray-700">
                    <span className="mr-1.5">{item.icon}</span>
                    {item.content}
                  </p>
                ))}
              </div>

              <div className="space-y-2 pt-1">
                <p className="text-center text-xs font-medium text-gray-500">
                  Elija el tipo de esta consulta para continuar:
                </p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => choose('training')}
                  className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                >
                  Entendido · Es entrenamiento
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => choose('real')}
                  className="w-full rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 py-3 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                >
                  Entendido · Es una emergencia real
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
