import { Layers, Box } from 'lucide-react';

interface GroupBySwitchProps {
  groupBy: 'line' | 'capsule';
  onChange: (mode: 'line' | 'capsule') => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function GroupBySwitch({
  groupBy,
  onChange,
  className = '',
  size = 'md'
}: GroupBySwitchProps) {
  const isSm = size === 'sm';
  return (
    <div 
      className={`inline-flex items-center bg-[#f1f3f6] p-0.5 sm:p-1 rounded-xl border border-slate-200 shadow-2xs ${className}`}
      title="Cambiar agrupación del catálogo (Por Línea o Por Cápsula)"
    >
      <button
        type="button"
        onClick={() => onChange('line')}
        className={`flex items-center gap-1.5 ${isSm ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1 text-xs'} font-bold rounded-lg transition-all duration-200 cursor-pointer ${
          groupBy === 'line'
            ? 'bg-[#00205b] text-white shadow-xs scale-[1.02]'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
        aria-pressed={groupBy === 'line'}
        title="Agrupar por Línea / Disciplina (Running, Training, Tennis, etc.)"
      >
        <Layers className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
        <span>Línea</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('capsule')}
        className={`flex items-center gap-1.5 ${isSm ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1 text-xs'} font-bold rounded-lg transition-all duration-200 cursor-pointer ${
          groupBy === 'capsule'
            ? 'bg-[#00205b] text-white shadow-xs scale-[1.02]'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
        aria-pressed={groupBy === 'capsule'}
        title="Agrupar por Cápsula / Driver (Racer, Essentials, Heritage, etc.)"
      >
        <Box className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
        <span>Cápsula</span>
      </button>
    </div>
  );
}
