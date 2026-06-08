import { motion } from 'motion/react';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  isQuestion?: boolean;
}

interface ChatMessageProps {
  message: Message;
  moduleColor: string;
}

// Detecta si el mensaje es una lista de síntomas (por ejemplo, empieza con "Síntomas:" o "Sintomas:")
function parseSymptoms(text: string): string[] | null {
  const match = text.match(/^(Síntomas|Sintomas):\s*([\s\S]*)/i);
  if (!match) return null;
  // Separar por salto de línea o por punto y coma
  const list = match[2]
    .split(/\n|;|\r/)
    .map(s => s.trim())
    .filter(Boolean);
  return list.length > 0 ? list : null;
}

export function ChatMessage({ message, moduleColor }: ChatMessageProps) {
  const symptoms = parseSymptoms(message.text);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`flex gap-2 ${message.isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Avatar - Bot */}
      {!message.isUser && (
        <div className={`w-10 h-10 bg-gradient-to-br ${moduleColor} rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-lg`}>
          <span className="text-lg">+</span>
        </div>
      )}

      <div className={`max-w-[75%] ${message.isUser ? 'order-2' : 'order-1'}`}>
        {/* Message Bubble */}
        <div
          className={`rounded-3xl px-5 py-3 shadow-md ${
            message.isUser
              ? 'bg-white text-gray-800 rounded-tr-md'
              : message.isQuestion
              ? `bg-gradient-to-br ${moduleColor} text-white rounded-tl-md`
              : 'bg-white text-gray-800 rounded-tl-md'
          }`}
        >
          {/* Question Badge */}
          {message.isQuestion && (
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/30">
              <span className="text-base">❓</span>
              <span className="text-xs uppercase tracking-wider opacity-90">Pregunta</span>
            </div>
          )}

          {/* Renderizado especial para síntomas */}
          {symptoms ? (
            <div className="space-y-3">
              <div className="font-semibold mb-1">Síntomas detectados:</div>
              {symptoms.map((s, i) => (
                <div key={i} className="flex gap-3 items-start p-3 rounded-2xl bg-rose-50">
                  <div className="mt-0.5 w-7 h-7 bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    {i + 1}
                  </div>
                  <p className="text-gray-700 flex-1 leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="leading-relaxed">
              {message.text}
            </p>
          )}
        </div>

        {/* Timestamp/Label */}
        <div className={`text-xs mt-1.5 px-2 ${message.isUser ? 'text-right' : 'text-left'} text-gray-400`}>
          {message.isUser ? 'Tú' : 'Asistente'}
        </div>
      </div>

      {/* Avatar - User */}
      {message.isUser && (
        <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-lg">
          <span className="text-base">👤</span>
        </div>
      )}
    </motion.div>
  );
}
