import { Lang, strings } from '../dict';
import { specialData } from '../specialData';

type Props = { guide: (typeof specialData)[number]; lang: Lang; isSpeaking: boolean; onSpeak: (text: string) => void };

export default function GuideCard({ guide, lang, isSpeaking, onSpeak }: Props) {
  const p = strings(lang);
  // Some guides only have a few title languages; fall back to English.
  const pick = (text: object) => (text as Record<string, string>)[lang] || (text as Record<string, string>).en;
  const readAloud = () => onSpeak(pick(guide.title) + '.\n' + guide.steps.map((s, i) => `Step ${i + 1}: ${pick(s.desc)}.\n`).join(''));
  return (
    <div className="w-full h-fit max-h-[85dvh] lg:max-w-4xl bg-white lg:rounded-[2rem] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border-4 border-teal-200" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-teal-700 to-emerald-900 p-4 md:p-6 text-center relative shrink-0 flex justify-between items-center shadow-inner">
        <span className="text-4xl opacity-30 print-text-white">🪄</span>
        <div className="flex flex-col items-center">
          <h1 className="text-white font-black text-lg md:text-xl tracking-widest uppercase print-text-white">Bangkok Pattaya Hospital</h1>
          <p className="text-teal-200 text-sm md:text-base font-bold mt-1 tracking-widest print-text-white">{p.spec_guide}</p>
        </div>
        <button onClick={readAloud} className={"w-12 h-12 md:w-14 md:h-14 rounded-full text-2xl shadow-lg flex items-center justify-center print-hidden " + (isSpeaking ? "bg-white text-teal-600 animate-pulse" : "bg-teal-800 text-white border-2 border-teal-400 hover:bg-teal-700")}>
          {isSpeaking ? '🛑' : '🔊'}
        </button>
      </div>
      <div className="bg-teal-50/30 flex flex-col lg:flex-row gap-4 flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar print-overflow-visible">
        <div className="lg:flex-1 bg-gradient-to-r from-teal-100 to-emerald-100 border-2 border-teal-400 rounded-3xl p-5 flex items-center justify-center gap-4 shadow-sm">
          <span className="text-6xl md:text-7xl drop-shadow-md">{guide.icon}</span>
          <span className="text-teal-900 font-black text-2xl md:text-3xl leading-tight">{pick(guide.title)}</span>
        </div>
        <div className="flex flex-col lg:flex-1 lg:grid lg:grid-cols-2 gap-3 mt-2 lg:mt-0">
          {guide.steps.map((step, sIdx) => (
            <div key={sIdx} className="flex items-center gap-4 bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-teal-100/50">
              <div className="text-4xl md:text-5xl shrink-0 drop-shadow-sm">{step.icon}</div>
              <div className="flex flex-col leading-tight">
                <span className="text-teal-500 text-xs font-black uppercase tracking-widest mb-1">Step {sIdx + 1}</span>
                <span className="font-black text-base md:text-lg text-slate-800">{pick(step.desc)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
