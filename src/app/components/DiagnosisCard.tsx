import { motion } from 'motion/react';
import { CheckCircle, AlertCircle, Heart, Droplet, Wind, Flame, RotateCcw } from 'lucide-react';
import { Module } from '../App';
import { DiagnosisResponse } from '../services/prologApi';

interface DiagnosisCardProps {
  module: Module;
  onNewConsultation?: () => void;
  customRecommendations?: string[];
  diagnosis?: DiagnosisResponse | null;
}

export function DiagnosisCard({ module, onNewConsultation, customRecommendations, diagnosis }: DiagnosisCardProps) {
  const moduleData: Record<string, {
    icon: typeof Heart;
    gradient: string;
    bgColor: string;
    recommendations: string[];
    caseLabel: string;
  }> = {
    desmayo: {
      icon: Heart,
      gradient: 'from-violet-400 to-violet-500',
      bgColor: 'bg-violet-50',
      caseLabel: 'Tipo de caso',
      recommendations: [
        'Coloca a la persona en posición horizontal',
        'Eleva las piernas 30cm aproximadamente',
        'Afloja la ropa ajustada',
        'Verifica respiración y pulso',
        'No le des agua ni alimentos',
        'Si no recupera consciencia en 1 minuto, llama al 911'
      ]
    },
    hemorragia: {
      icon: Droplet,
      gradient: 'from-rose-500 to-pink-500',
      bgColor: 'bg-rose-50',
      caseLabel: 'Tipo de hemorragia',
      recommendations: [
        'Aplica presión directa sobre la herida',
        'Usa un paño limpio o gasa',
        'Mantén la presión durante 10-15 minutos',
        'Eleva la zona afectada por encima del corazón',
        'No retires el vendaje si se empapa',
        'Si el sangrado no se detiene, llama al 911'
      ]
    },
    asfixia: {
      icon: Wind,
      gradient: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-50',
      caseLabel: 'Tipo de asfixia',
      recommendations: [
        'Pregunta: "¿Te estás ahogando?"',
        'Si puede toser, anímale a seguir tosiendo',
        'Si no puede toser ni hablar, aplica maniobra de Heimlich',
        '5 golpes en la espalda entre los omóplatos',
        '5 compresiones abdominales',
        'Alterna hasta que expulse el objeto o pierda consciencia'
      ]
    },
    quemadura: {
      icon: Flame,
      gradient: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      caseLabel: 'Tipo de quemadura',
      recommendations: [
        'Enfría la quemadura con agua fría (no helada) 10-20 minutos',
        'Retira joyas y ropa suelta (no pegada)',
        'Cubre con gasa estéril o paño limpio',
        'No apliques hielo, mantequilla ni pasta dental',
        'No revientes las ampollas',
        'Si es mayor que tu mano, llama al 911'
      ]
    }
  };

  const data = moduleData[module!];
  const Icon = data.icon;

  // Usar acciones de Prolog si están disponibles, sino usar las predeterminadas
  const actions = customRecommendations || data.recommendations;

  const severityLabel = 
      diagnosis?.severity === 'high' ? '⚠️ Alto'
    : diagnosis?.severity === 'medium' ? '⚠️ Moderado'
    : diagnosis?.severity === 'low'    ? '✅ Leve'
    : null;

  // Filtrado de resultados para mostrar solo los de mayor porcentaje
  let topResults = [];
  if (diagnosis?.results?.length) {
    const maxConfidence = Math.max(...diagnosis.results.map(r => r.confidence));
    topResults = diagnosis.results.filter(r => r.confidence === maxConfidence);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-2xl overflow-hidden"
    >
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${data.gradient} p-6`}>
        <div className="flex items-center gap-4 mb-3">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Icon size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={20} className="text-white" />
              <span className="text-xs uppercase tracking-wide text-white/90">Diagnóstico Completado</span>
            </div>
            <h3 className="text-2xl text-white capitalize">{module}</h3>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
      
        {/* Result Summary */}
        {(diagnosis?.results?.length || diagnosis?.caseType || typeof diagnosis?.confidence === 'number' || severityLabel || diagnosis?.action) && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 bg-gradient-to-br ${data.gradient} rounded-lg flex items-center justify-center`}>
                <AlertCircle size={18} className="text-white" />
              </div>
              <h4 className="text-lg text-gray-800">Resultado:</h4>
            </div>

                      {severityLabel && (
            <div className={`p-3 rounded-2xl ${data.bgColor} text-center`}>
              <p className="text-gray-700 font-semibold">Clasificación: <span className="font-normal">{severityLabel}</span></p>
            </div>
          )} 
            {topResults.length ? (
              <div className="space-y-3">
                {topResults.map((item, index) => {
                  let actionList = [];
                  if (item.action) {
                    actionList = item.action.split(/\n|;|,|\r/).map(s => s.trim()).filter(Boolean);
                  }
                  return (
                    <div key={`${item.caseType}-${index}`} className={`p-3 rounded-2xl ${data.bgColor}`}>
                      <p className="text-gray-700"><span className="font-semibold">{data.caseLabel}:</span> {item.caseType}</p>
                      <p className="text-gray-700"><span className="font-semibold">Precision:</span> ({item.level})</p>
                      <span className="font-semibold text-gray-700 block mb-1">Recomendaciones:</span>
                      {actionList.length > 1 ? (
                        <div className="space-y-2">
                          {actionList.map((act, i) => (
                            <div key={i} className="flex gap-3 items-start p-2 rounded-2xl bg-white/60">
                              <div className={`mt-0.5 w-7 h-7 bg-gradient-to-br ${data.gradient} text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-md`}>
                                {i + 1}
                              </div>
                              <p className="text-gray-700 flex-1 leading-relaxed">{act}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-700">{item.action}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                {diagnosis?.caseType && (
                  <div className={`p-3 rounded-2xl ${data.bgColor}`}>
                    <p className="text-gray-700"><span className="font-semibold">{data.caseLabel}:</span> {diagnosis.caseType}</p>
                  </div>
                )}

                {typeof diagnosis?.confidence === 'number' && (
                  <div className={`p-3 rounded-2xl ${data.bgColor}`}>
                    <p className="text-gray-700"><span className="font-semibold">Porcentaje de acierto:</span> {diagnosis.confidence}%</p>
                  </div>
                )}
              </>
            )}



            {diagnosis?.action && !diagnosis?.results?.length && (
              <div className={`p-3 rounded-2xl ${data.bgColor}`}>
                <p className="text-gray-700"><span className="font-semibold">Advertencia:</span> {diagnosis.action}</p>
              </div>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-8 h-8 bg-gradient-to-br ${data.gradient} rounded-lg flex items-center justify-center`}>
              <AlertCircle size={18} className="text-white" />
            </div>
            <h4 className="text-lg text-gray-800">Acción:</h4>
          </div>

          {actions.map((act, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex gap-3 items-start p-3 rounded-2xl ${data.bgColor}`}
            >
              <div className={`mt-0.5 w-7 h-7 bg-gradient-to-br ${data.gradient} text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-md`}>
                {index + 1}
              </div>
              <p className="text-gray-700 flex-1 leading-relaxed">{act}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 space-y-4"
        >
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-4">
            <p className="text-sm text-gray-700 text-center leading-relaxed">
              <span className="text-lg">⚠️</span> Estas son medidas de primeros auxilios. Busca atención médica profesional lo antes posible.
            </p>
          </div>


          {onNewConsultation && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
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