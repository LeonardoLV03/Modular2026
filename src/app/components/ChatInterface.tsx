import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Send, Phone } from 'lucide-react';
import { Module } from '../App';
import { ChatMessage } from './ChatMessage';
import { DiagnosisCard } from './DiagnosisCard';
import { EmergencyAlert } from './EmergencyAlert';
import * as PrologAPI from '../services/prologApi';
import * as StatsAPI from '../services/statsApi';

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

const MODULE_LABELS: Record<string, string> = {
  desmayo:     'Desmayo',
  hemorragia:  'Hemorragia',
  asfixia:     'Asfixia',
  quemadura:   'Quemadura',
  fractura:    'Fractura',
  intoxicacion:'Intoxicación',
  picadura:    'Picadura',
  descarga:    'Desc. Eléctrica',
  insolacion:  'Insolación',
  convulsion:  'Convulsión',
};

const MODULE_COLORS: Record<string, { gradient: string; light: string }> = {
  desmayo:     { gradient: 'from-violet-400 to-violet-500', light: 'bg-violet-50'  },
  hemorragia:  { gradient: 'from-rose-500 to-pink-500',     light: 'bg-rose-50'    },
  asfixia:     { gradient: 'from-cyan-500 to-blue-500',     light: 'bg-cyan-50'    },
  quemadura:   { gradient: 'from-amber-500 to-orange-500',  light: 'bg-amber-50'   },
  fractura:    { gradient: 'from-sky-500 to-sky-600',       light: 'bg-sky-50'     },
  intoxicacion:{ gradient: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50'},
  picadura:    { gradient: 'from-teal-500 to-teal-700',     light: 'bg-teal-50'    },
  descarga:    { gradient: 'from-yellow-500 to-yellow-600', light: 'bg-yellow-50'  },
  insolacion:  { gradient: 'from-red-500 to-orange-500',    light: 'bg-red-50'     },
  convulsion:  { gradient: 'from-indigo-500 to-indigo-600', light: 'bg-indigo-50'  },
};

const QUICK_REPLIES = ['Sí', 'No', 'No estoy seguro'];

const DESMAYO_OPTIONS: Record<number, string[]> = {
  1: ['Consciente, responde y puede hablar', 'Confundida o desorientada, responde poco', 'No responde a nada, inconsciente'],
  2: ['Si, respira y tiene pulso normal', 'Respira con dificultad o pulso debil', 'No respira o no se detecta pulso'],
  3: ['No perdio la conciencia (solo mareo/debilidad)', 'Menos de 2 minutos inconsciente', 'Mas de 2 minutos inconsciente'],
  4: ['Ninguna senal adicional', 'Presenta convulsiones', 'Piel azulada (cianosis) o dificultad respiratoria', 'Dolor en el pecho o antecedentes cardiacos', 'Golpe fuerte en la cabeza al caer'],
};

const HEMORRAGIA_OPTIONS: Record<number, string[]> = {
  1: ['Poco  (manchas o goteo leve)', 'Constante  (flujo moderado continuo)', 'Abundante  (flujo fuerte)', 'A chorros / extremadamente intenso', 'Sin sangrado visible'],
  2: ['La herida es superficial', 'La herida no es superficial', 'Sin herida visible', 'No estoy seguro'],
  3: ['Dolor moderado', 'Dolor intenso', 'Sin dolor'],
  4: ['Palida solamente', 'Fria y palida', 'Moretones visibles', 'Normal, sin cambios'],
  5: ['Mareo unicamente', 'Debilidad unicamente', 'Mareo y debilidad juntos', 'Inflamacion en la zona afectada', 'Perdida del conocimiento', 'Ninguno de los anteriores'],
};

const ASFIXIA_OPTIONS: Record<number, string[]> = {
  1: ['Puede hablar y toser con fuerza', 'Puede hablar pero la tos es debil', 'No puede hablar, tos debil o ineficaz', 'No emite sonidos ni puede toser'],
  2: ['Respira con dificultad o ruidos', 'Respiracion ausente', 'Respiracion normal', 'No estoy seguro'],
  3: ['Color normal', 'Enrojecimiento en rostro', 'Color azulado (cianosis)'],
  4: ['Consciente y alerta', 'Agitado o confundido', 'Inconsciente'],
  5: ['Atragantamiento con comida u objeto', 'Compresion del cuello o torax', 'Ahogamiento por agua', 'Inhalacion de humo o gases', 'Posicion que dificulta respirar', 'No estoy seguro'],
};

const QUEMADURA_OPTIONS: Record<number, string[]> = {
  1: ['Enrojecimiento leve', 'Ampollas y dolor', 'Piel blanca o carbonizada', 'Lesión química o eléctrica', 'No estoy seguro'],
  2: ['Brazo o pierna', 'Cara, cuello o manos', 'Torso o espalda', 'Zona extensa'],
  3: ['Solo enrojecimiento', 'Ampollas visibles', 'Piel carbonizada/blanca', 'No estoy seguro'],
  4: ['Hace pocos minutos y no traté', 'Lo enfrié con agua', 'Apliqué hielo o crema', 'No estoy seguro'],
  5: ['Dolor intenso', 'Dificultad para respirar', 'Signos de infección/necrosis', 'Ninguno de los anteriores'],
};

const FRACTURA_OPTIONS: Record<number, string[]> = {
  1: ['Brazo, antebrazo o muñeca', 'Pierna, muslo o tobillo', 'Costilla o tórax', 'Columna vertebral o cuello', 'Mano, pie o dedo', 'No estoy seguro'],
  2: ['Hueso visiblemente expuesto', 'Deformidad visible sin hueso expuesto', 'Solo inflamación o moretón', 'Sin cambios visibles'],
  3: ['No puede moverla en absoluto', 'Puede moverla con mucho dolor', 'Puede moverla con algo de dolor', 'Movimiento normal con dolor leve'],
  4: ['Dolor muy intenso y constante', 'Dolor moderado al presionar', 'Dolor leve o puntual', 'Sin dolor significativo'],
  5: ['Hormigueo o pérdida de sensibilidad', 'Piel pálida, fría o sudoración fría', 'Hemorragia visible en la zona', 'Ninguno de los anteriores'],
};

const INTOXICACION_OPTIONS: Record<number, string[]> = {
  1: ['Ingirió medicamentos en exceso', 'Ingirió una sustancia química', 'Ingirió alimentos en mal estado', 'Inhaló gases, vapores o humo', 'Contacto con piel o mucosas', 'No sé cómo ocurrió'],
  2: ['Consciente y alerta', 'Confundida o desorientada', 'Somnolenta o difícil de despertar', 'Inconsciente o no responde'],
  3: ['Hace menos de 1 hora', 'Entre 1 y 3 horas', 'Más de 3 horas', 'No sé cuándo ocurrió'],
  4: ['Náuseas o vómito', 'Dificultad para respirar', 'Convulsiones', 'Quemaduras en boca o garganta', 'Dolor abdominal intenso', 'Sin síntomas claros por ahora'],
  5: ['Sí, sé exactamente qué fue', 'Tengo una idea aproximada', 'No sé qué sustancia fue'],
};

const PICADURA_OPTIONS: Record<number, string[]> = {
  1: ['Abeja, avispa o hormiga', 'Araña', 'Serpiente', 'Escorpión o alacrán', 'Perro u otro mamífero', 'No lo identifiqué'],
  2: ['Cara o cuello', 'Brazo o pierna', 'Mano o pie', 'Torso o espalda'],
  3: ['Solo dolor e inflamación local', 'Reacción alérgica: urticaria generalizada', 'Dificultad para respirar o tragar', 'Náuseas, mareo o debilidad general', 'Entumecimiento que se extiende', 'Herida profunda con sangrado'],
  4: ['Sí, tiene alergia conocida', 'No tiene alergias', 'No lo sé'],
  5: ['Hace menos de 30 minutos', 'Entre 30 min y 2 horas', 'Más de 2 horas'],
};

const DESCARGA_OPTIONS: Record<number, string[]> = {
  1: ['Sigue en contacto con la fuente eléctrica', 'Ya no está en contacto', 'No estoy seguro'],
  2: ['Consciente y alerta', 'Consciente pero confundida', 'Inconsciente pero respira', 'No respira o no tiene pulso'],
  3: ['Corriente doméstica (110-220V)', 'Alta tensión o línea eléctrica', 'Rayo o relámpago', 'No lo sé'],
  4: ['Quemaduras evidentes de entrada/salida', 'Enrojecimiento o marcas leves', 'Sin marcas visibles'],
  5: ['Dolor en el pecho o palpitaciones', 'Convulsiones', 'Parálisis o pérdida de sensibilidad', 'Solo dolor local en la zona', 'Sin síntomas adicionales'],
};

const INSOLACION_OPTIONS: Record<number, string[]> = {
  1: ['Menos de 1 hora', 'Entre 1 y 3 horas', 'Más de 3 horas', 'No estoy seguro'],
  2: ['Mareo y debilidad', 'Dolor de cabeza intenso', 'Náuseas o vómito', 'Calambres musculares', 'Confusión o comportamiento extraño', 'Pérdida de consciencia'],
  3: ['Piel muy caliente, seca, sin sudoración', 'Piel húmeda, pálida y fría al tacto', 'Piel enrojecida con algo de sudoración', 'Sin cambios evidentes en la piel'],
  4: ['Consciente y orientada', 'Confundida o desorientada', 'Somnolenta, difícil de despertar', 'Inconsciente'],
  5: ['Sí, ha bebido agua recientemente', 'No ha bebido agua en horas', 'No estoy seguro'],
};

const CONVULSION_OPTIONS: Record<number, string[]> = {
  1: ['Sigue convulsionando ahora mismo', 'La convulsión ya terminó', 'No estoy seguro si fue convulsión'],
  2: ['Menos de 2 minutos', 'Entre 2 y 5 minutos', 'Más de 5 minutos', 'No sé cuánto duró'],
  3: ['Sí, tiene epilepsia diagnosticada', 'Sí, ha tenido convulsiones antes', 'No, es la primera vez', 'No lo sé'],
  4: ['Se recuperó y está consciente', 'Está somnolenta y confundida', 'Inconsciente, no responde', 'Tuvo otra convulsión seguida'],
  5: ['Fiebre muy alta', 'Golpe o trauma en la cabeza', 'Intoxicación o sustancia conocida', 'Embarazo', 'Sin causa aparente'],
};

export function ChatInterface({ module, onReset }: ChatInterfaceProps) {
  const [messages, setMessages]               = useState<Message[]>([]);
  const [input, setInput]                     = useState('');
  const [answers, setAnswers]                 = useState<string[]>([]);
  const [sessionId, setSessionId]             = useState<string | null>(null);
  const [totalQuestions, setTotalQuestions]   = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [isLoading, setIsLoading]             = useState(false);
  const [isEmergency, setIsEmergency]         = useState(false);
  const [showDiagnosis, setShowDiagnosis]     = useState(false);
  const [diagnosisData, setDiagnosisData]     = useState<PrologAPI.DiagnosisResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgId          = useRef(0);

  const label        = MODULE_LABELS[module!] ?? module ?? '';
  const currentColor = MODULE_COLORS[module!] ?? MODULE_COLORS['desmayo'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

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
      addMessage(false, `Iniciando consulta para: ${label}...`, false);

      try {
        const data = await PrologAPI.startConsultation(module);
        setSessionId(data.sessionId);
        setTotalQuestions(data.totalQuestions);
        setCurrentQuestion(1);
        addMessage(false, `Pregunta 1 de ${data.totalQuestions}:`, true);
        addMessage(false, data.firstQuestion, true);
      } catch {
        addMessage(false, 'No se pudo conectar con el servidor. Verifica la conexión.', false);
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
    setMessages((prev) => [...prev, { id: msgId.current, text, isUser, isQuestion }]);
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

      // Guardar en MongoDB (no bloquea la UI si falla)
      StatsAPI.saveConsultation({
        module: module!,
        severity: diagnosis.severity,
        isEmergency: diagnosis.isEmergency,
        answers: answersList,
        recommendations: diagnosis.recommendations || [],
        sessionId: sessionId!,
      }).catch(() => {});
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

  const handleQuickResponse = (response: string) => setInput(response);

  const getQuickOptions = (): string[] => {
    const m = module!;
    const q = currentQuestion;
    if (m === 'desmayo'      && DESMAYO_OPTIONS[q])      return DESMAYO_OPTIONS[q];
    if (m === 'hemorragia'   && HEMORRAGIA_OPTIONS[q])   return HEMORRAGIA_OPTIONS[q];
    if (m === 'asfixia'      && ASFIXIA_OPTIONS[q])      return ASFIXIA_OPTIONS[q];
    if (m === 'quemadura'    && QUEMADURA_OPTIONS[q])    return QUEMADURA_OPTIONS[q];
    if (m === 'fractura'     && FRACTURA_OPTIONS[q])     return FRACTURA_OPTIONS[q];
    if (m === 'intoxicacion' && INTOXICACION_OPTIONS[q]) return INTOXICACION_OPTIONS[q];
    if (m === 'picadura'     && PICADURA_OPTIONS[q])     return PICADURA_OPTIONS[q];
    if (m === 'descarga'     && DESCARGA_OPTIONS[q])     return DESCARGA_OPTIONS[q];
    if (m === 'insolacion'   && INSOLACION_OPTIONS[q])   return INSOLACION_OPTIONS[q];
    if (m === 'convulsion'   && CONVULSION_OPTIONS[q])   return CONVULSION_OPTIONS[q];
    return QUICK_REPLIES;
  };

  return (
    <div className="flex flex-1 max-h-[100dvh] w-full flex-col overflow-hidden bg-white">
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
            <h2 className="text-xl text-white">{label}</h2>
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

      {/* Messages */}
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

      {/* Quick responses */}
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

      {/* Input */}
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

      {/* Emergency Call */}
      {isEmergency && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="px-4 pb-4"
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