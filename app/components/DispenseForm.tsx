import { useState } from 'react';
import { Lang, Prescription, TaperStep, newTaperStep, strings, unitDict } from '../dict';
import { verifiedName } from '../drugData';
import { DOSE_PRESETS, DOSE_UNITS, PATTERNS, doseLabel, freqMismatch, nextFreqForPeriods, summaryParts } from '../sig';
import { isDecimal, toggle, translateFromThai } from '../utils';
import { ChipRow, Stepper } from './controls';

type Props = { rx: Prescription; patch: (p: Partial<Prescription>) => void; lang: Lang };

type Busy = 'drug' | 'ind' | 'warn' | null;

// Extra numeric fields, tucked in the "เพิ่มเติม" panel (the dose itself lives in the dose rows).
const MORE_ROWS = [
  { label: 'ทุกๆ', icon: '⏳', val: 'cHour', unit: 'cHourUnit', step: 1, units: ['hr'], clears: { rxFreq: null } },
  { label: 'ทาวันละ', icon: '🧴', val: 'cApply', unit: 'cApplyUnit', step: 1, units: ['times'], clears: { rxFreq: null } },
  { label: 'ติดต่อกัน', icon: '🗓️', val: 'cDays', unit: 'cDaysUnit', step: 1, units: ['day', 'wk'], clears: {} },
] as const;

const inputClass = 'flex-1 bg-slate-900/80 border border-slate-700 text-white rounded-xl px-4 py-2.5 outline-none';
const cardClass = 'bg-slate-800/40 p-4 rounded-2xl border border-slate-700 flex flex-col gap-3';

export default function DispenseForm({ rx, patch, lang }: Props) {
  const th = strings('th');
  const [busy, setBusy] = useState<Busy>(null);
  const [indInput, setIndInput] = useState('');
  const [warnInput, setWarnInput] = useState('');
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isCustomDose, setIsCustomDose] = useState(false);

  const verified = rx.drugName !== '' && verifiedName(rx.drugInput, lang) === rx.drugName;

  // The single cc/ml chip stands for both 'ml' and the older 'cc' key; unknown keys fall back to tablets.
  const doseUnit = rx.cDoseUnit === 'cc' ? 'ml' : rx.cDoseUnit in DOSE_PRESETS ? rx.cDoseUnit : 'tab';
  const presets = DOSE_PRESETS[doseUnit];
  const doseValue = Number(rx.cDose);
  const showCustomDose = isCustomDose || (doseValue > 0 && !presets.includes(doseValue));
  const summary = summaryParts(rx, th as Parameters<typeof summaryParts>[1], Object.fromEntries(Object.entries(unitDict).map(([k, v]) => [k, v.th])));

  // Runs a Google-translate action with a busy flag; failures are just logged (the pharmacist sees nothing change).
  const translating = async (kind: Exclude<Busy, null>, run: () => Promise<void>) => {
    setBusy(kind);
    try { await run(); } catch (error) { console.error(error); }
    setBusy(null);
  };

  const translateDrug = () => {
    if (!rx.drugInput.trim()) return;
    // Curated DB first: verified names, no machine-translation guessing for drug names.
    const curated = verifiedName(rx.drugInput, lang);
    if (curated) return patch({ drugName: curated });
    translating('drug', async () => patch({ drugName: await translateFromThai(rx.drugInput, lang) }));
  };

  const translateIndication = () => {
    if (!indInput.trim()) return;
    translating('ind', async () => {
      patch({ customIndication: await translateFromThai(indInput, lang), rxIndication: null });
      setIndInput('');
    });
  };

  const translateWarning = () => {
    if (!warnInput.trim()) return;
    translating('warn', async () => {
      patch({ customWarnings: [...rx.customWarnings, await translateFromThai(warnInput, lang)] });
      setWarnInput('');
    });
  };

  const setStep = (idx: number, change: Partial<TaperStep>) =>
    patch({ taperSteps: rx.taperSteps.map((s, i) => (i === idx ? { ...s, ...change } : s)) });

  const pickDose = (n: number) => patch({ cDose: doseValue === n ? 0 : n, cDoseUnit: doseUnit, rxDose: null });

  const setPeriods = (next: number[]) => patch({ rxPeriod: next, rxFreq: nextFreqForPeriods(rx.rxFreq, rx.rxPeriod, next) });

  const isPattern = (i: number) => {
    const p = PATTERNS[i];
    return rx.rxFreq === p.freq && rx.rxPeriod.length === p.periods.length && p.periods.every(x => rx.rxPeriod.includes(x));
  };
  const pickPattern = (i: number) =>
    patch(isPattern(i) ? { rxPeriod: [], rxFreq: null } : { rxPeriod: PATTERNS[i].periods, rxFreq: PATTERNS[i].freq, cHour: 0, cApply: 0 });

  return (
    <div className="flex flex-col gap-4 md:gap-5 pb-[180px] md:pb-[100px] animate-in relative z-0">
      {/* Summary of what is filled in so far; missing required parts are amber */}
      <div className="sticky top-0 z-20 px-3 py-2 rounded-xl bg-slate-900 border border-slate-600 text-xs md:text-sm font-black flex flex-wrap gap-x-2 gap-y-1 shadow-lg">
        {summary.map((part, i) => (
          <span key={i} className={part.missing ? 'text-amber-300' : 'text-white'}>
            {i > 0 && <span className="text-slate-500 mr-2">·</span>}{part.text}
          </span>
        ))}
      </div>

      <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 p-4 rounded-2xl border border-blue-800/50 flex flex-col gap-2 shadow-inner">
        <span className="text-blue-300 text-[10px] md:text-xs font-black uppercase tracking-widest">💊 {th.drug_name}</span>
        <div className="flex gap-2">
          <input type="text" value={rx.drugInput} onChange={(e) => patch({ drugInput: e.target.value, drugName: '' })} onKeyDown={(e) => e.key === 'Enter' && translateDrug()} placeholder="พิมพ์ชื่อยา..." className={inputClass + ' focus:border-blue-500 font-bold text-[16px] md:text-lg'} />
          <button onClick={translateDrug} disabled={!rx.drugInput.trim() || busy === 'drug'} className="bg-blue-600 text-white text-xs md:text-sm font-black px-4 py-2.5 rounded-xl disabled:opacity-50 active:scale-95">
            {busy === 'drug' ? '⏳' : 'ตกลง'}
          </button>
        </div>
        {rx.drugName && (
          <span className={'text-[10px] md:text-xs font-black ml-1 ' + (verified ? 'text-emerald-400' : 'text-amber-400')}>
            {verified ? '✅ ชื่อยาตรวจสอบแล้ว: ' : '⚠️ แปลอัตโนมัติ (ยังไม่ตรวจสอบ): '}{rx.drugName}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700">
        <span className="text-indigo-400 font-black text-xs md:text-sm px-2">📉 {th.taper_mode}</span>
        <button onClick={() => patch({ isTapering: !rx.isTapering })} className={`w-12 h-6 rounded-full p-1 transition-colors ${rx.isTapering ? 'bg-indigo-600' : 'bg-slate-600'}`}>
          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${rx.isTapering ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </button>
      </div>

      {rx.isTapering ? (
        <div className="bg-indigo-900/20 p-4 rounded-2xl border border-indigo-800/50 flex flex-col gap-3 shadow-inner">
          <h3 className="text-indigo-400 text-xs md:text-sm font-black uppercase text-center">ระบบจัดการลดโดส / กินไม่เท่ากัน</h3>
          {rx.taperSteps.map((step, idx) => (
            <div key={idx} className="bg-slate-900 p-3 md:p-4 rounded-xl border border-slate-700 flex flex-col gap-3">
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400 font-black text-[10px] md:text-xs">Step {idx + 1}</span>
                {rx.taperSteps.length > 1 && <button onClick={() => patch({ taperSteps: rx.taperSteps.filter((_, i) => i !== idx) })} className="text-red-500 font-black text-[10px] md:text-xs">✕ ลบ</button>}
              </div>
              <div className="flex gap-2 md:gap-3">
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[9px] md:text-[10px] text-slate-500 uppercase font-bold">ระยะเวลา (วัน)</span>
                  <Stepper variant="taper" integer value={step.days} onText={(v) => setStep(idx, { days: Number(v) })}
                    onMinus={() => setStep(idx, { days: Math.max(1, step.days - 1) })} onPlus={() => setStep(idx, { days: step.days + 1 })} />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[9px] md:text-[10px] text-slate-500 uppercase font-bold">ปริมาณ (เม็ด)</span>
                  <Stepper variant="taper" value={step.dose} onText={(v) => setStep(idx, { dose: v })}
                    onMinus={() => setStep(idx, { dose: Math.max(0.5, Number(step.dose) - 0.5) })} onPlus={() => setStep(idx, { dose: Number(step.dose) + 0.5 })} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 mt-1">
                <span className="text-[9px] md:text-[10px] text-slate-500 uppercase font-bold">เวลาอาหาร</span>
                <ChipRow compact items={th.time} icon="🍽️" isOn={(i) => step.time === i} onPick={(i) => setStep(idx, { time: step.time === i ? null : i })} tone="bg-teal-600 border-teal-400 text-white" />
              </div>
              <div className="flex flex-col gap-1.5 mt-0.5">
                <span className="text-[9px] md:text-[10px] text-slate-500 uppercase font-bold">ช่วงเวลา</span>
                <ChipRow compact items={th.period} icon={th.period_icons} isOn={(i) => step.periods.includes(i)} onPick={(i) => setStep(idx, { periods: toggle(step.periods, i).sort((a, b) => a - b) })} tone="bg-orange-500 border-orange-400 text-white" />
              </div>
            </div>
          ))}
          <button onClick={() => patch({ taperSteps: [...rx.taperSteps, newTaperStep()] })} className="border border-dashed border-indigo-500/50 text-indigo-400 py-3 rounded-xl font-black text-xs md:text-sm hover:bg-indigo-900/30">➕ เพิ่มช่วงเวลาใหม่</button>
        </div>
      ) : (
        <>
          <div className={cardClass}>
            <ChipRow label="หน่วย:" items={DOSE_UNITS.map(u => u.label)} isOn={(i) => DOSE_UNITS[i].key === doseUnit} onPick={(i) => patch({ cDoseUnit: DOSE_UNITS[i].key, rxDose: null })} tone="bg-indigo-600 border-indigo-400 text-white" />
            <ChipRow label="ขนาด:" items={[...presets.map(n => doseLabel(n, doseUnit)), '…อื่นๆ']} isOn={(i) => (i < presets.length ? doseValue === presets[i] : showCustomDose)}
              onPick={(i) => (i < presets.length ? pickDose(presets[i]) : setIsCustomDose(!showCustomDose))} tone="bg-indigo-600 border-indigo-400 text-white" />
            {showCustomDose && (
              <div className="flex items-center gap-2">
                <input type="text" inputMode="decimal" value={rx.cDose === 0 ? '' : rx.cDose} placeholder="ระบุตัวเลข เช่น 7"
                  onChange={(e) => isDecimal(e.target.value) && patch({ cDose: e.target.value, cDoseUnit: doseUnit, rxDose: null })}
                  className={inputClass + ' focus:border-indigo-400 font-black text-[16px]'} />
                <span className="text-slate-300 text-sm font-bold shrink-0">{unitDict[doseUnit].th}</span>
              </div>
            )}
          </div>

          <div className={cardClass}>
            <ChipRow label="ลัด:" items={PATTERNS.map(p => p.label)} icon="⚡" isOn={isPattern} onPick={pickPattern} tone="bg-emerald-600 border-emerald-400 text-white" />
            <ChipRow label="เวลา:" items={th.period} icon={th.period_icons} isOn={(i) => rx.rxPeriod.includes(i)} onPick={(i) => setPeriods(toggle(rx.rxPeriod, i).sort((a, b) => a - b))} tone="bg-orange-500 border-orange-400 text-white" />
            <ChipRow label="ความถี่:" items={th.freq} icon="🔄" isOn={(i) => rx.rxFreq === i} onPick={(i) => patch({ rxFreq: rx.rxFreq === i ? null : i, cHour: 0, cApply: 0 })} tone="bg-indigo-600 border-indigo-400 text-white" />
            {freqMismatch(rx.rxFreq, rx.rxPeriod.length) && rx.rxFreq !== null && (
              <p className="text-amber-300 text-[11px] md:text-xs font-black">⚠️ เลือกช่วงเวลา {rx.rxPeriod.length} ช่วง แต่ความถี่คือ {th.freq[rx.rxFreq]} — ตรวจสอบอีกครั้ง</p>
            )}
            <ChipRow label="อาหาร:" items={th.time} icon="🍽️" isOn={(i) => rx.rxTime === i} onPick={(i) => patch({ rxTime: rx.rxTime === i ? null : i })} tone="bg-teal-600 border-teal-400 text-white" />
            <ChipRow label="ข้าง:" items={th.side} icon={th.side_icons} isOn={(i) => rx.rxSide === i} onPick={(i) => patch({ rxSide: rx.rxSide === i ? null : i })} tone="bg-purple-600 border-purple-400 text-white" />
          </div>

          <div className={cardClass + ' shadow-inner items-center'}>
            <button onClick={() => setIsMoreOpen(!isMoreOpen)} className="w-full flex items-center justify-between text-slate-300 font-black uppercase text-[10px] md:text-xs outline-none">
              <span className="flex items-center gap-2">➕ เพิ่มเติม (ทุกๆ n ชม. · ทาวันละ · ติดต่อกัน)</span>
              <span className="text-xl bg-slate-700/50 w-8 h-8 rounded-full flex items-center justify-center border border-slate-600">{isMoreOpen ? '➖' : '➕'}</span>
            </button>
            {isMoreOpen && (
              <div className="grid grid-cols-2 gap-3 w-full animate-in fade-in">
                {MORE_ROWS.map((row) => (
                  <div key={row.val} className="bg-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col items-center gap-2">
                    <span className="text-slate-300 text-[10px] md:text-xs font-black flex items-center gap-1">{row.icon} {row.label}</span>
                    <div className="flex flex-col xl:flex-row items-center gap-2 w-full">
                      <Stepper variant="smart" value={rx[row.val]} onText={(v) => patch({ [row.val]: v })}
                        onMinus={() => patch({ [row.val]: Math.max(0, Number(rx[row.val]) - row.step) })}
                        onPlus={() => patch({ [row.val]: Number(rx[row.val]) + row.step, ...row.clears })} />
                      {row.units.length > 1 ? (
                        <select value={rx[row.unit]} onChange={(e) => patch({ [row.unit]: e.target.value })} className="bg-slate-800 text-slate-300 border border-slate-600 text-[16px] font-bold rounded-lg w-full xl:w-auto py-2 px-2 outline-none">
                          {row.units.map(u => <option key={u} value={u}>{unitDict[u].th}</option>)}
                        </select>
                      ) : (
                        <span className="text-slate-300 text-sm font-bold">{unitDict[row.units[0]].th}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 p-4 rounded-2xl border border-blue-800/50 flex flex-col gap-2 shadow-inner">
        <span className="text-blue-300 text-[10px] md:text-xs font-black uppercase tracking-widest">🎯 {th.ind_title}</span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {th.indication.map((ind: string, i: number) => (
            <button key={i} onClick={() => patch({ rxIndication: rx.rxIndication === i ? null : i, customIndication: '' })} className={`px-2 py-2 rounded-lg text-[10px] md:text-xs font-black border flex items-center gap-1 active:scale-95 ${rx.rxIndication === i ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'}`}>
              <span className="text-sm md:text-base">{th.ind_icons[i]}</span> <span className="line-clamp-1">{ind}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-1">
          <input type="text" value={indInput} onChange={(e) => setIndInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && translateIndication()} placeholder="ระบุข้อบ่งใช้อื่นๆ..." className={inputClass + ' focus:border-blue-500 text-[16px] md:text-sm'} />
          <button onClick={translateIndication} disabled={!indInput.trim() || busy === 'ind'} className="bg-blue-600 text-white text-xs md:text-sm font-black px-4 py-2.5 rounded-xl disabled:opacity-50 active:scale-95">แปล</button>
        </div>
        {rx.customIndication && <span className="text-emerald-400 text-[10px] md:text-xs font-black ml-1">✅ แปลแล้ว: {rx.customIndication}</span>}
      </div>

      <div className="bg-red-900/10 p-4 rounded-2xl border border-red-900/30 flex flex-col gap-4 shadow-inner">
        <span className="text-red-400 text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2">⚠️ คำเตือน (Warnings)</span>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {th.warn.map((w: string, i: number) => (
            <button key={i} onClick={() => patch({ rxWarnings: toggle(rx.rxWarnings, i) })} className={`px-2 py-3 rounded-xl text-[9px] md:text-[10px] font-black border flex items-center gap-2 active:scale-95 ${rx.rxWarnings.includes(i) ? 'bg-red-500 border-red-400 text-white shadow-sm' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
              <span className="text-lg shrink-0">{th.warn_icons[i]}</span><span className="text-left line-clamp-2">{w}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2 border-t border-red-900/30 pt-3">
          <input type="text" value={warnInput} onChange={(e) => setWarnInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && translateWarning()} placeholder="พิมพ์คำเตือนพิเศษ..." className={inputClass + ' focus:border-red-500 font-bold text-[16px] md:text-sm'} />
          <button onClick={translateWarning} disabled={!warnInput.trim() || busy === 'warn'} className="bg-red-600 text-white text-xs md:text-sm font-black px-4 py-2.5 rounded-xl disabled:opacity-50 active:scale-95">เพิ่ม</button>
        </div>
        {rx.customWarnings.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {rx.customWarnings.map((cw, i) => (
              <div key={i} className="bg-red-500/20 text-red-200 border border-red-500/50 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
                🚨 {cw} <button onClick={() => patch({ customWarnings: rx.customWarnings.filter((_, j) => j !== i) })} className="text-red-400 font-black text-lg hover:text-red-300">&times;</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
