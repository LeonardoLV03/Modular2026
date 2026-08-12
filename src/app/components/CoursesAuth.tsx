import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react';
import * as CoursesAPI from '../services/coursesApi';
import { ForgotPassword } from './ForgotPassword';

interface CoursesAuthProps {
  onSuccess: () => void;
  onBack: () => void;
}

type Mode = 'login' | 'register';

export function CoursesAuth({ onSuccess, onBack }: CoursesAuthProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const resetMessages = () => {
    setError('');
    setSuccessMsg('');
    setNeedsVerification(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      if (mode === 'register') {
        await CoursesAPI.register(email, password, username);
        setSuccessMsg('¡Cuenta creada! Revisa tu correo para verificarla antes de iniciar sesión.');
        setMode('login');
      } else {
        await CoursesAPI.login(email, password);
        onSuccess();
      }
    } catch (err) {
      if (err instanceof CoursesAPI.ApiError) {
        setError(err.message);
        if (err.needsVerification) setNeedsVerification(true);
      } else {
        setError('Algo salió mal. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    resetMessages();
    setLoading(true);
    try {
      await CoursesAPI.resendVerification(email);
      setSuccessMsg('Si el correo existe, se envió un nuevo enlace de verificación.');
    } catch {
      setError('No se pudo reenviar el correo. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  if (showForgot) {
    return <ForgotPassword onBack={() => setShowForgot(false)} />;
  }

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
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/10">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
            </h2>
            <p className="text-sm text-white/70">Aprende primeros auxilios jugando</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => { setMode('login'); resetMessages(); }}
            className={`flex-1 py-3 text-sm font-medium transition ${
              mode === 'login' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => { setMode('register'); resetMessages(); }}
            className={`flex-1 py-3 text-sm font-medium transition ${
              mode === 'register' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400'
            }`}
          >
            Registrarme
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Nombre de usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                minLength={3}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
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
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {mode === 'login' && (
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-xs text-emerald-600 font-medium underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}

          {error && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </div>
              {needsVerification && (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-xs text-emerald-600 font-medium underline"
                >
                  Reenviar correo de verificación
                </button>
              )}
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              <CheckCircle2 size={14} className="flex-shrink-0" />
              {successMsg}
            </div>
          )}

          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-60"
          >
            {loading
              ? 'Cargando...'
              : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}