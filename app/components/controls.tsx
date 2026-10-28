import { isDecimal, isInteger } from '../utils';

type ChipRowProps = {
  label?: string;
  items: string[];
  icon: string | string[] | ((i: number) => string);
  isOn: (i: number) => boolean;
  onPick: (i: number) => void;
  tone: string; // classes for a selected chip
  compact?: boolean; // taper-step variant: smaller chips, label sits above the row
};

// One horizontally scrolling row of toggle chips (dose, frequency, meal, period, side, ...).
export function ChipRow({ label, items, icon, isOn, onPick, tone, compact }: ChipRowProps) {
  const size = compact ? 'px-3 py-1.5 text-[9px] md:text-[10px]' : 'px-3 py-2 text-[10px] md:text-xs';
  const off = compact
    ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800';
  const iconOf = (i: number) => (typeof icon === 'function' ? icon(i) : Array.isArray(icon) ? icon[i] : icon);
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar items-center">
      {label && <span className="text-slate-500 text-[10px] md:text-xs font-black uppercase w-12 shrink-0">{label}</span>}
      {items.map((item, i) => (
        <button key={i} onClick={() => onPick(i)} className={`whitespace-nowrap rounded-lg font-black border active:scale-95 ${size} ${isOn(i) ? tone : off}`}>
          {iconOf(i)} {item}
        </button>
      ))}
    </div>
  );
}

type StepperProps = {
  value: string | number;
  onText: (v: string) => void;
  onMinus: () => void;
  onPlus: () => void;
  variant: 'taper' | 'smart';
  integer?: boolean; // reject decimals while typing
};

// − [number] + control. 'taper' is the compact indigo one, 'smart' the larger cyan one.
export function Stepper({ value, onText, onMinus, onPlus, variant, integer }: StepperProps) {
  const taper = variant === 'taper';
  const ok = integer ? isInteger : isDecimal;
  return (
    <div className={taper ? 'flex bg-slate-800 p-1 rounded-lg border border-slate-600' : 'flex items-center bg-slate-800 rounded-lg p-1 w-full justify-between'}>
      <button onClick={onMinus} className={(taper ? 'w-6 h-6 md:w-8 md:h-8 rounded' : 'w-8 h-8 rounded text-lg') + ' bg-slate-700 text-white font-black active:scale-90'}>-</button>
      <input type="text" inputMode={integer ? 'numeric' : 'decimal'} value={value} onChange={(e) => ok(e.target.value) && onText(e.target.value)}
        className={(taper ? 'flex-1 w-6 md:w-8 text-white' : 'w-10 text-xl text-cyan-400') + ' text-center font-black bg-transparent outline-none text-[16px]'} />
      <button onClick={onPlus} className={(taper ? 'w-6 h-6 md:w-8 md:h-8 rounded bg-indigo-600' : 'w-8 h-8 rounded text-lg bg-cyan-700') + ' text-white font-black active:scale-90'}>+</button>
    </div>
  );
}
