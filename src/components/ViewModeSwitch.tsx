import { Monitor, Smartphone } from 'lucide-react';

interface ViewModeSwitchProps {
  viewMode: 'pc' | 'mobile';
  onChange: (mode: 'pc' | 'mobile') => void;
  className?: string;
  showLabels?: boolean;
}

export function ViewModeSwitch({
  viewMode,
  onChange,
  className = '',
  showLabels = true,
}: ViewModeSwitchProps) {
  return (
    <div 
      className={`inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner ${className}`}
      title="Cambiar entre vista PC y vista Móvil"
    >
      <button
        type="button"
        onClick={() => onChange('pc')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
          viewMode === 'pc'
            ? 'bg-white text-indigo-700 shadow-sm font-bold scale-[1.02]'
            : 'text-slate-500 hover:text-slate-800'
        }`}
        aria-pressed={viewMode === 'pc'}
        title="Vista de Computadora / Escritorio"
      >
        <Monitor className="w-3.5 h-3.5" />
        {showLabels && <span>PC</span>}
      </button>

      <button
        type="button"
        onClick={() => onChange('mobile')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
          viewMode === 'mobile'
            ? 'bg-indigo-600 text-white shadow-sm font-bold scale-[1.02]'
            : 'text-slate-500 hover:text-slate-800'
        }`}
        aria-pressed={viewMode === 'mobile'}
        title="Vista de Celular / Móvil"
      >
        <Smartphone className="w-3.5 h-3.5" />
        {showLabels && <span>Móvil</span>}
      </button>
    </div>
  );
}
