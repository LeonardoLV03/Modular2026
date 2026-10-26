import { ArrowLeft, PauseCircle, Phone } from 'lucide-react';

interface PenaltyNoticeProps {
  until: string | null;
  onBack: () => void;
}

function formatUntil(until: string | null): string {
  if (!until) return 'en unas horas';
  const date = new Date(until);
  if (isNaN(date.getTime())) return 'en unas horas';
  return date.toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' });
}

// Se muestra en lugar del chat cuando la sesión está penalizada
export function PenaltyNotice({ until, onBack }: PenaltyNoticeProps) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-gray-50">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Volver al inicio"
            className="rounded-full p-2 text-white transition-colors hover:bg-white/20"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-xl text-white">Asistente en pausa temporal</h2>
            <p className="text-sm text-white/90">Uso inusual detectado</p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-lg space-y-4 p-6">
        <div className="space-y-3 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
            <PauseCircle size={30} className="text-amber-600" />
          </div>
          <p className="text-sm leading-relaxed text-gray-700">
            Detectamos muchas consultas en muy poco tiempo desde este dispositivo, por lo que
            pausamos temporalmente el asistente. Así protegemos la calidad de los datos que
            ayudan a mejorar la aplicación.
          </p>
          <p className="text-sm leading-relaxed text-gray-700">
            Podrá volver a usarlo el <strong>{formatUntil(until)}</strong>. Mientras tanto, los
            Cursos siguen disponibles. Gracias por su comprensión.
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4">
          <Phone size={20} className="mt-0.5 flex-shrink-0 text-red-600" />
          <p className="text-sm leading-relaxed text-red-700">
            Si se encuentra ante una emergencia real, <strong>llame al 911 de inmediato</strong>.
          </p>
        </div>

        <button
          onClick={onBack}
          className="w-full rounded-2xl bg-gray-900 py-3.5 text-base font-semibold text-white shadow-lg"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
