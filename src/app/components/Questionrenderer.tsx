import { useEffect, useState } from 'react';
import { GripVertical, ArrowRight } from 'lucide-react';
import * as CoursesAPI from '../services/coursesApi';

// ── Tipos ──────────────────────────────────────────────────────
// Cada renderer recibe la pregunta ya "reseteada" (question cambia
// cuando avanza el índice, así que usamos su identidad para resetear
// estado interno) y notifica hacia arriba cuándo hay una respuesta
// completa lista con onAnswerChange(answer | null).

interface QuestionRendererProps {
  question: CoursesAPI.LessonQuestion;
  locked: boolean; // true mientras no ha pasado el tiempo mínimo de lectura
  onAnswerChange: (answer: CoursesAPI.LessonAnswer | null) => void;
  resetKey: string | number; // cambia cuando cambia de pregunta, para resetear estado local
}

export function QuestionRenderer({ question, locked, onAnswerChange, resetKey }: QuestionRendererProps) {
  if (question.type === 'order') {
    return <OrderQuestionView question={question} locked={locked} onAnswerChange={onAnswerChange} resetKey={resetKey} />;
  }
  if (question.type === 'match') {
    return <MatchQuestionView question={question} locked={locked} onAnswerChange={onAnswerChange} resetKey={resetKey} />;
  }
  // 'single' y 'boolean' comparten el mismo renderer visual.
  return <SingleQuestionView question={question} locked={locked} onAnswerChange={onAnswerChange} resetKey={resetKey} />;
}

// ── Selección única / Verdadero-Falso ───────────────────────────
// 'boolean' es visualmente igual a 'single' salvo que casi siempre
// trae solo 2 opciones; el mismo componente cubre ambos.

function SingleQuestionView({
  question, locked, onAnswerChange, resetKey,
}: {
  question: CoursesAPI.SingleQuestion;
  locked: boolean;
  onAnswerChange: (a: number | null) => void;
  resetKey: string | number;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => { setSelected(null); onAnswerChange(null); }, [resetKey]);

  const select = (i: number) => {
    if (locked) return;
    setSelected(i);
    onAnswerChange(i);
  };

  const isBoolean = question.type === 'boolean';

  return (
    <div className={isBoolean ? 'grid grid-cols-2 gap-3' : 'space-y-2.5'}>
      {question.options.map((option, i) => (
        <button
          key={i}
          onClick={() => select(i)}
          disabled={locked}
          className={`rounded-xl border-2 text-left text-sm transition ${
            isBoolean ? 'p-5 text-center font-semibold' : 'w-full p-3.5'
          } ${
            selected === i
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
              : locked
              ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

// ── Ordenar pasos ────────────────────────────────────────────────
// El usuario toca los pasos en el orden en que cree que van; cada
// toque le asigna el siguiente número disponible. Tocar un paso ya
// numerado lo destoca (y renumera lo que quedaba atrás de él).
// No usamos drag-and-drop para mantenerlo simple y accesible en móvil.

function OrderQuestionView({
  question, locked, onAnswerChange, resetKey,
}: {
  question: CoursesAPI.OrderQuestion;
  locked: boolean;
  onAnswerChange: (a: number[] | null) => void;
  resetKey: string | number;
}) {
  // order[i] = posición asignada al steps[i] original, o null si aún no se toca.
  const [order, setOrder] = useState<(number | null)[]>(() => question.steps.map(() => null));

  useEffect(() => {
    setOrder(question.steps.map(() => null));
    onAnswerChange(null);
  }, [resetKey]);

  const toggle = (i: number) => {
    if (locked) return;
    setOrder((prev) => {
      let next: (number | null)[];
      if (prev[i] !== null) {
        // Destocar: quita este paso y recorre hacia abajo los que iban después.
        const removedPos = prev[i]!;
        next = prev.map((p) => (p === null ? null : p > removedPos ? p - 1 : p === removedPos ? null : p));
      } else {
        const used = prev.filter((p) => p !== null).length;
        next = prev.map((p, idx) => (idx === i ? used : p));
      }
      const allSet = next.every((p) => p !== null);
      onAnswerChange(allSet ? (next as number[]) : null);
      return next;
    });
  };

  return (
    <div className="space-y-2.5">
      <p className="mb-1 text-xs text-gray-400">Toca los pasos en el orden correcto</p>
      {question.steps.map((step, i) => {
        const pos = order[i];
        return (
          <button
            key={i}
            onClick={() => toggle(i)}
            disabled={locked}
            className={`flex w-full items-center gap-3 rounded-xl border-2 p-3.5 text-left text-sm transition ${
              pos !== null
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : locked
                ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <span
              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                pos !== null ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              {pos !== null ? pos + 1 : ''}
            </span>
            <span className="flex-1">{step}</span>
            {pos === null && <GripVertical size={16} className="flex-shrink-0 text-gray-300" />}
          </button>
        );
      })}
    </div>
  );
}

// ── Emparejar ────────────────────────────────────────────────────
// Se elige un elemento de la izquierda y luego uno de la derecha para
// formar la pareja. Cada elemento solo puede usarse una vez.

function MatchQuestionView({
  question, locked, onAnswerChange, resetKey,
}: {
  question: CoursesAPI.MatchQuestion;
  locked: boolean;
  onAnswerChange: (a: number[] | null) => void;
  resetKey: string | number;
}) {
  const [pairs, setPairs] = useState<(number | null)[]>(() => question.left.map(() => null));
  const [activeLeft, setActiveLeft] = useState<number | null>(null);

  useEffect(() => {
    setPairs(question.left.map(() => null));
    setActiveLeft(null);
    onAnswerChange(null);
  }, [resetKey]);

  const usedRight = new Set(pairs.filter((p) => p !== null));

  const pickLeft = (i: number) => {
    if (locked) return;
    // Si ya tenía pareja, permite reasignar: la libera y la vuelve seleccionable.
    setActiveLeft(i === activeLeft ? null : i);
  };

  const pickRight = (j: number) => {
    if (locked || activeLeft === null || usedRight.has(j)) return;
    setPairs((prev) => {
      const next = [...prev];
      next[activeLeft] = j;
      const allSet = next.every((p) => p !== null);
      onAnswerChange(allSet ? (next as number[]) : null);
      return next;
    });
    setActiveLeft(null);
  };

  const clearPair = (i: number) => {
    if (locked) return;
    setPairs((prev) => {
      const next = [...prev];
      next[i] = null;
      onAnswerChange(null);
      return next;
    });
  };

  return (
    <div>
      <p className="mb-3 text-xs text-gray-400">
        Toca un elemento de la izquierda y luego su pareja a la derecha
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {question.left.map((item, i) => {
            const paired = pairs[i] !== null;
            return (
              <button
                key={i}
                onClick={() => (paired ? clearPair(i) : pickLeft(i))}
                disabled={locked}
                className={`flex w-full items-center justify-between gap-1.5 rounded-xl border-2 p-3 text-left text-xs font-medium transition ${
                  paired
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : activeLeft === i
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : locked
                    ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{item}</span>
                {paired && <ArrowRight size={12} className="flex-shrink-0" />}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {question.right.map((item, j) => {
            const isUsed = usedRight.has(j);
            return (
              <button
                key={j}
                onClick={() => pickRight(j)}
                disabled={locked || isUsed || activeLeft === null}
                className={`w-full rounded-xl border-2 p-3 text-left text-xs font-medium transition ${
                  isUsed
                    ? 'border-emerald-200 bg-emerald-50/50 text-emerald-400'
                    : activeLeft !== null && !locked
                    ? 'border-gray-200 bg-white text-gray-700 hover:border-teal-400'
                    : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}