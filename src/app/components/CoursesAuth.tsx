import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import * as CoursesAPI from '../services/coursesApi';
import { ForgotPassword } from './ForgotPassword';

interface CoursesAuthProps {
  onSuccess: () => void;
  onBack: () => void;
}

type Mode = 'login' | 'register';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

const isNative = Capacitor.isNativePlatform();

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

  // ── Flujo de Google: si es cuenta nueva, pedimos username aquí ──
  const [googlePendingToken, setGooglePendingToken] = useState<string | null>(null);
  const [googleUsername, setGoogleUsername] = useState('');
  const googleButtonRef = useRef<HTMLDivElement>(null);

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

  const handleGoogleCredential = async (credential: string) => {
    resetMessages();
    setLoading(true);
    try {
      const result = await CoursesAPI.googleLogin(credential);
      if (result.needsUsername) {
        setGooglePendingToken(result.pendingToken);
        setGoogleUsername(result.suggestedUsername);
      } else {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof CoursesAPI.ApiError ? err.message : 'No se pudo iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleUsernameSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!googlePendingToken) return;
    resetMessages();
    setLoading(true);
    try {
      await CoursesAPI.completeGoogleSignup(googlePendingToken, googleUsername);
      onSuccess();
    } catch (err) {
      setError(err instanceof CoursesAPI.ApiError ? err.message : 'No se pudo completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  // Inicializa el plugin nativo una sola vez (solo dentro del APK)
  useEffect(() => {
    if (!isNative || !GOOGLE_CLIENT_ID) return;
    GoogleSignIn.initialize({ clientId: GOOGLE_CLIENT_ID }).catch(() => {
      // Si falla la inicialización (p. ej. falta el cliente Android en
      // Google Cloud Console), el botón nativo simplemente mostrará el
      // error al intentar iniciar sesión — no hay nada más que hacer aquí.
    });
  }, []);

  const handleNativeGoogleSignIn = async () => {
    resetMessages();
    try {
      const result = await GoogleSignIn.signIn();
      if (result.idToken) {
        await handleGoogleCredential(result.idToken);
      }
    } catch (err) {
      const code = (err as { code?: string })?.code;
      // El usuario cerró el selector de cuentas — no es un error real.
      if (code === 'SIGN_IN_CANCELED' || code === 'canceled') return;
      setError('No se pudo iniciar sesión con Google.');
    }
  };

  // Inicializa el botón web de Google una vez que el script GSI cargó
  // (solo fuera del APK — ver nota de isNative arriba)
  useEffect(() => {
    if (isNative || showForgot || googlePendingToken || !GOOGLE_CLIENT_ID) return;

    let cancelled = false;
    let attempts = 0;

    const tryInit = () => {
      if (cancelled) return;
      if (!window.google || !googleButtonRef.current) {
        if (attempts++ < 40) setTimeout(tryInit, 150);
        return;
      }
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => handleGoogleCredential(response.credential),
        ux_mode: 'popup',
      });
      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: mode === 'register' ? 'signup_with' : 'signin_with',
        shape: 'pill',
        width: 300,
      });
    };

    tryInit();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForgot, googlePendingToken, mode]);

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
              {googlePendingToken ? 'Un último paso' : mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
            </h2>
            <p className="text-sm text-white/70">
              {googlePendingToken ? 'Elige tu nombre de usuario' : 'Aprende primeros auxilios jugando'}
            </p>
          </div>
        </div>

        {googlePendingToken ? (
          // ── Paso 2 del login con Google: pedir username ──────────
          <form onSubmit={handleGoogleUsernameSubmit} className="p-6 space-y-4">
            <p className="text-sm text-gray-500">
              Ya verificamos tu cuenta de Google. Solo falta que elijas un nombre de usuario para terminar.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Nombre de usuario
              </label>
              <input
                type="text"
                value={googleUsername}
                onChange={e => setGoogleUsername(e.target.value)}
                required
                minLength={3}
                autoFocus
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
              {loading ? 'Creando cuenta...' : 'Continuar'}
            </motion.button>

            <button
              type="button"
              onClick={() => { setGooglePendingToken(null); resetMessages(); }}
              className="w-full text-xs text-gray-400 font-medium"
            >
              Cancelar
            </button>
          </form>
        ) : (
          <>
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

            {/* Google */}
            {GOOGLE_CLIENT_ID && (
              <div className="px-6 pt-5">
                {isNative ? (
                  <button
                    type="button"
                    onClick={handleNativeGoogleSignIn}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-300 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
                  >
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                    </svg>
                    {mode === 'register' ? 'Registrarme con Google' : 'Acceder con Google'}
                  </button>
                ) : (
                  <div ref={googleButtonRef} className="flex justify-center" />
                )}
                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-gray-100" />
                  <span className="text-[11px] uppercase tracking-wide text-gray-300">o con tu correo</span>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className={`p-6 space-y-4 ${GOOGLE_CLIENT_ID ? 'pt-0' : ''}`}>
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
          </>
        )}
      </motion.div>
    </div>
  );
}