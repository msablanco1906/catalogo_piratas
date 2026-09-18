import { LayoutGrid, GripHorizontal } from 'lucide-react';

interface CompactModeSwitchProps {
  isCompact: boolean;
  onChange: (isCompact: boolean) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function CompactModeSwitch({
  isCompact,
  onChange,
  className = '',
  size = 'md'
}: CompactModeSwitchProps) {
  const isSm = size === 'sm';
  return (
    <div 
      className={`inline-flex items-center bg-[#f1f3f6] p-0.5 sm:p-1 rounded-xl border border-slate-200 shadow-2xs ${className}`}
      title="Cambiar densidad de vista (Modelos agrupados vs SKUs individuales)"
    >
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex items-center gap-1.5 ${isSm ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1 text-xs'} font-bold rounded-lg transition-all duration-200 cursor-pointer ${
          isCompact
            ? 'bg-[#00205b] text-white shadow-xs scale-[1.02]'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
        aria-pressed={isCompact}
        title="Agrupar colores en una sola tarjeta por Modelo"
      >
        <LayoutGrid className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
        <span>Compacta</span>
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex items-center gap-1.5 ${isSm ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1 text-xs'} font-bold rounded-lg transition-all duration-200 cursor-pointer ${
          !isCompact
            ? 'bg-[#00205b] text-white shadow-xs scale-[1.02]'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
        aria-pressed={!isCompact}
        title="Mostrar una tarjeta independiente por cada SKU"
      >
        <GripHorizontal className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
        <span>SKUs</span>
      </button>
    </div>
  );
}
