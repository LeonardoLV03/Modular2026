import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Send, Phone } from 'lucide-react';
import { Module } from '../App';
import { ChatMessage } from './ChatMessage';
import { DiagnosisCard } from './DiagnosisCard';
import { EmergencyAlert } from './EmergencyAlert';
import * as PrologAPI from '../services/prologApi';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  isQuestion?: boolean;
}

interface ChatInterfaceProps {
  module: Module;
  onReset: () => void;
}

const QUICK_REPLIES = ['Sí', 'No', 'No estoy seguro'];

const DESMAYO_OPTIONS: Record<number, string[]> = {
  1: [
    'Consciente, responde y puede hablar',
    'Confundida o desorientada, responde poco',
    'No responde a nada, inconsciente',
  ],
  2: [
    'Si, respira y tiene pulso normal',
    'Respira con dificultad o pulso debil',
    'No respira o no se detecta pulso',
  ],
  3: [
    'No perdio la conciencia (solo mareo/debilidad)',
    'Menos de 2 minutos inconsciente',
    'Mas de 2 minutos inconsciente',
  ],
  4: [
    'Ninguna senal adicional',
    'Presenta convulsiones',
    'Piel azulada (cianosis) o dificultad respiratoria',
    'Dolor en el pecho o antecedentes cardiacos',
    'Golpe fuerte en la cabeza al caer',
  ],
};

const HEMORRAGIA_OPTIONS: Record<number, string[]> = {
  1: [
    'Poco  (manchas o goteo leve)',
    'Constante  (flujo moderado continuo)',
    'Abundante  (flujo fuerte)',
    'A chorros / extremadamente intenso',
    'Sin sangrado visible',
  ],
  2: ['La herida es superficial', 'La herida no es superficial', 'Sin herida visible', 'No estoy seguro'],
  3: ['Dolor moderado', 'Dolor intenso', 'Sin dolor'],
  4: ['Palida solamente', 'Fria y palida', 'Moretones visibles', 'Normal, sin cambios'],
  5: [
    'Mareo unicamente',
    'Debilidad unicamente',
    'Mareo y debilidad juntos',
    'Inflamacion en la zona afectada',
    'Perdida del conocimiento',
    'Ninguno de los anteriores',
  ],
};

const ASFIXIA_OPTIONS: Record<number, string[]> = {
  1: [
    'Puede hablar y toser con fuerza',
    'Puede hablar pero la tos es debil',
    'No puede hablar, tos debil o ineficaz',
    'No emite sonidos ni puede toser',
  ],
  2: [
    'Respira con dificultad o ruidos',
    'Respiracion ausente',
    'Respiracion normal',
    'No estoy seguro',
  ],
  3: ['Color normal', 'Enrojecimiento en rostro', 'Color azulado (cianosis)'],
  4: ['Consciente y alerta', 'Agitado o confundido', 'Inconsciente'],
  5: [
    'Atragantamiento con comida u objeto',
    'Compresion del cuello o torax',
    'Ahogamiento por agua',
    'Inhalacion de humo o gases',
    'Posicion que dificulta respirar',
    'No estoy seguro',
  ],
};

const QUEMADURA_OPTIONS: Record<number, string[]> = {
  1: [
    'Enrojecimiento leve',
    'Ampollas y dolor',
    'Piel blanca o carbonizada',
    'Lesión química o eléctrica',
    'No estoy seguro',
  ],
  2: [
    'Brazo o pierna',
    'Cara, cuello o manos',
    'Torso o espalda',
    'Zona extensa',
  ],
  3: [
    'Solo enrojecimiento',
    'Ampollas visibles',
    'Piel carbonizada/blanca',
    'No estoy seguro',
  ],
  4: [
    'Hace pocos minutos y no traté',
    'Lo enfrié con agua',
    'Apliqué hielo o crema',
    'No estoy seguro',
  ],
  5: [
    'Dolor intenso',
    'Dificultad para respirar',
    'Signos de infección/necrosis',
    'Ninguno de los anteriores',
  ],
};

export function ChatInterface({ module, onReset }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [diagnosisData, setDiagnosisData] = useState<PrologAPI.DiagnosisResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgId = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initConsultation = async () => {
      setMessages([]);
      setAnswers([]);
      setSessionId(null);
      setTotalQuestions(0);
      setCurrentQuestion(0);
      setIsEmergency(false);
      setShowDiagnosis(false);
      setDiagnosisData(null);
      setIsLoading(true);
      addMessage(false, `Iniciando consulta para: ${module.toUpperCase()}...`, false);

      try {
        const data = await PrologAPI.startConsultation(module);
        setSessionId(data.sessionId);
        setTotalQuestions(data.totalQuestions);
        setCurrentQuestion(1);
        addMessage(false, `Pregunta 1 de ${data.totalQuestions}:`, true);
        addMessage(false, data.firstQuestion, true);
      } catch {
        addMessage(false, 'No se pudo conectar con el servidor Prolog. Verifica que esté corriendo en localhost:5000', false);
      } finally {
        setIsLoading(false);
      }
    };

    initConsultation();

    return () => {
      if (sessionId) {
        PrologAPI.endConsultation(sessionId).catch(() => {});
      }
    };
  }, [module]);

  const addMessage = (isUser: boolean, text: string, isQuestion = false) => {
    msgId.current += 1;
    const message: Message = { id: msgId.current, text, isUser, isQuestion };
    setMessages((prev) => [...prev, message]);
  };

  const requestDiagnosis = async (answersList: string[]) => {
    if (!sessionId) return;
    addMessage(false, 'Analizando respuestas...', false);

    try {
      const diagnosis = await PrologAPI.getDiagnosis(sessionId, module, answersList);
      await PrologAPI.endConsultation(sessionId);
      setDiagnosisData(diagnosis);
      setShowDiagnosis(true);
      setIsEmergency(diagnosis.isEmergency);
    } catch {
      addMessage(false, 'Error al obtener el diagnóstico. Intenta de nuevo.', false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    addMessage(true, text, false);
    setInput('');

    const newAnswers = [...answers, text];
    setAnswers(newAnswers);

    if (newAnswers.length >= totalQuestions) {
      setIsLoading(true);
      await requestDiagnosis(newAnswers);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await PrologAPI.getNextQuestion(sessionId as string, module, newAnswers);
      if (data.shouldFinish) {
        await requestDiagnosis(newAnswers);
        return;
      }
      const nextNum = data.questionNumber;
      setCurrentQuestion(nextNum);
      addMessage(false, `Pregunta ${nextNum} de ${totalQuestions}:`, true);
      addMessage(false, data.question, true);
    } catch {
      addMessage(false, 'Error al obtener la siguiente pregunta.', false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickResponse = (response: string) => {
    setInput(response);
  };

  const getQuickOptions = (): string[] => {
    if (module === 'hemorragia' && HEMORRAGIA_OPTIONS[currentQuestion]) {
      return HEMORRAGIA_OPTIONS[currentQuestion];
    }
    if (module === 'desmayo' && DESMAYO_OPTIONS[currentQuestion]) {
      return DESMAYO_OPTIONS[currentQuestion];
    }
    if (module === 'asfixia' && ASFIXIA_OPTIONS[currentQuestion]) {
      return ASFIXIA_OPTIONS[currentQuestion];
    }
    if (module === 'quemadura' && QUEMADURA_OPTIONS[currentQuestion]) {
      return QUEMADURA_OPTIONS[currentQuestion];
    }
    return QUICK_REPLIES;
  };

  const moduleColors: Record<string, { gradient: string; light: string }> = {
    desmayo: { gradient: 'from-violet-400 to-violet-500', light: 'bg-violet-50' },
    hemorragia: { gradient: 'from-rose-500 to-pink-500', light: 'bg-rose-50' },
    asfixia: { gradient: 'from-cyan-500 to-blue-500', light: 'bg-cyan-50' },
    quemadura: { gradient: 'from-amber-500 to-orange-500', light: 'bg-amber-50' }
  };

  const currentColor = moduleColors[module];

  return (
    <div className="flex flex-col h-screen max-h-[100dvh]">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`bg-gradient-to-r ${currentColor.gradient} p-5 shadow-xl`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h2 className="text-xl text-white capitalize">{module}</h2>
            <p className="text-sm text-white/90">Asistente de primeros auxilios</p>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-2xl">
            +
          </div>
        </div>
      </motion.div>

      {/* Emergency Alert */}
      <AnimatePresence>
        {isEmergency && <EmergencyAlert />}
      </AnimatePresence>

      {/* Messages Container */}
      <div className={`flex-1 overflow-y-auto px-4 py-6 space-y-4 ${currentColor.light}`}>
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} moduleColor={currentColor.gradient} />
          ))}

          {showDiagnosis && (
            <DiagnosisCard
              module={module!}
              onNewConsultation={onReset}
              customRecommendations={diagnosisData?.recommendations}
              diagnosis={diagnosisData}
            />
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Responses */}
      {!showDiagnosis && !isEmergency && !isLoading && messages[messages.length - 1]?.isQuestion && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`px-4 py-3 ${currentColor.light} flex gap-2 flex-wrap justify-center`}
        >
          {getQuickOptions().map((option) => (
            <motion.button
              key={option}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickResponse(option)}
              className="px-6 py-3 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-colors"
            >
              {option}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Input Area */}
      {!showDiagnosis && !isEmergency && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-4 bg-white border-t border-gray-200"
        >
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-gray-100 rounded-3xl px-5 py-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Selecciona tu respuesta..."
                className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-500"
                disabled={isLoading}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              className={`bg-gradient-to-r ${currentColor.gradient} text-white p-4 rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={!input.trim() || isLoading}
            >
              <Send size={20} />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Emergency Call Button */}
      {isEmergency && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="px-4"
        >
          <a
            href="tel:911"
            className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white py-4 rounded-full shadow-lg text-xl transition-colors"
          >
            <Phone size={24} />
            LLAMAR AL 911
          </a>
        </motion.div>
      )}
    </div>
  );
}