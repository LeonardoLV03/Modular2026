import { GraduationCap, AlertTriangle } from 'lucide-react';
import type { ConsultationType } from '../services/consultationType';

interface Option {
  value: ConsultationType;
  label: string;
  hint: string;
  ariaLabel: string;
  icon: typeof GraduationCap;
  activeText: string;
}

const OPTIONS: Option[] = [
  {
    value: 'training',
    label: 'Entrenamiento',
    hint: 'Es una práctica',
    ariaLabel: 'Entrenamiento',
    icon: GraduationCap,
    activeText: 'text-indigo-600',
  },
  {
    value: 'real',
    label: 'Real',
    hint: 'Esta consulta está pasando',
    ariaLabel: 'Real (esta consulta está pasando)',
    icon: AlertTriangle,
    activeText: 'text-red-600',
  },
];

interface ConsultationTypeSwitchProps {
  value: ConsultationType;
  onChange: (value: ConsultationType) => void;
  /** Texto pequeño bajo el switch (estado actual / aviso de guardado) */
  note?: string;
}

// Switch segmentado de dos opciones, pensado para ir sobre el header con degradado.
// Botones de 44 px de alto como mínimo para que sea fácil de tocar en el celular.
export function ConsultationTypeSwitch({ value, onChange, note }: ConsultationTypeSwitchProps) {
  return (
    <div className="flex w-full flex-col gap-1 lg:w-auto lg:items-end">
      <div
        role="radiogroup"
        aria-label="Tipo de consulta"
        className="flex w-full gap-1 rounded-2xl bg-black/15 p-1 lg:w-auto"
      >
        {OPTIONS.map(opt => {
          const active = value === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={opt.ariaLabel}
              onClick={() => onChange(opt.value)}
              className={`flex min-h-[44px] flex-1 flex-col justify-center rounded-xl px-3 py-1.5 text-left transition-colors lg:min-w-[150px] lg:flex-none ${
                active
                  ? 'bg-white shadow-md'
                  : 'text-white/90 hover:bg-white/15'
              }`}
            >
              <span className={`flex items-center gap-1.5 text-sm font-semibold ${active ? opt.activeText : ''}`}>
                <Icon size={14} />
                {opt.label}
              </span>
              <span className={`text-[10px] leading-tight ${active ? 'text-gray-500' : 'text-white/75'}`}>
                {opt.hint}
              </span>
            </button>
          );
        })}
      </div>
      {note && (
        <p className="text-[11px] leading-tight text-white/90 lg:text-right" aria-live="polite">
          {note}
        </p>
      )}
    </div>
  );
}
