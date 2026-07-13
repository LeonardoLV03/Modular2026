import { motion } from 'motion/react';
import {
  CheckCircle, AlertCircle, RotateCcw,
  Heart, Droplet, Wind, Flame,
  Bone, FlaskConical, Bug, Zap, Sun, Brain,
} from 'lucide-react';
import { Module } from '../App';
import { DiagnosisResponse } from '../services/prologApi';

interface DiagnosisCardProps {
  module: Module;
  onNewConsultation?: () => void;
  customRecommendations?: string[];
  diagnosis?: DiagnosisResponse | null;
}

// Nombres de display con acentos correctos
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

export function DiagnosisCard({
  module,
  onNewConsultation,
  customRecommendations,
  diagnosis,
}: DiagnosisCardProps) {

  const moduleData: Record<string, {
    icon: typeof Heart;
    gradient: string;
    bgColor: string;
    caseLabel: string;
    recommendations: string[];
  }> = {
    // ── Módulos originales ──────────────────────────────────
    desmayo: {
      icon: Heart,
      gradient: 'from-violet-400 to-violet-500',
      bgColor: 'bg-violet-50',
      caseLabel: 'Tipo de caso',
      recommendations: [
        'Coloca a la persona en posición horizontal',
        'Eleva las piernas unos 30 cm',
        'Afloja la ropa ajustada (cuello, cinturón)',
        'Verifica respiración y pulso constantemente',
        'No le des agua ni alimentos hasta que esté completamente consciente',
        'Si no recupera la consciencia en 1 minuto, llama al 911',
      ],
    },
    hemorragia: {
      icon: Droplet,
      gradient: 'from-rose-500 to-pink-500',
      bgColor: 'bg-rose-50',
      caseLabel: 'Tipo de hemorragia',
      recommendations: [
        'Aplica presión directa y firme sobre la herida',
        'Usa un paño limpio, gasa o lo que tengas disponible',
        'Mantén la presión continua durante 10-15 minutos sin levantar',
        'Eleva la zona afectada por encima del nivel del corazón',
        'No retires el vendaje si se empapa; agrega más material encima',
        'Si el sangrado no cede en 15 minutos o es muy abundante, llama al 911',
      ],
    },
    asfixia: {
      icon: Wind,
      gradient: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-50',
      caseLabel: 'Tipo de asfixia',
      recommendations: [
        'Pregunta: "¿Te estás ahogando?" — si puede hablar, anímale a toser fuerte',
        'Si NO puede hablar ni toser, aplica maniobra de Heimlich de inmediato',
        'Colócate detrás, rodea con brazos bajo el pecho, manos en puño al centro',
        'Realiza 5 compresiones abdominales fuertes y rápidas hacia adentro y arriba',
        'Alterna 5 golpes en la espalda con 5 compresiones hasta que salga el objeto',
        'Si pierde la consciencia, inicia RCP y llama al 911',
      ],
    },
    quemadura: {
      icon: Flame,
      gradient: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      caseLabel: 'Tipo de quemadura',
      recommendations: [
        'Enfría la quemadura con agua fría (no helada) durante 10-20 minutos',
        'Retira joyas, relojes y ropa suelta — nunca arranques lo que esté pegado',
        'Cubre con gasa estéril o un paño limpio y húmedo',
        'NO apliques hielo, mantequilla, pasta dental ni ningún remedio casero',
        'No revientes las ampollas — protegen contra infección',
        'Si la quemadura es mayor que la palma de tu mano o está en cara/manos/genitales, llama al 911',
      ],
    },

    // ── Módulos nuevos ──────────────────────────────────────
    fractura: {
      icon: Bone,
      gradient: 'from-sky-500 to-sky-600',
      bgColor: 'bg-sky-50',
      caseLabel: 'Tipo de fractura',
      recommendations: [
        'Inmoviliza la zona: NO intentes mover ni realinear el hueso',
        'Usa férulas improvisadas (tabla, revista, cartón) fijadas con vendas o tela',
        'Si hay hueso expuesto, cubre con gasa limpia sin presionar ni recolocar',
        'Aplica hielo envuelto en tela 15-20 minutos para reducir inflamación',
        'Eleva la extremidad si es posible y no aumenta el dolor',
        'Traslada a urgencias para radiografía — no conduzcas la persona afectada',
      ],
    },
    intoxicacion: {
      icon: FlaskConical,
      gradient: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      caseLabel: 'Tipo de intoxicación',
      recommendations: [
        'Llama al 911 o al Centro de Toxicología de inmediato',
        'NO induzcas el vómito salvo indicación médica expresa',
        'Si fue inhalación, lleva a la persona a aire fresco de inmediato',
        'Si fue contacto con piel, lava con agua abundante sin frotar al menos 15 min',
        'Si está inconsciente y respira, coloca en posición lateral de seguridad',
        'Guarda el envase o identifica la sustancia para informar a los médicos',
      ],
    },
    picadura: {
      icon: Bug,
      gradient: 'from-teal-500 to-teal-700',
      bgColor: 'bg-teal-50',
      caseLabel: 'Tipo de picadura',
      recommendations: [
        'Aleja a la persona del animal o zona de riesgo con precaución',
        'Retira el aguijón si está presente raspando con una tarjeta — nunca con pinzas',
        'Lava la zona con agua y jabón durante al menos 5 minutos',
        'Aplica hielo envuelto en tela 10-15 minutos para reducir dolor e inflamación',
        'Si fue serpiente o escorpión, inmoviliza la extremidad y traslada a urgencias YA',
        'Ante cualquier signo de reacción alérgica (dificultad para respirar, urticaria), llama al 911',
      ],
    },
    descarga: {
      icon: Zap,
      gradient: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      caseLabel: 'Tipo de descarga',
      recommendations: [
        'NUNCA toques a la persona si aún está en contacto con la corriente eléctrica',
        'Corta la electricidad desde el interruptor general antes de acercarte',
        'Si no puedes cortar la corriente, usa un objeto no conductor (madera seca) para alejar',
        'Si no respira ni tiene pulso, inicia RCP de inmediato y llama al 911',
        'Toda descarga eléctrica requiere evaluación médica urgente — los daños internos pueden ser graves aunque la piel se vea bien',
        'NO muevas a la persona si sospechas lesión en columna o cuello',
      ],
    },
    insolacion: {
      icon: Sun,
      gradient: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-50',
      caseLabel: 'Tipo de insolación',
      recommendations: [
        'Lleva a la persona a un lugar fresco, con sombra y ventilación de inmediato',
        'Afloja o retira ropa innecesaria para facilitar la pérdida de calor',
        'Enfría el cuerpo con agua fría en cuello, axilas e ingles (zonas de grandes vasos)',
        'Ofrece agua fresca a pequeños sorbos si está consciente y puede tragar',
        'Si está inconsciente o con piel seca y muy caliente (sin sudor): es emergencia — llama al 911',
        'NO des bebidas con cafeína, alcohol ni medicamentos sin indicación médica',
      ],
    },
    convulsion: {
      icon: Brain,
      gradient: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      caseLabel: 'Tipo de convulsión',
      recommendations: [
        'Protege la cabeza: coloca algo suave debajo (ropa doblada, mochila)',
        'Despeja el área alrededor: aleja objetos duros o cortantes',
        'NO introduzcas nada en la boca ni intentes sujetar la lengua',
        'NO sostengas ni intentes detener los movimientos convulsivos con fuerza',
        'Cronometra la duración: si supera 5 minutos, llama al 911 de inmediato',
        'Al terminar, coloca en posición lateral de seguridad y quédate con la persona hasta que se recupere',
      ],
    },
  };

  const data = moduleData[module!];
  if (!data) return null; // Protección ante módulo desconocido

  const Icon = data.icon;
  const label = MODULE_LABELS[module!] ?? module ?? '';

  // Prolog tiene prioridad; fallback = recomendaciones estáticas del módulo
  const actions = customRecommendations?.length ? customRecommendations : data.recommendations;

  const severityConfig = {
    high:   { label: 'Alto',     emoji: '🔴', textColor: 'text-red-700',    bg: 'bg-red-50 border border-red-200'    },
    medium: { label: 'Moderado', emoji: '🟡', textColor: 'text-amber-700',  bg: 'bg-amber-50 border border-amber-200'},
    low:    { label: 'Leve',     emoji: '🟢', textColor: 'text-emerald-700',bg: 'bg-emerald-50 border border-emerald-200'},
  };
  const severityInfo = diagnosis?.severity ? severityConfig[diagnosis.severity as keyof typeof severityConfig] : null;

  // Resultados del sistema Prolog (módulos con porcentaje)
  let topResults: typeof diagnosis.results = [];
  if (diagnosis?.results?.length) {
    const maxConfidence = Math.max(...diagnosis.results.map((r) => r.confidence));
    topResults = diagnosis.results.filter((r) => r.confidence === maxConfidence);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${data.gradient} p-6`}>
        <div className="flex items-center gap-4 mb-3">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Icon size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={20} className="text-white" />
              <span className="text-xs uppercase tracking-wide text-white/90">
                Diagnóstico Completado
              </span>
            </div>
            <h3 className="text-2xl text-white">{label}</h3>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">

        {/* Severidad */}
        {severityInfo && (
          <div className={`mb-5 flex items-center gap-3 rounded-2xl p-4 ${severityInfo.bg}`}>
            <span className="text-2xl">{severityInfo.emoji}</span>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Nivel de gravedad</p>
              <p className={`text-lg font-bold ${severityInfo.textColor}`}>{severityInfo.label}</p>
            </div>
          </div>
        )}

        {/* Resultados del sistema Prolog (solo para módulos con % de confianza) */}
        {topResults.length > 0 && (
          <div className="mb-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 bg-gradient-to-br ${data.gradient} rounded-lg flex items-center justify-center`}>
                <AlertCircle size={18} className="text-white" />
              </div>
              <h4 className="text-lg text-gray-800">Resultado del análisis:</h4>
            </div>
            {topResults.map((item, index) => {
              const actionList = item.action
                ? item.action.split(/\n|;|\r/).map((s) => s.trim()).filter(Boolean)
                : [];
              return (
                <div key={`${item.caseType}-${index}`} className={`rounded-2xl p-4 ${data.bgColor}`}>
                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold">{data.caseLabel}:</span> {item.caseType}
                  </p>
                  <p className="text-gray-500 text-sm mb-2">
                    Precisión: {item.level}
                  </p>
                  {actionList.length > 0 && (
                    <div className="space-y-2">
                      {actionList.map((act, i) => (
                        <div key={i} className="flex gap-3 items-start p-2 rounded-xl bg-white/60">
                          <div className={`mt-0.5 w-6 h-6 bg-gradient-to-br ${data.gradient} text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs shadow`}>
                            {i + 1}
                          </div>
                          <p className="text-gray-700 flex-1 leading-relaxed text-sm">{act}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Caso único sin resultados en array */}
        {!topResults.length && diagnosis?.caseType && (
          <div className={`mb-5 rounded-2xl p-4 ${data.bgColor}`}>
            <p className="text-gray-700">
              <span className="font-semibold">{data.caseLabel}:</span> {diagnosis.caseType}
            </p>
            {typeof diagnosis.confidence === 'number' && (
              <p className="text-gray-500 text-sm mt-1">
                Porcentaje de acierto: {diagnosis.confidence}%
              </p>
            )}
          </div>
        )}

        {/* Advertencia de Prolog */}
        {diagnosis?.action && !topResults.length && (
          <div className={`mb-5 rounded-2xl p-4 ${data.bgColor}`}>
            <p className="text-gray-700">
              <span className="font-semibold">Advertencia:</span> {diagnosis.action}
            </p>
          </div>
        )}

        {/* Acciones / Recomendaciones */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-8 h-8 bg-gradient-to-br ${data.gradient} rounded-lg flex items-center justify-center`}>
              <AlertCircle size={18} className="text-white" />
            </div>
            <h4 className="text-lg text-gray-800">Qué hacer ahora:</h4>
          </div>

          {actions.map((act, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`flex gap-3 items-start p-3 rounded-2xl ${data.bgColor}`}
            >
              <div
                className={`mt-0.5 w-7 h-7 bg-gradient-to-br ${data.gradient} text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-md text-sm`}
              >
                {index + 1}
              </div>
              <p className="text-gray-700 flex-1 leading-relaxed">{act}</p>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 space-y-4"
        >
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-4">
            <p className="text-sm text-gray-700 text-center leading-relaxed">
              <span className="text-lg">⚠️</span> Estas son medidas de primeros auxilios.
              Busca atención médica profesional lo antes posible.
            </p>
          </div>

          {onNewConsultation && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNewConsultation}
              className={`w-full bg-gradient-to-r ${data.gradient} text-white py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 hover:shadow-xl transition-all`}
            >
              <RotateCcw size={20} />
              <span className="text-base">Nueva Consulta</span>
            </motion.button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}