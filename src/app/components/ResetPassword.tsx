import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import * as CoursesAPI from '../services/coursesApi';

interface ResetPasswordProps {
  token: string;
  onDone: () => void;
}

export function ResetPassword({ token, onDone }: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await CoursesAPI.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof CoursesAPI.ApiError ? err.message : 'No se pudo actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-3xl bg-white shadow-sm overflow-hidden"
      >
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/10">
            <KeyRound size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Nueva contraseña</h2>
            <p className="text-sm text-white/70">Modular2026</p>
          </div>
        </div>

        {done ? (
          <div className="p-6 flex flex-col items-center text-center gap-3">
            <CheckCircle2 size={32} className="text-emerald-500" />
            <p className="text-sm text-gray-700">Tu contraseña se actualizó correctamente.</p>
            <button
              onClick={onDone}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-semibold text-white shadow-sm"
            >
              Ir a iniciar sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Nueva contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-60"
            >
              {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}