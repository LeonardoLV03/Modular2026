import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Lock, AlertCircle } from 'lucide-react';
import * as StatsAPI from '../services/statsApi';

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function AdminLogin({ onSuccess, onBack }: AdminLoginProps) {
  const [user, setUser]         = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await StatsAPI.loginAdmin(user, password);
      onSuccess();
    } catch (err) {
      console.error('Login error:', err);
      setError('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-1 items-center justify-center bg-gray-50 p-6">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm md:hidden"
      >
        <ArrowLeft size={20} className="text-gray-700" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-3xl bg-white shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/10">
            <Lock size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Acceso Administrador</h2>
            <p className="text-sm text-white/60">Inicia sesión para ver estadísticas</p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Usuario
            </label>
            <input
              type="text"
              value={user}
              onChange={e => setUser(e.target.value)}
              autoComplete="username"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
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
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-3 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-60"
          >
            {loading ? 'Verificando...' : 'Iniciar sesión'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}