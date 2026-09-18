import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function MultiSelectFilter({ label, options, selectedValues, onChange, placeholder = "Todas" }: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (option: string) => {
    if (option === 'All') {
      onChange([]);
      return;
    }
    
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(v => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const isAllSelected = selectedValues.length === 0;

  return (
    <div className="relative" ref={containerRef}>
      <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">{label}</label>
      
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#f7f8fa] border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-left flex items-center justify-between hover:bg-slate-100 hover:border-slate-300 transition-colors text-slate-800 cursor-pointer shadow-2xs"
      >
        <span className="pr-4 font-semibold text-slate-700 whitespace-normal break-words text-left flex-1">
          {isAllSelected ? placeholder : `${selectedValues.length} seleccionados`}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-30 w-full min-w-[240px] mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1 custom-scrollbar">
          <label className="flex items-start px-3 py-2 hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700 transition-colors">
            <input 
              type="checkbox" 
              checked={isAllSelected}
              onChange={() => handleToggle('All')}
              className="mr-2.5 mt-[2px] h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-[#00205b] focus:ring-[#00205b] accent-[#00205b]"
            />
            <span className="font-bold text-slate-800 whitespace-normal break-words text-left flex-1">{placeholder}</span>
          </label>
          
          {options.filter(o => o !== 'All').map(option => (
            <label key={option} className="flex items-start px-3 py-2 hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700 transition-colors">
              <input 
                type="checkbox" 
                checked={selectedValues.includes(option)}
                onChange={() => handleToggle(option)}
                className="mr-2.5 mt-[2px] h-3.5 w-3.5 shrink-0 rounded border-slate-300 text-[#00205b] focus:ring-[#00205b] accent-[#00205b]"
              />
              <span className="whitespace-normal break-words text-left flex-1">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
