import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, Loader2, GraduationCap } from 'lucide-react';
import * as CoursesAPI from '../services/coursesApi';

interface VerifyEmailProps {
  token: string;
  onGoToLogin: () => void;
}

export function VerifyEmail({ token, onGoToLogin }: VerifyEmailProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    CoursesAPI.verifyEmail(token)
      .then(data => {
        setStatus('success');
        setMessage(data.message || 'Cuenta verificada correctamente.');
      })
      .catch(err => {
        setStatus('error');
        setMessage(err?.message || 'No se pudo verificar la cuenta.');
      });
  }, [token]);

  return (
    <div className="flex flex-1 items-center justify-center bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-3xl bg-white shadow-sm overflow-hidden"
      >
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/10">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Verificación de cuenta</h2>
            <p className="text-sm text-white/70">Modular2026</p>
          </div>
        </div>

        <div className="p-6 flex flex-col items-center text-center gap-3">
          {status === 'loading' && (
            <>
              <Loader2 size={36} className="animate-spin text-emerald-500" />
              <p className="text-sm text-gray-500">Verificando tu cuenta...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle2 size={36} className="text-emerald-500" />
              <p className="text-sm text-gray-700">{message}</p>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle size={36} className="text-red-500" />
              <p className="text-sm text-gray-700">{message}</p>
            </>
          )}

          {status !== 'loading' && (
            <button
              onClick={onGoToLogin}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-semibold text-white shadow-sm"
            >
              Ir a iniciar sesión
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}