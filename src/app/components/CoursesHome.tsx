import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Flame, Lock, CheckCircle2, LogOut,
  Heart, Droplet, Wind, Flame as FlameIcon, Bone, FlaskConical,
  Bug, Zap, Sun, Brain, XCircle,
} from 'lucide-react';
import * as CoursesAPI from '../services/coursesApi';

interface CoursesHomeProps {
  onBack: () => void;
  onLogout: () => void;
}

const MODULE_META: Record<string, { label: string; icon: any; color: string }> = {
  desmayo:      { label: 'Desmayo',         icon: Heart,        color: '#8b5cf6' },
  hemorragia:   { label: 'Hemorragia',      icon: Droplet,      color: '#f43f5e' },
  asfixia:      { label: 'Asfixia',         icon: Wind,         color: '#06b6d4' },
  quemadura:    { label: 'Quemadura',       icon: FlameIcon,    color: '#f59e0b' },
  fractura:     { label: 'Fractura',        icon: Bone,         color: '#0ea5e9' },
  intoxicacion: { label: 'Intoxicación',    icon: FlaskConical, color: '#10b981' },
  picadura:     { label: 'Picadura',        icon: Bug,          color: '#0d9488' },
  descarga:     { label: 'Desc. Eléctrica', icon: Zap,          color: '#eab308' },
  insolacion:   { label: 'Insolación',      icon: Sun,          color: '#ef4444' },
  convulsion:   { label: 'Convulsión',      icon: Brain,        color: '#6366f1' },
};

const MODULE_ORDER = Object.keys(MODULE_META);

type View = 'dashboard' | 'lessons' | 'lesson' | 'result';

export function CoursesHome({ onBack, onLogout }: CoursesHomeProps) {
  const [view, setView] = useState<View>('dashboard');
  const [user, setUser] = useState(CoursesAPI.getStoredUser());
  const [lessons, setLessons] = useState<CoursesAPI.LessonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<CoursesAPI.LessonDetail | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CoursesAPI.CompleteLessonResult | null>(null);

  useEffect(() => {
    Promise.all([CoursesAPI.getMe(), CoursesAPI.getLessons()])
      .then(([profile, lessonList]) => {
        setUser(profile);
        setLessons(lessonList);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const goBack = () => {
    if (view === 'dashboard') { onBack(); return; }
    if (view === 'lessons') { setView('dashboard'); setActiveModule(null); return; }
    if (view === 'lesson' || view === 'result') { setView('lessons'); setActiveLesson(null); setResult(null); return; }
  };

  const openModule = (moduleId: string) => {
    setActiveModule(moduleId);
    setView('lessons');
  };

  const isLessonUnlocked = (lesson: CoursesAPI.LessonSummary, moduleLessons: CoursesAPI.LessonSummary[]) => {
    if (lesson.order === 1) return true;
    const prev = moduleLessons.find(l => l.order === lesson.order - 1);
    return prev ? user?.completedLessons.includes(prev._id) : false;
  };

  const startLesson = async (lessonId: string) => {
    setLoading(true);
    try {
      const detail = await CoursesAPI.getLesson(lessonId);
      setActiveLesson(detail);
      setQuestionIndex(0);
      setAnswers([]);
      setSelectedOption(null);
      setView('lesson');
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const selectOption = (index: number) => {
    if (selectedOption !== null) return; // ya respondió esta pregunta
    setSelectedOption(index);
  };

  const nextQuestion = async () => {
    if (selectedOption === null || !activeLesson) return;
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (questionIndex + 1 < activeLesson.questions.length) {
      setQuestionIndex(questionIndex + 1);
    } else {
      setSubmitting(true);
      try {
        const res = await CoursesAPI.completeLesson(activeLesson._id, newAnswers);
        setResult(res);
        CoursesAPI.updateStoredUser({
          xp: res.xp, level: res.level, streak: res.streak,
          completedLessons: user?.completedLessons.includes(activeLesson._id)
            ? user.completedLessons
            : [...(user?.completedLessons || []), activeLesson._id],
        });
        setUser(CoursesAPI.getStoredUser());
        setView('result');
      } catch {
        setError(true);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const lessonsByModule = MODULE_ORDER.reduce<Record<string, CoursesAPI.LessonSummary[]>>((acc, m) => {
    acc[m] = lessons.filter(l => l.module === m).sort((a, b) => a.order - b.order);
    return acc;
  }, {});

  const xpIntoLevel = (user?.xp ?? 0) % 100;

  if (loading && view === 'dashboard') return (
    <div className="flex flex-1 items-center justify-center bg-gray-50">
      <p className="text-gray-400">Cargando...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-1 items-center justify-center bg-gray-50">
      <p className="text-gray-400">Error de conexión. Verifica tu internet.</p>
    </div>
  );

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/10"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div>
              <h2 className="text-xl text-white">
                {view === 'dashboard' && 'Cursos'}
                {view === 'lessons'   && MODULE_META[activeModule ?? '']?.label}
                {view === 'lesson'    && activeLesson?.title}
                {view === 'result'    && '¡Lección completada!'}
              </h2>
              {view === 'dashboard' && (
                <p className="text-sm text-white/70">Hola, {user?.username} 👋</p>
              )}
            </div>
          </div>

          {view === 'dashboard' && (
            <button
              onClick={onLogout}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
            >
              <LogOut size={16} className="text-white" />
            </button>
          )}
        </div>

        {view === 'dashboard' && (
          <div className="mt-5 flex items-center gap-4">
            <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
              <Flame size={16} className="text-orange-300" />
              <span className="text-sm font-semibold text-white">{user?.streak.current ?? 0} días</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs text-white/70 mb-1">
                <span>Nivel {user?.level ?? 1}</span>
                <span>{xpIntoLevel}/100 XP</span>
              </div>
              <div className="h-2 rounded-full bg-white/20">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpIntoLevel}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-2 rounded-full bg-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">

          {/* ── Dashboard: grid de módulos ─────────────────────── */}
          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-3 md:grid-cols-3"
            >
              {MODULE_ORDER.map(moduleId => {
                const meta = MODULE_META[moduleId];
                const moduleLessons = lessonsByModule[moduleId];
                const hasLessons = moduleLessons.length > 0;
                const completedCount = moduleLessons.filter(l => user?.completedLessons.includes(l._id)).length;
                const Icon = meta.icon;

                return (
                  <button
                    key={moduleId}
                    disabled={!hasLessons}
                    onClick={() => openModule(moduleId)}
                    className={`flex flex-col items-start gap-2 rounded-2xl bg-white p-4 text-left shadow-sm transition ${
                      hasLessons ? 'hover:shadow-md' : 'opacity-50'
                    }`}
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ background: `${meta.color}20` }}
                    >
                      <Icon size={20} style={{ color: meta.color }} />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{meta.label}</p>
                    <p className="text-xs text-gray-400">
                      {hasLessons ? `${completedCount}/${moduleLessons.length} lecciones` : 'Próximamente'}
                    </p>
                  </button>
                );
              })}
            </motion.div>
          )}

          {/* ── Lista de lecciones de un módulo ────────────────── */}
          {view === 'lessons' && activeModule && (
            <motion.div
              key="lessons"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {lessonsByModule[activeModule].map(lesson => {
                const unlocked = isLessonUnlocked(lesson, lessonsByModule[activeModule]);
                const completed = user?.completedLessons.includes(lesson._id);

                return (
                  <button
                    key={lesson._id}
                    disabled={!unlocked}
                    onClick={() => startLesson(lesson._id)}
                    className={`flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm transition ${
                      unlocked ? 'hover:shadow-md' : 'opacity-50'
                    }`}
                  >
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                      completed ? 'bg-emerald-100' : 'bg-gray-100'
                    }`}>
                      {!unlocked ? <Lock size={16} className="text-gray-400" />
                        : completed ? <CheckCircle2 size={18} className="text-emerald-600" />
                        : <span className="text-sm font-bold text-gray-500">{lesson.order}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800">{lesson.title}</p>
                      <p className="text-xs text-gray-400">{lesson.xpReward} XP</p>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}

          {/* ── Lección jugable ─────────────────────────────────── */}
          {view === 'lesson' && activeLesson && (
            <motion.div
              key="lesson"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="mx-auto max-w-lg"
            >
              <div className="mb-4 h-1.5 rounded-full bg-gray-200">
                <motion.div
                  animate={{ width: `${((questionIndex + 1) / activeLesson.questions.length) * 100}%` }}
                  className="h-1.5 rounded-full bg-emerald-500"
                />
              </div>
              <p className="mb-2 text-xs text-gray-400">
                Pregunta {questionIndex + 1} de {activeLesson.questions.length}
              </p>
              <h3 className="mb-5 text-lg font-semibold text-gray-800">
                {activeLesson.questions[questionIndex].question}
              </h3>

              <div className="space-y-2.5">
                {activeLesson.questions[questionIndex].options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => selectOption(i)}
                    className={`w-full rounded-xl border-2 p-3.5 text-left text-sm transition ${
                      selectedOption === i
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={nextQuestion}
                disabled={selectedOption === null || submitting}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-40"
              >
                {submitting ? 'Enviando...' :
                  questionIndex + 1 < activeLesson.questions.length ? 'Siguiente' : 'Terminar lección'}
              </motion.button>
            </motion.div>
          )}

          {/* ── Resultado ───────────────────────────────────────── */}
          {view === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="mx-auto max-w-lg text-center"
            >
              <div className="mb-4 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 size={40} className="text-emerald-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {result.correctCount}/{result.totalQuestions} correctas
              </p>
              <p className="mt-1 text-sm text-gray-400">+{result.xpEarned} XP ganados</p>

              {result.leveledUp && (
                <div className="mt-3 rounded-xl bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
                  🎉 ¡Subiste a nivel {result.level}!
                </div>
              )}

              <div className="mt-4 flex items-center justify-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 w-fit mx-auto">
                <Flame size={14} className="text-orange-500" />
                <span className="text-sm font-medium text-orange-700">Racha: {result.streak.current} días</span>
              </div>

              <div className="mt-6 space-y-2 text-left">
                {result.results.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-xl bg-white p-3 shadow-sm">
                    {r.isCorrect
                      ? <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                      : <XCircle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />}
                    <p className="text-xs text-gray-500">{r.explanation}</p>
                  </div>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { setView('dashboard'); setActiveModule(null); setActiveLesson(null); setResult(null); }}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-semibold text-white shadow-sm"
              >
                Volver a Cursos
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}